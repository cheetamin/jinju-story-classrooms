import {lessonImage} from './jinju-info-images.mjs';
// Student-friendly summaries of the teacher's lesson material, checked against the sources below.
export const jinjuInfoSources=[
 {title:'진주시 상징물관리조례',url:'https://www.law.go.kr/LSW/ordinInfoP.do?ordinId=2120344'},
 {title:'한국학중앙연구원 진주시',url:'https://encykorea.aks.ac.kr/Article/E0054910'},
 {title:'진주문화관광재단 관광 안내와 진주 8경',url:'https://jjct.or.kr/tour/'},
 {title:'국사편찬위원회 강희안',url:'https://contents.history.go.kr/mobile/kc/view.do?code=kc_age_30&levelId=kc_n300500'},
 {title:'한국학중앙연구원 김시민',url:'https://encykorea.aks.ac.kr/Article/E0009658'},
 {title:'이상근국제음악제 인물 소개',url:'https://www.limf.co.kr/leesanggeun'},
 {title:'국사편찬위원회 진주 농민 항쟁',url:'https://contents.history.go.kr/front/tg/view.do?levelId=tg_003_2850&treeId=0100'},
 {title:'대한민국역사박물관 형평운동 사적지',url:'https://archive.much.go.kr/data/01/folderView.do?jobdirSeq=2006'},
];
const cardImages={"진주는 어디에 있나요?": "location", "우리 동네 금산면": "jinju-map", "시화 석류꽃": "pomegranate", "시목 대추나무": "jujube", "시조 백로": "egret", "학습자료에서 만난 캐릭터": "hamo", "시간을 따라 살펴보아요": "timeline", "개천예술제": "gaecheon", "진주남강유등축제": "lantern-festival", "코리아드라마페스티벌": "drama", "진주의 민속 소힘겨루기": "cattle", "김시민 장군": "fortress", "진주성": "chokseokru", "자연환경과 인문환경": "dam", "진주 8경을 살펴보아요": "view-8", "생활 속의 인문환경": "museum", "제1경 진주성 촉석루": "view-1", "제2경 남강 의암": "view-2", "제3경 뒤벼리": "view-3", "제4경 새벼리": "view-4", "제5경 망진산 봉수대": "view-5", "제6경 비봉산의 봄": "view-6", "제7경 월아산 해돋이": "view-7", "제8경 진양호 노을": "view-8"};
const card=(title,text)=>({title,text,...(cardImages[title]?{image:cardImages[title]}:{})});
const sections=[
 {id:'symbols',title:'상징과 위치',question:'진주를 처음 방문한 친구에게 어떤 상징과 풍경을 소개하고 싶나요?',cards:[
  card('진주는 어디에 있나요?','진주시는 경상남도 서남부에 있어요. 남강이 흐르는 우리 고장의 모습을 지도와 풍경 사진에서 찾아보아요.'),
  card('우리 동네 금산면','금산면은 진주시에 속한 지역이에요. 내가 사는 동네와 학교가 진주시의 어느 쪽에 있는지 찾아보고 소개해 보아요.'),
  card('시화 석류꽃','진주시를 상징하는 꽃은 석류꽃이에요. 붉은 꽃과 알갱이가 모인 열매를 떠올려 보아요. 나라를 사랑하는 마음과 시민의 굳은 의지, 단결을 나타내요.'),
  card('시목 대추나무','진주시를 상징하는 나무는 대추나무예요. 굳건한 기상과 부모님과 나라를 사랑하는 마음을 담고 있어요.'),
  card('시조 백로','진주시를 상징하는 새는 백로예요. 하얀 모습에서 깨끗한 마음과 선비 정신을 떠올릴 수 있어요.'),
  card('학습자료에서 만난 캐릭터','자료에는 논개 캐릭터와 수달 캐릭터 하모가 등장해요. 캐릭터의 생김새와 담긴 뜻을 살펴보고, 우리 고장을 나타내는 방법을 생각해 보아요.'),
 ]},
 {id:'history',title:'진주의 발자취',question:'고장 이름과 사람들의 생활은 시간이 흐르며 어떻게 달라졌을까요?',cards:[
  card('시간을 따라 살펴보아요','지명은 지역의 역사와 함께 바뀌기도 해요. 옛 지도와 지금의 지도를 비교하면 고장의 변화가 보인답니다.'),
  card('청주와 강주','통일신라 시기에는 오늘날 진주 지역을 청주, 강주와 같은 이름으로 불렀어요. 같은 지역도 시대에 따라 이름이 달랐어요.'),
  card('고려 시대의 진주','고려 시대에 진주라는 이름을 사용하기 시작했어요. 진주목은 주변의 넓은 지역을 다스리던 고을이었어요.'),
  card('오늘날의 진주시','도시의 모습과 행정구역도 시간이 흐르며 달라졌어요. 지금의 진주시 안에는 동, 읍, 면이 있어요. 우리가 사는 지역의 이름도 찾아보아요.'),
 ]},
 {id:'festivals',title:'진주의 행사',question:'친구를 초대한다면 어떤 행사를 소개하고 싶나요? 그 까닭은 무엇인가요?',cards:[
  card('개천예술제','음악, 무용, 미술 등 여러 예술을 함께 즐기는 진주의 대표 예술 축제예요. 공연과 전시를 통해 지역의 예술 문화를 만날 수 있어요.'),
  card('진주남강유등축제','남강과 진주성 주변의 등불을 감상하는 축제예요. 진주성 전투 때 신호를 보내고 소식을 전하던 유등의 역사와 연결해 생각해 보아요.'),
  card('코리아드라마페스티벌','드라마를 주제로 공연, 시상식, 체험 등 여러 행사를 만날 수 있는 축제예요. 진주와 문화 산업의 관계도 생각해 볼 수 있어요.'),
  card('진주의 민속 소힘겨루기','학습자료의 민속 소싸움 대회는 진주에서 이어 온 전통 행사 가운데 하나예요. 어떤 전통을 담고 있는지 자료를 찾아보고 설명해 보아요.'),
  card('행사 날짜는 다시 확인해요','학습자료에서는 주로 10월의 행사를 살펴봤어요. 실제 날짜와 장소, 프로그램은 해마다 달라질 수 있으니 방문 전 공식 안내를 확인해요.'),
 ]},
 {id:'people',title:'인물과 이야기',question:'인물의 행동과 지역의 역사를 통해 오늘 우리가 배울 점은 무엇인가요?',cards:[
  card('김시민 장군','1592년 제1차 진주성 전투에서 군사와 백성이 힘을 모아 성을 지키는 데 큰 역할을 했어요. 이 승리를 진주대첩이라고 불러요.'),
  card('이상근 선생님','진주에서 태어난 작곡가이자 음악 교육자예요. 음악을 만들고 가르치며 우리나라 현대음악의 발전에 힘썼어요.'),
  card('강희안 선생님','조선 전기의 문신이자 화가예요. 본관이 진주이며, 시와 글씨와 그림에 뛰어나 삼절로 불렸어요. 한글과 관련된 편찬 작업에도 참여했어요.'),
  card('진주성의 두 전투','임진왜란 중 진주성에서는 1592년과 1593년에 큰 전투가 있었어요. 두 전투의 시기와 결과를 구별해서 살펴보아요.'),
  card('진주 농민 항쟁','1862년 진주에서 농민들이 무거운 세금과 관리들의 부당한 행동에 맞서 일어났어요. 당시 농민들이 바랐던 삶을 생각해 보아요.'),
  card('진주의 독립운동','1919년 3월 18일 진주에서 만세운동이 일어났어요. 여러 사람들이 독립을 바라는 마음을 함께 나타냈어요.'),
  card('형평운동','1923년 진주에서 형평사가 만들어지고 형평운동이 시작됐어요. 당시 차별받던 백정의 처지를 바꾸고, 사람을 평등하게 대하자는 뜻을 담았어요.'),
 ]},
 {id:'heritage',title:'진주의 국가유산',question:'눈에 보이는 유산과 사람을 통해 전해지는 유산을 어떻게 지킬 수 있을까요?',cards:[
  card('진주성','진주의 역사와 사람들의 이야기가 담긴 성이에요. 성벽, 촉석루, 비석 등을 살펴보며 고장의 역사를 생각해 보아요.'),
  card('자연유산','자연이 오랜 시간에 걸쳐 남긴 소중한 흔적도 유산이에요. 학습자료에서는 유수리와 가진리의 화석과 발자국 흔적을 살펴봤어요.'),
  card('형태가 있는 문화유산','건물과 비석처럼 모양이 남아 있는 유산이 있어요. 자료의 예로 김시민 장군 전공비, 촉석루, 청곡사 대웅전, 의암 사적비가 있어요.'),
  card('무형유산','춤, 음악, 기술처럼 사람들이 배우고 익혀 전하는 유산이에요. 진주검무, 진주한량무, 진주삼천포농악 등을 통해 지역의 전통을 만날 수 있어요.'),
 ]},
 {id:'environment',title:'자연과 인문환경',question:'우리 주변에서 자연이 만든 것과 사람들이 만든 것을 나누어 찾아볼까요?',cards:[
  card('자연환경과 인문환경','산, 강, 자연의 절벽 등은 자연환경이에요. 댐, 도서관, 박물관 등 사람들이 만들고 가꾸어 온 것은 인문환경이에요. 두 환경이 함께 지역의 모습을 이루어요.'),
  card('진주 8경을 살펴보아요','진주를 대표하는 여덟 풍경을 진주 8경이라고 해요. 자연 경관뿐 아니라 촉석루나 봉수대처럼 사람이 만든 시설이 어우러진 풍경도 있어요.'),
  card('제1경 진주성 촉석루','진주성 안, 남강을 바라보는 절벽 위의 누각이에요. 건물과 강의 풍경이 함께 어우러져요.'),
  card('제2경 남강 의암','촉석루 아래 남강에 있는 바위예요. 논개와 관련된 이야기가 전해지는 장소예요.'),
  card('제3경 뒤벼리','남강을 따라 길게 이어진 벼랑이에요. 강물과 절벽이 어우러진 모습을 살펴볼 수 있어요.'),
  card('제4경 새벼리','남강 주변 절벽과 길의 풍경을 만날 수 있는 곳이에요. 낮과 밤의 모습이 어떻게 다른지 생각해 보아요.'),
  card('제5경 망진산 봉수대','옛날 불과 연기로 소식을 전하던 봉수대가 있는 곳이에요. 산 위에서 진주 시내를 바라볼 수 있어요.'),
  card('제6경 비봉산의 봄','진주 시내 가까이에서 봄의 새싹과 꽃을 만날 수 있는 산의 풍경이에요.'),
  card('제7경 월아산 해돋이','월아산에서 아침 해가 떠오르는 풍경이에요. 시간에 따라 달라지는 자연의 색을 떠올려 보아요.'),
  card('제8경 진양호 노을','넓은 호수와 저녁 하늘에 노을이 어우러지는 풍경이에요.'),
  card('생활 속의 인문환경','촉석루, 국립진주박물관, 남강댐, 경상남도 산림박물관과 문화예술회관, 어린이전문도서관, 진주향교, 남강·남가람 음악분수 등이 자료에 등장해요. 각각 어떤 역할을 하는지 찾아보아요.'),
 ]},
];
export function defaultJinjuInfo(){return {version:1,sections:structuredClone(sections)}}
export function validateJinjuInfo(input){
 const fail=()=>{throw Object.assign(Error('진주 정보의 제목과 내용을 확인해 주세요.'),{status:400})};
 const str=(v,max)=>{if(typeof v!=='string'||!v.trim()||v.length>max)fail();return v.trim()};
 if(!input||input.version!==1||!Array.isArray(input.sections)||input.sections.length!==sections.length)fail();
 const result={version:1,sections:input.sections.map((s,i)=>{if(!s||s.id!==sections[i].id||!Array.isArray(s.cards)||s.cards.length<1||s.cards.length>24)fail();return {id:s.id,title:str(s.title,50),question:str(s.question,250),cards:s.cards.map(c=>({title:str(c?.title,80),text:str(c?.text,2000),...(c.image===undefined?{}:{image:c.image===''?'':typeof c.image==='string'&&lessonImage(c.image)?c.image:fail()})}))}})};
 if(new TextEncoder().encode(JSON.stringify(result)).length>65536)fail();return result;
}
