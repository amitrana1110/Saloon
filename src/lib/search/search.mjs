export const normalizeSearch=value=>String(value??'').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[’']/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function matchesSearch(value,query=''){const text=normalizeSearch(value);return normalizeSearch(query).split(' ').filter(Boolean).every(word=>text.includes(word));}
