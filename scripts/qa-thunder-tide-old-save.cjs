async page=>{
 const checks=[],errors=[],ok=(name,value)=>{if(!value)throw Error(name);checks.push(name)};page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 const saved=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.openHub();b.enterZone(5);b.nextArea();const c=b.meta.run.campaign;c.revision=2003;c.storyState.flags['tc.tide.open']=true;c.storyState.flags['event.tc.tide.3']=true;c.storyState.items['tc.tide']=3;c.storyState.notes['tc.tide']={region:'storm',title:'The carved tide marks',text:'Three stones show the sea rising.'};b.autosaveRun();return {revision:c.revision,flag:c.storyState.flags['tc.tide.open']};});
 ok('older tide state saved',saved.revision===2003&&saved.flag);
 await page.reload();await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 const loaded=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();return {zone:b.G.zone,area:b.G.area,flag:b.G.storyState.flags['tc.tide.open'],gate:b.G.walls.some(w=>w.thunderTag==='tideGate'),release:b.G.storyObjects.some(o=>o.key==='tc.tide.release'),shard:b.worldRiftShards().some(q=>q.id==='SC-05'),note:b.G.storyState.notes['tc.tide']?.text,progress:b.G.storyState.items['tc.tide']};});
 ok('old save loads with open grotto and same shard',loaded.zone===5&&loaded.area===1&&loaded.flag&&!loaded.gate&&!loaded.release&&loaded.shard);
 ok('old clue updates without deleting progress',loaded.note?.includes('Cross the exposed rocks')&&loaded.progress===3);
 if(errors.length)throw Error(JSON.stringify({errors,loaded}));return {checks,loaded,errors};
}
