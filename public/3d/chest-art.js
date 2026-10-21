import * as T from './three.module.js';
import {chestExit} from './chest-exit.js?v=2351';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';

// Shared, baked coffers. Brown timber is the foundation at EVERY rarity; the
// fittings, gemstones and silhouette carry the tier. Only the lid is articulated.
export const CHEST_ART_VERSION='2184';
const order=['common','uncommon','rare','epic','legendary'],templates=new Map();
const styles=[
 {wood:'#79533a',woodLight:'#956f4d',iron:'#50575b',edge:'#a7a19a',inlay:'#665b4b',gem:'#aaa49b'},
 {wood:'#725038',woodLight:'#926b45',iron:'#384e3b',edge:'#91a274',inlay:'#597344',gem:'#8be15b'},
 {wood:'#66472f',woodLight:'#896443',iron:'#465568',edge:'#bac8d2',inlay:'#315c9a',gem:'#4cafff'},
 {wood:'#604331',woodLight:'#886247',iron:'#45404f',edge:'#a9a1bc',inlay:'#654586',gem:'#b35dff'},
 {wood:'#583923',woodLight:'#7c502e',iron:'#a8792c',edge:'#eed18a',inlay:'#c5953c',gem:'#ffbd43'}
];
const v3=(x,y,z)=>new T.Vector3(x,y,z);
function beveledBox(w,h,d,b=.12){
 b=Math.min(b,w*.2,h*.2,d*.2);const s=new T.Shape();
 s.moveTo(-w/2+b,-h/2+b);s.lineTo(w/2-b,-h/2+b);s.lineTo(w/2-b,h/2-b);s.lineTo(-w/2+b,h/2-b);s.closePath();
 return new T.ExtrudeGeometry(s,{depth:d-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:1,steps:1,curveSegments:1}).translate(0,0,-d/2+b);
}
function plaque(points,depth=.2,bevel=.06){
 const s=new T.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();
 return new T.ExtrudeGeometry(s,{depth,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:1,steps:1,curveSegments:2}).translate(0,0,-depth/2);
}
// Elliptical shell, including inner and end surfaces. The real lid has thickness.
function arch(w,ry,rz,thick,a0=0,a1=Math.PI,segments=18){
 const pos=[];const tri=(a,b,c)=>pos.push(...a,...b,...c),quad=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d);};
 const p=(x,a,inside)=>[x,Math.sin(a)*(ry-(inside?thick:0)),Math.cos(a)*(rz-(inside?thick:0))];
 for(let i=0;i<segments;i++){
  const a=a0+(a1-a0)*i/segments,b=a0+(a1-a0)*(i+1)/segments;
  quad(p(-w/2,a,0),p(w/2,a,0),p(w/2,b,0),p(-w/2,b,0));
  quad(p(w/2,a,1),p(-w/2,a,1),p(-w/2,b,1),p(w/2,b,1));
  for(const x of [-w/2,w/2]){const q=[p(x,a,0),p(x,b,0),p(x,b,1),p(x,a,1)];if(x>0)q.reverse();quad(...q);}
 }
 quad(p(-w/2,a0,1),p(w/2,a0,1),p(w/2,a0,0),p(-w/2,a0,0));
 quad(p(-w/2,a1,0),p(w/2,a1,0),p(w/2,a1,1),p(-w/2,a1,1));
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeVertexNormals();return g;
}
function build(tier){
 const s=styles[tier],root=new T.Group(),lid=new T.Group();lid.name='hinged-lid';lid.position.set(0,18,-11);root.add(lid);
 const buckets={body:new Map(),lid:new Map()};
 const mats={
  timber:new T.MeshStandardMaterial({vertexColors:true,roughness:.88}),
  iron:new T.MeshStandardMaterial({vertexColors:true,roughness:.48,metalness:.62}),
  edge:new T.MeshStandardMaterial({vertexColors:true,roughness:.31,metalness:.72}),
  dark:new T.MeshStandardMaterial({vertexColors:true,roughness:.93}),
  cloth:new T.MeshStandardMaterial({vertexColors:true,roughness:.95,side:T.DoubleSide}),
  gem:new T.MeshStandardMaterial({color:s.gem,emissive:s.gem,emissiveIntensity:tier===4?.32:.22,roughness:.19,metalness:.18,flatShading:true}),
  inlay:new T.MeshStandardMaterial({vertexColors:true,roughness:.43,metalness:.35})
 };
 for(const [name,m]of Object.entries(mats))m.name=order[tier]+' chest '+name;
 const put=(g,mat,x=0,y=0,z=0,part='body',color,rotation)=>{
  if(rotation)g.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(...rotation)));
  g.translate(x,y,z);if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}
  // All primitives share attributes before merging (extrusions do not have indices).
  if(!g.attributes.uv)g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
  if(mat!=='gem'){
   const c=new T.Color(color||s[mat]||'#30251e'),a=new Float32Array(g.attributes.position.count*3);
   for(let i=0;i<a.length;i+=3){a[i]=c.r;a[i+1]=c.g;a[i+2]=c.b;}g.setAttribute('color',new T.Float32BufferAttribute(a,3));
  }
  const b=buckets[part];if(!b.has(mat))b.set(mat,[]);b.get(mat).push(g);
 };
 const box=(x,y,z,w,h,d,mat='iron',part='body',color,rx=0,ry=0,rz=0,bevel=0)=>put(bevel?beveledBox(w,h,d,bevel):new T.BoxGeometry(w,h,d),mat,x,y,z,part,color,[rx,ry,rz]);
 const line=(points,r,mat,part='body',color)=>{
  const vs=points.map(p=>v3(...p));put(new T.TubeGeometry(new T.CatmullRomCurve3(vs),Math.max(3,(points.length-1)*3),r,4,false),mat,0,0,0,part,color);
 };
 const rivet=(x,y,z,part='body',rot=[Math.PI/2,0,0],r=.35)=>put(new T.CylinderGeometry(r,r*1.15,.24,6), 'edge',x,y,z,part,undefined,rot);
 const plate=(points,x,y,z,part='body',mat='edge',color,depth=.26)=>put(plaque(points,depth),mat,x,y,z,part,color);
 const diamond=(x,y,z,size,part='body',elong=1.3)=>{
  const pts=[[0,size*elong],[size,0],[0,-size*elong],[-size,0]];
  plate(pts,x,y,z,part,'iron',undefined,.45);
  plate(pts.map(([a,b])=>[a*.85,b*.85]),x,y,z+.33,part,'edge',undefined,.25);
  // Raised table and eight sloped crown facets give the gemstone real depth.
  const outer=[[0,1],[.62,.62],[1,0],[.62,-.62],[0,-1],[-.62,-.62],[-1,0],[-.62,.62]],verts=[];
  const p=(i,inner)=>{const [a,b]=outer[(i+8)%8];return [a*size*.67*(inner?.46:1),b*size*elong*.71*(inner?.46:1),size*(inner?.43:.03)];};
  const tri=(a,b,c)=>verts.push(...a,...b,...c);
  for(let i=0;i<8;i++){tri(p(i,0),p(i,1),p(i+1,1));tri(p(i,0),p(i+1,1),p(i+1,0));tri([0,0,size*.43],p(i+1,1),p(i,1));}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.computeVertexNormals();put(g,'gem',x,y,z+.59,part);
  // Small prongs visibly hold the stone rather than letting it float off the front.
  for(const sign of [-1,1])box(x,y+sign*size*elong*.70,z+.75,.32,.65,.42,'edge',part,undefined,0,0,sign*.1);
 };
 const crystal=(x,y,z,size,part='lid')=>{
  const g=new T.OctahedronGeometry(1);g.scale(size*.55,size*1.5,size*.55);put(g,'gem',x,y,z,part);
  put(new T.ConeGeometry(size*.65,size*.8,5),'iron',x,y-size*1.65,z,part,undefined,[Math.PI,0,0]);
 };
 const leaf=(x,y,z,angle,size,part='body',color=s.edge)=>{
  const g=plaque([[0,0],[-size*.5,size*.6],[0,size*1.7],[size*.46,size*.66]],.08,.03);
  put(g,'inlay',x,y,z,part,color,[0,0,angle]);
  const end=[x-Math.sin(angle)*size*1.3,y+Math.cos(angle)*size*1.3,z+.11];line([[x,y,z+.11],end],.065,'edge',part);
 };
 // Floor and dark lining, surrounded by separate horizontal timber boards.
 box(0,2.6,0,30,2.6,21.5,'timber','body',s.wood,0,0,0,.16);
 box(0,4,0,28,.35,19.6,'dark','body','#33251d');
 for(let j=0;j<4;j++){
  const y=5+j*3.45,c=new T.Color(s.wood).lerp(new T.Color(s.woodLight),(j%3)*.23);
  for(const sign of [-1,1]){
   box(0,y,sign*10.6,31.4,3.3,1.55,'timber','body',c,0,0,0,.13);
   box(sign*15,y,0,1.65,3.3,20,'timber','body',c.clone().multiplyScalar(.91),0,0,0,.10);
   // Long, irregular wood fibers; deliberate offsets avoid coplanar flicker.
   for(let k=0;k<3;k++){
    const x=-13+k*8+j*.3,z=sign*11.395,gy=y-.9+(k%2)*1.35;
    line([[x,gy,z],[x+2.6,gy+.09,z],[x+5.8,gy-.04,z]],.037,'dark','body',j%2?'#4c3425':'#ad7c4d');
   }
  }
 }
 // Four wraparound rails, the base shoes and body ribs support the whole chest.
 for(const y of [3,17.5]){
  for(const z of [-11.65,11.65])box(0,y,z,33.1,1.45,1.2,'iron','body',undefined,0,0,0,.14);
  for(const x of [-16,16])box(x,y,0,1.2,1.45,22.2,'iron','body',undefined,0,0,0,.14);
  if(tier>0)for(const z of [-12.29,12.29])box(0,y+.4,z,32.2,.20,.12,'edge');
 }
 for(const x of [-12.5,12.5]){
  for(const z of [-11.7,11.7]){
   box(x,10,z,2.3,14.2,1.1,'iron','body',undefined,0,0,0,.16);
   if(tier>=2)box(x,10,z+Math.sign(z)*.57,.66,12.9,.10,'inlay','body',s.inlay);
   for(const y of [4.8,10,15.3])rivet(x,y,z+Math.sign(z)*.68);
  }
  for(const z of [-9.1,9.1]){
   box(x,1.5,z,5.4,3,5.4,'iron','body',undefined,0,0,0,.28);
   box(x,2.95,z,5.5,.5,5.5,'edge','body',undefined,0,0,0,.10);
   if(tier>=2)plate([[0,2.5],[1.9,-1.2],[0,-.4],[-1.9,-1.2]],x,2.4,z+Math.sign(z)*2.78,'body','edge');
  }
 }
 // The rear barrel has complete wooden end caps and an interior dark shell.
 put(arch(29.4,7.15,10.25,.55),'dark',0,0,11,'lid','#332a23');
 for(let j=0;j<12;j++){
  const a=j*Math.PI/12+.007,b=(j+1)*Math.PI/12-.007;
  const c=new T.Color(s.wood).lerp(new T.Color(s.woodLight),.2+(j%3)*.18);
  put(arch(31.6,8,11.2,.65,a,b,2),'timber',0,0,11,'lid',c);
  for(let k=0;k<2;k++){
   const ang=(a+b)/2+(k-.5)*.055,yy=Math.sin(ang)*8.035,zz=11+Math.cos(ang)*11.235;
   line([[-14.8,yy,zz],[-9,yy+.03,zz],[1.1,yy,zz],[8.5,yy-.025,zz],[14.7,yy,zz]],.035,'dark','lid',j%2?'#563922':'#ad7c4d');
  }
 }
 const capPoints=[[11.0,0]];for(let i=0;i<=18;i++){const a=i*Math.PI/18;capPoints.push([Math.cos(a)*11,Math.sin(a)*7.85]);}capPoints.push([-11,0]);
 for(const x of [-15.85,15.85])put(plaque(capPoints,.40,.06),'timber',x,0,11,'lid',s.wood,[0,Math.PI/2,0]);
 for(const z of [0,22])box(0,.13,z,33,1.05,1.2,'iron','lid',undefined,0,0,0,.1);
 for(const x of [-12.5,12.5]){
  put(arch(2.4,8.75,11.95,.58),'iron',x,0,11,'lid');
  if(tier>0)for(const dx of [-.9,.9])put(arch(.22,8.91,12.10,.12),'edge',x+dx,0,11,'lid');
  for(let j=0;j<7;j++){
   const a=(j+.5)*Math.PI/7;put(new T.SphereGeometry(.32,6,4),'edge',x,Math.sin(a)*8.85,11+Math.cos(a)*12.05,'lid');
  }
 }
 // Side cap rims and ring handles, plus actual brass/iron hinge barrels at the back.
 for(const x of [-16.1,16.1])put(arch(.7,8.25,11.7,.62),'iron',x,0,11,'lid');
 for(const x of [-10,10]){
  box(x,16,-12.4,3.5,4,1.0,'iron','body',undefined,0,0,0,.12);
  put(new T.CylinderGeometry(.75,.75,3.4,10),'edge',x,0,-.5,'lid',undefined,[0,0,Math.PI/2]);
 }
 for(const sign of [-1,1]){
  box(sign*16.4,11,0,.9,4.8,5.4,'iron','body',undefined,0,0,0,.12);
  if(tier>0){
   put(new T.TorusGeometry(2.6,.42,6,16),'edge',sign*17.15,9.5,0,'body',undefined,[0,Math.PI/2,0]);
   put(new T.CylinderGeometry(.65,.65,1.1,8),'edge',sign*16.9,12,0,'body',undefined,[0,0,Math.PI/2]);
  }else box(sign*17,11,0,.65,.85,3.4,'edge','body',undefined,0,0,0,.1);
 }
 if(tier===0){
  // A proper, recessed keyhole on the plain iron hasp.
  plate([[-2.25,3],[2.25,3],[2.25,-2.4],[0,-3.3],[-2.25,-2.4]],0,12.6,12.45,'body','iron',undefined,.5);
  put(new T.CylinderGeometry(.59,.59,.08,10),'dark',0,13.1,12.8,'body','#151719',[Math.PI/2,0,0]);
  plate([[-.25,0],[.25,0],[.48,-1.75],[-.48,-1.75]],0,12.8,12.86,'body','dark','#151719',.02);
  for(const x of [-1.6,1.6])rivet(x,14.7,12.83);
  box(0,-1.2,23,1.8,3.4,.6,'iron','lid',undefined,0,0,0,.12);
 }else{
  diamond(0,12.0,12.5,tier===1?2.4:tier===2?3.1:tier===3?3.55:3.45,'body',1.32);
  // Central saddle rib, with a broad setting for the crest at higher ranks.
  put(arch(tier===1?1.3:1.85,8.63,11.89,.46),'iron',0,0,11,'lid');
  if(tier>=2)put(arch(.55,8.83,12.05,.16),'edge',0,0,11,'lid');
 }
 if(tier===1){
  // Patinated leafwork stays attached to wood and metal instead of coating it green.
  for(const sign of [-1,1]){
   line([[sign*2.5,6,11.48],[sign*5.5,7,11.50],[sign*7,10,11.5],[sign*6.4,13,11.5]],.14,'inlay','body',s.inlay);
   leaf(sign*5.3,7.1,11.65,-sign*.8,1.6);leaf(sign*6.8,10,11.65,sign*.55,1.55);
   leaf(sign*4.6,13.8,11.65,sign*.75,1.4);
   leaf(sign*10,3.3,12.35,-sign*.55,1.2);
   // Small leaves around the domed ends, viewed well from the normal game camera.
   for(const z of [5,16])put(plaque([[0,0],[-.9,1.3],[0,3.5],[.9,1.3]],.12),'inlay',sign*16.25,1.3,z,'lid',s.edge,[0,Math.PI/2,0]);
  }
 }
 if(tier>=2){
  for(const sign of [-1,1]){
   // Arrowhead corner guards and diagonal straps make the frame read from afar.
   plate([[0,3.6],[2.4,0],[1.15,-.9],[0,-3.2],[-1.15,-.9],[-2.4,0]],sign*12.5,12,12.65,'body','edge');
   if(tier===2)diamond(sign*12.5,12,13,1.15,'body',1.4);
   line([[sign*2.9,5.9,12.2],[sign*7.5,8.3,12.2],[sign*10.7,12.3,12.2]],.26,'iron');
   plate([[0,2],[1.55,0],[0,-2],[-1.55,0]],sign*6.5,3.9,12.45,'body','edge');
   if(tier===2){diamond(sign*9,4.9,20.8,1.35,'lid',1.3);}
  }
  if(tier===2){
   diamond(0,6.8,20.1,1.6,'lid',1.4);
   for(const sign of [-1,1])plate([[0,0],[-2.2,1.9],[0,4.5],[2.2,1.9]],sign*12.5,8.2,11,'lid','edge');
  }
 }
 // End-cap planks and decorative side panels make side/rear approaches readable too.
 for(const sign of [-1,1]){
  for(const y of [2.2,4.4,6.6]){const half=11*Math.sqrt(1-(y/8)**2);line([[sign*16.10,y,11-half],[sign*16.10,y,11+half]],.045,'dark','lid','#523722');}
  if(tier>=2){
   for(const z of [-6.8,6.8])box(sign*16.42,10,z,.6,12.5,1.25,'iron');
   for(const y of [5.2,14.7])box(sign*16.8,y,0,.12,.22,17.0,'edge');
   for(const z of [-7,7])put(plaque([[0,2],[1.15,0],[0,-2],[-1.15,0]],.18),'edge',sign*16.85,10,z,'body',s.edge,[0,Math.PI/2,0]);
  }
 }
 const banner=(x,z,col,part='body')=>{
  // Draped, not a flat slab: faceted folds and a pointed hem in front of the wood.
  const positions=[],cs=[];const shade=[.8,1.12,.94,1.04];
  for(let j=0;j<4;j++){
   const xa=x-2.2+j*1.1,xb=xa+1.1,za=z+(j%2)*.25,zb=z+((j+1)%2)*.25;
   const ya=3.8+Math.abs(j-2)*.58,yb=3.8+Math.abs(j+1-2)*.58;
   positions.push(xa,16.5,za,xa,ya,za,xb,yb,zb,xa,16.5,za,xb,yb,zb,xb,16.5,zb);
   const c=new T.Color(col).multiplyScalar(shade[j]);for(let i=0;i<6;i++)cs.push(c.r,c.g,c.b);
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.computeVertexNormals();
  // put fills color, then folds receive explicit shade values.
  put(g,'cloth',0,0,0,part,col);const array=buckets[part].get('cloth');array[array.length-1].setAttribute('color',new T.Float32BufferAttribute(cs,3));
  for(const side of [-1,1])line([[x+side*1.83,16.2,z+.32],[x+side*1.83,5.1,z+.32],[x,3.5,z+.32]],.09,'edge',part);
 };
 if(tier>=3){
  for(const x of [-7.2,7.2]){
   banner(x,12.5,tier===3?'#694091':'#793330');
   for(let j=0;j<3;j++){
    const y=13.5-j*2.15;
    if(tier===3){line([[x-.5,y+.5,12.96],[x+.5,y,12.96],[x-.5,y-.5,12.96]],.09,'inlay','body','#b095d9');box(x,y,12.98,.12,1.6,.12,'inlay','body','#b095d9');}
    else{plate([[0,1],[.38,0],[0,-1],[-.38,0]],x,y,12.98,'body','edge',undefined,.08);}
   }
  }
  // Crystal-tipped corner buttresses are fixed to the BASE below the opening seam.
  for(const x of [-15.1,15.1])for(const z of [-9.5,9.5]){
   put(new T.ConeGeometry(1.3,4.3,5),'edge',x,5,z,'body');
   crystal(x,5,z,.7,'body');
  }
  // Gothic / solar crest and four spires sit on the lid and follow its hinge.
  for(const sign of [-1,1]){
   const points=tier===3?[[0,0],[2.4,1.4],[3.1,4.7],[2.0,3.2],[.4,2.8],[-.7,.8]]:[[0,0],[2.3,2.6],[3.1,8.5],[1.4,5.6],[-1.3,3.5],[-1.5,1.8]];
   const shaped=points.map(([x,y])=>[x*sign,y]);
   plate(shaped,sign*11,8.0,11,'lid','iron',undefined,.8);
   line([[sign*10.3,9,11.48],[sign*12.2,11.2,11.48],[sign*13.7,tier===3?12.7:16.3,11.48]],.18,'edge','lid');
   for(const z of [5.3,17.3]){
    const y=Math.sqrt(Math.max(0,1-((z-11)/11)**2))*8;
    put(new T.ConeGeometry(1.2,3.0,5),'iron',sign*13.3,y+1.5,z,'lid');
    crystal(sign*13.3,y+4.3,z,tier===3?.95:1.05);
   }
  }
  plate([[-3,0],[-2,3],[-2.8,5],[0,4],[2.8,5],[2,3],[3,0]],0,8.4,11,'lid','iron',undefined,.8);
  diamond(0,10.8,11.5,1.75,'lid',1.3);crystal(0,16,11,1.35);
 }
 if(tier===4){
  // Layered radial sunburst around the clasp: gold geometry frames an amber jewel.
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6,length=i%2?5.1:6.7;
   put(plaque([[-.6,3.0],[0,length],[.6,3.0]],.30,.055),'edge',0,12.0,13.05,'body',i%2?s.iron:s.edge,[0,0,a]);
  }
  // Lions on the front corners: a mane, brows, muzzle and ring, not a pasted sphere.
  for(const sign of [-1,1]){
   const x=sign*12.5;
   for(let i=0;i<9;i++){const a=i*Math.PI*2/9;put(new T.ConeGeometry(.64,2.1,4),'iron',x+Math.cos(a)*1.2,12.4+Math.sin(a)*1.7,13.5,'body',s.edge,[0,0,a-Math.PI/2]);}
   put(new T.IcosahedronGeometry(1.3,1).scale(1,1.35,.48),'edge',x,12.7,13.75,'body');
   for(const k of [-1,1]){
    box(x+k*.53,13.15,14.36,.68,.24,.22,'dark','body','#523914',0,0,k*.2);
    put(new T.SphereGeometry(.46,6,4),'edge',x+k*.36,12,14.2,'body');
   }
   plate([[-.42,.18],[.42,.18],[0,-.4]],x,12.45,14.65,'body','iron','#65451d',.1);
   put(new T.TorusGeometry(.9,.19,5,12),'edge',x,11.25,14.5,'body');
  }
  for(const sign of [-1,1]){
   // Solar scrolls along the upper rail and filigree over the dome.
   line([[sign*3.8,16.8,12.55],[sign*6,16.1,12.75],[sign*8.3,16.7,12.75],[sign*8.6,15.5,12.75]],.14,'edge');
   for(const z of [5.6,16.4])crystal(sign*6.2,12,z,.88);
   // Laurel sprays on the dome are raised gold leaves following its curvature.
   for(let j=0;j<4;j++){
    const x=sign*(4.3+j*.92),z=13.3+j*1.75,y=Math.sqrt(1-((z-11)/11.2)**2)*8+.25;
    const g=plaque([[0,0],[-.48,.65],[0,1.5],[.48,.65]],.10,.03);
    put(g,'inlay',x,y,z,'lid',j%2?s.edge:s.inlay,[-.65,0,-sign*.7]);
   }
   line([[sign*3,8.4,12],[sign*5.5,7.7,16.5],[sign*8.9,5.1,20.6]],.21,'edge','lid');
  }
 }
 // At most seven material meshes on each articulated half, shared by all instances.
 let triangles=0,drawCalls=0;
 for(const [part,groups]of Object.entries(buckets))for(const [key,geos]of groups){
  const g=mergeGeometries(geos,false);geos.forEach(p=>p.dispose());g.computeBoundingBox();g.computeBoundingSphere();
  const mesh=new T.Mesh(g,mats[key]);mesh.name=order[tier]+' '+part+' '+key;mesh.castShadow=true;mesh.receiveShadow=key!=='gem';
  (part==='lid'?lid:root).add(mesh);triangles+=g.attributes.position.count/3;drawCalls++;
 }
 root.scale.setScalar(1+tier*.13);
 root.userData={chestArt:CHEST_ART_VERSION,rarity:order[tier],triangles,drawCalls};return root;
}
export function createChestActor(rarity){
 const tier=Math.max(0,order.indexOf(rarity));if(!templates.has(tier))templates.set(tier,build(tier));
 const root=templates.get(tier).clone(true);root.name=order[tier]+' treasure chest';
 return {root,lid:root.getObjectByName('hinged-lid'),tier,opening:0};
}
export function animateChest(rec,ch,dt){
 const step=Number.isFinite(dt)?Math.min(.1,Math.max(0,dt)):0;
 rec.opening=ch.opened?Math.min(1,rec.opening+step/.65):0;
 rec.lid.rotation.x=-1.85*(1-Math.pow(1-rec.opening,3))-(ch.opened?0:(ch._br||0)*.045);
 rec.root.position.set(ch.x+(ch._shove||0),ch.y||0,ch.z);
 return chestExit(rec,!!ch.opened,dt);
}
