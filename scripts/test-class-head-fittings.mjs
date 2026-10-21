import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {root,T,asset} from './lib/rig-assets.mjs';
// Real source geometry and skeletons. Canvas pixels/visual acceptance need a browser.
const context=new Proxy({},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
globalThis.document={createElement:()=>({getContext:()=>context}),head:{appendChild(){}}};globalThis.window={};
vm.runInThisContext(fs.readFileSync(path.join(root,'public/3d/class-looks.js'),'utf8'));
const {syncClassLook,clearClassLook}=await import('../public/3d/class-look3d.js');
const {clone}=await import('../public/3d/jsm/utils/SkeletonUtils.js');
let checks=0;const ok=(v,m)=>{checks++;assert(v,m);};
const cleric=await asset('chars/Cleric.gltf'),rogue=await asset('chars/Rogue.gltf');
for(const cls of ['paladin','ninja','reaper','bladedancer']){
 const node=clone((cls==='paladin'?cleric:rogue).scene),originals=[];
 node.traverse(n=>{if(n.isMesh)originals.push({node:n,geo:n.geometry,mat:n.material});});
 const head=node.getObjectByName(cls==='paladin'?'Head_1':'Face'),source=head.geometry.index?head.geometry.toNonIndexed():head.geometry.clone();
 let sharedDisposals=0;for(const {geo}of originals)geo.addEventListener('dispose',()=>sharedDisposals++);
 for(const tier of [0,1,2,0,2,1]){
  syncClassLook(node,cls,tier,null,0,false);
  for(const o of originals.filter(o=>o.node.isSkinnedMesh)){
   if(cls==='paladin'){
    const expanded=o.geo.index?o.geo.toNonIndexed():o.geo;
    for(const name of ['position','normal','uv','skinIndex','skinWeight']){
     const a=expanded.attributes[name],b=o.node.geometry.attributes[name];if(!a)continue;
     ok(a.count===b.count&&a.array.every((v,i)=>v===b.array[i]),'Paladin original '+name+' unchanged');
    }
    if(expanded!==o.geo)expanded.dispose();
    ok(o.node.material[0]===o.mat&&o.node.material[1]===head.material[1],'side/neck and front share opaque skin, body retains palette');
    ok(o.node.geometry.groups.every(g=>o.node.material[g.materialIndex].opacity===1),'no hidden head triangles');
   }else{
    ok(o.node.geometry===o.geo,cls+' keeps source skinned geometry at tier '+tier);
    ok(o.node.material===o.mat,cls+' keeps original skinned materials');
   }
  }
  const fittings=[];node.traverse(n=>{if(n.userData.classLookBone==='Head')n.traverse(c=>{if(c.isMesh)fittings.push(c);});});
  if(cls==='paladin'){
   ok(Array.isArray(head.material)&&head.material.length===2,'source face has isolated skin material');
   ok(head.material[0]===originals.find(o=>o.node===head).mat,'source hair material unchanged');
   ok(head.material[1].metalness===0&&head.material[1].opacity===1,'natural opaque skin, no invisible head mask');
   for(const key of ['position','normal','uv']){
    const a=source.attributes[key],b=head.geometry.attributes[key];if(!a)continue;
    ok(a.count===b.count&&a.array.every((v,i)=>v===b.array[i]),'native face '+key+' exactly preserved');
   }
   node.updateMatrixWorld(true);
   const headTop=new T.Box3().setFromObject(head).max.y;
   for(const m of fittings){m.geometry.computeBoundingBox();const box=m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);ok(box.min.y>headTop-.02,'Paladin head fittings stay above source head');}
   ok((tier===0&&fittings.length===0)||(tier>0&&fittings.length>0),'earned halo preserved, starter bare');
  }else{
   ok(fittings.length===0,cls+' has no rigid plates on source hood/face');
   ok(head.geometry===originals.find(o=>o.node===head).geo,'Rogue hood geometry unchanged');
  }
 }
 clearClassLook(node);
 for(const o of originals){ok(o.node.geometry===o.geo,cls+' original geometry restored');ok(o.node.material===o.mat,cls+' original material restored');}
 ok(sharedDisposals===0,'shared source geometry was never disposed');source.dispose();
}
console.log(checks+' source-head preservation, face material, halo, Rogue hood and repeated restoration checks passed.');
