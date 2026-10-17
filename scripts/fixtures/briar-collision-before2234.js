// Historical v2.233 collision/support fixture; no dependency on Git checkout depth.
function resolveObstacles(ent,r,yRef,climbMax){
  if(!G||!G.obstacles) return;
  const ey=(yRef==null?ent.y:yRef);
  const push=(ob)=>{
    if(ey>=ob.h-2) return;
    /* THE UNDERSIDE. Until now every obstacle was a PILLAR: solid from the ground to its top, with
       no way to pass beneath it. That is right for a world of one storey and it is why Castle
       Duskmoor could not be climbed at all - the spiral passes over itself, so each turn above was
       solid rock standing on the turn below, and the player was ejected sideways off the ramp on
       the first frame. Proven by removing only the ten plats stacked over the ramp foot and
       changing nothing else: ejected to the base skirt before, standing exactly on the ramp after.
       `y0` is the OPT-IN bottom of a slab. If your head clears it, you walk under. Obstacles without
       one are pillars exactly as they have always been, which is every obstacle in every other zone,
       so this cannot change any of them. */
    if(ob.y0!=null && ey + (ent.hh || 56) <= ob.y0) return;
    // A solid STRUCTURE (building) blocks phasing-through at ground level, but must never eject someone standing on an
    // intended walkway that runs up over/through it (a climb step / plat at their feet). Check that before pushing.
    if(ob.structure){ for(const p2 of G.obstacles){ if(p2.kind==='plat' && Math.abs((p2.h||0)-ent.y)<7 && Math.abs(ent.x-p2.x)<p2.w/2+r && Math.abs(ent.z-p2.z)<p2.d/2+r) return; } }
    const dx=ent.x-ob.x, dz=ent.z-ob.z, px=ob.w/2+r-Math.abs(dx), pz=ob.d/2+r-Math.abs(dz);
    if(px>0&&pz>0){ if(px<pz) ent.x+=(dx>=0?1:-1)*px; else ent.z+=(dz>=0?1:-1)*pz; }
  };
  for(const ob of G.obstacles){ if(climbMax && ob.h<=ey+climbMax) continue; push(ob); }
  if(G.walls) for(const wl of G.walls) push(wl.courtWall?{...wl,h:(wl.y0||0)+wl.h}:wl);
  if(G.doors) for(const dr of G.doors){ if(!dr.open) push(dr); }
  if(G.torches) for(const tc of G.torches) push({x:tc.x,z:tc.z,w:16,d:16,h:60});   // torches are solid: a skinny invisible post so you bump the sconce instead of walking through it
}
/* course floors: historical boundary */
function enemySupport(e){
  let f=-Infinity;
  for(const sg of G.segments){ if(Math.abs(e.x-sg.x)<sg.w/2+e.r*0.35 && Math.abs(e.z-sg.z)<sg.d/2+e.r*0.35){ f=G.devBriar?.terrain?G.devBriar.terrain.height(e.x,e.z):0; break; } }
  for(const mv of G.movers){ if(Math.abs(e.x-mv.x)<mv.w/2+e.r*0.4 && Math.abs(e.z-mv.z)<mv.d/2+e.r*0.4) f=Math.max(f,mv.h); }
  for(const cr of G.crumbles){ if(cr.state<2 && Math.abs(e.x-cr.x)<cr.w/2+e.r*0.4 && Math.abs(e.z-cr.z)<cr.d/2+e.r*0.4) f=Math.max(f,cr.h||0); }
  for(const wl of (G.walls||[])){ if(wl.stand && e.y>=(wl.h||0)-3 && Math.abs(e.x-wl.x)<wl.w/2+e.r*0.4 && Math.abs(e.z-wl.z)<wl.d/2+e.r*0.4) f=Math.max(f,wl.h||0); }
  for(const ob of G.obstacles){ if((ob.h<=e.y+ECLIMB) && Math.abs(e.x-ob.x)<ob.w/2+e.r*0.5 && Math.abs(e.z-ob.z)<ob.d/2+e.r*0.5) f=Math.max(f,ob.h); }
  return f;
}
// A short local route respects the same collision/climb rules as actual enemy movement.
function enemyRouteEdge(e,a,b){
 const length=Math.hypot(b.x-a.x,b.z-a.z),steps=Math.max(1,Math.ceil(length/12));let y=a.y;
 for(let i=1;i<=steps;i++){
  const x=a.x+(b.x-a.x)*i/steps,z=a.z+(b.z-a.z)*i/steps,q={x,z,y,r:e.r,hh:e.hh||e.h||56};
  const floor=enemySupport(q);if(!Number.isFinite(floor)||floor>y+ECLIMB||floor<y-80)return null;
  // Require support beneath the feet, rather than the generous edge recovery tolerance.
  for(const [dx,dz]of [[e.r*.6,0],[-e.r*.6,0],[0,e.r*.6],[0,-e.r*.6]]){
   const f=enemySupport({x:x+dx,z:z+dz,y:floor,r:0});if(!Number.isFinite(f)||f<floor-44)return null;
  }
  q.y=Math.max(y,floor);resolveObstacles(q,e.r,null,ECLIMB);
  if(Math.hypot(q.x-x,q.z-z)>.1)return null;y=floor;
 }return {x:b.x,z:b.z,y};
}

function moveGroundEnemy(){}
