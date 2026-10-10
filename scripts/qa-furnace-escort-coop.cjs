async page=>{
  const checks=[],errors=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)},context=await page.context().browser().newContext(),guest=await context.newPage();
  page.on('pageerror',e=>errors.push('host: '+e.message));guest.on('pageerror',e=>errors.push('guest: '+e.message));
  try{
    for(const p of [page,guest]){
      await p.goto('http://127.0.0.1:4331/3d/?mute=1');await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
      await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.autoAttack=false;b.openHub();window.qaPackets=[];});
    }
    await page.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});
    await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
    const flush=async()=>{for(let i=0;i<2;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
    await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();
    await page.evaluate(()=>{__BF3.enterZone(4);__BF3.nextArea();});await flush();
    for(const p of [page,guest]){await p.waitForFunction(()=>!BF_LOADING.active&&__BF3.G.furnace);await p.evaluate(()=>{const b=__BF3,G=b.G;G.p.invuln=1e9;for(const e of G.enemies){e.dead=true;e.hp=0;}window.qaAct=k=>{const o=G.storyObjects.find(o=>o.key===k);Object.assign(G.p,{x:o.x,z:o.z,y:o.y});b.briarRequest('world',{key:k});};window.qaTalk=(n,choices)=>{const o=G.storyNpcs.find(o=>o.id===n);Object.assign(G.p,{x:o.x,z:o.z,y:o.y});b.briarRequest('open',{npc:n});for(const choice of choices)b.briarRequest('choose',{line:G.storyState.conversation.node,choice});b.briarRequest('close');};});}
    await page.evaluate(()=>{qaAct('gf.fault');qaAct('gf.schedule');qaTalk('pike',['fault','pass']);qaTalk('martin',['rush','ready']);qaAct('gf.passage');qaAct('gf.evac.call');__BF3.MP.broadcast();});await flush();
    ok('guest sees host-started escort',await guest.evaluate(()=>__BF3.G.furnace.remote?.escortActive&&__BF3.G.storyState.items['gf.evac.calls']===1));
    await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p;for(let i=0;i<300;i++){Object.assign(p,{x:G.ironWorkers[1].x,z:G.ironWorkers[1].z-90,y:120,vy:0,vx:0,vz:0,invuln:1e9});b.update(.016);}b.MP.broadcast();});await flush();
    const midst=await guest.evaluate(()=>({t:__BF3.G.furnace.remote?.escortT||0,at:__BF3.G.ironWorkers.map(n=>n.z),hp:__BF3.G.ironWorkers.map(n=>n.hp),enemies:__BF3.G.enemies.filter(e=>e.furnaceEscortWave&&!e.dead).length}));
    if(!(midst.t>2&&midst.at.every(z=>z>-3430)&&midst.hp.every(h=>h>0)))throw Error('guest escort snapshot '+JSON.stringify(midst));
    ok('guest sees moving workers and their health',true);
    const foe=await page.evaluate(()=>{const e=__BF3.G.enemies.find(e=>e.furnaceEscortWave&&!e.dead&&e.hp>0);return e?{mid:e.mid,hp:e.hp}:null;});
    if(!foe)throw Error('No live escort pursuer to test guest combat');
    await guest.evaluate(mid=>{const b=__BF3,e=b.G.enemies.find(e=>e.mid===mid);if(!e)throw Error('Guest did not receive the pursuer');Object.assign(b.G.p,{x:e.x-35,z:e.z,y:e.y});b.hitEnemy(e,5,b.G.p,0,0);},foe.mid);await flush();
    ok('guest hit damages the host-owned escort pursuer',await page.evaluate(foe=>{const e=__BF3.G.enemies.find(e=>e.mid===foe.mid);return e&&e.hp<foe.hp;},foe));
    await page.evaluate(()=>{const b=__BF3,G=b.G,p=G.p;for(let i=0;i<1500;i++){Object.assign(p,{x:G.ironWorkers[1].x,z:G.ironWorkers[1].z-90,y:120,vy:0,vx:0,vz:0,invuln:1e9});b.update(.016);for(const e of G.enemies)if(e.furnaceEscortWave){e.dead=true;e.hp=0;}}b.MP.broadcast();});await flush();
    ok('evacuation and next objective sync to guest',await guest.evaluate(()=>__BF3.G.storyState.flags['gf.evacuated']&&__BF3.G.furnace.evacuated&&/water pipes/.test(BFGreatFurnace.quest(__BF3.G.storyState,__BF3.G))));
    ok('no browser errors',!errors.length);
    return {checks,midst,errors};
  }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];});await context.close();}
}
