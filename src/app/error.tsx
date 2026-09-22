'use client';
export default function ErrorPage({reset}: {reset: ()=>void}){return <section className="page-title"><h1>Something went wrong.</h1><p>Please try loading the page again.</p><button className="button" onClick={reset}>Try again</button></section>;}
