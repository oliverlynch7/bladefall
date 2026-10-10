async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2164');
 await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 const result=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;
  b.meta.introSeen=true;b.meta.tutOff=true;b.meta.autoAttack=false;b.meta.petActive=null;b.openHub();b.enterZone(1);
  const G=b.G,p=G.p,checks=[],rows=[];
  const ok=(name,value)=>{if(!value)throw Error(name+' '+JSON.stringify(rows));checks.push(name);};
  G.obstacles=[];G.walls=[];G.doors=[];G.movers=[];G.crumbles=[];G.enemies=[];G.patrolWork=null;
  G.segments=[{x:0,z:0,w:2000,d:2000}];
  const reset=()=>{G.enemies=[];G.obstacles=[];Object.assign(p,{x:0,z:0,y:0,vy:0,vx:0,vz:0,onGround:true,hp:1000,invuln:0,dodgeTimer:0,dodgeCdT:0,recoverT:0,dead:false});};
  const spawn=(type,distance)=>{const e=b.spawnEnemy(type,distance,0);Object.assign(e,{active:true,dropT:0,role:null,speed:150,shotT:999});return e;};
  for(const type of ['grunt','sentinel'])for(const distance of [50,72,110]){
   reset();const e=spawn(type,distance);let firstAt=null,firstHp=null;
   for(let i=0;i<180;i++){b.update(.016);if(e.meleeActive>0){firstAt=i*.016;firstHp=p.hp;break;}}
   rows.push({type,distance,reach:e.meleeReach,firstAt,firstHp});
   ok(type+' first telegraphed strike connects from '+distance+' units',e.meleeReach===8&&firstAt!=null&&firstHp<1000);
  }
  reset();const dodged=spawn('grunt',50);
  for(let i=0;i<70&&!(dodged.meleeW>0);i++)b.update(.016);
  rows.push({dodgeReadyHp:p.hp,wind:dodged.meleeW});
  ok('wind-up announces itself before damage',dodged.meleeW>0&&p.hp===1000);
  p.yaw=-Math.PI/2;b.input.dodgeEdge=true;
  for(let i=0;i<70&&dodged.meleeActive<=0;i++)b.update(.016);
  rows.push({dodgeHp:p.hp,dodgeDistance:Math.hypot(dodged.x-p.x,dodged.z-p.z)});
  ok('timed dodge avoids the first swing',dodged.meleeActive>0&&p.hp===1000);
  reset();G.obstacles=[{x:25,z:0,w:4,d:1000,h:100}];const blocked=spawn('grunt',50);
  for(let i=0;i<240;i++)b.update(.016);
  rows.push({wallHp:p.hp,wallSerial:blocked.meleeSerial||0});
  ok('solid cover blocks the enlarged reach',p.hp===1000);
  reset();const normal=spawn('grunt',50),packet=b.MP.enemySnap().find(row=>row[0]===normal.mid);
  ok('co-op enemy snapshot carries reach',packet?.[7]?.meleeReach===8);
  G.trial='warrior';const trial=b.spawnEnemy('grunt',100,0);G.trial=null;
  ok('tutorial trial keeps its original reach',trial.meleeReach==null);
  G.side=true;const side=b.spawnEnemy('grunt',120,0);G.side=false;
  ok('side mode keeps its original reach',side.meleeReach==null);
  return {checks,rows};
 });
 if(errors.length)throw Error(JSON.stringify(errors));
 return {...result,errors};
}
