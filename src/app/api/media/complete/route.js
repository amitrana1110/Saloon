import {requireOwner,assertSameOrigin,AuthError} from '../../../../lib/server/admin-auth.mjs';
import {mediaStore,MediaError} from '../../../../lib/server/media-store.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request){
 try{
  await requireOwner(request);assertSameOrigin(request);
  if(!mediaStore.register)throw new MediaError('Direct cloud upload is not enabled.');
  const body=await request.json();
  const item=await mediaStore.register(body?.pathname,body?.caption,body?.category);
  return Response.json({item},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch(error){return Response.json({error:error instanceof AuthError||error instanceof MediaError||error.status===503?error.message:'Unable to finish upload. Please try again.'},{status:error.status||500});}
}
