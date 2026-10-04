async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
 await page.route('**/*',r=>r.continue());
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready&&window.BFPrisonRun,null,{polling:100});
 const result=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.introSeen=true;b.meta.gold=12345;b.meta.heroName='Prison QA';b.openHub();
  const before=JSON.stringify([b.meta.gold,b.meta.classes,b.meta.stash,b.meta.hero]);
  b.startDelve('warrior');const g=b.G;const initial={hp:g.p.hp,max:g.p.maxHp,rooms:g.escape.plan.rooms.length};
  b.update(.016);b.render();b.flushHero3D();
  g.p.z=-720;BFPrisonRun.tick(.016);const enemies=g.enemies.length;
  g.enemies.forEach(e=>{e.dead=true;e.hp=0;});g.time+=2;BFPrisonRun.tick(.016);
  const earned=BFPrisonRun.profile().gold;g.p.hp=37;BFPrisonRun.checkpoint();b.delveExit();
  if(JSON.stringify([b.meta.gold,b.meta.classes,b.meta.stash,b.meta.hero])!==before)throw Error('Campaign escrow changed');
  b.startDelve('warrior',{resume:true});if(b.G.p.hp!==37)throw Error('Resume healed');
  if(!b.G.escape.states[1].cleared)throw Error('Room reset');
  for(let floor=1;floor<=3;floor++){
   for(const id of [1,3,4])b.G.escape.states[id]={cleared:true};
   BFPrisonRun.tick(.016);b.G.floorCleared=true;b.delveDescend();
  }
  const p=BFPrisonRun.profile();if(p.tier!==2||p.checkpoint!==null)throw Error('Escape did not finish');
  b.openHub();if(p.checkpoint!==null)throw Error('Finished run resurrected');
  if(!BFPrisonDungeon.buy(p,'health'))throw Error('Upgrade purchase failed');b.persist();b.startDelve('warrior');if(b.effMaxHp(b.G.p)!==initial.hp+6)throw Error('Starting upgrade missing');b.G.p.hp=0;b.die();if(p.checkpoint!==null||b.meta.gold!==12345)throw Error('Death escrow failed');
  return {initial,enemies,earned,tier:p.tier,gold:p.gold,campaignGold:b.meta.gold,deathAndUpgrade:true,errors:[]};
 });
 if(errors.length)throw Error(errors.join('\n'));return result;
}
