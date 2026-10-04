async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4338/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 const result=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.hubTutDone=true;b.meta.introSeen=true;b.meta.tutOff=true;b.meta.autoAttack=false;b.meta.petActive=null;b.openHub();b.enterZone(1);
  const g=b.G,p=g.p,M=b.MP,checks=[],ok=(n,v)=>{if(!v)throw Error(n);checks.push(n);};
  g.obstacles=[];g.walls=[];g.doors=[];g.movers=[];g.crumbles=[];g.torches=[];g.enemies=[];g.segments=[{x:0,z:0,w:2000,d:2000}];
  Object.assign(p,{x:-200,z:0,y:0,hp:1000,invuln:0,dodgeTimer:0,vx:0,vz:0,vy:0,onGround:true});
  const e=b.spawnEnemy('grunt',0,0);Object.assign(e,{active:true,dropT:0,y:0,sx:0,sz:0,mid:991,role:null,spec:null});
  const saved={active:M.active,isHost:M.isHost,peers:M.peers,zone:M.zone};
  try{
   M.active=true;M.isHost=true;M.zone=g.zone;M.peers={q:{x:30,z:0,y:0,tx:30,tz:0,ty:0,last:0,yaw:0,tyaw:0,hp:100,zone:M.zone,area:g.area,r:13}};
   ok('host selects nearby living guest',b.enemyPartyTarget(e,p)===M.peers.q);
   M.peers.q.downed=true;ok('downed guest not targeted',b.enemyPartyTarget(e,p)===p);M.peers.q.downed=false;
   b.update(.016);ok('guest proximity starts shared warning',e.meleeW>0&&e.meleeSerial>0);
   const packet=M.enemySnap().find(row=>row[0]===991);ok('snapshot carries warning and serial',packet[7].normalMelee&&packet[7].meleeW>0&&packet[7].meleeSerial===e.meleeSerial);
   M.isHost=false;M.applyEnemies([packet],[]);ok('guest mirrors warning',e.normalMelee&&e.meleeW>0);
   Object.assign(p,{x:e.x,z:e.z,y:0,hp:1000,invuln:0});Object.assign(e,{meleeW:0,meleeActive:.18,meleeSerial:987,_meleeSeen:0,_meleeSeenSerial:0});
   b.update(.016);ok('missed warning cannot damage guest',p.hp===1000);
   Object.assign(e,{meleeActive:.18,_meleeSeen:.5,_meleeSeenSerial:987});b.update(.016);ok('observed warning permits damage',p.hp<1000);
   p.hp=1000;p.invuln=0;Object.assign(e,{x:-10,z:0,y:0,meleeActive:.18});Object.assign(p,{x:10,z:0,y:0});g.obstacles=[{x:0,z:0,w:4,d:100,h:100}];b.update(.016);ok('solid cover blocks actual contact damage',p.hp===1000);
   const previous=e.hp;packet[4]=previous-5;M.applyEnemies([packet],[]);ok('remote damage triggers visible hit cue',e.hitFlash>0);
  }finally{Object.assign(M,saved);}
  return checks;
 });if(errors.length)throw Error(JSON.stringify(errors));return result;
}
