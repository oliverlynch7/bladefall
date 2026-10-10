async rootPage=>{
 const context=await rootPage.context().browser().newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');
  await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready,{timeout:30000});
  await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.meta.autoAttack=false;b.openHub();b.enterZone(3);b.meta.tutOff=true;b.meta.camMode='shoulder';b.G.p.invuln=999;for(const e of b.G.enemies)e.stunT=999;});
  await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.peaks,{timeout:30000});
  const start=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p;Object.assign(p,{x:-930,z:-3800,y:580,vx:0,vy:0,vz:0,onGround:true});G.lastSafe={x:p.x,z:p.z,y:p.y};b.briarRequest('world',{key:'ff.camp'});b.briarRequest('world',{key:'ff.camp.release'});return {oldButtons:G.storyObjects.filter(o=>/^ff\.marker\./.test(o.key)).length,read:G.storyState.flags['ff.camp.found'],blocked:!G.storyState.flags['ff.camp.open'],steps:G.peaks.campRidge.length};});
  if(start.oldButtons||!start.read||!start.blocked||start.steps!==7)throw Error('Old code or early release remained: '+JSON.stringify(start));
  await page.waitForTimeout(100);await page.screenshot({path:'output/snowbound-camp-ridge-start.png'});
  const walk=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p,steps=[];let recovered=false;
   const to=q=>{let landed=false,maxY=p.y,air=0,launched=0,start=[Math.round(p.x),Math.round(p.z),Math.round(p.y),p.onGround];for(let i=0;i<760;i++){const dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);if(d<25&&Math.abs(p.y-q.y)<12&&p.onGround){landed=true;break;}b.input.jx=dx/(d||1);b.input.jz=dz/(d||1);if(p.onGround&&d>35&&d<(q.x===-600?190:135)){b.input.jumpEdge=true;b.input.jump=true;launched++;}else b.input.jump=!p.onGround&&p.vy>0;b.update(.016);maxY=Math.max(maxY,p.y);if(!p.onGround)air++;}b.input.jx=b.input.jz=0;b.input.jump=false;b.update(.016);return {target:[q.x,q.z,q.y],start,at:[Math.round(p.x),Math.round(p.z),Math.round(p.y),p.onGround],landed,maxY:Math.round(maxY),air,launched};};
   for(const [i,q]of G.peaks.campRidge.entries()){
    const step=to(q);steps.push(step);
    if(!step.landed)break;
    if(i===3){for(let j=0;j<32;j++){b.input.jx=-1;b.input.jz=0;b.update(.016);}b.input.jx=0;for(let j=0;j<340;j++)b.update(.016);recovered=Math.hypot(p.x-q.x,p.z-q.z)<75&&Math.abs(p.y-q.y)<20;steps.push({missRecovered:recovered,at:[Math.round(p.x),Math.round(p.z),Math.round(p.y)],safe:G.lastSafe});}
   }
   return {steps,recovered,final:{x:p.x,z:p.z,y:p.y,onGround:p.onGround},oldFlag:!!G.storyState.flags['ff.camp.open']};});
  if(walk.steps.filter(q=>q.target).length!==7||walk.steps.some(q=>q.target&&!q.landed)||!walk.recovered)throw Error('Ridge traversal/recovery failed: '+JSON.stringify(walk));
  await page.waitForTimeout(100);await page.screenshot({path:'output/snowbound-camp-ridge-covered.png'});
  const result=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p;Object.assign(p,{x:-500,z:-3530,y:810,vx:0,vy:0,vz:0,onGround:true});b.briarRequest('world',{key:'ff.camp.release'});if(!G.storyState.flags['ff.camp.open']||!Number.isFinite(G.peaks.coverReleaseAt))throw Error('High anchor did not release the cover');Object.assign(p,{x:-680,z:-3530,y:810});b.briarRequest('world',{key:'ff.cache'});if(!G.storyState.flags['ff.cache'])throw Error('Exposed chest stayed locked');const shard=b.worldRiftShards().find(q=>q.id==='FF-02');if(!shard||Math.hypot(shard.x-p.x,shard.z-p.z)>60)throw Error('FF-02 not beside chest');Object.assign(p,{x:shard.x,z:shard.z,y:shard.y});b.takeWorldRiftShard('FF-02');if(!G.pendingRiftShards.found.includes('FF-02'))throw Error('Shard pickup failed');return {opened:true,chest:true,shard:shard.id};});
  await page.waitForTimeout(100);await page.screenshot({path:'output/snowbound-camp-ridge-exposed.png'});
  if(errors.length)throw Error(JSON.stringify(errors));return {start,walk,result,errors};
 }finally{await context.close();}
}
