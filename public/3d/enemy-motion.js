import {choreographyProfile,choreographyPose} from './enemy-choreography.js?v=2141';
import {fallenClips} from './fallen-motion.js?v=2007';
import {orchardClips} from './brute-motion.js?v=2000';
import * as THREE from './three.module.js';
import {bakeWeaponContacts} from './weapon-choreography.js?v=1980';
export const articulatedTypes=new Set(["grunt","emberling","frostling","toxling","goblin","caster","sentinel","revenant","frostlobber","blinkstalker","sunpriest","marblestatue","siegeknight","royalarcanist","brute","warden","archer","sorcerer","colossus","king","tyrant","marblecolossus"]);
export const upgradedTypes=new Set('grunt flyer emberling frostling toxling shadeling sparkling goblin bones slime slimelet caster charger mimic dustjackal cragspitter galewisp thornboar sporeback sentinel revenant dummy bosscrystal frostshell frostlobber magmaskit embertotem blinkstalker voidtether sunpriest marblestatue siegeknight royalarcanist brute warden archer sorcerer king tyrant officer-shield officer-spear prison_pike prison_guard prison_hound prison_vessel prison_bell prison_maw prison_unbound'.split(' '));
export function enemyAsset(type,original=false){if(original&&type.startsWith('prison_')){const base={prison_pike:'grunt',prison_guard:'sentinel',prison_hound:'dustjackal',prison_vessel:'embertotem',prison_bell:'siegeknight',prison_maw:'charger',prison_unbound:'tyrant'}[type];return './enemy-assets/upgraded/'+base+'-v2128.glb';}if(original&&type.startsWith('officer-'))return './enemy-assets/officers/'+type.slice(8)+'.glb';if(!original&&type==='colossus')return './enemy-assets/articulated/forge-colossus-v2125.glb';if(!original&&type==='marblecolossus')return './enemy-assets/articulated/marblecolossus-v2126.glb';if(!original&&upgradedTypes.has(type))return './enemy-assets/upgraded/'+type+'-v2141.glb';return './enemy-assets/'+(!original&&articulatedTypes.has(type)?'articulated/':'')+(!original&&['archer','brute','warden'].includes(type)?type+'-v1980':type)+'.glb';}
export function motionFamily(type){if(/brute|colossus|siegeknight|embertotem|prison_bell|prison_vessel/.test(type))return 'heavy';if(/archer|cragspitter|frostlobber|prison_pike/.test(type))return 'ranged';if(/caster|sorcerer|king|tyrant|priest|arcanist|wisp|tether|prison_unbound/.test(type))return 'cast';if(/jackal|hound|boar|sporeback|slime|flyer|shell|magmaskit|prison_maw|charger/.test(type))return 'beast';return 'blade';}
const QUAD_MOTION=new Set('charger dustjackal cragspitter thornboar sporeback frostshell magmaskit prison_hound prison_maw'.split(' '));
const HOVER_MOTION=new Set('flyer shadeling sparkling galewisp voidtether'.split(' '));
const OBJECT_MOTION=new Set('slime slimelet mimic dummy bosscrystal embertotem prison_vessel'.split(' '));
const HEAVY_MOTION=new Set('brute warden siegeknight colossus marblecolossus prison_bell'.split(' '));
const SCOUT_MOTION=new Set('goblin archer blinkstalker officer-spear prison_pike'.split(' '));
const CAST_MOTION=new Set('caster frostlobber sorcerer sunpriest royalarcanist king tyrant prison_unbound'.split(' '));
const ACTION_VARIANTS={prison_pike:['thrust'],prison_guard:['bash'],prison_hound:['rush'],prison_vessel:['ember'],prison_bell:['sweep','toll'],prison_maw:['rush','maul','crush'],prison_unbound:['cross','mark','toll'],colossus:['slam','sweep','vents'],marblecolossus:['hammer','sweep','fall']};
function lifePose(type,phase,u){
 const p={},wave=Math.sin(2*Math.PI*u),other=Math.sin(2*Math.PI*u+Math.PI),breath=Math.sin(2*Math.PI*u),fall=Math.min(1,u*1.45),ease=fall*fall*(3-2*fall);
 if(phase==='Death'){
  if(QUAD_MOTION.has(type)){p.body=[.56*ease,0,.20*ease];p.head=[.35*ease,0,0];for(const k of ['armL','armR','rearL','rearR'])p[k]=[-.34*ease,0,0];p.tail=[.15*ease,0,0];}
  else if(HOVER_MOTION.has(type)){p.body=[.42*ease,0,.60*ease];p.head=[.20*ease,0,0];p.armL=[.45*ease,0,-.30*ease];p.armR=[.45*ease,0,.30*ease];}
  else if(OBJECT_MOTION.has(type)){p.body=[.38*ease,0,.33*ease];p.head=[.28*ease,0,0];}
  else{p.body=[.56*ease,0,(type.length%2?-.29:.29)*ease];p.head=[.24*ease,0,0];p.armL=[.64*ease,0,-.28*ease];p.armR=[.59*ease,0,.28*ease];p.legL=[-.30*ease,0,0];p.legR=[.22*ease,0,0];}
  return p;
 }
 if(phase==='Hit'){
  const pulse=Math.sin(Math.PI*u)*Math.exp(-1.1*u);
  if(QUAD_MOTION.has(type)){p.body=[-.22*pulse,0,.09*pulse];p.head=[.32*pulse,0,0];p.armL=[-.14*pulse,0,0];p.armR=[-.14*pulse,0,0];p.tail=[-.20*pulse,0,0];}
  else if(OBJECT_MOTION.has(type)){p.body=[-.17*pulse,0,.12*pulse];p.head=[.23*pulse,0,0];}
  else{p.body=[-.30*pulse,.13*pulse,.10*pulse];p.head=[.26*pulse,-.13*pulse,0];p.armL=[-.31*pulse,0,-.12*pulse];p.armR=[-.25*pulse,0,.18*pulse];}
  return p;
 }
 const move=phase==='Move',amp=move?1:.14;
 if(QUAD_MOTION.has(type)){
  // Diagonal pairs contact the ground together. Rear legs have their own bones.
  p.body=[.035*amp*wave,0,.045*amp*wave];p.head=[-.055*amp*wave,.045*amp*other,0];
  p.armL=[.33*amp*wave,0,0];p.armR=[.33*amp*other,0,0];
  p.rearL=[.28*amp*other,0,0];p.rearR=[.28*amp*wave,0,0];p.tail=[.10*amp*wave,.17*amp*other,0];
 }else if(HOVER_MOTION.has(type)){
  p.body=[.055*amp*wave,.10*amp*wave,.055*amp*other];p.head=[-.035*amp*wave,-.045*amp*wave,0];
  const wings=type==='flyer'?.48:.16;p.armL=[.12*amp*wave,0,-wings*amp*wave];p.armR=[.12*amp*wave,0,wings*amp*wave];
  p.tail=[.10*amp*other,0,0];
 }else if(OBJECT_MOTION.has(type)){
  const jiggle=(type==='slime'||type==='slimelet') ? .13 : .055;
  p.body=[jiggle*amp*wave,.07*amp*wave,.04*amp*other];p.head=[-.09*amp*wave,0,0];
  if(type==='mimic')p.head=[-.24*amp*Math.max(0,wave),0,0];
 }else{
  const stride=HEAVY_MOTION.has(type)?.27:SCOUT_MOTION.has(type)?.42:.34;
  p.body=[.035*amp*wave,.055*amp*wave,.055*amp*other];p.head=[-.025*amp*wave,-.045*amp*wave,0];
  p.legL=[stride*amp*wave,0,0];p.legR=[stride*amp*other,0,0];
  p.shinL=[Math.max(0,-wave)*stride*.62*amp,0,0];p.shinR=[Math.max(0,wave)*stride*.62*amp,0,0];
  const armSwing=CAST_MOTION.has(type)?.10:HEAVY_MOTION.has(type)?.10:.19;
  p.armL=[armSwing*amp*other,0,-.045];p.armR=[armSwing*.58*amp*wave,0,.045];
  p.forearmL=[.12+.055*amp*wave,0,0];p.forearmR=[.16+.04*amp*other,0,0];
 }
 if(!move){p.body[0]+=.018*breath;p.head=(p.head||[0,0,0]).map((v,i)=>v+(i===1?.035*breath:0));}
 return p;
}
// Angles are offsets in each bone's bind-local frame. Translation stays anchored.
function pose(family,phase,u,type){const p={body:[0,0,0],head:[0,0,0],armL:[0,0,0],armR:[0,0,0],legL:[0,0,0],legR:[0,0,0],tail:[0,0,0],rearL:[0,0,0],rearR:[0,0,0]};
const wind={heavy:[-.32,0,0,-2.25,-2.25],blade:[-.12,-.5,-.08,-.5,-1.6],cast:[-.15,0,0,-1.1,-1.1],ranged:[-.08,-.3,0,-1.4,-.8],beast:[.25,0,0,.25,.25]}[family];
const strike={heavy:[.6,0,0,-.2,-.2],blade:[.2,.65,.1,-.2,.6],cast:[.18,0,0,-1.65,-1.65],ranged:[.08,.12,0,-1.35,-.25],beast:[-.4,0,0,-.6,-.6]}[family];
const impact=family==='heavy'?.32:family==='beast'?.22:.18;
let v;if(phase==='Windup'){const q=u*u*(3-2*u);v=wind.map(x=>x*q);}else if(phase==='Attack'){const q=u<impact?u/impact:Math.max(0,1-(u-impact)/(1-impact));v=u<impact?wind.map((x,i)=>x+(strike[i]-x)*q):strike.map(x=>x*q*q);}else {const q=Math.sin(Math.PI*u)*Math.exp(-u*2);p.body=[-.3*q,.16*q,.12*q];p.head=[.22*q,-.12*q,0];p.armL=[-.35*q,0,-.15*q];p.armR=[-.2*q,0,.2*q];return p;}
if(type==='warden'){v[1]*=1.25;v[4]*=.8;}if(type==='brute'){v[3]*=.65;v[4]*=1.05;}if(type==='marblecolossus'){v[0]*=.55;v[3]*=.8;v[4]*=.8;}if(type==='tyrant'){v[1]=phase==='Windup'?-.25*u:.4*Math.sin(Math.PI*u);v[3]*=.65;}
p.body=v.slice(0,3);p.head=[-v[0]*.45,-v[1]*.35,0];p.armL=[v[3],0,family==='cast'?-.4*Math.sin(Math.PI*u):-.08];p.armR=[v[4],0,family==='cast'?.4*Math.sin(Math.PI*u):.08];
if(family==='blade'){p.armR[1]=-v[1]*.7;p.armL[2]=-.2;p.legL[0]=-v[0]*.35;p.legR[0]=v[0]*.2;}
if(family==='beast'){p.rearL[0]=-v[0]*.5;p.rearR[0]=-v[0]*.5;p.tail[1]=v[0]*.7;}
return p;}

function jointPose(key,phase,u,family,type){
 const impact=family==='heavy'?.32:family==='beast'?.22:.18;
 const peak=phase==='Windup'?u*u*(3-2*u):phase==='Attack'?(u<impact?1-u/impact*.75:.25*Math.pow(1-(u-impact)/(1-impact),2)):Math.sin(Math.PI*u)*.4;
 if(key.startsWith('forearm')){const right=key.endsWith('R');const bend=family==='ranged'?(right?1.15:.18):family==='heavy'?(type==='brute'&& !right?.3:.85):family==='cast'?.6:(right?.75:.3);return [bend*peak,0,0];}
 if(key.startsWith('shin'))return [(family==='heavy'?.22:.1)*peak,0,0];return null;
}
export function revisedClips(root,type,original){const family=motionFamily(type),bones={};root.traverse(o=>{if(o.isBone)bones[o.name]=o;});const replace=new Set(['Idle','Move','Windup','Attack','Hit','Death','Recover']);const clips=original.filter(c=>!replace.has(c.name));
 const names=[['Idle',2.4],['Move',QUAD_MOTION.has(type)?.55:HEAVY_MOTION.has(type)?.90:.68],['Windup',1],['Attack',.5],['Hit',.32],['Death',.78],...(choreographyProfile(type)?[['Recover',choreographyProfile(type).recover]]:[])];
 for(const move of ACTION_VARIANTS[type]||[])names.push(['Windup_'+move,1],['Attack_'+move,.5]);
 for(const [name,duration] of names){const tracks=[],times=Array.from({length:25},(_,i)=>i/24*duration),phase=name.split('_')[0],move=name.includes('_')?name.slice(name.indexOf('_')+1):null;
  for(const [key,bone]of Object.entries(bones)){if(key==='root')continue;const values=[];for(let i=0;i<25;i++){const u=i/24,custom=choreographyPose(type,phase,u,move),angles=['Idle','Move','Hit','Death'].includes(phase)?lifePose(type,phase,u)[key]||[0,0,0]:custom?(custom[key]||[0,0,0]):jointPose(key,phase,u,family,type)||pose(family,phase,u,type)[key]||[0,0,0];const q=bone.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...angles)));values.push(q.x,q.y,q.z,q.w);}tracks.push(new THREE.QuaternionKeyframeTrack(bone.name+'.quaternion',times,values));}
  clips.push(new THREE.AnimationClip(name,duration,tracks));
 }
 if(type==='brute')orchardClips(bones,clips);const result=bakeWeaponContacts(root,bones,type,clips);return type==='warden'?fallenClips(bones,result):result;}
