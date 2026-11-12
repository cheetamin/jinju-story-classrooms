export function studentChoices(list){return list.filter(student=>student.id!=='demo'&&!student.isDemo)}
export function studentDisplayName(profile){const raw=String(profile?.name||'').trim();if(/^\d+번 친구$/.test(raw))return raw;const name=raw.replace(/^\d+\s*(?:번\s*|[-.:)]\s*|\s+)(?=\S)/,'');return name&&!/^\d+$/.test(name)?name:null}
export async function loadStudioState(call){
 const status=await call('status');
 if(!status.session)return {status,students:[],record:null};
 if(status.session.role==='student'){
  const record=await call('mine',undefined,{studentId:status.session.studentId});
  // The authenticated profile is authoritative; the class roster also contains
  // published work that an already signed-in editor does not need to download.
  if(record?.profile)return {status,students:[],record};
  return {status,students:studentChoices(await call('students')),record};
 }
 return {status,students:studentChoices(await call('students')),record:null};
}
