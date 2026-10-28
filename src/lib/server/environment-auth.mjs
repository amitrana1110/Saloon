import {createHmac,createHash,randomBytes,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {AuthError} from './auth-error.mjs';

const scrypt=promisify(scryptCallback);
export const ENV_SESSION_SECONDS=60*60;
// Serverless deployments cannot share a local account/session file.
export function createEnvironmentAuth(environment=process.env){
 const failures=[];
 const revoked=new Map();
 function configuration(){
  try{
   const account=JSON.parse(environment.ADMIN_AUTH_ACCOUNT||'null');
   const secret=environment.ADMIN_SESSION_SECRET;
   if(!account||typeof account.email!=='string'||!/^\S+@\S+\.\S+$/.test(account.email)||!/^[a-f0-9]{32}$/i.test(account.salt)||!/^[a-f0-9]{128}$/i.test(account.hash)||typeof secret!=='string'||!/^[A-Za-z0-9_-]{43,}$/.test(secret))return null;
   return {account,secret,version:createHash('sha256').update(JSON.stringify(account)).digest('hex')};
  }catch{return null;}
 }
 const signature=(body,secret)=>createHmac('sha256',secret).update(body).digest('base64url');
 async function login(email,password,now=Date.now()){
  const config=configuration();if(!config)throw new AuthError('Owner access is not configured on this deployment.',503);
  if(typeof email!=='string'||typeof password!=='string'||email.length>254||password.length>256)throw new AuthError('Email or password is incorrect.');
  while(failures.length&&now-failures[0]>=15*60*1000)failures.shift();
  if(failures.length>=5)throw new AuthError('Too many failed attempts. Try again in 15 minutes.',429);
  // Count in-flight attempts as well, so parallel requests share the local limit.
  failures.push(now);
  const hash=await scrypt(password,config.account.salt,64);
  if(!timingSafeEqual(hash,Buffer.from(config.account.hash,'hex'))||email.trim().toLowerCase()!==config.account.email.toLowerCase())throw new AuthError('Email or password is incorrect.');
  failures.length=0;
  const body=Buffer.from(JSON.stringify({email:config.account.email,version:config.version,iat:now,exp:now+ENV_SESSION_SECONDS*1000,nonce:randomBytes(16).toString('hex')})).toString('base64url');
  return {token:body+'.'+signature(body,config.secret),email:config.account.email};
 }
 async function verify(token,now=Date.now()){
  const config=configuration();if(!config||typeof token!=='string'||token.length>2048)return null;
  for(const [value,expiry] of revoked)if(expiry<=now)revoked.delete(value);
  if(revoked.has(token))return null;
  const [body,sig,extra]=token.split('.');if(extra!==undefined||!body||!/^[A-Za-z0-9_-]{43}$/.test(sig||''))return null;
  if(!timingSafeEqual(Buffer.from(sig),Buffer.from(signature(body,config.secret))))return null;
  try{
   const payload=JSON.parse(Buffer.from(body,'base64url').toString());
   if(payload.email!==config.account.email||payload.version!==config.version||!Number.isFinite(payload.exp)||!Number.isFinite(payload.iat)||payload.iat>now||payload.exp<=now||payload.exp-payload.iat!==ENV_SESSION_SECONDS*1000)return null;
   return {email:config.account.email,role:'owner'};
  }catch{return null;}
 }
 async function logout(token){if(await verify(token)){const payload=JSON.parse(Buffer.from(token.split('.')[0],'base64url').toString());revoked.set(token,payload.exp);}}
 return {login,verify,logout,async configured(){return Boolean(configuration());}};
}
