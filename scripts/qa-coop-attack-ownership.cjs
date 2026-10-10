async page=>{
 const checks=[],errors=[],ok=(name,yes)=>{if(!yes)throw Error(name);checks.push(name)},context=await page.context().browser().newContext(),guest=await context.newPage();
 try{
  for(const [i,p] of [page,guest].entries()){p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>window.requestAnimationFrame=()=>0);await p.goto('http://127.0.0.1:4331/3d/?mute=1');try{await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready,null,{timeout:15000,polling:100});}catch(err){throw Error('page '+i+' startup '+JSON.stringify(await p.evaluate(()=>({b:!!window.__BF3,hero:!!window.HERO3D,ready:window.HERO3D?.ready,body:document.body.innerText.slice(0,120)})))+' '+errors.join('|'));}await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.classUnlocked.warrior=true;b.meta.hubTutDone=true;b.openHub();window.qaPackets=[];});}
  await page.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<3;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();
  const reset=async(cls='warrior',z=80)=>{for(const p of [page,guest])await p.evaluate(({cls,z})=>{const b=__BF3;b.G.enemies=[];b.G.walls=[];b.G.doors=[];b.G.p.x=0;b.G.p.z=0;b.G.p.y=0;b.G.p.hp=b.effMaxHp(b.G.p);b.G.combo=0;b.G._desig=false;b.G.time+=1;const e=b.spawnEnemy('grunt',0,z,false);Object.assign(e,{mid:42,hp:1000,maxHp:1000,active:true});}, {cls,z});await guest.evaluate(cls=>{const b=__BF3;b.meta.classId=cls;b.meta.classUnlocked[cls]=true;b.classState(cls).rank=Math.max(1,b.classState(cls).rank);b.G.p.weapon=b.classStartWeapon(cls);b.G.p._mom=0;b.G.p._momT=null;b.G.p._swiftHits=0;b.G.p._loaded=true;b.G.p.mana=100;},cls);await flush();};
  const hit=async(dmg=100,el=null,designated=false)=>{await guest.evaluate(({dmg,el,designated})=>{const b=__BF3;b.G._desig=designated;b.hitEnemy(b.G.enemies[0],dmg,b.G.p,0,0,el);b.G._desig=false;},{dmg,el,designated});await flush();};

  await reset('warrior');await page.evaluate(()=>{const b=__BF3;b.meta.classId='warlock';b.G.enemies[0].warCurseT=5;});await hit(100,null,true);
  const isolated=await page.evaluate(()=>1000-__BF3.G.enemies[0].hp);await reset('warrior');await hit(100,null,true);const neutral=await page.evaluate(()=>1000-__BF3.G.enemies[0].hp);ok('host Warlock curse does not boost guest Warrior '+JSON.stringify({isolated,neutral}),Math.abs(isolated-neutral)<=2);

  await reset('ranger',400);await page.evaluate(()=>__BF3.meta.classId='warrior');await hit();const ranged=await page.evaluate(()=>1000-__BF3.G.enemies[0].hp);ok('guest Ranger spacing bonus survives host authority',ranged>115&&ranged<140);

  await reset('ranger');await guest.evaluate(()=>{const b=__BF3;b.G.p.yaw=0;b.SKILL_FX.mark(b.G.p,true,1);});await flush();ok('guest Ranger mark reaches host with owner',await page.evaluate(()=>__BF3.G.enemies[0].markT>0&&__BF3.G.enemies[0].markOwner==='g'));await hit(100,null,true);const marked=await page.evaluate(()=>1000-__BF3.G.enemies[0].hp);ok('guest Ranger benefits from own Hunter mark',marked>140);

  await reset('warlock');await guest.evaluate(()=>{const b=__BF3;b.SKILL_FX.war_curse(b.G.p,true,1);});await flush();ok('guest Warlock curse reaches host with owner',await page.evaluate(()=>__BF3.G.enemies[0].warCurseT>0&&__BF3.G.enemies[0].warCurseOwner==='g'));await hit(100,null,true);const cursed=await page.evaluate(()=>1000-__BF3.G.enemies[0].hp);ok('guest Warlock benefits from own curse',cursed>125);
  await reset('warlock');await page.evaluate(()=>{const e=__BF3.G.enemies[0];e.warCurseT=7;e.warCurseOwner='h';});await hit(100,null,true);const foreignCurse=await page.evaluate(()=>1000-__BF3.G.enemies[0].hp);ok('host-owned curse does not amplify guest Warlock',foreignCurse<cursed-10);
  await page.evaluate(()=>__BF3.MP.broadcast());await flush();ok('guest sees host-owned curse marker',await guest.evaluate(()=>__BF3.G.enemies[0].warCurseOwner==='h'));

  await reset('warrior');await hit();await hit();await hit();const stagger=await page.evaluate(()=>__BF3.G.enemies[0].stunT||0);ok('guest Warrior third hit staggers host enemy',stagger>=.79);

  await reset('mage');await guest.evaluate(()=>{const b=__BF3;b.G.p.weapon=b.makeWeapon('firestaff','common');b.G.p.mana=50;});await page.evaluate(()=>{const b=__BF3;b.G.p.weapon=b.makeWeapon('sword','common');b.G.enemies[0].st=null;b.G.enemies[0].stcd={};});await hit(100,'fire');const mage=await page.evaluate(()=>({burn:__BF3.G.enemies[0].st?.burn||0,hp:__BF3.G.enemies[0].hp}));ok('guest Mage element builds with guest staff speed',mage.burn>=1.2&&mage.hp<1000);await page.evaluate(()=>__BF3.MP.broadcast());await flush();ok('guest sees host-owned enemy status',await guest.evaluate(()=>(__BF3.G.enemies[0].st?.burn||0)>=1.2));
  ok('guest mirror cannot tick enemy DoT damage',await guest.evaluate(()=>{const b=__BF3,e=b.G.enemies[0],hp=e.hp;e.st.burn=5;e.stDmg=200;for(let i=0;i<90;i++)b.update(.016);return e.hp===hp;}));

  await reset('mage');await guest.evaluate(()=>{const b=__BF3;b.applyElement(b.G.enemies[0],'poison',35);});await flush();ok('guest direct skill status reaches host',await page.evaluate(()=>(__BF3.G.enemies[0].st?.venom||0)>0));

  await reset('mage');await guest.evaluate(()=>{const b=__BF3;b.classState('mage').rank=7;b.classState('mage').ch[7]='m_savant';b.G.p.weapon=b.makeWeapon('firestaff','common');b.G.p.mana=50;});await page.evaluate(()=>{const b=__BF3;Object.assign(b.G.enemies[0],{boss:true,shielded:true});});await hit();
  const wardedMage=await Promise.all([page.evaluate(()=>({hp:__BF3.G.enemies[0].hp,burn:__BF3.G.enemies[0].st?.burn||0})),guest.evaluate(()=>__BF3.G.p.mana)]);ok('warded guest Mage hit spends no mana or status',wardedMage[0].hp===1000&&wardedMage[0].burn===0&&wardedMage[1]===50);
  await page.evaluate(()=>__BF3.G.enemies[0].shielded=false);await guest.evaluate(()=>__BF3.G.time+=1);await hit();ok('accepted guest Mage Savant hit applies element',await page.evaluate(()=>(__BF3.G.enemies[0].st?.burn||0)>0));

  await reset('warlock');await guest.evaluate(()=>{const b=__BF3;b.G.p.hp=100;b.G.p._bloodOwed=0;});await page.evaluate(()=>Object.assign(__BF3.G.enemies[0],{boss:true,shielded:true}));await hit();ok('warded guest Warlock hit refunds blood price',await guest.evaluate(()=>__BF3.G.p.hp===100&&(__BF3.G.p._bloodOwed||0)===0));

  await reset('necromancer');await guest.evaluate(()=>{const b=__BF3;b.hitEnemy(b.G.enemies[0],100,{x:0,z:0,pet:true},0,0,null);});await flush();ok('guest companion hit changes host enemy health',await page.evaluate(()=>__BF3.G.enemies[0].hp<1000));
  await reset('mage');await guest.evaluate(()=>{const b=__BF3;b.hitEnemy(b.G.enemies[0],100,{x:0,z:0,projSrc:true},0,0,'arcane');});await flush();ok('guest projectile hit changes host enemy health',await page.evaluate(()=>__BF3.G.enemies[0].hp<1000));

  await reset('reaper');await guest.evaluate(()=>{const b=__BF3;b.SKILL_FX.deathmark(b.G.p,true,1);});await flush();ok('guest Death Mark reaches host',await page.evaluate(()=>__BF3.G.enemies[0].markOwner==='g'&&__BF3.G.enemies[0].markExplode>0));
  for(const p of [page,guest])await p.evaluate(()=>{const b=__BF3,e=b.spawnEnemy('grunt',60,80,false);Object.assign(e,{mid:43,hp:1000,maxHp:1000,active:true});});await page.evaluate(()=>__BF3.G.enemies[0].hp=50);await hit(1000,null,true);const burstHp=await page.evaluate(()=>__BF3.G.enemies.find(e=>e.mid===43).hp);ok('host owns Death Mark burst damage',burstHp<1000);await page.evaluate(()=>__BF3.MP.broadcast());await flush();await flush();ok('guest mirror does not duplicate Death Mark burst',await page.evaluate(hp=>__BF3.G.enemies.find(e=>e.mid===43).hp===hp,burstHp));

  await reset('reaper');await page.evaluate(()=>{const e=__BF3.G.enemies[0];e.st={burn:0,chill:0,venom:0,rune:2,radiance:0,corrupt:5};e.stDmg=30;e.primed=true;});await guest.evaluate(()=>__BF3.G.p.hp=20);await hit(100,'void',true);const reaction=await page.evaluate(()=>{const e=__BF3.G.enemies[0];return {hp:e.hp,rune:e.st?.rune,primed:e.primed}});ok('guest designated hit spends runes and ruptures on host',reaction.hp<840&&reaction.rune===0&&!reaction.primed);ok('guest receives confirmed rupture heal',await guest.evaluate(()=>__BF3.G.p.hp>20));

  if(errors.length)throw Error(JSON.stringify(errors));return {checks,isolated,ranged,stagger,mage,reaction,errors};
 }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];});await context.close();}
}
