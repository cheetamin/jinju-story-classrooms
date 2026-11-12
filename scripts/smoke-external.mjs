import {spawn,spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const cli='node_modules/wrangler/bin/wrangler.js',config='dist/server/wrangler.json';
const migrated=spawnSync(process.execPath,[cli,'d1','migrations','apply','DB','--local','--config',config],{encoding:'utf8'});
if(migrated.status!==0)throw Error(migrated.stdout+migrated.stderr);
const child=spawn(process.execPath,[cli,'dev','--config',config,'--local','--ip','127.0.0.1','--port','8791','--inspector-port','0'],{stdio:['ignore','pipe','pipe']});
let logs='';child.stderr.on('data',b=>{logs+=b});
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server not ready: '+logs)),90000);child.stdout.on('data',b=>{logs+=b;if(logs.includes('Ready on')){clearTimeout(timer);resolve()}});child.once('exit',code=>{clearTimeout(timer);reject(Error('Server exited '+code+logs))})});
 const base='http://127.0.0.1:8791';
 for(const path of ['/','/gallery','/teacher?new=1','/studio?class=existing','/admin']){const r=await fetch(base+path);assert.equal(r.status,200);assert.ok((await r.text()).includes('/assets/index-'))}
 const status=await fetch(base+'/api/status');assert.equal(status.status,200);assert.equal((await status.json()).platform,true);
 const jars={};async function api(who,path,data,status=200){const r=await fetch(base+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{Origin:base,'X-Lantern-Request':'1','Content-Type':'application/json',Cookie:jars[who]||''},body:data===undefined?undefined:JSON.stringify(data)});const out=await r.json();assert.equal(r.status,status,path+': '+JSON.stringify(out));if(r.headers.get('set-cookie'))jars[who]=r.headers.get('set-cookie').split(';')[0];return out}
 const id=crypto.randomUUID();const input={school:'최적화검증초등학교',label:'검증용',region:'진주',password:'local-test-password',code:id,students:[{number:1,name:'가상학생'}]};
 const room=await api('t','classrooms/create',input);const suffix='?class='+room.id;
 await api('t','auth/teacher'+suffix,{password:input.password});
 await api('s','auth/class'+suffix,{code:id});await api('s','auth/student'+suffix,{id:'1',password:room.students[0].password});
 const mine=await api('s','mine'+suffix);const work={title:'복구 검증',body:'최적화 후 임시 저장 검증',files:[]};
 await api('s','work'+suffix,{work,revision:mine.revision});assert.equal((await api('s','mine'+suffix)).draft.title,work.title);
 await api('anon','mine'+suffix,undefined,401);
 assert.equal((await api('entry','classrooms/enter',{code:id})).href,'/gallery?class='+room.id);
 console.log('PASS built Worker: five static routes, API routing, class creation, teacher/student auth, draft persistence, private access and code entry');
}finally{child.kill('SIGTERM')}
