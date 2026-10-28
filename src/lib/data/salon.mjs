export const branch = {name:'Hair Masters',location:'Sector 104, Noida',address:'Shop 110, Ground Floor, Hazipur, Sector 104, Noida, Uttar Pradesh 201304',mapsUrl:'https://www.google.com/maps/dir//Shop+110,+Ground+Floor,+Hair+Masters+Luxury+Salon+-+Noida+104,+Hazipur,+Sector+104,+Noida,+Uttar+Pradesh+201304/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0x390ce775598cd617:0x2800c87561b7ff96',phone:'9045673033',hours:'Every day, 10 AM – 9 PM'};
export const services = [
{id:'cut',imageUrl:'/images/original/work-5.webp',name:'Signature haircut',category:'Hair',price:799,duration:45,image:'hero',description:'A fresh shape, a thoughtful consultation, and a finish that feels like you.'},
{id:'color',imageUrl:'/images/original/work-3.webp',name:'Balayage & colour',category:'Colour',price:3499,duration:150,image:'color',description:'Soft dimension and beautifully blended tones, tailored to your hair.'},
{id:'spa',imageUrl:'/images/original/noida-1.webp',name:'Restorative hair spa',category:'Hair',price:1499,duration:60,image:'hair',description:'A moment to unwind while your hair gets a little extra attention.'},
{id:'facial',imageUrl:'/images/original/work-2.webp',name:'Glow facial ritual',category:'Skin',price:1999,duration:60,image:'skin',description:'A personalised skincare consultation and a refreshing facial ritual.'},
{id:'nails',imageUrl:'/images/original/noida-1.webp',name:'Manicure & pedicure',category:'Nails',price:1299,duration:75,image:'nails',description:'Beautifully cared-for hands and feet with an immaculate finish.'},
{id:'men',imageUrl:'/images/original/men-0.webp',name:'Men’s cut & styling',category:'Men',price:599,duration:30,image:'men',description:'Precision shaping and effortless styling for your everyday look.'},
{id:'keratin',imageUrl:'/images/original/women-0.webp',name:'Keratin consultation',category:'Hair',price:4499,duration:180,image:'salon',description:'Explore smoothing options with a stylist before choosing your treatment.'},
{id:'bridal',imageUrl:'/images/original/work-0.webp',name:'Bridal beauty consultation',category:'Bridal',price:null,duration:45,image:'bridal',description:'Plan your wedding-day makeup, hair, and preparation with the team.'}
];
export const money = value => value == null ? 'On consultation' : `₹${value.toLocaleString('en-IN')}`;
export function whatsappMessage(booking) { return `Hello Hair Masters Sector 104, Noida. I would like to request an appointment.\nService: ${booking.service}\nPreferred date: ${booking.date}\nPreferred time: ${booking.time}\nName: ${booking.name}\nPhone: ${booking.phone}\nPlease confirm availability and the actual price.`; }
export function answerQuestion(input) {
 const q=input.toLowerCase();
 if (/price|cost|charge|₹|rate/.test(q)) return 'The menu lists starting prices. Your final quote depends on the treatment and your hair or skin needs. Call +91 9045673033 to confirm pricing.';
 if (/open|close|hour|sunday|timing/.test(q)) return 'The Sector 104 branch lists opening hours of 10 AM to 9 PM, Monday through Sunday. Please call the branch to check holiday hours.';
 if (/where|address|location|parking|direction/.test(q)) return `Find us at ${branch.address}. Parking details are not verified; please call the branch before visiting.`;
 if (/book|appointment|slot|available|tomorrow/.test(q)) return 'I can help you request an appointment. Choose Book appointment, select your treatments and an available time, then submit your request. Salon staff must confirm before the time is reserved. You can optionally share the request on WhatsApp.';
 if (/bridal|wedding/.test(q)) return 'The branch lists bridal and special-occasion services. Request a consultation so the team can confirm your look, schedule, and quote.';
 if (/\b(hair|haircut|haircuts|skin|facial|facials|nail|nails|service|services|keratin|colour|color|men)\b/.test(q)) return 'The branch lists haircuts, styling, colour, keratin, hair spa, facials, waxing, manicures, pedicures, and makeup services for men and women. Treatment suitability and final prices should be confirmed with a stylist.';
 if (/hi\b|hello|hey|thanks/.test(q)) return 'Hello! Welcome to Hair Masters. Ask about services, hours, location, or how to request an appointment.';
 return 'I don’t have verified information about that. Please speak with the Sector 104 team on +91 9045673033. I can also help with services, opening hours, directions, and appointment requests.';
}
