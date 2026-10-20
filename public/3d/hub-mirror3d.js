import * as T from './three.module.js';
import {craftModel} from './campaign-craft-models.js?v=2342';
import {Reflector} from './jsm/objects/Reflector.js';
export function makeHubMirror(width,height,options={}){
 const inspection=!!options.inspection,aspect=Math.max(.6,Math.min(2,window.innerWidth/Math.max(1,window.innerHeight))),size=inspection?1536:768;
 const textureWidth=Math.min(2048,Math.round(size*Math.sqrt(aspect))),textureHeight=Math.min(2048,Math.round(size/Math.sqrt(aspect)));
 const mirror=new Reflector(new T.PlaneGeometry(width,height),{color:0xdde9eb,textureWidth,textureHeight,clipBias:.003,multisample:0});
 mirror.name='Waystation planar mirror';mirror.userData.updates=0;mirror.userData.inspection=inspection;mirror.userData.resolution=[textureWidth,textureHeight];
 const reflect=mirror.onBeforeRender,position=new T.Vector3(),normal=new T.Vector3(),toward=new T.Vector3();let last=-Infinity,busy=false;
 mirror.onBeforeRender=function(renderer,scene,camera){
  if(busy)return;mirror.getWorldPosition(position);normal.set(0,0,1).transformDirection(mirror.matrixWorld);toward.setFromMatrixPosition(camera.matrixWorld).sub(position);
  if(toward.dot(normal)<=0||toward.lengthSq()>900*900)return;
  const now=performance.now();if(!inspection&&now-last<50)return;last=now;
  const max=renderer.capabilities.maxTextureSize,target=mirror.getRenderTarget();if(target.width>max||target.height>max)target.setSize(Math.min(max,target.width),Math.min(max,target.height));
  const restore=window.__BF_MIRROR_CHARACTER?.();busy=true;
  try{reflect.call(this,renderer,scene,camera);mirror.userData.updates++;}finally{busy=false;restore?.();}
 };
 return mirror;
}

// Inspection is an isolated scene: reflect the real posed hero, never a second doll.
const inspectionMirrors=new WeakMap();let latestInspection=null;
window.__inspectionMirrorStats=()=>latestInspection?{visible:latestInspection.group.visible,updates:latestInspection.glass.userData.updates,resolution:[latestInspection.glass.getRenderTarget().width,latestInspection.glass.getRenderTarget().height]}:null;
export function syncInspectionMirror(scene,active,camera){
 let record=inspectionMirrors.get(scene);
 if(!active){if(record){scene.remove(record.group);record.glass.geometry.dispose();record.glass.dispose();inspectionMirrors.delete(scene);latestInspection=null;}return null;}
 if(!record){
  const group=new T.Group();group.name='Inspection mirror';
  for(const part of craftModel('mirror','palace',{w:110,h:100,d:12}))if(part.kind!=='glass'){const mesh=new T.Mesh(part.geo,part.material);mesh.position.set(0,42,-84);group.add(mesh);}
  const glass=makeHubMirror(81.4,83,{inspection:true});glass.position.set(0,42,-81.5);group.add(glass);scene.add(group);record={group,glass};inspectionMirrors.set(scene,record);latestInspection=record;
 }
 // Orbiting behind the mirror must leave the hero readable.
 record.group.visible=camera.matrixWorld.elements[14]>-78;
 return record.group;
}
