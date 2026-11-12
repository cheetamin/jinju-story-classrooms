# Thirty concurrent students — existing Jinju classroom backend

Date: 2026-11-12 (Korea).

## Scope and results

Thirty distinct synthetic student accounts were created in a separate class on the original Jinju storage service (`jinju-animal-lantern-class44.workspace-889499.chatgpt.site`), which is the backend relayed by the public Jinju origin for existing original-class sessions. No existing classroom was edited.

Each phase used thirty concurrent requests. All thirty accounts completed class entry, individual login, authenticated work reads, upload of a valid synthetic WebP (180,220 bytes), draft saving with the uploaded image ID, draft reload verification, and a downloaded-photo SHA-256 integrity check. All 210 phase operations succeeded. The save phase also fetched each student's current revision before writing.

Client p95 timings were 7.99 s (class entry), 7.57 s (student entry), 8.38 s (work read), 9.29 s (photo upload), 8.79 s (save request), 7.06 s (saved-content read), and 8.06 s (photo download). These include the executor's outbound network/proxy overhead and must not be reported as school-device performance.

A bounded read of production Worker logs after the run showed 30 work writes with no server errors and p95 internal wall time 318 ms; 30 file reads had no server errors and p95 internal wall time 371 ms. Internal timings exclude browser compression, the public-origin relay, and user-network transfer. The direct-backend test does not prove thirty full browser sessions have zero input/rendering lag.

A separate attempt using a fresh class in the external D1-only Worker encountered Error 1102 during class login, and another attempt during class creation. Those attempts did not reach image uploading; a created external test class was backed up and deleted. Do not conflate the original-backend success with proof that the external new-class path can handle the same work. The remaining CPU limit requires separate backend work or a separately authorized hosting change; this client optimization does not claim to remove it.

The older original backend has no teacher delete-class endpoint. Synthetic photos are being removed through their own student accounts; the separate test class is then archived when that backend supports it. Only synthetic test credentials and backups are retained in ignored, mode-0600 recovery files. Never commit them.

## Deployed client improvements

- An authenticated student editor now uses its authoritative own profile returned by `mine` and avoids downloading the entire class roster and published work. Older backends without a profile retain a roster fallback, and viewers/teachers retain their login choices.
- Image upload encoding now aims for 128 KiB on the student's device, first adjusting WebP quality, then reducing maximum dimensions from 1600 to 1280 to 1024 if necessary. Small images within the existing resolution limit pass through. The target is soft to avoid unlimited quality loss; the fallback stays within the existing 1 MiB D1 file limit. This is not a blanket size guarantee for every image.
- Password verification, student/session isolation, file permissions, the original backend relay and the database bindings are unchanged.

Validation: 57 unit tests, the complete integration suite, TypeScript and external static/API build passed. Photo encoder tests use a controlled browser encoder double; the server upload test uses actual WebP bytes.
