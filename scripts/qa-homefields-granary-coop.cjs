async page=>{
 const checks=[],errors=[],ok=(name,pass)=>{if(!pass)throw Error(name);checks.push(name)};
 const context=await page.context().browser().newContext(),guest=await context.newPage();
 page.on('pageerror',e=>errors.push('host: '+e.message));guest.on('pageerror',e=>errors.push('guest: '+e.message));
 try{
  for(const p of [page,guest]){
   await p.goto('http://127.0.0.1:4331/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
   await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.meta.hubTutDone=true;b.openHub();document.body.classList.remove('t-attract','t-title');window.qaPackets=[];});
  }
  await page.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<2;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();
  await page.evaluate(()=>__BF3.enterZone(0));await flush();
  for(const p of [page,guest])await p.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.storyObjects?.some(o=>o.key==='home.grain.hopper'));
  ok('both players begin with a closed granary',await page.evaluate(()=>!__BF3.G.granary.open&&__BF3.G.walls.some(w=>w.grainDoor))&&await guest.evaluate(()=>!__BF3.G.granary.open&&__BF3.G.walls.some(w=>w.grainDoor)));
  const act=async(p,key)=>{await p.evaluate(key=>{const b=__BF3,o=b.G.storyObjects.find(o=>o.key==='home.grain.'+key);Object.assign(b.G.p,{x:o.x,z:o.z,y:o.y});if(!b.MP.isHost)b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});b.briarRequest('world',{key:o.key});},key);await flush()};
  await act(guest,'hopper');
  ok('guest release visibly spills grain without opening door',await page.evaluate(()=>__BF3.G.granary.hopper&&__BF3.G.granary.spilled&&!__BF3.G.granary.open)&&await guest.evaluate(()=>__BF3.G.granary.hopper&&__BF3.G.granary.spilled&&!__BF3.G.granary.open));
  await act(page,'spout');
  ok('host alignment opens the shared door and removes collision',await page.evaluate(()=>__BF3.G.granary.open&&!__BF3.G.walls.some(w=>w.grainDoor))&&await guest.evaluate(()=>__BF3.G.granary.open&&!__BF3.G.walls.some(w=>w.grainDoor)));
  const before=await guest.evaluate(()=>__BF3.meta.gold);await act(guest,'cache');
  ok('guest claim rewards both players once',await page.evaluate(()=>__BF3.G.storyClaims['home.grain.cache'])&&await guest.evaluate(n=>__BF3.G.storyClaims['home.grain.cache']&&__BF3.meta.gold>n,before));
  const packet=await page.evaluate(()=>__BF3.briarPacket());const after=await guest.evaluate(()=>__BF3.meta.gold);await guest.evaluate(p=>{__BF3.briarApply(p);__BF3.briarApply(p);},packet);
  ok('replayed story snapshots do not duplicate reward',await guest.evaluate(n=>__BF3.meta.gold===n,after));
  if(errors.length)throw Error(JSON.stringify(errors));return {checks,errors};
 }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];__BF3.openHub()});await context.close()}
}
