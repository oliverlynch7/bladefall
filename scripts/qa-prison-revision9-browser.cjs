async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto('http://127.0.0.1:4339/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready,null,{polling:100});
 const result=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.introSeen=true;b.meta.bank=null;b.openHub();b.startDelve('warrior');
  const g=b.G;if(g.escape.layoutVersion!==9||g.escape.plan.rooms.length!==16)throw Error('new plan missing');const campaignTypes=new Set(),sections=[];
  for(let floor=1;floor<=3;floor++){
   if(floor>1)b.loadDelveFloor(floor);const plan=g.escape.plan,p=g.p;
   for(const id of plan.mainRoute){const room=plan.rooms[id];Object.assign(p,{x:room.x,z:room.z+80,y:0,invuln:999});
    for(let wave=0;wave<(room.kind==='waves'?2:1);wave++){
     BFPrisonRun.tick(.016);const foes=g.enemies.filter(e=>e.prisonRoom===id&&!e.dead);if(!foes.length)throw Error('no encounter '+floor+'/'+id+'/'+wave);
     if(id===11||id===13)for(const e of foes)if(!e.prisonFoe)campaignTypes.add(e.type);
     for(const e of foes){e.dead=true;e.hp=0;}g.time+=5;BFPrisonRun.tick(.016);g.time+=4;
    }
    if(!g.escape.states[id]?.cleared)throw Error('uncleared '+floor+'/'+id);
   }
   if(!g.floorCleared||!g.portal||g.chests.length!==2)throw Error('section incomplete '+floor);
   sections.push({floor,rooms:plan.rooms.length,chests:g.chests.length});
  }
  b.delveDescend();if(BFPrisonRun.profile().tier<2)throw Error('tier did not unlock');
  b.startDelve('warrior');b.G.escape.layoutVersion=8;b.loadDelveFloor(1);BFPrisonRun.checkpoint();b.delveExit();b.startDelve('warrior',{resume:true});
  if(b.G.escape.layoutVersion!==8||b.G.escape.plan.rooms.length!==11)throw Error('old layout resume failed');b.delveExit();
  return {sections,campaignTypes:[...campaignTypes],legacyResume:true};
 });if(errors.length)throw Error(errors.join('\n'));return result;
}
