async page=>{
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
 await page.reload();
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready,null,{polling:100,timeout:30000});
 return page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');
  Object.assign(b.meta,{classId:'warrior',introSeen:true,hubTutDone:true,tutOff:true,run:null,bank:null,camMode:'far',autoAttack:false});
  b.openHub();b.enterZone(0);
  const g=b.G,p=g.p,{x,z}=p,mp=b.MP;
  const check=(pass,data)=>{if(!pass)throw Error(JSON.stringify(data));};
  for(const mob of g.enemies)mob.stunT=9999;
  const e=Object.assign(b.spawnEnemy('sentinel',x,z),{active:true,dropT:0,y:p.y,x,z,yaw:0,shieldYaw:0,stunT:9999,maxHp:10000,hp:10000});
  function impact(incoming,owner){
   Object.assign(p,{x,z:z+owner,y:e.y,vx:0,vz:0,vy:0,onGround:true,invuln:100});
   g.combo=0;
   g.projectiles.push({x,z:z+incoming*19,y:e.y+22,vx:0,vy:0,vz:-incoming*1500,size:5,life:2,owner:'player',hitSet:[],dmg:100,kb:0});
   const hp=e.hp;b.update(1/60);return hp-e.hp;
  }
  const solo={rear:impact(-1,90),front:impact(1,-90)};
  check(solo.rear>solo.front*2.5&&solo.front>0,{solo});
  let packet;
  const conn={open:true,send:d=>{if(d.t==='hit')packet=d;},_pid:'ally'};
  const ally=mp.mkPeer({id:'ally',x,y:p.y,z:z+90,zone:g.zone,area:g.area,hp:100});
  Object.assign(mp,{active:true,isHost:false,myId:'guest',zone:g.zone,tick:()=>{},sendCombat:()=>{},hostConn:conn,peers:{ally}});
  e.mid=12345;e.facingYaw=e.yaw;
  function roundTrip(incoming,owner){
   packet=null;mp.isHost=false;
   check(impact(incoming,owner)===0,{msg:'guest changed host HP'});
   check(packet?.guardSide?.[1]===incoming,{packet,incoming});
   let receipt;
   const hp=e.hp;mp.isHost=true;mp.hostApplyHit(packet,{_pid:'ally',send:r=>receipt=r});
   check(receipt?.dealt===hp-e.hp,{packet,receipt});
   mp.isHost=false;mp.takeHitResult(receipt);
   return receipt.dealt;
  }
  const coop={rear:roundTrip(-1,90),front:roundTrip(1,-90)};
  check(coop.rear>coop.front*2.5&&coop.front>0,{coop});
  const boss={x:0,y:0,z:0,yaw:0,r:42,akState:'recover',akStage:'fight1',akKind:'sweep',akClock:2,akSeq:4,akEnvSeq:3,akEnvPhase:1,phase:1,akDX:0,akDZ:1,finalKing:true,hp:1000,maxHp:1000};
  const rear={x:0,z:-1},front={x:0,z:1};
  const rule=(z,side)=>BFBossTactics.rule(g,boss,{x:0,y:0,z},'direct',side).factor;
  const royal={rear:rule(90,rear),front:rule(-90,front),far:rule(800,rear)};
  check(royal.rear>0&&royal.front===0&&royal.far===0,{royal});
  return {version:b.snap().version,solo,coop,royal};
 });
}
