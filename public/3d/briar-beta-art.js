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
 for(const f of world.segments){box(f.x,-22,f.z,f.w,42,f.d,s.part?'#435e3d':'#70874d');box(f.x,-48,f.z,f.w,12,f.d,'#706248');}
 for(const q of s.paths)box(q.x,.5,q.z,q.w,1,q.d,s.part?'#72734d':'#b49a67');
 // River with physical banks and a deep bed, beneath the actual gap in collision.
 const rz=s.part?-645:-875,rw=s.part?300:250;
 box(0,-135,rz,2050,40,rw+40,'#435a58');box(0,-38,rz,2050,3,rw,'#357e8c');
 for(const z of [rz-rw/2-22,rz+rw/2+22])box(0,-45,z,1900,90,40,'#727e65');
 for(const q of s.solids){if(['house','tree','crate','prop'].includes(q.briarKind))continue;box(q.x,(q.h+q.y0)/2,q.z,q.w,q.h-q.y0,q.d,q.color);}
 for(const q of s.plats){const wood=q.briarKind==='wood';box(q.x,q.h-12,q.z,q.w,24,q.d,wood?'#66523a':'#6e7e74');box(q.x,q.h-2,q.z,q.w-4,4,q.d-4,wood?'#bd9d67':'#a0ab96');if(wood){for(let x=q.x-q.w/2+12;x<q.x+q.w/2;x+=24)box(x,q.h+1,q.z,2,2,q.d-6,'#655640');for(const dx of [-1,1])cylinder(q.x+dx*(q.w/2-10),(q.h-80)/2,q.z,7,q.h+80,'#5e4934');}else sphere(q.x,q.h-70,q.z,q.w*.55,70,q.d*.52,'#65776b');}
 // Brace each working scaffold visibly; the gaps are broken work decks, not floating blocks.
 for(const q of s.plats.filter(q=>q.briarKind==='wood')){
  const foot=Math.max(-65,Math.min(0,q.h-70));
  for(const side of [-1,1])beam([q.x+side*(q.w/2-10),foot,q.z],[q.x-side*(q.w/2-10),q.h-25,q.z],4,'#846b45');
  // Nail heads and short end boards stay within the tested landing footprint.
  for(const dx of [-1,1])for(const dz of [-1,1])cylinder(q.x+dx*(q.w/2-14),q.h+2,q.z+dz*(q.d/2-14),2,2,'#514c43');
 }
 for(const h of s.houses){
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
 }
 for(const t of s.trees){
  cylinder(t.x,t.h*.38,t.z,t.r,t.h*.76,'#634c34',t.r*.65);
  for(const a of [0,2.1,4.2]){const dx=Math.cos(a),dz=Math.sin(a);beam([t.x,5,t.z],[t.x+dx*60,2,t.z+dz*60],9,'#65553b');beam([t.x,t.h*.55,t.z],[t.x+dx*65,t.h*.77,t.z+dz*65],t.r*.4,'#715839');}
  sphere(t.x,t.h*.85,t.z,t.h*.43,t.h*.28,t.h*.39,s.part?'#315c3b':'#527843');sphere(t.x-35,t.h*.95,t.z+10,t.h*.30,t.h*.22,t.h*.29,'#648851');sphere(t.x+55,t.h*.81,t.z-20,t.h*.27,t.h*.21,t.h*.28,'#486d3c');
 }
 for(const p of s.props){const {x,z}=p;
  if(p.kind==='medical'){box(x,36,z,120,8,65,'#96724c');for(const dx of [-48,48])for(const dz of [-23,23])box(x+dx,17,z+dz,8,34,8,'#685139');for(let i=0;i<4;i++)cylinder(x-35+i*22,48,z,7,15,'#e4d6b4');beam([x-75,0,z-25],[x-75,145,z-25],5,'#5b4733');beam([x+75,0,z-25],[x+75,145,z-25],5,'#5b4733');box(x,140,z-10,160,8,100,'#b6bba0');sign(x,175,z,'MARA · MEDICAL');}
  if(p.kind==='well'){cylinder(x,28,z,45,56,'#827d68');cylinder(x,57,z,32,2,'#243f42');for(const dx of [-50,50])box(x+dx,62,z,9,124,9,'#6c5234');box(x,124,z,120,14,25,'#88633d');}
  if(p.kind==='cart'||p.kind==='bales'){box(x,35,z,110,20,65,'#886541');for(const dx of [-45,45])for(const dz of [-30,30]){const w=cylinder(x+dx,22,z+dz,20,8,'#473d30');w.rotation.x=Math.PI/2;}for(let i=0;i<3;i++)box(x-32+i*30,60,z,26,30,56,'#c3a45c');}
  if(p.kind==='mill'){const start=g.children.length,wheel=new T.Mesh(new T.TorusGeometry(65,7,6,16),mat('#715438'));wheel.position.set(x,55,z);g.add(wheel);for(let i=0;i<8;i++){const a=i*Math.PI/4;beam([x,55,z],[x+Math.cos(a)*65,55+Math.sin(a)*65,z],5,'#9c7b46');}const parts=g.children.slice(start),turn=new T.Group();turn.position.set(x,55,z);g.add(turn);g.updateMatrixWorld(true);for(const o of parts)turn.attach(o);g.userData.wheel=turn;box(x,55,z,24,25,40,'#61513b');beam([x,135,z],[-320,230,-960],3,'#c5ab74');box(x,78,z-20,12,156,16,'#67553d');box(-320,140,-960,10,280,10,'#67553d');sign(x,240,z,'MILL CROSSING');}
  if(p.kind==='camp'){box(x,40,z,160,80,100,'#676f4b');for(const dx of [-1,1]){const r=box(x+dx*43,97,z,105,9,135,'#92784d');r.rotation.z=-dx*.4;}sign(x,165,z,'LEWIS · REFUGE');}
  if(p.kind==='pen'||p.kind==='dogs'){for(const dx of [-125,125])for(let dz=-75;dz<=75;dz+=50)box(x+dx,55,z+dz,12,110,12,'#746243');for(const dx of [-125,125])for(const y of [30,75])box(x+dx,y,z,8,8,170,'#998459');for(const y of [30,75])box(x,y,z-80,250,8,8,'#998459');}
  if(p.kind==='signal'){for(const dx of [-80,80])beam([x+dx,0,z],[x+dx*.6,270,z],9,'#655238');beam([x-80,40,z],[x+55,210,z],7,'#a08658');sign(x,325,z,'LEGION SIGNAL');}
 }
 if(!s.part){sign(-180,130,240,'BRIAR TOWN');sign(730,295,-490,'GRANARY LOFT');sign(-475,80,-490,'SLUICE PLATE');sign(0,155,-1770,'TO THE BLACK WOODS');
  // The linkage makes the weight-operated gate legible from the yard.
  beam([-475,8,-490],[-600,8,-700],3,'#c4aa6c');
 }else{sign(0,160,-2820,'HOLLOW PASS →');sign(-600,130,-1100,'LOGGING CAMP');}
 g.userData.tick=p=>{if(g.userData.wheel)g.userData.wheel.rotation.z=s.wheelAngle||0;for(const l of g.userData.labels){const d=Math.hypot(p.x-l.x,p.z-l.z);l.sp.visible=d>160&&d<650;}};
 g.userData.dispose=()=>{for(const m of materials.values())m.dispose();for(const geo of geometries.values())geo.dispose();g.traverse(o=>{if(o.geometry&&!Array.from(geometries.values()).includes(o.geometry))o.geometry.dispose();});for(const l of g.userData.labels){l.tex.dispose();l.m.dispose();}};
 // Static art shares geometry/material batches. Complexity should not imply hundreds of draw calls.
 const batches=new Map();for(const o of [...g.children])if(o.isMesh&&!o.isInstancedMesh){o.updateMatrix();const key=o.geometry.uuid+o.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);}
 for(const list of batches.values()){if(list.length<2)continue;const inst=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);list.forEach((o,i)=>{inst.setMatrixAt(i,o.matrix);g.remove(o);});inst.computeBoundingSphere();g.add(inst);}
 return {group:g,counts:{pieces:count,batches:batches.size,houses:s.houses.length,trees:s.trees.length,platforms:s.plats.length}};
}
