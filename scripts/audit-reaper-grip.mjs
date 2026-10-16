// Geometry/animation audit using production assets and the actual grip solver.
// Textures are omitted for Node loading; this does not establish visual acceptance.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const threeUrl=pathToFileURL(path.join(root,'public/3d/three.module.js')).href;
registerHooks({resolve(specifier,context,next){return specifier==='three'?{url:threeUrl,shortCircuit:true}:next(specifier,context);}});
globalThis.ProgressEvent??=class ProgressEvent{constructor(type,values){this.type=type;Object.assign(this,values);}};
const T=await import(threeUrl),{GLTFLoader}=await import('../public/3d/jsm/loaders/GLTFLoader.js');
const {attachGrip,poseWeaponGrip,captureGripPose,restoreGripPose,PALMS}=await import('../public/3d/weapon-grips.js');
async function asset(name){
 const bytes=fs.readFileSync(path.join(root,'public/slice3d/assets',name));let data;
 if(name.endsWith('.glb')){const length=bytes.readUInt32LE(12);data=JSON.parse(bytes.toString('utf8',20,20+length));const offset=20+length;data.buffers[0].uri='data:application/octet-stream;base64,'+bytes.subarray(offset+8,offset+8+bytes.readUInt32LE(offset)).toString('base64');}
 else data=JSON.parse(bytes);
 data.images=[];data.textures=[];data.samplers=[];data.materials=[{name:'Geometry audit'}];
 for(const mesh of data.meshes)for(const p of mesh.primitives)p.material=0;
 return new GLTFLoader().parseAsync(JSON.stringify(data),'');
}
const rogue=await asset('chars/Rogue.gltf'),warrior=await asset('chars/Warrior.gltf'),monk=await asset('chars/Monk.gltf'),weapon=await asset('weapons/Scythe.glb');
const wrap=new T.Group();wrap.add(rogue.scene);const socket=wrap.getObjectByName('WeaponR');assert(socket,'Actual Rogue weapon socket');
const stock=socket.children.find(n=>n.isMesh),content=new T.Group();weapon.scene.updateMatrixWorld(true);
weapon.scene.traverse(n=>{if(n.isMesh){const mesh=new T.Mesh(n.geometry,n.material);mesh.applyMatrix4(n.matrixWorld);content.add(mesh);}});
attachGrip({root:wrap},{bone:socket,stock},'Rogue','Scythe',content);
const mixer=new T.AnimationMixer(rogue.scene),A={},p={onGround:true,weapon:{art:'scythe',arche:'scythe'},atkTimer:0};
const rows=[];
for(const yaw of [0,Math.PI/2,Math.PI,Math.PI*1.5])for(const scale of [1,52])for(const [motion,attack]of [['Idle',false],['Run',false],['Attack',true],['Run',true],['Idle',false]]){
 const clip=[...warrior.animations,...rogue.animations,...monk.animations].find(c=>c.name===motion);assert(clip,'Animation '+motion);
 restoreGripPose(A);mixer.stopAllAction();mixer.clipAction(clip).play();A.gripReady=0;wrap.rotation.y=yaw;wrap.scale.setScalar(scale);
 for(let frame=0;frame<120;frame++){
  restoreGripPose(A);mixer.update(1/60);p.atkTimer=attack?.23*(1-(frame%24)/24):0;
  captureGripPose(wrap,A);poseWeaponGrip(p,wrap,A,'Rogue',1/60);wrap.updateMatrixWorld(true);
  const g=wrap.getObjectByName('WeaponPalmGrip'),axis=new T.Vector3(0,1,0).applyQuaternion(g.getWorldQuaternion(new T.Quaternion())).applyQuaternion(wrap.getWorldQuaternion(new T.Quaternion()).invert()),anchor=g.localToWorld(new T.Vector3(g.userData.gripProfile.supportX,.32,0)),hand=wrap.getObjectByName('Fist1L').localToWorld(new T.Vector3().fromArray(PALMS.Rogue.left));
  assert(g.matrixWorld.elements.every(Number.isFinite),'Finite '+motion+' frame '+frame);
  rows.push({motion,attack,frame,yaw,scale,axis:axis.toArray(),supportError:anchor.distanceTo(hand)/scale});
 }
}
const ready=rows.filter(r=>!r.attack&&r.frame>60),result={method:'Actual Rogue/Scythe geometry and production IK; textures omitted, not browser visual QA',frames:rows.length,maximumSupportError:Math.max(...rows.map(r=>r.supportError)),ready:{lateralMin:Math.min(...ready.map(r=>Math.abs(r.axis[0]))),upMin:Math.min(...ready.map(r=>r.axis[1])),forwardMin:Math.min(...ready.map(r=>r.axis[2]))},idle:rows.find(r=>r.motion==='Idle'&&r.frame===119),run:rows.find(r=>r.motion==='Run'&&!r.attack&&r.frame===119)};
assert(result.maximumSupportError<.04,'Support hand within 4 cm of the actual shaft');
if(process.argv.includes('--assert-diagonal')){assert(result.ready.lateralMin>.35,'Scythe shaft canted to the side');assert(result.ready.upMin>.5,'Scythe still points upward');assert(result.ready.forwardMin>.05,'Scythe stays in front');}
const output=process.argv.find(a=>a.startsWith('--out='));if(output){const filename=path.resolve(root,output.slice(6));fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify(result,null,2));
