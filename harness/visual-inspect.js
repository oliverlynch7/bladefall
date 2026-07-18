import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const here=resolve(import.meta.dirname), publicDir=resolve(here,'../public'), outDir=join(here,'out','visual');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.wav':'audio/wav'};
const server=createServer(async(req,res)=>{try{const u=new URL(req.url,'http://x'),rel=decodeURIComponent(u.pathname==='/'?'index.html':u.pathname).replace(/^\/+/,''),file=join(publicDir,rel.endsWith('/')?rel+'index.html':rel);const body=await readFile(file);res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end();}});
await mkdir(outDir,{recursive:true}); await new Promise(ok=>server.listen(0,'127.0.0.1',ok)); const port=server.address().port;
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const findings=[];
async function inspect(label,viewport,setup){
  const page=await browser.newPage({viewport});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(`http://127.0.0.1:${port}/3d/?mute=1`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.__BF3);
  if(setup)await page.evaluate(setup);
  await page.screenshot({path:join(outDir,`${label}.png`),fullPage:true});
  const geometry=await page.evaluate(()=>{const visible=[...document.querySelectorAll('body *')].filter(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0&&(['BUTTON','H1','H2'].includes(e.tagName)||e.id);}).map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,id:e.id,text:(e.textContent||'').trim().slice(0,80),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),overflow:r.right>innerWidth+1||r.bottom>innerHeight+1||r.left<-1||r.top<-1};});return {viewport:{w:innerWidth,h:innerHeight},overflow:visible.filter(x=>x.overflow),visible};});
  findings.push({label,viewport,errors:[...new Set(errors)],overflow:geometry.overflow,snap:await page.evaluate(()=>__BF3.snap())});await page.close();
}
await inspect('desktop-title',{width:1440,height:900});
await inspect('mobile-title',{width:390,height:844});
await inspect('desktop-outskirts',{width:1440,height:900},()=>{__BF3.meta.classUnlocked.warrior=true;__BF3.meta.classId='warrior';__BF3.meta.introSeen=true;__BF3.openHub();for(let i=0;i<60;i++)__BF3.update(1/60);__BF3.enterZone(0);document.querySelector('#storyskip')?.click();for(let i=0;i<300;i++)__BF3.update(1/60);document.querySelector('#storyskip')?.click();document.querySelector('#overlay button')?.click();for(let i=0;i<180;i++)__BF3.update(1/60);__BF3.render(8);});
await inspect('mobile-outskirts',{width:390,height:844},()=>{__BF3.meta.classUnlocked.warrior=true;__BF3.meta.classId='warrior';__BF3.meta.introSeen=true;__BF3.openHub();for(let i=0;i<60;i++)__BF3.update(1/60);__BF3.enterZone(0);document.querySelector('#storyskip')?.click();for(let i=0;i<300;i++)__BF3.update(1/60);document.querySelector('#storyskip')?.click();document.querySelector('#overlay button')?.click();for(let i=0;i<180;i++)__BF3.update(1/60);__BF3.render(8);});
await inspect('mobile-landscape-outskirts',{width:844,height:390},()=>{__BF3.meta.classUnlocked.warrior=true;__BF3.meta.classId='warrior';__BF3.meta.introSeen=true;__BF3.openHub();for(let i=0;i<60;i++)__BF3.update(1/60);__BF3.enterZone(0);document.querySelector('#storyskip')?.click();for(let i=0;i<300;i++)__BF3.update(1/60);document.querySelector('#storyskip')?.click();document.querySelector('#overlay button')?.click();for(let i=0;i<180;i++)__BF3.update(1/60);__BF3.render(8);});
await inspect('desktop-descent',{width:1440,height:900},()=>{__BF3.meta.classUnlocked.warrior=true;__BF3.meta.classId='warrior';__BF3.startEndless();for(let i=0;i<300;i++)__BF3.update(1/60);__BF3.render(5);});
await writeFile(join(outDir,'findings.json'),JSON.stringify(findings,null,2));console.log(JSON.stringify(findings.map(x=>({label:x.label,errors:x.errors,overflow:x.overflow.length,mode:x.snap.mode,stage:x.snap.stageName,enemies:x.snap.enemiesAlive})),null,2));
await browser.close();await new Promise(ok=>server.close(ok));
