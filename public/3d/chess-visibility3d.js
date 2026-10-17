import * as T from './three.module.js';
const origin=new T.Vector3(),direction=new T.Vector3(),target=new T.Vector3(),hit=new T.Vector3(),head=new T.Vector3(),hip=new T.Vector3(),middle=new T.Vector3(),ray=new T.Ray(),sphere=new T.Sphere();
// Nine sight lines to the playing surface. Legs below the table never trigger fading.
export function chessBlocksBoard(root,camera,table){
 const h=root.getObjectByName('Head'),l=root.getObjectByName('UpperLegL');if(!h||!l)return false;
 // The shared renderer supplies camera matrices directly. getWorldPosition would
 // recompute matrixWorld from its unused local transform and corrupt the view.
 root.updateMatrixWorld(true);origin.setFromMatrixPosition(camera.matrixWorld);h.getWorldPosition(head);l.getWorldPosition(hip);
 const stature=Math.max(20,Math.min(60,head.y-hip.y)),radius=Math.max(6,Math.min(11,stature*.35));
 for(const [x,z]of [[0,0],[-6,-6],[-6,6],[6,-6],[6,6],[-6,0],[6,0],[0,-6],[0,6]]){
  target.set(table.x+x,23.2,table.z+z);direction.copy(target).sub(origin);const distance=direction.length();ray.set(origin,direction.normalize());
  for(const f of [1,.65,.3]){middle.copy(hip).lerp(head,f);sphere.set(middle,f===1?radius*.8:radius);if(ray.intersectSphere(sphere,hit)&&hit.distanceTo(origin)<distance-.6)return true;}
 }
 return false;
}
