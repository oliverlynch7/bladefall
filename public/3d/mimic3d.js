import * as T from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';
// A lanky chest predator. Shared geometry; animation follows the existing attack state.
export function makeMimic(){
 const scene=new T.Group(),body=new T.Group();body.name='mimicBody';body.position.y=1.12;scene.add(body);
 const wood=new T.MeshStandardMaterial({color:'#62412c',roughness:.92}),edge=new T.MeshStandardMaterial({color:'#302820',roughness:.8,metalness:.35}),flesh=new T.MeshStandardMaterial({color:'#655356',roughness:.83}),dark=new T.MeshStandardMaterial({color:'#240e1a',roughness:.9}),ivory=new T.MeshStandardMaterial({color:'#d8c49b',roughness:.72}),tongue=new T.MeshStandardMaterial({color:'#a14b66',roughness:.55}),eye=new T.MeshStandardMaterial({color:'#ffb66d',emissive:'#ff601b',emissiveIntensity:.7});
 const add=(parent,geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;};
 const box=(p,x,y,z,w,h,d,m)=>add(p,new T.BoxGeometry(w,h,d),m,x,y,z);
 box(body,0,0,0,.91,.46,.60,wood);box(body,0,.242,.07,.80,.045,.49,dark);
 // Separate weathered boards, inset bands, studs and a hanging lock.
 for(let i=0;i<7;i++)for(const z of [-.307,.307])box(body,-.39+i*.13,0,z,.008,.39,.009,edge);
 for(const x of [-.36,.36])for(const z of [-.315,.315]){box(body,x,0,z,.08,.47,.035,edge);for(const y of [-.16,0,.16])add(body,new T.SphereGeometry(.019,6,4),ivory,x,y,z+Math.sign(z)*.023);}
 for(const y of [-.22,.21])box(body,0,y,.321,.94,.045,.035,edge);
 box(body,0,-.03,.355,.12,.15,.05,edge);box(body,0,.002,.386,.018,.043,.01,dark);
 const jaw=new T.Group();jaw.name='mimicJaw';jaw.position.set(0,.22,-.28);jaw.rotation.x=-.68;body.add(jaw);
 const roof=add(jaw,new T.CylinderGeometry(.30,.30,.94,18,1,false,0,Math.PI),wood,0,0,.28);roof.rotation.z=Math.PI/2;box(jaw,0,0,.28,.85,.045,.56,dark);
 for(const x of [-.37,.37]){const band=add(jaw,new T.TorusGeometry(.305,.025,6,18,Math.PI),edge,x,0,.28);band.rotation.y=Math.PI/2;}
 for(let k=1;k<8;k++){const angle=k*Math.PI/8;box(jaw,0,Math.sin(angle)*.303,.28+Math.cos(angle)*.303,.90,.006,.006,edge);}
 for(const x of [-.37,.37])box(jaw,x,.14,.28,.075,.27,.62,edge);
 for(let i=0;i<13;i++){const x=-.39+i*.065,h=.13+(i%3)*.035;add(body,new T.ConeGeometry(.027,h,5),ivory,x,.25+h*.5,.29);const tooth=add(jaw,new T.ConeGeometry(.027,h,5),ivory,x,-h*.5,.55);tooth.rotation.z=Math.PI;}
 for(const x of [-.45,.45])for(let i=0;i<5;i++)add(body,new T.ConeGeometry(.025,.13,5),ivory,x,.29,-.20+i*.10);
 const curl=new T.CatmullRomCurve3([new T.Vector3(0,.25,.24),new T.Vector3(.06,.15,.62),new T.Vector3(.19,.01,.78),new T.Vector3(.26,.09,.74)]);add(body,new T.TubeGeometry(curl,12,.043,6,false),tongue,0,0,0);
 for(const x of [-.20,.20])add(jaw,new T.SphereGeometry(.036,8,6),eye,x,.19,.593);
 // Long jointed limbs leave a distinct standing silhouette rather than a tiny hopping box.
 for(const sign of [-1,1]){
  const arm=new T.Group();arm.name=sign<0?'mimicArmL':'mimicArmR';arm.position.set(sign*.47,-.02,0);body.add(arm);
  const limb=(p,a,b,r)=>{const v=new T.Vector3(...b).sub(new T.Vector3(...a)),m=add(p,new T.CylinderGeometry(r*.76,r,v.length(),8),flesh,...new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());};
  limb(arm,[0,0,0],[sign*.25,-.38,.08],.065);limb(arm,[sign*.25,-.38,.08],[sign*.14,-.78,.34],.047);add(arm,new T.SphereGeometry(.077,8,6),flesh,sign*.25,-.38,.08);
  for(let k=0;k<4;k++){const x=sign*(.09+k*.045);limb(arm,[x,-.76,.31],[x,-.94,.44+k*.025],.018);add(arm,new T.ConeGeometry(.014,.095,5),ivory,x,-.99,.47+k*.025).rotation.x=.45;}
  const leg=new T.Group();leg.name=sign<0?'mimicLegL':'mimicLegR';leg.position.set(sign*.28,-.22,-.04);body.add(leg);
  limb(leg,[0,0,0],[sign*.13,-.37,.09],.072);limb(leg,[sign*.13,-.37,.09],[sign*.05,-.84,-.04],.049);add(leg,new T.SphereGeometry(.08,8,6),flesh,sign*.13,-.37,.09);box(leg,sign*.05,-.87,.07,.14,.07,.31,flesh);
  for(let k=0;k<3;k++)add(leg,new T.ConeGeometry(.025,.13,5),ivory,sign*.05+(k-1)*.044,-.87,.26).rotation.x=Math.PI/2;
 }
 // Merge rigid detail per moving joint/material: claws and rivets need not each cost a draw call.
 for(const group of [body,...body.children.filter(o=>o.isGroup)]){
  const batches=new Map();for(const mesh of [...group.children]){if(!mesh.isMesh)continue;mesh.updateMatrix();const key=mesh.material;let batch=batches.get(key);if(!batch)batches.set(key,batch=[]);batch.push(mesh);}
  for(const [material,meshes]of batches){if(meshes.length<2)continue;const copies=meshes.map(m=>m.geometry.clone().applyMatrix4(m.matrix)),geometry=mergeGeometries(copies,false);for(const g of copies)g.dispose();if(!geometry)continue;for(const mesh of meshes){group.remove(mesh);mesh.geometry.dispose();}group.add(new T.Mesh(geometry,material));}
 }
 const track=(name,values)=>new T.NumberKeyframeTrack(name, [0,.25,.5,.75,1],values);
 const clip=(name,amount)=>new T.AnimationClip(name,1,[track('mimicJaw.rotation[x]',[-.68,-.68-amount,-.75,-.68-amount,-.68]),track('mimicArmL.rotation[x]',[0,amount,-amount,0,0]),track('mimicArmR.rotation[x]',[0,-amount,amount,0,0]),track('mimicLegL.rotation[x]',[0,amount*.5,0,-amount*.5,0]),track('mimicLegR.rotation[x]',[0,-amount*.5,0,amount*.5,0])]);
 const bite=(name,duration)=>{
  const times=Array.from({length:33},(_,i)=>i/32*duration),poses=times.map(t=>{
   const u=t/duration,s=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
   const open=name==='Windup'?s(u/.62):name==='Attack'?1-.88*s(u/.16):.12*(1-s(u));
   const lean=name==='Windup'?-.10*s(u):name==='Attack'?-.10+.27*s(u/.13)-.11*s((u-.2)/.8):.06*(1-s(u));
   return {jaw:-.68-open*.72,body:lean,left:-.18*open,right:-.22*open,elbow:0};
  });
  return new T.AnimationClip(name,duration,[new T.NumberKeyframeTrack('mimicJaw.rotation[x]',times,poses.map(p=>p.jaw)),new T.NumberKeyframeTrack('mimicBody.rotation[x]',times,poses.map(p=>p.body)),new T.NumberKeyframeTrack('mimicArmL.rotation[x]',times,poses.map(p=>p.left)),new T.NumberKeyframeTrack('mimicArmR.rotation[x]',times,poses.map(p=>p.right)),new T.NumberKeyframeTrack('mimicLegL.rotation[x]',times,times.map(()=>0)),new T.NumberKeyframeTrack('mimicLegR.rotation[x]',times,times.map(()=>0))]);
 };
 const animations=[clip('Idle',.05),clip('Move',.4),bite('Windup',1),bite('Attack',.42),bite('Recover',.38),clip('Hit',.16),new T.AnimationClip('Death',.8,[new T.NumberKeyframeTrack('mimicBody.rotation[z]',[0,.4,.8],[0,.5,1.45])])];
 scene.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(scene),size=bb.getSize(new T.Vector3());return {scene,animations,_revisedAnimations:animations,_nativeH:size.y,_baseY:bb.min.y,_nativeX:size.x,_nativeZ:size.z,_nativeW:Math.max(size.x,size.z)};
}
