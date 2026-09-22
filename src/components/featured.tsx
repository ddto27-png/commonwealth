'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IDEAS, FEATURED_IDS, type Idea } from '@/content/catalog';
import { Art } from './art';
function Notice({idea:i,index}:{idea:Idea;index:number}) {
  const router=useRouter(); const start=useRef<number|null>(null);const dragged=useRef(false);const [distance,setDistance]=useState(0);
  return <article className={`notice ${i.color}`}><div className="art-panel"><Art type={i.icon}/></div>
    <Link className="tab" href={`/stories/${i.id}`} style={{transform:distance?`translateY(${distance/2}px) rotate(${distance/25}deg)`:undefined}}
      onPointerDown={e=>{if(e.button!==0)return;start.current=e.clientY;dragged.current=false;e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove={e=>{if(start.current===null)return;const delta=Math.max(0,e.clientY-start.current);if(delta>5)dragged.current=true;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setDistance(Math.min(delta,100));}}
      onPointerUp={e=>{if(start.current===null)return;const delta=e.clientY-start.current;start.current=null;setDistance(0);if(delta>45)router.push(`/stories/${i.id}`);}}
      onPointerCancel={()=>{start.current=null;setDistance(0);dragged.current=false;}}
      onClick={e=>{if(dragged.current){e.preventDefault();dragged.current=false;}}}>
      <span className="tab-no">0{index+1} / {i.category.toUpperCase()}</span><strong>{i.name}</strong><span className="tab-title">{i.title}</span><span className="tab-arrow">↗</span></Link></article>;
}
export function Featured(){return <section className="board" aria-label="Four featured ideas"><div className="board-top"><span>Four ideas. Plenty of possibilities.</span><span>Pull a tab ↓</span></div><div className="board-grid">{FEATURED_IDS.map((id,index)=><Notice key={id} idea={IDEAS.find(i=>i.id===id)!} index={index}/>)}</div></section>;}
