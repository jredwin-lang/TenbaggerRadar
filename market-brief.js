/* Verified market data + dated public headlines. No fabricated prices or article body summaries. */
(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=v=>Number.isFinite(v)?new Intl.NumberFormat('ko-KR',{maximumFractionDigits:2,signDisplay:'exceptZero'}).format(v)+'%':'확인 불가';
const kst=t=>Number.isFinite(Date.parse(t))?new Date(t).toLocaleString('sv-SE',{timeZone:'Asia/Seoul'}).slice(0,16)+' KST':'시각 확인 불가';
const url=s=>{try{return new URL(s).protocol==='https:'?s:''}catch{return ''}};
const link=(s,label)=>url(s)?'<a href="'+esc(s)+'" target="_blank" rel="noopener">'+esc(label)+'</a>':esc(label);
function daily(s){const r=s?.daily?.rows||s?.rows;return {change:r?.length>1&&r.at(-2)[4]>0?(r.at(-1)[4]/r.at(-2)[4]-1)*100:null,date:r?.at(-1)?.[0]||null,source:s?.source||s?.daily?.source}}
const topics=[
 {test:/\bfed\b|federal reserve|interest.rate|treasury|bond.yield/i,name:'금리·연준',risk:'금리 또는 채권수익률이 다시 상승하면 성장주의 가치평가 부담이 커질 수 있습니다',check:'금리 관련 제목의 방향을 연준 원문·국채수익률과 대조',source:'https://www.federalreserve.gov/monetarypolicy.htm'},
 {test:/inflation|\bcpi\b|\bpce\b|consumer.price/i,name:'물가',risk:'물가 압력이 재확인되면 통화정책 완화 기대가 약해질 수 있습니다',check:'실제 물가 발표치와 이전 수치·예상치를 구분',source:'https://www.bls.gov/cpi/'},
 {test:/earnings|profit|guidance|revenue/i,name:'실적',risk:'매출 성장과 이익·가이던스가 엇갈리면 실적 발표 후 변동성이 커질 수 있습니다',check:'해당 기업 IR의 실적과 향후 가이던스 확인',source:null},
 {test:/oil|crude|iran|hormuz|war|tariff/i,name:'정책·공급 충격',risk:'공급 차질이나 관세가 실제 비용 증가로 이어지는지 확인이 필요합니다',check:'보도된 정책·사건과 실제 시행·공급 차질을 구분',source:null},
 {test:/wall street|stocks|s&p|nasdaq|dow/i,name:'미국증시',risk:'지수 상승이 일부 대형주에 집중되면 종목 전반의 반등으로 확대 해석하기 어렵습니다',check:'지수 방향과 상승·하락 종목 수의 일치 여부 확인',source:'https://finviz.com/map.ashx?t=sp500'}
];
function selectNews(data){
 const cutoff=Date.parse(data.enrichment?.retrievedAt||data.retrievedAt),all=(data.enrichment?.morningNews||[]).filter(a=>url(a.url)&&Date.parse(a.publishedAt)<=cutoff&&cutoff-Date.parse(a.publishedAt)<=72*3600000);
 const recent=all.filter(a=>cutoff-Date.parse(a.publishedAt)<=24*3600000),pool=recent.length?recent:all;
 const priority=['WSJ','Bloomberg','NYT','Reuters','Financial Times','CNBC'],seen=new Set();
 return {recent:recent.length>0,cutoff,items:pool.slice().sort((a,b)=>(priority.indexOf(a.publisher)<0?99:priority.indexOf(a.publisher))-(priority.indexOf(b.publisher)<0?99:priority.indexOf(b.publisher))||Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).filter(a=>{if(seen.has(a.publisher))return false;seen.add(a.publisher);return true}).slice(0,6)};
}
function build(data){
 const m=s=>daily(data.macro?.find(x=>x.symbol===s)),nas=m('^IXIC'),sp=m('^GSPC'),dow=m('^DJI'),rut=m('^RUT'),vix=m('^VIX'),dollar=m('DX-Y.NYB'),oil=m('CL=F'),gold=m('GC=F');
 const leaves=data.heatmap?.leaves?.filter(x=>Number.isFinite(x.change))||[],adv=leaves.filter(x=>x.change>0).length,dec=leaves.filter(x=>x.change<0).length;
 const news=selectNews(data),themes=topics.map(t=>({...t,article:news.items.find(a=>t.test(a.title))})).filter(t=>t.article);
 const sentences=[
 {kind:'Fact',text:(nas.date||'거래일 확인 불가')+' 미국 완료 일봉에서 S&P 500 '+pct(sp.change)+', 나스닥 '+pct(nas.change)+', 다우 '+pct(dow.change)+', 러셀2000 '+pct(rut.change)+'로 집계됐습니다.',href:'https://finance.yahoo.com/markets/us/',label:'지수 출처'},
 {kind:'Fact → Opinion',text:leaves.length?'Finviz 조회 스냅샷은 상승 '+adv+'개·하락 '+dec+'개이며, '+(Number.isFinite(nas.change)&&nas.change>0&&adv<dec?'나스닥 상승과 종목 전반의 약세가 엇갈려 대형주 중심의 상승 가능성을 점검해야 합니다':adv>dec?'상승 종목이 더 많지만 한 차례의 확산만으로 상승 추세 지속을 확정하기는 어렵습니다':'하락 종목이 더 많아 개별 종목의 추세 회복을 추가 확인해야 합니다')+'.':'상승·하락 종목 원자료가 없어 시장 전반의 참여 정도는 확인 불가입니다.',href:'https://finviz.com/map.ashx?t=sp500',label:'시장폭 출처'},
 {kind:'Fact → Opinion',text:'각 자산의 최근 완료 일봉에서 VIX '+pct(vix.change)+', 달러 '+pct(dollar.change)+', WTI '+pct(oil.change)+', 금 '+pct(gold.change)+'가 관찰됐으며, '+(Number.isFinite(vix.change)?vix.change<0?'변동성 지수 하락은 확인되지만 위험이 해소됐다는 뜻은 아닙니다':'변동성 지수 상승 여부를 종목별 위험 한도와 함께 점검해야 합니다':'변동성 방향을 판단할 자료가 부족합니다')+'.',href:'https://finance.yahoo.com/quote/%5EVIX/',label:'VIX 출처'},
 {kind:'기사 → Opinion',text:themes.length?kst(themes[0].article.publishedAt)+' 발행 '+themes[0].article.publisher+' 기사의 공개 제목에서 '+themes[0].name+' 이슈가 확인돼, '+themes[0].check+'이 필요합니다.':'현재 수집 구간에서 해석 근거로 사용할 경제 전문지 기사를 확인하지 못해 뉴스 원인은 판단을 보류합니다.',href:themes[0]?.article.url,label:'관련 기사'},
 {kind:'Opinion',text:themes.length?themes[0].risk+'; 지수·시장폭 개선이 함께 이어지는 상승 시나리오와 개선이 중단되는 하락 시나리오를 나눠 대응하는 편이 합리적입니다.':'단기에는 지수와 시장폭의 동반 개선을, 중기에는 기업 가이던스를, 장기에는 현금흐름을 확인하며 상승 지속과 반등 실패 가능성을 함께 점검하는 편이 합리적입니다.',href:themes[0]?.article.url,label:'해석 근거 기사'}
 ];
 return {sentences,news,themes,nas,sp,dow,rut,vix,dollar,oil,gold,adv,dec};
}
function render(data){
 const host=document.querySelector('#pane-macro');if(!host)return;document.querySelector('#morning-brief')?.remove();document.querySelector('#market-regime-v27')?.remove();
 const b=build(data),section=document.createElement('section');section.id='morning-brief';section.className='panel morning-brief';
 const windowStart=Number.isFinite(b.news.cutoff)?new Date(b.news.cutoff-24*3600000).toISOString():null;
 const cards=b.news.items.map(a=>{
 const topic=topics.find(t=>t.test(a.title));
 return '<article class="brief-article"><small>'+esc(a.publisher)+' · '+esc(kst(a.publishedAt))+'</small><h4>'+link(a.url,a.title)+'</h4><p>'+esc(topic?topic.name+' 관련 공개 제목 · '+topic.check:'미국 시장 관련 공개 제목 · 본문에서 실제 근거 확인')+'</p><span>공개 제목 확인 · 본문 미검토</span></article>';
 }).join('');
 const risks=b.themes.slice(0,3).map(t=>'<li>'+link(t.article.url,kst(t.article.publishedAt)+' · '+t.name)+'<p>'+esc(t.risk)+'.</p></li>').join('');
 const checks=b.themes.slice(0,3).map(t=>'<li>'+esc(t.check)+' · '+link(t.article.url,'발행 '+kst(t.article.publishedAt))+'</li>').join('');
 section.innerHTML='<div class="section-head"><div><div class="eyebrow">US MARKET BRIEF · v2.65</div><h2>미국증시 주요 요약</h2></div></div><p class="brief-time">미국 거래일 '+esc(b.nas.date||'확인 불가')+' · 자료 수집 '+esc(kst(data.retrievedAt))+'</p>'+
 '<div class="brief-narrative">'+b.sentences.map(s=>'<p><span class="brief-kind">'+esc(s.kind)+'</span> '+esc(s.text)+' '+link(s.href,s.label)+'</p>').join('')+'</div>'+
 '<div class="brief-columns"><section class="brief-check"><h3>관전 포인트</h3><ul>'+checks+'<li>다음 거래일: 지수와 상승 종목 수가 함께 개선되는지 확인</li><li>중기: 관심 기업의 실적·가이던스 확인 / 장기: 현금흐름·희석 점검</li></ul><p>'+link('https://www.federalreserve.gov/newsevents/calendar.htm','연준 공식 일정')+' · '+link('https://www.bls.gov/schedule/','물가·고용 공식 일정')+'</p><small>기사 발행일과 실제 발표·사건 발생일은 다릅니다. 확인되지 않은 행사 날짜는 기재하지 않습니다.</small></section>'+
 '<section class="brief-risk"><h3>리스크 요인 · Opinion</h3><ul>'+(risks||'<li>기간 내 관련 기사가 확인되지 않아 뉴스 기반 리스크 판단 보류</li>')+'<li>자료 시점 차이: Finviz 시세 기준시각 미제공으로 지수 종가와 완전히 같은 시각의 비교는 아닙니다.</li></ul></section></div>'+
 '<section class="brief-news-box"><h3>경제 전문지 기사 바로보기</h3><p class="brief-time">조회 구간 '+esc(kst(windowStart))+' → '+esc(kst(data.enrichment?.retrievedAt||data.retrievedAt))+'<br>'+esc(b.news.recent?'최근 24시간 발행 기사':'최근 24시간 기사 확인 불가 · 아래는 이전 72시간 참고 기사')+'</p><div class="brief-news-grid">'+(cards||'<p>기간 내 기사 확인 불가</p>')+'</div></section>'+
 '<details><summary>출처·해석 방법</summary><p>완료 일봉은 Yahoo, 시장폭은 Finviz 원자료의 계산값입니다. 각 자산은 거래일이 다를 수 있습니다. 기사 박스는 WSJ·Bloomberg·NYT를 우선하고 Reuters·FT·CNBC를 보완하며, 발행시각을 한국시간으로 표시합니다.</p><p>기사 관련 해석은 공개 제목의 주제에 따른 조건부 점검 의견입니다. 기사 본문을 읽은 요약이나 확정적인 시장 원인 설명이 아닙니다. 점수 합계·수익 확률은 산출하지 않습니다.</p><p>'+[b.sp,b.dow,b.nas,b.rut,b.vix,b.dollar,b.oil,b.gold].map((x,i)=>esc(['S&P 500','다우','나스닥','러셀2000','VIX','달러','WTI','금'][i])+': '+esc(x.date||'확인 불가')).join(' · ')+'</p></details>';
 host.prepend(section);
}
const css=document.createElement('style');css.textContent='.brief-narrative p{line-height:1.85;margin:0 0 14px}.brief-kind{font-size:11px;color:#9abcf3;border:1px solid #314967;border-radius:5px;padding:2px 5px}.brief-time,.brief-article small,.brief-columns small{color:var(--muted);font-size:12px}.brief-columns,.brief-news-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.brief-columns>section,.brief-article{border:1px solid var(--line);padding:16px;border-radius:12px;min-width:0;overflow-wrap:anywhere}.brief-check{background:#0b192b}.brief-risk{background:#261722}.brief-columns ul{padding-left:18px;line-height:1.8}.brief-columns li{margin-bottom:10px}.brief-columns li p{margin:4px 0}.brief-news-box{margin:20px 0}.brief-article h4{font-size:15px;line-height:1.5;margin:10px 0}.brief-article p,.brief-article span{font-size:12px;color:var(--muted)}.morning-brief a{overflow-wrap:anywhere}@media(max-width:700px){.brief-columns,.brief-news-grid{grid-template-columns:1fr}}';document.head.append(css);
document.addEventListener('radar:macro-render',e=>render(e.detail));if(window.radarMarketData)render(window.radarMarketData);
})();
