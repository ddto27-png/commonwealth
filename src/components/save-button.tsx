'use client';
import { useLibrary } from './library-provider';
export function SaveButton({id, name, compact=false}: {id:string; name:string; compact?:boolean}) {
  const {records,save,remove,ready,busy}=useLibrary(); const record=records.find(r=>r.story_id===id);
  return <button className={compact?'save':'button secondary'} disabled={!ready||busy} aria-pressed={!!record}
    aria-label={`${record?'Remove':'Save'} ${name}`} onClick={()=>{
      if(record) {if(!record.note || window.confirm('Remove this idea and its note from your library?')) void remove(id);}
      else void save(id);
    }}>{compact ? (record?'✓':'+') : record?'Saved — remove':'＋ Save idea'}</button>;
}
