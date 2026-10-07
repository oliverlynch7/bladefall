async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto('http://127.0.0.1:4339/3d/?mute=1');
 await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready,null,{polling:100});
 const result=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.introSeen=true;b.meta.bank=null;b.openHub();b.startDelve('warrior');
  const assert=(yes,what)=>{if(!yes)throw Error(what);};let g=b.G;
  assert(g.escape.layoutVersion===7,'new attempt revision');assert(g.escape.plan.rooms.length===10,'room count');
  const names=[],art=[];const {buildPrisonArt}=await import('./prison-art3d.js?v=2136');
  for(let section=1;section<=3;section++){
   b.loadDelveFloor(section);g=b.G;const p=g.escape.plan;names.push([p.rooms[7].name,p.rooms[8].name]);
   const built=buildPrisonArt(p);assert(built.counts.drawCalls<=12&&built.counts.triangles<65000,'art budget '+JSON.stringify(built.counts));art.push(built.counts);built.group.userData.dispose();
   const room=p.rooms[7];Object.assign(g.p,{x:room.x,y:0,z:room.z+190,invuln:999});b.renderFrame();
   BFPrisonRun.tick(.016);assert(g.enemies.some(e=>e.prisonRoom===room.id&&!e.dead),'room does not spawn');
  }
  assert(new Set(names.flat()).size===6,'spaces repeat');
  b.loadDelveFloor(1);g=b.G;const q=g.escape.plan.rooms[1];Object.assign(g.p,{x:q.x,y:0,z:q.z+90,invuln:999});BFPrisonRun.tick(.016);
  assert(document.getElementById('prisonhud')?.textContent.includes(q.name),'HUD room');
  assert(g.goalPos.x===q.x&&g.goalPos.z===q.z,'objective arrow target');
  assert(BFPrisonRun.packet().layoutVersion===7,'co-op manifest revision');
  for(const mode of ['shoulder','far','first']){b.meta.camMode=mode;b.renderFrame();assert(Number.isFinite(g.eye?.x)&&Number.isFinite(g.eye?.y)&&Number.isFinite(g.eye?.z),'camera '+mode);}
  const save=BFPrisonRun.profile().checkpoint;assert(save?.layoutVersion===7,'checkpoint version');const id=save.id;
  b.openHub();b.startDelve('warrior',{resume:true});assert(b.G.escape.id===id&&b.G.escape.layoutVersion===7,'resume');
  b.G.escape.layoutVersion=6;b.loadDelveFloor(1);const oldPlan=JSON.stringify(b.G.escape.plan);BFPrisonRun.checkpoint();b.openHub();b.startDelve('warrior',{resume:true});assert(b.G.escape.layoutVersion===6&&JSON.stringify(b.G.escape.plan)===oldPlan,'older checkpoint layout');
  b.meta.camMode='shoulder';b.renderFrame();return {names,art,objective:true,checkpoint:true,cameras:3,oldLayout:true};
 });
 await page.screenshot({path:'output/playwright/dungeon-quality-room.png'});
 if(errors.length)throw Error(errors.join('; '));return result;
}
