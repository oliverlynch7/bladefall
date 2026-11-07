/* Facing is combat state: bodies, guards and committed attack directions agree. */
(function(root){'use strict';
const memory=new WeakMap(),wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const braceTime=.85,braceInterval=2.4,meleeArc=1.15;
function state(e){
 let saved=memory.get(e);
 if(!saved){saved={key:null,aim:0,recover:0,brace:0,braceCooldown:0};memory.set(e,saved);}
 return saved;
}
function bracing(e){return e.role==='shielder'&&memory.get(e)?.brace>0;}
function guardPlanted(e){return e.role==='shielder'&&(bracing(e)||memory.get(e)?.recover>0||!!action(e));}
function brace(e){
 if(e.role!=='shielder'||e.dummy||e.dead||action(e))return false;
 const saved=state(e);
 if(saved.braceCooldown>0)return false;
 saved.brace=braceTime;saved.braceCooldown=braceInterval;
 return true;
}
function heavy(e){return e.role==='shielder'||e.prisonFoe==='prison_guard'||e.frostOfficer==='shield'||e.briarRole==='guard'||e.campaignRole==='guard'||['sentinel','siegeknight','marblestatue'].includes(e.type);}
function rate(e){return heavy(e)?1.7:e.boss?2.1:e.kind==='charger'?2.6:e.kind==='fly'?4.4:3.4;}
function angle(yaw,goal,dt,speed){const step=Math.max(0,Math.min(.05,dt))*speed;return wrap(yaw+Math.max(-step,Math.min(step,wrap(goal-yaw))));}
function turn(e,dx,dz,dt){
 const yaw=Number.isFinite(e.yaw)?e.yaw:0,frame=memory.get(e)?.frame;
 if(frame&&(frame.turned||frame.busy||frame.held))return yaw;
 if(!(Math.hypot(dx,dz)>.001))return yaw;
 const goal=Math.atan2(dx,dz);
 // A raised shield need not follow every small step within its front arc.
 if((e.role==='shielder'||e.prisonFoe==='prison_guard'||e.frostOfficer==='shield')&&Math.abs(wrap(goal-yaw))<.14)return yaw;
 e.yaw=angle(frame?.yaw??yaw,goal,dt,rate(e));
 if(frame){frame.turned=true;frame.approachYaw=e.yaw;}
 return e.yaw;
}
function aligned(e,p,arc=.65){const dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz);return d<.001||(dx*Math.sin(e.yaw||0)+dz*Math.cos(e.yaw||0))/d>=Math.cos(arc);}
function directionalGuard(e){return e.role==='shielder'||e.prisonFoe==='prison_guard'||e.frostOfficer==='shield'||e.finalKing;}
// Rewind from the collision point to the incoming edge of the target's hit circle.
function projectileSide(e,p){
 const dx=p.x-e.x,dz=p.z-e.z,speed=Math.hypot(p.vx,p.vz),r=e.r+p.size;
 if(!(speed>0&&r>0))return null;
 const vx=p.vx/speed,vz=p.vz/speed,along=dx*vx+dz*vz,cross=dx*vz-dz*vx;
 const back=along+Math.sqrt(Math.max(0,r*r-cross*cross));
 return [(dx-vx*back)/r,(dz-vz*back)/r];
}
function guardSource(e,src,side){
 if(!Array.isArray(side)||side.length!==2)return src;
 if(!side.every(Number.isFinite)||Math.abs(Math.hypot(...side)-1)>.01)return src;
 return {x:e.x+side[0],z:e.z+side[1]};
}
function forward(e){return [Math.sin(e.yaw||0),Math.cos(e.yaw||0)];}
// Authored attack geometry wins over target position. Null yaw means planted melee.
function action(e){
 const vector=(key,x,z)=>({key,yaw:Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(x,z)>.001?Math.atan2(x,z):null});
 if(e.finalKing)return ['wind','strike'].includes(e.akState)?vector('king',e.akDX,e.akDZ):null;
 if(e.frostOfficer)return ['wind','strike'].includes(e.offState)?vector('officer',e.offDX,e.offDZ):null;
 if(e.marbleGuardian)return ['wind','strike'].includes(e.mcState)?vector('marble',e.mcDX,e.mcDZ):null;
 if(e.furnaceColossus)return ['wind','strike'].includes(e.fcState)?vector('furnace',e.fcDX,e.fcDZ):null;
 if(e.fallenDuel)return ['feint','thrust','sweep','strike'].includes(e.fallState)?vector('fallen',e.fallDX,e.fallDZ):null;
 if(e.bruteOrchard)return ['wind','charge','slam'].includes(e.bruteState)?vector('brute',e.bruteState==='slam'?null:e.teleX,e.bruteState==='slam'?null:e.teleZ):null;
 if(e.marksmanCrossing)return e.markState==='aim'||e.markAttack>0?vector('marksman',e.markX-e.x,e.markZ-e.z):null;
 if(e.ceKind)return ['wind','strike'].includes(e.ceState)?vector('elite',e.ceDX,e.ceDZ):null;
 if(e.prisonFoe)return ['wind','strike'].includes(e.pcState)?vector('prison',e.pcDX,e.pcDZ):null;
 if(e.chargeT>0)return vector('charge',e.cdx,e.cdz);
 if(e.windT>0||e.lunge>0)return vector('lunge',e.teleX,e.teleZ);
 if(e.cleaveW>0)return vector('cleave',e.cleaveX,e.cleaveZ);
 if(e.meleeW>0||e.meleeActive>0)return vector('melee:'+e.meleeSerial,null,null);
 if(e.shotW>0||e.shotReleaseT>0){
  const yaw=e.shotW>0?e.shotAim?.yaw:e.shotReleaseYaw;
  if(Number.isFinite(yaw))return {key:'shot',yaw};
  return vector('shot',e.shotAim?e.shotAim.x-e.x:null,e.shotAim?e.shotAim.z-e.z:null);
 }
 if(e.blinkFx>0)return vector('blink',null,null);
 if(e.pinT>0||e.slamW>0||e.novaW>0||e.poundW>0||e.knightW>0||e.eruptW>0||e.fuseT>0)return vector('planted',null,null);
 return null;
}
// Bracket each host AI step, so legacy yaw assignments cannot bypass the turn limit.
function holdsRecovery(e){
 const saved=memory.get(e);
 if(saved?.frame?.recovering||saved?.recover>0)return true;
 if(e.frostOfficer)return e.offState==='recover';
 if(e.prisonFoe)return e.pcState==='recover';
 if(e.ceKind)return e.ceState==='recover';
 if(e.fallenDuel)return e.fallState==='recover';
 if(e.bruteOrchard)return e.bruteState==='recover'||e.bruteState==='stagger';
 if(e.marksmanCrossing)return (e.markState==='recover'&&e.markClock>0)||e.markState==='relocate'||e.markState==='glide';
 if(e.marbleGuardian)return e.mcState==='recover'&&e.mcClock>0;
 if(e.furnaceColossus)return e.fcState==='recover'&&e.fcClock>0;
 return !!e.finalKing&&(e.akState==='adds'||e.akState==='recover'&&e.akClock>0);
}
function begin(e,target,dt){
 const saved=state(e),current=action(e),frame={yaw:Number.isFinite(e.yaw)?e.yaw:0,busy:!!current,guardPlanted:guardPlanted(e),recovering:saved.recover>0,held:bracing(e)||holdsRecovery(e)||e.staggerT>0||e.fallState==='stagger'};
 const elapsed=Math.max(0,dt);
 saved.recover=Math.max(0,saved.recover-elapsed);
 saved.brace=Math.max(0,saved.brace-elapsed);
 saved.braceCooldown=Math.max(0,saved.braceCooldown-elapsed);
 // Authored encounters can defer the turn until they choose their actual target.
 frame.approachYaw=frame.yaw;saved.frame=frame;
 if(target)turn(e,target.x-e.x,target.z-e.z,dt);
 return frame;
}
function finish(e,dt,frame,returning=false){
 if(!frame)return;const saved=memory.get(e),current=action(e);saved.frame=null;
 if(frame.busy&&!current)saved.recover=Math.max(saved.recover,(heavy(e)||e.boss) ? .7 : .4);
 let goal=frame.yaw;
 if(current){if(saved.key!==current.key){saved.key=current.key;saved.aim=frame.approachYaw;}goal=current.yaw??saved.aim;if(current.yaw!=null)saved.aim=current.yaw;}
 else{saved.key=null;if(!frame.held&&!frame.busy)goal=returning||e.kind==='goblin'?e.yaw:frame.approachYaw;}
 e.yaw=angle(frame.yaw,goal,dt,rate(e));if(e.role==='shielder')e.shieldYaw=e.yaw;
}
function mirror(e){if(!Number.isFinite(e.facingYaw))return false;e.yaw=e.facingYaw;if(e.role==='shielder')e.shieldYaw=Number.isFinite(e.shieldYaw)?e.shieldYaw:e.yaw;return true;}
function canCommit(e){
 const saved=memory.get(e);
 return !saved?.frame?.busy&&!saved?.frame?.held&&!(saved?.recover>0)&&!bracing(e)&&!action(e);
}
function contact(e,p){return aligned(e,p,meleeArc);}
const api={turn,aligned,forward,directionalGuard,projectileSide,guardSource,rate,angle,action,begin,finish,mirror,contact,meleeArc,holdsRecovery,brace,bracing,guardPlanted,canCommit};root.BFEnemyFacing=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
