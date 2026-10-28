'use client';
import {useState,useRef} from 'react';
import {Search,MapPin,Phone,ArrowUpRight,ArrowRight,ChevronDown,X} from 'lucide-react';
import {reference} from '../../lib/data/reference.mjs';
import {groupLocations} from '../../lib/data/locations.mjs';
import './locations.css';

const allGroups=groupLocations(reference.locations);
export default function LocationsPage(){
 const [region,setRegion]=useState('All'),[query,setQuery]=useState('');const results=useRef(null);
 const groups=groupLocations(reference.locations,{region,query});const count=groups.reduce((total,group)=>total+group.locations.length,0);
 function chooseRegion(id){
  setRegion(id);setQuery('');
  requestAnimationFrame(()=>{const top=results.current?.getBoundingClientRect().top;if(top<90||top>window.innerHeight-120)results.current?.scrollIntoView({block:'start',behavior:'smooth'});});
 }
 function clear(){setRegion('All');setQuery('');}
 return <div className="locations-page brand-page">
  <div className="brand-page-heading"><p className="eyebrow">OUR LOCATIONS</p><h1>Find your <em>Hair Masters.</em></h1><p>Choose a city or region to explore our salons, find directions and contact the team.</p></div>
  <section className="directory-local-note"><span className="directory-local-icon"><MapPin size={22}/></span><div><h2>Visiting Sector 104, Noida?</h2><p>Choose your treatment and request an appointment online.</p></div><a href="/salon?section=services">Services & booking <ArrowUpRight size={17}/></a></section>
  <div className="directory-controls"><label className="directory-search"><Search size={19}/><input aria-label="Search salon locations" placeholder="Search a city, area or postcode" value={query} maxLength={100} onChange={event=>{setQuery(event.target.value);if(event.target.value.trim())setRegion('All');}}/>{query&&<button type="button" aria-label="Clear location search" onClick={()=>setQuery('')}><X size={17}/></button>}</label><label className="directory-mobile-select">City or region<select aria-label="Filter locations by region" value={region} onChange={event=>chooseRegion(event.target.value)}><option value="All">All locations ({reference.locations.length})</option>{allGroups.map(group=><option key={group.id} value={group.id}>{group.label} ({group.locations.length})</option>)}</select></label></div>
  <div className="directory-layout">
   <aside className="directory-regions"><p>BROWSE BY CITY OR REGION</p><nav aria-label="Location regions"><button type="button" aria-pressed={region==='All'&&!query} onClick={()=>chooseRegion('All')}>All locations <span>{reference.locations.length}</span></button>{allGroups.map(group=><button type="button" key={group.id} aria-pressed={region===group.id} onClick={()=>chooseRegion(group.id)}>{group.label}<span>{group.locations.length}</span></button>)}</nav></aside>
   <div className="directory-results" ref={results} id="directory-results"><div className="directory-results-heading"><p role="status">{count} {count===1?'location':'locations'}{region==='All'?` in ${groups.length} ${groups.length===1?'region':'regions'}`:''}{query?` matching “${query}”`:''}</p>{(query||region!=='All')&&<button type="button" onClick={clear}>Show all <X size={13}/></button>}</div>
    {groups.map(group=><details className="directory-group" key={region+':'+query+':'+group.id} open={region!=='All'||Boolean(query.trim())||group.id==='Noida'}><summary><span><MapPin size={18}/><span>{group.label}</span><small>{group.locations.length} {group.locations.length===1?'salon':'salons'}</small></span><ChevronDown size={19}/></summary><div className="directory-cards">{group.locations.map((location,index)=><article className="directory-card" key={location.source+location.name+index}><div className="directory-card-heading"><span>{location.comingSoon?'OPENING SOON':location.localBooking?'ONLINE BOOKING AVAILABLE':'HAIR MASTERS'}</span><h2>{location.name.toLowerCase()==='coming soon'?'New salon':location.name}</h2></div><p>{location.comingSoon?'Opening soon. Contact the team for launch updates.':location.address||'Contact the branch for its current address and opening details.'}</p><div className="directory-card-actions">{location.localBooking&&<a className="directory-card-book" href="/salon?section=services">View services <ArrowRight size={14}/></a>}{location.address&&<a href={'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('Hair Masters '+location.address)} target="_blank" rel="noopener noreferrer"><MapPin size={14}/>Directions</a>}{location.phone&&<a href={'tel:'+location.phone}><Phone size={14}/>Call salon</a>}<a className="directory-branch-link" href={location.source} target="_blank" rel="noopener noreferrer">Branch details <ArrowUpRight size={14}/></a></div></article>)}</div></details>)}
    {!groups.length&&<div className="directory-empty"><MapPin size={30}/><h2>No salons found</h2><p>Try another city, area or postcode.</p><button type="button" onClick={clear}>Show all locations <ArrowRight size={16}/></button></div>}
   </div>
  </div>
 </div>;
}
