/* Calculation results are generated from complete downloaded OHLCV; chart windows alone are shortened. */
const compactFs=require('fs'),compactVm=require('vm'),app=compactFs.readFileSync('market-app.js','utf8');
const calcSource=app.slice(app.indexOf('function calc(s)'),app.indexOf('function state(m)'));
const compactContext=compactVm.createContext({});compactVm.runInContext(calcSource,compactContext);
const full=JSON.parse(compactFs.readFileSync('market.json','utf8'));
for(const stock of [...full.us,...full.macro,...full.kr.filter(s=>s.daily)]){
 const daily=stock.daily||stock;compactContext.stock=stock;daily.metrics=compactVm.runInContext('calc(stock)',compactContext);
 daily.rows=daily.rows.slice(-120);
}
compactFs.writeFileSync('market.json',JSON.stringify(full));
console.log('Published calculated metrics plus 120-bar chart windows. Original source URLs retained.');
