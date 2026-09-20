async page=>{
 if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(page.url()))throw Error('Local test save only');
 const checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
 const context=await page.context().browser().newContext(),guest=await context.newPage();
 try{
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3);await guest.goto('http://127.0.0.1:4331/3d/?mute=1');
  const setup=async()=>{await __BF3.briarReady;const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classUnlocked.warrior=true;b.meta.classId='warrior';b.openHub();b.meta.gold=1000;b.persist();window.qaPackets=[];};
  await page.evaluate(setup);await guest.evaluate(setup);
  await page.evaluate(()=>{const b=__BF3,m=b.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};const c={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f};m.wireGuest(c);qaListeners.open();b.enterZone(0);});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<2;i++){const fromGuest=await guest.evaluate(()=>qaPackets.splice(0));for(const d of fromGuest)await page.evaluate(d=>qaListeners.data(d),d);const fromHost=await page.evaluate(()=>qaPackets.splice(0));for(const d of fromHost)await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await flush();const hello=await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()}));await page.evaluate(d=>qaListeners.data(d),hello);await flush();
  await guest.evaluate(()=>{const b=__BF3,n=b.G.storyNpcs[0];Object.assign(b.G.p,{x:n.x+50,z:n.z+40,y:0});b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});b.briarRequest('open',{npc:'thomas'});});await flush();
  ok('guest starts shared conversation with host-owned authority',await page.evaluate(()=>__BF3.mode==='npc'&&__BF3.G.storyState.conversation.owner==='g')&&await guest.evaluate(()=>__BF3.mode==='npc'&&__BF3.G.storyState.conversation.owner==='g'));
  const focus=await page.evaluate(()=>{const f=BFHubDialogue.focus();return [f.x,f.z,f.dx,f.dz]});ok('both cameras use the same authoritative viewing direction',await guest.evaluate(expected=>{const f=BFHubDialogue.focus();return JSON.stringify([f.x,f.z,f.dx,f.dz])===JSON.stringify(expected)},focus));
  const revision=await page.evaluate(()=>__BF3.G.storyState.revision);await page.evaluate(()=>{const b=__BF3;b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice:'joke'});});await flush();ok('host cannot steal guest choice',await page.evaluate(r=>__BF3.G.storyState.revision===r,revision));
  const choose=async id=>{await guest.evaluate(id=>{const b=__BF3;b.briarRequest('choose',{line:b.G.storyState.conversation.node,choice:id});},id);await flush()};
  await choose('protect');ok('both see same reply and NPC line',await page.evaluate(()=>BFHubDialogue.active.lineId==='briar.thomas.protect')&&await guest.evaluate(()=>BFHubDialogue.active.lineId==='briar.thomas.protect'));
  const times=await page.evaluate(()=>({world:__BF3.G.time,hp:__BF3.G.enemies[0].hp}));await page.evaluate(()=>{const b=__BF3;for(let i=0;i<20;i++)b.update(.05);const e=b.G.enemies[0];b.MP.hostApplyHit({m:e._mid,d:999});});await flush();ok('shared conversation freezes world and relayed damage',await page.evaluate(t=>__BF3.G.time===t.world&&__BF3.G.enemies[0].hp===t.hp,times));
  await choose('prepare');await guest.evaluate(()=>__BF3.briarRequest('close'));await flush();
  await guest.evaluate(()=>{const b=__BF3,n=b.G.storyNpcs[1];Object.assign(b.G.p,{x:n.x+40,z:n.z+40,y:0});b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});b.briarRequest('open',{npc:'mara'});});await flush();await choose('help');await choose('accept');await guest.evaluate(()=>__BF3.briarRequest('close'));await flush();
  for(const key of ['briar.root.1','briar.root.2','briar.root.3','briar.dressings']){await guest.evaluate(key=>{const b=__BF3,o=b.G.storyObjects.find(o=>o.key===key);Object.assign(b.G.p,{x:o.x,y:o.y,z:o.z});b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});b.briarRequest('world',{key});},key);await flush();}
  ok('supplies collected by either player are shared quest items',await page.evaluate(()=>__BF3.G.storyState.items.tangle_root===3)&&await guest.evaluate(()=>__BF3.G.storyState.items.tangle_root===3));
  await guest.evaluate(()=>{const b=__BF3,n=b.G.storyNpcs[1];Object.assign(b.G.p,{x:n.x+40,z:n.z+40,y:0});b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});b.briarRequest('open',{npc:'mara'});});await flush();await choose('deliver');
  const goldHost=await page.evaluate(()=>__BF3.meta.gold),goldGuest=await guest.evaluate(()=>__BF3.meta.gold);ok('one turn-in rewards both players',goldHost>1000&&goldGuest>1000);
  const packet=await page.evaluate(()=>__BF3.briarPacket());await guest.evaluate(p=>{__BF3.briarApply(p);__BF3.briarApply(p);},packet);ok('duplicate snapshots cannot repeat guest reward',await guest.evaluate(n=>__BF3.meta.gold===n,goldGuest));
  const lateContext=await page.context().browser().newContext();
  try{const late=await lateContext.newPage();await late.goto('http://127.0.0.1:4331/3d/?mute=1');await late.waitForFunction(()=>window.__BF3);await late.evaluate(setup);const place=await page.evaluate(()=>__BF3.MP.placeMsg());await late.evaluate(d=>{const b=__BF3;b.MP.active=true;b.MP.isHost=false;b.MP.myId='late';b.MP.onGuestData(d);},place);
   ok('late join sees current conversation without receiving old rewards',await late.evaluate(()=>__BF3.G.storyState.flags['mara.healing']&&__BF3.mode==='npc'&&__BF3.meta.gold===1000));
   await late.evaluate(()=>{BFHubDialogue.close(false,true);__BF3.restartCampaignCheckpoint(true)});ok('late join does not bank unfinished host quest',await late.evaluate(()=>!__BF3.G.storyState.flags['mara.healing']&&__BF3.meta.gold===1000));
  }finally{await lateContext.close();}
  await guest.evaluate(()=>__BF3.briarRequest('close'));await flush();
  await page.evaluate(()=>{__BF3.restartCampaignCheckpoint();});await flush();ok('shared retry rolls back quest and rewards on both clients',await page.evaluate(()=>!__BF3.G.storyState.flags['mara.healing']&&__BF3.meta.gold===1000)&&await guest.evaluate(()=>!__BF3.G.storyState.flags['mara.healing']&&__BF3.meta.gold===1000));
  await guest.evaluate(()=>{const b=__BF3,n=b.G.storyNpcs[0];Object.assign(b.G.p,{x:n.x+40,z:n.z+40,y:0});b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});b.briarRequest('open',{npc:'thomas'});});await flush();ok('new epoch accepts new requests after retry',await page.evaluate(()=>__BF3.G.storyState.conversation?.owner==='g'));
  await page.evaluate(()=>qaListeners.close());ok('departing conversation owner releases host',await page.evaluate(()=>__BF3.mode==='play'&&!__BF3.G.storyState.conversation));
  ok('same-class peer keeps valid material textures',await page.evaluate(()=>{const bad=[];__hero3dScene().traverse(o=>{for(const m of (o.material?(Array.isArray(o.material)?o.material:[o.material]):[]))if(m.map&&!m.map.isTexture)bad.push(o.name)});return !HERO3D.err&&!bad.length}));
  return checks;
 }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];BFHubDialogue.close(false,true);__BF3.openHub()});await context.close();}
}
