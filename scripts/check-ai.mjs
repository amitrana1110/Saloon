import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const key=process.env.GROQ_API_KEY?.trim();
if(!key){
 console.log('No GROQ_API_KEY was found in the project environment.');
 process.exitCode=1;
}else{
 try{
  const result=await fetch('https://api.groq.com/openai/v1/chat/completions',{
   method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
   body:JSON.stringify({model:process.env.GROQ_MODEL?.trim()||'openai/gpt-oss-20b',messages:[{role:'user',content:'Reply with Hello only.'}],max_completion_tokens:512,reasoning_effort:'low',include_reasoning:false}),
   signal:AbortSignal.timeout(20000),
  });
  const data=await result.json();
  if(result.ok&&data.choices?.some(c=>c.message?.content?.trim())){
   console.log('PASS: Groq accepted the configured key and returned a live response.');
  }else{
   const code=data.error?.code||data.error?.type;
   const explanation=result.status===401?'Groq rejected the configured API key.':
    ['insufficient_quota','credit_balance_exhausted'].includes(code)?'The API account has insufficient quota or credits.':
    result.status===429?'The API is rate limited.':
    [400,403,404].includes(result.status)?'Check model access, permissions and API settings.':'No usable AI response was returned.';
   console.log(`FAIL (HTTP ${result.status}): ${explanation}`);
   process.exitCode=1;
  }
 }catch{
  console.log('FAIL: Could not reach Groq within the request timeout.');
  process.exitCode=1;
 }
}
