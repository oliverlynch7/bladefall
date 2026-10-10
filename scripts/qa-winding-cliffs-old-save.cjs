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
 if(errors.length)throw Error(JSON.stringify(errors));return {checks,errors};
}
