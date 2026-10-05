async page=>{
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready,null,{polling:100});
 const result=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.bank=null;b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.introSeen=true;b.meta.classUnlocked.warrior=true;b.openHub();b.startDelve('warrior');b.meta.camMode='shoulder';const g=b.G,p=g.p;let passages=0;
 for(let seed=0;seed<6;seed++)for(let section=1;section<=3;section++){
  g.runSeed=seed;b.loadDelveFloor(section);for(const room of g.escape.plan.rooms)g.escape.states[room.id]={cleared:true};
  for(const [a,c]of g.escape.plan.links){const r=g.escape.plan.rooms[a],q=g.escape.plan.rooms[c],dx=Math.sign(q.x-r.x),dz=Math.sign(q.z-r.z),target={x:q.x-dx*310,z:q.z-dz*310};Object.assign(p,{x:r.x+dx*310,z:r.z+dz*310,y:0,vx:0,vy:0,vz:0,onGround:true,hp:999,invuln:999});g.camYaw=Math.atan2(dx,dz);b.input.up=true;
   for(let f=0;f<150&&Math.hypot(p.x-target.x,p.z-target.z)>10;f++)b.update(1/60);b.releaseKeyboard();if(Math.hypot(p.x-target.x,p.z-target.z)>12||p.y<-3)throw Error('Blocked passage '+JSON.stringify({seed,section,a,c,target,x:p.x,z:p.z,y:p.y}));passages++;
  }
 }
 // Checkpoint keeps revision, exact topology, health and collected inventory.
 g.runSeed=22;b.loadDelveFloor(2);const geometry=JSON.stringify(g.escape.plan);p.hp=43;BFPrisonRun.checkpoint();b.openHub();b.startDelve('warrior',{resume:true});if(b.G.escape.layoutVersion!==6||b.G.p.hp!==43||JSON.stringify(b.G.escape.plan)!==geometry)throw Error('New layout resume');
 const packet=BFPrisonRun.packet(),expected=JSON.stringify(b.G.escape.plan);b.openHub();BFPrisonRun.receive(packet);if(JSON.stringify(b.G.escape.plan)!==expected||!b.G.escape.remote)throw Error('Guest topology mismatch');
 // Existing revision 5 run remains revision 5 after resume.
 b.openHub();b.startDelve('warrior');b.G.escape.layoutVersion=5;b.loadDelveFloor(1);BFPrisonRun.checkpoint();b.openHub();b.startDelve('warrior',{resume:true});if(b.G.escape.layoutVersion!==5||b.G.escape.plan.rooms.length!==9)throw Error('Legacy run changed');
 return {passages,newCheckpoint:true,guestTopology:true,legacyCheckpoint:true};});return result;
}
