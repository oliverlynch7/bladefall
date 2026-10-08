async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');
 await page.waitForFunction(()=>window.BFPrisonRun&&HERO3D?.ready&&window.__mob3d,null,{polling:100});
 await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.introSeen=true;b.openHub();b.startDelve('warrior');
  b.G.p.invuln=999;b.G.enemies.length=0;
  const x=b.G.p.x;
  const e=b.spawnEnemy('prison_bell',x,-80);Object.assign(e,{pcState:'wind',pcMove:'toll',pcClock:.9,dropT:0,active:true,stunT:0,hp:1000,maxHp:1000,yaw:Math.PI});
  window.__enemyLiveTarget=e;b.renderFrame();
 });
 await page.waitForFunction(()=>!BF_LOADING.active,null,{timeout:10000});
 await page.waitForFunction(()=>__mob3d().actors.some(a=>a.type==='prison_bell'),null,{timeout:10000});
 const wind=await page.evaluate(()=>{const b=__BF3,e=__enemyLiveTarget;e.pcState='wind';e.pcMove='toll';e.pcClock=.7;for(let i=0;i<3;i++)b.renderFrame();return __mob3d().actors.find(a=>a.type==='prison_bell');});
 const strike=await page.evaluate(()=>{const b=__BF3,e=__enemyLiveTarget;e.pcState='strike';e.pcMove='toll';e.pcClock=.3;for(let i=0;i<3;i++)b.renderFrame();return __mob3d().actors.find(a=>a.type==='prison_bell');});
 const sweep=await page.evaluate(()=>{const b=__BF3,e=__enemyLiveTarget;e.pcState='wind';e.pcMove='sweep';e.pcClock=.9;for(let i=0;i<3;i++)b.renderFrame();return __mob3d().actors.find(a=>a.type==='prison_bell');});
 if(wind.clip!=='Windup_toll'||strike.clip!=='Attack_toll'||sweep.clip!=='Windup_sweep'||errors.length)throw Error(JSON.stringify({wind,strike,sweep,errors}));
 const visible=await page.evaluate(()=>{const b=__BF3,e=__enemyLiveTarget;e.x=b.G.p.x;e.z=b.G.p.z-45;e.y=b.G.p.y;e.untargetable=false;e.pcState='wind';e.pcMove='sweep';e.pcClock=.8;b.renderFrame();return {enemyZ:e.z,playerZ:b.G.p.z,actor:__mob3d().actors.find(a=>a.type==='prison_bell')};});
 if(visible.actor?.opacity!==1)throw Error(JSON.stringify({visible,errors}));
 return {wind:wind.clip,strike:strike.clip,sweep:sweep.clip,model:strike.type,visible,errors};
}
