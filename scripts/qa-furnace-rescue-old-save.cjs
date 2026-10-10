async rootPage=>{
 const context=await rootPage.context().browser().newContext(),page=await context.newPage(),errors=[],checks=[];
 const ok=(name,condition)=>{if(!condition)throw Error(name);checks.push(name);};
 try{
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.petOwned=[];b.openHub();b.enterZone(4);b.nextArea();const c=b.meta.run.campaign;c.revision=2014;c.storyState.flags['gf.access']=true;c.storyState.flags['gf.cage']=true;c.storyState.flags['event.gf.cage']=true;c.storyState.items['gf.pet']=2;c.storyState.notes['gf.cage']={region:'ember',title:'Something alive in the cage',text:'Close the heat feed, open the small air vent, then release the lock.'};b.autosaveRun();});
  await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  const partial=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const G=b.G;return {zone:G.zone,area:G.area,oldProgress:G.storyState.items['gf.pet'],note:G.storyState.notes['gf.cage']?.text,feed:G.storyObjects.some(o=>o.key==='gf.pet.feed'),oldControls:G.storyObjects.filter(o=>/^gf\.pet\.[123]$/.test(o.key)).length,opened:!!G.storyState.flags['gf.pet.open']};});
  ok('old partial state loads and uses the new rescue',partial.zone===4&&partial.area===1&&partial.oldProgress===2&&partial.feed&&!partial.oldControls&&!partial.opened&&partial.note?.includes('defeat the guards'));
  await page.evaluate(()=>{const b=__BF3,c=b.meta.run.campaign;c.revision=2014;c.storyState.flags['gf.pet.open']=true;c.storyState.flags['event.gf.pet.3']=true;c.storyState.rewards['gf.cinder']={kind:'companion',amount:1,claimed:false,recipients:['solo']};b.autosaveRun();});
  await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  const complete=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const G=b.G;return {zone:G.zone,area:G.area,opened:!!G.storyState.flags['gf.pet.open'],spawned:G.enemies.some(e=>e.furnaceCage),available:b.briarObjects().some(o=>o.key==='gf.pet.release'),reward:!!G.storyState.rewards['gf.cinder'],pending:G.pendingCompanions?.includes('cinder')};});
  if(!(complete.zone===4&&complete.area===1&&complete.opened&&!complete.spawned&&!complete.available&&complete.reward&&complete.pending))throw Error('Old completed rescue state '+JSON.stringify(complete));
  checks.push('old completed rescue stays completed and does not spawn a new fight');
  if(errors.length)throw Error(JSON.stringify(errors));return {checks,partial,complete,errors};
 }finally{await context.close();}
}
