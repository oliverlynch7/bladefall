import * as T from './three.module.js';
// Keep the authored shield/spear body action. Constrain only the hand-parented weapon.
export function officerClips(root,role,clips){
 const bones={};root.traverse(o=>{if(o.isBone)bones[o.name]=o;});if(!bones.weapon||!bones.body)return clips;
 const saved=Object.values(bones).map(b=>({b,p:b.position.clone(),q:b.quaternion.clone(),s:b.scale.clone()}));
 const result=clips.map(clip=>{
  const phase=clip.name.split('_')[0];if(!['Windup','Attack','Recover','Idle','Move'].includes(phase))return clip;
  const mixer=new T.AnimationMixer(root),action=mixer.clipAction(clip).play(),times=[],values=[];
  for(let i=0;i<=32;i++){
   const u=i/32;action.time=u*clip.duration;mixer.update(0);root.updateMatrixWorld(true);
   const contact=phase==='Windup'?.3*Math.max(0,(u-.88)/.12):phase==='Attack'?.3+.7*Math.min(1,u/.12):phase==='Recover'?1-u:0;
   const angle=role==='spear'?Math.PI/2-.18+.18*contact:-.22+.65*contact;
   const q=bones.weapon.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(bones.body.getWorldQuaternion(new T.Quaternion())).multiply(new T.Quaternion().setFromEuler(new T.Euler(angle,0,role==='spear'?-.07:0)));
   times.push(u*clip.duration);values.push(...q.normalize().toArray());
  }
  mixer.stopAllAction();mixer.uncacheRoot(root);
  return new T.AnimationClip(clip.name,clip.duration,[...clip.tracks.filter(t=>t.name!=='weapon.quaternion'),new T.QuaternionKeyframeTrack('weapon.quaternion',times,values)]);
 });
 for(const {b,p,q,s}of saved){b.position.copy(p);b.quaternion.copy(q);b.scale.copy(s);}root.updateMatrixWorld(true);return result;
}
