import {buildBriarTrees,buildBriarDressing} from './briar-trees.js?v=2127';
import * as T from './three.module.js';
// Authored landmarks and workspaces. No scatter algorithm places gameplay props.
export function buildBriarBetaArt(world){
 const s=world.briarBeta,g=new T.Group(),materials=new Map(),geometries=new Map();let count=0;
 const mat=(c)=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.88,metalness:0}));return materials.get(c);};
 const geom=(key,make)=>{if(!geometries.has(key))geometries.set(key,make());return geometries.get(key);};
 const mesh=(geo,c,x,y,z,sx=1,sy=1,sz=1)=>{const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=false;m.receiveShadow=true;g.add(m);count++;return m;};
 const box=(x,y,z,w,h,d,c)=>mesh(geom('box',()=>new T.BoxGeometry(1,1,1)),c,x,y,z,w,h,d);
 const sphere=(x,y,z,w,h,d,c)=>mesh(geom('sphere',()=>new T.IcosahedronGeometry(1,1)),c,x,y,z,w,h,d);
 const cylinder=(x,y,z,r,h,c,rt=r)=>{const key='cyl'+rt/r;return mesh(geom(key,()=>new T.CylinderGeometry(rt/r,1,1,8)),c,x,y,z,r,h,r);};
 const beam=(a,b,r,c)=>{const v=new T.Vector3(...b).sub(new T.Vector3(...a)),m=cylinder((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,r,v.length(),c);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m;};
 function sign(x,y,z,text){const cv=document.createElement('canvas');cv.width=512;cv.height=96;const c=cv.getContext('2d');c.fillStyle='#202b23';c.fillRect(0,0,512,96);c.strokeStyle='#b8ac74';c.lineWidth=5;c.strokeRect(3,3,506,90);c.fillStyle='#fff1c8';c.font='bold 32px sans-serif';c.textAlign='center';c.fillText(text,256,60);const tex=new T.CanvasTexture(cv),m=new T.SpriteMaterial({map:tex,depthTest:true});const sp=new T.Sprite(m);sp.position.set(x,y,z);sp.scale.set(125,24,1);g.add(sp);g.userData.labels.push({tex,m,sp,x,z});}
 g.userData.labels=[];
 // Clip the shared heightfield's triangles to each authored land footprint.
 const positions=[],colors=[],uvs=[],road=s.road||[],ground=new T.Color(s.part?'#435e3d':'#70874d'),dirt=new T.Color(s.part?'#857757':'#b29b6d');
 const clip=(poly,axis,edge,sign)=>{const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a[axis]-edge)*sign,db=(b[axis]-edge)*sign;if(da>=0)out.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return out;};
 const roadDistance=(x,z)=>{let best=Infinity;for(let i=1;i<road.length;i++){const a=road[i-1],b=road[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));best=Math.min(best,Math.hypot(x-a.x-t*dx,z-a.z-t*dz));}for(const p of s.paths){const dx=Math.max(0,Math.abs(x-p.x)-p.w/2),dz=Math.max(0,Math.abs(z-p.z)-p.d/2);best=Math.min(best,Math.hypot(dx,dz));}return best;};
 // Split the union of land rectangles into disjoint cells. Previously each
 // segment drew its own triangles, so overlapping footprints fought for depth.
 const extent=f=>({x0:f.x-f.w/2,x1:f.x+f.w/2,z0:f.z-f.d/2,z1:f.z+f.d/2});
 const floors=world.segments.map(extent),xs=[...new Set(floors.flatMap(f=>[f.x0,f.x1]))].sort((a,b)=>a-b),zs=[...new Set(floors.flatMap(f=>[f.z0,f.z1]))].sort((a,b)=>a-b);
 for(let xi=0;xi<xs.length-1;xi++)for(let zi=0;zi<zs.length-1;zi++){
  const x0=xs[xi],x1=xs[xi+1],z0=zs[zi],z1=zs[zi+1],mx=(x0+x1)/2,mz=(z0+z1)/2;
  if(!floors.some(f=>mx>=f.x0&&mx<=f.x1&&mz>=f.z0&&mz<=f.z1))continue;
  const step=s.terrain.cell;
  for(let x=Math.floor(x0/step)*step;x<x1;x+=step)for(let z=Math.floor(z0/step)*step;z<z1;z+=step)for(let poly of [[[x,z],[x,z+step],[x+step,z]],[[x+step,z+step],[x+step,z],[x,z+step]]]){
   for(const [axis,edge,sign]of [[0,x0,1],[0,x1,-1],[1,z0,1],[1,z1,-1]]){if(!poly.length)break;poly=clip(poly,axis,edge,sign);}
   for(let i=1;i<poly.length-1;i++)for(const [px,pz]of [poly[0],poly[i],poly[i+1]]){
    const y=s.terrain.height(px,pz),track=Math.max(0,Math.min(1,(113-roadDistance(px,pz))/45));
    const variation=(Math.sin(px*.013+pz*.006)*Math.sin(pz*.018-px*.004)+1)*.025;
    const c=ground.clone().multiplyScalar(.96+variation).lerp(dirt,track);
    positions.push(px,y,pz);colors.push(c.r,c.g,c.b);uvs.push(px/320,pz/320);
   }
  }
 }
 const terrainGeo=new T.BufferGeometry();terrainGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));terrainGeo.setAttribute('color',new T.Float32BufferAttribute(colors,3));terrainGeo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));terrainGeo.computeVertexNormals();
 // A small, deterministic tile adds ground grain without a large bitmap or
 // separate coplanar grass planes. Vertex colors still define paths and fields.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#f0f0f0';ctx.fillRect(0,0,128,128);
 let seed=19391;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(let i=0;i<1650;i++){const n=221+Math.floor(rand()*34),px=Math.floor(rand()*128),py=Math.floor(rand()*128),r=1+Math.floor(rand()*3);ctx.fillStyle=`rgb(${n},${n},${n})`;ctx.fillRect(px,py,r,r);}
 const groundTex=new T.CanvasTexture(canvas);groundTex.wrapS=groundTex.wrapT=T.RepeatWrapping;groundTex.colorSpace=T.SRGBColorSpace;groundTex.anisotropy=4;
 const terrainMat=new T.MeshStandardMaterial({map:groundTex,vertexColors:true,roughness:1});materials.set('terrain',terrainMat);const terrainMesh=new T.Mesh(terrainGeo,terrainMat);terrainMesh.receiveShadow=true;g.add(terrainMesh);
 // Paths are now colored into the shared heightfield instead of hovering as
 // flat slabs across rolling ground.
 // River with physical banks and a deep bed, beneath the actual gap in collision.
 const rz=s.part?-645:-875,rw=s.part?300:250;
 box(0,-135,rz,2050,40,rw+40,'#435a58');box(0,-38,rz,2050,3,rw,'#357e8c');
 for(const z of [rz-rw/2-22,rz+rw/2+22])box(0,-45,z,1900,90,40,'#727e65');
 for(const q of s.solids){if(['house','tree','crate','prop'].includes(q.briarKind))continue;
  if(q.briarKind==='wood'){
   const alongX=q.w>q.d,span=alongX?q.w:q.d,mid=(q.h+q.y0)/2;
   for(let i=0;i<=Math.ceil(span/52);i++){const off=-span/2+i*span/Math.ceil(span/52);box(q.x+(alongX?off:0),mid,q.z+(alongX?0:off),9,q.h-q.y0,9,'#6a4f34');}
   for(const y of [q.y0+19,q.y0+47])box(q.x,y,q.z,alongX?q.w:7,6,alongX?7:q.d,'#a18455');
   continue;
  }
  if(q.briarKind==='stone'){
   const h=q.h-q.y0;
   sphere(q.x,(q.h+q.y0)/2,q.z,q.w*.6,h*.58,q.d*.6,'#677368');
   sphere(q.x-q.w*.19,q.y0+h*.43,q.z+q.d*.13,q.w*.35,h*.45,q.d*.38,'#53665b');
   continue;
  }
  box(q.x,(q.h+q.y0)/2,q.z,q.w,q.h-q.y0,q.d,q.color);
 }
 for(const q of s.plats){const wood=q.briarKind==='wood',watch=q.id.startsWith('watch'),stream=q.id.startsWith('stream'),tower=q.id.startsWith('tower'),canopy=q.id.startsWith('canopy');
  if(q.id==='watch0'){
   // A weathered stone outcrop conceals the functional rectangular landing.
   sphere(q.x,q.h-24,q.z,q.w*.78,48,q.d*.70,'#52665a');
   sphere(q.x-28,q.h-43,q.z+20,58,42,48,'#435c50');
   box(q.x,q.h-5,q.z,q.w-8,10,q.d-8,'#718473');
   for(const dx of [-38,0,38])box(q.x+dx,q.h+1,q.z-36,28,2,14,'#738f6c');
   }else{
    box(q.x,q.h-12,q.z,q.w,24,q.d,stream?'#524b3d':canopy?'#4e5844':watch?'#594638':wood?'#66523a':'#6e7e74');
    box(q.x,q.h-2,q.z,q.w-4,4,q.d-4,stream?'#8b7755':canopy?'#738364':watch?'#9f835c':wood?'#bd9d67':'#a0ab96');
   }
   if(wood){
    for(let x=q.x-q.w/2+12;x<q.x+q.w/2;x+=24)box(x,q.h+1,q.z,stream?5:2,stream?4:2,q.d-6,stream?'#6f6048':watch?'#564635':'#655640');
    for(const dx of [-1,1])cylinder(q.x+dx*(q.w/2-10),stream?(q.h-45)/2:(q.h-80)/2,q.z,stream?11:7,stream?q.h+45:q.h+80,stream?'#745b40':'#5e4934');
    if(stream){
     // Four broad, ragged timbers make the river crossing read as a damaged
     // logging walk. The continuous collision deck remains the actual floor.
     for(const side of [-1,1]){
      const log=cylinder(q.x+side*(q.w/2-5),q.h-6,q.z,7,q.d+22,'#6e5039');log.rotation.x=Math.PI/2;
      box(q.x+side*(q.w/2-2),q.h+2,q.z-12,7,5,q.d*.45,'#69725a');
     }
    }
    if(tower){
     for(const side of [-1,1])box(q.x+side*(q.w/2-10),q.h+12,q.z,8,22,8,'#937553');
     for(const dz of [-1,1])box(q.x,q.h+8,q.z+dz*(q.d/2-8),q.w-22,5,5,'#7c603e');
    }
    if(canopy)for(const side of [-1,1]){
     beam([q.x+side*(q.w/2-5),q.h-22,q.z],[q.x+side*(q.w/2+44),q.h-58,q.z+36],8,'#5a4d35');
    }
   }else if(q.id!=='watch0')sphere(q.x,q.h-70,q.z,q.w*.55,70,q.d*.52,'#65776b');}
 // Brace each working scaffold visibly; the gaps are broken work decks, not floating blocks.
 for(const q of s.plats.filter(q=>q.briarKind==='wood')){
  const foot=Math.max(-65,Math.min(0,q.h-70));
  if(!q.id.startsWith('stream'))for(const side of [-1,1])beam([q.x+side*(q.w/2-10),foot,q.z],[q.x-side*(q.w/2-10),q.h-25,q.z],4,'#846b45');
  // Nail heads and short end boards stay within the tested landing footprint.
  for(const dx of [-1,1])for(const dz of [-1,1])cylinder(q.x+dx*(q.w/2-14),q.h+2,q.z+dz*(q.d/2-14),2,2,'#514c43');
 }
  for(const h of s.houses){const first=g.children.length;
  box(h.x,14,h.z,h.w+14,28,h.d+14,'#746b59');box(h.x,h.h/2,h.z,h.w,h.h,h.d,'#d1b886');
  // Timbers lie outside plaster instead of coplanar overlays.
  for(const dx of [-1,1])for(const dz of [-1,1])box(h.x+dx*(h.w/2+2),h.h/2,h.z+dz*(h.d/2+2),14,h.h,14,'#5d4430');
  for(const y of [35,h.h-12])box(h.x,y,h.z+h.d/2+3,h.w+16,12,10,'#725135');
  for(const dx of [-.28,.28]){box(h.x+h.w*dx,85,h.z+h.d/2+5,48,58,10,'#493f31');box(h.x+h.w*dx,85,h.z+h.d/2+12,34,42,5,'#f0cc7c');box(h.x+h.w*dx,85,h.z+h.d/2+16,4,45,3,'#655237');}
  box(h.x,52,h.z+h.d/2+5,48,104,12,'#70513a');box(h.x-15,52,h.z+h.d/2+13,4,7,4,'#b3a172');
  const roofColor={red:'#984f3f',green:'#557566',ochre:'#a07845'}[h.roof];
  // Broad shingled roof planes, with raised ridge and gable fascia.
  for(const side of [-1,1]){const r=box(h.x+side*h.w*.25,h.h+34,h.z,h.w*.56,13,h.d+45,roofColor);r.rotation.z=-side*.36;}
  box(h.x,h.h+62,h.z,15,16,h.d+50,'#634a35');
  for(let z=h.z-h.d/2;z<h.z+h.d/2;z+=38)for(const side of [-1,1]){const r=box(h.x+side*h.w*.25,h.h+41,z,h.w*.55,3,4,'#b78c63');r.rotation.z=-side*.36;}
  box(h.x-h.w*.3,h.h+48,h.z-40,33,125,38,'#847b69');
   box(h.x,5,h.z+h.d/2+35,85,10,65,'#90846e');
   for(const o of g.children.slice(first))o.position.y+=h.y||0;
 }
 const reusedTrees=buildBriarTrees(s.trees);if(reusedTrees)g.add(reusedTrees);
 for(const t of reusedTrees?[]:s.trees){
  cylinder(t.x,t.h*.38,t.z,t.r,t.h*.76,'#634c34',t.r*.65);
  for(const a of [0,2.1,4.2]){const dx=Math.cos(a),dz=Math.sin(a);beam([t.x,5,t.z],[t.x+dx*60,2,t.z+dz*60],9,'#65553b');beam([t.x,t.h*.55,t.z],[t.x+dx*65,t.h*.77,t.z+dz*65],t.r*.4,'#715839');}
  sphere(t.x,t.h*.85,t.z,t.h*.43,t.h*.28,t.h*.39,s.part?'#315c3b':'#527843');sphere(t.x-35,t.h*.95,t.z+10,t.h*.30,t.h*.22,t.h*.29,'#648851');sphere(t.x+55,t.h*.81,t.z-20,t.h*.27,t.h*.21,t.h*.28,'#486d3c');
 }
 // Small, placed ground detail belongs to each district's work or ecology.
 // It is low enough to step over; gameplay-sized objects are in s.solids.
 const groundY=(x,z)=>s.terrain.height(x,z);
 const fence=(x0,z0,x1,z1,c='#806747')=>{
  const y0=groundY(x0,z0),y1=groundY(x1,z1),len=Math.hypot(x1-x0,z1-z0),n=Math.ceil(len/105);
  for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,z=z0+(z1-z0)*t,y=groundY(x,z);box(x,y+37,z,7,74,7,c);}
  for(const h of [28,56])beam([x0,y0+h,z0],[x1,y1+h,z1],3,'#aa8859');
 };
 const stump=(x,z,r=18)=>{const y=groundY(x,z);cylinder(x,y+13,z,r,26,'#614b36');cylinder(x,y+27,z,r*.9,3,'#b99966');sphere(x+r*.55,y+2,z-r*.3,r*.65,5,r*.55,'#657454');};
 const rocklet=(x,z,r=18)=>{const y=groundY(x,z);sphere(x,y+5,z,r,10,r*.75,s.part?'#647368':'#7b8271');};
 const flowerbed=(x,z,n=5)=>{const y=groundY(x,z);for(let i=0;i<n;i++){const dx=(i-(n-1)/2)*9,dy=groundY(x+dx,z);cylinder(x+dx,dy+9,z+(i%2)*8,2,18,'#4e713d');sphere(x+dx,dy+19,z+(i%2)*8,4,4,4,i%3?'#ead190':'#d9a98e');}};
 if(!s.part){
  // Homes have usable gardens and boundaries rather than free-floating props.
  fence(-825,535,-475,535);fence(320,535,610,535);
  for(const [x,z]of [[-780,495],[-725,495],[-670,495],[-610,495],[355,510],[415,510],[480,510],[540,510]])flowerbed(x,z,4);
  for(const [x,z]of [[-840,210],[-635,130],[640,155],[790,-95],[-680,-1030],[630,-1200]])rocklet(x,z,22);
  // The orchard follows planted rows; shallow furrows visually anchor the trees.
  for(const x of [-710,-550])for(const z of [-2020,-2260,-2500,-2740]){
   const y=groundY(x,z);sphere(x,y+1,z,62,4,75,'#78694c');
   for(const dz of [-32,27])sphere(x+38,y+6,z+dz,12,9,12,dz<0?'#ba563e':'#c9914a');
  }
  fence(-900,-1885,-900,-2735);fence(-370,-2060,-370,-2690);
  for(const [x,z]of [[-900,-2910],[-790,-3080],[-720,-3480],[680,-3360],[810,-3850]])stump(x,z,17);
  // Worked farm: rows stop short of the escorted escape lane.
  for(const x of [-885,-835,-785,-735])for(const z of [-3410,-3340,-3270,-3200]){
   const y=groundY(x,z);sphere(x,y+2,z,15,4,34,'#766449');
   for(const dz of [-10,10])sphere(x,y+8,z+dz,7,8,7,'#688048');
  }
  fence(-960,-3480,-960,-3140);fence(-960,-3140,-650,-3140);
 }else{
  // Logging activity gathers at the camp; stumps thin toward the war camp.
  for(const [x,z]of [[-430,-1010],[-790,-1230],[-460,-1450],[-740,-1650],[-480,-2890],[-780,-3150],[-905,-3660],[-650,-3840],[500,-3780],[780,-4050]])stump(x,z,20);
  for(const [x,z]of [[-535,-930],[-430,-890],[-595,-1410],[-820,-1520],[-750,-3360],[-780,-3450]]){
   const y=groundY(x,z),log=cylinder(x,y+14,z,15,95,'#6c5138');log.rotation.z=Math.PI/2;
   for(const dx of [-47,47]){const end=cylinder(x+dx,y+14,z,14,2,'#b38c5d');end.rotation.z=Math.PI/2;}
  }
  // Foot-worn north road is lined with rock outcrops and occasional fern beds.
  for(const [x,z]of [[-410,-2620],[220,-2860],[-680,-3000],[710,-3200],[-430,-3380],[510,-3570],[-750,-3800],[780,-3910],[-810,-4270],[700,-4490]])rocklet(x,z,26);
  for(const [x,z]of [[-535,-2700],[510,-2960],[-620,-3250],[780,-3520],[-625,-4030],[540,-4510]])flowerbed(x,z,7);
  fence(-850,-3740,-850,-3960);fence(850,-3950,850,-4170);
 }
 // The kit's complete grass and flower meshes soften authored
 // edges. Clusters mark field rows, the stream, logging cuts and forest bends;
 // the walking and jumping footprints are deliberately kept clear.
 const dressing=[];
 const addKit=(name,x,z,h,rotation=0)=>dressing.push({name,x,z,y:groundY(x,z),h,rotation});
 if(!s.part){
  for(const x of [-865,-785,-635,-435,420,550,635])for(const z of [540,485])addKit('grass_large',x,z,25);
  for(const x of [-760,-645,-510])for(const z of [-2070,-2300,-2530,-2740]){
   addKit('grass_large',x-65,z+60,32);addKit('flower_redA',x+60,z-47,22);
  }
  for(const z of [-3420,-3330,-3240,-3150])for(const x of [-895,-805,-715])addKit('grass_large',x,z,23);
 }else{
  for(const z of [410,225,0,-250,-920,-1180,-1460,-2050,-2640,-2920,-3400,-3790,-4510])for(const x of [-590,590]){
   addKit('grass_large',x+55,z+48,26);
  }
  for(const [x,z]of [[-430,-980],[-625,-1280],[570,-1350],[750,-1650],[-690,-3150],[710,-3550],[-800,-4240],[690,-4480]]){
   addKit('flower_yellowA',x+30,z+42,24);
  }
  for(const z of [-3040,-3210,-3390,-3610,-3870,-4070,-4320])for(const x of [-760,760])addKit('grass_large',x,z,40);
 }
 const reusedDressing=buildBriarDressing(dressing);if(reusedDressing)g.add(reusedDressing);
 for(const p of s.props){const {x,z}=p;const first=g.children.length;
  if(p.kind==='medical'){box(x,36,z,120,8,65,'#96724c');for(const dx of [-48,48])for(const dz of [-23,23])box(x+dx,17,z+dz,8,34,8,'#685139');for(let i=0;i<4;i++)cylinder(x-35+i*22,48,z,7,15,'#e4d6b4');beam([x-75,0,z-25],[x-75,145,z-25],5,'#5b4733');beam([x+75,0,z-25],[x+75,145,z-25],5,'#5b4733');box(x,140,z-10,160,8,100,'#b6bba0');sign(x,175,z,'MARA · MEDICAL');}
  if(p.kind==='well'){cylinder(x,28,z,45,56,'#827d68');cylinder(x,57,z,32,2,'#243f42');for(const dx of [-50,50])box(x+dx,62,z,9,124,9,'#6c5234');box(x,124,z,120,14,25,'#88633d');}
  if(p.kind==='cart'||p.kind==='bales'){box(x,35,z,110,20,65,'#886541');for(const dx of [-45,45])for(const dz of [-30,30]){const w=cylinder(x+dx,22,z+dz,20,8,'#473d30');w.rotation.x=Math.PI/2;}for(let i=0;i<3;i++)box(x-32+i*30,60,z,26,30,56,'#c3a45c');}
  if(p.kind==='mill'){const start=g.children.length,wheel=new T.Mesh(new T.TorusGeometry(65,7,6,16),mat('#715438'));wheel.position.set(x,55,z);g.add(wheel);for(let i=0;i<8;i++){const a=i*Math.PI/4;beam([x,55,z],[x+Math.cos(a)*65,55+Math.sin(a)*65,z],5,'#9c7b46');}const parts=g.children.slice(start),turn=new T.Group();turn.position.set(x,55,z);g.add(turn);g.updateMatrixWorld(true);for(const o of parts)turn.attach(o);g.userData.wheel=turn;box(x,55,z,24,25,40,'#61513b');beam([x,135,z],[-320,230,-960],3,'#c5ab74');box(x,78,z-20,12,156,16,'#67553d');box(-320,140,-960,10,280,10,'#67553d');sign(x,240,z,'MILL CROSSING');}
  if(p.kind==='camp'){box(x,40,z,160,80,100,'#676f4b');for(const dx of [-1,1]){const r=box(x+dx*43,97,z,105,9,135,'#92784d');r.rotation.z=-dx*.4;}sign(x,165,z,'LEWIS · REFUGE');}
  if(p.kind==='pen'||p.kind==='dogs'){for(const dx of [-125,125])for(let dz=-75;dz<=75;dz+=50)box(x+dx,55,z+dz,12,110,12,'#746243');for(const dx of [-125,125])for(const y of [30,75])box(x+dx,y,z,8,8,170,'#998459');for(const y of [30,75])box(x,y,z-80,250,8,8,'#998459');}
   if(p.kind==='signal'){for(const dx of [-80,80])beam([x+dx,0,z],[x+dx*.6,270,z],9,'#655238');beam([x-80,40,z],[x+55,210,z],7,'#a08658');sign(x,325,z,'LEGION SIGNAL');}
   if(p.kind==='orchard'){
    // Cider press, fruit sorting trays and a canvas cover: a worked village
    // orchard rather than a second unmotivated pile of geometric crates.
    box(x,35,z,90,55,100,'#795b3c');box(x,66,z,103,9,113,'#b99358');
    for(const dx of [-30,0,30])for(const dz of [-32,0,32])sphere(x+dx,76,z+dz,8,7,8,dx===0?'#caad4f':'#b7583d');
    for(const dx of [-64,64])for(const dz of [-57,57])beam([x+dx,0,z+dz],[x+dx,170,z+dz],5,'#5f4930');
    for(const side of [-1,1]){const roof=box(x+side*32,165,z,75,5,130,'#9e875c');roof.rotation.z=-side*.24;}
    cylinder(x,111,z,18,58,'#664b35');cylinder(x,130,z,42,7,'#a88351');
    for(const dx of [-100,100]){box(x+dx,18,z+55,63,25,55,'#765331');for(const ox of [-18,0,18])for(const oz of [-14,10])sphere(x+dx+ox,38,z+55+oz,7,6,7,'#b44c35');}
    sign(x,160,z+90,'VILLAGE ORCHARD');
   }
   if(p.kind==='farmyard'){
    box(x,46,z,115,14,65,'#80603c');for(const dx of [-47,47])for(const dz of [-24,24])box(x+dx,21,z+dz,8,42,8,'#594936');
    for(const dz of [-18,18])cylinder(x+24,63,z+dz,17,24,'#ad915a');
    for(const dx of [-67,67])beam([x+dx,0,z-48],[x+dx,122,z-48],6,'#715638');
    beam([x-67,122,z-48],[x+67,122,z-48],6,'#715638');
    for(const dz of [-17,17]){const sack=sphere(x-30,62,z+dz,19,11,13,'#b5a172');sack.rotation.z=.18;}
    sign(x,147,z+94,'FARM LOFT');
   }
   if(p.kind==='gate'){
    for(const side of [-1,1]){box(x+side*157,82,z,30,164,30,'#697061');box(x+side*157,164,z,43,18,43,'#a49776');
     beam([x+side*157,158,z],[x+side*125,210,z],9,'#76583c');}
    beam([x-125,210,z],[x+125,210,z],9,'#76583c');
    sign(x,251,z,'WOODS GATE');
   }
   if(p.kind==='roadblock'){
    // An occupied ridge explains the patrol here; the centre stays open for
    // dodging and for a clean escorted route in future reuse.
    for(const side of [-1,1]){
     const px=x+side*230;
     for(const dx of [-30,0,30]){
      const log=cylinder(px+dx,38,z,13,76,'#70513b');log.rotation.x=Math.PI/2;
     }
     beam([px,0,z-35],[px,155,z-35],7,'#514333');
     box(px+side*32,116,z-35,63,72,3,'#673f39');
     box(px+side*32,149,z-32,48,5,3,'#aa8151');
    }
    for(const [dx,dz]of [[-345,-90],[340,75]])sphere(x+dx,8,z+dz,35,13,30,'#69766a');
   }
   if(p.kind==='lumber'){
    for(const dz of [-42,-5,32])for(const dy of [16,42]){
     const log=cylinder(x-75,dy,z+dz,17,94,'#735337');log.rotation.z=Math.PI/2;
     for(const side of [-1,1]){const end=cylinder(x-75+side*48,dy,z+dz,14,3,'#b18c58');end.rotation.z=Math.PI/2;}}
    for(const dz of [-60,55])beam([x-132,5,z+dz],[x-132,72,z+dz],8,'#60462f');
    for(const dx of [-112,-56])beam([x+dx,58,z-65],[x+dx,58,z+60],2,'#c4a56c');
    box(x+42,31,z,95,16,70,'#795b3a');for(const dx of [-36,36])for(const dz of [-27,27])box(x+42+dx,17,z+dz,8,34,8,'#55432f');
    for(let i=0;i<4;i++)box(x+16+i*16,45,z,5,5,65,'#b08d5d');
    sign(x,180,z+115,'LUMBER YARD');
   }
   if(p.kind==='breach'){
    for(const dx of [-175,175])for(const dz of [-175,175])box(x+dx,35,z+dz,15,70,15,'#9b845a');
    for(const dz of [-175,175])for(let dx=-170;dx<175;dx+=35)box(x+dx,5,z+dz,26,8,10,'#a58f62');
    box(x,34,z,120,23,75,'#795537');for(const dx of [-46,46]){const w=cylinder(x+dx,20,z,22,10,'#43382e');w.rotation.x=Math.PI/2;}
    box(x,56,z,95,26,58,'#9f7448');
    for(const side of [-1,1]){box(x+side*50,76,z,10,43,76,'#765135');for(const dz of [-22,20])beam([x+side*50,54,z+dz],[x+side*50,100,z+dz],3,'#b7a073');}
    for(const dz of [-25,0,25]){const load=cylinder(x,83,z+dz,12,78,'#80603c');load.rotation.z=Math.PI/2;}
    beam([x-64,100,z-27],[x+64,100,z-27],2,'#d4bd80');beam([x-64,100,z+27],[x+64,100,z+27],2,'#d4bd80');
    for(const dx of [-46,46])for(let i=0;i<8;i++){const a=i*Math.PI/4;beam([x+dx,20,z],[x+dx+Math.cos(a)*16,20,z+Math.sin(a)*16],2,'#9e7951');}
    sign(x,164,z+196,'DEFEND THE WAGON');
   }
   if(p.kind==='duel'){
    for(let i=0;i<16;i++){const a=i*Math.PI/8;sphere(x+Math.sin(a)*180,5,z+Math.cos(a)*180,28,11,20,'#a0a493');}
    for(const dx of [-160,160])for(const dz of [-160,160]){
     beam([x+dx,0,z+dz],[x+dx,115,z+dz],6,'#765a3c');
     const flag=box(x+dx+17,92,z+dz,34,38,3,'#6b865c');flag.rotation.z=dx<0?-.1:.1;
    }
    for(const side of [-1,1]){box(x+side*245,105,z,10,210,10,'#69533d');box(x+side*245,185,z,60,90,5,'#49634a');}
    for(const [dx,dz]of [[-145,-130],[160,-90]]){
     beam([x+dx,0,z+dz],[x+dx,105,z+dz],5,'#70583b');
     for(const radius of [42,30,18,7]){const disk=cylinder(x+dx,110,z+dz,radius,2,radius===7?'#cba95a':radius===18?'#445f48':radius===30?'#d4c5a1':'#55483a');disk.rotation.x=Math.PI/2;}
    }
    for(let i=0;i<6;i++){const a=i*Math.PI/3;box(x+Math.sin(a)*125,2,z+Math.cos(a)*125,20,2,7,'#a69b75');}
    sign(x,205,z-225,'RANGER CHALLENGE');
   }
   if(p.kind==='warcamp'){
     for(const side of [-1,1]){
      box(x+side*590,100,z+55,30,200,30,'#626b5b');box(x+side*590,206,z+55,49,13,49,'#968a6b');
      box(x+side*390,24,z-240,150,47,115,'#665f4d');
      box(x+side*490,56,z+240,150,96,45,'#594d3c');
      // Cut timber, chained beams and old damage say why this beast is here.
      for(let j=0;j<3;j++){
       const px=x+side*(365+j*76),pz=z-130+j*95;
       const log=cylinder(px,26,pz,16,100,'#73543c');log.rotation.z=Math.PI/2;
       for(const end of [-1,1])cylinder(px+end*49,26,pz,14,3,'#b89460').rotation.z=Math.PI/2;
      }
      for(const dz of [-215,-155,-95])beam([x+side*570,34,z+dz],[x+side*570,119,z+dz],8,'#735f45');
      beam([x+side*570,95,z-225],[x+side*570,95,z-80],5,'#98825d');
      const flag=box(x+side*590,161,z+40,4,74,48,'#6d4038');flag.rotation.z=side*.07;
     }
     for(const dz of [-230,215]){
      box(x,5,z+dz,310,9,19,'#514c3e');
      for(const dx of [-135,-45,45,135])box(x+dx,12,z+dz,13,24,12,'#7d6545');
     }
     sign(x,205,z+370,'WARBEAST LOGGING YARD');
    }
  const base=s.terrain.height(x,z);for(const o of g.children.slice(first))o.position.y+=base;
 }
 if(s.signal){
  // The sight line runs from the signal to Lewis's refuge. Cutting the cable
  // removes it in the world, so the player's objective has a visible result.
  const a=new T.Vector3(s.signal.x,s.signal.y+151,s.signal.z),b=new T.Vector3(-230,133,440),v=b.clone().sub(a);
  const rig=new T.Group();
  for(const [radius,opacity,color]of [[18,.12,'#d74448'],[5,.48,'#ed7463']]){
   const material=new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:T.AdditiveBlending});
   materials.set('signalBeam'+radius,material);
   const tube=new T.Mesh(geom('signalBeamCylinder',()=>new T.CylinderGeometry(1,1,1,8)),material);
   tube.position.copy(a).add(b).multiplyScalar(.5);tube.scale.set(radius,v.length(),radius);
   tube.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize());rig.add(tube);
  }
  const lens=new T.Mesh(geom('signalLens',()=>new T.OctahedronGeometry(1,0)),mat('#e99162'));
  lens.position.copy(a);lens.scale.set(28,37,28);rig.add(lens);g.add(rig);g.userData.signalBeam=rig;
 }
 if(s.snarePosts){
  for(const post of s.snarePosts){
   const {x,z}=post,y=s.terrain.height(x,z),first=g.children.length;
   box(x,y+7,z,88,14,88,'#6f715e');
   for(const dx of [-25,25])for(const dz of [-25,25])cylinder(x+dx,y+14,z+dz,3,3,'#c5ab71');
   box(x,y+67,z,40,110,39,'#765437');box(x,y+120,z,54,13,54,'#99764b');
   for(const side of [-1,1]){
    beam([x+side*33,y+10,z+25],[x+side*18,y+105,z+10],7,'#aa875a');
    beam([x+side*32,y+10,z-25],[x+side*18,y+105,z-10],7,'#aa875a');
    box(x+side*23,y+68,z+22,6,31,5,'#565d5a');
   }
   for(const h of [52,90])box(x,y+h,z+22,46,8,8,'#c9984e');
   // Bright crossed braces distinguish these breakable targets from the
   // nearby plain fence and let players read the arena while dodging.
   beam([x-19,y+46,z+28],[x+19,y+96,z+28],3,'#ead192');
   beam([x+19,y+46,z+28],[x-19,y+96,z+28],3,'#ead192');
   box(x,y+109,z+24,28,13,3,'#b79b64');
   const parts=g.children.slice(first),rig=new T.Group();g.add(rig);g.updateMatrixWorld(true);
   for(const o of parts)rig.attach(o);post.art=rig;
  }
  // The wreck before the arena teaches what a shattered brace looks like.
  const x=-125,z=-3920,y=s.terrain.height(x,z);
  const fallen=cylinder(x,y+16,z,19,130,'#76553a');fallen.rotation.z=Math.PI/2;
  for(const dx of [-64,64]){const end=cylinder(x+dx,y+16,z,18,3,'#b18b5c');end.rotation.z=Math.PI/2;}
  box(x+36,y+8,z-38,19,14,72,'#636b60');
 }
 if(!s.part){sign(-180,130,240,'BRIAR TOWN');sign(730,295,-490,'GRANARY LOFT');sign(-475,80,-490,'SLUICE PLATE');sign(0,155,-4250,'TO THE BLACK WOODS');
  // The linkage makes the weight-operated gate legible from the yard.
  beam([-475,8,-490],[-600,8,-700],3,'#c4aa6c');
 }else{
  sign(0,160,-4620,'HOLLOW PASS →');sign(-600,130,-1100,'LOGGING CAMP');
  // The abandoned timber watch gives the optional climb a visible destination
  // from the northern trail. Its beams support the actual collision decks.
  const watch=s.plats.filter(q=>q.id.startsWith('watch'));
  if(watch.length){
   const base=watch[0],top=watch[watch.length-1];
   sign(base.x,125,base.z+115,'OLD WATCH');
   // A short worn branch off the main trail points to the base without a
   // floating objective marker or another arbitrary combination puzzle.
   for(const [x,z]of [[155,-3070],[215,-3120],[280,-3165],[335,-3210]]){
    const h=s.terrain.height(x,z);
    sphere(x,h+1,z,25,3,16,'#857e62');
   }
   for(const q of watch){
    const ground=s.terrain.height(q.x,q.z),half=q.w/2-14;
    for(const side of [-1,1]){
     beam([q.x+side*half,ground-5,q.z],[q.x+side*half,q.h-14,q.z],5,'#604d36');
     beam([q.x+side*half,ground+22,q.z],[q.x-side*half,q.h-20,q.z],3,'#8a7047');
    }
    for(const dz of [-1,1])box(q.x,q.h+3,q.z+dz*(q.d/2-8),q.w-20,3,4,'#5d4835');
   }
   for(const side of [-1,1]){
    beam([top.x+side*52,top.h,top.z-42],[top.x+side*52,top.h+115,top.z-42],5,'#584537');
    beam([top.x+side*52,top.h+115,top.z-42],[top.x,top.h+135,top.z-42],4,'#75583c');
   }
   beam([top.x,top.h+135,top.z-42],[top.x,top.h+195,top.z-42],4,'#66513a');
   box(top.x+19,top.h+170,top.z-42,38,34,2,'#824c3d');
   box(top.x+19,top.h+153,top.z-42,38,3,3,'#c7a570');
   box(top.x,top.h+93,top.z-42,90,43,3,'#6d5038');
   box(top.x,top.h+95,top.z-39,74,31,2,'#765845');
   box(top.x,top.h+95,top.z-37,8,18,2,'#b6a276');
   for(const dx of [-22,22])box(top.x+dx,top.h+75,top.z-37,4,9,2,'#b6a276');
  }
 }
 g.userData.tick=p=>{reusedTrees?.userData.tick?.(p);reusedDressing?.userData.tick?.(p);if(g.userData.wheel)g.userData.wheel.rotation.z=s.wheelAngle||0;if(g.userData.signalBeam)g.userData.signalBeam.visible=!s.signalOff;for(const post of s.snarePosts||[])post.art.visible=!post.used;for(const l of g.userData.labels){const d=Math.hypot(p.x-l.x,p.z-l.z);l.sp.visible=!window.BFInspection?.active&&d>160&&d<650;}};
 g.userData.dispose=()=>{groundTex.dispose();for(const m of materials.values())m.dispose();for(const geo of geometries.values())geo.dispose();g.traverse(o=>{if(o.geometry&&!Array.from(geometries.values()).includes(o.geometry)&&!o.isInstancedMesh)o.geometry.dispose();});for(const l of g.userData.labels){l.tex.dispose();l.m.dispose();}};
 // Static art shares geometry/material batches. Complexity should not imply hundreds of draw calls.
 const batches=new Map();for(const o of [...g.children])if(o.isMesh&&!o.isInstancedMesh){o.updateMatrix();const key=o.geometry.uuid+o.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);}
 for(const list of batches.values()){if(list.length<2)continue;const inst=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);list.forEach((o,i)=>{inst.setMatrixAt(i,o.matrix);g.remove(o);});inst.computeBoundingSphere();g.add(inst);}
 return {group:g,counts:{pieces:count,batches:batches.size,houses:s.houses.length,trees:s.trees.length,platforms:s.plats.length}};
}
