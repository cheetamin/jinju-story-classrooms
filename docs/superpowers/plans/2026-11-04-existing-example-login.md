# Existing teacher example login correction

The user clarified that the existing teacher example at the last numbered slot must accept `rytkdyd`, and the separate virtual demo is unwanted. Remove demo from all lists/login/guide and ignore its old sessions; retain stored old demo work privately to avoid unnecessary deletion. Keep existing real original teacher account and works. Include the existing shared read-only teacher example in student login choices; authenticate that numbered choice into an example-only student context, return its canonical published work in mine and reject all work/file mutations. Original real teacher example 22 remains its existing regular account and accepts the requested code. No new trial work or roster rows. Correct guides and select labels. Preserve feedback and all earlier features.

- [x] Update regressions: last numbered example correct/wrong password, original real22, original work preserved, demo denied, read-only writes and source attachment privacy.
- [x] Remove demo behavior; map shared example login/mine; show canonical work in Studio and existing last-number label.
- [x] Typecheck/full tests/build and independent review; publish original backend + CF/new development commit; verify original example login live and shared example in integration regressions.

Review fix: retired demo cookie must fall through to a valid viewer/teacher context. Regression reproduced 401 after reentry, fixed in session lookup in both backends; full suites run after fix.

Verification: typechecks, complete candidate suite/build and preserved class-example/session regressions/build passed. Original published version26 (614fb7f8b1b454992c85b58e9c2cdb5d205aa383); Cloudflare version e0b03d20-b8c5-47db-917d-2b649c8aa7ac. Live original last22 login opens existing work; no separate trial choice.
