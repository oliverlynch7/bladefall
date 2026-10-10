async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.meta.autoAttack=false;b.openHub();b.enterZone(5);b.nextArea();b.meta.tutOff=true;b.meta.camMode='shoulder';for(const e of b.G.enemies)e.stunT=999;});
 await page.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.thunder);
 const start=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p,s=G.storyState;Object.assign(p,{x:-830,z:-4410,y:300,vx:0,vy:0,vz:0,onGround:true,hp:p.maxHp});G.thunder.clock=0;return {oldButtons:G.storyObjects.filter(o=>/^tc\.tide\.[123]$/.test(o.key)).length,release:!!G.storyObjects.find(o=>o.key==='tc.tide.release'),shard:BFThunderCliffs.shards(s).some(q=>q.id==='SC-05'),phase:BFThunderCliffs.tidePhase(G.thunder.clock)};});
 if(start.oldButtons||!start.release||start.shard||start.phase!=='low')throw Error('fresh route did not replace the old button lock: '+JSON.stringify(start));
 await page.waitForTimeout(100);await page.screenshot({path:'output/thunder-tide-before.png'});
 const result=await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p,checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n);};
  // Deliberately fall into the basin first; the local catch must recover the same attempt.
  Object.assign(p,{x:-1070,z:-4640,y:185,vy:0,vx:0,vz:0,onGround:true});for(let i=0;i<40;i++)b.update(.016);
  ok('missed jump returns to tide circle '+JSON.stringify({x:p.x,z:p.z,y:p.y,mode:b.mode,fall:G.thunder.tideFall}),Math.hypot(p.x+810,p.z+4370)<60&&Math.abs(p.y-300)<2);
  Object.assign(p,{x:-830,z:-4410,y:300,vy:0,vx:0,vz:0,onGround:true,invuln:0});G.thunder.clock=0;
  const stops=[[-960,-4480],[-1090,-4600],[-1035,-4715],[-1160,-4800]],walk=[];
  for(const q of stops){let landed=false;for(let i=0;i<1000;i++){const dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz);if(d<28&&Math.abs(p.y-300)<20&&p.onGround){landed=true;break;}b.input.jx=dx/d;b.input.jz=dz/d;if(p.onGround&&d>38){b.input.jumpEdge=true;b.input.jump=true;}else b.input.jump=false;b.update(.016);}b.input.jx=b.input.jz=0;b.input.jump=false;walk.push({q,x:Math.round(p.x),z:Math.round(p.z),y:Math.round(p.y),landed});}
  ok('physical jumps reach every stone '+JSON.stringify(walk),walk.every(w=>w.landed));
  G.thunder.clock=12;const release=G.storyObjects.find(o=>o.key==='tc.tide.release');b.briarRequest('world',{key:release.key});ok('high tide refuses release',!G.storyState.flags['tc.tide.open']);
  for(let i=0;i<280&&BFThunderCliffs.tidePhase(G.thunder.clock)!=='low';i++)b.update(.016);
  ok('wide landing stays safe during surge',Math.hypot(p.x+1160,p.z+4800)<50&&p.hp>0);
  b.briarRequest('world',{key:release.key});ok('near-side catch opens door at low tide',G.storyState.flags['tc.tide.open']&&!G.walls.some(w=>w.thunderTag==='tideGate'));
  const target=[-1510,-4750];let reached=false;for(let i=0;i<1000;i++){const dx=target[0]-p.x,dz=target[1]-p.z,d=Math.hypot(dx,dz);if(d<35&&Math.abs(p.y-300)<25){reached=true;break;}b.input.jx=dx/d;b.input.jz=dz/d;if(p.onGround&&d>100){b.input.jumpEdge=true;b.input.jump=true;}b.update(.016);}b.input.jx=b.input.jz=0;b.input.jump=false;ok('opened door leads physically to grotto',reached);
  ok('same SC-05 reward appears',BFThunderCliffs.shards(G.storyState).some(q=>q.id==='SC-05'));
  return {checks,walk,phase:BFThunderCliffs.tidePhase(G.thunder.clock),hp:p.hp};});
 await page.waitForTimeout(100);await page.screenshot({path:'output/thunder-tide-open.png'});
 if(errors.length)throw Error(JSON.stringify({errors,result}));return {...result,errors};
}
