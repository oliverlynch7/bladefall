/* Visible, local-only QA controls. Runs the real input listeners/tutorial/save APIs. */
(()=>{
 const bar=document.createElement('section');bar.id='tutorialQA';bar.style.cssText='position:fixed;z-index:99999;right:10px;bottom:10px;max-width:430px;padding:8px;background:#162b39;color:#fff;font:12px system-ui';
 bar.innerHTML='<div id="qaActions"></div><pre id="qaResult" style="max-height:150px;overflow:auto;white-space:pre-wrap">Loading…</pre><a href=".qa-tutorial-current.html?mute=1" style="color:#8de">Updated game</a>';
 document.body.append(bar);
 const out=v=>document.getElementById('qaResult').textContent=typeof v==='string'?v:JSON.stringify(v,null,2);
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const ready=async()=>{while(!window.__BF3||!window.HERO3D?.ready)await wait(100);await __BF3.briarReady;return __BF3;};
 const state=()=>BFGuidedTutorial.state;
 const press=(code,up=false)=>window.dispatchEvent(new KeyboardEvent(up?'keyup':'keydown',{code,key:code==='Escape'?'Escape':code.startsWith('Key')?code.slice(3).toLowerCase():code,bubbles:true,cancelable:true}));
 const pump=(b,n=1)=>{for(let i=0;i<n;i++)b.update(1/60);b.render(1);};
 const check=(name,ok)=>{if(!ok)throw Error(name);return name;};
 const button=(id,label,fn)=>{const e=document.createElement('button');e.id=id;e.textContent=label;e.onclick=async()=>{out('Running…');try{out(await fn(await ready()));}catch(err){out('FAIL '+err.stack);}};document.getElementById('qaActions').append(e);};
 let foeStart;
 async function fresh(b,cid='warrior'){
  BFGuidedTutorial.stop();b.loadMode('rl');Object.assign(b.meta,{hero:null,bank:null,classId:cid,classUnlocked:{},classes:{},trialsDone:{},hubTutDone:true,tutOff:true,introV2Seen:true,autoAttack:false,camMode:'far',autoSellEquipment:false});
  b.meta.keybinds=b.defaultKeybinds();b.rebuildKeyLookup();b.hudDevice('keyboard');b.startTrial(cid);
  document.getElementById('tutGo').click();Object.assign(b.G.cam,{x:b.G.p.x,y:b.G.p.y,z:b.G.p.z});delete b.G._cameraBoom;pump(b);await wait(150);
  const e=b.G.enemies[0];e.x=b.G.p.x+180;e.z=b.G.p.z;e.hp=e.maxHp=99999;e.active=true;foeStart={x:e.x,z:e.z,hp:b.G.p.hp};
 }
 async function core(b,verify=true){
  press('KeyE');pump(b);press('KeyE',true);
  for(const [expected,code]of [['move','KeyW'],['jump','Space'],['attack','KeyJ'],['dodge','ShiftLeft']]){
   if(verify)check('At '+expected,state()?.id===expected);
   press(code);pump(b,24);press(code,true);pump(b,expected==='jump'?70:1);
   if(expected!=='dodge'&&verify){const e=b.G.enemies[0];check('Enemies wait during '+expected,Math.hypot(e.x-foeStart.x,e.z-foeStart.z)<.01&&b.G.p.hp===foeStart.hp);}
  }
  check('Reached HUD guide',state()?.id==='vitals');
 }
 async function show(id){const b=await ready();await fresh(b);await core(b);b.G.enemies.forEach(e=>e.stunT=99999);b.G.p.invuln=99999;let n=0;while(state()?.id!==id&&n++<12){document.querySelector('#guidedLesson button:not(.skip)')?.click();pump(b);}pump(b);await wait(150);return state();}
 async function layout(){
  await show('vitals');const b=await ready(),rows=[];
  for(let i=0;i<9&&state();i++){
   await wait(160);pump(b);await wait(30);
   const el=document.getElementById('guidedLesson'),r=el.getBoundingClientRect();const target=el.dataset.target;const t=target?(document.getElementById(target)||document.querySelector(target))?.getBoundingClientRect():null;
   const overlap=t?Math.max(0,Math.min(r.right,t.right)-Math.max(r.left,t.left))*Math.max(0,Math.min(r.bottom,t.bottom)-Math.max(r.top,t.top)):0;
   const end=document.querySelector('#lessonArrow .lesson-line')?.getAttribute('d')||'';
   const row={id:state().id,target,viewport:[innerWidth,innerHeight],card:[r.x,r.y,r.width,r.height],overlap,arrow:end};
   check('Card inside viewport '+row.id,r.left>=0&&r.top>=0&&r.right<=innerWidth+.5&&r.bottom<=innerHeight+.5);
   check('Does not cover target '+row.id,overlap===0);rows.push(row);
   document.querySelector('#guidedLesson button:not(.skip)').click();pump(b);
  }
  return rows;
 }
 button('qaFresh','Start new tutorial',async b=>{await fresh(b);return {state:state(),mode:b.mode};});
 button('qaCore','Test input gates',async b=>{await fresh(b);await core(b);const before=b.G.time;pump(b,30);check('HUD tips leave world running',b.G.time>before);b.G.enemies.forEach(e=>e.stunT=99999);return {controls:true,enemySafety:true,nonblocking:true,state:state()};});
 button('qaMouse','Prepare mouse attack',async b=>{await fresh(b);press('KeyE');pump(b);press('KeyE',true);for(const k of ['KeyW','Space']){press(k);pump(b,24);press(k,true);pump(b,k==='Space'?70:1);}return {state:state(),camera:b.G.eye,player:{x:b.G.p.x,y:b.G.p.y,z:b.G.p.z},fraction:b.G._cameraBoom?.fraction};});
 button('qaHop','Check short-hop recovery',async b=>{await fresh(b);press('KeyE');pump(b);press('KeyE',true);press('KeyW');pump(b,24);press('KeyW',true);pump(b);press('Space');pump(b,5);press('Space',true);pump(b,90);check('Short hop lands and remains on jump lesson',b.G.p.onGround&&state()?.id==='jump');press('Space');pump(b,24);press('Space',true);pump(b,90);check('Held jump lands before attack lesson',b.G.p.onGround&&state()?.id==='attack');return {shortHopRetry:true,heldJumpCompletesOnGround:true};});
 button('qaTick','Advance and report',b=>{pump(b,30);return {state:state(),input:{...b.input},camera:b.G.eye,player:{x:b.G.p.x,y:b.G.p.y,z:b.G.p.z},fraction:b.G._cameraBoom?.fraction};});
 button('qaStarters','Check three starters',async b=>{const rows=[];for(const cid of ['warrior','ranger','mage']){await fresh(b,cid);await core(b);for(let i=0;i<3;i++)b.questKill(b.G.enemies[i]);check(cid+' first skill at third kill',b.classState(cid).rank===2);pump(b);rows.push({class:cid,rank:b.classState(cid).rank,kills:b.G.trialKills});}return rows;});
 button('qaCamera','Check starter cameras',async b=>{const rows=[];for(const cid of ['warrior','ranger','mage']){await fresh(b,cid);for(const camera of ['far','shoulder']){b.meta.camMode=camera;delete b.G._cameraBoom;pump(b);const fraction=b.G._cameraBoom.fraction;check(cid+' '+camera+' starts clear of walls',fraction>.85);rows.push({class:cid,camera,fraction,spawn:{x:b.G.p.x,y:b.G.p.y,z:b.G.p.z}});}}return rows;});
 button('qaLayout','Check HUD layouts',layout);
 button('qaVitals','Show health tip',()=>show('vitals'));
 button('qaBag','Show bag tip',()=>show('bag'));
 button('qaMap','Show map tip',()=>show('navigation'));
 button('qaHide','Hide test controls',()=>{bar.hidden=true;return 'Hidden';});
 button('qaFlow','Test menus and bindings',async b=>{
  const checks=[];await show('bag');b.openBag(()=>{});pump(b);checks.push(check('Lesson and arrow hide in menu',document.getElementById('guidedLesson').hidden&&document.getElementById('lessonArrow').hidden));
  // Resume through the real menu's keyboard path.
  b.openPause();document.getElementById('resBtn').click();pump(b);checks.push(check('Resumes same lesson',state()?.id==='bag'&&!document.getElementById('guidedLesson').hidden));
  BFGuidedTutorial.skill(b.G);pump(b);checks.push(check('First skill takes precedence',state()?.id==='skill-use'));
  b.G.p.skillCd[0]=2;pump(b);checks.push(check('Unfinished HUD guide resumes after skill',state()?.id==='bag'));b.G.p.skillCd[0]=0;
  b.meta.keybinds.bag=['KeyP'];b.meta.keybinds.journal=['KeyO'];b.meta.keybinds.skill1=['KeyU'];b.meta.keybinds.interact=['KeyF'];b.rebuildKeyLookup();pump(b);
  checks.push(check('Rebound bag and continue labels',document.getElementById('guidedLesson').textContent.includes('P')&&document.getElementById('guidedLesson').textContent.includes('Continue · F')));
  press('KeyE');pump(b);press('KeyE',true);checks.push(check('Old interact no longer advances',state()?.id==='bag'));
  press('KeyF');pump(b);press('KeyF',true);checks.push(check('Rebound interact advances',state()?.id==='autosell'));
  checks.push(check('Auto-sell policy is explicit',document.getElementById('guidedLesson').textContent.includes('even with free slots')));
  b.meta.controller={bindings:{skill1:5,attack:2,dodge:1,bag:8,journal:10,interact:3,pause:9},labels:'xbox'};BFController.setup(b.meta,()=>{});b.hudDevice('controller');pump(b);checks.push(check('Xbox labels',document.getElementById('guidedLesson').textContent.includes('Continue · Y')));
  b.meta.controller.labels='ps';b.hudDevice('keyboard');b.hudDevice('controller');pump(b);checks.push(check('PlayStation labels',document.getElementById('guidedLesson').textContent.includes('Triangle')));
  BFGuidedTutorial.control({edge:a=>a==='interact'});pump(b);checks.push(check('Controller continue',state()?.id==='journal'));
  BFGuidedTutorial.control({edge:a=>a==='pause'});pump(b);checks.push(check('Controller skip closes guide',!state()&&!b.G._tutorialSafe));
  b.hudDevice('keyboard');b.meta.keybinds=b.defaultKeybinds();b.rebuildKeyLookup();return checks;
 });
 button('qaRank','Third-kill skill and exit',async b=>{
  await show('objective');const checks=[];
  for(let i=0;i<3;i++)b.questKill(b.G.enemies[i]);
  checks.push(check('Third kill unlocks rank 2',b.classState('warrior').rank===2));pump(b);
  return {checks,mode:b.mode,rank:b.classState('warrior').rank,kills:b.G.trialKills,next:'Choose skill in the real UI, then use Remaining kills.'};
 });
 button('qaExit','Remaining kills',b=>{b.queueSub=false;for(let i=b.G.trialKills;i<6;i++)b.questKill(b.G.enemies[i]);BFGuidedTutorial.stop();pump(b);return {kills:b.G.trialKills,portal:!!b.G.portal,state:state()};});
 button('qaFinish','Walk through exit',async b=>{b.releaseKeyboard();Object.assign(b.G.p,{x:b.G.portal.x,z:b.G.portal.z,y:b.G.portal.y||0,vx:0,vy:0,vz:0,onGround:true});pump(b,30);await wait(500);pump(b);check('Tutorial completion saved',b.meta.trialsDone.warrior&&b.meta.hero);return {mode:b.mode,done:b.meta.trialsDone.warrior,hero:!!b.meta.hero,state:state()};});
 button('qaHelp','Open current Help',b=>{BFGuidedTutorial.stop();b.openPause();document.getElementById('helpBtn').click();return 'Help open';});
 button('qaTour','Show hub tour',b=>{BFGuidedTutorial.stop();b.skipTrial();b.enterWaystation();b.hubTutorial();return 'Tour open';});
 const save=b=>({name:b.meta.heroName,gold:b.meta.gold,level:b.meta.hero?.level,xp:b.meta.hero?.xp,rank:b.classState('warrior').rank,done:b.meta.trialsDone?.warrior,skin:b.meta.classSkins?.warrior});
 button('qaSeed','Create old save',b=>{b.loadMode('rl');Object.assign(b.meta,{hubTutDone:true,tutOff:true,introV2Seen:true,classId:'warrior'});b.startTrial('warrior');b.skipTrial();b.enterWaystation();b.meta.heroName='Tutorial Returner';b.meta.gold=734;b.G.p.level=8;b.G.p.xp=53;b.meta.hero=b.snapOf(b.G.p);b.classState('warrior').rank=7;b.openPause();return save(b);});
 button('qaLoad','Load pre-change save',b=>{b.loadMode('rl');const s=save(b);check('Old save kept',s.name==='Tutorial Returner'&&s.gold===734&&s.level===8&&s.xp===53&&s.rank===7&&s.done);b.enterWaystation();check('No forced repeat tutorial',!BFGuidedTutorial.state&&!BFHubTour.active);return {preserved:s,mode:b.mode};});
 window.tutorialQA={show,layout};ready().then(()=>out('Ready'));
})();
