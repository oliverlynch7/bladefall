import * as T from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';
// Shared, bounded quest fittings. Art only: no collider, quest or network mutations.
const cache=new Map(),materials={
 wood:new T.MeshStandardMaterial({vertexColors:true,roughness:.88}),
 metal:new T.MeshStandardMaterial({vertexColors:true,roughness:.48,metalness:.55}),
 stone:new T.MeshStandardMaterial({vertexColors:true,roughness:.94}),
 glow:new T.MeshStandardMaterial({vertexColors:true,roughness:.5,emissive:'#66a7ae',emissiveIntensity:.24})
};
const C={wood:'#795439',edge:'#ae8254',iron:'#526974',steel:'#a3b9ba',brass:'#c49b53',dark:'#283b43',rope:'#c2a676',stone:'#a1aaa0',ivory:'#d8d2b8',blue:'#68cbd4'};
function template(id){
 if(cache.has(id))return cache.get(id);
 const root=new T.Group(),bins=new Map(),moving=new T.Group();moving.name='working-part';root.add(moving);
 const put=(geo,c,mat,x,y,z,rx=0,ry=0,rz=0,dynamic=false)=>{
  geo.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(1,1,1)));
  if(geo.index){const old=geo;geo=geo.toNonIndexed();old.dispose();}geo.deleteAttribute('uv');const color=new T.Color(c),a=new Float32Array(geo.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=color.r;a[i+1]=color.g;a[i+2]=color.b;}geo.setAttribute('color',new T.BufferAttribute(a,3));
  const key=(dynamic?'moving:':'fixed:')+mat;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(geo);
 };
 const box=(x,y,z,w,h,d,c=C.wood,m='wood',rz=0,dyn=false)=>put(new T.BoxGeometry(w,h,d),c,m,x,y,z,0,0,rz,dyn);
 const cylinder=(x,y,z,r,h,c=C.iron,rx=0,rz=0,rt=r,m='metal',dyn=false)=>put(new T.CylinderGeometry(rt,r,h,12),c,m,x,y,z,rx,0,rz,dyn);
 const ring=(x,y,z,r,t,c=C.brass,rx=0,ry=0,m='metal',dyn=false)=>put(new T.TorusGeometry(r,t,5,20),c,m,x,y,z,rx,ry,0,dyn);
 const tube=(p,r,c=C.rope,m='wood')=>put(new T.TubeGeometry(new T.CatmullRomCurve3(p.map(p=>new T.Vector3(...p))),18,r,5,false),c,m,0,0,0);
 const bolts=(x,y,z,w,h)=>{for(const dx of [-1,1])for(const dy of [-1,1])cylinder(x+dx*w/2,y+dy*h/2,z,1.6,2,C.brass,Math.PI/2);};
 const foot=(w=58,d=40)=>{box(0,3,0,w,6,d,C.dark,'metal');bolts(0,4,d/2+1,w-10,0);};
 const wheel=(x,y,z,r=24,dyn=true)=>{ring(x,y,z,r,2.8,C.brass,0,0,'metal',dyn);ring(x,y,z,r-4,.7,C.steel,0,0,'metal',dyn);for(let i=0;i<6;i++){const a=i*Math.PI/3;box(x+Math.sin(a)*r*.45,y+Math.cos(a)*r*.45,z,2.5,r*.9,3,C.steel,'metal',-a,dyn);}cylinder(x,y,z,5,8,C.iron,Math.PI/2,0,5,'metal',dyn);};
 const drum=()=>{for(const x of [-24,24]){box(x,21,0,9,38,29);box(x,10,0,12,3,34,C.iron,'metal');}cylinder(0,29,0,14,42,C.edge,Math.PI/2,0,14,'wood');for(let j=0;j<8;j++)ring(0,29,-17+j*5,14.5,1.1,C.rope);cylinder(0,29,23,17,4,C.iron,Math.PI/2);tube([[0,14,-20],[0,8,-33],[0,2,-45]],1.5);};
 const plate=()=>{foot(50,34);box(0,27,-6,44,48,9,C.iron,'metal');box(0,27,0,35,39,3,C.dark,'metal');bolts(0,27,2,30,32);};
 switch(id){
 case 'winch':case 'brake':case 'shelf-crank':
  foot(65,58);drum();wheel(0,29,29,id==='shelf-crank'?20:24,id!=='brake');
  if(id==='brake'){for(let i=0;i<12;i++){const a=i*Math.PI/6;box(Math.sin(a)*19,29+Math.cos(a)*19,32,5,6,4,C.iron,'metal',-a);}box(22,40,34,6,31,6,C.edge,'wood',-.55,true);cylinder(30,52,34,4,15,C.dark,0,0,4,'metal',true);box(17,22,35,8,13,6,C.steel,'metal',.3);}
  if(id==='shelf-crank'){for(const x of [-25,25]){box(x,7,0,3,3,46,C.brass,'metal');for(const z of [-13,0,13])box(x,10,z,8,3,3,C.brass,'metal');}box(0,49,0,38,3,22,C.ivory,'stone');for(const x of [-10,0,10])box(x,52,0,6,4,15,C.blue,'glow');}break;
 case 'latch':
  plate();for(const x of [-13,13]){box(x,29,6,7,15,9,C.brass,'metal');cylinder(x,29,12,2,3,C.dark,Math.PI/2);}box(0,29,11,39,7,7,C.steel,'metal',0,true);ring(9,20,16,8,2,C.brass,0,0,'metal',true);box(0,9,5,20,9,5,C.iron,'metal');break;
 case 'chain':
  foot(50,40);for(const x of [-18,18])box(x,38,-6,7,70,10,C.iron,'metal');box(0,73,-6,44,8,15,C.brass,'metal');ring(0,63,-2,9,2.4,C.iron);for(let i=0;i<7;i++)ring(0,54-i*7,2,4.6,1.4,i%2?C.steel:C.iron,0,i%2?Math.PI/2:0);ring(0,8,3,8,2.4,C.brass,0,0,'metal',true);box(0,35,-12,30,45,3,C.dark,'metal');break;
 case 'rope-cleat':
  box(0,3,0,47,6,35);for(const x of [-15,15])cylinder(x,4,0,2,8,C.iron);box(0,11,0,32,5,8,C.iron,'metal');for(const x of [-11,11])box(x,8,0,4,9,8,C.iron,'metal');for(let j=0;j<3;j++)tube([[-12,11+j*2,-7],[13,11+j*2,0],[-12,11+j*2,7],[13,11+j*2,0]],1.3);tube([[-10,12,0],[-27,7,6],[-30,2,24]],1.5);for(let j=0;j<3;j++)ring(14,2,24,8+j*3,1.4,C.rope,Math.PI/2,0,'wood');break;
 case 'sluice':case 'valve':
  foot(56,46);cylinder(0,25,-7,10,44,C.iron);for(const y of [10,40]){cylinder(0,y,-7,15,5,C.steel);for(let j=0;j<6;j++){const a=j*Math.PI/3;cylinder(Math.sin(a)*12,y+4,-7+Math.cos(a)*12,1.7,4,C.brass);}}cylinder(0,35,7,5,26,C.steel,Math.PI/2);wheel(0,35,23,id==='sluice'?26:20);
  if(id==='sluice'){box(-23,20,-7,6,35,15,C.brass,'metal');for(const y of [8,15,22,29,36])box(-27,y,3,5,2,2,C.ivory,'stone');tube([[0,46,-7],[0,50,-22],[0,42,-29]],5,C.iron,'metal');}else{cylinder(21,43,-7,10,5,C.ivory,Math.PI/2);ring(21,43,-3,10,1.5);box(23,45,0,1,9,1,C.dark,'metal',-.5);}break;
 case 'pipe-fault':
  foot(76,54);cylinder(0,33,-8,13,58,C.iron);for(const y of [9,55])cylinder(0,y,-8,17,6,C.steel);tube([[0,61,-8],[0,69,-19],[0,63,-33],[0,49,-35]],10,C.iron,'metal');box(0,35,5,17,17,2,C.dark,'metal',.35);for(let i=0;i<4;i++)tube([[i*2-3,35,7],[i*5-8,26,17],[i*7-10,4,25]],.8,C.blue,'glow');ring(0,33,-8,14,2,C.brass,Math.PI/2);cylinder(23,48,-7,12,6,C.ivory,Math.PI/2);ring(23,48,-3,12,1.5);box(24,48,1,1,14,1,C.dark,'metal',.6);break;
 case 'clamp':case 'anchor':
  foot(62,44);for(const x of [-21,21]){box(x,22,-4,10,40,19,C.iron,'metal');box(x,39,0,16,8,28,C.steel,'metal');}box(0,10,-4,44,10,19,C.iron,'metal');cylinder(0,37,0,4,44,C.brass,0,Math.PI/2);for(let i=0;i<9;i++)ring(-16+i*4,37,0,4.4,.5,C.steel,0,Math.PI/2);
  if(id==='anchor'){ring(0,51,0,12,3,C.brass,0,0,'metal',true);tube([[0,43,-7],[0,29,-23],[0,6,-41]],2,C.rope);box(0,35,0,9,21,9,C.steel,'metal',0,true);}else wheel(29,37,0,12);break;
 case 'brace':
  for(const x of [-24,24]){box(x,3,0,18,6,40,C.iron,'metal');box(x,29,0,10,54,12);}box(0,56,0,62,10,14);for(const sign of [-1,1])box(sign*12,28,0,7,53,10,C.edge,'wood',sign*.45);for(const x of [-23,23])for(let j=0;j<4;j++)ring(x,48+j*2,0,7.5,1,C.rope,Math.PI/2,0,'wood');bolts(0,56,8,44,0);break;
 case 'rescue-horn':
  foot(42,32);box(0,17,-5,12,28,12);cylinder(0,35,5,7,24,C.brass,Math.PI/2,0,15);cylinder(0,35,18,13,1,C.dark,Math.PI/2);ring(0,35,19,15,1.5,C.brass);tube([[-8,22,5],[-17,13,5],[-10,5,17],[8,3,12]],1.3);break;
 case 'shackle':
  box(0,3,0,54,6,39,C.stone,'stone');tube([[-15,5,0],[-17,21,0],[-10,32,0],[10,32,0],[17,21,0],[15,5,0]],3,C.iron,'metal');box(0,6,0,38,8,9,C.brass,'metal');for(let i=0;i<4;i++)ring(-23-i*5,5,0,4.5,1.4,C.steel,0,i%2?Math.PI/2:0);break;
 case 'sun-seal':case 'archive':
  cylinder(0,4,0,29,8,C.ivory,0,0,27,'stone');cylinder(0,14,0,21,12,C.stone,0,0,19,'stone');cylinder(0,26,0,24,12,C.ivory,0,0,21,'stone');
  if(id==='sun-seal'){ring(0,53,0,25,3,C.brass);ring(0,53,0,19,1.1,C.blue,0,0,'glow');cylinder(0,53,0,15,7,C.ivory,Math.PI/2);for(let i=0;i<8;i++){const a=i*Math.PI/4;box(Math.sin(a)*24,53+Math.cos(a)*24,1,4,13,3,C.brass,'metal',-a);}cylinder(0,53,5,8,4,C.blue,Math.PI/2,0,3,'glow',true);}
  else{for(const sign of [-1,1]){box(sign*11,37,0,24,3,31,C.brass,'metal',sign*.15);box(sign*11,40,0,22,4,28,C.ivory,'stone',sign*.15);for(let i=0;i<4;i++)box(sign*11,43,-9+i*6,15,1,.8,C.iron,'metal');}ring(0,64,0,18,2,C.brass);cylinder(0,64,0,9,5,C.blue,Math.PI/2,0,3,'glow',true);}break;
 case 'cart-grip':
  for(const x of [-25,25]){box(x,4,0,9,8,27,C.iron,'metal');bolts(x,4,14,0,0);}tube([[-25,7,0],[-25,32,0],[-18,41,0],[18,41,0],[25,32,0],[25,7,0]],3,C.iron,'metal');for(let i=0;i<9;i++)ring(-16+i*4,40,0,3.5,.7,C.rope,0,Math.PI/2,'wood');break;
 case 'keepsake':
  box(0,5,0,39,10,30,C.wood,'wood');box(0,11,0,34,2,25,'#8d4952','wood');ring(-4,16,0,9,2,C.brass,Math.PI/2);cylinder(-4,16,0,7,3,C.ivory,0,0,7,'stone');tube([[3,16,0],[15,15,4],[16,15,-5],[8,15,-9]],.7,C.brass,'metal');break;
 case 'key':
  box(0,3,0,42,6,35,C.wood,'wood');ring(-11,10,0,8,2.5,C.brass,Math.PI/2);cylinder(8,10,0,2.8,27,C.brass,0,Math.PI/2);for(const x of [14,21])box(x,10,6,3,4,9,C.brass,'metal');break;
 default:throw Error('Unknown quest mechanism '+id);
 }
 const pivot=({winch:[0,29,29],brake:[17,25,34],'shelf-crank':[0,29,29],sluice:[0,35,23],valve:[0,35,23],latch:[0,29,11],anchor:[0,37,0],'sun-seal':[0,53,5],archive:[0,64,0]})[id]||[0,0,0];moving.position.fromArray(pivot);
 let triangles=0;for(const [key,parts]of bins){const geo=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());if(!geo)throw Error('Mechanism geometry '+id);if(key.startsWith('moving:'))geo.translate(-pivot[0],-pivot[1],-pivot[2]);geo.computeBoundingBox();geo.computeBoundingSphere();const m=new T.Mesh(geo,materials[key.split(':')[1]]);m.receiveShadow=true;(key.startsWith('moving:')?moving:root).add(m);triangles+=(geo.index?.count||geo.attributes.position.count)/3;}
 const raw=new T.Box3().setFromObject(root);root.position.y=-raw.min.y;root.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(root);root.userData={triangles,pivot,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},id};cache.set(id,root);return root;
}
export function createQuestMechanism(name){const id=name.replace(/^mechanism-/,''),node=template(id).clone(true);node.userData.triangles=template(id).userData.triangles;return node;}
export function poseQuestMechanism(node,active,dt){const part=node.getObjectByName('working-part');if(!part)return;const goal=active?1:0,u=node.userData.used??goal,v=u+(goal-u)*Math.min(1,Math.max(0,dt)*8);node.userData.used=v;const id=node.userData.id;part.scale.setScalar(['sun-seal','archive'].includes(id)?1-v*.22:1);const p=node.userData.pivot;part.position.set(p[0]+(id==='latch'?v*15:0),p[1]+(id==='anchor'?v*9:0),p[2]);part.rotation.set(0,0,['winch','sluice','valve','shelf-crank'].includes(id)?v*Math.PI*.75:id==='brake'?v*-.45:0);}
export function questMechanismMetrics(){return [...cache].map(([name,n])=>({name:'mechanism-'+name,triangles:n.userData.triangles,meshes:n.children.reduce((a,b)=>a+(b.isMesh?1:b.children.length),0),min:n.userData.bounds.min,max:n.userData.bounds.max,finite:(()=>{let f=true;n.traverse(o=>{if(o.isMesh)for(const x of [...o.geometry.attributes.position.array,...o.geometry.attributes.normal.array])if(!Number.isFinite(x))f=false;});return f;})()}));}
