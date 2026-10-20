import * as T from './three.module.js';
import {craftBuilder} from './campaign-craft-models.js?v=2342';
import {campaignMaterial} from './campaign-materials.js?v=2187a';

// The trade road follows authored ground routes. Its surface is visual only;
// the ravine, elevated shelves and optional jumps retain their real collision.
export function buildHollowJourneyArt(w){
 const g=window.__BF3?.G,canyon=w.area===1,c=canyon?g?.canyon:g?.cliffs;
 if(!c?.paths||!c.signs||w.zone!=='hollow'||![0,1].includes(w.area)||w.hub||w.trial||w.side||w.delve||w.endless||w.marksmanCrossing)return null;
 const root=new T.Group();root.name=canyon?'Lost Canyon service roads':'Winding Cliffs freight road';
 const ownedGeo=[],ownedMat=[],textures=[],signs=[],lines=[],cells=new Set(),samples=new Map(),step=24;
 const routes=canyon?['west','east','northEvac','exit','freight','cave'].map(id=>({points:c.paths[id],width:['west','east','exit'].includes(id)?180:110})).concat([{points:[[0,-1450,0],[-450,-1450,0],[-780,-1980,0]],width:160}]):[{points:c.paths.approach,width:190},{points:c.paths.lookout,width:185},{points:c.paths.alcoves,width:106},
  {points:[[0,-2450,0],[0,-2600,0]],width:180}];
 for(const path of routes)for(let i=1;i<path.points.length;i++){
  const a=path.points[i-1],b=path.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length2=dx*dx+dz*dz;
  if(length2<1||a[2]!==0||b[2]!==0)continue;
  const line={a,dx,dz,length2,r:path.width/2};lines.push(line);
  for(let x=Math.floor((Math.min(a[0],b[0])-line.r-step)/step);x<=Math.ceil((Math.max(a[0],b[0])+line.r+step)/step);x++)
   for(let z=Math.floor((Math.min(a[1],b[1])-line.r-step)/step);z<=Math.ceil((Math.max(a[1],b[1])+line.r+step)/step);z++)cells.add(x+','+z);
 }
 const sample=(x,z)=>{
  const key=x+','+z;if(samples.has(key))return samples.get(key);
  let distance=2,rut=0;
  for(const l of lines){const t=Math.max(0,Math.min(1,((x-l.a[0])*l.dx+(z-l.a[1])*l.dz)/l.length2)),d=Math.hypot(x-l.a[0]-t*l.dx,z-l.a[1]-t*l.dz);distance=Math.min(distance,d/l.r);if(l.r>80)rut=Math.max(rut,Math.max(0,1-Math.abs(d-34)/8));}
  const value={edge:Math.max(0,Math.min(1,(1-distance)/.32)),rut};samples.set(key,value);return value;
 };
 const positions=[],colors=[],uv=[],sand=new T.Color('#c49b67'),road=new T.Color('#967142'),wheel=new T.Color('#78583b');
 for(const cell of cells){
  const [ix,iz]=cell.split(',').map(Number),x=ix*step,z=iz*step,cx=x+step/2,cz=z+step/2;
  if(!canyon&&cz<-2650&&cz>-3075)continue; // No visual shortcut across the locked freight ravine.
  if(!(w.segments||[]).some(o=>!o.nofloor&&Math.abs(cx-o.x)<o.w/2&&Math.abs(cz-o.z)<o.d/2))continue;
  if((w.obstacles||[]).some(o=>!o.invisible&&!o.nocol&&o.h>3&&(o.kind==='plat'?o.h-(o.slab||o.h+1):(o.y0||0))<3&&Math.abs(cx-o.x)<o.w/2+8&&Math.abs(cz-o.z)<o.d/2+8))continue;
  const points=[[x,z],[x+step,z],[x,z+step],[x+step,z+step]].map(([x,z])=>({x,z,...sample(x,z)}));
  if(points.every(p=>p.edge===0))continue;
  for(const n of [0,2,1,1,2,3]){const p=points[n],color=sand.clone().lerp(road,p.edge).lerp(wheel,p.rut*p.edge*.28);positions.push(p.x,2.4,p.z);colors.push(color.r,color.g,color.b);uv.push(p.x/130,p.z/130);}
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();ownedGeo.push(geo);
 const mat=campaignMaterial('soil',{vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});ownedMat.push(mat);
 const pathMesh=new T.Mesh(geo,mat);pathMesh.name='Joined, worn freight road';pathMesh.receiveShadow=true;root.add(pathMesh);
 for(const s of c.signs){
  const n=new T.Group(),b=craftBuilder('hollow');n.position.set(s.x,s.y||0,s.z);root.add(n);signs.push(n);
  // Keep the post behind both label faces; coplanar wood obscures center letters.
  b.box(0,66,0,14,132,10,'wood');b.box(0,9,0,25,18,25,'stone');
  b.box(0,111,0,176,68,10,'dark');for(const y of [78,144])b.box(0,y,0,181,6,12,'wood');
  for(const x of [-85,85])b.box(x,111,0,6,68,12,'wood');
  for(const y of [82,139])for(const x of [-79,79])b.ball(x,y,7,2,'metal');
  // A strip of the same teal cloth marks this freight route in the landscape.
  b.box(0,70,10,17,17,2,'#437e7b');
  for(const part of b.finish()){ownedGeo.push(part.geo);const mesh=new T.Mesh(part.geo,part.material);mesh.castShadow=true;mesh.receiveShadow=true;n.add(mesh);}
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=224;const ctx=canvas.getContext('2d');ctx.fillStyle='#352a20';ctx.fillRect(0,0,640,224);ctx.textAlign='center';ctx.textBaseline='middle';
  for(let i=0;i<s.rows.length;i++){ctx.font='bold '+(i===0?34:29)+'px sans-serif';ctx.fillStyle=i===0?'#f6d98b':'#fff1d5';ctx.fillText(s.rows[i],320,44+i*69,610);}
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);
  const labelMat=new T.MeshBasicMaterial({map:tex,toneMapped:false});ownedMat.push(labelMat);const board=new T.PlaneGeometry(163,59);ownedGeo.push(board);
  for(const side of [-1,1]){const label=new T.Mesh(board,labelMat);label.position.set(0,111,side*7);label.rotation.y=side===1?0:Math.PI;n.add(label);}
 }
 const signals=[],cables=[];
 if(canyon){
  // A fitted lantern cage makes each authored signal post readable at rest and
  // while calling guards. Emissive cores add no extra scene lights.
  const coreGeo=new T.IcosahedronGeometry(12,0);ownedGeo.push(coreGeo);
  for(const cut of [false,true]){
   const n=new T.Group(),b=craftBuilder('hollow');root.add(n);cables.push({node:n,cut});
   const spans=cut?[[[0,350,-2680],[12,303,-2672]],[[0,235,-2600],[-8,270,-2598]]]:[[[0,350,-2680],[0,235,-2600]]];
   for(const [a,z]of spans)b.rod(a,z,2.4,'light');
   for(const part of b.finish()){ownedGeo.push(part.geo);const mesh=new T.Mesh(part.geo,part.material);mesh.castShadow=true;n.add(mesh);}
  }
  for(const [x,z,y,post]of [...window.BFLostCanyon.signalPosts.map(([x,z])=>[x,z,155,true]),[0,-2680,378,false]]){
   const n=new T.Group(),b=craftBuilder('hollow');n.position.set(x,0,z);root.add(n);
   if(post){b.box(0,8,0,29,16,29,'stone');b.box(0,70,0,14,130,14,'wood');b.box(0,128,0,77,7,13,'light');b.box(0,97,7,48,28,4,'cloth');}
   b.cyl(0,y-20,0,22,7,'metal');b.cyl(0,y+22,0,0,17,'metal',26);
   for(const dx of [-16,16])for(const dz of [-12,12])b.rod([dx,y-18,dz],[dx,y+15,dz],2.5,'gold');
   b.ring(0,y-16,0,19,2,'metal',Math.PI/2);b.ring(0,y+13,0,19,2,'metal',Math.PI/2);
   for(const part of b.finish()){ownedGeo.push(part.geo);const mesh=new T.Mesh(part.geo,part.material);mesh.castShadow=true;n.add(mesh);}
   const lightMat=new T.MeshBasicMaterial({color:'#70695b',toneMapped:false});ownedMat.push(lightMat);const core=new T.Mesh(coreGeo,lightMat);core.position.y=y;n.add(core);signals.push({node:n,core});
  }
 }
 const state={root,pathMesh,signs,signals,cables,triangles:positions.length/9},key=canyon?'__CANYON_JOURNEY_ART':'__HOLLOW_JOURNEY_ART';window[key]=state;
 root.userData.tick=world=>{
  for(const s of signs)s.visible=Math.hypot(s.position.x-world.p.x,s.position.z-world.p.z)<1150;
  const f=g.storyState?.flags||{},lit=f['lc.alarm.called']&&!f['lc.alarm'];
  for(const cable of cables)cable.node.visible=cable.cut===!!f['lc.alarm'];
  for(const s of signals){s.node.visible=Math.hypot(s.node.position.x-world.p.x,s.node.position.z-world.p.z)<1200;s.core.material.color.set(f['lc.alarm']?'#6bc59d':lit?'#ffb146':'#70695b');s.core.scale.setScalar(lit?1+.13*Math.sin(g.time*5):.8);}
 };
 root.userData.dispose=()=>{for(const x of ownedGeo)x.dispose();for(const x of ownedMat)x.dispose();for(const x of textures)x.dispose();if(window[key]===state)window[key]=null;};
 return root;
}
