// Muted production smoke check in disposable browser storage. Does not alter a
// player's saved characters. This is deployment validation, not a playthrough.
async root=>{
 const c=await root.context().browser().newContext({viewport:{width:1440,height:900}}),p=await c.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&/WebGL|THREE/.test(m.text()))errors.push(m.text());});
 try{
  const response=await p.goto('https://bladefall.pages.dev/3d/?mute=1&verify='+Date.now());
  const version=await p.evaluate(()=>document.documentElement.innerHTML.match(/const VERSION3D='([^']+)'/)?.[1]);
  if(version!=='2.188.0-briar-journey')return{published:false,status:response.status(),version};
  await p.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await p.evaluate(()=>__BF3.briarReady);
  await p.locator('body').click({position:{x:720,y:450}});await p.locator('#mmDev').click();await p.getByRole('link',{name:'Campaign blueprints · all 16 level halves'}).click();await p.waitForFunction(()=>document.querySelectorAll('#steps .stop').length>0);
  const plans=await p.evaluate(async()=>{const d=await fetch('layout-data.json').then(r=>r.json());return{count:d.maps.length,version:d.version,millPlate:!!document.querySelector('#steps .stop[data-id="briar.mill.plate"]')};});
  await p.goto('https://bladefall.pages.dev/3d/?mute=1&verify='+Date.now());await p.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await p.evaluate(()=>__BF3.briarReady);
  await p.evaluate(()=>{const b=__BF3;b.loadMode('rl');Object.assign(b.meta,{classId:'warrior',run:null,bank:null,introSeen:true,hubTutDone:true,tutOff:true,dialogueTTS:false,camMode:'far'});b.openHub();b.enterZone(0);b.G.p.invuln=99999;b.G.enemies.forEach(e=>e.stunT=99999);Object.assign(b.G.p,{x:0,z:-2040,y:0});Object.assign(b.G.storyState.flags,{'thomas.ready':true,'mara.healing':true,'briar.water':true,'briar.jam':true,'briar.bridge':true});b.briarSync();b.G.camYaw=Math.PI;});await p.waitForFunction(()=>!BF_LOADING.active);await p.waitForTimeout(2400);
  const briar=await p.evaluate(()=>({revision:__BF3.G.briarJourney.revision,bounds:__BF3.G.bounds,signs:__BF3.G.briarJourney.signs.length,bridge:__BF3.G.briarMill.bridge,barrier:__BF3.G.walls.some(o=>o.storyBridge),art:__BRIAR_JOURNEY_ART.revision,world:__world3d().ready,error:HERO3D.err}));
  await p.screenshot({path:'output/playwright/briar188-production.png'});
  const fallbacks=[];
  for(const kind of ['world-fallback','voxel','detailed']){
   await p.evaluate(kind=>{HERO3D.on=kind!=='voxel';__world3dEnabled(kind==='detailed');},kind);await p.waitForTimeout(250);
   const boxes=await p.evaluate(()=>{let count=0;BFBriarJourney.fallback(__BF3.G,()=>count++);return count;});fallbacks.push({kind,boxes});
  }
  if(plans.count!==16||!plans.millPlate||briar.revision!==2188||briar.art!==2188||briar.signs!==5||!briar.world||briar.bridge!==1||briar.barrier||briar.error||fallbacks[0].boxes<1||fallbacks[1].boxes<1||fallbacks[2].boxes!==0||errors.length)throw Error(JSON.stringify({briar,plans,fallbacks,errors}));
  return{published:true,version,plans,briar,fallbacks,errors};
 }finally{await c.close();}
}
