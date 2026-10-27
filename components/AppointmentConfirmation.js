import {CheckCircle2,ExternalLink,ArrowRight} from 'lucide-react';
import {STATUS_LABELS} from '../lib/appointments.mjs';
import {whatsappMessage} from '../lib/salon.mjs';

export default function AppointmentConfirmation({appointment:a,onDashboard,adminMode=false}){
 const titles={pending:'Your request is awaiting confirmation.',confirmed:'Your appointment is confirmed.',cancelled:'Your appointment was cancelled.',completed:'Your visit is marked completed.'};
 return <section className="confirmation">
  <CheckCircle2 size={48}/><p className="eyebrow">{STATUS_LABELS[a.status]}</p><h2>{titles[a.status]}</h2>
  <p>{a.status==='pending'?'Your request has been received. The salon will review it and confirm your appointment.':a.status==='confirmed'?'Your selected time is reserved. We look forward to seeing you.':'You can request another visit whenever you are ready.'}</p>
  <div className="confirmation-summary"><strong>{a.service}</strong><span>{a.date} · {a.time}</span><span>{a.name} · {a.phone}</span><span className={'appointment-status status-'+a.status}>{STATUS_LABELS[a.status]}</span></div>
  {a.status==='pending'&&<><a className="button" href={'https://wa.me/919045673033?text='+encodeURIComponent(whatsappMessage(a))} target="_blank" rel="noreferrer">Also share on WhatsApp <ExternalLink size={16}/></a><small>Optional: send the prepared message yourself. The app does not send WhatsApp notifications.</small></>}
  <button className="text-button" onClick={onDashboard}>{adminMode?'View appointments':'Request another appointment'} <ArrowRight size={15}/></button>
 </section>;
}
