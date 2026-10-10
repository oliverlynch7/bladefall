// Generate _qa-prechange.html, _qa-prechange-hollow-cliffs.js and
// _qa-prechange-hollow-cliffs.json from HEAD before running this script.
async originalPage=>{
 const context=await originalPage.context().browser().newContext(),page=await context.newPage();
 try{
 const origin='http://127.0.0.1:4331/3d/',fixture='public/3d/_qa-prechange-hollow-cliffs.json';
 const errors=[],checks=[];page.on('pageerror',e=>{if(!(e.stack?.includes('_qa-prechange.html')&&e.stack?.includes('drawCourse')))errors.push(e.message);});const ok=(name,value)=>{if(!value)throw Error(name);checks.push(name)};
 for(const complete of [false,true]){
  await page.route('**/story/hollow-cliffs.json*',r=>r.fulfill({path:fixture,contentType:'application/json'}));
  await page.goto(origin+'_qa-prechange.html?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  const old=await page.evaluate(async complete=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();b.enterZone(1);
   const code=b.G.cliffs.code;for(const n of code.slice(0,complete?3:2)){const o=b.G.storyObjects.find(o=>o.key==='hp.code.'+n);Object.assign(b.G.p,{x:o.x,y:o.y,z:o.z});b.briarRequest('world',{key:o.key});}
   if(complete){const o=b.G.storyObjects.find(o=>o.key==='hp.code.claim');Object.assign(b.G.p,{x:o.x,y:o.y,z:o.z});b.briarRequest('world',{key:o.key});}
   const s=b.G.storyState;b.captureCampaignCheckpoint();b.autosaveRun();return {code,step:s.items['hp.code'],open:!!s.flags['hp.code.open'],claimed:!!s.flags['hp.code.claimed'],reward:!!s.rewards['hp.cliffcache'],saved:!!b.meta.run};},complete);
  ok('actual previous build saved chest state',old.saved&&old.open===complete&&old.claimed===complete&&old.step===(complete?3:2));
  await page.unroute('**/story/hollow-cliffs.json*');
  await page.goto(origin+'?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  const current=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const s=b.G.storyState,keys=b.briarObjects().map(o=>o.key);return {zone:b.G.zone,step:s.items['hp.code'],open:!!s.flags['hp.code.open'],claimed:!!s.flags['hp.code.claimed'],reward:!!s.rewards['hp.cliffcache'],release:keys.includes('hp.code.release'),chest:keys.includes('hp.code.claim'),note:s.notes['hp.code']?.text};});
  ok(complete?'previous completed chest remains complete':'previous partial lock becomes climb',current.zone===1&&current.step===old.step&&current.open===complete&&current.claimed===complete&&current.release!==complete&&!current.chest&&(!complete||current.reward));
 }
 if(errors.length)throw Error(JSON.stringify(errors));return {checks,errors};
 }finally{await context.close();}
}
