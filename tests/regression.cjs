const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=fs.readFileSync('market-app-core.js','utf8');
const calc=vm.runInNewContext(core.slice(core.indexOf('function calc(s)'),core.indexOf('function state(m)'))+';calc');
const full=JSON.parse(fs.readFileSync('inputs.json','utf8')).data;
let windows=0;
for(const s of full){
 // Historical prefixes: never include bars later than the evaluated session.
 for(let end=120;end<=s.rows.length;end+=17){
  const rows=s.rows.slice(0,end),m=calc({rows}),last=rows.at(-1)[4];
  for(const n of [20,60,120])assert.ok(Math.abs(m['ma'+n]-rows.slice(-n).reduce((a,r)=>a+r[4],0)/n)<1e-8);
  assert.ok(Math.abs(m.week-(last/rows.at(-6)[4]-1)*100)<1e-8);
  assert.ok(Math.abs(m.month-(last/rows.at(-22)[4]-1)*100)<1e-8);
  assert.ok(m.rsi>=0&&m.rsi<=100);windows++;
 }
}
const input=JSON.parse(fs.readFileSync('market.json','utf8'));
for(const s of [...input.us,...input.macro,...input.kr.filter(x=>x.daily)]){
 const d=s.daily||s;if(!d.rows?.length)continue;
 assert.ok(d.rows.length<=120);assert.ok(d.metrics,'Compaction must preserve full-history metrics');
 assert.equal(d.metrics.price,d.rows.at(-1)[4]);
}
const version=fs.readFileSync('VERSION','utf8').trim();
for(const p of ['template.html','market-app.js','market-app-core.js','market-regime.js','market-brief.js','market-research.js']){
 const versions=[...fs.readFileSync(p,'utf8').matchAll(/v(2\.\d+)/g)].map(x=>x[1]);
 assert.ok(versions.every(v=>v===version),p+' has stale version labels');
}
console.log(JSON.stringify({status:'passed',historicalCalculationWindows:windows,radarStocks:full.length,note:'Calculation replay only; this is not a WATCH15/TOP5 return backtest.'}));

for(const p of ['template.html','index.html']){
 const versions=[...fs.readFileSync(p,'utf8').matchAll(/\?v=(2\.\d+)/g)].map(x=>x[1]);
 assert.ok(versions.length>0&&versions.every(v=>v===version),p+' has stale asset cache keys');
}

const review=JSON.parse(fs.readFileSync('research-review.json','utf8'));
assert.equal(new Set(review.themes.map(t=>t.id)).size,6);
assert.ok(review.reviewAfter>review.asOf);
for(const t of review.themes){
 assert.ok(t.checks.length && t.invalidate && t.evidence);
 if(t.status==='공식 원문 확인')assert.ok(t.sources.some(s=>s.type==='primary'));
 for(const s of t.sources){assert.equal(new URL(s.url).protocol,'https:');assert.ok(s.date<=review.asOf)}
}
console.log(JSON.stringify({researchThemes:review.themes.length,status:'passed'}));
