import {redirect} from 'next/navigation';
import {legacySectionHref} from '../lib/navigation/navigation.mjs';
import LandingSite from '../components/landing/LandingSite';
export default async function Page({searchParams}){
 const params=await searchParams;const legacy=legacySectionHref(params.section,params);
 if(legacy)redirect(legacy);
 return <LandingSite/>;
}
