import test from 'node:test';
import assert from 'node:assert/strict';
import {createBlobJsonStore,StorageError} from '../../src/lib/server/cloud-storage.mjs';
import {createAppointmentStore} from '../../src/lib/server/appointment-store.mjs';
import {createCloudMediaStore} from '../../src/lib/server/cloud-media-store.mjs';

function fakeBlob(){
 const files=new Map();let revision=0;const calls=[];
 return {files,calls,
  async get(name,options){
   assert.equal(options.access,'private');assert.equal(options.useCache,false);calls.push(['get',name]);
   await new Promise(r=>setTimeout(r,1));const file=files.get(name);if(!file)return null;
   let bytes=Buffer.from(file.bytes);const headers=new Headers();const range=options.headers?.Range;
   if(range){const [,a,b]=/bytes=(\d+)-(\d+)/.exec(range);headers.set('content-range',`bytes ${a}-${b}/${bytes.length}`);bytes=bytes.subarray(Number(a),Number(b)+1);}
   return {stream:new Response(bytes).body,headers,blob:{etag:file.etag,size:file.bytes.length,contentType:file.type}};
  },
  async put(name,body,options){
   assert.equal(options.access,'private');calls.push(['put',name]);await new Promise(r=>setTimeout(r,1));
   const existing=files.get(name);if(options.ifMatch&&existing?.etag!==options.ifMatch){const e=new Error('conflict');e.name='BlobPreconditionFailedError';throw e;}
   if(!options.allowOverwrite&&existing)throw new Error('Blob already exists');
   const file={bytes:Buffer.from(body),type:options.contentType,etag:'"v'+(++revision)+'"'};files.set(name,file);return {pathname:name,etag:file.etag};
  },
  async del(name){files.delete(name);},
 };
}
const configured=()=>{};
test('private cloud JSON retries concurrent first writes and preserves every update',async()=>{
 const client=fakeBlob(),make=()=>createBlobJsonStore('test/state.json',[],{client,configured});
 await Promise.all(Array.from({length:6},(_,i)=>make().update(rows=>({data:[...rows,i],result:i}))));
 assert.deepEqual((await make().read()).sort(),[0,1,2,3,4,5]);
 assert.ok(client.calls.filter(([op])=>op==='put').length>6);
});
test('independent cloud appointment instances reject simultaneous overlapping confirmations',async()=>{
 const client=fakeBlob(),make=()=>createAppointmentStore(undefined,{store:createBlobJsonStore('test/appointments.json',[],{client,configured})});
 const a=make(),b=make(),now=new Date('2030-01-01T04:00:00Z'),payload={name:'Cloud QA',phone:'9000000000',date:'2030-01-02',time:'11:00 AM',serviceIds:['cut']};
 const first=await a.create(payload,now),second=await b.create(payload,now);
 assert.ok(first.accessToken);assert.ok(!JSON.stringify(await a.list()).includes(first.accessToken));
 const results=await Promise.allSettled([a.changeStatus(first.id,'confirmed',now),b.changeStatus(second.id,'confirmed',now)]);
 assert.equal(results.filter(x=>x.status==='fulfilled').length,1);assert.equal(results.find(x=>x.status==='rejected').reason.status,409);
 const confirmed=(await a.list()).find(x=>x.status==='confirmed');await b.changeStatus(confirmed.id,'cancelled',now);
 await a.changeStatus((await a.list()).find(x=>x.status==='pending').id,'confirmed',now);
 assert.equal((await a.list()).filter(x=>x.status==='confirmed').length,1);
});
test('cloud media validates bytes, saves drafts, publishes, streams ranges and deletes',async()=>{
 const client=fakeBlob(),store=createBlobJsonStore('test/media.json',{items:[]},{client,configured}),make=()=>createCloudMediaStore({client,store,configured});
 const bytes=Buffer.from([137,80,78,71,13,10,26,10,1,2,3,4]);
 const item=await make().add(new File([bytes],'qa.png',{type:'image/png'}),'Cloud photo','Hair');
 assert.equal(item.status,'draft');assert.equal((await make().register(item.blobPath,'Cloud photo','Hair')).id,item.id);assert.equal((await make().list()).length,1);
 await make().change({id:item.id,action:'update',caption:'Edited',category:'Skin',status:'published'});
 assert.equal((await make().list())[0].status,'published');
 const response=await make().response(item,new Request('https://salon.example/api/media/'+item.id,{headers:{Range:'bytes=0-3'}}));
 assert.equal(response.status,206);assert.equal(response.headers.get('content-range'),'bytes 0-3/12');assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes.subarray(0,4));
 const invalid=await make().response(item,new Request('https://salon.example',{headers:{Range:'bytes=99-100'}}));assert.equal(invalid.status,416);
 await assert.rejects(make().register('https://example.com/arbitrary','Caption','Hair'),e=>e.status===400);
 await assert.rejects(make().add(new File(['bad'],'spoof.jpg',{type:'image/jpeg'}),'Spoof','Hair'),e=>e.status===400);
 await make().change({id:item.id,action:'delete'});assert.equal((await make().list()).length,0);assert.equal(client.files.has(item.blobPath),false);
});
test('cloud errors never silently reset or fall back to a local empty store',async()=>{
 const client=fakeBlob(),store=createBlobJsonStore('test/failure.json',[],{client,configured:()=>{throw new StorageError();}});
 await assert.rejects(store.read(),e=>e.status===503);assert.equal(client.files.size,0);
 client.get=async()=>{throw new Error('network unavailable');};
 await assert.rejects(createBlobJsonStore('test/failure.json',[],{client,configured}).read(),/network unavailable/);
});
