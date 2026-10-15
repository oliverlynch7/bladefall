/* Local, explicitly staged review. No production inclusion. */
(()=>{'use strict';
if(!['localhost','127.0.0.1'].includes(location.hostname))return;
const errors=[],results={},wait=ms=>new Promise(r=>setTimeout(r,ms)),clone=v=>JSON.parse(JSON.stringify(v));
addEventListener('error',e=>errors.push(e.message));addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
const panel=document.createElement('aside');panel.style.cssText='position:fixed;right:6px;bottom:6px;z-index:999999;background:#173244;color:white;padding:8px;font:12px system-ui;max-width:400px';
panel.innerHTML='<b>Staged first-boss review</b><div id="bossReviewButtons"></div><pre style="max-height:110px;overflow:auto;white-space:pre-wrap"></pre><textarea aria-label="Boss review evidence" style="width:375px;height:30px"></textarea>';document.body.append(panel);
const out=v=>{panel.querySelector('pre').textContent=JSON.stringify(v,null,1);panel.querySelector('textarea').value=JSON.stringify({results,errors});};
function button(name,fn){const e=document.createElement('button');e.textContent=name;e.onclick=async()=>{try{out(await fn());}catch(e){results.error=e.stack;out({error:e.stack});}};panel.querySelector('div').append(e);}
async function until(fn){const end=Date.now()+25000;while(!fn()){if(Date.now()>end)throw Error('Timed out');await wait(50);}}
function release(b){for(const k of Object.keys(b.input))b.input[k]=typeof b.input[k]==='boolean'?false:0;}
async function setup(cls='warrior',gear=false){
 await until(()=>window.__BF3&&window.HERO3D?.ready);const b=__BF3;await b.briarReady;
 if(document.body.classList.contains('t-attract'))dispatchEvent(new PointerEvent('pointerdown'));document.getElementById('deathfade')?.remove();
 b.MP.active=false;b.loadMode('rl');Object.assign(b.meta,clone(window.firstBossBaseline));b.meta.tut={...(b.meta.tut||{}),skill:true};b.meta.tutOff=true;
 if(cls!=='warrior'){
  b.meta.classId=cls;b.meta.hero.weapon=b.classStartWeapon(cls);b.meta.classUnlocked[cls]=true;b.meta.trialsDone[cls]=true;
  b.meta.classes[cls]={rank:3,xp:543,v2:1,sub:null,ch:{'2':b.CLASS2[cls].r2.a.id,'3':b.CLASS2[cls].r3.a.id}};
 }
 if(gear)b.meta.hero.weapon=b.shopWeapon(cls,'common');
 b.meta.autoAttack=true;b.meta.petActive=null;b.openHub();b.enterZone(0);b.G.area=-1;b.loadArea();b.captureCampaignCheckpoint();
 await until(()=>!window.BF_LOADING?.active);release(b);b.G.p.invuln=0;
 return b;
}
function summary(b){const p=b.G.p,e=b.G.boss;return {mode:b.mode,cls:b.meta.classId,level:p.level,rank:b.classState(b.meta.classId).rank,hp:p.hp,maxHp:b.effMaxHp(p),weapon:p.weapon,gear:p.gear,gold:b.meta.gold,position:[p.x,p.y,p.z],boss:{hp:e.hp,maxHp:e.maxHp,dmg:e.dmg,state:e.bruteState,position:[e.x,e.y,e.z]},portal:!!b.G.portal};}
button('Load earned Brute checkpoint',async()=>{const b=await setup();results.earned=summary(b);return results.earned;});
button('Inspect early equipment',async()=>{const b=__BF3;results.stock=['warrior','ranger','mage'].map(cls=>({cls,starter:b.classStartWeapon(cls).dmg,shop:b.shopWeapon(cls,'common').dmg,drop:b.makeWeapon({warrior:'sword',ranger:'bow',mage:'firestaff'}[cls],'common').dmg,cost:b.shopWeapCost('common')}));return results.stock;});
button('Read state',()=>summary(__BF3));
button('Open earned shop save',async()=>{
 const b=await setup();b.openHub();b.openShopMenu();return {gold:b.meta.gold,weapon:b.meta.hero.weapon,bag:b.meta.stash};
});
button('Save shop evidence',()=>{
 const b=__BF3;b.persist();results.shop={gold:b.meta.gold,hero:b.meta.hero,bag:clone(b.meta.stash)};return results.shop;
});
button('Read genuine reload',async()=>{
 await until(()=>window.__BF3);const b=__BF3;await b.briarReady;
 if(document.body.classList.contains('t-attract'))dispatchEvent(new PointerEvent('pointerdown'));
 b.loadMode('rl');b.openHub();results.reloaded={gold:b.meta.gold,hero:b.meta.hero,bag:clone(b.meta.stash)};return results.reloaded;
});
button('Watch charge into cover',async()=>{
 const b=await setup(),e=b.G.boss,p=b.G.p;b.meta.autoAttack=false;
 Object.assign(e,{x:-340,z:-300,y:0,sx:-340,sz:-300,bruteClock:1.4,active:true,dropT:0});
 document.getElementById('bosshpwrap').classList.add('on');
 Object.assign(p,{x:-340,z:350,y:0,vx:0,vz:0,onGround:true});
 b.G.camYaw=Math.PI;b.G.camPitch=.32;panel.hidden=true;
 const trace=[],start=performance.now();
 try{while(performance.now()-start<6500){trace.push({ms:Math.round(performance.now()-start),hp:p.hp,state:e.bruteState,clock:e.bruteClock,x:e.x,z:e.z,cue:document.getElementById('bosscue').textContent});await wait(80);}}
 finally{panel.hidden=false;}
 results.coverWatch={method:'Staged initial position only; real-time unmodified encounter, player standing behind cart.',trace};return {hp:p.hp,states:[...new Set(trace.map(x=>x.state))]};
});
button('Preview charge guidance',async()=>{
 const b=await setup(),e=b.G.boss,p=b.G.p;b.meta.autoAttack=false;
 Object.assign(e,{x:-340,z:-300,y:0,sx:-340,sz:-300,active:true,bruteState:'wind',bruteClock:1,windT:1,teleX:0,teleZ:1,stunT:60});
 document.getElementById('bosshpwrap').classList.add('on');
 document.getElementById('bossnametx').textContent=e.label;
 Object.assign(p,{x:130,z:350,y:0,vx:0,vz:0,onGround:true});b.G.camYaw=3.77;b.G.camPitch=.55;
 // Use the guest display path for this frozen pose so refreshing the HUD does
 // not re-aim the staged warning at the camera's offset player position.
 b.MP.active=true;b.MP.isHost=false;b.updateBoss(e,0,p,0,1,650,90);b.MP.active=false;
 panel.hidden=true;setTimeout(()=>panel.hidden=false,8000);
 return {method:'Frozen art preview only',preview:BFBruteEncounter.chargePreview(e,b.G.bruteArena.props)};
});
button('Preview locked and rebound guidance',()=>{
 const b=__BF3,e=b.G.boss;b.meta.keybinds={...b.meta.keybinds,jump:['KeyV'],dodge:['KeyF']};e.windT=e.bruteClock=.3;
 b.MP.active=true;b.MP.isHost=false;b.updateBoss(e,0,b.G.p,0,1,650,90);b.MP.active=false;
 panel.hidden=true;setTimeout(()=>panel.hidden=false,8000);return {cue:document.getElementById('bosscue').textContent};
});
button('Preview wave death and retry',async()=>{
 const b=await setup();b.G.p.hp=1;b.G.p.invuln=0;b.hurtPlayer(b.G.boss.dmg*1.25,0,0,{name:'The Brute',attack:'a ground wave',src:b.G.boss});
 await until(()=>document.getElementById('checkpointRetry'));results.deathText=document.getElementById('checkpointRetry').parentElement.innerText;
 return {text:results.deathText};
});
button('Check next-arena cue reset',async()=>{
 const b=await setup(),e=b.G.boss;Object.assign(e,{active:true,bruteState:'stagger',bruteClock:2,staggerT:2});
 b.MP.active=true;b.MP.isHost=false;b.updateBoss(e,0,b.G.p,0,1,100,90);b.MP.active=false;
 const before=document.getElementById('bosscue').textContent;
 b.enterZone(5);b.G.area=-1;b.loadArea();await until(()=>!window.BF_LOADING?.active);
 const node=document.getElementById('bosscue');
 results.cueReset={before,hydra:!!b.G.hydraArena,hidden:node.hidden,text:node.textContent};
 if(!results.cueReset.hydra||!node.hidden||node.textContent)throw Error('Brute advice leaked into another arena');
 return results.cueReset;
});
button('Check guest warnings',async()=>{
 const h=await setup(),frame=document.createElement('iframe'),checks=[],packets=[];let g,listener={};
 const ok=(name,v)=>{checks.push({name,pass:!!v});if(!v)throw Error(name);};
 frame.title='Local guest warning review';frame.src='/3d/?mute=1';frame.style.cssText='position:fixed;left:0;top:0;width:320px;height:220px;z-index:99999';document.body.append(frame);
 try{
  await until(()=>frame.contentWindow.__BF3);g=frame.contentWindow.__BF3;await g.briarReady;g.loadMode('rl');Object.assign(g.meta,clone(window.firstBossBaseline));g.meta.tutOff=true;g.openHub();
  const m=h.MP;Object.assign(m,{active:true,isHost:true,myId:'host-review',conns:[],peers:{}});
  const c={open:true,send:d=>packets.push(clone(d)),on:(k,f)=>listener[k]=f};m.wireGuest(c);listener.open();
  Object.assign(g.MP,{active:true,isHost:false,myId:'guest-review',hostConn:{open:true,send:d=>listener.data(clone(d))}});
  h.enterZone(0);h.G.area=-1;h.loadArea();m.onEnter(0,true);
  const flush=()=>{for(const d of packets.splice(0))g.MP.onGuestData(d);};flush();await until(()=>g.G?.bruteArena&&!frame.contentWindow.BF_LOADING?.active);
  listener.data({t:'hello',p:g.MP.selfState()});flush();
  // No host frames elapse inside this synchronous pose loop. Do not apply a stun:
  // that status intentionally also stops positional correction on the guest.
  const e=h.G.boss;e.active=true;e.dropT=0;e.stunT=0;
  for(const [state,clock]of [['wind',.3],['stagger',2.5],['slam',.7],['recover',.8]]){
   Object.assign(e,{bruteState:state,bruteClock:clock,windT:state==='wind'?clock:0,slamW:state==='slam'?clock:0,staggerT:state==='stagger'?clock:0,teleX:0,teleZ:1,x:-340,z:-300,y:0});
   m.broadcast();flush();const q=g.G.boss;g.updateBoss(q,0,g.G.p,0,1,100,90);
   const expected=frame.contentWindow.BFBruteEncounter.cue(q,{jump:g.controlHint('jump'),dodge:g.controlHint('dodge')});
   ok(state+' host state reaches guest',q.bruteState===state);
   ok(state+' guest shows current advice',frame.contentDocument.getElementById('bosscue').textContent===expected.text);
   if(state==='wind'){
    // Packets supply a position target; let the normal guest interpolation settle
    // after this fixture's large pose change before comparing floor markers.
    const before={host:[e.x,e.z],guest:[q.x,q.z],target:[q.mx,q.mz]};
    for(let i=0;i<90;i++)g.update(1/60);
    const hostPath=BFBruteEncounter.chargePreview(e,h.G.bruteArena.props),guestPath=frame.contentWindow.BFBruteEncounter.chargePreview(q,g.G.bruteArena.props);
    results.corridor={before,after:{host:[e.x,e.z],guest:[q.x,q.z]},hostPath,guestPath};
    ok('guest and host charge corridor agree after interpolation',hostPath.hit===guestPath.hit&&hostPath.width===guestPath.width&&Math.abs(hostPath.distance-guestPath.distance)<1);
   }
  }
  const clock=g.G.boss.bruteClock;for(let i=0;i<30;i++)g.updateBoss(g.G.boss,1/60,g.G.p,0,1,100,90);ok('guest does not advance authoritative attack',g.G.boss.bruteClock===clock);
  g.meta.keybinds={...g.meta.keybinds,jump:['KeyV']};Object.assign(e,{bruteState:'slam',bruteClock:.7,slamW:.7});m.broadcast();flush();g.updateBoss(g.G.boss,0,g.G.p,0,1,100,90);
  ok('guest uses its own jump binding',frame.contentDocument.getElementById('bosscue').textContent.includes('V to jump'));
  results.coop={checks,scope:'Local production-message relay between two browser worlds; controlled poses, no Internet latency claim.'};return results.coop;
 }finally{h.MP.active=false;h.MP.conns=[];h.MP.peers={};if(g)g.MP.active=false;frame.remove();}
});
button('Hide controls',()=>{panel.hidden=true;setTimeout(()=>panel.hidden=false,6000);return 'Hidden for six seconds';});
button('Run damage and recovery probes',async()=>{
 const checks=[],ok=(name,value,detail)=>{checks.push({name,pass:!!value,detail});};
 for(const cls of ['warrior','ranger','mage']){
  const b=await setup(cls),p=b.G.p,e=b.G.boss;release(b);b.meta.autoAttack=false;
  const position=(x,z)=>Object.assign(p,{x,z,y:0,vx:0,vz:0,vy:0,onGround:true,invuln:0,dodgeTimer:0});
  // Controlled stationary contact during the advertised recovery window.
  Object.assign(e,{x:0,z:0,y:0,active:true,dropT:0,bruteState:'stagger',bruteClock:3,staggerT:3,lunge:0,windT:0,bruteTurns:0,bruteWaves:0});position(0,50);let hp=p.hp;
  for(let i=0;i<120;i++)b.update(1/60);ok(cls+' stagger has no contact damage',p.hp===hp,{before:hp,after:p.hp});
  const before=e.hp;p.yaw=Math.atan2(e.x-p.x,e.z-p.z);b.playerAttack();for(let i=0;i<45;i++)b.update(1/60);ok(cls+' can attack during stagger',e.hp<before,{damage:before-e.hp});
  for(const response of ['stand','jump','dodge']){
   // Reset only the encounter for isolated attack samples, with unchanged ordinary stats.
   Object.assign(e,{x:0,z:0,y:0,bruteState:'hunt',bruteClock:10,staggerT:0,lunge:0,windT:0,bruteTurns:0});position(0,160);p.hp=hp;p.dodgeCdT=0;b.G.shockwaves=[{orchardId:900,x:0,z:0,y:0,r:22,maxR:230,dmg:e.dmg*1.25,life:0,spd:270}];
   let apex=0;for(let i=0;i<50;i++){if(response==='jump'&&i===18){b.input.jumpEdge=true;b.input.jump=true;}if(response==='dodge'&&i===24)b.input.dodgeEdge=true;b.update(1/60);apex=Math.max(apex,p.y);}release(b);
   ok(cls+' ground wave '+response,response==='stand'?p.hp<hp:p.hp===hp,{damage:hp-p.hp,apex});
  }
 }
 results.probes=checks;return {checks:checks.length,failures:checks.filter(x=>!x.pass)};
});
// Scripted reaction probe: only ordinary movement inputs, auto-attack, dodge/jump
// edges and the earned first skill after initial staged encounter placement.
// Reads attack states perfectly; establishes mechanical feasibility, NOT novice skill.
async function fight(cls,gear=false){
 const b=await setup(cls,gear),p=b.G.p,e=b.G.boss,trace=[],start=summary(b);let prev='',hitHp=p.hp,lastHit=0,sec=0,side=1,turn=-1;
 function move(dx,dz){const m=Math.hypot(dx,dz)||1,cy=b.G.camYaw??Math.PI,wx=dx/m,wz=dz/m;b.input.jx=-wx*Math.cos(cy)+wz*Math.sin(cy);b.input.jz=-(wx*Math.sin(cy)+wz*Math.cos(cy));}
 for(let i=0;i<60*180;i++){
  if(p.dead||p.hp<=0||b.mode==='dead'||b.G.portal)break;
  if(b.mode!=='play'){
   release(b);
   if(b.mode==='upgrade'&&document.querySelector('.c2opt')){
    document.querySelector('.c2opt').click();await wait(420);document.getElementById('classChoiceConfirm')?.click();await wait(60);continue;
   }
   break;
  }
  sec=i/60;release(b);const live=b.G.enemies.filter(q=>!q.dead&&q.hp>0),adds=live.filter(q=>q!==e),t=adds.sort((a,c)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(c.x-p.x,c.z-p.z))[0]||e;
  const dx=t.x-p.x,dz=t.z-p.z,d=Math.hypot(dx,dz)||1,edx=p.x-e.x,edz=p.z-e.z,ed=Math.hypot(edx,edz)||1;
  // Turn through the normal look input helper; ranged shots follow the camera.
  const want=Math.atan2(dx,dz),angle=Math.atan2(Math.sin(want-b.G.camYaw),Math.cos(want-b.G.camYaw));
  b.applyCameraLook(-angle,0,1,1);
  let mx=0,mz=0;const reach=cls==='warrior'?75:270;
  if(d>reach){mx=dx/d;mz=dz/d;}
  if(cls!=='warrior'&&d<180){mx=-dx/d;mz=-dz/d;}
  if(!e.dead&&['wind','charge'].includes(e.bruteState)){
   if(e.bruteTurns!==turn){turn=e.bruteTurns;side=edx*e.teleZ-edz*e.teleX>=0?1:-1;}
   if(e.bruteClock<.48||e.bruteState==='charge'){mx=e.teleZ*side;mz=-e.teleX*side;}
   const forward=edx*e.teleX+edz*e.teleZ,lateral=Math.abs(edx*e.teleZ-edz*e.teleX);
   if(e.bruteState==='charge'&&forward>0&&forward<155&&lateral<75&&p.dodgeCdT<=0)b.input.dodgeEdge=true;
  }
  if(!e.dead&&e.bruteState==='slam'&&ed<280&&e.bruteClock<.20&&p.onGround){b.input.jump=true;b.input.jumpEdge=true;}
  if(!p.onGround&&p.varJump&&p.vy>0)b.input.jump=true;
  // Move clear of local melee warnings as well as the boss's marked charge.
  for(const a of adds)if(a.meleeW>0&&a.meleeW<.23&&Math.hypot(a.x-p.x,a.z-p.z)<100&&p.dodgeCdT<=0){mx=p.x-a.x;mz=p.z-a.z;b.input.dodgeEdge=true;}
  const bound=600;if(Math.abs(p.x)>bound){mx=-Math.sign(p.x);mz+=(t.z-p.z)/d*.5;}if(p.z>640){mz=-1;}if(p.z<-660){mz=1;}
  if(Math.hypot(mx,mz)>.1)move(mx,mz);
  if(d<(cls==='warrior'?160:430)&&p.skillCd[0]<=0&&p.dodgeTimer<=0){p.yaw=Math.atan2(dx,dz);b.useSkill(0);}
  b.update(1/60);
  const sig=[e.bruteState,e.bruteTurns,e.bruteWaves,Math.round(e.hp),Math.round(p.hp),live.length].join(':');
  if(sig!==prev){trace.push({t:+sec.toFixed(2),hp:p.hp,bossHp:e.hp,state:e.bruteState,turn:e.bruteTurns,foes:live.length,x:+p.x.toFixed(1),z:+p.z.toFixed(1),bossX:+e.x.toFixed(1),bossZ:+e.z.toFixed(1)});prev=sig;}
  if(p.hp<hitHp){lastHit=sec;hitHp=p.hp;}if(i%120===0){out({running:cls,seconds:sec,hp:p.hp,bossHp:e.hp});await wait(0);}
 }
 release(b);const r={method:'Staged boss entry; actual earned/representative level-2 rank-3 stats, ordinary engine movement/combat, perfect state-reading scripted inputs; no health refill/invulnerability/enemy disabling during fight.',cls,shop:gear,start,end:summary(b),seconds:sec,lastHit,won:!!b.G.portal,trace};
 (results.fights??=[]).push(r);out({cls,shop:gear,won:r.won,seconds:sec,hp:p.hp,bossHp:e.hp,mode:b.mode});return r;
}
button('Probe earned Warrior fight',async()=>{const r=await fight('warrior');return {won:r.won,seconds:r.seconds,end:r.end};});
button('Probe all starter fights',async()=>{for(const c of ['warrior','ranger','mage'])await fight(c);return results.fights.map(({cls,won,seconds,end})=>({cls,won,seconds,hp:end.hp,bossHp:end.boss.hp}));});
})();
