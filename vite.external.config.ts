import {defineConfig} from 'vite';
import vinext from 'vinext';
import {cloudflare} from '@cloudflare/vite-plugin';
// Independent trial only. Existing Sites build continues to use vite.config.ts.
export default defineConfig({plugins:[vinext(),cloudflare({viteEnvironment:{name:'rsc',childEnvironments:['ssr']},configPath:'wrangler.external.jsonc',inspectorPort:false})]});
