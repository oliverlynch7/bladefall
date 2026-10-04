async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});await page.route('**/*',r=>r.continue());
 await page.goto('http://127.0.0.1:4338/3d/_qa-prechange.html?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&HERO3D?.ready,null,{polling:100});
 const legacy=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.introSeen=true;b.openHub();b.startDelve('warrior');b.G.p.hp=43;BFPrisonRun.checkpoint();const cp=BFPrisonRun.profile().checkpoint;if(cp.layoutVersion)throw Error('Not a legacy fixture');const value={id:cp.id,seed:cp.seed,rooms:b.G.escape.plan.rooms};b.delveExit();return value;});
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&HERO3D?.ready,null,{polling:100});
 const result=await page.evaluate(async legacy=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.introSeen=true;b.openHub();b.startDelve('warrior',{resume:true});
  if(b.G.p.hp!==43||b.G.escape.layoutVersion!==1||b.G.escape.id!==legacy.id)throw Error('Legacy checkpoint changed');
  for(const r of legacy.rooms){const q=b.G.escape.plan.rooms[r.id];if(q.x!==r.x||q.z!==r.z)throw Error('Legacy room moved');}b.delveExit();
  const rows=[];
  for(const seed of [1,4]){b.startDelve('warrior');const g=b.G,p=g.p;g.runSeed=seed;b.loadDelveFloor(1);const plan=g.escape.plan;if(g.escape.layoutVersion!==2||plan.rooms.length!==7)throw Error('New layout missing');for(const r of plan.rooms)g.escape.states[r.id]={cleared:true};
   // Walk the new horizontal connection using the real player collision loop.
   const boss=plan.rooms[4];Object.assign(p,{x:0,z:-2160,y:0,vx:0,vy:0,vz:0,onGround:true});g.camYaw=boss.x>0?Math.PI/2:-Math.PI/2;b.input.up=true;for(let k=0;k<200;k++)b.update(1/60);b.releaseKeyboard();if(Math.abs(p.x)<550||Math.abs(p.z+2160)>10)throw Error('Blocked boss passage '+seed+' '+p.x);
   const q=plan.rooms[6],gold=BFPrisonRun.profile().gold;Object.assign(p,{x:q.x-255,z:q.z-170,y:0,vx:0,vy:0,vz:0,onGround:true});g.camYaw=Math.PI/2;b.input.up=true;b.input.jump=true;for(let k=0;k<150;k++){if(p.onGround)b.input.jumpEdge=true;b.update(1/60);}b.releaseKeyboard();if(!g.escape.states.cache)throw Error('Cache climb failed '+seed+' '+JSON.stringify({x:p.x-q.x,y:p.y,z:p.z-q.z}));if(BFPrisonRun.profile().gold!==gold+70)throw Error('Cache reward wrong');
   BFPrisonRun.tick(.016);if(BFPrisonRun.profile().gold!==gold+70)throw Error('Cache duplicated');BFPrisonRun.checkpoint();const cp=BFPrisonRun.profile().checkpoint;if(cp.layoutVersion!==2||BFPrisonRun.packet().layoutVersion!==2)throw Error('Revision not persisted');rows.push({seed,side:plan.side,cache:true,exit:g.portal});b.delveExit();b.startDelve('warrior',{resume:true});if(!b.G.portal||b.G.portal.x!==b.G.escape.plan.rooms[4].x)throw Error('Exit in wrong room');if(!b.G.escape.states.cache||b.G.escape.layoutVersion!==2)throw Error('New checkpoint changed');b.delveExit();
  }return {legacyPreserved:true,rows};
 },legacy);if(errors.length)throw Error(errors.join('\n'));return result;
}
