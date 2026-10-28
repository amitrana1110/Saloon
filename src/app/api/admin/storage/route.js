import {requireOwner,AuthError} from '../../../../lib/server/admin-auth.mjs';
import {blobClient,assertCloudStorage} from '../../../../lib/server/cloud-storage.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request){
 try{
  await requireOwner(request);assertCloudStorage();
  const pathname='hair-masters/data/appointments.json';
  const metadata=await blobClient.head(pathname);
  const regular=await blobClient.get(pathname,{access:'private',useCache:false});
  const identity=await blobClient.get(pathname,{access:'private',useCache:false,headers:{'Accept-Encoding':'identity'}});
  const describe=result=>({present:Boolean(result),etagPresent:Boolean(result?.blob?.etag),weakEtag:result?.blob?.etag?.startsWith('W/')||false,matchesMetadata:result?.blob?.etag===metadata.etag});
  const result={metadataEtagPresent:Boolean(metadata.etag),regular:describe(regular),identity:describe(identity)};
  await regular?.stream?.cancel();await identity?.stream?.cancel();
  return Response.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch(error){return Response.json({error:error instanceof AuthError?error.message:'Storage diagnostics are unavailable.'},{status:error.status||503});}
}
