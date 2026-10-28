import {notFound} from 'next/navigation';
import {brandNavigation} from '../../lib/navigation/navigation.mjs';
import LandingSite from '../../components/landing/LandingSite';
export function generateStaticParams(){return brandNavigation.map(([section])=>({section}));}
export async function generateMetadata({params}){const {section}=await params;const title=brandNavigation.find(([id])=>id===section)?.[1];return {title:title?`${title} | Hair Masters`:'Hair Masters'};}
export default async function BrandPage({params}){
 const {section}=await params;if(!brandNavigation.some(([id])=>id===section))notFound();
 return <LandingSite page={section}/>;
}
