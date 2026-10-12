import * as T from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';
import {beveledBoxGeometry,campaignMaterial} from './campaign-materials.js?v=2187a';

// Original reusable environment meshes. Units are centimetre-like game units;
// origin is the centre of the footprint at floor height unless documented.
// Fine construction is merged by material, never a draw call for each nail.
const cache=new Map();
export const CRAFT_PALETTES={
 briar:{stone:'#999985',light:'#c5b89a',wood:'#986139',dark:'#493d32',metal:'#55656c',gold:'#d7ac58',cloth:'#53876d',leaf:'#548953'},
 hollow:{stone:'#a07851',light:'#d5b184',wood:'#9d6e3d',dark:'#544238',metal:'#597377',gold:'#dfb777',cloth:'#b86648',leaf:'#729156'},
 keep:{stone:'#8a9290',light:'#c0bbaa',wood:'#866247',dark:'#3f4d52',metal:'#667d83',gold:'#c3a26b',cloth:'#8b5260',leaf:'#66906d'},
 frost:{stone:'#729cae',light:'#d5eaf0',wood:'#856a58',dark:'#3c5669',metal:'#839eaf',gold:'#d8bc87',cloth:'#507d99',leaf:'#709c98'},
 ember:{stone:'#675d5c',light:'#b1957a',wood:'#855132',dark:'#363c48',metal:'#68727a',gold:'#e2ad58',cloth:'#af4e38',leaf:'#a3774d'},
 coast:{stone:'#798f96',light:'#bfcbc0',wood:'#936b46',dark:'#354c58',metal:'#66888e',gold:'#dfb668',cloth:'#5c9b9f',leaf:'#71a17d'},
 palace:{stone:'#d0c8b0',light:'#f3e5c2',wood:'#88704e',dark:'#516273',metal:'#889da3',gold:'#d5ad57',cloth:'#57999e',leaf:'#659668'},
 castle:{stone:'#777b91',light:'#b9b8c6',wood:'#74624f',dark:'#363c54',metal:'#7b879b',gold:'#c8ab71',cloth:'#785078',leaf:'#63867f'}
};
const matCache=new Map();
function material(kind){if(!matCache.has(kind))matCache.set(kind,kind==='ember'?new T.MeshBasicMaterial({vertexColors:true}):['wood','masonry','stone','ice'].includes(kind)?campaignMaterial(kind,{vertexColors:true,roughness:.85}):new T.MeshStandardMaterial({vertexColors:true,roughness:kind==='metal'?.39:kind==='glass'?.25:.83,metalness:kind==='metal'?.6:.04,side:kind==='cloth'?T.DoubleSide:T.FrontSide}));return matCache.get(kind);}
export function craftBuilder(palette='briar'){
 const p=CRAFT_PALETTES[palette]||CRAFT_PALETTES.briar,bins=new Map();
 function put(g,c,x=0,y=0,z=0,rx=0,ry=0,rz=0,kind='body'){
  if(kind==='body'&&c==='wood')kind='wood';else if(kind==='body'&&c==='stone')kind='masonry';
  if(g.index){const n=g.toNonIndexed();g.dispose();g=n;}
  for(const k of Object.keys(g.attributes))if(!['position','normal'].includes(k))g.deleteAttribute(k);
  const color=new T.Color(p[c]||c),a=new Float32Array(g.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=color.r;a[i+1]=color.g;a[i+2]=color.b;}
  g.setAttribute('color',new T.BufferAttribute(a,3));g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(1,1,1)));
  if(!bins.has(kind))bins.set(kind,[]);bins.get(kind).push(g);return g;
 }
 const box=(x,y,z,w,h,d,c='wood',rz=0,ry=0,kind='body')=>{const g=beveledBoxGeometry(Math.min(.07,1.2/Math.max(1,Math.min(w,h,d))));g.scale(w,h,d);return put(g,c,x,y,z,0,ry,rz,kind);};
 const cyl=(x,y,z,r,h,c='metal',r2=r,rx=0,rz=0,n=12)=>put(new T.CylinderGeometry(r,r2,h,n),c,x,y,z,rx,0,rz,c==='gold'||c==='metal'?'metal':'body');
 const ring=(x,y,z,r,t=2,c='metal',rx=0,ry=0)=>put(new T.TorusGeometry(r,t,5,24),c,x,y,z,rx,ry,0,'metal');
 const ball=(x,y,z,r,c='gold',sx=1,sy=1,sz=1)=>{const g=new T.SphereGeometry(r,10,7);g.scale(sx,sy,sz);put(g,c,x,y,z,0,0,0,c==='gold'?'metal':'body');};
 const rod=(a,b,r=2,c='metal',r2=r)=>{const aa=new T.Vector3(...a),bb=new T.Vector3(...b),dir=bb.clone().sub(aa),g=new T.CylinderGeometry(r2,r,dir.length(),8);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),dir.clone().normalize()));const mid=aa.add(bb).multiplyScalar(.5);put(g,c,mid.x,mid.y,mid.z,0,0,0,c==='metal'||c==='gold'?'metal':'body');};
 const curve=(pts,r=2,c='light',kind='body')=>put(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(v=>new T.Vector3(...v))),Math.max(8,pts.length*3),r,5,false),c,0,0,0,0,0,0,kind);
 const lathe=(points,c='metal',x=0,y=0,z=0,n=16)=>put(new T.LatheGeometry(points.map(v=>new T.Vector2(...v)),n),c,x,y,z,0,0,0,c==='metal'||c==='gold'?'metal':'body');
 const panel=(pts,depth,c,x=0,y=0,z=0,ry=0)=>{const shape=new T.Shape();pts.forEach((v,i)=>i?shape.lineTo(...v):shape.moveTo(...v));shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:Math.min(1,depth*.15),bevelThickness:Math.min(1,depth*.15),bevelSegments:1,curveSegments:8});g.translate(0,0,-depth/2);return put(g,c,x,y,z,0,ry);};
 const bolts=(xs,ys,z)=>{for(const x of xs)for(const y of ys)ball(x,y,z,1.6,'gold',1,1,.5);};
 const wheel=(x,y,z,r=24)=>{ring(x,y,z,r,3,'metal');ring(x,y,z,r-4,2,'wood');cyl(x,y,z,6,12,'metal',6,Math.PI/2);for(let i=0;i<8;i++){const a=i*Math.PI/4;rod([x,y,z],[x+Math.cos(a)*(r-3),y+Math.sin(a)*(r-3),z],1.7,'wood');}};
 const leaf=(x,y,z,angle=0,size=10)=>{const g=new T.SphereGeometry(size,6,4);g.scale(.28,1,.085);put(g,'leaf',x,y,z,.25,angle,angle*.4,'cloth');};
 const finish=()=>{const records=[];for(const [kind,parts]of bins){const geo=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());geo.computeBoundingBox();geo.computeBoundingSphere();records.push({kind,geo,material:material(kind),tri:geo.attributes.position.count/3});}return records;};
 return {p,put,box,cyl,ring,ball,rod,curve,lathe,panel,bolts,wheel,leaf,finish};
}

function construct(name,theme,o){
 const b=craftBuilder(theme),{put,box,cyl,ring,ball,rod,curve,lathe,panel,bolts,wheel,leaf}=b;
 const W=o.w||100,H=o.h||100,D=o.d||80;
 const bands=(z,w,h)=>{for(const y of [h*.2,h*.75])box(0,y,z,w,5,3,'metal',0,0,'metal');bolts([-w*.38,w*.38],[h*.2,h*.75],z+2);};
 if(['cliff','shelf','bank','rock','ice'].includes(name)){
  // Rings retain the full rectangle at the walkable top. Lower layers are
  // inset, not bulged into neighbouring corridors or jumping clearances.
  const n=16,layers=name==='rock'?4:6,iceHeight=(name==='ice'&&!o.fullHeight) ? .45 : 1,vertices=[],indices=[];
  for(let j=0;j<=layers;j++)for(let i=0;i<n;i++){
   const a=i/n*Math.PI*2,dx=Math.cos(a),dz=Math.sin(a),edge=1/Math.max(Math.abs(dx),Math.abs(dz)),top=j===layers;
   const s=name==='bank'?Math.max(.06,Math.pow(1-j/layers,.6))*(.94+.06*Math.sin(i*1.7)**2):name==='rock'?.72+.15*Math.sin(j/layers*Math.PI)+.06*Math.sin(i*1.7+j*.85)**2:top?1:.78+.15*Math.sin(i*1.7+j*.85)**2;
   vertices.push(dx*edge*W/2*s,j/layers*H*iceHeight,dz*edge*D/2*s);
  }
  for(let j=0;j<layers;j++)for(let i=0;i<n;i++){const a=j*n+i,bb=j*n+(i+1)%n,c=a+n,d=bb+n;indices.push(a,c,bb,bb,c,d);}
  vertices.push(0,H*iceHeight,0);const cap=vertices.length/3-1;for(let i=0;i<n;i++)indices.push(cap,layers*n+(i+1)%n,layers*n+i);
  let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();const skin=put(g,name==='ice'?'#8bbacb':'stone',0,0,0,0,0,0,name==='ice'?'ice':'stone'),colors=skin.attributes.color,positions=skin.attributes.position;
  // Color the actual strata, rather than pushing unrelated rings through the rock.
  for(let i=0;i<positions.count;i+=3){const y=(positions.getY(i)+positions.getY(i+1)+positions.getY(i+2))/3,band=Math.min(layers-1,Math.floor(y/(H*iceHeight)*layers)),shade=[.9,1.02,.95,1.05,.91,1][band%6];for(let v=0;v<3;v++)colors.setXYZ(i+v,colors.getX(i+v)*shade,colors.getY(i+v)*shade,colors.getZ(i+v)*shade);}
  if(name==='ice'&&!o.fullHeight)for(let i=0;i<6;i++){const a=i*2.4,r=W*(.06+.065*(i%3)),h=H*(i===0?.68:.35+.045*(i%4)),g=new T.ConeGeometry(W*.11,h,5);put(g,i%2?'#bfe9ed':'#87bdce',Math.cos(a)*r,H*.32+h*.5,Math.sin(a)*D*.23,0,.4*i,.05*(i-2),'ice');}
 }else if(name==='wall'){
  box(0,H/2,0,W,H,D,'stone');
  const rows=Math.min(9,Math.max(2,Math.ceil(H/32))),cols=Math.min(9,Math.max(2,Math.ceil(W/50))),cw=W/cols,rh=H/rows;
  if(o.surfaceDetail!=='painted')for(const side of [-1,1])for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
   const x=-W/2+(i+.5)*cw;box(x,j*rh+rh/2,side*(D/2-.4),cw-2,rh-2,2.8,(i+j)%5===0?'light':'stone');
  }
  // Large enclosing walls use the shared mortar/stone relief instead of
  // hundreds of tiny blocks. Keep real base courses and coping at the edges.
  if(o.surfaceDetail==='painted')box(0,10,0,W+1,20,D+2,'stone');
  box(0,H-4,0,W+1,8,D+1,'light');
 }else if(name==='arch'||name==='cave-mouth'||name==='gatehouse'){
  const gate=name==='gatehouse',ice=name==='cave-mouth'&&theme==='frost',rise=H*.32,spring=H-rise,t=W*.09;
  for(const side of [-1,1]){box(side*(W/2-t/2),spring/2,0,t,spring,D,'stone');box(side*(W/2-t/2),12,0,t+8,24,D+8,'light');box(side*(W/2-t/2),spring-5,0,t+8,12,D+6,'light');}
  for(let i=0;i<13;i++){const a=i*Math.PI/13,aa=(i+1)*Math.PI/13,inner=W*.41,outer=W*.5;const shape=[[Math.cos(a)*inner,spring+Math.sin(a)*(rise-t)],[Math.cos(aa)*inner,spring+Math.sin(aa)*(rise-t)],[Math.cos(aa)*outer,spring+Math.sin(aa)*rise],[Math.cos(a)*outer,spring+Math.sin(a)*rise]];panel(shape,D,ice?(i%3?'#94c4d4':'#c3e4eb'):(i%3?'stone':'light'));}
  if(ice)for(let i=-2;i<=2;i++){const r=4+Math.abs(i)*2;put(new T.ConeGeometry(r,16+Math.abs(i)*9,6),'#a8d4e2',i*W*.14,H*.94,D*.15,Math.PI);}
  if(gate&&!o.noTowers)for(const side of [-1,1]){const x=side*(W/2+W*.14);cyl(x,H*.46,0,W*.18,H*.92,'stone',W*.21);for(const y of [H*.12,H*.72,H*.91])cyl(x,y,0,W*.205,9,'light');for(let j=0;j<8;j++){const a=j*Math.PI/4;box(x+Math.sin(a)*W*.17,H*.98,Math.cos(a)*W*.17,15,25,17,'stone',0,a);}}
 }else if(name==='buttress'){
  panel([[-W/2,0],[W/2,0],[W*.28,H*.7],[W*.12,H],[-W*.23,H]],D,'stone');for(const y of [12,H*.4,H*.73])box(0,y,0,W*.83,8,D+3,'light');
 }else if(name==='roof'){
  // Gable runs down z; sloped planes and separate courses, not a stack of cubes.
  panel([[-W/2,0],[0,H],[W/2,0]],D,'dark');
  for(const side of [-1,1]){const a=Math.atan2(H,W/2),len=Math.hypot(W/2,H);box(side*W/4,H/2+2,0,len+5,4,D+6,'cloth',-side*a);
   for(let r=0;r<6;r++){const u=(r+.5)/6;box(side*W*.5*u,H*(1-u)+4,0,len/6+2,2,D+8,r%2?'cloth':'wood',-side*a);}
   rod([side*W/2,0,D/2+5],[0,H+3,D/2+5],3.5,'wood');rod([side*W/2,0,-D/2-5],[0,H+3,-D/2-5],3.5,'wood');}
  cyl(0,H+4,0,4,D+14,'gold',4,Math.PI/2);for(const z of [-D/2,D/2])box(0,H*.4,z,6,H*.8,8,'wood');
 }else if(name==='cottage'){
  box(0,H/2,0,W,H,D,'light');box(0,5,0,W+8,10,D+8,'stone');
  for(const x of [-W/2+4,W/2-4])for(const z of [-D/2+3,D/2-3])box(x,H/2,z,9,H,9,'wood');
  for(const z of [-D/2-1,D/2+1]){for(const y of [21,H*.72,H-3])box(0,y,z,W,6,5,'wood');for(const side of [-1,1]){rod([side*W*.12,22,z],[side*W*.4,H*.68,z],3,'wood');}}
  const rh=H*.56;panel([[-W*.57,0],[0,rh],[W*.57,0]],D+20,o.damaged?'wood':'dark',0,H,0);
  for(const side of [-1,1]){const angle=Math.atan2(rh,W*.57),len=Math.hypot(W*.57,rh),cols=Math.max(5,Math.round(D/22));for(let row=0;row<7;row++){const u=(row+.5)/7;for(let col=0;col<cols;col++){if(o.damaged&&side<0&&row>3&&col%3===0)continue;const z=-(D+26)/2+(col+.5)*(D+26)/cols;box(side*W*.57*u,H+rh*(1-u)+3,z,len/7+3,3,(D+26)/cols-1.1,(col+row)%5===0?'#7a9680':'cloth',-side*angle);}}}
  for(const z of [-D/2-13,D/2+13])for(const side of [-1,1])rod([side*W*.57,H,z],[0,H+rh,z],3.7,'wood');
  box(W*.3,H+22,-D*.24,22,64,25,'stone');box(W*.3,H+55,-D*.24,28,8,30,'light');box(W*.3,H+60,-D*.24,13,3,17,'dark');
  panel([[-18,0],[-18,49],[-10,59],[10,59],[18,49],[18,0]],5,'dark',0,3,D/2+3);
  for(let i=-2;i<=2;i++)box(i*6,30,D/2+6,5,50,2,'wood');bands(D/2+8,31,56);ball(11,31,D/2+10,2,'gold');
  for(const x of [-W*.31,W*.31]){box(x,H*.52,D/2+3,31,38,6,'wood');box(x,H*.52,D/2+7,23,29,2,'#e7bf72');for(const dy of [-8,8])box(x,H*.52+dy,D/2+9,25,2,3,'dark');box(x,H*.52,D/2+9,2,28,3,'dark');box(x,H*.52-23,D/2+10,37,6,13,'wood');for(const side of [-1,1])box(x+side*20,H*.52,D/2+5,9,32,5,'cloth');}
  // Rear wall and both gables are finished too: every approach has windows,
  // joinery and trim rather than an unadorned triangular back face.
  for(const side of [-1,1]){
   const z=side*(D/2+14);box(0,H+rh*.29,z,6,rh*.6,6,'wood');box(0,H+rh*.18,z,W*.7,5,6,'wood');
   for(const dx of [-1,1])rod([0,H+rh*.45,z],[dx*W*.28,H+rh*.06,z],2,'wood');
   ring(0,H+rh*.35,z+side*2,12,2,'gold');cyl(0,H+rh*.35,z,10,3,'dark',10,Math.PI/2);
  }
  for(const x of [-W*.27,W*.27]){box(x,H*.48,-D/2-3,30,34,6,'wood');box(x,H*.48,-D/2-7,23,27,2,'#d9c18b');box(x,H*.48,-D/2-9,3,28,2,'wood');box(x,H*.48,-D/2-9,24,3,2,'wood');box(x,H*.48-20,-D/2-8,38,5,12,'wood');}
  if(o.damaged){for(const side of [-1,1]){box(side*W*.31,H*.52,D/2+13,36,6,3,'wood',side*.27);box(side*W*.31,H*.4,D/2+13,32,5,3,'dark',-side*.17);}for(const y of [5,12,18])box(0,y,D/2+.5,W*.85,2,1,'#69705c');}
 }else if(name==='window'||name==='door'){
  const door=name==='door';panel([[-W/2,0],[-W/2,H*.76],[-W*.3,H*.95],[0,H],[W*.3,H*.95],[W/2,H*.76],[W/2,0]],D,door?'wood':'dark');
  for(const side of [-1,1])box(side*(W/2-3),H*.4,D/2+1,6,H*.8,5,'light');
  if(door){for(let i=1;i<6;i++)box(-W/2+i*W/6,H*.43,D/2+.4,1,H*.84,1,'dark');bands(D/2+2,W*.9,H);ring(W*.3,H*.43,D/2+5,4,1,'gold');}else{box(0,H*.47,D/2+2,W*.72,H*.64,1,'#eed49a');box(0,H*.46,D/2+4,3,H*.7,3,'wood');box(0,H*.5,D/2+4,W*.8,3,3,'wood');}
 }else if(['bridge','rope-bridge','stone-bridge','scaffold','perch','landing'].includes(name)){
  const stone=name==='stone-bridge',scaffold=name==='scaffold',perch=name==='perch';
  // Deck top is exactly zero: the placement anchor is the collider top.
  if(stone){box(0,-5,0,W,10,D,'stone');for(const side of [-1,1])for(let i=0;i<13;i++){const u=(i+.5)/13,z=-D/2+u*D,depth=12+Math.min(110,D*.15)*(1-Math.sin(u*Math.PI));box(side*(W/2-5),-depth/2-5,z,10,depth,D/13+1,i%2?'light':'stone');}}
  else{const n=Math.min(24,Math.max(3,Math.round(D/18)));for(let i=0;i<n;i++)box(0,-4,-D/2+(i+.5)*D/n,W,8,D/n-1,i%3?'wood':'light');for(const x of [-W*.36,W*.36])box(x,-14,0,9,16,D,'dark');}
  if(o.rails!==false&&!['landing','perch'].includes(name))for(const side of [-1,1]){
   for(const z of [-D*.44,0,D*.44]){box(side*(W/2-4),25,z,7,50,7,stone?'stone':'wood');ball(side*(W/2-4),52,z,5,stone?'light':'gold');}
   if(name==='rope-bridge')curve([[-1,0,0]].map(()=>[side*(W/2-4),47,-D*.44]).concat([[side*(W/2-4),34,0],[side*(W/2-4),47,D*.44]]),2,'light');
   else box(side*(W/2-4),45,0,6,6,D*.9,stone?'light':'wood');
  }
  if(scaffold||perch){for(const x of [-W*.39,W*.39])for(const z of [-D*.38,D*.38]){cyl(x,-H/2-12,z,5,H,'wood',7);rod([x,-H,z],[x*.1,-12,z],3,'wood');}for(const z of [-D*.38,D*.38])box(0,-H*.64,z,W*.82,7,7,'wood');}
 }else if(name==='wagon'||name==='prison-cart'){
  const prison=name==='prison-cart';box(0,30,0,96,10,65,'dark');for(let j=0;j<6;j++)box(0,37,-28+j*11,97,5,10,'wood');
  for(const z of [-38,38])for(const x of [-33,33])wheel(x,23,z,22);
  for(const x of [-43,43])for(const z of [-30,30])box(x,65,z,7,66,7,'wood');
  for(const z of [-31,31])for(const y of [47,70,90])box(0,y,z,98,8,5,'wood');
  for(const x of [-46,46])box(x,60,0,5,40,63,'wood');
  if(!o.freight)for(const z of [-22,22])rod([-47,31,z],[-110,19,z],3.5,'wood');
  if(prison){for(const z of [-30,30])for(let i=-4;i<=4;i++)cyl(i*10,104,z,2,75,'metal');for(const x of [-45,45])box(x,143,0,6,7,68,'metal');box(0,143,0,95,6,65,'dark');}
  else{box(-20,56,0,35,30,40,'cloth');box(23,57,0,37,32,42,'wood');for(const x of [-32,-12,12,32])box(x,58,22,3,34,3,'metal');curve([[-38,42,20],[-36,79,0],[36,79,0],[38,42,-20]],2,'light');}
 }else if(name==='tent'){
  const base=o.openAwning?H*.7:0,rise=H-base,ridge=H;for(const z of [-D*.4,D*.4]){if(o.openAwning){if(!o.existingPosts)for(const side of [-1,1])cyl(side*W*.46,base/2,z,5,base,'wood');}else cyl(0,H/2,z,3,H,'wood');rod([-W/2,base,z],[0,H,z],2,'light');rod([W/2,base,z],[0,H,z],2,'light');}
  for(const side of [-1,1]){const g=new T.PlaneGeometry(Math.hypot(W/2,rise),D,3,4);g.rotateX(-Math.PI/2);g.rotateZ(-side*Math.atan2(rise,W/2));put(g,'cloth',side*W/4,base+rise/2,0,0,0,0,'cloth');}
  for(const z of [-D/2,D/2]){rod([-W*.57,0,z],[0,ridge,z],1.5,'light');rod([W*.57,0,z],[0,ridge,z],1.5,'light');}box(0,2,0,W*.7,3,D*.85,'dark');
 }else if(name==='barricade'){
  for(let i=-2;i<=2;i++){cyl(i*W/5,H*.42,0,5,H*.85,'wood',7,0,.12*(i%2));put(new T.ConeGeometry(5,H*.18,6),'light',i*W/5,H*.94,0);}
  for(const y of [H*.28,H*.65])box(0,y,3,W,7,7,'wood');for(const x of [-W*.36,W*.36])rod([x,H*.65,0],[x,0,D*.5],4,'wood');
 }else if(name==='rack'){
  for(const side of [-1,1]){box(side*W*.4,H*.5,0,7,H,9,'wood');rod([side*W*.4,H*.5,0],[side*W*.4,0,D*.45],3,'wood');}for(const y of [H*.2,H*.75])box(0,y,0,W,7,8,'wood');
  for(let i=-2;i<=2;i++){const x=i*W*.16;box(x,H*.51,8,4,H*.52,4,'metal');panel([[-3,0],[-5,H*.18],[0,H*.31],[5,H*.18],[3,0]],3,'light',x,H*.64,8);box(x,H*.54,10,15,3,4,'gold');}
 }else if(name==='supplies'||name==='barrel'){
  if(name==='barrel'){lathe([[0,0],[18,0],[21,8],[24,25],[21,43],[18,48],[0,48]],'wood');for(const y of [7,24,41]){const r=y===24?24:21;ring(0,y,0,r,2,'metal',Math.PI/2);}for(let i=0;i<10;i++){const a=i*Math.PI/5;curve([[Math.cos(a)*18,1,Math.sin(a)*18],[Math.cos(a)*24,24,Math.sin(a)*24],[Math.cos(a)*18,47,Math.sin(a)*18]],.7,'dark');}}
  else{for(let i=0;i<3;i++){ball((i-1)*22,16+i%2*6,0,19,'light',.74,.86,1);ring((i-1)*22,30+i%2*6,0,5,1,'wood',Math.PI/2);}box(0,3,0,79,6,45,'wood');curve([[-36,11,18],[-20,38,0],[20,38,0],[36,11,-18]],1.8,'dark');}
 }else if(name==='lantern'||name==='sconce'||name==='brazier'){
  const brazier=name==='brazier',sconce=name==='sconce';
  if(brazier){lathe([[0,0],[15,0],[16,5],[7,9],[5,28],[15,36],[20,47],[20,50],[15,46],[0,38]],'metal');for(let i=0;i<6;i++){const a=i*Math.PI/3;rod([Math.cos(a)*18,39,Math.sin(a)*18],[Math.cos(a)*22,59,Math.sin(a)*22],1.5,'gold');}put(new T.ConeGeometry(11,31,7),'#f1b756',0,58,0,0,0,0,'ember');put(new T.ConeGeometry(7,21,6),'#ffe4a1',2,53,1,0,0,0,'ember');}
  else{if(sconce){box(0,24,-10,10,39,4,'metal');curve([[0,14,-8],[0,11,4],[0,24,12]],2,'metal');}lathe([[0,0],[11,0],[13,4],[11,7],[0,7]],'metal',0,0,sconce?12:0);lathe([[0,31],[11,31],[16,34],[0,44]],'metal',0,0,sconce?12:0);const z=sconce?12:0;box(0,18,z,15,19,15,'#f0c475',0,0,'ember');for(const x of [-9,9])for(const dz of [-9,9])rod([x,5,z+dz],[x*.9,31,z+dz*.9],1.3,'dark');ring(0,48,z,5,1.5,'gold');}
 }else if(name==='bench'||name==='workbench'||name==='laboratory'){
  const lab=name==='laboratory';for(const x of [-W*.39,W*.39])for(const z of [-D*.34,D*.34])box(x,H*.45,z,7,H*.9,8,'wood');
  for(const z of [-D*.34,D*.34])box(0,H*.22,z,W*.83,6,6,'wood');for(let i=0;i<5;i++)box(0,H-3,-D/2+(i+.5)*D/5,W,6,D/5-1,'wood');bolts([-W*.4,W*.4],[H-3],D/2+1);
  if(lab){for(let i=-1;i<=1;i++){lathe([[0,0],[7,0],[9,5],[7,12],[3,17],[3,26],[0,26]],i%2?'#86c5d0':'#b4cbdc',i*W*.27,H,0);cyl(i*W*.27,H+27,0,4,3,'gold');}rod([-W*.38,H, -D*.3],[-W*.38,H+48,-D*.3],2,'metal');rod([-W*.38,H+48,-D*.3],[W*.2,H+48,-D*.3],2,'metal');curve([[-W*.3,H+41,-D*.3],[0,H+48,0],[W*.1,H+18,0]],2,'gold');box(W*.28,H+4,D*.2,27,6,22,'cloth');}
  else if(name==='workbench'){box(-W*.2,H+5,0,25,10,18,'dark');box(-W*.2,H+14,0,40,8,16,'metal');cyl(W*.25,H+2,0,10,3,'metal');rod([W*.15,H+3,D*.3],[W*.35,H+3,-D*.3],2,'wood');}
 }else if(name==='bookshelf'||name==='folding-shelf'){
  for(const side of [-1,1])box(side*(W/2-4),H/2,0,8,H,D,'wood');box(0,H/2,-D/2+2,W,H,4,'dark');
  for(let j=0;j<=4;j++){const y=7+j*(H-14)/4;box(0,y,0,W+4,7,D+4,j===0||j===4?'light':'wood');if(j===4)continue;for(let i=0;i<8;i++){const h=(H/4-13)*( .7+((i*7+j*3)%5)/16),x=-W*.43+i*W*.12;box(x,y+4+h/2,4,W*.085,h,D*.7,['cloth','wood','light','dark'][((i+j)%4)]);for(const yy of [y+7,y+h])box(x,yy,D*.39,W*.075,1.5,2,'gold');}}
  for(const side of [-1,1]){box(side*(W/2-4),H-5,0,14,14,D+10,'gold');if(name==='folding-shelf')for(const y of [H*.15,H*.5,H*.85]){cyl(side*W*.48,y,-D*.36,5,17,'metal');box(side*(W*.48-10),y,-D*.43,20,5,4,'gold');}}
 }else if(name==='cell-front'||name==='portcullis'){
  for(const side of [-1,1]){box(side*(W/2-4),H/2,0,8,H,D,'dark');for(const y of [10,H-10])box(side*(W/2-4),y,0,13,9,D+4,'gold');}
  for(let i=1;i<10;i++){const x=-W/2+i*W/10;cyl(x,H/2,0,2.3,H-5,'metal');if(name==='portcullis')put(new T.ConeGeometry(3.5,12,6),'metal',x,2,0,Math.PI);}
  for(const y of [H*.12,H*.7,H*.93])box(0,y,0,W,5,6,'metal');box(W*.28,H*.48,5,11,14,3,'gold');box(W*.28,H*.48,8,2,6,1,'dark');
 }else if(name==='waterwheel'){
  for(const z of [-D*.38,D*.38]){ring(0,0,z,W*.46,W*.045,'wood');ring(0,0,z,W*.4,W*.025,'metal');for(let i=0;i<10;i++){const a=i*Math.PI/5;rod([0,0,z],[Math.sin(a)*W*.43,Math.cos(a)*W*.43,z],W*.022,'wood');}}
  cyl(0,0,0,W*.07,D*1.4,'metal',W*.07,Math.PI/2);for(let i=0;i<14;i++){const a=i*Math.PI/7;box(Math.sin(a)*W*.46,Math.cos(a)*W*.46,0,W*.22,W*.065,D,'wood',-a);}
 }else if(name==='winch'||name==='pulley'||name==='valve'){
  if(name==='winch'){for(const x of [-31,31])box(x,24,0,9,48,36,'wood');cyl(0,28,0,15,65,'wood',15,0,Math.PI/2);for(let i=-5;i<=5;i++)ring(i*4,28,0,16,1.4,'light',0,Math.PI/2);rod([39,28,0],[39,28,23],3,'metal');rod([39,28,23],[53,28,23],3,'wood');}
  else{const r=W*.4;ring(0,0,0,r,Math.max(2,W*.06),'gold');cyl(0,0,0,r*.24,D,'metal',r*.24,Math.PI/2);for(let i=0;i<6;i++){const a=i*Math.PI/3;rod([0,0,0],[Math.cos(a)*r,Math.sin(a)*r,0],2,'metal');}if(name==='pulley')ring(0,0,0,r-3,1.5,'dark');}
 }else if(name==='pressure'){
  box(0,3,0,W,6,D,'dark');box(0,7,0,W-14,3,D-14,'metal');
  for(const side of [-1,1]){box(side*(W/2-5),5,0,5,10,D,'gold');box(0,5,side*(D/2-5),W,10,5,'gold');}
  for(const x of [-W*.33,W*.33])for(const z of [-D*.33,D*.33]){cyl(x,9,z,4,3,'gold');for(let j=0;j<3;j++)ring(x,2+j,z,5,1,'metal',Math.PI/2);}
  for(let j=-2;j<=2;j++)box(j*W*.13,9,0,3,1,D*.57,'dark');
 }else if(name==='counterweight'){
  box(0,H/2,0,W,H,D,'stone');for(const y of [H*.2,H*.8])box(0,y,0,W+3,7,D+3,'metal');for(const side of [-1,1])box(side*W*.32,H*.5,D/2+2,5,H,3,'gold');ring(0,H+7,0,9,2,'metal');
 }else if(name==='crane'){
  for(const x of [-W*.36,W*.36]){box(x,H*.47,0,14,H*.94,20,'wood');box(x,9,0,23,18,30,'metal');rod([x,H*.5,0],[x,0,D*.4],5,'wood');}
  box(0,H*.94,0,W,18,23,'wood');for(const side of [-1,1])rod([side*W*.36,H*.66,0],[0,H*.94,0],4,'wood');
  box(0,H*.95,-D*.25,16,15,D*.72,'wood');ring(0,H*.91,-D*.57,14,4,'gold',0,Math.PI/2);
  if(!o.liveCable){curve([[0,36,10],[0,H*.99,10],[0,H*.98,-D*.57],[0,H*.45,-D*.57]],2,'light');ring(0,H*.4,-D*.57,9,2.8,'metal');}
 }else if(name==='pipe'){
  cyl(0,H/2,0,W*.36,H,'metal',W*.36);for(const y of [5,H*.45,H-5]){cyl(0,y,0,W*.5,7,'gold');for(let i=0;i<6;i++){const a=i*Math.PI/3;ball(Math.cos(a)*W*.45,y+4,Math.sin(a)*W*.45,2,'dark');}}
 }else if(name==='bellows'){
  panel([[-W*.42,0],[-W*.5,H*.62],[-W*.18,H],[W*.18,H],[W*.5,H*.62],[W*.42,0]],D,'dark');for(let i=0;i<6;i++)box(0,H*.2+i*H*.1,0,W*(.87-i*.04),4,D+3,i%2?'cloth':'wood');box(0,H+4,0,W*.34,10,D+8,'wood');cyl(0,H*.5,D*.7,8,D*.6,'metal',13,Math.PI/2);
 }else if(name==='furnace'){
  // Open arched fire mouth; body above it remains a chimney, not a glowing box.
  for(const side of [-1,1])box(side*W*.37,H*.48,0,W*.26,H*.96,D,'stone');box(0,H*.79,0,W*.9,H*.42,D,'stone');
  panel([[-W*.25,0],[-W*.25,H*.3],[0,H*.42],[W*.25,H*.3],[W*.25,0]],3,'dark',0,3,D*.34);
  for(let i=0;i<9;i++){const a=i*Math.PI/8;box(Math.cos(a)*W*.27,H*.24+Math.sin(a)*H*.2,D*.5+2,W*.09,H*.1,9,'light',a-Math.PI/2);}
  box(0,9,D*.43,W*.44,9,D*.22,'#d9501e',0,0,'ember');for(let i=-2;i<=2;i++){
   put(new T.ConeGeometry(W*.046,H*(.18+(i%2?0:.045)),7),'#ff8f37',i*W*.075,H*.115,D*.43,0,0,i*.045,'ember');
   put(new T.ConeGeometry(W*.023,H*.12,6),'#ffe0a0',i*W*.075,H*.095,D*.46,0,0,-i*.035,'ember');
   box(i*W*.1,H*.18,D*.52,3,H*.34,4,'metal');
  }
  for(const y of [H*.5,H*.91])box(0,y,0,W+5,9,D+6,'metal');for(const x of [-W*.38,W*.38])for(const y of [H*.18,H*.52,H*.86])ball(x,y,D*.52,3,'gold');
  cyl(0,H+H*.18,0,W*.2,H*.36,'metal',W*.24);cyl(0,H*1.36,0,W*.27,8,'gold');
 }else if(name==='press'){
  for(const side of [-1,1]){box(side*W*.4,H/2,0,W*.12,H,D*.7,'metal');box(side*W*.4,9,0,W*.2,18,D,'dark');}box(0,H-10,0,W,20,D*.7,'metal');
  if(!o.frameOnly){box(0,10,0,W*.78,20,D,'stone');cyl(0,H*.74,0,W*.09,H*.35,'metal');box(0,H*.53,0,W*.65,17,D*.85,'metal');for(const side of [-1,1])box(side*W*.28,H*.55,D*.44,12,5,3,'gold');}
 }else if(name==='wreck'){
  // Open broken hull: curved rib sections and strakes leave the inner deck readable.
  const ribs=9;
  for(let j=0;j<ribs;j++){const z=-D*.47+j*D*.94/(ribs-1),s=.5+.5*Math.sin((j+.6)/(ribs+.2)*Math.PI),pts=[];
   for(let i=0;i<9;i++){const a=-Math.PI*.48+i*Math.PI*.96/8;pts.push([Math.sin(a)*W*.48*s,H*.75*(1-Math.cos(a)),z]);}
   // Rose's wreck has a deliberately broken port side beside the ballista.
   curve(o.port&&(j===3||j===4)?pts.slice(4):pts,Math.min(5,W*.02),'wood');
  }
  for(const side of [-1,1])for(let row=1;row<=4;row++){const pts=[];for(let j=0;j<ribs;j++){const s=.5+.5*Math.sin((j+.6)/(ribs+.2)*Math.PI);pts.push([side*W*.48*s*row/4,H*.75*(1-Math.cos(row/4*Math.PI*.48)),-D*.47+j*D*.94/(ribs-1)]);}if(o.port&&side<0&&row>1){curve(pts.slice(0,3),4.4,row%2?'wood':'dark');curve(pts.slice(5),4.4,row%2?'wood':'dark');}else curve(pts,4.4,row%2?'wood':'dark');}
  // Actual planking between the ribs. Broken sections expose the framing;
  // the usable port-side opening stays clear next to Rose's ballista.
  const hullPoint=(side,j,row)=>{const a=row/6*Math.PI*.48,s=.5+.5*Math.sin((j+.6)/(ribs+.2)*Math.PI);return [side*W*.48*s*Math.sin(a),H*.75*(1-Math.cos(a)),-D*.47+j*D*.94/(ribs-1)];};
  for(const side of [-1,1])for(let row=0;row<6;row++)for(let j=0;j<ribs-1;j++){
   if((o.port&&side<0&&j>=2&&j<=4&&row>1)||(row>3&&(j+row+side*2)%7===0)||(row===5&&(j===0||j===7)))continue;
   const points=[hullPoint(side,j+.035,row+.05),hullPoint(side,j+.965,row+.05),hullPoint(side,j+.965,row+.96),hullPoint(side,j+.035,row+.96)],v=[];
   for(const inset of [0,-side*3.5])for(const p of points)v.push(p[0]+inset,p[1],p[2]);
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex([0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0]);g.computeVertexNormals();put(g,(j+row)%5===0?'dark':'wood',0,0,0,0,0,0,'wood');
  }
  for(let j=0;j<ribs;j++){const z=-D*.44+j*D*.88/(ribs-1),s=.45+.5*Math.sin((j+.6)/(ribs+.2)*Math.PI);box(0,4,z,W*.7*s,7,D/ribs*.87,'wood');}
  cyl(W*.1,H*.78,-D*.15,7,H*1.5,'wood',10,0,-.19);rod([W*.1,H*1.4,-D*.15],[-W*.29,16,D*.31],1.8,'light');
 }else if(name==='ballista'){
  box(0,25,0,90,14,45,'wood');for(const x of [-29,29])for(const z of [-29,29])wheel(x,20,z,19);box(0,53,0,20,21,105,'wood');box(0,67,0,5,4,118,'dark');
  for(const side of [-1,1])curve([[0,58,-31],[side*34,61,-28],[side*67,63,-9],[side*79,62,12]],5,'wood');curve([[-79,62,12],[0,64,40],[79,62,12]],1.5,'light');
  rod([0,67,48],[0,67,-71],2.8,'metal');put(new T.ConeGeometry(7,18,4),'light',0,67,-77,-Math.PI/2);for(const x of [-18,18])box(x,44,34,8,38,7,'metal');wheel(0,51,40,13);
 }else if(name==='bollard'){
  cyl(0,17,0,8,34,'wood',11);box(0,34,0,30,8,13,'metal');for(let j=0;j<3;j++)ring(0,16+j*4,0,10,1.7,'light',Math.PI/2);curve([[10,18,0],[25,4,10],[31,3,24],[17,3,30],[9,3,18],[18,3,10]],2,'light');
 }else if(name==='fountain'){
  lathe([[0,0],[W*.44,0],[W*.5,9],[W*.5,21],[W*.43,27],[W*.4,12],[W*.16,12],[W*.08,18],[W*.06,H*.6],[W*.25,H*.67],[W*.28,H*.77],[W*.22,H*.83],[W*.14,H*.7],[W*.06,H*.66],[0,H*.7]],'stone');
  ring(0,22,0,W*.475,3,'gold',Math.PI/2);cyl(0,14,0,W*.39,2,'#70babe');cyl(0,H*.72,0,W*.19,2,'#91d4d0');ball(0,H*.9,0,H*.13,'gold',.65,1,.65);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;ball(Math.cos(a)*W*.46,15,Math.sin(a)*W*.46,6,'light',1,1.6,1);}
 }else if(name==='mirror'){
  // Pivot at optical centre; the gameplay ray and this surface share yaw.
  box(0,0,0,W*.74,H*.83,3,'#a9d6d9',0,0,'glass');
  const pts=[[-W/2,-H/2],[-W/2,H*.29],[-W*.28,H/2],[W*.28,H/2],[W/2,H*.29],[W/2,-H/2]];
  for(let i=0;i<pts.length;i++){const a=pts[i],bb=pts[(i+1)%pts.length];rod([a[0],a[1],0],[bb[0],bb[1],0],3.4,'gold');}
  for(const side of [-1,1]){curve([[side*W*.45,-H*.4,0],[side*W*.62,0,0],[side*W*.46,H*.38,0]],2,'metal');ball(side*W*.5,0,0,5,'gold');}ball(0,H*.56,0,6,'gold',.7,1.5,.7);
 }else if(name==='receiver'){
  cyl(0,7,0,30,14,'stone',36);cyl(0,H*.4,0,8,H*.7,'gold',14);ring(0,H*.79,0,W*.35,4,'gold');cyl(0,H*.79,0,W*.26,8,'#d0c78e',W*.26,Math.PI/2);for(let i=0;i<12;i++){const a=i*Math.PI/6;rod([Math.cos(a)*W*.37,H*.79+Math.sin(a)*W*.37,0],[Math.cos(a)*W*.49,H*.79+Math.sin(a)*W*.49,0],2,'gold',.4);}
 }else if(name==='balustrade'){
  for(const y of [4,H-3])box(0,y,0,W,8,D,'light');const n=Math.max(2,Math.min(12,Math.floor(W/23)));for(let i=0;i<n;i++)lathe([[7,0],[7,5],[3,H*.24],[5,H*.48],[3,H*.73],[7,H-12],[7,H-8]],'stone',-W*.46+i*W*.92/(n-1),8,0,8);
 }else if(name==='throne'){
  for(const x of [-W*.35,W*.35])for(const z of [-D*.3,D*.3])box(x,H*.16,z,12,H*.32,12,'metal');box(0,H*.3,0,W*.85,13,D*.85,'gold');box(0,H*.35,0,W*.72,10,D*.72,'cloth');
  panel([[-W*.42,0],[-W*.46,H*.53],[-W*.28,H*.59],[0,H*.8],[W*.28,H*.59],[W*.46,H*.53],[W*.42,0]],12,'metal',0,H*.3,-D*.37);
  panel([[-W*.28,0],[-W*.3,H*.46],[0,H*.61],[W*.3,H*.46],[W*.28,0]],4,'cloth',0,H*.36,-D*.28);
  for(const side of [-1,1]){box(side*W*.44,H*.48,0,10,9,D*.86,'gold');cyl(side*W*.44,H*.37,D*.33,5,H*.2,'metal');ball(side*W*.44,H*.53,D*.32,9,'gold');}
  // Raised royal crest, piping, rivets and carved arms distinguish the throne
  // from an ordinary chair at the actual boss-room viewing distance.
  for(const side of [-1,1]){
   curve([[side*W*.3,H*.38,-D*.25],[side*W*.31,H*.81,-D*.25],[0,H*.975,-D*.25]],2.4,'gold');
   for(const y of [.43,.58,.73])ball(side*W*.24,H*y,-D*.215,2,'gold',1,1,.35);
   lathe([[6,0],[8,4],[6,H*.1],[3,H*.2],[4,H*.27],[2,H*.32]],'gold',side*W*.39,0,D*.34,10);
   ring(side*W*.44,H*.5,D*.38,5,1.5,'gold');
  }
  ring(0,H*.77,-D*.235,W*.11,2.5,'gold');put(new T.OctahedronGeometry(W*.055),'gold',0,H*.77,-D*.2,0,0,0,'metal');
  for(let i=0;i<8;i++){const a=i*Math.PI/4;rod([Math.cos(a)*W*.14,H*.77+Math.sin(a)*W*.14,-D*.235],[Math.cos(a)*W*.19,H*.77+Math.sin(a)*W*.19,-D*.235],1.6,'gold');}
  for(const side of [-1,1])rod([side*W*.36,H*.38,D*.42],[side*W*.36,H*.4,-D*.22],1.8,'gold');
  for(const x of [-W*.38,0,W*.38])put(new T.OctahedronGeometry(9),'gold',x,H*(x? .87:1.08),-D*.37);
 }else if(name==='root'||name==='trunk'){
  const trunk=name==='trunk';if(trunk){cyl(0,13,0,14,W,'wood',19,0,Math.PI/2);cyl(-W/2,13,0,11,2,'light',11,0,Math.PI/2);for(let i=0;i<7;i++){const a=i*Math.PI/3.5;rod([-W/2,13+Math.cos(a)*13,Math.sin(a)*13],[W/2,13+Math.cos(a)*11,Math.sin(a)*11],2,'dark');}rod([W*.2,17,0],[W*.31,43,19],4,'wood',2);}
  else for(let i=0;i<5;i++){const a=i*1.27;curve([[0,H,0],[Math.cos(a)*W*.1,H*.45,Math.sin(a)*D*.1],[Math.cos(a)*W*.35,8,Math.sin(a)*D*.35],[Math.cos(a)*W*.48,1,Math.sin(a)*D*.48]],Math.max(2,W*.025),'wood');}
 }else if(name==='foliage'){
  for(let j=0;j<13;j++){const a=j*2.4,r=(j%4+1)*W*.08,x=Math.cos(a)*r,z=Math.sin(a)*r,h=H*(.5+j%3*.2);rod([x,0,z],[x,h,z],.7,'leaf');for(const side of [-1,1])leaf(x+side*4,h*.65,z,a+side*.6,7);if(j%4===0)ball(x,h,z,3,theme==='palace'?'#ecd889':'#dfc580',1,.7,1);}
 }else throw new Error('Unknown campaign craft model: '+name);
 return b.finish();
}
export const CRAFT_MODEL_NAMES=['cliff','shelf','bank','rock','ice','wall','arch','cave-mouth','gatehouse','buttress','roof','cottage','window','door','bridge','rope-bridge','stone-bridge','scaffold','perch','landing','wagon','prison-cart','tent','barricade','rack','supplies','barrel','lantern','sconce','brazier','bench','workbench','laboratory','bookshelf','folding-shelf','cell-front','portcullis','waterwheel','winch','pulley','valve','pressure','counterweight','crane','pipe','bellows','furnace','press','wreck','ballista','bollard','fountain','mirror','receiver','balustrade','throne','root','trunk','foliage'];
export function craftModel(name,theme='briar',options={}){const key=name+'|'+theme+'|'+JSON.stringify(options);if(!cache.has(key))cache.set(key,construct(name,theme,options));return cache.get(key);}
export function createCraftModel(name,theme='briar',options={}){const group=new T.Group();group.name='Craft '+name;for(const rec of craftModel(name,theme,options)){const mesh=new T.Mesh(rec.geo,rec.material);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}group.userData.craft={name,theme,options};return group;}
export function craftCacheStats(){let triangles=0;for(const list of cache.values())for(const r of list)triangles+=r.tri;return {models:cache.size,triangles,materials:matCache.size};}
