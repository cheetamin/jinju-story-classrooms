import {digest} from './domain.mjs';
import {normalizeClassCode} from './class-code.mjs';
const bytes=value=>new TextEncoder().encode(value);
const hex=value=>Array.from(new Uint8Array(value),b=>b.toString(16).padStart(2,'0')).join('');
const unhex=value=>Uint8Array.from(value.match(/../g)||[],x=>parseInt(x,16));
const validKind=kind=>['class','teacher'].includes(kind);
async function key(secret){if(!/^[a-f0-9]{64}$/.test(secret||''))throw Error('vault unavailable');return crypto.subtle.importKey('raw',unhex(secret),'AES-GCM',false,['encrypt','decrypt'])}
export async function rememberCredential(e,roomId,kind,value,storedHash){
 if(!e.CREDENTIAL_VAULT_KEY||!validKind(kind))return;
 const fingerprint=await digest(storedHash),iv=crypto.getRandomValues(new Uint8Array(12)),aad=bytes(roomId+'\n'+kind+'\n'+fingerprint);
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad},await key(e.CREDENTIAL_VAULT_KEY),bytes(kind==='class'?normalizeClassCode(value):value));
 const payload=JSON.stringify({version:1,fingerprint,iv:hex(iv),cipher:hex(encrypted)}),column=kind==='class'?'class_code':'teacher_password';
 await e.DB.prepare(`INSERT INTO settings(key,value) SELECT ?,? WHERE EXISTS(SELECT id FROM classrooms WHERE id=? AND ${column}=?) AND NOT EXISTS(SELECT key FROM settings WHERE key=?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).bind('credential_vault:'+roomId+':'+kind,payload,roomId,storedHash,'class_deleting:'+roomId).run();
}
// Failed capture must never prevent a valid teacher or class login.
export async function captureCredential(e,roomId,kind,value,storedHash){try{await rememberCredential(e,roomId,kind,value,storedHash)}catch{}}
export async function revealCredential(e,room,kind){
 if(!e.CREDENTIAL_VAULT_KEY||!validKind(kind))return null;
 const row=await e.DB.prepare('SELECT value FROM settings WHERE key=?').bind('credential_vault:'+room.id+':'+kind).first();if(!row)return null;
 try{const saved=JSON.parse(row.value),fingerprint=await digest(kind==='class'?room.class_code:room.teacher_password);if(saved.version!==1||saved.fingerprint!==fingerprint||!/^[a-f0-9]{24}$/.test(saved.iv)||!/^[a-f0-9]{32,1024}$/.test(saved.cipher))return null;const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:unhex(saved.iv),additionalData:bytes(room.id+'\n'+kind+'\n'+fingerprint)},await key(e.CREDENTIAL_VAULT_KEY),unhex(saved.cipher));return new TextDecoder().decode(clear)}catch{return null}
}
