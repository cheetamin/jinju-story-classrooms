# Free-plan API CPU isolation

The public Worker keeps static asset delivery and the original Jinju relay. New-class D1 APIs are forwarded internally to a SQLite-backed Durable Object (`LanternApi`), with one execution identity per classroom and a separate platform identity. It runs the existing API handler with its unchanged D1 binding, password hashing, authorization, quotas and revision checks.

This addresses Error 1102 in new-class creation/login without lowering password hashing work. No new public endpoint, external processor, paid-plan switch, timers, or Durable Object storage calls are added. Classroom data and credentials stay in the existing stores; the coordinator does not persist them. No D1 migration is introduced. Wrangler's append-only `v1-lantern-api` migration registers the new SQLite-backed class.

Cloudflare documentation checked 2026-11-12:
- https://developers.cloudflare.com/workers/platform/limits/ — Free HTTP Worker CPU: 10 ms.
- https://developers.cloudflare.com/durable-objects/platform/limits/ — Durable Object CPU: 30 seconds by default.
- https://developers.cloudflare.com/durable-objects/platform/pricing/ — SQLite-backed objects supported on Workers Free; free request/duration/storage limits still apply, and exceeding free limits fails rather than enabling a paid plan.

Deployment command is unchanged: `npx wrangler deploy --config dist/server/wrangler.json`.

Local validation: 60 unit tests, the full integration suite, TypeScript, external build and the existing built-Worker smoke test passed. An additional 30-client local HTTP test passed individual login, 180,220-byte photo upload, save/reload checks, and byte integrity, then deleted its synthetic class and 30 files. These are local results, not a substitute for live verification.

Live acceptance uses only a fresh synthetic class on the public workers.dev origin. It must succeed in class creation, 30 distinct logins, 30 concurrent uploads and saves, saved-content/image checks, and test-data cleanup. `X-Lantern-Execution: coordinated-api` and `Server-Timing: lantern_api` identify the actual execution path. Credentials, cookies and test backups belong only in ignored mode-0600 recovery files, never Git.

The live test script requires explicit opt-in before sending any request:

```
LANTERN_LOAD_TEST_ORIGIN=https://jinju-story-trial-20261102.cheetamin.workers.dev \
LANTERN_ALLOW_LIVE_TEST=30-synthetic-students \
LANTERN_LOAD_TEST_PHOTO=/absolute/path/to/synthetic-test.webp \
python scripts/production-load-test.py
```

Never substitute a real classroom's credentials. Stop on failures and use only the generated recovery record to clean that run's synthetic class. No automatic POST retries are performed.
