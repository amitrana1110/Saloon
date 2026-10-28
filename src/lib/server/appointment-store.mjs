import {mkdir,readFile,writeFile,rename,open,unlink,stat} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {BookingError,prepareAppointment,updateAppointment,sortAppointments} from '../booking/appointments.mjs';

export function createAppointmentStore(file=process.env.APPOINTMENTS_DATA_FILE||path.join(process.cwd(),'.data','appointments.json')){
 async function read(){
  try{
   const rows=JSON.parse(await readFile(file,'utf8'));
   if(!Array.isArray(rows))throw new Error('Invalid appointment store');
   return rows;
  }catch(error){if(error.code==='ENOENT')return [];throw error;}
 }
 async function transaction(change){
  await mkdir(path.dirname(file),{recursive:true});
  const lockFile=`${file}.lock`;
  let lock;
  for(let attempt=0;attempt<100;attempt++){
   try{lock=await open(lockFile,'wx');break;}catch(error){
    if(error.code!=='EEXIST')throw error;
    try{if(Date.now()-(await stat(lockFile)).mtimeMs>30000)await unlink(lockFile);}catch(e){if(e.code!=='ENOENT')throw e;}
    await new Promise(resolve=>setTimeout(resolve,50));
   }
  }
  if(!lock)throw new BookingError('The schedule is busy. Please try again.',503);
  const temporary=`${file}.${randomUUID()}.tmp`;
  try{
   const rows=await read();
   const {appointments,result}=change(rows);
   await writeFile(temporary,JSON.stringify(appointments,null,2),'utf8');
   await rename(temporary,file);
   return result;
  }finally{
   await unlink(temporary).catch(()=>{});
   await lock.close();
   await unlink(lockFile).catch(()=>{});
  }
 }
 return {
  async list(){return sortAppointments(await read());},
  async create(body,now=new Date()){
   return transaction(rows=>{
    const accessToken=randomBytes(32).toString('base64url');
    const record={id:randomUUID(),...prepareAppointment(body,rows,now),accessHash:createHash('sha256').update(accessToken).digest('hex')};
    return {appointments:[...rows,record],result:{...record,accessToken}};
   });
  },
  async changeStatus(id,status,now=new Date()){
   return transaction(rows=>{const appointments=updateAppointment(rows,id,status,now);return {appointments,result:appointments.find(a=>a.id===id)};});
  },
 };
}
