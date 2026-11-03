import {test} from 'node:test';import assert from 'node:assert/strict';
import {defaultJinjuInfo,validateJinjuInfo} from '../lib/lantern/jinju-info.mjs';
test('lesson reference covers all six source topics and returns independent editable copies',()=>{
 const a=defaultJinjuInfo(),b=defaultJinjuInfo();assert.equal(a.sections.length,6);assert.deepEqual(a.sections.map(s=>s.id),['symbols','history','festivals','people','heritage','environment']);a.sections[0].cards[0].text='changed';assert.notEqual(a.sections[0].cards[0].text,b.sections[0].cards[0].text);assert.ok(!JSON.stringify(b).includes('1474'));
});
test('teacher edits preserve topic identity and enforce usable content bounds',()=>{
 const input=defaultJinjuInfo();input.sections[0].cards[0].text='  우리 반이 함께 조사한 내용  ';const saved=validateJinjuInfo(input);assert.equal(saved.sections[0].cards[0].text,'우리 반이 함께 조사한 내용');
 for(const alter of [d=>d.sections.pop(),d=>d.sections[0].id='other',d=>d.sections[0].cards=[],d=>d.sections[0].cards[0].title='',d=>d.sections[0].cards[0].text='가'.repeat(2001),d=>d.sections[0].cards[0].title=123]){const d=defaultJinjuInfo();alter(d);assert.throws(()=>validateJinjuInfo(d))}
});

test('lesson images are optional, survive edits and reject untrusted paths',()=>{
 const d=defaultJinjuInfo();assert.ok(d.sections.flatMap(s=>s.cards).filter(c=>c.image).length>=20);
 const c=d.sections[0].cards[0];assert.equal(validateJinjuInfo(d).sections[0].cards[0].image,c.image);
 c.image='';assert.equal(validateJinjuInfo(d).sections[0].cards[0].image,'');delete c.image;assert.equal(validateJinjuInfo(d).sections[0].cards[0].image,undefined);
 for(const image of ['https://evil.test/x.jpg','../../private','javascript:alert(1)',123]){c.image=image;assert.throws(()=>validateJinjuInfo(d))}
});
