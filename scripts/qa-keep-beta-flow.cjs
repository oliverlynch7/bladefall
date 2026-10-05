async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);await page.goto('http://127.0.0.1:4338/3d/?devkeep=1&mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready,null,{polling:100});await page.locator('#kstart').click();
 const result=await page.evaluate(()=>{const b=__BF3,g=b.G,p=g.p,s=g.devKeep,check=(ok,m)=>{if(!ok)throw Error(m);};for(const e of g.enemies)e.dead=true;p.invuln=9999;
 const interaction=(x,z,y,label)=>{b.releaseKeyboard();Object.assign(p,{x,z,y,vx:0,vy:0,vz:0,onGround:true});b.updateInteract();check(g.interact?.label===label,'Wrong interaction '+g.interact?.label+' wanted '+label);b.doInteract();};
 interaction(70,-175,0,'Open cell locks');check(s.cells,'Cells not open');
 BFKeepBeta.selectStop(420);check(s.target===0,'Broken lift bypass');BFKeepBeta.selectStop(210);for(let i=0;i<210;i++)b.update(1/60);check(s.lift.h===210&&s.cage.h===210,'Service stop');
 const pts=[{x:390,z:230,y:0},{x:390,z:160,y:55},{x:560,z:130,y:115},{x:650,z:-25,y:165},{x:650,z:-190,y:210},{x:650,z:-430,y:210},{x:650,z:-690,y:210}];const jumps=[];
 for(let n=0;n<pts.length-1;n++){const a=pts[n],z=pts[n+1],angle=Math.atan2(z.x-a.x,z.z-a.z);Object.assign(p,{x:a.x+Math.sin(angle)*22,z:a.z+Math.cos(angle)*22,y:a.y,vx:Math.sin(angle)*180,vy:0,vz:Math.cos(angle)*180,onGround:true,jumps:0,hp:1000,invuln:999});b.input.jump=true;b.input.jumpEdge=true;let left=false,land=false;const trace=[];
 for(let f=0;f<150;f++){g.camYaw=Math.atan2(z.x-p.x,z.z-p.z);b.input.up=Math.hypot(z.x-p.x,z.z-p.z)>5;b.update(1/60);if(f%8===0)trace.push([f,Math.round(p.x),Math.round(p.y),Math.round(p.z)]);if(!p.onGround)left=true;if(left&&p.onGround){land=Math.hypot(z.x-p.x,z.z-p.z)<115&&Math.abs(p.y-z.y)<3;break;}}
 b.releaseKeyboard();check(land,'Jump '+n+' failed '+JSON.stringify({at:[p.x,p.y,p.z],target:z,trace}));jumps.push(n);}
 interaction(650,-705,210,'Clear the trapped chain');check(s.snag,'Snag not cleared');
 Object.assign(p,{x:650,z:-430,y:210,onGround:true});BFKeepBeta.selectStop(0);check(s.target===210,'Cage occupancy lock failed');
 Object.assign(p,{x:300,z:-780,y:210,onGround:true,vy:0});BFKeepBeta.selectStop(0);for(let i=0;i<210;i++)b.update(1/60);check(Math.abs(p.y)<2,'Downward ride '+p.y);
 // Escort uses ordinary interaction and menu actions.
 interaction(s.actors[0].x,s.actors[0].z,0,'Talk to Walter');document.getElementById('kb0').click();check(s.escort==='walking','Escort not started');
 for(let i=0;i<1000&&s.escort==='walking';i++){p.x=s.actors[0].x+70;p.z=s.actors[0].z;p.y=0;p.invuln=999;for(const e of g.enemies)if(e.betaWave)e.dead=true;b.update(1/60);}
 check(s.escort==='boarded','Escort failed to board '+s.escort+' '+s.route);check(s.wave,'Reinforcements never triggered');
 Object.assign(p,{x:300,z:-750,y:0,vy:0,onGround:true});BFKeepBeta.selectStop(420);for(let i=0;i<780;i++)b.update(1/60);check(s.escort==='arrived','Lift did not arrive');check(Math.abs(p.y-420)<2,'Player left lift '+p.y);
 interaction(s.actors[0].x,s.actors[0].z,420,'Talk to Walter');check(s.finish,'Completion not reached');return {jumps:jumps.length,complete:s.finish,prisoners:s.actors.length,playerY:p.y};});return {errors,result};
}

