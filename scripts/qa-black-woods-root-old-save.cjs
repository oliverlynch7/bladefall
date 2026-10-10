async rootPage=>{
 const context=await rootPage.context().browser().newContext(),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{
   const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.openHub();b.enterZone(0);b.nextArea();
   const c=b.meta.run.campaign,s=c.storyState;c.revision=1999;s.items['woods.tracks']=2;s.flags['event.woods.tracks.bird']=true;s.flags['event.woods.tracks.deer']=true;
   s.notes['woods.tracks']={region:'outskirts',title:'Tracks around the old stones',text:'Press the matching stones in that order.'};b.autosaveRun();
  });
  await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  const partial=await page.evaluate(async()=>{
   const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const s=b.G.storyState;
   return {zone:b.G.zone,area:b.G.area,oldCount:s.items['woods.tracks'],open:!!s.flags['woods.tracks.open'],oldPresses:b.G.storyObjects.filter(o=>o.kind==='trackstone').length,release:b.briarObjects().some(o=>o.key==='woods.tracks.release'),seal:b.G.obstacles.some(o=>o.woodsTrackSeal),note:s.notes['woods.tracks']?.text};
  });
  if(partial.zone!==0||partial.area!==1||partial.oldCount!==2||partial.open||partial.oldPresses||!partial.release||!partial.seal||!partial.note?.includes('Climb the roots'))throw Error('Old partial grove save: '+JSON.stringify(partial));
  await page.evaluate(()=>{const b=__BF3,s=b.meta.run.campaign.storyState;s.flags['woods.tracks.open']=true;s.flags['event.woods.tracks.wolf']=true;b.autosaveRun();});
  await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  const opened=await page.evaluate(async()=>{
   const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const s=b.G.storyState;
   return {open:!!s.flags['woods.tracks.open'],release:b.briarObjects().some(o=>o.key==='woods.tracks.release'),seal:b.G.obstacles.some(o=>o.woodsTrackSeal),shard:b.worldRiftShards().some(o=>o.id==='BR-04'),sealT:b.G.woodsTrail?.sealT,note:s.notes['woods.tracks']?.text};
  });
  if(!opened.open||opened.release||opened.seal||!opened.shard||opened.sealT!==1||!opened.note?.includes('below'))throw Error('Old completed grove save: '+JSON.stringify(opened));
  if(errors.length)throw Error('Page errors: '+JSON.stringify(errors));
  return {partial,opened};
 }finally{await context.close();}
}
