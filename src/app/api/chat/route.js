import {answerQuestion,branch} from '../../../lib/data/salon.mjs';

const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const apiKey=()=>process.env.GROQ_API_KEY?.trim();

export async function GET(){
 return json({mode:apiKey()?'ai':'demo'});
}

function fallback(message,reason){
 const notices={
  not_configured:'Live AI is not configured. Using the FAQ assistant.',
  authentication:'Live AI is not configured correctly. Using the FAQ assistant.',
  quota:'Live AI has reached its usage limit. Using the FAQ assistant.',
  rate_limit:'Live AI is busy right now. Using the FAQ assistant.',
  configuration:'Live AI is unavailable with the current settings. Using the FAQ assistant.',
  unavailable:'Live AI is temporarily unavailable. Using the service guide.',
 };
 return json({reply:answerQuestion(message),mode:'demo',reason,notice:notices[reason]||notices.unavailable});
}

export async function POST(request){
 let body;
 try{body=await request.json();}catch{return json({error:'Invalid request.'},400);}
 if(!body||typeof body.message!=='string'||!body.message.trim()||body.message.length>2000){
  return json({error:'Please send a message of up to 2,000 characters.'},400);
 }
 const key=apiKey();
 if(!key)return fallback(body.message,'not_configured');
 try{
  const result=await fetch('https://api.groq.com/openai/v1/chat/completions',{
   method:'POST',
   headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
   body:JSON.stringify({
    model:process.env.GROQ_MODEL?.trim()||'openai/gpt-oss-20b',
    messages:[{role:'system',content:`You are the concise, friendly Hair Masters salon concierge. Verified branch facts: ${JSON.stringify(branch)}. Services listed: haircuts, styling, colouring, keratin, hair spa, facials, waxing, nails and bridal makeup. Displayed prices are starting estimates; the salon confirms final pricing. Appointment requests require staff confirmation. Never invent prices, ratings, stylists, availability, booking confirmations or treatment suitability. You cannot save or send bookings. Direct users to the booking interface to prepare a request, and to the branch phone for staff assistance. Do not ask for sensitive personal information in chat. Keep answers under 100 words. Use plain text without Markdown formatting.`,},
    {role:'user',content:body.message}],
    max_completion_tokens:1024,
    reasoning_effort:'low',
    include_reasoning:false,
   }),
   signal:AbortSignal.timeout(20000),
  });
  const data=await result.json().catch(()=>null);
  if(!result.ok){
   // Return only a fixed reason, never upstream error text (which can contain credentials).
   const code=data?.error?.code||data?.error?.type;
   const reason=result.status===401?'authentication':
    ['insufficient_quota','credit_balance_exhausted','billing_hard_limit_reached'].includes(code)?'quota':
    result.status===429?'rate_limit':
    [400,403,404].includes(result.status)?'configuration':'unavailable';
   return fallback(body.message,reason);
  }
  const reply=data?.choices?.[0]?.message?.content;
  if(typeof reply!=='string'||!reply.trim())return fallback(body.message,'unavailable');
  return json({reply:reply.trim(),mode:'ai'});
 }catch{
  return fallback(body.message,'unavailable');
 }
}
