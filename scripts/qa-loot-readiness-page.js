/* Visible localhost-only fixtures. Drive the shop/bag through their actual UI after setup. */
(()=>{'use strict';if(!['localhost','127.0.0.1'].includes(location.hostname))return;
 const results={},errors=[],wait=ms=>new Promise(r=>setTimeout(r,ms));addEventListener('error',e=>errors.push(e.message));
 const panel=document.createElement('section');panel.id='lootQA';panel.style.cssText='position:fixed;z-index:999999;right:8px;bottom:8px;max-width:420px;background:#102631;color:#fff;padding:10px;font:12px system-ui';
 panel.innerHTML='<details id="lootQADetails" open><summary>Local loot verification</summary><div id="lootQABtns"></div><pre id="lootQAOut" style="max-height:120px;overflow:auto;white-space:pre-wrap">Ready</pre><textarea aria-label="Loot verification evidence" id="lootQAEvidence" style="width:100%;height:30px"></textarea></details>';document.body.append(panel);
 const report=v=>{document.getElementById('lootQAOut').textContent=JSON.stringify(v,null,2);document.getElementById('lootQAEvidence').value=JSON.stringify({...results,errors});};
 const until=async f=>{const end=Date.now()+30000;while(!f()){if(Date.now()>end)throw Error('Timed out waiting for game');await wait(50);}};
 const state=()=>{const b=__BF3;return {version:document.getElementById('ver')?.textContent,mode:b.mode,bag:b.meta.stash.map(it=>({kind:it.weapon?'weapon':it.armor?'armor':'trinket',name:(it.weapon||it.armor||it.trinket).name})),gold:b.meta.gold,liveWeapon:b.G?.p.weapon.name,savedWeapon:b.meta.hero?.weapon.name,pickups:b.G?.pickups.map(pk=>({name:(pk.weapon||pk.armor||pk.trinket||pk.questItem)?.name,taken:pk.taken})),notice:document.querySelector('#equipmentFeed .loot-outcome')?.textContent,noticeName:document.querySelector('#equipmentFeed .loot-name')?.textContent,noticeHidden:document.getElementById('equipmentFeed').hidden};};
 function button(label,fn){const el=document.createElement('button');el.textContent=label;el.onclick=async()=>{el.disabled=true;try{results[label]=await fn();report(results[label]);}catch(e){results[label]={error:e.message};report(results[label]);}finally{el.disabled=false;}};document.getElementById('lootQABtns').append(el);}
 async function fresh(){
  await until(()=>window.__BF3);const b=__BF3;await b.briarReady;if(document.body.classList.contains('t-attract'))dispatchEvent(new PointerEvent('pointerdown'));b.MP.active=false;b.MP.peers={};b.MP.conns=[];b.loadMode('rl');
  Object.assign(b.meta,{hero:null,run:null,bank:null,classId:'warrior',classUnlocked:{},classes:{},trialsDone:{},gold:1000,perks:{},stash:[],bagSlots:0,petActive:null,story:null,campaign:null,zoneSeen:{},tut:{},tutSeen:{},tutOff:true,hubTutDone:true,introSeen:true,introV2Seen:true,autoAttack:false,autoSellEquipment:false,camMode:'far',socks:false,selectedSkin:'knight'});
  b.startTrial('warrior');document.getElementById('tutGo')?.click();BFGuidedTutorial.stop();await until(()=>!window.BF_LOADING?.active);b.skipTrial();await until(()=>!window.BF_LOADING?.active);b.G.p.weapon=b.makeWeapon('sword','common','Protected Sword');b.meta.hero=b.snapOf(b.G.p);b.persist();return b;
 }
 function fill(b,n){b.meta.stash=Array.from({length:n},(_,i)=>({armor:b.makeArmor('common',i%2?'helmet':'chest','balanced')}));b.persist();b.hudUpdate();}
 button('Prepare full-bag shop',async()=>{const b=await fresh();fill(b,30);b.openShopMenu();return state();});
 button('Prepare last-slot shop',async()=>{const b=await fresh();fill(b,29);b.openShopMenu();return state();});
 button('Prepare blocked ground loot',async()=>{const b=await fresh();fill(b,30);const p=b.G.p;b.pushLoot(p.x,p.z,p.y,{weapon:b.makeWeapon('sword','common','Uncollected Sword')});return state();});
 button('Free one bag slot',()=>{const b=__BF3;b.meta.stash.pop();b.persist();b.hudUpdate();return state();});
 button('Prepare mixed pickup boundary',async()=>{const b=await fresh();fill(b,29);const p=b.G.p;b.pushLoot(p.x,p.z,p.y,{weapon:b.makeWeapon('sword','common','First Pickup')});b.pushLoot(p.x,p.z,p.y,{trinket:b.makeTrinket('common','ring','vigor')});return state();});
 button('Prepare full-bag chest',async()=>{const b=await fresh();b.enterZone(0);await until(()=>!window.BF_LOADING?.active);fill(b,30);b.G.enemies=[];b.G.chests=[];const p=b.G.p;b.G.chests.push({x:p.x,z:p.z,y:b.highestSurfaceAt(p.x,p.z),rarity:'common',opened:false,bob:0});return state();});
 button('Prepare campaign journey',async()=>{const b=await fresh();b.enterZone(0);await until(()=>!window.BF_LOADING?.active);return state();});
 button('Inspect chest state',()=>({player:{x:__BF3.G.p.x,y:__BF3.G.p.y,z:__BF3.G.p.z},chests:__BF3.G.chests.map(c=>({opened:c.opened,claimed:c._rewardRecord?.claimed,x:c.x,y:c.y,z:c.z})),...state()}));
 button('Record current state',()=>state());
 button('Export pre-change save',()=>{__BF3.autosaveRun();__BF3.persist();results.save=JSON.parse(JSON.stringify(__BF3.meta));return {saved:true,hero:results.save.hero?.weapon.name,slots:results.save.stash.length};});
 button('Load supplied previous save',async()=>{if(!window.lootPreviousSave)throw Error('Capture a genuine baseline save, then rebuild the fixtures.');const b=await fresh();Object.assign(b.meta,JSON.parse(JSON.stringify(window.lootPreviousSave)));b.persist();b.loadMode('rl');b.openHub();await until(()=>!window.BF_LOADING?.active);return state();});
 button('Hide test controls',()=>{document.getElementById('lootQADetails').open=false;return true;});
 window.lootQA={fresh,fill,state,until,errors};
})();
