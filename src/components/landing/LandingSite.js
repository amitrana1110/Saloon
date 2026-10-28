'use client';
import {useEffect,useRef,useState} from 'react';
import './landing.css';
import {ArrowUpRight,ArrowRight,Menu,X,Moon,Sun} from 'lucide-react';
import BrandPages from '../brand/BrandPages';
import {brandNavigation,bookingEntryHref,legacySectionHref} from '../../lib/navigation/navigation.mjs';
import {branch} from '../../lib/data/salon.mjs';
import {reference} from '../../lib/data/reference.mjs';

export default function LandingSite({page='home'}){
 const [theme,setTheme]=useState('light');const menu=useRef(null);
 useEffect(()=>{
  let saved;try{saved=localStorage.getItem('hm-theme');}catch{}
  const selected=['light','dark'].includes(saved)?saved:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  setTheme(selected);document.documentElement.dataset.theme=selected;
  document.documentElement.removeAttribute('data-legacy-section');
  const legacy=legacySectionHref(window.location.hash.slice(1));
  if(legacy)window.location.replace(legacy);
 },[]);
 function toggleTheme(){const next=theme==='dark'?'light':'dark';setTheme(next);document.documentElement.dataset.theme=next;try{localStorage.setItem('hm-theme',next);}catch{}}
 const navigation=()=>brandNavigation.map(([id,label])=><a href={'/'+id} key={id} aria-current={page===id?'page':undefined}>{label}</a>);
 return <div className="landing-site">
  <a className="landing-skip" href="#main-content">Skip to content</a>
  <header className="landing-header">
   <div className="landing-header-inner">
    <a className="landing-brand" href="/" aria-label="Hair Masters home"><span>HM<i>·</i></span><strong>HAIR MASTERS<small>LUXURY SALON</small></strong></a>
    <nav className="landing-desktop-nav" aria-label="Main navigation">{navigation()}</nav>
    <div className="landing-header-actions"><button type="button" className="landing-theme" onClick={toggleTheme} aria-label={`Switch to ${theme==='dark'?'light':'dark'} mode`}>{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button><a className="landing-book" href={bookingEntryHref}>Book now <ArrowUpRight size={15}/></a>
     <details className="landing-mobile-menu" ref={menu} onKeyDown={event=>{if(event.key==='Escape'){menu.current.open=false;menu.current.querySelector('summary').focus();}}}>
      <summary aria-label="Navigation menu"><Menu className="landing-menu-open" size={23}/><X className="landing-menu-close" size={23}/></summary>
      <nav aria-label="Mobile navigation"><a href="/" aria-current={page==='home'?'page':undefined}>Home</a>{navigation()}<a className="landing-menu-book" href={bookingEntryHref}>Book an appointment <ArrowUpRight size={17}/></a></nav>
     </details>
    </div>
   </div>
  </header>
  <main className={'landing-main '+(page==='home'?'landing-home':'landing-inner')} id="main-content">
   {page==='home'?<>
    <section className="landing-hero">
     <div className="landing-hero-copy"><p className="landing-kicker">HAIR MASTERS · SECTOR 104, NOIDA</p><h1>Your hair.<br/><em>Your way.</em></h1><p>Good hair starts with a conversation. Make time for a cut, colour or a little care, with a team that listens.</p><div className="landing-hero-actions"><a className="landing-book" href={bookingEntryHref}>Book your visit <ArrowUpRight size={18}/></a><a className="landing-text-link" href="/salon?section=services">Services & prices <ArrowRight size={17}/></a></div><span className="landing-hours">Open every day · 10 AM – 9 PM</span></div>
     <figure className="landing-hero-image"><img src="/images/original/work-4.webp" alt="Softly blended colour and long waves at Hair Masters" fetchPriority="high"/><figcaption><span>COLOUR. CUT. CONFIDENCE.</span><span>Hair Masters <ArrowUpRight size={16}/></span></figcaption></figure>
    </section>
    <section className="landing-services"><div className="landing-section-heading"><div><p className="landing-kicker">A LITTLE SOMETHING FOR YOU</p><h2>Find your next look.</h2></div><a className="landing-text-link" href="/salon?section=services">View all services <ArrowRight size={17}/></a></div><div className="landing-service-grid">{[
     ['/women','/images/original/work-3.webp','Women’s services','Cuts, colour & styling'],
     ['/men','/images/original/men-0.webp','Men’s services','Grooming, shaped around you'],
     ['/women','/images/original/women-1.webp','Beauty & care','Skin, nails & occasion makeup'],
    ].map(([href,image,title,description])=><a className="landing-service" href={href} key={title}><div><img src={image} alt={title} loading="lazy"/></div><div className="landing-service-caption"><div><h3>{title}</h3><p>{description}</p></div><ArrowUpRight size={21}/></div></a>)}</div></section>
    <section className="landing-visit"><img src={reference.images.noida[1]} alt="Inside Hair Masters Sector 104 salon" loading="lazy"/><div><p className="landing-kicker">YOUR NEIGHBOURHOOD SALON</p><h2>A place to<br/><em>take your time.</em></h2><p>Step in for your regular trim or a fresh start. Find us at Sector 104, Noida.</p><address>{branch.address}</address><div className="landing-visit-links"><a className="landing-text-link" href={branch.mapsUrl} target="_blank" rel="noopener noreferrer">Get directions <ArrowUpRight size={17}/></a><a className="landing-text-link" href="/about">Our story <ArrowRight size={17}/></a></div></div></section>
    <section className="landing-journal"><div className="landing-section-heading"><div><p className="landing-kicker">THE JOURNAL</p><h2>A little inspiration.</h2></div><a className="landing-text-link" href="/blogs">Explore the journal <ArrowRight size={17}/></a></div><div className="landing-journal-grid">{reference.blogs.slice(0,2).map(item=><a href="/blogs" className="landing-journal-story" key={item.id||item.title}><img src={item.image} alt="" loading="lazy"/><div><p className="landing-kicker">HAIR & BEAUTY</p><h3>{item.title}</h3><span>Explore the journal <ArrowUpRight size={16}/></span></div></a>)}</div></section>
    <section className="landing-franchise"><div><p className="landing-kicker">OUR NEXT CHAPTER</p><h2>Grow with Hair Masters.</h2><p>Explore a salon partnership and start a conversation with our franchise team.</p></div><a className="landing-text-link" href="/franchise">Franchise enquiries <ArrowUpRight size={19}/></a></section>
   </>:<BrandPages key={page} page={page}/>}
   <section className="landing-closing"><p className="landing-kicker">MAKE TIME FOR YOU</p><h2>Your next visit<br/>starts <em>here.</em></h2><a className="landing-book" href={bookingEntryHref}>Book an appointment <ArrowUpRight size={18}/></a></section>
  </main>
  <footer className="landing-footer"><div className="landing-footer-top"><div><a className="landing-brand" href="/"><span>HM<i>·</i></span><strong>HAIR MASTERS<small>LUXURY SALON</small></strong></a><p>Hair, beauty and a moment for yourself.</p></div><nav aria-label="Footer navigation">{navigation()}</nav><div className="landing-footer-contact"><span>SECTOR 104, NOIDA</span><a href={branch.mapsUrl} target="_blank" rel="noopener noreferrer">{branch.address}</a><a href="tel:+919045673033">+91 90456 73033</a><p>Every day · 10 AM – 9 PM</p></div></div><div className="landing-footer-bottom"><span>© {new Date().getFullYear()} Hair Masters</span><a href="/admin/login">Owner sign in <ArrowUpRight size={12}/></a></div></footer>
 </div>;
}
