import * as THREE from './three.module.js';

export const GLOW_COLORS={gold:'#ffd24a',blood:'#e8453d',soul:'#b06bff',perfect:'#ffffff',gauntlet:'#ff5a6a'};
const applied=new WeakMap();
// Cosmetic light is separate from elemental paint: removing it restores the material.
export function syncWeaponGlow(holder,id){
 if(!holder?._weap)return;
 const color=GLOW_COLORS[id]||null;
 const roots=[holder._weap];
 const saber=holder.root?.getObjectByName('PirateSaber');if(saber)roots.push(saber);
 for(const root of roots){
  if(applied.get(root)===color)continue;
  applied.set(root,color);
  const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o);});
  for(const mesh of meshes){
   const original=Array.isArray(mesh.material)?mesh.material:[mesh.material];
   // Shared asset materials must never light up other players or weapons.
   const materials=original.map(m=>{
    if(!m.emissive||(!color&&!m.userData.glowBase))return m;
    if(!m.userData._weaponPaint){m=m.clone();m.userData._weaponPaint=true;}
    if(!m.userData.glowBase)m.userData.glowBase={color:m.emissive.getHex(),intensity:m.emissiveIntensity};
    const base=m.userData.glowBase;
    m.emissive.set(color||base.color);m.emissiveIntensity=color?.52:base.intensity;
    return m;
   });
   mesh.material=Array.isArray(mesh.material)?materials:materials[0];
   let edge=mesh.children.find(o=>o.userData.weaponGlowEdge);
   if(color&&!edge){
    edge=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,35),new THREE.LineBasicMaterial({color,transparent:true,opacity:.65,depthWrite:false,toneMapped:false}));
    edge.name='WeaponCosmeticGlow';edge.userData.weaponGlowEdge=true;edge.userData._weap=true;mesh.add(edge);
   }
   if(edge){edge.visible=!!color;if(color)edge.material.color.set(color);}
  }
 }
}
