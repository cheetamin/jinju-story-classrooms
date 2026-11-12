# Jinju production deployment

The existing `jinju-story-trial-20261102` Worker uses the `codex/public-trial-recovery-20261102` branch.

- Build: `npm run build:external`
- Deploy: `npx wrangler deploy --config dist/server/wrangler.json`
- Static client: `dist/client`
- API Worker: `dist/server/index.js`

Static pages do not run the React server renderer. `/api` and `/api/*` retain the original authenticated API handler. The existing D1 binding, runtime secrets and classroom content are preserved. No database migration is required for this performance change.

Validation: `npm test`, `npm run typecheck`, `npm run build:external`, `node scripts/smoke-external.mjs`. The smoke test creates fictional classrooms in the local database only.

For rollback, use the prior production version in Cloudflare's deployment history; keep the existing database and secrets.
