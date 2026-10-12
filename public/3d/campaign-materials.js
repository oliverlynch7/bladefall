import * as THREE from './three.module.js';

// Painted, world-sized detail: a long wall and a tiny ledge use the same texel
// scale. No per-prop textures, transparent decals, or extra world draw calls.
const textures=new Map();
const profiles={
 masonry:{scale:170,roughness:.9,bump:.13},stone:{scale:180,roughness:.94,bump:.1},
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
 const gray=v=>'rgb('+v+','+v+','+v+')';
 const stroke=(points,color,width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 c.fillStyle='#d9d9d9';c.fillRect(0,0,512,512);
 // Broad pigment variations remain calm at a distance and do not shimmer.
 for(let i=0;i<210;i++){c.fillStyle=gray(208+Math.floor(rnd()*24));const x=rnd()*512,y=rnd()*512;c.beginPath();c.ellipse(x,y,8+rnd()*23,3+rnd()*12,rnd()*6.28,0,6.28);c.fill();}
 if(kind==='masonry'||kind==='metal'){
  const metal=kind==='metal',rh=metal?256:64,bw=metal?256:128;
  for(let row=0;row<512/rh;row++)for(let col=-1;col<512/bw+1;col++){
   const x=col*bw+(metal?0:row%2*bw/2),y=row*rh,v=207+Math.floor(rnd()*26);
   c.fillStyle=gray(v);c.fillRect(x+3,y+3,bw-6,rh-6);
   stroke([[x+2,y+rh-2],[x+2,y+2],[x+bw-2,y+2]],'#f0f0f0',2);
   stroke([[x+bw-2,y+3],[x+bw-2,y+rh-2],[x+3,y+rh-2]],'#9a9a9a',2);
   if(metal){for(const dx of [12,bw-12])for(const dy of [12,rh-12]){c.fillStyle='#898989';c.beginPath();c.arc(x+dx,y+dy,4,0,6.28);c.fill();c.fillStyle='#efefef';c.fillRect(x+dx-2,y+dy-3,3,2);}
    stroke([[x+18,y+30],[x+bw-18,y+30]],'#c2c2c2',1);
   }else if(rnd()<.24){const xx=x+bw*.35;stroke([[xx,y+4],[xx+9,y+rh*.3],[xx+3,y+rh*.58]],'#a4a4a4',1.4);}
  }
 }else if(kind==='wood'){
  for(let i=0;i<8;i++){
   const x=i*64;c.fillStyle=gray(202+Math.floor(rnd()*29));c.fillRect(x+2,0,60,512);stroke([[x,0],[x,512]],'#858585',3);stroke([[x+3,0],[x+3,512]],'#ededed',2);
   for(let j=0;j<8;j++){const xx=x+7+j*6;c.strokeStyle=j%3?'#b8b8b8':'#eeeeee';c.lineWidth=1;c.beginPath();c.moveTo(xx,0);c.bezierCurveTo(xx+7,160,xx-7,330,xx,512);c.stroke();}
   const ky=80+rnd()*350;c.strokeStyle='#a7a7a7';c.lineWidth=2;for(let k=0;k<3;k++){c.beginPath();c.ellipse(x+32,ky,3+k*4,9+k*9,0,0,6.28);c.stroke();}
  }
 }else if(kind==='ice'||kind==='marble'||kind==='basalt'||kind==='stone'){
  const icy=kind==='ice',rock=kind==='stone'||kind==='basalt';
  for(let i=0;i<(rock?24:12);i++){
   let x=rnd()*512,y=rnd()*512;const points=[[x,y]];
   for(let j=0;j<5;j++){x+=18+rnd()*35;y+=(rnd()-.5)*(rock?16:80);points.push([x,y]);}
   for(const ox of [-512,0,512])for(const oy of [-512,0,512]){
    const p=points.map(([a,b])=>[a+ox,b+oy]);stroke(p,icy?'#f5f5f5':rock?'#b1b1b1':'#bcbcbc',icy?2:1.3);
    if(icy||rock)stroke(p.map(([a,b])=>[a,b+2]),icy?'#b3b3b3':'#e7e7e7',1);
   }
  }
 }else if(kind==='cloth'){
  for(let i=0;i<512;i+=4){stroke([[i,0],[i,512]],i%8?'#c6c6c6':'#e8e8e8',1);stroke([[0,i],[512,i]],'#d0d0d0',1);}
 }else{
  for(let i=0;i<(kind==='grass'?800:230);i++){
   const x=rnd()*512,y=rnd()*512,v=kind==='snow'?221+Math.floor(rnd()*20):190+Math.floor(rnd()*48);
   c.fillStyle=gray(v);c.strokeStyle=gray(v);c.lineWidth=kind==='grass'?1.8:1;
   if(kind==='grass'){c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+6,y-7,x+3,y-12);c.stroke();}
   else{c.beginPath();c.ellipse(x,y,1+rnd()*4,1+rnd()*2,0,0,6.28);c.fill();}
  }
  if(kind==='sand'||kind==='snow'||kind==='water')for(let j=0;j<12;j++){
   const y=j*43;c.strokeStyle=kind==='snow'?'#ededed':'#eeeeee';c.lineWidth=2;c.beginPath();c.moveTo(0,y);c.bezierCurveTo(160,y+15,350,y-15,512,y);c.stroke();
  }
 }
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
   float bfHeight=dot(bfPigment,vec3(0.333333))*bfSurfaceBump;
   vec3 bfDx=normalize(dFdx(-vViewPosition)),bfDy=normalize(dFdy(-vViewPosition));
   vec3 bfR1=cross(bfDy,normal),bfR2=cross(normal,bfDx);
   float bfDet=dot(bfDx,bfR1)*faceDirection;
   if(abs(bfDet)>0.00001)normal=normalize(abs(bfDet)*normal-sign(bfDet)*(dFdx(bfHeight)*bfR1+dFdy(bfHeight)*bfR2));
  `);
 };
 material.customProgramCacheKey=()=> 'bf-painted-surface-v1';
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
