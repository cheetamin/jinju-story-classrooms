// Static assets contain no classroom data. Only the authenticated API runs here.
export async function externalFetch(request,env,handleApi){
 const path=new URL(request.url).pathname;
 if(path==='/api'||path.startsWith('/api/')){
  if(!['GET','POST'].includes(request.method))return Response.json({error:'허용되지 않은 요청이에요.'},{status:405,headers:{Allow:'GET, POST','Cache-Control':'no-store'}});
  try{return await handleApi(request)}catch{return Response.json({error:'서버에서 처리하지 못했어요. 잠시 후 다시 시도해 주세요.'},{status:503,headers:{'Cache-Control':'no-store'}})}
 }
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
 return env.ASSETS.fetch(request);
}
