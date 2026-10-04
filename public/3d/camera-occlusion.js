/* One height convention: callers supply absolute bottom and top. Never cut away support. */
(()=>{'use strict';
function blocks(world,o,bottom,top,mode,pad=4){
 const p=world?.p,e=world?.eye||world?.cam;if(!p||!e||mode==='fps'||!Number.isFinite(top)||top<=(p.y||0)+12)return false;
 const width=o.w||10,depth=o.d||width;
 const bounds=[[e.x,p.x,o.x-width/2-pad,o.x+width/2+pad],[e.y??60,(p.y||0)+30,bottom,top],[e.z,p.z,o.z-depth/2-pad,o.z+depth/2+pad]];
 let near=.02,far=.97;
 for(const [start,end,min,max] of bounds){const delta=end-start;if(Math.abs(delta)<.0001){if(start<min||start>max)return false;}else{const a=(min-start)/delta,b=(max-start)/delta;near=Math.max(near,Math.min(a,b));far=Math.min(far,Math.max(a,b));if(near>far)return false;}}
 return near<=far;
}
// Sweep a padded camera from the character toward its requested position. h is
// absolute top (the same convention as movement); cameraSolids includes roofs.
function constrain(world,target,desired){
 let nearest=1;const pad=7;
 const solids=[...(world.walls||[]),...(world.obstacles||[]),...(world.doors||[]).filter(o=>!o.open),...(world.cameraSolids||[])];
 for(const o of solids){
  if(o.cameraSolid===false||o.disabled||!(o.w>0)||!(o.d>0))continue;
  const bottom=o.y0||0,top=o.h??96;if(top<=target.y-24)continue;
  const lo=[o.x-o.w/2-pad,bottom-pad,o.z-o.d/2-pad],hi=[o.x+o.w/2+pad,top+pad,o.z+o.d/2+pad];
  const a=[target.x,target.y,target.z],b=[desired.x,desired.y,desired.z];
  // Already inside a collider: never pin the camera at zero distance.
  if(a.every((v,i)=>v>=lo[i]&&v<=hi[i]))continue;
  let enter=0,leave=nearest;
  for(let i=0;i<3;i++){const d=b[i]-a[i];if(Math.abs(d)<1e-6){if(a[i]<lo[i]||a[i]>hi[i]){enter=2;break;}}else{const u=(lo[i]-a[i])/d,v=(hi[i]-a[i])/d;enter=Math.max(enter,Math.min(u,v));leave=Math.min(leave,Math.max(u,v));}if(enter>leave)break;}
  if(enter<=leave&&enter>=0)nearest=Math.min(nearest,Math.max(0,enter-.015));
 }
 return {x:target.x+(desired.x-target.x)*nearest,y:target.y+(desired.y-target.y)*nearest,z:target.z+(desired.z-target.z)*nearest,fraction:nearest};
}
window.BFCameraOcclusion={blocks,constrain};})();
