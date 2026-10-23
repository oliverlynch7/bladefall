import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import crypto from 'node:crypto';import {asset,T} from './lib/rig-assets.mjs';
const {ASCENSION_CLASSES,ASCENSION_THEMES,createAscension,syncAscension}=await import('../public/3d/class-ascension3d.js');
const base='1a58264bc3fc95f4b16cd7bf7246c3cd513b3fe9';const {execFileSync}=await import('node:child_process');let checks=0;
const ok=(s,v)=>{assert(v,s);checks++;};
const beforeSource=execFileSync('git',['show',base+':public/3d/class-looks.js'],{encoding:'utf8'});
const context=new Proxy({},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});global.document={createElement:()=>({getContext:()=>context}),head:{appendChild(){}}};global.window={};vm.runInThisContext(beforeSource);const oldCatalog=window.BFClassLooks.catalog;vm.runInThisContext(fs.readFileSync('public/3d/class-looks.js','utf8'));const catalog=window.BFClassLooks.catalog;
for(const cls of Object.keys(catalog))for(let tier=0;tier<3;tier++){
 const old=oldCatalog[cls][tier],now=catalog[cls][tier];ok(cls+' stable saved cosmetic ID',old.id===now.id&&old.rank===now.rank);
 if(!ASCENSION_CLASSES.has(cls))ok(cls+' untouched palette and description',JSON.stringify(old)===JSON.stringify(now));
 else for(const k of ['metal','cloth','leather','armor','accent','inlay','lift'])ok(cls+' palette retained '+k,old[k]===now[k]);
}
const snapshot=a=>JSON.stringify({instances:[...a.ornaments.instanceMatrix.array],surface:a.veil.material.uniforms.uTime.value,edge:a.tracery.material.uniforms.uTime.value});
const motifs=new Set(),geometryHashes=new Set();
for(const cls of ASCENSION_CLASSES){
 const root=new T.Group(),a=createAscension(root,cls),otherRoot=new T.Group(),b=createAscension(otherRoot,cls),before=snapshot(b);motifs.add(a.theme.motif);geometryHashes.add(crypto.createHash('sha256').update(Buffer.from(a.veil.geometry.attributes.position.array.buffer)).digest('hex'));
 ok(cls+' actor-local attachment',a.group.parent===root&&a.group!==b.group);syncAscension(a,17);ok(cls+' ally state independent',snapshot(b)===before);
 ok(cls+' bounded render cost',a.stats.drawCalls===3&&a.stats.triangles<3000&&a.ornaments.count<=12);
 const material=a.veil.material,geometry=a.veil.geometry,matrixArray=a.ornaments.instanceMatrix.array;
 for(let i=0;i<100;i++){syncAscension(a,i*.07);ok(cls+' finite animation '+i,[...a.ornaments.instanceMatrix.array].every(Number.isFinite));for(let j=0;j<a.ornaments.count;j++){const m=new T.Matrix4();a.ornaments.getMatrixAt(j,m);ok(cls+' ornaments stay near the actor '+i+' '+j,new T.Vector3().setFromMatrixPosition(m).length()<2);}}
 syncAscension(a,3,false);const frozen=snapshot(a);syncAscension(a,500,false);ok(cls+' reduced motion freezes all effect transforms',snapshot(a)===frozen);
 syncAscension(a,3,true,true);ok(cls+' low quality keeps the class feature with fewer draws',!a.tracery.visible&&a.veil.visible&&a.ornaments.visible&&a.ornaments.count>0);
 syncAscension(a,3,true,false);ok(cls+' quality restores all features',a.tracery.visible&&a.ornaments.count===ASCENSION_THEMES[cls].count);
 ok(cls+' no per-frame GPU resource replacement',a.veil.geometry===geometry&&a.veil.material===material&&a.ornaments.instanceMatrix.array===matrixArray);
 const resources=new Set();a.group.traverse(n=>{if(n.material){for(const m of Array.isArray(n.material)?n.material:[n.material]){ok(cls+' proper depth-tested energy',m.transparent&&m.depthTest&&!m.depthWrite);resources.add(m);}if(n.geometry)resources.add(n.geometry);}});let disposed=0;for(const r of resources)r.addEventListener('dispose',()=>disposed++);a.dispose();a.dispose();ok(cls+' resources disposed exactly once',disposed===resources.size&&a.group.parent===null);ok(cls+' peer remains intact',b.group.parent===otherRoot);b.dispose();
}
ok('five different class motifs',motifs.size===5&&geometryHashes.size===5); // regression only, not human uniqueness proof
const {syncClassLook,clearClassLook,classLookStats,registerUncoveredHair}=await import('../public/3d/class-look3d.js');const {clone}=await import('../public/3d/jsm/utils/SkeletonUtils.js');const rogue=await asset('chars/Rogue.gltf'),warrior=await asset('chars/Warrior.gltf');registerUncoveredHair(warrior.scene.getObjectByName('Face'));
const node=clone(rogue.scene),hood=node.getObjectByName('Face'),body=node.getObjectByName('Rogue'),original=body.geometry,originalMaterial=body.material;
const head=node.getObjectByName('Head'),eye=new T.Group(),mouth=new T.Mesh(new T.BoxGeometry(.1,.01,.01));eye.userData._eye=true;mouth.userData._mouth=true;eye.position.set(.1,.2,.3);mouth.position.set(0,.1,.2);head.add(eye,mouth);const ep=eye.position.clone(),mp=mouth.position.clone();
for(const tier of [0,1,2,0,2,1,0]){syncClassLook(node,'ninja',tier,null,2);ok('hood earned only at rank5, tier '+tier,hood.visible===(tier>0));if(tier===0){ok('anatomical head receives clean skin',body.geometry!==original&&Array.isArray(body.material));ok('uncovered head uses only two material draws',body.geometry.groups.length===2&&body.geometry.index.count===original.index.count);const p=eye.position.clone(),m=mouth.position.clone();syncClassLook(node,'ninja',tier,null,3);ok('face adjustments do not accumulate',p.equals(eye.position)&&m.equals(mouth.position));}ok('no ascension before rank10',tier===2?classLookStats(node).aura?.ascension==='Crimson Phantom':!classLookStats(node).aura);clearClassLook(node);ok('source head restored between looks',hood.visible&&body.geometry===original&&body.material===originalMaterial&&eye.position.equals(ep)&&mouth.position.equals(mp));}
syncClassLook(node,'ninja',0,null,2);const activeGeometry=body.geometry,activeMaterial=body.material,peer=clone(node),peerBody=peer.getObjectByName('Rogue');let sharedDisposed=0;activeGeometry.addEventListener('dispose',()=>sharedDisposed++);
clearClassLook(peer);ok('fresh ally clone restores original head before repainting',peerBody.geometry===original&&peerBody.material===originalMaterial);ok('ally cleanup leaves local Ninja intact',body.geometry===activeGeometry&&body.material===activeMaterial&&sharedDisposed===0);
syncClassLook(peer,'reaper',1,null,2);ok('ally can use a different Rogue class without inherited skin',peerBody.geometry===original&&!Array.isArray(peerBody.material));clearClassLook(peer);ok('ally cleanup never disposes the local head',sharedDisposed===0);clearClassLook(node);ok('only local cleanup disposes its own head',sharedDisposed===1);
const baseline=JSON.parse(fs.readFileSync('docs/art-validation/ascension-pilot-20261022/rigs-before.json','utf8')),after=JSON.parse(fs.readFileSync('docs/art-validation/ascension-pilot-20261022/rigs-after.json','utf8'));
for(const r of after.rows){const b=baseline.rows.find(x=>x.cls===r.cls&&x.tier===r.tier);if(!ASCENSION_CLASSES.has(r.cls))ok(r.cls+' renderer counts and motifs unchanged',JSON.stringify(r)===JSON.stringify(b));}
console.log(JSON.stringify({passed:true,checks,pilotClasses:5,otherClassesPreserved:12,rankGatesPreserved:true,actorResourcesIndependent:true}));
