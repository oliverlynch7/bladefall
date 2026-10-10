async page=>{
 const context=await page.context().browser().newContext(),guest=await context.newPage(),errors=[],checks=[];
 const ok=(name,value)=>{if(!value)throw Error(name);checks.push(name)};
 for(const p of [page,guest])p.on('pageerror',e=>errors.push(e.message));
 try{
  for(const p of [page,guest]){await p.goto('http://127.0.0.1:4331/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();window.qaPackets=[];});}
  await page.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<3;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();
  await page.evaluate(()=>{__BF3.enterZone(1);__BF3.MP.onEnter(1);});await flush();
  for(const p of [page,guest])await p.waitForFunction(()=>__BF3.G.cliffs&&!BF_LOADING.active);
  ok('guest enters same Winding Cliffs',await guest.evaluate(()=>__BF3.G.zone===1&&__BF3.G.area===0));
  await guest.evaluate(()=>{const b=__BF3,o=b.G.storyObjects.find(o=>o.key==='hp.code.release');Object.assign(b.G.p,{x:o.x,y:o.y,z:o.z});qaPackets.push({t:'pos',p:b.MP.selfState()});b.briarRequest('world',{key:o.key});});await flush();
  ok('guest release accepted by host',await page.evaluate(()=>!!__BF3.G.storyState.flags['hp.code.open']));
  ok('cargo rises for both players',await guest.evaluate(()=>!!__BF3.G.storyState.flags['hp.code.open']&&__BF3.G.cliffs.cargoOpen));
  await guest.evaluate(()=>{const b=__BF3,o=b.G.storyObjects.find(o=>o.key==='hp.code.claim');Object.assign(b.G.p,{x:o.x,y:o.y,z:o.z});qaPackets.push({t:'pos',p:b.MP.selfState()});b.briarRequest('world',{key:o.key});});await flush();
  ok('guest chest claim is shared once',await page.evaluate(()=>!!__BF3.G.storyState.flags['hp.code.claimed']&&!!__BF3.G.storyState.rewards['hp.cliffcache']));
  ok('host sees claimed chest',await page.evaluate(()=>!__BF3.briarObjects().some(o=>o.key==='hp.code.claim')));
  if(errors.length)throw Error(JSON.stringify(errors));return {checks,errors};
 }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];});await context.close();}
}
