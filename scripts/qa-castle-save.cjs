async page=>{
 const checks=[],ok=(name,value)=>{if(!value)throw Error(name);checks.push(name);};
 await(await page.context().newCDPSession(page)).send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.autoAttack=false;b.openHub();b.enterZone(7);const r=b.meta.run.campaign;r.revision=2050;r.storyState.flags['cg.met']=true;r.storyState.flags['cg.catch.east']=true;r.storyState.notes['cg.catch.east']={region:'castle',title:'East catch released',text:'Release the other catch, then use the wheel on the north bank.'};b.autosaveRun();});
 const resume=async()=>{await page.reload();await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);return page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.continueRun();const G=b.G;return {zone:G.zone,area:G.area,east:!!G.storyState.flags['cg.catch.east'],west:!!G.storyState.flags['cg.catch.west'],bridge:!!G.storyState.flags['cg.bridge.open'],returnPlanks:G.obstacles.filter(o=>o.castleDrainReturn).length,bridgePlanks:G.obstacles.filter(o=>o.castleBridgeDeck).length,bridgeT:G.castleGates?.bridgeT,returnT:G.castleGates?.returnT,note:G.storyState.notes['cg.catch.east']?.title};});};
 const east=await resume();ok('old east-only save reloads without unlocking bridge',east.zone===7&&east.area===0&&east.east&&!east.west&&!east.bridge&&east.returnPlanks===0&&east.bridgePlanks===0&&east.note==='Old bridge catch');
 await page.evaluate(()=>{const b=__BF3,r=b.meta.run.campaign;r.storyState.flags['cg.catch.west']=true;r.storyState.notes['cg.catch.west']={region:'castle',title:'West catch released',text:'Release the east catch, then use the wheel.'};b.autosaveRun();});
 const west=await resume();ok('old west catch reloads with one return walkway',west.west&&!west.bridge&&west.returnPlanks===7&&west.bridgePlanks===0&&west.returnT===1);
 await page.evaluate(()=>{const b=__BF3,r=b.meta.run.campaign;r.storyState.flags['cg.bridge.open']=true;b.autosaveRun();});
 const complete=await resume();ok('old completed bridge reloads lowered and walkable',complete.bridge&&complete.returnPlanks===7&&complete.bridgePlanks===14&&complete.bridgeT===1);
 return {checks,east,west,complete};
}
