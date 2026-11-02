// Original instrumental festival loop, synthesized locally without recordings.
export function createFestivalAudio(context:AudioContext){
 const master=context.createGain();master.gain.value=0;master.connect(context.destination);
 // 104 BPM, 16 bars: bright plucked melody, offbeat chords, bass and soft tonal percussion.
 const eighth=60/104/2;
 const melody=[
  [72,76,79,null,81,79,76,74,72,null,76,79,84,81,79,null],
  [71,74,79,null,81,79,74,71,74,76,79,81,79,null,74,null],
  [72,76,81,null,84,81,79,76,72,null,76,79,81,79,76,null],
  [69,72,77,null,79,77,76,72,69,72,76,79,77,null,72,null],
  [76,79,84,null,86,84,81,79,76,null,79,81,84,81,79,null],
  [74,79,83,null,86,83,81,79,74,76,79,81,79,null,74,null],
  [72,77,81,null,84,81,79,77,76,72,69,72,77,null,76,74],
  [72,null,76,79,84,null,81,79,76,74,72,null,79,76,72,null],
 ].flat();
 const chords=[{root:48,third:4},{root:43,third:4},{root:45,third:3},{root:41,third:4},{root:48,third:4},{root:43,third:4},{root:41,third:4},{root:48,third:4}];
 let step=0,next=0,timer:ReturnType<typeof setInterval>|undefined,wanted=false,closed=false;
 const voices=new Set<OscillatorNode>();
 function tone(midi:number,start:number,duration:number,volume:number,type:OscillatorType,attack=0.008){
  const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=type;oscillator.frequency.value=440*2**((midi-69)/12);
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(volume,start+attack);gain.gain.exponentialRampToValueAtTime(0.0001,start+duration);
  oscillator.connect(gain);gain.connect(master);voices.add(oscillator);
  oscillator.onended=()=>{voices.delete(oscillator);oscillator.disconnect();gain.disconnect()};oscillator.start(start);oscillator.stop(start+duration+0.03);
 }
 function schedule(){
  while(next<context.currentTime+0.5){
   const note=melody[step%melody.length],chord=chords[Math.floor(step/16)%chords.length];
   if(note!==null){tone(note,next,0.46,0.065,'triangle');tone(note+12,next,0.22,0.012,'sine');}
   if(step%2===0)tone(chord.root+(step%8===4?7:0),next,0.4,0.07,'sine');
   if(step%4===1)for(const interval of [12,12+chord.third,19])tone(chord.root+interval,next,0.32,0.025,'triangle');
   // Short pitched taps keep a dance-like pulse without any rushing/noise layer.
   if(step%4===0)tone(36,next,0.13,0.055,'sine',0.003);
   if(step%4===2)tone(91,next,0.055,0.023,'sine',0.002);
   step++;next+=eighth;
  }
 }
 return {
  async play(){if(closed)return;wanted=true;await context.resume();if(closed||!wanted)return;master.gain.setTargetAtTime(0.5,context.currentTime,0.18);if(!timer){next=Math.max(next,context.currentTime+0.08);schedule();timer=setInterval(schedule,200)}},
  async pause(){wanted=false;master.gain.setValueAtTime(0,context.currentTime);if(timer){clearInterval(timer);timer=undefined}if(!closed)await context.suspend()},
  dispose(){if(closed)return;closed=true;wanted=false;if(timer)clearInterval(timer);for(const voice of voices){voice.onended=null;voice.stop();voice.disconnect()}voices.clear();master.disconnect();void context.close()},
 };
}
