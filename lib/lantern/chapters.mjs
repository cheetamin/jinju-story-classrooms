export const chapterKinds=[
{title:'진주시 소개',icon:'⌂',color:'#beceba',guide:'진주시는 어떤 지역인가요?',questions:['진주시는 어디에 있나요?','자연환경이나 지역의 특징은 무엇인가요?','친구들에게 진주를 한 문장으로 소개해 볼까요?'],example:'우리 고장 진주에는 어떤 강과 산, 마을이 있는지 조사해 보세요.',photo:'진주의 위치를 표시한 지도나 지역 풍경을 넣어 보세요.'},
{title:'진주시 역사적 인물',icon:'♙',color:'#dac4a7',guide:'진주와 관련된 인물을 소개해요.',questions:['누구를 조사했나요?','진주와 어떤 관계가 있나요?','어떤 일을 했으며, 무엇을 배울 수 있나요?'],example:'진주와 관련된 인물 한 명을 고르고, 확인한 사실을 내 말로 정리해 보세요.',photo:'인물의 초상화, 관련 유적 사진 또는 직접 그린 그림을 넣어 보세요.'},
{title:'진주시 명소, 축제',icon:'✦',color:'#bfc9e3',guide:'친구를 초대하고 싶은 곳은 어디인가요?',questions:['어떤 명소나 축제를 소개하나요?','어디에서 무엇을 보고 경험할 수 있나요?','이곳을 추천하는 이유는 무엇인가요?'],example:'명소와 축제를 각각 한 장씩 소개할 수도 있어요. 장소나 축제의 특징을 조사해 보세요.',photo:'명소의 풍경이나 축제 사진을 넣고 사진 설명을 적어 보세요.'},
{title:'진주시 특산물',icon:'❀',color:'#e6c0b3',guide:'우리 지역의 특별한 먹거리와 물건을 찾아요.',questions:['어떤 특산물을 소개하나요?','특징은 무엇이며, 진주와 어떤 관련이 있나요?','사람들에게 어떻게 소개하고 싶나요?'],example:'진주에서 생산하거나 지역을 대표하는 특산물을 찾아 특징을 조사해 보세요.',photo:'특산물 사진이나 직접 그린 홍보 그림을 넣어 보세요.'}
];
export function chapterKindsForRegion(region='우리 지역'){
 const local=text=>text.replace(/진주시는|진주시|진주와|진주를|진주/g,match=>match==='진주시는'?region+' 지역은':match==='진주와'?region+' 지역과':match==='진주를'?region+' 지역을':region);
 return chapterKinds.map(kind=>({...kind,title:local(kind.title),guide:local(kind.guide),questions:kind.questions.map(local),example:local(kind.example),photo:local(kind.photo)}));
}
export const newPage=()=>({heading:'',text:'',imageId:'',caption:'',source:''});
export const newChapters=()=>chapterKinds.map(()=>({pages:[newPage()]}));
