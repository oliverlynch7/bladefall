import * as T from './three.module.js';
import {armTo} from './weapon-grips.js?v=2108';
// Undo before AnimationMixer samples the next frame, even after cancellation/class changes.
export function restoreSkillPose(a){
 for(const [b,q,p] of a.skillBones||[]){b.quaternion.copy(q);b.position.copy(p);}
 for(const [n,v] of a.skillWeapons||[])n.visible=v;
 a.skillBones=[];a.skillWeapons=[];
}
export function applySkillPose(p,root,a){
 const api=window.BFSkillMotion,pose=p.combatPose,d=api?.profiles[pose?.skill];
 if(!d||!(pose.remaining>0)||p.dead||p.downed||p.dragonRide||p.sitting||p.emote?.t<4||(p.dodgeTimer>0&&!pose.duringDodge))return null;
 a.skillBones??=[];a.skillWeapons??=[];
 const s=api.sample(d.id,1-pose.remaining/d.duration),weight=s.weight;
 if(weight<=0)return s;
 // Cache lookup only; never cache the pose. Shared clips may omit tracks on the next frame.
 if(a.skillRoot!==root){a.skillRoot=root;a.skillMap={};root.traverse(b=>{if(b.isBone)a.skillMap[b.name]=b;});}
 const saved=new Set(),bone=name=>a.skillMap[name],save=b=>{if(b&&!saved.has(b)){saved.add(b);a.skillBones.push([b,b.quaternion.clone(),b.position.clone()]);}return b;};
 const turn=(name,x=0,y=0,z=0)=>{const b=save(bone(name));if(b){b.rotateX(x*weight);b.rotateY(y*weight);b.rotateZ(z*weight);}};
 const arm=(side,target,hint,wristQ=null)=>{
  for(const n of ['Shoulder','UpperArm','LowerArm','Fist','Fist1','Fist2'])save(bone(n+side));
  armTo(root,side,root.localToWorld(new T.Vector3(...target)),root.localToWorld(new T.Vector3(...hint)),wristQ,weight);
 };
 const moving=Math.hypot(p.vx||0,p.vz||0)>20,feet=[];
 if(s.legs&&!moving&&p.onGround!==false){
  root.updateMatrixWorld(true);
  for(const side of ['L','R']){if(s.kick&&side==='R')continue;const f=bone('Foot'+side);if(f)feet.push({side,position:f.getWorldPosition(new T.Vector3()),rotation:f.getWorldQuaternion(new T.Quaternion())});}
 }
 if(s.kick){const f=bone('FootR'),hip=bone('UpperLegR'),knee=bone('LowerLegR');if(f&&hip&&knee){root.updateMatrixWorld(true);const h=hip.getWorldPosition(new T.Vector3()),k=knee.getWorldPosition(new T.Vector3()),start=f.getWorldPosition(new T.Vector3()),reach=h.distanceTo(k)+k.distanceTo(start),forward=root.localToWorld(new T.Vector3(0,0,1)).sub(root.localToWorld(new T.Vector3())).normalize(),target=h.clone().addScaledVector(forward,reach*.98);feet.push({side:'R',kick:true,position:start.lerp(target,s.kick*weight),rotation:f.getWorldQuaternion(new T.Quaternion())});}}
 turn('Torso',...s.torso);turn('Head',...s.head);
 const body=save(bone('Body'));if(body){body.position.addScaledVector(new T.Vector3(...s.body),weight);body.rotateY(s.turn);}
 if(s.legs&&!moving&&p.onGround!==false){for(const side of ['R','L']){turn('UpperLeg'+side,-.15*weight);turn('LowerLeg'+side,.25*weight);}}
 root.updateMatrixWorld(true);
 // Keep support feet where they were before the crouch. Lowering Body alone sinks feet
 // through the floor; rotating knees without this solve makes a slam slide backwards.
 for(const f of feet){
  const upper=save(bone('UpperLeg'+f.side)),lower=save(bone('LowerLeg'+f.side)),foot=save(bone('Foot'+f.side));if(!upper||!lower||!foot)continue;
  const pos=b=>b.getWorldPosition(new T.Vector3()),hip=pos(upper),knee=pos(lower),ankle=pos(foot),l1=hip.distanceTo(knee),l2=knee.distanceTo(ankle),delta=f.position.clone().sub(hip),dist=T.MathUtils.clamp(delta.length(),Math.abs(l1-l2)+.001,(l1+l2)*.999),dir=delta.normalize();
  const along=(l1*l1+dist*dist-l2*l2)/(2*dist),bend=root.localToWorld(new T.Vector3(f.side==='R'?-.2:.2,.55,.65)).sub(hip);bend.addScaledVector(dir,-bend.dot(dir)).normalize();
  const elbow=hip.clone().addScaledVector(dir,along).addScaledVector(bend,Math.sqrt(Math.max(0,l1*l1-along*along)));
  for(const [b,to] of [[upper,elbow],[lower,f.position]]){const q=b.getWorldQuaternion(new T.Quaternion()),axis=new T.Vector3(0,1,0).applyQuaternion(q),desired=new T.Quaternion().setFromUnitVectors(axis,to.clone().sub(pos(b)).normalize()).multiply(q);desired.premultiply(b.parent.getWorldQuaternion(new T.Quaternion()).invert());b.quaternion.copy(desired);b.updateMatrixWorld(true);}
  // These source rigs use independent Foot controls under Root, not children of LowerLeg.
  // Move that control too; rotating the shin alone leaves the shoe on the ground.
  if(foot.parent!==lower)foot.position.copy(foot.parent.worldToLocal(f.position.clone()));
  foot.quaternion.copy(f.rotation.clone().premultiply(foot.parent.getWorldQuaternion(new T.Quaternion()).invert()));foot.updateMatrixWorld(true);
  f.error=pos(lower).add(new T.Vector3(0,l2,0).applyQuaternion(lower.getWorldQuaternion(new T.Quaternion()))).distanceTo(f.position);
 }
 s.footError=feet.filter(f=>!f.kick).reduce((m,f)=>Math.max(m,f.error||0),0);
 const saber=s.action==='boarding'?root.getObjectByName('PirateSaber'):null,primary=saber?'L':'R';
 const grip=saber||root.getObjectByName('WeaponPalmGrip'),profile=grip?.userData.gripProfile;
 if(saber){s.right[0]*=-1;s.axis[0]*=-1;}
 if(s.bow&&profile?.kind==='pole'){s.axis=[0,.15,1];s.right=[-.32,1.5,.3+.4*Math.sin(Math.PI*(1-pose.remaining/d.duration))];s.support=true;}
 if(s.bow&&profile?.kind==='crossbow'){s.right=[-.18,1.40,.5-.08*Math.sin(Math.PI*(1-pose.remaining/d.duration))];s.support=true;}
 // Stow complete attachments, including pirate off-hand and stock weapon children. Never hide
 // hands, skins or class ornaments. Every visibility value is restored before the next frame.
 if(s.stow)root.traverse(n=>{if(n.userData?._weap||(!n.isBone&&n.parent?.isBone&&/^weapon[lr]$/i.test(n.parent.name))){a.skillWeapons.push([n,n.visible]);n.visible=false;}});
 let wristQ;
 if(grip&&!s.stow&&!(s.bow&&profile?.kind==='bow')){
  const wrist=bone('Fist'+primary);if(wrist){
   const direction=new T.Vector3(...s.axis).normalize(),frame=profile?.kind==='crossbow'
    ?new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0,.1,.995),new T.Vector3(0,.995,-.1),new T.Vector3(-1,0,0)))
    :new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),direction);
   const desired=root.getWorldQuaternion(new T.Quaternion()).multiply(frame),correction=desired.multiply(grip.getWorldQuaternion(new T.Quaternion()).invert());
   wristQ=correction.multiply(wrist.getWorldQuaternion(new T.Quaternion()));
  }
 }
 if(s.bow&&profile?.kind==='bow'){
  // Same anatomical bow/string placement as normal attacks, with visible draw and release.
  const draw=s.bowDraw??Math.sin(Math.PI*Math.min(1,(1-pose.remaining/d.duration)/.62));
  const frame=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0,-.98,-.199),new T.Vector3(0,-.199,.98),new T.Vector3(-1,0,0)));
  wristQ=root.getWorldQuaternion(new T.Quaternion()).multiply(frame);
  s.right=[-.25,1.5+(s.bowLift||0),.52];arm('R',s.right,[-.74,1.35,.12],wristQ);
  const string=grip.getObjectByName('BowString');if(string){string.geometry.attributes.position.setX(1,profile.stringX-.18*draw);string.geometry.attributes.position.needsUpdate=true;}
  const anchor=grip.localToWorld(new T.Vector3(profile.stringX-.18*draw,0,0));root.worldToLocal(anchor);arm('L',anchor.toArray(),[.65,1.4,.16]);
 }else{
  // The intrinsic pirate has a left saber and a right pistol, not a generic sword grip.
  if(s.pistol&&root.getObjectByName('PirateFlintlock')){
   const frame=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0,-1,0),new T.Vector3(0,0,1),new T.Vector3(-1,0,0)));
   wristQ=root.getWorldQuaternion(new T.Quaternion()).multiply(frame);s.right=[-.32,1.51,.72-.05*Math.sin(Math.PI*(1-pose.remaining/d.duration))];
  }
  arm(primary,s.right,[primary==='L'?.78:-.78,1.35,.12],wristQ);
  if(s.support&&profile?.support>0&&!s.stow){
   const target=grip.localToWorld(profile.supportPoint?new T.Vector3(...profile.supportPoint):new T.Vector3(profile.supportX||0,profile.support,0));root.worldToLocal(target);arm('L',target.toArray(),[.68,1.3,.18]);
  }else if(saber)arm('R',[-.46,1.10,.24],[-.78,1.3,.12]);else arm('L',s.left,[.78,1.34,.16]);
 }
 root.updateMatrixWorld(true);
 if(a.local)window.HERO3D.skillAction={id:d.id,action:s.action,phase:1-pose.remaining/d.duration,weight,stowed:s.stow,footError:s.footError};
 return s;
}
