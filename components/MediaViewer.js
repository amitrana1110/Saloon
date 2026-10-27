 'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {X,ChevronLeft,ChevronRight} from 'lucide-react';
export default function MediaViewer({items,initialIndex,onClose}){
 const [index,setIndex]=useState(initialIndex);const dialog=useRef(null);const item=items[index];
 const move=step=>setIndex(i=>(i+step+items.length)%items.length);
 useEffect(()=>{const previous=document.activeElement;const old=document.body.style.overflow;document.body.style.overflow='hidden';dialog.current.showModal();return()=>{document.body.style.overflow=old;previous?.focus({preventScroll:true});};},[]);
 return createPortal(<dialog className="lookbook-viewer" ref={dialog} aria-label="Lookbook media viewer" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}}}><div className="viewer-shell"><header><span>THE LOOKBOOK <small>{index+1} / {items.length}</small></span><button type="button" autoFocus aria-label="Close viewer" onClick={onClose}><X size={24}/></button></header><div className="viewer-stage"><button className="viewer-previous" type="button" aria-label="Previous image" disabled={items.length<2} onClick={()=>move(-1)}><ChevronLeft/></button>{item.type.startsWith('video/')?<video key={item.id} src={item.url} controls playsInline aria-label={item.caption}/>:<img key={item.id} src={item.url} alt={item.caption}/>}<button className="viewer-next" type="button" aria-label="Next image" disabled={items.length<2} onClick={()=>move(1)}><ChevronRight/></button></div><footer><span>{item.category}</span><p aria-live="polite">{item.caption}</p></footer></div></dialog>,document.body);
}
