const fs=require('fs'),vm=require('vm');
async function main(){
const input=JSON.parse(fs.readFileSync('inputs.json','utf8')),now=new Date(),kst=now.toLocaleString('sv-SE',{timeZone:'Asia/Seoul'}),ny=now.toLocaleString('sv-SE',{timeZone:'America/New_York'}),nyDate=ny.slice(0,10),finishedToday=ny.slice(11,16)>='16:00';
for(const stock of input.data){
const response=await fetch(stock.source,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error(stock.ticker+' source HTTP '+response.status);
const raw=(await response.json()).chart.result?.[0];if(!raw)throw Error(stock.ticker+' missing source result');const q=raw.indicators.quote[0];
const rows=raw.timestamp.map((t,i)=>[new Date(t*1000).toLocaleDateString('sv-SE',{timeZone:'America/New_York'}),q.open[i],q.high[i],q.low[i],q.close[i],q.volume[i]]).filter(r=>r[0]<nyDate||(finishedToday&&r[0]===nyDate));
const valid=r=>r.slice(1).every(Number.isFinite)&&r[2]>=Math.max(r[1],r[3],r[4])&&r[3]<=Math.min(r[1],r[2],r[4])&&r[5]>=0;
const rejectedRows=rows.filter(r=>!valid(r)),clean=rows.filter(valid);
// Keep the last verified input when the provider's new rows cannot support a full calculation.
// Rejected raw provider rows are retained with their source URL for an audit trail.
if(clean.length<252||(Date.parse(nyDate)-Date.parse(clean.at(-1)?.[0]||'1970-01-01'))/86400000>7){stock.refreshError=stock.ticker+' source invalid/stale; retained last verified OHLCV';stock.rejectedRows=rejectedRows;stock.refreshCheckedAt=now.toISOString();continue}
Object.assign(stock,{rows:clean,rejectedRows,refreshError:null,quotePrice:clean.at(-1)[4],quoteVolume:clean.at(-1)[5],quoteTime:raw.meta.regularMarketTime,downloadedAt:now.toISOString(),splits:raw.events?.splits||{},crossQuote:{close:null,volume:null}});
}
let h=fs.readFileSync('template.html','utf8');
const date=kst.slice(0,10),last=input.data.map(s=>s.rows.at(-1)[0]).sort().at(-1);
if(input.data.some(s=>s.rows.at(-1)[0]!==last))console.warn('Some radar tickers retain older verified sessions; check each source card');
h=h.replace(/Tenbagger Radar v2\.6 · \d{4}-\d{2}-\d{2}/g,'Tenbagger Radar v2.6 · '+date).replace('정규장 종가 · USD / meta','정규장 종가 · USD / quote.close');
h=h.replace('/*__INPUTS__*/','const stocks='+JSON.stringify(input.data)+';const korean='+JSON.stringify(input.kr)+';');
h=h.replace(/2026-09-14 KST/g,date+' KST').replace('2026-09-11 16:00 EDT / 2026-09-12 05:00 KST 정규장 종가',last+' 미국 정규장 완료 일봉');
h=h.replace('미국 정규장 개장 전이며 당일 프리마켓 시세는 반영하지 않음.','실행시각 '+kst+' KST. 완료된 정규장 일봉만 반영하며 장중·프리마켓 시세는 포함하지 않음.');
h=h.replace('Yahoo Finance metadata 종가·일별 OHLCV, Stock Analysis 및 MarketMinute 교차 확인. 시간대 변환은 계산값.','Yahoo Finance quote.close·일별 OHLCV. 이번 자동 갱신의 타 공급자 교차 확인은 미완료.');
// Event calendar expires explicitly; unverified future events remain conservative.
const fomc=date>='2026-09-09'&&date<='2026-09-17',expiry=date>='2026-09-12'&&date<='2026-09-19',fda=date<='2026-09-27';
h=h.replace('10-4-2-2-(stock.ticker',`10-${fomc?4:0}-${expiry?2:0}-4-(stock.ticker`).replace("stock.ticker==='PRAX'?2:stock.ticker==='TEM'||stock.ticker==='RKLB'?1:0",`stock.ticker==='PRAX'&&${fda}?2:0`).replace("if(stock.ticker==='PRAX'){",`if(stock.ticker==='PRAX'&&${fda}){`);
h=h.replace('FOMC · 09/15–16','기존 확인 일정 · FOMC 2026/09/15–16').replace('이벤트 리스크 · Fact → 시장 해석','이벤트 일정 · 확인된 원본 기록');
h=h.replace('<div class="events">','<p class="callout">일정 내용은 최초 분석에서 확인된 기록입니다. 예약 갱신은 시세·차트 계산을 갱신하며 새 실적·기업 일정은 자동 검증하지 않습니다. 미확인 이벤트 위험으로 4점을 보수적으로 차감합니다. 지난 일정은 새로운 이벤트로 해석하지 마세요.</p><div class="events">');
h=h.replace('기본 10점에서 이번 FOMC 4점, 옵션 만기 2점, 다음 실적일 미확인 2점 차감. PRAX FDA 2점, TEM·RKLB 행사 각각 1점,','기본 10점에서 미확인 이벤트 4점 차감. 확인된 FOMC·옵션 만기 주간에 각각 4점·2점, PRAX FDA 목표일까지 2점 추가 차감.');
const start=h.indexOf('function sourceCard(s)'),end=h.indexOf('function render()',start);
h=h.slice(0,start)+`function sourceCard(s){return '<details id="source-'+s.ticker+'"><summary>'+s.ticker+' · 이번 갱신 원자료</summary><p>'+link(s.source,'Yahoo Finance OHLCV')+' · '+link(s.ir,'공식 IR · 다음 실적 재확인 필요')+'</p><p>조회시각 '+(s.refreshCheckedAt||s.downloadedAt)+' · '+(s.refreshError?esc(s.refreshError)+' · ':'')+'제외한 공급자 오류 행 '+(s.rejectedRows?.length||0)+'개 (원자료는 inputs.json에 보관) · 완료 일봉 '+s.rows.at(-1)[0]+' · 원자료 행 수 '+s.rows.length+' (계산값). 종가·거래량은 quote.close·quote.volume. 타 공급자 교차 확인 미완료. Investment는 최초 원본 평가 의견.</p><pre style="white-space:pre-wrap;overflow-wrap:anywhere">'+esc(JSON.stringify(s.rows.slice(-5)))+'</pre></details>'}\n`+h.slice(end);
const sourceCallout=h.indexOf('<div class="callout"><b>출처 차이');if(sourceCallout>=0){const ending=h.indexOf('</div>',sourceCallout);h=h.slice(0,sourceCallout)+'<p class="note">최초 교차 확인과 출처 차이는 지난 목록에서 확인하세요. 이번 갱신은 Yahoo 일별 원자료를 사용합니다.</p>'+h.slice(ending+6);}
const scripts=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)];for(const s of scripts)new vm.Script(s[1]);
// Archive only when composition or published opinion changes; preserve every old input date via snapshot.
fs.mkdirSync('history',{recursive:true});let history=fs.existsSync('history/index.json')?JSON.parse(fs.readFileSync('history/index.json','utf8')):[];
const context=vm.createContext({});vm.runInContext(h.slice(h.indexOf('function mean'),h.indexOf('const esc=')),context);const signature=vm.runInContext('JSON.stringify(stocks.map(s=>[s.ticker,analyze(s).opinion,analyze(s).grade]))',context);
const previous=fs.existsSync('signature.json')?JSON.parse(fs.readFileSync('signature.json','utf8')):null;
if(previous!==signature){const path='history/'+now.toISOString().replace(/[:.]/g,'-')+'.html';fs.writeFileSync(path,h.replace(/<link rel="stylesheet" href="market\.css[^"]*">/g,'').replace(/<script src="market-app\.js[^"]*"><\/script>/g,''));history.unshift({path,label:kst+' KST · 종목/진입 의견 목록'});}
if(!history.some(x=>x.path==='history/2026-09-14-initial.html'))history.push({path:'history/2026-09-14-initial.html',label:'최초 분석 목록 · 2026-09-14'});
fs.writeFileSync('history/index.json',JSON.stringify(history,null,2));fs.writeFileSync('signature.json',JSON.stringify(signature));fs.writeFileSync('index.html',h);fs.writeFileSync('inputs.json',JSON.stringify(input));console.log('Refreshed verified OHLCV '+kst+' KST; daily bars '+last);
}
main().catch(e=>{console.error(e.message);process.exit(1)});
