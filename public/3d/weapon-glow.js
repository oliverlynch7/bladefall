import * as THREE from './three.module.js';

export const GLOW_COLORS={gold:'#ffd24a',blood:'#e8453d',soul:'#b06bff',perfect:'#ffffff',gauntlet:'#ff5a6a'};
const applied=new WeakMap();
// The aura owns only its material. Geometry and all weapon paints stay untouched.
function auraFor(mesh,color){
 const geometry=mesh.geometry;if(!geometry?.attributes?.normal)return null;
 if(!geometry.boundingSphere)geometry.computeBoundingSphere();
 const width=Math.max(.0001,(geometry.boundingSphere?.radius||1)*.075);
 const material=new THREE.ShaderMaterial({
  uniforms:{auraColor:{value:new THREE.Color(color)},auraWidth:{value:width}},
  vertexShader:`uniform float auraWidth;varying vec3 auraNormal;varying vec3 auraView;
   void main(){vec3 p=position+normal*auraWidth;vec4 v=modelViewMatrix*vec4(p,1.0);
   auraNormal=normalize(normalMatrix*normal);auraView=-v.xyz;gl_Position=projectionMatrix*v;}`,
  fragmentShader:`uniform vec3 auraColor;varying vec3 auraNormal;varying vec3 auraView;
   void main(){float rim=pow(1.0-abs(dot(normalize(auraNormal),normalize(auraView))),1.25);
   gl_FragColor=vec4(auraColor,.30*rim);}`,
  side:THREE.BackSide,transparent:true,depthTest:true,depthWrite:false,
  blending:THREE.AdditiveBlending,toneMapped:false
 });
 const aura=new THREE.Mesh(geometry,material);aura.name='WeaponCosmeticAura';
 aura.userData.weaponGlowAura=true;aura.userData._weap=true;
 aura.frustumCulled=false;aura.renderOrder=1;mesh.add(aura);return aura;
}
export function syncWeaponGlow(holder,id){
 if(!holder?._weap)return;
 const color=GLOW_COLORS[id]||null,roots=[holder._weap];
 const saber=holder.root?.getObjectByName('PirateSaber');if(saber)roots.push(saber);
 for(const root of roots){
  if(applied.get(root)===color)continue;applied.set(root,color);
  const meshes=[];root.traverse(o=>{if(o.isMesh&&!o.userData.weaponGlowAura)meshes.push(o);});
  for(const mesh of meshes){
   // Recover old in-memory glow paint if a preview hot-swaps this module.
   for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
    const base=m?.userData?.glowBase;if(base&&m.emissive){m.emissive.set(base.color);m.emissiveIntensity=base.intensity;delete m.userData.glowBase;}
   }
   for(const edge of [...mesh.children].filter(o=>o.userData.weaponGlowEdge)){mesh.remove(edge);edge.geometry?.dispose();edge.material?.dispose();}
   let aura=mesh.children.find(o=>o.userData.weaponGlowAura);
   if(color&&!aura)aura=auraFor(mesh,color);
   if(aura){aura.visible=!!color;if(color)aura.material.uniforms.auraColor.value.set(color);}
  }
 }
}
