import assert from 'node:assert/strict';
import * as T from '../public/3d/three.module.js';
import {warmSceneGeometry} from '../public/3d/render-warmup3d.js';
for(const fail of [0,1,2]){
 const scene=new T.Scene(),hidden=new T.Group(),mesh=new T.Mesh(new T.BoxGeometry(),new T.MeshBasicMaterial()),light=new T.PointLight();hidden.visible=false;mesh.visible=false;mesh.frustumCulled=true;light.visible=false;hidden.add(mesh);scene.add(hidden,light);
 const viewport=new T.Vector4(2,3,800,600),original=viewport.clone();let renders=0;
 const renderer={shadowMap:{needsUpdate:false},getViewport:v=>v.copy(viewport),setViewport:(a,b,c,d)=>a?.isVector4?viewport.copy(a):viewport.set(a,b,c,d),compile(){assert(hidden.visible&&mesh.visible&&!mesh.frustumCulled);assert(!light.visible,'never turn a hidden light on');},render(){renders++;assert.equal(viewport.z,2);assert(this.shadowMap.needsUpdate);if(renders===fail)throw Error('expected render failure');}};
 if(fail)assert.throws(()=>warmSceneGeometry(renderer,scene,{}),/expected render failure/);else warmSceneGeometry(renderer,scene,{});
 assert.equal(renders,fail||2);assert(!mesh.material.transparent);assert(!hidden.visible&&!mesh.visible&&!light.visible);assert(mesh.frustumCulled);assert(viewport.equals(original));assert(!renderer.shadowMap.needsUpdate);mesh.geometry.dispose();mesh.material.dispose();
}
console.log('Off-camera preparation restores visibility, culling, viewport and shadow state after success or failure.');
