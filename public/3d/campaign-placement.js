/* Keep authored encounter positions on their own floor. This runs at area setup,
   not during AI movement; no random relocation, new enemies or reward changes. */
(function(root){'use strict';
 function seat(enemy,api){
  if(!enemy||enemy.dead||enemy.crackWall||enemy.boss||enemy.dummy||enemy.practice||enemy.kind==='fly'||enemy.authoredStorey)return {skipped:true};
  const start={x:enemy.x,y:Number(enemy.y)||0,z:enemy.z},r=enemy.r||14;
  const spot=(x,z)=>{
   const y=api.floor(x,z,0,start.y+48);
   if(!Number.isFinite(y)||y>start.y+48||y<start.y-90)return null;
   // Real feet must be supported. An actor's collision tolerance is not a ledge.
   for(const [dx,dz]of [[r*.7,0],[-r*.7,0],[0,r*.7],[0,-r*.7]]){
    const f=api.floor(x+dx,z+dz,0,y+2);if(!Number.isFinite(f)||f<y-30)return null;
   }
   const q={x,y,z,r,hh:enemy.hh||56};api.resolve(q,r,null,0);
   if(Math.hypot(q.x-x,q.z-z)>.1)return null;
   return {x,y,z};
  };
  let point=spot(start.x,start.z);
  if(!point){
   const choices=[];
   for(const distance of [24,48,72,96])for(let i=0;i<16;i++){
    const angle=i*Math.PI/8,q=spot(start.x+Math.cos(angle)*distance,start.z+Math.sin(angle)*distance);
    if(q)choices.push({q,score:distance+Math.abs(q.y-start.y)*.35});
   }
   choices.sort((a,b)=>a.score-b.score);point=choices[0]?.q;
  }
  if(!point)return {unresolved:true,type:enemy.type,at:start};
  const moved=Math.hypot(point.x-start.x,point.y-start.y,point.z-start.z)>.1;
  Object.assign(enemy,point,{sx:point.x,sy:point.y,sz:point.z});
  return {moved,type:enemy.type,from:start,to:point,mid:enemy.mid};
 }
 function settle(g,api){
  const results=(g.enemies||[]).map(e=>seat(e,api));
  for(const slot of g.patrolWork?.slots||[]){const e=g.enemies.find(e=>e.mid===slot.mid);if(e){slot.x=e.x;slot.y=e.y;slot.z=e.z;}}
  g.campaignPlacement={moved:results.filter(r=>r.moved),unresolved:results.filter(r=>r.unresolved)};
  return g.campaignPlacement;
 }
 root.BFCampaignPlacement={seat,settle};if(typeof module!=='undefined')module.exports=root.BFCampaignPlacement;
})(typeof window!=='undefined'?window:globalThis);
