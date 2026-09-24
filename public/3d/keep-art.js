import {claimSurface} from './surface-regions.js?v=1972';
/* Ruined Keep: authored fortress scenery fitted to the existing game geometry. */
import * as THREE from './three.module.js';
import {GLTFLoader} from './jsm/loaders/GLTFLoader.js';
const kit=new Map(),dummy=new THREE.Object3D(),CHUNK=400;
let pending,failed=false,active=null;
const hash=(x,z)=>{const v=Math.sin(x*12.9898+z*78.233)*43758.5453;return v-Math.floor(v)};
const palette=['#65665c','#6b6b5f','#62665d','#716e60','#60645b'];
export const wantsKeep=w=>!failed&&w.zone==='keep'&&!w.hub&&!w.trial&&!w.arena&&!w.bonus&&new URLSearchParams(location.search).get('keepart')!=='0';
export const keepReady=()=>kit.size===9;
export function loadKeep(){
  if(pending)return pending;
  pending=new Promise(resolve=>new GLTFLoader().load('./keep-assets/keep-kit.glb',g=>{
    try{g.scene.updateMatrixWorld(true);g.scene.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);const co=geo.attributes.color,mean=new THREE.Color(0,0,0);for(let i=0;i<co.count;i++){mean.r+=co.getX(i);mean.g+=co.getY(i);mean.b+=co.getZ(i)}mean.multiplyScalar(1/co.count);kit.set(o.name,{geo,mean,tri:(geo.index?.count||geo.attributes.position.count)/3});});if(!keepReady())throw Error('Incomplete Keep kit');}
    catch(e){failed=true;console.warn('[keep-art]',e)}resolve();
  },undefined,e=>{failed=true;console.warn('[keep-art] Original scenery fallback',e);resolve()}));return pending;
}
const material=new THREE.MeshLambertMaterial({vertexColors:true});
const bannerMaterial=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
function subtract(p,o){const a=Math.max(p.a,o.a),b=Math.min(p.b,o.b),c=Math.max(p.c,o.c),d=Math.min(p.d,o.d);if(a>=b||c>=d)return[p];return[{a:p.a,b:a,c:p.c,d:p.d},{a:b,b:p.b,c:p.c,d:p.d},{a,b,c:p.c,d:c},{a,b,c:d,d:p.d}].filter(q=>q.b-q.a>.05&&q.d-q.c>.05)}
export function buildKeep(scene,w){
  const root=new THREE.Group();root.name='Ruined Keep · The Fallen Standard';
  const bins=new Map(),obstacles=new WeakSet(),walls=new WeakSet(),caps=new Map(),lamps=[],structures=[],bodies=new Set(),occluders=new Map();let target=null,source=null,floors=0;
  const under=w.area===1||w.side||w.keepScene==='fallen';
  function add(name,x,y,z,sx=1,sy=sx,sz=sx,color=null,rot=0){const cell=target||Math.floor(x/CHUNK)+','+Math.floor(z/CHUNK),key=cell+'|'+name;if(!bins.has(key))bins.set(key,{cell,name,list:[]});bins.get(key).list.push({x,y,z,sx,sy,sz,color,rot,source});}
  const block=(x,y,z,ww,h,d,c)=>add(Math.min(ww,h,d)<=3?'timber':'stone',x,y,z,ww,h,d,c);
  function cap(o,top,wood){
    const key=Math.round(top*10),laid=caps.get(key)||[];caps.set(key,laid);let pieces=[{a:o.x-o.w/2,b:o.x+o.w/2,c:o.z-o.d/2,d:o.z+o.d/2}];
    for(const old of laid)pieces=pieces.flatMap(p=>subtract(p,old));
    for(const p of pieces){const nx=Math.ceil((p.b-p.a)/52),nz=Math.ceil((p.d-p.c)/44),dx=(p.b-p.a)/nx,dz=(p.d-p.c)/nz;
      for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){const x=p.a+(ix+.5)*dx,z=p.c+(iz+.5)*dz;add('timber',x,top+.6,z,Math.max(.1,dx-.65),1.4,Math.max(.1,dz-.65),wood?'#846c48':palette[Math.floor(hash(x,z)*5)]);floors++;}laid.push(p);
    }
  }
  const surfaces=new Map();
  function surface(o,base,top,wood=false,facade=true){
    if(o.terrain||o.caveWall||o.kind==='col')return rawSurface(o,base,top,wood,facade);
    for(const part of claimSurface(surfaces,{...o,w:o.w||20,d:o.d||o.w||20},w.keepScene?(o.prisonLayer||'upper'):base+':'+top))rawSurface(part,base,top,wood,facade);
  }
  function rawSurface(o,base,top,wood=false,facade=true){
    const ww=o.w||20,dd=o.d||ww,h=Math.max(1,top-base),key=[o.x,o.z,ww,dd,base,top].join(',');if(bodies.has(key))return;bodies.add(key);
    if(o.water){add('stone',o.x,-5,o.z,ww,10,dd,'#263f42');for(let i=0;i<Math.floor(dd/110);i++)block(o.x,.8,o.z-dd/2+i*110,ww*.7,.6,2,'#3d5d60');return;}
    add(wood?'timber':'stone',o.x,base+h/2,o.z,ww,h,dd,wood?'#493a28':'#444b45');cap({...o,w:ww,d:dd},top,wood);
    if(h<35||!facade)return;const rows=Math.min(10,Math.ceil(h/30)),rh=h/rows;
    for(let row=0;row<rows;row++)for(const side of [-1,1])for(const axis of [0,1]){
      const len=axis?dd:ww,cols=Math.max(1,Math.ceil(len/55)),bw=len/cols;
      for(let k=0;k<cols;k++){const u=-len/2+(k+.5)*bw;block(o.x+(axis?side*(ww/2-.7):u),base+(row+.5)*rh,o.z+(axis?u:side*(dd/2-.7)),axis?1.8:bw-1.4,rh-1.2,axis?bw-1.4:1.8,wood?'#635037':palette[Math.floor(hash(k+row*7+o.x,side+o.z)*5)]);}
    }
    block(o.x,top-2,o.z,ww,4,dd,wood?'#6c573c':'#807967');
  }
  function brazier(x,y,z,s=20){add('brazier',x,y,z,s);lamps.push(new THREE.Vector3(x,y+s*2.05,z));}
  if(w.keepScene){const terrain=[...(w.segments||[]).filter(s=>!s.nofloor).map(s=>({o:s,base:-25,top:0})),...(w.obstacles||[]).filter(o=>o.kind==='plat').map(o=>({o,base:o.y0??-25,top:o.h||0}))].sort((a,b)=>b.top-a.top);for(const t of terrain){source=t.o.kind==='plat'?t.o:null;surface(t.o,t.base,t.top,!!t.o.bridge);if(t.o.kind==='plat')obstacles.add(t.o);}source=null;}else for(const s of w.segments||[])if(!s.nofloor)surface(s,-25,0,!!s.bridge,false);
  const solids=(w.obstacles||[]).filter(o=>!o.autoCol&&!o.invisible&&!o.treeCol&&!o.pillarCol);
  for(const o of solids){if(w.keepScene&&o.kind==='plat')continue;source=w.keepScene?o:null;const base=o.y0??(o.kind==='plat'?Math.min(0,(o.h||0)-16):0),top=o.h||1;
    const deco=(w.deco||[]).find(d=>d.x===o.x&&d.z===o.z&&d.w===o.w&&(d.d||d.w)===o.d&&d.c?.startsWith('#4'));
    const crate=deco&&['#49392e','#3b2d24'].includes(deco.c)&&o.w>80;
    if(o.kind==='col'&&top>90&&o.w<180&&o.d<180){target='s'+structures.length;structures.push({cell:target,o});}
    if(crate){add('crate',o.x,base,o.z,o.w,top-base,o.d);cap(o,top,true);}
    else surface(o,base,top,!!o.bridge);
    obstacles.add(o);target=null;
    // Existing column silhouettes receive inset arrow slits without occupying extra floor.
    if(o.kind==='col'&&o.w>=70&&o.d>=60&&top>100){for(const side of [-1,1]){block(o.x,base+(top-base)*.61,o.z+side*(o.d/2+.35),12,28,1.2,'#151f1d');block(o.x,base+(top-base)*.58,o.z+side*(o.d/2+1),3,16,.5,'#bb7939');}}
  }
  source=null;
  for(const o of w.walls||[]){if(o.invisible)continue;if(w.delve){target='s'+structures.length;structures.push({cell:target,o});}surface(o,o.y0||0,(o.y0||0)+(o.h||1));walls.add(o);target=null;}
  for(const d of w.deco||[]){source=w.keepScene?{...d,h:(d.y0||0)+(d.h||0)}:null;const ww=d.w||20,dd=d.d||ww,hh=d.h||20,y=d.y0||0,r=hash(d.x,d.z);
    if(solids.some(o=>Math.abs(o.x-d.x)<.01&&Math.abs(o.z-d.z)<.01&&o.w===ww&&o.d===dd&&Math.abs(o.h-y-hh)<2))continue;
    if(d.theme==='ruins'||d.theme==='dungeon'){
      if(hh>110&&ww>45){add('tower',d.x,y,d.z,ww,hh,dd);if(r<.42)add('banner',d.x+ww*.21,y+hh*.34,d.z+dd*.5+2,ww*.42,hh*.36,12,null,.04);}
      else if(hh>50)add('stone',d.x,y+hh/2,d.z,ww,hh,dd,'#565a50');
      else add('rubble',d.x,y,d.z,ww,Math.min(hh,24),dd);
    }else if(d.kind==='lantern'){brazier(d.x,y,d.z,18);}
    else if(d.kind==='fence'){add('grille',d.x,y,d.z,ww,hh,10,null,d.rot||0);}
    else if(d.kind==='column'){surface({...d,d:dd},y,y+hh);}
    else if(d.c==='#702c45'){const owner=solids.find(o=>o.kind==='col'&&o.x===d.x&&o.z===d.z);add('banner',d.x,Math.max(0,(owner?.h||y)-hh-4),d.z+(owner?.d||50)/2+3,Math.max(38,ww),hh,12);}
    else if(ww<12&&dd<12&&hh>50)add('timber',d.x,y+hh/2,d.z,ww,hh,dd,'#292f2d');
    else if(hh<4&&ww>60)continue;
    else if(d.kind==='grave'||(hh<35&&ww>55&&dd>30)){surface({...d,d:dd},y,y+hh);block(d.x,y+hh+1,d.z,ww*.65,1.5,3,'#988468');}
    else block(d.x,y+hh/2,d.z,ww,hh,dd,d.c==='#292d36'?'#424942':palette[Math.floor(r*5)]);
  }
  source=null;
  // Span the actual two parallel curtain walls. There are no new posts in the passage.
  if(!w.side&&w.area===0&&(w.walls||[]).length>=2){const a=w.walls.find(o=>o.x===-730),b=w.walls.find(o=>o.x===20);if(a&&b){const x=(a.x+b.x)/2,z=-575;
    add('arch',x,198,z,(b.x-a.x)/2,170,42);for(const wall of [a,b]){add('banner',wall.x+(wall.x<x?35:-35),94,z+20,50,110,10);brazier(wall.x+(wall.x<x?0:0),220,z,18);}
  }}
  // Existing room corners are good light landmarks; fixture bases stay inside platform edges.
  for(const r of w.rooms||[]){if(!r.name&&!w.delve)continue;const y=r.y||0;for(const side of [-1,1]){const x=r.x+side*(r.w/2-18),z=r.z-r.d/2+20;
    if(w.delve){
      // Mount the dungeon lanterns on existing masonry, above the walkable floor.
      const wall=(w.walls||[]).find(o=>!o.invisible&&Math.abs(x-o.x)<o.w/2+22&&Math.abs(z-o.z)<o.d/2+22);if(!wall)continue;
      target=structures.find(s=>s.o===wall)?.cell||null;const top=(wall.y0||0)+wall.h;
      brazier(Math.max(wall.x-wall.w/2,Math.min(x,wall.x+wall.w/2)),top,Math.max(wall.z-wall.d/2,Math.min(z,wall.z+wall.d/2)),12);
      add('banner',x,top-58,z,24,48,3,null,side*.04);target=null;
    }else brazier(x,y,z,under?17:20);
  }}
  if(w.keepScene==='broken-walls'){
    // A ruined garrison: banners, battered defenses and domestic traces around clear routes.
    for(const o of solids)if(o.kind==='col'&&Math.max(o.w,o.d)>280&&o.h>150){
      const alongX=o.w>o.d,len=alongX?o.w:o.d,n=Math.floor(len/70);
      for(let i=0;i<n;i++){const d=-len/2+35+i*70;block(o.x+(alongX?d:0),o.h+13,o.z+(alongX?0:d),alongX?34:o.w,26,alongX?o.d:34,'#797767');}
      if(alongX)add('banner',o.x,o.h-100,o.z+o.d/2+3,50,90,8);
    }
    for(const [x,z,y]of [[-540,420,0],[540,420,0],[-720,-2640,0],[720,-2640,0],[-1860,-3750,80],[420,-4360,0]]){
      add('tower',x,y-12,z,115,280,115);add('banner',x,y+95,z+60,45,105,8);brazier(x,y+280,z,17);
    }
    // Supplies and bedding explain why the freed group waits under the outer wall.
    for(const [x,z]of [[-370,-1610],[-435,-1645],[-350,-3030]]){add('crate',x,0,z,52,40,38);block(x+42,4,z+10,28,8,62,'#6e6e54');}
    // The seized workshop has an open roof for camera visibility, with a distinct timber frame.
    for(const x of [1160,1710]){for(const z of [-2740,-3190])block(x,75,z,18,150,18,'#59462e');block(x,142,-2965,22,18,470,'#816a47');}
    block(1435,155,-3190,570,22,24,'#816a47');
    for(const x of [1260,1630]){block(x,32,-3100,95,12,50,'#796448');for(const dx of [-36,36])block(x+dx,14,-3100,9,28,38,'#50412d');add('crate',x,0,-3180,54,46,42);}
    // Broken bell frame crowns the climb. The shard is tucked behind its stone screen.
    for(const x of [-1810,-1590]){block(x,396,-1680,24,152,28,'#7c7868');block(x,474,-1620,28,12,145,'#978d72');}
    block(-1700,479,-1680,244,18,34,'#9b8e70');add('brazier',-1700,401,-1680,27);
    // A shield and empty weapon stands make the optional chamber challenge readable.
    for(const [x,z]of [[-1800,-3710],[-1180,-3710]]){block(x,115,z,16,70,18,'#594d37');block(x,143,z,80,12,18,'#8a7751');add('banner',x,115,z+12,33,50,5);}
    for(const [x,z,y]of [[-525,-975,0],[570,-990,0],[-700,-2280,0],[700,-2280,0],[-1780,-1740,0],[1660,-3090,0],[-1720,-3900,80]]){
      for(let i=0;i<4;i++)add('rubble',x+i*18,y,z+(i%2)*22,35,15+i*3,28);
    }
  }
  if(w.keepScene==='dungeons'){
    // Open tops let the chase camera read an enclosed prison without looking through roofs.
    for(const [x,z,y]of [[-720,-950,180],[800,-1020,180],[-1100,-2130,180]]){
      for(const dx of [-170,170]){block(x+dx,y+90,z-140,24,180,24,'#6e6b5e');block(x+dx,y+180,z,28,16,310,'#827967');}
      block(x,y+186,z-140,370,24,32,'#8d846f');
      for(let i=0;i<5;i++)block(x-120+i*60,y+55,z-135,8,110,8,'#4f5654');
      for(const dx of [-95,95]){block(x+dx,y+8,z+60,65,16,125,'#594936');block(x+dx,y+18,z+70,55,5,100,'#80765a');}
    }
    for(const x of [-205,205]){for(const z of [-2690,-2310])block(x,335,z,34,350,34,'#625f52');block(x,512,-2500,40,18,420,'#96866a');}
    for(const x of [-330,330]){add('banner',x,400,-3490,45,100,8);brazier(x,360,-3550,19);}
    for(const [x,z,y]of [[-1380,-1810,180],[-380,-3050,180],[980,-3340,190],[300,-2950,0],[1470,-3190,40]]){add('crate',x,y,z,58,40,42);add('rubble',x+45,y,z-45,60,22,45);}
    // The drain has brick banks and low arches; safe stones remain brighter than water.
    for(const z of [-3410,-3880,-4370,-4840])for(const x of [1225,2550]){block(x,80,z,35,160,110,'#52594e');block(x+(x<1800?55:-55),155,z,110,22,80,'#77745f');}
  }
  if(w.keepScene==='fallen'){
    // Recessed cells and high wall arches surround a clear, flat duel floor.
    for(const x of [-220,220])for(const z of [-230,220]){block(x,9,z,112,18,112,'#9b927a');block(x,242,z,112,12,112,'#a99b80');for(const dz of [-42,42])block(x,123,z+dz,8,218,5,'#a89b7c');}
    for(const x of [-510,510])for(const z of [-570,0,570]){brazier(x,0,z,18);add('banner',x,175,z,32,94,6);}
    for(const z of [-640,640]){for(const x of [-460,460])block(x,250,z,35,45,40,'#a49677');block(0,278,z,950,16,40,'#827764');}
    for(const x of [-665,665]){add('crate',x,0,-125,65,45,50);for(let i=0;i<3;i++)block(x-35+i*35,18,125,24,36,12,'#a4926e');}
    for(const x of [-90,90])block(x,1.2,0,5,1.4,1330,'#8f846e');
  }
  const groups=new Map();let triangles=0,instances=0;
  for(const {cell,name,list} of bins.values()){
    if(!groups.has(cell)){const g=new THREE.Group();g.userData.cell=cell;groups.set(cell,g);root.add(g)}const rec=kit.get(name),m=new THREE.InstancedMesh(rec.geo,name==='banner'?bannerMaterial:material,list.length),col=new THREE.Color();m.name='Keep '+name;
    for(let i=0;i<list.length;i++){const d=list[i];dummy.position.set(d.x,d.y,d.z);dummy.scale.set(d.sx,d.sy,d.sz);dummy.rotation.set(0,d.rot,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);col.set(d.color||'#ffffff');if(d.color){col.r/=Math.max(.015,rec.mean.r);col.g/=Math.max(.015,rec.mean.g);col.b/=Math.max(.015,rec.mean.b)}m.setColorAt(i,col);if(d.source){if(!occluders.has(d.source))occluders.set(d.source,{o:d.source,parts:[],hidden:false});occluders.get(d.source).parts.push({mesh:m,index:i,matrix:dummy.matrix.clone()});}}
    m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;m.computeBoundingSphere();m.castShadow=name!=='banner'&&name!=='timber';m.receiveShadow=true;m.userData.tri=list.length*rec.tri;groups.get(cell).add(m);triangles+=m.userData.tri;instances+=list.length;
  }
  for(const s of structures)if(groups.has(s.cell))groups.get(s.cell).userData.obstacle=s.o;
  scene.traverse(o=>{if(o.isLight){if(o.userData._w3dOrig==null)o.userData._w3dOrig=o.intensity;o.intensity=o.userData._w3dOrig*(o.isAmbientLight?.56:.15)}});
  const oldFog=scene.fog;scene.fog=new THREE.Fog(under?'#262d2d':'#303831',650,2300);
  const sun=new THREE.DirectionalLight('#ffe1b2',under?1.15:2);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-780,right:780,top:780,bottom:-780,near:1,far:3000});sun.shadow.camera.updateProjectionMatrix();sun.shadow.normalBias=1.2;sun.shadow.bias=-.0002;root.add(sun,sun.target);
  const lights=[0,1,2].map(()=>{const l=new THREE.PointLight('#ffad55',900,180,1.6);root.add(l);return l});
  const counts={keepArt:true,artObstacles:true,floorTiles:floors,totalTriangles:triangles,instances,chunks:groups.size,visibleTriangles:0,visibleDrawCalls:0};
  active={root,groups,obstacles,walls,sun,counts,lamps,lights,occluders,zero:new THREE.Matrix4().makeScale(0,0,0)};window.__KEEP_ART_ACTIVE=true;
  root.userData.dispose=()=>{scene.fog=oldFog;sun.shadow.map?.dispose();if(active?.root===root)active=null;window.__KEEP_ART_ACTIVE=false;};return {group:root,counts};
}
export function updateKeep(w){
  if(!active||!w.p)return;const a=active,p=w.p,low=window.__BF_META?.().quality==='low',range=low?750:1200;let tris=0,calls=0;
  for(const [cell,g] of a.groups){const o=g.userData.obstacle,[cx,cz]=o?[o.x,o.z]:cell.split(',').map(n=>(+n+.5)*CHUNK);g.visible=Math.hypot(cx-p.x,cz-p.z)<range+CHUNK*.72;
    if(g.visible&&o&&w.eye&&p.y<o.h-5&&window.__BF_META?.().camMode!=='fps')for(let t=.08;t<.95;t+=.08){const x=w.eye.x+(p.x-w.eye.x)*t,z=w.eye.z+(p.z-w.eye.z)*t;if(Math.abs(x-o.x)<o.w/2+5&&Math.abs(z-o.z)<o.d/2+5){g.visible=false;break;}}
    if(g.visible)for(const m of g.children){tris+=m.userData.tri;calls++}
  }
  for(const f of a.occluders.values()){
    const o=f.o,top=o.h||0,base=o.y0??Math.min(0,top-18);let hidden=false;
    if(w.eye&&window.__BF_META?.().camMode!=='fps'&&p.y<top-8&&Math.hypot(o.x-p.x,o.z-p.z)<600)for(let t=.04;t<.96;t+=.06){
      const x=w.eye.x+(p.x-w.eye.x)*t,z=w.eye.z+(p.z-w.eye.z)*t,y=w.eye.y+(p.y+30-w.eye.y)*t;
      if(y>base-2&&y<top+4&&Math.abs(x-o.x)<o.w/2+6&&Math.abs(z-o.z)<o.d/2+6){hidden=true;break;}}
    if(hidden!==f.hidden){for(const q of f.parts){q.mesh.setMatrixAt(q.index,hidden?a.zero:q.matrix);q.mesh.instanceMatrix.needsUpdate=true;}f.hidden=hidden;window.__KEEP_SHADOW_DIRTY=true;}
  }
  a.counts.visibleTriangles=tris;a.counts.visibleDrawCalls=calls;
  const near=a.lamps.map(v=>({v,d:(v.x-p.x)**2+(v.y-p.y)**2+(v.z-p.z)**2})).sort((x,y)=>x.d-y.d);a.lights.forEach((l,i)=>{l.visible=!low&&near[i]?.d<300**2;if(l.visible)l.position.copy(near[i].v)});
  const x=Math.round(p.x/250)*250,z=Math.round(p.z/250)*250,key=x+','+z+','+low;if(a.shadow!==key){a.sun.position.set(x-600,1250,z+500);a.sun.target.position.set(x,0,z);a.sun.target.updateMatrixWorld();a.shadow=key;window.__KEEP_SHADOW_DIRTY=true;}
}
window.__keepObstacleDrawn=o=>!!active&&active.obstacles.has(o);
window.__keepWallDrawn=o=>!!active&&active.walls.has(o);
