/* Campaign hand/eye reach is checked at both the prompt and host boundary. */
(function(root){
 'use strict';
 function intersects(a,b,o,relativeHeight=false){
  if(o.open||o.disabled||o.solid===false||o.nocol||!(o.w>0)||!(o.d>0))return false;
  const bottom=o.y0||0,top=(o.h||0)+(relativeHeight?bottom:0);
  let enter=.015,leave=.985;
  for(const [axis,min,max]of [['x',o.x-o.w/2,o.x+o.w/2],['z',o.z-o.d/2,o.z+o.d/2],['y',bottom,top]]){
   const delta=b[axis]-a[axis];
   if(Math.abs(delta)<1e-8){if(a[axis]<=min||a[axis]>=max)return false;}
   else{let u=(min-a[axis])/delta,v=(max-a[axis])/delta;if(u>v)[u,v]=[v,u];enter=Math.max(enter,u);leave=Math.min(leave,v);}
   if(enter>leave)return false;
  }
  return enter<=leave;
 }
 function reachable(g,p,o){
  if(!g||!p||!o)return false;
  // Existing hub/boss/side-mode interfaces retain their separate interaction rules.
  if(g.hub||g.side||g.trial||g.delve||g.riftHall||g.area<0)return true;
  const a={x:p.x,y:(p.y||0)+45,z:p.z},b={x:o.x,y:(o.y||0)+52,z:o.z};
  if(![a.x,a.y,a.z,b.x,b.y,b.z].every(Number.isFinite))return false;
  for(const w of g.walls||[])if(intersects(a,b,w,!!w.courtWall))return false;
  // Only an explicitly owned control body is omitted; an adjacent wall still blocks.
  for(const w of g.obstacles||[])if(!(o.key&&w.interactionKey===o.key)&&intersects(a,b,w))return false;
  for(const w of g.doors||[])if(intersects(a,b,w))return false;
  return true;
 }
 root.BFCampaignInteraction={reachable,intersects};
 if(typeof module!=='undefined')module.exports=root.BFCampaignInteraction;
})(typeof window!=='undefined'?window:globalThis);
