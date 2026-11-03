import {normalizeClassCode} from './class-code.mjs';
import {digest} from './domain.mjs';
export const preservedEntryAction='/api/preserved-entry';
export async function preservedEntryRole(code,env){
 if(!env.PRESERVED_CLASS_CODE_HASH&&!env.PRESERVED_TEACHER_CODE_HASH)return null;
 const hash=await digest(normalizeClassCode(code));
 if(env.PRESERVED_CLASS_CODE_HASH&&hash===env.PRESERVED_CLASS_CODE_HASH)return 'viewer';
 if(env.PRESERVED_TEACHER_CODE_HASH&&hash===env.PRESERVED_TEACHER_CODE_HASH)return 'teacher';
 return null;
}
