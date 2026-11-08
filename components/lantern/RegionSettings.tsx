'use client';
import {useEffect,useState} from 'react';
import {api,Modal} from './shared';
import {useRegion} from './RegionContext';
export function RegionSettings({onClose}:{onClose:()=>void}){
 const current=useRegion(),[region,setRegion]=useState(current.region),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false),[ready,setReady]=useState(false),[revision,setRevision]=useState(current.revision);
 useEffect(()=>{let active=true;api('status').then(r=>{if(active){setRegion(r.classroom.region);setRevision(r.classroom.regionRevision);setReady(true);window.dispatchEvent(new Event('region-updated'))}}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[]);
 return <Modal title="우리 반 지역 설정" onClose={onClose}><form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');try{await api('teacher/region',{region,revision});window.dispatchEvent(new Event('region-updated'));setSaved(true)}catch(e:any){setError(e.message)}finally{setBusy(false)}}}><p>학급 코드로 들어오는 학생들에게 이 지역의 제목과 조사 질문이 표시돼요.</p><label>소개할 지역 이름<input required maxLength={30} value={region} disabled={busy||saved||!ready} onChange={e=>setRegion(e.target.value)} placeholder="예: 진주, 수원, 부산"/></label><p className="notice">지역 이름을 바꿔도 학생이 쓴 작품과 선생님이 편집한 수업 자료는 그대로 보존돼요. 지역을 바꾼 뒤에는 ‘지역 정보 편집’에서 자료도 확인해 주세요.</p>{error&&<p className="error" role="alert">{error}</p>}{saved?<><p className="notice success" role="status">지역 설정을 저장했어요. 다음 화면부터 새 이름이 표시돼요.</p><button type="button" className="primary full" onClick={onClose}>확인</button></>:<button className="primary full" disabled={busy||!ready}>{!ready?'지역 정보를 확인하는 중…':busy?'저장 중…':'우리 반 지역 저장'}</button>}</form></Modal>;
}
