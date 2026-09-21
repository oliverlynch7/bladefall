async page=>{
 if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(page.url()))throw Error('Local test save only');
 const checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
 const context=await page.context().browser().newContext(),guest=await context.newPage();
 try{
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3);await guest.goto('http://127.0.0.1:4331/3d/?mute=1');
  const setup=async()=>{await __BF3.briarReady;const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classUnlocked.warrior=true;b.meta.classId='warrior';b.openHub();b.meta.gold=1000;b.meta.riftShards=[];b.meta.petOwned=[];b.meta.petActive=null;b.persist();window.qaPackets=[];};
  await page.evaluate(setup);await guest.evaluate(setup);
  await page.evaluate(()=>{const b=__BF3,m=b.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};const c={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f};m.wireGuest(c);qaListeners.open();b.enterZone(0);});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<2;i++){const fromGuest=await guest.evaluate(()=>qaPackets.splice(0));for(const d of fromGuest)await page.evaluate(d=>qaListeners.data(d),d);const fromHost=await page.evaluate(()=>qaPackets.splice(0));for(const d of fromHost)await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await flush();const hello=await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()}));await page.evaluate(d=>qaListeners.data(d),hello);await flush();

  await page.evaluate(()=>{__BF3.nextArea();__BF3.nextArea();__BF3.G.p.invuln=999;__BF3.G.boss.active=true;__BF3.G.boss.stunT=999;});await flush();
  ok('both peers enter orchard',await guest.evaluate(()=>__BF3.G.bruteArena&&__BF3.G.area===-1));
  await page.evaluate(()=>{const e=__BF3.G.boss;Object.assign(e,{bruteState:'wind',bruteClock:.4,windT:.4,windMax:1.15,teleX:1,teleZ:0,bruteTurns:1,bruteWaves:0});__BF3.MP.broadcast();});await flush();
  ok('guest receives locked charge state',await guest.evaluate(()=>__BF3.G.boss.bruteState==='wind'&&__BF3.G.boss.teleX===1&&__BF3.G.boss.windT===.4));
  await guest.evaluate(()=>{const b=__BF3;b.G.boss.stunT=0;b.G.p.invuln=999;for(let i=0;i<60;i++)b.update(.016);});
  ok('guest cannot invent attacks between host packets',await guest.evaluate(()=>__BF3.G.boss.bruteState==='wind'&&__BF3.G.boss.windT===.4&&!__BF3.G.shockwaves.length));
  await page.evaluate(()=>{const b=__BF3,e=b.G.boss;e.stunT=0;Object.assign(e,{bruteState:'hunt',bruteClock:0,bruteTurns:2,windT:0,x:0,z:0,y:0,sx:0,sz:0});Object.assign(b.G.p,{x:0,z:150});for(let i=0;i<64;i++)b.update(.016);b.MP.broadcast();e.stunT=999;});await flush();
  ok('guest receives damaging ground wave once',await guest.evaluate(()=>__BF3.G.shockwaves.filter(w=>w.orchardId).length===1&&__BF3.G.shockwaves.find(w=>w.orchardId).dmg>0));
  await page.evaluate(()=>__BF3.MP.broadcast());await flush();ok('repeat snapshots do not duplicate waves',await guest.evaluate(()=>__BF3.G.shockwaves.filter(w=>w.orchardId).length<=1));
  await page.evaluate(()=>{const b=__BF3,e=b.G.boss;e.stunT=0;e.hp=e.maxHp*.3;for(let i=0;i<220;i++)b.update(.016);e.stunT=999;b.MP.broadcast();});await flush();
  const hostIds=await page.evaluate(()=>__BF3.G.enemies.filter(e=>e.orchardHandler).map(e=>e.mid));
  ok('host creates four shared handlers',hostIds.length===4&&await guest.evaluate(ids=>ids.every(id=>__BF3.G.enemies.some(e=>e.mid===id)),hostIds));
  const before=await page.evaluate(()=>{const e=__BF3.G.boss;e.staggerT=3;e.bruteState='stagger';e.bruteClock=3;return e.hp;});
  await guest.evaluate(()=>{const b=__BF3;b.hitEnemy(b.G.boss,10,b.G.p,0,0,null)});await flush();
  ok('guest damage gets stagger bonus exactly once',await page.evaluate(before=>Math.abs(before-__BF3.G.boss.hp-16)<.01,before));
  await page.evaluate(()=>{const b=__BF3,e=b.G.boss;e.hp=0;b.killEnemy(e);b.MP.broadcast();});await flush();
  ok('boss death cannot open either exit with living handlers',await page.evaluate(()=>!__BF3.G.portal)&&await guest.evaluate(()=>!__BF3.G.portal));
  await page.evaluate(()=>{const b=__BF3;for(const e of b.G.enemies.filter(e=>!e.dead)){e.hp=0;b.killEnemy(e)}b.MP.broadcast();});await flush();
  ok('both exits open after handlers die',await page.evaluate(()=>!!__BF3.G.portal)&&await guest.evaluate(()=>!!__BF3.G.portal));
  return checks;
 }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];BFHubDialogue.close(false,true);__BF3.openHub()});await context.close();}
}
