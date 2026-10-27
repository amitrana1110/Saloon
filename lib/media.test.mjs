import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const apiRoot=await mkdtemp(path.join(os.tmpdir(),'hm-media-routes-'));
process.env.MEDIA_DATA_DIR=path.join(apiRoot,'media');process.env.ADMIN_DATA_FILE=path.join(apiRoot,'auth.json');
const {createMediaStore,mediaType}=await import('./media-store.mjs');
test.after(async()=>{await rm(apiRoot,{recursive:true,force:true});});
test('media lifecycle and content validation',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'hm-media-'));try{
 const store=createMediaStore(root);const jpg=Buffer.from([255,216,255,224,0,0]);const file=new File([jpg],'../../escape.jpg',{type:'image/jpeg'});
 const a=await store.add(file,'Haircut','Hair');assert.equal(a.status,'draft');assert.match(a.filename,/^[a-f0-9-]+\.jpg$/);assert.deepEqual(await store.bytes(a),jpg);
 await assert.rejects(store.add(new File(['<svg/>'],'bad.jpg',{type:'image/jpeg'}),'Bad','Hair'));
 await assert.rejects(store.add(file,'','Hair'));await assert.rejects(store.add(file,'Hair','Invalid'));
 const b=await store.add(file,'Colour','Colour');await store.change({id:a.id,action:'move',direction:'up'});assert.equal((await store.list())[0].id,a.id);
 await store.change({id:a.id,action:'update',caption:'Fresh cut',category:'Hair',status:'published'});assert.equal((await store.list())[0].status,'published');
 await store.change({id:b.id,action:'delete'});assert.equal((await store.list()).length,1);
 assert.equal(mediaType(Buffer.from([0,0,0,20,102,116,121,112]),'video/mp4'),'mp4');
 }finally{await rm(root,{recursive:true,force:true});}
});
test('media API denies customer writes and hides draft lists and bytes',async()=>{
 const root=apiRoot;
 try{const {adminAuth,sessionCookie}=await import('./admin-auth.mjs');await adminAuth.setup('test@example.com','test-owner-password-123');const login=await adminAuth.login('test@example.com','test-owner-password-123');
 const api=await import('../app/api/media/route.js');const bytesApi=await import('../app/api/media/[id]/route.js');
 const base='http://localhost:3000';const request=(method,body,cookie)=>new Request(base+'/api/media',{method,headers:{origin:base,'content-type':'application/json',...(cookie?{cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
 assert.equal((await api.POST(request('POST',{}))).status,401);assert.equal((await api.PATCH(request('PATCH',{}))).status,401);assert.equal((await api.GET(new Request(base+'/api/media?admin=1'))).status,401);
 const store=createMediaStore(process.env.MEDIA_DATA_DIR);const item=await store.add(new File([Buffer.from([255,216,255,224])],'test.jpg',{type:'image/jpeg'}),'Test','Hair');
 assert.equal((await (await api.GET(new Request(base+'/api/media'))).json()).items.length,0);
 const params={params:Promise.resolve({id:item.id})};assert.equal((await bytesApi.GET(new Request(base+item.url),params)).status,404);
 const cookie=sessionCookie(new Request(base),login.token).split(';')[0];
 assert.equal((await bytesApi.GET(new Request(base+item.url,{headers:{cookie}}),params)).status,200);
 const patch={id:item.id,action:'update',caption:'Published test',category:'Hair',status:'published'};
 const cross=new Request(base+'/api/media',{method:'PATCH',headers:{cookie,origin:'https://bad.example','content-type':'application/json'},body:JSON.stringify(patch)});assert.equal((await api.PATCH(cross)).status,403);
 assert.equal((await api.PATCH(request('PATCH',patch,cookie))).status,200);
 assert.equal((await (await api.GET(new Request(base+'/api/media'))).json()).items.length,1);
 const range=await bytesApi.GET(new Request(base+item.url,{headers:{range:'bytes=1-2'}}),params);assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,2);
 await api.PATCH(request('PATCH',{...patch,status:'draft'},cookie));assert.equal((await bytesApi.GET(new Request(base+item.url),params)).status,404);
 }finally{await rm(root,{recursive:true,force:true});}
});
