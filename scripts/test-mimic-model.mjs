import assert from 'node:assert/strict';
import * as T from '../public/3d/three.module.js';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../public/3d/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c)}});
const {makeMimic}=await import('../public/3d/mimic3d.js');
const model=makeMimic();let count=0;model.scene.traverse(o=>{if(o.isMesh){count++;assert(o.geometry&&o.material);for(const n of o.geometry.attributes.position.array)assert(Number.isFinite(n));}});
assert(model._nativeH>1.5&&model._nativeH<3);assert(model._baseY>=-.08);assert(count<40);
for(const name of ['mimicJaw','mimicArmL','mimicArmR','mimicLegL','mimicLegR'])assert(model.scene.getObjectByName(name));
const mixer=new T.AnimationMixer(model.scene),jaw=model.scene.getObjectByName('mimicJaw');let times=[];
for(const clip of model.animations){mixer.stopAllAction();const a=mixer.clipAction(clip).reset().play();for(let i=0;i<60;i++){mixer.update(.016);const v=jaw.rotation.x;assert(Number.isFinite(v));times.push(v)}a.stop()}
assert(Math.max(...times)-Math.min(...times)>.2);console.log(JSON.stringify({meshes:count,nativeHeight:model._nativeH,ground:model._baseY,clips:model.animations.map(c=>c.name),articulated:true}));
