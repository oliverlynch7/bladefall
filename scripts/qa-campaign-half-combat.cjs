async page=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);
 const result=await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.run=null;b.meta.bank=null;b.meta.introSeen=true;b.meta.autoAttack=false;b.meta.petActive=null;b.meta.classId='warrior';b.openHub();const results=[];
 for(let z=0;z<8;z++)for(const area of [0,1]){
  b.openHub();b.enterZone(z);b.G.area=area;b.loadArea();if(b.G.zone!==z||b.G.area!==area)throw Error('Wrong scene');const G=b.G,p=G.p;if(z===4&&area===1){G.storyState.flags['gf.alarm']=true;b.briarSync();}
  const candidates=area<0?[G.boss]:G.enemies.filter(e=>!e.dead&&!e.crackWall&&e.dmg>0).sort((a,c)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(c.x-p.x,c.z-p.z));
  let e,spot;for(const enemy of candidates){if(!enemy)continue;for(const distance of [100,70,40]){for(let a=0;a<8;a++){const q={...enemy,x:enemy.x+Math.sin(a*Math.PI/4)*distance,z:enemy.z+Math.cos(a*Math.PI/4)*distance,r:p.r},floor=b.enemySupport(q);if(!Number.isFinite(floor)||Math.abs(floor-enemy.y)>15)continue;q.y=floor;const before=[q.x,q.z];b.resolveObstacles(q,q.r,null,0);if(Math.hypot(q.x-before[0],q.z-before[1])>2)continue;spot={x:q.x,z:q.z,y:floor};e=enemy;break;}if(e)break;}if(e)break;}
  if(!e){results.push({z,area,error:'No safe combat spot'});continue;}
  Object.assign(p,{...spot,hp:100000,invuln:0,dodgeTimer:0,vx:0,vz:0,vy:0,onGround:true});const start={x:e.x,z:e.z,hp:p.hp},states=new Set();let attack=false,projectile=false,maxMove=0;
  for(let i=0;i<1250;i++){b.update(.016);if(e.windT>0||e.meleeW>0||e.shotW>0||e.wind>0||e.lunge>0||e.chargeT>0)attack=true;for(const key of ['bruteState','fallState','markState','offState','bState'])if(e[key])states.add(e[key]);if(G.projectiles.some(p=>p.owner==='enemy'))projectile=true;maxMove=Math.max(maxMove,Math.hypot(e.x-start.x,e.z-start.z));}
  results.push({z,area,type:e.type,eliteKind:e.ceKind,active:e.active,movement:Math.round(maxMove),attack,projectile,states:[...states],damage:Math.round(start.hp-p.hp),mode:b.mode,player:[p.x,p.y,p.z],enemy:[e.x,e.y,e.z]});
 }
 return results;});if(errors.length)throw Error(JSON.stringify(errors));for(const r of result){if(r.error||!r.active||r.damage<=0||(!r.attack&&!r.projectile&&!r.states.includes('strike'))||(r.area>=0&&r.eliteKind!=='shore'&&r.movement<10))throw Error('Combat failed: '+JSON.stringify(r));}return {result,errors};
}
