async root=>{
 const ctx=await root.context().browser().newContext({viewport:{width:1280,height:720}}),page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.stack||e.message));page.on('console',m=>{if(m.type()==='error'&&/THREE|Shader|WebGL/.test(m.text()))errors.push(m.text());});
 try{
  await page.goto('http://127.0.0.1:4345/3d/?mute=1&qa=rest2183a');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);await page.evaluate(()=>__BF3.briarReady);
  const scenes=[];
  for(let zone=0;zone<8;zone++){
   const state=await page.evaluate(zone=>{
    const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.petActive=null;b.meta.camMode='far';b.openHub();b.enterZone(zone);const g=b.G;
    for(const e of g.enemies)e.stunT=999;const pad=g.healpads.find(p=>!p.infinite&&p.y===0)||g.healpads.find(p=>!p.infinite);if(!pad)throw Error('No finite pad '+zone);
    Object.assign(g.p,{x:pad.x,z:pad.z+70,y:pad.y||0,vy:0,hp:b.effMaxHp(g.p),invuln:999,onGround:true});g.camYaw=Math.PI;g.camPitch=.5;g.cam={x:g.p.x,y:g.p.y,z:g.p.z};delete g._cameraBoom;
    return {zone,pad:{x:pad.x,y:pad.y||0,z:pad.z},name:g.areaName};
   },zone);
   await page.waitForFunction(()=>!BF_LOADING.active);await page.waitForTimeout(280);await page.evaluate(()=>document.getElementById('storycard').classList.remove('show'));await page.waitForTimeout(120);state.stats=await page.evaluate(()=>__CAMPAIGN_REST_STATS);state.label=await page.locator('#campaignRestHint').innerText();
   if(!state.stats?.visible)throw Error('Rest model absent '+zone);if(!(await page.locator('#campaignRestHint').isVisible()))throw Error('Rest hint absent '+zone);
   await page.screenshot({path:'output/playwright/campaign-rest-'+zone+'.png'});scenes.push(state);
  }
  await page.evaluate(()=>{const b=__BF3;b.openHub();b.enterZone(0);const g=b.G,pad=g.healpads.find(p=>p.x===-1030);Object.assign(g.p,{x:pad.x,y:pad.y,z:pad.z+65,vy:0,onGround:true,invuln:999});g.walls.push({x:pad.x,z:pad.z+30,w:200,d:8,y0:pad.y,h:pad.y+100,qaRestWall:true});});
  await page.waitForTimeout(160);if(await page.locator('#campaignRestHint').isVisible())throw Error('Hint exposed rest through a wall');
  const healing=await page.evaluate(()=>{
   const b=__BF3;b.openHub();b.enterZone(0);b.meta.tutOff=true;b.releaseKeyboard();const g=b.G;for(const e of g.enemies)e.stunT=999;const pad=g.healpads.find(p=>!p.infinite),max=b.effMaxHp(g.p);Object.assign(g.p,{x:pad.x,y:pad.y||0,z:pad.z,vy:0,vx:0,vz:0,hp:max*.1,onGround:true,invuln:999});pad.charge=1;
   for(let i=0;i<100;i++)b.update(.02);const used={hp:g.p.hp,charge:pad.charge};if(Math.abs(g.p.hp-max*.5)>1||pad.charge>.002)throw Error('Finite rest budget '+JSON.stringify(used));
   for(let i=0;i<80;i++)b.update(.02);if(Math.abs(g.p.hp-used.hp)>.01)throw Error('Spent pad kept healing');
   const spring=g.healpads.find(p=>p.infinite);spring.locked=true;Object.assign(g.p,{x:spring.x,y:spring.y||0,z:spring.z,hp:max*.1,vy:0});for(let i=0;i<50;i++)b.update(.02);if(g.p.hp>max*.11)throw Error('Locked spring heals');
   spring.locked=false;g.storyState.flags['mara.healing']=true;for(let i=0;i<180;i++)b.update(.02);if(Math.abs(g.p.hp-max)>.1||spring.charge!==1)throw Error('Unlimited spring fails');
   return {finiteBudget:used.hp-max*.1,expected:max*.4,spentStops:true,lockedStops:true,unlimitedFills:true};
  });
  await page.waitForTimeout(120);const fullHint=await page.locator('#campaignRestHint').innerText();await page.screenshot({path:'output/playwright/campaign-rest-mara.png'});
  await page.keyboard.press('Escape');await page.waitForTimeout(120);if(await page.locator('#campaignRestHint').isVisible())throw Error('Hint leaked into pause menu');await page.keyboard.press('Escape');
  await page.evaluate(()=>HERO3D.on=false);await page.waitForTimeout(160);if(await page.locator('#campaignRestHint').isVisible())throw Error('Stale hint in voxel fallback');await page.evaluate(()=>HERO3D.on=true);
  await page.evaluate(()=>__BF3.openHub());await page.waitForTimeout(120);if(await page.locator('#campaignRestHint').isVisible())throw Error('Hint leaked into hub');
  if(errors.length)throw Error(errors.join(';'));return {scenes,healing,fullHint,hiddenInHub:true,hiddenBehindWall:true,hiddenInPause:true,hiddenInFallback:true,errors};
 }catch(e){throw Error(e.message+' '+JSON.stringify({errors,state:await page.evaluate(()=>({zone:__BF3.G?.zone,mode:__BF3.mode,load:window.BF_LOADING?.active,rest:window.__CAMPAIGN_REST_STATS}))}));}finally{await ctx.close();}
}
