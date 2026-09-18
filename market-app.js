/* Tenbagger Radar v2.62 loader. Core is preserved in market-app-core.js. */
(()=>{'use strict';const VERSION='2.62';
const css=document.createElement('link');css.rel='stylesheet';css.href='market.css?v='+VERSION;document.head.appendChild(css);
const load=src=>new Promise((ok,fail)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=fail;document.head.appendChild(s)});
const stamp=()=>{document.title=document.title.replace(/v2\.6\d*/i,'v'+VERSION);document.querySelectorAll('.workspace-intro .eyebrow,#market-regime-v27 .eyebrow').forEach(el=>{el.textContent=el.textContent.replace(/v2\.(?:6|7)\d*/i,'v'+VERSION)});document.querySelectorAll('.tag').forEach(el=>{if(/^v2\.(?:6|7)/i.test(el.textContent))el.textContent=el.textContent.replace(/v2\.(?:6|7)\d*/i,'v'+VERSION)});};
load('market-app-core.js?v='+VERSION).then(()=>load('market-regime.js?v='+VERSION)).then(()=>{stamp();setTimeout(stamp,300);setTimeout(stamp,1200)}).catch(e=>console.error('Tenbagger Radar module load failed',e));})();
