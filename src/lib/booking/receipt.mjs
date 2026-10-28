const key='hm-booking-receipt';
export function readReceiptHandle(storage){try{const value=JSON.parse(storage.getItem(key)||'null');return value&&/^[a-f0-9-]{36}$/i.test(value.id)&&/^[A-Za-z0-9_-]{43}$/.test(value.accessToken)?{id:value.id,accessToken:value.accessToken}:null;}catch{return null;}}
export function rememberReceipt(storage,appointment){storage.setItem(key,JSON.stringify({id:appointment.id,accessToken:appointment.accessToken}));}
export function forgetReceipt(storage){storage.removeItem(key);}
