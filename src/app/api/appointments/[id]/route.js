import {createAppointmentStore} from '../../../../lib/server/appointment-store.mjs';
import {bookingTokenHash,publicAppointment} from '../../../../lib/server/admin-auth.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request,{params}){
 try{
 const {id}=await params;
 const token=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 if(!/^[A-Za-z0-9_-]{43}$/.test(token))return Response.json({error:'Appointment access is not allowed.'},{status:404,headers:{'Cache-Control':'no-store'}});
 const appointment=(await createAppointmentStore().list()).find(a=>a.id===id&&a.accessHash===bookingTokenHash(token));
 if(!appointment)return Response.json({error:'Appointment access is not allowed.'},{status:404,headers:{'Cache-Control':'no-store'}});
 return Response.json({appointment:publicAppointment(appointment)},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Appointment status is temporarily unavailable.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
