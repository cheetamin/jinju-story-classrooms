'use client';
export function FestivalBackdrop(){return <div className="festival-backdrop" aria-hidden="true"><img src="/art/namgang-night-v2.png" alt="" draggable={false}/><div className="water-glitter"/>{Array.from({length:18},(_,i)=><i key={i} className="festival-spark" style={{left:((i*43+7)%99)+'%',top:((i*17+3)%32)+'%',animationDelay:-(i%7)+'s'}}/>)}</div>}
