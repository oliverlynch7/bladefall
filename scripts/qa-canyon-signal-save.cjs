async page=>{
 const checks=[],errors=[],ok=(name,value)=>{if(!value)throw Error(name);checks.push(name)};
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2163');
 await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.enterZone(1);b.nextArea();
  const r=b.meta.run.campaign;r.revision=2004;
  Object.assign(r.storyState.flags,{'lc.entry':true,'lc.rescue':true,'lc.south':true,'lc.alarm.called':true});
  b.autosaveRun();
 });
 await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 const partial=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();
  const G=b.G;Object.assign(G.p,{x:-780,z:-2120,y:0,invuln:999});
  for(const e of G.enemies){e.hp=0;e.dead=true;}
  const warning=G.canyon.alarmAt>G.time;
  for(let i=0;i<205;i++)b.update(.016);
  return {zone:G.zone,area:G.area,warning,wave:G.canyon.alarmWave,alive:G.enemies.filter(e=>e.canyonAlarm&&!e.dead).length,called:!!G.storyState.flags['lc.alarm.called'],cut:!!G.storyState.flags['lc.alarm']};
 });
 ok('old partial loud-rescue save resumes signal response',partial.zone===1&&partial.area===1&&partial.called&&!partial.cut&&partial.warning&&partial.wave===1&&partial.alive===2);
 await page.evaluate(()=>{
  const b=__BF3,r=b.meta.run.campaign;r.revision=2004;
  Object.assign(r.storyState.flags,{'lc.alarm.called':true,'lc.alarm':true});b.autosaveRun();
 });
 await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 const completed=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();
  const G=b.G;Object.assign(G.p,{x:-780,z:-2120,y:0,invuln:999});
  for(let i=0;i<2200;i++)b.update(.016);
  return {zone:G.zone,area:G.area,cut:!!G.storyState.flags['lc.alarm'],timer:G.canyon.alarmAt||0,wave:G.canyon.alarmWave,alive:G.enemies.filter(e=>e.canyonAlarm&&!e.dead).length};
 });
 ok('old completed cable stays quiet after reload',completed.zone===1&&completed.area===1&&completed.cut&&completed.timer===0&&completed.wave===0&&completed.alive===0);
 if(errors.length)throw Error(JSON.stringify(errors));return {checks,partial,completed,errors};
}
