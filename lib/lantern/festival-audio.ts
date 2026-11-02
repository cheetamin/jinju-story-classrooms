// Locally synthesized ambience: no recording, download, or external audio service.
export function streamSamples(length:number,random= Math.random){
 const samples=new Float32Array(length);let brown=0;
 for(let i=0;i<length;i++){brown=(brown+0.025*(random()*2-1))/1.025;samples[i]=brown*3;}
 return samples;
}
export function createFestivalAudio(context:AudioContext){
 const master=context.createGain();master.gain.value=0;master.connect(context.destination);
 const buffer=context.createBuffer(1,context.sampleRate*8,context.sampleRate);buffer.copyToChannel(streamSamples(buffer.length),0);
 const water=context.createBufferSource();water.buffer=buffer;water.loop=true;
 const filter=context.createBiquadFilter();filter.type='bandpass';filter.frequency.value=850;filter.Q.value=0.45;
 const waterVolume=context.createGain();waterVolume.gain.value=0.32;
 water.connect(filter);filter.connect(waterVolume);waterVolume.connect(master);water.start();
 const notes=[60,64,67,69,67,64,62,64,67,72,69,67,64,62,60,null];
 let step=0,next=0,timer:ReturnType<typeof setInterval>|undefined,wanted=false,closed=false;
 const voices=new Set<OscillatorNode>();
 function tone(midi:number,start:number,duration:number,volume:number,type:OscillatorType){
  const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=type;oscillator.frequency.value=440*2**((midi-69)/12);
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+0.2);gain.gain.exponentialRampToValueAtTime(0.0001,start+duration);
  oscillator.connect(gain);gain.connect(master);voices.add(oscillator);
  oscillator.onended=()=>{voices.delete(oscillator);oscillator.disconnect();gain.disconnect()};oscillator.start(start);oscillator.stop(start+duration+0.1);
 }
 function schedule(){
  while(next<context.currentTime+0.5){
   const note=notes[step%notes.length];if(note!==null)tone(note,next,2.7,0.055,'sine');
   if(step%4===0){const root=[48,45,53,55][Math.floor(step/4)%4];for(const interval of [0,7,12])tone(root+interval,next,6.2,0.016,'sine');}
   step++;next+=1.5;
  }
 }
 return {
  async play(){if(closed)return;wanted=true;await context.resume();if(closed||!wanted)return;master.gain.setTargetAtTime(0.5,context.currentTime,0.18);if(!timer){next=Math.max(next,context.currentTime+0.08);schedule();timer=setInterval(schedule,200)}},
  async pause(){wanted=false;master.gain.setValueAtTime(0,context.currentTime);if(timer){clearInterval(timer);timer=undefined}if(!closed)await context.suspend()},
  dispose(){if(closed)return;closed=true;wanted=false;if(timer)clearInterval(timer);water.stop();for(const voice of voices){voice.onended=null;voice.stop();voice.disconnect()}voices.clear();master.disconnect();void context.close()},
 };
}
