'use client';
import {useEffect,useRef,useState} from 'react';
import {chatViewportGeometry} from '../lib/chat-viewport.mjs';

export default function useChatViewport(open,focused){
 const [viewport,setViewport]=useState(null);
 const baseline=useRef({width:0,height:0});
 useEffect(()=>{
  if(!open)return;
  const visual=window.visualViewport;
  let settled=false,observedResize=false;
  const read=()=>{
   const available=visual?.height||window.innerHeight;
   if(Math.abs(window.innerWidth-baseline.current.width)>80){
    baseline.current={width:window.innerWidth,height:available};
   }else if(available>baseline.current.height){baseline.current.height=available;}
   if(focused&&baseline.current.height-available>100)observedResize=true;
   setViewport(chatViewportGeometry({
    layoutHeight:window.innerHeight,visualHeight:available,offsetTop:visual?.offsetTop||0,
    baselineHeight:baseline.current.height,focused,
    coarsePointer:window.matchMedia('(pointer: coarse)').matches,
    settled,observedResize,
   }));
  };
  const resize=read;
  read();
  // Allow the native keyboard animation to report its real height before using a fallback.
  const timer=setTimeout(()=>{settled=true;resize();},450);
  visual?.addEventListener('resize',resize);visual?.addEventListener('scroll',resize);
  window.addEventListener('resize',resize);
  return()=>{clearTimeout(timer);visual?.removeEventListener('resize',resize);visual?.removeEventListener('scroll',resize);window.removeEventListener('resize',resize);};
 },[open,focused]);
 return viewport;
}
