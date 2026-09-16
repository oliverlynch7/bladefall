// Read-only animation phase selection from authoritative gameplay timers.
export function enemyActionState(e){
 const keys=['windT','slamW','cleaveW','novaW','poundW','eruptW','knightW','pinT','blinkFx','fuseT','meleeW','shotW'];
 let remaining=0,key=null;
 for(const k of keys)if((e[k]||0)>remaining){remaining=e[k];key=k;}
 if(key)return {phase:'Windup',key,remaining};
 for(const k of ['meleeActive','chargeT','lunge','diving'])if(e[k]>0)return {phase:'Attack',key:k,remaining:Math.max(.08,Number(e[k]))};
 return {phase:null,key:null,remaining:0};
}
