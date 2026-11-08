'use client';
import {useState} from 'react';
import {ExitFeedback} from './ExitFeedback';
import {FestivalBackdrop} from './FestivalBackdrop';
import {api} from './shared';
import {completeExhibitionExit} from '../../lib/lantern/exhibition-exit.mjs';
export function ExhibitionFarewell(){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function returnToEntry(){if(busy)return;setBusy(true);setError('');try{await completeExhibitionExit(()=>api('auth/logout',{}),(href:string)=>window.location.replace(href))}catch{setError('연결이 잠시 원활하지 않아요. 아래 버튼을 다시 눌러 주세요.');setBusy(false)}}
 return <div className="gallery-page festival-fullscreen locked-classroom farewell-page"><FestivalBackdrop/><main className="classroom-gate farewell-card"><div className="gate-emblem" aria-hidden="true">✦</div><span className="farewell-eyebrow">우리 고장 우리 지역 이야기</span><h1>함께해 주셔서<br/>감사합니다</h1><p className="farewell-message">아이들이 정성껏 만든 소중한 작품을<br/>함께 감상해 주셔서 감사합니다.</p><p className="farewell-message">작품마다 담긴 노력과 이야기를<br/>따뜻한 마음으로 바라봐 주세요.</p><p className="farewell-signature">치타민쌤 올림</p><ExitFeedback/><p className="feedback-skip-note">설문은 선택이에요. 바로 나가도 괜찮아요.</p><button className="pixel-button gold full farewell-return" disabled={busy} onClick={()=>void returnToEntry()}>{busy?'처음 화면으로 이동하는 중…':'처음 화면으로 되돌아가기'}</button>{error&&<p className="error" role="alert">{error}</p>}<footer className="farewell-copyright"><p>© 치타민쌤. 프로그램과 직접 제작한 콘텐츠의<br/>저작권은 치타민쌤에게 있습니다.</p><small>외부 사진·자료의 저작권은 각 저작권자에게 있습니다.</small></footer></main></div>;
}
