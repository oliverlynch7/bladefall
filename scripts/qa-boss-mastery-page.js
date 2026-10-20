/* Staged real-engine checks, local isolated storage only. */
progressQA.button('Verify all campaign boss wards and openings',async()=>{
 const {fresh,until,check,results,write,pump}=progressQA,b=await fresh('warrior'),rows=[];b.skipTrial();await until(()=>!BF_LOADING.active);
 for(let zone=0;zone<8;zone++){
  b.MP.active=false;b.openHub();await until(()=>!BF_LOADING.active);b.enterZone(zone);await until(()=>!BF_LOADING.active);b.G.area=-1;b.loadArea();await until(()=>!BF_LOADING.active);
  const G=b.G,p=G.p;for(const q of G.enemies)q.stunT=99999;
  if(G.boss?.finalKing)BFFinalKing.startFight(G.boss,1);
  const actors=G.enemies.filter(e=>e.boss||e.hydraChain);check('Boss actors '+zone,actors.length>0);
  for(const e of actors){
   Object.assign(e,{active:true,dropT:0});
   if(e.bruteOrchard)e.bruteState='hunt';if(e.marksmanCrossing){e.markState='aim';e.markExposed=0;}if(e.fallenDuel)e.fallState='hunt';if(e.frostOfficer){e.offState='hunt';e.offSeq=0;}if(e.furnaceColossus)e.fcExposed=0;if(e.marbleGuardian)e.mcExposed=0;if(e.hydraChain){G.hydraArena.state='wind';G.hydraArena.head=e.hydraIndex;}if(e.finalKing){e.akState='recover';e.akEnvSeq=null;}
   Object.assign(p,{x:e.x,z:e.z+100,y:e.y,hp:110,invuln:0});const initial=e.hp;b.hitEnemy(e,1e8,p,0,0,null);check('Closed ward blocks actual burst '+zone+'/'+e.type,e.hp===initial);
   if(e.bruteOrchard){e.bruteState='stagger';e.bruteStaggers=1;}if(e.marksmanCrossing){e.markState='recover';e.markTurns=1;BFMarksman.expose(e);}if(e.fallenDuel){e.fallState='stagger';e.fallSeq=1;}if(e.frostOfficer){e.offState='recover';e.offSeq=1;if(e.frostOfficer==='caster'){const shield=G.enemies.find(q=>q.frostOfficer==='shield');if(shield)Object.assign(shield,{x:-600,z:520,y:0});}if(e.frostOfficer==='shield'){e.yaw=0;p.z=e.z-100;}}if(e.furnaceColossus){BFFurnaceColossus.cool(e,1);}if(e.marbleGuardian){e.mcExposed=7;e.mcSeq=1;}if(e.hydraChain){G.hydraArena.state='recover';G.hydraArena.seq=(G.hydraArena.seq||0)+1;G.hydraArena.head=e.hydraIndex;}if(e.finalKing){e.akState='recover';e.akSeq=1;e.akEnvSeq=1;e.akEnvPhase=1;}
   const rule=BFBossTactics.rule(G,e,p);check('Strategy opens actual actor '+zone+'/'+e.type,rule.factor>0&&rule.key);b.hitEnemy(e,1e8,p,0,0,null);const dealt=initial-e.hp;check('One opening cannot erase boss '+zone+'/'+e.type,dealt>0&&dealt<=Math.ceil(e.maxHp*rule.limit)&&e.hp>0&&!e.dead);
   const after=e.hp;b.hitEnemy(e,1e8,p,0,0,null);check('Repeated burst cannot reset window '+zone+'/'+e.type,e.hp===after);
   Object.assign(b.MP,{active:true,isHost:true,myId:'host',zone,peers:{guest:{id:'guest',zone,area:-1,hp:100,ty:p.y,tx:p.x,tz:p.z,x:p.x,y:p.y,z:p.z,last:0}},conns:[]});const replies=[],conn={_pid:'guest',send:m=>replies.push(m)};const packet={m:e.mid,d:1e8,kb:0,sx:p.x,sz:p.z,token:'ward-'+zone+'-'+e.mid};b.MP.hostApplyHit(packet,conn);b.MP.hostApplyHit(packet,conn);check('Guest burst and duplicate cannot bypass spent window',e.hp===after&&replies.length===2);
   const snap=b.MP.enemySnap().find(q=>q[0]===e.mid);check('Budget replicated for guest HUD',snap?.[7]?._bossBudgetKey===e._bossBudgetKey&&snap[7]._bossBudgetSpent===e._bossBudgetSpent);b.MP.active=false;
   rows.push({zone,type:e.type,role:e.frostOfficer||null,initial,dealt,remaining:e.hp,limit:rule.limit,key:e._bossBudgetKey,guestPacket:true});results.bosses=rows;write();
  }
 }
 b.MP.active=false;for(const [key,value]of window.readinessLegacyStorage)localStorage.setItem(key,value);b.loadMode('rl');b.meta.originSeen=true;b.meta.hubTutDone=true;b.resumeSavedAdventure();await until(()=>!BF_LOADING.active);check('Old save survives',b.G.p.level===100&&b.meta.gold===1145);
 results.bossMastery={status:'PASS',actors:rows.length,legacy:{level:b.G.p.level,gold:b.meta.gold}};write();return results.bossMastery;
});
progressQA.button('Review guarded Brute',async()=>{
 const {fresh,until,results,write,place}=progressQA,b=await fresh('warrior');b.skipTrial();await until(()=>!BF_LOADING.active);b.openHub();await until(()=>!BF_LOADING.active);b.enterZone(0);await until(()=>!BF_LOADING.active);b.G.area=-1;b.loadArea();await until(()=>!BF_LOADING.active);const e=b.G.boss;place(b,e,260);e.dropT=.001;e.active=false;for(let i=0;i<5;i++)b.update(1/60);e.stunT=99999;b.render(1);results.visual={boss:e.type,state:e.bruteState};write();return results.visual;
});
progressQA.button('Verify and review royal pillar counter',async()=>{
 const {fresh,until,pump,check,results,write}=progressQA,b=await fresh('warrior');b.skipTrial();await until(()=>!BF_LOADING.active);b.openHub();await until(()=>!BF_LOADING.active);b.enterZone(7);await until(()=>!BF_LOADING.active);b.G.area=-1;b.loadArea();await until(()=>!BF_LOADING.active);
 const G=b.G,e=G.boss,p=G.p;BFFinalKing.startFight(e,1);Object.assign(e,{x:0,z:-450,akState:'strike',akKind:'line',akClock:.32,akSeq:20,akEnvSeq:null,stunT:0});Object.assign(p,{x:-645,z:-30,y:0,vx:0,vz:0,vy:0,onGround:true,invuln:0});const distance=Math.hypot(p.x-e.x,p.z-e.z);e.akDX=(p.x-e.x)/distance;e.akDZ=(p.z-e.z)/distance;e.yaw=Math.atan2(e.akDX,e.akDZ);const hp=p.hp;check('Counter test is live and unprotected',b.mode==='play'&&!b.pauseState().protected);
 pump(b,1);check('Actual game update registers royal counter',e.akEnvSeq===20&&e.akEnvPhase===1);check('The actual pillar prevents beam damage',p.hp===hp);pump(b,24);check('Successful counter grants extended real opening',e.akState==='recover'&&e.akClock>3.8&&BFBossTactics.rule(G,e,p).factor===3);e.stunT=99999;G.camYaw=p.yaw=Math.atan2(e.x-p.x,e.z-p.z);delete G._cameraBoom;for(let n=0;n<20;n++)b.render(1);
 const pillar={health:p.hp,damageAvoided:true,phase:e.phase,seq:e.akEnvSeq,clock:e.akClock,damageMultiplier:BFBossTactics.rule(G,e,p).factor};
 BFFinalKing.startFight(e,2);Object.assign(e,{akState:'wind',akKind:'wave',akClock:.3,akSeq:50,stunT:0});Object.assign(p,{x:200,z:-450,y:0,vx:0,vz:0,vy:0,onGround:true,invuln:0});b.input.jump=true;b.input.jumpEdge=true;let height=0;for(let i=0;i<30;i++){b.update(1/60);height=Math.max(height,p.y);}b.input.jump=false;b.input.jumpEdge=false;check('Actual held jump clears the royal wave',height>=80&&e.akEnvSeq===51&&e.akEnvPhase===2&&p.hp===hp);results.waveTrace=[];for(let i=0;i<40&&e.akState!=='recover'&&p.hp>0;i++){b.update(1/60);results.waveTrace.push({i,y:p.y,hp:p.hp,state:e.akState,clock:e.akClock,seq:e.akSeq,env:e.akEnvSeq,stun:e.stunT,active:e.active,drop:e.dropT});}write();check('Jump counter opens the actual recovery',e.akState==='recover'&&BFBossTactics.rule(G,e,p).factor===3);e.stunT=99999;G.camYaw=p.yaw=Math.atan2(e.x-p.x,e.z-p.z);delete G._cameraBoom;for(let n=0;n<20;n++)b.render(1);
 results.royalCounter={status:'PASS',pillar,wave:{height,health:p.hp,seq:e.akEnvSeq,damageAvoided:p.hp===hp}};write();return results.royalCounter;
});
