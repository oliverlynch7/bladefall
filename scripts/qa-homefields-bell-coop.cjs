async page=>{
 const context=await page.context().browser().newContext(),guest=await context.newPage(),checks=[];
 const ok=(name,value)=>{if(!value)throw Error(name);checks.push(name);};
 try{
  for(const p of [page,guest]){
   await p.goto('http://127.0.0.1:4331/3d/?mute=1');
   await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
   await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.tutOff=true;b.meta.classId='warrior';b.openHub();window.qaPackets=[];});
  }
  await page.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<3;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();
  await page.evaluate(()=>{__BF3.enterZone(0);__BF3.G.p.invuln=999;});await flush();
  ok('guest enters the same Homefields',await guest.evaluate(()=>__BF3.G?.homeBell&&__BF3.G.zone===0));
  await guest.evaluate(()=>{const b=__BF3,o=b.G.storyObjects.find(o=>o.key==='home.bell.alarm');Object.assign(b.G.p,{x:o.x,y:o.y,z:o.z+72,invuln:999});qaPackets.push({t:'pos',p:b.MP.selfState()});});await flush();
  await guest.evaluate(()=>{const b=__BF3;b.updateInteract();if(b.G.interact?.label!=='Ring the warning bell')throw Error('Guest bell prompt missing');b.doInteract();});await flush();
  ok('guest rings the host-owned bell',await page.evaluate(()=>__BF3.G.storyState.flags['home.bell.alarm']));
  await page.evaluate(()=>{const b=__BF3;for(let i=0;i<20;i++)b.update(.016);b.MP.broadcast();});await flush();
  ok('host patrol arrives for nearby guest',await page.evaluate(()=>BFHomeBellDefense.foes(__BF3.G,1).length===2));
  const guestWave=await guest.evaluate(()=>({wave:__BF3.G.homeBell.remote?.wave,foes:BFHomeBellDefense.foes(__BF3.G,1).length,total:__BF3.G.enemies.length,area:__BF3.G.area,zone:__BF3.G.zone}));
  ok('guest sees the wave and foes '+JSON.stringify(guestWave),guestWave.wave===1&&guestWave.foes===2);
  const firstId=await page.evaluate(()=>BFHomeBellDefense.foes(__BF3.G,1)[0].mid);
  await guest.evaluate(id=>{const b=__BF3,e=b.G.enemies.find(e=>e.mid===id);b.hitEnemy(e,5,b.G.p,0,0);},firstId);await flush();
  ok('guest weapon damages the host patrol',await page.evaluate(id=>{const e=__BF3.G.enemies.find(e=>e.mid===id);return e&&e.hp<e.maxHp;},firstId));
  await page.evaluate(()=>{const b=__BF3;for(let wave=1;wave<=3;wave++){for(const e of BFHomeBellDefense.foes(b.G,wave))e.dead=true;for(let i=0;i<170;i++)b.update(.016);}b.MP.broadcast();});await flush();
  ok('both players see the captain key',await page.evaluate(()=>!!__BF3.G.storyState.flags['home.bells.open'])&&await guest.evaluate(()=>!!__BF3.G.storyState.flags['home.bells.open']&&__BF3.G.homeBell.remote?.open));
  await guest.evaluate(()=>{const b=__BF3,o=b.G.storyObjects.find(o=>o.key==='home.bell.cache');Object.assign(b.G.p,{x:o.x-72,y:o.y,z:o.z});qaPackets.push({t:'pos',p:b.MP.selfState()});});await flush();
  await guest.evaluate(()=>{const b=__BF3;b.updateInteract();if(b.G.interact?.label!=='Open the tower chest')throw Error('Guest chest prompt missing');b.doInteract();});await flush();
  ok('guest claims the shared chest',await guest.evaluate(()=>!!__BF3.G.storyClaims['home.bells.cache']&&__BF3.meta.gold>=180));
  const gold=await guest.evaluate(()=>__BF3.meta.gold);await page.evaluate(()=>__BF3.MP.broadcast());await flush();
  ok('duplicate packets cannot pay twice',await guest.evaluate(g=>__BF3.meta.gold===g,gold));
  return checks;
 }finally{await context.close();}
}
