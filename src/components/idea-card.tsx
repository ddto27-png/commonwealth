import Link from 'next/link';
import type { Idea } from '@/content/catalog';
import { Art } from './art';
import { SaveButton } from './save-button';
export function IdeaCard({idea:i}: {idea:Idea}) {
  return <article className={`idea-card ${i.color}`}><Link className="card-open" href={`/stories/${i.id}`}>
    <div className="card-art"><Art type={i.icon}/></div><span className="eyebrow">{i.category} / {i.theme}</span>
    <h3>{i.name}</h3><p>{i.title}</p></Link><SaveButton id={i.id} name={i.name} compact/></article>;
}
