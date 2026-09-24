import * as THREE from './three.module.js';
// Handle sections measured from the actual asset geometry, in source coordinates.
// These replace body-dependent bounding-box pivots. One asset has one grip and one physical size.
export const WEAPON_GRIPS={
  Sword: {anchor:[-0.00287, 0, 0],length:1.2,kind:'melee',support:0},
  Sword_2: {anchor:[-0.00958, 0, 0],length:1.2,kind:'melee',support:0},
  Sword_Golden: {anchor:[-0.00134, 0, 0],length:1.2,kind:'melee',support:0},
  Claymore: {anchor:[0,.45,0],length:1.6,kind:'heavy',supportX:0.000000,support:.18},
  Axe_Small: {anchor:[0.00152, -0.55, 0],length:0.9,kind:'melee',support:0},
  Axe: {anchor:[0.0014, -0.75, 0],length:1.3,kind:'melee',support:0},
  Axe_Double: {anchor:[0.61025, -1.25, 0],length:1.5,kind:'heavy',supportX:-0.010377,support:0.32},
  Axe_Double_Golden: {anchor:[0.00418, -0.2, 0],length:1.5,kind:'heavy',supportX:0.001666,support:0.32},
  Hammer_Small: {anchor:[-0.00516, -0.3, 0],length:1.1,kind:'melee',support:0},
  Hammer_Double: {anchor:[0.01758, -0.65, 0],length:1.45,kind:'heavy',supportX:-0.001386,support:0.32},
  Hammer_Double_Golden: {anchor:[0.00997, -0.28, 0],length:1.45,kind:'heavy',supportX:0.002588,support:0.32},
  Dagger: {anchor:[-0.004, -0.1, 0],length:0.64,kind:'dagger',support:0},
  Dagger_2: {anchor:[0.00729, 0.05, 0],length:0.66,kind:'dagger',support:0},
  Dagger_Golden: {anchor:[-0.00243, -0.05, 0],length:0.64,kind:'dagger',support:0},
  Bow_Wooden: {anchor:[-0.02744, 0, 0],length:1.25,kind:'bow',stringX:-0.239873,stringHalf:0.586005,support:0},
  Bow_Wooden2: {anchor:[-0.00056, 0, 0],length:1.25,kind:'bow',stringX:-0.239875,stringHalf:0.586005,support:0},
  Bow_Evil: {anchor:[-0.00262, 0, 0],length:1.3,kind:'bow',stringX:-0.238394,stringHalf:0.582393,support:0},
  Bow_Golden: {anchor:[-0.00436, 0, 0],length:1.25,kind:'bow',stringX:-0.239875,stringHalf:0.586005,support:0},
  Spear: {anchor:[-0.00166, 1.1, 0],length:2.1,kind:'pole',supportX:-0.006963,support:0.32},
  Scythe: {anchor:[0.02988, 0, -1e-05],length:2.05,kind:'pole',supportX:-0.015939,support:0.32},
  Staff_Wizard:{anchor:[0,0,0],length:1.95,axis:'z',kind:'staff',support:0},
  Staff_Cleric:{anchor:[0,0,0],length:1.05,axis:'z',kind:'staff',support:0},
  Sword_Knight:{anchor:[0,0,0],length:1.3,kind:'melee',support:0},
};
// Palm centers relative to WeaponR; left centers are relative to Fist1L.
export const PALMS={
  Warrior:{right:[-.09,.022,-.048],left:[.069,.004,-.048]},
  Ranger:{right:[-.07,.035,-.045],left:[.049,.017,-.045]},
  Wizard:{right:[-.07,.035,-.049],left:[.049,.017,-.049]},
  Cleric:{right:[-.07,.035,-.061],left:[.049,.017,-.061]},
  Rogue:{right:[-.07,.04,-.06],left:[.049,.022,-.06]},
};
export function attachGrip(actor,rig,body,name,content){
  const profile=WEAPON_GRIPS[name],palm=PALMS[body]||PALMS.Warrior;
  const box=new THREE.Box3().setFromObject(content),size=box.getSize(new THREE.Vector3());
  const scale=profile.length/(profile.axis==='z'?size.z:size.y);
  // Shift the handle center to zero BEFORE rotating/scaling its geometry.
  const geometry=new THREE.Group();geometry.add(content);content.position.fromArray(profile.anchor).multiplyScalar(-1);
  if(profile.axis==='z')geometry.rotation.x=-Math.PI/2;
  if(profile.kind==='bow')geometry.rotation.y=Math.PI;
  geometry.scale.setScalar(scale);
  const grip=new THREE.Group();grip.name='WeaponPalmGrip';grip.userData._weap=true;
  grip.userData.gripProfile={name,...profile};grip.position.fromArray(palm.right);grip.rotation.z=Math.PI/2;
  grip.add(geometry);
  if(profile.kind==='bow'){
    content.traverse(o=>{if(o.name==='White')o.visible=false;});
    const string=new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(profile.stringX,-profile.stringHalf,0),new THREE.Vector3(profile.stringX,0,0),new THREE.Vector3(profile.stringX,profile.stringHalf,0)
    ]),new THREE.LineBasicMaterial({color:'#e8dcc1'}));
    string.name='BowString';string.userData._weap=true;string.userData.signaturePart=true;grip.add(string);
  }
  rig.bone.add(grip);if(rig.stock)rig.stock.visible=false;
  actor._weap=grip;actor._weapGrip=null;actor.fit={name,anatomical:true};
  return {name,anatomical:true,length:profile.length,body};
}

// Bone rotations are sampled from animation afresh, then this layer is applied once.
export function restoreGripPose(A){
  if(A.gripPoseApplied)for(const [bone,q] of A.gripPoseBase||[])bone.quaternion.copy(q);
  A.gripPoseApplied=false;
}
export function captureGripPose(root,A){
  if(A.gripPoseRoot!==root){
    A.gripPoseRoot=root;A.gripPoseBase=[];
    for(const part of ['Shoulder','UpperArm','LowerArm','Fist','Fist1','Fist2'])for(const side of ['L','R']){
      const bone=root.getObjectByName(part+side);if(bone)A.gripPoseBase.push([bone,bone.quaternion.clone()]);
    }
  }
  for(const [bone,q] of A.gripPoseBase)q.copy(bone.quaternion);
  A.gripPoseApplied=true;
}
function armTo(root,side,target,hint,wristQ,weight){
  const upper=root.getObjectByName('UpperArm'+side),lower=root.getObjectByName('LowerArm'+side),wrist=root.getObjectByName('Fist'+side);
  if(!upper||!lower||!wrist)return;
  root.updateMatrixWorld(true);
  const pos=b=>b.getWorldPosition(new THREE.Vector3()),s=pos(upper),e=pos(lower),w=pos(wrist);
  const l1=s.distanceTo(e),l2=e.distanceTo(w),delta=target.clone().sub(s),dist=THREE.MathUtils.clamp(delta.length(),Math.abs(l1-l2)+.001,(l1+l2)*.995),dir=delta.normalize();
  const along=(l1*l1+dist*dist-l2*l2)/(2*dist),bend=hint.clone().sub(s);bend.addScaledVector(dir,-bend.dot(dir)).normalize();
  const elbow=s.clone().addScaledVector(dir,along).addScaledVector(bend,Math.sqrt(Math.max(0,l1*l1-along*along)));
  for(const [bone,to] of [[upper,elbow],[lower,target]]){
    const q=bone.getWorldQuaternion(new THREE.Quaternion()),axis=new THREE.Vector3(0,1,0).applyQuaternion(q);
    const desired=new THREE.Quaternion().setFromUnitVectors(axis,to.clone().sub(pos(bone)).normalize()).multiply(q);
    desired.premultiply(bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert());bone.quaternion.slerp(desired,weight);bone.updateMatrixWorld(true);
  }
  if(wristQ){const q=wristQ.clone().premultiply(wrist.parent.getWorldQuaternion(new THREE.Quaternion()).invert());wrist.quaternion.slerp(q,weight);}
  root.updateMatrixWorld(true);
}
export function poseWeaponGrip(p,root,A,body,dt){
  const grip=root.getObjectByName('WeaponPalmGrip'),profile=grip?.userData.gripProfile;
  if(!profile){A.gripReady=0;return;}
  const thrown=!!(p.throwHideT>0&&p.throwHideArche===p.weapon?.arche);
  grip.visible=!thrown;
  const free=thrown||p.dead||p.onGround===false||p.dodgeTimer>0||p.combatPose?.remaining>0;
  const attacking=p.atkTimer>0;
  const bow=profile.kind==='bow',heavy=profile.support>0;
  const javelin=p.weapon?.art==='javelin';
  const cross=profile.kind==='crossbow';
  const ready=!free&&(!attacking||bow||javelin||cross);
  if(bow){
    const draw=!free?((p.chargeAmt||0)>.04?.05+.14*Math.min(1,p.chargeAmt):attacking?.16*Math.pow(Math.min(1,p.atkTimer/.18),2):0):0;
    A.bowDraw=THREE.MathUtils.damp(A.bowDraw||0,draw,45,dt);
    const string=grip.getObjectByName('BowString');
    if(string){string.geometry.attributes.position.setX(1,profile.stringX-A.bowDraw);string.geometry.attributes.position.needsUpdate=true;string.geometry.computeBoundingSphere();}
  }
  A.gripReady=THREE.MathUtils.damp(A.gripReady||0,ready?1:0,ready?24:40,dt);
  const weight=A.gripReady;
  // The source idle leaves the left fingers open. A support pose must actually close around the shaft.
  if(!thrown&&!p.dead)root.getObjectByName('Fist2R')?.quaternion.set(-.740597,-.032689,.058509,.668599).normalize();
  const fingers=root.getObjectByName('Fist1R');
  if(cross){
    const phase=THREE.MathUtils.clamp(1-(p.atkTimer||0)/.20,0,1),release=attacking?Math.sin(Math.PI*phase):0;
    const string=grip.getObjectByName('CrossbowString');if(string){string.geometry.attributes.position.setX(1,-.03+release*.38);string.geometry.attributes.position.needsUpdate=true;string.geometry.computeBoundingSphere();}
    const bolt=grip.getObjectByName('CrossbowBolt');if(bolt)bolt.visible=!attacking;
    if(weight>.002){
      const wrist=root.getObjectByName('FistR');
      if(fingers)fingers.quaternion.identity();root.updateMatrixWorld(true);
      const tilt=.10+release*.07,f=Math.sqrt(1-tilt*tilt);
      const frame=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0,tilt,f),new THREE.Vector3(0,f,-tilt),new THREE.Vector3(-1,0,0)));
      const desired=root.getWorldQuaternion(new THREE.Quaternion()).multiply(frame),wq=wrist.getWorldQuaternion(new THREE.Quaternion()),gq=grip.getWorldQuaternion(new THREE.Quaternion());
      const rotation=desired.clone().multiply(gq.clone().invert()),wristQ=rotation.clone().multiply(wq);
      const offset=grip.getWorldPosition(new THREE.Vector3()).sub(wrist.getWorldPosition(new THREE.Vector3())).applyQuaternion(rotation);
      const target=root.localToWorld(new THREE.Vector3(-.18,1.28,.36-release*.035)).sub(offset);
      armTo(root,'R',target,root.localToWorld(new THREE.Vector3(-.7,1.15,.1)),wristQ,weight);
    }
  }
  if(!cross&&weight>.002){
    const stab=javelin&&attacking?Math.sin(Math.PI*THREE.MathUtils.clamp(1-p.atkTimer/.22,0,1)):0;
    const tilt=javelin&&attacking?.12:bow?.98:profile.kind==='pole'?.96:profile.kind==='dagger'?.65:heavy?.92:.84;
    A.gripTilt=THREE.MathUtils.damp(A.gripTilt??tilt,tilt,35,dt);
    const heldTilt=A.gripTilt;
    const forward=Math.sqrt(1-heldTilt*heldTilt),x=new THREE.Vector3(0,-heldTilt,-forward),y=new THREE.Vector3(0,-forward,heldTilt),z=new THREE.Vector3(-1,0,0);
    const frame=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));
    const q=root.getWorldQuaternion(new THREE.Quaternion()).multiply(frame);
    const target=root.localToWorld(new THREE.Vector3(bow?-.25:heavy?-.10:-.40,bow?1.45:heavy?1.15:1.08,bow?.50:heavy?.22+stab*.22:.28));
    armTo(root,'R',target,root.localToWorld(new THREE.Vector3(-.72,1.30,.12)),q,weight);
    if(fingers)fingers.quaternion.slerp(new THREE.Quaternion(),weight);
    root.updateMatrixWorld(true);
  }
  // Heavy weapons keep the support hand on the shaft through the authored swing.
  // Bow's other hand pulls the string toward the chest; it never holds a limb as a sword.
  if(!free&&(heavy||bow)){
    const palm=PALMS[body]||PALMS.Warrior;
    const left=root.getObjectByName('Fist1L'),wrist=root.getObjectByName('FistL'),shoulder=root.getObjectByName('UpperArmL'),elbow=root.getObjectByName('LowerArmL');
    if(left&&wrist&&shoulder&&elbow){
      left.quaternion.identity();
      root.getObjectByName('Fist2L')?.quaternion.set(-.740597,.032689,-.058509,.668599).normalize();
      const solveTarget=()=>{
        root.updateMatrixWorld(true);
        const anchor=grip.localToWorld(profile.supportPoint?new THREE.Vector3().fromArray(profile.supportPoint):new THREE.Vector3(bow?profile.stringX-A.bowDraw:(profile.supportX||0),bow?0:profile.support,0));
        const orientation=grip.getWorldQuaternion(new THREE.Quaternion()).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI/2));
        const offset=new THREE.Vector3().fromArray(palm.left).add(left.position).multiply(wrist.getWorldScale(new THREE.Vector3())).applyQuaternion(orientation);
        return {target:anchor.sub(offset),orientation};
      };
      let desired=solveTarget();
      // Keep the support grip reachable instead of stretching the arm or leaving it floating.
      // Move the weapon arm as a whole, preserving the blade's animation direction.
      for(let i=0;i<3;i++){
        const s=shoulder.getWorldPosition(new THREE.Vector3()),e=elbow.getWorldPosition(new THREE.Vector3()),w=wrist.getWorldPosition(new THREE.Vector3());
        const reach=(s.distanceTo(e)+e.distanceTo(w))*.98,delta=desired.target.clone().sub(s);
        if(delta.length()<=reach)break;
        const correction=s.add(delta.setLength(reach)).sub(desired.target),rw=root.getObjectByName('FistR');
        if(!rw)break;
        armTo(root,'R',rw.getWorldPosition(new THREE.Vector3()).add(correction),root.localToWorld(new THREE.Vector3(-.7,1.3,.1)),rw.getWorldQuaternion(new THREE.Quaternion()),1);
        desired=solveTarget();
      }
      armTo(root,'L',desired.target,root.localToWorld(new THREE.Vector3(.65,1.25,.20)),desired.orientation,1);
      root.updateMatrixWorld(true);
    }
  }
}
