/* Presentation only. Explicit current skill IDs: never infer an action from a particle form. */
(function(root){
'use strict';
const rows={
 warrior:'cleave bash rush spin guard slam roar execute',
 ranger:'volley aimshot backshot shadowslip settrap smoketoss sight brandspread',
 mage:'cast beam blink burst pull ward channel burst',
 reaper:'cleave wavecast blink ascend pull bind harvest channel',
 paladin:'bash call guard consecrate ward burst lastbrace skycall',
 necromancer:'packraise cast resurrect burst wallraise pull armycall channel',
 ninja:'drawcut starbursts shadowrun smoketoss handseal greatstar bladeready shadowveil',
 berserker:'cleave headbutt rush slam spin execute roar guard',
 pirate:'pistol broadside boarding retreat toss empower call place',
 chronomancer:'cast beam burst blink pull ward stop burst',
 monk:'flurry palm parry evade spinkick shockpalm meditate kick',
 stormcaller:'cast beam blink burst orb ward bind burst',
 warlock:'cast throw bind drain blink orb offering condemn',
 skylancer:'uppercut thrust dive ascend rush call thunderplunge pull',
 bladedancer:'counterready twin cleave evade mirroropen cross steelguard countercoil',
 beastmaster:'command bow bond evade mend roar herdcall empower',
 pyromancer:'firepalm firefan burst ward beam firecircle channel call'
};
const durations={cleave:.48,bash:.42,rush:.48,spin:.64,guard:.58,slam:.64,roar:.62,execute:.62,bow:.48,retreat:.50,place:.60,toss:.44,point:.42,cast:.42,beam:.62,blink:.32,burst:.55,pull:.62,ward:.60,channel:.70,ascend:.58,bind:.55,call:.68,consecrate:.62,raise:.70,stars:.64,throw:.44,empower:.56,vanish:.42,headbutt:.52,pistol:.38,broadside:.58,boarding:.52,stop:.62,flurry:.58,palm:.45,parry:.56,evade:.42,spinkick:.65,meditate:.64,kick:.60,orb:.62,drain:.64,offering:.66,condemn:.66,uppercut:.52,thrust:.44,dive:.54,twin:.56,cross:.58,command:.46,bond:.58,mend:.64,firepalm:.40,firefan:.56,firecircle:.62};
Object.assign(durations,{"volley":0.48,"aimshot":0.48,"backshot":0.5,"shadowslip":0.48,"settrap":0.6,"smoketoss":0.44,"sight":0.42,"brandspread":0.42,"drawcut":0.48,"starbursts":0.64,"shadowrun":0.32,"handseal":0.42,"greatstar":0.44,"bladeready":0.56,"shadowveil":0.42,"wavecast":0.48,"harvest":0.48,"packraise":0.7,"resurrect":0.7,"wallraise":0.7,"armycall":0.7,"counterready":0.56,"mirroropen":0.56,"steelguard":0.56,"countercoil":0.56,"shockpalm":0.45,"thunderplunge":0.54,"herdcall":0.46,"lastbrace":0.58,"skycall":0.68});
const profiles=Object.create(null);
function configure(classes){for(const [cls,c] of Object.entries(classes)){let i=0;for(const rank of ['r2','r4','r6','r8'])for(const side of ['a','b']){const s=c[rank][side],action=rows[cls]?.split(' ')[i++];if(!action||!durations[action])throw Error('Missing skill choreography: '+s.fx);profiles[s.fx]={id:s.fx,name:s.n,cls,action,duration:durations[action]};}}return profiles;}
function pose(p,id){const d=profiles[id];if(!d)return false;p.combatPose={skill:id,serial:++serial,clip:'Idle',duringDodge:(p.dodgeTimer||0)>0,duration:d.duration,remaining:d.duration};return true;}
let serial=0;
function valid(raw){const d=profiles[raw?.skill];if(!d||!Number.isSafeInteger(raw.serial)||raw.serial<0||!Number.isFinite(raw.remaining)||raw.remaining<=0)return null;return {skill:d.id,clip:'Idle',serial:raw.serial,duringDodge:raw.duringDodge===true,duration:d.duration,remaining:Math.min(d.duration,raw.remaining)};}
function smooth(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}
function curve(q,frames){for(let i=1;i<frames.length;i++){const a=frames[i-1],b=frames[i];if(q<=b[0]){const t=smooth((q-a[0])/(b[0]-a[0]));return a.slice(1).map((n,j)=>n+(b[j+1]-n)*t);}}return frames.at(-1).slice(1);}
// Anatomical targets in the shared model's metres, +Z forward. Curves have anticipation,
// contact/follow-through and recovery. Root offsets are visual only, bounded below half a step.
function sample(id,q){const d=profiles[id];if(!d)return null;q=Math.max(0,Math.min(1,q));const a=d.action,w=smooth(q/.12)*(1-smooth((q-.76)/.24)),hit=smooth(q/.22),recoil=Math.sin(Math.PI*q),impact=curve(q,[[0,0],[.12,.18],[.34,1],[.60,.75],[1,0]])[0],s={action:a,weight:w,torso:[0,0,0],head:[0,0,0],body:[0,0,0],right:[-.42,1.25,.28],left:[.42,1.25,.28],axis:[0,1,0],stow:false,support:false,legs:false,turn:0};
const sweep=(double=false)=>{const t=double?(q<.5?q*2:2-q*2):q; s.right=curve(t,[[0,-.62,1.65,.18],[.16,-.66,1.72,.24],[.40,.28,1.22,.68],[.66,.46,1.10,.38],[1,-.42,1.25,.28]]);s.axis=curve(t,[[0,-.8,.6,.1],[.16,-.8,.6,.1],[.40,.65,.15,.75],[.66,.9,.1,.1],[1,0,1,0]]);s.torso=[.07,(-.45+hit*.85)*w,0];s.support=true;};
// Class-specific choreography: different anticipation, hand paths and recovery, not recolors.
if(a==='volley'||a==='aimshot'){
 s.bow=true;s.bowLift=a==='volley'?.16*recoil:0;
 s.bowDraw=curve(q,a==='volley'?[[0,0],[.18,.8],[.32,1],[.45,0],[1,0]]:[[0,0],[.20,.7],[.46,1],[.58,0],[1,0]])[0];
 s.torso=a==='volley'?[-.06,-.22+.44*hit,0]:[.12,-.12,0];s.head=[a==='volley'?-.10:0,0,0];
}else if(a==='backshot'){s.bow=true;s.bowDraw=curve(q,[[0,0],[.28,.2],[.46,1],[.58,0],[1,0]])[0];s.bowLift=.06;s.torso=[-.24,0,.12];s.body=[0,-.13*recoil,-.10*recoil];s.legs=true;
}else if(a==='shadowslip'||a==='shadowrun'){
 s.stow=true;s.legs=true;s.torso=[.38,a==='shadowslip'?-.24:.12,0];s.body=[0,-.12*recoil,.10*recoil];
 s.right=a==='shadowslip'?curve(q,[[0,-.55,1.10,-.08],[.25,-.54,.95,-.1],[.48,-.30,1.25,.66],[.70,-.48,1.20,.3],[1,-.42,1.25,.28]]):[-.48,1.02,-.12];s.left=[.48,1.10,-.10];
}else if(a==='settrap'){s.stow=true;s.legs=true;s.body=[0,-.16*recoil,0];s.torso=[.46*recoil,0,0];s.right=curve(q,[[0,-.42,1.25,.28],[.28,-.28,.82,.55],[.50,-.22,.70,.67],[.70,-.30,.90,.50],[1,-.42,1.25,.28]]);s.left=[.40,1.02,.40];
}else if(a==='smoketoss'){s.stow=true;s.right=curve(q,[[0,-.42,1.25,.28],[.22,-.48,1.45,.06],[.42,-.32,.98,.69],[.62,-.40,1.08,.40],[1,-.42,1.25,.28]]);s.left=[.44,1.42,.25];s.torso=[.15,-.17+.26*hit,0];
}else if(a==='sight'){s.stow=true;s.right=[-.16,1.66,.42];s.left=[.38,1.56,.74];s.head=[.04,.12,0];s.torso=[.06,.14,0];
}else if(a==='brandspread'){s.stow=true;const spread=curve(q,[[0,0],[.20,0],[.50,1],[.75,.8],[1,0]])[0];s.right=[-.18-.45*spread,1.44,.62-.18*spread];s.left=[.18+.45*spread,1.44,.62-.18*spread];s.torso=[-.08,.12*recoil,0];
}else if(a==='drawcut'){s.right=curve(q,[[0,-.18,1.10,.20],[.20,-.12,1.10,.22],[.43,-.58,1.56,.60],[.66,-.64,1.48,.22],[1,-.42,1.25,.28]]);s.axis=curve(q,[[0,.85,.1,.3],[.22,.85,.1,.3],[.46,-.7,.35,.5],[1,0,1,0]]);s.left=[.28,1.12,.22];s.torso=[.16,-.38+.64*hit,0];s.body=[0,-.08*recoil,0];s.legs=true;
}else if(a==='starbursts'){s.stow=true;const t=(Math.min(q,.999)*3)%1;const hand=curve(t,[[0,-.46,1.38,.22],[.20,-.52,1.66,.12],[.48,-.24,1.42,.78],[1,-.46,1.38,.22]]);s.right=hand;s.left=[-hand[0],1.48, .98-hand[2]];s.torso=[.07,Math.sin(q*Math.PI*6)*.15,0];
}else if(a==='handseal'){s.stow=true;s.right=[-.12,1.53,.49];s.left=[.13,1.43,.48];s.head=[.09,0,0];s.torso=[.04,0,0];
}else if(a==='greatstar'){s.stow=true;s.right=curve(q,[[0,-.42,1.25,.28],[.23,-.49,1.94,.08],[.43,-.26,1.62,.72],[.67,-.28,1.30,.74],[1,-.42,1.25,.28]]);s.left=[.50,1.20,.17];s.torso=[-.10+.28*impact,-.22+.46*hit,0];
}else if(a==='bladeready'){s.right=curve(q,[[0,-.42,1.25,.28],[.25,-.16,1.50,.48],[.55,-.60,1.31,.47],[1,-.42,1.25,.28]]);s.left=[.33,1.53,.40];s.axis=[-.7,.35,.3];s.torso=[.08,-.18,0];
}else if(a==='shadowveil'){s.stow=true;s.legs=true;s.body=[0,-.10*recoil,0];s.right=[-.10,1.66,.45];s.left=[.12,1.52,.45];s.head=[.12,0,0];s.torso=[.18,0,0];
}else if(a==='counterready'){s.right=[-.32,1.52,.54];s.left=[.46,1.24,.30];s.axis=[-.55,.7,.2];s.torso=[.06,-.28,0];
}else if(a==='mirroropen'){s.stow=true;const spread=.38*impact;s.right=[-.21-spread,1.49,.55];s.left=[.21+spread,1.49,.55];s.torso=[-.04,0,0];
}else if(a==='steelguard'){s.right=[-.13,1.58,.55];s.axis=[.1,.97,.1];s.support=true;s.torso=[.12,.12,0];s.legs=true;
}else if(a==='countercoil'){s.right=[-.53,1.72,.16];s.left=[.43,1.40,.66];s.axis=[.15,.25,.95];s.torso=[.14,-.35,0];s.legs=true;s.body=[0,-.08*recoil,0];
}else if(a==='wavecast'){s.right=curve(q,[[0,-.50,1.60,.15],[.20,-.54,1.75,.12],[.48,-.25,1.48,.72],[.70,-.28,1.38,.68],[1,-.42,1.25,.28]]);s.axis=[.1,.45,.9];s.support=true;s.torso=[.10,-.16+.30*hit,0];
}else if(a==='harvest'){sweep();s.turn=Math.PI*1.35*smooth(q);s.left=[.46,1.34,.56];s.support=true;s.body=[0,-.06*recoil,0];
}else if(a==='packraise'||a==='resurrect'||a==='wallraise'||a==='armycall'){
 s.stow=true;const lift=curve(q,[[0,0],[.20,.1],[.55,1],[.75,.9],[1,0]])[0];
 if(a==='resurrect'){s.left=[.32,1.12+.70*lift,.65-.16*lift];s.right=[-.45,1.13,.24];s.torso=[.16*(1-lift),0,0];}
 if(a==='packraise'){s.left=[.49,1.10+.46*lift,.42];s.right=[-.49,1.10+.46*lift,.42];s.torso=[-.08*lift,0,0];}
 if(a==='wallraise'){s.right=[-.40,1.04+.67*lift,.62];s.left=[.40,1.04+.67*lift,.62];s.torso=[.12,0,0];}
 if(a==='armycall'){s.right=[-.30-.35*lift,1.43+.40*lift,.40];s.left=[.30+.35*lift,1.43+.40*lift,.40];s.head=[-.10,0,0];s.torso=[-.10*lift,0,0];}
}else if(a==='shockpalm'){s.stow=true;const press=curve(q,[[0,0],[.28,0],[.46,1],[.70,.9],[1,0]])[0];s.right=[-.24,1.42,.28+.48*press];s.left=[.27,1.42,.28+.48*press];s.torso=[.15*press,0,0];
}else if(a==='thunderplunge'){s.right=curve(q,[[0,-.40,1.50,.24],[.25,-.30,1.95,.14],[.50,-.27,.98,.66],[.70,-.27,.90,.66],[1,-.42,1.25,.28]]);s.axis=[0,-.85,.5];s.support=true;s.torso=[.43*impact,0,0];s.legs=true;s.body=[0,-.13*recoil,0];
}else if(a==='herdcall'){s.stow=true;s.right=curve(q,[[0,-.42,1.25,.28],[.22,-.12,1.70,.39],[.50,-.60,1.72,.50],[.75,-.65,1.50,.38],[1,-.42,1.25,.28]]);s.left=[.50,1.36,.57];s.torso=[-.08,-.2+.40*hit,0];
}else if(a==='lastbrace'){s.right=[-.15,1.35,.49];s.left=[.16,1.49,.51];s.axis=[.65,.65,0];s.support=true;s.torso=[.18,0,0];s.legs=true;s.body=[0,-.10*recoil,0];
}else if(a==='skycall'){s.stow=true;s.right=[-.18,1.44+.62*recoil,.45];s.left=[.18,1.44+.62*recoil,.45];s.torso=[-.08*recoil,0,0];s.head=[-.10,0,0];
}else if(['cleave','twin','cross','boarding'].includes(a))sweep(a==='twin'||a==='cross');
else if(['slam','execute','consecrate'].includes(a)){s.right=curve(q,[[0,-.40,1.45,.28],[.15,-.35,2.12,.10],[.34,-.28,.75,.67],[.56,-.28,.78,.67],[1,-.42,1.25,.28]]);s.axis=curve(q,[[0,0,1,0],[.16,0,.8,-.6],[.34,0,-.72,.7],[.56,0,-.72,.7],[1,0,1,0]]);s.torso=[.58*impact,0,0];s.body=[0,-.15*recoil,0];s.support=true;s.legs=true;}
else if(a==='headbutt'){s.torso=[.66*impact,0,0];s.head=[.24,0,0];s.body=[0,-.12*recoil,.15*impact];s.right=[-.52,1.05,.14];s.left=[.48,1.1,.12];s.axis=[-.7,-.65,.25];s.legs=true;}
else if(a==='vanish'){s.stow=true;s.right=[-.13,1.55,.45];s.left=[.13,1.55,.45];s.torso=[.25,0,0];s.head=[.12,0,0];s.legs=true;}
else if(a==='firecircle'){s.stow=true;const spread=impact;s.right=[-.25-.42*spread,1.35,.48-.30*spread];s.left=[.25+.42*spread,1.35,.48-.30*spread];s.torso=[.08,.18*recoil,0];}
else if(['rush','bash','evade','retreat','blink','vanish','dive','uppercut','ascend'].includes(a)){s.torso=[a==='ascend'?-.18:a==='retreat'?-.24:.35,0,a==='evade'?.20:0];s.right=[-.34,a==='uppercut'?1.8:1.15,.50];s.left=[.40,1.40,.44];s.support=a==='rush'||a==='dive'||a==='uppercut';s.axis=a==='dive'?[0,-.4,1]:[0,.4,1];s.stow=a==='vanish';s.legs=true;}
else if(a==='spin'){sweep();s.turn=Math.PI*2*smooth(q);s.right=[-.54,1.22,.38];s.axis=[-1,.1,.2];s.support=true;}
else if(['kick','spinkick'].includes(a)){s.stow=true;s.legs=true;s.kick=Math.sin(Math.PI*smooth(Math.min(1,q/.7)));s.torso=[-.20,0,0];s.right=[-.45,1.65,.42];s.left=[.40,1.60,.45];if(a==='spinkick')s.turn=Math.PI*2*smooth(q);}
else if(['palm','flurry','firepalm','firefan'].includes(a)){s.stow=true;const strike=a==='flurry'?(Math.sin(q*Math.PI*6-Math.PI/2)+1)/2:Math.sin(Math.PI*hit);s.right=[-.31,1.48,.25+.52*strike];s.left=[.36,1.43,a==='firefan'?.25+.46*strike:a==='flurry'?.77-.52*strike:.26];s.torso=[.12,-.12+.24*strike,0];}
else if(a==='bow'){s.bow=true;s.right=[-.28,1.57,.18];s.left=[.45,1.55,.48];}
else if(['thrust','throw','stars','pistol','broadside'].includes(a)){const t=a==='stars'?(q*3)%1:q;s.right=curve(t,[[0,-.44,1.52,.20],[.16,-.52,1.72,.12],[.38,-.25,1.52,.79],[.65,-.30,1.48,.68],[1,-.42,1.25,.28]]);s.axis=[0,.06,1];s.support=a==='thrust';s.stow=a==='stars'||a==='throw';s.pistol=a==='pistol'||a==='broadside';s.torso=[.07,-.16+.3*hit,0];}
else if(['guard','parry','ward','bond','meditate'].includes(a)){s.right=[-.32,1.40,.48];s.left=[.36,1.50,.47];s.axis=[.35,.9,0];s.support=a==='guard'||a==='parry';s.stow=a==='meditate';if(a==='meditate'){s.right=[-.20,1.30,.42];s.left=[.20,1.30,.42];}s.torso=[.04,-.10,0];}
else if(['place','toss'].includes(a)){s.stow=true;s.right=curve(q,[[0,-.40,1.4,.23],[.20,-.45,a==='place'?.92:1.8,.20],[.45,-.32,a==='place'?.70:1.30,.66],[1,-.42,1.25,.28]]);s.torso=[a==='place'?.42:.15,0,0];s.legs=a==='place';}
else if(['command','point','condemn'].includes(a)){s.left=[.34,1.62,.79];s.right=[-.45,1.14,.25];s.torso=[.08,.12,0];s.head=[0,-.08,0];}
else if(a==='roar'||a==='empower'||a==='offering'){s.right=[-.64,1.48,.16];s.left=[.64,1.48,.16];s.torso=[-.13,0,0];s.head=[-.16,0,0];s.stow=a==='offering';}
else {s.left=[.36,1.48,.74];s.right=[-.40,1.25,.28];
 if(['call','raise','channel'].includes(a)){s.left=[.47,1.55+.57*recoil,.35];s.right=[-.48,1.32+.45*recoil,.30];s.head=[-.08,0,0];}
 if(['pull','drain','bind'].includes(a)){s.left=[.35,1.48,.76-.37*hit];s.torso=[-.10*hit,0,0];}
 if(['burst','orb'].includes(a)){s.right=[-.48,1.40,.35+.18*hit];s.left=[.48,1.40,.35+.18*hit];s.stow=true;}
 if(a==='beam'){s.left=[.30,1.54,.79];s.torso=[.12,0,0];}
 if(a==='stop'){s.left=[.32,1.88,.62];s.head=[-.08,0,0];}
 if(a==='mend'){s.left=[.38,1.03,.62];s.torso=[.15,0,0];}
 }
return s;}
const api={configure,profiles,rows,durations,pose,valid,sample};root.BFSkillMotion=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
