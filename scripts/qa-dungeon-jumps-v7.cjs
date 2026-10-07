async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
 await page.goto('http://127.0.0.1:4339/3d/?mute=1');await page.waitForFunction(()=>window.BFPrisonRun&&window.HERO3D?.ready,null,{polling:100});
 const result=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.introSeen=true;b.meta.bank=null;b.openHub();b.startDelve('warrior');b.meta.camMode='shoulder';let jumps=0;
  for(const crossing of [2,9])for(const seed of [1,2,3,4,5,6]){const g=b.G,p=g.p;g.runSeed=seed;b.loadDelveFloor(1);for(const r of g.escape.plan.rooms)g.escape.states[r.id]={cleared:true};const pts=g.escape.plan.rooms[crossing].waypoints;
   for(let n=0;n<pts.length-1;n++){const a=pts[n],z=pts[n+1],angle=Math.atan2(z.x-a.x,z.z-a.z);Object.assign(p,{x:a.x+Math.sin(angle)*22,z:a.z+Math.cos(angle)*22,y:a.y,vx:Math.sin(angle)*180,vy:0,vz:Math.cos(angle)*180,onGround:true,jumps:0,hp:1000,invuln:999});b.input.jump=true;b.input.jumpEdge=true;let left=false,land=false;
    for(let f=0;f<150;f++){g.camYaw=Math.atan2(z.x-p.x,z.z-p.z);b.input.up=Math.hypot(z.x-p.x,z.z-p.z)>5;b.update(1/60);if(!p.onGround)left=true;if(left&&p.onGround){land=Math.hypot(z.x-p.x,z.z-p.z)<40&&Math.abs(p.y-z.y)<3;break;}}
    b.releaseKeyboard();if(!land)throw Error('Failed jump '+crossing+'/'+seed+'/'+n+' '+JSON.stringify({p:[p.x,p.y,p.z],target:z}));jumps++;
   }
  }return {revision:b.G.escape.layoutVersion,jumps};});
 if(errors.length)throw Error(errors.join('; '));return result;
}
