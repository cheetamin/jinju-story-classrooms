import assert from 'node:assert/strict';
import {fetchInProcess} from './inprocess.mjs';
import {namePassword} from '../lib/lantern/domain.mjs';
const e=globalThis.__testEnv;let cookie='';
async function call(path,data,expected=200){const r=await fetchInProcess('https://test.local/api/'+path,{method:data?'POST':'GET',headers:{'X-Lantern-Request':'1','Content-Type':'application/json',Origin:'https://test.local',Cookie:cookie},body:data?JSON.stringify(data):undefined});assert.equal(r.status,expected,path);if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return r.json();}
await call('auth/teacher',{password:e.TEACHER_PASSWORD});
const old=await call('teacher/password',{id:'1'});
e.STUDENT_PASSWORD_VERSION='name-keyboard-v1';
await call('teacher/works');
const rows=await call('students');
const reset=await call('teacher/password',{id:'2'});assert.equal(reset.password,namePassword(rows[1].name));
await call('auth/class',{code:e.CLASS_CODE});
await call('auth/student',{id:'1',password:namePassword(rows[0].name)});
assert.equal((await call('mine')).student_id,'1');
console.log('PASS: existing student accounts migrate to name keyboard passwords; teacher reset matches; student login succeeds');
