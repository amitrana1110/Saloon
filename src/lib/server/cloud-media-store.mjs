import {randomUUID} from 'node:crypto';
import {createBlobJsonStore,blobClient,assertCloudStorage,StorageError} from './cloud-storage.mjs';
import {MediaError,categories,mediaType} from './media-validation.mjs';

export const uploadTypes={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm'};
export const uploadPathPattern=/^hair-masters\/uploads\/([a-f0-9-]{36})\.(jpg|png|webp|mp4|webm)$/i;
export function validateMediaDetails(caption,category){
 if(typeof caption!=='string'||!caption.trim()||caption.length>160)throw new MediaError('Add a caption of up to 160 characters.');
 if(!categories.includes(category))throw new MediaError('Choose a category.');
}
export function createCloudMediaStore({client=blobClient,store=createBlobJsonStore('hair-masters/data/media.json',{items:[]}),configured=assertCloudStorage}={}){
 const list=async()=>(await store.read()).items;
 async function register(pathname,caption,category){
  configured();validateMediaDetails(caption,category);
  const match=uploadPathPattern.exec(pathname||'');if(!match)throw new MediaError('Invalid media upload.');
  const result=await client.get(pathname,{access:'private',useCache:false});
  if(!result?.stream)throw new MediaError('Upload not found. Please choose the file again.',404);
  const type=result.blob.contentType,limit=type?.startsWith('video/')?30*1024*1024:8*1024*1024;
  const reader=result.stream.getReader();let prefix=Buffer.alloc(0);
  try{
   if(!result.blob.size||result.blob.size>limit)throw new MediaError('Photos must be under 8 MB and videos under 30 MB.',413);
   while(prefix.length<64){const {value,done}=await reader.read();if(done)break;prefix=Buffer.concat([prefix,Buffer.from(value).subarray(0,64-prefix.length)]);}
   if(mediaType(prefix,type)!==match[2])throw new MediaError('The file contents do not match its type.');
  }finally{await reader.cancel();}
  const item={id:match[1],filename:match[1]+'.'+match[2],blobPath:pathname,size:result.blob.size,caption:caption.trim(),category,type,status:'draft',createdAt:new Date().toISOString(),url:'/api/media/'+match[1]};
  return store.update(data=>{const existing=data.items.find(x=>x.id===item.id);if(existing)return {data,result:existing};return {data:{items:[item,...data.items]},result:item};});
 }
 async function add(file,caption,category){
  configured();validateMediaDetails(caption,category);
  if(!file||!file.size||typeof file.arrayBuffer!=='function')throw new MediaError('Choose a photo or video.');
  if(file.size>(file.type?.startsWith('video/')?30:8)*1024*1024)throw new MediaError('Photos must be under 8 MB and videos under 30 MB.',413);
  const bytes=Buffer.from(await file.arrayBuffer()),extension=mediaType(bytes,file.type),pathname='hair-masters/uploads/'+randomUUID()+'.'+extension;
  await client.put(pathname,bytes,{access:'private',contentType:file.type,addRandomSuffix:false,allowOverwrite:false});
  try{return await register(pathname,caption,category);}catch(error){await client.del(pathname).catch(()=>{});throw error;}
 }
 async function change(body){
  const item=await store.update(data=>{
   const i=data.items.findIndex(x=>x.id===body.id);if(i<0)throw new MediaError('Media not found.',404);const item=data.items[i];
   if(body.action==='delete')data.items.splice(i,1);
   else if(body.action==='move'){if(!['up','down'].includes(body.direction))throw new MediaError('Choose a move direction.');const next=i+(body.direction==='up'?-1:1);if(next>=0&&next<data.items.length)[data.items[i],data.items[next]]=[data.items[next],data.items[i]];}
   else if(body.action==='update'){validateMediaDetails(body.caption,body.category);if(!['draft','published'].includes(body.status))throw new MediaError('Choose a publication status.');Object.assign(item,{caption:body.caption.trim(),category:body.category,status:body.status});}
   else throw new MediaError('Unknown action.');
   return {data,result:item};
  });
  // Metadata is removed before bytes, so a failed cleanup never republishes an item.
  if(body.action==='delete')await client.del(item.blobPath);
  return item;
 }
 async function response(item,request){
  const headers={'Content-Type':item.type,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes','Content-Disposition':'inline'};
  const range=request.headers.get('range');let start=0,end=item.size-1;
  if(range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(range);
   if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${item.size}`}});
   start=match[1]?Number(match[1]):Math.max(0,item.size-Number(match[2]));end=match[1]&&match[2]?Math.min(Number(match[2]),end):end;
   if(start>end||start>=item.size||(!match[1]&&Number(match[2])===0))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${item.size}`}});
   headers['Content-Range']=`bytes ${start}-${end}/${item.size}`;
  }
  const result=await client.get(item.blobPath,{access:'private',useCache:false,...(range?{headers:{Range:`bytes=${start}-${end}`}}:{})});
  if(!result?.stream)throw new StorageError();
  // Blob honors Range and returns the raw Content-Range header alongside its stream.
  if(range&&!result.headers?.get('content-range')){await result.stream.cancel();throw new StorageError('Video seeking is temporarily unavailable.');}
  headers['Content-Length']=String(end-start+1);
  return new Response(result.stream,{status:range?206:200,headers});
 }
 return {list,add,register,change,response};
}
