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
 const mats={wall:new T.MeshStandardMaterial({color:palette[0],map:wallMap,bumpMap:wallMap,bumpScale:1.8,roughness:.94}),floor:new T.MeshStandardMaterial({color:palette[1],map:floorMap,bumpMap:floorMap,bumpScale:1.1,roughness:.9}),trim:new T.MeshStandardMaterial({color:'#b4a18b',roughness:.8}),iron:new T.MeshStandardMaterial({color:'#39424b',metalness:.72,roughness:.48}),wood:new T.MeshStandardMaterial({color:'#69513a',roughness:.85}),cloth:new T.MeshStandardMaterial({color:palette[2],roughness:1}),glow:new T.MeshStandardMaterial({color:'#ffe3a8',emissive:'#ffb04e',emissiveIntensity:1.5}),water:new T.MeshStandardMaterial({color:'#285b60',metalness:.45,roughness:.23})};
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
  const bevel=Math.min(2,(o.h-o.y0)/4),shape=new T.Shape(),w=o.w/2-bevel,d=o.d/2-bevel;shape.moveTo(-w,-d);shape.lineTo(w,-d);shape.lineTo(w,d);shape.lineTo(-w,d);shape.closePath();
  add(new T.ExtrudeGeometry(shape,{depth:o.h-o.y0-2*bevel,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:1,curveSegments:1,steps:1}),'floor',o.x,o.y0+bevel,o.z,-Math.PI/2);
 }
 for(const o of plan.decor){if(o.bar)add(new T.CylinderGeometry(3,3,o.h-o.y0,8),'iron',o.x,(o.h+o.y0)/2,o.z);else if(!o.pillar)box(o,'trim');}
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
  // Wall-hung standards identify the three sections, above walking space.
  for(const sx of [-1,1]){block(room.x+sx*(room.w/2-18),room.h-84,room.z-180,5,102,45,'cloth');}
 }
 for(const [a,b] of plan.links){
  const r=plan.rooms[a],s=plan.rooms[b],horizontal=r.x!==s.x,sgn=horizontal?Math.sign(s.x-r.x):Math.sign(s.z-r.z);
  for(const room of [r,s]){
   const toward=room===r?sgn:-sgn,x=room.x+(horizontal?toward*room.w/2:0),z=room.z+(horizontal?0:toward*room.d/2);
   const radius=plan.revision>=5?122:100,base=72,rotation=horizontal?Math.PI/2:0;
   add(new T.TorusGeometry(radius,8,6,24,Math.PI),'trim',x,base,z,0,rotation);
   for(const sign of [-1,1])add(new T.CylinderGeometry(8,10,base,10),'trim',x+(horizontal?0:sign*radius),base/2,z+(horizontal?sign*radius:0));
  }
 }
 let triangles=0;
 for(const [name,parts]of buckets){const merged=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());if(!merged)throw Error('Prison geometry merge: '+name);geometries.push(merged);triangles+=(merged.index?.count||merged.attributes.position.count)/3;const mesh=new T.Mesh(merged,mats[name]);mesh.name='Prison '+name;group.add(mesh);}
 group.userData.dispose=()=>{geometries.forEach(g=>g.dispose());Object.values(mats).forEach(m=>m.dispose());textures.forEach(t=>t.dispose());};
 return {group,counts:{prison:true,rooms:plan.rooms.length,triangles,drawCalls:group.children.length}};
}
