'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLibrary } from './library-provider';

export function Navigation() {
  const pathname = usePathname(); const router = useRouter(); const {records, user} = useLibrary();
  useEffect(() => {
    // Preserve bookmarks made by the original hash router.
    const routes: Record<string,string> = {'#ideas':'/', '#places':'/places', '#saved':'/saved', '#about':'/about'};
    const redirect = () => { const to = routes[location.hash]; if (to) router.replace(to); };
    redirect(); window.addEventListener('hashchange', redirect);
    return () => window.removeEventListener('hashchange', redirect);
  }, [router]);
  return <header><Link className="wordmark" href="/" aria-label="Curio home">curio<span className="brand-star">✳</span></Link>
    <nav aria-label="Main navigation">{[['/','Explore ideas'],['/places','Places'],['/saved','Saved ideas'],['/about','About']].map(([href,label]) => {
      const active = pathname === href || (href === '/' && pathname.startsWith('/stories/'));
      return <Link key={href} href={href} className={active?'active':''} aria-current={active?'page':undefined}>{label}{href==='/saved' && <span id="saved-count">{records.length}</span>}</Link>;
    })}</nav><Link className="account-link" href="/account">{user ? 'Account' : 'Log in'}</Link></header>;
}
