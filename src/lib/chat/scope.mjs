export const scopeReply='I can help with Hair Masters services, hair and grooming, beauty care, appointments and salon directions. What would you like to know about your next visit?';

const salon=/\b(hair\w*|salon\w*|groom\w*|barber\w*|beard\w*|shav\w*|skin\w*|facial\w*|beauty|makeup|make-up|bridal|bride|wax\w*|threading|nail\w*|manicure|pedicure|keratin|balayage|colour\w*|color\w*|styling|scalp|dandruff|shampoo|conditioner|frizz|curls?|treatment\w*|appointment\w*|booking\w*|book|services?|prices?|pricing|cost|charges?|hours?|opening|closing|location\w*|address|directions?|parking|contact|phone|staff|stylist\w*|noida|delhi|punjab|franchise|lookbook)\b/i;
const unrelated=/\b(react|javascript|typescript|python|java|html|css|sql|coding|programming|code|algorithm\w*|debug\w*|software|api|next\.?js|node\.?js|homework|equation\w*|algebra|calculus|politic\w*|president|election\w*|cricket|football|stock\w*|crypto\w*|bitcoin|investment\w*|recipe\w*|weather|poem\w*|essay\w*|translate|translation)\b/i;
const greeting=/^(hi|hello|hey|namaste|good (morning|afternoon|evening)|help|help me)[\s!?.]*$/i;
const followup=/^(and\b|what about\b|how (much|long|often)\b|which (one|is better)\b|can (i|you)\b|is (it|that)\b|does (it|that)\b|do you\b|tell me more\b|yes\b|no\b|please\b|why\b|when\b|where\b|what do you recommend\b)/i;

// Apply before either the model or FAQ fallback. History never exempts an
// explicitly unrelated request, and only customer turns establish context.
export function isSalonQuestion(message,history=[]){
 const text=message.trim();
 if(unrelated.test(text))return false;
 if(salon.test(text)||greeting.test(text))return true;
 const previous=[...history].reverse().find(turn=>turn.role==='user');
 return Boolean(previous&&salon.test(previous.content)&&!unrelated.test(previous.content)&&followup.test(text));
}
