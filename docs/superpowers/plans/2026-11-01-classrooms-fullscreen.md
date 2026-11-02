# Fullscreen festival and isolated classrooms
Goal: Reference-matched, viewport-filling exhibition with hidden controls; create independent school/class galleries without modifying legacy class44 data.
Architecture: Keep all existing tables and default endpoints. New additive classroom tables own class metadata, students, works, private files and sessions. Query parameter class=UUID selects server-side scoped API and survives all route links. Legacy class44 remains default. Classroom creation uses a teacher-supplied password and class code; it grants authority only over that new class, with rate limiting. No list of student data is public.
Tasks:
- Save current legacy snapshot (no password/session exports), preserve R2 keys and unchanged legacy source identifiers.
- Add classroom schema and explicit scoped API with same student/moderation contracts. Add isolation tests covering repeated student numbers, wrong-class sessions, file ownership and legacy preservation.
- Add teacher new-class wizard with school/class label and numbered roster. Return separate gallery/studio/teacher links.
- Redesign gallery viewport to a single festival stage, responsive camera on narrow devices, hidden side drawer and in-scene pixel title/buttons.
- Integrate original reference-matched raster background/sprite assets if available. Keep interactive art separate from backdrop.
- Validate migrations, API regressions, browser tablet/mobile and preservation snapshot; publish same site/audience.

Progress: Legacy22 accounts/22 works/5files and approvedteacher example confirmed; preservation metadata saved separately. Additive tables and explicit scoped API complete. New class wizard, query/file URL propagation and fullscreen scene complete. New backdrop/22animal atlas/visitor assets integrated. Final review found and fixed non-1 roster initialselection and centered phase forsmallclasses. Data/session/file isolation, original record invariance, chapter flow and11unitchecks passed. Browser desktop/390px scene, hidden drawer and class-specific links checked. New credentials not entered throughbrowser; server contracts tested withSQLite/R2adapter.
