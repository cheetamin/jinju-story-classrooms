'use client';
import {useEffect,useRef} from 'react';
export const animals=['토끼','수달','남생이','학','여우','고양이','강아지','곰','펭귄','호랑이','사슴','다람쥐','부엉이','병아리','너구리','오리','고슴도치','물범','돌고래','코끼리','판다','양'];
export const colors=['#ffd0e4','#cd9471','#a9da7b','#fff0d0','#ffba72','#ffe1aa','#e8b585','#d69c75','#b4c9ef','#ffc85f','#ddaa76','#e7ad75','#d6af8c','#ffdf72','#c0a795','#ffe48d','#c59f91','#d9dcfa','#9ecbf3','#b7c5ee','#f3ead8','#f3e4c4'];
export function paintAnimal(c:CanvasRenderingContext2D,n:number){c.clearRect(0,0,40,44);const color=colors[n%colors.length];const rect=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};const ellipse=(x:number,y:number,rx:number,ry:number,col:string)=>{for(let yy=-ry;yy<=ry;yy++)for(let xx=-rx;xx<=rx;xx++)if(xx*xx/(rx*rx)+yy*yy/(ry*ry)<=1)rect(x+xx,y+yy,1,1,col)};const ear=(x:number,y:number,w:number,h:number)=>{rect(x-1,y-1,w+2,h+2,'#654457');rect(x,y,w,h,color);rect(x+1,y+2,Math.max(1,w-2),Math.max(2,h-4),'#e6a1a4')};
// Body, outline and feet share a 40 x 44 pixel footprint for every student.
ellipse(20,29,11,11,'#654457');ellipse(20,28,10,10,color);ellipse(20,31,6,7,'#fff0ce');ellipse(11,37,5,3,color);ellipse(28,37,5,3,color);
if([4,5,9].includes(n)){for(let j=0;j<8;j++){rect(9+j/2|0,7+j,8-j,1,color);rect(24-j/2|0,7+j,8-j,1,color)}}
else if(n===0){ear(11,1,5,17);ear(24,1,5,17)}else if(n===10){rect(10,1,2,17,'#cc955c');rect(28,1,2,17,'#cc955c');rect(6,5,7,2,'#cc955c');rect(28,5,7,2,'#cc955c');rect(6,1,2,6,'#cc955c');rect(33,1,2,6,'#cc955c')}
else if([1,6].includes(n)){ear(6,12,6,17);ear(28,12,6,17)}else if(n===19){ellipse(8,20,7,10,color);ellipse(31,20,7,10,color)}else if(![2,3,8,13,15,17,18].includes(n)){ellipse(11,12,5,5,n===20?'#55526c':color);ellipse(29,12,5,5,n===20?'#55526c':color)}
if(n===11||n===4){ellipse(33,29,6,10,color);ellipse(34,25,4,5,n===4?'#fff0ce':'#b97754')}
if(n===16)for(let a=0;a<11;a++)rect(6+a*2,12+(a%2)*2,3,5,'#865b57');
ellipse(20,21,12,11,'#654457');ellipse(20,20,11,10,color);
if(n===2){ellipse(19,30,10,7,'#6baf6c');rect(14,27,9,2,'#d1e59a');rect(18,24,2,12,'#d1e59a')}
if(n===8){ellipse(20,21,12,11,'#677da1');ellipse(20,23,9,9,'#fff4de')}
if(n===3){rect(16,9,8,3,'#e97d7a');rect(29,23,9,3,'#eab56a');rect(15,37,2,4,'#bd935f');rect(25,37,2,4,'#bd935f')}
if(n===12){ellipse(14,20,6,7,'#fff1cf');ellipse(26,20,6,7,'#fff1cf')}
if(n===14||n===20){ellipse(13,21,5,4,'#625366');ellipse(27,21,5,4,'#625366')}
if(n===9){rect(18,10,4,5,'#a76f42');rect(9,17,5,2,'#a76f42');rect(27,17,5,2,'#a76f42');rect(9,25,4,2,'#a76f42');rect(28,25,4,2,'#a76f42')}
if(n===18){rect(8,21,23,7,color);rect(28,24,9,3,color);rect(15,7,5,6,color)}
if(n===21){ellipse(8,16,4,5,'#b5947b');ellipse(32,16,4,5,'#b5947b');for(let k=0;k<5;k++)ellipse(10+k*5,11+(k%2),3,3,'#fff4dd');}
rect(13,20,3,4,'#473c52');rect(25,20,3,4,'#473c52');rect(13,20,1,1,'#fff9ed');rect(25,20,1,1,'#fff9ed');
ellipse(10,25,3,2,'#edac9e');ellipse(30,25,3,2,'#edac9e');
if([3,8,12,13,15].includes(n)){rect(18,25,6,3,'#eaa653');rect(20,28,2,1,'#eaa653')}else {rect(19,25,3,2,'#78525b');rect(18,28,5,1,'#78525b')}
if(n===19){rect(18,25,6,10,color);rect(18,33,10,3,color)}
rect(12,40,16,2,'#ffe9a7');}
export function Animal({n=0,className=''}:{n?:number;className?:string}){const index=((n%22)+22)%22;return <span className={'animal animal-atlas '+className} style={{backgroundPosition:`${(index%6)*20}% ${Math.floor(index/6)*100/3}%`}} aria-label={animals[index]} role="img"/>}
export function Landscape(){const ref=useRef<HTMLCanvasElement>(null);useEffect(()=>{const c=ref.current!.getContext('2d')!;let frame=0,last=0;const rand=(n:number)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(Math.floor(x),Math.floor(y),w,h)};const poly=(p:number[][],col:string)=>{c.fillStyle=col;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()};const pavilion=(x:number,y:number,scale=1)=>{c.save();c.translate(x,y);c.scale(scale,scale);r(-43,6,86,8,'#d9a45e');r(-35,-23,70,29,'#ffc773');for(let i=-30;i<35;i+=15){r(i,-23,4,30,'#a75d52');r(i+4,-20,7,20,'#345d64');r(i+4,-17,7,2,'#d8cf99')}r(-45,-27,90,5,'#ffd187');poly([[-53,-27],[-37,-34],[-15,-46],[0,-49],[15,-46],[37,-34],[53,-27]],'#50627b');for(let i=-36;i<=36;i+=8)poly([[i,-29],[i*.3,-47],[i+3,-29]],'#788396');poly([[-54,-29],[-38,-36],[0,-50],[38,-36],[54,-29],[39,-32],[0,-47],[-39,-32]],'#f8d587');r(-4,-53,8,5,'#f4bc72');c.restore()};
const draw=(ms:number)=>{frame=requestAnimationFrame(draw);if(ms-last<50)return;last=ms;const t=ms/1000;c.clearRect(0,0,960,540);const sky=c.createLinearGradient(0,0,0,540);sky.addColorStop(0,'#111d3d');sky.addColorStop(.42,'#39466a');sky.addColorStop(.43,'#243d58');sky.addColorStop(1,'#162d46');c.fillStyle=sky;c.fillRect(0,0,960,540);for(let i=0;i<110;i++){const x=rand(i)*960,y=rand(i+600)*180;const bright=Math.sin(t*.8+i)>0;r(x,y,i%11===0?2:1,i%11===0?2:1,bright?'#e7deb9':'#7886a2');if(i%23===0){r(x-2,y+1,6,1,'#c5baa0');r(x,y-1,1,5,'#c5baa0')}}
c.fillStyle='#ffdf9b';c.beginPath();c.arc(777,77,20,0,Math.PI*2);c.fill();c.fillStyle='#1b2948';c.beginPath();c.arc(784,70,19,0,Math.PI*2);c.fill();
poly([[0,180],[50,152],[95,171],[160,133],[215,164],[292,145],[368,181],[440,154],[500,185],[590,140],[660,165],[730,134],[790,158],[870,137],[960,162],[960,230],[0,230]],'#223849');
for(let i=0;i<75;i++){const x=i*14,y=180+rand(i+4)*24;poly([[x,y-25],[x-18,y],[x-10,y],[x-22,y+15],[x+20,y+15],[x+11,y],[x+17,y]],i%2?'#1a3742':'#294444')}
// Jinju fortress and Chokseokru, drawn from simple original pixel geometry.
poly([[0,205],[85,180],[150,183],[226,203],[330,218],[330,236],[0,230]],'#b68b67');for(let i=0;i<55;i++){let x=i*6,y=205-Math.sin(i/14)*20;r(x,y,4,5,'#dfb878');r(x,y+8,5,2,'#7e6a59')}pavilion(125,177,1.3);pavilion(820,203,.85);r(750,209,160,9,'#ac8661');
for(let i=0;i<40;i++){const x=rand(i+77)*960,y=220+rand(i+8)*9;r(x,y,2,5,'#ffdc83');r(x-2,y+2,6,1,'#c49961')}
for(let i=0;i<720;i++){const x=(rand(i+100)*960+Math.sin(t*.3+i)*5),y=238+rand(i+900)*240;const palette=['#33556c','#406077','#536679','#776c76','#9a8278','#c99b6a'];r(x,y,3+rand(i+11)*15,1,palette[i%palette.length]);}
for(let k=0;k<12;k++){const x=rand(k+55)*960,y=250+rand(k+87)*190;const shift=Math.sin(t*.4+k)*4;for(let i=0;i<10;i++)r(x+Math.sin(t+i)*6-6,y+i*4,5+rand(i+k)*12,1,i%2?'#a88164':'#e4b773');r(x+shift,y-6,5,7,'#ffdb8c');r(x+shift+1,y-8,3,2,'#f3a66c')}
// Foreground garden and boardwalk.
poly([[0,460],[140,478],[330,490],[630,490],[820,476],[960,457],[960,540],[0,540]],'#46434e');for(let i=0;i<100;i++){const x=rand(i+919)*960,y=493+rand(i+544)*45;r(x,y,15+rand(i)*20,2,i%2?'#786456':'#9b7d60')}
r(0,478,960,5,'#b88a61');r(0,484,960,4,'#5e4a4a');for(let i=0;i<24;i++){const x=i*43;r(x,471,5,34,'#8a6251');r(x,470,6,3,'#d6a16d')}
for(const x of [35,245,715,925]){r(x,452,7,57,'#84584a');r(x-7,437,21,26,'#5c4747');r(x-4,441,15,17,'#ffd58b');r(x+2,441,3,17,'#aa7652');r(x-9,434,25,4,'#e4a96c');r(x-4,429,15,5,'#b78457')}
for(let side=0;side<2;side++)for(let i=0;i<42;i++){const x=side===0?rand(i+66)*175:785+rand(i+66)*175,y=500+rand(i+899)*40;r(x,y,7,12,'#557362');r(x-2,y,11,5,['#c69ca8','#e0a4ae','#8b91ba','#dec5a9'][i%4]);r(x+2,y-3,4,11,['#c69ca8','#e0a4ae','#8b91ba','#dec5a9'][i%4]);r(x+2,y+1,3,3,'#f4d5a4')}
};frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame)},[]);return <canvas ref={ref} className="landscape" width={960} height={540} aria-hidden="true"/>}
export function Visitor({x=50}:{x?:number}){return <div className="visitor visitor-pair" style={{left:x+'%'}} role="group" aria-label="함께 전시를 구경하는 여학생과 남학생"><img src="/art/visitor-back-v2.png" alt="분홍 리본 모자와 노란 가방을 멘 여학생" draggable={false}/><img src="/art/visitor-boy-back-v1.png" alt="초록 띠 모자와 초록 가방을 멘 남학생" draggable={false}/></div>}
