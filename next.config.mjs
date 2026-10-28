import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PHASE_DEVELOPMENT_SERVER} from 'next/constants.js';

export default phase=>({
  poweredByHeader: false,
  devIndicators: false,
  async headers(){return [{source:'/:path*',headers:[
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'X-Frame-Options',value:'DENY'},
    {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
    {key:'Content-Security-Policy',value:"frame-ancestors 'none'; object-src 'none'; base-uri 'self'"},
  ]}];},
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  // A production build must not overwrite a running development server's files.
  distDir: process.env.NEXT_DIST_DIR || (phase===PHASE_DEVELOPMENT_SERVER?'.next-dev':'.next'),
});
