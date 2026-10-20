/* Shared, allocation-free camera slab tests. Floors beneath the player stay solid. */
(()=>{'use strict';
function entry(ax,ay,az,bx,by,bz,minX,maxX,minY,maxY,minZ,maxZ,near,far,epsilon){
 let d=bx-ax;if(Math.abs(d)<epsilon){if(ax<minX||ax>maxX)return Infinity;}else{const a=(minX-ax)/d,b=(maxX-ax)/d;near=Math.max(near,Math.min(a,b));far=Math.min(far,Math.max(a,b));if(near>far)return Infinity;}
 d=by-ay;if(Math.abs(d)<epsilon){if(ay<minY||ay>maxY)return Infinity;}else{const a=(minY-ay)/d,b=(maxY-ay)/d;near=Math.max(near,Math.min(a,b));far=Math.min(far,Math.max(a,b));if(near>far)return Infinity;}
 d=bz-az;if(Math.abs(d)<epsilon){if(az<minZ||az>maxZ)return Infinity;}else{const a=(minZ-az)/d,b=(maxZ-az)/d;near=Math.max(near,Math.min(a,b));far=Math.min(far,Math.max(a,b));if(near>far)return Infinity;}
 return near<=far?near:Infinity;
}
function blocks(world,o,bottom,top,mode,pad=4){
 const p=world?.p,e=world?.eye||world?.cam;if(!p||!e||mode==='fps'||!Number.isFinite(top)||top<=(p.y||0)+12)return false;
 const width=o.w||10,depth=o.d||width,minX=o.x-width/2-pad,maxX=o.x+width/2+pad,minZ=o.z-depth/2-pad,maxZ=o.z+depth/2+pad;
 if(Math.max(e.x,p.x)<minX||Math.min(e.x,p.x)>maxX||Math.max(e.z,p.z)<minZ||Math.min(e.z,p.z)>maxZ)return false;
 return entry(e.x,e.y??60,e.z,p.x,(p.y||0)+30,p.z,minX,maxX,bottom,top,minZ,maxZ,.02,.97,.0001)!==Infinity;
}
function constrain(world,target,desired){
 let nearest=1;const pad=7,ax=target.x,ay=target.y,az=target.z,bx=desired.x,by=desired.y,bz=desired.z;
 const rayMinX=Math.min(ax,bx),rayMaxX=Math.max(ax,bx),rayMinZ=Math.min(az,bz),rayMaxZ=Math.max(az,bz);
 const groups=[world.walls,world.obstacles,world.doors,world.cameraSolids];
 for(let group=0;group<groups.length;group++)for(const o of groups[group]||[]){
  if(group===2&&o.open||o.cameraSolid===false||o.disabled||!(o.w>0)||!(o.d>0))continue;
  const bottom=o.y0||0,top=o.h??96;if(top<=ay-24)continue;
  const minX=o.x-o.w/2-pad,maxX=o.x+o.w/2+pad,minY=bottom-pad,maxY=top+pad,minZ=o.z-o.d/2-pad,maxZ=o.z+o.d/2+pad;
  if(rayMaxX<minX||rayMinX>maxX||rayMaxZ<minZ||rayMinZ>maxZ)continue;
  // Starting inside a collider must not pin the camera to the character.
  if(ax>=minX&&ax<=maxX&&ay>=minY&&ay<=maxY&&az>=minZ&&az<=maxZ)continue;
  const hit=entry(ax,ay,az,bx,by,bz,minX,maxX,minY,maxY,minZ,maxZ,0,nearest,1e-6);
  if(hit!==Infinity)nearest=Math.min(nearest,Math.max(0,hit-.015));
 }
 return {x:ax+(bx-ax)*nearest,y:ay+(by-ay)*nearest,z:az+(bz-az)*nearest,fraction:nearest};
}
// A low obstacle immediately behind an overhead hero can retract the normal
// diagonal boom into their head. Try steeper rays at the same height before
// accepting that close-up. Each candidate still passes the identical wall,
// door and ceiling test; this never makes geometry or actors see-through.
function overview(world,target,desired){
 const normal=constrain(world,target,desired),minRise=76;
 if(normal.y-target.y>=minRise)return {...normal,steep:false};
 let best=normal,steep=false,ray=desired;
 for(const amount of [.75,.5,.25,0]){
  const candidate={x:target.x+(desired.x-target.x)*amount,y:desired.y,z:target.z+(desired.z-target.z)*amount};
  const safe=constrain(world,target,candidate);
  if(safe.y>best.y+1){best=safe;steep=true;ray=candidate;}
  if(safe.y-target.y>=minRise)break;
 }
 // Return the desired ray separately: callers may ease its safe fraction but
 // must not apply a previous ray's fraction to a newly steeper view.
 return {...best,steep,ray,look:{x:best.x,y:target.y-8,z:Math.min(target.z-4,best.z-4)}};
}
window.BFCameraOcclusion={blocks,constrain,overview};})();
