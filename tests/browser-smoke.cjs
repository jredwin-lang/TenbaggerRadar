const {chromium}=require('playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=process.cwd();
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
 fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':types[path.extname(file)]||'text/plain'});res.end(err?'Not found':data)});
});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [360,390,430,1366]){
   const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port);
   await page.locator('.mr-panel').waitFor();
   assert.equal(await page.locator('.workspace-intro .eyebrow').innerText(),'TENBAGGER RADAR v2.63 · MARKET WORKSPACE');
   assert.ok((await page.locator('script[src]').evaluateAll(nodes=>nodes.map(n=>n.src))).every(src=>new URL(src).searchParams.get('v')==='2.63'),'Every module must have the new cache key');
   const layout=await page.evaluate(()=>({macro:getComputedStyle(document.querySelector('.macro-grid')).gridTemplateColumns.split(' ').length,regime:getComputedStyle(document.querySelector('.mr-grid')).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth>innerWidth+1}));
   if(width<=430){assert.equal(layout.macro,3);assert.equal(layout.regime,3)}
   assert.equal(layout.overflow,false,JSON.stringify({width,layout}));
   await page.getByRole('button',{name:'텐배거 레이더',exact:true}).click();
   await page.getByRole('button',{name:'매크로·히트맵',exact:true}).click();
   assert.equal(await page.locator('.mr-panel').count(),1);
   await page.getByRole('button',{name:'투자 계산기',exact:true}).click();
   await page.getByRole('button',{name:'매크로·히트맵',exact:true}).click();
   assert.equal(await page.locator('.mr-panel').count(),1);
   assert.deepEqual(errors,[]);
   console.log(JSON.stringify({width,...layout,status:'passed'}));await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
