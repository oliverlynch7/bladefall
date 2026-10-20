/* Local isolated storage fixture only. Inspect real renderer routing, not just pose tables. */
progressQA.button('Verify live enemy animation routing',async()=>{
 const {fresh,until,check,results,write,place}=progressQA,b=await fresh('warrior'),rows=[];b.skipTrial();await until(()=>!BF_LOADING.active);
 for(const zone of [0,1,2,3,4,6,7]){
  b.openHub();await until(()=>!BF_LOADING.active);b.enterZone(zone);await until(()=>!BF_LOADING.active);b.G.area=-1;b.loadArea();await until(()=>!BF_LOADING.active);
  const G=b.G;if(G.boss?.finalKing)BFFinalKing.startFight(G.boss,2);
  for(const q of G.enemies)q.stunT=99999;
  for(const e of G.enemies.filter(e=>e.boss)){
   place(b,e,160);Object.assign(G.p,{invuln:99999,hp:110});Object.assign(e,{active:true,dropT:0,stunT:0,hitFlash:0});
   const type=e.frostOfficer&&e.frostOfficer!=='caster'?'officer-'+e.frostOfficer:e.marbleGuardian?'marblecolossus':e.type;
   await until(()=>{b.renderFrame();return window.__mob3d?.().actors.some(a=>a.type===type);});
   const stages=e.bruteOrchard?[[{bruteState:'slam',windT:0,slamW:.8},'Windup_slam'],[{bruteState:'charge',slamW:0,lunge:1.05},'BruteRush']]:
    e.marksmanCrossing?[[{markState:'aim',markClock:1.1,markAttack:0},'Windup'],[{markState:'recover',markAttack:.28,markClock:1.8},'Attack']]:
    e.fallenDuel?[[{fallState:'thrust',fallKind:'thrust',fallClock:1,fallAttack:0},'Windup_thrust'],[{fallState:'strike',fallKind:'thrust',fallAttack:.3},'Attack_thrust'],[{fallState:'sweep',fallKind:'sweep',fallClock:.8,fallAttack:0},'Windup_sweep'],[{fallState:'strike',fallKind:'sweep',fallAttack:.3},'Attack_sweep']]:
    e.frostOfficer?['wind','strike'].map(state=>[{offState:state,offClock:1,offSeq:1},(state==='wind'?'Windup_':'Attack_')+({shield:'shieldWave',spear:'thrust',caster:'mark'})[e.frostOfficer]]):
    e.furnaceColossus?['slam','sweep','vents'].flatMap(kind=>['wind','strike'].map(state=>[{fcState:state,fcKind:kind,fcClock:1},(state==='wind'?'Windup_':'Attack_')+kind])):
    e.marbleGuardian?['hammer','sweep','fall'].flatMap(kind=>['wind','strike'].map(state=>[{mcState:state,mcKind:kind,mcClock:1},(state==='wind'?'Windup_':'Attack_')+kind])):
    ['line','wave','burst','sweep'].flatMap(kind=>['wind','strike'].map(state=>[{akState:state,akKind:kind,akClock:.3},(state==='wind'?'Windup_':'Attack_')+({line:'beam',wave:'stomp',burst:'burst',sweep:'sweep'})[kind]]));
   for(const [state,expected]of stages){await progressQA.wait(12);Object.assign(e,state);b.renderFrame();const actor=window.__mob3d().actors.find(a=>a.type===type);rows.push({zone,type,expected,actual:actor?.clip});results.routing=rows;write();check(type+' '+expected,actor?.clip===expected);}
   e.stunT=99999;
  }
 }
 b.MP.active=false;for(const [key,value]of window.readinessLegacyStorage)localStorage.setItem(key,value);b.loadMode('rl');b.meta.originSeen=true;b.meta.hubTutDone=true;b.resumeSavedAdventure();await until(()=>!BF_LOADING.active);check('Pre-change save remains valid',b.G.p.level===100&&b.meta.gold===1145);
 results.animationRouting={status:'PASS',checks:rows.length,legacy:{level:b.G.p.level,gold:b.meta.gold},renderer:window.__mob3d().err};write();return results.animationRouting;
});
progressQA.button('Review live Hydra attack motion',async()=>{
 const {fresh,until,check,results,write}=progressQA,b=await fresh('warrior');b.skipTrial();await until(()=>!BF_LOADING.active);b.openHub();await until(()=>!BF_LOADING.active);b.enterZone(5);await until(()=>!BF_LOADING.active);b.G.area=-1;b.loadArea();await until(()=>!BF_LOADING.active);
 const G=b.G,h=G.hydraArena;check('Hydra arena',h);G.p.invuln=99999;const rows=[];
 await until(()=>{b.renderFrame();return window.__hero3dScene?.().getObjectByName('Hydra lower jaw 0');});
 for(const kind of ['bite','sweep','blast'])for(const state of ['wind','strike','recover']){
  await progressQA.wait(12);Object.assign(h,{kind,state,head:0,clock:state==='wind'?.4:state==='strike'?.25:2,x:0,y:120,z:160,seq:10,elapsed:h.elapsed+.05});b.renderFrame();const scene=window.__hero3dScene(),jaw=scene.getObjectByName('Hydra lower jaw 0');let finite=true;scene.getObjectByName('Hydra articulated body').traverse(o=>finite&&=o.matrixWorld.elements.every(Number.isFinite));check('Finite Hydra '+kind+state,finite);rows.push({kind,state,jawAngle:jaw.rotation.x,finite});
 }
 check('The actual articulated lower jaw moves',Math.max(...rows.map(r=>r.jawAngle))-Math.min(...rows.map(r=>r.jawAngle))>.01);Object.assign(h,{kind:'bite',state:'wind',clock:.2,head:0,elapsed:h.elapsed+.05});b.renderFrame();results.hydraAnimation={status:'PASS',rows};write();return results.hydraAnimation;
});
