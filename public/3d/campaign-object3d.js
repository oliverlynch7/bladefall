import {createChestActor,animateChest} from './chest-art.js?v=2184';
import {createQuestMechanism,poseQuestMechanism,questMechanismMetrics} from './quest-mechanisms3d.js?v=2317';
import {createCoinCoffer,animateCoinCoffer} from './coin-coffer3d.js?v=2234';
import * as T from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';

// Authored quest fittings use small, shared meshes, not a new scene per item.
const templates=new Map(),mats={
 wood:new T.MeshStandardMaterial({vertexColors:true,roughness:.87}),
 soft:new T.MeshStandardMaterial({vertexColors:true,roughness:.95}),
 metal:new T.MeshStandardMaterial({vertexColors:true,roughness:.4,metalness:.58}),
 ink:new T.MeshStandardMaterial({vertexColors:true,roughness:1}),
 stone:new T.MeshStandardMaterial({vertexColors:true,roughness:.92})
};
const C={wood:'#795134',edge:'#b78c52',dark:'#342e26',paper:'#e5d7b4',ink:'#62543e',iron:'#617580',gold:'#c49d56',cloth:'#cfbd98',green:'#578957'};
function bevel(w,h,d,b=1){
 b=Math.min(b,w*.16,h*.16,d*.16);const s=new T.Shape();
 s.moveTo(-w/2+b,-h/2+b);s.lineTo(w/2-b,-h/2+b);s.lineTo(w/2-b,h/2-b);s.lineTo(-w/2+b,h/2-b);s.closePath();
 return new T.ExtrudeGeometry(s,{depth:d-2*b,bevelEnabled:true,bevelSize:b,bevelThickness:b,bevelSegments:1,steps:1,curveSegments:1}).translate(0,0,-d/2+b);
}
function build(name){
 if(templates.has(name))return templates.get(name);
 const buckets=new Map();
 const put=(g,color,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{
  g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(1,1,1)));
  if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}g.deleteAttribute('uv');
  const c=new T.Color(color),a=new Float32Array(g.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=c.r;a[i+1]=c.g;a[i+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(a,3));
  if(!buckets.has(mat))buckets.set(mat,[]);buckets.get(mat).push(g);
 };
 const box=(x,y,z,w,h,d,c=C.wood,m='wood',rx=0,ry=0,rz=0,b=0)=>put(b?bevel(w,h,d,b):new T.BoxGeometry(w,h,d),c,m,x,y,z,rx,ry,rz);
 const tube=(points,r,c=C.edge,m='wood',segments=16)=>put(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),segments,r,5,false),c,m);
 const cyl=(x,y,z,r,h,c=C.iron,m='metal',rx=0,rz=0,rt=r,n=12)=>put(new T.CylinderGeometry(rt,r,h,n),c,m,x,y,z,rx,0,rz);
 const ring=(x,y,z,r,t,c=C.gold,m='metal',rx=0)=>put(new T.TorusGeometry(r,t,5,20),c,m,x,y,z,rx);
 const plaque=(pts,depth,c,m,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{
  const shape=new T.Shape();pts.forEach(([a,b],i)=>i?shape.lineTo(a,b):shape.moveTo(a,b));shape.closePath();
  put(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.25,bevelSize:.25,bevelSegments:1,steps:1,curveSegments:2}).translate(0,0,-depth/2),c,m,x,y,z,rx,ry,rz);
 };
 const rivet=(x,y,z,r=1.05)=>cyl(x,y,z,r,1.1,C.gold,'metal',Math.PI/2,0,r*.85,8);
 const grain=(x,y,z,w,h)=>{for(let i=0;i<4;i++)tube([[x-w*.42+i*2,y-h*.35,z],[x-w*.25+i*w*.18,y,z],[x+w*.35-i*2,y+h*.34,z]],.18,i%2?'#634229':'#9b7347','wood',4);};
 const leaf=(x,y,z,size,c=C.green,rz=0)=>{plaque([[0,0],[-size*.48,size*.45],[-size*.28,size],[0,size*1.3],[size*.4,size*.75],[size*.32,size*.28]],.4,c,'soft',x,y,z,0,0,rz);tube([[x,y,z+.5],[x-Math.sin(rz)*size,y+Math.cos(rz)*size,z+.5]],.23,'#a6bf6d','soft',3);};
 const writing=(x,y,z,w,rows=5,flat=false)=>{
  for(let i=0;i<rows;i++){const len=w*(.65+((i*7)%5)*.07);for(let j=0;j<3;j++){
   const xx=x-w*.45+j*len/3,zz=z-i*3.1;
   if(flat)box(xx+len/6,y,zz,len/3-1.2,.18,.65,C.ink,'ink');else box(xx+len/6,y-i*4,z,len/3-1.2,.68,.24,C.ink,'ink');
  }}
 };
 const feet=(width,depth,height)=>{
  for(const x of [-width*.38,width*.38])for(const z of [-depth*.35,depth*.35]){box(x,height/2,z,5.5,height,5.5,C.wood,'wood',0,0,0,.5);box(x,3,z,7,5,7,C.iron,'metal',0,0,0,.4);}
  for(const x of [-width*.38,width*.38])box(x,height*.3,0,4,4,depth*.8,C.edge);
 };
 const tabletop=(y,width=66,depth=42)=>{
  feet(width,depth,y-3);for(let i=0;i<4;i++){const z=-depth*.375+i*depth*.25;box(0,y,z,width,5,depth*.245,i%2?'#9e7547':C.wood,'wood',0,0,0,.45);}
  for(const x of [-width*.42,width*.42])for(const z of [-depth*.38,depth*.38])cyl(x,y+2.8,z,.7,.6,C.iron,'metal',0,0,.7,6);
 };
 const seal=(x,y,z,flat=false)=>{cyl(x,y,z,3.8,1,'#9f4539','soft',flat?0:Math.PI/2,0,3.4,9);};

 if(name==='crate'||name==='bench'){
  if(name==='bench'){tabletop(32,95,42);box(0,11,0,73,4,5,C.edge);}
  else{
   for(let i=0;i<3;i++)for(const side of [-1,1]){box(0,5+i*9,side*18,61,8.5,3,i%2?C.edge:C.wood);box(side*29,5+i*9,0,3,8.5,34,C.wood);}
   for(const x of [-25,25])for(const z of [-19,19]){box(x,14,z,4,30,3,C.iron,'metal');rivet(x,5,z+Math.sign(z)*2,.8);rivet(x,23,z+Math.sign(z)*2,.8);}
   for(let i=0;i<5;i++)box(-25+i*12.5,30,0,12,4,40,i%2?C.edge:C.wood);
  }
 }else if(name==='notice'||name==='diagram'||name==='trail'){
  const metal=name==='diagram',trail=name==='trail',w=trail?79:68;
  for(const x of [-23,23]){box(x,30,-2,6,60,7,C.wood,'wood',0,0,0,.7);box(x,4,-2,11,8,13,C.iron,'metal',0,0,0,.7);}
  box(0,57,-2,w,42,7,metal?'#53656b':C.wood,metal?'metal':'wood',0,0,0,1.2);
  for(const yy of [36,78])box(0,yy,-.3,w+5,4,10,metal?C.gold:C.edge,metal?'metal':'wood',0,0,0,.7);
  for(const x of [-w*.43,w*.43])for(const y of [40,74])rivet(x,y,2.5);
  if(metal){
   box(0,57,2.3,w-14,31,.8,'#b8a47c','metal');
   ring(-18,58,3.2,7,1,C.ink,'ink');for(let i=0;i<6;i++){const a=i*Math.PI/3;box(-18+Math.sin(a)*8,58+Math.cos(a)*8,3.2,2,3,.6,C.ink,'ink',0,0,-a);}
   writing(10,68,3.1,26,5);box(0,43,3.1,46,1,.5,C.ink,'ink');
  }else if(trail){
   plaque([[-24,4],[5,4],[5,10],[26,0],[5,-10],[5,-4],[-24,-4]],.7,'#d3ddc4','soft',0,57,2.8);grain(0,56,2,w,29);
  }else{
   plaque([[-25,-15],[-26,17],[24,16],[26,-13],[12,-15],[-1,-14]],.55,C.paper,'soft',0,57,2.5);
   writing(0,67,3.15,41,5);seal(15,45,3.45);for(const x of [-21,21])rivet(x,71,3.1,.8);
   tube([[-23,42,3],[-19,41,5],[-12,42,4]],.6,'#cfbc91','soft',5);
  }
 }else if(name==='stone'||name==='sunstone'){
  cyl(0,5,0,35,10,'#687575','stone',0,0,31,7);
  plaque([[-27,0],[-29,31],[-19,52],[10,57],[29,39],[27,0]],11,'#8a9890','stone',0,9,0);
  plaque([[-22,3],[-23,30],[-15,46],[8,50],[24,34],[21,3]],.7,'#b4b49a','stone',0,11,5.9);
  if(name==='sunstone'){
   ring(0,43,7.2,8,1.6,C.gold,'metal');for(let i=0;i<8;i++){const a=i*Math.PI/4;plaque([[-1,0],[0,7],[2,0]],.5,C.gold,'metal',Math.sin(a)*12,43+Math.cos(a)*12,7.2,0,0,-a);}
   writing(0,23,7.2,32,2);
  }else{writing(0,49,7,33,5);leaf(-23,12,8,11,'#537752',-.7);leaf(24,9,6,10,'#71844c',.6);}
  tube([[-25,20,6],[-22,24,6.6],[-25,29,6.5]],.6,'#606c63','stone',4);
 }else if(name==='book'||name==='papers'){
  tabletop(38,name==='book'?64:70,42);
  if(name==='book'){
   box(0,43,0,51,4,34,'#375c61','soft',0,0,0,.9);cyl(0,45,-.2,3.4,33,'#274950','soft',Math.PI/2);
   // Several shallow curved leaves around the central binding, rather than a slab.
   for(const side of [-1,1]){
    const pts=[];for(let i=0;i<=6;i++){const x=i*3.8,y=45+Math.sin(i/6*Math.PI)*2.3+i*.23;pts.push([side*x,y]);}
    for(let layer=0;layer<3;layer++)for(let i=0;i<6;i++){
     const [x1,y1]=pts[i],[x2,y2]=pts[i+1],dx=x2-x1,dy=y2-y1;
     box((x1+x2)/2,(y1+y2)/2+layer*.75,0,Math.hypot(dx,dy)+.15,.65,31-layer*.5,layer===2?C.paper:'#cabd9f','soft',0,0,Math.atan2(dy,dx));
    }
    for(let i=0;i<7;i++){box(side*12,50.25,-10+i*3.2,14-i%3*2,.22,.6,C.ink,'ink',0,0,side*.02);}
    for(const z of [-14.5,14.5])box(side*22.2,47,z,4.5,1,3.6,C.gold,'metal');
   }
   box(3,49,17,3,.6,10,'#b35545','soft',.28);box(3,45,21,3,8,.5,'#b35545','soft',.15);
  }else{
   for(let i=0;i<3;i++){box(-3+i*3,42+i*.8,0,44,1,30,i===2?C.paper:'#bdb598','soft',0,(i-1)*.05);}
   writing(0,44.7,9,33,6,true);seal(16,45,10,true);
   cyl(-27,43,0,2.6,34,C.paper,'soft',Math.PI/2);cyl(27,43,-1,2.2,33,C.paper,'soft',Math.PI/2);
   tube([[22,43,-7],[29,45,-17],[31,47,-22]],.6,C.dark,'ink',5);leaf(31,48,-22,8,'#829591',-.8);
  }
 }else if(name==='herbs'){
  cyl(0,2,0,18,4,'#665442','stone',0,0,16,7);
  for(let i=0;i<5;i++){const x=(i-2)*5; tube([[x+3,2,7],[x,7,2],[x+2,13,-2]],2.8,'#b88f53','soft',5);tube([[x+2,9,-2],[x+3,18,-1],[x+1,24,0]],.8,'#729a48','soft',5);leaf(x,17,1,10,i%2?'#4e8b51':'#7f9c45',i%2?.8:-.9);leaf(x+1,22,0,9,'#91b458',-.3+i*.17);}
 }else if(name==='bandages'){
  box(0,3,0,42,6,29,'#7b6150','soft',0,0,0,1.1);
  for(const x of [-12,0,12]){cyl(x,11,0,5,24,'#dfdec5','soft',Math.PI/2);ring(x,11,12.3,3.4,.5,'#a6a997','soft');ring(x,11,12.5,1.5,.45,'#c4c7b1','soft');}
  box(0,16,0,7,1,25,'#a54f44','soft');box(0,18,0,4,3,7,'#86483d','soft',0,0,0,.6);
 }else if(name==='tools'){
  box(0,3,0,52,6,29,'#98714c','soft',0,0,0,1.3);cyl(0,7,-11,4,49,'#70523d','soft',0,Math.PI/2);
  for(let i=0;i<4;i++){const x=-18+i*12;box(x,7,2,8,.9,19,'#775639','soft',0,0,0,.4);cyl(x,9,4,1.5,17,C.edge,'wood',Math.PI/2);}
  box(-18,10,-5,12,4,5,C.iron,'metal',0,0,0,.8);box(-6,10,-5,3,3,10,'#a7b6b4','metal');ring(6,9.8,-6,3.5,1.25,C.iron,'metal',Math.PI/2);box(18,10,-5,6,2,10,'#a7b6b4','metal',0,0,0,.7);
  for(const x of [-23,23]){box(x,6,0,3,1,30,'#513b2e','soft');box(x,7,13,4,3,3,C.gold,'metal');}
 }else if(name==='rope'){
  for(let j=0;j<4;j++){const pts=[];for(let i=0;i<=36;i++){const a=i*Math.PI/18;pts.push([Math.cos(a)*(18+j*3),3+j*1.8,Math.sin(a)*(12+j*2)]);}tube(pts,1.8,j%2?'#c6aa73':'#a48755','soft',50);}
  tube([[25,8,0],[33,5,7],[28,2,23],[38,2,27]],1.8,C.cloth,'soft',12);box(0,11,0,7,3,35,'#695444','soft',0,0,0,.6);
 }else if(name==='coil'){
  for(const x of [-21,21]){box(x,6,0,7,12,27,'#465b66','metal',0,0,0,.8);cyl(x,7,0,3.5,34,'#82999c','metal',Math.PI/2);}
  const pts=[];for(let i=0;i<=100;i++){const a=i/100*Math.PI*14;pts.push([-20+i*.4,11+Math.sin(a)*7,Math.cos(a)*7]);}tube(pts,1.35,'#d6a065','metal',140);
  for(const x of [-24,24])box(x,10,15,7,5,5,C.gold,'metal',0,0,0,.6);
 }else if(name==='pack'){
  box(0,15,0,42,30,27,'#785742','soft',0,0,0,2);box(0,30,0,42,4,28,'#986e4c','soft',0,0,0,1);
  for(const x of [-13,13]){box(x,16,14,4,30,1.8,'#463b30','soft');box(x,21,15,6,6,1.5,C.gold,'metal',0,0,0,.6);}
  box(0,34,0,31,3,21,C.paper,'soft');tube([[-11,37,-9],[0,37,-8],[12,37,-9]],.7,C.cloth,'soft',4);seal(0,36,5,true);
 }else if(name==='handles'){
  for(const x of [-13,13]){cyl(x,8,0,3.8,30,'#71563a','soft',Math.PI/2);for(let i=0;i<7;i++)ring(x,8,-11+i*3.5,3.8,.6,'#a38350','soft');box(x,8,-20,8,8,14,C.iron,'metal',0,0,0,.7);ring(x,8,-29,5,1.5,'#b2bcb1','metal',Math.PI/2);}
 }else if(name==='blade'){
  plaque([[-36,3],[-24,7],[26,6],[39,0],[27,-6],[-24,-7],[-36,-3]],2.5,'#94a7ac','metal',0,4,0,Math.PI/2);
  plaque([[-24,1],[28,1],[37,0],[28,-1],[-24,-1]],.4,'#d6e0d8','metal',0,5.7,0,Math.PI/2);box(-38,4,0,14,3,4,C.iron,'metal');
 }else if(name==='rudder'){
  plaque([[-17,-48],[-23,-20],[-22,32],[-9,43],[20,38],[23,20],[12,-45]],5,C.wood,'wood',0,8,12,Math.PI/2);
  for(let i=-1;i<=1;i++)tube([[i*10,11,-22],[i*10+1,11,10],[i*10-1,11,42]],.35,i%2?C.dark:C.edge,'wood',6);
  box(0,9,-54,10,8,55,'#94623c','wood',0,0,0,1.1);for(const z of [-10,32]){box(0,11.2,z,43,2,5,C.iron,'metal',0,0,0,.4);for(const x of [-15,15])cyl(x,12.5,z,1.5,1,C.gold,'metal',0,0,1.4,8);}
  ring(-7,9,-50,4,1.7,C.iron,'metal',Math.PI/2);ring(-7,9,-70,4,1.7,C.iron,'metal',Math.PI/2);
 }else if(name==='sail'||name==='cape'){
  const cape=name==='cape',w=cape?48:76,d=cape?44:50;
  for(let i=0;i<4;i++)box(0,3+i*2.8,0,w-i*2,4,d-i*2,i%2?'#d6cba9':'#e1d7b7','soft',0,0,0,1.4);
  for(const x of [-w*.34,w*.34]){box(x,13,0,4.5,1.4,d,cape?'#347783':'#7d7460','soft');}
  for(let i=0;i<9;i++)box(-w*.40+i*w*.1,14,d*.41,1,.5,2.2,'#aa9a76','soft');
  if(cape){ring(14,15,-12,4,1.5,C.gold,'metal',Math.PI/2);cyl(14,15,-12,2,1.4,'#448b9c','metal');}
  else{cyl(0,11,-d*.48,6,w,'#dfd4b1','soft',0,Math.PI/2);for(const x of [-w*.34,w*.34])put(new T.TorusGeometry(6.1,1,5,16),'#7d7460','soft',x,11,-d*.48,0,Math.PI/2);}
 }else if(name==='bell'){
  const pts=[[0,3],[16,3],[17,6],[13,9],[11,17],[9,27],[5,31],[0,32]].map(p=>new T.Vector2(...p));
  put(new T.LatheGeometry(pts,20),C.gold,'metal');ring(0,6,0,15,1.1,'#ead39a','metal',Math.PI/2);cyl(0,9,0,3,10,C.dark,'metal');ring(0,36,0,4.2,1.6,C.iron,'metal');
  for(let i=0;i<8;i++){const a=i*Math.PI/4;box(Math.sin(a)*11,15,Math.cos(a)*11,2,6,1,'#886d3a','metal',0,a);}
 }else if(name==='seeds'){
  box(0,12,0,30,24,25,'#768e75','metal',0,0,0,1.9);box(0,25,0,32,3,27,'#b8aa77','metal',0,0,0,.8);box(0,29,0,10,5,6,C.gold,'metal',0,0,0,.7);
  plaque([[-10,-7],[-10,8],[10,8],[10,-7]],.3,C.paper,'soft',0,13,12.8);leaf(0,8,13.5,8,'#587b4c',-.2);
 }
 const meshes=[],bounds=new T.Box3();let triangles=0;
 for(const [m,parts]of buckets){const g=mergeGeometries(parts);parts.forEach(p=>p.dispose());g.computeBoundingBox();g.computeBoundingSphere();bounds.union(g.boundingBox);triangles+=(g.index?.count||g.attributes.position.count)/3;meshes.push({geometry:g,material:mats[m]});}
 // Seat the actual lowest vertex on its authored support, including rope and cloth.
 const lift=-bounds.min.y;if(Math.abs(lift)>.001){for(const m of meshes){m.geometry.translate(0,lift,0);m.geometry.computeBoundingBox();m.geometry.computeBoundingSphere();}bounds.translate(new T.Vector3(0,lift,0));}
 const rec={meshes,triangles,bounds};templates.set(name,rec);return rec;
}
function model(name){if(name.startsWith('mechanism-'))return createQuestMechanism(name);const group=new T.Group(),spec=build(name);for(const item of spec.meshes){const m=new T.Mesh(item.geometry,item.material);m.receiveShadow=true;m.castShadow=true;group.add(m);}group.userData.triangles=spec.triangles;return group;}
export function campaignObjectMetrics(){return questMechanismMetrics().concat([...templates].map(([name,t])=>({name,triangles:t.triangles,meshes:t.meshes.length,min:t.bounds.min.toArray(),max:t.bounds.max.toArray(),finite:t.meshes.every(m=>[...m.geometry.attributes.position.array,...m.geometry.attributes.normal.array].every(Number.isFinite))})));}
let group,world,objects,actors=[],drawn=new WeakSet();
export function syncCampaignObjects(scene,dt=1/60){
 const b=window.__BF3,g=b?.G,defs=window.BFCampaignObjects;
 const eligible=defs&&g&&!g.hub&&!g.trial&&!g.side&&!g.delve&&!g.devBriar&&g.area>=0&&g.zone>=0&&g.zone<8;
 if(!eligible){if(group)group.visible=false;drawn=new WeakSet();window.__campaignObjectDrawn=drawn;window.__CAMPAIGN_OBJECT_STATS={total:0,visible:0,triangles:0,meshes:0,templates:templates.size,items:[]};return;}
 if(world!==g||objects!==g.storyObjects){
  group?.removeFromParent();group=new T.Group();group.name='Campaign clues and supplies';world=g;objects=g.storyObjects;actors=[];drawn=new WeakSet();scene.add(group);
  const shared=new Map();
  for(const o of objects||[]){const spec=defs.spec(o);if(!spec)continue;
   if(spec.visualKey&&shared.has(spec.visualKey)){shared.get(spec.visualKey).aliases.push(o);continue;}
   const node=new T.Group(),coffer=spec.currencyOnly?createCoinCoffer():null,chest=spec.chest?createChestActor(spec.rarity):null,item=coffer?.root||chest?.root||model(spec.model);node.name=o.key;if(spec.size)item.scale.multiplyScalar(spec.size);
   if(spec.support){node.add(model(spec.support));item.position.y=spec.support==='bench'?35:33;}
   node.add(item);group.add(node);const actor={o,node,item,spec,coffer,chest,aliases:[o]};actors.push(actor);if(spec.visualKey)shared.set(spec.visualKey,actor);
  }
 }
 if(group.parent!==scene)scene.add(group);group.visible=true;let visible=0,triangles=0,meshes=0;
 for(const a of actors){
  const {o,node,item,spec}=a;node.position.set(spec.offsetX&&Number.isFinite(o[spec.offsetX])?o[spec.offsetX]:o.x,o.y||0,o.z);node.rotation.y=o.artYaw||0;
  const external=spec.owner==='prison-cache'?!!(g.prison&&window.__PRISON_JOURNEY_ART?.root?.parent&&window.__PRISON_JOURNEY_ART.objects?.has('kd.cache')):!!(spec.owner&&window.BFCampaignCraft?.has(spec.owner));
  node.visible=!external&&Math.hypot(o.x-g.p.x,o.z-g.p.z)<1050&&Math.abs((o.y||0)-g.p.y)<650;
  for(const alias of a.aliases)drawn.add(alias);
  if(!node.visible)continue; // A culled owned model must not resurrect its old placeholder.
  const opened=!!g.storyState?.flags?.['event.'+(spec.openKey||o.key)];
  const chestVisible=a.coffer?animateCoinCoffer(a.coffer,opened,dt):a.chest?animateChest(a.chest,{x:0,y:0,z:0,opened},dt):true;
  item.visible=chestVisible&&!defs.taken(o,g.storyState);if(spec.mechanism)poseQuestMechanism(item,!!(g.storyState?.flags?.['event.'+o.key]||g.storyState?.flags?.[o.key]),dt);drawn.add(o);visible++;
  node.traverseVisible(n=>{if(n.isMesh){meshes++;triangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3;}});
 }
 window.__campaignObjectDrawn=drawn;window.__CAMPAIGN_OBJECT_STATS={total:actors.length,visible,triangles,meshes,templates:templates.size,items:actors.filter(a=>a.node.visible).map(a=>({key:a.o.key,model:a.spec.model,collected:!a.item.visible,opening:a.chest?.opening??a.coffer?.opening??0,aliases:a.aliases.map(o=>o.key),meshes:a.item.children.length,triangles:a.item.userData.triangles}))};
}
