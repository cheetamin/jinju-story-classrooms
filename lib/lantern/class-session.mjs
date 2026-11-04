import {digest} from './domain.mjs';
const roles=['teacher','student','viewer'];
export const classCookieName=(id,role)=>'lantern_room_'+id.replaceAll('-','')+(role?'_'+role:'');
function cookies(request){return new Map((request.headers.get('cookie')||'').split(';').map(part=>{const i=part.indexOf('=');return [part.slice(0,i).trim(),part.slice(i+1).trim()]}).filter(([name,value])=>name&&/^[A-Za-z0-9_-]{1,256}$/.test(value)))}
export async function classSession(e,request,id,path){
 const jar=cookies(request),legacy=jar.get(classCookieName(id));let legacyRow;
 const context=request.headers.get('X-Lantern-Context');const priority=context==='teacher'||path.startsWith('teacher/')?roles:context==='studio'||context==='gallery'||['mine','work','upload','files/delete'].includes(path)?['student','viewer','teacher']:roles;
 const lookup=async token=>token?await e.DB.prepare('SELECT role,student_id FROM class_sessions WHERE token=? AND class_id=? AND expires>? AND (student_id IS NULL OR student_id<>?)').bind(await digest(token),id,Date.now(),id+':demo').first():null;
 for(const role of priority){const row=await lookup(jar.get(classCookieName(id,role)));if(row?.role===role)return row;if(legacy&&!legacyRow)legacyRow=await lookup(legacy);if(legacyRow?.role===role)return legacyRow}
 return null;
}
export const classSessionCookie=(request,id,role,token,seconds=28800)=>`${classCookieName(id,role)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}${new URL(request.url).protocol==='https:'?'; Secure':''}`;
export async function classLogout(e,request,id){const jar=cookies(request),names=[classCookieName(id),...roles.map(role=>classCookieName(id,role))],tokens=[...new Set(names.map(name=>jar.get(name)).filter(Boolean))];if(tokens.length)await e.DB.prepare('DELETE FROM class_sessions WHERE class_id=? AND token IN ('+tokens.map(()=>'?').join(',')+')').bind(id,...await Promise.all(tokens.map(token=>digest(token)))).run();const response=Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});for(const role of [undefined,...roles])response.headers.append('Set-Cookie',classSessionCookie(request,id,role,'',0));return response}
export function assertStudentIdentity(request,session){const expected=request.headers.get('X-Lantern-Student');if(expected&&session?.role==='student'&&expected!==session.student_id?.split(':')[1])throw Object.assign(Error('다른 학생으로 로그인되어 있어요. 작성 중인 내용을 유지한 채 본인 계정으로 다시 로그인해 주세요.'),{status:409,code:'student_session_changed'})}
