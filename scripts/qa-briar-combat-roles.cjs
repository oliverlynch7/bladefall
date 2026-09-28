async page=>{
 await page.goto('http://127.0.0.1:4331/3d/?mute=1');await page.waitForFunction(()=>window.__BF3&&HERO3D?.ready);
 await page.evaluate(async()=>{const b=__BF3;await b.briarReady;b.loadMode('rl');Object.assign(b.meta,{run:null,bank:null,introSeen:true,hubTutDone:true,tutOff:true,autoAttack:false,petActive:null,dialogueTTS:false,classId:'warrior'});});
 const result=[];
 for(const area of [0,1]){
  await page.evaluate(area=>{const b=__BF3;b.openHub();b.enterZone(0);b.G.area=area;b.loadArea();},area);
  await page.waitForFunction(()=>!window.BF_LOADING?.active);
  result.push(await page.evaluate(area=>{
   const b=__BF3,G=b.G,p=G.p;for(const e of G.enemies){BFCampaignElites.briar(e);e.stunT=99999;}
   const roles=G.enemies.filter(e=>e.briarRole);const tests=[];
   for(const role of ['runner','guard','hex']){
    const e=roles.find(e=>e.briarRole===role&&e.homeRaid)||roles.find(e=>e.briarRole===role);if(!e)throw Error('missing '+role+' in '+area);
    // Flat authored spawn, one attacker, real update/damage paths.
    let spot=null;for(let dx=-400;dx<=400&&!spot;dx+=80)for(let dz=-400;dz<=400;dz+=80){const x=e.x+dx,z=e.z+dz,y=b.enemySupport({...e,x,z});if(Number.isFinite(y)&&Math.abs(y-e.y)<30&&!G.obstacles.some(o=>o.h>y+35&&Math.abs(o.x-(x+70))<o.w/2+200&&Math.abs(o.z-z)<o.d/2+150)){spot={x,z,y};break;}}if(!spot)throw Error('no clear ground '+area+role);Object.assign(e,spot);const home={...spot};let travelled=0;Object.assign(e,{active:true,dropT:0,stunT:0,ceState:'hunt',ceClock:0});
    Object.assign(p,{x:e.x+90,z:e.z,y:e.y,hp:100000,maxHp:100000,invuln:0,vx:0,vz:0,vy:0});
    const phases=new Set();for(let i=0;i<270;i++){b.update(.016);phases.add(e.ceState);travelled=Math.max(travelled,Math.hypot(e.x-home.x,e.z-home.z));}
    tests.push({role,damage:100000-p.hp,phases:[...phases],size:e.h,movement:travelled});
    e.stunT=99999;
   }
   if(tests.some(t=>t.damage<=0||!t.phases.includes('wind')||!t.phases.includes('recover')))throw Error(JSON.stringify({area,tests}));
   return {area,roles:roles.reduce((a,e)=>(a[e.briarRole]=(a[e.briarRole]||0)+1,a),{}),tests,slots:G.patrolWork.slots.length,task:G.patrolWork.title};
  },area));
 }
 return result;
}
