import {services} from '../data/salon.mjs';

export const SLOT_TIMES=['10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'];
export const STATUS_LABELS={pending:'Awaiting confirmation',confirmed:'Confirmed',completed:'Completed',cancelled:'Cancelled'};
export const OPEN_MINUTES=10*60;
export const CLOSE_MINUTES=21*60;

export class BookingError extends Error{
 constructor(message,status=400){super(message);this.status=status;}
}
export function salonClock(now=new Date()){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));
 return {date:`${parts.year}-${parts.month}-${parts.day}`,minutes:Number(parts.hour)*60+Number(parts.minute)};
}
export function validDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const parsed=new Date(`${value}T00:00:00Z`);
 return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;
}
export function timeMinutes(time){
 const match=/^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(time||'');
 if(!match||Number(match[1])<1||Number(match[1])>12||Number(match[2])>59)return NaN;
 return Number(match[1])%12*60+Number(match[2])+(match[3]==='PM'?720:0);
}
export function displayTime(minutes){
 const hour=Math.floor(minutes/60),minute=minutes%60;
 return `${hour%12||12}:${String(minute).padStart(2,'0')} ${hour>=12?'PM':'AM'}`;
}
export function displayDate(date){
 return new Date(`${date}T12:00:00+05:30`).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'});
}
export function overlaps(first,second){
 if(first.date!==second.date)return false;
 const a=timeMinutes(first.time),b=timeMinutes(second.time);
 return a<b+second.duration&&b<a+first.duration;
}
export function availableTimes(date,duration,appointments=[],now=new Date()){
 if(!validDate(date)||!Number.isInteger(duration)||duration<=0)return [];
 const clock=salonClock(now);
 if(date<clock.date)return [];
 return SLOT_TIMES.filter(time=>{
  const start=timeMinutes(time);
  if(start+duration>CLOSE_MINUTES||(date===clock.date&&start<=clock.minutes))return false;
  return !appointments.some(a=>['confirmed','completed'].includes(a.status)&&overlaps({date,time,duration},a));
 });
}
export function prepareAppointment(body,appointments,now=new Date()){
 if(!body||typeof body!=='object')throw new BookingError('Send a valid appointment request.');
 const {name,phone,date,time,serviceIds}=body;
 if(typeof name!=='string'||name.trim().length<2||name.trim().length>80)throw new BookingError('Enter a name between 2 and 80 characters.');
 if(typeof phone!=='string'||phone.length>20||!/^[+\d ()-]+$/.test(phone)||phone.replace(/\D/g,'').length<10||phone.replace(/\D/g,'').length>15)throw new BookingError('Enter a valid mobile number.');
 if(!Array.isArray(serviceIds)||!serviceIds.length||serviceIds.length>services.length||new Set(serviceIds).size!==serviceIds.length||serviceIds.some(id=>!services.some(s=>s.id===id)))throw new BookingError('Choose valid treatments.');
 const chosen=services.filter(s=>serviceIds.includes(s.id));
 const duration=chosen.reduce((sum,s)=>sum+s.duration,0);
 if(!validDate(date)||!SLOT_TIMES.includes(time))throw new BookingError('Choose a valid date and time.');
 if(!availableTimes(date,duration,appointments,now).includes(time))throw new BookingError('That time is no longer available. Choose another time.',409);
 return {name:name.trim(),phone:phone.trim(),serviceIds:[...serviceIds],service:chosen.map(s=>s.name).join(', '),date,time,duration,estimate:chosen.reduce((sum,s)=>sum+(s.price||0),0),needsQuote:chosen.some(s=>s.price===null),status:'pending',created:now.toISOString()};
}
export function updateAppointment(appointments,id,status,now=new Date()){
 const current=appointments.find(a=>a.id===id);
 if(!current)throw new BookingError('Appointment not found.',404);
 const transitions={pending:['confirmed','cancelled'],confirmed:['completed','cancelled'],completed:[],cancelled:[]};
 if(!transitions[current.status]?.includes(status))throw new BookingError('This appointment can no longer make that status change.',409);
 if(status==='confirmed'&&!availableTimes(current.date,current.duration,appointments.filter(a=>a.id!==id),now).includes(current.time))throw new BookingError('This time has passed or overlaps another confirmed appointment. This request cannot be confirmed.',409);
 if(status==='completed'){
  const clock=salonClock(now);
  if(current.date>clock.date||(current.date===clock.date&&timeMinutes(current.time)+current.duration>clock.minutes))throw new BookingError('Mark an appointment completed after its scheduled end time.',409);
 }
 const updated={...current,status,updated:now.toISOString(),...(status==='confirmed'?{confirmedAt:now.toISOString()}:{}),...(status==='cancelled'?{cancelledAt:now.toISOString()}:{}),...(status==='completed'?{completedAt:now.toISOString()}:{})};
 return appointments.map(a=>a.id===id?updated:a);
}
export function appointmentEnded(appointment,now=new Date()){
 const clock=salonClock(now);
 return appointment.date<clock.date||(appointment.date===clock.date&&timeMinutes(appointment.time)+appointment.duration<=clock.minutes);
}
export const sortAppointments=appointments=>[...appointments].sort((a,b)=>a.date.localeCompare(b.date)||timeMinutes(a.time)-timeMinutes(b.time)||a.created.localeCompare(b.created));
