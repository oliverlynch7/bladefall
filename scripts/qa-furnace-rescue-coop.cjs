async rootPage=>{
 const context=await rootPage.context().browser().newContext(),host=await context.newPage(),guest=await context.newPage(),errors=[],checks=[];
 const ok=(name,condition)=>{if(!condition)throw Error(name);checks.push(name);};
 try{
  for(const page of [host,guest]){
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4331/3d/?mute=1');
   await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
   await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.petOwned=[];b.openHub();window.qaPackets=[];});
  }
  await host.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<3;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await host.evaluate(d=>qaListeners.data(d),d);for(const d of await host.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await host.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();
  await host.evaluate(()=>{__BF3.enterZone(4);__BF3.nextArea();});await flush();
  for(const page of [host,guest]){await page.waitForFunction(()=>__BF3.G.furnace&&!BF_LOADING.active);await page.evaluate(()=>{const b=__BF3;b.G.p.invuln=999;window.qaAct=k=>{const o=b.G.storyObjects.find(o=>o.key===k);Object.assign(b.G.p,{x:o.x,z:o.z,y:o.y,vy:0});if(b.MP.guest())qaPackets.push({t:'pos',p:b.MP.selfState()});b.briarRequest('world',{key:k});};});}
  await host.evaluate(()=>{qaAct('gf.fault');qaAct('gf.schedule');const b=__BF3,n=b.G.storyNpcs.find(n=>n.id==='pike');Object.assign(b.G.p,{x:n.x,z:n.z,y:n.y});b.briarRequest('open',{npc:'pike'});for(const choice of ['fault','pass'])b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice});b.briarRequest('close');qaAct('gf.cage');});await flush();
  ok('cage inspection shared',await guest.evaluate(()=>!!__BF3.G.storyState.flags['gf.cage']));
  await guest.evaluate(()=>qaAct('gf.pet.feed'));await flush();
  ok('guest shuts host heat feed',await host.evaluate(()=>!!__BF3.G.storyState.flags['gf.pet.feed.closed']));
  ok('one authoritative guard group',await host.evaluate(()=>__BF3.G.enemies.filter(e=>e.furnaceCage&&!e.dead&&e.hp>0).length===3));
  await host.evaluate(()=>qaAct('gf.pet.release'));await flush();
  ok('live guards block release',await host.evaluate(()=>!__BF3.G.storyState.flags['gf.pet.open']));
  await host.evaluate(()=>{for(const e of __BF3.G.enemies.filter(e=>e.furnaceCage)){e.hp=0;e.dead=true;}qaAct('gf.pet.release');});await flush();
  ok('host release grants each player one provisional Cinder',await host.evaluate(()=>__BF3.G.pendingCompanions.filter(id=>id==='cinder').length===1)&&await guest.evaluate(()=>__BF3.G.pendingCompanions.filter(id=>id==='cinder').length===1));
  await host.evaluate(()=>__BF3.nextArea());await flush();
  for(const page of [host,guest])await page.waitForFunction(()=>__BF3.G.colossusArena&&!BF_LOADING.active);
  ok('boss boundary banks both companions',await host.evaluate(()=>__BF3.meta.petOwned.includes('cinder'))&&await guest.evaluate(()=>__BF3.meta.petOwned.includes('cinder')));
  if(errors.length)throw Error(JSON.stringify(errors));return {checks,errors};
 }finally{await context.close();}
}
