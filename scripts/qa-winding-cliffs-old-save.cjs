async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const checks=[];
 const ok=(name,value)=>{if(!value)throw Error(name);checks.push(name)};
 for(const complete of [false,true]){
  await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  const before=await page.evaluate(async complete=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.enterZone(1);const route=b.meta.run.campaign;
   route.revision=2002;route.storyState.items['hp.code']=complete?3:2;route.storyState.notes['hp.code']={region:'hollow',title:'Old code',text:'Press three numbers.'};
   if(complete){route.storyState.flags['hp.code.open']=true;route.storyState.flags['hp.code.claimed']=true;route.storyState.rewards['hp.cliffcache']={kind:'cliff_cache',amount:1,claimed:true};}
   b.persist();return {saved:!!b.meta.run,revision:route.revision,complete};},complete);
  ok('older route persisted',before.saved&&before.revision===2002);
  await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  const after=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const s=b.G.storyState,keys=b.briarObjects().map(o=>o.key);return {zone:b.G.zone,area:b.G.area,oldProgress:s.items['hp.code'],note:s.notes['hp.code']?.text,open:!!s.flags['hp.code.open'],claimed:!!s.flags['hp.code.claimed'],reward:!!s.rewards['hp.cliffcache'],release:keys.includes('hp.code.release'),chest:keys.includes('hp.code.claim')};});
  ok(complete?'completed old chest stays complete':'partial old lock becomes physical climb',after.zone===1&&after.area===0&&after.oldProgress===(complete?3:2)&&after.open===complete&&after.claimed===complete&&after.release!==complete&&!after.chest&&after.note?.includes(complete?'cargo has lifted':'uneven brackets'));
  if(complete)ok('old reward still owned',after.reward);
 }
 for(const kind of ['partial','ready','complete']){
  await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  await page.evaluate(async kind=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.enterZone(1);const s=b.meta.run.campaign.storyState;s.flags['hp.trail']=true;s.flags['hp.orders']=true;s.items['hp.weight.mask']=kind==='partial'?1:5;s.items['hp.weight']=kind==='partial'?2:7;s.flags['hp.weight.open']=kind!=='partial';s.flags['hp.bridge']=kind==='complete';s.notes['hp.bridge']={region:'hollow',title:'Old weights',text:'Match seven marks.'};b.persist();},kind);
  await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  const state=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const G=b.G,s=G.storyState;return {bridge:!!s.flags['hp.bridge'],mask:s.items['hp.weight.mask'],cart:BFHollowCliffs.cartProgress(G),cartX:G.cliffs.cartCollider.x,push:b.briarObjects().find(o=>o.key==='hp.cart.push')?.available,brake:b.briarObjects().find(o=>o.key==='hp.brake.right')?.available,note:s.notes['hp.bridge']?.text};});
  ok('old '+kind+' bridge save opens at the right physical state',state.mask===(kind==='partial'?1:5)&&state.bridge===(kind==='complete')&&state.cart===(kind==='partial'?0:1)&&Math.abs(state.cartX-(kind==='partial'?-430:-175))<.01&&(kind==='partial'?state.push&&!state.brake:kind==='ready'?!state.push&&state.brake:!state.push)&&state.note?.includes('cart'));
 }
 if(errors.length)throw Error(JSON.stringify(errors));return {checks,errors};
}
