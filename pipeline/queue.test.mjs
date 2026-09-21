import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalUrl, ingest, decide, render} from './queue.mjs';
const sample = {id:'test',name:'Test',url:'https://example.com/item',summary:'A thing',audience:'People',technology:'Sensors',why:'A useful connection',category:'Design',freshness:'Unknown launch date',caveat:'Prototype',checkedAt:'2026-09-21',sources:[{title:'Maker',url:'https://example.com/item',evidence:'Describes a prototype',primary:true}],status:'pending'};
test('normalizes URL variants without merging different products',()=>{
  assert.equal(canonicalUrl('https://www.example.com/item/?utm_source=x#hello'),canonicalUrl(sample.url));
  assert.notEqual(canonicalUrl('https://example.com/other'),canonicalUrl(sample.url));
});
test('retries and tracking URLs do not create duplicates or reset decisions',()=>{
  const queue=decide(ingest([], [sample]).queue,'test','pass','Not a fit');
  const result=ingest(queue,[{...sample,id:'another',url:sample.url+'?utm_source=news'}]);
  assert.equal(result.queue.length,1); assert.equal(result.queue[0].status,'pass');
  assert.equal(result.queue[0].decisions.length,1);
});
test('published names are deduped and imported approvals are ignored',()=>{
  assert.equal(ingest([], [sample], [{id:'old',name:'TEST!',url:'https://other.example'}]).queue.length,0);
  assert.equal(ingest([], [{...sample,status:'keep'}]).queue[0].status,'pending');
});
test('bad evidence and unsafe URLs fail the whole batch without mutation',()=>{
  const queue=[];
  assert.throws(()=>ingest(queue,[sample,{...sample,id:'bad',sources:[]}]),/source/);
  assert.throws(()=>ingest(queue,[{...sample,url:'javascript:alert(1)'}]),/HTTP/);
  assert.equal(queue.length,0);
});
test('decisions require an existing ID and a reason',()=>{
  assert.throws(()=>decide([sample],'missing','keep','yes'),/Unknown/);
  assert.throws(()=>decide([sample],'test','keep',''),/reason/);
});
test('inbox escapes external content',()=>{
  const html=render([{...sample,name:'<script>alert(1)</script>'}]);
  assert.ok(!html.includes('<script>')); assert.ok(html.includes('&lt;script&gt;'));
});
