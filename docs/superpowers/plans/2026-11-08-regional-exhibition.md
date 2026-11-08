# Regional Exhibition Implementation Plan
> **For agentic workers:** Use superpowers:executing-plans to implement task by task.
**Goal:** An independent multi-region animal lantern exhibition with per-classroom settings.
**Architecture:** Fork the validated classroom app into a separate project. Add a region and revision to classroom records; render contextual labels and retain authored content.
**Tech Stack:** React/Vinext, Workers, SQLite/D1.
**Spec:** docs/superpowers/specs/2026-11-08-regional-exhibition-design.md
## Global Constraints
- Existing Jinju site and database remain untouched. Animal lantern theme remains.
- No paid plans, R2 subscription, real student data or original authentication secrets.
## Review Focus
- Region whitespace/markup/oversize validation.
- Different classrooms must never see another region's settings/materials.
- Student/viewer cannot change region; concurrent teacher edits return conflict.
- Region rename preserves student drafts and authored lessons; teacher warned to review them.
- Generic regions contain no Jinju facts/images or linked original teacher work.
### Task 1: Region domain and persistence
Files: lib/lantern/region.mjs, chapters.mjs, example-data.mjs, learning-info.mjs, classroom-api.ts, drizzle/0005_classroom_region.sql, db/schema.ts; tests/region.test.mjs, tests/region-flow.mjs.
- [x] Write/run failing tests for region validation, generic/Jinju templates, creation/status, protected revision updates, class isolation, authored-content preservation.
- [x] Implement region helpers, migration, API metadata/settings, contextual lesson/example defaults. Run domain and in-process integration tests.
### Task 2: Classroom UI
Files: components/lantern/RegionContext.tsx, RegionSettings.tsx, ClassroomWizard.tsx, Gallery.tsx, Teacher.tsx, ChapterEditor.tsx, ChapterBook.tsx, JinjuInfo.tsx, shared.tsx, app/layout.tsx.
- [x] Connect contextual labels/prompts, required creation field, teacher region tab and authored-material warning.
- [x] Generalize only application copy, retain Jinju preset data, add safe lesson image URL editing. Run typecheck and existing suite.
### Task 3: Isolated deployment
Files: Worker entry/config and README.
- [ ] Remove original site proxy and inherited project/database identities. Build with fresh bindings, deploy only separate free environment, verify entry and two class regions.
- [ ] Review changed code, source privacy and production configuration; report literal deployment URL or exact blocker.
