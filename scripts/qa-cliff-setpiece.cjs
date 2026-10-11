async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.enterZone(1);b.meta.camMode='far';b.meta.tutOff=true;
  b.G.p.invuln=999;b.camYaw=0;b.G.enemies.forEach(e=>e.stunT=999);
 });
 await page.waitForFunction(()=>__world3d().counts.hollowArt&&!BF_LOADING.active);
 await page.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:0,z:-2450,y:0,vy:0,vx:0,vz:0,onGround:true});b.update(.016);});
 await page.waitForTimeout(350);
 await page.screenshot({path:'output/playwright/cliff-bridge-before.png'});
 const first=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p,checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
  ok('closed freight bridge has no collision',!G.cliffs.bridge&&!G.segments.some(s=>s.bridge));
  ok('bridge starts raised',G.cliffs.bridgeLowerAt===-Infinity);
  const w=G.enemies.find(e=>e.label==='Cliff warden');
  ok('named warden holds broad lookout',w?.type==='siegeknight'&&w.elite&&w.cliffGuard&&w.ceKind==='cliff'&&Math.hypot(w.x+450,w.z+3900)<400);
  G.storyState.flags['hp.trail']=true;G.storyState.flags['hp.orders']=true;
  {const o=G.storyObjects.find(o=>o.key==='hp.cart.push');Object.assign(p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key:o.key});for(let i=0;i<150;i++)b.update(.016);}
  {const o=G.storyObjects.find(o=>o.key==='hp.brake.right');Object.assign(p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key:o.key});}
  ok('freight bridge collision unlocks',!!G.storyState.flags['hp.bridge']&&G.cliffs.bridge&&G.segments.some(s=>s.bridge));
  ok('fresh release starts a timed lowering',Number.isFinite(G.cliffs.bridgeLowerAt)&&G.time-G.cliffs.bridgeLowerAt<.1);
  Object.assign(p,{x:0,z:-2450,y:0,vy:0,vx:0,vz:0,onGround:true});b.update(.016);
  return {checks,startedAt:G.cliffs.bridgeLowerAt};
 });
 await page.evaluate(()=>{for(let i=0;i<36;i++)__BF3.update(.016);});
 await page.screenshot({path:'output/playwright/cliff-bridge-mid.png'});
 const second=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p;for(let i=0;i<100;i++)b.update(.016);
  const elapsed=G.time-G.cliffs.bridgeLowerAt;if(elapsed<1.5)throw Error('bridge lowering did not finish');
  const w=G.enemies.find(e=>e.label==='Cliff warden');w.stunT=0;w.active=true;w.ceState='hunt';w.ceClock=0;
  Object.assign(p,{x:w.x,z:w.z+115,y:w.y,vy:0,vx:0,vz:0,onGround:true,invuln:999});
  const states=new Set();for(let i=0;i<220;i++){b.update(.016);states.add(w.ceState);}
  for(const state of ['wind','strike','recover'])if(!states.has(state))throw Error('Warden never reached '+state+': '+[...states]);
  const e={...w,ceState:'strike',ceX:0,ceZ:0,ceY:0,ceDX:0,ceDZ:1};
  if(!BFCampaignElites.contains(e,{x:0,z:110,y:0,r:12}))throw Error('Telegraphed fan misses its center');
  if(BFCampaignElites.contains(e,{x:110,z:0,y:0,r:12}))throw Error('Sidestep outside fan still gets hit');
  Object.assign(p,{x:0,z:-2450,y:0,vy:0,vx:0,vz:0,onGround:true});b.update(.016);
  return {elapsed,wardenStates:[...states],wardenHp:w.maxHp};
 });
 await page.screenshot({path:'output/playwright/cliff-bridge-after.png'});
 await page.evaluate(()=>{const b=__BF3,w=b.G.enemies.find(e=>e.label==='Cliff warden'),p=b.G.p;Object.assign(p,{x:w.x,z:w.z+210,y:w.y,vy:0,vx:0,vz:0,onGround:true,invuln:999});Object.assign(b.G.cam,{x:p.x,z:p.z,y:p.y});Object.assign(w,{active:true,stunT:0,ceState:'wind',ceClock:.7,ceSerial:w.ceSerial+1,ceX:w.x,ceY:w.y,ceZ:w.z,ceDX:0,ceDZ:1});b.update(.016);});
 await page.screenshot({path:'output/playwright/cliff-warden-telegraph.png'});
 if(errors.length)throw Error(JSON.stringify(errors));return {...first,...second,pageErrors:errors};
}
