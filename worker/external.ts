import {externalFetch} from './external-routing.mjs';
import {dispatchApi} from './api-dispatch.mjs';
export {LanternApi} from './api-coordinator';
type ExternalEnv=Cloudflare.Env & {ASSETS:Fetcher;LANTERN_API:DurableObjectNamespace};
export default {fetch(request:Request,env:ExternalEnv){return externalFetch(request,env,(incoming:Request)=>dispatchApi(incoming,env.LANTERN_API))}};
