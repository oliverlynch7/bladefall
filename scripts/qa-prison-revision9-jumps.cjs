async page=>{
 await page.addInitScript(()=>window.requestAnimationFrame=()=>0);await page.goto('http://127.0.0.1:4339/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready,null,{polling:100});
 return page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.bank=null;b.openHub();b.startDelve('warrior');
  let attempts=0;const p=b.G.p;
  for(const seed of [1,2,3,4])for(let section=1;section<=3;section++){
   b.G.runSeed=seed;b.loadDelveFloor(section);const g=b.G;p.invuln=999;p.hp=1000;for(const r of g.escape.plan.rooms)g.escape.states[r.id]={cleared:true};
   for(const id of [12,15]){const pts=g.escape.plan.rooms[id].waypoints;
    for(let n=0;n<pts.length-1;n++){
     const a=pts[n],z=pts[n+1],angle=Math.atan2(z.x-a.x,z.z-a.z);Object.assign(p,{x:a.x+Math.sin(angle)*16,z:a.z+Math.cos(angle)*16,y:a.y,vx:Math.sin(angle)*160,vy:0,vz:Math.cos(angle)*160,onGround:true,jumps:0,hp:1000,invuln:999});
     b.input.jump=true;b.input.jumpEdge=true;let left=false,land=false;
     for(let f=0;f<145;f++){g.camYaw=Math.atan2(z.x-p.x,z.z-p.z);b.input.up=Math.hypot(z.x-p.x,z.z-p.z)>4;b.update(1/60);if(!p.onGround)left=true;if(left&&p.onGround){land=Math.hypot(z.x-p.x,z.z-p.z)<48&&Math.abs(p.y-z.y)<5;break;}}
     b.releaseKeyboard();attempts++;if(!land)throw Error('jump '+JSON.stringify({seed,section,id,n,at:[Math.round(p.x),Math.round(p.y),Math.round(p.z)],target:z}));
    }
   }
  }
  b.delveExit();return {attempts,failed:0};
 });
}
