// Each record is scoped to a classroom. Existing works are never modified.
export async function social(req:Request,d:D1Database,room:string,session:{role:string;studentId:string|null},target:string,table:string,studentTable:string){
 const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
 const fail=(message:string,status=400)=>{throw Object.assign(Error(message),{status})};
 if(!/^\d{1,2}$/.test(target))fail('작품 번호를 확인해 주세요.');
 const owner=room==='legacy'?target:room+':'+target;
 const published=await d.prepare(`SELECT published FROM ${table} WHERE student_id=?`).bind(owner).first<any>();
 if(!published?.published)fail('전시 중인 작품에서만 감상을 나눌 수 있어요.',404);
 await d.batch([
 d.prepare('CREATE TABLE IF NOT EXISTS work_likes (room TEXT NOT NULL,target TEXT NOT NULL,author TEXT NOT NULL,PRIMARY KEY(room,target,author))'),
 d.prepare('CREATE TABLE IF NOT EXISTS work_comments (id TEXT PRIMARY KEY,room TEXT NOT NULL,target TEXT NOT NULL,author TEXT NOT NULL,body TEXT NOT NULL,created INTEGER NOT NULL)'),
 d.prepare('CREATE INDEX IF NOT EXISTS work_comments_target ON work_comments(room,target,created)')]);
 const author=session.studentId;const canWrite=session.role==='student'&&!!author&&!author.endsWith(':example');
 if(req.method==='POST'){
 const raw=await req.text();if(raw.length>2048)fail('댓글은 300자 이내로 써 주세요.');let b:any;try{b=JSON.parse(raw)}catch{fail('입력 내용을 확인해 주세요.')}
 if(b.action==='delete'){
 if(session.role!=='teacher')fail('댓글은 선생님만 삭제할 수 있어요.',403);
 await d.prepare('DELETE FROM work_comments WHERE id=? AND room=? AND target=?').bind(String(b.id),room,target).run();
 }else{
 if(!canWrite)fail('학생 개인 계정으로 로그인하면 좋아요와 댓글을 남길 수 있어요.',403);
 if(b.action==='like'&&typeof b.liked==='boolean'){
 await d.prepare(b.liked?'INSERT OR IGNORE INTO work_likes(room,target,author) VALUES(?,?,?)':'DELETE FROM work_likes WHERE room=? AND target=? AND author=?').bind(room,target,author).run();
 }else if(b.action==='comment'){
 if(typeof b.text!=='string'||!b.text.trim()||b.text.trim().length>300)fail('댓글은 1~300자로 써 주세요.');
 const result=await d.prepare('INSERT INTO work_comments(id,room,target,author,body,created) SELECT ?,?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM work_comments WHERE room=? AND author=? AND created>?)').bind(crypto.randomUUID(),room,target,author,b.text.trim(),Date.now(),room,author,Date.now()-5000).run();
 if(!result.meta.changes)fail('댓글을 등록했어요. 잠시 뒤 다음 댓글을 써 주세요.',429);
 }else fail('요청을 확인해 주세요.');
 }
 }
 const likes=await d.prepare('SELECT COUNT(*) AS total,COALESCE(MAX(author=?),0) AS liked FROM work_likes WHERE room=? AND target=?').bind(author||'',room,target).first<any>();
 const comments=await d.prepare('SELECT id,author,body,created FROM work_comments WHERE room=? AND target=? ORDER BY created DESC,id DESC LIMIT 100').bind(room,target).all<any>();
 return json({likes:likes.total,liked:!!likes.liked,canWrite,comments:comments.results.map(c=>({id:c.id,text:c.body,name:'익명 친구',created:c.created,canDelete:session.role==='teacher'}))});
}
