'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
export default function useAppointments({admin=false,receipt,onReceipt}={}){
 const [appointments,setAppointments]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const requestVersion=useRef(0);
 const refresh=useCallback(async()=>{
  const version=++requestVersion.current;
  try{
   const response=await fetch(admin?'/api/appointments':'/api/availability',{cache:'no-store'});const data=await response.json();
   if(response.status===401&&admin){setAppointments([]);window.location.replace('/admin/login');return;}
   if(!response.ok)throw new Error(data.error||'Could not load the schedule.');
   if(version===requestVersion.current){setAppointments(data.appointments);setError('');}
  }catch(e){if(version===requestVersion.current)setError(e.message||'Could not load the schedule.');}
  finally{if(version===requestVersion.current)setLoading(false);}
 },[admin]);
 useEffect(()=>{
  setAppointments([]);refresh();
  const poll=setInterval(()=>{if(!document.hidden)refresh();},5000);
  const visible=()=>{if(!document.hidden)refresh();};
  window.addEventListener('focus',refresh);window.addEventListener('pageshow',refresh);document.addEventListener('visibilitychange',visible);
  return()=>{clearInterval(poll);window.removeEventListener('focus',refresh);window.removeEventListener('pageshow',refresh);document.removeEventListener('visibilitychange',visible);requestVersion.current++;};
 },[refresh]);
 useEffect(()=>{
  if(!receipt?.id||!receipt?.accessToken)return;
  let active=true;
  const update=async()=>{
   try{const response=await fetch('/api/appointments/'+encodeURIComponent(receipt.id),{cache:'no-store',headers:{Authorization:'Bearer '+receipt.accessToken}});if(!response.ok)return;const data=await response.json();if(active)onReceipt({...data.appointment,accessToken:receipt.accessToken});}catch{}
  };
  const poll=setInterval(()=>{if(!document.hidden)update();},5000);window.addEventListener('focus',update);
  return()=>{active=false;clearInterval(poll);window.removeEventListener('focus',update);};
 },[receipt?.id,receipt?.accessToken,onReceipt]);
 const mutate=useCallback(async(method,body)=>{
  ++requestVersion.current;
  const response=await fetch('/api/appointments',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await response.json();
  if(response.status===401&&admin){setAppointments([]);window.location.replace('/admin/login');throw new Error('Your session expired. Please sign in again.');}
  if(!response.ok){await refresh();throw new Error(data.error||'Could not update this appointment.');}
  ++requestVersion.current;
  if(admin)setAppointments(rows=>[...rows.filter(a=>a.id!==data.appointment.id),data.appointment]);else await refresh();
  setError('');return data.appointment;
 },[admin,refresh]);
 return {appointments,loading,error,refresh,create:body=>mutate('POST',body),changeStatus:(id,status)=>mutate('PATCH',{id,status})};
}
