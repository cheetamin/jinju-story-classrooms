import assert from 'node:assert/strict';
import {fetchInProcess} from './inprocess.mjs';
import {digest} from '../lib/lantern/domain.mjs';
const e=globalThis.__testEnv;delete e.ROSTER;
e.PRESERVED_CLASS_CODE_HASH=await digest('test-preserved-class-code');
e.PRESERVED_TEACHER_CODE_HASH=await digest('test-preserved-teacher-code');
async function enter(code){return fetchInProcess('https://test.local/api/classrooms/enter',{method:'POST',headers:{Origin:'https://test.local','Content-Type':'application/json','X-Lantern-Request':'1'},body:JSON.stringify({code})});}
let response=await enter('test-preserved-class-code');
assert.equal(response.status,200,'the preserved class code must be recognized without copying the class into the trial DB');
let result=await response.json();assert.equal(result.handoff.role,'viewer');
assert.equal(result.handoff.action,'https://jinju-animal-lantern-class44.workspace-889499.chatgpt.site/api/entry-from-hub');
assert.equal(response.headers.get('set-cookie'),null);
assert.ok(!JSON.stringify(result).includes('test-preserved-class-code'));
response=await enter('test-preserved-teacher-code');result=await response.json();assert.equal(result.handoff.role,'teacher');
response=await enter('incorrect-code');assert.equal(response.status,401);
response=await fetchInProcess('https://test.local/api/classrooms/create',{method:'POST',headers:{Origin:'https://test.local','Content-Type':'application/json','X-Lantern-Request':'1'},body:JSON.stringify({school:'가상초등학교',label:'4학년 1반',password:'test-teacher-password',code:'test-preserved-class-code',students:[{number:1,name:'가상학생'}]})});
assert.equal(response.status,409,'new classrooms cannot reuse a preserved entry code');
console.log('PASS: preserved codes select only the original viewer/teacher login destination without exposing credentials or copying student data');
