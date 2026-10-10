async rootPage=>{
 const context=await rootPage.context().browser().newContext(),page=await context.newPage(),errors=[],checks=[];
 const ok=(name,value)=>{if(!value)throw Error(name);checks.push(name);};
 try{
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  await page.evaluate(async()=>{
   const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.riftShards=[];b.openHub();b.enterZone(4);b.nextArea();
   const s=b.meta.run.campaign.storyState;
   s.flags['gf.cool.open']=true;s.flags['gf.cache']=true;
   s.flags['event.gf.cache.1']=true;s.flags['event.gf.cache.2']=true;
   s.items['gf.cache']=2;
   s.notes['gf.cache']={region:'ember',title:'The cooling-box plate',text:'Press the last marked shape first.'};
   b.autosaveRun();
  });
  await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  const partial=await page.evaluate(async()=>{
   const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const G=b.G;
   return {zone:G.zone,area:G.area,oldProgress:G.storyState.items['gf.cache'],oldEvents:!!G.storyState.flags['event.gf.cache.2'],release:G.storyObjects.some(o=>o.key==='gf.cache.release'),oldControls:G.storyObjects.filter(o=>/^gf\.cache\.[123]$/.test(o.key)).length,live:G.furnace.cachePistonsLive,open:!!G.storyState.flags['gf.cache.open'],shard:b.worldRiftShards().some(o=>o.id==='ED-04'),note:G.storyState.notes['gf.cache']?.text};
  });
  ok('old partial puzzle resumes at the new route',partial.zone===4&&partial.area===1&&partial.oldProgress===2&&partial.oldEvents&&partial.release&&partial.oldControls===0&&partial.live&&!partial.open&&!partial.shard&&partial.note?.includes('counterweights'));
  await page.evaluate(()=>{const b=__BF3,s=b.meta.run.campaign.storyState;s.flags['gf.cache.open']=true;s.flags['event.gf.cache.3']=true;b.autosaveRun();});
  await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  const opened=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const G=b.G;return {zone:G.zone,area:G.area,open:!!G.storyState.flags['gf.cache.open'],available:b.briarObjects().some(o=>o.key==='gf.cache.release'),shard:b.worldRiftShards().some(o=>o.id==='ED-04'),oldProgress:G.storyState.items['gf.cache']};});
  if(!(opened.zone===4&&opened.area===1&&opened.open&&!opened.available&&opened.shard&&opened.oldProgress===2))throw Error('old opened state '+JSON.stringify(opened));
  checks.push('old opened box stays open with an uncollected shard');
  if(errors.length)throw Error(JSON.stringify(errors));
  return {checks,partial,opened,errors};
 }finally{await context.close();}
}
