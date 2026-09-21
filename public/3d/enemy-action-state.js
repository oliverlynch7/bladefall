// Read-only animation phase selection from authoritative gameplay timers.
export function enemyActionState(e){
 if(e.fallenDuel){if(['thrust','sweep','feint'].includes(e.fallState))return {phase:'Windup',key:e.fallState,remaining:e.fallClock};if(e.fallAttack>0)return {phase:'Attack',key:'fallenStrike',remaining:e.fallAttack};return {phase:null,key:null,remaining:0};}
 if(e.marksmanCrossing&&e.markState==='aim')return {phase:'Windup',key:'markClock',remaining:e.markClock};
 if(e.marksmanCrossing&&e.markAttack>0)return {phase:'Attack',key:'markAttack',remaining:e.markAttack};
 if(e.marksmanCrossing&&e.markState==='glide')return {phase:'Attack',key:'markGlide',remaining:e.markClock};
 const keys=['windT','slamW','cleaveW','novaW','poundW','eruptW','knightW','pinT','blinkFx','fuseT','meleeW','shotW'];
 let remaining=0,key=null;
 for(const k of keys)if((e[k]||0)>remaining){remaining=e[k];key=k;}
 if(key)return {phase:'Windup',key,remaining};
 for(const k of ['meleeActive','chargeT','lunge','diving'])if(e[k]>0)return {phase:'Attack',key:k,remaining:Math.max(.08,Number(e[k]))};
 return {phase:null,key:null,remaining:0};
}
