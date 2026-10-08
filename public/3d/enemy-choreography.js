// Bind-local rotations only. Equipment remains attached to its authored hand;
// neither the combat collider nor the actor's world position is animated here.
const profiles={
 grunt:{label:'Spear thrust',recover:.3,
  wind:{body:[-.09,-.16,0],head:[.05,.10,0],armR:[-.48,-.30,.13],forearmR:[.65,0,0],armL:[-.28,0,-.24]},
  strike:{body:[.18,.14,0],head:[-.08,-.05,0],armR:[-1.01,.06,.10],forearmR:[.13,0,0],armL:[-.25,0,-.30]}},
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
// Every production appearance has a readable physical action. The style table
// names the intended weapon or anatomy; it prevents a staff user from inheriting
// a sword swing, a quadruped from swinging human arms, or a mimic from running.
const styles={
 spear:'officer-spear prison_pike bones',shield:'officer-shield prison_guard siegeknight marblestatue',
 slash:'emberling frostling toxling goblin blinkstalker',
 heavy:'brute warden prison_bell marblecolossus',bow:'archer',
 cast:'sorcerer royalarcanist king tyrant prison_unbound',
 throw:'embertotem prison_vessel',
 bite:'dustjackal prison_hound magmaskit',charge:'charger thornboar frostshell prison_maw',
 spit:'sporeback',wing:'flyer shadeling',pulse:'sparkling galewisp voidtether bosscrystal',
 chest:'mimic',jelly:'slime slimelet',dummy:'dummy'
};
const styleOf=Object.fromEntries(Object.entries(styles).flatMap(([style,names])=>names.split(' ').map(name=>[name,style])));
const P={
 spear:{label:'Braced spear thrust',recover:.34,wind:{body:[-.11,-.22,0],head:[.04,.10,0],armR:[-.50,-.28,.12],forearmR:[.67,0,0],armL:[-.25,0,-.20],legL:[.13,0,0]},strike:{body:[.21,.15,0],head:[-.08,-.06,0],armR:[-1.10,.08,.08],forearmR:[.10,0,0],armL:[-.28,0,-.27],legL:[-.14,0,0]}},
 shield:{label:'Shield-led strike',recover:.40,wind:{body:[-.15,0,0],head:[.05,0,0],armL:[-.35,0,-.08],forearmL:[.50,0,0],armR:[-.30,0,.16]},strike:{body:[.24,0,0],head:[-.08,0,0],armL:[-1.06,0,-.13],forearmL:[.85,0,0],armR:[-.25,0,.20]}},
 slash:{label:'Claw and blade cut',recover:.30,wind:{body:[-.10,-.25,0],head:[.04,.13,0],armR:[-1.30,-.17,.30],forearmR:[.40,0,0],armL:[-.40,0,-.32]},strike:{body:[.24,.20,0],head:[-.10,-.10,0],armR:[-.49,.18,.16],forearmR:[.12,0,0],armL:[-.65,0,-.30]}},
 heavy:{label:'Committed overhead blow',recover:.54,wind:{body:[-.19,-.15,0],head:[.08,.10,0],armR:[-2.05,-.12,.11],forearmR:[.50,0,0],armL:[-.73,0,-.12],legR:[-.12,0,0]},strike:{body:[.35,.13,0],head:[-.12,-.06,0],armR:[-.31,.11,.08],forearmR:[.13,0,0],armL:[-.50,0,-.12],legR:[.12,0,0]}},
 bow:{label:'Draw and release',recover:.33,wind:{body:[-.06,.06,0],head:[0,-.07,0],armL:[-.90,0,-.17],forearmL:[.20,0,0],armR:[-.75,0,.34],forearmR:[.95,0,0]},strike:{body:[.12,-.04,0],head:[-.02,0,0],armL:[-1.02,0,-.18],forearmL:[.18,0,0],armR:[-.84,0,.18],forearmR:[.20,0,0]}},
 cast:{label:'Focused spell release',recover:.39,wind:{body:[-.09,-.11,0],head:[-.06,.08,0],armL:[-.70,0,-.32],forearmL:[.45,0,0],armR:[-.38,0,.18],forearmR:[.24,0,0]},strike:{body:[.12,.10,0],head:[.03,-.06,0],armL:[-1.14,0,-.43],forearmL:[.07,0,0],armR:[-.65,0,.20],forearmR:[.10,0,0]}},
 throw:{label:'Vessel ignition',recover:.44,wind:{body:[-.13,0,0],head:[-.13,0,0]},strike:{body:[.20,0,0],head:[.10,0,0]}},
 bite:{label:'Crouch and snap',recover:.28,wind:{body:[.15,0,0],head:[-.19,0,0],armL:[.17,0,0],armR:[.17,0,0],rearL:[-.12,0,0],rearR:[-.12,0,0]},strike:{body:[-.16,0,0],head:[.34,0,0],armL:[-.27,0,0],armR:[-.27,0,0],rearL:[.20,0,0],rearR:[.20,0,0]}},
 charge:{label:'Low shoulder rush',recover:.41,wind:{body:[.20,0,0],head:[.24,0,0],armL:[.25,0,0],armR:[.25,0,0],rearL:[-.18,0,0],rearR:[-.18,0,0]},strike:{body:[-.24,0,0],head:[-.24,0,0],armL:[-.30,0,0],armR:[-.30,0,0],rearL:[.25,0,0],rearR:[.25,0,0]}},
 spit:{label:'Spore release',recover:.36,wind:{body:[-.12,0,0],head:[-.24,0,0],tail:[-.08,0,0]},strike:{body:[.20,0,0],head:[.26,0,0],tail:[.13,0,0]}},
 wing:{label:'Wing-driven dive',recover:.32,wind:{body:[-.12,0,0],head:[-.10,0,0],armL:[.15,0,-.56],armR:[.15,0,.56]},strike:{body:[.21,0,0],head:[.15,0,0],armL:[-.32,0,.20],armR:[-.32,0,-.20]}},
 pulse:{label:'Arcane pulse',recover:.39,wind:{body:[-.15,0,-.14],head:[-.10,0,0],armL:[-.22,0,-.34],armR:[-.22,0,.34]},strike:{body:[.20,0,.15],head:[.12,0,0],armL:[-.44,0,.18],armR:[-.44,0,-.18]}},
 chest:{label:'Mimic jaw snap',recover:.38,wind:{body:[-.12,0,0],head:[-.49,0,0]},strike:{body:[.14,0,0],head:[.22,0,0]}},
 jelly:{label:'Slime lunge',recover:.25,wind:{body:[-.22,0,0],head:[-.12,0,0]},strike:{body:[.26,0,0],head:[.08,0,0]}},
 dummy:{label:'Training target wobble',recover:.22,wind:{body:[-.13,0,0]},strike:{body:[.17,0,0]}}
};
const specialMoves={
 'colossus:slam':{...profiles.colossus,label:'Forge hammer slam'},
 'colossus:sweep':{...P.heavy,label:'Forge low sweep',wind:{...P.heavy.wind,body:[-.13,-.47,0],armR:[-.89,-.22,.09]},strike:{...P.heavy.strike,body:[.16,.56,0],armR:[-.55,.43,.08]}},
 'colossus:vents':{...P.cast,label:'Furnace vent',wind:{body:[-.13,0,0],head:[-.10,0,0],armL:[-.75,0,-.23],armR:[-.75,0,.23]},strike:{body:[.22,0,0],head:[.08,0,0],armL:[-1.25,0,-.35],armR:[-1.25,0,.35]}},
 'marblecolossus:hammer':{...P.heavy,label:'Marble hammer blow'},
 'marblecolossus:sweep':{...P.heavy,label:'Marble low sweep',wind:{...P.heavy.wind,body:[-.11,-.45,0],armR:[-.92,-.18,.09]},strike:{...P.heavy.strike,body:[.15,.55,0],armR:[-.43,.40,.06]}},
 'marblecolossus:fall':{...P.heavy,label:'Falling stone',wind:{...P.heavy.wind,body:[-.30,0,0],armL:[-1.25,0,-.20],armR:[-1.25,0,.20]},strike:{...P.heavy.strike,body:[.43,0,0],armL:[-.36,0,-.22],armR:[-.36,0,.22]}},
 'prison_hound:rush':{...P.charge,label:'Chain hound rush'},
 'prison_bell:toll':{...P.pulse,label:'Bell shockwave',wind:{body:[-.15,0,0],head:[-.10,0,0],armR:[-1.70,0,.1],forearmR:[.40,0,0]},strike:{body:[.23,0,0],head:[.08,0,0],armR:[-.36,0,.1],forearmR:[.12,0,0]}},
 'prison_bell:sweep':{...P.heavy,label:'Bell lateral sweep',wind:{...P.heavy.wind,body:[-.14,-.34,0],armR:[-.64,-.26,.17]},strike:{...P.heavy.strike,body:[.19,.52,0],armR:[-.45,.37,.16]}},
 'prison_maw:maul':{...P.bite,label:'Iron jaw maul'},
 'prison_maw:crush':{...P.charge,label:'Iron maw stomp',wind:{...P.charge.wind,body:[-.19,0,0],head:[-.13,0,0]},strike:{...P.charge.strike,body:[.30,0,0],head:[.26,0,0]}},
 'prison_unbound:cross':{...P.cast,label:'Cross-beam invocation',wind:{...P.cast.wind,armL:[-.84,0,-.42],armR:[-.84,0,.42]},strike:{...P.cast.strike,armL:[-1.27,0,-.70],armR:[-1.27,0,.70]}},
 'prison_unbound:mark':{...P.cast,label:'Target mark',wind:{...P.cast.wind,armR:[-.57,0,.20]},strike:{...P.cast.strike,armR:[-1.20,0,.22]}},
 'prison_unbound:toll':{...P.pulse,label:'Soul toll',wind:{body:[-.11,0,0],head:[-.11,0,0],armL:[-.80,0,-.25],armR:[-.80,0,.25]},strike:{body:[.19,0,0],head:[.06,0,0],armL:[-1.10,0,-.50],armR:[-1.10,0,.50]}}
};
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function choreographyProfile(type,move){return specialMoves[type+':'+move]||profiles[type]||P[styleOf[type]]||null;}
export function choreographyPose(type,phase,u,move){
 const p=choreographyProfile(type,move);if(!p||!['Windup','Attack','Recover'].includes(phase))return null;
 u=Math.max(0,Math.min(1,u));const result={};
 for(const key of new Set([...Object.keys(p.wind),...Object.keys(p.strike)])){
  const a=p.wind[key]||[0,0,0],b=p.strike[key]||[0,0,0];
  result[key]=a.map((angle,i)=>phase==='Windup'?angle*smooth(u/.85):
   phase==='Recover'?b[i]*.65*(1-smooth(u)):
   u<.16?angle+(b[i]-angle)*smooth(u/.16):b[i]*(1-.35*smooth((u-.65)/.35)));
 }return result;
}
