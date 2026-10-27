import SalonApp from '../components/SalonApp';
export default async function Page({searchParams}){const params=await searchParams;const allowed=['home','services','gallery','booking','saved'];return <SalonApp initialPage={allowed.includes(params.section)?params.section:'home'}/>;}
