async rootPage=>{
 const context=await rootPage.context().browser().newContext();
 const host=await context.newPage(),guest=await context.newPage(),errors=[],checks=[];
 const ok=(name,value)=>{if(!value)throw Error(name);checks.push(name);};
 try{
  for(const page of [host,guest]){
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:4331/3d/?mute=1');
   await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
   await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.riftShards=[];b.openHub();window.qaPackets=[];});
  }
  await host.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(key,fn)=>qaListeners[key]=fn});qaListeners.open();});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<3;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await host.evaluate(d=>qaListeners.data(d),d);for(const d of await host.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await host.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));
  await flush();
  await host.evaluate(()=>{__BF3.enterZone(4);__BF3.nextArea();});
  await flush();
  for(const page of [host,guest])await page.waitForFunction(()=>__BF3.G.furnace&&!window.BF_LOADING?.active);
  await host.evaluate(()=>{const b=__BF3;b.G.storyState.flags['gf.cool.open']=true;b.briarSync();for(const e of b.G.enemies)e.stunT=999;b.MP.broadcast();});
  await flush();
  ok('both players see a cooled and moving gantry',await host.evaluate(()=>__BF3.G.furnace.cachePistonsLive)&&await guest.evaluate(()=>__BF3.G.furnace.cachePistonsLive));
  await guest.evaluate(()=>{const b=__BF3,o=b.G.storyObjects.find(o=>o.key==='gf.cache.release');Object.assign(b.G.p,{x:o.x,z:o.z,y:o.y,onGround:true});qaPackets.push({t:'pos',p:b.MP.selfState()});b.briarRequest('world',{key:o.key});});
  await flush();
  ok('guest opens the same box in both worlds',await host.evaluate(()=>!!__BF3.G.storyState.flags['gf.cache.open'])&&await guest.evaluate(()=>!!__BF3.G.storyState.flags['gf.cache.open']));
  await host.evaluate(()=>{const b=__BF3;for(let i=0;i<80;i++)b.update(.016);b.MP.broadcast();for(const c of b.MP.conns)c.send({t:'story',story:b.briarPacket()});});
  await flush();await guest.evaluate(()=>__BF3.update(.016));
  const hm=await host.evaluate(()=>({clock:__BF3.G.furnace.clock,x:__BF3.G.movers.find(m=>m.furnaceCache).x}));
  const gm=await guest.evaluate(()=>({clock:__BF3.G.furnace.clock,x:__BF3.G.movers.find(m=>m.furnaceCache).x}));
  if(!(Math.abs(hm.clock-gm.clock)<.12&&Math.abs(hm.x-gm.x)<3))throw Error('counterweight clock drift '+JSON.stringify({hm,gm}));
  checks.push('guest counterweight follows the host clock');
  await guest.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:790,z:-5580,y:305,onGround:true});b.takeWorldRiftShard('ED-04');});
  await flush();
  ok('guest shard collection stays personal',await guest.evaluate(()=>__BF3.G.pendingRiftShards.found.includes('ED-04'))&&await host.evaluate(()=>!__BF3.G.pendingRiftShards.found.includes('ED-04')));
  await host.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:790,z:-5580,y:305,onGround:true});b.takeWorldRiftShard('ED-04');});
  await flush();
  ok('host can collect the same shard',await host.evaluate(()=>__BF3.G.pendingRiftShards.found.includes('ED-04')));
  const packet=await host.evaluate(()=>__BF3.briarPacket());
  await guest.evaluate(packet=>{__BF3.briarApply(packet);__BF3.briarApply(packet);},packet);
  ok('repeated sync does not reopen or duplicate the box',await guest.evaluate(()=>!!__BF3.G.storyState.flags['gf.cache.open']&&__BF3.G.pendingRiftShards.found.filter(id=>id==='ED-04').length===1));
  if(errors.length)throw Error(JSON.stringify(errors));
  return {checks,errors};
 }finally{await context.close();}
}
