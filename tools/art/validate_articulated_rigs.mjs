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
const manifest=JSON.parse(await readFile(root+'enemy-assets/articulated/manifest.json')),report=[];
for(const m of manifest){const src=await art.loadKitModel('enemy-assets/articulated/'+(m.file?m.file.replace('.glb',''):m.type)),old=await art.loadKitModel('enemy-assets/'+m.type);assert(src&&old);let mesh;src.scene.traverse(o=>{if(o.isSkinnedMesh)mesh=o});assert.equal(mesh.skeleton.bones.length,m.bones);assert(Math.abs(src._nativeH-old._nativeH)<.05,m.type+' silhouette height');const joints=mesh.geometry.attributes.skinIndex,weights=mesh.geometry.attributes.skinWeight;for(let i=0;i<weights.count;i++){let sum=0;for(let j=0;j<4;j++){const w=weights.getComponent(i,j);sum+=w;assert(joints.getComponent(i,j)<m.bones);assert(w>=0&&w<=1);}assert(Math.abs(sum-1)<.0001);}
const clips=motion.revisedClips(src.scene,m.type,src.animations),mixer=new T.AnimationMixer(src.scene);for(const clip of clips){mixer.stopAllAction();const action=mixer.clipAction(clip).play();for(const u of [0,.18,.5,.8,.99]){action.time=u*clip.duration;mixer.update(0);src.scene.updateMatrixWorld(true);mesh.skeleton.update();assert([...mesh.skeleton.boneMatrices].every(Number.isFinite));for(let i=0;i<mesh.geometry.attributes.position.count;i+=7){const v=new T.Vector3();mesh.getVertexPosition(i,v);assert(v.toArray().every(Number.isFinite));assert(v.length()<5,m.type+' exploding weights');}}}report.push({type:m.type,bones:m.bones,triangles:m.triangles,bytes:m.bytes});}
await writeFile(new URL('../../docs/art-validation/articulated-rigs.json',import.meta.url),JSON.stringify({report,checks:['normalized weights','joint indices','rest height preserved','six clips at five phases','finite bounded skinned vertices']},null,2));console.log('Validated '+report.length+' articulated rigs');
