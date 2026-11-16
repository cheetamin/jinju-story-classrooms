import {validateWork} from './domain.mjs';
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
const parse=v=>v?JSON.parse(v):null;
// Called only behind the teacher-session guard. Class IDs are server-derived.
export async function teacherWork(db,classId,b,save=false){
 if(!b||!/^\d{1,3}$/.test(String(b.id)))fail('학생 번호를 확인해 주세요.');
 const owner=classId?classId+':'+String(Number(b.id)):String(Number(b.id));
 const students=classId?'class_students':'students',works=classId?'class_works':'works',files=classId?'class_files':'files';
 const student=await db.prepare(`SELECT name FROM ${students} WHERE id=?${classId?' AND class_id=?':''}`).bind(owner,...(classId?[classId]:[])).first();
 if(!student)fail('학생을 찾을 수 없어요.',404);
 if(student.name==='교사용')fail('공통 교사용 예시는 읽기 전용이에요.',403);
 const row=await db.prepare(`SELECT * FROM ${works} WHERE student_id=?`).bind(owner).first();
 if(!row)fail('작품을 찾을 수 없어요.',404);
 if(!save){const list=await db.prepare(`SELECT id,name,type,size FROM ${files} WHERE student_id=?${classId?' AND class_id=?':''} ORDER BY created`).bind(owner,...(classId?[classId]:[])).all();return {...row,draft:parse(row.draft),submitted:parse(row.submitted),published:parse(row.published),files:list.results};}
 if(!Number.isInteger(b.revision)||b.revision<0||b.publish!==undefined&&typeof b.publish!=='boolean')fail('저장 정보를 확인해 주세요.');
 if(row.revision!==b.revision)fail('학생이나 다른 화면에서 수정했어요. 닫고 다시 열어 최신 글을 확인해 주세요.',409);
 const work=validateWork(b.work,b.publish===true);
 for(const id of work.files){const f=await db.prepare(`SELECT type FROM ${files} WHERE id=? AND student_id=?${classId?' AND class_id=?':''} AND NOT EXISTS(SELECT key FROM settings WHERE key='file_deleting:'||${files}.id)`).bind(id,owner,...(classId?[classId]:[])).first();if(!f)fail('해당 학생의 파일만 연결할 수 있어요.',403);if(work.chapters?.some(c=>c.pages.some(p=>p.imageId===id))&&!f.type.startsWith('image/'))fail('챕터에는 사진이나 그림을 선택해 주세요.');}
 const text=JSON.stringify(work),now=new Date().toISOString();
 const result=b.publish?await db.prepare(`UPDATE ${works} SET draft=?,submitted=?,published=?,status='approved',feedback='',revision=revision+1,updated=? WHERE student_id=? AND revision=?`).bind(text,text,text,now,owner,b.revision).run():await db.prepare(`UPDATE ${works} SET draft=?,submitted=CASE WHEN submitted IS NULL THEN NULL ELSE ? END,status=CASE WHEN submitted IS NULL THEN status ELSE 'pending' END,revision=revision+1,updated=? WHERE student_id=? AND revision=?`).bind(text,text,now,owner,b.revision).run();
 if(!result.meta.changes)fail('학생이나 다른 화면에서 수정했어요. 닫고 다시 열어 최신 글을 확인해 주세요.',409);
 return {ok:true,revision:b.revision+1,updated:now};
}
