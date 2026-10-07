async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto('http://127.0.0.1:4339/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready,null,{polling:100});
 const got=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.introSeen=true;b.openHub();BFPrisonRun.profile().tier=2;b.startDelve('warrior',{tier:2});const g=b.G,q=g.escape.plan.rooms[10],p=BFPrisonRun.profile(),a={gold:p.gold,seals:p.progress.seals};Object.assign(g.p,{x:q.cacheGoal.x,y:0,z:q.cacheGoal.z,invuln:999});BFPrisonRun.tick(.016);const out={gold:p.gold-a.gold,seals:p.progress.seals-a.seals,checkpoint:!!p.checkpoint?.states?.rafters,receipt:g.escape.events.filter(e=>e.id.endsWith(':rafters')).length};BFPrisonRun.tick(.016);out.repeatGold=p.gold-a.gold;return out;});
 if(got.gold!==240||got.seals!==1||!got.checkpoint||got.receipt!==1||got.repeatGold!==240)throw Error(JSON.stringify(got));if(errors.length)throw Error(errors.join('; '));return got;
}
