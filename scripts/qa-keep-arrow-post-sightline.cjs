async page=>{
 const errors=[],checks=[],ok=(name,pass,detail)=>{if(!pass)throw Error(name+(detail?' '+JSON.stringify(detail):''));checks.push(name);};
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4331/3d/?mute=1&qa=keep-arrow-2165');
 await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 const setup=await page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;
  b.meta.introSeen=true;b.meta.classId='warrior';b.meta.tutOff=true;b.meta.autoAttack=false;b.meta.petActive=null;
  b.meta.classes.warrior={rank:10,xp:0,sub:null,v2:1,ch:{}};
  b.openHub();b.enterZone(2);const G=b.G,p=G.p;
  const caster=G.enemies.find(e=>e.type==='caster'&&e.keepGuard==='arrow');
  if(!caster)throw Error('Arrow-post caster missing');
  for(const e of G.enemies)if(e!==caster)e.stunT=999;
  Object.assign(caster,{active:true,dropT:0,stunT:0});
  Object.assign(p,{x:660,z:-880,y:150,vy:0,vx:0,vz:0,onGround:true,hp:10000,maxHp:10000,xp:0,xpNext:1e9,invuln:0,dodgeTimer:0});
  G.stageBanner=0;window.qaArrowCaster=caster.mid;
  const east=G.obstacles.find(o=>o.kind==='col'&&o.x===530&&o.z===-900),west=G.obstacles.find(o=>o.kind==='col'&&o.x===-530&&o.z===-900);
  const groundBlocked=BFEnemyNavigation.blocked({x:530,z:-980,y:45},{x:530,z:-820,y:45},G.obstacles);
  const upperBlocked=BFEnemyNavigation.blocked({x:660,z:-980,y:175},{x:660,z:-880,y:175},G.obstacles);
  const wallActor={x:530,z:-900,y:0,r:18,hh:56};b.resolveObstacles(wallActor,wallActor.r,null,0);
  return {east:east&&{h:east.h,w:east.w,d:east.d},west:west&&{h:west.h},groundBlocked,upperBlocked,groundPush:Math.hypot(wallActor.x-530,wallActor.z+900)};
 });
 await page.waitForFunction(()=>!BF_LOADING.active);
 ok('eastern wall sits below the post while the western wall remains',setup.east?.h===138&&setup.west?.h===240,setup);
 ok('ground barrier collides and still blocks ground-level sight',setup.groundBlocked&&setup.groundPush>40,setup);
 ok('upper arrow post has an open sightline',!setup.upperBlocked,setup);
 const combat=await page.evaluate(()=>{
  const b=__BF3,G=b.G,p=G.p,e=G.enemies.find(q=>q.mid===qaArrowCaster);
  let shot=false,wind=false,firstDamage=null;
  for(let i=0;i<370;i++){b.update(.016);if(e.shotW>0)wind=true;if(G.projectiles.some(q=>q.owner==='enemy'))shot=true;if(firstDamage==null&&p.hp<10000)firstDamage=i*.016;}
  return {active:e.active,dead:e.dead,wind,shot,firstDamage,hp:p.hp,enemy:{x:e.x,z:e.z},player:{x:p.x,z:p.z,y:p.y},mode:b.mode};
 });
 ok('caster aims, releases a projectile and damages an exposed player',combat.active&&!combat.dead&&combat.wind&&combat.shot&&combat.hp<10000&&combat.firstDamage<5.92&&combat.mode==='play',combat);
 await page.screenshot({path:'output/playwright/keep-arrow-post-sightline.png'});
 if(errors.length)throw Error(JSON.stringify(errors));
 return {checks,firstDamage:combat.firstDamage,playerHp:combat.hp,errors};
}
