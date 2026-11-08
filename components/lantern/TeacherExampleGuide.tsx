'use client';
export function TeacherExampleGuide({compact=false}:{compact?:boolean}){return <aside className={'teacher-example-guide '+(compact?'compact':'')}><b>마지막 번호의 ‘교사용’ 계정으로 들어가세요</b><p>번호 선택에서 맨 마지막의 <strong>교사용</strong>을 고르고, 이 학급의 <strong>교사 비밀번호</strong>을 입력하세요.</p>{!compact&&<p>원래 준비된 교사용 예시 작품을 확인할 수 있어요. 공통으로 제공되는 예시는 원본 보호를 위해 읽기 전용입니다.</p>}</aside>}
