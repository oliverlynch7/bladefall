/* Original browser-native crystalline training hall. Shared geometry, no downloaded kit. */
import * as T from './three.module.js';
let active=null;
export function buildRiftHallArt(scene,w){
 const root=new T.Group();root.name='Rift Hall';const owned=[],batches=new Map(),frames=[];
 const box=new T.BoxGeometry(1,1,1),crystal=new T.OctahedronGeometry(1,0),stone=new T.MeshLambertMaterial({color:0xffffff});owned.push(box,crystal,stone);
 const block=(x,y,z,sx,sy,sz,c,ry=0,rz=0)=>{if(!batches.has(c))batches.set(c,[]);batches.get(c).push({x,y,z,sx,sy,sz,ry,rz});};
 for(let iz=0;iz<32;iz++)for(let ix=0;ix<20;ix++){const x=-494+ix*52,z=-814+iz*52;block(x,-4,z,51,8,51,(ix===8||ix===11)?'#82728f':ix>8&&ix<11?'#625974':(ix+iz)%2?'#3e3c51':'#434156');}
 for(const x of [-520,520]){block(x,90,0,24,180,1680,'#454255');block(x,183,0,32,6,1680,'#a89bb4');}
 for(const z of [-840,840]){block(0,90,z,1040,180,24,'#454255');block(0,183,z,1040,6,32,'#a89bb4');}
 for(const x of [-490,490])for(const z of [-720,-540,-270,0,270,540,740]){block(x,125,z,32,250,34,'#625971');block(x,8,z,52,16,54,'#9c8cac');block(x,240,z,45,12,47,'#a89bb4');}
 // Open ceiling keeps the third-person camera readable. High ribs imply a roof beyond view.
 for(const z of [-540,0,540])for(let j=0;j<16;j++){const a=(j+.5)/16*Math.PI;block(Math.cos(a)*490,210+Math.sin(a)*145,z,100,17,24,'#8d8198',0,-Math.atan2(145*Math.cos(a),490*Math.sin(a)));}
 block(0,6,-730,245,12,140,'#75677f');block(0,13,-775,180,2,26,'#bdb0cd');
 // Stone courses and inset alcoves add depth without filling the walking lanes.
 for(const side of [-1,1])for(let row=0;row<6;row++)for(let col=0;col<20;col++)block(side*504,15+row*28,-800+col*82+(row%2?16:0),10,26,79,row%2?'#4c495e':'#504c60');
 for(const side of [-1,1])for(const z of [-405,-135,135,405]){
  block(side*491,90,z,15,172,208,'#292839');block(side*480,14,z,26,26,240,'#796c82');
  block(side*490,182,z,24,8,215,'#b59aac');
  for(const dz of [-113,113])block(side*486,96,z+dz,23,184,10,'#89768f');
  block(side*320,1,z,235,2,230,'#645574');
  for(const dz of [-118,118])block(side*325,2.5,z+dz,245,1,3,'#b69cc9');
 }
 // Keeper's assembly table: a shallow stone bowl, with room to stand in front.
 block(0,18,-711,92,36,60,'#776780');block(0,39,-711,115,7,78,'#b5a0be');block(0,44,-711,94,3,57,'#46314f');
 const dummy=new T.Object3D();let triangles=0,instances=0;
 for(const [c,list]of batches){const mat=stone.clone();mat.color.set(c);owned.push(mat);const m=new T.InstancedMesh(box,mat,list.length);list.forEach((a,i)=>{dummy.position.set(a.x,a.y,a.z);dummy.rotation.set(0,a.ry,a.rz);dummy.scale.set(a.sx,a.sy,a.sz);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);});m.computeBoundingSphere();m.receiveShadow=true;root.add(m);triangles+=list.length*12;instances+=list.length;}
 function textSprite(text,width,height){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;const mat=new T.SpriteMaterial({map,transparent:true,depthWrite:false});const sprite=new T.Sprite(mat);sprite.scale.set(width,height,1);owned.push(map,mat);root.add(sprite);return {canvas,map,sprite};}
 const title=textSprite('',280,70);title.sprite.position.set(0,155,-775);const tc=title.canvas.getContext('2d');tc.textAlign='center';tc.fillStyle='#efe3ff';tc.font='bold 52px Georgia';tc.fillText('RIFT HALL',384,77);tc.font='28px sans-serif';tc.fillStyle='#c8b7df';tc.fillText('Lost pieces. Living knowledge.',384,132);title.map.needsUpdate=true;
 const exit=textSprite('',220,55);exit.sprite.position.set(0,160,805);const ec=exit.canvas.getContext('2d');ec.fillStyle='#e8dcc5';ec.textAlign='center';ec.font='bold 44px Georgia';ec.fillText('WAYSTATION',384,98);exit.map.needsUpdate=true;
 for(const side of [-1,1]){const m=new T.Mesh(box,stone);m.position.set(side*80,70,796);m.scale.set(18,140,25);root.add(m);}const lintel=new T.Mesh(box,stone);lintel.position.set(0,145,796);lintel.scale.set(178,16,26);root.add(lintel);
 for(const f of w.hubArt.frames){const x=f.index%2?370:-370,z=-405+Math.floor(f.index/2)*270,group=new T.Group();group.position.set(x,0,z);group.rotation.y=x<0?Math.PI/2:-Math.PI/2;root.add(group);
  const mat=new T.MeshStandardMaterial({color:0x706080,emissive:0x352448,emissiveIntensity:.2,metalness:.25,roughness:.34,flatShading:true});owned.push(mat);
  const pedestal=new T.Mesh(box,mat);pedestal.position.set(0,5,-17);pedestal.scale.set(195,10,95);group.add(pedestal);
  const ring=new T.InstancedMesh(crystal,mat,14);for(let i=0;i<14;i++){const a=i/14*Math.PI*2;dummy.position.set(Math.sin(a)*82,84+Math.cos(a)*80,-16);dummy.scale.set(13+(i%3)*2,26,13);dummy.rotation.set(0,0,-a);dummy.updateMatrix();ring.setMatrixAt(i,dummy.matrix);triangles+=8;}ring.computeBoundingSphere();group.add(ring);
  const fm=new T.MeshStandardMaterial({color:0xffffff,emissive:0x3e2458,emissiveIntensity:.6,roughness:.35});owned.push(fm);const facets=new T.InstancedMesh(crystal,fm,5);for(let i=0;i<5;i++){dummy.position.set(-50+i*25,23,33);dummy.scale.set(7,12,7);dummy.rotation.set(0,0,0);dummy.updateMatrix();facets.setMatrixAt(i,dummy.matrix);facets.setColorAt(i,new T.Color('#655e70'));triangles+=8;}facets.computeBoundingSphere();group.add(facets);
  const geo=new T.CircleGeometry(1,40);owned.push(geo);
  const pm=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{time:{value:0},strength:{value:0}},vertexShader:'varying vec2 uv2;void main(){uv2=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:`varying vec2 uv2;uniform float time;uniform float strength;void main(){vec2 p=uv2*2.-1.;float r=length(p);float a=atan(p.y,p.x);float waves=.5+.5*sin(r*24.-time*1.3+sin(a*3.+time*.3)*1.6);float rim=pow(r,6.);vec3 c=mix(vec3(.30,.12,.58),vec3(.74,.47,1.),waves*.5+rim*.5);float opacity=(1.-smoothstep(.90,1.,r))*.86*strength;gl_FragColor=vec4(c,opacity);}`});owned.push(pm);const portal=new T.Mesh(geo,pm);portal.position.set(0,86,-12);portal.scale.set(69,69,1);group.add(portal);triangles+=40;
  const label=textSprite('',220,55);label.sprite.removeFromParent();const plaqueGeo=new T.PlaneGeometry(220,55),plaqueMat=new T.MeshBasicMaterial({map:label.map,transparent:true,side:T.DoubleSide});owned.push(plaqueGeo,plaqueMat);label.sprite=new T.Mesh(plaqueGeo,plaqueMat);label.sprite.position.set(x,207,z);label.sprite.rotation.y=group.rotation.y;root.add(label.sprite);
  const iconMap=new T.TextureLoader().load('./icons/class-'+(f.available?f.classId:'mage')+'.png');iconMap.colorSpace=T.SRGBColorSpace;const iconGeo=new T.PlaneGeometry(86,86),iconMat=new T.MeshBasicMaterial({map:iconMap,transparent:true,depthWrite:false,side:T.DoubleSide,opacity:.78});owned.push(iconMap,iconGeo,iconMat);const icon=new T.Mesh(iconGeo,iconMat);icon.position.set(0,90,-24);group.add(icon);
  frames.push({id:f.id,mat,facets,portal,label,sig:''});
 }
 scene.traverse(o=>{if(o.isLight){if(o.userData._w3dOrig==null)o.userData._w3dOrig=o.intensity;o.intensity=o.userData._w3dOrig*.18;}});const oldFog=scene.fog,oldBackground=scene.background;scene.background=new T.Color('#171421');scene.fog=new T.Fog('#282537',1100,2500);const fill=new T.HemisphereLight('#d8c1ff','#62504a',.7),key=new T.DirectionalLight('#e5d7ff',1.25);key.position.set(0,600,400);root.add(fill,key);
 active={root,frames};window.__HUB_ART_ACTIVE=true;window.__HUB_SHADOW_DIRTY=true;
 root.userData.dispose=()=>{scene.fog=oldFog;scene.background=oldBackground;owned.forEach(o=>o.dispose());if(active?.root===root)active=null;window.__HUB_ART_ACTIVE=false;};
 let measuredTriangles=0,drawCalls=0,measuredInstances=0;root.traverse(o=>{if(o.isMesh||o.isSprite){drawCalls++;const count=o.isInstancedMesh?o.count:1;measuredTriangles+=o.isSprite?2:((o.geometry.index?.count||o.geometry.attributes.position.count)/3)*count;if(o.isInstancedMesh)measuredInstances+=count;}});const counts={hub:true,hubArt:true,riftHall:true,frames:8,triangles:measuredTriangles,instances:measuredInstances,drawCalls};return {group:root,counts};
}
export function updateRiftHallArt(w,t){if(!active||!w.hubArt?.riftHall)return;const reduced=window.__BF_META?.().reduceMotion;
 for(const a of active.frames){const f=w.hubArt.frames.find(f=>f.id===a.id);if(!f)continue;const distance=w.p?Math.hypot(a.label.sprite.position.x-w.p.x,a.label.sprite.position.z-w.p.z):0;a.label.sprite.material.opacity=Math.max(0,Math.min(1,(660-distance)/210));a.label.sprite.visible=distance<660;a.portal.material.uniforms.time.value=reduced?0:t;a.portal.material.uniforms.strength.value=f.open?1:0;
  const sig=[f.banked,f.open,f.status].join('|');if(sig===a.sig)continue;a.sig=sig;a.mat.color.set(f.open?'#cbb2ff':'#756584');a.mat.emissiveIntensity=f.open?.7:.12;
  for(let i=0;i<5;i++)a.facets.setColorAt(i,new T.Color(i<f.banked?'#e6bcff':'#655e70'));a.facets.instanceColor.needsUpdate=true;
  const c=a.label.canvas.getContext('2d');c.clearRect(0,0,768,192);c.fillStyle='#211d32e8';c.fillRect(0,0,768,192);c.strokeStyle=f.open?'#bba0f4':'#746381';c.lineWidth=3;c.strokeRect(3,3,762,186);c.textAlign='center';c.fillStyle='#f0e6ff';c.font='bold 34px Georgia';c.fillText(f.name,384,48);c.fillStyle='#cab2e5';c.font='31px sans-serif';c.fillText(f.className+'  ·  '+f.banked+' / 5',384,99);c.font='25px sans-serif';c.fillStyle=f.open?'#dcc2ff':'#b7adbe';c.fillText(f.status,384,153);a.label.map.needsUpdate=true;
 }
}
