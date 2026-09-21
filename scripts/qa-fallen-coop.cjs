async page=>{
 if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(page.url()))throw Error('Local test save only');
 const checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n)};
 const context=await page.context().browser().newContext(),guest=await context.newPage();
 try{
  await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3);await guest.goto('http://127.0.0.1:4331/3d/?mute=1');
  const setup=async()=>{await __BF3.briarReady;const b=__BF3;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classUnlocked.warrior=true;b.meta.classId='warrior';b.openHub();b.meta.gold=1000;b.meta.riftShards=[];b.meta.petOwned=[];b.meta.petActive=null;b.persist();window.qaPackets=[];};
  await page.evaluate(setup);await guest.evaluate(setup);
  await page.evaluate(()=>{const b=__BF3,m=b.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};const c={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f};m.wireGuest(c);qaListeners.open();b.enterZone(2);});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<2;i++){const fromGuest=await guest.evaluate(()=>qaPackets.splice(0));for(const d of fromGuest)await page.evaluate(d=>qaListeners.data(d),d);const fromHost=await page.evaluate(()=>qaPackets.splice(0));for(const d of fromHost)await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await flush();const hello=await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()}));await page.evaluate(d=>qaListeners.data(d),hello);await flush();


await page.evaluate(()=>{const b=__BF3;b.nextArea();b.nextArea();b.G.p.invuln=999;b.G.boss.active=true;b.G.boss.stunT=999;b.MP.broadcast();});await flush();for(const p of [page,guest])await p.waitForFunction(()=>__BF3.G.fallenArena&&!BF_LOADING.active);
await page.evaluate(()=>{Object.assign(__BF3.G.boss,{fallState:'thrust',fallClock:.5,fallDX:0,fallDZ:1,fallKind:'thrust',fallSeq:1});__BF3.MP.broadcast();});await flush();ok('guest receives locked thrust and human scale',await guest.evaluate(()=>__BF3.G.boss.fallState==='thrust'&&__BF3.G.boss.fallClock===.5&&__BF3.G.boss.h===58));
await guest.evaluate(()=>{const b=__BF3;b.G.boss.stunT=0;b.G.p.invuln=999;for(let i=0;i<60;i++)b.update(.016);});ok('guest cannot advance host attack',await guest.evaluate(()=>__BF3.G.boss.fallClock===.5&&__BF3.G.boss.fallSeq===1));
await page.evaluate(()=>{const b=__BF3;Object.assign(b.G.boss,{x:0,z:0,fallState:'strike',fallClock:.32,fallAttack:.32,fallX:0,fallZ:0,fallDX:0,fallDZ:1,fallKind:'sweep',fallSeq:10});b.MP.broadcast();});await flush();await guest.evaluate(()=>{const b=__BF3,p=b.G.p;Object.assign(p,{x:0,z:100,y:0,invuln:0,dodgeTimer:0,hp:10000});window.qaHP=p.hp;b.updateBoss(b.G.boss,.016,p,0,1,100,100);window.qaAfter=p.hp;});ok('guest detects shared sword hit locally',await guest.evaluate(()=>qaAfter<qaHP));await page.evaluate(()=>__BF3.MP.broadcast());await flush();await guest.evaluate(()=>{const b=__BF3;b.G.p.invuln=0;b.updateBoss(b.G.boss,.016,b.G.p,0,1,100,100);});ok('repeat snapshot cannot repeat damage',await guest.evaluate(()=>__BF3.G.p.hp===qaAfter));
await page.evaluate(()=>{const b=__BF3,e=b.G.boss;e.hp=0;b.killEnemy(e);b.MP.broadcast();});await flush();ok('death and release exit synchronized',await guest.evaluate(()=>__BF3.G.boss.dead&&!!__BF3.G.portal));ok('no reinforcement bodies on either peer',await page.evaluate(()=>__BF3.G.enemies.every(e=>e.type==='warden'))&&await guest.evaluate(()=>__BF3.G.enemies.every(e=>e.type==='warden')));return checks;
}finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];__BF3.openHub();});await context.close();}
}
