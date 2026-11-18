import assert from 'node:assert/strict';
import {fetchInProcess} from './inprocess.mjs';
const e=globalThis.__testEnv;
e.ADMIN_PASSWORD='reset-owner-password';
e.CREDENTIAL_VAULT_KEY='ab'.repeat(32);
const cookies={};
async function call(who,path,body,expected=200){
 const response=await fetchInProcess('https://test.local/api/'+path,{method:body===undefined?'GET':'POST',headers:{Origin:'https://test.local','X-Lantern-Request':'1','Content-Type':'application/json',Cookie:cookies[who]||''},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await response.json();
 assert.equal(response.status,expected,path+' '+JSON.stringify(data));
 if(response.headers.get('set-cookie'))cookies[who]=response.headers.get('set-cookie').split(';')[0];
 return data;
}
const initial={school:'재설정시험초등학교',label:'4학년 1반',password:'original-teacher-password',code:'original-class-code',students:[{number:1,name:'가상학생'}]};
const classroom=await call('create','classrooms/create',initial);
const suffix='?class='+classroom.id;
await call('teacher','auth/teacher'+suffix,{password:initial.password});
await call('student','auth/class'+suffix,{code:initial.code});
await call('student','auth/student'+suffix,{id:'1',password:classroom.students[0].password});
await call('guest','admin/teacher-password-reset',{classId:classroom.id,password:e.ADMIN_PASSWORD},401);
await call('teacher','admin/teacher-password-reset',{classId:classroom.id,password:e.ADMIN_PASSWORD},401);
await call('student','admin/teacher-password-reset',{classId:classroom.id,password:e.ADMIN_PASSWORD},401);
const other = await call('create','classrooms/create',{
 ...initial,school:'별도시험초등학교',password:'other-teacher-password',code:'other-class-code',
});
const otherSuffix = '?class='+other.id;
await call('other','auth/teacher'+otherSuffix,{password:'other-teacher-password'});
await call('other','admin/teacher-password-reset',{classId:classroom.id,password:e.ADMIN_PASSWORD},401);
await call('owner','admin/login',{password:e.ADMIN_PASSWORD});
await call('owner','admin/teacher-password-reset',{classId:classroom.id,password:'incorrect'},401);
const before=await e.DB.prepare('SELECT id,class_code,teacher_password FROM classrooms WHERE id=?').bind(classroom.id).first();
const studentBefore=(await e.DB.prepare('SELECT id,name,password FROM class_students WHERE class_id=?').bind(classroom.id).all()).results;
const workBefore=(await e.DB.prepare('SELECT student_id,draft,submitted,published FROM class_works WHERE student_id LIKE ?').bind(classroom.id+'%').all()).results;
const prepare = e.DB.prepare;
e.DB.prepare = query => {
 const statement = prepare(query);
 if (!query.startsWith('DELETE FROM class_sessions')) return statement;
 return {bind() { return {async run() { throw new Error('Simulated storage failure'); }}; }};
};
try {
 const failedReset = await fetchInProcess('https://test.local/api/admin/teacher-password-reset', {
  method:'POST', headers:{Origin:'https://test.local','X-Lantern-Request':'1',
   'Content-Type':'application/json',Cookie:cookies.owner},
  body:JSON.stringify({classId:classroom.id,password:e.ADMIN_PASSWORD}),
 });
 assert.equal(failedReset.status,503);
} finally {
 e.DB.prepare = prepare;
}
assert.deepEqual(await e.DB.prepare('SELECT id,class_code,teacher_password FROM classrooms WHERE id=?').bind(classroom.id).first(),before);
await call('teacher','teacher/works'+suffix);
let insertReached;
let resumeInsert;
const waitingForInsert = new Promise(resolve => { insertReached = resolve; });
const continueInsert = new Promise(resolve => { resumeInsert = resolve; });
e.DB.prepare = query => {
 const statement = prepare(query);
 if (!query.startsWith('INSERT INTO class_sessions(')) return statement;
 return {bind(...args) {
  const bound = statement.bind(...args);
  return {async run() {
   insertReached();
   await continueInsert;
   return bound.run();
  }};
 }};
};
const staleLogin = call('racing','auth/teacher'+suffix,{password:initial.password},401);
await waitingForInsert;
e.DB.prepare = prepare;
let reset;
try {
 reset=await call('owner','admin/teacher-password-reset',{classId:classroom.id,password:e.ADMIN_PASSWORD});
} finally {
 resumeInsert();
}
await staleLogin;
assert.ok(reset.newPassword.length>=16);
assert.notEqual(reset.newPassword,initial.password);
const after=await e.DB.prepare('SELECT id,class_code,teacher_password FROM classrooms WHERE id=?').bind(classroom.id).first();
assert.equal(before.id,after.id);
assert.equal(before.class_code,after.class_code);
assert.notEqual(before.teacher_password,after.teacher_password);
assert.deepEqual((await e.DB.prepare('SELECT id,name,password FROM class_students WHERE class_id=?').bind(classroom.id).all()).results,studentBefore);
assert.deepEqual((await e.DB.prepare('SELECT student_id,draft,submitted,published FROM class_works WHERE student_id LIKE ?').bind(classroom.id+'%').all()).results,workBefore);
assert.equal((await e.DB.prepare("SELECT COUNT(*) AS n FROM class_sessions WHERE class_id=? AND role='teacher'").bind(classroom.id).first()).n,0);
await call('teacher','teacher/works'+suffix,undefined,401);
await call('old','auth/teacher'+suffix,{password:initial.password},401);
await call('new','auth/teacher'+suffix,{password:reset.newPassword});
await call('student','mine'+suffix);
await call('viewer','auth/class'+suffix,{code:initial.code});
await call('other','teacher/works'+otherSuffix);
await call('otherNewSession','auth/teacher'+otherSuffix,{password:'other-teacher-password'});
const shown=await call('owner','admin/credentials',{classId:classroom.id,password:e.ADMIN_PASSWORD});
assert.equal(shown.teacherCode,reset.newPassword);
assert.equal(shown.classCode,initial.code);
console.log('PASS: owner-only teacher reset, old sessions invalidated, original class code, work and student identities retained');
