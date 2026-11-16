# Teacher direct editing

Goal: Teachers inspect and edit their own students' work without student login.
Approach: Reuse ChapterEditor inside Teacher, with teacher-only read/save endpoints in both legacy and class APIs. Preserve sessions, original storage, shared read-only examples and files. A revision check prevents overwriting concurrent student edits. Default opening source is the latest draft; allow explicitly choosing submitted/published versions before editing. Save updates draft and any existing submitted copy, retaining previous exhibition; publish explicitly validates and updates exhibition. Existing photo selection supported; teacher photo uploads use target student ownership and existing quotas.

- [x] API tests for teacher auth, class isolation, stale revisions, draft/submitted/published behavior, attachment ownership and example protection.
- [x] Shared service, legacy and classroom routes, preserved relay allowlist.
- [x] Teacher editor with source selector, title/body/chapters, photos, save and publish, unsaved-change confirmation.
- [ ] Run integration suite, typecheck, free-plan check and builds; review; push and deploy exact target plus original storage backend if needed.

Verification: complete test suite, typecheck, free-plan guard and external builds passed. Independent review found missing chapters on empty works and stale page state on source switching; both fixed. New tests cover teacher upload ownership. Original backend version 27 deployed successfully, commit 76b3200a5ab933f3c4137675098d9da17463ca8f. Public Cloudflare worker deployment remains pending: browser Google login returned generic unable-to-sign-in; CLI unauthenticated. GitHub write of existing classroom-api.ts rejected by auto-review for pre-existing public example password constant; no ref changed. Need explicit user approval or a separately approved removal/migration of that example credential before retry. Do not bypass rejection.

Follow-up: User explicitly approved preserving the pre-existing public read-only example code, but automatic review still rejected reposting. Safe alternative: EXAMPLE_ACCESS_CODE runtime setting replaces the literal. Set it to the existing example code in Cloudflare secrets before publishing; do not commit that value. Example fixtures now use a separate test-only code. Original backend remains on working version 27; public deployment is still pending.
