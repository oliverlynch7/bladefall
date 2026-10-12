// Run through playwright-cli against the local build. Uses a disposable profile.
async root=>{
 const context=await root.context().browser().newContext(),page=await context.newPage();
 try{
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto('http://127.0.0.1:4345/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready,null,{polling:100});
  await page.evaluate(()=>__BF3.briarReady);
  return await page.evaluate(()=>{
   const b=__BF3,rows=[];b.loadMode('rl');Object.assign(b.meta,{classId:'warrior',run:null,bank:null,introSeen:true,hubTutDone:true,tutOff:true,dialogueTTS:false});b.meta.classUnlocked.warrior=true;b.openHub();
   for(let zone=0;zone<8;zone++)for(let area=0;area<2;area++){
    b.enterZone(zone);b.G.area=area;b.loadArea();const g=b.G;
    const paths=({0:area===0?Object.fromEntries((g.campaignLayout?.edges||[]).map(e=>['lane'+e.a+'To'+e.b,e.points.map(p=>[p.x,p.z,p.y])])):Object.fromEntries(['climb','upper','cross','loft','down'].map(k=>[k,g.blackWoods?.[k]])),1:area===0?BFHollowCliffs.paths:BFLostCanyon.paths,2:area===0?BFBrokenWalls.paths:BFPrison.paths,3:area===0?BFSnowbound.paths:BFIceCaves.paths,4:area===0?BFIronHalls.paths:BFGreatFurnace.paths,5:area===0?BFShipwreckShore.paths:BFThunderCliffs.paths,6:area===0?BFPalaceCourtyard.paths:{...BFSkyLibrary.paths,...BFDragonRescue.paths},7:area===0?BFCastleGates.paths:{...g.ascent?.routes,spiral:BFLongAscent.path}})[zone]||{};
    rows.push({zone,area,name:g.areaName,bounds:g.bounds,rooms:g.rooms.map(({name,x,z,y,w,d})=>({name,x,z,y,w,d})),segments:g.segments,plats:g.obstacles.filter(o=>o.kind==='plat'),walls:g.walls,obstacles:g.obstacles.filter(o=>o.kind!=='plat'),objects:g.storyObjects,npcs:g.storyNpcs,start:g.startPos,portal:g.portalPos,paths,geography:g.geography,enemies:g.enemies.map(({type,x,z,y})=>({type,x,z,y})),dens:g.dens.map(({id,x,z,y,r,maxAlive})=>({id,x,z,y,r,maxAlive})),shards:g.shards});
   }
   return rows;
  });
 }finally{await context.close();}
}
