import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const read=(name,fallback)=>fs.existsSync(path.join(dir,name))?JSON.parse(fs.readFileSync(path.join(dir,name),'utf8')):fallback;
const write=(name,value)=>fs.writeFileSync(path.join(dir,name),JSON.stringify(value,null,2)+'\n');
export const fingerprint=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function catalog(){
  const data=vm.runInNewContext(fs.readFileSync(path.join(dir,'../data.js'),'utf8')+';({ideas:IDEAS,places:PLACES})',{}, {timeout:1000});
  const ideas=data.ideas.map(i=>({id:'idea:'+i.id,name:i.name,kind:'Website idea',copy:i,factual:['name','title','maker','year','description','url','source'],interpretive:['why','prompt'],urls:[i.url]}));
  const places=data.places.map(p=>({id:'place:'+p.id,name:p.name,kind:'Map entry',copy:p,factual:['name','country','label','note','lat','lon'],interpretive:[],urls:[data.ideas.find(i=>i.id===p.id).url,`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=4/${p.lat}/${p.lon}`]}));
  const candidates=read('candidates.json',[]).map(c=>({id:'candidate:'+c.id,name:c.name,kind:'Candidate',copy:c,factual:['name','summary','audience','technology','freshness','caveat','url'],interpretive:['why'],urls:[...new Set([c.url,...c.sources.map(s=>s.url)])]}));
  // Review static marketing copy too; claims in templates must not escape editorial review.
  const pages=['index.html','about.js','app.js'].map(file=>({id:'page:'+file,name:file,kind:'Website template',copy:{content:fs.readFileSync(path.join(dir,'..',file),'utf8')},factual:['content'],interpretive:[],urls:[]}));
  return [...ideas,...places,...candidates,...pages].map(r=>({...r,hash:fingerprint(r.copy)}));
}
export function blockers(record,review,links,now=Date.now()){
  const issues=[];
  if(!review || review.hash!==record.hash) issues.push('Copy has not been reviewed at this exact version.');
  if(!review?.approvedBy || !review?.approvedAt || !Number.isFinite(Date.parse(review.approvedAt))) issues.push('Dana’s proofreading approval is missing.');
  if(record.interpretive.length && !review?.interpretationNote) issues.push('Check that interpretation and prompts do not imply unsupported facts.');
  for(const field of record.factual){
    const evidence=review?.fields?.[field];
    const age=now-Date.parse(evidence?.checkedAt);
    if(!evidence || evidence.verdict!=='supported' || !evidence.note || !evidence.reviewer || !Array.isArray(evidence.sources) || !evidence.sources.length || !Number.isFinite(age) || age<0 || age>14*86400000) issues.push(`${field}: needs a current source-to-copy comparison.`);
  }
  const urls=[...new Set([...record.urls,...Object.values(review?.fields||{}).flatMap(f=>f.sources||[])])];
  for(const url of urls){
    const link=links[url],age=now-Date.parse(link?.checkedAt);
    if(!link || link.state!=='reachable' || !Number.isFinite(age) || age<0 || age>7*86400000) issues.push(`Link needs checking: ${url}`);
    if(link?.redirected && review?.acceptedDestinations?.[url]!==link.finalUrl) issues.push(`Confirm redirected destination: ${url}`);
    if(link?.bodyHash && review?.sourceHashes?.[url]!==link.bodyHash) issues.push(`Source version has not been accepted: ${url}`);
  }
  return issues;
}
export async function checkLink(url,previous,fetcher=fetch){
  const checkedAt=new Date().toISOString();
  try{
    let current=new URL(url); if(!['http:','https:'].includes(current.protocol)) throw Error('Unsupported scheme');
    let response;
    for(let hop=0;hop<6;hop++){
      // Only public source URLs belong here. No credentials are sent, and cookies are not stored.
      if(current.username||current.password||/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[)/i.test(current.hostname)) throw Error('Non-public destination');
      response=await fetcher(current.href,{redirect:'manual',signal:AbortSignal.timeout(15000),headers:{'User-Agent':'CommonwealthSourceCheck/1.0'}});
      if(response.status>=300&&response.status<400&&response.headers.get('location')){await response.body?.cancel(); current=new URL(response.headers.get('location'),current);continue;}
      break;
    }
    const finalUrl=current.href;
    if(!response.ok){await response.body?.cancel();return {checkedAt,state:[401,403,429].includes(response.status)?'blocked':'unavailable',status:response.status,finalUrl,redirected:finalUrl!==url};}
    let text='',size=0;const reader=response.body?.getReader();
    if(reader)for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2000000){await reader.cancel();throw Error('Response too large; inspect manually');}text+=new TextDecoder().decode(value);}
    const bodyHash=fingerprint(text);
    return {checkedAt,state:'reachable',status:response.status,finalUrl,redirected:finalUrl!==url,bodyHash,changed:!!previous?.bodyHash&&previous.bodyHash!==bodyHash,title:(text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'').replace(/\s+/g,' ').slice(0,250)};
  }catch(error){return {checkedAt,state:'unconfirmed',error:error.message};}
}
export function build(){
  const records=catalog(),reviews=read('reviews.json',{}),links=read('links.json',{});
  const report={generatedAt:new Date().toISOString(),records:records.map(r=>({...r,review:reviews[r.id]||null,blockers:blockers(r,reviews[r.id],links)})),links};
  fs.writeFileSync(path.join(dir,'proof-data.js'),'window.PROOF_DATA = '+JSON.stringify(report).replace(/</g,'\\u003c')+';\n');
  write('proof-report.json',report);
  console.log(`${records.length} records; ${report.records.filter(r=>!r.blockers.length).length} cleared for publication.`);
  return report;
}
export async function main(args){
  if(args[0]==='links'){
    const old=read('links.json',{}),reviews=read('reviews.json',{});
    const urls=[...new Set([...catalog().flatMap(r=>r.urls),...Object.values(reviews).flatMap(r=>Object.values(r.fields||{}).flatMap(f=>f.sources||[]))])];
    for(let i=0;i<urls.length;i+=4)await Promise.all(urls.slice(i,i+4).map(async url=>{old[url]=await checkLink(url,old[url]);console.log(`${old[url].state}: ${url}`);}));
    write('links.json',old);build();
  }else if(args[0]==='build')build();
  else if(args[0]==='gate'){
    if(!args[1])throw Error('Provide one or more record IDs to gate.');
    const report=build();for(const id of args.slice(1)){const r=report.records.find(r=>r.id===id);if(!r||r.blockers.length)throw Error(`${id} is not cleared for publication`);}
  }else throw Error('Usage: node pipeline/proof.mjs links | build | gate idea:ID [place:ID ...]');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});
