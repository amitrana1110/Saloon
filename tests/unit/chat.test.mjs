import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Load the route without starting Next or contacting Groq.
const source=readFileSync(new URL('../../src/app/api/chat/route.js',import.meta.url),'utf8')
  .replace("'../../../lib/data/salon.mjs'",JSON.stringify(new URL('../../src/lib/data/salon.mjs',import.meta.url).href));
const {POST,GET}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const request=body=>new Request('http://localhost/api/chat',{method:'POST',body:JSON.stringify(body)});

test('chat API validation, FAQ mode, live response and outage handling',async t=>{
 const originalKey=process.env.GROQ_API_KEY;
 const originalFetch=globalThis.fetch;
 try {
  delete process.env.GROQ_API_KEY;
  await t.test('status endpoint reports FAQ mode without a key',async()=>{
   const response=await GET();assert.equal((await response.json()).mode,'demo');assert.equal(response.headers.get('Cache-Control'),'no-store');
  });
  await t.test('malformed JSON returns 400',async()=>{
   assert.equal((await POST(new Request('http://localhost/api/chat',{method:'POST',body:'{'}))).status,400);
  });
  for(const body of [null,[],{},true,7,{message:null},{message:12},{message:''},{message:'   '},{message:'x'.repeat(2001)}]) {
   await t.test(`invalid body ${JSON.stringify(body).slice(0,55)} returns 400`,async()=>{
    assert.equal((await POST(request(body))).status,400);
   });
  }
  await t.test('valid message returns disclosed FAQ answer',async()=>{
   const result=await POST(request({message:'haircut price'}));
   assert.equal(result.status,200);
   const data=await result.json();assert.equal(data.mode,'demo');assert.match(data.reply,/starting prices/);
  });
  await t.test('2000-character message is accepted',async()=>{
   assert.equal((await POST(request({message:'x'.repeat(2000)}))).status,200);
  });
  process.env.GROQ_API_KEY='test-only-not-a-real-key';
  await t.test('status endpoint reports configured AI without revealing the key',async()=>{
   const response=await GET();const text=await response.text();assert.equal(JSON.parse(text).mode,'ai');assert.ok(!text.includes(process.env.GROQ_API_KEY));
  });
  for(const [status,code,reason] of [[401,'invalid_api_key','authentication'],[429,'insufficient_quota','quota'],[429,'rate_limit_exceeded','rate_limit'],[404,'model_not_found','configuration']]){
   await t.test(`upstream ${code} gives a safe actionable fallback`,async()=>{
    globalThis.fetch=async()=>Response.json({error:{code,message:'Do not return this secret: '+process.env.GROQ_API_KEY}},{status});
    const response=await POST(request({message:'opening hours'}));const text=await response.text();const data=JSON.parse(text);assert.equal(data.reason,reason);assert.equal(data.mode,'demo');assert.ok(!text.includes(process.env.GROQ_API_KEY));
   });
  }
  await t.test('live response text is extracted and request is bounded',async()=>{
   globalThis.fetch=async(url,options)=>{
    assert.equal(url,'https://api.groq.com/openai/v1/chat/completions');
    const data=JSON.parse(options.body);assert.equal(data.model,'openai/gpt-oss-20b');assert.equal(data.max_completion_tokens,1024);assert.equal(data.messages[0].role,'system');assert.match(data.messages[0].content,/Never invent prices/);assert.deepEqual(data.messages[1],{role:'user',content:'opening hours'});assert.equal(data.include_reasoning,false);assert.equal(data.reasoning_effort,'low');assert.equal(options.headers.Authorization,'Bearer test-only-not-a-real-key');assert.ok(options.signal);
    return Response.json({choices:[{message:{content:'Demo answer.',reasoning:'Private reasoning that must not be shown.'}}]});
   };
   const data=await (await POST(request({message:'opening hours'}))).json();assert.equal(data.mode,'ai');assert.equal(data.reply,'Demo answer.');assert.ok(!JSON.stringify(data).includes('Private reasoning'));
  });
  for(const failure of ['http','empty','network']) {
   await t.test(`${failure} AI failure safely falls back to FAQ`,async()=>{
    globalThis.fetch=async()=>{if(failure==='network')throw new Error('offline');return failure==='http'?new Response('',{status:503}):Response.json({choices:[]});};
    const result=await POST(request({message:'opening hours'}));assert.equal(result.status,200);
    const data=await result.json();assert.equal(data.mode,'demo');assert.match(data.notice,/temporarily unavailable/);assert.match(data.reply,/10 AM to 9 PM/);
   });
  }
 }finally{
  globalThis.fetch=originalFetch;
  if(originalKey===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=originalKey;
 }
});
