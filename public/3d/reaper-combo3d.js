import * as T from './three.module.js';
import {armTo,PALMS} from './weapon-grips.js?v=2108';
export function restoreReaperPose(a){for(const [b,q,p]of a.reaperBones||[]){b.quaternion.copy(q);b.position.copy(p);}a.reaperBones=[];}
export function applyReaperPose(p,root,a,body,dt,override){
 if(a.local)window.HERO3D.reaperCombo=null;
 const api=window.BFReaperCombo,hit=p.swingCombo|0,grip=root.getObjectByName('WeaponPalmGrip'),profile=grip?.userData.gripProfile;
 const blocked=!api||p.weapon?.art!=='scythe'||!profile||hit<0||hit>2||p.dead||p.downed||p.dodgeTimer>0||p.combatPose?.remaining>0||p.throwHideT>0||p.chargeAmt>.04||p.dragonRide||p.sitting||p.emote?.t<4;
 if(blocked){api?.clear(p.peerId||'local');a.reaperAttack=null;return null;}
 let state=a.reaperAttack;
 if(override==null){
  if(p.atkTimer>0&&a.reaperLastSerial!==p.swingId){a.reaperLastSerial=p.swingId;state=a.reaperAttack={serial:p.swingId,hit,elapsed:Math.max(0,api.active[hit]-p.atkTimer)};}
  if(!state)return null;if(p.atkTimer>0)state.elapsed=Math.max(state.elapsed,api.active[state.hit]-p.atkTimer);else state.elapsed+=Math.max(0,dt||0);if(state.elapsed>=api.durations[state.hit]){a.reaperAttack=null;return null;}
 }
 const s=api.sample(override==null?state.hit:hit,override==null?state.elapsed/api.durations[state.hit]:override),weight=s.weight;
 if(weight<=0)return s;
 a.reaperBones??=[];const saved=new Set(),save=b=>{if(b&&!saved.has(b)){saved.add(b);a.reaperBones.push([b,b.quaternion.clone(),b.position.clone()]);}return b;},bone=n=>root.getObjectByName(n);
 for(const part of ['Torso','Head']){const b=save(bone(part)),angles=part==='Torso'?s.torso:s.head;if(b){b.rotateX(angles[0]*weight);b.rotateY(angles[1]*weight);b.rotateZ(angles[2]*weight);}}
 for(const part of ['Shoulder','UpperArm','LowerArm','Fist','Fist1','Fist2'])for(const side of ['L','R'])save(bone(part+side));
 const right=bone('FistR'),left=bone('FistL'),fingersR=bone('Fist1R'),fingersL=bone('Fist1L');if(!right||!left)return null;
 fingersR?.quaternion.identity();fingersL?.quaternion.identity();root.updateMatrixWorld(true);
 const frame=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(...s.x),new T.Vector3(...s.axis),new T.Vector3(...s.z)));
 const desired=root.getWorldQuaternion(new T.Quaternion()).multiply(frame),correction=desired.clone().multiply(grip.getWorldQuaternion(new T.Quaternion()).invert()),wristQ=correction.clone().multiply(right.getWorldQuaternion(new T.Quaternion()));
 const offset=grip.getWorldPosition(new T.Vector3()).sub(right.getWorldPosition(new T.Vector3())).applyQuaternion(correction),target=root.localToWorld(new T.Vector3(...s.grip)).sub(offset);
 armTo(root,'R',target,root.localToWorld(new T.Vector3(-.82,1.25,.08)),wristQ,weight);
 // Exactly the same support-palm offset as the anatomical weapon-grip layer.
 const palm=PALMS[body]||PALMS.Rogue;
 const support=()=>{root.updateMatrixWorld(true);const at=grip.localToWorld(new T.Vector3(profile.supportX||0,profile.support,0)),q=grip.getWorldQuaternion(new T.Quaternion()).multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),Math.PI/2)),offset=new T.Vector3(...palm.left).add(fingersL?.position||new T.Vector3()).multiply(left.getWorldScale(new T.Vector3())).applyQuaternion(q);return {target:at.sub(offset),q};};
 let sup=support();const shoulder=bone('UpperArmL'),elbow=bone('LowerArmL');
 for(let i=0;i<3&&shoulder&&elbow;i++){const at=shoulder.getWorldPosition(new T.Vector3()),e=elbow.getWorldPosition(new T.Vector3()),w=left.getWorldPosition(new T.Vector3()),reach=(at.distanceTo(e)+e.distanceTo(w))*.98,delta=sup.target.clone().sub(at);if(delta.length()<=reach)break;const adjust=at.add(delta.setLength(reach)).sub(sup.target);armTo(root,'R',right.getWorldPosition(new T.Vector3()).add(adjust),root.localToWorld(new T.Vector3(-.82,1.25,.08)),right.getWorldQuaternion(new T.Quaternion()),weight);sup=support();}
 armTo(root,'L',sup.target,root.localToWorld(new T.Vector3(.72,1.30,.12)),sup.q,weight);root.updateMatrixWorld(true);
 s.actualGrip=root.worldToLocal(grip.getWorldPosition(new T.Vector3())).toArray();s.gripAdjustment=new T.Vector3(...s.actualGrip).distanceTo(new T.Vector3(...s.grip));
 api.publish(p.peerId||'local',s.hit,s.actualGrip.map((v,i)=>v-s.grip[i]),{x:p.x||0,y:p.y||0,z:p.z||0,yaw:p.yaw||0});
 s.supportError=left.getWorldPosition(new T.Vector3()).distanceTo(sup.target)/(root.getWorldScale(new T.Vector3()).x||1);
 if(a.local)window.HERO3D.reaperCombo={hit:s.hit,phase:s.q,supportError:s.supportError,recovery:s.q>.73};return s;
}
