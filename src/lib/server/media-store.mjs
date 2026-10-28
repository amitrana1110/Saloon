import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {mkdir,writeFile,readFile,unlink} from 'node:fs/promises';
import {createJsonStore} from './json-store.mjs';
export class MediaError extends Error{constructor(message,status=400){super(message);this.status=status;}}
export const categories=['Hair','Colour','Skin','Nails','Men','Bridal','Salon'];
export function mediaType(bytes,type){
 if(type==='image/jpeg'&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'jpg';
 if(type==='image/png'&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'png';
 if(type==='image/webp'&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')return 'webp';
 if(type==='video/mp4'&&bytes.toString('ascii',4,8)==='ftyp')return 'mp4';
 if(type==='video/webm'&&bytes.subarray(0,4).equals(Buffer.from([26,69,223,163])))return 'webm';
 throw new MediaError('Choose a JPG, PNG, WebP, MP4 or WebM file.');
}
export function createMediaStore(root=process.env.MEDIA_DATA_DIR||path.join(process.cwd(),'.data','media')){
 const store=createJsonStore(path.join(root,'library.json'),{items:[]});
 const list=async()=> (await store.read()).items;
 async function add(file,caption,category){
  if(!file||typeof file.arrayBuffer!=='function'||!file.size)throw new MediaError('Choose a photo or video.');
  const limit=file.type?.startsWith('video/')?30*1024*1024:8*1024*1024;
  if(file.size>limit)throw new MediaError('Photos must be under 8 MB and videos under 30 MB.',413);
  const bytes=Buffer.from(await file.arrayBuffer());const extension=mediaType(bytes,file.type);
  if(typeof caption!=='string'||!caption.trim()||caption.length>160)throw new MediaError('Add a caption of up to 160 characters.');
  if(!categories.includes(category))throw new MediaError('Choose a category.');
  const id=randomUUID();const filename=id+'.'+extension;
  const item={id,filename,caption:caption.trim(),category,type:file.type,status:'draft',createdAt:new Date().toISOString(),url:'/api/media/'+id};
  await mkdir(root,{recursive:true});await writeFile(path.join(root,filename),bytes,{flag:'wx'});
  try{await store.update(data=>({data:{items:[item,...data.items]},result:true}));}catch(e){await unlink(path.join(root,filename));throw e;}return item;
 }
 async function change(body){return store.update(data=>{
  const i=data.items.findIndex(x=>x.id===body.id);if(i<0)throw new MediaError('Media not found.',404);
  const item=data.items[i];
  if(body.action==='delete'){data.items.splice(i,1);}else if(body.action==='move'){
   const next=i+(body.direction==='up'?-1:body.direction==='down'?1:0);if(next>=0&&next<data.items.length)[data.items[i],data.items[next]]=[data.items[next],data.items[i]];
  }else if(body.action==='update'){
   if(typeof body.caption!=='string'||!body.caption.trim()||body.caption.length>160||!categories.includes(body.category)||!['draft','published'].includes(body.status))throw new MediaError('Check caption, category and publication status.');
   Object.assign(item,{caption:body.caption.trim(),category:body.category,status:body.status});
  }else throw new MediaError('Unknown action.');
  return {data,result:item};
 });}
 async function remove(body){const item=await change(body);if(body.action==='delete')await unlink(path.join(root,item.filename)).catch(e=>{if(e.code!=='ENOENT')throw e;});return item;}
 return {list,add,change:remove,async bytes(item){return readFile(path.join(root,item.filename));}};
}
export const mediaStore=createMediaStore();
