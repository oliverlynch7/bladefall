async page=>{
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');Object.assign(b.meta,{run:null,bank:null,introSeen:true,tutOff:true,autoAttack:false,petActive:null,dialogueTTS:false});});
 const geometry=await page.evaluate(()=>{
  const A=BFCampaignElites,checks={};const p={x:100,z:0,y:0,hp:100,r:12};
  for(const role of ['runner','guard','hex']){
   const e={briarRole:role,ceKind:'briar_'+role,ceState:'hunt',ceClock:0,ceSerial:0,x:0,z:0,y:0,r:17};A.step(e,.016,p,0);
   const aim=[e.ceX,e.ceZ,e.ceDX,e.ceDZ];p.z=140;A.step(e,.05,p,0);checks[role+'LocksAim']=JSON.stringify(aim)===JSON.stringify([e.ceX,e.ceZ,e.ceDX,e.ceDZ]);
   e.ceState='strike';e.ceClock=.1;checks[role+'Dodge']=!A.contains(e,p);
   p.z=0;if(role==='runner')e.x=80;checks[role+'Hits']=A.contains(e,p);
   checks[role+'HeightSafe']=!A.contains(e,{...p,y:160});
  }
  const wall={x:50,z:0,w:20,d:100,h:100};checks.wallBlocks=A.blocked({ceX:0,ceZ:0,ceY:0},p,[wall]);checks.floorDoesNotBlock=!A.blocked({ceX:0,ceZ:0,ceY:0},p,[{...wall,h:10}]);
  if(Object.values(checks).some(v=>!v))throw Error(JSON.stringify(checks));return checks;
 });
 const camps=[];
 for(const area of [0,1]){
  await page.evaluate(area=>{const b=__BF3;b.meta.classes[b.meta.classId].rank=10;b.openHub();b.enterZone(0);b.G.area=area;b.loadArea();},area);await page.waitForFunction(()=>!BF_LOADING.active);
  camps.push(await page.evaluate(area=>{
   const b=__BF3,G=b.G,w=G.patrolWork,s=G.storyState,p=G.p;for(const e of G.enemies)e.stunT=9999;p.invuln=9999;
   const killed=[];let cycles=0;while((s.items[w.id]||0)<w.total&&cycles++<6){
    for(const slot of w.slots){const e=G.enemies.find(e=>e.mid===slot.mid&&!e.dead);if(e){e.hp=0;b.killEnemy(e);killed.push(e.mid);}}
    Object.assign(p,{x:w.anchor.x+480,z:w.anchor.z,y:w.anchor.y});
    b.update(.016);G.time+=26;for(let i=0;i<3;i++)b.update(.016);
    if(G.enemies.some(e=>e.patrolReturn&&!e.dead&&!e.briarRole))throw Error('respawn lost role');
   }
   const count=s.items[w.id],done=s.flags[w.id+'.done'],reward=s.rewards[w.id];const alive=G.enemies.filter(e=>e.patrolReturn&&!e.dead).length;
   const e=G.enemies.find(e=>e.patrolReturn&&!e.dead);if(e){e.hp=0;b.killEnemy(e);}if(s.items[w.id]!==count)throw Error('completed count changed');
   if(!done||!reward||alive>w.slots.length)throw Error(JSON.stringify({area,count,done,reward,alive,cycles}));
   return {area,count,done,reward:reward.kind,cycles,respawnCap:w.slots.length,alive};
  },area));
 }
 return {geometry,camps};
}
