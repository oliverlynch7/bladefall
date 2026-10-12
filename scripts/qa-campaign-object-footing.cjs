async root=>{
 const ctx=await root.context().browser().newContext(),page=await ctx.newPage();
 try{
  await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto('http://127.0.0.1:4345/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready,null,{polling:100});await page.evaluate(()=>__BF3.briarReady);
  return await page.evaluate(()=>{
   const b=__BF3,rows=[];b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.classId='warrior';b.meta.introSeen=true;b.meta.hubTutDone=true;b.meta.tutOff=true;b.openHub();
   for(let zone=0;zone<8;zone++)for(let area=0;area<2;area++){
    b.enterZone(zone);b.G.area=area;b.loadArea();const g=b.G;
    for(const o of g.storyObjects.filter(o=>BFCampaignObjects.spec(o))){
     const d=BFCampaignObjects.spec(o),saved=g.obstacles;g.obstacles=saved.filter(w=>w.interactionKey!==o.key);const points=['notice','diagram','trail'].includes(d.model)?[[-23,-2],[23,-2]]:[[-22,-14],[22,-14],[-22,14],[22,14]];const c=Math.cos(o.artYaw||0),sn=Math.sin(o.artYaw||0);const floors=points.map(([dx,dz])=>b.floorAt(o.x+dx*c+dz*sn,o.z+dz*c-dx*sn,0,(o.y||0)+100));g.obstacles=saved;
     const blockers=[...g.walls,...g.obstacles].filter(w=>w.kind!=='plat'&&w.interactionKey!==o.key&&!w.nocol&&!w.open&&Math.abs(w.x-o.x)<(w.w||0)/2+25&&Math.abs(w.z-o.z)<(w.d||0)/2+20&&(w.y0||0)<(o.y||0)+55&&(w.courtWall?(w.y0||0)+(w.h||0):w.h)>(o.y||0)+5);
     if(floors.some(y=>Math.abs(y-(o.y||0))>1)||blockers.length)rows.push({zone,area,key:o.key,model:d.model,position:[o.x,o.y,o.z],floors,blockers});
    }
   }
   return rows;
  });
 }finally{await ctx.close();}
}
