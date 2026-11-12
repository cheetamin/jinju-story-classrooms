import {build} from 'vite';
import fs from 'node:fs';
// Pages are built once: no React/RSC renderer runs inside the public Worker.
await build({configFile:'vite.static.config.ts'});
await build({configFile:false,publicDir:false,build:{ssr:'worker/external.ts',outDir:'dist/server',emptyOutDir:true,minify:true,rollupOptions:{external:['cloudflare:workers'],output:{entryFileNames:'index.js'}}}});
const config=JSON.parse(fs.readFileSync('wrangler.external.jsonc','utf8'));
config.main='index.js';
config.assets={directory:'../client',binding:'ASSETS',not_found_handling:'single-page-application',run_worker_first:['/api','/api/*']};
config.d1_databases=config.d1_databases.map(db=>({...db,migrations_dir:'../../drizzle'}));
fs.writeFileSync('dist/server/wrangler.json',JSON.stringify(config,null,2)+'\n');
console.log('Independent static client and API Worker built; existing D1 binding and file quotas preserved.');
