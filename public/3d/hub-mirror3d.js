import * as T from './three.module.js';
import {Reflector} from './jsm/objects/Reflector.js';
export function makeHubMirror(width,height){
 const mirror=new Reflector(new T.PlaneGeometry(width,height),{color:0xb9d4da,textureWidth:384,textureHeight:384,clipBias:.003,multisample:0});
 mirror.name='Waystation planar mirror';mirror.userData.updates=0;
 const reflect=mirror.onBeforeRender,position=new T.Vector3(),normal=new T.Vector3(),toward=new T.Vector3();let last=-Infinity,busy=false;
 mirror.onBeforeRender=function(renderer,scene,camera){
  if(busy)return;mirror.getWorldPosition(position);normal.set(0,0,1).transformDirection(mirror.matrixWorld);toward.copy(camera.position).sub(position);
  if(toward.dot(normal)<=0||toward.lengthSq()>900*900)return;
  const now=performance.now();if(now-last<50)return;last=now;
  const restore=window.__BF_MIRROR_CHARACTER?.();busy=true;
  try{reflect.call(this,renderer,scene,camera);mirror.userData.updates++;}finally{busy=false;restore?.();}
 };
 return mirror;
}
