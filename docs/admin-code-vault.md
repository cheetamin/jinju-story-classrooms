# Admin classroom code viewing

Registered independent Cloudflare classrooms expose their shared class-entry code and teacher-management code only through POST /api/admin/credentials. The endpoint requires a valid admin session, the current admin password again, the normal request header/origin checks, and a non-deleting classroom id. Lists, teacher/student responses, and backups do not include these plaintext values.

Provision CREDENTIAL_VAULT_KEY as a separate random 32-byte hex Cloudflare secret. Never commit its value. Each class/kind record is AES-256-GCM encrypted with a fresh 12-byte nonce. Additional authenticated data binds classroom id, credential kind, and a fingerprint of the current login hash. The secret is independent of ADMIN_PASSWORD, so admin-password changes do not alter ciphertext access.

Old irreversible hashes cannot be decoded. A new class, valid class entry/teacher login, or teacher settings change captures the known credential. Failed logins do not capture anything. Current-hash and deletion-marker checks reject stale writes. Failed capture never interrupts successful login; the admin sees a missing record instead. Key replacement makes old records unreadable until captured again. Preserve this key through routine deployments.

The UI clears reauthentication input, removes visible codes after 90 seconds, and unmounts on close or admin logout. Classroom and school deletion remove both vault rows. No live existing codes were reset or recovered during deployment.

The preserved original classroom remains in its separate backend; this vault covers classrooms registered in the independent public platform's database.
