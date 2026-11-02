import assert from 'node:assert/strict';
import {fetchInProcess} from './inprocess.mjs';
import {hashPassword} from '../lib/lantern/domain.mjs';
const origin='https://test.local';let cookie='';
async function call(path,data,status=200){const r=await fetchInProcess(origin+'/api/'+path,{method:'POST',headers:{Origin:origin,'X-Lantern-Request':'1','Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(data)});assert.equal(r.status,status,path+' '+await r.clone().text());if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return r.json()}
const room=await call('classrooms/create',{school:'가상초등학교',label:'3학년 2반',password:'test-teacher-1234',code:'강빛초12',students:[{number:1,name:'시험학생'}]});
await call('auth/class?class='+room.id,{code:'rkdqlcch12'});
await call('auth/class?class='+room.id,{code:'강빛초 12'});
await call('auth/class?class='+room.id,{code:'강빛초 99'},401);
await call('auth/teacher?class='+room.id,{password:'test-teacher-1234'});
await call('teacher/settings?class='+room.id,{code:'평화초33'});
await call('auth/class?class='+room.id,{code:'vudghkch33'});
await call('auth/class?class='+room.id,{code:'평화초 33'});
await globalThis.__testEnv.DB.prepare('UPDATE classrooms SET class_code=? WHERE id=?').bind(await hashPassword('강빛초12'),room.id).run();
await call('auth/class?class='+room.id,{code:'rkdqlcch12'});
await call('auth/class',{code:globalThis.__testEnv.CLASS_CODE});
await globalThis.__testEnv.DB.prepare("UPDATE settings SET value=? WHERE key='class_code'").bind(await hashPassword('rkdqlcch12')).run();
await call('auth/class',{code:'강빛초 12'});
console.log('PASS: either layout works for created, updated and existing hashed class codes and the original gallery; wrong codes fail');
