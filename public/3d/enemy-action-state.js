// Read-only animation phase selection from authoritative gameplay timers.
export function enemyActionState(e){
 for(const [flag,prefix] of [['furnaceColossus','fc'],['marbleGuardian','mc']])if(e[flag]){
  const phase=e[prefix+'State'];return {phase:phase==='wind'?'Windup':phase==='strike'?'Attack':null,key:e[prefix+'Kind'],remaining:e[prefix+'Clock']||0};
 }

 if(e.ceKind){if(e.ceState==='wind')return {phase:'Windup',key:e.ceKind,remaining:e.ceClock};if(e.ceState==='strike')return {phase:'Attack',key:e.ceKind,remaining:e.ceClock};return {phase:null,key:null,remaining:0};}
 if(e.finalKing){if(e.akState==='wind')return {phase:'Windup',key:e.akKind,remaining:e.akClock};if(e.akState==='strike')return {phase:'Attack',key:e.akKind,remaining:e.akClock};return {phase:null,key:null,remaining:0};}
 if(e.frostOfficer){if(e.offState==='wind')return {phase:'Windup',key:'officer:'+e.frostOfficer,remaining:e.offClock};if(e.offState==='strike')return {phase:'Attack',key:'officer:'+e.frostOfficer,remaining:e.offClock};return {phase:null,key:null,remaining:0};}
 if(e.fallenDuel){if(['thrust','sweep','feint'].includes(e.fallState))return {phase:'Windup',key:e.fallState,remaining:e.fallClock};if(e.fallAttack>0)return {phase:'Attack',key:'fallenStrike',remaining:e.fallAttack};return {phase:null,key:null,remaining:0};}
 if(e.marksmanCrossing&&e.markState==='aim')return {phase:'Windup',key:'markClock',remaining:e.markClock};
 if(e.marksmanCrossing&&e.markAttack>0)return {phase:'Attack',key:'markAttack',remaining:e.markAttack};
 if(e.marksmanCrossing&&e.markState==='glide')return {phase:'Attack',key:'markGlide',remaining:e.markClock};
 const keys=['windT','slamW','cleaveW','novaW','poundW','eruptW','knightW','pinT','blinkFx','fuseT','meleeW','shotW'];
 let remaining=0,key=null;
 for(const k of keys)if((e[k]||0)>remaining){remaining=e[k];key=k;}
 if(key)return {phase:'Windup',key,remaining};
 for(const k of ['meleeActive','shotReleaseT','chargeT','lunge','diving'])if(e[k]>0)return {phase:'Attack',key:k,remaining:Math.max(.08,Number(e[k]))};
 return {phase:null,key:null,remaining:0};
}

// Only legacy instantaneous area effects lack an explicit damaging phase.
// A cancelled elite/boss wind-up, or a stopped projectile cast, is not a release.
export function instantEnemyRelease(previous,current,e){
 return previous.phase==='Windup'&&current.phase!=='Windup'&&current.phase!=='Attack'&&
  !e.dead&&!(e.stunT>0)&&!e.furnaceColossus&&!e.marbleGuardian&&!e.ceKind&&!e.finalKing&&!e.frostOfficer&&!e.fallenDuel&&!e.marksmanCrossing&&(!e.bruteOrchard||(previous.phaseKey==='slamW'&&e.bruteState==='recover'))&&
  ['slamW','cleaveW','novaW','poundW','eruptW','knightW','fuseT','pinT'].includes(previous.phaseKey);
}
