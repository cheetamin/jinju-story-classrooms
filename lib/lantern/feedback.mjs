import {classSession,classCookieName} from './class-session.mjs';
import {digest} from './domain.mjs';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow, noarchive'}});
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
function cookie(request,name){return (request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||''}
export async function feedbackContext(request,env,send=fetch){
 const url=new URL(request.url),id=url.searchParams.get('class');
 if(id){
  if(!/^[a-f0-9-]{36}$/.test(id))fail('학급 정보를 다시 확인해 주세요.',404);
  const room=await env.DB.prepare('SELECT school,label FROM classrooms WHERE id=?').bind(id).first();
  const closed=await env.DB.prepare('SELECT key FROM settings WHERE key IN (?,?)').bind('class_deleting:'+id,'class_archived:'+id).first();
  if(!room||closed)fail('현재 사용할 수 없는 학급이에요.',410);
  const session=await classSession(env,request,id,'feedback');if(!session)fail('학급에 다시 입장한 뒤 후기를 남겨 주세요.',401);
  for(const token of [cookie(request,classCookieName(id,session.role)),cookie(request,classCookieName(id))].filter(Boolean)){
   const proof=await env.DB.prepare('SELECT token,student_id FROM class_sessions WHERE token=? AND class_id=? AND role=? AND expires>?').bind(await digest(token),id,session.role,Date.now()).first();
   if(proof&&proof.student_id===session.student_id)return {...room,receipt:await digest('feedback|'+id+'|'+proof.token)};
  }
  fail('학급에 다시 입장해 주세요.',401);
 }
 fail('학급에 다시 입장한 뒤 후기를 남겨 주세요.',401);
}
export async function handleFeedback(request,env,send=fetch){try{
 const url=new URL(request.url);if(request.method!=='POST')return json({error:'후기 보내기 버튼을 이용해 주세요.'},405);
 if(request.headers.get('origin')!==url.origin||request.headers.get('X-Lantern-Request')!=='1')fail('허용되지 않은 요청이에요.',403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))fail('입력을 다시 확인해 주세요.',415);
 if(Number(request.headers.get('content-length'))>4096)fail('후기는 300자 이내로 적어 주세요.',413);
 const text=await request.text();if(new TextEncoder().encode(text).length>4096)fail('후기는 300자 이내로 적어 주세요.',413);
 let body;try{body=JSON.parse(text)}catch{fail('입력을 다시 확인해 주세요.')}
 if(!body||!Number.isInteger(body.hearts)||body.hearts<1||body.hearts>5)fail('하트를 1개부터 5개까지 골라 주세요.');
 if(body.comment!==undefined&&typeof body.comment!=='string')fail('후기를 글로 적어 주세요.');
 const comment=(body.comment||'').trim();if(comment.length>300)fail('후기는 300자 이내로 적어 주세요.');
 const rateKey=await digest('exit-feedback:'+ (request.headers.get('cf-connecting-ip')||'local')+':'+Math.floor(Date.now()/900000));
 await env.DB.prepare('INSERT INTO limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').bind(rateKey,Date.now()+900000).run();
 if((await env.DB.prepare('SELECT count FROM limits WHERE key=?').bind(rateKey).first()).count>150)fail('후기가 한꺼번에 많이 도착했어요. 잠시 뒤 다시 보내거나 그냥 나가도 괜찮아요.',429);
 const context=await feedbackContext(request,env,send);
 const result=await env.DB.prepare('INSERT OR IGNORE INTO exhibition_feedback(receipt,school,label,hearts,comment,created) SELECT ?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM exhibition_feedback)<5000').bind(context.receipt,context.school,context.label,body.hearts,comment,Date.now()).run();
 if(!result.meta.changes){const existing=await env.DB.prepare('SELECT id FROM exhibition_feedback WHERE receipt=?').bind(context.receipt).first();if(existing)return json({saved:true,duplicate:true});fail('후기 보관함이 가득 찼어요. 지금은 그냥 나가도 괜찮아요.',503)}
 return json({saved:true});
 }catch(error){return json({error:error.status?error.message:'후기를 보내지 못했어요. 잠시 뒤 다시 보내거나 그냥 나가도 괜찮아요.'},error.status||503)}}
export async function listFeedback(db,before){
 if(before!==null&&(!/^[1-9]\d{0,14}$/.test(before)))fail('목록을 다시 열어 주세요.');
 const total=await db.prepare('SELECT COUNT(*) AS total,AVG(hearts) AS average FROM exhibition_feedback').first();
 const distribution=(await db.prepare('SELECT hearts,COUNT(*) AS count FROM exhibition_feedback GROUP BY hearts ORDER BY hearts').all()).results;
 const rows=(await db.prepare('SELECT id,school,label,hearts,comment,created FROM exhibition_feedback WHERE id<? ORDER BY id DESC LIMIT 51').bind(before===null?Number.MAX_SAFE_INTEGER:Number(before)).all()).results;
 return {...total,average:total.average===null?null:Math.round(total.average*10)/10,distribution,rows:rows.slice(0,50),nextBefore:rows.length>50?String(rows[49].id):null};
}
