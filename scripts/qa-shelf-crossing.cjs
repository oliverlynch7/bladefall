async page=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await(await page.context().newCDPSession(page)).send('Network.setCacheDisabled',{cacheDisabled:true});
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{
    const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.introSeen=true;
    b.meta.tutOff=true;b.meta.camMode='far';b.meta.autoAttack=false;b.meta.petActive=null;
    b.openHub();b.enterZone(6);b.G.area=1;b.loadArea();
  });
  await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.library);
  const before=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p;for(const e of G.enemies)e.dead=true;
    Object.assign(p,{x:1580,z:-3780,y:360,vx:0,vz:0,vy:0,onGround:true});
    Object.assign(G.cam,{x:p.x,z:p.z,y:p.y});for(let i=0;i<40;i++)b.update(.016);
    return {shelves:G.obstacles.filter(q=>q.shelfJump).length,shard:b.worldRiftShards().some(q=>q.id==='SP-03')};
  });
  await page.waitForTimeout(300);
  await page.screenshot({path:'output/playwright/sky-library-shelves-before-2168.png'});
  const first=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p,o=G.storyObjects.find(q=>q.key==='sl.shelf.0');
    Object.assign(p,{x:o.x,z:o.z,y:o.y,vy:0});b.briarRequest('world',{key:o.key});
    return {stage:!!G.storyState.flags['sl.shelf.stage1'],shelves:G.obstacles.filter(q=>q.shelfJump).length,shard:b.worldRiftShards().some(q=>q.id==='SP-03')};
  });
  await page.waitForTimeout(350);
  await page.screenshot({path:'output/playwright/sky-library-shelves-first-2168.png'});
  const route=await page.evaluate(()=>{
    const b=__BF3,G=b.G,p=G.p,legs=[],points=BFSkyLibrary.shelfJumps;
    const travel=q=>{
      let steps=0;
      for(;steps<1000;steps++){
        const dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz);
        if(d<25&&Math.abs(p.y-q[2])<35&&p.onGround)break;
        b.input.jx=d>1?dx/d:0;b.input.jz=d>1?dz/d:0;
        b.input.jump=d>68;
        if(p.onGround&&d>68)b.input.jumpEdge=true;
        b.update(.016);
      }
      b.input.jx=b.input.jz=0;b.input.jump=false;b.input.jumpEdge=false;
      legs.push({target:q,steps,pos:[+p.x.toFixed(1),+p.z.toFixed(1),+p.y.toFixed(1)],onGround:p.onGround});
      return steps<1000;
    };
    for(const q of points.slice(0,2))if(!travel(q))return {legs,error:'first two shelves unreachable'};
    const far=G.storyObjects.find(o=>o.key==='sl.shelf.1');
    b.briarRequest('world',{key:far.key});
    if(!G.storyState.flags['sl.shelf.open'])return {legs,error:'far crank failed'};
    for(const q of points.slice(2))if(!travel(q))return {legs,error:'last shelves unreachable'};
    if(!travel([2260,-4390,420])||!travel([2400,-4430,420]))return {legs,error:'shard shelf unreachable'};
    return {legs,open:!!G.storyState.flags['sl.shelf.open'],shard:b.worldRiftShards().some(q=>q.id==='SP-03')};
  });
  await page.waitForTimeout(350);
  await page.screenshot({path:'output/playwright/sky-library-shelves-far-2168.png'});
  if(errors.length||route.error||!first.stage||first.shelves!==2||before.shelves||before.shard||first.shard||!route.shard)throw Error(JSON.stringify({before,first,route,errors}));
  return {before,first,route,errors};
}
