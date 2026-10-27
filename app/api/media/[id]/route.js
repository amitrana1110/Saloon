import {mediaStore} from '../../../../lib/media-store.mjs';
import {requireOwner} from '../../../../lib/admin-auth.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request,{params}){
 try{const {id}=await params;const item=(await mediaStore.list()).find(x=>x.id===id);if(!item)return new Response(null,{status:404});if(item.status!=='published')await requireOwner(request);
 const bytes=await mediaStore.bytes(item);const headers={'Content-Type':item.type,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes','Content-Disposition':'inline'};
 const range=request.headers.get('range');if(range){const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.length}`}});const start=match[1]?Number(match[1]):Math.max(0,bytes.length-Number(match[2]));const end=match[1]&&match[2]?Math.min(Number(match[2]),bytes.length-1):bytes.length-1;if(start>end||start>=bytes.length)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.length}`}});return new Response(bytes.subarray(start,end+1),{status:206,headers:{...headers,'Content-Range':`bytes ${start}-${end}/${bytes.length}`,'Content-Length':String(end-start+1)}});}
 return new Response(bytes,{headers:{...headers,'Content-Length':String(bytes.length)}});
 }catch{return new Response(null,{status:404});}
}
