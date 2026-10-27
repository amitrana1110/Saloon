import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:3001';
let count=0;
async function expect(path,status,options){const result=await fetch(new URL(path,base),options);assert.equal(result.status,status,`${options?.method||'GET'} ${path}`);count++;return result;}
const home=await expect('/',200);
assert.equal(home.headers.get('x-powered-by'),null);
const html=await home.text();assert.match(html,/Hair Masters/);
const assets=[...new Set([...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"?]+)/g)].map(x=>x[1]))];
assert.ok(assets.length>0);
for(const asset of assets)await expect(asset,200);
for(const name of ['hero','color','hair','skin','nails','men','salon','bridal']){
 const result=await expect(`/images/${name}.jpg`,200);assert.match(result.headers.get('content-type'),/image\/jpeg/);
}
await expect('/not-a-real-page',404);
const mode=await (await expect('/api/chat',200)).json();assert.ok(['ai','demo'].includes(mode.mode));
await expect('/api/chat',405,{method:'PUT'});
const post=body=>({method:'POST',headers:{'Content-Type':'application/json'},body});
for(const body of ['{','null','{}',JSON.stringify({message:12}),JSON.stringify({message:' '}),JSON.stringify({message:'x'.repeat(2001)})])await expect('/api/chat',400,post(body));
const chat=await (await expect('/api/chat',200,post(JSON.stringify({message:'opening hours'})))).json();
assert.ok(['ai','demo'].includes(chat.mode));assert.ok(chat.reply?.trim());if(chat.mode==='demo')assert.match(chat.reply,/10 AM to 9 PM/);
console.log(`PASS: ${count} HTTP checks (homepage, ${assets.length} build assets, 8 photos, 404, method handling, invalid chat payloads and assistant reply).`);
