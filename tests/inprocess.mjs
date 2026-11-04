import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import ts from 'typescript';
const sql=new DatabaseSync(':memory:');
for(const name of fs.readdirSync(new URL('../drizzle/',import.meta.url)).filter(x=>x.endsWith('.sql')).sort())sql.exec(fs.readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
class Statement{constructor(query,args=[]){this.query=query;this.args=args}bind(...args){return new Statement(this.query,args.map(a=>a instanceof ArrayBuffer?new Uint8Array(a):a))}async first(){return sql.prepare(this.query).get(...this.args)||null}async all(){return {results:sql.prepare(this.query).all(...this.args)}}async run(){return {meta:sql.prepare(this.query).run(...this.args)}}}
const objects=new Map();globalThis.__testEnv={DB:{prepare:q=>new Statement(q),batch:async qs=>{sql.exec('BEGIN');try{const out=[];for(const q of qs)out.push(await q.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}},BUCKET:{put:async(k,b)=>objects.set(k,b),get:async k=>objects.has(k)?{body:objects.get(k)}:null,delete:async k=>{for(const id of Array.isArray(k)?k:[k])objects.delete(id)}},TEACHER_PASSWORD:'test-teacher-password-2026',CLASS_CODE:'test-class-code',ROSTER:JSON.stringify(Array.from({length:21},(_,i)=>'시험학생'+(i+1)))};
let source=fs.readFileSync(new URL('../lib/lantern/api.ts',import.meta.url),'utf8').replace("import {env} from 'cloudflare:workers';","const env=globalThis.__testEnv;").replace("'./domain.mjs'",JSON.stringify(new URL('../lib/lantern/domain.mjs',import.meta.url).href));
source=source.replace("'./feedback.mjs'",JSON.stringify(new URL('../lib/lantern/feedback.mjs',import.meta.url).href));
source=source.replace("'./file-storage.mjs'",JSON.stringify(new URL('../lib/lantern/file-storage.mjs',import.meta.url).href));
source=source.replace("'./admin-api'",JSON.stringify(new URL('../lib/lantern/admin-api.ts',import.meta.url).href));
source=source.replace("'./legacy-classroom'",JSON.stringify(new URL('../lib/lantern/legacy-classroom.ts',import.meta.url).href));
source=source.replace("'./classroom-api'",JSON.stringify(new URL('../lib/lantern/classroom-api.ts',import.meta.url).href));
source=source.replace("'./class-code.mjs'",JSON.stringify(new URL('../lib/lantern/class-code.mjs',import.meta.url).href));
source=source.replace("'./learning-info.mjs'",JSON.stringify(new URL('../lib/lantern/learning-info.mjs',import.meta.url).href));
fs.mkdirSync(new URL('../.sites-runtime/',import.meta.url),{recursive:true});const path=new URL('../.sites-runtime/test-api.mjs',import.meta.url);fs.writeFileSync(path,ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
const {handle}=await import(path.href+'?t='+Date.now());
export const fetchInProcess=(url,options)=>handle(new Request(url,options));
