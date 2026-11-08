import {defaultRegionInfo,validateRegionInfo} from './region.mjs';
export async function readLearningInfo(db,scope,region='진주'){
 const classroom=scope==='legacy'?null:await db.prepare('SELECT region,region_revision FROM classrooms WHERE id=?').bind(scope).first();
 region=classroom?.region||region;const regionRevision=classroom?.region_revision||0;
 const row=await db.prepare('SELECT value FROM settings WHERE key=?').bind('learning_info:'+scope).first();
 if(!row)return {revision:0,doc:defaultRegionInfo(region),region,authoredForRegion:region,regionRevision};
 const saved=JSON.parse(row.value);return {...saved,region,authoredForRegion:saved.region||'진주',regionRevision};
}
export async function writeLearningInfo(db,scope,input,region='진주'){
 if(!Number.isSafeInteger(input?.revision)||input.revision<0)throw Object.assign(Error('지역 정보를 다시 열어 주세요.'),{status:400});
 // Existing teacher-authored sections may belong to the previous region; preserve their structure on rename.
 const old=await readLearningInfo(db,scope,region);
 if(scope!=='legacy'&&input.regionRevision!==old.regionRevision)throw Object.assign(Error('지역 설정이 바뀌었어요. 이 창을 닫고 다시 열어 주세요.'),{status:409});
 region=old.region;const regionRevision=old.regionRevision;
 const authoredForRegion=input.reset===true?region:old.authoredForRegion;
 const doc=validateRegionInfo(input.doc,authoredForRegion),revision=input.revision+1;
 const saved={revision,doc,region:authoredForRegion};
 const result=await db.prepare("INSERT INTO settings(key,value) SELECT ?,? WHERE (?='legacy' OR EXISTS(SELECT 1 FROM classrooms WHERE id=? AND region_revision=?)) AND NOT EXISTS(SELECT 1 FROM settings WHERE key=?) AND (?=0 OR EXISTS(SELECT 1 FROM settings WHERE key=? AND json_extract(value,'$.revision')=?)) ON CONFLICT(key) DO UPDATE SET value=excluded.value WHERE json_extract(settings.value,'$.revision')=?").bind('learning_info:'+scope,JSON.stringify(saved),scope,scope,regionRevision,'class_deleting:'+scope,input.revision,'learning_info:'+scope,input.revision,input.revision).run();
 if(!result.meta.changes)throw Object.assign(Error('다른 화면에서 바뀐 내용이 있어요. 닫았다가 다시 열어 주세요.'),{status:409});
 return {...saved,region,authoredForRegion,regionRevision};
}
