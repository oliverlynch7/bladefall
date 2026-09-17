import * as THREE from './three.module.js';
import {bakeWeaponContacts} from './weapon-choreography.js?v=1980';
export const articulatedTypes=new Set(["grunt","emberling","frostling","toxling","goblin","caster","sentinel","revenant","frostlobber","blinkstalker","sunpriest","marblestatue","siegeknight","royalarcanist","brute","warden","archer","sorcerer","colossus","king","tyrant","marblecolossus"]);
export function enemyAsset(type,original=false){return './enemy-assets/'+(!original&&articulatedTypes.has(type)?'articulated/':'')+(!original&&['archer','brute','warden'].includes(type)?type+'-v1980':type)+'.glb';}
export function motionFamily(type){if(/brute|colossus|siegeknight|embertotem/.test(type))return 'heavy';if(/archer|cragspitter|frostlobber/.test(type))return 'ranged';if(/caster|sorcerer|king|tyrant|priest|arcanist|wisp|tether/.test(type))return 'cast';if(/jackal|boar|sporeback|slime|flyer|shell|magmaskit/.test(type))return 'beast';return 'blade';}
// Angles are offsets in each bone's bind-local frame. Translation stays anchored.
function pose(family,phase,u,type){const p={body:[0,0,0],head:[0,0,0],armL:[0,0,0],armR:[0,0,0],legL:[0,0,0],legR:[0,0,0],tail:[0,0,0],rearL:[0,0,0],rearR:[0,0,0]};
const wind={heavy:[-.32,0,0,-2.25,-2.25],blade:[-.12,-.5,-.08,-.5,-1.6],cast:[-.15,0,0,-1.1,-1.1],ranged:[-.08,-.3,0,-1.4,-.8],beast:[.25,0,0,.25,.25]}[family];
const strike={heavy:[.6,0,0,-.2,-.2],blade:[.2,.65,.1,-.2,.6],cast:[.18,0,0,-1.65,-1.65],ranged:[.08,.12,0,-1.35,-.25],beast:[-.4,0,0,-.6,-.6]}[family];
let v;if(phase==='Windup'){const q=u*u*(3-2*u);v=wind.map(x=>x*q);}else if(phase==='Attack'){const q=u<.18?u/.18:Math.max(0,1-(u-.18)/.82);v=u<.18?wind.map((x,i)=>x+(strike[i]-x)*q):strike.map(x=>x*q*q);}else {const q=Math.sin(Math.PI*u)*Math.exp(-u*2);p.body=[-.3*q,.16*q,.12*q];p.head=[.22*q,-.12*q,0];p.armL=[-.35*q,0,-.15*q];p.armR=[-.2*q,0,.2*q];return p;}
if(type==='warden'){v[1]*=1.25;v[4]*=.8;}if(type==='brute'){v[3]*=.65;v[4]*=1.05;}if(type==='marblecolossus'){v[0]*=.55;v[3]*=.8;v[4]*=.8;}if(type==='tyrant'){v[1]=phase==='Windup'?-.25*u:.4*Math.sin(Math.PI*u);v[3]*=.65;}
p.body=v.slice(0,3);p.head=[-v[0]*.45,-v[1]*.35,0];p.armL=[v[3],0,family==='cast'?-.4*Math.sin(Math.PI*u):-.08];p.armR=[v[4],0,family==='cast'?.4*Math.sin(Math.PI*u):.08];
if(family==='blade'){p.armR[1]=-v[1]*.7;p.armL[2]=-.2;p.legL[0]=-v[0]*.35;p.legR[0]=v[0]*.2;}
if(family==='beast'){p.rearL[0]=-v[0]*.5;p.rearR[0]=-v[0]*.5;p.tail[1]=v[0]*.7;}
return p;}

function jointPose(key,phase,u,family,type){
 const peak=phase==='Windup'?u*u*(3-2*u):phase==='Attack'?(u<.18?1-u/.18*.75:.25*Math.pow(1-(u-.18)/.82,2)):Math.sin(Math.PI*u)*.4;
 if(key.startsWith('forearm')){const right=key.endsWith('R');const bend=family==='ranged'?(right?1.15:.18):family==='heavy'?(type==='brute'&& !right?.3:.85):family==='cast'?.6:(right?.75:.3);return [bend*peak,0,0];}
 if(key.startsWith('shin'))return [(family==='heavy'?.22:.1)*peak,0,0];return null;
}
export function revisedClips(root,type,original){const family=motionFamily(type),bones={};root.traverse(o=>{if(o.isBone)bones[o.name]=o;});const clips=original.filter(c=>!['Windup','Attack','Hit'].includes(c.name));
for(const [name,duration] of [['Windup',1],['Attack',.5],['Hit',.32]]){const tracks=[],times=Array.from({length:25},(_,i)=>i/24*duration);for(const [key,bone]of Object.entries(bones)){if(key==='root')continue;const values=[];for(let i=0;i<25;i++){const angles=jointPose(key,name,i/24,family,type)||pose(family,name,i/24,type)[key]||[0,0,0];const q=bone.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...angles)));values.push(q.x,q.y,q.z,q.w);}tracks.push(new THREE.QuaternionKeyframeTrack(bone.name+'.quaternion',times,values));}clips.push(new THREE.AnimationClip(name,duration,tracks));}if(bones.forearmL){const index=clips.findIndex(c=>c.name==='Move');if(index>=0){const move=clips[index].clone();move.tracks=move.tracks.filter(t=>!/^((forearm|shin)[LR])\.quaternion$/.test(t.name));for(const key of ['forearmL','forearmR','shinL','shinR']){const times=[],values=[];for(let i=0;i<=24;i++){const u=i/24,phase=u*Math.PI*2+(key.endsWith('R')?Math.PI:0),angle=key.startsWith('shin')?Math.max(0,Math.sin(phase))*.38:.16+Math.max(0,Math.sin(phase))*.16;times.push(u*move.duration);const q=bones[key].quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(angle,0,0)));values.push(q.x,q.y,q.z,q.w);}move.tracks.push(new THREE.QuaternionKeyframeTrack(key+'.quaternion',times,values));}clips[index]=move;}}return bakeWeaponContacts(root,bones,type,clips);}
