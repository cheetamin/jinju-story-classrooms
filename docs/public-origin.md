# Public classroom origin

Share https://jinju-story-trial-20261102.rkdrkals0227.workers.dev . The root entry form recognizes the preserved class codes and new independent classrooms. Preserved entry posts to the same origin at `/api/preserved-entry`; the original server verifies the credential. Gallery, studio, teacher, information cards and attachments stay on this public origin.

The existing class remains in its original Sites database and file storage. No student records or files were migrated into the independent trial D1. The public Worker relays only allowlisted original API routes to a fixed original backend. Original authorization and class scope remain enforced there. Preserved sessions use a separate HttpOnly, Secure, SameSite=Strict cookie that carries an allowed original cookie name plus its opaque token. New class URLs with a `class` query bypass this relay.

`ENTRY_HUB_ORIGIN` on the original must equal the public origin. A matching secret `ENTRY_HUB_RATE_SECRET` on both runtimes signs short-lived client rate identities; never commit its value. Both original legacy and migrated-class rate limiters verify the signature and otherwise use the normal Cloudflare IP. Credentials and request bodies must never be logged.

The preserved code dispatch uses `PRESERVED_CLASS_CODE_HASH` and `PRESERVED_TEACHER_CODE_HASH`. Preserved credential changes in the public UI are disabled and rejected by the relay: an operator must coordinate original credential and dispatch-hash updates. Changing credentials directly on the original site without updating these hashes can prevent public entry.

The public Worker remains Workers Free with its existing independent D1 binding and FILE_STORAGE=d1. No R2 binding, payment, or paid plan was added. It depends on the original backend remaining published and available.

Verification: proxy/identity unit tests cover origin protection, exact destination, cookie isolation including migrated class cookies, stale/forged IP signatures, safe redirects, expiry, settings protection and isolation from independent class URLs. Original hub authentication and classroom integration suites also pass. Browser verification must cover real preserved viewer and teacher entry, information images and attachment display without modifying student works.
