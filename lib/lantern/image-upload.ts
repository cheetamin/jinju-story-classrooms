// Resize and compress on the device; no external image conversion service.
export async function optimizeUpload(file:File):Promise<File>{
 if(!/\.(png|jpe?g|webp)$/i.test(file.name))return file;
 let bitmap:ImageBitmap;
 try{bitmap=await createImageBitmap(file)}catch{throw Error('사진을 열 수 없어요. PNG, JPG, WEBP 파일을 확인해 주세요.')}
 try{
  if(bitmap.width*bitmap.height>50000000)throw Error('사진 크기가 너무 커요. 5천만 화소 이하로 줄여 주세요.');
  const target=128*1024;
  if(Math.max(bitmap.width,bitmap.height)<=1600&&file.size<=target)return file;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)throw Error('사진 압축을 지원하지 않는 브라우저예요.');
  let best:Blob|null=null;
  for(const edge of [1600,1280,1024]){
   const ratio=Math.min(1,edge/Math.max(bitmap.width,bitmap.height));
   canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
   ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
   for(const quality of [.82,.70,.58,.46]){
    const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',quality));
    if(!blob)throw Error('사진 압축을 완료하지 못했어요.');
    if(!best||blob.size<best.size)best=blob;
    if(blob.size<=target)return new File([blob],file.name.replace(/\.[^.]+$/,blob.type==='image/webp'?'.webp':'.png'),{type:blob.type});
    // A browser that does not support WebP cannot adjust PNG quality.
    if(blob.type!=='image/webp')break;
   }
  }
  if(!best||best.size>1024*1024)throw Error('사진 용량이 커요. 필요한 부분만 잘라서 다시 올려 주세요.');
  return new File([best],file.name.replace(/\.[^.]+$/,best.type==='image/webp'?'.webp':'.png'),{type:best.type});
 }finally{bitmap.close()}
}
