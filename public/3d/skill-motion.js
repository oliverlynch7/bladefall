/* Presentation only. Explicit current skill IDs: never infer an action from a particle form. */
(function(root){
'use strict';
const rows={
 warrior:'cleave bash rush spin guard slam roar execute',
 ranger:'bow bow retreat bow place toss point point',
 mage:'cast beam blink burst pull ward channel burst',
 reaper:'cleave cleave blink ascend pull bind cleave channel',
 paladin:'bash call guard consecrate ward burst guard call',
 necromancer:'raise cast raise burst raise pull raise channel',
 ninja:'cleave stars blink toss point throw empower vanish',
 berserker:'cleave headbutt rush slam spin execute roar guard',
 pirate:'pistol broadside boarding retreat toss empower call place',
 chronomancer:'cast beam burst blink pull ward stop burst',
 monk:'flurry palm parry evade spinkick palm meditate kick',
 stormcaller:'cast beam blink burst orb ward bind burst',
 warlock:'cast throw bind drain blink orb offering condemn',
 skylancer:'uppercut thrust dive ascend rush call dive pull',
 bladedancer:'parry twin cleave evade parry cross parry parry',
 beastmaster:'command bow bond evade mend roar command empower',
 pyromancer:'firepalm firefan burst ward beam firecircle channel call'
};
const durations={cleave:.48,bash:.42,rush:.48,spin:.64,guard:.58,slam:.64,roar:.62,execute:.62,bow:.48,retreat:.50,place:.60,toss:.44,point:.42,cast:.42,beam:.62,blink:.32,burst:.55,pull:.62,ward:.60,channel:.70,ascend:.58,bind:.55,call:.68,consecrate:.62,raise:.70,stars:.64,throw:.44,empower:.56,vanish:.42,headbutt:.52,pistol:.38,broadside:.58,boarding:.52,stop:.62,flurry:.58,palm:.45,parry:.56,evade:.42,spinkick:.65,meditate:.64,kick:.60,orb:.62,drain:.64,offering:.66,condemn:.66,uppercut:.52,thrust:.44,dive:.54,twin:.56,cross:.58,command:.46,bond:.58,mend:.64,firepalm:.40,firefan:.56,firecircle:.62};
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
if(['cleave','twin','cross','boarding'].includes(a))sweep(a==='twin'||a==='cross');
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
