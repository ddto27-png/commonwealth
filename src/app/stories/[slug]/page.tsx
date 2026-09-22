import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IDEAS } from '@/content/catalog';
import { Art } from '@/components/art';
import { StoryNotes } from '@/components/story-notes';
import { SaveButton } from '@/components/save-button';
export function generateStaticParams(){return IDEAS.map(i=>({slug:i.id}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const i=IDEAS.find(i=>i.id===slug);return {title:i?.name||'Story not found',description:i?.title};}
export default async function Story({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const i=IDEAS.find(i=>i.id===slug);if(!i)notFound();
  return <article className="story-page"><Link href="/#collection" className="back-link">← Explore ideas</Link><div className={`detail-art ${i.color}`}><Art type={i.icon}/></div>
    <div className="detail-body"><span className="eyebrow">{i.category} / {i.theme} / {i.year}</span><h1>{i.name}</h1><p className="detail-subtitle">{i.title}</p>
    {[['What it is',i.description],['Who made it',i.maker],['Why it’s interesting',i.why]].map(([label,value])=><div className="detail-row" key={label}><strong>{label}</strong><p>{value}</p></div>)}
    <div className="try-prompt"><span className="eyebrow">Something to try</span>{i.prompt}</div><div className="detail-actions"><a className="button" href={i.url} target="_blank" rel="noopener noreferrer">Visit project ↗</a><SaveButton id={i.id} name={i.name}/></div>
    <p className="source-note">Source: {i.source} · Original research: September 2026.<br/>Connections and prompts are our editorial interpretation.</p><StoryNotes id={i.id}/></div></article>;
}
