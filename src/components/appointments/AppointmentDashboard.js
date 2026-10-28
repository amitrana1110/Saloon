'use client';
import {matchesSearch} from '../../lib/search/search.mjs';
import {useState} from 'react';
import {CalendarDays,CheckCircle2,Clock,Search,RefreshCw,Phone,ArrowUpRight,Plus,X} from 'lucide-react';
import {STATUS_LABELS,displayDate,displayTime,timeMinutes,salonClock,appointmentEnded,sortAppointments} from '../../lib/booking/appointments.mjs';
import {money} from '../../lib/data/salon.mjs';

export default function AppointmentDashboard({appointments,loading,error,onRefresh,onStatus,onNew,legacyRequests=[],onImport}){
 const [filter,setFilter]=useState('pending');
 const [query,setQuery]=useState('');
 const [date,setDate]=useState('');
 const [working,setWorking]=useState('');
 const [feedback,setFeedback]=useState('');
 const [undo,setUndo]=useState(null);
 const today=salonClock().date;
 const counts=Object.fromEntries(['pending','confirmed','completed','cancelled'].map(status=>[status,appointments.filter(a=>a.status===status).length]));
 const upcoming=sortAppointments(appointments.filter(a=>a.status==='confirmed'&&!appointmentEnded(a))).slice(0,3);
 const filtered=sortAppointments(appointments.filter(a=>(filter==='all'||a.status===filter)&&(!date||a.date===date)&&matchesSearch(`${a.name} ${a.phone} ${a.service}`,query)));
 async function change(appointment,status){
  if(status==='cancelled'&&undo!==appointment.id){setUndo(appointment.id);return;}
  setWorking(appointment.id);setFeedback('');
  try{await onStatus(appointment.id,status);setUndo(null);setFilter(status);setFeedback(status==='confirmed'?'Appointment confirmed. Its full treatment time is now reserved.':status==='cancelled'?'Appointment cancelled. Its reserved time is available again.':'Appointment marked completed.');}
  catch(e){setFeedback(e.message);}
  finally{setWorking('');}
 }
 return <>
  <section className="page-heading"><p className="eyebrow">PRIVATE OWNER DASHBOARD</p><h1>Your salon.<br/><em>A clearer schedule.</em></h1><p>Review requests, confirm appointments, and manage your day.</p></section>
  <div className="schedule-notice"><CalendarDays size={18}/><p>Confirmed appointments reserve their full treatment duration. Customer details and schedule management are only available to the signed-in owner.</p></div>
  <div className="owner-stats">
   <button onClick={()=>{setFilter('pending');setDate('');}} className={filter==='pending'?'active':''}><Clock/><strong>{counts.pending}</strong><span>Awaiting confirmation</span></button>
   <button onClick={()=>{setFilter('confirmed');setDate('');}} className={filter==='confirmed'?'active':''}><CheckCircle2/><strong>{counts.confirmed}</strong><span>Confirmed appointments</span></button>
   <button onClick={()=>{setFilter('confirmed');setDate(today);}}><CalendarDays/><strong>{appointments.filter(a=>a.status==='confirmed'&&a.date===today).length}</strong><span>Confirmed today</span></button>
   <button onClick={()=>{setFilter('completed');setDate('');}} className={filter==='completed'?'active':''}><CheckCircle2/><strong>{counts.completed}</strong><span>Completed visits</span></button>
  </div>
  {upcoming.length>0&&<section className="upcoming-panel"><div className="section-heading"><h2>Next confirmed appointments</h2><button onClick={()=>{setFilter('confirmed');setDate('');}}>View confirmed <ArrowUpRight size={16}/></button></div><div className="upcoming-grid">{upcoming.map(a=><button key={a.id} onClick={()=>{setFilter('confirmed');setDate(a.date);setQuery('');}}><span>{displayDate(a.date)} · {a.time}</span><strong>{a.name}</strong><small>{a.service}</small></button>)}</div></section>}
  <div className="section-heading owner-title"><h2>Appointment management</h2><div><button onClick={onRefresh} disabled={loading}><RefreshCw size={16}/>Refresh schedule</button><button className="button" onClick={onNew}><Plus size={16}/>New request</button></div></div>
  <div className="owner-filters"><label className="search"><Search size={18}/><input value={query} onChange={e=>{setQuery(e.target.value);if(e.target.value.trim()){setFilter('all');setDate('');}}} placeholder="Search customer, phone or treatment" aria-label="Search appointments"/></label><label>Visit date<input type="date" value={date} onChange={e=>setDate(e.target.value)} aria-label="Filter appointments by date"/></label>{(date||query)&&<button className="text-button" onClick={()=>{setDate('');setQuery('');}}>Clear filters <X size={14}/></button>}</div>
  <div className="filter-tabs owner-tabs" aria-label="Appointment status filters">{[['pending','Pending'],['confirmed','Confirmed'],['all','All appointments'],['completed','Completed'],['cancelled','Cancelled']].map(([status,label])=><button key={status} aria-pressed={filter===status} className={filter===status?'selected':''} onClick={()=>setFilter(status)}>{label}<span>{status==='all'?appointments.length:counts[status]}</span></button>)}</div>
  {error&&<div className="schedule-error" role="alert">{error}<button onClick={onRefresh}>Try again</button></div>}
  {feedback&&<div className="schedule-feedback" role="status">{feedback}</div>}
  {loading?<div className="empty-state"><Clock/><h2>Loading the schedule…</h2></div>:!filtered.length?<div className="empty-state"><CalendarDays size={36}/><h2>{appointments.length?'No appointments match these filters.':'No appointment requests yet.'}</h2><p>{appointments.length?'Choose another status or clear the date and search filters.':'New appointment requests appear here for owner confirmation.'}</p><button className="button" onClick={()=>{if(appointments.length){setFilter('all');setDate('');setQuery('');}else onNew();}}>{appointments.length?'Show all appointments':'Create a request'}</button></div>:<div className="owner-appointments">{filtered.map(a=><article className="appointment-row" key={a.id}>
   <div className="appointment-date"><strong>{a.time}</strong><span>{displayDate(a.date)}</span><small>Until {displayTime(timeMinutes(a.time)+a.duration)}</small></div>
   <div className="appointment-customer"><span className={`appointment-status status-${a.status}`}>{STATUS_LABELS[a.status]}</span><h3>{a.name}</h3><p>{a.service}</p><a href={`tel:${a.phone}`}><Phone size={14}/>{a.phone}</a><small>{a.duration} min · Estimated total {money(a.estimate)}{a.needsQuote?' + consultation quote':''} · Ref {a.id.slice(0,8)}</small></div>
   <div className="appointment-actions">
    {a.status==='pending'&&<button className="button" disabled={working===a.id} onClick={()=>change(a,'confirmed')}><CheckCircle2 size={16}/>{working===a.id?'Saving…':'Confirm appointment'}</button>}
    {a.status==='confirmed'&&appointmentEnded(a)&&<button className="button" disabled={working===a.id} onClick={()=>change(a,'completed')}>Mark completed</button>}
    {a.status==='confirmed'&&!appointmentEnded(a)&&<span className="reserved-note"><CheckCircle2 size={15}/>Time reserved</span>}
    {['pending','confirmed'].includes(a.status)&&(undo===a.id?<div className="cancel-confirm"><p>{a.status==='pending'?'Decline this request?':'Cancel and release this time?'}</p><button disabled={working===a.id} onClick={()=>change(a,'cancelled')}>Yes, {a.status==='pending'?'decline':'cancel'}</button><button onClick={()=>setUndo(null)}>Keep appointment</button></div>:<button className="text-button cancel-action" onClick={()=>change(a,'cancelled')}>{a.status==='pending'?'Decline request':'Cancel appointment'}</button>)}
   </div>
  </article>)}</div>}
  {legacyRequests.length>0&&<section className="legacy-panel"><h2>Previous browser-saved requests</h2><p>You have {legacyRequests.length} older request{legacyRequests.length===1?'':'s'} on this browser. Add future requests to the shared dashboard for confirmation.</p><button className="button" onClick={onImport}>Import previous requests</button></section>}
 </>;
}
