async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto('http://127.0.0.1:4339/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready,null,{polling:100});
 const result=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.introSeen=true;b.meta.bank=null;b.openHub();b.startDelve('warrior');
  const g=b.G,sections=[];g.p.invuln=999;
  for(let floor=1;floor<=3;floor++){
   if(floor>1)b.loadDelveFloor(floor);
   const plan=g.escape.plan;if(plan.revision!==10)throw Error('wrong revision');
   for(const id of plan.mainRoute){const q=plan.rooms[id];Object.assign(g.p,{x:q.x,z:q.z+80,y:0,invuln:999});BFPrisonRun.tick(.016);
    const st=g.escape.states[id];if(!st?.started)throw Error('room did not start '+floor+'/'+id);
    if(q.mechanic==='hold'){
     Object.assign(g.p,{x:q.x,z:q.z,y:0});for(let i=0;i<205;i++){for(const e of g.enemies.filter(e=>e.prisonRoom===id)){e.dead=true;e.hp=0;}g.time+=.1;BFPrisonRun.tick(.1);}
    }else{
     for(let wave=0;wave<(q.kind==='waves'?2:1);wave++){
      for(const e of g.enemies.filter(e=>e.prisonRoom===id)){e.dead=true;e.hp=0;}g.time+=2;BFPrisonRun.tick(.016);
      if(wave===0&&q.kind==='waves'){g.time+=3.1;BFPrisonRun.tick(.016);}
     }
    }
    if(!g.escape.states[id]?.cleared)throw Error('room not cleared '+floor+'/'+id);
   }
   if(!g.floorCleared||!g.portal||g.chests.length!==2)throw Error('floor not complete '+floor);
   sections.push({floor,rooms:plan.rooms.length,required:plan.mainRoute.length,chests:g.chests.length,progress:plan.rooms[13].holdSeconds});
  }
  b.delveDescend();if(BFPrisonRun.profile().tier<2)throw Error('next tier locked');
  const gold=BFPrisonRun.profile().gold;b.delveExit();return {sections,tier:BFPrisonRun.profile().tier,gold};
 });if(errors.length)throw Error(errors.join('\n'));return result;
}
