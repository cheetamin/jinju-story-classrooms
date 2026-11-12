import {handle} from '../lib/lantern/api';
import {externalFetch} from './external-routing.mjs';
export default {fetch(request:Request,env:Cloudflare.Env & {ASSETS:Fetcher}){return externalFetch(request,env,handle)}};
