import { defaultJinjuInfo, validateJinjuInfo } from './jinju-info.mjs';
export async function readLearningInfo(db, scope) {
    const row = await db.prepare('SELECT value FROM settings WHERE key=?').bind('learning_info:' + scope).first();
    return row ? JSON.parse(row.value) : { revision: 0, doc: defaultJinjuInfo() };
}
export async function writeLearningInfo(db, scope, input) {
    if (!Number.isSafeInteger(input?.revision) || input.revision < 0)
        throw Object.assign(Error('먼저 진주 정보를 다시 열어 주세요.'), { status: 400 });
    const doc = validateJinjuInfo(input.doc), revision = input.revision + 1;
    const result = await db.prepare("INSERT INTO settings(key,value) SELECT ?,? WHERE (?='legacy' OR EXISTS(SELECT 1 FROM classrooms WHERE id=?)) AND NOT EXISTS(SELECT 1 FROM settings WHERE key=?) AND (?=0 OR EXISTS(SELECT 1 FROM settings WHERE key=? AND json_extract(value,'$.revision')=?)) ON CONFLICT(key) DO UPDATE SET value=excluded.value WHERE json_extract(settings.value,'$.revision')=?").bind('learning_info:' + scope, JSON.stringify({ revision, doc }), scope, scope, 'class_deleting:' + scope, input.revision, 'learning_info:' + scope, input.revision, input.revision).run();
    if (!result.meta.changes)
        throw Object.assign(Error('다른 화면에서 바뀐 내용이 있어요. 닫았다가 다시 열어 주세요.'), { status: 409 });
    return { revision, doc };
}
