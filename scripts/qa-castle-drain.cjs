async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await(await page.context().newCDPSession(page)).send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.autoAttack=false;b.meta.petActive=null;b.openHub();b.enterZone(7);b.meta.tutOff=true;b.meta.camMode='far';});
 await page.waitForFunction(()=>!BF_LOADING.active&&__world3d().counts.name==='Castle Gates');
 const result=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p,checks=[],logs=[],ok=(name,v)=>{if(!v)throw Error(name+' '+JSON.stringify(logs));checks.push(name);};
  for(const e of G.enemies)e.dead=true;
  Object.assign(p,{x:-700,z:-3000,y:100,vx:0,vy:0,vz:0,onGround:true,invuln:999});G.lastSafe={x:p.x,z:p.z,y:p.y};
  const targets=[...G.castleGates.drainSteps,[-960,-3430,100]];
  for(const q of targets){let launched=false;for(let i=0;i<230;i++){
    const dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz);if(d<20&&p.onGround)break;
    b.input.jx=dx/Math.max(d,1);b.input.jz=dz/Math.max(d,1);
    if(d<135&&!launched&&p.onGround){b.input.jumpEdge=true;b.input.jump=true;launched=true;}
    if(launched&&i%15===0)b.input.jump=false;
    b.update(.016);
    if(p.dead||b.mode==='dying')break;
  }
   b.input.jx=b.input.jz=0;b.input.jump=false;logs.push({q,x:p.x,z:p.z,y:p.y,onGround:p.onGround,dead:p.dead,mode:b.mode});
   ok('reached '+q.slice(0,2),Math.hypot(p.x-q[0],p.z-q[1])<32&&Math.abs(p.y-q[2])<35&&b.mode!=='dying');
  }
  ok('closed bridge has no hidden floor',G.obstacles.filter(o=>o.castleBridgeDeck).length===0);
  const brake=G.storyObjects.find(o=>o.key==='cg.catch.west');
  b.briarRequest('world',{key:brake.key});
  ok('brake builds return walkway',G.storyState.flags['cg.catch.west']&&G.obstacles.filter(o=>o.castleDrainReturn).length===7);
  const walk=q=>{for(let i=0;i<1500;i++){const dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz);if(d<18)break;b.input.jx=dx/d;b.input.jz=dz/d;b.update(.016);if(p.dead||b.mode==='dying')break;}b.input.jx=b.input.jz=0;logs.push({walk:q,x:p.x,z:p.z,y:p.y,mode:b.mode});ok('walked to '+q.slice(0,2),Math.hypot(p.x-q[0],p.z-q[1])<32&&b.mode==='play');};
  walk([-700,-3000,100]);walk([0,-2780,200]);walk([-120,-2850,200]);
  const wheel=G.storyObjects.find(o=>o.key==='cg.bridge');b.briarRequest('world',{key:wheel.key});
  ok('wheel lowers physical bridge',G.storyState.flags['cg.bridge.open']&&G.obstacles.filter(o=>o.castleBridgeDeck).length>10&&!G.walls.some(w=>w.castleTag==='bridge'));
  for(let i=0;i<110;i++)b.update(.016);
  ok('drawbridge reaches lowered pose',G.castleGates.bridgeT===1&&G.castleGates.returnT===1);
  walk([0,-2780,200]);walk([0,-3250,240]);walk([0,-3840,240]);
  return {checks,logs,bridgeDeckBefore:0,steps:targets.length,returnPlanks:G.obstacles.filter(o=>o.castleDrainReturn).length,bridgePlanks:G.obstacles.filter(o=>o.castleBridgeDeck).length};
 });
 if(errors.length)throw Error(errors.join(';'));return {...result,errors};
}
