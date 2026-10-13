import * as T from './three.module.js';
import {craftBuilder,createCraftModel} from './campaign-craft-models.js?v=2187a';
import {campaignMaterial} from './campaign-materials.js?v=2187a';

// Ground trails describe actual walking lanes. No route mesh supplies collision.
export function buildBriarJourneyArt(w){
 const g=window.__BF3?.G,j=g?.briarJourney;if(!j||w.zone!=='outskirts'||w.area<0||w.side||w.delve||w.endless||w.briarBeta)return null;
 const root=new T.Group();root.name='Briar paths and mill';const ownedGeo=[],ownedMat=[],textures=[],signs=[];
 const custom=b=>{const group=new T.Group();for(const r of b.finish()){ownedGeo.push(r.geo);const mesh=new T.Mesh(r.geo,r.material);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}root.add(group);return group;};
 const craft=(type,x,y,z,opts={})=>{const n=createCraftModel(type,'briar',opts);n.position.set(x,y,z);root.add(n);return n;};
 const soil=new T.Color('#b2a078'),edge=new T.Color(w.area===1?'#657246':'#80984f');
 const positions=[],colors=[],uv=[],lines=[],cells=new Set(),sampled=new Map(),step=24;
 // A shared grid joins every fork without coplanar overlapping ribbons. Samples
 // use the distance to the nearest authored trail, including bends inside rooms.
 for(const path of j.paths)for(let k=1;k<path.points.length;k++){
  const a=path.points[k-1],b=path.points[k],dx=b[0]-a[0],dz=b[1]-a[1],length2=dx*dx+dz*dz;
  if(length2<1||Math.abs(a[2])>2||Math.abs(b[2])>2)continue;
  const line={a,b,dx,dz,length2,r:path.width/2};lines.push(line);
  for(let x=Math.floor((Math.min(a[0],b[0])-line.r-step)/step);x<=Math.ceil((Math.max(a[0],b[0])+line.r+step)/step);x++)
   for(let z=Math.floor((Math.min(a[1],b[1])-line.r-step)/step);z<=Math.ceil((Math.max(a[1],b[1])+line.r+step)/step);z++)cells.add(x+','+z);
 }
 const strength=(x,z)=>{const key=x+','+z;if(sampled.has(key))return sampled.get(key);let distance=2;
  for(const l of lines){const t=Math.max(0,Math.min(1,((x-l.a[0])*l.dx+(z-l.a[1])*l.dz)/l.length2));distance=Math.min(distance,Math.hypot(x-l.a[0]-t*l.dx,z-l.a[1]-t*l.dz)/l.r);}
  const v=Math.max(0,Math.min(1,(1-distance)/.3));sampled.set(key,v);return v;
 };
 for(const cell of cells){const [ix,iz]=cell.split(',').map(Number),x=ix*step,z=iz*step,cx=x+step/2,cz=z+step/2;
  if(w.area===0&&cz<-2040&&cz>-2280)continue;
  if(!(w.segments||[]).some(o=>!o.nofloor&&Math.abs(cx-o.x)<o.w/2&&Math.abs(cz-o.z)<o.d/2))continue;
  if((w.obstacles||[]).some(o=>!o.millCrate&&!o.nocol&&o.h>3&&(o.kind==='plat'&&!o.earth?o.h-(o.slab||14):(o.y0||0))<3&&Math.abs(cx-o.x)<o.w/2&&Math.abs(cz-o.z)<o.d/2))continue;
  const p=[[x,z],[x+step,z],[x,z+step],[x+step,z+step]].map(([x,z])=>[x,z,strength(x,z)]);
  if(p.every(q=>q[2]===0))continue;
  for(const n of [0,2,1,1,2,3]){const [x,z,v]=p[n],c=edge.clone().lerp(soil,v);positions.push(x,2.5,z);colors.push(c.r,c.g,c.b);uv.push(x/140,z/140);}
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();ownedGeo.push(geo);
 const roadMat=campaignMaterial('soil',{vertexColors:true,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});ownedMat.push(roadMat);
 const road=new T.Mesh(geo,roadMat);road.receiveShadow=true;root.add(road);
 // Every sign belongs to a route junction and names the actual destinations there.
 for(const s of j.signs){
  const b=craftBuilder('briar');b.box(0,60,0,13,120,13,'wood');b.box(0,9,0,23,18,23,'stone');
  b.box(0,112,0,158,62,9,'dark');for(const y of [85,139])b.box(0,y,5,166,6,6,'wood');for(const x of [-77,77])b.box(x,112,5,6,62,6,'wood');
  const n=custom(b);n.position.set(s.x,0,s.z);signs.push(n);
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=192;const c=canvas.getContext('2d');c.fillStyle='#382d20';c.fillRect(0,0,512,192);c.textAlign='center';c.textBaseline='middle';
  s.rows.forEach((line,i)=>{c.font='bold '+(line.length>24?23:28)+'px sans-serif';c.fillStyle=i===0?'#ffe5a6':'#f5efd6';c.fillText(line,256,192/(s.rows.length+1)*(i+1),482);});
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);
  const mat=new T.MeshBasicMaterial({map:texture,toneMapped:false});ownedMat.push(mat);const boardGeo=new T.PlaneGeometry(148,54);ownedGeo.push(boardGeo);
  for(const side of [-1,1]){const label=new T.Mesh(boardGeo,mat);label.position.set(0,112,side*7.1);label.rotation.y=side===1?0:Math.PI;n.add(label);}
 }
 let mill=null;
 if(g.briarMill){
  mill={};const b=craftBuilder('briar');
  for(const side of [-1,1])for(let i=0;i<5;i++){
   b.box((i-2)*12,31,side*32,11,60,5,i%2?'#ad814d':'#997040');
   b.box(side*32,31,(i-2)*12,5,60,11,i%2?'#ad814d':'#997040');
  }
  for(const y of [8,54])for(const side of [-1,1]){b.box(0,y,side*35,70,7,4,'metal');b.box(side*35,y,0,4,7,70,'metal');}
  for(let i=0;i<5;i++)b.box((i-2)*12,61,0,11,5,64,'wood');
  b.box(0,33,35,25,27,2,'light');for(const x of [-6,0,6])b.rod([x,23,37],[x,40-Math.abs(x),37],1.2,'wood');
  mill.crate=custom(b);mill.plate=craft('pressure',130,0,-1880,{w:115,d:115,h:12});
  // A simple pulley line connects the treadle to the sluice; the moving leaf
  // shuts the blue feed while the timber remains visibly wedged at the wheel.
  const frame=craftBuilder('briar');
  for(const x of [250,350])frame.box(x,48,-1640,10,96,12,'wood');frame.box(300,99,-1640,120,12,20,'wood');
  frame.rod([300,99,-1640],[65,100,-1640],2,'light');frame.rod([65,100,-1640],[65,100,-1880],2,'light');frame.rod([65,100,-1880],[65,10,-1880],2,'light');
  for(const z of [-1640,-1880])frame.box(50,49,z,10,98,10,'wood');for(const z of [-1640,-1880])frame.box(65,100,z,42,7,9,'wood');
  frame.box(263,3,-1695,10,6,150,'stone');frame.box(337,3,-1695,10,6,150,'stone');
  custom(frame);
  const gate=craftBuilder('briar');for(let i=0;i<5;i++)gate.box((i-2)*18,37,0,17,70,8,'wood');for(const y of [10,61])gate.box(0,y,6,93,6,5,'metal');mill.gate=custom(gate);mill.gate.position.set(300,0,-1640);
  const waterMat=new T.MeshStandardMaterial({color:'#58adbc',roughness:.26,metalness:.1});ownedMat.push(waterMat);const wg=new T.BoxGeometry(61,2,151);ownedGeo.push(wg);mill.water=new T.Mesh(wg,waterMat);mill.water.position.set(300,4,-1695);root.add(mill.water);
  const timber=craftBuilder('briar');timber.box(0,0,0,87,16,19,'wood',.12);for(const x of [-32,32])timber.box(x,0,0,5,19,22,'dark');mill.timber=custom(timber);mill.timber.position.set(300,28,-1740);
  mill.bridge=craft('rope-bridge',180,8,-2160,{w:190,d:220,h:16});
  mill.handle=craft('winch',80,0,-2030);mill.handle.scale.setScalar(.8);
  const reset=craftBuilder('briar');reset.box(5,20,-1780,12,40,12,'wood');reset.box(5,40,-1780,30,5,20,'metal');custom(reset);mill.reset=craft('valve',5,44,-1776,{w:30,h:30,d:8});
  // The crossing joins the existing east brook. Low stone banks contain the
  // shallow water and keep it clear of the west path and roadside lamp.
  const streamGeo=new T.BoxGeometry(310,1.5,150);ownedGeo.push(streamGeo);const stream=new T.Mesh(streamGeo,waterMat);stream.position.set(235,2.9,-2160);root.add(stream);
  const banks=craftBuilder('briar');for(const z of [-2238,-2082])banks.box(193,4,z,234,8,9,'stone');banks.box(77,4,-2160,9,8,165,'stone');custom(banks);
  window.__BRIAR_MILL_3D_ACTIVE=true;
 }
 const st={root,mill,signs,road,revision:2188};window.__BRIAR_JOURNEY_ART=st;
 root.userData.tick=world=>{
  const game=window.__BF3?.G,m=game?.briarMill,p=world.p;
  for(const n of signs)n.visible=Math.hypot(n.position.x-p.x,n.position.z-p.z)<1150;
  if(m&&mill){
   mill.crate.position.set(m.x,0,m.z);mill.plate.position.y=-m.plate*4;const flow=game.storyState.flags['briar.bridge']?m.bridge:m.water;mill.gate.position.y=flow*70;
   mill.water.scale.z=Math.max(.02,flow);mill.water.position.z=-1770+75*Math.max(.02,flow);
   const cleared=game.storyState.flags['briar.jam'];mill.timber.position.set(cleared?340:300,cleared?9:28,cleared?-1750:-1740);mill.timber.rotation.y=cleared?1.3:.45;
   const t=m.bridge*m.bridge*(3-2*m.bridge),angle=(1-t)*Math.PI*.48;mill.bridge.rotation.x=angle;mill.bridge.position.set(180,8+110*Math.sin(angle),-2050-110*Math.cos(angle));
  }
 };
 root.userData.dispose=()=>{for(const x of ownedGeo)x.dispose();for(const x of ownedMat)x.dispose();for(const x of textures)x.dispose();if(window.__BRIAR_JOURNEY_ART===st){window.__BRIAR_JOURNEY_ART=null;window.__BRIAR_MILL_3D_ACTIVE=false;}};
 return root;
}
