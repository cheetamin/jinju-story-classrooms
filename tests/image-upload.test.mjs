import {test} from 'node:test';import assert from 'node:assert/strict';import {optimizeUpload} from '../lib/lantern/image-upload.ts';
test('large image adapts encoding to a small upload and closes its bitmap',async()=>{
 const previous={bitmap:globalThis.createImageBitmap,document:globalThis.document};let closed=0,attempts=0;
 globalThis.createImageBitmap=async()=>({width:2400,height:1800,close(){closed++}});
 globalThis.document={createElement(){return {width:0,height:0,getContext(){return {drawImage(){}}},toBlob(done,type,quality){attempts++;done(new Blob([new Uint8Array(quality>.8?900000:quality>.65?260000:100000)],{type}))}}}};
 try{const output=await optimizeUpload(new File([new Uint8Array(2000000)],'photo.png',{type:'image/png'}));assert.ok(output.size<=128*1024,'large photo should be reduced before thirty clients upload it');assert.equal(output.type,'image/webp');assert.equal(closed,1);assert.ok(attempts>1)}finally{globalThis.createImageBitmap=previous.bitmap;globalThis.document=previous.document}
});
test('non-image files pass through unchanged',async()=>{const f=new File(['%PDF-1.7'],'lesson.pdf',{type:'application/pdf'});assert.equal(await optimizeUpload(f),f)});
