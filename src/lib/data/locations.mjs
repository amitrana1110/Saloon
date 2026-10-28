import {matchesSearch,normalizeSearch} from '../search/search.mjs';

export const regionLabel=region=>region==='Madhya pradesh'?'Madhya Pradesh':region==='J&K'?'Jammu & Kashmir':region==='Coming soon'?'Opening soon':region;
const priority=['Noida','Delhi','Punjab'];
export function groupLocations(locations,{region='All',query=''}={}){
 const needle=normalizeSearch(query);
 const exactRegion=needle?Array.from(new Set(locations.map(x=>x.region))).find(id=>[id,regionLabel(id)].some(label=>normalizeSearch(label)===needle)):null;
 const groups=new Map();
 for(const location of locations){
  if(region!=='All'&&location.region!==region)continue;
  if(exactRegion?location.region!==exactRegion:!matchesSearch([location.name,location.region,regionLabel(location.region),location.address].join(' '),query))continue;
  if(!groups.has(location.region))groups.set(location.region,{id:location.region,label:regionLabel(location.region),locations:[]});
  groups.get(location.region).locations.push(location);
 }
 return [...groups.values()].sort((a,b)=>{
  if(a.id==='Coming soon')return 1;if(b.id==='Coming soon')return -1;
  const first=priority.indexOf(a.id),second=priority.indexOf(b.id);
  return (first<0?99:first)-(second<0?99:second)||a.label.localeCompare(b.label);
 });
}
