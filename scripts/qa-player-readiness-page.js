/* Local isolated integration controls; no test mutation is shipped with the game. */
progressQA.button('Verify rewards, party scaling and save lifecycle',async()=>{
 const {fresh,until,check,results,write}=progressQA,b=await fresh('warrior'),rows=[];b.skipTrial();await until(()=>!BF_LOADING.active);b.enterZone(0);await until(()=>!BF_LOADING.active);
 const classTotal=()=>{const cs=b.classState('warrior');let n=cs.xp;for(let i=1;i<cs.rank;i++)n+=b.RANK_XP(i);return n;};
 for(const zone of [0,1,3,5,7]){
  b.MP.active=false;b.openHub();b.enterZone(zone);await until(()=>!BF_LOADING.active);b.G.enemies=[];
  b.G.p.xp=0;b.G.p.xpNext=1000000;b.meta.gold=0;b.meta.classes.warrior={rank:1,xp:0,v2:1,ch:{}};
  const e=b.spawnEnemy('grunt',b.G.p.x+100,b.G.p.z);e.hp=0;const base=e.xp;b.killEnemy(e,false);
  const host={xp:b.G.p.xp,classXp:classTotal(),gold:b.meta.gold},saved=JSON.parse(localStorage.getItem(b.MKEY('rl')));
  check('Kill gold is saved immediately at '+zone,saved.gold===host.gold);
  b.G.enemies=[];b.G.p.xp=0;b.meta.gold=0;b.meta.classes.warrior={rank:1,xp:0,v2:1,ch:{}};
  Object.assign(b.MP,{active:true,isHost:false,zone,myId:'g',_killed:{},_gotEn:false,peers:{},conns:[]});
  const packet=[[900000+zone,b.MP.typeIdx('grunt'),0,0,base]];b.MP.applyEnemies([],packet);
  const guest={xp:b.G.p.xp,classXp:classTotal(),gold:b.meta.gold};check('Absent enemy payout equals host '+zone,JSON.stringify(host)===JSON.stringify(guest));
  b.MP.applyEnemies([],packet);check('Repeated kill packet is free '+zone,guest.xp===b.G.p.xp&&guest.gold===b.meta.gold);rows.push({zone,base,host,guest});
 }
 b.MP.active=false;b.openHub();b.enterZone(0);await until(()=>!BF_LOADING.active);b.G.enemies=[];
 const e=b.spawnEnemy('grunt',b.G.p.x+100,b.G.p.z),initial=e.maxHp;e.hp=initial*.6;
 Object.assign(b.MP,{active:true,isHost:true,myId:'h',zone:0,conns:[],peers:{g:{id:'g',zone:0,area:0,last:0,hp:100}}});
 b.syncCampaignPartyHealth();const increased=e.maxHp;check('Same-area ally increases health reasonably',increased>initial&&increased<initial*2);check('Join keeps damage fraction',Math.abs(e.hp/e.maxHp-.6)<.001);
 b.MP.peers.g.area=1;b.syncCampaignPartyHealth();check('Other-half ally does not inflate fight',e.maxHp===initial);
 b.MP.peers.g.area=0;b.MP.peers.g.last=4;b.syncCampaignPartyHealth();check('Stale ally does not inflate fight',e.maxHp===initial);
 b.MP.active=false;
 const level=b.G.p.level,xp=b.G.p.xp;b.gainXp(Infinity);b.gainXp(NaN);b.gainClassXp(Infinity);check('Bad XP cannot poison a save',b.G.p.level===level&&b.G.p.xp===xp&&Number.isFinite(b.classState('warrior').xp));
 b.G.enemies=[];b.G.p.hp=b.effMaxHp(b.G.p);const hp=b.G.p.hp;b.openBag(()=>{});b.hurtPlayer(99,0,0);check('Bag blocks damage',b.G.p.hp===hp);
 b.openHub();await until(()=>!BF_LOADING.active);b.enterZone(0);await until(()=>!BF_LOADING.active);b.G.enemies=[];
 const start=b.meta.gold;b.gainXp(180);const gold=b.addGold(77);b.autosaveRun();const before={level:b.G.p.level,xp:b.G.p.xp,gold:b.meta.gold,rank:b.classState('warrior').rank};
 b.openHub();await until(()=>!BF_LOADING.active);check('Hub fully heals resources',b.G.p.hp===b.effMaxHp(b.G.p)&&b.G.p.mana===b.G.p.maxMana);
 check('Hub keeps earned XP and gold',b.meta.gold===before.gold&&b.G.p.level===before.level&&b.G.p.xp===before.xp);
 b.loadMode('rl');b.resumeSavedAdventure();await until(()=>!BF_LOADING.active);
 check('Reload keeps earned XP and gold',b.meta.gold===before.gold&&b.G.p.level===before.level&&b.G.p.xp===before.xp);
 results.integration={status:'PASS',rows,party:{solo:initial,duo:increased},save:before,notes:'Actual handlers and serialized in-memory storage; simulated packets, not Internet transport.'};write();return results.integration;
});
progressQA.button('Verify all starter completions and legacy save',async()=>{
 const {fresh,until,check,results,write}=progressQA,rows=[];
 for(const cid of ['warrior','ranger','mage']){
  const b=await fresh(cid);b.G.trialKills=6;b.trialComplete();
  check('Starter completion stored '+cid,b.meta.trialsDone[cid]&&b.meta.classUnlocked[cid]);
  b.openHub();await until(()=>!BF_LOADING.active);const before={cid,level:b.G.p.level,gold:b.meta.gold};
  b.loadMode('rl');b.resumeSavedAdventure();await until(()=>!BF_LOADING.active);
  check('Starter loads hub without reselecting class '+cid,b.G.hub&&b.meta.classId===cid&&b.meta.trialsDone[cid]);rows.push(before);
 }
 const b=__BF3;b.MP.active=false;
 for(const [key,value]of window.readinessLegacyStorage)localStorage.setItem(key,value);
 b.loadMode('rl');b.meta.originSeen=true;b.meta.hubTutDone=true;b.resumeSavedAdventure();await until(()=>!BF_LOADING.active);
 const legacy={level:b.G.p.level,gold:b.meta.gold,hp:b.G.p.hp,maxHp:b.effMaxHp(b.G.p),classId:b.meta.classId};check('Legacy hero survives',legacy.level===100&&legacy.gold===1145&&Number.isFinite(legacy.hp));
 results.starters={status:'PASS',rows,legacy,scope:'Staged completion through real handlers and actual save/load, not natural six-kill playthrough.'};write();return results.starters;
});
progressQA.button('Review illustrated first arrival',async()=>{
 const b=__BF3;await b.briarReady;b.MP.active=false;b.loadMode('rl');b.meta.originSeen=false;b.meta.hubTutDone=false;b.openHub();return 'Inspect the five story slides, enter the Waystation, then use Advance review world if this tab is in the background.';
});
progressQA.button('Advance review world',async()=>{for(let i=0;i<150;i++){__BF3.update(1/60);__BF3.render(1);await progressQA.wait(10);}return {mode:__BF3.mode,hub:__BF3.G.hub,loading:BF_LOADING.active};});
