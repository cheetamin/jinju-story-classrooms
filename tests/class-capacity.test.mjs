import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import {readOperatingPolicy} from '../lib/lantern/operations.mjs';
test('D1 policy permits 100 classrooms while retaining file safety caps',async()=>{
 const e={FILE_STORAGE:'d1',DB:{prepare:()=>({first:async()=>null,run:async()=>({})})}};
 const p=await readOperatingPolicy(e);assert.equal(p.maxClasses,100);assert.equal(p.totalBytes,100*1024**2);assert.equal(p.classBytes,16*1024**2);assert.equal(p.maxFileBytes,1024**2);
});
test('existing ten classes survive migration; 11 through 100 allowed; 101 blocked',()=>{
 const db=new DatabaseSync(':memory:');
 db.exec("CREATE TABLE classrooms(id TEXT PRIMARY KEY); CREATE TABLE settings(key TEXT PRIMARY KEY,value TEXT); INSERT INTO settings VALUES('file_storage_mode','d1'); CREATE TRIGGER classrooms_capacity_guard BEFORE INSERT ON classrooms WHEN (SELECT COUNT(*) FROM classrooms)>=10 BEGIN SELECT RAISE(ABORT,'CLASS_CAPACITY'); END;");
 const insert=db.prepare('INSERT INTO classrooms VALUES(?)');for(let i=1;i<=10;i++)insert.run(String(i));assert.throws(()=>insert.run('11'),/CLASS_CAPACITY/);
 db.exec(fs.readFileSync(new URL('../drizzle/0005_expand_class_capacity.sql',import.meta.url),'utf8'));
 for(let i=11;i<=100;i++)insert.run(String(i));assert.throws(()=>insert.run('101'),/CLASS_CAPACITY/);assert.equal(db.prepare('SELECT COUNT(*) n FROM classrooms').get().n,100);
 db.exec("INSERT INTO settings VALUES('operating_policy','{\"maxClasses\":50}')");assert.throws(()=>insert.run('102'),/CLASS_CAPACITY/);
 db.close();
});
