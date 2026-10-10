async page=>{
 const context=await page.context().browser().newContext(),guest=await context.newPage(),errors=[];for(const p of [page,guest])p.on('pageerror',e=>errors.push(e.message));
 try{
  for(const p of [page,guest]){await p.goto('http://127.0.0.1:4331/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.openHub();window.qaPackets=[];});}
  await page.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<3;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();await page.evaluate(()=>__BF3.enterZone(5));await flush();for(const p of [page,guest])await p.waitForFunction(()=>__BF3.G.shore&&!BF_LOADING.active);
  await guest.evaluate(()=>{const b=__BF3,p=b.G.p;Object.assign(p,{x:-1415,z:-3290,y:130,vy:0,yaw:BFShipwreckShore.targetYaw});b.G.camYaw=BFShipwreckShore.targetYaw;qaPackets.push({t:'pos',p:b.MP.selfState()});});await flush();
  await guest.evaluate(()=>{const b=__BF3,action=b.briarInteract();if(action?.label!=='Aim the wreck ballista')throw Error('Guest prompt: '+action?.label);action.act();b.G.shore.ballista.yaw=BFShipwreckShore.targetYaw;b.G.shore.ballista.pitch=BFShipwreckShore.targetPitch;});
  await guest.keyboard.press('e');await flush();
  const opened=await Promise.all([page,guest].map(p=>p.evaluate(()=>({open:!!__BF3.G.storyState.flags['sc.code.open'],reward:!!__BF3.G.storyState.rewards['sc.stormshot']}))));
  if(opened.some(v=>!v.open||v.reward))throw Error('Co-op hit: '+JSON.stringify(opened));
  await guest.keyboard.press('Escape');await guest.evaluate(()=>{const b=__BF3,p=b.G.p;Object.assign(p,{x:-2140,z:-3400,y:200,vy:0});qaPackets.push({t:'pos',p:b.MP.selfState()});});await flush();
  await guest.evaluate(()=>{const action=__BF3.briarInteract();if(action?.label!=='Take Stormshot from the opened chest')throw Error('Guest chest: '+action?.label);action.act();});await flush();
  const claimed=await Promise.all([page,guest].map(p=>p.evaluate(()=>({reward:!!__BF3.G.storyState.rewards['sc.stormshot'],localClaim:!!__BF3.G.storyClaims['sc.stormshot'],open:!!__BF3.G.storyState.flags['sc.code.open']}))));
  if(claimed.some(v=>!v.reward||!v.localClaim||!v.open)||errors.length)throw Error(JSON.stringify({claimed,errors}));
  return {opened,claimed,errors};
 }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];});await context.close();}
}
