import {test} from 'node:test';
import assert from 'node:assert/strict';
import {externalFetch} from '../worker/external-routing.mjs';

test('pages and files use assets without rendering or calling the API',async()=>{
 let calls=0;
 const env={ASSETS:{fetch:async req=>{calls++;assert.equal(new URL(req.url).search,'?class=existing');return new Response('static shell')}}};
 const response=await externalFetch(new Request('https://test.local/studio?class=existing'),env,()=>{throw Error('API must not run')});
 assert.equal(await response.text(),'static shell');assert.equal(calls,1);
});
test('API reads and writes retain the full request and never use asset fallback',async()=>{
 for(const method of ['GET','POST']){
  const req=new Request('https://test.local/api/work?class=existing',{method,headers:{Cookie:'private=1'},...(method==='POST'?{body:'draft'}:{})});
  const response=await externalFetch(req,{ASSETS:{fetch(){throw Error('must not serve HTML')}}},async r=>{assert.equal(r,req);return Response.json({ok:true},{status:method==='POST'?201:200,headers:{'Cache-Control':'no-store'}})});
  assert.equal(response.status,method==='POST'?201:200);assert.equal(response.headers.get('Cache-Control'),'no-store');
 }
});
test('API exceptions fail closed with JSON instead of leaking exception or serving HTML',async()=>{
 const response=await externalFetch(new Request('https://test.local/api/status'),{},()=>{throw Error('private exception')});
 assert.equal(response.status,503);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.ok(!(await response.text()).includes('private exception'));
});
test('unsupported methods cannot invoke handlers',async()=>{
 const response=await externalFetch(new Request('https://test.local/api/work',{method:'DELETE'}),{},()=>{throw Error('must not run')});
 assert.equal(response.status,405);
});
