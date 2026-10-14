import * as T from './three.module.js';
import {craftBuilder} from './campaign-craft-models.js?v=2187a';
import {campaignMaterial} from './campaign-materials.js?v=2187a';

// Fitted mechanisms and route paving. This module never creates walkable ground.
export function buildKeepJourneyArt(w){
 const game=window.__BF3?.G;
 if(w.keepScene!=='broken-walls'||!game?.keep?.paths)return null;
 const root=new T.Group();root.name='Broken Walls routes and mechanisms';
 const geos=[],mats=[],textures=[],objects=new Set(),signs=[];
 let triangles=0;
 const finish=(b,parent)=>{for(const p of b.finish()){geos.push(p.geo);triangles+=p.tri;const m=new T.Mesh(p.geo,p.material);m.castShadow=true;m.receiveShadow=true;parent.add(m);}};
 const prop=(key,build)=>{const o=game.storyObjects.find(o=>o.key===key),n=new T.Group();n.position.set(o.x,o.y,o.z);root.add(n);objects.add(key);build(n,o);return n;};
 const mesh=(parent,geo,mat,x=0,y=0,z=0)=>{geos.push(geo);const n=new T.Mesh(geo,mat);n.position.set(x,y,z);parent.add(n);triangles+=(geo.index?.count||geo.attributes.position.count)/3;return n;};
 const material=(color,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness:.55,...extra});mats.push(m);return m;};
 // Union sampled paving into a single mesh. Joined corners have no overlapping faces.
 const routes=[{points:[[0,450,0],[0,-250,0],[0,-1450,0],[0,-3000,0],[0,-4630,0]],width:186},
  ...['west','east','workshop'].map(id=>({points:game.keep.paths[id],width:id==='workshop'?116:140})),
  {points:[[-260,-440,0],[0,-440,0],[0,-250,0],[850,-250,0]],width:110},
  {points:[[-650,-1800,0],[-1300,-1900,0]],width:100}];
 const lines=[],cells=new Set(),step=32;
 for(const r of routes)for(let i=1;i<r.points.length;i++){
  const a=r.points[i-1],b=r.points[i];if(a[2]||b[2])continue;const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz;if(!l)continue;lines.push({a,dx,dz,l,r:r.width/2});
  for(let x=Math.floor((Math.min(a[0],b[0])-r.width/2)/step);x<=Math.ceil((Math.max(a[0],b[0])+r.width/2)/step);x++)for(let z=Math.floor((Math.min(a[1],b[1])-r.width/2)/step);z<=Math.ceil((Math.max(a[1],b[1])+r.width/2)/step);z++)cells.add(x+','+z);
 }
 const distance=(x,z)=>Math.min(...lines.map(l=>{const t=Math.max(0,Math.min(1,((x-l.a[0])*l.dx+(z-l.a[1])*l.dz)/l.l));return Math.hypot(x-l.a[0]-t*l.dx,z-l.a[1]-t*l.dz)/l.r;}));
 const pos=[],uv=[],color=[],stone=new T.Color('#607f86'),edge=new T.Color('#b59b66');
 const vertex=(x,z)=>({x,z,d:distance(x,z)});
 const triangle=points=>{
  const clipped=[];
  for(let i=0;i<3;i++){const a=points[i],b=points[(i+1)%3],inside=a.d<=1;if(inside)clipped.push(a);if(inside!==(b.d<=1)){const t=(1-a.d)/(b.d-a.d);clipped.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,d:1});}}
  for(let i=1;i<clipped.length-1;i++)for(const p of [clipped[0],clipped[i],clipped[i+1]]){pos.push(p.x,2.1,p.z);uv.push(p.x/92,p.z/92);const c=stone.clone().lerp(edge,Math.max(0,Math.min(1,(p.d-.76)*4)));color.push(c.r,c.g,c.b);}
 };
 for(const cell of cells){const [ix,iz]=cell.split(',').map(Number),x=ix*step,z=iz*step,cx=x+16,cz=z+16;
  if(!(w.segments||[]).some(o=>!o.nofloor&&Math.abs(cx-o.x)<o.w/2&&Math.abs(cz-o.z)<o.d/2))continue;
  if((w.obstacles||[]).some(o=>!o.invisible&&!o.nocol&&o.h>4&&(o.y0||0)<3&&Math.abs(cx-o.x)<o.w/2+15&&Math.abs(cz-o.z)<o.d/2+15))continue;
  const a=vertex(x,z),b=vertex(x,z+step),c=vertex(x+step,z),d=vertex(x+step,z+step);triangle([a,b,c]);triangle([c,b,d]);
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setAttribute('color',new T.Float32BufferAttribute(color,3));geo.computeVertexNormals();const roadMat=campaignMaterial('flagstone',{vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});mats.push(roadMat);mesh(root,geo,roadMat).receiveShadow=true;

 const boards=[[-180,-180,['OUTER COURT','Arrow post →']],[-230,-1370,['BREACH COURT','Protect the prisoners']],[-890,-1750,['WEST WALL','Bell tower ←']],[1030,-1790,['WORKSHOP','Felix’s tools →']],[-210,-3110,['DUNGEON','Key ←   Wheel →']],[340,-4380,['CELL STAIRS','Prisoners below']]];
 for(const [x,z,rows]of boards){const n=new T.Group(),b=craftBuilder('keep');n.position.set(x,0,z);root.add(n);signs.push(n);
  b.box(0,56,0,12,112,8,'wood');b.box(0,7,0,24,14,22,'stone');b.box(0,104,0,174,65,10,'dark');for(const y of [73,135])b.box(0,y,0,179,5,12,'gold');for(const x of [-86,86])b.box(x,104,0,5,65,12,'gold');finish(b,n);
  const c=document.createElement('canvas');c.width=640;c.height=224;const ctx=c.getContext('2d');ctx.fillStyle='#253b43';ctx.fillRect(0,0,640,224);ctx.textAlign='center';ctx.textBaseline='middle';rows.forEach((text,i)=>{ctx.font='bold '+(i?34:39)+'px sans-serif';ctx.fillStyle=i?'#f3eee0':'#f5d48c';ctx.fillText(text,320,68+i*85,610);});const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);const m=new T.MeshBasicMaterial({map:tex,toneMapped:false});mats.push(m);for(const side of [-1,1]){const label=mesh(n,new T.PlaneGeometry(165,57),m,0,104,side*6.5);label.rotation.y=side===1?0:Math.PI;}
 }
 // Bell sits beside the escape lane; its moving casting, clapper and pull rope agree.
 const bell=prop('rk.breach',n=>{const b=craftBuilder('keep');for(const x of [-43,43]){b.box(x,65,0,15,130,22,'wood');b.box(x,9,0,28,18,32,'stone');b.rod([x,100,0],[x*.4,128,0],4,'metal');}b.box(0,133,0,112,17,25,'wood');b.bolts([-43,43],[122,137],14);finish(b,n);});
 const bellSwing=new T.Group();bellSwing.position.y=124;bell.add(bellSwing);let b=craftBuilder('keep');b.lathe([[0,-49],[30,-49],[31,-44],[24,-40],[18,-22],[15,-8],[8,-4],[3,0],[0,0]],'gold');b.ring(0,-45,0,28,2,'metal',Math.PI/2);b.rod([0,-8,0],[0,-52,0],2,'metal');b.ball(0,-54,0,5,'metal');b.curve([[0,-52,0],[4,-68,12],[7,-88,20]],1.8,'light');b.ring(7,-91,20,5,1.5,'light');finish(b,bellSwing);
 const bow=prop('rk.arrow',n=>{const b=craftBuilder('keep');for(const x of [-28,28])b.box(x,20,0,10,40,56,'wood');b.box(0,38,0,68,14,74,'wood');b.box(0,51,-8,18,16,120,'wood');b.curve([[-65,57,-28],[-44,61,-48],[0,61,-60],[44,61,-48],[65,57,-28]],4,'metal');b.rod([0,62,35],[0,62,-70],2,'light');b.panel([[0,15],[-6,0],[6,0]],2,'metal',0,62,-72,Math.PI/2);b.bolts([-28,28],[34,43],31);finish(b,n);});
 const cord=new T.Group();bow.add(cord);b=craftBuilder('keep');b.rod([-65,57,-28],[0,62,35],1.2,'light');b.rod([0,62,35],[65,57,-28],1.2,'light');finish(b,cord);
 const cutCord=new T.Group();bow.add(cutCord);b=craftBuilder('keep');for(const side of [-1,1])b.curve([[side*65,57,-28],[side*48,42,-9],[side*42,21,4]],1.2,'light');finish(b,cutCord);
 const wheel=prop('rk.wheel',n=>{const b=craftBuilder('keep');b.box(0,26,0,72,52,48,'stone');b.box(0,54,0,80,9,55,'light');b.cyl(0,66,0,9,16,'metal',9,Math.PI/2);finish(b,n);});
 const wheelTurn=new T.Group();wheelTurn.position.set(0,82,29);wheel.add(wheelTurn);b=craftBuilder('keep');b.wheel(0,0,0,34);b.rod([26,0,0],[26,0,13],3,'wood');finish(b,wheelTurn);
 // A timing dial: green arc = the SAME predicate used by the authoritative interaction.
 const latch=prop('rk.timing',n=>{const b=craftBuilder('keep');b.box(0,35,0,76,70,42,'wood');b.box(0,76,0,88,12,50,'metal');b.cyl(0,75,28,33,8,'dark',33,Math.PI/2);b.ring(0,75,33,33,3,'gold');b.bolts([-31,31],[20,60],23);finish(b,n);});
 const green=material('#75d4a2',{emissive:'#32654e',emissiveIntensity:.4}),pointerMat=material('#ffe9b0',{metalness:.4});
 const arc=mesh(latch,new T.TorusGeometry(26,4,6,36,2.1/5*Math.PI*2),green,0,75,35);arc.rotation.z=.15/5*Math.PI*2;
 const pointer=new T.Group();pointer.position.set(0,75,41);latch.add(pointer);mesh(pointer,new T.BoxGeometry(29,5,3),pointerMat,13,0,0);
 const readyLamp=mesh(latch,new T.SphereGeometry(5,10,7),material('#c39761',{emissive:'#6e4824'}),0,121,20);
 // Low markers show the protected escape lane without filling it with obstacles.
 b=craftBuilder('keep');for(const x of [-130,130])for(let z=-1700;z>=-2960;z-=140)b.box(x,2.8,z,12,1.5,48,'gold');finish(b,root);
 const warningMat=new T.MeshBasicMaterial({color:'#f4bb58',transparent:true,opacity:.65,depthWrite:false,side:T.DoubleSide});mats.push(warningMat);const alarm=mesh(root,new T.RingGeometry(35,63,28),warningMat);alarm.rotation.x=-Math.PI/2;
 const snapshot=()=>({triangles,signs:signs.length,objects:[...objects],latchGreen:latch.userData.ready,cordCut:cutCord.visible,warning:alarm.visible?alarm.position.toArray():null});
 root.userData.update=()=>{const G=window.__BF3?.G;if(!G?.keep)return;const k=G.keep.remote||G.keep,f=G.storyState.flags,time=k.clock||0;
  cord.visible=!f['rk.arrow'];cutCord.visible=!!f['rk.arrow'];
  bellSwing.rotation.x=f['rk.breach.start']&&!f['rk.breach.done']?Math.sin(time*4)*.15:0;
  wheelTurn.rotation.z=f['rk.cells']?Math.PI*.75:0;
  const ready=window.BFBrokenWalls.latchReady(time);pointer.rotation.z=(time%5)/5*Math.PI*2;latch.userData.ready=ready;readyLamp.material.color.set(f['rk.workshop']?'#89e6b1':ready?'#89e6b1':'#bd825b');readyLamp.material.emissive.copy(readyLamp.material.color).multiplyScalar(.3);
  const warn=f['rk.breach.start']&&!f['rk.breach.done']?window.BFBrokenWalls.warning(k):null;alarm.visible=!!warn;if(warn){alarm.position.set(warn.x,4,warn.z);alarm.scale.setScalar(.85+Math.sin(time*12)*.1);}
 };
 root.userData.dispose=()=>{for(const g of geos)g.dispose();for(const m of mats)m.dispose();for(const t of textures)t.dispose();if(window.__KEEP_JOURNEY_ART?.root===root)delete window.__KEEP_JOURNEY_ART;};
 window.__KEEP_JOURNEY_ART={root,objects,snapshot};root.userData.update();return root;
}
