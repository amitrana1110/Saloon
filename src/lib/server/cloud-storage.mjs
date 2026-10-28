import * as blob from '@vercel/blob';

export class StorageError extends Error{constructor(message='Online storage is temporarily unavailable. Please try again later.',status=503){super(message);this.status=status;}}
export const cloudStorageEnabled=()=>Boolean(process.env.VERCEL||process.env.BLOB_READ_WRITE_TOKEN);
export function assertCloudStorage(){if(!process.env.BLOB_READ_WRITE_TOKEN?.trim())throw new StorageError('Online storage is not connected yet. Please contact the salon to arrange your visit.');}
export const blobClient=blob;

// Every update re-reads origin storage and commits against that exact ETag.
// This protects concurrent confirmations across independent serverless instances.
export function createBlobJsonStore(pathname,initial,{client=blob,configured=assertCloudStorage,retries=8}={}){
 async function snapshot(){
  configured();
  // Compressed JSON can carry a weak transport ETag, which is invalid for
  // If-Match writes. Read the identity representation to retain the origin ETag.
  const result=await client.get(pathname,{access:'private',useCache:false,headers:{'Accept-Encoding':'identity'}});
  if(!result)return {data:structuredClone(initial),etag:null};
  if(!result.stream||!result.blob?.etag)throw new StorageError();
  return {data:await new Response(result.stream).json(),etag:result.blob.etag};
 }
 return {
  async read(){return (await snapshot()).data;},
  async update(change){
   for(let attempt=0;attempt<retries;attempt++){
    const {data,etag}=await snapshot();const updated=await change(data);
    try{
     await client.put(pathname,JSON.stringify(updated.data),{access:'private',addRandomSuffix:false,allowOverwrite:Boolean(etag),...(etag?{ifMatch:etag}:{}),contentType:'application/json',cacheControlMaxAge:60});
     return updated.result;
    }catch(error){
     // A conditional conflict (or simultaneous first creation) requires a fresh read.
     const conflict=error instanceof blob.BlobPreconditionFailedError||error.name==='BlobPreconditionFailedError'||(!etag&&/already exists|already_exists/i.test(error.message||''));
     if(!conflict)throw error;
     if(attempt+1<retries)await new Promise(resolve=>setTimeout(resolve,10*(attempt+1)));
    }
   }
   throw new StorageError('The schedule is busy. Please try again.');
  },
 };
}
