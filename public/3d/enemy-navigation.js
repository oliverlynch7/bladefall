(function(root){
 'use strict';
 // Bounded local search; callers validate each swept edge against live collision/support.
 function route(start,target,edge,step=48,limit=96){
  const distance=p=>Math.hypot(p.x-target.x,p.z-target.z);
  const first={...start,i:0,j:0,g:0,parent:null},open=[first],bestCost=new Map([['0,0',0]]);
  let best=first,expanded=0;
  while(open.length&&expanded++<limit){
   open.sort((a,b)=>(a.g+distance(a))-(b.g+distance(b)));
   const n=open.shift();if(distance(n)<distance(best))best=n;
   if(distance(n)<step*.8){best=n;break;}
   for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
    const i=n.i+di,j=n.j+dj;if(Math.abs(i)>8||Math.abs(j)>8)continue;
    const g=n.g+step*Math.hypot(di,dj),key=i+','+j;if(g>=(bestCost.get(key)??Infinity))continue;
    const q=edge(n,{x:start.x+i*step,z:start.z+j*step,y:n.y});if(!q)continue;
    bestCost.set(key,g);open.push({...q,i,j,g,parent:n});
   }
  }
  const path=[];for(let n=best;n.parent;n=n.parent)path.unshift({x:n.x,y:n.y,z:n.z});
  return path;
 }
 // Slab intersection includes height: low floors/overhead beams do not block a torso hit.
 function blocked(a,b,boxes){
  for(const box of boxes){
   if(box.open||box.solid===false)continue;
   let lo=0,hi=1;
   for(const [axis,min,max] of [['x',box.x-box.w/2,box.x+box.w/2],['z',box.z-box.d/2,box.z+box.d/2],['y',box.y0||0,box.h||0]]){
    const delta=b[axis]-a[axis];
    if(Math.abs(delta)<1e-8){if(a[axis]<=min||a[axis]>=max){hi=-1;break;}}
    else {let u=(min-a[axis])/delta,v=(max-a[axis])/delta;if(u>v)[u,v]=[v,u];lo=Math.max(lo,u);hi=Math.min(hi,v);}
    if(lo>hi)break;
   }
   if(lo<=hi&&hi>0&&lo<1)return true;
  }return false;
 }
 root.BFEnemyNavigation={route,blocked};
 if(typeof module!=='undefined')module.exports=root.BFEnemyNavigation;
})(typeof window!=='undefined'?window:globalThis);
