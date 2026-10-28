import {handleUpload} from '@vercel/blob/client';
import {requireOwner,assertSameOrigin,AuthError} from '../../../../lib/server/admin-auth.mjs';
import {assertCloudStorage} from '../../../../lib/server/cloud-storage.mjs';
import {uploadPathPattern,uploadTypes} from '../../../../lib/server/cloud-media-store.mjs';
import {MediaError} from '../../../../lib/server/media-validation.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request){
 try{
  await requireOwner(request);assertSameOrigin(request);assertCloudStorage();
  const body=await request.json();
  if(body?.type!=='blob.generate-client-token')throw new MediaError('Invalid upload request.');
  const result=await handleUpload({request,body,onBeforeGenerateToken:async pathname=>{
   const match=uploadPathPattern.exec(pathname);if(!match)throw new MediaError('Invalid upload location.');
   const type=Object.keys(uploadTypes).find(type=>uploadTypes[type]===match[2]);
   return {allowedContentTypes:[type],maximumSizeInBytes:(type.startsWith('video/')?30:8)*1024*1024,addRandomSuffix:false,allowOverwrite:false,validUntil:Date.now()+10*60*1000};
  }});
  return Response.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch(error){return Response.json({error:error instanceof AuthError||error instanceof MediaError||error.status===503?error.message:'Unable to start upload. Please try again.'},{status:error.status||500});}
}
