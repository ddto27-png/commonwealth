import type { Metadata } from 'next';
import { LibraryProvider } from '@/components/library-provider';
import { Navigation } from '@/components/navigation';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Curio — Ideas worth sharing', template: '%s | Curio' },
  description: 'Creative projects, technology, and businesses worth making something of.',
};
export default function Layout({children}: {children: React.ReactNode}) {
  return <html lang="en"><body><LibraryProvider><a className="skip" href="#main">Skip to content</a>
    <div className="site-shell"><Navigation/><main id="main" tabIndex={-1}>{children}</main>
    <footer><Link className="wordmark small" href="/">curio<span>✳</span></Link>
      <p>Ideas worth sharing. Possibilities worth exploring.</p><Link href="/about">About the collection · Edition 001</Link></footer></div>
  </LibraryProvider></body></html>;
}
