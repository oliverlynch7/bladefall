import * as T from './three.module.js';
const zero=new T.Matrix4().makeScale(0,0,0);
// Record actual transformed mesh bounds, rather than assuming all kit shapes
// have the same origin. Ground/support is protected by BFCameraOcclusion.
export function trackCampaignOccluder(list,mesh,index,matrix){
 if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
 const b=mesh.geometry.boundingBox.clone().applyMatrix4(matrix),h=b.max.y-b.min.y;
 if(h<38)return;
 list.push({mesh,index,matrix:matrix.clone(),hidden:false,o:{x:(b.min.x+b.max.x)/2,z:(b.min.z+b.max.z)/2,w:b.max.x-b.min.x,d:b.max.z-b.min.z,y0:b.min.y,h:b.max.y}});
}
export function updateCampaignOccluders(list,world){
 const mode=window.__BF_META?.().camMode;let hidden=0;
 for(const f of list){const hide=window.BFCameraOcclusion.blocks(world,f.o,f.o.y0,f.o.h,mode,3);hidden+=+hide;
  if(hide!==f.hidden){f.mesh.setMatrixAt(f.index,hide?zero:f.matrix);f.mesh.instanceMatrix.needsUpdate=true;f.hidden=hide;window.__DEEP_SHADOW_DIRTY=true;}
 }return hidden;
}
export function updateCampaignSun(state,p,dx,dy,dz){
 const x=Math.round(p.x/220)*220,y=Math.round((p.y||0)/150)*150,z=Math.round(p.z/220)*220,key=x+','+y+','+z+','+window.__BF_META?.().quality;
 if(state.shadowKey===key)return;state.shadowKey=key;
 state.sun.position.set(x+dx,y+dy,z+dz);state.sun.target.position.set(x,y,z);state.sun.target.updateMatrixWorld();window.__DEEP_SHADOW_DIRTY=true;
}
