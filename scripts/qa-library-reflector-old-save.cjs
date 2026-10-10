async rootPage=>{
 const context=await rootPage.context().browser().newContext(),page=await context.newPage(),errors=[],checks=[];
 const ok=(name,value)=>{if(!value)throw Error(name);checks.push(name);};
 try{
  page.on('pageerror',error=>errors.push(error.message));
  await (await page.context().newCDPSession(page)).send('Network.setCacheDisabled',{cacheDisabled:true});
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  await page.evaluate(async()=>{
   const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;
   b.openHub();b.enterZone(6);b.G.area=1;b.loadArea();b.captureCampaignCheckpoint();
   const s=b.meta.run.campaign.storyState;
   s.items['sl.display']=2;s.flags['event.sl.display.0']=true;s.flags['event.sl.display.1']=true;
   s.notes['sl.display']={region:'palace',title:'Three empty places',text:'The mounts show a sun above a sword, with a wing between them. Press the marks in that order.'};
   b.autosaveRun();
  });
  await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  const partial=await page.evaluate(async()=>{
   const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const G=b.G;
   return {zone:G.zone,area:G.area,oldItem:G.storyState.items['sl.display'],oldEvent:!!G.storyState.flags['event.sl.display.1'],oldMarks:G.storyObjects.filter(o=>/^sl\.display\.[012]$/.test(o.key)).length,grip:b.briarObjects().some(o=>o.key==='sl.display.grip'),wall:G.walls.some(w=>w.libraryTag==='display'),shard:b.worldRiftShards().some(q=>q.id==='SP-04'),note:G.storyState.notes['sl.display']?.text};
  });
  ok('old partial display resumes at reflector without opening shard',partial.zone===6&&partial.area===1&&partial.oldItem===2&&partial.oldEvent&&partial.oldMarks===0&&partial.grip&&partial.wall&&!partial.shard&&partial.note?.includes('reflector'));
  await page.evaluate(()=>{const b=__BF3,s=b.meta.run.campaign.storyState;s.flags['sl.display.open']=true;s.flags['event.sl.display.2']=true;b.autosaveRun();});
  await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
  const opened=await page.evaluate(async()=>{
   const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const G=b.G;
   return {zone:G.zone,area:G.area,open:!!G.storyState.flags['sl.display.open'],wall:G.walls.some(w=>w.libraryTag==='display'),grip:b.briarObjects().some(o=>o.key==='sl.display.grip'),shard:b.worldRiftShards().some(q=>q.id==='SP-04'),oldItem:G.storyState.items['sl.display']};
  });
  ok('old opened display retains its uncollected shard',opened.zone===6&&opened.area===1&&opened.open&&!opened.wall&&!opened.grip&&opened.shard&&opened.oldItem===2);
  if(errors.length)throw Error(JSON.stringify(errors));return {checks,partial,opened,errors};
 }finally{await context.close();}
}
