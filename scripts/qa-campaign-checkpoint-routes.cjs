async page => {
 if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(page.url()))throw Error("Checkpoint QA only runs against a local test save.");
 await page.reload();
 return await page.evaluate(()=>{
  const b=__BF3,checks=[];b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classUnlocked.reaper=true;b.meta.classId='reaper';b.openHub();
  for(let z=0;z<b.ZONES.length;z++){
   b.enterZone(z);
   for(let a=0;a<3;a++){
    const expected=b.G.area,seed=b.G.runSeed,gold=b.meta.gold,cls=b.meta.classId;
    b.meta.gold+=10;b.G.p.x+=500;b.G.p.y=200;b.continueRun();
    if(b.G.zone!==z||b.G.area!==expected||b.G.runSeed!==seed||b.meta.gold!==gold||b.meta.classId!==cls||b.G.p.weapon.intrinsic!=='reaper'||b.G.p.x!==b.G.lastSafe.x||b.G.p.y!==(b.G.lastSafe.y||0))throw Error('route restore failed '+z+'/'+expected);
    checks.push(z+'/'+expected);
    if(a<2)b.nextArea();
   }
   b.openHub();
  }
  return {routes:checks.length,checkpoints:checks};
 });
}
