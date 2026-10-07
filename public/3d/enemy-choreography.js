// Bind-local rotations only. Equipment remains attached to its authored hand;
// neither the combat collider nor the actor's world position is animated here.
const profiles={
 grunt:{label:'Sword slash',recover:.3,
  wind:{body:[-.06,-.32,0],head:[0,.16,0],armR:[-.7,-.2,.2],forearmR:[.6,0,0],armL:[-.3,0,-.25]},
  strike:{body:[.12,.38,0],head:[-.05,-.15,0],armR:[-.55,.4,.24],forearmR:[.12,0,0],armL:[-.2,0,-.3]}},
 sentinel:{label:'Shield shove',recover:.42,
  wind:{body:[-.1,0,0],head:[.05,0,0],armL:[-.45,0,-.12],forearmL:[.55,0,0],armR:[-.25,0,.2],forearmR:[.2,0,0]},
  strike:{body:[.2,0,0],head:[-.08,0,0],armL:[-1.05,0,-.15],forearmL:[.85,0,0],armR:[-.2,0,.25],forearmR:[.2,0,0]}},
 revenant:{label:'Overhand cut',recover:.38,
  wind:{body:[-.13,-.14,0],head:[.08,.1,0],armR:[-1.65,0,.28],forearmR:[.5,0,0],armL:[-.4,0,-.35]},
  strike:{body:[.22,.12,0],head:[-.1,0,0],armR:[-.65,.1,.18],forearmR:[.12,0,0],armL:[-.25,0,-.3]}},
 caster:{label:'Staff and palm cast',recover:.34,
  wind:{body:[-.08,-.14,0],head:[.03,.1,0],armR:[-.12,0,.1],forearmR:[.1,0,0],armL:[-.7,0,-.3],forearmL:[.75,0,0]},
  strike:{body:[.12,.12,0],head:[-.05,0,0],armR:[-.15,0,.1],forearmR:[.1,0,0],armL:[-1.15,0,-.22],forearmL:[.1,0,0]}},
 frostlobber:{label:'Left-hand ice throw',recover:.4,
  wind:{body:[-.08,.2,0],head:[.02,-.15,0],armL:[-1.55,0,-.38],forearmL:[.55,0,0],armR:[-.3,0,.35]},
  strike:{body:[.2,-.15,0],head:[-.06,.1,0],armL:[-.95,0,-.22],forearmL:[.06,0,0],armR:[-.15,0,.42]}},
 sunpriest:{label:'Open-palm invocation',recover:.42,
  wind:{body:[-.05,0,0],head:[-.16,0,0],armL:[-1.05,0,-.5],forearmL:[.35,0,0],armR:[-.12,0,.1],forearmR:[.08,0,0]},
  strike:{body:[.08,0,0],head:[.02,0,0],armL:[-.65,0,-.85],forearmL:[.1,0,0],armR:[-.12,0,.1],forearmR:[.08,0,0]}},
 dustjackal:{label:'Biting snap',recover:.25,
  wind:{body:[-.04,0,0],head:[-.18,-.08,0],tail:[0,-.18,0]},
  strike:{body:[.1,0,0],head:[.28,.08,0],tail:[0,.22,0]}},
 thornboar:{label:'Tusk shove',recover:.4,
  wind:{body:[.1,0,0],head:[.38,0,0],tail:[.1,0,0]},
  strike:{body:[-.08,0,0],head:[-.2,0,0],tail:[-.1,0,0]}},
 cragspitter:{label:'Braced spit',recover:.32,
  wind:{body:[-.08,0,0],head:[-.2,0,0]},
  strike:{body:[.1,0,0],head:[.3,0,0]}},
 colossus:{label:'Forge hammer slam',recover:.55,
  wind:{body:[-.15,-.12,0],head:[.04,.09,0],armR:[-2.55,-.12,.1],forearmR:[.12,0,0],armL:[-.28,0,-.1],forearmL:[.12,0,0]},
  strike:{body:[.28,.16,0],head:[-.12,-.10,0],armR:[-.38,.1,.08],forearmR:[.16,0,0],armL:[-.25,0,-.14],forearmL:[.1,0,0]}}
};
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function choreographyProfile(type){return profiles[type]||null;}
export function choreographyPose(type,phase,u){
 const p=profiles[type];if(!p||!['Windup','Attack','Recover'].includes(phase))return null;
 u=Math.max(0,Math.min(1,u));const result={};
 for(const key of new Set([...Object.keys(p.wind),...Object.keys(p.strike)])){
  const a=p.wind[key]||[0,0,0],b=p.strike[key]||[0,0,0];
  result[key]=a.map((angle,i)=>phase==='Windup'?angle*smooth(u/.85):
   phase==='Recover'?b[i]*.65*(1-smooth(u)):
   u<.16?angle+(b[i]-angle)*smooth(u/.16):b[i]*(1-.35*smooth((u-.65)/.35)));
 }return result;
}
