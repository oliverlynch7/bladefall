/* Facing is combat state: bodies, guards and committed attack directions agree. */
(function(root){'use strict';
const memory=new WeakMap(),wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
function heavy(e){return e.role==='shielder'||e.prisonFoe==='prison_guard'||e.frostOfficer==='shield'||e.briarRole==='guard'||e.campaignRole==='guard'||['sentinel','siegeknight','marblestatue'].includes(e.type);}
function rate(e){return heavy(e)?1.7:e.boss?2.1:e.kind==='charger'?2.6:e.kind==='fly'?4.4:3.4;}
function angle(yaw,goal,dt,speed){const step=Math.max(0,Math.min(.05,dt))*speed;return wrap(yaw+Math.max(-step,Math.min(step,wrap(goal-yaw))));}
function turn(e,dx,dz,dt){const yaw=Number.isFinite(e.yaw)?e.yaw:0;if(memory.get(e)?.frame)return yaw;if(Math.hypot(dx,dz)>.001)e.yaw=angle(yaw,Math.atan2(dx,dz),dt,rate(e));else e.yaw=yaw;return e.yaw;}
function aligned(e,p,arc=.65){const dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz);return d<.001||(dx*Math.sin(e.yaw||0)+dz*Math.cos(e.yaw||0))/d>=Math.cos(arc);}
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
 if(e.slamW>0||e.novaW>0||e.poundW>0||e.knightW>0||e.eruptW>0||e.fuseT>0)return vector('planted',null,null);
 return null;
}
// Bracket each host AI step, so legacy yaw assignments cannot bypass the turn limit.
function holdsRecovery(e){
 if(e.frostOfficer==='shield')return e.offState==='recover';
 if(e.prisonFoe==='prison_guard')return e.pcState==='recover';
 if(e.ceKind&&(e.briarRole==='guard'||e.campaignRole==='guard'))return e.ceState==='recover';
 return !!e.finalKing&&e.akState==='recover'&&e.akClock>0&&e.akEnvSeq>0&&e.akEnvSeq===e.akSeq&&e.akEnvPhase===e.phase;
}
function begin(e,target,dt){
 const saved=memory.get(e)||{key:null,aim:0,recover:0},current=action(e),frame={yaw:Number.isFinite(e.yaw)?e.yaw:0,busy:!!current,held:saved.recover>0||holdsRecovery(e)||e.staggerT>0||e.fallState==='stagger'};
 saved.recover=Math.max(0,saved.recover-Math.max(0,dt));memory.set(e,saved);
 if(!current&&!frame.held&&target)turn(e,target.x-e.x,target.z-e.z,dt);
 // Encounter helpers can also step in isolation. Inside the game loop they share this one turn.
 frame.approachYaw=e.yaw??frame.yaw;saved.frame=frame;
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
function contact(e,p){return aligned(e,p,1.15);}
const api={turn,aligned,forward,rate,angle,action,begin,finish,mirror,contact,holdsRecovery};root.BFEnemyFacing=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
