import * as T from './three.module.js';
import {buildDeep} from './deep-art.js?v=2017';
export function buildLongAscent(scene,w){
 const result=buildDeep(scene,{...w,portalProfile:{name:'Castle Duskmoor · Long Ascent',palette:['#655f6b','#696370','#625d68','#706875'],fog:'#252937',sky:[.12,.14,.20],sun:'#dcd4e2',body:'#373a47',lamp:'#deb179',hazard:['#202631','#414c63'],sunGlow:[.03,.02,.04]}});
 result.group.traverse(o=>{if(o.isInstancedMesh&&['castle ring','castle rune'].includes(o.name))o.visible=false;});
 const geos=[],mats=[new T.MeshStandardMaterial({color:'#6d6472',roughness:.8}),new T.MeshStandardMaterial({color:'#b79869',metalness:.55,roughness:.5}),new T.MeshStandardMaterial({color:'#323843',metalness:.4,roughness:.7})];
 const part=(g,m,x,y,z)=>{geos.push(g);const mesh=new T.Mesh(g,mats[m]);mesh.position.set(x,y,z);result.group.add(mesh);return mesh;};
 for(const [i,p]of window.BFLongAscent.path.entries())part(new T.BoxGeometry(270,24,70),0,p[0],p[2]-12,p[1]).rotation.y=i/120*Math.PI*2-Math.PI/2;
 // A cutaway tower shell gives the climb weight without putting a roof in the camera.
 for(let i=0;i<18;i++){const a=Math.PI*.5+i*Math.PI/17,x=Math.sin(a)*1430,z=Math.cos(a)*1430;if(z>-800)continue;
  part(new T.BoxGeometry(105,2350,115),0,x,1020,z).rotation.y=a;
  for(let y=150;y<2300;y+=500){part(new T.BoxGeometry(245,100,85),0,x,y,z).rotation.y=a;part(new T.BoxGeometry(260,18,100),1,x,y+61,z).rotation.y=a;}
 }
 // Stone ribs carry both spiral turns to the shaft. Their feet extend below the first landing.
 for(let i=0;i<20;i++){const a=i*Math.PI/10,x=Math.sin(a)*770,z=Math.cos(a)*770;
  part(new T.BoxGeometry(42,2200,48),0,x,950,z).rotation.y=a;
  for(let turn=0;turn<2;turn++){const y=i/20*1000+turn*1000-38;part(new T.BoxGeometry(45,38,310),0,Math.sin(a)*915,y,Math.cos(a)*915).rotation.y=a;}
 }
 // Low room walls keep the workers and service puzzles visible from the play camera.
 for(const [cx,cz,y,width]of [[1390,-480,250,470],[-1420,-520,750,580],[-1650,535,1800,440]]){
  for(let row=0;row<5;row++)for(let col=0;col<7;col++){const x=cx-width/2+(col+.5)*width/7+(row%2?14:0);part(new T.BoxGeometry(width/7-3,35,28),0,x,y+row*38+18,cz);}
  part(new T.BoxGeometry(width+40,15,44),1,cx,y+201,cz);
  for(const dx of [-width*.36,width*.36]){part(new T.BoxGeometry(16,98,16),2,cx+dx,y+100,cz+22);part(new T.CylinderGeometry(10,18,24,8,1,true),1,cx+dx,y+157,cz+22);}
 }
 // Legion cloth and iron bands break up the tall stone without hiding the stairs.
 for(const [x,z,y]of [[-450,-1390,750],[450,-1390,1750]]){
  const cloth=new T.MeshStandardMaterial({color:'#643f4b',roughness:1,side:T.DoubleSide});mats.push(cloth);
  part(new T.BoxGeometry(175,390,6),mats.length-1,x,y,z);part(new T.BoxGeometry(190,18,25),1,x,y+202,z);part(new T.BoxGeometry(15,160,9),1,x,y+10,z+6);part(new T.BoxGeometry(70,12,9),1,x,y+43,z+6);
 }
 // The service lift has a real vertical guide shaft and chain, not an instant teleporter.
 for(const x of [1315,1525])part(new T.BoxGeometry(18,1130,18),2,x,750,-170);
 for(let y=280;y<1330;y+=65){const m=part(new T.TorusGeometry(12,3,5,10),1,1505,y,-170);m.scale.y=1.7;m.rotation.y=(Math.round(y/65)%2)*Math.PI/2;}
 for(const y of [320,1320])part(new T.TorusGeometry(37,6,5,16),1,1510,y,-170);
 // Bell-shaped lamps punctuate the safe landings without filling the stairs with particles.
 for(const [x,z,y]of [[0,940,0],[940,0,250],[0,-940,500],[-940,0,750],[0,940,1000],[0,-940,1500],[0,940,2000]]){part(new T.CylinderGeometry(14,27,31,10,1,true),1,x+160,y+160,z);part(new T.BoxGeometry(12,150,12),2,x+160,y+75,z);}
 // Batch repeated architecture so the tower does not add a draw call per brick or chain link.
 const batches=new Map();for(const mesh of [...result.group.children])if(mesh.isMesh&&!mesh.isInstancedMesh&&geos.includes(mesh.geometry)){mesh.updateMatrix();const key=mesh.geometry.type+JSON.stringify(mesh.geometry.parameters)+mesh.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(mesh);}
 let extraTriangles=0;for(const meshes of batches.values()){const first=meshes[0],inst=new T.InstancedMesh(first.geometry,first.material,meshes.length);meshes.forEach((m,i)=>{inst.setMatrixAt(i,m.matrix);result.group.remove(m);});inst.instanceMatrix.needsUpdate=true;result.group.add(inst);extraTriangles+=(first.geometry.index?.count||first.geometry.attributes.position.count)/3*meshes.length;}
 result.counts.customTriangles=extraTriangles;result.counts.customDrawCalls=batches.size;
 const dispose=result.group.userData.dispose;result.group.userData.dispose=()=>{dispose?.();geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());};result.counts.name='Long Ascent';return result;
}
