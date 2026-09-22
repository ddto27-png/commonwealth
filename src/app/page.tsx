import { Suspense } from 'react';
import Link from 'next/link';
import { Featured } from '@/components/featured';
import { Catalog } from '@/components/catalog';
import { Art } from '@/components/art';
export default function Home(){return <><section className="hero"><div className="edition eyebrow">The collection <span>№ 001</span></div><h1>Explore ideas worth keeping.</h1><p>New apps, creative projects, and businesses worth knowing about.</p><div className="pull-note handwritten">Find something good.<br/>Take a little piece.<span>↙</span></div></section>
  <Featured/><div className="board-caption"><span>Drag to explore. Or simply tap to open.</span><span>Keep what catches your eye. Come back for more.</span></div>
  <section className="feature-row" aria-label="More ways to explore"><Link href="/places" className="feature blue"><span className="eyebrow">Out in the world</span><h2>Explore places.</h2><p>Discover the places behind the projects, from Paris to Greenland.</p><span className="link-arrow">Open the map ↗</span><Art type="map"/></Link>
  <a href="#collection" className="feature yellow"><span className="eyebrow">See where an idea takes you</span><h2>Follow your curiosity.</h2><p>Browse by interest. Find a connection. Keep a few favorites.</p><span className="link-arrow">Explore the collection ↗</span><Art type="collage"/></a></section>
  <Suspense fallback={<p>Loading collection…</p>}><Catalog/></Suspense></>;}
