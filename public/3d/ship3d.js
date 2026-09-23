import * as THREE from './three.module.js';

function batchStatic(group,skip=new Set()){
 const byMaterial=new Map(),created=[];
 for(const child of [...group.children])if(child.isMesh&&!skip.has(child)){
  child.updateMatrix();const g=child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone();g.applyMatrix4(child.matrix);
  const list=byMaterial.get(child.material)||[];list.push(g);byMaterial.set(child.material,list);group.remove(child);
 }
 for(const [material,list]of byMaterial){const g=new THREE.BufferGeometry();
  for(const key of ['position','normal']){const size=list.reduce((n,q)=>n+q.attributes[key].array.length,0),values=new Float32Array(size);let at=0;
   for(const q of list){values.set(q.attributes[key].array,at);at+=q.attributes[key].array.length;}g.setAttribute(key,new THREE.BufferAttribute(values,3));}
  for(const q of list)q.dispose();const m=new THREE.Mesh(g,material);group.add(m);created.push(g);
 }
 return created;
}

// Shared boat asset for the shore build and crossing. The deck remains level in combat;
// only the visual hull/sail has restrained motion. All dimensions are in metres.
export function createBoat(){
 const root=new THREE.Group(),visual=new THREE.Group();root.add(visual);
 const materials={},geometries=new Set();
 const mat=(color)=>materials[color]||(materials[color]=new THREE.MeshStandardMaterial({color,roughness:.86,flatShading:true}));
 function mesh(geometry,color,parent=visual){geometries.add(geometry);const m=new THREE.Mesh(geometry,mat(color));parent.add(m);m.castShadow=true;m.receiveShadow=true;return m;}
 function box(x,y,z,w,h,d,color,parent){const m=mesh(new THREE.BoxGeometry(w,h,d),color,parent);m.position.set(x,y,z);return m;}
 function beam(a,b,r,color,parent){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);
  const m=mesh(new THREE.CylinderGeometry(r,r,d.length(),6),color,parent);m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
 const sections=[[-6,.12],[-4.4,1.4],[-2.5,2],[1.8,2],[4.2,1.6],[5,.95]];
 // Clinker-built hull bands, with a true tapered bow rather than a rectangular box.
 for(let band=0;band<4;band++)for(const side of [-1,1])for(let i=1;i<sections.length;i++){
  const [za,wa]=sections[i-1],[zb,wb]=sections[i],lo=band/4,hi=(band+1)/4;
  const v=[side*wa*(.55+.45*lo),-.85+lo*1.15,za, side*wb*(.55+.45*lo),-.85+lo*1.15,zb,
   side*wb*(.55+.45*hi),-.85+hi*1.15,zb, side*wa*(.55+.45*hi),-.85+hi*1.15,za];
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));
  g.setIndex(side===1?[0,2,1,0,3,2]:[0,1,2,0,2,3]);g.computeVertexNormals();
  const m=mesh(g,['#573625','#815035','#a1663f','#bd824e'][band]);m.material.side=THREE.DoubleSide;
 }
 for(let i=1;i<sections.length;i++)for(const side of [-1,1]){
  const [za,wa]=sections[i-1],[zb,wb]=sections[i];beam([side*wa,.38,za],[side*wb,.38,zb],.11,'#4b3328');
 }
 for(let i=0;i<4;i++)box(0,-.7+i*.28,5,1.15+i*.22,.26,.14,['#573625','#815035','#a1663f','#bd824e'][i]);
 for(let z=-4.2;z<=4.15;z+=.35){const width=z< -2.5?2*(1.4+(z+4.4)/1.9*.6):z>1.8?2*(2-(z-1.8)/2.4*.4):4;
  box(0,.08,z,width-.15,.17,.325,Math.round(z*10)%2?'#bb8050':'#ad7045');}
 for(const z of [-3,-.2,2.8]){box(0,.47,z,3.7,.18,.36,'#604331');for(const x of [-1.5,1.5])box(x,.25,z,.16,.44,.25,'#3d302a');}
 const mast=beam([0,.2,-1],[0,7,-1],.13,'#65432c');
 beam([-2.5,5.9,-1],[2.5,5.9,-1],.075,'#64452e');
 // Broad cloth belly catches side light. Separate seams give detail without textures.
 const sail=new THREE.Group();sail.position.set(0,0,-1);visual.add(sail);
 for(let i=0;i<6;i++){
  const x0=-2.35+i*4.7/6,x1=x0+4.7/6;
  const z0=-Math.sin((i/6)*Math.PI)*.58,z1=-Math.sin(((i+1)/6)*Math.PI)*.58;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([x0,2,z0,x1,2,z1,x1,5.75,z1,x0,5.75,z0],3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();
  const cloth=mesh(g,i%2?'#ded2af':'#eee1bd',sail);cloth.material.side=THREE.DoubleSide;
  beam([x0,2,z0-.01],[x0,5.75,z0-.01],.012,'#a89c81',sail);
 }
 // A visibly repaired patch and restrained dark blue sail marking.
 box(.9,3.25,-1.57,.5,.65,.025,'#b39a72');
 box(-.5,4.2,-1.55,.12,1.25,.025,'#405e68');box(-.5,4.62,-1.56,.68,.12,.03,'#405e68');
 for(const x of [-1.75,1.75])for(const z of [-3.4,3.6])beam([x,.45,z],[0,6.65,-1],.025,'#c3aa7d');
 const helm=new THREE.Group();helm.position.set(0,1.35,3.15);visual.add(helm);
 const wheel=mesh(new THREE.TorusGeometry(.48,.055,5,12),'#503d2e',helm);
 for(let i=0;i<6;i++){const a=i*Math.PI/3;beam([0,0,0],[Math.cos(a)*.65,Math.sin(a)*.65,0],.04,'#b58a51',helm);}
 box(0,.65,3.15,.18,1.2,.2,'#65503a');
 const rudder=box(0,-.25,5.05,.15,1.3,.8,'#65432c');
 const rope=new THREE.Group();visual.add(rope);
 for(let i=0;i<4;i++){const m=mesh(new THREE.TorusGeometry(.28+i*.035,.025,4,12),'#b79b67',rope);m.rotation.x=Math.PI/2;m.position.set(-1.1,.25+i*.03,1.7);}
 for(const x of [-1.5,1.5]){box(x,.8,3.7,.15,1,.15,'#473c31');box(x,1.25,3.7,.24,.34,.24,'#9c7341');box(x,1.25,3.83,.15,.23,.025,'#f6d892');}
 box(.95,.36,3.8,.6,.52,.7,'#786347');for(const z of [3.58,4.02])box(.95,.36,z,.63,.55,.06,'#3a4545');
 for(const g of [...batchStatic(visual,new Set([rudder,mast])),...batchStatic(helm),...batchStatic(sail),...batchStatic(rope)])geometries.add(g);
 function update(t,steer=0,{sailInstalled=true,rudderInstalled=true,ropeInstalled=true,underway=true}={}){
  visual.position.y=underway?Math.sin(t*1.7)*.045:0; // never moves the collision deck
  helm.rotation.z=-steer*.7;rudder.rotation.y=steer*.28;
  sail.visible=sailInstalled;mast.visible=true;rudder.visible=rudderInstalled;rope.visible=ropeInstalled;
  sail.scale.z=1+Math.sin(t*2.1)*.025;
 }
 function dispose(){for(const g of geometries)g.dispose();for(const m of Object.values(materials))m.dispose();}
 return {root,update,dispose,helm,deck:{halfWidth:1.8,minZ:-3.8,maxZ:4.1,y:.2}};
}

export function createCrossingScene(scene){
 const root=new THREE.Group();scene.add(root);const boat=createBoat();root.add(boat.root);
 const owned=[],mats=[],obstacleMeshes=new Map();
 const material=(color)=>{const m=new THREE.MeshStandardMaterial({color,roughness:.9,flatShading:true});mats.push(m);return m;};
 const rockMat=material('#40545a'),timberMat=material('#9d683e'),foamMat=material('#a2d6ce');
 function add(g,m,parent=root){owned.push(g);const mesh=new THREE.Mesh(g,m);parent.add(mesh);return mesh;}
 const water=add(new THREE.PlaneGeometry(400,650,1,1),material('#176774'));water.rotation.x=-Math.PI/2;water.position.set(0,-.65,-120);
 const foamGeometry=new THREE.BoxGeometry(1,.025,.09);owned.push(foamGeometry);
 const foam=new THREE.InstancedMesh(foamGeometry,foamMat,65);root.add(foam);const transform=new THREE.Object3D();
 const buoyMaterials=[material('#ce8446'),material('#e2cd9d')];
 const marks=[];for(let i=0;i<12;i++)for(const side of [-1,1]){
  const buoy=new THREE.Group();root.add(buoy);add(new THREE.CylinderGeometry(.3,.55,.7,6),buoyMaterials[i%2],buoy).position.y=-.15;
  const post=add(new THREE.CylinderGeometry(.045,.045,1.7,5),timberMat,buoy);post.position.y=.8;
  buoy.position.set(side*25,0,-i*20);marks.push({buoy,i,side});
 }
 // Distant approach silhouette, not collidable encounter terrain.
 const cliffs=new THREE.Group();root.add(cliffs);cliffs.position.set(0,-4,-255);
 for(let i=0;i<12;i++){const m=add(new THREE.CylinderGeometry(7+(i%3),12,25+(i%5)*9,5),rockMat,cliffs);m.position.set((i-5.5)*13,9+(i%5)*4,-(i%3)*8);}
 owned.push(...batchStatic(cliffs));
 const haloMat=new THREE.MeshBasicMaterial({color:'#f5d696',transparent:true,opacity:.62,depthWrite:false,side:THREE.DoubleSide});mats.push(haloMat);
 const safeMat=new THREE.MeshBasicMaterial({color:'#bde4e1',transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide});mats.push(safeMat);
 const wake=new THREE.Group();root.add(wake);
 for(let i=0;i<8;i++)for(const side of [-1,1]){const m=add(new THREE.BoxGeometry(.1,.018,1.1),foamMat,wake);m.position.set(side*(.9+i*.18),0,5+i*1.2);m.rotation.y=side*.15;}
 owned.push(...batchStatic(wake));
 function sync(s,t){
  const C=window.BFShipCrossing,v=C.view(s);boat.root.position.x=s.x;boat.update(t,s.vx/11,{underway:s.started&&!s.paused});
  wake.position.set(s.x,-.56,0);wake.visible=v.kind==='steer'&&s.started;
  for(let i=0;i<65;i++){transform.position.set(((i*37)%97)-48,-.58+Math.sin(t*1.2+i)*.015,16-((i*17-s.distance)%260+260)%260);transform.scale.set(1.4+(i%4)*1.1,1,1);transform.updateMatrix();foam.setMatrixAt(i,transform.matrix);}foam.instanceMatrix.needsUpdate=true;
  for(const {buoy,i}of marks){buoy.position.z=10-((i*20-s.distance)%240+240)%240;buoy.position.y=Math.sin(t*1.7+i)*.1;}
  const visible=new Set();for(const o of v.obstacles){visible.add(o.id);let g=obstacleMeshes.get(o.id);
   if(!g){g=new THREE.Group();root.add(g);obstacleMeshes.set(o.id,g);
    if(o.kind==='wreck'){
     const hull=add(new THREE.BoxGeometry(o.radius*1.35,1.3,o.radius*.6),timberMat,g);hull.rotation.set(.2,.5,.25);hull.position.y=.15;
     const spar=add(new THREE.CylinderGeometry(.16,.23,o.radius*2,6),timberMat,g);spar.rotation.z=.9;spar.position.y=2;
    }else{const m=add(new THREE.ConeGeometry(o.radius*.8,3.4,5),rockMat,g);m.rotation.y=o.x;m.position.y=.3;}
    // Exact circular collision footprint: art never extends beyond this radius in x/z.
    const ring=add(new THREE.RingGeometry(o.radius+.07,o.radius+.19,40),haloMat,g);ring.rotation.x=-Math.PI/2;ring.position.y=-.48;
    const safe=add(new THREE.RingGeometry(1.2,1.4,24),safeMat,g);safe.rotation.x=-Math.PI/2;safe.position.set(-Math.sign(o.x)*17-o.x,-.48,0);
   }
   g.visible=true;g.position.set(o.x,0,-(o.z-s.distance));
  }
  for(const [id,g]of obstacleMeshes)if(!visible.has(id))g.visible=false;
  cliffs.visible=s.stage>=5;cliffs.position.z=s.stage===6?-95:-255+v.progress*115;
 }
 function dispose(){boat.dispose();for(const g of owned)g.dispose();for(const m of mats)m.dispose();root.removeFromParent();}
 return {root,boat,sync,dispose};
}
