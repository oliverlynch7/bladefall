import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {root,T,asset} from './lib/rig-assets.mjs';
// Canvas drawing is intentionally a no-op. This suite cannot judge texture pixels.
const context=new Proxy({},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
globalThis.document={createElement:tag=>tag==='canvas'?{width:0,height:0,getContext:()=>context}:{},head:{appendChild(){}}};globalThis.window={};
vm.runInThisContext(fs.readFileSync(path.join(root,'public/3d/class-looks.js'),'utf8'));
const {syncClassLook,clearClassLook,classLookStats}=await import('../public/3d/class-look3d.js');
const {clone}=await import('../public/3d/jsm/utils/SkeletonUtils.js');
const models={warrior:'Warrior',berserker:'Warrior',pirate:'Warrior',reaper:'Rogue',ninja:'Rogue',bladedancer:'Rogue',paladin:'Cleric',monk:'Monk',ranger:'Ranger',beastmaster:'Ranger',skylancer:'Ranger',mage:'Wizard',pyromancer:'Wizard',necromancer:'Wizard',chronomancer:'Wizard',warlock:'Wizard',stormcaller:'Wizard'};
const loaded=new Map();for(const name of new Set(Object.values(models)))loaded.set(name,await asset('chars/'+name+'.gltf'));
const clips=[...loaded.values()].flatMap(g=>g.animations),rows=[];
const anchors=node=>JSON.stringify(node.getObjectsByProperty('type','Group').filter(n=>n.userData.classLookRoot).map(n=>[n.userData.classLookBone,...n.position.toArray(),...n.quaternion.toArray(),...n.scale.toArray()]));
let frames=0,gates=0;
for(const [cls,name]of Object.entries(models))for(const tier of [0,1,2]){
 const node=clone(loaded.get(name).scene),mixer=new T.AnimationMixer(node);syncClassLook(node,cls,tier,null,0);const fitted=anchors(node),stats=classLookStats(node),features=[];
 node.traverse(n=>{if(n.userData.legendaryFeature)features.push(n.userData.legendaryFeature);if(n.userData.classLookRoot)assert(n.parent.isBone,'Bone anchor '+cls);});
 assert(tier?stats.meshes>0:stats.meshes===0,'Default/earned geometry '+cls);assert(stats.triangles<10000&&stats.meshes<50,cls+' budget '+JSON.stringify(stats));
 for(const motion of ['Idle','Run','Walk','Sword_Attack','Attack','Attack2','Staff_Attack','Spell1','Roll','Dagger_Attack']){
  const clip=clips.find(c=>c.name===motion);if(!clip)continue;mixer.stopAllAction();mixer.clipAction(clip).play();
  for(let i=0;i<8;i++){mixer.update(.07);syncClassLook(node,cls,tier,null,i*.07);node.updateMatrixWorld(true);node.traverse(n=>{if(n.isBone||n.userData.classLookPart||n.userData.classLookRoot)assert([...n.position.toArray(),...n.quaternion.toArray(),...n.scale.toArray()].every(Number.isFinite),cls+' finite '+motion);});assert.equal(anchors(node),fitted,'Fitting drift '+cls);frames++;}
 }
 const animated=()=>{const a=[];node.traverse(n=>{if(n.userData.lookAnimated)a.push([...n.position.toArray(),...n.quaternion.toArray(),...n.scale.toArray()]);});return JSON.stringify(a);};
 syncClassLook(node,cls,tier,null,1,false);const paused=animated();syncClassLook(node,cls,tier,null,100,false);assert.equal(animated(),paused,'Reduced motion '+cls);
 const meta={classes:{[cls]:{rank:4}},classLooks:{[cls]:1}};assert.equal(window.BFClassLooks.tier(meta,cls),0);meta.classes[cls].rank=5;assert.equal(window.BFClassLooks.tier(meta,cls),1);meta.classLooks[cls]=2;meta.classes[cls].rank=9;assert.equal(window.BFClassLooks.tier(meta,cls),0);meta.classes[cls].rank=10;assert.equal(window.BFClassLooks.tier(meta,cls),2);gates+=4;
 rows.push({cls,tier,...stats,features});clearClassLook(node);assert.equal(classLookStats(node).meshes,0,'Default restored');mixer.stopAllAction();mixer.uncacheRoot(node);
}
if(process.argv.includes('--assert-upgrade')){
 const before=JSON.parse(fs.readFileSync(path.join(root,'docs/art-validation/legendary-wardrobe-20261016/before.json'),'utf8'));
 for(const cls of Object.keys(models)){const r5=rows.find(r=>r.cls===cls&&r.tier===1),r10=rows.find(r=>r.cls===cls&&r.tier===2),old=before.rows.find(r=>r.cls===cls&&r.tier===2);assert(r5.triangles>=old.triangles,cls+' Rank 5 inherits previous Rank 10 construction');assert(r10.features.length>0&&r10.triangles>r5.triangles,cls+' unique Rank 10 finish');}
}
const result={method:'Actual rig/renderer geometry with mocked Canvas drawing; no browser or texture/visual acceptance claim',combinations:rows.length,frames,gates,maxTriangles:Math.max(...rows.map(r=>r.triangles)),maxMeshes:Math.max(...rows.map(r=>r.meshes)),rows};
const output=process.argv.find(a=>a.startsWith('--out='));if(output){const f=path.resolve(root,output.slice(6));fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify({combinations:result.combinations,frames,gates,maxTriangles:result.maxTriangles,maxMeshes:result.maxMeshes}));
