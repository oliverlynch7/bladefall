async page=>{
 const errors=[],checks=[],ok=(name,value,detail)=>{if(!value)throw Error(name+(detail?' '+JSON.stringify(detail):''));checks.push(name);};
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=2165');
 await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 const setup=async()=>page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;
  b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.meta.autoAttack=false;b.meta.petActive=null;
  b.meta.classes.warrior={rank:10,xp:0,sub:null,v2:1,ch:{}}; // no class-choice overlay during a timed combat probe
  b.openHub();b.enterZone(1);b.nextArea();const G=b.G,p=G.p;
  const anchor={x:400,z:-2470};const wisp=G.enemies.filter(e=>e.type==='galewisp').sort((a,c)=>Math.hypot(a.x-anchor.x,a.z-anchor.z)-Math.hypot(c.x-anchor.x,c.z-anchor.z))[0];
  if(!wisp)throw Error('Lost Canyon Galewisp missing');
  const cover=G.obstacles.find(o=>o.kind==='plat'&&Math.abs(o.x-395)<2&&Math.abs(o.z+2490)<2);
  if(!cover)throw Error('Lost Canyon signal bracket missing');
  // Stable canyon slice: real Galewisp and real bracket, with random side terrain/hazards removed.
  // The live generated level is checked by the separate Lost Canyon route and save tests.
  G.enemies=[wisp];G.segments=[{x:395,z:-2490,w:700,d:700}];G.obstacles=[cover];G.walls=[];G.doors=[];G.movers=[];G.crumbles=[];G._obsDirty=true;
  G.area=-1;G.haz=null;G.canyonWind=null;G.gustX=G.gustZ=0;G.shockwaves=[];G.trails=[];G.spikefields=[];G.projectiles=[];G.pickups=[];G.chests=[];G.portal=null;G.portalPos=null;
  window.qaMid=wisp.mid;
  Object.assign(wisp,{x:400,z:-2610,y:100,sx:400,sz:-2610,active:true,dropT:0,stunT:0,hp:1000,maxHp:1000,diving:0,diveCd:0,meleeW:0,meleeActive:0,meleeCd:0});
  Object.assign(p,{x:400,z:-2470,y:0,vy:0,vx:0,vz:0,onGround:true,hp:10000,xp:0,xpNext:1e9,invuln:0,dodgeTimer:0,dodgeCdT:0});
  b.meta.camMode='shoulder';G.camYaw=-Math.PI/3;G.camPitch=.18;G.stageBanner=0;
  return {mid:wisp.mid,cover:cover.h,role:wisp.role||null};
 });
 const origin=await setup();
 await page.waitForFunction(()=>!BF_LOADING.active);
 const covered=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p,w=G.enemies.find(e=>e.mid===qaMid),o=G.obstacles.find(q=>q.kind==='plat'&&Math.abs(q.x-395)<2&&Math.abs(q.z+2490)<2);
  let minDistance=1e9,maxY=-1e9;for(let i=0;i<600;i++){b.update(.016);minDistance=Math.min(minDistance,Math.hypot(w.x-p.x,w.z-p.z));maxY=Math.max(maxY,w.y);}
  return {hp:p.hp,wisp:{x:w.x,z:w.z,y:w.y,serial:w.meleeSerial||0,hp:w.hp,dead:w.dead,active:w.active,inWorld:G.enemies.includes(w)},minDistance,maxY,cover:o&&{x:o.x,z:o.z,w:o.w,d:o.d,h:o.h},player:{x:p.x,z:p.z}};
 });
 ok('Galewisp retains its dive identity and raised bracket remains real cover',origin.role===null&&origin.cover===180&&covered.cover&&covered.hp===10000);
 ok('wisp waits outside cover instead of stalling overhead',covered.minDistance>70&&covered.maxY<130&&covered.wisp.serial===0&&covered.wisp.inWorld,covered);
 await page.waitForTimeout(240);await page.screenshot({path:'output/playwright/galewisp-cover-perch.png'});
 const open=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p,w=G.enemies.find(e=>e.mid===qaMid);
  Object.assign(p,{x:400,z:-2575,y:0,vy:0,vx:0,vz:0,onGround:true,hp:10000,invuln:0});
  let wind=false,strike=false,hit=false,elapsed=0,windY=null,strikeY=null,windAt=null,strikeAt=null;const startY=w.y;
  let deathAt=null;for(let i=0;i<500;i++){b.update(.016);if(w.meleeW>0){wind=true;windY??=w.y;windAt??={x:w.x,z:w.z};}if(w.meleeActive>0){strike=true;strikeY=w.y;strikeAt={x:w.x,z:w.z};hit=p.hp<10000;elapsed=i*.016;break;}if(w.dead){deathAt={frame:i,mode:b.mode,hp:p.hp,enemyHp:w.hp,kills:G.kills,projectiles:G.projectiles.length,shockwaves:(G.shockwaves||[]).length,portal:!!G.portal,zone:G.zone,area:G.area};break;}}
  return {wind,strike,hit,elapsed,startY,windY,strikeY,windAt,strikeAt,deathAt,hp:p.hp,player:{x:p.x,z:p.z,y:p.y},playerHeight:p.h,wisp:{x:w.x,z:w.z,y:w.y,diveCd:w.diveCd,meleeW:w.meleeW,meleeActive:w.meleeActive,meleeCd:w.meleeCd,serial:w.meleeSerial,stun:w.stunT,dead:w.dead,inWorld:G.enemies.includes(w)},floor:b.floorAt(p.x,p.z),covers:G.obstacles.filter(o=>o.kind==='plat'&&o.y0>p.y+p.h+16&&Math.abs(p.x-o.x)<o.w/2&&Math.abs(p.z-o.z)<o.d/2).map(o=>({x:o.x,z:o.z,w:o.w,d:o.d,y0:o.y0}))};
 });
 ok('leaving cover resumes a warned dive',open.wind&&open.strike&&open.elapsed<8,open);
 ok('first open-ground strike visibly descends and connects',open.hit&&open.startY>open.strikeY+20&&open.strikeY<open.playerHeight,open);
 await page.waitForTimeout(240);await page.screenshot({path:'output/playwright/galewisp-open-strike.png'});
 const dodge=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p,w=G.enemies.find(e=>e.mid===qaMid);
  if(!w)throw Error('Galewisp vanished before dodge check');
  Object.assign(w,{x:400,z:-2586,y:100,diving:0,diveCd:0,meleeW:0,meleeActive:0,meleeCd:0,hp:1000,dead:false,active:true});
  Object.assign(p,{x:400,z:-2575,y:0,vy:0,vx:0,vz:0,onGround:true,hp:10000,invuln:0,dodgeCdT:0});
  for(let i=0;i<500&&!(w.meleeW>0);i++)b.update(.016);
  const warned=w.meleeW>0&&p.hp===10000;
  p.yaw=Math.PI/2;b.input.dodgeEdge=true;b.update(.016);
  const dodgeActivated=p.dodgeTimer>0&&p.invuln>0;
  let strike=false;for(let i=0;i<90;i++){b.update(.016);if(w.meleeActive>0)strike=true;if(strike&&w.meleeActive<=0)break;}
  return {warned,dodgeActivated,strike,hp:p.hp,distance:Math.hypot(w.x-p.x,w.z-p.z),wisp:{x:w.x,z:w.z,y:w.y,dead:w.dead,inWorld:G.enemies.includes(w)}};
 });
 ok('a timed dodge avoids the Galewisp strike',dodge.warned&&dodge.dodgeActivated&&dodge.strike&&dodge.hp===10000,dodge);
 if(errors.length)throw Error(JSON.stringify(errors));
 return {checks,coveredHp:covered.hp,openHitAfter:open.elapsed,openHeightChange:open.startY-open.strikeY,dodgeHp:dodge.hp,errors};
}
