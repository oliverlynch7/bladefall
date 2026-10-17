function moveGroundEnemy(e,dx,dz,speed,dt,range=300){
 if(speed<=0)return;const length=Math.hypot(dx,dz);if(length<.001)return;dx/=length;dz/=length;
 const reach=Math.max(1,Math.min(300,range)),look=Math.min(reach,Math.max(48,speed*dt));
 const goal={x:e.x+dx*reach,z:e.z+dz*reach,y:e.y},ahead={x:e.x+dx*look,z:e.z+dz*look};
 const direct=enemyRouteEdge(e,e,ahead);let node;
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
 if(enemyRouteEdge(e,e,next)){e.x=next.x;e.z=next.z;}
 else {e._route=null;e._routeAt=Math.min(e._routeAt||0,G.time+.15);}
}
