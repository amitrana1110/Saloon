import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {availableTimes,prepareAppointment,updateAppointment,salonClock,validDate,overlaps} from './appointments.mjs';
import {createAppointmentStore} from './appointment-store.mjs';

const now=new Date('2026-10-27T03:00:00Z');
const payload={name:'Demo Customer',phone:'0000000000',serviceIds:['cut'],date:'2026-11-01',time:'11:00 AM'};
const record=(changes={})=>({id:'a',...prepareAppointment(payload,[],now),...changes});
async function cleanupTemp(dir){
 const resolved=path.resolve(dir);
 assert.equal(path.dirname(resolved),path.resolve(tmpdir()));
 assert.ok(path.basename(resolved).startsWith('salon-'));
 await rm(resolved,{recursive:true,force:true});
}

test('confirmed treatment duration blocks overlapping starts but allows adjacent times',()=>{
 const rows=[record({time:'10:00 AM',duration:150,status:'confirmed'})];
 const slots=availableTimes(payload.date,45,rows,now);
 for(const t of ['10:00 AM','11:00 AM','12:00 PM'])assert.ok(!slots.includes(t));
 assert.ok(slots.includes('1:00 PM'));
 assert.equal(overlaps(record({time:'10:00 AM',duration:60}),record({time:'11:00 AM',duration:45})),false);
});
test('pending and cancelled requests do not reserve time',()=>{
 for(const status of ['pending','cancelled'])assert.ok(availableTimes(payload.date,45,[record({status})],now).includes('11:00 AM'));
});
test('only the matching date is blocked and completed reservations retain their interval',()=>{
 const booked=record({status:'completed'});
 assert.ok(!availableTimes(payload.date,45,[booked],now).includes(payload.time));
 assert.ok(availableTimes('2026-11-02',45,[booked],now).includes(payload.time));
});
test('candidate duration cannot overlap a later confirmed appointment',()=>{
 const slots=availableTimes(payload.date,150,[record({time:'12:00 PM',status:'confirmed'})],now);
 assert.ok(!slots.includes('10:00 AM'));assert.ok(!slots.includes('11:00 AM'));
});
test('occupying every start time makes the day unavailable',()=>{
 const times=availableTimes(payload.date,45,[],now);
 const rows=times.map((time,i)=>record({id:String(i),time,status:'confirmed'}));
 assert.deepEqual(availableTimes(payload.date,45,rows,now),[]);
});
test('closing hours, invalid dates and past times are excluded in salon timezone',()=>{
 assert.equal(salonClock(new Date('2026-10-27T20:00:00Z')).date,'2026-10-28');
 assert.equal(validDate('2026-02-30'),false);
 assert.deepEqual(availableTimes('2026-02-30',45,[],now),[]);
 assert.deepEqual(availableTimes('2026-10-26',45,[],now),[]);
 assert.ok(!availableTimes(payload.date,181,[],now).includes('6:00 PM'));
 assert.ok(availableTimes(payload.date,180,[],now).includes('6:00 PM'));
 assert.ok(!availableTimes('2026-10-27',45,[],new Date('2026-10-27T06:00:00Z')).includes('11:00 AM'));
});
test('server derives duration and price instead of trusting client values',()=>{
 const saved=prepareAppointment({...payload,serviceIds:['cut','color'],duration:1,estimate:0,status:'confirmed'},[],now);
 assert.equal(saved.duration,195);assert.equal(saved.estimate,4298);assert.equal(saved.status,'pending');
});
test('invalid customer and treatment payloads are rejected',()=>{
 for(const body of [null,{...payload,name:' '},{...payload,phone:'----------'},{...payload,serviceIds:['fake']},{...payload,serviceIds:['cut','cut']},{...payload,date:'2026-02-30'},{...payload,time:'9:00 AM'}])assert.throws(()=>prepareAppointment(body,[],now));
});
test('confirmation refuses conflicts and terminal status changes',()=>{
 const a=record({status:'confirmed'}),b=record({id:'b'});
 assert.throws(()=>updateAppointment([a,b],'b','confirmed',now),e=>e.status===409);
 assert.throws(()=>updateAppointment([record({status:'cancelled'})],'a','confirmed',now),e=>e.status===409);
 assert.throws(()=>updateAppointment([a],'a','completed',now),e=>e.status===409);
 assert.equal(updateAppointment([a],'a','completed',new Date('2026-11-02T03:00:00Z'))[0].status,'completed');
});
test('separate store instances persist requests and serialize conflicting confirmations',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'salon-schedule-'));
 try{
  const file=path.join(dir,'appointments.json'),owner=createAppointmentStore(file),customer=createAppointmentStore(file);
  const a=await customer.create(payload,now),b=await customer.create(payload,now);
  const result=await Promise.allSettled([owner.changeStatus(a.id,'confirmed',now),customer.changeStatus(b.id,'confirmed',now)]);
  assert.equal(result.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(result.find(r=>r.status==='rejected').reason.status,409);
  const rows=await createAppointmentStore(file).list();assert.equal(rows.length,2);assert.equal(rows.filter(a=>a.status==='confirmed').length,1);
  const confirmed=rows.find(a=>a.status==='confirmed'),pending=rows.find(a=>a.status==='pending');
  assert.ok(!availableTimes(payload.date,45,rows,now).includes(payload.time));
  await owner.changeStatus(confirmed.id,'cancelled',now);
  assert.ok(availableTimes(payload.date,45,await customer.list(),now).includes(payload.time));
  await customer.changeStatus(pending.id,'confirmed',now);
  assert.ok(!availableTimes(payload.date,45,await owner.list(),now).includes(payload.time));
 }finally{await cleanupTemp(dir);}
});
test('appointment API handles persistent confirmation and invalid payloads',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'salon-api-')),previous=process.env.APPOINTMENTS_DATA_FILE,previousAuth=process.env.ADMIN_DATA_FILE;
 process.env.APPOINTMENTS_DATA_FILE=path.join(dir,'schedule.json');
 process.env.ADMIN_DATA_FILE=path.join(dir,'admin.json');
 try{
  const source=(await readFile(new URL('../app/api/appointments/route.js',import.meta.url),'utf8')).replace("'../../../lib/appointment-store.mjs'",JSON.stringify(new URL('./appointment-store.mjs',import.meta.url).href)).replace("'../../../lib/appointments.mjs'",JSON.stringify(new URL('./appointments.mjs',import.meta.url).href)).replace("'../../../lib/admin-auth.mjs'",JSON.stringify(new URL('./admin-auth.mjs',import.meta.url).href));
  const api=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
  const {adminAuth}=await import(new URL('./admin-auth.mjs',import.meta.url).href);
  await adminAuth.setup('owner@test.local','A test-only owner password 123!');
  const {token}=await adminAuth.login('owner@test.local','A test-only owner password 123!');
  const request=(method,body,owner=true)=>new Request('http://localhost/api/appointments',{method,headers:{Origin:'http://localhost','Content-Type':'application/json',...(owner?{Cookie:'hm_admin='+token}:{})},...(method==='GET'?{}:{body:JSON.stringify(body)})});
  assert.equal((await api.GET(request('GET',null,false))).status,401);
  assert.equal((await api.PATCH(request('PATCH',{id:'test',status:'confirmed'},false))).status,401);
  assert.equal((await api.GET(request('GET'))).headers.get('Cache-Control'),'no-store');
  assert.equal((await api.POST(request('POST',null))).status,400);
  const response=await api.POST(request('POST',{...payload,date:'2099-11-01'}));assert.equal(response.status,201);
  const {appointment}=await response.json();assert.equal(appointment.status,'pending');assert.ok(appointment.accessToken);assert.ok(!appointment.accessHash);
  assert.equal((await api.PATCH(request('PATCH',{id:appointment.id,status:'confirmed'}))).status,200);
  assert.equal((await (await api.GET(request('GET'))).json()).appointments[0].status,'confirmed');
  const availabilitySource=(await readFile(new URL('../app/api/availability/route.js',import.meta.url),'utf8')).replace("'../../../lib/appointment-store.mjs'",JSON.stringify(new URL('./appointment-store.mjs',import.meta.url).href));
  const availability=await import('data:text/javascript;base64,'+Buffer.from(availabilitySource).toString('base64'));
  const publicRows=(await (await availability.GET()).json()).appointments;
  assert.equal(publicRows.length,1);assert.deepEqual(Object.keys(publicRows[0]).sort(),['date','duration','status','time']);
  const detailSource=(await readFile(new URL('../app/api/appointments/[id]/route.js',import.meta.url),'utf8')).replace("'../../../../lib/appointment-store.mjs'",JSON.stringify(new URL('./appointment-store.mjs',import.meta.url).href)).replace("'../../../../lib/admin-auth.mjs'",JSON.stringify(new URL('./admin-auth.mjs',import.meta.url).href));
  const detail=await import('data:text/javascript;base64,'+Buffer.from(detailSource).toString('base64'));
  const receiptRequest=token=>new Request('http://localhost/api/appointments/'+appointment.id,{headers:{Authorization:'Bearer '+token}});
  const params={params:Promise.resolve({id:appointment.id})};
  const receipt=await detail.GET(receiptRequest(appointment.accessToken),params);assert.equal(receipt.status,200);
  const own=(await receipt.json()).appointment;assert.equal(own.name,payload.name);assert.equal(own.status,'confirmed');assert.ok(!own.accessHash);assert.ok(!own.accessToken);
  assert.equal((await detail.GET(receiptRequest('a'.repeat(43)),params)).status,404);
  assert.equal((await detail.GET(new Request('http://localhost/api/appointments/'+appointment.id),params)).status,404);
  assert.equal((await api.POST(request('POST',{...payload,date:'2099-11-01'}))).status,409);
  assert.equal((await api.PATCH(request('PATCH',{id:appointment.id,status:'cancelled'}))).status,200);
  assert.equal((await api.POST(request('POST',{...payload,date:'2099-11-01'}))).status,201);
 }finally{
  if(previous===undefined)delete process.env.APPOINTMENTS_DATA_FILE;else process.env.APPOINTMENTS_DATA_FILE=previous;
  if(previousAuth===undefined)delete process.env.ADMIN_DATA_FILE;else process.env.ADMIN_DATA_FILE=previousAuth;
  await cleanupTemp(dir);
 }
});
