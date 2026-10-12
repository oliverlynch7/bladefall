async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await(await page.context().newCDPSession(page)).send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.autoAttack=false;b.meta.petActive=null;b.openHub();b.enterZone(7);b.G.area=1;b.loadArea();b.meta.tutOff=true;b.meta.camMode='far';b.G.p.invuln=999;for(const e of b.G.enemies)e.dead=true;});
 await page.waitForFunction(()=>!BF_LOADING.active&&__world3d().counts.name==='Long Ascent');
 const result=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p,steps=G.ascent.vaultSteps,trace=[];
  const cells=G.storyObjects.find(o=>o.key==='la.cells');Object.assign(p,{x:cells.x,z:cells.z,y:cells.y,vy:0});b.briarRequest('world',{key:cells.key});
  Object.assign(p,{x:1395,z:-390,y:250,vx:0,vz:0,vy:0,onGround:true,maxJumps:1});
  for(const [index,q]of steps.entries()){
   let reached=false;
   for(let i=0;i<650;i++){
    const dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz);
    if(d<23&&Math.abs(p.y-q[2])<24&&p.onGround){reached=true;break;}
    b.input.jx=d>12?dx/d:0;b.input.jz=d>12?dz/d:0;
    b.input.jump=true;if(p.onGround)b.input.jumpEdge=true;
    b.update(.016);
   }
   b.input.jx=b.input.jz=0;b.input.jump=false;b.input.jumpEdge=false;
   trace.push({step:index+1,reached,x:Math.round(p.x),z:Math.round(p.z),y:Math.round(p.y),ground:p.onGround});
   if(!reached)break;
   for(let i=0;i<5;i++)b.update(.016);
  }
  const first=trace.every(x=>x.reached);
  if(!first)return {trace,first};
  Object.assign(p,{x:steps[3][0],z:steps[3][1],y:steps[3][2],vx:0,vz:0,vy:0,onGround:true});
  b.input.jx=0;b.input.jz=1;for(let i=0;i<58;i++)b.update(.016);b.input.jz=0;
  const miss={x:Math.round(p.x),z:Math.round(p.z),y:Math.round(p.y),hp:p.hp};
  Object.assign(p,{x:steps.at(-1)[0],z:steps.at(-1)[1],y:steps.at(-1)[2],vx:0,vz:0,vy:0,onGround:true});
  b.update(.016);const prompt=G.interact?.label;b.doInteract();
  return {trace,first,miss,prompt,open:!!G.storyState.flags['la.vault.open'],wall:G.walls.some(w=>w.ascentTag==='vault'),shard:b.worldRiftShards().some(q=>q.id==='CD-03')};
 });
 if(errors.length)throw Error(errors.join(';'));
 if(!result.first||result.trace.length!==6)throw Error('Rack climb failed: '+JSON.stringify(result.trace));
 if(result.miss.y!==220||result.miss.hp<=0)throw Error('Missed jump did not land safely: '+JSON.stringify(result.miss));
 if(result.prompt!=='Pull the high service brake'||!result.open||result.wall||!result.shard)throw Error('Brake did not open the saved shard route: '+JSON.stringify(result));
 return result;
}
