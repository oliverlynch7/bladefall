import {craftReplacesDeco} from './campaign-craft-scene.js?v=2342';
import {trackCampaignOccluder,updateCampaignOccluders,updateCampaignSun} from './campaign-scene.js?v=2182f';
import * as T from './three.module.js';
import {craftModel} from './campaign-craft-models.js?v=2342';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';
import {campaignMaterial,beveledBoxGeometry} from './campaign-materials.js?v=2187a';
import {claimSurface} from './surface-regions.js?v=1972';
import {createBoat,createCrossingScene} from './ship3d.js';
let active;
export function buildStorm(scene,w){
 scene.traverse(o=>{if(o.isLight){if(o.userData._w3dOrig==null)o.userData._w3dOrig=o.intensity;o.intensity=o.userData._w3dOrig*(o.isAmbientLight?.65:.18);}});
 const occluders=[];const group=new T.Group(),geometries=[],materials=[],bins=new Map(),dummy=new T.Object3D();
 const oldFog=scene.fog;scene.fog=new T.Fog('#66818a',w.shipScene==='voyage'?4000:1100,w.shipScene==='voyage'?16000:3300);
 const sun=new T.DirectionalLight('#ffe1b5',1.9);sun.position.set(-600,1000,300);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-700,right:700,top:700,bottom:-700,near:1,far:3000});sun.shadow.camera.updateProjectionMatrix();sun.shadow.normalBias=1.2;sun.shadow.bias=-.0002;group.add(sun,sun.target);group.add(new T.HemisphereLight('#cbe9ed','#776342',1.2));
 const box=(x,y,z,sx,sy,sz,c,rz=0)=>{const list=bins.get(c)||[];list.push([x,y,z,sx,sy,sz,rz]);bins.set(c,list);};
 const rock=(x,y,z,sx,sy,sz,c)=>box(x,y,z,sx,sy,sz,'rock:'+c,.17);
 let boat,crossing,ballistaRig;
 if(w.shipScene==='voyage'){
  crossing=createCrossingScene(group);crossing.root.scale.setScalar(64);
 }else{
  const ledger=new Map();for(const o of w.obstacles.filter(o=>o.kind==='plat'))for(const p of claimSurface(ledger,o,String(o.h))){
   const depth=p.shoreTimber?32:p.h+150;box(p.x,p.h-depth/2,p.z,p.w,depth,p.d,p.shoreTimber?'#a2784b':'cliff:'+(p.h<60?'#a69770':p.h<180?'#777b6e':'#56686a'));
   if(p.shoreTimber&&p.w>35&&p.d>25)for(let z=p.z-p.d/2+20;z<p.z+p.d/2;z+=45)box(p.x,p.h+.25,z,p.w,.5,2,'#674a32');
  }
  for(const wall of w.walls)box(wall.x,wall.y0+wall.h/2,wall.z,wall.w,wall.h,wall.d,wall.shoreHatch?'#715139':'#405359');
  box(0,-95,-1900,13000,20,14000,'#286a72');
  for(const d of w.deco){if(craftReplacesDeco(d,w))continue;
   if(d.kind==='shoreRock'){
    rock(d.x,d.y0+d.h*.4,d.z,d.w*.7,d.h*.7,d.d*.7,'#43575a');
    rock(d.x+d.w*.1,d.y0+d.h*.8,d.z,d.w*.45,d.h*.35,d.d*.5,'#67746e');
   }else if(d.kind==='shoreWreck'){
    for(const side of [-1,1])for(let j=0;j<7;j++){
     // A deliberate firing port on Rose's Wreck keeps the optional ballista sightline clear.
     if(d.x===-1320&&side===-1&&(j===3||j===4))continue;
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
  if(!craftReplacesDeco({kind:'craft'},w)){box(300,82,-320,160,12,70,'#966b43');for(const x of [235,365])for(const z of [-345,-295])box(x,57,z,12,48,12,'#514132');
  box(270,96,-320,8,20,38,'#b9a581');box(272,108,-320,30,12,17,'#63716e');}
  for(let i=0;i<4;i++)box(345,39+i*12,-520,180,10,25,'#ad7c4b',.04);
  for(const z of [-340,-50]){box(-420,45,z,20,90,20,'#584334');box(-420,94,z,35,10,35,'#9a8b65');}
  // Weathered beach grass, strand lines and scattered timber avoid repeated buildings.
  for(let i=0;i<75;i++){const x=(i*149%730)-365,z=420-(i*213%2800);box(x,34,z,4,8,16,i%3?'#7a866b':'#b4ac84',.2);}
  // Physical sight target and salvage ballista replace the old floating number-code labels.
  const oak=new T.MeshStandardMaterial({color:'#805633',roughness:.88}),edge=new T.MeshStandardMaterial({color:'#b78d55',roughness:.72}),iron=new T.MeshStandardMaterial({color:'#37464c',roughness:.58,metalness:.48}),gold=new T.MeshStandardMaterial({color:'#ffe3a0',emissive:'#e99b3d',emissiveIntensity:1.2,metalness:.25,roughness:.3});materials.push(oak,edge,iron,gold);
  const gbox=new T.BoxGeometry(1,1,1);geometries.push(gbox);
  const part=(x,y,z,sx,sy,sz,mat,ry=0)=>{const m=new T.Mesh(gbox,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.y=ry;group.add(m);return m;};
  if(!craftReplacesDeco({kind:'craft'},w)){part(-1510,160,-3310,190,28,125,oak);for(const z of [-3380,-3240]){
   const wheelGeo=new T.CylinderGeometry(44,44,18,10);geometries.push(wheelGeo);const wheel=new T.Mesh(wheelGeo,oak);wheel.rotation.x=Math.PI/2;wheel.position.set(-1470,172,z);group.add(wheel);
   const hub=new T.Mesh(wheelGeo,edge);hub.rotation.x=Math.PI/2;hub.position.set(-1470,172,z+(z< -3310?9:-9));hub.scale.set(.33,.33,.33);group.add(hub);
  }
  part(-1600,209,-3310,230,24,28,edge);part(-1690,208,-3310,75,14,12,iron);
  for(const sign of [-1,1]){part(-1710,213,-3310+sign*95,30,27,138,oak,sign*.18);part(-1670,220,-3310+sign*150,18,15,22,iron);part(-1500,220,-3310+sign*12,70,12,12,iron);}
  part(-1510,232,-3310,65,20,18,iron);part(-1540,248,-3310,18,35,16,edge);
  }
  const ringGeo=new T.TorusGeometry(54,10,8,24);geometries.push(ringGeo);const ring=new T.Mesh(ringGeo,gold);ring.position.set(-2140,306,-3400);ring.rotation.y=Math.PI/2;group.add(ring);
  part(-2140,235,-3400,22,60,16,iron);part(-2140,369,-3400,94,14,18,edge);
  const cage=new T.Group();for(const x of [-2182,-2098]){const bar=new T.Mesh(gbox,iron);bar.position.set(x,270,-3400);bar.scale.set(12,116,22);cage.add(bar);}const rail=new T.Mesh(gbox,iron);rail.position.set(-2140,326,-3400);rail.scale.set(102,12,22);cage.add(rail);group.add(cage);
  ballistaRig={ring,cage};
  boat=createBoat();boat.root.scale.setScalar(32);boat.root.position.set(-250,30,-180);group.add(boat.root);
 }
 let triangles=0,instances=0;const geometry=beveledBoxGeometry(.012),rockGeometry=new T.DodecahedronGeometry(1,0);const cliffParts=craftModel('cliff','coast',{w:1,h:1,d:1}).map(r=>r.geo.clone()),cliffGeometry=mergeGeometries(cliffParts,false);cliffParts.forEach(g=>g.dispose());cliffGeometry.translate(0,-.5,0);geometries.push(geometry,rockGeometry,cliffGeometry);
 const timberColors=new Set(['#a2784b','#674a32','#715139','#5b4030','#a77549','#a8774c','#b88957','#62432d','#675038','#966b43','#514132','#ad7c4b','#584334']);
 for(const [key,list]of bins){const isRock=key.startsWith('rock:'),isCliff=key.startsWith('cliff:'),color=isRock?key.slice(5):isCliff?key.slice(6):key,geo=isRock?rockGeometry:isCliff?cliffGeometry:geometry,kind=color==='#286a72'?'water':color==='#a69770'?'sand':timberColors.has(color)?'wood':color==='#b4aa85'?'cloth':'stone';const material=campaignMaterial(kind,{color,flatShading:true});materials.push(material);const mesh=new T.InstancedMesh(geo,material,list.length);
  list.forEach(([x,y,z,sx,sy,sz,rz],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,0,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);trackCampaignOccluder(occluders,mesh,i,dummy.matrix);});mesh.computeBoundingSphere();mesh.castShadow=kind!=='water';mesh.receiveShadow=true;group.add(mesh);triangles+=list.length*(geo.index?.count||geo.attributes.position.count)/3;instances+=list.length;
 }
 window.__DEEP_ART_ACTIVE=true;window.__DEEP_ART_LOOK={body:'#65756d',hazard:['#286a72','#629799'],sky:[.35,.48,.52],sunGlow:[.09,.09,.05]};
 active={group,boat,crossing,ballistaRig,sun,occluders};group.userData.dispose=()=>{scene.fog=oldFog;sun.shadow.map?.dispose();boat?.dispose();crossing?.dispose();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of group.userData.textures||[])t.dispose();if(active?.group===group)active=null;window.__DEEP_ART_ACTIVE=false;window.__DEEP_ART_LOOK=null;};
 return {group,counts:{name:'Storm Coast',artObstacles:true,floorTiles:instances,totalTriangles:triangles,triangles,instances}};
}
export function updateStorm(w){if(!active||!w.shipScene)return;const g=window.__BF3?.G;if(!g)return;
 const p=g.p;updateCampaignSun(active,p,-600,1000,300);updateCampaignOccluders(active.occluders,w);
 if(active.ballistaRig){const shot=g.shore?.ballista?.shot,open=!!g.storyState?.flags['sc.code.open']&&(!shot?.hit||performance.now()/1000-shot.at>=.52);active.ballistaRig.ring.visible=!open;active.ballistaRig.cage.position.y+=(open?-85-active.ballistaRig.cage.position.y:-active.ballistaRig.cage.position.y)*.12;}
 if(active.boat){const [rudderInstalled,sailInstalled,ropeInstalled]=g.shore?.parts||[];active.boat.update(g.time,0,{rudderInstalled,sailInstalled,ropeInstalled,underway:false});}
 if(active.crossing&&g.voyage){active.crossing.sync(g.voyage,g.voyage.elapsed);active.crossing.root.position.x=-g.voyage.x*64;}
}
