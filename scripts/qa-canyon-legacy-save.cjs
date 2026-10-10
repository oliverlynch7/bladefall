async page=>{
 const checks=[],errors=[],ok=(label,value)=>{if(!value)throw Error(label);checks.push(label)};
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2162');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 const prepared=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.enterZone(1);b.nextArea();
  const r=b.meta.run?.campaign;if(!r||r.area!==1)throw Error('Lost Canyon checkpoint unavailable');
  r.revision=2003;r.storyState.flags['lc.rail.open']=true;r.storyState.items['lc.rail']=3;
  b.autosaveRun();return {revision:r.revision,open:r.storyState.flags['lc.rail.open']};
 });
 ok('prior layout revision and freight flag written',prepared.revision===2003&&prepared.open);
 await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 const loaded=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();
  return {zone:b.G.zone,area:b.G.area,open:!!b.G.storyState.flags['lc.rail.open'],gate:b.G.obstacles.some(o=>o.lcBlock==='rail'),cart:b.G.canyon?.cartT,brake:b.briarObjects().some(o=>o.key==='lc.rail.release'),legacyItem:b.G.storyState.items['lc.rail']};
 });
 ok('older open store reloads without a duplicate brake',loaded.zone===1&&loaded.area===1&&loaded.open&&!loaded.gate&&loaded.cart===1&&!loaded.brake&&loaded.legacyItem===3);
 if(errors.length)throw Error(JSON.stringify(errors));return {checks,loaded,errors};
}
