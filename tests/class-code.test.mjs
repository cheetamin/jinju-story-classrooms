import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeClassCode,hashClassCode,verifyClassCode} from '../lib/lantern/class-code.mjs';
import {hashPassword,verifyPassword} from '../lib/lantern/domain.mjs';
test('class codes accept either keyboard layout, spaces and decomposed Hangul',async()=>{
 for(const [ko,en] of [['강빛초 12','rkdqlcch12'],['평화초 33','vudghkch33'],['꿈나무44','Rna skan44']]){
  assert.equal(normalizeClassCode(ko),normalizeClassCode(en));
  const stored=await hashClassCode(ko);
  assert.equal(await verifyClassCode(en,stored),true);
  assert.equal(await verifyClassCode(ko.normalize('NFD'),stored),true);
  assert.equal(await verifyClassCode(en+'9',stored),false);
 }
});
test('existing Latin and Hangul hashes still work without resetting codes',async()=>{
 for(const original of ['rkdqlcch12','강빛초12','강빛초 12']){
  const stored=await hashPassword(original);
  assert.equal(await verifyClassCode('강빛초 12',stored),true);
  assert.equal(await verifyClassCode('rkdqlcch12',stored),true);
 }
});
test('keyboard jamo and shifted consonants are preserved; passwords stay exact',async()=>{
 assert.equal(normalizeClassCode('ㄱㅏㅇ12'),'rkd12');
 assert.notEqual(normalizeClassCode('까12'),normalizeClassCode('가12'));
 assert.equal(await verifyPassword('강빛초12',await hashPassword('rkdqlcch12')),false);
 assert.equal(await verifyClassCode('   ',await hashClassCode('abcdef')),false);
});
