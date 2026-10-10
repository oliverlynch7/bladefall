async page=>{
 const checks=[],errors=[],ok=(name,value)=>{if(!value)throw Error(name);checks.push(name)};
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2162');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.meta.tutOff=true;b.meta.camMode='far';b.openHub();b.enterZone(1);b.nextArea();
  b.G.p.invuln=999;for(const e of b.G.enemies)e.stunT=999;
 });
 await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.canyon);
 const recovery=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p,q=G.canyon.freightJumps[3];
  Object.assign(p,{x:q[0],z:q[1],y:q[2],vy:0,vx:0,vz:0,onGround:true});
  b.input.jx=-.7;b.input.jz=-.7;
  for(let i=0;i<65;i++)b.update(.016);
  b.input.jx=b.input.jz=0;for(let i=0;i<40;i++)b.update(.016);
  const drop={x:Math.round(p.x),z:Math.round(p.z),y:Math.round(p.y),hp:p.hp};
  for(const goal of [[-1700,-3130],[-1510,-2790]])for(let i=0;i<700;i++){
   const dx=goal[0]-p.x,dz=goal[1]-p.z,d=Math.hypot(dx,dz);if(d<15)break;
   b.input.jx=dx/d;b.input.jz=dz/d;if(i%32===0)b.input.jumpEdge=true;b.input.jump=i%32<18;b.update(.016);
  }
  b.input.jx=b.input.jz=0;b.input.jump=false;
  return {drop,returned:{x:Math.round(p.x),z:Math.round(p.z),y:Math.round(p.y),hp:p.hp}};
 });
 if(!(recovery.drop.y<75&&recovery.drop.hp>0))throw Error('Missed-deck recovery: '+JSON.stringify(recovery));
 checks.push('a missed deck lands safely on the freight road');
 if(!(Math.hypot(recovery.returned.x+1510,recovery.returned.z+2790)<30&&recovery.returned.hp>0))throw Error('Return route: '+JSON.stringify(recovery));
 checks.push('the lower road returns to the climb');
 const route=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p,steps=G.canyon.freightJumps,trace=[];
  Object.assign(p,{x:steps[0][0],z:steps[0][1],y:steps[0][2],vy:0,vx:0,vz:0,onGround:true});
  for(let j=1;j<steps.length;j++){
   const q=steps[j];let landed=false;
   for(let i=0;i<150;i++){
    const dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz);
    b.input.jx=d>14?dx/d:0;b.input.jz=d>14?dz/d:0;
    if(i===0)b.input.jumpEdge=true;
    b.input.jump=i<23;
    b.update(.016);
    if(i>8&&p.onGround&&Math.hypot(p.x-q[0],p.z-q[1])<18&&Math.abs(p.y-q[2])<8){landed=true;break;}
   }
   trace.push({landing:j,landed,x:Math.round(p.x),z:Math.round(p.z),y:Math.round(p.y),ground:p.onGround});
   if(!landed)break;
  }
  b.input.jx=b.input.jz=0;b.input.jump=false;
  return {trace,stepCount:steps.length,legacyHandles:G.storyObjects.filter(o=>/^lc\.rail\.(north|west|south|east)$/.test(o.key)).length,open:!!G.storyState.flags['lc.rail.open']};
 });
 ok('old direction handles are absent',route.legacyHandles===0);
 if(!(route.trace.length===route.stepCount-1&&route.trace.every(step=>step.landed)))throw Error('Freight jumps: '+JSON.stringify(route.trace));
 checks.push('all freight decks reached with jump input');
 const before=await page.evaluate(()=>({open:!!__BF3.G.storyState.flags['lc.rail.open'],cart:__BF3.G.canyon.cartT,gate:__BF3.G.obstacles.some(o=>o.lcBlock==='rail'),brake:__BF3.briarObjects().some(o=>o.key==='lc.rail.release')}));
 ok('brake is available at top while store is sealed',!before.open&&before.gate&&before.brake);
 await page.evaluate(()=>{const b=__BF3;b.meta.camMode='shoulder';b.G.camPitch=.55;b.G.camYaw=Math.PI;Object.assign(b.G.p,{x:-2320,z:-3560,y:230,vy:0,vx:0,vz:0,onGround:true,invuln:999});});
 await page.waitForTimeout(250);await page.screenshot({path:'output/playwright/canyon-freight-brake-before.png'});
 const after=await page.evaluate(()=>{const b=__BF3;b.briarRequest('world',{key:'lc.rail.release'});const initial=b.G.canyon.cartT;for(let i=0;i<190;i++)b.update(.016);return {initial,final:b.G.canyon.cartT,open:!!b.G.storyState.flags['lc.rail.open'],gate:b.G.obstacles.some(o=>o.lcBlock==='rail'),brake:b.briarObjects().some(o=>o.key==='lc.rail.release'),start:BFLostCanyon.cartAt(0),end:BFLostCanyon.cartAt(1)};});
 ok('cart rolls along the rails and clears the store',after.open&&after.initial===0&&after.final===1&&!after.gate&&!after.brake&&after.start.x===-2280&&after.start.z===-3830&&after.end.x===-1750&&after.end.z===-3100);
 await page.waitForTimeout(250);await page.screenshot({path:'output/playwright/canyon-freight-brake-after.png'});
 const shard=await page.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:-2280,z:-3890,y:0});return b.takeWorldRiftShard('HP-04');});
 ok('same HP-04 shard can be collected',shard==='found');
 if(errors.length)throw Error(JSON.stringify(errors));
 return {checks,route,after,errors};
}
