import {test} from 'node:test';import assert from 'node:assert/strict';
import {createFestivalAudio} from '../lib/lantern/festival-audio.ts';
function fixture(){
 const calls=[],tones=[];const gain=()=>({value:0,setValueAtTime(){},setTargetAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
 const context={currentTime:0,destination:{},createGain:()=>({gain:gain(),connect(){},disconnect(){}}),createOscillator:()=>{const tone={frequency:gain(),connect(){},disconnect(){},start(time){tones.push({time,frequency:this.frequency.value,type:this.type})},stop(){}};return tone},createBufferSource(){throw Error('Water/noise playback must be removed')},async resume(){calls.push('resume')},async suspend(){calls.push('suspend')},async close(){calls.push('close')}};
 return {context,calls,tones};
}
test('festival music uses a brisk melodic rhythm and bass without water recordings',async()=>{
 const {context,tones}=fixture();const audio=createFestivalAudio(context);try{await audio.play();assert.ok(tones.length>=5);assert.ok(tones.some(t=>t.frequency>500));assert.ok(tones.some(t=>t.frequency<200));const starts=[...new Set(tones.map(t=>t.time))].sort();assert.ok(starts[1]-starts[0]<0.4,'eighth-note rhythm is lively rather than the old 1.5-second spacing')}finally{audio.dispose()}
});
test('music suspends, resumes and releases the audio context',async()=>{
 const {context,calls}=fixture();const audio=createFestivalAudio(context);await audio.play();await audio.pause();await audio.play();audio.dispose();await audio.play();audio.dispose();assert.deepEqual(calls,['resume','suspend','resume','close']);
});
