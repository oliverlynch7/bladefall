import * as T from './three.module.js';
import {claimSurface} from './surface-regions.js?v=1972';
import {createBoat,createCrossingScene} from './ship3d.js';
let active;
export function buildStorm(scene,w){
 scene.traverse(o=>{if(o.isLight){if(o.userData._w3dOrig==null)o.userData._w3dOrig=o.intensity;o.intensity=o.userData._w3dOrig*(o.isAmbientLight?.65:.18);}});
 const group=new T.Group(),geometries=[],materials=[],bins=new Map(),dummy=new T.Object3D();
 const oldFog=scene.fog;scene.fog=new T.Fog('#66818a',w.shipScene==='voyage'?4000:1100,w.shipScene==='voyage'?16000:3300);
 const sun=new T.DirectionalLight('#ffe1b5',1.9);sun.position.set(-600,1000,300);group.add(sun);group.add(new T.HemisphereLight('#cadfdf','#514b3b',1.2));
 const box=(x,y,z,sx,sy,sz,c,rz=0)=>{const list=bins.get(c)||[];list.push([x,y,z,sx,sy,sz,rz]);bins.set(c,list);};
 const rock=(x,y,z,sx,sy,sz,c)=>box(x,y,z,sx,sy,sz,'rock:'+c,.17);
 let boat,crossing;
 if(w.shipScene==='voyage'){
  crossing=createCrossingScene(group);crossing.root.scale.setScalar(64);
 }else{
  const ledger=new Map();for(const o of w.obstacles.filter(o=>o.kind==='plat'))for(const p of claimSurface(ledger,o,String(o.h))){
   const depth=p.shoreTimber?32:p.h+150;box(p.x,p.h-depth/2,p.z,p.w,depth,p.d,p.shoreTimber?'#a2784b':p.h<60?'#a69770':p.h<180?'#777b6e':'#56686a');
   if(p.shoreTimber&&p.w>35&&p.d>25)for(let z=p.z-p.d/2+20;z<p.z+p.d/2;z+=45)box(p.x,p.h+.25,z,p.w,.5,2,'#674a32');
  }
  for(const wall of w.walls)box(wall.x,wall.y0+wall.h/2,wall.z,wall.w,wall.h,wall.d,wall.shoreHatch?'#715139':'#405359');
  box(0,-95,-1900,13000,20,14000,'#286a72');
  for(const d of w.deco){
   if(d.kind==='shoreRock'){
    rock(d.x,d.y0+d.h*.4,d.z,d.w*.7,d.h*.7,d.d*.7,'#43575a');
    rock(d.x+d.w*.1,d.y0+d.h*.8,d.z,d.w*.45,d.h*.35,d.d*.5,'#67746e');
   }else if(d.kind==='shoreWreck'){
    for(const side of [-1,1])for(let j=0;j<7;j++){
     const z=d.z-d.d*.45+j*d.d*.15,x=d.x+side*d.w*(.32+Math.sin(j/6*Math.PI)*.15);
     box(x,d.y0+d.h*.38,z,20,d.h*.75,30,'#5b4030',side*.16);
     box(x,d.y0+22,z,30,20,d.d*.14,'#a77549');
    }
    for(let j=0;j<6;j++)box(d.x,d.y0+5+j*2,d.z-d.d*.4+j*d.d*.16,d.w*.72,8,d.d*.13,j%2?'#a8774c':'#b88957');
    box(d.x+d.w*.25,d.y0+d.h*.7,d.z,22,d.h*1.4,22,'#62432d',.35);
   }else if(d.kind==='shoreShelter'){
    for(const sx of [-1,1])for(const sz of [-1,1])box(d.x+sx*d.w*.45,d.y0+d.h*.45,d.z+sz*d.d*.45,15,d.h*.9,15,'#675038');
    box(d.x,d.y0+d.h,d.z,d.w,12,d.d,'#b4aa85');
   }
  }
  for(const r of w.rooms)if(r.y<220)for(let i=0;i<9;i++){
   const a=i/9*Math.PI*2,x=r.x+Math.cos(a)*(r.w*.5+18),z=r.z+Math.sin(a)*(r.d*.5+18);
   rock(x,r.y-55,z,40+i%3*12,35,40+i%4*8,i%2?'#607575':'#778679');
  }
  // Otto's small workbench, tools, timber stock and mooring posts.
  box(300,82,-320,160,12,70,'#966b43');for(const x of [235,365])for(const z of [-345,-295])box(x,57,z,12,48,12,'#514132');
  box(270,96,-320,8,20,38,'#b9a581');box(272,108,-320,30,12,17,'#63716e');
  for(let i=0;i<4;i++)box(345,39+i*12,-520,180,10,25,'#ad7c4b',.04);
  for(const z of [-340,-50]){box(-420,45,z,20,90,20,'#584334');box(-420,94,z,35,10,35,'#9a8b65');}
  // Weathered beach grass, strand lines and scattered timber avoid repeated buildings.
  for(let i=0;i<75;i++){const x=(i*149%730)-365,z=420-(i*213%2800);box(x,34,z,4,8,16,i%3?'#7a866b':'#b4ac84',.2);}
  for(let row=0;row<3;row++){
   const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle='#263e44';ctx.fillRect(0,0,256,64);ctx.fillStyle='#eee0b7';ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText(['ANCHOR','WHEEL','SAIL'][row],128,43);
   const texture=new T.CanvasTexture(canvas),material=new T.SpriteMaterial({map:texture,depthTest:true});materials.push(material);const label=new T.Sprite(material);label.position.set(-2350+row*205,365,-3300);label.scale.set(130,32,1);group.add(label);group.userData.textures=group.userData.textures||[];group.userData.textures.push(texture);
  }
  boat=createBoat();boat.root.scale.setScalar(32);boat.root.position.set(-250,30,-180);group.add(boat.root);
 }
 let triangles=0,instances=0;const geometry=new T.BoxGeometry(1,1,1),rockGeometry=new T.DodecahedronGeometry(1,0);geometries.push(geometry,rockGeometry);
 for(const [key,list]of bins){const isRock=key.startsWith('rock:'),color=isRock?key.slice(5):key,geo=isRock?rockGeometry:geometry;const material=new T.MeshStandardMaterial({color,roughness:.94,flatShading:true});materials.push(material);const mesh=new T.InstancedMesh(geo,material,list.length);
  list.forEach(([x,y,z,sx,sy,sz,rz],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,0,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.computeBoundingSphere();group.add(mesh);triangles+=list.length*(isRock?36:12);instances+=list.length;
 }
 window.__DEEP_ART_ACTIVE=true;window.__DEEP_ART_LOOK={body:'#65756d',hazard:['#286a72','#629799'],sky:[.35,.48,.52],sunGlow:[.09,.09,.05]};
 active={group,boat,crossing};group.userData.dispose=()=>{scene.fog=oldFog;boat?.dispose();crossing?.dispose();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of group.userData.textures||[])t.dispose();if(active?.group===group)active=null;window.__DEEP_ART_ACTIVE=false;window.__DEEP_ART_LOOK=null;};
 return {group,counts:{name:'Storm Coast',artObstacles:true,floorTiles:instances,totalTriangles:triangles,triangles,instances}};
}
export function updateStorm(w){if(!active||!w.shipScene)return;const g=window.__BF3?.G;if(!g)return;
 if(active.boat){const [rudderInstalled,sailInstalled,ropeInstalled]=g.shore?.parts||[];active.boat.update(g.time,0,{rudderInstalled,sailInstalled,ropeInstalled,underway:false});}
 if(active.crossing&&g.voyage){active.crossing.sync(g.voyage,g.voyage.elapsed);active.crossing.root.position.x=-g.voyage.x*64;}
}
