async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');
 await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready&&window.__mob3d);
 await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.introSeen=true;b.openHub();b.startDelve('warrior');
  b.G.p.invuln=999;b.G.enemies.length=0;
  const e=b.spawnEnemy('prison_bell',b.G.p.x,b.G.p.z-50);
  Object.assign(e,{pcState:'wind',pcMove:'toll',pcClock:.8,active:true,hp:1000,maxHp:1000});
  window.__variantTarget=e;b.renderFrame();
 });
 await page.waitForFunction(()=>__mob3d().actors.some(a=>a.type==='prison_bell'),null,{timeout:10000});
 const clips=await page.evaluate(()=>{
  const b=__BF3,e=__variantTarget,seen=[];
  for(const move of ['toll','sweep']){
   for(const phase of ['wind','strike','recover']){
    e.pcMove=move;e.pcState=phase;e.pcClock=.8;
    for(let i=0;i<3;i++)b.renderFrame();
    seen.push({move,phase,clip:__mob3d().actors.find(a=>a.type==='prison_bell')?.clip});
   }
  }return seen;
 });
 if(clips.some(x=>x.clip!==({wind:'Windup_',strike:'Attack_',recover:'Recover_'}[x.phase]+x.move))||errors.length)throw Error(JSON.stringify({clips,errors}));
 return {clips,errors};
}
