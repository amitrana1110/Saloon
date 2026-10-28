import {publicSections} from '../lib/navigation/navigation.mjs';
import SalonApp from '../components/layout/SalonApp';
export default async function Page({searchParams}){const params=await searchParams;const allowed=publicSections;return <SalonApp initialPage={allowed.includes(params.section)?params.section:'home'} initialCategory={typeof params.q==='string'&&params.q.trim()?'All':['All','Hair','Colour','Skin','Nails','Men','Bridal'].includes(params.category)?params.category:'All'} initialSearch={typeof params.q==='string'?params.q.slice(0,100):''}/>;}
