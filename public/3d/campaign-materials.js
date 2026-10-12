import * as THREE from './three.module.js';
import {paintCampaignSurface} from './campaign-surface-textures.js?v=2187a';

// Painted, world-sized detail: a long wall and a tiny ledge use the same texel
// scale. No per-prop textures, transparent decals, or extra world draw calls.
const textures=new Map();
const profiles={
 flagstone:{scale:240,roughness:.87,bump:.12},masonry:{scale:220,roughness:.9,bump:.13},stone:{scale:180,roughness:.94,bump:.1},
 wood:{scale:150,roughness:.82,bump:.09},metal:{scale:180,roughness:.64,metalness:.28,bump:.08},
 grass:{scale:150,roughness:1,bump:.04},soil:{scale:140,roughness:1,bump:.05},
 sand:{scale:170,roughness:.98,bump:.04},snow:{scale:170,roughness:.93,bump:.025},
 ice:{scale:220,roughness:.36,metalness:.08,bump:.045},marble:{scale:240,roughness:.52,bump:.04},
 cloth:{scale:70,roughness:1,bump:.035},basalt:{scale:160,roughness:.9,bump:.12},
 water:{scale:420,roughness:.3,metalness:.08,bump:.045}
};
function paintedTexture(kind){
 if(textures.has(kind))return textures.get(kind);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const c=canvas.getContext('2d');let seed=[...kind].reduce((n,s)=>n*31+s.charCodeAt(0),107)>>>0;
 const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
 paintCampaignSurface(c,kind,rnd);
 const tex=new THREE.CanvasTexture(canvas);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=4;
 tex.userData.campaignSurface=kind;textures.set(kind,tex);return tex;
}
export function campaignMaterial(kind='stone',options={}){
 const profile=profiles[kind]||profiles.stone;
 const {detailScale=profile.scale,detailStrength=.85,bumpStrength=profile.bump,...parameters}=options;
 const material=new THREE.MeshStandardMaterial({roughness:profile.roughness,metalness:profile.metalness||0,...parameters});
 material.userData.campaignSurface=kind;
 material.onBeforeCompile=shader=>{
  shader.uniforms.bfSurfaceMap={value:paintedTexture(kind)};
  shader.uniforms.bfSurfaceScale={value:detailScale};shader.uniforms.bfSurfaceStrength={value:detailStrength};shader.uniforms.bfSurfaceBump={value:bumpStrength};
  shader.vertexShader='varying vec3 bfSurfacePosition;\nvarying vec3 bfSurfaceNormal;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
   vec4 bfPosition=vec4(transformed,1.0);
   #ifdef USE_INSTANCING
    bfPosition=instanceMatrix*bfPosition;
   #endif
   bfSurfacePosition=(modelMatrix*bfPosition).xyz;
   bfSurfaceNormal=inverseTransformDirection(transformedNormal,viewMatrix);
  `);
  shader.fragmentShader=`varying vec3 bfSurfacePosition;varying vec3 bfSurfaceNormal;
   uniform sampler2D bfSurfaceMap;uniform float bfSurfaceScale;uniform float bfSurfaceStrength;uniform float bfSurfaceBump;
   vec3 bfPaint(vec3 p,vec3 n){vec3 w=pow(abs(n),vec3(6.0));w/=max(dot(w,vec3(1.0)),0.0001);p/=bfSurfaceScale;
    return texture2D(bfSurfaceMap,p.zy).rgb*w.x+texture2D(bfSurfaceMap,p.xz).rgb*w.y+texture2D(bfSurfaceMap,p.xy).rgb*w.z;}
  `+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec3 bfPigment=bfPaint(bfSurfacePosition,normalize(bfSurfaceNormal));
   diffuseColor.rgb*=mix(vec3(1.0),bfPigment*1.18,bfSurfaceStrength);
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   float bfHeight=dot(bfPigment,vec3(0.333333))*bfSurfaceBump*6.0;
   vec3 bfDx=dFdx(-vViewPosition),bfDy=dFdy(-vViewPosition);
   vec3 bfR1=cross(bfDy,normal),bfR2=cross(normal,bfDx);
   float bfDet=dot(bfDx,bfR1)*faceDirection;
   if(abs(bfDet)>0.00001)normal=normalize(abs(bfDet)*normal-sign(bfDet)*(dFdx(bfHeight)*bfR1+dFdy(bfHeight)*bfR2));
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
   roughnessFactor=clamp(roughnessFactor+(0.86-dot(bfPigment,vec3(0.333333)))*0.35,0.12,1.0);
  `);
 };
 material.customProgramCacheKey=()=> 'bf-painted-surface-v2';
 return material;
}

// A bevel costs 44 triangles rather than subdividing every box face. It adds
// readable edges to the coastal timber/stone kit without changing its bounds.
export function beveledBoxGeometry(bevel=.02){
 const inner=.5-bevel,positions=[];
 const face=vertices=>{
  const v=vertices.map(p=>new THREE.Vector3(...p)),n=v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])),mid=v.reduce((s,p)=>s.add(p),new THREE.Vector3()).multiplyScalar(1/v.length);
  if(n.dot(mid)<0)v.reverse();
  for(let i=1;i<v.length-1;i++)for(const p of [v[0],v[i],v[i+1]])positions.push(p.x,p.y,p.z);
 };
 for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
  const u=(axis+1)%3,v=(axis+2)%3;
  face([[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>{const p=[0,0,0];p[axis]=sign*.5;p[u]=a*inner;p[v]=b*inner;return p;}));
 }
 for(let free=0;free<3;free++)for(const a of [-1,1])for(const b of [-1,1]){
  const u=(free+1)%3,v=(free+2)%3;
  face([[-1,0],[1,0],[1,1],[-1,1]].map(([s,k])=>{const p=[0,0,0];p[free]=s*inner;p[u]=a*(k?inner:.5);p[v]=b*(k?.5:inner);return p;}));
 }
 for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])face([[x*.5,y*inner,z*inner],[x*inner,y*.5,z*inner],[x*inner,y*inner,z*.5]]);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.computeVertexNormals();geo.computeBoundingSphere();return geo;
}
