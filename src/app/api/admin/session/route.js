import {adminAuth,assertSameOrigin,assertLoginTransport,sessionToken,sessionCookie,AuthError,ownerConfigurationIssue} from '../../../../lib/server/admin-auth.mjs';
export const runtime='nodejs';export const dynamic='force-dynamic';
const json=(body,status=200,headers={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});
const fail=e=>json({error:e instanceof AuthError?e.message:'Sign-in is unavailable. Please try again.'},e instanceof AuthError?e.status:500);
export async function GET(request){try{const owner=await adminAuth.verify(sessionToken(request));return json({authenticated:Boolean(owner),...(owner?{owner}:{}),configured:await adminAuth.configured(),...(ownerConfigurationIssue()?{configurationIssue:ownerConfigurationIssue()}:{})});}catch(e){return fail(e);}}
export async function POST(request){
 try{assertSameOrigin(request);assertLoginTransport(request);let body;try{body=await request.json();}catch{throw new AuthError('Enter your email and password.',400);}const result=await adminAuth.login(body?.email,body?.password);return json({authenticated:true,owner:{email:result.email,role:'owner'}},200,{'Set-Cookie':sessionCookie(request,result.token)});}catch(e){return fail(e);}
}
export async function DELETE(request){try{assertSameOrigin(request);await adminAuth.logout(sessionToken(request));return json({authenticated:false},200,{'Set-Cookie':sessionCookie(request,'',true)});}catch(e){return fail(e);}}
