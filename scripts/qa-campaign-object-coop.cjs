async root=>{
 const browser=root.context().browser(),hostCtx=await browser.newContext(),guestCtx=await browser.newContext(),host=await hostCtx.newPage(),guest=await guestCtx.newPage(),checks=[],errors=[];
 const ok=(name,value)=>{if(!value)throw Error(name);checks.push(name);};
 try{
  for(const p of [host,guest]){
   p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4345/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.dialogueTTS=false;b.meta.classId='warrior';b.openHub();window.qaPackets=[];});
  }
  await host.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>{qaPackets.push(JSON.parse(JSON.stringify(d)));}};});
  const flush=async()=>{for(let i=0;i<2;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await host.evaluate(d=>qaListeners.data(d),d);for(const d of await host.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await host.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();await host.evaluate(()=>__BF3.enterZone(0));
  for(let i=0;i<20;i++){await flush();if(await guest.evaluate(()=>!__BF3.G.hub&&__BF3.G.zone===0))break;await host.waitForTimeout(120);}
  for(const p of [host,guest]){await p.waitForFunction(()=>!BF_LOADING.active);await p.evaluate(()=>{const g=__BF3.G;g.enemies.forEach(e=>e.stunT=999);Object.assign(g.p,{x:440,z:-190,y:0,vy:0,invuln:999});});}
  const sendPosition=async()=>host.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'pos',p:__BF3.MP.selfState()})));
  await sendPosition();await host.evaluate(()=>__BF3.G.walls.push({x:440,z:-222.5,y0:0,h:180,w:20,d:20,qaWall:true}));
  await guest.evaluate(()=>__BF3.briarRequest('world',{key:'briar.dressings'}));await flush();
  ok('host rejects guest pickup behind a wall',!await host.evaluate(()=>__BF3.G.storyState.flags['event.briar.dressings']));
  ok('rejected pickup stays visible on guest',await guest.evaluate(()=>!BFCampaignObjects.taken(__BF3.G.storyObjects.find(o=>o.key==='briar.dressings'),__BF3.G.storyState)));
  await host.evaluate(()=>__BF3.G.walls=__BF3.G.walls.filter(w=>!w.qaWall));await sendPosition();await guest.evaluate(()=>__BF3.briarRequest('world',{key:'briar.dressings'}));await flush();await host.waitForTimeout(160);
  for(const [name,p]of [['host',host],['guest',guest]])ok(name+' removes collected pickup',await p.evaluate(()=>!!__BF3.G.storyState.flags['event.briar.dressings']&&__CAMPAIGN_OBJECT_STATS.items.find(o=>o.key==='briar.dressings')?.collected));
  for(const p of [host,guest])await p.evaluate(()=>{const g=__BF3.G,o=g.storyObjects.find(o=>o.key==='home.orchard.clue');Object.assign(g.p,{x:o.x,z:o.z+70,y:0,vy:0});});
  await host.waitForTimeout(160);await flush();await sendPosition();await guest.evaluate(()=>__BF3.briarRequest('world',{key:'home.orchard.clue'}));await flush();await host.waitForTimeout(160);
  for(const [name,p]of [['host',host],['guest',guest]])ok(name+' receives clue and keeps its sign',await p.evaluate(()=>{const g=__BF3.G,o=g.storyObjects.find(o=>o.key==='home.orchard.clue');return !!g.storyState.flags['event.home.orchard.clue']&&Object.keys(g.storyState.notes).length>0&&BFCampaignObjects.drawn(o);}));
  const packet=await host.evaluate(()=>JSON.parse(JSON.stringify(__BF3.briarPacket())));
  await guest.evaluate(packet=>{const b=__BF3;b.G.storyState=BFStoryState.restore({});b.briarApply(packet);},packet);
  ok('snapshot restores collected item and readable clue',await guest.evaluate(()=>__BF3.G.storyState.flags['event.briar.dressings']&&__BF3.G.storyState.flags['event.home.orchard.clue']));
  if(errors.length)throw Error(errors.join(';'));return {checks,errors,transport:'two local browser clients using real host/guest packet handlers; no external network'};
 }finally{await hostCtx.close();await guestCtx.close();}
}
