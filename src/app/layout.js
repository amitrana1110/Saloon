import './globals.css';
export const viewport={width:'device-width',initialScale:1,interactiveWidget:'resizes-content'};
export const metadata = {title:'Hair Masters | Your time to feel beautiful',description:'Hair Masters Luxury Salon in Sector 104, Noida. Explore hair, beauty and grooming services, find directions and request an appointment.'};
export default function RootLayout({children}) { return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"if(['home','services','gallery','booking','saved','about','locations','women','men','franchise','news','blogs','contact','dashboard','media'].includes(location.hash.slice(1)))document.documentElement.setAttribute('data-legacy-section','');"}}/></head><body>{children}</body></html>; }
