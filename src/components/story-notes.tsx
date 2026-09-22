'use client';
import { useEffect, useState } from 'react';
import { useLibrary } from './library-provider';
export function StoryNotes({id}:{id:string}) {
  const library=useLibrary();const record=library.records.find(r=>r.story_id===id);
  if(!library.ready)return <p className="storage-note">Loading your library…</p>;
  return <Editor key={`${library.user?.id||'guest'}:${id}`} id={id} initial={record?.note||''}/>;
}
function Editor({id,initial}:{id:string;initial:string}) {
  const {save,busy,user}=useLibrary();const [note,setNote]=useState(initial);const [baseline,setBaseline]=useState(initial);const [message,setMessage]=useState('');
  const dirty=note!==baseline;
  useEffect(()=>{
    const warn=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}};
    const guard=(e:MouseEvent)=>{const a=(e.target as Element).closest?.('a');if(dirty&&a&&a.target!=='_blank'&&!window.confirm('Leave without saving your note?')){e.preventDefault();e.stopPropagation();}};
    window.addEventListener('beforeunload',warn);document.addEventListener('click',guard,true);
    return()=>{window.removeEventListener('beforeunload',warn);document.removeEventListener('click',guard,true);};
  },[dirty]);
  return <form className="notes" onSubmit={async e=>{e.preventDefault();setMessage('Saving…');if(await save(id,note)){setBaseline(note);setMessage('Note saved.');}else setMessage('Your note was not saved. Keep this page open and try again.');}}>
    <label htmlFor={`note-${id}`}>Your private note</label><p className="storage-note">{user?'Only you can access this note.':'Saved in this browser. Log in to keep notes across devices.'}</p>
    <textarea id={`note-${id}`} maxLength={10000} rows={5} value={note} onChange={e=>{setNote(e.target.value);setMessage('Unsaved changes');}} placeholder="What could you use this for?"/>
    <button className="button" disabled={busy}>Save idea & note</button><span className="note-status" role="status">{message}</span></form>;
}
