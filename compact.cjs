/* Calculation results are generated from complete downloaded OHLCV; chart windows alone are shortened. */
const compactFs=require('fs'),compactVm=require('vm'),app=compactFs.readFileSync('market-app-core.js','utf8');
const calcStart=app.indexOf('function calc(s)'),calcEnd=app.indexOf('function state(m)');
if(calcStart<0||calcEnd<=calcStart)throw new Error('calc(s) source not found in market-app-core.js');
const calcSource=app.slice(calcStart,calcEnd);
const compactContext=compactVm.createContext({});compactVm.runInContext(calcSource,compactContext);
const full=JSON.parse(compactFs.readFileSync('market.json','utf8'));
for(const stock of [...full.us,...full.macro,...full.kr.filter(s=>s.daily)]){
 const daily=stock.daily||stock;compactContext.stock=stock;daily.metrics=compactVm.runInContext('calc(stock)',compactContext);
 daily.maSeries=Object.fromEntries([20,60,120].map(n=>['m'+n,daily.rows.map((_,i)=>i+1<n?null:daily.rows.slice(i+1-n,i+1).reduce((sum,r)=>sum+r[4],0)/n).slice(-120)]));
 daily.rows=daily.rows.slice(-120);
}
compactFs.writeFileSync('market.json',JSON.stringify(full));
console.log('Published calculated metrics plus 120-bar chart windows. Original source URLs retained.');
