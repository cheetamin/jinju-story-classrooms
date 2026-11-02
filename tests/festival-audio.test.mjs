import {test} from 'node:test';import assert from 'node:assert/strict';
import {streamSamples,createFestivalAudio} from '../lib/lantern/festival-audio.ts';
test('stream sound has bounded, non-silent samples without a network recording',()=>{
 let seed=7;const samples=streamSamples(48000,()=>((seed=(seed*16807)%2147483647)/2147483647));
 assert.equal(samples.length,48000);assert.ok(samples.some(n=>Math.abs(n)>0.01));assert.ok(samples.every(n=>Number.isFinite(n)&&Math.abs(n)<=1));
});
test('ambient sound suspends, resumes and releases the audio context',async()=>{
 const calls=[];const gain=()=>({value:0,setValueAtTime(){},setTargetAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
 const node=()=>({gain:gain(),frequency:{value:0},Q:{value:0},connect(){},disconnect(){},start(){},stop(){}});
 const context={currentTime:0,sampleRate:100,destination:{},createGain:node,createBiquadFilter:node,createBufferSource:node,createOscillator:node,createBuffer:(_,length)=>({length,copyToChannel(){}}),async resume(){calls.push('resume')},async suspend(){calls.push('suspend')},async close(){calls.push('close')}};
 const audio=createFestivalAudio(context);await audio.play();await audio.pause();await audio.play();audio.dispose();await audio.play();audio.dispose();
 assert.deepEqual(calls,['resume','suspend','resume','close']);
});
