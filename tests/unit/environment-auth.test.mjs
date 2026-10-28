import test from 'node:test';
import assert from 'node:assert/strict';
import {scryptSync} from 'node:crypto';
import {createEnvironmentAuth,ENV_SESSION_SECONDS,inspectEnvironmentAuth} from '../../src/lib/server/environment-auth.mjs';
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

test('shared security state enforces throttling and logout across serverless instances',async()=>{
 let state={failures:[],revoked:[]},queue=Promise.resolve();
 const stateStore={async read(){return structuredClone(state);},update(change){const work=queue.then(async()=>{const update=await change(structuredClone(state));state=update.data;return update.result;});queue=work.catch(()=>{});return work;}};
 const env=settings(),first=createEnvironmentAuth(env,{stateStore}),second=createEnvironmentAuth(env,{stateStore});
 const {token}=await first.login('owner@example.com',password);
 assert.ok(await second.verify(token));await second.logout(token);
 assert.equal(await first.verify(token),null);
 assert.equal(await createEnvironmentAuth(env,{stateStore}).verify(token),null);
 assert.ok(!JSON.stringify(state).includes(token));
 for(let i=0;i<5;i++)await assert.rejects((i%2?first:second).login('owner@example.com','wrong'),e=>e.status===401);
 await assert.rejects(createEnvironmentAuth(env,{stateStore}).login('owner@example.com',password),e=>e.status===429);
});

test('unavailable shared security state fails closed',async()=>{
 const env=settings(),{token}=await createEnvironmentAuth(env).login('owner@example.com',password);
 const stateStore={async read(){throw Error('offline');},async update(){throw Error('offline');}};
 const auth=createEnvironmentAuth(env,{stateStore});
 assert.equal(await auth.verify(token),null);
 await assert.rejects(auth.login('owner@example.com',password));
});
test('hosting values accept surrounding whitespace, quotes and copied env prefixes',async()=>{
 const env=settings();
 const forms=[env,{ADMIN_AUTH_ACCOUNT:'  '+env.ADMIN_AUTH_ACCOUNT+'\n',ADMIN_SESSION_SECRET:' '+env.ADMIN_SESSION_SECRET+'\r\n'}, {ADMIN_AUTH_ACCOUNT:"'"+env.ADMIN_AUTH_ACCOUNT+"'",ADMIN_SESSION_SECRET:'"'+env.ADMIN_SESSION_SECRET+'"'}, {ADMIN_AUTH_ACCOUNT:JSON.stringify(env.ADMIN_AUTH_ACCOUNT),ADMIN_SESSION_SECRET:env.ADMIN_SESSION_SECRET},{ADMIN_AUTH_ACCOUNT:'ADMIN_AUTH_ACCOUNT='+env.ADMIN_AUTH_ACCOUNT,ADMIN_SESSION_SECRET:'ADMIN_SESSION_SECRET='+env.ADMIN_SESSION_SECRET}];
 const {token}=await createEnvironmentAuth(env).login('owner@example.com',password,1000);
 for(const form of forms){const auth=createEnvironmentAuth(form);assert.equal(await auth.configured(),true);assert.equal(auth.configurationIssue(),null);assert.ok(await auth.verify(token,2000));}
});
test('configuration diagnostics identify the field without disclosing its content',()=>{
 const env=settings();
 for(const [settings,code] of [[{},'account_missing'],[{...env,ADMIN_AUTH_ACCOUNT:'email-only@example.com'},'account_format'],[{...env,ADMIN_AUTH_ACCOUNT:'{}'},'account_fields'],[{...env,ADMIN_SESSION_SECRET:''},'secret_missing'],[{...env,ADMIN_SESSION_SECRET:'wrong-secret'},'secret_format']]){
  const result=inspectEnvironmentAuth(settings);assert.equal(result.config,null);assert.equal(result.issue.code,code);assert.ok(!JSON.stringify(result.issue).includes('wrong-secret'));assert.ok(!JSON.stringify(result.issue).includes(env.ADMIN_AUTH_ACCOUNT));assert.ok(!JSON.stringify(result.issue).includes(env.ADMIN_SESSION_SECRET));
 }
});
