import {mediaStore,MediaError} from '../../../lib/server/media-store.mjs';
import {requireOwner,assertSameOrigin,publicOrigin,AuthError} from '../../../lib/server/admin-auth.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const fail=e=>json({error:e instanceof MediaError||e instanceof AuthError?e.message:'Unable to save media. Please try again.'},e.status||500);
export async function GET(request){try{const admin=new URL(request.url).searchParams.get('admin')==='1';if(admin)await requireOwner(request);const items=await mediaStore.list();return json({items:admin?items:items.filter(x=>x.status==='published').map(({filename,...item})=>item)});}catch(e){return fail(e);}}
export async function POST(request){try{
 await requireOwner(request);
 if(request.headers.get('origin')!==publicOrigin(request))throw new AuthError('This request is not allowed.',403);
 if(!(request.headers.get('content-type')||'').startsWith('multipart/form-data'))throw new MediaError('Upload a file using the media form.',415);
 const length=Number(request.headers.get('content-length'));if(!length||length>31*1024*1024)throw new MediaError('Upload limit is 30 MB.',413);
 const reader=request.body?.getReader();if(!reader)throw new MediaError('Choose a file.');const chunks=[];let total=0;while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>31*1024*1024){await reader.cancel();throw new MediaError('Upload limit is 30 MB.',413);}chunks.push(value);}const payload=Buffer.concat(chunks);const form=await new Response(payload,{headers:{'Content-Type':request.headers.get('content-type')}}).formData();return json({item:await mediaStore.add(form.get('file'),form.get('caption'),form.get('category'))},201);
 }catch(e){return fail(e);}}
export async function PATCH(request){try{await requireOwner(request);assertSameOrigin(request);let body;try{body=await request.json();}catch{throw new MediaError('Invalid request.');}if(!body||typeof body.id!=='string')throw new MediaError('Choose a media item.');return json({item:await mediaStore.change(body)});}catch(e){return fail(e);}}
