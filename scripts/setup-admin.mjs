import {writeFile,mkdir} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import path from 'node:path';
import {createAdminAuth} from '../lib/admin-auth.mjs';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const auth=createAdminAuth();
if(await auth.configured()){
 console.log('Owner account already exists. It was not changed.');
}else{
 const email=process.env.ADMIN_SETUP_EMAIL||'owner@hairmasters.local';
 const password=process.env.ADMIN_SETUP_PASSWORD||randomBytes(18).toString('base64url');
 await auth.setup(email,password);
 const directory=path.join(process.cwd(),'.data');await mkdir(directory,{recursive:true});
 await writeFile(path.join(directory,'admin-login.json'),JSON.stringify({email,password,login:'http://localhost:3000/admin/login'},null,2),{mode:0o600});
 console.log('Owner account created. Open .data/admin-login.json locally for the login details.');
 console.log('The password is stored as a salted hash in the account store. No public registration is enabled.');
}
