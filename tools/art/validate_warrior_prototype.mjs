import {readFile,writeFile} from 'node:fs/promises';
import {registerHooks} from 'node:module';
import {pathToFileURL,fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../public/3d/',import.meta.url));
registerHooks({resolve(s,c,next){return next(s==='three'?pathToFileURL(root+'three.module.js').href:s,c)}});
globalThis.window={};globalThis.location={search:''};globalThis.ProgressEvent=class{constructor(type,o){Object.assign(this,{type},o)}};
const NR=globalThis.Request;globalThis.Request=class extends NR{constructor(u,o){super(new URL(u,'http://test/3d/'),o)}};
globalThis.fetch=async r=>new Response(await readFile(root+new URL(r.url||r).pathname.replace('/3d/','')));
const T=await import(pathToFileURL(root+'three.module.js')),art=await import(pathToFileURL(root+'mob3d.js')),motion=await import(pathToFileURL(root+'enemy-motion.js'));

const {GLTFLoader}=await import(pathToFileURL(root+'jsm/loaders/GLTFLoader.js'));const data=await readFile(root+'prototypes/warrior/warrior.glb');const g=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');const meshes=[];g.scene.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o)});assert.equal(g.animations.length,4);for(const mesh of meshes){assert.equal(mesh.skeleton.bones.length,20);const weights=mesh.geometry.attributes.skinWeight;for(let i=0;i<weights.count;i++){let total=0;for(let j=0;j<4;j++)total+=weights.getComponent(i,j);assert(Math.abs(total-1)<.0001);}}const mixer=new T.AnimationMixer(g.scene);for(const clip of g.animations){mixer.stopAllAction();const ac=mixer.clipAction(clip).play();for(const phase of [0,.25,.5,.75,.99]){ac.time=clip.duration*phase;mixer.update(0);g.scene.updateMatrixWorld(true);for(const mesh of meshes){mesh.skeleton.update();assert([...mesh.skeleton.boneMatrices].every(Number.isFinite));for(let i=0;i<mesh.geometry.attributes.position.count;i+=5){const p=mesh.getVertexPosition(i,new T.Vector3());assert(p.toArray().every(Number.isFinite));assert(p.length()<4);}}}}
const result={clips:g.animations.map(c=>c.name),meshPrimitives:meshes.length,bones:20,checks:['normalized weights','five poses per clip','finite bounded deformed vertices']};await writeFile(new URL('../../docs/art-validation/warrior-rig.json',import.meta.url),JSON.stringify(result,null,2));console.log(result);
