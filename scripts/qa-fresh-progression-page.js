/* Visible localhost-only controls. Staged positions; real attacks, health and rewards. */
(()=>{'use strict';
if(!['127.0.0.1','localhost'].includes(location.hostname))return;
const results={},errors=[],wait=ms=>new Promise(r=>setTimeout(r,ms));
addEventListener('error',e=>errors.push(e.message));
const panel=document.createElement('section');panel.id='progressQA';panel.style.cssText='position:fixed;z-index:999999;right:8px;bottom:8px;background:#142836;color:white;padding:10px;font:12px system-ui;max-width:480px';
panel.innerHTML='<label>Starter <select id="progressClass"><option>warrior</option><option>ranger</option><option>mage</option></select></label><div id="progressButtons"></div><pre id="progressResult" style="max-height:150px;overflow:auto;white-space:pre-wrap">Ready</pre><textarea id="progressEvidence" aria-label="Progression evidence" style="width:100%;height:25px"></textarea>';document.body.append(panel);
const out=v=>document.getElementById('progressResult').textContent=typeof v==='string'?v:JSON.stringify(v,null,2);
const write=()=>document.getElementById('progressEvidence').value=JSON.stringify({...results,errors});
const pump=(b,n=1)=>{for(let i=0;i<n;i++)b.update(1/60);};
async function until(fn){const end=Date.now()+25000;while(!fn()){if(Date.now()>end)throw Error('Timeout '+fn);await wait(50);}}
function button(name,fn){const e=document.createElement('button');e.textContent=name;e.onclick=async()=>{panel.querySelectorAll('button,select').forEach(x=>x.disabled=true);out('Running '+name);try{out(await fn());}catch(err){out('FAIL '+err.stack);results[name]={error:err.message};}finally{write();panel.querySelectorAll('button,select').forEach(x=>x.disabled=false);}};document.getElementById('progressButtons').append(e);}
function check(name,ok){if(!ok)throw Error(name);}
const hero=b=>({level:b.G.p.level,xp:b.G.p.xp,xpNext:b.G.p.xpNext,hp:b.G.p.hp,maxHp:b.effMaxHp(b.G.p),classId:b.meta.classId,rank:b.classState(b.meta.classId).rank,classXp:b.classState(b.meta.classId).xp,choices:{...b.c2ch()},weapon:b.G.p.weapon.name,gold:b.meta.gold,kills:b.G.trialKills});
async function fresh(cid=document.getElementById('progressClass').value){
 await until(()=>window.__BF3);const b=__BF3;await b.briarReady;BFGuidedTutorial.stop();document.getElementById('deathfade')?.remove();
 if(document.body.classList.contains('t-attract'))dispatchEvent(new PointerEvent('pointerdown'));
 b.MP.active=false;b.MP.peers={};b.MP.conns=[];b.loadMode('rl');
 Object.assign(b.meta,{hero:null,run:null,bank:null,classId:cid,classUnlocked:{},classes:{},trialsDone:{},gold:0,perks:{},stash:[],petActive:null,story:null,campaign:null,zoneSeen:{},tut:{},tutSeen:{},tutOff:true,hubTutDone:true,introSeen:true,introV2Seen:true,autoAttack:false,autoSellEquipment:false,camMode:'far',socks:false,selectedSkin:'knight'});
 b.meta.keybinds=b.defaultKeybinds();b.rebuildKeyLookup();b.startTrial(cid);document.getElementById('tutGo')?.click();BFGuidedTutorial.stop();await until(()=>!window.BF_LOADING?.active);
 return b;
}
async function pick(b){await wait(420);const opt=document.querySelector('.c2opt');if(opt){opt.click();await wait(420);document.getElementById('classChoiceConfirm').click();}if(document.querySelector('.skilltut')){await wait(420);document.getElementById('tutGo').click();BFGuidedTutorial.stop();}}
function place(b,e,d){const p=b.G.p;let spot=null;for(const distance of [d,d*.8,d*.6]){for(let i=0;i<16;i++){const a=i*Math.PI/8,x=e.x+Math.sin(a)*distance,z=e.z+Math.cos(a)*distance,y=b.floorAt(x,z,p.r,e.y+15);if(!Number.isFinite(y)||Math.abs(y-e.y)>(e.kind==='fly'?150:25))continue;const q={x,y,z};b.resolveObstacles(q,p.r,null,0);if(Math.hypot(q.x-x,q.z-z)>1)continue;spot={x,y,z};break;}if(spot)break;}check('Supported combat position',spot);Object.assign(p,{...spot,vx:0,vy:0,vz:0,onGround:true,yaw:Math.atan2(e.x-spot.x,e.z-spot.z)});b.G.camYaw=p.yaw;Object.assign(b.G.cam,spot);delete b.G._cameraBoom;}
button('Start fresh tutorial',async()=>{const b=await fresh();results.start=hero(b);return results.start;});
button('Fight six tutorial foes',async()=>{
 const b=await fresh(),G=b.G,p=G.p,rows=[];results.tutorial=rows;
 const foes=G.enemies.filter(e=>!e.boss);const saved=foes.map(e=>({e,x:e.x,y:e.y,z:e.z}));
 // Test one authored foe at a time. Do not park others in the void: that grants false kill credit.
 for(let i=0;i<6;i++){
  const {e,x,y,z}=saved[i];G.enemies=[e];Object.assign(e,{x,z,y,sx:x,sz:z,active:true,dropT:0});const floor=b.enemySupport(e);if(e.kind!=='fly'&&Number.isFinite(floor))e.y=floor;
  results.combatPlacement={type:e.type,x:e.x,y:e.y,z:e.z,floor:b.floorAt(e.x,e.z,e.r,e.y+15),platforms:G.platforms?.length};write();place(b,e,p.weapon.cls==='melee'?e.r+p.r+8:200);const before=hero(b),enemyHp=e.hp;let steps=0,attacks=0,skills=0;
  while(!e.dead&&steps<1800&&p.hp>0){
   if(b.mode==='upgrade'){await pick(b);continue;}
   if(b.mode!=='play')break;
   p.yaw=Math.atan2(e.x-p.x,e.z-p.z);
   if(p.atkCd<=0){b.playerAttack();attacks++;}
   if(i>=3&&b.c2CurSkills()[0]&&p.skillCd[0]<=0){b.useSkill(0);skills++;}
   pump(b,6);steps+=6;if(steps%120===0)await wait(1);
  }
  const row={n:i+1,type:e.type,enemyHp,before,after:hero(b),dead:e.dead,attacks,skills,seconds:steps/60,mode:b.mode};rows.push(row);write();check('Tutorial foe '+(i+1)+' defeated without inflated stats',e.dead&&p.hp>0);
  if(b.mode==='upgrade')await pick(b);
 }
 check('Third kill unlocks rank 2',rows[0].after.rank===1&&rows[1].after.rank===1&&rows[2].after.rank===2);
 check('Tutorial has an exit',!!G.portal);results.tutorialEnd=hero(b);b.trialComplete();document.getElementById('hubBtn').click();await until(()=>!window.BF_LOADING?.active);results.hub=hero(b);b.autosaveRun();
 return {rows:rows.map(r=>({n:r.n,rank:r.after.rank,hp:r.after.hp,attacks:r.attacks,skills:r.skills,seconds:r.seconds})),hub:results.hub};
});
button('Check interrupted choice',async()=>{
 const b=await fresh();b.skipTrial();await until(()=>!window.BF_LOADING?.active);b.enterZone(0);await until(()=>!window.BF_LOADING?.active);
 b.gainClassXp(b.RANK_XP(1));pump(b,2);check('Rank choice offered',!!document.querySelector('.classpick'));
 results.interruptedBefore=hero(b);b.autosaveRun();results.legacy=JSON.parse(JSON.stringify(b.meta));b.loadMode('rl');b.continueRun();await until(()=>!window.BF_LOADING?.active);pump(b,3);
 results.interruptedAfter={...hero(b),mode:b.mode,choiceVisible:b.mode==='upgrade'&&!!document.querySelector('.classpick'),skillTitle:document.getElementById('bSk0').title};return results.interruptedAfter;
});
button('Check stale choice across classes',async()=>{
 const b=await fresh('warrior');b.skipTrial();await until(()=>!window.BF_LOADING?.active);b.gainClassXp(b.RANK_XP(1));
 // A transition may happen before the queued prompt is presented.
 b.startTrial('mage');await until(()=>!window.BF_LOADING?.active);pump(b,2);
 results.stale={...hero(b),mode:b.mode,choiceVisible:!!document.querySelector('.classpick'),heading:document.querySelector('.pickcrest')?.textContent};return results.stale;
});
button('Check multi-rank skill lesson',async()=>{
 const b=await fresh();b.skipTrial();await until(()=>!window.BF_LOADING?.active);b.gainClassXp(b.RANK_XP(1)+b.RANK_XP(2));pump(b,2);await pick(b);await pick(b);
 results.multiRank={...hero(b),taught:!!b.meta.tut?.skill,mode:b.mode,lesson:!!document.querySelector('.skilltut')};return results.multiRank;
});
window.progressQA={results,errors,wait,until,pump,fresh,pick,place,button,hero,out,write,panel,check};
button('Read loading diagnostics',()=>({game:!!window.__BF3,hero:window.HERO3D?{ready:HERO3D.ready,error:HERO3D.err}:null,loading:window.BF_LOADING?.active,errors}));
button('Load previous-version save',async()=>{const b=await fresh();Object.assign(b.meta,window.progressLegacy);b.persist();b.loadMode('rl');b.continueRun();await until(()=>!window.BF_LOADING?.active);pump(b,2);results.legacyLoaded={...hero(b),mode:b.mode,choiceVisible:b.mode==='upgrade'&&!!document.querySelector('.classpick')};check('Previous save resumes earned choice',results.legacyLoaded.choiceVisible&&b.classState('warrior').rank===2);return results.legacyLoaded;});
button('Check healthy checkpoint resources',async()=>{
 const b=await fresh('warrior');b.skipTrial();await until(()=>!window.BF_LOADING?.active);let p=b.G.p;p.allocation={health:4,attack:3,defense:3,speed:0,mana:0};p.gear.chest=b.makeArmor('common','chest','vigor');b.recomputeArmor(p);p.hp=b.effMaxHp(p);b.meta.hero=b.snapOf(p);b.enterZone(0);await until(()=>!window.BF_LOADING?.active);p=b.G.p;
 p.gear.ring=b.makeTrinket('common','ring','vigor');b.recomputeArmor(p);p.hp=15;b.gainXp(240);b.autosaveRun();
 const expected=b.effMaxHp(b.freshFromSnapshot(b.meta.run.checkpoint.state.hero));results.healthBefore={...hero(b),expected,unsecuredMax:b.effMaxHp(p)};
 b.continueRun();await until(()=>!window.BF_LOADING?.active);pump(b,1);results.healthAfter={...hero(b),ring:b.G.p.gear.ring};check('Full earned health on retry',Math.abs(b.G.p.hp-b.effMaxHp(b.G.p))<.01&&Math.abs(b.G.p.hp-expected)<.01);check('Unsecured gear is not smuggled into checkpoint',!b.G.p.gear.ring);return {before:results.healthBefore,after:results.healthAfter};
});
button('Check menus retain focus',async()=>{const b=await fresh();b.skipTrial();await until(()=>!window.BF_LOADING?.active);pump(b,1);b.gainClassXp(b.RANK_XP(1));b.openPause();pump(b,45);results.menuFocus={mode:b.mode,rank:b.classState(b.meta.classId).rank,choiceVisible:b.mode==='upgrade'&&!!document.querySelector('.classpick')};check('Rank prompt waits until the menu closes',b.mode==='pause');return results.menuFocus;});
button('Check ordinary campaign combat',async()=>{
 const cls=document.getElementById('progressClass').value,rows=[];results.campaign=rows;
 for(let z=0;z<8;z++){
  const b=await fresh(cls);b.skipTrial();await until(()=>!window.BF_LOADING?.active);const p=b.G.p,level=2+z*3;
  for(let i=1;i<level;i++)b.autoLevelGrow(p);p.level=level;p.xpNext=135+level*90+level*level*5;p.allocation={health:3,attack:3,defense:2,speed:1,mana:1};
  const rarity=level<6?'common':level<14?'uncommon':'rare';p.weapon=b.makeWeapon({warrior:'sword',ranger:'bow',mage:'firestaff'}[cls],rarity);p.gear.chest=b.makeArmor(rarity,'chest','balanced');b.recomputeArmor(p);b.meta.hero=b.snapOf(p);b.enterZone(z);await until(()=>!window.BF_LOADING?.active);b.G.stageBanner=0;
  let e=null;for(const candidate of b.G.enemies.filter(e=>!e.boss&&!e.dead&&!e.crackWall&&!e.dummy&&!e.practice&&e.role!=='exploder'))try{place(b,candidate,180);e=candidate;break;}catch(_){}
  check('A reachable ordinary enemy in region '+z,e);b.G.enemies=[e];e.active=true;e.dropT=0;
  const before=hero(b),enemyBefore=e.hp;let frames=0;while(b.G.p.hp>=before.hp&&frames<1200&&!e.dead&&b.mode==='play'){pump(b,6);frames+=6;if(frames%120===0)await wait(1);}
  const incoming=before.hp-b.G.p.hp;let hit=false,attacks=0;for(let n=0;n<600&&!e.dead&&b.G.p.hp>0&&b.mode==='play';n+=6){
   if(b.G.p.atkCd<=0){place(b,e,b.G.p.weapon.cls==='melee'?e.r+b.G.p.r+5:180);b.playerAttack();attacks++;}
   pump(b,6);if(e.hp<enemyBefore||e.dead){hit=true;break;}if(n%120===0)await wait(1);
  }
  const row={zone:z,classId:cls,type:e.type,label:e.label,role:e.role||null,level,rarity,enemyHp:enemyBefore,heroHp:before.hp,incoming,secondsToHit:frames/60,outgoing:enemyBefore-e.hp,hit,attacks,mode:b.mode};rows.push(row);write();
 }
 return rows;
});
button('Watch Brute entry',async()=>{const b=await fresh('warrior');b.skipTrial();await until(()=>!window.BF_LOADING?.active);b.enterZone(0);b.G.area=-1;b.loadArea();await until(()=>!window.BF_LOADING?.active);b.G.stageBanner=0;place(b,b.G.boss,280);b.G.p.yaw=b.G.camYaw=Math.atan2(b.G.boss.x-b.G.p.x,b.G.boss.z-b.G.p.z);pump(b,3);b.render(1);panel.hidden=true;setTimeout(()=>panel.hidden=false,6500);results.bossEntry={note:b.G.storyState.notes['encounter.outskirts'],storyCentered:document.getElementById('storycard').classList.contains('show'),toastCentered:document.getElementById('toast').classList.contains('show')};return results.bossEntry;});
button('Hide test controls',()=>{panel.hidden=true;return 'Reload this test page to restore controls.';});
})();
