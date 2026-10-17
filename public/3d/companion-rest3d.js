// Restore the underlying animation before applying a seated quadruped pose.
const poses=new WeakMap();
export function restoreCompanionRest(root){for(const [bone,p,q]of poses.get(root)||[]){bone.position.copy(p);bone.quaternion.copy(q);}poses.delete(root);}
export function poseCompanionRest(root,sitting){
 if(!sitting||!root.getObjectByName('rearL'))return;
 const saved=[],edit=(name,turn,lower=0)=>{const bone=root.getObjectByName(name);if(!bone)return;saved.push([bone,bone.position.clone(),bone.quaternion.clone()]);bone.rotateX(turn);bone.position.y-=lower;};
 edit('body',-.35,.06);edit('legL',.35);edit('legR',.35);edit('rearL',-1.05);edit('rearR',-1.05);edit('head',.22);poses.set(root,saved);
}
