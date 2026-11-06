async page=>{
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
 await page.reload();
 await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready,null,{polling:100,timeout:30000});
 return page.evaluate(async()=>{
  const b=__BF3;await b.briarReady;b.loadMode('rl');
  Object.assign(b.meta,{classId:'warrior',introSeen:true,hubTutDone:true,tutOff:true,run:null,bank:null,camMode:'far',autoAttack:false});
  b.openHub();b.enterZone(0);
  const p=b.G.p,{x,z}=p;
  const check=(pass,data)=>{if(!pass)throw Error(JSON.stringify(data));};
  const pump=n=>{for(let i=0;i<n;i++)b.update(1/60);};
  for(const mob of b.G.enemies)mob.stunT=9999;
  const e=b.spawnEnemy('king',x,z);
  Object.assign(e,{x,z,y:p.y,sx:x,sz:z,active:true,dropT:0,home:null,atkTimer:8,summonT:999,courtCd:999,yaw:0,lunge:.005});
  const place=(px,pz)=>Object.assign(p,{x:px,z:pz,vx:0,vy:0,vz:0,onGround:true,invuln:100});
  place(x,z-105);pump(1);const origin={x:e.x,z:e.z};
  pump(24);const recovery={distance:Math.hypot(e.x-origin.x,e.z-origin.z),yaw:e.yaw,lunge:e.lunge};
  pump(24);const pivot={distance:Math.hypot(e.x-origin.x,e.z-origin.z),yaw:e.yaw};
  pump(100);const pursuit={distance:Math.hypot(e.x-origin.x,e.z-origin.z),yaw:e.yaw};
  check(recovery.distance<.001&&pivot.distance<.001,{recovery,pivot});
  check(Math.abs(recovery.yaw)<.001&&Math.abs(pivot.yaw)>.1&&pursuit.distance>6,{recovery,pivot,pursuit});
  return {version:b.snap().version,recovery,pivot,pursuit};
 });
}
