import test from 'node:test';
import assert from 'node:assert/strict';
import {blockers,checkLink,fingerprint} from './proof.mjs';
const now=Date.now(),date=new Date(now).toISOString(),url='https://example.com/';
const record={hash:'v1',factual:['description'],interpretive:['why'],urls:[url]};
const review={hash:'v1',approvedBy:'Dana',approvedAt:date,interpretationNote:'Clearly editorial, without new factual claims.',fields:{description:{verdict:'supported',note:'Meaning and scope match.',reviewer:'Researcher',sources:[url],checkedAt:date}},sourceHashes:{[url]:'body1'}};
const links={[url]:{state:'reachable',checkedAt:date,bodyHash:'body1'}};
test('fully evidenced and approved version clears',()=>assert.deepEqual(blockers(record,review,links,now),[]));
test('copy edits invalidate approval',()=>assert.ok(blockers({...record,hash:'v2'},review,links,now).length));
test('source changes and stale checks invalidate clearance',()=>{
 assert.ok(blockers(record,review,{[url]:{...links[url],bodyHash:'body2'}},now).length);
 assert.ok(blockers(record,review,links,now+15*86400000).length);
});
test('a successful link does not clear unsupported copy',()=>assert.ok(blockers(record,{...review,fields:{}},links,now).length));
test('a redirect requires destination confirmation',()=>assert.ok(blockers(record,review,{[url]:{...links[url],redirected:true,finalUrl:'https://example.org/'}},now).length));
test('blocked pages stay unconfirmed rather than being called broken',async()=>{
 const result=await checkLink(url,null,async()=>new Response('',{status:403}));assert.equal(result.state,'blocked');
});
test('source errors do not clear previous warnings',async()=>{
 const result=await checkLink(url,null,async()=>{throw Error('timeout');});assert.equal(result.state,'unconfirmed');
});
test('fingerprint catches small wording changes',()=>assert.notEqual(fingerprint({text:'may help'}),fingerprint({text:'helps'})));
