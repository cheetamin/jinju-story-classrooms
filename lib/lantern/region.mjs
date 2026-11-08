import {defaultJinjuInfo,validateJinjuInfo} from './jinju-info.mjs';
export function validateRegion(value){
 if(typeof value!=='string')throw Object.assign(Error('지역 이름을 입력해 주세요.'),{status:400});
 const name=value.normalize('NFC').trim().replace(/\s+/g,' ');
 if(!name||name.length>30||!/[\p{L}\p{N}]/u.test(name)||!/^[\p{L}\p{N} .·()\-]+$/u.test(name))throw Object.assign(Error('지역 이름은 1~30자의 한글·영문·숫자로 입력해 주세요.'),{status:400});
 return name;
}
export const isJinju=region=>['진주','진주시','경상남도 진주시'].includes(region);
export const regionTitle=region=>{if(!region)return '우리 지역 이야기';const last=region.charCodeAt(region.length-1);const particle=last>=0xAC00&&last<=0xD7A3&&(last-0xAC00)%28!==0?'을':'를';return '우리 지역 '+region+particle+' 소개해요'};
export function defaultRegionInfo(region='진주'){
 if(isJinju(region))return defaultJinjuInfo();
 return {version:1,sections:[
 {id:'introduction',title:region+' 소개',question:'우리 지역은 어디에 있고 어떤 특징이 있나요?',cards:[{title:'우리 지역 조사하기',text:region+'의 위치와 자연환경, 사람들이 살아가는 모습을 조사해 보아요. 선생님이 우리 반 수업 자료를 이곳에 추가할 수 있어요.'}]},
 {id:'people',title:'역사적 인물',question:'우리 지역과 관련된 인물에게 무엇을 배울 수 있나요?',cards:[{title:'인물과 지역의 관계',text:'인물이 태어나거나 활동한 곳을 확인하고, 어떤 일을 했는지 믿을 수 있는 자료에서 찾아보아요. 확인한 사실과 내 생각을 구분해요.'}]},
 {id:'places',title:'명소와 축제',question:'친구를 초대하고 싶은 곳은 어디인가요?',cards:[{title:'추천하고 싶은 장소와 행사',text:'우리 지역의 명소나 축제를 골라 특징과 소개하고 싶은 까닭을 정리해요. 행사 날짜는 최신 공식 안내에서 확인해요.'}]},
 {id:'products',title:'특산물',question:'우리 지역의 특별한 먹거리와 물건은 무엇인가요?',cards:[{title:'지역과 특산물의 관계',text:'지역을 대표하는 특산물의 특징과 생산되는 곳을 조사해요. 사진이나 설명을 가져왔다면 출처를 함께 적어요.'}]}
 ]};
}
export function validateLessonImageUrl(value){
 if(value==='')return '';
 try{const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||value.length>2048)throw Error();return u.href}catch{throw Object.assign(Error('이미지는 https://로 시작하는 주소를 입력해 주세요.'),{status:400})}
}
export function validateRegionInfo(input,region){
 const base=defaultRegionInfo(region);const fail=()=>{throw Object.assign(Error('지역 정보의 제목과 내용을 확인해 주세요.'),{status:400})};
 if(!input||input.version!==1||!Array.isArray(input.sections)||input.sections.length!==base.sections.length)fail();
 const str=(v,max)=>{if(typeof v!=='string'||!v.trim()||v.length>max)fail();return v.trim()};
 const doc={version:1,sections:input.sections.map((s,i)=>{if(!s||s.id!==base.sections[i].id||!Array.isArray(s.cards)||s.cards.length<1||s.cards.length>24)fail();return {id:s.id,title:str(s.title,50),question:str(s.question,250),cards:s.cards.map(c=>({title:str(c?.title,80),text:str(c?.text,2000),...(isJinju(region)&&c.image!==undefined?{image:c.image}:{}),...(c.imageUrl?{imageUrl:validateLessonImageUrl(c.imageUrl)}:{})}))}})};
 if(isJinju(region))validateJinjuInfo(doc);
 if(new TextEncoder().encode(JSON.stringify(doc)).length>65536)fail();return doc;
}
