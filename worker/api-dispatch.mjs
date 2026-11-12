// Internal binding only: the same authenticated API, on a larger free CPU budget.
export async function dispatchApi(request,namespace){
 if(!namespace)return Response.json({error:'서버 연결을 준비하고 있어요. 잠시 후 다시 시도해 주세요.'},{status:503,headers:{'Cache-Control':'no-store'}});
 const room=new URL(request.url).searchParams.get('class');
 const name=room&&/^[a-f0-9-]{36}$/.test(room)?'class:'+room:'platform';
 return namespace.get(namespace.idFromName(name)).fetch(request);
}
