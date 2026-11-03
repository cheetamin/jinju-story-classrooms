import {signRateIdentity} from './hub-rate-identity.mjs';
// Fixed original backend only: keep the class data in its existing storage.
// Never log bodies, credentials, cookies, or upstream responses.
export const originalOrigin='https://jinju-animal-lantern-class44.workspace-889499.chatgpt.site';
const cookieName='lantern_original_session';
const problem=(status,message)=>Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
const allowed=/^\/api\/(?:status|students|learning-info|mine|upload|work|auth\/(?:teacher|class|student|logout)|files\/(?:delete|[a-f0-9-]{36})|teacher\/(?:works|backup|review|animal|password|settings|learning-info))$/;
function cookieHeaders(upstream,headers){
 headers.delete('set-cookie');
 const cookies=typeof upstream.headers.getSetCookie==='function'?upstream.headers.getSetCookie():upstream.headers.getAll('Set-Cookie');
 for(const cookie of cookies){
  if(!/^(?:lantern_session|lantern_room_[a-f0-9]{32})=/.test(cookie))continue;
  headers.append('Set-Cookie',cookie.replace(/^([^=]+)=/,cookieName+'=$1.').replace(/;\s*Domain=[^;]*/ig,'').replace(/;\s*Secure/ig,'')+'; Secure');
 }
}
export async function preservedProxy(request,send=fetch,rateSecret){
 const url=new URL(request.url),entry=url.pathname==='/api/preserved-entry';
 const packed=request.headers.get('cookie')?.match(/(?:^|;\s*)lantern_original_session=([A-Za-z0-9_.-]{1,384})(?:;|$)/)?.[1];
 const match=packed?.match(/^(lantern_session|lantern_room_[a-f0-9]{32})\.([A-Za-z0-9_-]{0,256})$/);
 const token=match?.[2]||(!packed?.includes('.')?packed:null),upstreamCookie=match?.[1]||'lantern_session';
 if(!entry&&(!token||url.searchParams.has('class')||!url.pathname.startsWith('/api/')||/^\/api\/(?:classrooms|admin)\//.test(url.pathname)))return null;
 if(entry){
  if(request.method!=='POST')return problem(405,'입장 코드를 다시 입력해 주세요.');
  if(request.headers.get('origin')!==url.origin)return problem(403,'허용되지 않은 입장 요청이에요.');
  if(!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))return problem(415,'입장 정보를 다시 입력해 주세요.');
  if(Number(request.headers.get('content-length'))>2048)return problem(413,'입장 정보가 너무 길어요.');
 }else{
  if(!allowed.test(url.pathname))return problem(404,'요청한 기능을 찾을 수 없어요.');
  if(url.pathname==='/api/teacher/settings')return problem(409,'기존 학급의 입장 코드 변경은 관리자에게 요청해 주세요.');
  if(!['GET','POST'].includes(request.method))return problem(405,'허용되지 않은 요청이에요.');
  if(request.method==='POST'&&(request.headers.get('origin')!==url.origin||request.headers.get('x-lantern-request')!=='1'))return problem(403,'허용되지 않은 요청이에요.');
 }
 const headers=new Headers();
 for(const name of ['content-type','accept','if-none-match']){const value=request.headers.get(name);if(value)headers.set(name,value)}
 for(const [name,value] of Object.entries(await signRateIdentity(request.headers.get('cf-connecting-ip'),rateSecret)))headers.set(name,value);
 headers.set('Origin',entry?url.origin:originalOrigin);headers.set('X-Lantern-Request','1');
 if(!entry&&token)headers.set('Cookie',upstreamCookie+'='+token);
 let body=request.method==='POST'?request.body:undefined;
 if(entry){body=await request.text();if(new TextEncoder().encode(body).length>2048)return problem(413,'입장 정보가 너무 길어요.');}
 try{
  const target=originalOrigin+(entry?'/api/entry-from-hub':url.pathname);
  const upstream=await send(new Request(target,{method:request.method,headers,body,redirect:'manual',...(body&&typeof body!=='string'?{duplex:'half'}:{})}));
  const outHeaders=new Headers(upstream.headers);cookieHeaders(upstream,outHeaders);outHeaders.set('Cache-Control','private, no-store');outHeaders.set('Vary','Cookie');outHeaders.set('Referrer-Policy','no-referrer');
  if(entry&&upstream.status===303){const rawLocation=upstream.headers.get('location'),redirect=rawLocation?new URL(rawLocation,originalOrigin):null,location=redirect?.pathname;if(!redirect||redirect.origin!==originalOrigin||redirect.search||redirect.hash||!['/gallery','/teacher'].includes(location)||!outHeaders.has('set-cookie'))return problem(502,'학급 입장을 완료하지 못했어요. 다시 시도해 주세요.');outHeaders.set('Location',location);return new Response(null,{status:303,headers:outHeaders})}
  if(upstream.status>=300&&upstream.status<400&&upstream.status!==304)return problem(502,'학급 연결을 다시 확인해 주세요.');
  if(entry)return problem(upstream.status>=400?upstream.status:502,'입장 코드를 확인해 주세요.');
  if(url.pathname==='/api/status'&&upstream.ok){const status=await upstream.json();outHeaders.delete('content-length');outHeaders.delete('content-encoding');return Response.json({...status,preserved:true,viewerAccess:'approved'},{status:upstream.status,headers:outHeaders})}
  return new Response(upstream.body,{status:upstream.status,headers:outHeaders});
 }catch{return problem(502,'학급 저장소에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.');}
}
