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
 const count=21,id=crypto.randomUUID();
 const input={school:'동시접속시험초등학교',label:'로컬 가상21명',password:'local-concurrency-password',code:id,students:Array.from({length:count},(_,i)=>({number:i+1,name:'가상학생'+(i+1)}))};
 const room=await api('t','classrooms/create',input),suffix='?class='+room.id;
 await api('t','auth/teacher'+suffix,{password:input.password});
 const numbers=Array.from({length:count},(_,i)=>i+1),results=[];
 async function phase(name,fn){const times=[];await Promise.all(numbers.map(async n=>{const start=performance.now();await fn(n);times.push(performance.now()-start)}));times.sort((a,b)=>a-b);const row={phase:name,clients:count,p50ms:Math.round(times[Math.floor(times.length*.5)]),p95ms:Math.round(times[Math.ceil(times.length*.95)-1]),maxms:Math.round(times.at(-1))};results.push(row);console.log(JSON.stringify(row))}
 await phase('class-login',n=>api('s'+n,'auth/class'+suffix,{code:id}));
 await phase('student-login',n=>api('s'+n,'auth/student'+suffix,{id:String(n),password:room.students.find(s=>String(s.number||s.id)===String(n))?.password||room.students[n-1].password}));
 await phase('load',async n=>{const mine=await api('s'+n,'mine'+suffix);assert.equal(mine.profile.id,String(n));await api('s'+n,'students'+suffix)});
 await phase('save',async n=>{const mine=await api('s'+n,'mine'+suffix);await api('s'+n,'work'+suffix,{work:{title:'가상 작품 '+n,body:'동시 저장 확인용 가상 학생 '+n+'의 지역 소개 글입니다.',files:[]},revision:mine.revision})});
 await phase('reload-check',async n=>assert.equal((await api('s'+n,'mine'+suffix)).draft.title,'가상 작품 '+n));
 const shared=await api('s1','mine'+suffix);const conflict=await Promise.all([1,2].map(async k=>{const r=await fetch(base+'/api/work'+suffix,{method:'POST',headers:{Origin:base,'X-Lantern-Request':'1','Content-Type':'application/json',Cookie:jars.s1},body:JSON.stringify({work:{title:'충돌 검사 '+k,body:'동일 학생의 동시 수정 충돌을 확인하는 가상 내용입니다.',files:[]},revision:shared.revision})});return r.status}));assert.deepEqual(conflict.sort(),[200,409]);console.log('PASS same-student simultaneous edit: one save, one conflict; no silent overwrite');
 await phase('submit',async n=>{const mine=await api('s'+n,'mine'+suffix);await api('s'+n,'work'+suffix,{work:mine.draft,revision:mine.revision,submit:true})});
 await phase('teacher-approve',async n=>{const mine=await api('s'+n,'mine'+suffix);await api('t','teacher/review'+suffix,{id:String(n),revision:mine.revision,action:'approve'})});
 await phase('publication-check',async n=>{const rows=await api('s'+n,'students'+suffix);for(const number of numbers)assert.ok(rows.find(s=>s.id===String(number))?.published,'published work missing: '+number)});
 console.log('PASS 21 local concurrent virtual students: login, save, reload, submit, approval and publication; original database untouched');

}finally{child.kill('SIGTERM')}
