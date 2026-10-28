export const brandNavigation=[['about','About'],['locations','Locations'],['women','Women’s services'],['men','Men’s services'],['franchise','Franchise'],['news','HM News'],['blogs','Blogs'],['contact','Contact']];
export const publicSections=['home','services','gallery','booking','saved',...brandNavigation.map(([id])=>id)];
export const salonSections=['home','services','gallery','booking','saved'];
export const bookingHref='/salon?section=booking';
// Marketing booking entry points open the customer Discover page.
export const bookingEntryHref='/salon?section=home';
export function legacySectionHref(section,params={}){
 if(brandNavigation.some(([id])=>id===section))return '/'+section;
 if(!salonSections.includes(section))return null;
 const query=new URLSearchParams({section});
 if(section==='services')for(const key of ['q','category'])if(typeof params[key]==='string'&&params[key])query.set(key,params[key].slice(0,100));
 return '/salon?'+query;
}
