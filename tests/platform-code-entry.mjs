import assert from 'node:assert/strict';
import {fetchInProcess} from './inprocess.mjs';

delete globalThis.__testEnv.ROSTER;
const origin = 'https://test.local';
async function call(path, data, expected = 200, cookie = '') {
  const response = await fetchInProcess(origin + '/api/' + path, {
    method: data === undefined ? 'GET' : 'POST',
    headers: {'Content-Type': 'application/json', Origin: origin, 'X-Lantern-Request': '1', Cookie: cookie},
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const body = await response.json();
  assert.equal(response.status, expected, path + ': ' + JSON.stringify(body));
  return {response, body};
}
const input = {school: '가상초등학교', label: '4학년 1반', password: 'test-teacher-password', code: '강빛초12', students: [{number: 1, name: '가상학생'}]};
const a = (await call('classrooms/create', input)).body;
await call('classrooms/enter', {code: 'wrong-code'}, 401);
const entry = await call('classrooms/enter', {code: 'rkdqlcch12'});
assert.equal(entry.body.href, '/gallery?class=' + a.id);
assert.ok(entry.response.headers.get('set-cookie')?.includes('HttpOnly'));
assert.ok(entry.response.headers.get('set-cookie')?.includes('Secure'));
const cookie = entry.response.headers.get('set-cookie').split(';')[0];
const status = (await call('status?class=' + a.id, undefined, 200, cookie)).body;
assert.equal(status.session.role, 'viewer');
assert.equal(status.classroom.id, a.id);
assert.equal((await call('students?class=' + a.id, undefined, 200, cookie)).body[0].name, '1번 친구');
assert.ok(!JSON.stringify(entry.body).includes(input.code));

const teacherEntry=await call('classrooms/enter',{code:input.password});assert.equal(teacherEntry.body.href,'/teacher?class='+a.id);assert.equal(teacherEntry.body.role,'teacher');assert.ok(!JSON.stringify(teacherEntry.body).includes(input.password));
const {hashPassword}=await import('../lib/lantern/domain.mjs');const {namePassword}=await import('../lib/lantern/domain.mjs');const teacherName='가상쌤';await globalThis.__testEnv.DB.prepare('UPDATE classrooms SET teacher_password=? WHERE id=?').bind(await hashPassword(namePassword(teacherName)),a.id).run();assert.equal((await call('classrooms/enter',{code:teacherName})).body.href,'/teacher?class='+a.id);
const b = (await call('classrooms/create', {...input, school: '다른가상초등학교'})).body;
const ambiguous = await call('classrooms/enter', {code: 'rkdqlcch12'});
assert.deepEqual(new Set(ambiguous.body.choices.map(room => room.id)), new Set([a.id, b.id]));
assert.equal(ambiguous.body.href, undefined);
assert.equal(ambiguous.response.headers.get('set-cookie'), null);
const chosen = await call('classrooms/enter', {code: input.code, classId: b.id});
assert.equal(chosen.body.href, '/gallery?class=' + b.id);
await call('classrooms/enter', {code: input.code, classId: 'not-a-class'}, 401);
const foreign = await fetchInProcess(origin + '/api/classrooms/enter', {method: 'POST', headers: {Origin: 'https://foreign.test', 'X-Lantern-Request': '1'}, body: JSON.stringify({code: 'rkdqlcch12'})});
assert.equal(foreign.status, 403);
for (const id of [a.id, b.id]) await globalThis.__testEnv.DB.prepare('INSERT INTO settings(key,value) VALUES(?,?)').bind('class_archived:' + id, '1').run();
await call('classrooms/enter', {code: 'rkdqlcch12'}, 401);
console.log('PASS: code-only entry authenticates the right class, protects student names, handles shared codes, and rejects archived/foreign access');
