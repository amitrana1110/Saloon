import test from 'node:test';
import assert from 'node:assert/strict';
import {chatViewportGeometry as geometry} from '../../src/lib/chat/chat-viewport.mjs';

test('keyboard that shrinks the visual viewport uses its actual height and pan offset',()=>{
 const view=geometry({layoutHeight:800,visualHeight:410,offsetTop:55,baselineHeight:800,focused:true,coarsePointer:true,settled:true});
 assert.equal(view.height,410);assert.equal(view.top,55);assert.equal(view.keyboard,true);assert.equal(view.overlayFallback,false);
 assert.ok(view.top+view.height<=800);
});
test('Android layout-viewport resizing is detected against pre-focus height',()=>{
 const view=geometry({layoutHeight:420,visualHeight:420,baselineHeight:800,focused:true,coarsePointer:true,settled:true});
 assert.equal(view.height,420);assert.equal(view.keyboard,true);assert.equal(view.overlayFallback,false);
});
test('embedded preview with overlay-only keyboard reserves space after native animation',()=>{
 const input={layoutHeight:720,visualHeight:720,baselineHeight:720,focused:true,coarsePointer:true};
 assert.equal(geometry(input).height,720);
 const view=geometry({...input,settled:true});assert.equal(view.height,360);assert.equal(view.overlayFallback,true);assert.equal(view.keyboard,true);
});
test('normal unfocused screens and desktop keyboards never get the overlay fallback',()=>{
 assert.equal(geometry({layoutHeight:720,baselineHeight:720,focused:false,coarsePointer:true,settled:true}).height,720);
 assert.equal(geometry({layoutHeight:720,baselineHeight:720,focused:true,coarsePointer:false,settled:true}).height,720);
});
test('native keyboard dismissal restores the full measured viewport',()=>{
 const view=geometry({layoutHeight:800,visualHeight:800,baselineHeight:800,focused:true,coarsePointer:true,settled:true,observedResize:true});
 assert.equal(view.height,800);assert.equal(view.keyboard,false);assert.equal(view.overlayFallback,false);
});
test('overlay fallback is bounded by the available viewport on small screens',()=>{
 const view=geometry({layoutHeight:320,visualHeight:320,baselineHeight:320,focused:true,coarsePointer:true,settled:true});
 assert.equal(view.height,160);assert.ok(view.height<=320);
});
