async page=>{
 const checks=[],errors=[],ok=(name,value)=>{if(!value)throw Error(name);checks.push(name)};
 const context=await page.context().browser().newContext(),guest=await context.newPage();
 page.on('pageerror',e=>errors.push('host: '+e.message));guest.on('pageerror',e=>errors.push('guest: '+e.message));
 try{
  for(const p of [page,guest]){
   await p.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2163');
   await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
   await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.openHub();window.qaPackets=[];});
  }
  await page.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};const c={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f};m.wireGuest(c);qaListeners.open();});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<2;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));
  await flush();await page.evaluate(()=>{__BF3.enterZone(1);__BF3.nextArea();});await flush();
  for(const p of [page,guest])await p.waitForFunction(()=>__BF3.G.canyon&&!BF_LOADING.active);
  await page.evaluate(()=>{
   const b=__BF3,G=b.G,p=G.p,act=key=>{const o=G.storyObjects.find(o=>o.key===key);Object.assign(p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key});};
   p.invuln=999;act('lc.orders');Object.assign(p,{x:-90,z:-630,y:140});b.briarRequest('open',{npc:'ward'});
   b.briarRequest('choose',{line:G.storyState.conversation.node,choice:'orders'});b.briarRequest('close');
   Object.assign(p,{x:-440,z:-1450,y:0});b.briarRequest('open',{npc:'ruth'});
   b.briarRequest('choose',{line:G.storyState.conversation.node,choice:'help'});b.briarRequest('close');
   for(const e of G.enemies){e.hp=0;e.dead=true;}
   Object.assign(p,{x:0,z:-4000,y:0});
  });
  await page.evaluate(()=>__BF3.MP.broadcast());await flush();
  await guest.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:-780,z:-1985,y:0,invuln:999});b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});});
  await flush();
  ok('host sees guest at the south cage',await page.evaluate(()=>Math.hypot(__BF3.MP.peers.g.tx+780,__BF3.MP.peers.g.tz+1985)<3));
  await guest.evaluate(()=>__BF3.briarRequest('world',{key:'lc.cage.south'}));await flush();
  ok('guest release sets shared loud alarm',await page.evaluate(()=>__BF3.G.storyState.flags['lc.south']&&__BF3.G.storyState.flags['lc.alarm.called'])&&await guest.evaluate(()=>__BF3.G.storyState.flags['lc.south']));
  for(let batch=0;batch<5;batch++){
   await page.evaluate(()=>{for(let i=0;i<45;i++)__BF3.update(.016);});
   await guest.evaluate(()=>{const b=__BF3;b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});});await flush();
  }
  const host=await page.evaluate(()=>{
   const b=__BF3,G=b.G;
   const enemies=G.enemies.filter(e=>e.canyonAlarm&&!e.dead).map(e=>({mid:e.mid,x:e.x,z:e.z,label:e.label,active:e.active}));
   b.MP.broadcast();
   return {enemies,hostFar:Math.hypot(G.p.x+780,G.p.z+1985)>1500,guestNear:Math.hypot(b.MP.peers.g.tx+780,b.MP.peers.g.tz+1985)<3};
  });
  await flush();
  ok('host sends wave to guest despite being far away',host.hostFar&&host.guestNear&&host.enemies.length===2&&host.enemies.every(e=>e.active&&Math.hypot(e.x+780,e.z+1985)<750));
  const mirrored=await guest.evaluate(()=>__BF3.G.enemies.filter(e=>e.patrolGroup==='canyon.signal'&&!e.dead).map(e=>({mid:e.mid,label:e.label,meleeReach:e.meleeReach})));
  ok('guest sees both named reinforcement bodies and matching attack reach',mirrored.length===2&&mirrored.every(e=>e.label==='Alarm guard'&&e.meleeReach===22)&&mirrored.every(e=>host.enemies.some(h=>h.mid===e.mid)));
  await guest.evaluate(()=>{const b=__BF3;Object.assign(b.G.p,{x:0,z:-2550,y:180});b.MP.hostConn.send({t:'pos',p:b.MP.selfState()});});await flush();
  await guest.evaluate(()=>__BF3.briarRequest('world',{key:'lc.alarm'}));await flush();
  const stopped=await page.evaluate(()=>({cut:!!__BF3.G.storyState.flags['lc.alarm'],timer:__BF3.G.canyon.alarmAt}));
  ok('guest cutting cable stops host timer and shares state',stopped.cut&&stopped.timer===0&&await guest.evaluate(()=>!!__BF3.G.storyState.flags['lc.alarm']));
  if(errors.length)throw Error(JSON.stringify(errors));
  return {checks,host,mirrored,stopped,errors};
 }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];});await context.close();}
}
