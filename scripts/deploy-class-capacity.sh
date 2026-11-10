#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v node >/dev/null || { echo 'Node.js 24 이상 설치가 필요합니다.'; exit 1; }
node -e 'if(Number(process.versions.node.split(".")[0])<24)throw Error("Node.js 24 이상이 필요합니다.")'
node -e 'const c=JSON.parse(require("node:fs").readFileSync("wrangler.external.jsonc","utf8")); if(c.name!=="jinju-story-trial-20261102" || c.d1_databases[0].database_id!=="c3ca8832-2a2e-4d2a-aaaa-86296482c39e" || c.r2_buckets?.length)throw Error("배포 대상 구성이 다릅니다.")'
npx --yes pnpm@11.25.0 install --frozen-lockfile
npx --yes pnpm@11.25.0 test
npx --yes pnpm@11.25.0 typecheck
npx --yes pnpm@11.25.0 check:free
npx --yes pnpm@11.25.0 build:external
node node_modules/wrangler/bin/wrangler.js login
printf '\n진주 전용 사이트의 학급 제한을 100개로 확대하고 기존 Worker에 배포합니다.\n기존 학생·작품은 삭제하지 않습니다. 파일 저장 제한은 유지합니다.\n'
node node_modules/wrangler/bin/wrangler.js d1 execute DB --remote --config wrangler.external.jsonc --file drizzle/0005_expand_class_capacity.sql
CONFIRM_WORKERS_FREE=yes npx --yes pnpm@11.25.0 deploy:external
