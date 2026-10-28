import {cookies,headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {adminAuth,cookieName} from '../../lib/server/admin-auth.mjs';
import {publicSections} from '../../lib/navigation/navigation.mjs';
import SalonApp from '../../components/layout/SalonApp';
export const dynamic='force-dynamic';
export default async function AdminPage({searchParams}){
 const incoming=await headers();
 const name=cookieName(new Request('http://'+(incoming.get('host')||'localhost'),{headers:incoming}));
 const owner=await adminAuth.verify((await cookies()).get(name)?.value||'');
 if(!owner)redirect('/admin/login');
 const params=await searchParams;const allowed=[...publicSections,'dashboard','media'];
 return <SalonApp adminMode ownerEmail={owner.email} initialPage={allowed.includes(params.section)?params.section:'dashboard'} initialCategory={typeof params.q==='string'&&params.q.trim()?'All':['All','Hair','Colour','Skin','Nails','Men','Bridal'].includes(params.category)?params.category:'All'} initialSearch={typeof params.q==='string'?params.q.slice(0,100):''}/>;
}
