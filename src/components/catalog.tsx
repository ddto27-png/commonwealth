'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES, THEMES } from '@/content/catalog';
import { filterIdeas } from '@/lib/library';
import { IdeaCard } from './idea-card';
export function Catalog() {
  const params = useSearchParams(); const router=useRouter();
  const query=params.get('q')||''; const categories=params.getAll('category'); const themes=params.getAll('theme');
  const items=filterIdeas(query,categories,themes);
  function update(key:string,value:string,toggle=false) {
    const next=new URLSearchParams(params.toString());
    if(toggle) {const values=next.getAll(key);next.delete(key);for(const item of values.filter(v=>v!==value))next.append(key,item);if(!values.includes(value))next.append(key,value);}
    else {if(value)next.set(key,value);else next.delete(key);}
    router.replace(`/?${next.toString()}#collection`,{scroll:false});
  }
  return <section id="collection" className="library"><div className="section-heading"><div><span className="eyebrow">A growing collection</span><h2>More to get curious about.</h2><p>Art, technology, and everyday ideas that open up possibilities.</p></div>
    <label className="search">Search<input type="search" value={query} placeholder="Find an idea…" onChange={e=>update('q',e.target.value)}/></label></div>
    {([['category','Category',CATEGORIES,categories],['theme','Theme',THEMES,themes]] as const).map(([key,label,options,selected])=><fieldset className="filter-group" key={key}><legend>{label}</legend><div className="filters">{options.map(option=><button className={`filter ${selected.includes(option)?'active':''}`} aria-pressed={selected.includes(option)} key={option} onClick={()=>update(key,option,true)}>{option}</button>)}</div></fieldset>)}
    <p className="count-label" role="status">{items.length} ideas to explore {(query||categories.length>0||themes.length>0) && <button className="plain-link" onClick={()=>router.replace('/#collection',{scroll:false})}>Clear filters</button>}</p>
    <div className="idea-grid">{items.length?items.map(i=><IdeaCard key={i.id} idea={i}/>):<div className="empty"><h3>No ideas found this time.</h3><p>Try another word or clear your filters.</p></div>}</div></section>;
}
