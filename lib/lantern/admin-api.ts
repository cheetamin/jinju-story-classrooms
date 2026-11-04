import {listFeedback} from './feedback.mjs';
import {revealCredential} from './credential-vault.mjs';
import {classBackup} from './class-backup.ts';
import {privateFile} from './private-file.ts';
import {readOperatingPolicy,validateOperatingPolicy,usageForClass} from './operations.mjs';
import {digest,randomToken,hashPassword,verifyPassword} from './domain.mjs';
type Env={FILE_STORAGE?:string;DB:D1Database;BUCKET:R2Bucket;ADMIN_PASSWORD?:string;CREDENTIAL_VAULT_KEY?:string};
const json=(data:unknown,status=200,headers:Record<string,string>={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow, noarchive',...headers}});
function fail(message:string,status=400):never{throw Object.assign(Error(message),{status})}
async function read(req:Request){const raw=await req.text();if(raw.length>8192)fail('요청이 너무 커요.',413);try{return JSON.parse(raw)}catch{fail('입력을 확인해 주세요.')}}
async function marker(e:Env,key:string){return (await e.DB.prepare('SELECT value FROM settings WHERE key=?').bind(key).first<{value:string}>())?.value}
async function authenticate(e:Env,req:Request,password:unknown){const key=await digest('admin-auth:'+ (req.headers.get('cf-connecting-ip')||'local')+':'+Math.floor(Date.now()/900000));await e.DB.prepare('INSERT INTO limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').bind(key,Date.now()+900000).run();if((await e.DB.prepare('SELECT count FROM limits WHERE key=?').bind(key).first<any>()).count>15)fail('시도가 많아요. 15분 후 다시 시도해 주세요.',429);if(typeof password!=='string'||!await verifyPassword(password,await hashPassword(e.ADMIN_PASSWORD!)))fail('전체 관리자 비밀번호를 확인해 주세요.',401)}
async function schoolData(e:Env,school:string,classId=''){const rooms=(await e.DB.prepare(`SELECT id,label,created FROM classrooms WHERE school=? AND (?='' OR id=?) ORDER BY id`).bind(school,classId,classId).all<any>()).results;if(!rooms.length)fail('학교를 찾을 수 없어요.',404);const protectedId=await marker(e,'legacy_classroom_migrated');const files=(await e.DB.prepare(`SELECT f.id,f.size,f.created FROM class_files f JOIN classrooms c ON c.id=f.class_id WHERE c.school=? AND (?='' OR c.id=?) ORDER BY f.id`).bind(school,classId,classId).all<any>()).results;const students=(await e.DB.prepare(`SELECT s.id,w.revision FROM class_students s JOIN classrooms c ON c.id=s.class_id LEFT JOIN class_works w ON w.student_id=s.id WHERE c.school=? AND (?='' OR c.id=?) ORDER BY s.id`).bind(school,classId,classId).all<any>()).results;return {school,rooms,files,students,protected:rooms.some(r=>r.id===protectedId),bytes:files.reduce((n,f)=>n+f.size,0),fingerprint:await digest(JSON.stringify({rooms,files,students}))}}
export async function handleAdmin(req:Request,e:Env){try{
 if(!e.ADMIN_PASSWORD)fail('전체 관리자 비밀번호 설정이 필요해요.',503);
 const url=new URL(req.url),path=url.pathname.replace('/api/admin/','');if(req.method!=='GET'&&(req.headers.get('X-Lantern-Request')!=='1'||req.headers.get('origin')&&req.headers.get('origin')!==url.origin))fail('허용되지 않은 요청이에요.',403);
 const token=req.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('lantern_admin='))?.slice('lantern_admin='.length);const session=token?await e.DB.prepare("SELECT token FROM sessions WHERE token=? AND role='admin' AND student_id=? AND expires>?").bind(await digest(token),await digest(e.ADMIN_PASSWORD),Date.now()).first<any>():null;
 if(path==='status'&&req.method==='GET')return json({authorized:!!session});
 const cookie=(raw:string,seconds:number)=>`lantern_admin=${raw}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}${url.protocol==='https:'?'; Secure':''}`;
 if(path==='login'&&req.method==='POST'){const b=await read(req);await authenticate(e,req,b.password);const raw=randomToken();await e.DB.prepare('INSERT INTO sessions(token,role,student_id,expires) VALUES(?,?,?,?)').bind(await digest(raw),'admin',await digest(e.ADMIN_PASSWORD),Date.now()+1800000).run();return json({ok:true},200,{'Set-Cookie':cookie(raw,1800)})}
 if(!session)fail('전체 관리자만 사용할 수 있어요.',401);
 if(path==='feedback'&&req.method==='GET')return json(await listFeedback(e.DB,url.searchParams.get('before')));
 if(path==='credentials'&&req.method==='POST'){
 if(url.searchParams.has('class'))fail('전체 관리자 화면에서 다시 확인해 주세요.',403);
 const b=await read(req);await authenticate(e,req,b.password);
 if(typeof b.classId!=='string'||!/^[a-f0-9-]{36}$/.test(b.classId))fail('학급을 선택해 주세요.');
 const room=await e.DB.prepare('SELECT id,school,label,class_code,teacher_password FROM classrooms WHERE id=?').bind(b.classId).first<any>();if(!room)fail('학급을 찾을 수 없어요.',404);
 if(await marker(e,'class_deleting:'+room.id))fail('정리 중인 학급이에요.',410);
 if(!e.CREDENTIAL_VAULT_KEY)fail('코드 확인을 위한 보안 설정이 필요해요.',503);
 return json({school:room.school,label:room.label,classCode:await revealCredential(e,room,'class'),teacherCode:await revealCredential(e,room,'teacher')});}
 if(path==='logout'&&req.method==='POST'){await e.DB.prepare('DELETE FROM sessions WHERE token=?').bind(session.token).run();return json({ok:true},200,{'Set-Cookie':cookie('',0)})}
 if(path==='backup'&&req.method==='GET')return json(await classBackup(e,url.searchParams.get('classId')||''));
 if(path.startsWith('files/')&&req.method==='GET'){const f=await e.DB.prepare('SELECT * FROM class_files WHERE id=?').bind(path.slice(6)).first<any>();if(!f)fail('파일을 찾을 수 없어요.',404);return await privateFile(req,e,f)}
 if(path==='policy'&&req.method==='GET'){const recent=await e.DB.prepare('SELECT COALESCE(SUM(count),0) AS attempts FROM limits WHERE expires>?').bind(Date.now()).first<any>();const reads=await e.DB.prepare('SELECT count FROM limits WHERE key=?').bind('file-read-day:'+new Date().toISOString().slice(0,10)).first<any>();return json({...await readOperatingPolicy(e),recentLimitedAttempts:recent.attempts,dailyFileReads:reads?.count||0})}
 if(path==='policy'&&req.method==='POST'){const b=await read(req);const current=await readOperatingPolicy(e);const policy=validateOperatingPolicy(b,current);if(b.classId){if(typeof b.classId!=='string'||!await e.DB.prepare('SELECT id FROM classrooms WHERE id=?').bind(b.classId).first())fail('학급을 찾을 수 없어요.',404);const scoped={uploadsPaused:policy.uploadsPaused,classBytes:policy.classBytes,classFiles:policy.classFiles};await e.DB.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('class_limits:'+b.classId,JSON.stringify(scoped)).run();}else await e.DB.prepare("INSERT INTO settings(key,value) VALUES('operating_policy',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(JSON.stringify(policy)).run();return json({ok:true})}
 if(path==='schools'&&req.method==='GET'){
 const protectedId=await marker(e,'legacy_classroom_migrated');
 const classes=(await e.DB.prepare("SELECT c.id,c.school,c.label,CASE WHEN s.key IS NULL THEN 0 ELSE 1 END AS pending,COALESCE(f.bytes,0) AS bytes,COALESCE(f.fileCount,0) AS fileCount,COALESCE(json_extract(l.value,'$.uploadsPaused'),0) AS uploadsPaused FROM classrooms c LEFT JOIN settings s ON s.key='class_deleting:'||c.id LEFT JOIN settings l ON l.key='class_limits:'||c.id LEFT JOIN (SELECT class_id,SUM(size) AS bytes,COUNT(*) AS fileCount FROM class_files GROUP BY class_id) f ON f.class_id=c.id ORDER BY c.school,c.label").all<any>()).results;
 const schools=(await e.DB.prepare('SELECT c.school,COUNT(*) AS classCount,COALESCE(SUM(u.studentCount),0) AS studentCount,COALESCE(SUM(f.fileCount),0) AS fileCount,COALESCE(SUM(f.bytes),0) AS bytes FROM classrooms c LEFT JOIN (SELECT class_id,COUNT(*) AS studentCount FROM class_students GROUP BY class_id) u ON u.class_id=c.id LEFT JOIN (SELECT class_id,COUNT(*) AS fileCount,SUM(size) AS bytes FROM class_files GROUP BY class_id) f ON f.class_id=c.id GROUP BY c.school ORDER BY c.school').all<any>()).results;
 return json(schools.map(row=>{const rooms=classes.filter(c=>c.school===row.school);return {...row,protected:rooms.some(c=>c.id===protectedId),pending:rooms.some(c=>c.pending),classes:rooms.map(c=>({id:c.id,label:c.label,bytes:c.bytes,fileCount:c.fileCount,uploadsPaused:!!c.uploadsPaused,protected:c.id===protectedId}))}}))}
 if(path==='preview'&&req.method==='POST'){const b=await read(req);if(typeof b.school!=='string')fail('학교를 선택해 주세요.');const d=await schoolData(e,b.school,typeof b.classId==='string'?b.classId:'');if(d.protected)fail('기존 계정·작품과 공통 예시를 보관하는 학교는 삭제 보호 중이에요.',403);const ticket=randomToken();const plan={school:d.school,classId:typeof b.classId==='string'?b.classId:'',fingerprint:d.fingerprint,expires:Date.now()+600000,admin:session.token};await e.DB.prepare('INSERT INTO settings(key,value) VALUES(?,?)').bind('admin_plan:'+await digest(ticket),JSON.stringify(plan)).run();return json({ticket,classId:plan.classId,school:d.school,classes:d.rooms.map(r=>r.label),studentCount:d.students.length,fileCount:d.files.length,bytes:d.bytes})}
 if(path==='delete'&&req.method==='POST'){const b=await read(req);await authenticate(e,req,b.password);if(typeof b.ticket!=='string')fail('삭제 대상을 다시 확인해 주세요.');const planKey='admin_plan:'+await digest(b.ticket),raw=await marker(e,planKey);if(!raw)fail('삭제 대상을 다시 확인해 주세요.',409);const plan=JSON.parse(raw);if(plan.admin!==session.token||plan.expires<Date.now())fail('삭제 확인이 만료됐어요. 대상을 다시 선택해 주세요.',409);if(b.confirmation!==plan.school)fail('학교 이름을 정확히 입력해 주세요.');const d=await schoolData(e,plan.school,plan.classId||'');if(d.protected)fail('삭제 보호 중인 학교예요.',403);if(d.fingerprint!==plan.fingerprint)fail('학교 자료가 변경됐어요. 삭제 범위를 다시 확인해 주세요.',409);
 await e.DB.batch(d.rooms.map(r=>e.DB.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('class_deleting:'+r.id,String(Date.now()))));
 try{if(e.FILE_STORAGE==='d1'){const ids=d.rooms.map(r=>r.id);await e.DB.prepare('DELETE FROM file_objects WHERE id IN (SELECT id FROM class_files WHERE class_id IN ('+ids.map(()=>'?').join(',')+'))').bind(...ids).run()}else for(let i=0;i<d.files.length;i+=100)await e.BUCKET.delete(d.files.slice(i,i+100).map(f=>f.id))}catch{fail('파일 정리를 완료하지 못했어요. 해당 학교의 접속을 차단해 두었으니 삭제 확인을 다시 진행해 주세요.',503)}
 const ids=d.rooms.map(r=>r.id),slots=ids.map(()=>'?').join(',');
 await e.DB.batch([
 e.DB.prepare(`DELETE FROM class_sessions WHERE class_id IN (${slots})`).bind(...ids),
 e.DB.prepare(`DELETE FROM class_works WHERE substr(student_id,1,36) IN (${slots})`).bind(...ids),
 e.DB.prepare(`DELETE FROM class_files WHERE class_id IN (${slots})`).bind(...ids),
 e.DB.prepare(`DELETE FROM class_students WHERE class_id IN (${slots})`).bind(...ids),
 e.DB.prepare(`DELETE FROM classrooms WHERE id IN (${slots})`).bind(...ids),
 e.DB.prepare(`DELETE FROM student_archives WHERE class_id IN (${slots})`).bind(...ids),
 e.DB.prepare(`DELETE FROM upload_reservations WHERE class_id IN (${slots})`).bind(...ids),
 e.DB.prepare(`DELETE FROM settings WHERE key IN (${slots})`).bind(...ids.map(id=>'class_deleting:'+id)),
 e.DB.prepare(`DELETE FROM settings WHERE key IN (${slots})`).bind(...ids.map(id=>'learning_info:'+id)),
 e.DB.prepare(`DELETE FROM settings WHERE key IN (${slots})`).bind(...ids.map(id=>'credential_vault:'+id+':class')),
 e.DB.prepare(`DELETE FROM settings WHERE key IN (${slots})`).bind(...ids.map(id=>'credential_vault:'+id+':teacher')),
 e.DB.prepare('DELETE FROM settings WHERE key=?').bind(planKey)]);return json({ok:true,school:d.school,deletedClasses:d.rooms.length,deletedFiles:d.files.length,freedBytes:d.bytes})}
 return json({error:'페이지를 찾을 수 없어요.'},404);
}catch(e:any){return json({error:e.status?e.message:'처리하지 못했어요. 잠시 후 다시 시도해 주세요.'},e.status||503)}}
