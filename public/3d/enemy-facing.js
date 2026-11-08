/* Facing is combat state: bodies, guards and committed attack directions agree. */
(function(root){'use strict';
const memory=new WeakMap(),wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const braceTime=.85,braceInterval=2.4,meleeArc=1.15,pivotAnticipation=.24,pivotSettle=.4,heavyLookInterval=.45,focusSwitchLead=65;
const combatFlank=Math.PI*85/180,flankMargin=Math.PI/18,rearFlank=Math.PI*5/9,routeFlank=Math.PI*2/3;
const closeOrbitRange=190,closeOrbitMargin=16,closeOrbitArc=Math.PI*50/180,closeOrbitHold=.8;
const kingApproachRange=240,kingOrbitHold=2;
const standardShieldDot=.4,prisonShieldDot=.5;
const standardShieldFlank=Math.acos(standardShieldDot),prisonShieldFlank=Math.acos(prisonShieldDot);
function state(e){
 let saved=memory.get(e);
 if(!saved){saved={key:null,aim:0,recover:0,brace:0,braceCooldown:0,pivotWait:null,pivotAim:null,pivotSettle:0,combatPivoted:false,lookAim:0,lookT:0,closeBearing:null};memory.set(e,saved);}
 return saved;
}
function pivoting(e){return !!memory.get(e)?.frame?.pivotHeld;}
const shieldBearer=e=>e.role==='shielder'||e.prisonFoe==='prison_guard'||e.frostOfficer==='shield';
function shieldFrontDot(e){return e.prisonFoe==='prison_guard'?prisonShieldDot:standardShieldDot;}
function bracing(e){return shieldBearer(e)&&memory.get(e)?.brace>0;}
function guardPlanted(e){return shieldBearer(e)&&(bracing(e)||holdsRecovery(e)||!!action(e));}
function brace(e){
 if(!shieldBearer(e)||e.dummy||e.dead||action(e)||(e.prisonFoe&&e.pcState!=='approach')||
    (e.frostOfficer==='shield'&&e.offState!=='hunt'))return false;
 const saved=state(e);
 if(saved.braceCooldown>0)return false;
 saved.brace=braceTime;saved.braceCooldown=braceInterval;
 return true;
}
function heavy(e){return shieldBearer(e)||e.briarRole==='guard'||e.campaignRole==='guard'||['sentinel','siegeknight','marblestatue'].includes(e.type);}
function heavyPivot(e){return heavy(e)||e.finalKing||e.type==='king'||e.type==='tyrant';}
function selectTarget(e,targets){
 const saved=heavyPivot(e)?state(e):null,previous=saved?.target;
 let best=null,bestDistance=Infinity;
 for(const target of targets){
  const distance=Math.hypot(target.x-e.x,target.z-e.z)-(target===previous?focusSwitchLead:0);
  if(distance<bestDistance){best=target;bestDistance=distance;}
 }
 if(saved){if(previous!==best)saved.closeBearing=null;saved.target=best;}
 return best;
}
function rate(e){return heavy(e)?1.7:e.boss?2.1:e.kind==='charger'?2.6:e.kind==='fly'?4.4:3.4;}
function angle(yaw,goal,dt,speed){const step=Math.max(0,Math.min(.05,dt))*speed;return wrap(yaw+Math.max(-step,Math.min(step,wrap(goal-yaw))));}
function routeWaypoint(e){return e._facingRoute&&e._route?.find(q=>Math.hypot(q.x-e.x,q.z-e.z)>=8);}
function turn(e,dx,dz,dt,routeAim=false){
 const yaw=Number.isFinite(e.yaw)?e.yaw:0,frame=memory.get(e)?.frame;
 if(e.diving>0||frame&&(frame.turned||frame.busy||frame.held||frame.pivotHeld))return yaw;
 const waypoint=routeWaypoint(e);
 if(waypoint){dx=waypoint.x-e.x;dz=waypoint.z-e.z;}
 if(!(Math.hypot(dx,dz)>.001))return yaw;
 let goal=Math.atan2(dx,dz);
 // After setting their feet, heavies turn toward one sampled heading. Cap the step
 // at a quarter turn so they can read the target again before committing to more.
 if(heavyPivot(e)){
  const saved=state(e),offset=Math.abs(wrap(goal-yaw)),onRoute=!!waypoint||routeAim;
  if(saved.pivotAim==null){
   // Plant near the shoulder and only cancel once the target moves back in front.
   const firstFlank=e.prisonFoe==='prison_guard'?prisonShieldFlank:e.role==='shielder'?standardShieldFlank:combatFlank;
   if(offset<=(onRoute?Math.PI/2:firstFlank-flankMargin)){saved.pivotWait=null;saved.combatPivoted=false;}
   // After the first pivot, finish reacquiring without planting twice for the same shoulder.
   const flank=onRoute?routeFlank:saved.combatPivoted?rearFlank:firstFlank;
   if(offset>=flank&&saved.pivotWait==null){saved.pivotWait=pivotAnticipation;saved.lookT=0;}
   if(saved.pivotWait>0){
    saved.pivotWait=Math.max(0,saved.pivotWait-Math.max(0,dt));
    if(frame){frame.turned=true;frame.pivotHeld=true;}
    return yaw;
   }
   if(saved.pivotWait===0){
    const delta=wrap(goal-yaw);
    saved.pivotAim=wrap(yaw+Math.sign(delta)*Math.min(offset,Math.PI/2));
    if(!onRoute)saved.combatPivoted=true;
    saved.pivotWait=null;
   }
  }
  if(saved.pivotAim!=null){
   saved.closeBearing=null;
   e.yaw=angle(yaw,saved.pivotAim,dt,rate(e));
   if(frame){frame.turned=true;frame.pivotHeld=true;frame.approachYaw=e.yaw;}
   if(Math.abs(wrap(saved.pivotAim-e.yaw))<1e-8){
    saved.pivotAim=null;
    saved.pivotSettle=pivotSettle;
   }
   return e.yaw;
  }
  // Measure close circling from the last planted heading reference. Measuring only
  // against the current body yaw lets a guard track a walking orbit indefinitely.
  const orbitRange=e.finalKing?kingApproachRange:closeOrbitRange;
  const rangeLimit=orbitRange+(saved.closeBearing==null?0:closeOrbitMargin);
  if(onRoute||Math.hypot(dx,dz)>rangeLimit)saved.closeBearing=null;
  else if(saved.closeBearing==null)saved.closeBearing=goal;
  else if(Math.abs(wrap(goal-saved.closeBearing))>=closeOrbitArc){
   saved.closeBearing=null;saved.lookT=0;saved.pivotSettle=e.finalKing?kingOrbitHold:closeOrbitHold;saved.pivotWait=0;
   if(frame)frame.turned=frame.pivotHeld=true;
   return yaw;
  }
  // Between looks, a sidestep or a co-op target change cannot steer the turn.
  saved.lookT-=Math.max(0,Math.min(.05,dt));
  if(saved.lookT<=1e-8){saved.lookAim=goal;saved.lookT=heavyLookInterval;}
  goal=saved.lookAim;
  if(frame)frame.turned=true;
 }
 // A raised shield need not follow every small step within its front arc.
 if(shieldBearer(e)&&Math.abs(wrap(goal-yaw))<.14)return yaw;
 e.yaw=angle(frame?.yaw??yaw,goal,dt,rate(e));
 if(frame){frame.turned=true;frame.approachYaw=e.yaw;}
 return e.yaw;
}
function aligned(e,p,arc=.65){const dx=p.x-e.x,dz=p.z-e.z,d=Math.hypot(dx,dz);return d<.001||(dx*Math.sin(e.yaw||0)+dz*Math.cos(e.yaw||0))/d>=Math.cos(arc);}
// Heavy enemies plant rather than taking a near-sideways step to follow a flank.
function canAdvance(e,p){return !pivoting(e)&&aligned(e,routeWaypoint(e)||p,Math.PI/3);}
// Small steering corrections are fine, but a heavy enemy cannot strafe at walking speed.
function advanceHeading(e,dx,dz){
 const yaw=e.yaw||0,offset=wrap(Math.atan2(dx,dz)-yaw);
 return yaw+Math.max(-.26,Math.min(.26,offset));
}
function directionalGuard(e){return shieldBearer(e)||e.finalKing;}
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
 const saved=state(e),current=action(e),frame={yaw:Number.isFinite(e.yaw)?e.yaw:0,busy:!!current,guardPlanted:guardPlanted(e),recovering:saved.recover>0,pivotHeld:saved.pivotSettle>1e-8,held:bracing(e)||holdsRecovery(e)||e.staggerT>0||e.fallState==='stagger'};
 if(frame.busy||frame.held){saved.lookT=0;saved.closeBearing=null;}
 const elapsed=Math.max(0,dt);
 saved.recover=Math.max(0,saved.recover-elapsed);
 saved.pivotSettle=Math.max(0,saved.pivotSettle-elapsed);
 saved.brace=Math.max(0,saved.brace-elapsed);
 saved.braceCooldown=Math.max(0,saved.braceCooldown-elapsed);
 // Authored encounters can defer the turn until they choose their actual target.
 frame.approachYaw=frame.yaw;saved.frame=frame;
 if(target)turn(e,target.x-e.x,target.z-e.z,dt);
 return frame;
}
function finish(e,dt,frame){
 if(!frame)return;const saved=memory.get(e),current=action(e);saved.frame=null;
 if(frame.busy&&!current)saved.recover=Math.max(saved.recover,(heavy(e)||e.boss) ? .7 : .4);
 let goal=frame.yaw;
 if(current){if(saved.key!==current.key){saved.key=current.key;saved.aim=frame.approachYaw;}goal=current.yaw??saved.aim;if(current.yaw!=null)saved.aim=current.yaw;}
 else{saved.key=null;if(!frame.held&&!frame.busy)goal=e.kind==='goblin'?e.yaw:frame.approachYaw;}
 e.yaw=angle(frame.yaw,goal,dt,rate(e));if(e.role==='shielder')e.shieldYaw=e.yaw;
}
function mirror(e){if(!Number.isFinite(e.facingYaw))return false;e.yaw=e.facingYaw;if(e.role==='shielder')e.shieldYaw=Number.isFinite(e.shieldYaw)?e.shieldYaw:e.yaw;return true;}
function canCommit(e){
 const saved=memory.get(e);
 return !pivoting(e)&&!saved?.frame?.busy&&!saved?.frame?.held&&!(saved?.recover>0)&&!bracing(e)&&!action(e);
}
function contact(e,p){return aligned(e,p,meleeArc);}
const api={shieldBearer,shieldFrontDot,heavy,selectTarget,turn,aligned,canAdvance,advanceHeading,forward,directionalGuard,projectileSide,guardSource,rate,angle,action,begin,finish,mirror,contact,meleeArc,holdsRecovery,brace,bracing,guardPlanted,canCommit,pivoting,kingApproachRange};root.BFEnemyFacing=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
