# Jinju concurrent access verification — 2026-11-12

## Production read checks

Bounded, anonymous reads of `/studio` and `/api/status`, once per client at concurrency 1, 4, and 8: 26/26 HTTP 200. No production writes or student data were used. These endpoints do not exercise the original authenticated classroom backend. End-to-end times through the test environment were approximately 5.6–6.1 seconds, including network/proxy overhead; they are not a measurement of Worker CPU or classroom performance.

Three browser tabs opened the existing authenticated teacher-example studio concurrently and each displayed the existing work, with no captured console errors. These share one session, not three independent student accounts.

## Local built Worker, 21 virtual students

`node scripts/concurrent-smoke.mjs` uses only the local D1 database and local Worker. All 21 virtual students logged in, saved distinct drafts, reloaded them, submitted them, and had their work approved and verified. A simultaneous save using the same student's revision produced exactly one success and one 409 conflict.

| Phase | Local p95 milliseconds |
| --- | ---: |
| Class login | 462 |
| Student login | 495 |
| Work and roster load | 516 |
| Save including reading current revision | 370 |
| Draft reload | 187 |
| Submit including reading current revision | 240 |
| Approval including reading current revision | 351 |
| Publication check | 144 |

Local latency excludes real network distance, deployed D1 contention, original-backend relaying, and browser rendering. It does not establish that 21 production students can save within these times. Image uploads and sustained/high-volume traffic were not tested.

## Identified request overhead and fix

The studio header and page simultaneously requested the same login status twice. Share only a pending status request within the same page, class and student context; completed responses are never cached, and mutation requests invalidate pending sharing. Requests with abort signals bypass sharing. Errors clear the pending request.

After authentication, independent work and roster reads now start together. The initial page's API request count changes from four to three when the two status reads overlap, and the critical sequence changes from status → work → roster to status → parallel work/roster. This is a request-graph reduction, not a claim of a measured 25% wall-time reduction.

Validation: 54 unit tests, the full integration suite, TypeScript, static external build and the 21-client local smoke test passed. Production original-classroom routing remains unchanged.
