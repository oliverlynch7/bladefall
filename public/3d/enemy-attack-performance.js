// Visual poses only. All attack clocks, movement and damage remain game-owned.
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const mix=(a,b,u)=>a+(b-a)*ease(u);
const moves={
 thrust:{label:'Planted driving thrust',recover:.38,wind:{body:[-.12,-.24,0],head:[.04,.12,0],armR:[-.64,-.30,.12],forearmR:[.92,0,0],armL:[-.43,0,-.24],legL:[.10,0,0],legR:[-.10,0,0],shinR:[.13,0,0]},strike:{body:[.24,.17,0],head:[-.1,-.08,0],armR:[-1.32,.07,.08],forearmR:[.08,0,0],armL:[-.34,0,-.28],legL:[-.26,0,0],legR:[.19,0,0],shinR:[.25,0,0]}},
 sweep:{label:'Hip-led lateral sweep',recover:.46,wind:{body:[-.1,-.48,-.025],head:[.02,.26,0],armR:[-.88,-.48,.32],forearmR:[.58,0,0],armL:[-.64,0,-.26]},strike:{body:[.16,.62,.035],head:[-.06,-.27,0],armR:[-.84,.62,.14],forearmR:[.16,0,0],armL:[-.4,0,-.3]}},
 slam:{label:'Raised weapon ground slam',recover:.55,wind:{body:[-.2,-.08,0],head:[.08,.04,0],armR:[-2.38,0,.15],forearmR:[.50,0,0],armL:[-1.65,0,-.15],forearmL:[.52,0,0]},strike:{body:[.39,.06,0],head:[-.15,0,0],armR:[-.54,0,.13],forearmR:[.14,0,0],armL:[-.68,0,-.16],forearmL:[.18,0,0]}},
 stomp:{label:'Grounded shockwave release',recover:.48,wind:{body:[-.18,0,0],head:[-.09,0,0],armL:[-1.22,0,-.36],forearmL:[.58,0,0],armR:[-.64,0,.26],forearmR:[.42,0,0],legR:[-.42,0,0],shinR:[.54,0,0]},strike:{body:[.31,0,0],head:[.09,0,0],armL:[-.43,0,-.48],forearmL:[.12,0,0],armR:[-.37,0,.35],forearmR:[.12,0,0],legR:[.06,0,0],shinR:[.04,0,0]}},
 shieldWave:{label:'Braced shield ground strike',recover:.48,wind:{body:[-.18,-.1,0],head:[.04,.08,0],armL:[-.62,0,-.12],forearmL:[.67,0,0],armR:[-.38,0,.27],forearmR:[.35,0,0]},strike:{body:[.32,.1,0],head:[-.12,-.06,0],armL:[-1.21,0,-.19],forearmL:[.30,0,0],armR:[-.52,0,.32],forearmR:[.19,0,0]}},
 beam:{label:'Sustained aimed palm beam',recover:.44,sustain:true,wind:{body:[-.13,-.19,0],head:[-.03,.1,0],armL:[-.62,0,-.28],forearmL:[1.02,0,0],armR:[-.24,0,.16],forearmR:[.30,0,0]},strike:{body:[.16,.13,0],head:[-.04,-.06,0],armL:[-1.46,0,-.22],forearmL:[.08,0,0],armR:[-.48,0,.2],forearmR:[.40,0,0]}},
 burst:{label:'Two-arm expanding power burst',recover:.5,wind:{body:[-.17,0,0],head:[-.13,0,0],armL:[-.90,0,-.18],forearmL:[.97,0,0],armR:[-.90,0,.18],forearmR:[.97,0,0]},strike:{body:[.18,0,0],head:[.05,0,0],armL:[-.75,0,-1.12],forearmL:[.12,0,0],armR:[-.75,0,1.12],forearmR:[.12,0,0]}},
 mark:{label:'Raise and place a ground spell',recover:.4,wind:{body:[-.08,-.13,0],head:[-.14,.08,0],armL:[-1.68,0,-.32],forearmL:[.64,0,0],armR:[-.18,0,.1],forearmR:[.12,0,0]},strike:{body:[.20,.11,0],head:[.14,-.06,0],armL:[-.89,0,-.27],forearmL:[.08,0,0],armR:[-.21,0,.13],forearmR:[.14,0,0]}},
 cross:{label:'Crossed arms opening into lanes',recover:.46,wind:{body:[-.11,0,0],head:[-.05,0,0],armL:[-.98,.30,-.16],forearmL:[.91,0,0],armR:[-.98,-.30,.16],forearmR:[.91,0,0]},strike:{body:[.13,0,0],head:[.03,0,0],armL:[-1.22,0,-.81],forearmL:[.1,0,0],armR:[-1.22,0,.81],forearmR:[.1,0,0]}},
 volley:{label:'Forward spread release',recover:.38,wind:{body:[-.12,-.18,0],head:[.03,.1,0],armL:[-.80,0,-.24],forearmL:[.83,0,0],armR:[-.22,0,.12],forearmR:[.21,0,0]},strike:{body:[.17,.12,0],head:[-.05,-.06,0],armL:[-1.32,0,-.48],forearmL:[.09,0,0],armR:[-.27,0,.17],forearmR:[.14,0,0]}}
};
export const attackVariants={
 grunt:['thrust','sweep','stomp'],caster:['mark','volley','stomp','cross','thrust','sweep'],
 brute:['slam'],warden:['thrust','sweep'],archer:['volley'],sorcerer:['mark','burst'],
 'officer-spear':['thrust'],'officer-shield':['shieldWave'],
 king:['beam','stomp','burst','sweep','slam'],tyrant:['beam','stomp','burst','sweep','slam'],
 royalarcanist:['cross'],sentinel:['thrust'],siegeknight:['stomp','slam'],revenant:['sweep'],sunpriest:['burst'],embertotem:['mark']
};
export function performanceProfile(type,move){
 if(!move||!moves[move])return null;
 // The bow remains in its support hand: its own draw/IK profile handles volleys.
 if(type==='archer'&&move==='volley')return null;
 return moves[move];
}
export function performancePose(p,phase,u){
 if(!p||!['Windup','Attack','Recover'].includes(phase))return null;
 u=clamp(u);const out={};
 for(const key of new Set([...Object.keys(p.wind),...Object.keys(p.strike)])){
  const a=p.wind[key]||[0,0,0],b=p.strike[key]||[0,0,0];
  out[key]=a.map((v,i)=>{
   // Anticipate, hold the readable silhouette, then begin accelerating into release.
   // Attack begins at that same pose and immediately reaches contact, then follows through.
   const release=mix(v,b[i],.30),settle=b[i]*(p.sustain?.70:.28);
   if(phase==='Windup')return u<.58?v*ease(u/.58):u<.88?v:mix(v,release,(u-.88)/.12);
   if(phase==='Recover')return mix(settle,0,u);
   if(u<.12)return mix(release,b[i],u/.12);
   if(p.sustain&&u<.72)return b[i];
   const start=p.sustain?.72:.12;
   return mix(b[i],settle,(u-start)/(1-start));
  });
 }
 return out;
}
