import fs from 'node:fs';import assert from 'node:assert/strict';
const config=JSON.parse(fs.readFileSync('wrangler.external.jsonc','utf8'));
assert.equal(config.name,'our-region-lanterns');assert.equal(config.vars.FILE_STORAGE,'d1');assert.ok(!config.r2_buckets?.length);
assert.equal(config.d1_databases.length,1);assert.equal(config.d1_databases[0].database_name,'our-region-lanterns-db');
assert.notEqual(config.d1_databases[0].database_id,'c3ca8832-2a2e-4d2a-aaaa-86296482c39e','Never bind the original Jinju DB');
assert.ok(!Object.keys(config.vars).some(key=>/LEGACY|PRESERVED|ROSTER|ENTRY_HUB/.test(key)));
console.log('PASS independent Worker and DB configuration; no original binding, proxy environment or R2 subscription');
