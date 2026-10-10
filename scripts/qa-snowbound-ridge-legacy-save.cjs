async rootPage=>{
 const context=await rootPage.context().browser().newContext(),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  const prepared=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.openHub();b.enterZone(3);const c=b.meta.run.campaign;c.revision=2003;c.storyState.flags['ff.camp.found']=true;c.storyState.flags['event.ff.camp']=true;c.storyState.items['ff.camp']=[1,3];c.storyState.notes['ff.camp']={region:'frost',title:'Something under the snow',text:'The marks on the posts point to the chest.'};b.autosaveRun();return {revision:c.revision,partial:c.storyState.items['ff.camp']};});
  if(prepared.revision!==2003)throw Error('Could not prepare old camp save');
  await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  const partial=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();return {zone:b.G.zone,area:b.G.area,found:b.G.storyState.flags['ff.camp.found'],open:!!b.G.storyState.flags['ff.camp.open'],release:b.G.storyObjects.some(o=>o.key==='ff.camp.release'),markers:b.G.storyObjects.filter(o=>/^ff\.marker\./.test(o.key)).length,partial:b.G.storyState.items['ff.camp'],note:b.G.storyState.notes['ff.camp']?.text};});
  if(partial.zone!==3||partial.area!==0||!partial.found||partial.open||!partial.release||partial.markers||!partial.note?.includes('broken ledges'))throw Error('Old partial camp save could not continue on the ridge: '+JSON.stringify(partial));
  const opened=await page.evaluate(()=>{const b=__BF3,c=b.meta.run.campaign;c.revision=2003;c.storyState.flags['ff.camp.open']=true;c.storyState.flags['ff.cache']=true;c.storyState.flags['event.ff.cache']=true;b.autosaveRun();return {revision:c.revision,open:c.storyState.flags['ff.camp.open']};});
  if(!opened.open)throw Error('Could not prepare old opened camp save');
  await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  const claimed=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();return {zone:b.G.zone,area:b.G.area,open:!!b.G.storyState.flags['ff.camp.open'],cache:!!b.G.storyState.flags['ff.cache'],release:b.briarObjects().some(o=>o.key==='ff.camp.release'),shard:b.worldRiftShards().some(q=>q.id==='FF-02'),markers:b.G.storyObjects.filter(o=>/^ff\.marker\./.test(o.key)).length};});
  if(claimed.zone!==3||claimed.area!==0||!claimed.open||!claimed.cache||claimed.release||!claimed.shard||claimed.markers)throw Error('Old opened camp save changed: '+JSON.stringify(claimed));
  if(errors.length)throw Error(JSON.stringify(errors));return {partial,claimed,errors};
 }finally{await context.close();}
}
