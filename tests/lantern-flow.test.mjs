import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as flow from '../lib/lantern/classrooms.mjs';
test('new visits shuffle every student exactly once without changing the source roster',()=>{
 const roster=Array.from({length:40},(_,i)=>({id:String(i+1)}));
 assert.equal(typeof flow.lanternOrder,'function');
 const a=flow.lanternOrder(roster,123),b=flow.lanternOrder(roster,987);
 assert.deepEqual(a.map(x=>x.id).sort(),roster.map(x=>x.id).sort());
 assert.notDeepEqual(a,b);assert.deepEqual(a,flow.lanternOrder(roster,123));
 assert.equal(roster[0].id,'1');
});
test('flow phases cover one loop evenly, with a different starting position per visit',()=>{
 for(const columns of [1,2,8,14]){
  const phases=Array.from({length:columns},(_,i)=>flow.lanternPhase(i,columns,.17));
  assert.ok(phases.every(p=>p<=0&&p>-flow.LANTERN_FLOW_SECONDS));
  if(columns>1){const sorted=phases.map(p=>-p/flow.LANTERN_FLOW_SECONDS).sort((a,b)=>a-b);for(let i=0;i<sorted.length;i++)assert.ok(Math.abs(((sorted[(i+1)%columns]-sorted[i]+1)%1)-1/columns)<1e-8)}
  assert.notEqual(flow.lanternPhase(0,columns,.17),flow.lanternPhase(0,columns,.63));
 }
});
