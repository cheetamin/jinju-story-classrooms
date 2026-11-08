import fs from 'node:fs';import {spawnSync} from 'node:child_process';
await import('./check-independent-deploy.mjs');
const mode=process.argv[2]||'check';const config=JSON.parse(fs.readFileSync('wrangler.external.jsonc','utf8'));
if(config.r2_buckets?.length||config.vars?.FILE_STORAGE!=='d1')throw Error('무결제 시험 구성에는 R2 구독을 연결하지 않습니다.');
if(mode==='check'){console.log('D1-only configuration: no R2 subscription, small-file limits enforced.');process.exit(0)}
if(mode!=='deploy')throw Error('check 또는 deploy를 사용하세요.');
if(process.env.CONFIRM_WORKERS_FREE!=='yes')throw Error('대상 계정의 Workers Free 여부를 확인한 뒤 CONFIRM_WORKERS_FREE=yes를 설정하세요.');
if(config.d1_databases?.some(d=>d.database_id==='00000000-0000-4000-8000-000000000000'))throw Error('먼저 별도 시험용 D1 ID를 설정하세요. 현재 운영 DB ID를 사용하지 마세요.');
if(!fs.existsSync('dist/server/wrangler.json'))throw Error('먼저 npm run build:external을 실행하세요.');
const r=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy','--config','dist/server/wrangler.json'],{stdio:'inherit'});process.exit(r.status??1);
