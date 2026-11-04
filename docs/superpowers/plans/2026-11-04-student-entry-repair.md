# Student Entry Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Accurate class entry, reliable student submission, and a teacher trial account in each class.

**Architecture:** Select separate role cookies with authenticated server contexts. Bind writes to an expected student id. Keep the trial as a virtual student/work in existing tables and preserve the original common example. Mirror backend fixes in the preserved original and relay only approved context/identity headers.

**Tech Stack:** React, TypeScript, Cloudflare Workers/D1, existing Sites backend.

**Spec:** docs/superpowers/specs/2026-11-04-student-entry-repair.md

## Global Constraints
- Preserve real class/student content and authentication hashes.
- Workers Free, existing DB/storage bindings only, main unchanged.
- No real student names or secrets in screenshots/reports/public source.

## Review Focus
- Student A editor must never write into student B's account after a tab switches users.
- Teacher login and repeated class entry must not overwrite active student context.
- Failed/expired auth must preserve unsaved work and require the same student's reauthentication.
- Demo files and submissions remain within their class and cannot alter the shared source example.
- Metadata loading never guesses a school/class or shows a numeric student name as a person.

### Task 1: Context authentication
- [x] Add regression test reproducing cookie role overwrite and student identity mismatch.
- [x] Add class-session helper, context headers, expected-student checks in both migrated backends.
- [x] Adapt original relay to multiple isolated role cookies and approved context headers; verify legacy-cookie compatibility.

### Task 2: Teacher trial
- [x] Test demo login, own draft/upload/submission, teacher approval, classroom isolation and real roster preservation.
- [x] Add virtual demo helper using CLASS:demo work records and profile data; expose only after explicit activation.
- [x] Add demo to Studio's login choice/guide; keep shared examples read-only and exclude demo from roster/password counts.

### Task 3: Loading and name display
- [x] Add authenticated profile to mine and use atomic Studio loading plus recovery modal.
- [x] Remove hardcoded metadata and display resolved school/class in entry and gallery.
- [x] Show real names; guide numeric-only roster correction without guessing identity.

### Task 4: Verify and publish
- [x] Run focused regressions, full relevant API suites and builds; fresh independent review.
- [x] Publish preserved original source with same DB/storage and public Worker through existing development branch.
- [x] Exercise demo lifecycle without editing real works; verify live class metadata and administrator access, save privacy-safe screenshots.

## Verification evidence
- Candidate typecheck, all 38 unit checks and all configured integration suites passed.
- Preserved backend typecheck, session/demo regressions, classroom/chapter/example/migration suites and build passed.
- Independent review found no correctness/security issues.
- Live Munsan 4-3 and original Geumho 4-4: correct school/class; teacher trial login; submission after parallel teacher login; teacher approval. Existing real students retained (16 / 21); names in both rosters are present rather than numeric-only.
- Added the teacher trial choice and compact instructions to the independent classroom entrance as well as Studio.
- Original deployed version 25, source f39a38f4a13042cb6eacab746b7f2b86fd7bb97f.
