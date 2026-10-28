import {readFile,writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import path from 'node:path';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const file=process.env.ADMIN_DATA_FILE||path.join(process.cwd(),'.data','admin-auth.json');
const output=path.join(process.cwd(),'.data','vercel-auth.env');
try{
 const {account}=JSON.parse(await readFile(file,'utf8'));
 if(!account)throw new Error('Run npm run admin:setup locally first.');
 // Reuse the already established account: no plaintext password export.
 await writeFile(output,'ADMIN_AUTH_ACCOUNT='+JSON.stringify(account)+'\nADMIN_SESSION_SECRET='+randomBytes(32).toString('base64url')+'\n',{flag:'wx',mode:0o600});
 console.log('Created private .data/vercel-auth.env. Add its two values to your hosting environment, set APP_ORIGIN to the live HTTPS origin, and redeploy. The existing owner email/password will work. Do not commit or share this file.');
}catch(error){
 console.error(error.code==='EEXIST'?'Private export already exists at .data/vercel-auth.env; it was not overwritten.':error.code==='ENOENT'?'No local owner account found. Run npm run admin:setup first.':error.message);
 process.exitCode=1;
}
