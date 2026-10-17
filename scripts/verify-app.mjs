import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const root=path.resolve('.sites-runtime/checks');
await mkdir(root,{recursive:true});
async function compile(name){const source=await readFile(`lib/${name}.ts`,'utf8');const result=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});const target=path.join(root,`${name}.mjs`);await writeFile(target,result.outputText);return import(pathToFileURL(target).href);}
const {defaults,seedListings,rankListing,matches}=await compile('apartments');
const hayes=seedListings.find(l=>l.id==='hayes'),marina=seedListings.find(l=>l.id==='marina'),studio=seedListings.find(l=>l.id==='dolores');
assert.equal(seedListings.filter(l=>matches(l,defaults)).length,7);
assert.equal(matches(studio,defaults),false);
assert.equal(matches(studio,{...defaults,beds:0}),true);
assert.equal(matches(hayes,{...defaults,max:3000}),false);
assert.equal(matches(hayes,{...defaults,neighborhoods:['Marina']}),false);
assert.equal(matches(hayes,{...defaults,amenities:['Parking']}),false);
assert.equal(matches(hayes,defaults,'HAYES'),true);
assert.equal(matches(hayes,defaults,'no such street'),false);
assert.ok(rankListing(marina,defaults).score<rankListing({...marina,fees:0},defaults).score,'Fees affect affordability');
assert.ok(rankListing(hayes,{...defaults,amenities:['Parking']}).score<rankListing(hayes,defaults).score,'Missing must-haves reduce scores');
assert.ok(rankListing(hayes,{...defaults,max:3000}).summary.includes('$3,225'),'Summary includes listed fees');
for(const l of seedListings){const r=rankListing(l,defaults);assert.ok(r.score>=20&&r.score<=99);assert.equal(r.id,l.id);assert.ok(r.flags.length);}
const {query}=await compile('database');
const oldFetch=globalThis.fetch,oldConnection=process.env.DATABASE_URL;
process.env.DATABASE_URL='postgresql://test:test@ep-example.us-east-2.aws.neon.tech/neondb';
globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.us-east-2.aws.neon.tech/sql');assert.deepEqual(JSON.parse(options.body),{query:'SELECT data WHERE user_id=$1',params:['user-example']});return Response.json({rows:[{data:{saved:['hayes']}}]});};
assert.deepEqual(await query('SELECT data WHERE user_id=$1',['user-example']),[{data:{saved:['hayes']}}]);
process.env.DATABASE_URL='postgresql://test:test@example.org/db';await assert.rejects(()=>query('SELECT 1'),/Neon/);
globalThis.fetch=oldFetch;if(oldConnection===undefined)delete process.env.DATABASE_URL;else process.env.DATABASE_URL=oldConnection;
if(process.argv.includes('--http')){const base='http://127.0.0.1:5173';const config=await fetch(`${base}/api/config`).then(r=>r.json());assert.equal('OPENAI_API_KEY' in config,false);const bad=await fetch(`${base}/api/rank`,{method:'POST',body:'{}'});assert.equal(bad.status,400);const good=await fetch(`${base}/api/rank`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({preferences:defaults,listings:seedListings})});assert.equal(good.status,200);const result=await good.json();assert.equal(result.mode,'rules');assert.equal(result.rankings.length,8);const workspace=await fetch(`${base}/api/workspace`).then(r=>r.json());assert.equal(workspace.mode,'local');}
console.log('Passed: search filters, preference scoring, fee handling, score bounds, parameterized PostgreSQL adapter'+(process.argv.includes('--http')?', HTTP validation and fallback routes.':'.'));
