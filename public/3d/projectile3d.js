import * as T from './three.module.js';
// Bounded shared batches: clean silhouettes and directional wakes, never striped spheres.
const CAP=768,root=new T.Group(),pose=new T.Object3D(),tint=new T.Color(),forward=new T.Vector3(0,0,1),direction=new T.Vector3();
root.name='Projectile art';
const cone=new T.ConeGeometry(1,2,6);cone.rotateX(Math.PI/2);
const geometries={gem:new T.OctahedronGeometry(1),seed:new T.IcosahedronGeometry(1,0),tip:cone,bar:new T.BoxGeometry(1,1,1),ring:new T.TorusGeometry(1,.065,4,16)};
const batches={};
for(const [name,geometry] of Object.entries(geometries)){
 const material=new T.MeshBasicMaterial({color:0xffffff,transparent:name==='ring',opacity:name==='ring'?.65:1,depthWrite:name!=='ring',toneMapped:false});
 // Fixed faceted shading stays readable in dark arenas without needing a light per shot.
 material.onBeforeCompile=shader=>{shader.vertexShader='varying vec3 artNormal;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nartNormal=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*normal);');shader.fragmentShader='varying vec3 artNormal;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight*=0.65+0.35*max(0.0,dot(normalize(artNormal),normalize(vec3(-0.4,0.8,0.6))));\n#include <opaque_fragment>');};
 const mesh=new T.InstancedMesh(geometry,material,CAP);mesh.name='Projectile '+name;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);root.add(mesh);batches[name]={mesh,n:0};
}
let drawn=new WeakSet();const thrown=new Map();
const colors={mage:'#ae87ff',pyromancer:'#ff762c',necromancer:'#80dcac',warlock:'#bc5bcb',chronomancer:'#f1c475',stormcaller:'#70d9ff',paladin:'#ffe5a0',reaper:'#b18ae4',ninja:'#d96879',ranger:'#a9dda0',pirate:'#e6b76c',skylancer:'#a4e5f5'};
const supported=new Set(['orb','runeorb','fireball','glob','light','spark','shard','lance','arrow','bolt','cannonball']);
const throws=new Set(['axe','scythespin','javelin','dagger']);
function part(kind,pr,x,y,z,sx,sy,sz,color,roll=0,yaw=0){
 const b=batches[kind];if(b.n>=CAP)return;
 pose.position.set(x,y,z).applyQuaternion(pr._artRotation).add(pr._artPosition);
 pose.quaternion.copy(pr._artRotation);if(roll)pose.rotateZ(roll);if(yaw)pose.rotateY(yaw);
 pose.scale.set(sx,sy,sz);pose.updateMatrix();b.mesh.setMatrixAt(b.n,pose.matrix);b.mesh.setColorAt(b.n,tint.set(color));b.n++;
}
function release(record){record.cancelled=true;if(record.model){record.model.removeFromParent();record.model.userData.disposeProjectile?.();}}
export function syncProjectiles(scene){
 drawn=new WeakSet();const g=window.__BF3?.G;if(root.parent!==scene)scene.add(root);for(const b of Object.values(batches))b.n=0;
 const live=new Set(g?.projectiles||[]),low=window.__BF3?.meta.quality==='low',limit=low?40:120,time=g?.time||0;let count=0,weapons=0;
 for(const [pr,record] of thrown){if(record.model)record.model.visible=false;if(!live.has(pr)){release(record);thrown.delete(pr);}}
 for(const pr of live){
  if(count>=limit)continue;
  direction.set(pr.vx||0,pr.vy||0,pr.vz||0);if(direction.lengthSq()<.001)direction.set(0,0,1);direction.normalize();
  pr._artRotation=pr._artRotation||new T.Quaternion();pr._artRotation.setFromUnitVectors(forward,direction);
  pr._artPosition=pr._artPosition||new T.Vector3();pr._artPosition.set(pr.x,pr.y,pr.z);
  if(throws.has(pr.shape)&&pr.weapon){
   let record=thrown.get(pr);
   if(!record&&thrown.size<(low?12:24)&&window.__makeThrownWeapon){record={cancelled:false,model:null};thrown.set(pr,record);window.__makeThrownWeapon(pr.weapon).then(model=>{if(!model)return;if(record.cancelled){model.userData.disposeProjectile?.();return;}record.model=model;root.add(model);}).catch(()=>{});}
   if(record?.model){const model=record.model;model.visible=true;model.position.copy(pr._artPosition);model.quaternion.copy(pr._artRotation);
    if(pr.shape==='axe')model.rotateX((pr.spin||time*9));
    if(pr.shape==='scythespin'){model.rotateX(Math.PI/2);model.rotateY((pr.spin||time*9));}
    drawn.add(pr);weapons++;count++;continue;
   }
  }
  if(!supported.has(pr.shape))continue;
  const skill=!!pr.fxSkill,cls=pr.fxClass,shape=pr.shape,s=Math.max(2,Math.min(28,pr.size||7));
  const c=skill?(colors[cls]||pr.color||'#acbfff'):(pr.color||'#acbfff');
  const bright=tint.set(c).lerp(new T.Color('#fff8e7'),.62).getStyle();
  const isArrow=shape==='arrow'||shape==='bolt'||(skill&&cls==='ranger'),isStar=skill&&cls==='ninja';
  if(isStar){for(let k=0;k<4;k++)part('gem',pr,0,0,0,s*.34,s*.16,s*1.5,k%2?bright:'#c5d4df',0,time*16+k*Math.PI/2);}
  else if(isArrow){part('bar',pr,0,0,-3,1.2,1.2,20,skill?c:'#8d7254');part('tip',pr,0,0,9,3,3,5,bright);for(let k=0;k<2;k++)part('bar',pr,0,0,-11,5,.65,5,c,k*Math.PI/2);}
  else if(shape==='cannonball'){part('seed',pr,0,0,0,s,s,s,'#333e4c');part('bar',pr,0,s*.6,-s*.5,s*.16,s*.16,s*.8,'#f4b85c');}
  else if(skill&&cls==='mage'){
   part('gem',pr,0,0,0,s*.58,s*.58,s*(shape==='lance'?2.7:1.65),c);part('gem',pr,0,0,s*.65,s*.28,s*.28,s*.95,bright);
   for(let k=0;k<3;k++){const a=time*4+k*Math.PI*2/3;part('gem',pr,Math.cos(a)*s,Math.sin(a)*s,-s*.55,s*.16,s*.16,s*.75,c);}
  }else if(skill&&cls==='chronomancer'){
   part('gem',pr,0,0,0,s*.35,s*.35,s*1.7,bright);
   for(let k=0;k<2;k++){part('ring',pr,0,0,-k*s*.8,s*(.85+k*.3),s*(.85+k*.3),s*.7,c);const a=time*3+k*Math.PI;part('gem',pr,Math.cos(a)*s,Math.sin(a)*s,-k*s*.8,s*.18,s*.18,s*.35,bright);}
  }else if(skill&&cls==='warlock'){
   part('seed',pr,0,0,0,s*.55,s*.55,s*1.3,'#251c39');
   for(let k=0;k<3;k++){const a=k*2.094+time*2;part('gem',pr,Math.cos(a)*s*.7,Math.sin(a)*s*.7,-s*.4,s*.18,s*.24,s*1.5,c,a);}
  }else if(shape==='fireball'||cls==='pyromancer'){
   part('seed',pr,0,0,s*.2,s*.75,s*.75,s,c);part('gem',pr,0,0,s*.7,s*.38,s*.38,s*.65,'#ffe6a3');
   for(let k=0;k<3;k++){const a=k*2.094;part('gem',pr,Math.cos(a)*s*.35,Math.sin(a)*s*.35,-s,s*.3,s*.3,s*(1.1+.2*Math.sin(time*12+k)),'#d84d23');}
  }else if(shape==='lance'||shape==='shard'||shape==='spark'||cls==='stormcaller'){
   part('gem',pr,0,0,0,s*.32,s*.32,s*2.2,c);part('gem',pr,0,0,s*.6,s*.13,s*.13,s*1.55,bright);
   if(shape==='spark'||cls==='stormcaller')for(let k=0;k<2;k++)part('bar',pr,(k?1:-1)*s*.35,0,-s*.5,s*.25,s*.12,s*1.6,c,(k?1:-1)*.5);
  }else if(shape==='light'||cls==='paladin'){
   part('gem',pr,0,0,0,s*.45,s*.45,s*1.45,bright);part('bar',pr,0,0,-s*.3,s*1.8,s*.16,s*.25,c);part('ring',pr,0,0,-s*.8,s*.75,s*.75,s*.75,c);
  }else{
   part('seed',pr,0,0,0,s*.75,s*.75,s*(shape==='glob'?.85:1.15),cls==='warlock'||pr.el==='void'?'#29223d':c);part('gem',pr,0,0,s*.55,s*.3,s*.3,s*.7,bright);
   if(skill)for(let k=0;k<2;k++)part('gem',pr,(k?1:-1)*s*.75,0,-s*.6,s*.18,s*.3,s,c);
  }
  if(!isArrow&&!isStar&&shape!=='cannonball')for(let k=0;k<(low?1:3);k++){const a=time*2+k*2.094;part('gem',pr,Math.sin(a)*s*.22,Math.cos(a)*s*.22,-s*(2+k*.35),s*(.16-k*.035),s*(.16-k*.035),s*(1.65-k*.15),k?c:bright);}
  drawn.add(pr);count++;
 }
 let calls=0;for(const b of Object.values(batches)){b.mesh.count=b.n;b.mesh.visible=b.n>0;if(b.n){calls++;b.mesh.instanceMatrix.needsUpdate=true;if(b.mesh.instanceColor)b.mesh.instanceColor.needsUpdate=true;}}
 window.__projectileArtStats={count,weaponModels:weapons,batches:calls,instances:Object.fromEntries(Object.entries(batches).map(([k,b])=>[k,b.n])),pendingWeapons:thrown.size};
}
window.__projectile3dDrawn=pr=>drawn.has(pr);
