import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
import * as T from '../public/3d/three.module.js';
import {NPC_LOOKS,NPC_MODELS,npcLook} from '../public/3d/npc-looks.js';
registerHooks({resolve(s,c,next){return next(s==='three'?new URL('../public/3d/three.module.js',import.meta.url).href:s,c);}});
const {fitNpcCostume}=await import('../public/3d/npc-costume3d.js');
let checks=0;const ok=(v,m)=>{assert(v,m);checks++;};
function rig(model){
 const d=JSON.parse(fs.readFileSync('public/slice3d/assets/chars/'+model+'.gltf')),buffers=d.buffers.map(b=>Buffer.from(b.uri.split(',')[1],'base64'));
 const read=i=>{const a=d.accessors[i],v=d.bufferViews[a.bufferView],n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type],size={5126:4,5123:2,5121:1,5125:4}[a.componentType],fn={5126:'readFloatLE',5123:'readUInt16LE',5121:'readUInt8',5125:'readUInt32LE'}[a.componentType],out=[];for(let j=0;j<a.count;j++)for(let k=0;k<n;k++)out.push(buffers[v.buffer][fn]((v.byteOffset||0)+(a.byteOffset||0)+j*(v.byteStride||n*size)+k*size));return out;};
 const skin=d.skins[0],joints=new Set(skin.joints),nodes=d.nodes.map((n,i)=>{const o=joints.has(i)?new T.Bone():new T.Group();o.name=T.PropertyBinding.sanitizeNodeName(n.name||'node'+i);if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);return o;});
 d.nodes.forEach((n,i)=>(n.children||[]).forEach(k=>nodes[i].add(nodes[k])));const root=new T.Group();d.scenes[d.scene||0].nodes.forEach(i=>root.add(nodes[i]));root.updateMatrixWorld(true);
 const matrices=read(skin.inverseBindMatrices),skeleton=new T.Skeleton(skin.joints.map(i=>nodes[i]),skin.joints.map((_,i)=>new T.Matrix4().fromArray(matrices,i*16))),mesh=new T.SkinnedMesh(new T.BoxGeometry(.01,.01,.01),new T.MeshStandardMaterial());mesh.bind(skeleton,new T.Matrix4());root.add(mesh);
 const clips=d.animations.map(a=>new T.AnimationClip(a.name.split('|').pop(),-1,a.channels.filter(c=>['rotation','translation','scale'].includes(c.target.path)).map(c=>{const s=a.samplers[c.sampler],name=nodes[c.target.node].name+'.'+({rotation:'quaternion',translation:'position',scale:'scale'}[c.target.path]),Ctor=c.target.path==='rotation'?T.QuaternionKeyframeTrack:T.VectorKeyframeTrack;return new Ctor(name,read(s.input),read(s.output));})));
 return {root,clips,mesh,nodes};
}
const signatures=new Set(),report=[];
for(const [id,p]of Object.entries(NPC_LOOKS)){
 ok(NPC_MODELS[p.model]&&p.name&&p.role,id+' complete identity');for(const field of ['cloth','metal','leather','accent','eye'])ok(/^#[0-9a-f]{6}$/i.test(p[field]),id+' valid '+field);
 if(p.role!=='Escort'){const sig=[p.model,p.cloth,p.metal,p.detail].join('|');ok(!signatures.has(sig),id+' distinct named appearance');signatures.add(sig);}
 const r=rig(p.model),before=JSON.stringify(r.nodes.map(b=>[b.position.toArray(),b.quaternion.toArray(),b.scale.toArray()])),sourceMat=r.mesh.material,detail=fitNpcCostume(r.root,p);ok(detail.stats.meshes>0&&detail.stats.meshes<=22,id+' bounded batches');ok(detail.stats.triangles>0&&detail.stats.triangles<10000,id+' bounded geometry');
 const fitted=[];r.root.traverse(o=>{if(o.isMesh&&o.userData.npcFitting)fitted.push(o);});ok(fitted.length===detail.stats.meshes,id+' reported meshes');
 const geos=new Set(fitted.map(m=>m.geometry)),disposed=new Map([...geos].map(g=>[g,0]));for(const geo of geos)geo.addEventListener('dispose',()=>disposed.set(geo,disposed.get(geo)+1));
 ok(before===JSON.stringify(r.nodes.map(b=>[b.position.toArray(),b.quaternion.toArray(),b.scale.toArray()])),id+' fitting leaves rest pose intact');
 const mixer=new T.AnimationMixer(r.root);for(const kind of ['Idle','Walk']){const clip=r.clips.find(c=>c.name===kind||c.name.startsWith(kind));if(!clip)continue;const action=mixer.clipAction(clip).play();for(const t of [0,.13,.4,.7,1.1]){mixer.setTime(t);r.root.updateMatrixWorld(true);for(const m of fitted){ok(m.matrixWorld.elements.every(Number.isFinite),id+' finite '+kind+' pose');const centre=new T.Vector3().setFromMatrixPosition(m.matrixWorld);ok(centre.length()<15,id+' fitted '+kind+' bounds');}}action.stop();}
 detail.dispose();detail.dispose();ok([...disposed.values()].every(n=>n===1),id+' disposal exactly once');ok(r.mesh.material===sourceMat&&!fitted.some(m=>m.parent?.parent),id+' removes fittings without replacing source body');mixer.stopAllAction();mixer.uncacheRoot(r.root);r.mesh.geometry.dispose();r.mesh.material.dispose();skeletonCleanup(r.root);
 report.push({id,model:p.model,detail:p.detail,...detail.stats});
}
function skeletonCleanup(root){root.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});}
for(const [alias,id]of Object.entries({smith:'anvil',stylist:'keeper',warden_shade:'shade',beth_brother:'bethBrother'}))ok(npcLook(alias)===NPC_LOOKS[id],alias+' stable alias');
const cast=JSON.parse(fs.readFileSync('public/3d/npc-voice-preview/auditions.json'));for(const c of cast.characters)ok(['sunspire_orb','abyss_king'].includes(c.id)||!!npcLook(c.id),c.id+' approved cast covered');
ok(!npcLook('not-a-character'),'unknown roster remains explicit');
const html=fs.readFileSync('public/3d/index.html','utf8');ok(html.includes('src="./hero3d.js?v=2344"'),'HTML module entry explicitly refreshes renderer; import maps do not remap script src');
console.log(JSON.stringify({passed:true,checks,profiles:report.length,maxBatches:Math.max(...report.map(r=>r.meshes)),maxTriangles:Math.max(...report.map(r=>r.triangles)),report}));
