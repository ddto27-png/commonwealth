'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { LEGACY_KEY, STORAGE_KEY, readLibrary, type SavedIdea } from '@/lib/library';

type Library = {
  records: SavedIdea[]; user: User | null; ready: boolean; busy: boolean; error: string;
  configured: boolean; localCount: number; reload: ()=>void;
  save: (id: string, note?: string)=>Promise<boolean>;
  remove: (id: string)=>Promise<boolean>; importLocal: ()=>Promise<boolean>;
};
const Context = createContext<Library | null>(null);
export function useLibrary() { const value = useContext(Context); if (!value) throw new Error('Missing library provider'); return value; }

export function LibraryProvider({children}: {children: React.ReactNode}) {
  const [records, setRecords] = useState<SavedIdea[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(''); const [localCount, setLocalCount] = useState(0);
  const [revision, setRevision] = useState(0);
  const generation = useRef(0); const locked = useRef(false);
  const local = () => readLibrary(localStorage.getItem(STORAGE_KEY), localStorage.getItem(LEGACY_KEY));
  useEffect(() => {
    let alive = true;
    async function load(nextUser: User | null) {
      const version = ++generation.current;
      setReady(false); setRecords([]); setUser(nextUser); setError('');
      try {
        // A broken guest library must not prevent opening an authenticated one.
        try { setLocalCount(local().length); } catch { setLocalCount(0); }
        let next: SavedIdea[];
        if (nextUser && supabase) {
          const {data, error} = await supabase.from('saved_stories').select('story_id,note,saved_at').eq('user_id',nextUser.id).order('saved_at',{ascending:false});
          if (error) throw error;
          next = data || [];
        } else next = local();
        if (alive && version === generation.current) { setRecords(next); setReady(true); }
      } catch {
        if (alive && version === generation.current) setError('Your saved ideas could not be loaded. Please retry before making changes.');
      }
    }
    if (!supabase) void load(null);
    else {
      void supabase.auth.getSession().then(({data,error}) => {
        if (!alive) return;
        if (error) {setError('Your session could not be loaded. Please retry.'); return;}
        void load(data.session?.user || null);
      });
    }
    const subscription = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') return;
      // Leave the auth callback before making another Supabase request.
      setTimeout(() => { if (alive) void load(session?.user || null); },0);
    }).data.subscription;
    const sync = (event: StorageEvent) => {if (event.key === STORAGE_KEY || event.key === LEGACY_KEY || event.key === null) setRevision(r=>r+1);};
    window.addEventListener('storage',sync);
    return () => {alive=false; generation.current++; subscription?.unsubscribe(); window.removeEventListener('storage',sync);};
  }, [revision]);

  async function mutate(action: 'save'|'remove'|'import', id?: string, note?: string) {
    if (!ready || locked.current) return false;
    if (note !== undefined && note.length > 10000) {setError('Notes must be 10,000 characters or fewer.'); return false;}
    locked.current=true; setBusy(true); setError(''); const version=generation.current;
    try {
      let next = records;
      if (action === 'import') {
        if (!user || !supabase) return false;
        const incoming = local();
        // Existing cloud notes always win; importing is explicit and idempotent.
        const {error} = await supabase.from('saved_stories').upsert(incoming.map(r=>({...r,user_id:user.id})),{onConflict:'user_id,story_id',ignoreDuplicates:true});
        if (error) throw error;
        const result = await supabase.from('saved_stories').select('story_id,note,saved_at').eq('user_id',user.id).order('saved_at',{ascending:false});
        if (result.error) throw result.error; next = result.data || [];
      } else if (action === 'remove') {
        if (user && supabase) {
          const {error} = await supabase.from('saved_stories').delete().eq('user_id',user.id).eq('story_id',id!);
          if (error) throw error;
        }
        next = records.filter(r=>r.story_id!==id);
      } else {
        const existing = records.find(r=>r.story_id===id);
        const record = {story_id:id!,note:note ?? existing?.note ?? '',saved_at:existing?.saved_at ?? new Date().toISOString()};
        if (user && supabase) {
          const {error} = await supabase.from('saved_stories').upsert({...record,user_id:user.id},{onConflict:'user_id,story_id'});
          if (error) throw error;
        }
        next = [record,...records.filter(r=>r.story_id!==id)];
      }
      if (!user) localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
      if (version !== generation.current) return false;
      setRecords(next); if (!user) setLocalCount(next.length); return true;
    } catch {
      if (version===generation.current) setError('Changes were not saved. Check your connection or browser storage and try again.');
      return false;
    } finally {locked.current=false; setBusy(false);}
  }
  return <Context.Provider value={{records,user,ready,busy,error,localCount,configured:!!supabase,
    reload:()=>setRevision(r=>r+1),save:(id,note)=>mutate('save',id,note),remove:id=>mutate('remove',id),importLocal:()=>mutate('import')}}>
    {children}{error && <div className="library-error" role="alert">{error} <button onClick={()=>setRevision(r=>r+1)}>Retry loading</button></div>}
  </Context.Provider>;
}
