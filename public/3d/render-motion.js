/* Render the latest fixed-step movement smoothly without changing simulation or packets. */
(function(root){'use strict';
 let previous=null;
 function capture(world){const p=world?.p;previous=p?{world,p,x:p.x,y:p.y,z:p.z,yaw:p.yaw,warp:p.warpSerial||0}:null;}
 function begin(world,alpha,enabled=true){
  const p=world?.p,old=previous;
  if(!enabled||!p||old?.world!==world||old.p!==p||p.dead||p.downed||p.sitting||(p.warpSerial||0)!==old.warp)return ()=>{};
  const now={x:p.x,y:p.y,z:p.z,yaw:p.yaw};
  if(![old.x,old.y,old.z,old.yaw,now.x,now.y,now.z,now.yaw].every(Number.isFinite)||Math.hypot(now.x-old.x,now.y-old.y,now.z-old.z)>80)return ()=>{};
  const a=Math.max(0,Math.min(1,Number.isFinite(alpha)?alpha:1));
  p.x=old.x+(now.x-old.x)*a;p.y=old.y+(now.y-old.y)*a;p.z=old.z+(now.z-old.z)*a;
  p.yaw=old.yaw+Math.atan2(Math.sin(now.yaw-old.yaw),Math.cos(now.yaw-old.yaw))*a;
  return ()=>Object.assign(p,now);
 }
 function follow(base,dt){return 1-Math.pow(1-base,Math.max(0,Math.min(.05,Number.isFinite(dt)?dt:1/60))*60);}
 const api={capture,begin,follow};root.BFRenderMotion=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
