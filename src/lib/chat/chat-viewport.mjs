// Visual Viewport describes the portion of the page above a software keyboard.
// Some embedded previews overlay the keyboard without reporting a smaller viewport.
export function chatViewportGeometry({layoutHeight,visualHeight,offsetTop=0,baselineHeight=layoutHeight,focused=false,coarsePointer=false,settled=false,observedResize=false}){
 const available=Math.max(1,Math.min(visualHeight||layoutHeight,layoutHeight));
 const reduced=baselineHeight-available>100;
 const overlayFallback=focused&&coarsePointer&&settled&&!reduced&&!observedResize;
 return {
  height:overlayFallback?Math.min(available,Math.max(120,baselineHeight*.5)):available,
  top:Math.max(0,offsetTop),
  keyboard:focused&&(reduced||overlayFallback),
  overlayFallback,
 };
}
