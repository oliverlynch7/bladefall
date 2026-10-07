async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto('http://127.0.0.1:4339/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready,null,{polling:100});
 const result=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.introSeen=true;b.meta.bank=null;b.openHub();
  const campaignGold=b.meta.gold;b.startDelve('warrior',{tier:1});if(b.G.escape.layoutVersion!==8||b.G.escape.plan.rooms.length!==11)throw Error('New run layout');let g=b.G;const floors=[];
  for(let section=1;section<=3;section++){
   g=b.G;if(g.floor!==section)throw Error('Wrong section transition');const p=g.p;const rooms=g.escape.plan.rooms.filter(q=>!q.optional&&['fight','waves','boss'].includes(q.kind));
   const startGold=BFPrisonRun.profile().gold;
   for(const q of rooms){Object.assign(p,{x:q.x,z:q.z+80,y:0,vx:0,vy:0,vz:0,onGround:true,invuln:999});
    for(let wave=0;wave<(q.kind==='waves'?2:1);wave++){
     BFPrisonRun.tick(.016);const foes=g.enemies.filter(e=>e.prisonRoom===q.id&&!e.dead);if(!foes.length)throw Error('Missing enemies: '+section+'/'+q.id+'/'+wave);
     foes.forEach(e=>{e.hp=0;e.dead=true;});g.time+=2;BFPrisonRun.tick(.016);g.time+=4;
    }
    BFPrisonRun.tick(.016);if(!g.escape.states[q.id]?.cleared)throw Error('Room failed to clear: '+section+'/'+q.id);
   }
   if(!g.floorCleared||!g.portal)throw Error('Exit not open: '+section);
   if(g.chests.length!==2)throw Error('Chest economy changed: '+section+'='+g.chests.length);
   const earned=BFPrisonRun.profile().gold-startGold;if(earned<200)throw Error('Too little room gold: '+section+'='+earned);
   BFPrisonRun.tick(.016);if(BFPrisonRun.profile().gold-startGold!==earned)throw Error('Repeated room credit');
   floors.push({section,earned,chests:g.chests.map(c=>c.rarity)});
   if(section<3){if(section===1)p.hp=37;BFPrisonRun.checkpoint();b.delveDescend();if(section===1&&b.G.p.hp!==37)throw Error('Health attrition reset between sections');}
  }
  b.delveDescend();const pr=BFPrisonRun.profile();if(pr.tier<2||pr.checkpoint)throw Error('Victory did not unlock tier/clear checkpoint');
  if(b.meta.gold!==campaignGold)throw Error('Dungeon gold leaked into campaign');
  document.getElementById('prisonAgain').click();b.startDelve('warrior',{tier:2});g=b.G;b.loadDelveFloor(1);const q=g.escape.plan.rooms[8];Object.assign(g.p,{x:q.x,z:q.z+80,y:0,invuln:999});BFPrisonRun.tick(.016);g.enemies.filter(e=>e.prisonRoom===8&&!e.dead).forEach(e=>{e.hp=0;e.dead=true;});g.time+=2;BFPrisonRun.tick(.016);g.time+=4;BFPrisonRun.tick(.016);
  const captain=g.enemies.find(e=>e.prisonRoom===8&&!e.dead&&e.label==='Watch Captain');if(!captain)throw Error('Tier-2 watch captain missing');
  return {floors,wallet:pr.gold,tier:pr.tier,healthCarries:true,captain:captain.label,campaignGoldPreserved:true};
 });
 if(errors.length)throw Error(errors.join('; '));return result;
}

