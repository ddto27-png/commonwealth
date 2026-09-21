import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { build as buildProof } from './proof.mjs';

const folder = path.dirname(fileURLToPath(import.meta.url));
export const normalizeName = value => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
export function canonicalUrl(value) {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw Error('Expected a public HTTP(S) URL');
  url.hash = '';
  url.hostname = url.hostname.replace(/^www\./, '');
  for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  return url.hostname + url.pathname.replace(/\/+$/, '') + url.search;
}
export function validate(item) {
  for (const key of ['id', 'name', 'url', 'summary', 'audience', 'technology', 'why', 'category', 'freshness', 'caveat', 'checkedAt']) {
    if (typeof item[key] !== 'string' || !item[key].trim()) throw Error(`Missing ${key}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) throw Error('Invalid id');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.checkedAt) || Number.isNaN(Date.parse(item.checkedAt))) throw Error('Invalid checkedAt date');
  canonicalUrl(item.url);
  if (!Array.isArray(item.sources) || !item.sources.length) throw Error('At least one checked source is required');
  for (const source of item.sources) {
    if (!source.title || !source.evidence) throw Error('Sources need titles and supporting evidence');
    canonicalUrl(source.url);
  }
  if (!item.sources.some(s => s.primary === true)) throw Error('A primary source is required');
  if (!['pending', 'keep', 'pass'].includes(item.status)) throw Error('Invalid status');
  return item;
}
export function ingest(queue, incoming, published = []) {
  if (!Array.isArray(queue) || !Array.isArray(incoming)) throw Error('Expected arrays');
  queue.forEach(validate);
  // Validate the entire batch before accepting anything. Incoming status cannot approve a candidate.
  const batch = incoming.map(item => validate({...item, status: 'pending', decisions: []}));
  const result = structuredClone(queue), skipped = [];
  for (const item of batch) {
    const duplicate = [...published, ...result].find(old => old.id === item.id || normalizeName(old.name) === normalizeName(item.name) || canonicalUrl(old.url) === canonicalUrl(item.url));
    if (duplicate) skipped.push({id: item.id, duplicateOf: duplicate.id});
    else result.push(item);
  }
  return {queue: result, skipped};
}
export function decide(queue, id, status, note) {
  if (!['pending', 'keep', 'pass'].includes(status) || !note?.trim()) throw Error('Use pending, keep or pass, with a reason');
  const result = structuredClone(queue), item = result.find(i => i.id === id);
  if (!item) throw Error(`Unknown candidate: ${id}`);
  item.status = status;
  item.decisions = [...(item.decisions || []), {status, note, at: new Date().toISOString()}];
  return result;
}
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
export function render(queue) {
  queue.forEach(validate);
  const groups = ['pending', 'keep', 'pass'].map(status => {
    const items = queue.filter(i => i.status === status);
    return `<section><h2>${{pending:'To explore',keep:'Kept for an edition',pass:'Passed over'}[status]} <small>${items.length}</small></h2>${items.map(i => `<article><span class="eyebrow">${escape(i.category)} · checked ${escape(i.checkedAt)}</span><h3>${escape(i.name)}</h3><p class="intro">${escape(i.summary)}</p><dl>${[['Who it serves',i.audience],['How technology helps',i.technology],['Why it fits Commonwealth',i.why],['How new is it?',i.freshness],['Before featuring',i.caveat]].map(([k,v])=>`<dt>${k}</dt><dd>${escape(v)}</dd>`).join('')}</dl><p><a href="${escape(i.url)}" target="_blank" rel="noopener noreferrer">Explore the project ↗</a></p><details><summary>Sources & review history</summary>${i.sources.map(s=>`<p><a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)}</a> — ${escape(s.evidence)}</p>`).join('')}${(i.decisions||[]).map(d=>`<p>${escape(d.at)} · ${escape(d.status)}: ${escape(d.note)}</p>`).join('')}</details><p class="instruction">Tell Codex: “Keep ${escape(i.name)}” or “Pass on ${escape(i.name)}”. Keeping an idea does not publish it.</p></article>`).join('') || '<p>Nothing here yet.</p>'}</section>`;
  }).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Commonwealth — Research inbox</title><style>body{background:#f3efe5;color:#292f29;font:16px/1.6 Arial;margin:0}main{max-width:900px;margin:50px auto;padding:0 24px}a{color:inherit;text-underline-offset:4px}h1,h2,h3{font-family:Georgia;font-weight:400;line-height:1.1}h1{font-size:clamp(42px,7vw,76px);margin:22px 0}h2{font-size:32px;border-top:1px solid #aaa;padding-top:28px;margin-top:44px}h3{font-size:36px;margin:14px 0}small{font:14px Arial;color:#697764}article{background:#faf7ee;padding:28px;margin:20px 0;border-top:4px solid #d8bd61;box-shadow:0 6px 16px #00000008}.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:1.3px}.intro{font-size:19px}dt{font-weight:bold;font-size:12px;margin-top:18px}dd{margin:4px 0;font-size:14px}.instruction{background:#e9e4d7;padding:13px;font-size:12px}details{font-size:13px}summary{cursor:pointer}header p{max-width:650px}.note{font-size:12px;color:#62685e}a:focus-visible,summary:focus-visible{outline:3px solid #53766a;outline-offset:4px}</style></head><body><main><header><a href="../index.html">commonwealth ✳</a><p class="eyebrow">The research inbox</p><h1>New ideas to<br>make something of.</h1><p>A working shortlist for our next editions. Read, explore, and tell Codex what catches your eye.</p><p class="note">This is an editorial queue, separate from the website collection. Its contents are public in our GitHub repository. “New” means new to Commonwealth unless a launch date is verified.</p></header>${groups}</main></body></html>\n`;
}
function atomicWrite(filename, contents) {
  const temp = `${filename}.${process.pid}.tmp`;
  fs.writeFileSync(temp, contents);
  fs.renameSync(temp, filename);
}
export function main(args) {
  const file = path.join(folder, 'candidates.json');
  let queue = JSON.parse(fs.readFileSync(file, 'utf8'));
  queue.forEach(validate);
  const [command, ...rest] = args;
  if (command === 'ingest') {
    const published = vm.runInNewContext(fs.readFileSync(path.join(folder, '../data.js'), 'utf8') + '\nIDEAS;', {}, {timeout:1000});
    const result = ingest(queue, JSON.parse(fs.readFileSync(rest[0], 'utf8')), published);
    console.log(JSON.stringify({added:result.queue.length-queue.length,skipped:result.skipped}));
    queue = result.queue;
  } else if (command === 'decide') {
    queue = decide(queue, rest[0], rest[1], rest.slice(2).join(' '));
  } else if (!['check', 'render'].includes(command)) {
    throw Error('Usage: node pipeline/queue.mjs check | render | ingest batch.json | decide ID keep|pass|pending REASON');
  }
  if (command !== 'check') {
    atomicWrite(file, JSON.stringify(queue, null, 2) + '\n');
    atomicWrite(path.join(folder, 'inbox.html'), render(queue).replace('</header>', '<p><a href="proof.html">Open the proofreading desk ↗</a></p></header>'));
    buildProof();
  }
  console.log(`${queue.length} candidates validated; ${queue.filter(i=>i.status==='pending').length} awaiting review.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
