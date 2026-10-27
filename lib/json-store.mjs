import {mkdir,readFile,open,writeFile,rename,unlink,stat} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

export function createJsonStore(file,initial){
 async function read(){try{return JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT')return structuredClone(initial);throw e;}}
 async function update(change){
  await mkdir(path.dirname(file),{recursive:true});let lock;
  for(let i=0;i<100;i++){
   try{lock=await open(file+'.lock','wx');break;}catch(e){
    if(e.code!=='EEXIST')throw e;
    try{if(Date.now()-(await stat(file+'.lock')).mtimeMs>30000)await unlink(file+'.lock');}catch(e){if(e.code!=='ENOENT')throw e;}
    await new Promise(resolve=>setTimeout(resolve,50));
   }
  }
  if(!lock)throw new Error('Account store is busy. Please try again.');
  const temporary=file+'.'+randomUUID()+'.tmp';
  try{const {data,result}=await change(await read());await writeFile(temporary,JSON.stringify(data,null,2),{mode:0o600});await rename(temporary,file);return result;}
  finally{await unlink(temporary).catch(()=>{});await lock.close();await unlink(file+'.lock').catch(()=>{});}
 }
 return {read,update};
}
