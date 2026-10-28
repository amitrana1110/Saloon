// Treat client-supplied history as untrusted conversation, never as instructions.
export function conversationHistory(value){
 if(!Array.isArray(value))return [];
 const turns=value.filter(turn=>turn&&['user','assistant'].includes(turn.role)&&typeof turn.content==='string'&&turn.content.trim()).slice(-10);
 let remaining=8000;const result=[];
 for(const turn of [...turns].reverse()){
  const content=turn.content.trim().slice(0,Math.min(2000,remaining));
  if(!content)break;result.unshift({role:turn.role,content});remaining-=content.length;
 }
 while(result[0]?.role==='assistant')result.shift();
 return result;
}
export function acknowledgementReply(message){
 if(/^(ok(?:ay|ey|y)?|alright|all right|got it|understood|sure|thank(?:s| you)|ty|great|perfect|cool)[\s.!🙏👍]*$/i.test(message.trim()))return 'You’re welcome. I’m here if you need anything else.';
 return null;
}
