import assert from 'node:assert/strict';
import {fetchInProcess} from './inprocess.mjs';
const e=globalThis.__testEnv;
const login=async password=>fetchInProcess('https://test.local/api/auth/teacher',{method:'POST',headers:{'X-Lantern-Request':'1','Content-Type':'application/json',Origin:'https://test.local'},body:JSON.stringify({password})});
assert.equal((await login(e.TEACHER_PASSWORD)).status,200);
e.TEACHER_PASSWORD='new-test-password';e.TEACHER_PASSWORD_VERSION='reset-test-1';
assert.equal((await login(e.TEACHER_PASSWORD)).status,200,'deployment reset should replace existing hash');
assert.equal((await login('test-teacher-password-2026')).status,401,'old password must stop working');
console.log('PASS: deployment password reset and old password rejection');
