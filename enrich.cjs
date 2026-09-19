/* Public issuer descriptions and RSS metadata; unavailable content is explicit. */
const fs=require('fs');const data=JSON.parse(fs.readFileSync('market.json')),previous=data.enrichment||{},ua={'User-Agent':'Mozilla/5.0'},decode=s=>s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
async function get(url){const r=await fetch(url,{headers:ua,signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('HTTP '+r.status);return r.text()}
const curated=JSON.parse(fs.readFileSync('company-notes.json')),enrichment={retrievedAt:new Date().toISOString(),companies:{},errors:[]};
async function pool(items,job,n=5){let index=0;await Promise.all(Array.from({length:n},async()=>{while(index<items.length)await job(items[index++])}))}
async function main(){await pool([...data.us.filter(s=>s.watchDefault),...data.kr.filter(s=>s.watchDefault)],async s=>{const market=data.us.includes(s)?'us':'kr',key=market+':'+s.symbol,notes=curated.companies[key]||null,record={...notes,checkedAt:enrichment.retrievedAt,news:[],description:notes?.description||null,descriptionSource:notes?.source||null};if(!notes&&market==='us'){try{const url='https://finviz.com/quote.ashx?t='+encodeURIComponent(s.symbol),html=await get(url),match=html.match(/<[^>]+class="[^"]*(?:quote-profile|company-profile)[^"]*"[^>]*>([\s\S]*?)<\/div>/);if(match){const text=decode(match[1]);if(text.length>40){record.description=text.split(/\s+/).slice(0,25).join(' ')+' …';record.descriptionSource=url;record.descriptionType='제공자 기업 소개 · 영문 짧은 발췌'}}}catch(e){record.descriptionError=e.message}}
try{const preferredQuery='"'+s.name+'" (site:wsj.com OR site:bloomberg.com OR site:nytimes.com) when:14d',preferredUrl='https://news.google.com/rss/search?q='+encodeURIComponent(preferredQuery)+'&hl=en-US&gl=US&ceid=US:en',preferredRSS=await get(preferredUrl);const preferredItems=[...preferredRSS.matchAll(/<item>([\s\S]*?)<\/item>/g)].filter(x=>/Wall Street Journal|Bloomberg|New York Times|wsj\.com|bloomberg\.com|nytimes\.com/i.test(x[1]));record.newsPriority='월스트리트저널 · 블룸버그 · 뉴욕타임스 우선';record.preferredNewsFound=preferredItems.length>0;const fallbackUrl=market==='us'?'https://feeds.finance.yahoo.com/rss/2.0/headline?s='+encodeURIComponent(s.symbol)+'&region=US&lang=en-US':'https://news.google.com/rss/search?q='+encodeURIComponent('"'+s.name+'" when:14d')+'&hl=ko&gl=KR&ceid=KR:ko',url=preferredItems.length?preferredUrl:fallbackUrl,rss=preferredItems.length?'<rss>'+preferredItems.map(x=>x[0]).join('')+'</rss>':await get(fallbackUrl);record.newsSource=url;record.newsNote=preferredItems.length?'우선 매체의 공개 기사 목록 · 유료 본문 미검토':'우선 매체의 최근 기업 기사 확인 불가 · 다른 매체 기사로 보완';record.news=[...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(x=>{const tag=name=>decode(x[1].match(new RegExp('<'+name+'(?: [^>]*)?>([\\s\\S]*?)<\\/'+name+'>'))?.[1]||'');return {title:tag('title'),url:tag('link'),publishedAt:tag('pubDate'),publisher:tag('source')}}).filter(n=>n.title&&/^https?:\/\//.test(n.url)&&Number.isFinite(Date.parse(n.publishedAt))).filter(n=>Date.now()-Date.parse(n.publishedAt)<15*86400000).slice(0,4);if(!record.news.length)record.newsStatus='최근 확인된 기사 없음';}catch(e){record.newsStatus='뉴스 연결 확인 불가';record.newsError=e.message;enrichment.errors.push({item:key,message:e.message})}enrichment.companies[key]=record;});
// Public headlines only: publication time is not an event date.
const now=Date.parse(enrichment.retrievedAt),sources=[
 ['wsj.com','WSJ'],['bloomberg.com','Bloomberg'],['nytimes.com','NYT'],
 ['reuters.com','Reuters'],['ft.com','Financial Times'],['cnbc.com','CNBC']];
const news=[];
await pool(sources,async([domain,publisher])=>{try{
 const url='https://news.google.com/rss/search?q='+encodeURIComponent('site:'+domain+' ("Wall Street" OR "S&P 500" OR "U.S. stocks" OR "US stocks" OR "Federal Reserve" OR "US inflation" OR "U.S. inflation") when:3d')+'&hl=en-US&gl=US&ceid=US:en';
 const rss=await get(url);
 for(const item of rss.matchAll(/<item>([\s\S]*?)<\/item>/g)){
 const tag=name=>decode(item[1].match(new RegExp('<'+name+'(?: [^>]*)?>([\\s\\S]*?)<\\/'+name+'>'))?.[1]||'');
 const title=tag('title'),link=tag('link'),publishedAt=tag('pubDate'),time=Date.parse(publishedAt);
 const actual=tag('source');
 const match={WSJ:/wall street journal|wsj/i,Bloomberg:/bloomberg/i,NYT:/new york times/i,Reuters:/reuters/i,'Financial Times':/financial times/i,CNBC:/cnbc/i}[publisher];
 if(title&&match.test(actual)&&/^https:\/\//.test(link)&&time<=now&&now-time<=72*3600000)
 news.push({title,url:link,publishedAt:new Date(time).toISOString(),publisher,source:url,contentScope:'headline',isRecent:now-time<=24*3600000});
 }
}catch(error){enrichment.errors.push({item:'morningNews:'+publisher,message:error.message})}},3);
const seenNews=new Set();enrichment.morningNews=news.sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).filter(n=>{const key=n.title.replace(/\s*-\s*[^-]+$/,'').toLowerCase();if(seenNews.has(key))return false;seenNews.add(key);return true}).slice(0,60);
enrichment.morningNewsWindow={from:new Date(now-24*3600000).toISOString(),to:enrichment.retrievedAt};
enrichment.morningNewsTier='WSJ·Bloomberg·NYT 우선 / Reuters·FT·CNBC 보완 · 공개 제목 확인';
enrichment.morningNewsStatus=news.length?'확인된 기사만 표시':'기간 내 기사 확인 불가';
data.enrichment=enrichment;fs.writeFileSync('market.json',JSON.stringify(data));console.log(JSON.stringify({enriched:Object.keys(enrichment.companies).length,news:Object.values(enrichment.companies).filter(s=>s.news.length).length,errors:enrichment.errors.length,morningNews:enrichment.morningNews?.length||0,morningNewsTier:enrichment.morningNewsTier||enrichment.morningNewsStatus||'확인 불가'}));}
main().catch(e=>{console.error(e);process.exit(1)});
