/* Cached, height-aware visibility for compact hostile health meters. */
(function(root){'use strict';
const cache=new WeakMap();
function hits(a,b,o){
 if(!o||o.open||o.disabled||o.cameraSolid===false||!(o.w>0)||!(o.d>0))return false;
 const bottom=o.y0||0,top=o.kind==='plat'?o.h:bottom+(o.h||0);
 if(!(top>bottom)||Math.max(a.x,b.x)<o.x-o.w/2||Math.min(a.x,b.x)>o.x+o.w/2||Math.max(a.z,b.z)<o.z-o.d/2||Math.min(a.z,b.z)>o.z+o.d/2||Math.min(a.y,b.y)>top||Math.max(a.y,b.y)<bottom)return false;
 let enter=.015,leave=.985;
 for(let i=0;i<3;i++){
  const k=i===0?'x':i===1?'y':'z',lo=i===0?o.x-o.w/2:i===1?bottom:o.z-o.d/2,hi=i===0?o.x+o.w/2:i===1?top:o.z+o.d/2,d=b[k]-a[k];
  if(Math.abs(d)<1e-6){if(a[k]<lo||a[k]>hi)return false;}
  else{const u=(lo-a[k])/d,v=(hi-a[k])/d;enter=Math.max(enter,Math.min(u,v));leave=Math.min(leave,Math.max(u,v));if(enter>leave)return false;}
 }
 return enter<=leave;
}
function visible(world,e,time){
 if(!world?.p||!e||e.dead||e.hp<=0||e.hydraChain||e.dropT>20)return false;
 const d=Math.hypot(e.x-world.p.x,e.z-world.p.z);
 if(d>(e.campaignElite?900:e.boss||e.hp<e.maxHp?1000:780))return false;
 const a=world.eye||{x:world.p.x,y:(world.p.y||0)+35,z:world.p.z},b={x:e.x,y:(e.y||0)+(e.h||38)*.8,z:e.z};
 const old=cache.get(e);
 if(old?.world===world&&time>=old.time&&time-old.time<.12&&Math.abs(a.x-old.ax)+Math.abs(a.y-old.ay)+Math.abs(a.z-old.az)<18&&Math.abs(b.x-old.x)+Math.abs(b.y-old.y)+Math.abs(b.z-old.z)<12)return old.visible;
 let shown=true;
 for(const solids of [world.walls,world.obstacles,world.doors,world.cameraSolids]){
  if(solids?.some(o=>hits(a,b,o))){shown=false;break;}
 }
 cache.set(e,{world,time,ax:a.x,ay:a.y,az:a.z,x:b.x,y:b.y,z:b.z,visible:shown});return shown;
}
const api={visible,hits};root.BFEnemyHealth=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
