'use client';
import {createPortal} from 'react-dom';
import {useEffect,useRef,useState} from 'react';
import {createFestivalAudio} from '../../lib/lantern/festival-audio';
const preference='lantern-festival-muted';
export function FestivalSound(){
 const [portal,setPortal]=useState<HTMLDialogElement|null>(null);
 useEffect(()=>{const update=()=>setPortal(document.querySelector<HTMLDialogElement>('dialog[open]'));const observer=new MutationObserver(update);observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});update();return()=>observer.disconnect()},[]);
 const [state,setState]=useState<'waiting'|'playing'|'muted'|'unsupported'>('waiting');
 const engine=useRef<ReturnType<typeof createFestivalAudio>|null>(null),muted=useRef(false);
 useEffect(()=>{
  let active=true;
  try{muted.current=localStorage.getItem(preference)==='yes'}catch{}
  if(muted.current)setState('muted');
  async function start(){
   if(!active||muted.current||document.hidden)return;
   try{if(!engine.current){const Audio=window.AudioContext||(window as any).webkitAudioContext;if(!Audio){setState('unsupported');return}engine.current=createFestivalAudio(new Audio())}await engine.current.play();if(active&&!muted.current)setState('playing')}catch{if(active)setState('waiting')}
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
  if(state==='playing'){
   muted.current=true;setState('muted');try{localStorage.setItem(preference,'yes')}catch{}await engine.current?.pause();
  }else{
   muted.current=false;try{localStorage.setItem(preference,'no')}catch{}
   try{if(!engine.current){const Audio=window.AudioContext||(window as any).webkitAudioContext;if(!Audio){setState('unsupported');return}engine.current=createFestivalAudio(new Audio())}await engine.current.play();if(!muted.current)setState('playing')}catch{setState('waiting')}
  }
 }
 const label=state==='playing'?'소리 끄기':state==='muted'?'소리 다시 켜기':state==='unsupported'?'소리 지원 안 됨':'배경음 켜기';
 const button=<button type="button" data-festival-sound className="festival-sound pixel-button" onClick={()=>void toggle()} aria-pressed={state==='playing'} disabled={state==='unsupported'} title="밝고 경쾌한 유등축제 연주 · 발표할 때 잠시 꺼 두세요"><span aria-hidden="true">{state==='playing'?'🔊':'🔇'}</span> {label}</button>;
 return portal?createPortal(button,portal):button;
}
