async page=>{
  const errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));
  const ok=(name,value)=>{if(!value)throw Error(name);checks.push(name);};
  await page.goto('http://127.0.0.1:4331/3d/?mute=1&iceSpill=2169');
  await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
  await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.autoAttack=false;b.meta.petActive=null;b.openHub();b.enterZone(3);b.nextArea();b.meta.camMode='far';b.meta.tutOff=true;b.G.p.invuln=999;for(const e of b.G.enemies)e.stunT=999;});
  await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.iceCaves);
  await page.setViewportSize({width:1440,height:900});
  const baseline=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p,clue=G.storyObjects.find(o=>o.key==='ic.channel.clue');Object.assign(p,{x:clue.x,z:clue.z,y:clue.y,vy:0,vx:0,vz:0,onGround:true});b.briarRequest('world',{key:clue.key});for(let i=0;i<90;i++)b.update(.016);const old=G.storyObjects.filter(o=>/^ic\.channel\.[123]$/.test(o.key));Object.assign(p,{x:-1360,z:-4555,y:80,vy:0,onGround:true});const floorPrompt=b.briarInteract()?.label;return {old:old.length,open:!!G.storyState.flags['ic.channel.open'],floorPrompt,ledges:BFIceCaves.serviceLedges};});
  ok('old adjacent toggles retired',baseline.old===0&&!baseline.open&&baseline.ledges.length===5);
  ok('release cannot be used from the basin floor',!baseline.floorPrompt?.includes('hanging spill plug'));
  const miss=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p;Object.assign(p,{x:-1720,z:-4630,y:140,vy:0,vx:0,vz:0,onGround:false});let lowest=Infinity;for(let i=0;i<250;i++){b.update(.016);lowest=Math.min(lowest,p.y);if(Math.abs(p.x+1350)<25&&Math.abs(p.z+4200)<25&&p.y>=78)break;}return {at:[p.x,p.z,p.y],lowest,open:!!G.storyState.flags['ic.channel.open']};});
  ok('missed jump returns to the dry controls '+JSON.stringify(miss),Math.hypot(miss.at[0]+1350,miss.at[1]+4200)<130&&miss.at[2]>=78&&!miss.open);
  const climb=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p,points=BFIceCaves.serviceLedges,steps=[];Object.assign(p,{x:-1430,z:-4210,y:80,vy:0,vx:0,vz:0,onGround:true});
    for(const q of points){let reached=false;for(let i=0;i<900;i++){const dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz);if(d<23&&Math.abs(p.y-q[2])<24&&p.onGround){reached=true;break;}b.input.jx=d>2?dx/d:0;b.input.jz=d>2?dz/d:0;b.input.jump=d>66;if(p.onGround&&d>66)b.input.jumpEdge=true;b.update(.016);}b.input.jx=b.input.jz=0;b.input.jump=false;steps.push({target:q,at:[Math.round(p.x),Math.round(p.z),Math.round(p.y)],ground:p.onGround,reached});if(!reached)break;}
    return steps;});
  ok('all five service ledges can be reached with normal movement '+JSON.stringify(climb),climb.length===5&&climb.every(x=>x.reached));
  await page.waitForTimeout(650);await page.getByRole('button',{name:'Dismiss journal entry'}).click();await page.screenshot({path:'output/playwright/ice-side-plug-before-2169.png'});
  const release=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p,hit=b.briarInteract(),prompt=hit?.label;if(hit?.act)hit.act();for(let i=0;i<90;i++)b.update(.016);return {prompt,open:!!G.storyState.flags['ic.channel.open'],bridge:!!G.iceCaves['ic.channel.open'],drop:G.iceCaves.channelDrop,shard:b.worldRiftShards().some(s=>s.id==='FF-04'),mainOpen:!!G.storyState.flags['ic.lock.open']};});
  ok('release drops plug and freezes only optional crossing '+JSON.stringify(release),release.prompt?.includes('hanging spill plug')&&release.open&&release.bridge&&release.drop>.95&&release.shard&&!release.mainOpen);
  ok('tracker still points to the uncollected shard',await page.evaluate(()=>document.body.innerText.includes('Cross the frozen side channel for the shard')));
  await page.waitForTimeout(650);await page.screenshot({path:'output/playwright/ice-side-plug-after-2169.png'});
  const far=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p;Object.assign(p,{x:-1350,z:-4310,y:80,vy:0,vx:0,vz:0,onGround:true});b.input.jz=-1;let minY=Infinity;for(let i=0;i<850&&p.z>-5370;i++){b.update(.016);minY=Math.min(minY,p.y);}b.input.jz=0;return {at:[p.x,p.z,p.y],minY,ground:p.onGround};});
  ok('opened bridge physically reaches the shard chamber '+JSON.stringify(far),far.at[1]<-5370&&far.at[2]>=75&&far.minY>=65);
  const collected=await page.evaluate(()=>{const b=__BF3,G=b.G,s=b.worldRiftShards().find(s=>s.id==='FF-04');Object.assign(G.p,{x:s.x,z:s.z,y:s.y});b.takeWorldRiftShard('FF-04');for(let i=0;i<90;i++)b.update(.016);return {found:G.pendingRiftShards.found.includes('FF-04'),tracker:document.querySelector('.qoptional')?.innerText};});
  ok('shard collection completes the optional tracker '+JSON.stringify(collected),collected.found&&collected.tracker?.includes('0 active')&&collected.tracker?.includes('The sealed side chamber')&&!collected.tracker?.includes('Cross the frozen'));
  if(errors.length)throw Error(JSON.stringify(errors));
  return {checks,baseline,miss,climb,release,far,collected,errors};
}
