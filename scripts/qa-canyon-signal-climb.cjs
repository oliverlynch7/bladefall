async page=>{
 const checks=[],errors=[],ok=(name,value)=>{if(!value)throw Error(name);checks.push(name)};
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2163');
 await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;
  b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.meta.camMode='far';b.openHub();b.enterZone(1);b.nextArea();
  b.G.p.invuln=999;for(const e of b.G.enemies)e.stunT=999;
 });
 await page.waitForFunction(()=>!BF_LOADING.active&&__world3d().counts.hollowArt);
 const recovery=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p,q=BFLostCanyon.alarmJumps[3];
  Object.assign(p,{x:q[0],z:q[1],y:q[2],vy:0,vx:0,vz:0,onGround:true});
  b.input.jx=0;b.input.jz=1;
  for(let i=0;i<85;i++)b.update(.016);
  b.input.jz=0;for(let i=0;i<25;i++)b.update(.016);
  const drop={x:Math.round(p.x),z:Math.round(p.z),y:Math.round(p.y),hp:p.hp};
  const start=BFLostCanyon.alarmJumps[0];
  for(let i=0;i<950;i++){
   const dx=start[0]-p.x,dz=start[1]-p.z,d=Math.hypot(dx,dz);if(d<15)break;
   b.input.jx=dx/d;b.input.jz=dz/d;if(i%36===0)b.input.jumpEdge=true;b.input.jump=i%36<18;b.update(.016);
  }
  b.input.jx=b.input.jz=0;b.input.jump=false;
  return {drop,returned:{x:Math.round(p.x),z:Math.round(p.z),y:Math.round(p.y),hp:p.hp}};
 });
 ok('missed jump lands on the safe yard',recovery.drop.y<15&&recovery.drop.hp>0);
 ok('yard path returns to the first bracket',Math.hypot(recovery.returned.x-990,recovery.returned.z+2320)<28&&recovery.returned.hp>0);
 const noJump=await page.evaluate(()=>{
  const b=__BF3,p=b.G.p,steps=BFLostCanyon.alarmJumps,trace=[];
  Object.assign(p,{x:steps[0][0],z:steps[0][1],y:0,vy:0,vx:0,vz:0,onGround:true});
  for(let j=1;j<steps.length;j++){
   const q=steps[j];for(let i=0;i<160;i++){
    const dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz);if(d<15)break;
    b.input.jx=dx/d;b.input.jz=dz/d;b.update(.016);
   }
   trace.push({j,y:Math.round(p.y),x:Math.round(p.x),z:Math.round(p.z),target:q[2]});
  }
  b.input.jx=b.input.jz=0;return trace;
 });
 if(!noJump.some(step=>step.y<step.target-15))throw Error('Walked whole climb without jumping: '+JSON.stringify(noJump));
 checks.push('signal ascent requires a real jump');
 await page.evaluate(()=>{const b=__BF3;b.meta.camMode='shoulder';b.G.camPitch=.4;b.G.camYaw=-2.6;Object.assign(b.G.p,{x:990,z:-2320,y:0,vy:0,vx:0,vz:0,onGround:true});});
 await page.waitForTimeout(260);await page.screenshot({path:'output/playwright/canyon-signal-climb-below.png'});
 const climb=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p,steps=BFLostCanyon.alarmJumps,trace=[];
  Object.assign(p,{x:steps[0][0],z:steps[0][1],y:steps[0][2],vy:0,vx:0,vz:0,onGround:true});
  for(let j=1;j<steps.length;j++){
   const q=steps[j];let landed=false;
   for(let i=0;i<155;i++){
    const dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz);
    b.input.jx=d>13?dx/d:0;b.input.jz=d>13?dz/d:0;
    if(i===0)b.input.jumpEdge=true;b.input.jump=i<23;b.update(.016);
    if(i>8&&p.onGround&&Math.hypot(p.x-q[0],p.z-q[1])<18&&Math.abs(p.y-q[2])<8){landed=true;break;}
   }
   trace.push({step:j,landed,x:Math.round(p.x),z:Math.round(p.z),y:Math.round(p.y)});
   if(!landed)break;
  }
  b.input.jx=b.input.jz=0;b.input.jump=false;
  return {trace,count:steps.length,platforms:G.obstacles.filter(o=>o.alarmClimb).length};
 });
 if(!(climb.trace.length===climb.count-1&&climb.trace.every(step=>step.landed)))throw Error('Alarm climb failed: '+JSON.stringify(climb.trace));
 ok('all six uneven brackets are reached with jump input',climb.platforms===6);
 await page.evaluate(()=>{const b=__BF3;b.G.camPitch=.55;b.G.camYaw=-1.9;});
 await page.waitForTimeout(260);await page.screenshot({path:'output/playwright/canyon-signal-climb-top.png'});
 const top=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p,goal=G.storyObjects.find(o=>o.key==='lc.alarm'),trail=[];
  b.meta.camMode='far';
  for(let i=0;i<240;i++){
   const dx=goal.x-p.x,dz=goal.z-p.z,d=Math.hypot(dx,dz);if(d<45)break;
   if(i%20===0)trail.push({i,x:Math.round(p.x),z:Math.round(p.z),y:Math.round(p.y),d:Math.round(d),ground:p.onGround});
   b.input.jx=dx/d;b.input.jz=dz/d;b.update(.016);
  }
  b.input.jx=b.input.jz=0;
  const near=Math.hypot(p.x-goal.x,p.z-goal.z)<70&&Math.abs(p.y-goal.y)<8;
  b.briarRequest('world',{key:'lc.alarm'});
  return {near,cut:!!G.storyState.flags['lc.alarm'],point:{x:Math.round(p.x),z:Math.round(p.z),y:Math.round(p.y)},trail};
 });
 if(!(top.near&&top.cut))throw Error('Cable reach: '+JSON.stringify(top));
 checks.push('cable reached and cut from the real landing');
 if(errors.length)throw Error(JSON.stringify(errors));
 return {checks,recovery,noJump,climb,top,errors};
}
