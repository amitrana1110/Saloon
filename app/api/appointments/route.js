import {createAppointmentStore} from '../../../lib/appointment-store.mjs';
import {BookingError} from '../../../lib/appointments.mjs';
import {requireOwner,assertSameOrigin,publicAppointment,AuthError} from '../../../lib/admin-auth.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
const store=createAppointmentStore();
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
function fail(error){return json({error:error instanceof BookingError||error instanceof AuthError?error.message:'The schedule could not be saved. Please try again.'},error instanceof BookingError||error instanceof AuthError?error.status:500);}
export async function GET(request){try{await requireOwner(request);return json({appointments:(await store.list()).map(publicAppointment)});}catch(error){return fail(error);}}
export async function POST(request){
 try{assertSameOrigin(request);}catch(error){return fail(error);}
 let body;try{body=await request.json();}catch{return json({error:'Invalid JSON request.'},400);}
 try{return json({appointment:publicAppointment(await store.create(body))},201);}catch(error){return fail(error);}
}
export async function PATCH(request){
 try{await requireOwner(request);assertSameOrigin(request);}catch(error){return fail(error);}
 let body;try{body=await request.json();}catch{return json({error:'Invalid JSON request.'},400);}
 if(!body||typeof body.id!=='string'||typeof body.status!=='string')return json({error:'Choose an appointment and status.'},400);
 try{return json({appointment:publicAppointment(await store.changeStatus(body.id,body.status))});}catch(error){return fail(error);}
}
