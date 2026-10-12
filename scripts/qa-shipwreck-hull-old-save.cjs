async rootPage=>{
 const context=await rootPage.context().browser().newContext(),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{
   const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.openHub();b.enterZone(5);
   const s=b.meta.run.campaign.storyState;s.items['sc.hull']=5;s.items['sc.hull.mask']=5;s.flags['event.sc.weight.1']=true;s.flags['event.sc.weight.3']=true;
   s.flags['sc.hull.note']=true;s.notes['sc.hull']={region:'storm',title:'The trapped crawlspace',text:'Match the old weights.'};b.autosaveRun();
  });
  await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  const partial=await page.evaluate(async()=>{
   const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const G=b.G,s=G.storyState;
   return {oldLoad:s.items['sc.hull'],oldMask:s.items['sc.hull.mask'],open:!!s.flags['sc.hull.open'],oldWeightObjects:G.storyObjects.filter(o=>o.key.startsWith('sc.weight.')).length,release:b.briarObjects().some(o=>o.key==='sc.hull.release'),wall:G.walls.some(w=>w.shoreHatch),note:s.notes['sc.hull']?.text};
  });
  if(partial.oldLoad!==5||partial.oldMask!==5||partial.open||partial.oldWeightObjects||!partial.release||!partial.wall||!partial.note?.includes('cargo cage'))throw Error('Old partial hull save: '+JSON.stringify(partial));
  const lowerPath=await page.evaluate(()=>{const b=__BF3,G=b.G,o=G.storyObjects.find(o=>o.key==='sc.hull.release');G.shore.clock=0;Object.assign(G.p,{x:o.x,z:o.z,y:40});b.briarRequest('world',{key:o.key});return {open:!!G.storyState.flags['sc.hull.open'],wall:G.walls.some(w=>w.shoreHatch)};});
  if(lowerPath.open||!lowerPath.wall)throw Error('Lower path reached upper-deck lever: '+JSON.stringify(lowerPath));
  await page.evaluate(()=>{const b=__BF3,s=b.meta.run.campaign.storyState;s.flags['sc.hull.open']=true;b.autosaveRun();});
  await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  const completed=await page.evaluate(async()=>{
   const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const G=b.G;
   return {open:!!G.storyState.flags['sc.hull.open'],wall:G.walls.some(w=>w.shoreHatch),release:b.briarObjects().some(o=>o.key==='sc.hull.release'),ramp:G.shore.hatchRamp?.length,openAt:G.shore.openAt,shard:b.worldRiftShards().some(o=>o.id==='SC-01')};
  });
  if(!completed.open||completed.wall||completed.release||completed.ramp!==7||completed.openAt!==-100||!completed.shard||errors.length)throw Error(JSON.stringify({completed,errors}));
  return {partial,lowerPath,completed,errors};
 }finally{await context.close();}
}
