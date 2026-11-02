'use client';
import {useState} from 'react';
import {ChapterEditor} from './ChapterEditor';
import {WorkView,type Work} from './shared';
export function ExampleWork({work}:{work:Work|null}){const [mode,setMode]=useState('view');if(!work)return <p>공통 예시가 준비되면 여기에 표시됩니다.</p>;return <section><p className="notice">글과 사진의 작성 방법을 살펴볼 수 있는 교사용 예시 자료입니다. 공통 예시는 읽기 전용이며 원본을 수정하지 않습니다.</p><nav className="wizard-tabs" aria-label="예시 확인 방법"><button aria-current={mode==='view'?'page':undefined} onClick={()=>setMode('view')}>발표 화면 보기</button><button aria-current={mode==='edit'?'page':undefined} onClick={()=>setMode('edit')}>글·사진 작성 화면 보기</button></nav>{mode==='view'?<WorkView work={work}/>:<><label>작품 제목<input value={work.title} readOnly/></label><ChapterEditor work={work} files={[]} busy={false} readOnly onChange={()=>{}} onUpload={()=>{}}/>{work.body&&<label>추가 소개 글<textarea value={work.body} readOnly rows={5}/></label>}</>}</section>}
