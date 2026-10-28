import {redirect} from 'next/navigation';
import {salonSections,brandNavigation} from '../../lib/navigation/navigation.mjs';
import SalonApp from '../../components/layout/SalonApp';
export const metadata={title:'Book your visit | Hair Masters'};
export default async function SalonPage({searchParams}){
 const params=await searchParams;
 if(brandNavigation.some(([id])=>id===params.section))redirect('/'+params.section);
 return <SalonApp initialPage={salonSections.includes(params.section)?params.section:'home'} initialCategory={typeof params.q==='string'&&params.q.trim()?'All':['All','Hair','Colour','Skin','Nails','Men','Bridal'].includes(params.category)?params.category:'All'} initialSearch={typeof params.q==='string'?params.q.slice(0,100):''}/>;
}
