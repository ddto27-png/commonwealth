import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readLibrary, filterIdeas } from '../src/lib/library';

test('migrates legacy saves, removes duplicates and unknown IDs',()=>{
  assert.deepEqual(readLibrary(null,'["osmo","osmo","unknown"]' ).map(r=>r.story_id),['osmo']);
});
test('an intentionally emptied new library does not resurrect legacy saves',()=>{
  assert.deepEqual(readLibrary('[]','["osmo"]'),[]);
});
test('corrupt storage throws rather than silently replacing existing saves',()=>{
  assert.throws(()=>readLibrary('{bad','[]'));
});
test('notes are retained as text, including HTML-like characters',()=>{
  const note='<script>alert(1)</script>';
  assert.equal(readLibrary(JSON.stringify([{story_id:'osmo',note,saved_at:'2026-09-22'}]),null)[0].note,note);
});
test('filters OR categories, AND themes, and match maker text',()=>{
  const result=filterIdeas('', ['Apps','Technology'],['Memory']);
  assert.ok(result.some(i=>i.id==='polycam'));assert.ok(result.some(i=>i.id==='remento'));
  assert.ok(result.every(i=>['Apps','Technology'].includes(i.category)&&i.theme==='Memory'));
  assert.deepEqual(filterIdeas('  Ioannis  ',[],[]).map(i=>i.id),['coperni']);
});
test('retired stories retain their private notes in the new library',()=>{
  assert.equal(readLibrary(JSON.stringify([{story_id:'retired',note:'Keep my thinking',saved_at:'2026-09-22'}]),null)[0].note,'Keep my thinking');
});
