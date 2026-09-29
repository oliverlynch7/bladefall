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
window.BFCameraOcclusion={blocks};})();
