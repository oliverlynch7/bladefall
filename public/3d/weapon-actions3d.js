import * as T from './three.module.js';
import {armTo,PALMS} from './weapon-grips.js?v=2108';
const v=(a=[0,0,0])=>new T.Vector3(...a),q=()=>new T.Quaternion();
export function restoreWeaponAction(a){for(const [b,rot,pos]of a.weaponBones||[]){b.quaternion.copy(rot);b.position.copy(pos);}a.weaponBones=[];}
export function applyWeaponAction(p,root,a,body,dt,preview){
 const api=window.BFWeaponActions,id=p.peerId||'local';if(a.local)window.HERO3D.weaponAction=null;
 const clear=()=>{api?.clear(id);a.weaponTrace=null;a.weaponPlayback=null;return null;};
 if(!api||p.dead||p.downed||p.pausedSafe||p.dodgeTimer>0||p.dragonRide||p.sitting||p.emote?.t<4||p.combatPose?.skill&&p.combatPose.remaining>0)return clear();
 const charging=preview?.mode==='hold'||!preview&&(p.chargeAmt||0)>0;
 const action=preview?{key:preview.key||api.key(p.weapon,preview.mode!=='basic'),charged:preview.mode!=='basic',serial:77,alt:preview.alt||0,duration:1,remaining:1}:api.valid(p.weaponAction);
 if(!charging&&(!action||action.remaining<=0)){if(!preview&&action)a.weaponCompleted=Math.max(a.weaponCompleted||0,action.serial);return clear();}
 if(!preview&&!charging&&action.serial<=(a.weaponCompleted||-1))return clear();
 const key=charging?api.key(p.weapon,true):action.key;
 // The dedicated Reaper combo owns its three basic swings.
 if(key==='scythe'&&!charging&&!action.charged&&(p.swingCombo??-1)>=0)return clear();
 if(!preview&&key!=='bash'&&key!==api.key(p.weapon,charging||action.charged))return clear();
 let phase=preview?.phase||0;
 if(!preview&&!charging){let t=a.weaponPlayback;if(!t||t.serial!==action.serial||t.key!==key)t=a.weaponPlayback={serial:action.serial,key,elapsed:action.duration-action.remaining};else if(dt>0)t.elapsed=Math.max(t.elapsed+dt,action.duration-action.remaining);phase=Math.min(1,t.elapsed/action.duration);if(phase>=1){a.weaponCompleted=action.serial;return clear();}}
 const amount=preview?.amount??p.chargeAmt??0,s=api.sample(key,phase,charging||action.charged,action?.alt||0,charging?amount:null);if(!s)return clear();
 if(!charging&&action?.thrown&&phase>.30)s.support=false;
 const weight=s.weight;if(weight<=0){api.clear(id);return s;}
 const save=b=>{if(b&&!a.weaponBones.some(row=>row[0]===b))a.weaponBones.push([b,b.quaternion.clone(),b.position.clone()]);return b;},bone=n=>root.getObjectByName(n);a.weaponBones??=[];
 if(s.turn){const pivot=save(bone('Root'));pivot?.rotateY(s.turn);}
 for(const part of ['Torso','Head']){const b=save(bone(part)),angles=part==='Torso'?s.torso:s.head;if(b){b.rotateX(angles[0]*weight);b.rotateY(angles[1]*weight);b.rotateZ(angles[2]*weight);}}
 for(const part of ['Shoulder','UpperArm','LowerArm','Fist','Fist1','Fist2'])for(const side of ['L','R'])save(bone(part+side));
 let primary=s.primary,grip=root.getObjectByName('WeaponPalmGrip'),profile=grip?.userData.gripProfile;
 const saber=p.weapon?.intrinsic==='pirate'&&key==='saber';if(saber){grip=root.getObjectByName('PirateSaber');profile={length:1.27};primary='L';s.right[0]*=-1;s.left[0]*=-1;s.axis[0]*=-1;}
 const gun=key==='flintlock'&&!!root.getObjectByName('PirateFlintlock');if(gun){grip=root.getObjectByName('PirateFlintlock');profile=null;}
 const wrist=bone('Fist'+primary),other=primary==='R'?'L':'R',finger=bone('Fist1'+primary);if(!wrist)return clear();finger?.quaternion.identity();bone('Fist1'+other)?.quaternion.identity();root.updateMatrixWorld(true);
 let desired;
 if(key==='cross')desired=q().setFromRotationMatrix(new T.Matrix4().makeBasis(v([0,.1,.995]),v([0,.995,-.1]),v([-1,0,0])));
 else if(key==='bow'||key==='bash'&&profile?.kind==='bow')desired=q().setFromRotationMatrix(new T.Matrix4().makeBasis(v([0,0,1]),v([0,1,0]),v([-1,0,0])));
 else if(gun)desired=q().setFromRotationMatrix(new T.Matrix4().makeBasis(v([0,0,1]),v([0,1,0]),v([-1,0,0])));
 else desired=q().setFromUnitVectors(v([0,1,0]),v(s.axis));
 let wristQ=root.getWorldQuaternion(q()).multiply(desired),target=root.localToWorld(v(s.right));
 if(grip){const correction=wristQ.clone().multiply(grip.getWorldQuaternion(q()).invert());wristQ=correction.clone().multiply(wrist.getWorldQuaternion(q()));target.sub(grip.getWorldPosition(v()).sub(wrist.getWorldPosition(v())).applyQuaternion(correction));}
 else if(!grip){wristQ=root.getWorldQuaternion(q()).multiply(q().setFromEuler(new T.Euler(-Math.PI/2,0,primary==='L'?-.2:.2)));}
 const hint=root.localToWorld(v([primary==='R'?-.82:.82,1.24,.12]));armTo(root,primary,target,hint,wristQ,weight);root.updateMatrixWorld(true);
 // True support-palm contact, including bow string tension and crossbow fore-end.
 let supportError=0;
 if(profile&&(s.support||s.bow)&&!saber){
  const left=bone('FistL'),fingersL=bone('Fist1L'),palm=PALMS[body]||PALMS.Warrior;
  const support=()=>{root.updateMatrixWorld(true);const point=s.bow?[profile.stringX-s.draw,0,0]:profile.supportPoint||[profile.supportX||0,profile.support||.26,0];const at=grip.localToWorld(v(point)),orientation=grip.getWorldQuaternion(q()).multiply(q().setFromAxisAngle(v([0,0,1]),Math.PI/2)),offset=v(palm.left).add(fingersL?.position||v()).multiply(left.getWorldScale(v())).applyQuaternion(orientation);return {at:at.sub(offset),orientation};};
  let sup=support();const upper=bone('UpperArmL'),lower=bone('LowerArmL');
  for(let i=0;i<3&&upper&&lower;i++){const at=upper.getWorldPosition(v()),el=lower.getWorldPosition(v()),w=left.getWorldPosition(v()),reach=(at.distanceTo(el)+el.distanceTo(w))*.98,delta=sup.at.clone().sub(at);if(delta.length()<=reach)break;const adjust=at.add(delta.setLength(reach)).sub(sup.at);armTo(root,'R',wrist.getWorldPosition(v()).add(adjust),hint,wrist.getWorldQuaternion(q()),weight);sup=support();}
  armTo(root,'L',sup.at,root.localToWorld(v([.76,1.24,.12])),sup.orientation,weight);root.updateMatrixWorld(true);supportError=left.getWorldPosition(v()).distanceTo(sup.at)/(root.getWorldScale(v()).x||1);
  if(s.bow){const string=grip.getObjectByName('BowString');if(string){string.geometry.attributes.position.setX(1,profile.stringX-s.draw);string.geometry.attributes.position.needsUpdate=true;string.geometry.computeBoundingSphere();}}
 }else{
  // A free arm remains in a guard or channels the spell; never drives the legs.
  const otherQ=root.getWorldQuaternion(q()).multiply(q().setFromEuler(new T.Euler(-.8,0,other==='L'?-.2:.2)));
  armTo(root,other,root.localToWorld(v(s.left)),root.localToWorld(v([other==='R'?-.75:.75,1.18,.1])),otherQ,weight*.85);
 }
 root.updateMatrixWorld(true);
 const tip=grip&&!gun?root.worldToLocal(grip.localToWorld(v(key==='scythe'?[.95,.86,0]:key==='cross'?[.7,0,0]:key==='bow'?[.25,0,0]:[0,s.tip||.15,0]))):gun&&root.getObjectByName('PirateMuzzle')?root.worldToLocal(root.getObjectByName('PirateMuzzle').getWorldPosition(v())):root.worldToLocal(wrist.getWorldPosition(v())).add(v([0,0,.14]));
 const serial=action?.serial??p.swingId??0;
 let trace=a.weaponTrace;if(!trace||trace.key!==key||trace.serial!==serial||charging)trace=a.weaponTrace={key,serial,history:[]};
 if(!charging&&dt>0){trace.history.push(tip.toArray());if(trace.history.length>9)trace.history.shift();}
 api.publish(id,{key,serial,tip:tip.toArray(),history:trace.history,x:p.x||0,y:p.y||0,z:p.z||0,yaw:p.yaw||0,charge:charging?amount:null,color:({fire:'#ff914a',ice:'#8fe5ff',void:'#bd95f2',arcane:'#cdb0ff',holy:'#fff0ad',poison:'#b6e47b'})[p.weapon?.el]||'#edcb86',time:(a.weaponVisualTime=(a.weaponVisualTime||0)+Math.max(0,dt||0))});
 s.supportError=supportError;s.actualTip=tip.toArray();if(a.local)window.HERO3D.weaponAction={key,phase:s.q,charging,supportError};return s;
}
