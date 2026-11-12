import {DurableObject} from 'cloudflare:workers';
import {handle} from '../lib/lantern/api';
// No object storage, timers, credentials, or classroom data are persisted here.
// Existing D1/file bindings and all API authorization checks remain authoritative.
export class LanternApi extends DurableObject<Cloudflare.Env>{
 async fetch(request:Request):Promise<Response>{
  const start=performance.now();
  const response=await handle(request);
  const result=new Response(response.body,response);
  result.headers.set('X-Lantern-Execution','coordinated-api');
  result.headers.append('Server-Timing',`lantern_api;dur=${(performance.now()-start).toFixed(1)}`);
  return result;
 }
}
