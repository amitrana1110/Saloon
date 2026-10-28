import {randomBytes,createHash,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import path from 'node:path';
import {createJsonStore} from './json-store.mjs';
import {createEnvironmentAuth,ENV_SESSION_SECONDS} from './environment-auth.mjs';
import {AuthError} from './auth-error.mjs';
export {AuthError} from './auth-error.mjs';

const scrypt=promisify(scryptCallback);
export const SESSION_SECONDS=8*60*60;
const digest=value=>createHash('sha256').update(value).digest('hex');
export const environmentAuthEnabled=()=>Boolean(process.env.VERCEL||process.env.ADMIN_AUTH_ACCOUNT||process.env.ADMIN_SESSION_SECRET);
export function publicOrigin(request){
 if(process.env.APP_ORIGIN?.trim())return new URL(process.env.APP_ORIGIN.trim()).origin;
 const url=new URL(request.url);
 const protocol=request.headers.get('x-forwarded-proto')?.split(',')[0].trim()==='https'?'https:':url.protocol;
 return new URL(protocol+'//'+(request.headers.get('host')||url.host)).origin;
}
export function assertSameOrigin(request){
 const origin=request.headers.get('origin');
 const expected=publicOrigin(request);
 if(!origin||origin!==expected)throw new AuthError('This request is not allowed.',403);
 const type=request.headers.get('content-type')||'';
 if(!type.startsWith('application/json'))throw new AuthError('Send a JSON request.',415);
}
export function secureRequest(request){
 return new URL(publicOrigin(request)).protocol==='https:';
}
export function cookieName(request){return secureRequest(request)?'__Host-hm_admin':'hm_admin';}
export function sessionToken(request){
 const cookie=request.headers.get('cookie')||'';
 return cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName(request)+'='))?.slice(cookieName(request).length+1)||'';
}
export function sessionCookie(request,token,clear=false){
 return cookieName(request)+'='+token+'; Path=/; HttpOnly; SameSite=Strict; Max-Age='+(clear?0:environmentAuthEnabled()?ENV_SESSION_SECONDS:SESSION_SECONDS)+(secureRequest(request)?'; Secure':'');
}
export function assertLoginTransport(request){
 const hostname=new URL(publicOrigin(request)).hostname;
 if(!secureRequest(request)&&!['localhost','127.0.0.1','[::1]'].includes(hostname))throw new AuthError('Owner sign-in requires HTTPS.',403);
}
export function createAdminAuth(file=process.env.ADMIN_DATA_FILE||path.join(process.cwd(),'.data','admin-auth.json')){
 const store=createJsonStore(file,{account:null,sessions:[],failures:[]});
 async function setup(email,password){
  if(typeof email!=='string'||!/^\S+@\S+\.\S+$/.test(email)||typeof password!=='string'||password.length<16||password.length>256)throw new Error('Use a valid email and a password of 16–256 characters.');
  const salt=randomBytes(16).toString('hex');const hash=(await scrypt(password,salt,64)).toString('hex');
  return store.update(data=>{if(data.account)throw new Error('Owner account already exists. It was not changed.');return {data:{account:{email:email.trim().toLowerCase(),salt,hash},sessions:[],failures:[]},result:true};});
 }
 async function login(email,password,now=Date.now()){
  if(typeof email!=='string'||typeof password!=='string'||email.length>254||password.length>256)throw new AuthError('Email or password is incorrect.');
  return store.update(async data=>{
   if(!data.account)throw new AuthError('Owner login has not been configured.',503);
   data.failures=data.failures.filter(time=>now-time<15*60*1000);
   if(data.failures.length>=5)return {data,result:{error:'Too many failed attempts. Try again in 15 minutes.',status:429}};
   const candidate=await scrypt(password,data.account.salt,64);
   const valid=timingSafeEqual(candidate,Buffer.from(data.account.hash,'hex'))&&email.trim().toLowerCase()===data.account.email;
   if(!valid){data.failures.push(now);return {data,result:{error:'Email or password is incorrect.',status:401}};}
   data.failures=[];
   const token=randomBytes(32).toString('base64url');
   data.sessions=data.sessions.filter(s=>s.expires>now).slice(-19);
   data.sessions.push({hash:digest(token),expires:now+SESSION_SECONDS*1000});
   return {data,result:{token,email:data.account.email}};
  }).then(result=>{if(result.error)throw new AuthError(result.error,result.status);return result;});
 }
 async function verify(token,now=Date.now()){
  if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))return null;
  const data=await store.read();
  return data.account&&data.sessions.some(s=>s.hash===digest(token)&&s.expires>now)?{email:data.account.email,role:'owner'}:null;
 }
 async function logout(token){return store.update(data=>{data.sessions=data.sessions.filter(s=>s.hash!==digest(token));return {data,result:true};});}
 return {setup,login,verify,logout,async configured(){return Boolean((await store.read()).account);}};
}
const fileAuth=createAdminAuth(),environmentAuth=createEnvironmentAuth();
export const adminAuth=Object.fromEntries(['login','verify','logout','configured'].map(method=>[method,(...args)=>(environmentAuthEnabled()?environmentAuth:fileAuth)[method](...args)]));
adminAuth.setup=(...args)=>{if(environmentAuthEnabled())throw new AuthError('Configure owner access through the hosting environment.',503);return fileAuth.setup(...args);};
export async function requireOwner(request){
 const owner=await adminAuth.verify(sessionToken(request));
 if(!owner)throw new AuthError('Please sign in as the owner.',401);
 return owner;
}
export const publicAppointment=record=>{const {accessHash,...safe}=record;return safe;};
export const bookingTokenHash=token=>digest(token);
