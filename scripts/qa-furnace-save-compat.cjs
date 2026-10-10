async page=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.openHub();b.enterZone(4);b.nextArea();});
  await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.furnace);
  const r=await page.evaluate(()=>{
    const b=__BF3,G=b.G,s=G.storyState;
    Object.assign(s.flags,{'gf.access':true,'gf.martin.met':true,'gf.passage':true,'gf.quiet':true,'gf.transport':true,'gf.bells.open':false});s.items['gf.bells']=1;
    b.briarSync();const partial={legacyCount:s.items['gf.bells'],objective:BFGreatFurnace.quest(s,G),available:BFGreatFurnace.available('gf.evac.call',G),workers:G.ironWorkers.map(n=>n.z)};
    s.flags['gf.evacuated']=true;b.briarSync();const complete={objective:BFGreatFurnace.quest(s,G),available:BFGreatFurnace.available('gf.evac.call',G),crossing:!!G.furnace.evacuated,workers:G.ironWorkers.map(n=>n.z)};
    return {partial,complete};
  });
  if(r.partial.legacyCount!==1||!r.partial.available||!/Ring the work bell/.test(r.partial.objective)||!r.complete.crossing||r.complete.available||!r.complete.workers.every(z=>z>-2300)||errors.length)throw Error(JSON.stringify({r,errors}));
  return {checks:['partial bell state becomes new escort start','completed evacuation remains complete','no browser errors'],r,errors};
}
