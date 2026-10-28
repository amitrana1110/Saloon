import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PHASE_DEVELOPMENT_SERVER} from 'next/constants.js';

export default phase=>({
  poweredByHeader: false,
  devIndicators: false,
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  // A production build must not overwrite a running development server's files.
  distDir: process.env.NEXT_DIST_DIR || (phase===PHASE_DEVELOPMENT_SERVER?'.next-dev':'.next'),
});
