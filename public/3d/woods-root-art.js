import * as THREE from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';

// Visible geometry for Black Woods' optional climb. Collision remains in the level's
// authored root perches, so this can be rebuilt in either world renderer.
export function buildWoodsRootArt(steps){
 const roots=new THREE.Group();roots.name='black-woods-split-root-trail';
 const bark=new THREE.MeshLambertMaterial({color:0x765037}),edge=new THREE.MeshLambertMaterial({color:0x493422});
 const moss=new THREE.MeshLambertMaterial({color:0x628d50}),leaf=new THREE.MeshLambertMaterial({color:0x89af67});
 const mats=[bark,edge,moss,leaf];
 const place=(geo,material,x,y,z,sx=1,sy=1,sz=1)=>{const mesh=new THREE.Mesh(geo,material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);roots.add(mesh);return mesh;};
 const spine=[{x:steps[0].x,z:steps[0].z+100,h:4},...steps];
 for(let i=1;i<spine.length;i++){
  const a=spine[i-1],b=spine[i];
  const path=new THREE.CatmullRomCurve3([
   new THREE.Vector3(a.x,a.h-8,a.z),
   new THREE.Vector3(a.x+(b.x-a.x)*.34,a.h+(b.h-a.h)*.34-15,a.z+(b.z-a.z)*.34),
   new THREE.Vector3(a.x+(b.x-a.x)*.67,a.h+(b.h-a.h)*.67-13,a.z+(b.z-a.z)*.67),
   new THREE.Vector3(b.x,b.h-8,b.z)
  ]);
  place(new THREE.TubeGeometry(path,14,12-i*.55,7,false),i%2?bark:edge,0,0,0);
  for(const side of [-1,1]){
   const off=side*19;
   const tendril=new THREE.CatmullRomCurve3([
    new THREE.Vector3(a.x+off,a.h-13,a.z),
    new THREE.Vector3(a.x+(b.x-a.x)*.5+off*1.7,a.h+(b.h-a.h)*.5-19,a.z+(b.z-a.z)*.5),
    new THREE.Vector3(b.x+off,b.h-13,b.z)
   ]);
   place(new THREE.TubeGeometry(tendril,10,3.5,5,false),bark,0,0,0);
  }
 }
 for(const [i,p]of steps.entries()){
  const crown=place(new THREE.CylinderGeometry(1,1,1,9),i%2?bark:edge,p.x,p.h-6,p.z,p.w*.52,12,p.d*.53);
  crown.rotation.y=i*.29;
  for(let k=0;k<6;k++){
   const a=k*Math.PI/3+i*.7,r=(k%2?.24:.31),x=p.x+Math.cos(a)*p.w*r,z=p.z+Math.sin(a)*p.d*r;
   const patch=place(new THREE.CylinderGeometry(1,1,1,6),k%3?moss:leaf,x,p.h+.8,z,15+(k%3)*4,1.5,11+(k%2)*4);
   patch.rotation.y=a;
  }
  for(let k=0;k<3;k++){
   const a=k*Math.PI*2/3+i*.45,x=p.x+Math.cos(a)*p.w*.39,z=p.z+Math.sin(a)*p.d*.36;
   const knot=place(new THREE.IcosahedronGeometry(1,0),k===1?leaf:moss,x,p.h+3,z,5,4,8);
   knot.rotation.y=a;
  }
 }
 // Four material batches keep this authored detail cheap enough for browser co-op.
 roots.updateMatrixWorld(true);
 const batches=new Map(mats.map(m=>[m,[]]));
 for(const mesh of [...roots.children]){
  const transformed=mesh.geometry.clone();transformed.applyMatrix4(mesh.matrix);
  const loose=transformed.index?transformed.toNonIndexed():transformed;
  if(loose!==transformed)transformed.dispose();
  batches.get(mesh.material).push(loose);mesh.geometry.dispose();roots.remove(mesh);
 }
 for(const [material,geometries]of batches){
  if(!geometries.length)continue;
  const merged=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());
  if(!merged)throw Error('Black Woods root art merge failed');
  roots.add(new THREE.Mesh(merged,material));
 }
 roots.userData.dispose=()=>{roots.traverse(o=>o.geometry?.dispose());mats.forEach(m=>m.dispose());};
 return roots;
}
