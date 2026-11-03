const bytes=text=>new TextEncoder().encode(text);
const hex=data=>Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,'0')).join('');
const key=secret=>crypto.subtle.importKey('raw',bytes(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
export async function signRateIdentity(ip,secret,now=Date.now()){
 if(!secret||!ip||ip.length>64||!/^[a-fA-F0-9:.]+$/.test(ip))return {};
 const time=String(now),signature=hex(await crypto.subtle.sign('HMAC',await key(secret),bytes(ip+'\n'+time)));
 return {'X-Lantern-Client':ip,'X-Lantern-Time':time,'X-Lantern-Signature':signature};
}
export async function clientRateIdentity(request,secret,now=Date.now()){
 const ip=request.headers.get('X-Lantern-Client'),time=request.headers.get('X-Lantern-Time'),signature=request.headers.get('X-Lantern-Signature');
 if(secret&&ip&&ip.length<=64&&/^[a-fA-F0-9:.]+$/.test(ip)&&/^\d{13}$/.test(time||'')&&Math.abs(now-Number(time))<60000&&/^[a-f0-9]{64}$/.test(signature||'')){
  const valid=await crypto.subtle.verify('HMAC',await key(secret),Uint8Array.from(signature.match(/../g),x=>parseInt(x,16)),bytes(ip+'\n'+time));
  if(valid)return ip;
 }
 return request.headers.get('cf-connecting-ip')||'local';
}
