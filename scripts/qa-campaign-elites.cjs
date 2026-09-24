async page=>{const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&window.HERO3D?.ready);return page.evaluate(async()=>{
 const b=__BF3;await b.briarReady;b.loadMode('rl');b.meta.introSeen=true;b.meta.autoAttack=false;b.meta.petActive=null;b.meta.dialogueTTS=false;b.meta.classId='warrior';const rows=[];
 for(const zone of [0,4,5,7]){b.openHub();b.enterZone(zone);const g=b.G,p=g.p,e=g.enemies.find(e=>e.ceKind),k=BFCampaignElites.kits[e.ceKind];for(const q of g.enemies)if(q!==e)q.stunT=999;
  let spot;for(const dist of [90,65,40]){for(let i=0;i<16;i++){const a=i*Math.PI/8,q={...e,r:p.r,x:e.x+Math.sin(a)*dist,z:e.z+Math.cos(a)*dist},floor=b.enemySupport(q),x=q.x,z=q.z;q.y=floor;b.resolveObstacles(q,q.r,null,0);if(Math.abs(floor-e.y)<15&&Math.hypot(q.x-x,q.z-z)<2){spot={x,z,y:floor};break;}}if(spot)break;}if(!spot)throw Error('No supported combat spot '+zone);
  Object.assign(p,{...spot,hp:10000,invuln:0,dodgeTimer:0,vx:0,vz:0,vy:0,onGround:true});Object.assign(e,{active:true,dropT:0,stunT:0,ceClock:0});const hp=p.hp;let n=0;while(e.ceState!=='wind'&&n++<300)b.update(.01);if(e.ceState!=='wind')throw Error('Never attacked '+zone);
  const clock=e.ceClock;e.stunT=1;for(let i=0;i<30;i++)b.update(.01);if(e.ceClock!==clock)throw Error('Stun skipped windup');e.stunT=0;
  while(e.ceState==='wind'){b.update(.01);if(e.ceState==='wind'&&p.hp!==hp)throw Error('Damage in warning '+zone);}
  let contacts=0,last=p.hp;while(e.ceState==='strike'){b.update(.01);if(p.hp<last)contacts++;last=p.hp;}
  if(!(p.hp<hp))throw Error('No strike damage '+JSON.stringify({zone,spot,e:{x:e.x,y:e.y,z:e.z,phase:e.ceState,dir:[e.ceDX,e.ceDZ]},p:{x:p.x,y:p.y,z:p.z}}));
  const after=p.hp;while(e.ceState==='recover')b.update(.01);if(p.hp!==after)throw Error('Recovery deals damage');if(contacts>1)throw Error('Repeated strike damage');
  rows.push({zone,kind:e.ceKind,damage:hp-after,recoverySafe:true,warningSafe:true,stunSafe:true,position:[e.x,e.y,e.z]});
 }return rows;
 });}
