async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto('http://127.0.0.1:4339/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready,null,{polling:100});
 const result=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.introSeen=true;b.meta.bank=null;b.openHub();b.startDelve('warrior');
  const g=b.G,p=g.p,plan=g.escape.plan;if(plan.revision!==10||plan.rooms.length!==16||plan.rooms[11].mechanic!=='wards'||plan.rooms[13].mechanic!=='hold')throw Error('new layout missing');
  p.invuln=999;const ward=plan.rooms[11];Object.assign(p,{x:ward.x,z:ward.z+70,y:0});BFPrisonRun.tick(.016);
  const ws=g.escape.states[11];if(ws.anchors.length!==2||ws.wardsLeft!==2)throw Error('two wards did not spawn');
  const target=g.enemies.find(e=>e.mid===ws.anchors[0]),hp=target.hp;
  Object.assign(p,{x:target.x,z:target.z+46,y:0,yaw:Math.PI,atkCd:0});b.playerAttack();for(let i=0;i<24;i++)b.update(.016);
  if(target.hp>=hp)throw Error('ordinary melee cannot damage ward');
  const before=g.enemies.filter(e=>e.prisonRoom===11&&!e.dead).length;g.time+=6.2;BFPrisonRun.tick(.016);
  const after=g.enemies.filter(e=>e.prisonRoom===11&&!e.dead).length;if(after!==before+1)throw Error('ward reinforcement absent '+before+' '+after);
  for(const e of g.enemies.filter(e=>e.prisonAnchor)){e.hp=0;e.dead=true;}g.time+=.2;BFPrisonRun.tick(.016);if(ws.wardsLeft!==0)throw Error('wards still active');
  const stopped=g.enemies.filter(e=>e.prisonRoom===11&&!e.dead).length;g.time+=12;BFPrisonRun.tick(.016);if(g.enemies.filter(e=>e.prisonRoom===11&&!e.dead).length!==stopped)throw Error('reinforcements continued');
  for(const e of g.enemies.filter(e=>e.prisonRoom===11)){e.hp=0;e.dead=true;}g.time+=2;BFPrisonRun.tick(.016);if(!ws.cleared)throw Error('ward room did not clear');
  const hold=plan.rooms[13];Object.assign(p,{x:hold.x,z:hold.z+200,y:0});BFPrisonRun.tick(.016);const hs=g.escape.states[13];if(!hs.started)throw Error('hold encounter did not start');
  for(let i=0;i<20;i++){g.time+=.1;BFPrisonRun.tick(.1);}if((hs.holdTime||0)!==0)throw Error('hold charged outside circle');
  Object.assign(p,{x:hold.x,z:hold.z,y:0});for(let i=0;i<65;i++){g.time+=.1;BFPrisonRun.tick(.1);}if(hs.wave!==1||hs.holdTime<6)throw Error('first hold wave missing');
  const charged=hs.holdTime;Object.assign(p,{x:hold.x+200,z:hold.z,y:0});for(let i=0;i<15;i++){g.time+=.1;BFPrisonRun.tick(.1);}if(hs.holdTime!==charged)throw Error('hold failed to pause');
  Object.assign(p,{x:hold.x,z:hold.z,y:0});for(let i=0;i<125;i++){g.time+=.1;BFPrisonRun.tick(.1);}if(hs.wave!==2||hs.holdTime<18)throw Error('final hold wave missing');
  for(const e of g.enemies.filter(e=>e.prisonRoom===13)){e.hp=0;e.dead=true;}g.time+=2;BFPrisonRun.tick(.016);if(!hs.cleared)throw Error('hold room did not clear');
  const firstGold=BFPrisonRun.profile().gold;BFPrisonRun.tick(.016);if(BFPrisonRun.profile().gold!==firstGold)throw Error('duplicate reward');
  // An unfinished hold encounter restarts from zero on resume, while completed
  // work and the permanent wallet survive the same save operation.
  b.loadDelveFloor(2);const h2=g.escape.plan.rooms[13];Object.assign(p,{x:h2.x+205,z:h2.z,y:0});
  b.MP.active=true;b.MP.isHost=true;b.MP.zone=-304;b.MP.peers={friend:{zone:-304,x:h2.x,z:h2.z,y:0,dead:false,downed:false}};
  for(let i=0;i<12;i++){g.time+=.1;BFPrisonRun.tick(.1);}if(g.escape.states[13].holdTime<1)throw Error('friend could not hold the circle');
  if(BFPrisonRun.packet().states[13].holdTime<1)throw Error('hold progress absent from co-op packet');
  b.MP.active=false;b.MP.peers={};Object.assign(p,{x:h2.x,z:h2.z,y:0});for(let i=0;i<25;i++){g.time+=.1;BFPrisonRun.tick(.1);}if(g.escape.states[13].holdTime<3)throw Error('second hold did not advance');
  BFPrisonRun.checkpoint();const saved=BFPrisonRun.profile().checkpoint;if(saved.layoutVersion!==10)throw Error('checkpoint revision');
  b.delveExit();b.startDelve('warrior',{resume:true});if(b.G.escape.layoutVersion!==10||b.G.escape.states[13].holdTime!==0||b.G.escape.states[13].started)throw Error('unfinished hold did not restart');
  if(BFPrisonRun.profile().gold!==firstGold)throw Error('wallet lost on resume');b.delveExit();
  return {revision:10,wardReinforcements:after-before,wardClear:true,holdWaves:2,holdPaused:true,friendCanHold:true,resume:true,gold:firstGold};
 });if(errors.length)throw Error(errors.join('\n'));return result;
}
