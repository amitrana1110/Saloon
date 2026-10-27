import {cookies,headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {adminAuth,cookieName} from '../../lib/admin-auth.mjs';
import SalonApp from '../../components/SalonApp';
export const dynamic='force-dynamic';
export default async function AdminPage({searchParams}){
 const incoming=await headers();
 const name=cookieName(new Request('http://'+(incoming.get('host')||'localhost'),{headers:incoming}));
 const owner=await adminAuth.verify((await cookies()).get(name)?.value||'');
 if(!owner)redirect('/admin/login');
 const params=await searchParams;const allowed=['home','services','gallery','booking','saved','dashboard','media'];
 return <SalonApp adminMode ownerEmail={owner.email} initialPage={allowed.includes(params.section)?params.section:'dashboard'}/>;
}
