async page=>{
 if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(page.url()))throw Error('Local test save only');
 const checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
 const context=await page.context().browser().newContext(),guest=await context.newPage();
 try{
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3);await guest.goto('http://127.0.0.1:4331/3d/?mute=1');
  const setup=async()=>{await __BF3.briarReady;const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classUnlocked.warrior=true;b.meta.classId='warrior';b.openHub();b.meta.gold=1000;b.meta.riftShards=[];b.persist();window.qaPackets=[];};
  await page.evaluate(setup);await guest.evaluate(setup);
  await page.evaluate(()=>{const b=__BF3,m=b.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};const c={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f};m.wireGuest(c);qaListeners.open();b.enterZone(0);});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<2;i++){const fromGuest=await guest.evaluate(()=>qaPackets.splice(0));for(const d of fromGuest)await page.evaluate(d=>qaListeners.data(d),d);const fromHost=await page.evaluate(()=>qaPackets.splice(0));for(const d of fromHost)await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await flush();const hello=await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()}));await page.evaluate(d=>qaListeners.data(d),hello);await flush();

  await page.evaluate(()=>__BF3.nextArea());await flush();
  ok('both peers enter Black Woods',await guest.evaluate(()=>__BF3.G.area===1&&__BF3.G.storyNpcs[0].id==='lewis'));
  await guest.evaluate(()=>{const b=__BF3,n=b.G.storyNpcs[0];Object.assign(b.G.p,{x:n.x,z:n.z,y:0});b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});b.briarRequest('open',{npc:'lewis'});});await flush();
  ok('Lewis conversation shared',await page.evaluate(()=>__BF3.mode==='npc'&&__BF3.G.storyState.conversation.owner==='g'));
  for(const choice of ['route','go']){await guest.evaluate(choice=>{const b=__BF3;b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice})},choice);await flush();}
  await guest.evaluate(()=>__BF3.briarRequest('close'));await flush();
  const act=async key=>{await guest.evaluate(key=>{const b=__BF3,o=b.G.storyObjects.find(o=>o.key===key);Object.assign(b.G.p,{x:o.x,z:o.z,y:o.y});b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});b.briarRequest('world',{key});},key);await flush();};
  await act('woods.signal.cable');ok('signal and exit shared',await page.evaluate(()=>__BF3.G.storyState.flags['woods.signal']&&!!__BF3.G.portal)&&await guest.evaluate(()=>!!__BF3.G.portal));
  for(const animal of ['bird','deer','wolf'])await act('woods.tracks.'+animal);
  ok('track puzzle unlock shared',await page.evaluate(()=>__BF3.G.storyState.flags['woods.tracks.open'])&&await guest.evaluate(()=>__BF3.G.storyState.flags['woods.tracks.open']));
  await guest.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:-2130,z:-2530,y:0});b.takeWorldRiftShard('BR-04');});await flush();
  ok('physical shard remains personal',await guest.evaluate(()=>__BF3.G.pendingRiftShards.found.includes('BR-04'))&&await page.evaluate(()=>!__BF3.G.pendingRiftShards?.found?.includes('BR-04')));
  await page.evaluate(()=>__BF3.restartCampaignCheckpoint());await flush();
  ok('shared retry resets woods objective and personal pending shard',await page.evaluate(()=>!__BF3.G.storyState.flags['woods.signal'])&&await guest.evaluate(()=>!__BF3.G.storyState.flags['woods.signal']&&!__BF3.G.pendingRiftShards?.found?.length));
  return checks;
 }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];BFHubDialogue.close(false,true);__BF3.openHub()});await context.close();}
}
