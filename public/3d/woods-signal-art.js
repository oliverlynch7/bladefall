import * as THREE from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';

// The collision perches are authored in index.html. This model supplies their exact
// visible walking surfaces, rooted supports, and the landmark they climb toward.
export function buildWoodsSignalArt(obstacles){
 const perches=obstacles.filter(o=>o.woodsSignalPerch);
 const decks=obstacles.filter(o=>o.woodsSignalDeck);
 if(!perches.length)return null;
 const root=new THREE.Group();root.name='black-woods-signal-canopy';
 const bark=new THREE.MeshLambertMaterial({color:0x62442f});
 const shadow=new THREE.MeshLambertMaterial({color:0x382f29});
 const timber=new THREE.MeshLambertMaterial({color:0x96734c});
 const plank=new THREE.MeshLambertMaterial({color:0xba9565});
 const moss=new THREE.MeshLambertMaterial({color:0x638d54});
 const rope=new THREE.MeshLambertMaterial({color:0xd5ba82});
 const iron=new THREE.MeshLambertMaterial({color:0x464c4b});
 const brass=new THREE.MeshLambertMaterial({color:0xc5a267});
 const banner=new THREE.MeshLambertMaterial({color:0x98483d});
 const materials=[bark,shadow,timber,plank,moss,rope,iron,brass,banner];
 const bins=new Map(materials.map(m=>[m,[]]));
 const add=(geo,mat,x,y,z,rotation)=>{
  const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),rotation||new THREE.Quaternion(),new THREE.Vector3(1,1,1));
  const loose=geo.index?geo.toNonIndexed():geo;if(loose!==geo)geo.dispose();
  loose.applyMatrix4(m);bins.get(mat).push(loose);
 };
 const box=(x,y,z,w,h,d,mat)=>add(new THREE.BoxGeometry(w,h,d),mat,x,y,z);
 const beam=(a,b,r,mat,sides=7)=>{
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
  const geo=new THREE.CylinderGeometry(r*.83,r,delta.length(),sides);
  add(geo,mat,...start.clone().add(end).multiplyScalar(.5).toArray(),new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));
 };
 const slats=(p,wide=false,seed=0)=>{
  const {x,z,h,w,d}=p;
  box(x,h-8,z,w,14,d,shadow);
  for(let j=0;j<7;j++){
   const zz=z-d*.43+j*d*.143,shift=((j*3+seed)%5-2)*1.5,len=w-8-((j*7+seed)%4)*2.5;
   box(x+shift,h-.7,zz,len,3.4,d*.126,j%3===0?plank:timber);
   box(x+shift+w*.21,h+1.24,zz-d*.018,len*.21,.48,.8,shadow);
   box(x+shift-w*.25,h+1.24,zz+d*.021,len*.13,.48,.8,bark);
   if((j+seed)%4===0){const lichen=new THREE.IcosahedronGeometry(1,0);lichen.scale(11,1.2,7);add(lichen,moss,x-w*.32+shift,h+1.6,zz);}
  }
  for(const side of [-1,1]){
   box(x+side*(w/2-9),h-9,z,8,9,d-9,timber);
   for(const dz of [-d*.34,d*.34])box(x+side*(w/2-11),h-4,z+dz,13,7,10,iron);
  }
  if(wide){
   for(const side of [-1,1]){
    box(x+side*(w*.45),h+13,z-d*.39,10,26,10,timber);
    beam([x+side*w*.45,h+26,z-d*.39],[x+side*w*.45,h+26,z+d*.14],3,rope,6);
   }
  }
 };
 perches.forEach((p,i)=>{
  slats(p,i===0||i===4||i===10,i);
  if(p.h<12)return;
  // The timber grows out of distinct trees, with branching arms under the deck.
  // The opposite-side placements keep the gaps open for jumping.
  const side=i%2?1:-1,tx=p.x+side*p.w*.40,tz=p.z+(i%3-1)*p.d*.18;
  beam([tx,0,tz],[tx,p.h+42,tz],10+(i%3)*2,bark,9);
  beam([tx,p.h*.55,tz],[p.x-side*p.w*.30,p.h-9,p.z],6,timber);
  beam([tx,p.h*.77,tz],[p.x,p.h-10,p.z+p.d*.34],5,bark);
  for(let k=0;k<3;k++){
   const a=k*Math.PI*2/3+i*.71;
   add(new THREE.IcosahedronGeometry(17+(k%2)*6,1),moss,tx+Math.cos(a)*20,p.h+38+(k%2)*10,tz+Math.sin(a)*19);
  }
  if(i%3===1){
   box(p.x,p.h+11,p.z,5,20,5,iron);
   add(new THREE.ConeGeometry(8,16,5),brass,p.x,p.h+24,p.z);
  }
 });
 for(const [i,deck] of decks.entries()){
  slats(deck,true,14+i*3);
  for(const side of [-1,1])for(const fore of [-1,1]){
   const x=deck.x+side*(deck.w*.37),z=deck.z+fore*(deck.d*.34);
   beam([x,0,z],[x,deck.h-9,z],11,bark,9);
   beam([x,deck.h*.54,z],[deck.x+side*deck.w*.19,deck.h-9,deck.z+fore*deck.d*.17],7,timber);
  }
 }
 // A two-horn timber belfry makes the goal legible from the forest floor.
 const top=220,z=-3175;
 for(const x of [-67,67]){
  box(x,top+92,z,16,184,16,timber);
  box(x,top+176,z,24,9,23,shadow);
  beam([x,top+50,z],[x*.42,top+157,z],7,shadow);
 }
 box(0,top+176,z,164,18,28,timber);
 box(0,top+193,z,150,5,22,brass);
 for(const side of [-1,1]){
  const x=side*99;
  beam([side*67,top+177,z],[x,top+177,z],4,iron);
  box(x,top+143,z,30,66,3,banner);
  box(x,top+163,z+2,5,27,2,brass);
  box(x,top+160,z+2,18,5,2,brass);
 }
 for(const side of [-1,1]){
  const x=side*37;
  beam([x,top+165,z+8],[x,top+130,z+8],5,iron);
  const horn=new THREE.CylinderGeometry(8,26,58,10,1,true);
  add(horn,brass,x,top+125,z+27,new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2));
  beam([x,top+125,z+56],[x,top+125,z+58],26,iron,10);
 }
 for(const [mat,geometries] of bins){
  if(!geometries.length)continue;
  const merged=mergeGeometries(geometries,false);
  geometries.forEach(g=>g.dispose());
  if(!merged)throw Error('Black Woods signal art merge failed');
  root.add(new THREE.Mesh(merged,mat));
 }
 root.userData.dispose=()=>{root.traverse(o=>o.geometry?.dispose());materials.forEach(m=>m.dispose());};
 return root;
}
