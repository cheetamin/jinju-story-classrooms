// Share pending status reads only. Never cache credentials or completed responses.
export function createStatusRequests(){
 const pending=new Map();
 return {
  read(key,load){
   if(pending.has(key))return pending.get(key);
   const request=Promise.resolve().then(load).finally(()=>{if(pending.get(key)===request)pending.delete(key)});
   pending.set(key,request);return request;
  },
  invalidate(){pending.clear()}
 };
}
