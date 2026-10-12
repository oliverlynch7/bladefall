async page=>{
 const context=await page.context().browser().newContext(),guest=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));guest.on('pageerror',e=>errors.push(e.message));
 try{
  for(const p of [page,guest]){
   await p.goto('http://127.0.0.1:4331/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
   await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.tutOff=true;b.meta.autoAttack=false;b.openHub();window.qaPackets=[];});
  }
  await page.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<2;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();
  await page.evaluate(()=>{const b=__BF3;b.enterZone(4);b.nextArea();b.G.storyState.flags['gf.evacuated']=true;b.briarSync();b.MP.broadcast();});await flush();
  for(const p of [page,guest])await p.waitForFunction(()=>__BF3.G.furnace&&!BF_LOADING.active);
  await page.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:420,z:-5150,y:120,invuln:999});for(const e of b.G.enemies)e.stunT=999;});
  const guestPosition=async x=>{await guest.evaluate(x=>{const b=__BF3;Object.assign(b.G.p,{x,z:-5150,y:120,vy:0,vx:0,vz:0,invuln:999});qaPackets.push({t:'pos',p:b.MP.selfState()});},x);await flush();};
  const hostTick=async n=>page.evaluate(n=>{const b=__BF3;for(let i=0;i<n;i++){for(const e of b.G.enemies)e.stunT=999;b.update(.016);}b.MP.broadcast();return {heat:b.G.furnace.heat,held:b.G.furnace.pedalHeld,wave:b.G.furnace.coolWave,open:!!b.G.storyState.flags['gf.cool.open'],peers:Object.values(b.MP.peers).map(q=>({x:q.tx,y:q.ty,z:q.tz,hp:q.hp,zone:q.zone,area:q.area}))};},n);
  await guestPosition(0);const first=await hostTick(120);if(!(first.held&&first.heat<100&&first.wave===1))throw Error('Guest did not hold the host-owned pedal '+JSON.stringify(first));await flush();
  const guestHeat=await guest.evaluate(()=>__BF3.G.furnace.heat);if(!(guestHeat<100))throw Error('Guest gauge did not receive host cooling '+guestHeat);
  await guestPosition(400);const off=await hostTick(90);if(off.held||off.heat<=first.heat||off.open)throw Error('Guest release did not reheat '+JSON.stringify(off));
  let done;for(let i=0;i<9;i++){await guestPosition(0);done=await hostTick(100);await flush();if(done.open)break;}if(!done.open||!await guest.evaluate(()=>__BF3.G.storyState.flags['gf.cool.open']&&__BF3.G.furnace.cooled))throw Error('Shared crossing did not open '+JSON.stringify(done));
  if(errors.length)throw Error(errors.join('\n'));
  return {guestHold:first,guestRelease:off,sharedCompletion:done,guestHeat};
 }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];});await context.close();}
}
