async page=>{
 if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(page.url()))throw Error('Local test save only');
 const checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
 const context=await page.context().browser().newContext(),guest=await context.newPage();
 try{
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3);await guest.goto('http://127.0.0.1:4331/3d/?mute=1');
  const setup=async()=>{await __BF3.briarReady;const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classUnlocked.warrior=true;b.meta.classId='warrior';b.openHub();b.meta.gold=1000;b.meta.riftShards=[];b.meta.petOwned=[];b.meta.petActive=null;b.persist();window.qaPackets=[];};
  await page.evaluate(setup);await guest.evaluate(setup);
  await page.evaluate(()=>{const b=__BF3,m=b.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};const c={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f};m.wireGuest(c);qaListeners.open();b.enterZone(1);});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<2;i++){const fromGuest=await guest.evaluate(()=>qaPackets.splice(0));for(const d of fromGuest)await page.evaluate(d=>qaListeners.data(d),d);const fromHost=await page.evaluate(()=>qaPackets.splice(0));for(const d of fromHost)await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await flush();const hello=await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()}));await page.evaluate(d=>qaListeners.data(d),hello);await flush();

  await page.evaluate(()=>{__BF3.nextArea();__BF3.nextArea();__BF3.G.p.invuln=999;__BF3.G.boss.active=true;__BF3.G.boss.stunT=999;});await flush();
  for(const p of [page,guest])await p.waitForFunction(()=>__BF3.G.marksmanArena&&!BF_LOADING.active);await page.waitForTimeout(300);
  ok('both peers enter crossing',await guest.evaluate(()=>__BF3.G.marksmanArena&&__BF3.G.area===-1));
  await page.evaluate(()=>{const e=__BF3.G.boss;Object.assign(e,{markState:'aim',markClock:.4,markX:100,markZ:-500,markY:0,markH:54});__BF3.MP.broadcast();});await flush();ok('guest receives locked aim and height',await guest.evaluate(()=>__BF3.G.boss.markState==='aim'&&__BF3.G.boss.markX===100&&__BF3.G.boss.y===140));
  await guest.evaluate(()=>{const b=__BF3;b.G.boss.stunT=0;b.G.p.invuln=999;for(let i=0;i<60;i++)b.update(.016);});ok('guest cannot invent attacks',await guest.evaluate(()=>__BF3.G.boss.markClock===.4&&!__BF3.G.projectiles.length));
  await page.evaluate(()=>{const b=__BF3,e=b.G.boss;e.stunT=0;e.hp=e.maxHp*.5;e.markState='recover';e.markClock=0;for(let i=0;i<150;i++)b.update(.016);b.MP.broadcast();e.stunT=999;});await flush();ok('guest mirrors protected airborne relocation',await guest.evaluate(()=>__BF3.G.boss.markState==='glide'&&__BF3.G.boss.untargetable&&__BF3.G.boss.y>220));
  const ids=await page.evaluate(()=>__BF3.G.enemies.filter(e=>e.marksmanGuard).map(e=>e.mid));ok('one shared pair of guards',ids.length===2&&await guest.evaluate(ids=>ids.every(id=>__BF3.G.enemies.some(e=>e.mid===id)),ids));await page.evaluate(()=>__BF3.MP.broadcast());await flush();ok('repeat state does not duplicate guards',await guest.evaluate(()=>__BF3.G.enemies.length===3));
  await page.evaluate(()=>{const b=__BF3,e=b.G.boss;e.untargetable=false;e.hp=0;b.killEnemy(e);b.MP.broadcast();});await flush();ok('both exits wait for guards',await page.evaluate(()=>!__BF3.G.portal)&&await guest.evaluate(()=>!__BF3.G.portal));
  await page.evaluate(()=>{const b=__BF3;for(const e of b.G.enemies.filter(e=>!e.dead)){e.hp=0;b.killEnemy(e);}b.MP.broadcast();});await flush();ok('both peers see safe exit and shard',await guest.evaluate(()=>__BF3.G.portal&&__BF3.worldRiftShards().some(x=>x.id==='HP-05')));
  for(const p of [page,guest])await p.evaluate(()=>{if(__BF3.mode==='upgrade'){__BF3.openPause();document.getElementById('resBtn').click();}});
  await page.evaluate(()=>{Object.assign(__BF3.G.p,{x:680,z:-1670,y:0});__BF3.takeWorldRiftShard('HP-05');});await flush();ok('boss shard is not remotely granted',await guest.evaluate(()=>!__BF3.meta.riftShards.includes('HP-05')));await guest.evaluate(()=>{Object.assign(__BF3.G.p,{x:680,z:-1670,y:0});window.qaClaim=__BF3.takeWorldRiftShard('HP-05');});if(!await guest.evaluate(()=>__BF3.meta.riftShards.includes('HP-05')))throw Error(JSON.stringify(await guest.evaluate(()=>({claim:qaClaim,mode:__BF3.mode,shards:__BF3.meta.riftShards,p:__BF3.G.p,portal:__BF3.G.portal,world:__BF3.worldRiftShards()}))));ok('guest physical claim is saved',await guest.evaluate(()=>__BF3.meta.riftShards.includes('HP-05')&&__BF3.campaignCheckpoint().state.riftShards.includes('HP-05')));
  return checks;
 }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];BFHubDialogue.close(false,true);__BF3.openHub()});await context.close();}
}
