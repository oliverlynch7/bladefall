async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 const result=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.openHub();b.enterZone(7);b.G.area=1;b.loadArea();
  const s=b.G.storyState;s.flags['la.cells']=true;s.items['la.vault.0']=2;s.items['la.vault.1']=3;
  b.loadArea();
  const partial={open:!!b.G.storyState.flags['la.vault.open'],wall:b.G.walls.some(w=>w.ascentTag==='vault'),brake:b.G.storyObjects.some(o=>o.key==='la.vault.brake'),oldWheels:b.G.storyObjects.some(o=>o.key==='la.vault.left'||o.key==='la.vault.right')};
  b.G.storyState.flags['la.vault.open']=true;b.loadArea();
  const complete={open:!!b.G.storyState.flags['la.vault.open'],wall:b.G.walls.some(w=>w.ascentTag==='vault'),shard:b.worldRiftShards().some(q=>q.id==='CD-03'),at:b.G.ascent.vaultAt};
  return {partial,complete};
 });
 if(errors.length)throw Error(errors.join(';'));
 if(result.partial.open||!result.partial.wall||!result.partial.brake||result.partial.oldWheels)throw Error('Old partial wheel save changed the route: '+JSON.stringify(result));
 if(!result.complete.open||result.complete.wall||!result.complete.shard||result.complete.at!==null&&result.complete.at!==-Infinity)throw Error('Old completed vault save failed: '+JSON.stringify(result));
 return result;
}
