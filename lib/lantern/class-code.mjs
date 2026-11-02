import {namePassword,hashPassword,verifyPassword} from './domain.mjs';
const initials=['r','R','s','e','E','f','a','q','Q','t','T','d','w','W','c','z','x','v','g'];
const vowels=['k','o','i','O','j','p','u','P','h','hk','ho','hl','y','n','nj','np','nl','b','m','ml','l'];
const finals=['','r','R','rt','s','sw','sg','e','f','fr','fa','fq','ft','fx','fv','fg','a','q','qt','t','T','d','w','c','z','x','v','g'];
const jamo='ㄱㄲㄳㄴㄵㄶㄷㄸㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅃㅄㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const keys=['r','R','rt','s','sw','sg','e','E','f','fr','fa','fq','ft','fx','fv','fg','a','q','Q','qt','t','T','d','w','W','c','z','x','v','g',...vowels];
export function normalizeClassCode(code){return [...namePassword(String(code).normalize('NFC'))].map(ch=>{const i=jamo.indexOf(ch);return i<0?ch:keys[i]}).join('').replace(/\s/gu,'');}
// Reconstruct the ordinary two-set keyboard spelling for older Hangul hashes.
function koreanSpelling(keys){
 let out='',i=0;
 while(i<keys.length){
  const initial=initials.indexOf(keys[i]);
  if(initial<0||!vowels.includes(keys[i+1])){const index=[...initials,...vowels].indexOf(keys[i]);out+=index<0?keys[i]:index<19?'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'[index]:'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'[index-19];i++;continue;}
  i++;let vowel=keys[i++];if(vowels.includes(vowel+keys[i]))vowel+=keys[i++];
  let final='';
  if(finals.includes(keys[i])&&!vowels.includes(keys[i+1])){
   final=keys[i++];if(finals.includes(final+keys[i])&&!vowels.includes(keys[i+1]))final+=keys[i++];
  }
  out+=String.fromCharCode(0xac00+initial*588+vowels.indexOf(vowel)*28+finals.indexOf(final));
 }
 return out;
}
export const hashClassCode=code=>hashPassword(normalizeClassCode(code));
export async function verifyClassCode(code,stored){
 const normalized=normalizeClassCode(code);if(!normalized)return false;
 const hangul=koreanSpelling(normalized);
 const candidates=new Set([normalized,String(code),hangul,hangul.replace(/([가-힣])(?=\d)/g,'$1 ')]);
 for(const candidate of candidates)if(await verifyPassword(candidate,stored))return true;
 return false;
}
