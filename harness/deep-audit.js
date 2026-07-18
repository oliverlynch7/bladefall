import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const here=resolve(import.meta.dirname), publicDir=resolve(here,'../public'), outDir=join(here,'out','deep-audit');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.wav':'audio/wav'};
const server=createServer(async(req,res)=>{try{const u=new URL(req.url,'http://x'),rel=decodeURIComponent(u.pathname==='/'?'index.html':u.pathname).replace(/^\/+/,''),file=join(publicDir,rel.endsWith('/')?rel+'index.html':rel);const body=await readFile(file);res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end();}});
await mkdir(outDir,{recursive:true});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));const port=server.address().port;
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}}), errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto(`http://127.0.0.1:${port}/3d/?mute=1`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.__BF3);
const version=await page.evaluate(()=>__BF3.snap().version);

const bosses=[];
for(const zi of [4,5,6,7]){
  const data=await page.evaluate(zi=>{const h=__BF3;h.meta.classUnlocked.warrior=true;h.meta.classId='warrior';h.meta.introSeen=true;h.meta.zoneSeen[h.ZONES[zi].id]=true;h.openHub();for(let i=0;i<10;i++)h.update(1/60);h.enterZone(zi);document.querySelector('#storyskip')?.click();document.querySelector('#overlay button')?.click();h.G.zone=zi;h.G.zoneTier=h.ZONES[zi].tier;h.G.area=-1;h.loadArea(-1);document.querySelector('#storyskip')?.click();document.querySelector('#overlay button')?.click();h.setSkin('god');const g=h.G,p=g.p,b=g.enemies.find(e=>e.boss);if(!b)return {zone:h.ZONES[zi].id,error:'boss missing',stage:g.stageIndex,types:g.enemies.map(e=>e.type)};p.x=b.x;p.z=b.z+210;p.y=0;p.vx=p.vy=p.vz=0;b.active=false;b.dropT=.01;const startHp=p.hp,max={projectiles:0,shockwaves:0,trails:0,collapse:0,enemies:0,particles:0},samples=[];for(let i=0;i<900;i++){p.vx=p.vy=p.vz=0;p.x=b.x;p.z=b.z+210;p.y=0;p.yaw=Math.atan2(b.x-p.x,b.z-p.z);if(i===300)b.hp=b.maxHp*.55;if(i===600)b.hp=b.maxHp*.25;h.update(1/60);max.projectiles=Math.max(max.projectiles,g.projectiles?.length||0);max.shockwaves=Math.max(max.shockwaves,g.shockwaves?.length||0);max.trails=Math.max(max.trails,g.trails?.length||0);max.collapse=Math.max(max.collapse,g.collapse?.length||0);max.enemies=Math.max(max.enemies,g.enemies.filter(e=>!e.dead).length);max.particles=Math.max(max.particles,g.particles?.length||0);if(i%60===0)samples.push({t:i/60,hp:Math.round(p.hp),projectiles:g.projectiles?.length||0,shockwaves:g.shockwaves?.length||0,trails:g.trails?.length||0,collapse:g.collapse?.length||0,enemies:g.enemies.filter(e=>!e.dead).length,bossState:{phase:b.phase,slamT:b.slamT,beamT:b.beamT,teleT:b.teleT}});}h.render(g.time);return {zone:h.ZONES[zi].id,boss:b.type,startHp,endHp:p.hp,damageTaken:startHp-p.hp,max,samples};},zi);
  await page.screenshot({path:join(outDir,`boss-${data.zone}.png`)});bosses.push(data);
}

const sprints=[]; // unreachable in v1.85.0: every custom SCAPES branch returns before bonusPortal assignment, and loadBonus is not exported.

const zones=await page.evaluate(()=>{const h=__BF3,out=[];h.meta.classUnlocked.warrior=true;h.meta.classId='warrior';h.meta.introSeen=true;for(let zi=0;zi<h.ZONES.length;zi++){h.meta.zoneSeen[h.ZONES[zi].id]=true;h.openHub();for(let i=0;i<5;i++)h.update(1/60);h.enterZone(zi);document.querySelector('#storyskip')?.click();document.querySelector('#overlay button')?.click();for(let i=0;i<30;i++)h.update(1/60);const q=document.querySelector('#questbox');out.push({zone:h.ZONES[zi].id,area:h.G.area,questText:q?.innerText||'',questRect:q?Object.fromEntries(['x','y','width','height','right','bottom'].map(k=>[k,Math.round(q.getBoundingClientRect()[k])])):null,enemies:h.G.enemies.filter(e=>!e.dead).length});}return out;});

const result={version,createdAt:new Date().toISOString(),errors:[...new Set(errors)],bosses,sprints:{entryReachable:false,reason:'All main zones use custom SCAPES generators that return before the generic bonusPortal assignment; loadBonus is not exported for isolated layout QA.',runs:0,samples:[]},zones};
await writeFile(join(outDir,`audit-${version}.json`),JSON.stringify(result,null,2));console.log(JSON.stringify({version,errors:result.errors,bosses:bosses.map(x=>({zone:x.zone,boss:x.boss,damageTaken:Math.round(x.damageTaken||0),max:x.max})),sprints:result.sprints,zones:zones.map(x=>({zone:x.zone,quest:x.questText.replace(/\n/g,' | '),enemies:x.enemies}))},null,2));
await browser.close();await new Promise(ok=>server.close(ok));
