'use client';
import { useState } from 'react';
import Link from 'next/link';
import { IDEAS } from '@/content/catalog';
import { IdeaCard } from './idea-card';
import { useLibrary } from './library-provider';
export function SavedLibrary(){
  const {records,user,ready}=useLibrary();const [query,setQuery]=useState('');
  const items=records.map(record=>({record,idea:IDEAS.find(i=>i.id===record.story_id)})).filter(({record,idea})=>[idea?.name,idea?.title,record.note].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  return <><section className="page-title"><span className="eyebrow">Your own little collection</span><h1>Keep a little inspiration.</h1><p>The stories that caught your eye, and the thoughts they started.</p>
    <p className="storage-note">{user?'Your private library, saved to your account.':<>Saved in this browser. <Link href="/account">Log in to keep ideas across devices.</Link></>}</p>
    <label className="search">Search your library<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a story or note…"/></label></section>
    {!ready?<p role="status">Loading your library…</p>:<section className="idea-grid saved-grid" aria-label="Saved ideas">{items.length?items.map(({idea,record})=><div key={record.story_id}>{idea?<IdeaCard idea={idea}/>:<h2>Story unavailable</h2>}{record.note && <p className="saved-note">{record.note}</p>}{idea && <Link className="note-link" href={`/stories/${idea.id}`}>Open story & edit note ↗</Link>}</div>):<div className="empty"><h2>{records.length?'No matching ideas.':'Something will catch your eye.'}</h2><p>{records.length?'Try another word from a story or note.':'Save an idea and add a thought of your own.'}</p><Link className="button" href="/">Explore ideas ↗</Link></div>}</section>}</>;
}
