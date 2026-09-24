/* Named campaign encounters: shared attack geometry, host-owned phase clock. */
(function(root){'use strict';
const kits={
 raid:{wind:.95,strike:.24,recover:1.15,reach:150,color:'#efb663',title:'Wide sweep',hint:'Step behind the raid leader.',damage:1.15},
 forge:{wind:1.2,strike:.7,recover:1.4,reach:210,color:'#ff9856',title:'Ground pulse',hint:'Jump the ring, or move outside it.',damage:1.25},
 shore:{wind:1.15,strike:.26,recover:1.35,reach:360,color:'#83dce6',title:'Scatter shot',hint:'Move between the three aim lines.',damage:1.1},
 tower:{wind:1.25,strike:.28,recover:1.5,reach:200,color:'#c5a3f3',title:'Cross strike',hint:'Stand between the crossing lines.',damage:1.25}
};
function setup(e,zone){const kind={0:'raid',4:'forge',5:'shore',7:'tower'}[zone];if(!kind)return;if(e.role==='exploder')e.speed/=1.28;else if(e.role==='flanker')e.speed/=1.15;if(zone===5)Object.assign(e,{x:-180,z:-1100,y:30,sx:-180,sz:-1100,sy:30});Object.assign(e,{ceKind:kind,ceState:'hunt',ceClock:1.2,ceSerial:0,role:null,spec:null,kind:'walk',shot:null,meleeW:0,meleeActive:0});}
function step(e,dt,target,speed){const k=kits[e.ceKind];if(!k||e.dead||!target)return;dt=Math.min(.05,Math.max(0,dt));e.ceClock=Math.max(0,e.ceClock-dt);
 if(e.ceState==='hunt'){
  const dx=target.x-e.x,dz=target.z-e.z,d=Math.hypot(dx,dz)||1;
  e.yaw=Math.atan2(dx,dz);const stop=e.ceKind==='shore'?210:85;
  if(d>stop){const move=Math.min(d-stop,speed*dt);e.x+=dx/d*move;e.z+=dz/d*move;}
  if(e.ceClock===0&&d<k.reach+35&&Math.abs(target.y-e.y)<65){Object.assign(e,{ceState:'wind',ceClock:k.wind,ceSerial:e.ceSerial+1,ceX:e.x,ceZ:e.z,ceY:e.y,ceDX:dx/d,ceDZ:dz/d});}
 }else{e.yaw=Math.atan2(e.ceDX,e.ceDZ);
  if(e.ceClock===0){if(e.ceState==='wind'){e.ceState='strike';e.ceClock=k.strike;}else if(e.ceState==='strike'){e.ceState='recover';e.ceClock=k.recover;}else{e.ceState='hunt';e.ceClock=0;}}
 }
}
function local(e,p){const dx=p.x-e.ceX,dz=p.z-e.ceZ;return {forward:dx*e.ceDX+dz*e.ceDZ,side:dx*e.ceDZ-dz*e.ceDX,d:Math.hypot(dx,dz)};}
function contains(e,p){const k=kits[e.ceKind];if(!k||e.ceState!=='strike'||e.dead||p.hp<=0)return false;const height=p.y-e.ceY;if(height> (e.ceKind==='forge'?38:85)||height< -45)return false;
 const q=local(e,p),r=Math.min(20,p.r||12);
 if(e.ceKind==='raid')return q.d<=k.reach+r&&(q.d<r||q.forward/(q.d||1)>=Math.cos(1.05));
 if(e.ceKind==='forge'){const wave=25+(k.reach-25)*(1-e.ceClock/k.strike);return Math.abs(q.d-wave)<r+24;}
 if(e.ceKind==='tower')return (Math.abs(q.forward)<k.reach+r&&Math.abs(q.side)<22+r)||(Math.abs(q.side)<k.reach+r&&Math.abs(q.forward)<22+r);
 return [-.32,0,.32].some(a=>{const f=q.forward*Math.cos(a)+q.side*Math.sin(a),s=q.side*Math.cos(a)-q.forward*Math.sin(a);return f>=-r&&f<k.reach+r&&Math.abs(s)<13+r;});
}
// Solid props above the combat floor stop a strike; floor slabs do not.
function blocked(e,p,obstacles){return obstacles.some(o=>{
 if(o.h<=e.ceY+35||(o.y0||0)>e.ceY+85)return false;
 let lo=0,hi=1;for(const [start,delta,center,half]of [[e.ceX,p.x-e.ceX,o.x,o.w/2],[e.ceZ,p.z-e.ceZ,o.z,o.d/2]]){
  if(Math.abs(delta)<.0001){if(Math.abs(start-center)>=half)return false;continue;}
  let a=(center-half-start)/delta,b=(center+half-start)/delta;if(a>b)[a,b]=[b,a];lo=Math.max(lo,a);hi=Math.min(hi,b);if(lo>=hi)return false;
 }return hi>0&&lo<1;
});}
function snapshot(e){const out={role:null,spec:null,shot:null,kind:'walk'};for(const key of ['campaignElite','elite','label','y','h','r','dmg','ceKind','ceState','ceClock','ceSerial','ceX','ceY','ceZ','ceDX','ceDZ'])if(e[key]!=null)out[key]=e[key];return out;}
const api={kits,setup,step,contains,blocked,snapshot};root.BFCampaignElites=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
