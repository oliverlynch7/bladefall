async page=>{
 await(await page.context().newCDPSession(page)).send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.autoAttack=false;b.meta.petActive=null;b.openHub();b.enterZone(7);b.meta.tutOff=true;});
 await page.waitForFunction(()=>!BF_LOADING.active&&__world3d().counts.name==='Castle Gates');
 return page.evaluate(()=>{
  const b=__BF3,G=b.G,s=G.storyState,checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n);};
  s.flags['cg.met']=true;s.flags['cg.catch.east']=true;b.briarSync();
  ok('old east-only partial state does not bypass brake',!s.flags['cg.bridge.open']&&!G.castleGates.drainReturn&&!G.castleGates.bridgeDeck);
  ok('guidance points to far-bank brake',BFPartyNavigation.target(G)?.key==='cg.catch.west');
  s.flags['cg.catch.west']=true;b.briarSync();b.briarSync();
  ok('old west partial state has one return walkway',G.obstacles.filter(o=>o.castleDrainReturn).length===7);
  ok('guidance returns to near-bank wheel',BFPartyNavigation.target(G)?.key==='cg.bridge');
  ok('old west note is migrated',!s.notes['cg.catch.west']||s.notes['cg.catch.west'].title==='Bridge brake released');
  s.flags['cg.bridge.open']=true;b.briarSync();b.briarSync();
  ok('old complete state has one physical bridge',G.obstacles.filter(o=>o.castleBridgeDeck).length===14&&!G.walls.some(w=>w.castleTag==='bridge'));
  ok('legacy helper is no longer visible',!G.storyObjects.some(o=>o.key==='cg.catch.east'));
  return {checks,returnPlanks:G.obstacles.filter(o=>o.castleDrainReturn).length,bridgePlanks:G.obstacles.filter(o=>o.castleBridgeDeck).length};
 });
}
