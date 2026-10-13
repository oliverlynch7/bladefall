/* Local test-page payload. Loaded only by scripts/build-adventure-hud-qa.py, never by the game. */
(function(){
 const bar=document.createElement('section');bar.id='qaHUD';bar.style.cssText='position:fixed;z-index:999999;top:4px;left:370px;background:#102133;color:white;padding:6px;font:12px system-ui;max-width:530px';
 bar.innerHTML='<button id="qaSeed">Create pre-change save</button><button id="qaStart">Load saved hero</button><button id="qaRun">Run HUD checks</button><button id="qaScene">Show adventure scene</button><button id="qaNote">Read note</button><button id="qaGear">Collect gear</button><button id="qaKeys">Rebind controls</button><button id="qaHide">Hide test controls</button><a href=".qa-adventure.html?mute=1">Updated game</a><pre id="qaResult" style="white-space:pre-wrap;max-height:150px;overflow:auto">Loading game…</pre>';
 document.body.append(bar);const out=t=>document.getElementById('qaResult').textContent=typeof t==='string'?t:JSON.stringify(t,null,2);
 for(const [id,label]of [['qaChest','Test chest grants'],['qaFull','Show full bag'],['qaCosts','Test live mana costs'],['qaChoice','Test class confirmation'],['qaPrefs','Check saved preference'],['qaPet','Show companion'],['qaResetKeys','Restore controls']]){const button=document.createElement('button');button.id=id;button.textContent=label;bar.insertBefore(button,document.getElementById('qaResult'));}
 const wait=async()=>{while(!window.__BF3||!window.HERO3D?.ready)await new Promise(r=>setTimeout(r,50));await __BF3.briarReady;return __BF3;};
 const act=(id,fn)=>document.getElementById(id).onclick=async()=>{try{await fn(await wait());}catch(e){out('FAIL: '+e.stack);}};
 const snapshot=b=>({name:b.meta.heroName,gold:b.meta.gold,level:b.meta.hero?.level,xp:b.meta.hero?.xp,rank:b.classState('warrior').rank,classXP:b.classState('warrior').xp,gear:b.meta.stash.map(x=>(x.weapon||x.armor||x.trinket).name),trial:b.meta.trialsDone?.warrior});
 act('qaSeed',async b=>{
  b.loadMode('rl');b.meta.hubTutDone=true;b.meta.tutOff=true;b.meta.introV2Seen=true;b.meta.classId='warrior';b.startTrial('warrior');b.skipTrial();b.enterWaystation();
  b.meta.heroName='HUD Test Warden';b.meta.gold=654;b.G.p.level=8;b.G.p.xp=77;b.meta.hero=b.snapOf(b.G.p);b.classState('warrior').rank=7;b.classState('warrior').xp=123;b.meta.stash=[{armor:b.makeArmor('rare','chest')}];b.G.p.weapon=b.classStartWeapon('warrior');b.openPause();out({preChange:snapshot(b)});
 });
 act('qaStart',async b=>{b.loadMode('rl');const s=snapshot(b);if(s.name!=='HUD Test Warden'||s.gold!==654||s.level!==8||s.xp!==77||s.rank!==7||s.classXP!==123||s.gear.length!==1||!s.trial)throw Error('Pre-change save mismatch '+JSON.stringify(s));if(b.meta.autoSellEquipment!==false)throw Error('Old saves must default auto-sell off');b.enterWaystation();out({oldSavePreserved:s,autoSell:b.meta.autoSellEquipment});});
 async function scene(b){b.loadMode('rl');Object.assign(b.meta,{hubTutDone:true,tutOff:true,introV2Seen:true,classId:'warrior',camMode:'far',autoAttack:false});b.cheatRank10All();b.enterZone(0,0);b.G.enemies.forEach(e=>e.stunT=99999);b.G.npc=null;Object.assign(b.G.p,{x:-90,z:-1610,y:0,invuln:99999});b.G.camYaw=Math.PI;b.G.p.hp=b.effMaxHp(b.G.p);b.queueSub=false;b.G.p.mana=b.G.p.maxMana;b.hudUpdate();b.skillbarUpdate();}
 act('qaScene',async b=>{await scene(b);out('Scene ready');});
 act('qaNote',b=>{BFJournalNotice.push({id:'qa-note',kind:'New clue · Mill crossing',title:'Millkeeper’s note',text:'The sluice shuts when the plate is empty. Leave the grain crate on it to keep the water flowing. Then clear the jam at the wheel.'});out('Paper clue opened');});
 act('qaGear',b=>{b.meta.stash=[];b.setAutoSell(false);b.offerWeapon(b.makeWeapon('sword','uncommon'));out('Equipment collected');});
 act('qaKeys',b=>{b.openKeybinds(()=>{});out('Controls opened');});
 act('qaHide',()=>{bar.hidden=true;});
 act('qaFull',b=>{b.meta.stash=Array.from({length:30},()=>({armor:b.makeArmor('common','chest')}));b.setAutoSell(false);b.hudUpdate();out('Full bag; Auto-sell OFF');});
 act('qaPet',b=>{b.meta.petActive='shepherd';b.meta.petOwned=['shepherd'];b.spawnPet();b.hudUpdate();out('Companion shown');});
 act('qaResetKeys',b=>{b.meta.keybinds=b.defaultKeybinds();b.rebuildKeyLookup();b.skillbarUpdate();out('Default controls restored');});
 act('qaPrefs',b=>{b.loadMode('rl');out({autoSell:b.meta.autoSellEquipment,keyboard:b.meta.keybinds.skill1});});
 act('qaChoice',b=>{b.meta.keybinds.interact=['KeyF'];b.rebuildKeyLookup();b.openClassChoice(2);out('Select a skill, then Esc cancels or F confirms.');});
 act('qaCosts',async b=>{
  await scene(b);b.meta.classId='mage';const ch=b.c2ch();ch[3]='m_glass';b.G.p.hp=b.effMaxHp(b.G.p);b.skillbarUpdate();const before=+document.getElementById('bSk0').dataset.m;
  b.G.p.hp=b.effMaxHp(b.G.p)*.2;b.hudUpdate();const after=+document.getElementById('bSk0').dataset.m;
  if(after>=before||after!==b.skillManaCost(0))throw Error('Live cost did not respond to mage passive');
  const classes=[];for(const id of Object.keys(b.CLASSES)){b.meta.classId=id;b.skillbarUpdate();const s=b.c2CurSkills();if(s.some((v,i)=>+document.getElementById('bSk'+i).dataset.m!==b.skillManaCost(i,v)))throw Error('Mana mismatch '+id);classes.push(id);}
  b.meta.classId='warrior';b.G.p.hp=b.effMaxHp(b.G.p);b.hudUpdate();b.skillbarUpdate();out({liveMana:{before,after},classes});
 });
 act('qaChest',async b=>{
  await scene(b);BFChestReveal.clear();b.setAutoSell(false);const a=b.makeArmor('common','chest');b.meta.stash=Array.from({length:30},()=>({armor:{...a}}));
  const ch={x:b.G.p.x+120,z:b.G.p.z,y:0,rarity:'rare',opened:false};b.G.chests.push(ch);const record=b.prepareChest(ch),gold=b.meta.gold;b.openChest(ch);
  if(ch.opened||record.claimed||b.meta.gold!==gold||b.meta.stash.length!==30)throw Error('Full chest was consumed');
  b.meta.stash.pop();b.openChest(ch);if(!ch.opened||!record.claimed||b.meta.stash.length!==30)throw Error('Free slot failed to claim same chest');const g=b.meta.gold;b.openChest(ch);if(b.meta.gold!==g||b.meta.stash.length!==30)throw Error('Duplicate chest reward');
  BFChestReveal.clear();b.setAutoSell(true);const sell={...ch,x:ch.x+80,opened:false};delete sell.loot;delete sell.chestRecord;delete sell.reward;const record2=b.prepareChest(sell);b.G.chests.push(sell);const before=b.meta.gold;b.openChest(sell);if(!sell.opened||b.meta.gold<=before||b.meta.stash.length!==30)throw Error('Explicit chest auto-sale failed');
  out({chest:'Full bag preserves unopened chest; freeing slot grants once; ON sells and keeps capacity',record2});
 });
 act('qaRun',async b=>{
  const checks=[];const check=(name,yes)=>{if(!yes)throw Error(name);checks.push(name);out(checks);};
  await scene(b);b.meta.autoSellEquipment=false;b.meta.stash=[];
  const w=b.makeWeapon('sword','rare'),a=b.makeArmor('uncommon','chest'),t=b.makeTrinket('rare','amulet');
  b.meta.stash=Array.from({length:30},()=>({armor:{...a}}));const gold=b.meta.gold;
  check('Full bag OFF rejects ground weapon',b.offerWeapon(w)===false&&b.meta.stash.length===30&&b.meta.gold===gold);
  check('Full bag OFF rejects armor and jewelry',b.offerArmor(a)===false&&b.offerTrinket(t)===false&&b.meta.gold===gold);
  b.meta.stash.pop();check('Last free slot keeps item',b.offerWeapon(w)===true&&b.meta.stash.length===30&&b.meta.stash.at(-1).weapon===w);
  b.setAutoSell(true);const g=b.meta.gold;check('Explicit ON sells full-bag gear once',b.offerArmor(a)===true&&b.meta.gold>g&&b.meta.stash.length===30);
  b.meta.stash=[];const g2=b.meta.gold;check('ON sells gear even with empty slots',b.offerTrinket(t)===true&&b.meta.gold>g2&&b.meta.stash.length===0);
  b.setAutoSell(false);b.meta.stash=Array.from({length:30},()=>({armor:{...a}}));
  // Exercise the actual collision collection loop, not just the grant helper.
  const pk={x:b.G.p.x,z:b.G.p.z,y0:b.G.p.y,weapon:{...w},bob:0};b.G.pickups=[pk];b.G.chests=[];
  for(let i=0;i<10;i++)b.update(.016);check('Collision loop leaves full-bag pickup intact',b.G.pickups.includes(pk)&&!pk.taken);
  b.meta.stash.pop();for(let i=0;i<10;i++)b.update(.016);check('Freeing a slot collects same ground item',!b.G.pickups.includes(pk)&&b.meta.stash.length===30);
  b.meta.keybinds=b.defaultKeybinds();b.meta.keybinds.skill1=['KeyU'];b.meta.keybinds.attack=['KeyH'];b.meta.keybinds.dodge=['KeyC'];b.meta.keybinds.bag=['','KeyP'];b.meta.keybinds.journal=['KeyO'];b.meta.keybinds.interact=['KeyF'];b.meta.keybinds.lootEquip=[];b.rebuildKeyLookup();b.skillbarUpdate();b.hudUpdate();
  check('Rebound skill, attack, dodge captions',document.getElementById('bSk0').dataset.n==='U'&&document.getElementById('bLMB').dataset.k==='H'&&document.getElementById('bSpace').dataset.k==='C');
  check('Secondary-only bag and journal labels',document.querySelector('[data-action-hint=bag]').textContent==='P'&&document.querySelector('[data-action-hint=journal]').textContent==='O');
  const skills=b.c2CurSkills();check('All displayed mana costs match actual skill costs',skills.every((s,i)=>Number(document.getElementById('bSk'+i).dataset.m)===b.skillManaCost(i,s)));
  b.meta.keybinds.skill1=[];b.rebuildKeyLookup();check('Unbound action never displays its default',document.getElementById('bSk0').dataset.n==='—'&&b.controlHint('skill1')==='Unassigned');
  b.meta.controller={bindings:{skill1:5,attack:2,dodge:1,bag:8,journal:10,interact:3},labels:'xbox'};BFController.setup(b.meta,()=>{});b.hudDevice('controller');check('Controller rebind displayed on hotbar',document.getElementById('bSk0').dataset.n==='RB'&&document.getElementById('bSpace').dataset.k==='B');
  b.meta.controller.labels='ps';b.hudDevice('keyboard');b.hudDevice('controller');check('PlayStation labels respect mapping',document.getElementById('bSk0').dataset.n==='R1');
  b.hudDevice('keyboard');b.meta.keybinds=b.defaultKeybinds();b.rebuildKeyLookup();b.meta.stash=[];b.setAutoSell(false);b.offerWeapon(w);b.hudUpdate();b.skillbarUpdate();
  out({passed:checks});
 });
 wait().then(()=>out('Game ready · use pre-change page to create fixture, then load it in updated game.'));
})();
