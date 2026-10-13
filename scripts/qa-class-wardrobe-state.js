// Local game fixture controls; this file is never included in production.
(()=>{
 const box=document.createElement('div');box.style.cssText='position:fixed;top:5px;left:350px;z-index:999999;background:#112c40;color:white;padding:8px;font:12px system-ui;max-width:650px';
 box.innerHTML='<button id="seed">Create old save</button><button id="load">Load old save</button><button id="test">Test skin rules</button><button id="stylist">Show Stylist</button><button id="bag">Show bag</button><button id="world">Show equipped skins</button><button id="hide">Hide tests</button><a style="color:#ffee99" href=".qa-class-state.html?mute=1">Updated game</a><pre id="result" style="max-height:180px;overflow:auto;white-space:pre-wrap">Loading…</pre>';document.body.append(box);
 const peersButton=document.createElement('button');peersButton.id='peers';peersButton.textContent='Test co-op appearances';box.prepend(peersButton);
 const out=v=>document.getElementById('result').textContent=typeof v==='string'?v:JSON.stringify(v,null,2),wait=async()=>{while(!window.__BF3||!window.HERO3D?.ready)await new Promise(r=>setTimeout(r,40));await __BF3.briarReady;return __BF3;},frame=()=>new Promise(r=>requestAnimationFrame(r));
 const act=(id,fn)=>document.getElementById(id).onclick=async()=>{try{await fn(await wait());}catch(e){out({passed:false,error:e.stack});}};
 const snapshot=b=>({name:b.meta.heroName,gold:b.meta.gold,level:b.meta.hero?.level,xp:b.meta.hero?.xp,rank:b.classState('warrior').rank,classXP:b.classState('warrior').xp,looks:b.meta.classLooks,trial:b.meta.trialsDone.warrior,gear:b.meta.stash.map(x=>(x.armor||x.weapon).name)});
 act('seed',b=>{b.loadMode('rl');Object.assign(b.meta,{hubTutDone:true,tutOff:true,introV2Seen:true,classId:'warrior'});b.startTrial('warrior');b.skipTrial();b.enterWaystation();b.meta.heroName='Wardrobe Test Warden';b.meta.gold=987;b.G.p.level=12;b.G.p.xp=77;b.meta.hero=b.snapOf(b.G.p);b.classState('warrior').rank=7;b.classState('warrior').xp=123;b.classState('mage').rank=10;b.meta.classLooks={warrior:1,mage:2,ninja:0};b.meta.stash=[{armor:b.makeArmor('rare','chest')}];b.G.p.weapon=b.classStartWeapon('warrior');b.openPause();out({oldSave:snapshot(b)});});
 act('load',b=>{b.loadMode('rl');const s=snapshot(b);if(s.name!=='Wardrobe Test Warden'||s.gold!==987||s.level!==12||s.xp!==77||s.rank!==7||s.classXP!==123||s.looks.warrior!==1||s.looks.mage!==2||s.gear.length!==1||!s.trial)throw Error('Old save changed '+JSON.stringify(s));b.enterWaystation();out({passed:true,oldSavePreserved:s});});
 act('test',async b=>{
  const checks=[],check=(name,yes)=>{if(!yes)throw Error(name);checks.push(name);};b.loadMode('rl');b.enterWaystation();
  for(const cls of Object.keys(BFClassLooks.catalog)){const m={classes:{[cls]:{rank:4}},classLooks:{[cls]:1}};check(cls+' rank 4 locked',BFClassLooks.tier(m,cls)===0);m.classes[cls].rank=5;check(cls+' rank 5 unlocked',BFClassLooks.tier(m,cls)===1);m.classLooks[cls]=2;m.classes[cls].rank=9;check(cls+' rank 9 locked',BFClassLooks.tier(m,cls)===0);m.classes[cls].rank=10;check(cls+' rank 10 unlocked',BFClassLooks.tier(m,cls)===2);}
  b.meta.classId='warrior';b.classState('warrior').rank=4;b.openSkins(()=>{});document.querySelector('[data-look="1"]').click();check('Stylist rank 5 button locked at 4',document.getElementById('wearLook').disabled);
  b.classState('warrior').rank=5;b.openSkins(()=>{});document.querySelector('[data-look="1"]').click();check('Stylist rank 5 button unlocked',!document.getElementById('wearLook').disabled);const before=JSON.stringify(b.G.p.stats);document.getElementById('wearLook').click();check('Equipping skin does not change stats',JSON.stringify(b.G.p.stats)===before);document.querySelector('[data-look="2"]').click();check('Stylist rank 10 button locked at 5',document.getElementById('wearLook').disabled);
  b.cheatRank10All();check('Cheat unlocks rank 10 for all classes',Object.keys(BFClassLooks.catalog).every(c=>{const temp={...b.meta,classLooks:{...b.meta.classLooks,[c]:2}};return BFClassLooks.tier(temp,c)===2;}));
  b.meta.classId='mage';b.meta.classLooks.mage=2;b.meta.classLooks.warrior=1;b.persist();b.loadMode('rl');check('Per-class selections survive save/reload',b.meta.classLooks.mage===2&&b.meta.classLooks.warrior===1);
  const q=b.MP.mkPeer({cid:'mage',lookTier:2,x:0,y:0,z:0});check('Remote tier serializes',q.lookTier===2&&b.MP.snap(q).lookTier===2);b.MP.applyPos(q,{lookTier:1});check('Remote tier changes',q.lookTier===1);b.MP.applyPos(q,{lookTier:99});check('Invalid remote tier rejected',q.lookTier===0);
  b.enterWaystation();for(let i=0;i<20;i++)await frame();check('World model applies selected tier',HERO3D.skin?.tier===2&&HERO3D.skin?.classId==='mage');
  for(const cls of Object.keys(BFClassLooks.catalog)){
   b.meta.classId=cls;b.openSkins(()=>{});
   for(const tier of [1,2,0]){document.querySelector('[data-look="'+tier+'"]').click();for(let i=0;i<60;i++){await frame();if(window.__creatorPreviewState?.model===__hero3dClassModel(cls)&&window.__creatorPreviewState?.lookTier===tier)break;}
    let valid=true;__creatorPreviewRoot.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.emissive)valid&&=[m.emissive.r,m.emissive.g,m.emissive.b,m.emissiveIntensity].every(Number.isFinite);}});
    check(cls+' Stylist tier '+tier+' material remains valid',valid&&__creatorPreviewState.lookTier===tier);
   }
  }
  b.meta.classId='mage';b.enterWaystation();

  out({passed:true,checks,count:checks.length});
 });
 act('stylist',b=>{b.enterWaystation();b.meta.classId='mage';b.meta.classLooks.mage=2;b.openSkins(()=>b.enterWaystation());out('Stylist open · rotate and inspect all three tiers');});
 act('bag',b=>{b.enterWaystation();b.meta.classId='mage';b.meta.classLooks.mage=2;setTimeout(()=>{b.openGear();out('Bag open');},300);});
 act('world',b=>{b.enterWaystation();b.meta.classId='mage';b.meta.classLooks.mage=2;out('World · Galaxy Archmage equipped');});
 act('peers',async b=>{
  const {classLookStats}=await import('/3d/class-look3d.js?v=2191'),checks=[];b.loadMode('rl');b.enterWaystation();b.meta.classId='mage';b.meta.classLooks.mage=2;
  const old={active:b.MP.active,isHost:b.MP.isHost,peers:b.MP.peers},state=(id,cid,tier,dx)=>({id,cid,cls:cid,name:id,lookTier:tier,zone:b.MP.zone,area:b.G.area,hp:100,hpm:100,x:b.G.p.x+dx,y:b.G.p.y,z:b.G.p.z+30,w:b.classStartWeapon(cid)});
  // No broker or network connection: exercise the normal MP packet and rendering path locally.
  try{
   b.MP.active=true;b.MP.isHost=true;b.MP.peers={};const twin=state('wardrobe-twin','mage',1,-100);b.MP.peers[twin.id]=b.MP.mkPeer(twin);
   for(const cls of Object.keys(BFClassLooks.catalog))for(const tier of [1,2,0]){
    const s=state('wardrobe-peer',cls,tier,100),q=b.MP.peers[s.id];if(q)b.MP.applyPos(q,s);else b.MP.peers[s.id]=b.MP.mkPeer(s);
    for(let i=0;i<30;i++){for(const p of Object.values(b.MP.peers))p.last=0;await frame();const n=__hero3dScene().getObjectByName('__heroPeer:'+s.id);if(n&&classLookStats(n).key===cls+':'+tier)break;}
    const n=__hero3dScene().getObjectByName('__heroPeer:'+s.id),look=n&&classLookStats(n);let finite=!!n;
    n?.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m.emissive)finite&&=[m.emissive.r,m.emissive.g,m.emissive.b,m.emissiveIntensity].every(Number.isFinite);});
    const other=__hero3dScene().getObjectByName('__heroPeer:wardrobe-twin');
    if(!finite||look.key!==cls+':'+tier||!other||classLookStats(other).key!=='mage:1'||HERO3D.skin?.tier!==2)throw Error('Remote skin mismatch '+cls+':'+tier+' '+JSON.stringify(look));
    checks.push(cls+' tier '+tier+' renders without changing same-body ally or local skin');
   }out({passed:true,checks,count:checks.length,scope:'Simulated peers through production rendering; no live network session.'});
  }finally{Object.assign(b.MP,old);}
 });
 act('hide',()=>box.hidden=true);wait().then(()=>out('Ready'));
})();
