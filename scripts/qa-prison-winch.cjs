async page=>{
 const context=await page.context().browser().newContext({viewport:{width:1280,height:800}}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 try{
  await p.goto('http://127.0.0.1:4332/3d/?mute=1&qa=lift-winch');
  await p.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready&&window.BFPrison&&window.BFStoryAuthority);
  const result=await p.evaluate(async()=>{
   const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.openHub();b.enterZone(2);b.nextArea();b.meta.tutOff=true;b.meta.camMode='far';b.meta.autoAttack=false;
   const G=b.G,p=G.p,checks=[],ok=(name,value)=>{if(!value)throw Error(name+' '+JSON.stringify({rescueT:G.prison.rescueT,winch:G.prison.winch,player:[p.x,p.z,p.y],flags:G.storyState.flags}));checks.push(name)},tick=n=>{for(let i=0;i<n;i++)b.update(.016);},act=key=>{const o=G.storyObjects.find(o=>o.key===key);if(!o)throw Error('Missing '+key);Object.assign(p,{x:o.x,z:o.z,y:o.y,vy:0,onGround:true});b.briarRequest('world',{key});};
   for(const e of G.enemies){e.stunT=999;e.dead=true;e.hp=0;}p.invuln=999;
   for(const key of ['kd.roster','kd.marks','kd.hidden','kd.free','kd.papers'])act(key);
   ok('prisoners freed, lift closed',G.storyState.flags['kd.free']&&!G.storyState.flags['kd.lift.open']);
   tick(520);ok('prisoners reach lift',G.prison.rescueT>=7.99);
   const h=G.storyObjects.find(o=>o.key==='kd.lift.winch');Object.assign(p,{x:h.x,z:h.z,y:h.y,vy:0,vx:0,vz:0,onGround:true});tick(3);
   const before={player:[p.x,p.z,p.y],handle:[h.x,h.z,h.y],lift:G.movers.find(m=>m.prisonLift).h,quest:BFPrison.quest(G.storyState,G.prison),nav:BFPartyNavigation.target(G)};
   b.briarRequest('world',{key:'kd.lift.winch'});ok('grip accepted',G.prison.winch.owner==='solo');
   const walk=(a)=>{const tx=BFPrison.WINCH.x+Math.cos(a)*BFPrison.WINCH.r,tz=BFPrison.WINCH.z+Math.sin(a)*BFPrison.WINCH.r;let steps=0;while(Math.hypot(p.x-tx,p.z-tz)>7&&steps++<90&&!G.storyState.flags['kd.lift.open']){const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz)||1;b.input.jx=dx/d;b.input.jz=dz/d;b.update(.016);}b.input.jx=0;b.input.jz=0;return {steps,distance:Math.hypot(p.x-tx,p.z-tz),player:[p.x,p.z,p.y],winch:G.prison.winch.progress,owner:G.prison.winch.owner};};
   const first=[];for(let i=1;i<=5;i++)first.push(walk(i*Math.PI/15));
   const midway={player:[p.x,p.z,p.y],lift:G.movers.find(m=>m.prisonLift).h,progress:G.prison.winch.progress,first};
   ok('half-turn physically raises operator and prisoners',midway.progress>.1&&midway.lift>200&&Math.abs(midway.player[2]-midway.lift)<4&&G.keepPrisoners.every(n=>Math.abs(n.y-midway.lift)<4));
   walk(4*Math.PI/15);walk(5*Math.PI/15);ok('reversing and returning does not add lift height',G.prison.winch.progress<midway.progress+.015);
   b.briarRequest('world',{key:'kd.lift.winch'});ok('handle can be released',!G.prison.winch.owner);tick(240);ok('released lift lowers for retry',G.prison.winch.progress===0&&G.movers.find(m=>m.prisonLift).h===180);
   Object.assign(p,{x:h.x,z:h.z,y:h.y,vy:0,vx:0,vz:0,onGround:true});tick(3);b.briarRequest('world',{key:'kd.lift.winch'});ok('handle can be regripped',G.prison.winch.owner==='solo');
   const full=[];for(let i=1;i<=33&&!G.storyState.flags['kd.lift.open'];i++)full.push(walk(i*Math.PI/15));
   ok('one full physical turn opens lift',G.storyState.flags['kd.lift.open']);ok('operator reaches upper floor on platform',p.y>350&&Math.abs(p.y-G.movers.find(m=>m.prisonLift).h)<5);
   tick(560);ok('prisoners reach shelter and release hall opens',G.storyState.flags['kd.transfer']&&G.portal&&G.keepPrisoners.every(n=>n.y===360&&!n.walking));
   const lift=G.movers.find(m=>m.prisonLift);for(let i=0;i<900&&lift.h>180.01;i++)tick(1);ok('lift cycles to lower station for a late rider',lift.h<180.01);
   Object.assign(p,{x:0,z:-2590,y:180,vy:0,onGround:true});for(let i=0;i<900&&lift.h<320;i++)tick(1);ok('late player rides a second ascent',p.y>300&&Math.abs(p.y-lift.h)<5);
   return {checks,before,midway,fullSteps:full.length,ending:{player:[p.x,p.z,p.y],lift:lift.h,progress:G.prison.winch.progress},errors:[]};
  });
  await p.waitForFunction(()=>!BF_LOADING.active&&!!window.__world3d?.().counts.keepArt,{timeout:15000});
  await p.waitForTimeout(300);
  await p.screenshot({path:'output/playwright/prison-winch-final.png'});
  if(errors.length)throw Error(errors.join('\n'));
  return result;
 }finally{await context.close();}
}
