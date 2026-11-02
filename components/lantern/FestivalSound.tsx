'use client';
import {createPortal} from 'react-dom';
import {useEffect,useRef,useState} from 'react';
import {createFestivalAudio} from '../../lib/lantern/festival-audio';
export function FestivalSound(){
 const [portal,setPortal]=useState<HTMLDialogElement|null>(null);
 useEffect(()=>{const update=()=>setPortal(document.querySelector<HTMLDialogElement>('dialog[open]'));const observer=new MutationObserver(update);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});update();return()=>observer.disconnect()},[]);
 const [state,setState]=useState<'waiting'|'playing'|'muted'|'unsupported'>('waiting');
 const engine=useRef<ReturnType<typeof createFestivalAudio>|null>(null),muted=useRef(false);
 useEffect(()=>{
  let active=true;
  async function start(){
   if(!active||muted.current||document.hidden)return;
   try{if(!engine.current){const Audio=window.AudioContext||(window as any).webkitAudioContext;if(!Audio){setState('unsupported');return}engine.current=createFestivalAudio(new Audio())}await engine.current.play();if(active&&!muted.current)setState('playing')}catch{if(active&&!muted.current)setState('waiting')}
  }
  function gesture(event:Event){if((event.target as Element)?.closest?.('[data-festival-sound]'))return;void start()}
  function visibility(){if(document.hidden)void engine.current?.pause();else void start()}
  window.addEventListener('pointerdown',gesture);window.addEventListener('keydown',gesture);document.addEventListener('visibilitychange',visibility);
  // A previously authorized browser may already allow playback. Otherwise a gesture resumes it.
  void start();
  return()=>{active=false;window.removeEventListener('pointerdown',gesture);window.removeEventListener('keydown',gesture);document.removeEventListener('visibilitychange',visibility);engine.current?.dispose();engine.current=null};
 },[]);
 async function toggle(){
  if(state==='unsupported')return;
  if(!muted.current){
   muted.current=true;setState('muted');await engine.current?.pause();
  }else{
   muted.current=false;
   try{if(!engine.current){const Audio=window.AudioContext||(window as any).webkitAudioContext;if(!Audio){setState('unsupported');return}engine.current=createFestivalAudio(new Audio())}await engine.current.play();if(!muted.current)setState('playing')}catch{if(!muted.current)setState('waiting')}
  }
 }
 const enabled=state!=='muted'&&state!=='unsupported';
 const label=state==='unsupported'?'소리 지원 안 됨':enabled?'소리 끄기':'소리 다시 켜기';
 const button=<><button type="button" data-festival-sound className="festival-sound pixel-button" onClick={()=>void toggle()} aria-pressed={enabled} disabled={state==='unsupported'} title={state==='waiting'?'소리가 켜져 있어요. 자동재생이 제한되면 전시 화면을 한 번 눌러 주세요.':'밝고 경쾌한 유등축제 연주 · 발표할 때 잠시 꺼 두세요'}><span aria-hidden="true">{enabled?'🔊':'🔇'}</span> {label}</button>{state==='waiting'&&<span className="festival-sound-hint" role="status">음악이 안 들리면 전시 화면을 한 번 눌러 주세요</span>}</>;
 return portal?createPortal(button,portal):button;
}
