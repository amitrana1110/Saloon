import {createAppointmentStore} from '../../../lib/server/appointment-store.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){
 try{const rows=await createAppointmentStore().list();return Response.json({appointments:rows.filter(a=>['confirmed','completed'].includes(a.status)).map(({date,time,duration,status})=>({date,time,duration,status}))},{headers:{'Cache-Control':'no-store'}});}
 catch{return Response.json({error:'Availability is temporarily unavailable.'},{status:503,headers:{'Cache-Control':'no-store'}});}
}
