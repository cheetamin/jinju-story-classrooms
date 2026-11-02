import {test} from 'node:test';import assert from 'node:assert/strict';import {validateWork} from '../lib/lantern/domain.mjs';
const chapters=Array.from({length:4},(_,i)=>({pages:[{heading:'발표 '+i,text:'내가 조사한 이야기',imageId:i===0?'image-1':'',caption:'사진 설명',source:'출처'}]}));
test('chapter pages survive validation and publication payload',()=>{const out=validateWork({title:'나의 진주',body:'소개',files:['image-1'],chapters},true);assert.deepEqual(out.chapters,chapters)});
test('chapter images cannot reference unowned/unattached files',()=>{assert.throws(()=>validateWork({title:'나의 진주',body:'',files:[],chapters},true))});
test('chapter text can be submitted without a legacy body or file',()=>{assert.doesNotThrow(()=>validateWork({title:'나의 진주',body:'',files:[],chapters:chapters.map(c=>({pages:c.pages.map(p=>({...p,imageId:''}))}))},true))});
test('legacy works stay compatible and oversized pages rejected',()=>{assert.deepEqual(validateWork({title:'예전 작품',body:'글',files:[]},true),{title:'예전 작품',body:'글',files:[]});assert.throws(()=>validateWork({title:'새 작품',body:'',files:[],chapters:chapters.map(c=>({pages:[{...c.pages[0],imageId:'',text:'x'.repeat(4001)}]}))},true))});
