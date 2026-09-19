const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=fs.readFileSync('market-app-core.js','utf8');
const calc=vm.runInNewContext(core.slice(core.indexOf('function calc(s)'),core.indexOf('function state(m)'))+';calc');
const source=fs.readFileSync('market-regime.js','utf8');
const regime=vm.runInNewContext(source.slice(source.indexOf('const esc='),source.indexOf('const css='))+';regime');
assert.equal(regime({}).score,null,'Absent market data must not produce a score');
assert.equal(regime({fear:{score:null}}).score,null,'Null sentiment must remain unavailable');
assert.equal(regime({fear:{score:0}}).score,0,'A real zero sentiment is valid');
assert.equal(regime({fear:{score:100}}).score,100);
assert.equal(regime({macro:[{symbol:'^IXIC',rows:[['2026-01-01',1,1,1,1,1]]}]}).trend,null);
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
for(const p of ['template.html','market-app.js','market-app-core.js','market-regime.js','market-brief.js']){
 const versions=[...fs.readFileSync(p,'utf8').matchAll(/v(2\.\d+)/g)].map(x=>x[1]);
 assert.ok(versions.every(v=>v===version),p+' has stale version labels');
}
console.log(JSON.stringify({status:'passed',historicalCalculationWindows:windows,radarStocks:full.length,note:'Calculation replay only; this is not a WATCH15/TOP5 return backtest.'}));

for(const p of ['template.html','index.html']){
 const versions=[...fs.readFileSync(p,'utf8').matchAll(/\?v=(2\.\d+)/g)].map(x=>x[1]);
 assert.ok(versions.length>0&&versions.every(v=>v===version),p+' has stale asset cache keys');
}
