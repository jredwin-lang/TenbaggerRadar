/* Dated editorial research. Never modifies prices, rankings or trading scores. */
(()=>{
'use strict';
const VERSION='2.66';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let review=null,failure=false,market=window.radarMarketData;
function source(s){try{if(new URL(s.url).protocol!=='https:')return ''}catch{return ''}return '<a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.label)+'</a> · '+esc(s.date)}
function render(){
 const host=document.querySelector('#pane-macro');if(!host)return;
 const previous=host.querySelector('#investment-review'),wasOpen=previous?.querySelector('details')?.open||false;previous?.remove();
 const section=document.createElement('section');section.id='investment-review';section.className='panel investment-review';
 if(!review){section.innerHTML='<h2>주간 투자 점검</h2><p role="status">'+(failure?'검토 기록을 불러오지 못했습니다. 페이지를 새로고침해 다시 확인하세요.':'검토 기록 불러오는 중…')+'</p>'}
 else{
  const today=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'}),stale=today>=review.reviewAfter;
  const available=new Set((market?.us||[]).map(s=>s.symbol));
  const cards=review.themes.map(t=>'<article class="research-card"><span class="research-status">'+esc(t.status)+'</span><h3>'+esc(t.title)+'</h3><p>'+esc(t.evidence)+'</p><p><b>투자 해석 · 의견</b><br>'+esc(t.interpretation)+'</p><ul>'+t.checks.map(c=>'<li>'+esc(c)+'</li>').join('')+'</ul><p class="research-reconsider"><b>재검토 조건</b> '+esc(t.invalidate)+'</p>'+(t.tickers.length?'<p class="research-tickers">'+t.tickers.map(s=>available.has(s)?'<button type="button" data-stock="us:'+esc(s)+'" aria-label="'+esc(s)+' 차트·지표 확인">'+esc(s)+'</button>':'<span>'+esc(s)+' · 일봉 미수집</span>').join(' ')+'</p>':'')+'<p class="source-status">'+(t.sources.length?t.sources.map(source).join('<br>'):'근거: 제공 자료 · 개별 원문 검증 미완료')+'</p></article>').join('');
  section.innerHTML='<div class="eyebrow">RESEARCH REVIEW · '+esc(review.asOf)+'</div><h2>'+esc(review.title)+'</h2><p>'+esc(review.summary)+'</p><p class="source-status">'+esc(review.scope)+'</p><p class="research-age">'+(stale?'재검토 시점 경과 · 최신 정책·실적·일정을 다시 확인하세요.':'다음 재검토 기준일 '+esc(review.reviewAfter)+' · 새 공시가 나오면 먼저 재검토합니다.')+'</p><details'+(wasOpen?' open':'')+'><summary>6개 주제의 확인 근거·관심 후보·재검토 조건 보기</summary><p class="source-status">티커는 자료 기반 검토 후보입니다. 버튼은 기존 차트로 연결되며 매수 추천·점수 가산을 뜻하지 않습니다.</p><div class="research-grid">'+cards+'</div><div class="research-corrections"><h3>자료를 읽을 때 바로잡을 부분</h3>'+review.corrections.map(c=>'<p><b>'+esc(c.title)+'</b><br>'+esc(c.text)+'<br><small>'+esc(c.basis)+'</small></p>').join('')+'</div></details>';
 }
 const brief=host.querySelector('#morning-brief');if(brief)brief.after(section);else host.append(section);
}
document.addEventListener('radar:macro-render',e=>{market=e.detail;render()});
render();
fetch('research-review.json?v='+VERSION,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(d=>{if(!Array.isArray(d.themes)||!Array.isArray(d.corrections)||!/^\d{4}-\d{2}-\d{2}$/.test(d.reviewAfter))throw Error('Invalid research review');review=d;render()}).catch(()=>{failure=true;render()});
})();
