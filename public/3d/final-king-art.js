import * as T from './three.module.js';
import * as SkeletonUtils from './jsm/utils/SkeletonUtils.js';
import {kitModel,loadKitModel} from './mob3d.js?v=2022';
import {buildDeep} from './deep-art.js?v=2017';
let active=null;
export function buildFinalKing(scene,w){
 for(const name of ['Warrior','Ranger','Monk'])if(!kitModel('chars/'+name))loadKitModel('chars/'+name);
 const voidScene=w.finalStage==='void'||w.finalStage==='restored',restored=w.finalStage==='restored';
 const result=buildDeep(scene,{...w,portalProfile:{name:'The King’s Hall',palette:['#696471','#6e6770','#5e5b68','#776e78'],fog:voidScene?'#100e20':'#272734',sky:voidScene?[.025,.018,.055]:[.12,.12,.18],sun:'#ded5e2',body:'#393946',lamp:'#e6ba79',hazard:['#171423','#473755'],sunGlow:[.03,.02,.04]}});
 result.group.traverse(o=>{if((voidScene&&o.isMesh)||(o.isInstancedMesh&&['castle ring','castle rune'].includes(o.name)))o.visible=false;});
 const geos=[],materials=[new T.MeshStandardMaterial({color:'#494350',roughness:.9}),new T.MeshStandardMaterial({color:'#b29666',metalness:.65,roughness:.45}),new T.MeshBasicMaterial({color:'#020106',side:T.DoubleSide}),new T.MeshBasicMaterial({color:restored?'#ffe0a2':'#a695d7',transparent:true,opacity:.7,depthWrite:false}),new T.MeshStandardMaterial({color:'#1e2029',metalness:.8,roughness:.4}),new T.MeshBasicMaterial({color:'#ffd183'})];
 const part=(geo,mat,x,y,z,parent=result.group)=>{geos.push(geo);const mesh=new T.Mesh(geo,materials[mat]);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 let gate=null,sword=null,souls=null,heads=null,tear=null;const restoredBodies=[];
 if(!voidScene){
  // Tall back and side walls; the camera-facing wall is cut away, with broken roof beams.
  for(const x of [-1280,1280]){part(new T.BoxGeometry(110,780,2300),0,x,350,-100);for(let z=-1050;z<1000;z+=330){part(new T.BoxGeometry(170,960,100),0,x,430,z);part(new T.BoxGeometry(190,32,130),1,x,810,z);}}
  part(new T.BoxGeometry(2650,860,90),0,0,400,-1500);
  for(const x of [-950,-700,700,950]){part(new T.BoxGeometry(35,530,28),1,x,440,-1445);part(new T.BoxGeometry(125,410,18),2,x,430,-1430);}
  for(const q of window.BFFinalKing.pillars){part(new T.BoxGeometry(90,230,90),0,q.x,115,q.z);part(new T.BoxGeometry(130,28,130),1,q.x,240,q.z);for(const y of [40,115,190])part(new T.BoxGeometry(98,10,98),1,q.x,y,q.z);}
  for(const x of [-900,900])for(const z of [-850,650]){part(new T.BoxGeometry(180,430,8),0,x,420,z);part(new T.BoxGeometry(195,16,25),1,x,645,z);}
  // One Gate: nested black layers create depth. No second friendly portal in the hall.
  gate=new T.Group();gate.position.set(0,420,-1350);result.group.add(gate);
  const frame=part(new T.TorusGeometry(330,28,6,48),0,0,0,0,gate);frame.scale.y=1.2;
  for(let i=0;i<6;i++){const disc=part(new T.CircleGeometry(310-i*7,48),2,0,0,-i*35,gate);disc.scale.y=1.2;}
  for(let i=0;i<10;i++){const a=i*Math.PI/5;part(new T.BoxGeometry(18,48,15),1,Math.sin(a)*333,Math.cos(a)*390,12,gate).rotation.z=-a;}
 }else{
  part(new T.CylinderGeometry(850,740,42,12),4,0,-24,0);
  for(let i=0;i<18;i++){const a=i*2.4,r=450+i*48;part(new T.BoxGeometry(100+(i%3)*45,35,80),0,Math.sin(a)*r,-100+(i%4)*80,Math.cos(a)*r);}
  const soulGeo=new T.CapsuleGeometry(8,25,2,5);geos.push(soulGeo);souls=new T.InstancedMesh(soulGeo,materials[3],120);result.group.add(souls);const headGeo=new T.SphereGeometry(9,7,5);geos.push(headGeo);heads=new T.InstancedMesh(headGeo,materials[3],120);result.group.add(heads);
  sword=new T.Group();sword.position.set(80,75,30);result.group.add(sword);
  part(new T.BoxGeometry(14,80,13),4,0,0,0,sword);part(new T.BoxGeometry(150,20,26),1,0,42,0,sword);for(const x of [-62,62])part(new T.BoxGeometry(22,48,24),1,x,60,0,sword).rotation.z=x>0?-.35:.35;
  const shape=new T.Shape();shape.moveTo(-22,50);shape.lineTo(-33,210);shape.lineTo(0,285);shape.lineTo(33,210);shape.lineTo(22,50);shape.closePath();part(new T.ExtrudeGeometry(shape,{depth:10,bevelEnabled:false}),4,0,0,-5,sword);part(new T.BoxGeometry(8,170,12),5,0,140,0,sword);part(new T.OctahedronGeometry(18),1,0,-47,0,sword);
  tear=part(new T.PlaneGeometry(15,1800),5,0,500,-520);tear.visible=false;
  if(restored){
   // A glimpse of ordinary life returning through the opening; these are scenery, never rewards or NPC interactions.
   tear.material=materials[5].clone();materials.push(tear.material);tear.material.transparent=true;tear.material.opacity=.08;tear.material.depthWrite=false;
   part(new T.BoxGeometry(1100,28,450),0,0,-15,-740);
   for(const x of [-420,420]){part(new T.BoxGeometry(200,160,180),0,x,80,-850);part(new T.ConeGeometry(170,110,4),1,x,215,-850).rotation.y=Math.PI/4;part(new T.BoxGeometry(36,58,5),5,x,85,-758);}
   for(let i=0;i<6;i++){const source=kitModel('chars/'+['Warrior','Ranger','Monk'][i%3])||kitModel('chars/Monk');if(!source)continue;const body=SkeletonUtils.clone(source.scene),scale=64/source._nativeH;body.scale.setScalar(scale);body.position.set(-240+i*96,-source._baseY*scale,-650+(i%2)*90);body.traverse(o=>{if(!o.isMesh)return;if(/Sword|Staff|Bow|Dagger|Axe/i.test(o.name)){o.visible=false;return;}o.material=o.material.clone();o.material.color.set(['#afa18b','#8faaa3','#c2a989'][i%3]);materials.push(o.material);});result.group.add(body);restoredBodies.push(body);}
  }
 }
 const previous=result.group.userData.dispose;result.group.userData.dispose=()=>{previous?.();for(const b of restoredBodies)b.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});geos.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());if(active?.root===result.group)active=null;};
 active={root:result.group,gate,sword,souls,heads,tear,restored};result.counts.name=voidScene?(restored?'Aerth restored':'Abyssal Void'):'The King’s Hall';return result;
}
export function updateFinalKing(w){if(!active||!w.finalStage)return;const e=window.__BF3?.G?.boss,t=performance.now()/1000;if(!e)return;const a=active;
 if(a.gate){const s=e.akStage==='collapse'?1+(5-e.akClock)*.14:1;a.gate.scale.setScalar(s);}
 if(a.sword){a.sword.visible=['charge','cut'].includes(e.akStage);a.sword.rotation.z=e.akStage==='cut'?-Math.min(1,(8-e.akClock)/2)*2.5:Math.sin(t)*.025;a.sword.position.y=75+(e.akCharge?.presses||0)*.6;}
 if(a.tear){a.tear.visible=e.akStage==='cut'||a.restored;a.tear.scale.x=e.akStage==='cut'?Math.max(1,(8-e.akClock)*9):70;}
 if(a.souls){const d=new T.Object3D();for(let i=0;i<120;i++){const angle=i*2.4,r=300+(i%17)*65;d.position.set(Math.sin(angle)*r,50+(i%11)*40+Math.sin(t*.7+i)*12+(a.restored?t%8*40:0),-250+Math.cos(angle)*r);d.scale.setScalar(a.restored?1.15:1);d.updateMatrix();a.souls.setMatrixAt(i,d.matrix);d.position.y+=29*d.scale.x;d.updateMatrix();a.heads.setMatrixAt(i,d.matrix);}a.souls.instanceMatrix.needsUpdate=true;a.heads.instanceMatrix.needsUpdate=true;}
}
