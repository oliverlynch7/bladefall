import * as T from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';
// Static prison architecture uses the exact collision plan. Merge by material, not by prop.
export function buildPrisonArt(plan){
 const group=new T.Group();group.name='Prison stonework';const buckets=new Map(),geometries=[],textures=[];
 function stoneTexture(floor=false){
  const c=document.createElement('canvas');c.width=c.height=256;const a=c.getContext('2d');a.fillStyle='#353439';a.fillRect(0,0,256,256);
  let seed=floor?331:917;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const row=floor?64:32,col=floor?64:96;
  for(let y=0;y<256;y+=row)for(let x=-col;x<256;x+=col){const xx=x+((y/row)%2)*col/2,v=112+Math.floor(rand()*38);a.fillStyle=`rgb(${v+8},${v+5},${v})`;a.fillRect(xx+2,y+2,col-4,row-4);a.fillStyle='rgba(240,230,205,.15)';a.fillRect(xx+3,y+3,col-6,2);a.fillStyle='rgba(5,10,20,.18)';a.fillRect(xx+col-5,y+3,2,row-6);}
  for(let i=0;i<9000;i++){const v=rand()>.5?255:0;a.fillStyle=`rgba(${v},${v},${v},.045)`;a.fillRect(rand()*256,rand()*256,1+rand()*3,1);}
  const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;textures.push(tex);return tex;
 }
 const wallMap=stoneTexture(),floorMap=stoneTexture(true),palette=[['#c5b4a2','#9a9290','#83604c'],['#9fb7b3','#819a99','#568986'],['#b3a7c5','#9690ab','#8d739f']][plan.section-1];
 const mats={wall:new T.MeshStandardMaterial({color:palette[0],map:wallMap,bumpMap:wallMap,bumpScale:1.8,roughness:.94}),floor:new T.MeshStandardMaterial({color:palette[1],map:floorMap,bumpMap:floorMap,bumpScale:1.1,roughness:.9}),trim:new T.MeshStandardMaterial({color:'#b4a18b',roughness:.8}),iron:new T.MeshStandardMaterial({color:'#39424b',metalness:.72,roughness:.48}),wood:new T.MeshStandardMaterial({color:'#69513a',roughness:.85}),cloth:new T.MeshStandardMaterial({color:palette[2],roughness:1}),glow:new T.MeshStandardMaterial({color:'#ffe3a8',emissive:'#ffb04e',emissiveIntensity:1.5}),water:new T.MeshStandardMaterial({color:'#285b60',metalness:.45,roughness:.23}),route:new T.MeshStandardMaterial({color:'#a9b8c5',emissive:'#607e97',emissiveIntensity:.48,roughness:.7}),optional:new T.MeshStandardMaterial({color:'#dfb265',emissive:'#8e5c21',emissiveIntensity:.55,roughness:.62})};
 const matrix=new T.Matrix4(),q=new T.Quaternion(),euler=new T.Euler();
 function add(geo,mat,x,y,z,rx=0,ry=0,rz=0){
  if(geo.index){const source=geo;geo=source.toNonIndexed();source.dispose();}
  q.setFromEuler(euler.set(rx,ry,rz));matrix.compose(new T.Vector3(x,y,z),q,new T.Vector3(1,1,1));geo.applyMatrix4(matrix);
  // Physical-scale UVs, so huge walls don't stretch a single brick across the room.
  if(mat==='wall'||mat==='floor'){const pos=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv;for(let i=0;i<pos.count;i++){const ny=Math.abs(n.getY(i)),nx=Math.abs(n.getX(i));uv.setXY(i,(ny>.7?pos.getX(i):nx>.7?pos.getZ(i):pos.getX(i))/170,(ny>.7?pos.getZ(i):pos.getY(i))/170);}}
  if(!buckets.has(mat))buckets.set(mat,[]);buckets.get(mat).push(geo);
 }
 function box(o,mat){add(new T.BoxGeometry(o.w,o.h-o.y0,o.d),mat,o.x,(o.h+o.y0)/2,o.z);}
 function block(x,y,z,w,h,d,mat='trim'){add(new T.BoxGeometry(w,h,d),mat,x,y,z);}
 for(const o of plan.floors)box(o,'floor');
 for(const o of plan.walls){box(o,'wall');if(o.collisionOnly)continue;block(o.x,7,o.z,o.w+3,14,o.d+3,'trim');block(o.x,o.h-12,o.z,o.w+5,16,o.d+5,'trim');}
 for(const o of plan.roofs)box(o,'wall');
 for(const o of plan.plats){
  const room=plan.rooms.find(r=>r.id===o.room);
  if(room?.template==='refectory'){
   // Furniture stays inside the authored solid obstacle, with a readable tabletop and legs.
   block(o.x,o.h-5,o.z,o.w,10,o.d,'wood');
   for(const sx of [-1,1])for(const sz of [-1,1])block(o.x+sx*(o.w/2-8),o.h/2-5,o.z+sz*(o.d/2-12),10,Math.max(4,o.h-10),12,'wood');
   for(const sz of [-1,1])block(o.x,Math.max(5,o.h*.35),o.z+sz*(o.d/2-12),o.w-10,5,8,'iron');
   continue;
  }
  const bevel=Math.min(2,(o.h-o.y0)/4),shape=new T.Shape(),w=o.w/2-bevel,d=o.d/2-bevel;shape.moveTo(-w,-d);shape.lineTo(w,-d);shape.lineTo(w,d);shape.lineTo(-w,d);shape.closePath();
  add(new T.ExtrudeGeometry(shape,{depth:o.h-o.y0-2*bevel,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:1,curveSegments:1,steps:1}),'floor',o.x,o.y0+bevel,o.z,-Math.PI/2);
 }
 for(const o of plan.decor){if(o.bar)add(new T.CylinderGeometry(3,3,o.h-o.y0,8),'iron',o.x,(o.h+o.y0)/2,o.z);else if(!o.pillar)box(o,plan.revision>=7&&o.h<=2&&o.color?(o.color==='#d3a451'?'optional':'route'):'trim');}
 for(const room of plan.rooms){
  const half=room.w/2-24;
  for(const sx of [-1,1]){
   const x=room.x+sx*(half-8),z=room.z-room.d*.26;
   add(new T.CylinderGeometry(15,19,room.h-24,12),'trim',x,room.h/2,z);
   add(new T.CylinderGeometry(26,29,14,12),'trim',x,7,z);add(new T.CylinderGeometry(29,24,15,12),'trim',x,room.h-8,z);
   const lx=room.x+sx*(half-18),lz=room.z+110;
   add(new T.CylinderGeometry(1.7,1.7,70,6),'iron',lx,room.h-35,lz);
   add(new T.CylinderGeometry(14,19,9,10),'iron',lx,room.h-74,lz);
   add(new T.SphereGeometry(8,10,6),'glow',lx,room.h-62,lz);
   for(let i=0;i<4;i++){const a=i*Math.PI/2;add(new T.CylinderGeometry(1.7,1.7,24,6),'iron',lx+Math.cos(a)*12,room.h-62,lz+Math.sin(a)*12);}
  }
  if(room.kind==='start')for(const sx of [-1,1]){block(room.x+sx*285,26,room.z-140,70,12,110,'wood');block(room.x+sx*285,34,room.z-140,65,5,100,'cloth');}
  if(room.template==='cistern'){for(const sx of [-1,1])block(room.x+sx*245,.7,room.z+80,100,1,260,'water');}
  // Large room-specific landmarks stay above headroom or inside existing solids.
  // Nothing placed here silently creates a new platform or walking obstacle.
  if(room.template==='refectory'){
   for(const table of plan.plats.filter(p=>p.room===room.id&&p.w>60)){
    block(table.x,table.h+1,table.z,table.w*.44,1.5,table.d*.82,'cloth');
    for(const dz of [-85,0,85]){
     add(new T.CylinderGeometry(9,7,3,12),'iron',table.x-18,table.h+3,table.z+dz);
     add(new T.CylinderGeometry(4,4,9,8),'wood',table.x+18,table.h+6,table.z+dz);
    }
   }
   block(room.x,room.h-30,room.z,room.w-35,18,20,'wood');
   for(const dx of [-105,105]){add(new T.CylinderGeometry(2,2,42,6),'iron',room.x+dx,room.h-50,room.z);add(new T.TorusGeometry(23,3,6,12),'iron',room.x+dx,room.h-74,room.z,Math.PI/2);}
  }
  if(room.template==='kennels'){
   for(const sx of [-1,1]){
    const x=room.x+sx*(half+5);
    // Bars are inset against the side wall, clear of its central doorway.
    for(const dz of [-230,-200,-170,170,200,230])add(new T.CylinderGeometry(3,3,112,6),'iron',x,64,room.z+dz);
    for(const dz of [-200,200]){block(x,122,room.z+dz,10,9,90,'iron');block(x,8,room.z+dz,10,9,90,'iron');}
   }
  }
  if(room.template==='gallery'){
   for(const pillar of plan.plats.filter(p=>p.room===room.id&&p.h>100)){
    block(pillar.x,pillar.h+4,pillar.z,pillar.w+4,8,pillar.d+4,'trim');
    block(pillar.x,pillar.h*.6,pillar.z+pillar.d/2+1,pillar.w*.65,pillar.h*.5,2,'cloth');
   }
  }
  if(room.template==='cistern'){
   for(const sx of [-1,1]){
    const x=room.x+sx*(half-8);
    add(new T.CylinderGeometry(14,14,room.d-80,10),'iron',x,room.h-28,room.z,Math.PI/2);
    for(const dz of [-230,0,230])add(new T.TorusGeometry(17,3,6,10),'trim',x,room.h-28,room.z+dz);
    // Wall drains and water channels visually explain the stepping islands.
    block(x,55,room.z-220,10,70,65,'iron');
    for(const dz of [-240,-220,-200])block(x-sx*7,55,room.z+dz,3,54,5,'trim');
   }
  }
  if(room.template==='armory'){
   // Empty racks, confiscated shields and a barred inventory rail tell the
   // player why the cover sits here. All pieces fit above or against solids.
   for(const sx of [-1,1]){
    const x=room.x+sx*205;
    for(const dz of [-175,-120,-65]){
     block(x,61,room.z+dz,62,5,7,'wood');
     add(new T.CylinderGeometry(15,15,4,10),'iron',x,78,room.z+dz,Math.PI/2);
     add(new T.SphereGeometry(4,8,6),'trim',x,80,room.z+dz);
    }
    for(const dz of [92,128,164])block(room.x+sx*(room.w/2-16),94,room.z+dz,5,116,6,'iron');
   }
   block(room.x,room.h-22,room.z-130,210,8,12,'iron');
  }
  if(room.template==='liftbay'){
   // The suspended load is overhead; the two low platforms are the only
   // climbable parts and are already represented by collision geometry.
   for(const sx of [-1,1]){
    const x=room.x+sx*205;
    block(x,room.h-34,room.z+12,6,56,6,'iron');
    block(x,room.h-62,room.z+12,102,8,178,'wood');
    for(const dz of [-68,92])block(x,room.h-54,room.z+dz,88,14,35,'iron');
   }
   add(new T.CylinderGeometry(21,21,12,14),'iron',room.x,room.h-36,room.z-95,Math.PI/2);
   for(const sx of [-1,1])block(room.x+sx*112,room.h-34,room.z-95,7,38,7,'iron');
  }
  if(room.template==='watchpost'){
   for(const sx of [-1,1]){
    const x=room.x+sx*185;
    block(x,56,room.z-105,94,8,94,'wood');
    for(const dz of [-146,-64])block(x,79,room.z+dz,92,39,7,'iron');
    block(room.x+sx*(room.w/2-14),room.h-115,room.z+175,6,95,54,'cloth');
   }
   for(const dx of [-85,0,85])block(room.x+dx,room.h-31,room.z-120,7,62,7,'iron');
  }
  if(room.template==='infirmary'){
   for(const sx of [-1,1]){
    const x=room.x+sx*200;
    block(x,39,room.z-95,88,5,162,'wood');
    block(x,42,room.z-95,76,3,144,'cloth');
    for(const dz of [-165,-25])block(x,21,room.z+dz,7,38,7,'iron');
    block(room.x+sx*(room.w/2-12),room.h-98,room.z+110,6,115,78,'cloth');
   }
  }
  if(room.kind==='bridge'){
   for(const sx of [-1,1])block(room.x+sx*(half+5),80,room.z,8,18,room.d-45,'wood');
   // A deep masonry shaft replaces the visible sky beneath broken floors.
   // It stays below the game's fall recovery plane; stepping tops keep their exact colliders.
   block(room.x,-205,room.z,room.w,12,room.d,'iron');
   for(const sx of [-1,1])block(room.x+sx*(room.w/2-10),-100,room.z,20,200,room.d,'wall');
   for(const sz of [-1,1])block(room.x,-100,room.z+sz*(room.d/2-10),room.w,200,20,'wall');
   for(const step of plan.plats.filter(p=>p.room===room.id))block(step.x,-100,step.z,step.w,200,step.d,'wall');
  }
  if(room.kind==='cache'){
   // Art follows the five real colliders. Narrow, tapered piers reveal the
   // depth of the shaft without reading as another broad, walkable floor.
   block(room.x,-205,room.z,room.w,12,room.d,'iron');
   for(const sz of [-1,1])block(room.x,-95,room.z+sz*(room.d/2-10),room.w,190,18,'wall');
   if(plan.section===2)block(room.x,-197,room.z,room.w-35,2,room.d-35,'water');
   for(const [i,step] of plan.plats.filter(p=>p.room===room.id).entries()){
    const pierHeight=step.h+199,pierY=(step.h-199)/2;
    add(new T.CylinderGeometry(17,29,pierHeight,10),'wall',step.x,pierY,step.z);
    for(const y of [-140,-60])add(new T.TorusGeometry(22,3,6,10),'iron',step.x,y,step.z,Math.PI/2);
    if(plan.section===1){
     for(const dz of [-22,0,22])block(step.x,step.h+5,step.z+dz,step.w+5,6,17,'wood');
     for(const sx of [-1,1])block(step.x+sx*(step.w/2-4),step.h-5,step.z,5,17,step.d-6,'iron');
    }else{
     block(step.x,step.h+4,step.z,step.w+5,6,step.d+5,plan.section===2?'iron':'trim');
     for(const dz of [-20,0,20])block(step.x,step.h+9,step.z+dz,step.w-7,2,3,plan.section===2?'trim':'iron');
    }
    for(const sx of [-1,1])block(step.x+sx*(step.w/2-1),step.h+10,step.z,2,2,step.d-16,'optional');
    if(i===0||i===4)for(const sx of [-1,1]){
     const x=step.x+sx*(step.w/2-10),height=room.h-step.h-58;
     add(new T.CylinderGeometry(2.2,2.2,height,6),'iron',x,step.h+30+height/2,step.z);
     add(new T.TorusGeometry(7,2.2,6,8),'trim',x,room.h-26,step.z,Math.PI/2);
    }
   }
   for(const sx of [-1,1]){
    const x=room.x+sx*(room.w/2-25);
    for(const dz of [-160,160])add(new T.CylinderGeometry(18,24,room.h-25,10),'wall',x,(room.h-25)/2,room.z+dz);
   }
   for(const sign of [-1,1])block(room.x+sign*(room.w/2-18),room.h-95,room.z,6,100,room.d-40,'iron');
  }
  if(room.kind==='boss'){
   if(plan.section===1){
    const y=room.h-45;
    add(new T.CylinderGeometry(27,53,58,16,1,true),'iron',room.x,y,room.z);
    add(new T.TorusGeometry(53,5,8,20),'trim',room.x,y-29,room.z,Math.PI/2);
    add(new T.SphereGeometry(9,10,6),'iron',room.x,y-28,room.z);
    block(room.x,room.h-9,room.z,180,14,22,'wood');
   }else if(plan.section===2){
    // Reinforced wall braces frame the Maw's open charging lane.
    for(const sx of [-1,1])for(const dz of [-210,210]){
     block(room.x+sx*(half+5),room.h/2,room.z+dz,12,room.h-20,18,'iron');
     for(const y of [50,130,210])add(new T.SphereGeometry(5,6,4),'trim',room.x+sx*(half-3),y,room.z+dz);
    }
   }else{
    // A suspended seal frames the last arena without creating an unreachable safe ledge.
    for(const radius of [65,100])add(new T.TorusGeometry(radius,5,6,24),'trim',room.x,room.h-24,room.z,Math.PI/2);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;add(new T.OctahedronGeometry(8),'glow',room.x+Math.cos(a)*100,room.h-24,room.z+Math.sin(a)*100);}
   }
  }
  // Wall-hung standards identify the three sections, above walking space.
  for(const sx of [-1,1]){block(room.x+sx*(room.w/2-18),room.h-84,room.z-180,5,102,45,'cloth');}
 }
 for(const [a,b] of plan.links){
  const r=plan.rooms[a],s=plan.rooms[b],horizontal=r.x!==s.x,sgn=horizontal?Math.sign(s.x-r.x):Math.sign(s.z-r.z);
  for(const room of [r,s]){
   const toward=room===r?sgn:-sgn,x=room.x+(horizontal?toward*room.w/2:0),z=room.z+(horizontal?0:toward*room.d/2);
   const radius=plan.revision>=5?122:100,base=72,rotation=horizontal?Math.PI/2:0;
   const sideDoor=plan.revision>=8&&(room.optional||s.optional||r.optional);
   if(plan.revision>=7){
    // Wall posts read clearly from a distance. Earlier half-ring arches had
    // floating ends from some camera angles; old saved art is kept.
    for(const sign of [-1,1]){
     const px=x+(horizontal?0:sign*radius),pz=z+(horizontal?sign*radius:0);
     add(new T.CylinderGeometry(9,11,room.h-26,10),sideDoor?'optional':'iron',px,(room.h-26)/2,pz);
     add(new T.CylinderGeometry(16,14,9,10),'trim',px,room.h-30,pz);
    }
   }else{
     add(new T.TorusGeometry(radius,8,6,24,Math.PI),'trim',x,base,z,0,rotation);
     for(const sign of [-1,1])add(new T.CylinderGeometry(8,10,base,10),'trim',x+(horizontal?0:sign*radius),base/2,z+(horizontal?sign*radius:0));
   }
   if(plan.revision===7){
    const oldSideDoor=room.optional||s.optional||r.optional;
    block(x,base+69,z,horizontal?14:92,8,horizontal?92:14,oldSideDoor?'optional':'route');
   }
  }
 }
 let triangles=0;
 for(const [name,parts]of buckets){const merged=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());if(!merged)throw Error('Prison geometry merge: '+name);geometries.push(merged);triangles+=(merged.index?.count||merged.attributes.position.count)/3;const mesh=new T.Mesh(merged,mats[name]);mesh.name='Prison '+name;group.add(mesh);}
 group.userData.dispose=()=>{geometries.forEach(g=>g.dispose());Object.values(mats).forEach(m=>m.dispose());textures.forEach(t=>t.dispose());};
 return {group,counts:{prison:true,rooms:plan.rooms.length,triangles,drawCalls:group.children.length}};
}
