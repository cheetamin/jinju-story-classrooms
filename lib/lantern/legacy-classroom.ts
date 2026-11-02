import {normalizeClassCode,hashClassCode,verifyClassCode} from './class-code.mjs';
import {hashPassword} from './domain.mjs';
type LegacyEnvironment={DB:D1Database;LEGACY_CLASSROOM_ID?:string;LEGACY_SCHOOL?:string;LEGACY_CLASS_LABEL?:string;LEGACY_TEACHER_PASSWORD?:string;LEGACY_CLASS_CODE?:string};
// Controlled only by deployment secrets. No client can choose or overwrite a migration target.
export async function ensureLegacyClassroom(e:LegacyEnvironment){
 const id=e.LEGACY_CLASSROOM_ID;if(!id)return;
 if(!/^[a-f0-9-]{36}$/.test(id)||!e.LEGACY_SCHOOL||!e.LEGACY_CLASS_LABEL||!e.LEGACY_TEACHER_PASSWORD||!e.LEGACY_CLASS_CODE)throw Error('기존 학급 연결 설정을 확인해 주세요.');
 const marker=await e.DB.prepare("SELECT value FROM settings WHERE key='legacy_classroom_migrated'").first<{value:string}>();if(marker?.value===id)return;
 if(await e.DB.prepare('SELECT id FROM classrooms WHERE id=?').bind(id).first())throw Error('기존 학급 연결 대상이 이미 존재해요.');
 const count=await e.DB.prepare('SELECT COUNT(*) AS count FROM students').first<{count:number}>();if(!count?.count)throw Error('이전 학생 자료를 찾을 수 없어요.');
 await e.DB.batch([
 e.DB.prepare('INSERT INTO classrooms(id,school,label,teacher_password,class_code,created) VALUES(?,?,?,?,?,?)').bind(id,e.LEGACY_SCHOOL,e.LEGACY_CLASS_LABEL,await hashPassword(e.LEGACY_TEACHER_PASSWORD),await hashClassCode(e.LEGACY_CLASS_CODE),Date.now()),
 e.DB.prepare("INSERT INTO class_students(id,class_id,number,name,animal,password) SELECT ?||':'||id,?,CAST(id AS INTEGER),name,animal,password FROM students").bind(id,id),
 e.DB.prepare("INSERT INTO class_works(student_id,draft,submitted,published,status,feedback,revision,updated) SELECT ?||':'||student_id,draft,submitted,published,status,feedback,revision,updated FROM works").bind(id),
 e.DB.prepare("INSERT INTO class_files(id,class_id,student_id,name,type,size,created) SELECT id,?,?||':'||student_id,name,type,size,created FROM files").bind(id,id),
 e.DB.prepare('DELETE FROM sessions'),
 e.DB.prepare("INSERT INTO settings(key,value) VALUES('legacy_classroom_migrated',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(id)
 ]);
}
