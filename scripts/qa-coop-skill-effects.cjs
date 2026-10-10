async page=>{
 const checks=[],errors=[],ok=(name,yes,details)=>{if(!yes)throw Error(name+' '+JSON.stringify(details));checks.push(name);};
 const context=await page.context().browser().newContext(),guest=await context.newPage();
 try{
  for(const p of [page,guest]){
   p.on('pageerror',e=>errors.push(e.message));
   await p.addInitScript(()=>window.requestAnimationFrame=()=>0);
   await p.goto('http://127.0.0.1:4331/3d/?mute=1');
   await p.waitForFunction(()=>window.__BF3&&HERO3D?.ready&&typeof BFRiftHall!=='undefined',null,{timeout:15000,polling:100});
   await p.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.classId='warrior';b.meta.classUnlocked.warrior=true;b.meta.hubTutDone=true;b.openHub();window.qaPackets=[];});
  }
  await page.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=true;m.myId='h';m.conns=[];window.qaListeners={};m.wireGuest({open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d))),on:(k,f)=>qaListeners[k]=f});qaListeners.open();});
  await guest.evaluate(()=>{const m=__BF3.MP;m.active=true;m.isHost=false;m.myId='g';m.hostConn={open:true,send:d=>qaPackets.push(JSON.parse(JSON.stringify(d)))};});
  const flush=async()=>{for(let i=0;i<3;i++){for(const d of await guest.evaluate(()=>qaPackets.splice(0)))await page.evaluate(d=>qaListeners.data(d),d);for(const d of await page.evaluate(()=>qaPackets.splice(0)))await guest.evaluate(d=>__BF3.MP.onGuestData(d),d);}};
  await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'hello',p:__BF3.MP.selfState()})));await flush();
  const reset=async(cls='warrior',z=80)=>{
   for(const p of [page,guest])await p.evaluate(({z})=>{const b=__BF3;b.G.enemies=[];b.G.walls=[];b.G.doors=[];b.G.obstacles=[];b.MP._killed={};b.MP.kills=[];b.G.p.x=0;b.G.p.z=0;b.G.p.y=0;b.G.p.yaw=0;b.G.p.hp=b.effMaxHp(b.G.p);b.G.p.mana=100;b.G.time+=2;const e=b.spawnEnemy('grunt',0,z,false);Object.assign(e,{mid:42,hp:1000,maxHp:1000,active:true,dropT:0});},{z});
   await guest.evaluate(cls=>{const b=__BF3;b.meta.classId=cls;b.meta.classUnlocked[cls]=true;b.classState(cls).rank=10;b.G.p.weapon=b.classStartWeapon(cls);b.G.p.yaw=0;},cls);
   await page.evaluate(()=>{__BF3.meta.classId='warrior';__BF3.G.p.weapon=__BF3.classStartWeapon('warrior');});
   await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'pos',p:__BF3.MP.selfState()})));await flush();
  };
  const cast=async(name,...args)=>{await guest.evaluate(({name,args})=>{const b=__BF3;b.SKILL_FX[name](b.G.p,true,1,...args);},{name,args});await flush();};
  await reset('warrior');await cast('w_bash');let state=await page.evaluate(()=>({stun:__BF3.G.enemies[0].stunT,hp:__BF3.G.enemies[0].hp}));ok('guest bash stuns host enemy',state.stun>=1,state);
  await page.evaluate(()=>__BF3.MP.broadcast());await flush();ok('host stun reaches guest mirror',await guest.evaluate(()=>__BF3.G.enemies[0].stunT>=1));
  await reset('mage');await cast('m_nova');state=await page.evaluate(()=>({slow:__BF3.G.enemies[0].slowT,hp:__BF3.G.enemies[0].hp}));ok('guest nova slows and damages host enemy',state.slow>=2&&state.hp<1000,state);
  await reset('mage');await cast('frostchains');state=await page.evaluate(()=>({stun:__BF3.G.enemies[0].stunT,slow:__BF3.G.enemies[0].slowT}));ok('guest frost chains freeze host enemy',state.stun>=1.5&&state.slow>=3,state);
  await reset('warrior');await cast('bulwark');state=await page.evaluate(()=>({taunt:__BF3.G.enemies[0].tauntT,target:__BF3.enemyPartyTarget(__BF3.G.enemies[0],__BF3.G.p).id}));ok('guest bulwark redirects host enemy',state.taunt>3&&state.target==='g',state);
  await reset('warrior');await cast('w_berserk');ok('guest Warcry redirects host enemy',await page.evaluate(()=>__BF3.G.enemies[0].tauntId==='g'&&__BF3.G.enemies[0].tauntT>=5));
  await reset('beastmaster');await cast('bst_sic');state=await page.evaluate(()=>({stun:__BF3.G.enemies[0].stunT,hp:__BF3.G.enemies[0].hp}));ok('guest pet command stuns and damages host enemy',state.stun>=.6&&state.hp<1000,state);
  await reset('beastmaster');await cast('bst_coordinated');ok('guest pack mark is host-owned',await page.evaluate(()=>__BF3.G.enemies[0].beastMarkT>=5));
  await reset('beastmaster',520);await guest.evaluate(()=>{const b=__BF3;b.G.pet.x=0;b.G.pet.z=500;});await cast('bst_roar');state=await page.evaluate(()=>({slow:__BF3.G.enemies[0].slowT,petTaunt:__BF3.G.enemies[0].petTauntT}));ok('remote companion roar controls enemies near the pet',state.slow>=2&&state.petTaunt>=2,state);
  await page.evaluate(d=>qaListeners.data(d),await guest.evaluate(()=>({t:'pos',p:__BF3.MP.selfState()})));await flush();ok('host enemy targets guest companion after roar',await page.evaluate(()=>__BF3.enemyPartyTarget(__BF3.G.enemies[0],__BF3.G.p)===__BF3.MP.peers.g.pet));
  await reset('warrior');await guest.evaluate(()=>__BF3.MP.sendEnemyEffect(42,'beastRoar',0,{x:0,z:80}));await flush();ok('wrong class cannot submit companion control',await page.evaluate(()=>(__BF3.G.enemies[0].petTauntT||0)===0));
  await reset('beastmaster',820);await guest.evaluate(()=>__BF3.MP.sendEnemyEffect(42,'beastRoar',0,{x:0,z:810}));await flush();ok('remote companion control is bounded by player leash',await page.evaluate(()=>(__BF3.G.enemies[0].petTauntT||0)===0));
  await reset('reaper');for(const p of [page,guest])await p.evaluate(()=>{const b=__BF3,e=b.spawnEnemy('grunt',60,80,false);Object.assign(e,{mid:43,hp:1000,maxHp:1000,active:true,dropT:0});});await cast('x_bind');state=await page.evaluate(()=>__BF3.G.enemies.map(e=>({tether:e._tether,t:e._tetherT})));ok('guest Soul Tether links both host enemies',state[0].tether===state[1].tether&&state[0].t>=7,state);
  await guest.evaluate(()=>{const b=__BF3;b.hitEnemy(b.G.enemies[0],100,b.G.p,0,0,null);});await flush();ok('host shares tether damage to second enemy',await page.evaluate(()=>__BF3.G.enemies[1].hp<1000));
  await reset('stormcaller');for(const p of [page,guest])await p.evaluate(()=>{const b=__BF3,e=b.spawnEnemy('grunt',60,80,false);Object.assign(e,{mid:43,hp:1000,maxHp:1000,active:true,dropT:0});});await cast('st_storm');state=await page.evaluate(()=>__BF3.G.enemies.map(e=>e._tether));ok('guest Conduit links both host enemies',state[0]===state[1]&&state[0]?.startsWith('g:'),state);
  await reset('reaper');await cast('x_pull');state=await page.evaluate(()=>({stun:__BF3.G.enemies[0].stunT,pull:__BF3.G.enemies[0].hurtKbZ}));ok('guest Void Pull moves and stuns host enemy',state.stun>=.45&&state.pull<0,state);
  await reset('skylancer');await cast('sky_cyclone');state=await page.evaluate(()=>({y:__BF3.G.enemies[0].y,noLand:__BF3.G.enemies[0]._noLand}));ok('guest cyclone lifts host enemy',state.y>=80&&state.noLand>=3,state);
  await reset('bladedancer');await cast('bd_cross');ok('guest blade cross stuns host enemy',await page.evaluate(()=>__BF3.G.enemies[0].stunT>=.6));
  await reset('reaper');await page.evaluate(()=>__BF3.G.enemies[0].hp=200);await cast('execute');state=await page.evaluate(()=>({dead:__BF3.G.enemies[0].dead,kills:__BF3.MP.kills.filter(k=>k.m===42).length}));ok('host executes enemy below its own 25% threshold',state.dead&&state.kills>0,state);
  await page.evaluate(()=>__BF3.MP.broadcast());await flush();ok('guest sees host execution',await guest.evaluate(()=>__BF3.G.enemies[0].dead));
  await reset('reaper');await guest.evaluate(()=>__BF3.G.enemies[0].hp=100);await page.evaluate(()=>__BF3.G.enemies[0].hp=500);await cast('execute');state=await page.evaluate(()=>({dead:__BF3.G.enemies[0].dead,hp:__BF3.G.enemies[0].hp}));ok('guest mirror cannot execute when host health exceeds threshold',!state.dead&&state.hp<500,state);
  await reset('reaper');await cast('deathsdoor');state=await page.evaluate(()=>({timer:__BF3.G.enemies[0].doomT,dps:__BF3.G.enemies[0].doomDps}));ok('guest Death Door starts host timer',state.timer===4&&state.dps>0,state);
  await page.evaluate(()=>{const b=__BF3,e=b.G.enemies[0];e.doomAcc=.499;b.G.p.x=2000;b.G.p.z=2000;b.update(.02);});state=await page.evaluate(()=>({hp:__BF3.G.enemies[0].hp,timer:__BF3.G.enemies[0].doomT,acc:__BF3.G.enemies[0].doomAcc,dps:__BF3.G.enemies[0].doomDps,active:__BF3.G.enemies[0].active}));ok('host Death Door damages after guest stops updating',state.hp<1000&&state.timer<4,state);
  await page.evaluate(()=>__BF3.MP.broadcast());await flush();const doomMirror=await guest.evaluate(()=>({hp:__BF3.G.enemies[0].hp,timer:__BF3.G.enemies[0].doomT}));ok('guest sees host Death Door health and timer',doomMirror.hp===Math.round(state.hp)&&doomMirror.timer>0,doomMirror);
  await reset('warlock');await cast('war_final');state=await page.evaluate(()=>({timer:__BF3.G.enemies[0].warBurstT,damage:__BF3.G.enemies[0].warBurstDmg}));ok('guest Final Curse starts host burst',state.timer===1&&state.damage>0,state);
  await guest.evaluate(()=>{const b=__BF3;b.G.p.x=2000;b.G.p.z=2000;b.G.enemies[0].warBurstT=.004;b.update(.02);});ok('guest mirror cannot apply Final Curse damage',await guest.evaluate(()=>__BF3.G.enemies[0].hp===1000));
  await page.evaluate(()=>{const b=__BF3;b.G.p.x=2000;b.G.p.z=2000;b.G.enemies[0].warBurstT=.004;b.update(.02);});state=await page.evaluate(()=>({hp:__BF3.G.enemies[0].hp,damage:__BF3.G.enemies[0].warBurstDmg}));ok('host Final Curse resolves',state.hp<1000&&state.damage===0,state);
  await page.evaluate(()=>__BF3.update(.02));ok('host Final Curse only damages once',await page.evaluate(hp=>__BF3.G.enemies[0].hp===hp,state.hp));
  if(errors.length)throw Error(JSON.stringify(errors));return {checks,errors};
 }finally{await page.evaluate(()=>{__BF3.MP.active=false;__BF3.MP.conns=[];});await context.close();}
}
