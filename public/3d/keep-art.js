import {buildKeepJourneyArt} from './keep-journey-art.js?v=2195';
import {craftReplacesDeco} from './campaign-craft-scene.js?v=2187a';
import {upgradeCampaignKit} from './campaign-craft-kit.js?v=2187a';
import {campaignMaterial} from './campaign-materials.js?v=2187a';
import {claimSurface} from './surface-regions.js?v=1972';
/* Ruined Keep: authored fortress scenery fitted to the existing game geometry. */
import * as THREE from './three.module.js';
import {GLTFLoader} from './jsm/loaders/GLTFLoader.js';
const kit=new Map(),dummy=new THREE.Object3D(),CHUNK=400;
let pending,failed=false,active=null;
const hash=(x,z)=>{const v=Math.sin(x*12.9898+z*78.233)*43758.5453;return v-Math.floor(v)};
const palette=['#65665c','#6b6b5f','#62665d','#716e60','#60645b'];
export const wantsKeep=w=>!failed&&w.zone==='keep'&&!w.hub&&!w.trial&&!w.arena&&!w.bonus&&new URLSearchParams(location.search).get('keepart')!=='0';
export const keepReady=()=>kit.size===9;
export function loadKeep(){
  if(pending)return pending;
  pending=new Promise(resolve=>new GLTFLoader().load('./keep-assets/keep-kit.glb',g=>{
    try{g.scene.updateMatrixWorld(true);g.scene.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);const co=geo.attributes.color,mean=new THREE.Color(0,0,0);for(let i=0;i<co.count;i++){mean.r+=co.getX(i);mean.g+=co.getY(i);mean.b+=co.getZ(i)}mean.multiplyScalar(1/co.count);kit.set(o.name,{geo,mean,tri:(geo.index?.count||geo.attributes.position.count)/3});});if(!keepReady())throw Error('Incomplete Keep kit');upgradeCampaignKit(kit,'keep');}
    catch(e){failed=true;console.warn('[keep-art]',e)}resolve();
  },undefined,e=>{failed=true;console.warn('[keep-art] Original scenery fallback',e);resolve()}));return pending;
}
const material=campaignMaterial('masonry',{vertexColors:true});
const floorMaterial=campaignMaterial('flagstone',{vertexColors:true});
const woodMaterial=campaignMaterial('wood',{vertexColors:true}),metalMaterial=campaignMaterial('metal',{vertexColors:true}),rockMaterial=campaignMaterial('stone',{vertexColors:true});
const bannerMaterial=campaignMaterial('cloth',{vertexColors:true,side:THREE.DoubleSide});
function buildLiftWinch(root){
  const owned=new Set(),wood=new THREE.MeshStandardMaterial({color:'#665342',roughness:.86}),iron=new THREE.MeshStandardMaterial({color:'#52636a',metalness:.45,roughness:.56}),brass=new THREE.MeshStandardMaterial({color:'#d6ae69',metalness:.68,roughness:.35}),ivory=new THREE.MeshStandardMaterial({color:'#f2dda4',metalness:.18,roughness:.42});
  const mat=[wood,iron,brass,ivory],deck=new THREE.Group();deck.name='Moving prisoner lift winch';deck.position.set(0,180,-2500);root.add(deck);
  const add=(parent,geometry,m,x=0,y=0,z=0)=>{owned.add(geometry);const mesh=new THREE.Mesh(geometry,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
  const torus=(radius,tube,y,m)=>{const ring=add(deck,new THREE.TorusGeometry(radius,tube,8,56),m,0,y,0);ring.rotation.x=Math.PI/2;};
  torus(88,3.4,8,brass);torus(59,2.2,5,iron);torus(37,3,8,brass);
  add(deck,new THREE.CylinderGeometry(32,35,58,20),wood,0,32,0);
  for(const y of [9,31,55]){const band=add(deck,new THREE.TorusGeometry(33,3,8,24),brass,0,y,0);band.rotation.x=Math.PI/2;}
  add(deck,new THREE.CylinderGeometry(14,16,14,16),iron,0,65,0);
  add(deck,new THREE.CylinderGeometry(8,11,6,16),ivory,0,75,0);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;add(deck,new THREE.BoxGeometry(7,9,12),iron,Math.cos(a)*35,14,Math.sin(a)*35).rotation.y=-a;}
  const arm=new THREE.Group();deck.add(arm);add(arm,new THREE.BoxGeometry(83,9,11),brass,44,59,0);add(arm,new THREE.CylinderGeometry(6,6,47,12),wood,88,79,0);add(arm,new THREE.SphereGeometry(9,12,8),ivory,88,105,0);
  const marker=new THREE.InstancedMesh(new THREE.BoxGeometry(9,3,15),new THREE.MeshBasicMaterial({color:'#ffffff'}),24);owned.add(marker.geometry);mat.push(marker.material);deck.add(marker);
  const dot=new THREE.Object3D();for(let i=0;i<24;i++){const a=i*Math.PI/12;dot.position.set(Math.cos(a)*88,10,Math.sin(a)*88);dot.rotation.set(0,-a,0);dot.updateMatrix();marker.setMatrixAt(i,dot.matrix);}marker.instanceMatrix.needsUpdate=true;
  const weight=new THREE.Group();weight.name='Opposing counterweight';root.add(weight);
  add(weight,new THREE.BoxGeometry(64,76,56),iron);for(const dx of [-24,24]){add(weight,new THREE.BoxGeometry(7,79,59),brass,dx,0,0);for(const dz of [-23,23])for(const dy of [-28,28])add(weight,new THREE.SphereGeometry(3.2,8,6),ivory,dx,dy,dz);}
  for(const dy of [-32,32])add(weight,new THREE.BoxGeometry(67,7,60),wood,0,dy,0);
  const hook=add(weight,new THREE.TorusGeometry(13,3.5,8,16),brass,0,49,0);hook.rotation.x=Math.PI/2;
  const colors={lit:new THREE.Color('#aee9c6'),dark:new THREE.Color('#72685a')};
  return {deck,arm,weight,marker,colors,lastLit:-1,dispose(){deck.removeFromParent();weight.removeFromParent();for(const g of owned)g.dispose();for(const m of mat)m.dispose();}};
}
function buildLowerPresses(root){
  const geometry=new Set(),materials=[],iron=new THREE.MeshStandardMaterial({color:'#52646b',metalness:.55,roughness:.55}),dark=new THREE.MeshStandardMaterial({color:'#303b42',metalness:.38,roughness:.7}),brass=new THREE.MeshStandardMaterial({color:'#d6a95a',metalness:.58,roughness:.42}),stripe=new THREE.MeshStandardMaterial({color:'#e09b50',metalness:.28,roughness:.58});materials.push(iron,dark,brass,stripe);
  const add=(parent,geo,mat,x=0,y=0,z=0)=>{geometry.add(geo);const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const stages=[];
  for(const z of [-3120,-2990,-2860]){
    const group=new THREE.Group();group.position.z=z;group.name='Lower works counterweight press';root.add(group);
    add(group,new THREE.BoxGeometry(542,5,76),dark,0,2.5,0);
    for(const x of [-274,274]){
      add(group,new THREE.BoxGeometry(15,160,70),iron,x,80,0);
      for(const y of [18,75,132])add(group,new THREE.BoxGeometry(20,7,76),brass,x,y,0);
    }
    add(group,new THREE.BoxGeometry(556,16,85),dark,0,165,0);
    for(let i=-4;i<=4;i++)add(group,new THREE.BoxGeometry(6,8,83),brass,i*55,174,0);
    const ram=add(group,new THREE.BoxGeometry(480,1,54),iron),ribs=[];
    for(const x of [-226,-112,0,112,226])ribs.push(add(group,new THREE.BoxGeometry(8,1,6),brass,x,0,-30));
    for(const x of [-168,-56,56,168])add(group,new THREE.BoxGeometry(56,9,6),stripe,x,156,-35);
    const plate=new THREE.Group();group.add(plate);add(plate,new THREE.BoxGeometry(530,28,62),iron,0,14,0);
    add(plate,new THREE.BoxGeometry(516,7,66),brass,0,5,0);
    for(let i=-4;i<=4;i++){add(plate,new THREE.BoxGeometry(24,5,67),i%2?dark:stripe,i*55,29,0);for(const dz of [-26,26])add(plate,new THREE.SphereGeometry(3.1,6,6),brass,i*55,16,dz);}
    const lamps=[];for(const x of [-245,245]){
      add(group,new THREE.BoxGeometry(32,27,14),dark,x,119,-47);
      const lampMaterial=new THREE.MeshStandardMaterial({color:'#85a3a7',emissive:'#1f3b43',emissiveIntensity:.9});materials.push(lampMaterial);
      add(group,new THREE.BoxGeometry(19,14,5),lampMaterial,x,119,-57);lamps.push(lampMaterial);
    }
    add(group,new THREE.BoxGeometry(220,12,6),lamps[0],0,119,-57);
    stages.push({group,plate,ram,ribs,lamps});
  }
  const brake=new THREE.Group();brake.name='Lower works emergency brake';brake.position.set(-205,0,-2760);root.add(brake);
  add(brake,new THREE.BoxGeometry(58,82,48),iron,0,41,0);add(brake,new THREE.BoxGeometry(66,10,56),brass,0,86,0);
  const handle=new THREE.Group();handle.position.set(0,94,0);brake.add(handle);add(handle,new THREE.BoxGeometry(9,54,9),brass,0,26,0);add(handle,new THREE.SphereGeometry(10,10,8),stripe,0,54,0);
  const brakeLamp=new THREE.MeshStandardMaterial({color:'#d79861',emissive:'#6e321b',emissiveIntensity:.8});materials.push(brakeLamp);add(brake,new THREE.BoxGeometry(27,13,6),brakeLamp,0,73,28);
  return {stages,handle,brakeLamp,dispose(){for(const s of stages)s.group.removeFromParent();brake.removeFromParent();for(const g of geometry)g.dispose();for(const m of materials)m.dispose();}};
}
function subtract(p,o){const a=Math.max(p.a,o.a),b=Math.min(p.b,o.b),c=Math.max(p.c,o.c),d=Math.min(p.d,o.d);if(a>=b||c>=d)return[p];return[{a:p.a,b:a,c:p.c,d:p.d},{a:b,b:p.b,c:p.c,d:p.d},{a,b,c:p.c,d:c},{a,b,c:d,d:p.d}].filter(q=>q.b-q.a>.05&&q.d-q.c>.05)}
export function buildKeep(scene,w){
  const root=new THREE.Group();root.name='Ruined Keep · The Fallen Standard';
  const bins=new Map(),obstacles=new WeakSet(),walls=new WeakSet(),caps=new Map(),lamps=[],structures=[],bodies=new Set(),occluders=new Map();let target=null,source=null,floors=0;
  const under=w.area===1||w.side||w.keepScene==='fallen';
  function add(name,x,y,z,sx=1,sy=sx,sz=sx,color=null,rot=0,finish=null){const cell=target||Math.floor(x/CHUNK)+','+Math.floor(z/CHUNK),key=cell+'|'+name+'|'+(finish||'');if(!bins.has(key))bins.set(key,{cell,name,finish,list:[]});bins.get(key).list.push({x,y,z,sx,sy,sz,color,rot,source});}
  const block=(x,y,z,ww,h,d,c,finish='masonry')=>add(Math.min(ww,h,d)<=3?'timber':'stone',x,y,z,ww,h,d,c,0,finish);
  function cap(o,top,wood){
    const key=Math.round(top*10),laid=caps.get(key)||[];caps.set(key,laid);let pieces=[{a:o.x-o.w/2,b:o.x+o.w/2,c:o.z-o.d/2,d:o.z+o.d/2}];
    for(const old of laid)pieces=pieces.flatMap(p=>subtract(p,old));
    for(const p of pieces){const nx=Math.ceil((p.b-p.a)/(w.geography?130:52)),nz=Math.ceil((p.d-p.c)/(w.geography?120:44)),dx=(p.b-p.a)/nx,dz=(p.d-p.c)/nz;
      for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){const x=p.a+(ix+.5)*dx,z=p.c+(iz+.5)*dz;add('timber',x,top+.6,z,Math.max(.1,dx-.65),1.4,Math.max(.1,dz-.65),wood?'#846c48':palette[Math.floor(hash(x,z)*5)],0,wood?'wood':'flagstone');floors++;}laid.push(p);
    }
  }
  const surfaces=new Map();
  function surface(o,base,top,wood=false,facade=true){
    if(o.terrain||o.caveWall||o.kind==='col')return rawSurface(o,base,top,wood,facade);
    for(const part of claimSurface(surfaces,{...o,w:o.w||20,d:o.d||o.w||20},w.keepScene?(o.prisonLayer||'upper'):base+':'+top))rawSurface(part,base,top,wood,facade);
  }
  function rawSurface(o,base,top,wood=false,facade=true){
    const ww=o.w||20,dd=o.d||ww,h=Math.max(1,top-base),key=[o.x,o.z,ww,dd,base,top].join(',');if(bodies.has(key))return;bodies.add(key);
    if(o.water){add('stone',o.x,-5,o.z,ww,10,dd,'#263f42');for(let i=0;i<Math.floor(dd/110);i++)block(o.x,.8,o.z-dd/2+i*110,ww*.7,.6,2,'#3d5d60');return;}
    add(wood?'timber':'stone',o.x,base+(h-.4)/2,o.z,Math.max(1,ww-.6),Math.max(.5,h-.4),Math.max(1,dd-.6),wood?'#493a28':'#444b45');cap({...o,w:ww,d:dd},top,wood);
    if(h<35||!facade)return;
    if((o.geography||o.geographyFoundation)&&!wood){block(o.x,top-2,o.z,ww,4,dd,'#807967','stone');return;}const rows=Math.min(10,Math.ceil(h/30)),rh=h/rows;
    for(let row=0;row<rows;row++)for(const side of [-1,1])for(const axis of [0,1]){
      const len=axis?dd:ww,cols=Math.max(1,Math.ceil(len/55)),bw=len/cols;
      for(let k=0;k<cols;k++){const u=-len/2+(k+.5)*bw;block(o.x+(axis?side*(ww/2-.7):u),base+(row+.5)*rh,o.z+(axis?u:side*(dd/2-.7)),axis?1.8:bw-1.4,rh-1.2,axis?bw-1.4:1.8,wood?'#635037':palette[Math.floor(hash(k+row*7+o.x,side+o.z)*5)],wood?'wood':'masonry');}
    }
    block(o.x,top-2,o.z,ww,4,dd,wood?'#6c573c':'#807967',wood?'wood':'stone');
  }
  function brazier(x,y,z,s=20){add('brazier',x,y,z,s);lamps.push(new THREE.Vector3(x,y+s*2.05,z));}
  if(w.keepScene){const terrain=[...(w.segments||[]).filter(s=>!s.nofloor).map(s=>({o:s,base:-25,top:0})),...(w.obstacles||[]).filter(o=>o.kind==='plat').map(o=>({o,base:o.y0??-25,top:o.h||0}))].sort((a,b)=>b.top-a.top);for(const t of terrain){source=t.o.kind==='plat'?t.o:null;surface(t.o,t.base,t.top,!!t.o.bridge);if(t.o.kind==='plat')obstacles.add(t.o);}source=null;}else for(const s of w.segments||[])if(!s.nofloor)surface(s,-25,0,!!s.bridge,false);
  const solids=(w.obstacles||[]).filter(o=>!o.autoCol&&!o.invisible&&!o.treeCol&&!o.pillarCol);
  for(const o of solids){if(w.keepScene&&o.kind==='plat')continue;source=w.keepScene?o:null;const base=o.y0??(o.kind==='plat'?Math.min(0,(o.h||0)-16):0),top=o.h||1;
    const deco=(w.deco||[]).find(d=>d.x===o.x&&d.z===o.z&&d.w===o.w&&(d.d||d.w)===o.d&&d.c?.startsWith('#4'));
    const crate=deco&&['#49392e','#3b2d24'].includes(deco.c)&&o.w>80;
    if(o.kind==='col'&&top>90&&o.w<180&&o.d<180){target='s'+structures.length;structures.push({cell:target,o});}
    if(crate){add('crate',o.x,base,o.z,o.w,top-base,o.d);cap(o,top,true);}
    else surface(o,base,top,!!o.bridge);
    obstacles.add(o);target=null;
    // Existing column silhouettes receive inset arrow slits without occupying extra floor.
    if(o.kind==='col'&&o.w>=70&&o.d>=60&&top>100){for(const side of [-1,1]){block(o.x,base+(top-base)*.61,o.z+side*(o.d/2+.35),12,28,1.2,'#151f1d');block(o.x,base+(top-base)*.58,o.z+side*(o.d/2+1),3,16,.5,'#bb7939');}}
  }
  source=null;
  for(const o of w.walls||[]){if(o.invisible)continue;if(w.delve){target='s'+structures.length;structures.push({cell:target,o});}surface(o,o.y0||0,(o.y0||0)+(o.h||1));walls.add(o);target=null;}
  for(const d of w.deco||[]){if(craftReplacesDeco(d,w))continue;source=w.keepScene?{...d,h:(d.y0||0)+(d.h||0)}:null;const ww=d.w||20,dd=d.d||ww,hh=d.h||20,y=d.y0||0,r=hash(d.x,d.z);
    if(solids.some(o=>Math.abs(o.x-d.x)<.01&&Math.abs(o.z-d.z)<.01&&o.w===ww&&o.d===dd&&Math.abs(o.h-y-hh)<2))continue;
    if(d.theme==='ruins'||d.theme==='dungeon'){
      if(hh>110&&ww>45){add('tower',d.x,y,d.z,ww,hh,dd);if(r<.42)add('banner',d.x+ww*.21,y+hh*.34,d.z+dd*.5+2,ww*.42,hh*.36,12,null,.04);}
      else if(hh>50)add('stone',d.x,y+hh/2,d.z,ww,hh,dd,'#565a50');
      else add('rubble',d.x,y,d.z,ww,Math.min(hh,24),dd);
    }else if(d.kind==='lantern'){brazier(d.x,y,d.z,18);}
    else if(d.kind==='fence'){add('grille',d.x,y,d.z,ww,hh,10,null,d.rot||0);}
    else if(d.kind==='column'){surface({...d,d:dd},y,y+hh);}
    else if(d.c==='#702c45'){const owner=solids.find(o=>o.kind==='col'&&o.x===d.x&&o.z===d.z);add('banner',d.x,Math.max(0,(owner?.h||y)-hh-4),d.z+(owner?.d||50)/2+3,Math.max(38,ww),hh,12);}
    else if(ww<12&&dd<12&&hh>50)add('timber',d.x,y+hh/2,d.z,ww,hh,dd,'#292f2d');
    else if(hh<4&&ww>60)continue;
    else if(d.kind==='grave'||(hh<35&&ww>55&&dd>30)){surface({...d,d:dd},y,y+hh);block(d.x,y+hh+1,d.z,ww*.65,1.5,3,'#988468');}
    else block(d.x,y+hh/2,d.z,ww,hh,dd,d.c==='#292d36'?'#424942':palette[Math.floor(r*5)]);
  }
  source=null;
  // Span the actual two parallel curtain walls. There are no new posts in the passage.
  if(!w.side&&w.area===0&&(w.walls||[]).length>=2){const a=w.walls.find(o=>o.x===-730),b=w.walls.find(o=>o.x===20);if(a&&b){const x=(a.x+b.x)/2,z=-575;
    add('arch',x,198,z,(b.x-a.x)/2,170,42);for(const wall of [a,b]){add('banner',wall.x+(wall.x<x?35:-35),94,z+20,50,110,10);brazier(wall.x+(wall.x<x?0:0),220,z,18);}
  }}
  // Existing room corners are good light landmarks; fixture bases stay inside platform edges.
  for(const r of w.rooms||[]){if(!r.name&&!w.delve)continue;const y=r.y||0;for(const side of [-1,1]){const x=r.x+side*(r.w/2-18),z=r.z-r.d/2+20;
    if(w.delve){
      // Mount the dungeon lanterns on existing masonry, above the walkable floor.
      const wall=(w.walls||[]).find(o=>!o.invisible&&Math.abs(x-o.x)<o.w/2+22&&Math.abs(z-o.z)<o.d/2+22);if(!wall)continue;
      target=structures.find(s=>s.o===wall)?.cell||null;const top=(wall.y0||0)+wall.h;
      brazier(Math.max(wall.x-wall.w/2,Math.min(x,wall.x+wall.w/2)),top,Math.max(wall.z-wall.d/2,Math.min(z,wall.z+wall.d/2)),12);
      add('banner',x,top-58,z,24,48,3,null,side*.04);target=null;
    }else brazier(x,y,z,under?17:20);
  }}
  if(w.keepScene==='broken-walls'){
    // A ruined garrison: banners, battered defenses and domestic traces around clear routes.
    for(const o of solids)if(o.kind==='col'&&Math.max(o.w,o.d)>280&&o.h>150){
      const alongX=o.w>o.d,len=alongX?o.w:o.d,n=Math.floor(len/70);
      for(let i=0;i<n;i++){const d=-len/2+35+i*70;block(o.x+(alongX?d:0),o.h+13,o.z+(alongX?0:d),alongX?34:o.w,26,alongX?o.d:34,'#797767');}
      if(alongX)add('banner',o.x,o.h-100,o.z+o.d/2+3,50,90,8);
    }
    for(const [x,z,y]of [[-540,420,0],[540,420,0],[-930,-2640,0],[930,-2640,0],[-1860,-3750,80],[420,-4360,0]]){
      add('tower',x,y-12,z,115,280,115);add('banner',x,y+95,z+60,45,105,8);brazier(x,y+280,z,17);
    }
    // Supplies and bedding explain why the freed group waits under the outer wall.
    for(const [x,z]of [[-380,-1500],[-465,-1500],[-350,-3030]]){add('crate',x,0,z,52,40,38);block(x+42,4,z+10,28,8,62,'#6e6e54','wood');}
    // The seized workshop has an open roof for camera visibility, with a distinct timber frame.
    for(const x of [1160,1710]){for(const z of [-2740,-3190])block(x,75,z,18,150,18,'#59462e','wood');block(x,142,-2965,22,18,470,'#816a47','wood');}
    block(1435,155,-3190,570,22,24,'#816a47','wood');
    for(const x of [1260,1630]){block(x,32,-3100,95,12,50,'#796448','wood');for(const dx of [-36,36])block(x+dx,14,-3100,9,28,38,'#50412d','wood');add('crate',x,0,-3180,54,46,42);}
    // Broken bell frame crowns the climb. The shard is tucked behind its stone screen.
    for(const x of [-1810,-1590]){block(x,396,-1680,24,152,28,'#7c7868');block(x,474,-1620,28,12,145,'#978d72');}
    block(-1700,479,-1680,244,18,34,'#9b8e70');add('brazier',-1700,401,-1680,27);
    // A shield and empty weapon stands make the optional chamber challenge readable.
    for(const [x,z]of [[-1800,-3710],[-1180,-3710]]){block(x,115,z,16,70,18,'#594d37','wood');block(x,143,z,80,12,18,'#8a7751','wood');add('banner',x,115,z+12,33,50,5);}
    for(const [x,z,y]of [[-525,-975,0],[570,-990,0],[-700,-2280,0],[700,-2280,0],[-1780,-1740,0],[1660,-3090,0],[-1720,-3900,80]]){
      for(let i=0;i<4;i++)add('rubble',x+i*18,y,z+(i%2)*22,35,15+i*3,28);
    }
  }
  if(w.keepScene==='dungeons'){
    // Open tops let the chase camera read an enclosed prison without looking through roofs.
    for(const [x,z,y]of [[-720,-950,180],[800,-1020,180],[-1100,-2130,180]]){
      for(const dx of [-170,170]){block(x+dx,y+90,z-140,24,180,24,'#6e6b5e');block(x+dx,y+180,z,28,16,310,'#827967');}
      block(x,y+186,z-140,370,24,32,'#8d846f');
      for(let i=0;i<5;i++)block(x-120+i*60,y+55,z-135,8,110,8,'#4f5654');
      for(const dx of [-95,95]){block(x+dx,y+8,z+60,65,16,125,'#594936','wood');block(x+dx,y+18,z+70,55,5,100,'#80765a','wood');}
    }
    for(const x of [-205,205]){for(const z of [-2690,-2310])block(x,335,z,34,350,34,'#625f52');block(x,512,-2500,40,18,420,'#96866a');}
    for(const x of [-330,330]){add('banner',x,400,-3490,45,100,8);brazier(x,360,-3550,19);}
    for(const [x,z,y]of [[-1380,-1810,180],[-380,-3050,180],[980,-3340,190],[300,-2950,0],[1470,-3190,40]]){add('crate',x,y,z,58,40,42);add('rubble',x+45,y,z-45,60,22,45);}
    // The drain has brick banks and low arches; safe stones remain brighter than water.
    for(const z of [-3410,-3880,-4370,-4840])for(const x of [1225,2550]){block(x,80,z,35,160,110,'#52594e');block(x+(x<1800?55:-55),155,z,110,22,80,'#77745f');}
  }
  if(w.keepScene==='fallen'){
    // Recessed cells and high wall arches surround a clear, flat duel floor.
    for(const x of [-220,220])for(const z of [-230,220]){block(x,9,z,112,18,112,'#9b927a');block(x,242,z,112,12,112,'#a99b80');for(const dz of [-42,42])block(x,123,z+dz,8,218,5,'#a89b7c');}
    for(const x of [-510,510])for(const z of [-570,0,570]){brazier(x,0,z,18);add('banner',x,175,z,32,94,6);}
    for(const z of [-640,640]){for(const x of [-460,460])block(x,250,z,35,45,40,'#a49677');block(0,278,z,950,16,40,'#827764');}
    for(const x of [-665,665]){add('crate',x,0,-125,65,45,50);for(let i=0;i<3;i++)block(x-35+i*35,18,125,24,36,12,'#a4926e');}
    for(const x of [-90,90])block(x,1.2,0,5,1.4,1330,'#8f846e');
  }
  const groups=new Map();let triangles=0,instances=0;
  for(const {cell,name,finish,list} of bins.values()){
    if(!groups.has(cell)){const g=new THREE.Group();g.userData.cell=cell;groups.set(cell,g);root.add(g)}const rec=kit.get(name),m=new THREE.InstancedMesh(rec.geo,finish==='flagstone'?floorMaterial:finish==='wood'?woodMaterial:finish==='stone'?rockMaterial:finish==='masonry'?material:name==='banner'?bannerMaterial:['timber','crate'].includes(name)?woodMaterial:['grille','brazier'].includes(name)?metalMaterial:name==='rubble'?rockMaterial:material,list.length),col=new THREE.Color();m.name='Keep '+name;
    for(let i=0;i<list.length;i++){const d=list[i];dummy.position.set(d.x,d.y,d.z);dummy.scale.set(d.sx,d.sy,d.sz);dummy.rotation.set(0,d.rot,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);col.set(d.color||'#ffffff');if(d.color){col.r/=Math.max(.015,rec.mean.r);col.g/=Math.max(.015,rec.mean.g);col.b/=Math.max(.015,rec.mean.b)}m.setColorAt(i,col);if(d.source){if(!occluders.has(d.source))occluders.set(d.source,{o:d.source,parts:[],hidden:false});occluders.get(d.source).parts.push({mesh:m,index:i,matrix:dummy.matrix.clone()});}}
    m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;m.computeBoundingSphere();m.castShadow=name!=='banner'&&name!=='timber';m.receiveShadow=true;m.userData.tri=list.length*rec.tri;groups.get(cell).add(m);triangles+=m.userData.tri;instances+=list.length;
  }
  for(const s of structures)if(groups.has(s.cell))groups.get(s.cell).userData.obstacle=s.o;
  scene.traverse(o=>{if(o.isLight){if(o.userData._w3dOrig==null)o.userData._w3dOrig=o.intensity;o.intensity=o.userData._w3dOrig*(o.isAmbientLight?.72:.15)}});
  const oldFog=scene.fog;scene.fog=new THREE.Fog(under?'#303d3e':'#82969f',650,2300);
  root.add(new THREE.HemisphereLight('#bedce3','#756047',under?.5:.65));
  const sun=new THREE.DirectionalLight('#ffe1b2',under?1.45:2);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-780,right:780,top:780,bottom:-780,near:1,far:3000});sun.shadow.camera.updateProjectionMatrix();sun.shadow.normalBias=1.2;sun.shadow.bias=-.0002;root.add(sun,sun.target);
  const lights=[0,1,2].map(()=>{const l=new THREE.PointLight('#ffad55',900,180,1.6);root.add(l);return l});
  const counts={keepArt:true,artObstacles:true,floorTiles:floors,totalTriangles:triangles,instances,chunks:groups.size,visibleTriangles:0,visibleDrawCalls:0};
  const winch=w.keepScene==='dungeons'?buildLiftWinch(root):null,presses=w.keepScene==='dungeons'?buildLowerPresses(root):null;
  const journey=buildKeepJourneyArt(w);if(journey)root.add(journey);
  active={root,groups,obstacles,walls,sun,counts,lamps,lights,occluders,winch,presses,journey,zero:new THREE.Matrix4().makeScale(0,0,0)};window.__KEEP_ART_ACTIVE=true;
  root.userData.dispose=()=>{scene.fog=oldFog;sun.shadow.map?.dispose();winch?.dispose();presses?.dispose();journey?.userData.dispose();if(active?.root===root)active=null;window.__KEEP_ART_ACTIVE=false;};return {group:root,counts};
}
export function updateKeep(w){
  if(!active||!w.p)return;active.journey?.userData.update();const a=active,p=w.p,low=window.__BF_META?.().quality==='low',range=low?750:1200;let tris=0,calls=0;
  if(a.winch&&w.prison){const lift=w.movers.find(m=>m.prisonLift),k=w.prison.winch,rig=a.winch;if(lift){rig.deck.position.y=lift.h;rig.weight.position.set(243,435-(lift.h-180),-2500);}rig.arm.rotation.y=-(k.angle||0);const lit=Math.floor((k.progress||0)*24+.0001);if(lit!==rig.lastLit){for(let i=0;i<24;i++)rig.marker.setColorAt(i,i<lit?rig.colors.lit:rig.colors.dark);rig.marker.instanceColor.needsUpdate=true;rig.lastLit=lit;}}
  if(a.presses&&w.prison){const stopped=!!w.storyState?.flags?.['kd.deep.open'];for(const [i,rig]of a.presses.stages.entries()){
    const state=w.prison.presses[i],bottom=state?.bottom??134;
    // The chase camera sits behind the player. Once a press is behind them,
    // keep its overhead plate from filling the lens while it follows through.
    rig.group.visible=!(p.y<100&&p.z>state.z+40&&(w.eye?.z??p.z)<state.z&&Math.abs(p.x)<330);
    rig.plate.position.y=bottom;
    const ramHeight=Math.max(1,160-bottom-28),ramCenter=bottom+28+ramHeight/2;
    rig.ram.scale.y=ramHeight;rig.ram.position.y=ramCenter;
    for(const rib of rig.ribs){rib.scale.y=ramHeight;rib.position.y=ramCenter;}
    const color=stopped?'#9fe6b6':state?.warning?'#ffd15a':state?.down?'#ef7660':'#85a3a7';for(const lamp of rig.lamps){lamp.color.set(color);lamp.emissive.set(color);}
  }a.presses.handle.rotation.x=stopped?-.8:.4;a.presses.brakeLamp.color.set(stopped?'#9fe6b6':'#d79861');a.presses.brakeLamp.emissive.set(stopped?'#397954':'#6e321b');}
  for(const [cell,g] of a.groups){const o=g.userData.obstacle,[cx,cz]=o?[o.x,o.z]:cell.split(',').map(n=>(+n+.5)*CHUNK);g.visible=Math.hypot(cx-p.x,cz-p.z)<range+CHUNK*.72;
    if(g.visible&&o&&w.eye&&p.y<o.h-5&&window.__BF_META?.().camMode!=='fps')for(let t=.08;t<.95;t+=.08){const x=w.eye.x+(p.x-w.eye.x)*t,z=w.eye.z+(p.z-w.eye.z)*t;if(Math.abs(x-o.x)<o.w/2+5&&Math.abs(z-o.z)<o.d/2+5){g.visible=false;break;}}
    if(g.visible)for(const m of g.children){tris+=m.userData.tri;calls++}
  }
  for(const f of a.occluders.values()){
    const o=f.o,top=o.h||0,base=o.y0??Math.min(0,top-18);let hidden=false;
    hidden=window.BFCameraOcclusion.blocks(w,o,base,top,window.__BF_META?.().camMode,6);
    if(hidden!==f.hidden){for(const q of f.parts){q.mesh.setMatrixAt(q.index,hidden?a.zero:q.matrix);q.mesh.instanceMatrix.needsUpdate=true;}f.hidden=hidden;window.__KEEP_SHADOW_DIRTY=true;}
  }
  a.counts.visibleTriangles=tris;a.counts.visibleDrawCalls=calls;
  const near=a.lamps.map(v=>({v,d:(v.x-p.x)**2+(v.y-p.y)**2+(v.z-p.z)**2})).sort((x,y)=>x.d-y.d);a.lights.forEach((l,i)=>{l.visible=!low&&near[i]?.d<300**2;if(l.visible)l.position.copy(near[i].v)});
  const x=Math.round(p.x/250)*250,z=Math.round(p.z/250)*250,key=x+','+z+','+low;if(a.shadow!==key){a.sun.position.set(x-600,1250,z+500);a.sun.target.position.set(x,0,z);a.sun.target.updateMatrixWorld();a.shadow=key;window.__KEEP_SHADOW_DIRTY=true;}
}
window.__keepObstacleDrawn=o=>!!active&&active.obstacles.has(o);
window.__keepWallDrawn=o=>!!active&&active.walls.has(o);
