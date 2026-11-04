# Exit Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Optional 1–5-heart farewell survey with private owner review.
**Architecture:** Central public Worker feedback API, D1 table, authenticated classroom resolution and session deduplication. Existing owner admin gate protects summaries/list. Optional farewell component and admin tab consume these endpoints.
**Tech Stack:** React/TypeScript, Workers, existing D1.
**Spec:** docs/superpowers/specs/2026-11-04-exit-feedback-design.md

## Global Constraints
- Preserve student records, works, credentials and free bindings; main unchanged.
- Feedback comments are plain text; 300 chars, no identity requested.
- Skip remains available; saving failure never discards comment or traps exit.

## Review Focus
- No class/session or spoofed metadata: reject before store.
- Preserved original and independent classrooms both reach the central owner.
- Retries cannot duplicate or silently change a response.
- Foreign origins, invalid hearts/oversized comments and capacity are bounded.
- Only owner can read comments; pagination includes every row exactly once.

### Task 1: Feedback backend and regression
**Files:** lib/lantern/feedback.mjs, lib/lantern/api.ts, lib/lantern/admin-api.ts, lib/lantern/preserved-proxy.mjs, tests/feedback.mjs, tests/feedback-preserved.test.mjs, tests/inprocess.mjs, scripts/test-all.mjs, drizzle/0004_exit_feedback.sql.
**Interfaces:** handleFeedback(request, env, send=fetch), listFeedback(db, cursor); POST /api/feedback consumes {hearts,comment?}, GET /api/admin/feedback?before=ID returns summary, rows, nextBefore.
- [x] Write tests for real class auth, validation, deduplication, owner-only read, pagination, preserved status authority; observe missing-route failure.
- [x] Implement table, verified scope/session receipt, guarded inserts and private list; bypass original proxy only for feedback.
- [x] Run focused regression and full suite.

### Task 2: Optional farewell and owner tab
**Files:** components/lantern/ExitFeedback.tsx, AdminFeedback.tsx, ExhibitionFarewell.tsx, Admin.tsx, app/globals.css.
- [x] Add hearts/optional comment, save/success/error and skip without losing farewell/reset.
- [x] Add admin satisfaction tab with counts/average/distribution and paginated anonymous comments.
- [x] Typecheck/build; independently review final change.

### Task 3: Publish and verify
- [x] Apply additive migration to existing trial D1, build/deploy free Worker, sync sanitized changed source to same development branch.
- [x] Live verify preserved and independent farewell, heart/optional comment send, skip/reset; owner-only review; capture privacy-safe screen.

## Final review and fixes
- Reviewer identified receipt selection from unverified fallback cookies. Regression failed for invalid aliases in both contexts; fixed by deriving receipts only from the exact validated token.
- Reviewer identified indefinite optional-exit blocking. Return now stays available during sending; sends also cancel after 15 seconds with a retryable message. Timeout regression added.
