import assert from 'node:assert/strict';
import {fetchInProcess} from './inprocess.mjs';

const env = globalThis.__testEnv;
delete env.ROSTER;
delete env.LEGACY_CLASSROOM_ID;
const origin = 'https://test.local';
const request = (path, data, cookie) => fetchInProcess(origin + '/api/' + path, {
  method: data === undefined ? 'GET' : 'POST',
  headers: {'Content-Type': 'application/json', Origin: origin, 'X-Lantern-Request': '1', ...(cookie ? {Cookie: cookie} : {})},
  body: data === undefined ? undefined : JSON.stringify(data),
});

assert.equal((await (await request('status')).json()).platform, true);
const created = await request('classrooms/create', {
  school: '가상초등학교', label: '4학년 1반', password: 'test-teacher-password',
  code: 'test-class-code', students: [{number: 1, name: '가상학생'}],
});
assert.equal(created.status, 200);
const room = await created.json();
const path = 'status?class=' + room.id;
const anonymous = await (await request(path)).json();
assert.equal(anonymous.classroom?.id, room.id, 'class status must return the requested classroom without a legacy roster');
assert.equal(anonymous.session, null);
const login = await request('auth/teacher?class=' + room.id, {password: 'test-teacher-password'});
assert.equal(login.status, 200);
const cookie = login.headers.get('set-cookie').split(';')[0];
const authenticated = await (await request(path, undefined, cookie)).json();
assert.equal(authenticated.session?.role, 'teacher', 'class status must preserve the authenticated role');
assert.equal(authenticated.classroom.id, room.id);
assert.equal(authenticated.platform, undefined);
console.log('PASS: independent platform class status returns classroom and authenticated session');
