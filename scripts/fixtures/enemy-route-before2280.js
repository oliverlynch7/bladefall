function enemySupport(e){
  const context=arguments[1]||G;let f=-Infinity;
  for(const sg of context.segments){ if(Math.abs(e.x-sg.x)<sg.w/2+e.r*0.35 && Math.abs(e.z-sg.z)<sg.d/2+e.r*0.35){ f=G.devBriar?.terrain?G.devBriar.terrain.height(e.x,e.z):0; break; } }
  for(const mv of context.movers){ if(Math.abs(e.x-mv.x)<mv.w/2+e.r*0.4 && Math.abs(e.z-mv.z)<mv.d/2+e.r*0.4) f=Math.max(f,mv.h); }
  for(const cr of context.crumbles){ if(cr.state<2 && Math.abs(e.x-cr.x)<cr.w/2+e.r*0.4 && Math.abs(e.z-cr.z)<cr.d/2+e.r*0.4) f=Math.max(f,cr.h||0); }
  for(const wl of (context.walls||[])){ if(wl.stand && e.y>=(wl.h||0)-3 && Math.abs(e.x-wl.x)<wl.w/2+e.r*0.4 && Math.abs(e.z-wl.z)<wl.d/2+e.r*0.4) f=Math.max(f,wl.h||0); }
  for(const ob of context.obstacles){ if((ob.h<=e.y+ECLIMB) && Math.abs(e.x-ob.x)<ob.w/2+e.r*0.5 && Math.abs(e.z-ob.z)<ob.d/2+e.r*0.5) f=Math.max(f,ob.h); }
  return f;
}
// A short local route respects the same collision/climb rules as actual enemy movement.
function enemyRouteEdge(e,a,b){
 const context=arguments[3];const length=Math.hypot(b.x-a.x,b.z-a.z),steps=Math.max(1,Math.ceil(length/12));let y=a.y;
 for(let i=1;i<=steps;i++){
  const x=a.x+(b.x-a.x)*i/steps,z=a.z+(b.z-a.z)*i/steps,q={x,z,y,r:e.r,hh:e.hh||e.h||56};
  const floor=enemySupport(q,context);if(!Number.isFinite(floor)||floor>y+ECLIMB||floor<y-80)return null;
  // Require support beneath the feet, rather than the generous edge recovery tolerance.
  for(const [dx,dz]of [[e.r*.6,0],[-e.r*.6,0],[0,e.r*.6],[0,-e.r*.6]]){
   const f=enemySupport({x:x+dx,z:z+dz,y:floor,r:0},context);if(!Number.isFinite(f)||f<floor-44)return null;
  }
  q.y=Math.max(y,floor);resolveObstacles(q,e.r,null,ECLIMB,context);
  if(Math.hypot(q.x-x,q.z-z)>.1)return null;y=floor;
 }return {x:b.x,z:b.z,y};
}
// A route never leaves its 8-cell search window. Filter broad-phase candidates once per search.
function enemyRouteContext(e){
 const margin=arguments[1]??(512+(e.r||0)),near=o=>Math.abs(o.x-e.x)<=margin+(o.w||0)/2&&Math.abs(o.z-e.z)<=margin+(o.d||0)/2;
 return {segments:G.segments.filter(near),obstacles:G.obstacles.filter(near),walls:(G.walls||[]).filter(near),movers:G.movers,crumbles:G.crumbles};
}
function moveGroundEnemy(e,dx,dz,speed,dt,range=300){
 if(speed<=0)return;const length=Math.hypot(dx,dz);if(length<.001)return;dx/=length;dz/=length;
 const reach=Math.max(1,Math.min(300,range)),look=Math.min(reach,Math.max(48,speed*dt));
 const goal={x:e.x+dx*reach,z:e.z+dz*reach,y:e.y},ahead={x:e.x+dx*look,z:e.z+dz*look};
 const directContext=enemyRouteContext(e,look+2*(e.r||0)+32);
 const direct=enemyRouteEdge(e,e,ahead,directContext);let node;
 if(direct){e._route=null;node=ahead;}
 else {
  if(e._route&&Math.hypot(goal.x-e._routeGoal.x,goal.z-e._routeGoal.z)>180)e._route=null;
  if((!e._route||!e._route.length)&&(e._routeAt||0)<=G.time){
   if(G._navTime!==G.time){G._navTime=G.time;G._navCount=0;}
   if(G._navCount<2){G._navCount++;const context=enemyRouteContext(e);e._route=BFEnemyNavigation.route(e,goal,(a,b)=>enemyRouteEdge(e,a,b,context));e._routeGoal=goal;e._routeAt=G.time+.6;}
  }
  while(e._route?.length&&Math.hypot(e._route[0].x-e.x,e._route[0].z-e.z)<8)e._route.shift();
  node=e._route?.[0];
 }
 if(!node)return;
 const d=Math.hypot(node.x-e.x,node.z-e.z),step=Math.min(speed*dt,d);if(d<.001)return;
 const next={x:e.x+(node.x-e.x)/d*step,z:e.z+(node.z-e.z)/d*step};
 if(enemyRouteEdge(e,e,next,directContext)){e.x=next.x;e.z=next.z;}
 else {e._route=null;e._routeAt=Math.min(e._routeAt||0,G.time+.15);}
}
