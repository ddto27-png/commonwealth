'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLibrary } from './library-provider';
export function Account(){
  const {user,configured,localCount,importLocal,busy,ready}=useLibrary();
  const [email,setEmail]=useState('');const [code,setCode]=useState('');const [sent,setSent]=useState(false);
  const [pending,setPending]=useState(false);const [message,setMessage]=useState('');
  async function submit(e:React.FormEvent){e.preventDefault();if(!supabase)return;setPending(true);setMessage('');
    try {const result=sent?await supabase.auth.verifyOtp({email,token:code,type:'email'}):await supabase.auth.signInWithOtp({email});
      if(result.error)throw result.error;
      if(sent)setMessage('You’re signed in.');else{setSent(true);setMessage('Check your email for a sign-in code.');}
    }catch{setMessage(sent?'The code could not be verified. Check it or request a new one.':'We couldn’t send a code. Please try again.');}finally{setPending(false);}}
  return <section className="page-title account-page"><span className="eyebrow">Your corner of Curio</span><h1>{user?'Your account.':'Keep your curiosity.'}</h1>
    {!configured?<><p>Account sign-in is coming soon. You can explore, save stories, and add notes in this browser now.</p><Link className="button" href="/saved">Open saved ideas</Link></>:user?<>
      <p>Signed in as {user.email}</p><p>Your saved stories and notes are private.</p><Link className="button" href="/saved">Open your library</Link>
      {localCount>0 && <div className="import-box"><p>This browser has {localCount} saved ideas. Import them into this account? Existing account notes will be kept.</p><button className="button" disabled={busy||!ready} onClick={async()=>setMessage(await importLocal()?'Browser ideas imported.':'Import failed. Your browser ideas are still here.')}>Import browser ideas</button></div>}
      <button className="button secondary" disabled={pending} onClick={async()=>{setPending(true);const result=await supabase!.auth.signOut();setMessage(result.error?'Sign-out failed. Please retry.':'Signed out.');setPending(false);}}>Log out</button>
    </>:<><p>Save stories and private notes across your devices. We’ll email you a sign-in code.</p><form className="account-form" onSubmit={submit}>
      <label>Email<input required type="email" autoComplete="email" value={email} readOnly={sent} onChange={e=>setEmail(e.target.value)}/></label>
      {sent && <label>Sign-in code<input required type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value.trim())}/></label>}
      <button className="button" disabled={pending}>{pending?'Please wait…':sent?'Verify code':'Send sign-in code'}</button>
      {sent && <button type="button" className="button secondary" onClick={()=>{setSent(false);setCode('');setMessage('');}}>Use another email or resend</button>}</form></>}
    <p role="status">{message}</p></section>;
}
