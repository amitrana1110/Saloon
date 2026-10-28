import test from 'node:test';
import assert from 'node:assert/strict';
import {scryptSync} from 'node:crypto';
import {createEnvironmentAuth,ENV_SESSION_SECONDS} from '../../src/lib/server/environment-auth.mjs';
const password='test-only-owner-password-123',salt='a'.repeat(32);
const settings=()=>({ADMIN_AUTH_ACCOUNT:JSON.stringify({email:'owner@example.com',salt,hash:scryptSync(password,salt,64).toString('hex')}),ADMIN_SESSION_SECRET:'b'.repeat(43)});
test('environment owner login survives a new instance without filesystem writes',async()=>{
 const env=settings(),first=createEnvironmentAuth(env),second=createEnvironmentAuth({...env});
 assert.ok(await first.configured());await assert.rejects(first.login('owner@example.com','wrong'),e=>e.status===401);
 const {token}=await first.login('OWNER@example.com',password,1000);
 assert.equal((await second.verify(token,2000)).role,'owner');assert.ok(!token.includes(password));
 assert.equal(await second.verify(token,1000+ENV_SESSION_SECONDS*1000),null);
 assert.equal(await second.verify(token+'x',2000),null);
 assert.equal(await second.verify(token.replace(/^./,token[0]==='a'?'b':'a'),2000),null);
 assert.equal(await createEnvironmentAuth({...env,ADMIN_SESSION_SECRET:'c'.repeat(43)}).verify(token,2000),null);
});
test('missing or partial environment credentials fail closed and local throttling applies',async()=>{
 for(const env of [{},{ADMIN_AUTH_ACCOUNT:'broken'}, {...settings(),ADMIN_SESSION_SECRET:'short'}]){const auth=createEnvironmentAuth(env);assert.equal(await auth.configured(),false);await assert.rejects(auth.login('owner@example.com',password),e=>e.status===503);assert.equal(await auth.verify('anything'),null);}
 const auth=createEnvironmentAuth(settings());for(let i=0;i<5;i++)await assert.rejects(auth.login('owner@example.com','wrong',1000+i),e=>e.status===401);
 await assert.rejects(auth.login('owner@example.com',password,2000),e=>e.status===429);
 assert.ok((await auth.login('owner@example.com',password,16*60*1000)).token);
});
test('environment logout rejects replay on the same instance',async()=>{
 const auth=createEnvironmentAuth(settings()),{token}=await auth.login('owner@example.com',password);
 await auth.logout(token);assert.equal(await auth.verify(token),null);
});
