async page=>{
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});await page.route('**/*',r=>r.continue());await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&HERO3D?.ready,null,{polling:100});
 return page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.openHub();const results=[];
  for(const seed of [1,2,3,4]){b.startDelve('warrior');const g=b.G,p=g.p;g.runSeed=seed;b.loadDelveFloor(1);Object.assign(p,{x:0,y:0,z:-1210});g.camYaw=Math.PI;g.escape.plan.rooms.filter(r=>r.kind!=='bridge').forEach(r=>g.escape.states[r.id]={cleared:true});b.input.up=true;b.input.jump=true;let landings=0;for(let k=0;k<200;k++){if(p.onGround){landings++;b.input.jumpEdge=true;}b.update(1/60);}b.releaseKeyboard();if(p.z>-1740||p.hp!==b.effMaxHp(p))throw Error('Crossing failed seed '+seed);results.push({seed,side:g.escape.plan.side,landings,z:Math.round(p.z)});b.delveExit();}
  return results;
 });
}
