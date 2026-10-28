import {cookies,headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {adminAuth,cookieName} from '../../../lib/server/admin-auth.mjs';
import AdminLogin from '../../../components/auth/AdminLogin';
export const dynamic='force-dynamic';
export default async function LoginPage(){
 const incoming=await headers();
 const name=cookieName(new Request('http://'+(incoming.get('host')||'localhost'),{headers:incoming}));
 if(await adminAuth.verify((await cookies()).get(name)?.value||''))redirect('/admin');
 return <AdminLogin configured={await adminAuth.configured()}/>;
}
