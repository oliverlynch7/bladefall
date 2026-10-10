async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2163');
 await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.openHub();b.enterZone(1);b.nextArea();
  const G=b.G,p=G.p,act=key=>{const o=G.storyObjects.find(o=>o.key===key);Object.assign(p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key});};
  act('lc.orders');Object.assign(p,{x:-90,z:-630,y:140});b.briarRequest('open',{npc:'ward'});b.briarRequest('choose',{line:G.storyState.conversation.node,choice:'orders'});b.briarRequest('close');
  Object.assign(p,{x:-440,z:-1450,y:0});b.briarRequest('open',{npc:'ruth'});b.briarRequest('choose',{line:G.storyState.conversation.node,choice:'help'});b.briarRequest('close');
  for(const e of G.enemies){e.hp=0;e.dead=true;}act('lc.cage.south');
  b.meta.camMode='shoulder';G.camYaw=-Math.PI/2;G.camPitch=.18;G.stageBanner=0;
  Object.assign(p,{x:380,z:-2550,y:180,vy:0,vx:0,vz:0,onGround:true,invuln:999});
 });
 await page.waitForFunction(()=>!BF_LOADING.active&&__world3d().counts.hollowArt);
 await page.waitForTimeout(450);await page.evaluate(()=>document.getElementById('journalNotice').style.display='none');await page.screenshot({path:'output/playwright/canyon-signal-active.png'});
 const active=await page.evaluate(()=>({flags:__BF3.G.storyState.flags,colors:__BF3.G.canyon.signalLamps.map(o=>o.c)}));
 await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p;Object.assign(p,{x:0,z:-2550,y:180});b.briarRequest('world',{key:'lc.alarm'});Object.assign(p,{x:380,z:-2550,y:180,vy:0,vx:0,vz:0,onGround:true});});
 await page.waitForTimeout(450);await page.screenshot({path:'output/playwright/canyon-signal-cut.png'});
 const cut=await page.evaluate(()=>({flag:!!__BF3.G.storyState.flags['lc.alarm'],colors:__BF3.G.canyon.signalLamps.map(o=>o.c)}));
 if(!active.flags['lc.alarm.called']||!active.colors.every(c=>c==='#f8b35a')||!cut.flag||!cut.colors.every(c=>c==='#79bd9d')||errors.length)throw Error(JSON.stringify({active,cut,errors}));
 return {active:active.colors[0],cut:cut.colors[0],errors};
}
