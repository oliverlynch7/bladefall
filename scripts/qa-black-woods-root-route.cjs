async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 const result=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];
  b.openHub();b.enterZone(0);b.nextArea();b.meta.camMode='far';b.meta.tutOff=true;
  for(const e of b.G.enemies)e.stunT=999;b.G.p.invuln=999;
  const p=b.G.p,checks=[],landings=[];const ok=(name,value)=>{if(!value)throw Error(name+': '+JSON.stringify({p:{x:p.x,y:p.y,z:p.z},landings}));checks.push(name)};
  const tick=(n=30)=>{for(let i=0;i<n;i++)b.update(.016)};
  const walk=(x,z,jump)=>{let top=p.y;for(let i=0;i<600;i++){const dx=x-p.x,dz=z-p.z,d=Math.hypot(dx,dz);if(d<11)break;b.input.jx=dx/d;b.input.jz=dz/d;if(jump&&i%20===0)b.input.jumpEdge=true;b.update(.016);top=Math.max(top,p.y)}b.input.jx=b.input.jz=0;tick(28);return {x:Math.round(p.x),y:Math.round(p.y),z:Math.round(p.z),top:Math.round(top)};};
  Object.assign(p,{x:-2110,z:-2080,y:0,vy:0});tick(5);
  ok('old stone presses are absent',!b.G.storyObjects.some(o=>o.kind==='trackstone'));
  const release=b.G.storyObjects.find(o=>o.key==='woods.tracks.release');ok('root binding exists on high perch',release?.y===138);
  b.briarRequest('world',{key:release.key});ok('ground request cannot open hollow',!b.G.storyState.flags['woods.tracks.open']);
  for(const [i,step]of b.G.woodsTrail.rootSteps.entries()){
   const at=walk(step.x,step.z,true);landings.push(at);ok('reached root '+landings.length,Math.hypot(at.x-step.x,at.z-step.z)<45&&at.y>=step.y-7);
   if(i===0){const miss=walk(-1950,-2100,false);ok('missed jump lands in open grove',miss.y===0);const retry=walk(step.x,step.z,true);ok('same root is reachable on retry',retry.y>=step.y-7);}
  }
  ok('ordinary interact prompt reaches root binding',b.briarInteract()?.label===release.label);
  b.briarRequest('world',{key:release.key});ok('high binding releases roots',b.G.storyState.flags['woods.tracks.open']&&!b.G.obstacles.some(o=>o.woodsTrackSeal));
  tick(65);ok('root opening animation completes',b.G.woodsTrail.sealT>=.98);
  Object.assign(p,{x:-2130,z:-2530,y:0,vy:0});tick(5);ok('personal shard can be taken',b.takeWorldRiftShard('BR-04')==='found');
  return {checks,landings};
 });
 await page.waitForFunction(()=>!BF_LOADING.active);
 await page.evaluate(()=>Object.assign(__BF3.G.p,{x:-1950,z:-2360,y:0,vy:0}));
 await page.waitForTimeout(500);
 await page.screenshot({path:'tmp/qa-black-woods-root-route.png'});
 if(errors.length)throw Error(errors.join(';'));
 return result;
}
