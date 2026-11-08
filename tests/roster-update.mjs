import assert from 'node:assert/strict';
import {fetchInProcess} from './inprocess.mjs';
import {namePassword} from '../lib/lantern/domain.mjs';
const env=globalThis.__testEnv;let cookie='';
async function call(path,data){const r=await fetchInProcess('https://test.local/api/'+path,{method:data?'POST':'GET',headers:{'X-Lantern-Request':'1','Content-Type':'application/json',Origin:'https://test.local',Cookie:cookie},body:data?JSON.stringify(data):undefined});assert.equal(r.status,200,path+':'+await r.clone().text());if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return r.json();}
await call('auth/teacher',{password:env.TEACHER_PASSWORD});
const pw=await call('teacher/password',{id:'1'});
await call('auth/class',{code:env.CLASS_CODE});await call('auth/student',{id:'1',password:pw.password});
let m=await call('mine');await call('work',{work:{title:'saved work',body:'keep this',files:[]},revision:m.revision,submit:true});
const names=JSON.parse(env.ROSTER);names[0]='교정이름';names[1]='수정이름';names.push('교사용');env.ROSTER=JSON.stringify(names);env.ROSTER_VERSION='roster-v2';env.STUDENT_PASSWORD_VERSION='names-v2';
await call('auth/class',{code:env.CLASS_CODE});const rows=await call('students');assert.equal(rows.length,22);assert.equal(rows[0].name,names[0]);assert.equal(rows[1].name,names[1]);assert.equal(new Set(rows.map(r=>r.animal)).size,22);
await call('auth/student',{id:'1',password:namePassword(names[0])});m=await call('mine');assert.equal(m.submitted.title,'saved work');
await call('auth/teacher',{password:env.TEACHER_PASSWORD});const teacherSlot=await call('teacher/password',{id:'22'});await call('auth/class',{code:env.CLASS_CODE});await call('auth/student',{id:'22',password:teacherSlot.password});m=await call('mine');assert.equal(m.student_id,'22');
await call('work',{work:{title:'teacher trial',body:'trial submission',files:[]},revision:m.revision,submit:true});
console.log('PASS: roster corrections preserve work, name passwords, 22nd trial account submission, 22 unique animals');
