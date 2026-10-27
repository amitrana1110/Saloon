import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {createAdminAuth,assertSameOrigin,sessionCookie,cookieName,assertLoginTransport} from './admin-auth.mjs';

const password='A test-only owner password 123!';
async function fixture(run){
 const dir=await mkdtemp(path.join(tmpdir(),'salon-auth-'));
 try{await run(createAdminAuth(path.join(dir,'account.json')),dir);}
 finally{assert.equal(path.dirname(path.resolve(dir)),path.resolve(tmpdir()));assert.ok(path.basename(dir).startsWith('salon-auth-'));await rm(dir,{recursive:true,force:true});}
}
test('owner account has no public/default password and persists only salted hashes',()=>fixture(async(auth,dir)=>{
 assert.equal(await auth.configured(),false);
 await assert.rejects(auth.login('owner@test.local',password),e=>e.status===503);
 await auth.setup('Owner@Test.local',password);
 const stored=await readFile(path.join(dir,'account.json'),'utf8');
 assert.ok(!stored.includes(password));assert.ok(stored.includes('salt'));assert.ok(stored.includes('hash'));
 await assert.rejects(auth.setup('another@test.local',password));
 const login=await auth.login('owner@test.local',password);
 assert.equal((await auth.verify(login.token)).role,'owner');
 assert.ok(!(await readFile(path.join(dir,'account.json'),'utf8')).includes(login.token));
}));
test('forged, expired and revoked sessions are rejected',()=>fixture(async auth=>{
 await auth.setup('owner@test.local',password);
 const login=await auth.login('owner@test.local',password,1000);
 assert.equal(await auth.verify('not-a-session'),null);
 assert.equal(await auth.verify('a'.repeat(43),1000),null);
 assert.equal(await auth.verify(login.token,1000+8*60*60*1000),null);
 assert.ok(await auth.verify(login.token,2000));
 await auth.logout(login.token);assert.equal(await auth.verify(login.token,2000),null);
}));
test('failed owner logins are throttled and recover after the cooldown',()=>fixture(async auth=>{
 await auth.setup('owner@test.local',password);
 for(let i=0;i<5;i++)await assert.rejects(auth.login('owner@test.local','wrong password',1000+i),e=>e.status===401);
 await assert.rejects(auth.login('owner@test.local',password,2000),e=>e.status===429);
 assert.ok((await auth.login('owner@test.local',password,1000+16*60*1000)).token);
}));
test('state changes require a matching origin and JSON content type',()=>{
 const request=(origin,type='application/json')=>new Request('http://localhost:3000/api/admin/session',{method:'POST',headers:{...(origin?{origin}:{}),'content-type':type}});
 assert.doesNotThrow(()=>assertSameOrigin(request('http://localhost:3000')));
 assert.throws(()=>assertSameOrigin(request('https://evil.example')),e=>e.status===403);
 assert.throws(()=>assertSameOrigin(request(null)),e=>e.status===403);
 assert.throws(()=>assertSameOrigin(request('http://localhost:3000','text/plain')),e=>e.status===415);
 const development=new Request('http://0.0.0.0:3000/api/admin/session',{method:'POST',headers:{Host:'localhost:3000',Origin:'http://localhost:3000','Content-Type':'application/json'}});
 assert.doesNotThrow(()=>assertSameOrigin(development));assert.doesNotThrow(()=>assertLoginTransport(development));
});
test('HTTPS sessions use host-only secure HttpOnly cookies and non-local HTTP login is refused',()=>{
 const local=new Request('http://localhost:3000/api/admin/session');
 const secure=new Request('https://salon.example/api/admin/session');
 assert.equal(cookieName(secure),'__Host-hm_admin');
 const cookie=sessionCookie(secure,'test-token');
 for(const flag of ['HttpOnly','SameSite=Strict','Secure','Path=/'])assert.ok(cookie.includes(flag));
 assert.ok(!cookie.includes('Domain='));
 assert.ok(sessionCookie(local,'',true).includes('Max-Age=0'));
 assert.doesNotThrow(()=>assertLoginTransport(local));
 assert.throws(()=>assertLoginTransport(new Request('http://salon.example/api/admin/session')),e=>e.status===403);
 const proxy=new Request('http://internal:3000/api/admin/session',{method:'POST',headers:{Host:'salon.example',Origin:'https://salon.example','x-forwarded-proto':'https','Content-Type':'application/json'}});
 assert.doesNotThrow(()=>assertSameOrigin(proxy));assert.equal(cookieName(proxy),'__Host-hm_admin');
});
