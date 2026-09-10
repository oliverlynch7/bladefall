/* Ruined Keep: authored fortress scenery fitted to the existing game geometry. */
import * as THREE from './three.module.js';
import {GLTFLoader} from './jsm/loaders/GLTFLoader.js';
const kit=new Map(),dummy=new THREE.Object3D(),CHUNK=400;
let pending,failed=false,active=null;
const hash=(x,z)=>{const v=Math.sin(x*12.9898+z*78.233)*43758.5453;return v-Math.floor(v)};
const palette=['#65665c','#6b6b5f','#62665d','#716e60','#60645b'];
export const wantsKeep=w=>!failed&&w.zone==='keep'&&!w.hub&&!w.trial&&!w.arena&&!w.bonus&&!w.delve&&new URLSearchParams(location.search).get('keepart')!=='0';
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
  const bins=new Map(),obstacles=new WeakSet(),walls=new WeakSet(),caps=new Map(),lamps=[],structures=[],bodies=new Set();let target=null,floors=0;
  const under=w.area===1||w.side;
  function add(name,x,y,z,sx=1,sy=sx,sz=sx,color=null,rot=0){const cell=target||Math.floor(x/CHUNK)+','+Math.floor(z/CHUNK),key=cell+'|'+name;if(!bins.has(key))bins.set(key,{cell,name,list:[]});bins.get(key).list.push({x,y,z,sx,sy,sz,color,rot});}
  const block=(x,y,z,ww,h,d,c)=>add(Math.min(ww,h,d)<=3?'timber':'stone',x,y,z,ww,h,d,c);
  function cap(o,top,wood){
    const key=Math.round(top*10),laid=caps.get(key)||[];caps.set(key,laid);let pieces=[{a:o.x-o.w/2,b:o.x+o.w/2,c:o.z-o.d/2,d:o.z+o.d/2}];
    for(const old of laid)pieces=pieces.flatMap(p=>subtract(p,old));
    for(const p of pieces){const nx=Math.ceil((p.b-p.a)/52),nz=Math.ceil((p.d-p.c)/44),dx=(p.b-p.a)/nx,dz=(p.d-p.c)/nz;
      for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){const x=p.a+(ix+.5)*dx,z=p.c+(iz+.5)*dz;add('timber',x,top+.6,z,Math.max(.1,dx-.65),1.4,Math.max(.1,dz-.65),wood?'#846c48':palette[Math.floor(hash(x,z)*5)]);floors++;}laid.push(p);
    }
  }
  function surface(o,base,top,wood=false,facade=true){
    const ww=o.w||20,dd=o.d||ww,h=Math.max(1,top-base),key=[o.x,o.z,ww,dd,base,top].join(',');if(bodies.has(key))return;bodies.add(key);
    add(wood?'timber':'stone',o.x,base+h/2,o.z,ww,h,dd,wood?'#493a28':'#444b45');cap({...o,w:ww,d:dd},top,wood);
    if(h<35||!facade)return;const rows=Math.min(10,Math.ceil(h/30)),rh=h/rows;
    for(let row=0;row<rows;row++)for(const side of [-1,1])for(const axis of [0,1]){
      const len=axis?dd:ww,cols=Math.max(1,Math.ceil(len/55)),bw=len/cols;
      for(let k=0;k<cols;k++){const u=-len/2+(k+.5)*bw;block(o.x+(axis?side*(ww/2-.7):u),base+(row+.5)*rh,o.z+(axis?u:side*(dd/2-.7)),axis?1.8:bw-1.4,rh-1.2,axis?bw-1.4:1.8,wood?'#635037':palette[Math.floor(hash(k+row*7+o.x,side+o.z)*5)]);}
    }
    block(o.x,top-2,o.z,ww,4,dd,wood?'#6c573c':'#807967');
  }
  function brazier(x,y,z,s=20){add('brazier',x,y,z,s);lamps.push(new THREE.Vector3(x,y+s*2.05,z));}
  for(const s of w.segments||[])if(!s.nofloor)surface(s,-25,0,!!s.bridge,false);
  const solids=(w.obstacles||[]).filter(o=>!o.autoCol&&!o.invisible&&!o.treeCol&&!o.pillarCol);
  for(const o of solids){const base=o.y0??(o.kind==='plat'?Math.min(0,(o.h||0)-16):0),top=o.h||1;
    const deco=(w.deco||[]).find(d=>d.x===o.x&&d.z===o.z&&d.w===o.w&&(d.d||d.w)===o.d&&d.c?.startsWith('#4'));
    const crate=deco&&['#49392e','#3b2d24'].includes(deco.c)&&o.w>80;
    if(o.kind==='col'&&top>90&&o.w<180&&o.d<180){target='s'+structures.length;structures.push({cell:target,o});}
    if(crate){add('crate',o.x,base,o.z,o.w,top-base,o.d);cap(o,top,true);}
    else surface(o,base,top,!!o.bridge);
    obstacles.add(o);target=null;
    // Existing column silhouettes receive inset arrow slits without occupying extra floor.
    if(o.kind==='col'&&o.w>=70&&o.d>=60&&top>100){for(const side of [-1,1]){block(o.x,base+(top-base)*.61,o.z+side*(o.d/2+.35),12,28,1.2,'#151f1d');block(o.x,base+(top-base)*.58,o.z+side*(o.d/2+1),3,16,.5,'#bb7939');}}
  }
  for(const o of w.walls||[]){if(o.invisible)continue;surface(o,o.y0||0,(o.y0||0)+(o.h||1));walls.add(o);}
  for(const d of w.deco||[]){const ww=d.w||20,dd=d.d||ww,hh=d.h||20,y=d.y0||0,r=hash(d.x,d.z);
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
  // Span the actual two parallel curtain walls. There are no new posts in the passage.
  if(!w.side&&w.area===0&&(w.walls||[]).length>=2){const a=w.walls.find(o=>o.x===-730),b=w.walls.find(o=>o.x===20);if(a&&b){const x=(a.x+b.x)/2,z=-575;
    add('arch',x,198,z,(b.x-a.x)/2,170,42);for(const wall of [a,b]){add('banner',wall.x+(wall.x<x?35:-35),94,z+20,50,110,10);brazier(wall.x+(wall.x<x?0:0),220,z,18);}
  }}
  // Existing room corners are good light landmarks; fixture bases stay inside platform edges.
  for(const r of w.rooms||[]){if(!r.name)continue;const y=r.y||0;for(const side of [-1,1]){const x=r.x+side*(r.w/2-18),z=r.z-r.d/2+20;brazier(x,y,z,under?17:20);}}
  const groups=new Map();let triangles=0,instances=0;
  for(const {cell,name,list} of bins.values()){
    if(!groups.has(cell)){const g=new THREE.Group();g.userData.cell=cell;groups.set(cell,g);root.add(g)}const rec=kit.get(name),m=new THREE.InstancedMesh(rec.geo,name==='banner'?bannerMaterial:material,list.length),col=new THREE.Color();m.name='Keep '+name;
    for(let i=0;i<list.length;i++){const d=list[i];dummy.position.set(d.x,d.y,d.z);dummy.scale.set(d.sx,d.sy,d.sz);dummy.rotation.set(0,d.rot,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);col.set(d.color||'#ffffff');if(d.color){col.r/=Math.max(.015,rec.mean.r);col.g/=Math.max(.015,rec.mean.g);col.b/=Math.max(.015,rec.mean.b)}m.setColorAt(i,col);}
    m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;m.computeBoundingSphere();m.castShadow=name!=='banner'&&name!=='timber';m.receiveShadow=true;m.userData.tri=list.length*rec.tri;groups.get(cell).add(m);triangles+=m.userData.tri;instances+=list.length;
  }
  for(const s of structures)if(groups.has(s.cell))groups.get(s.cell).userData.obstacle=s.o;
  scene.traverse(o=>{if(o.isLight){if(o.userData._w3dOrig==null)o.userData._w3dOrig=o.intensity;o.intensity=o.userData._w3dOrig*(o.isAmbientLight?.56:.15)}});
  const oldFog=scene.fog;scene.fog=new THREE.Fog(under?'#262d2d':'#303831',650,2300);
  const sun=new THREE.DirectionalLight('#ffe1b2',under?1.15:2);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-780,right:780,top:780,bottom:-780,near:1,far:3000});sun.shadow.camera.updateProjectionMatrix();sun.shadow.normalBias=1.2;sun.shadow.bias=-.0002;root.add(sun,sun.target);
  const lights=[0,1,2].map(()=>{const l=new THREE.PointLight('#ffad55',900,180,1.6);root.add(l);return l});
  const counts={keepArt:true,artObstacles:true,floorTiles:floors,totalTriangles:triangles,instances,chunks:groups.size,visibleTriangles:0,visibleDrawCalls:0};
  active={root,groups,obstacles,walls,sun,counts,lamps,lights};window.__KEEP_ART_ACTIVE=true;
  root.userData.dispose=()=>{scene.fog=oldFog;sun.shadow.map?.dispose();if(active?.root===root)active=null;window.__KEEP_ART_ACTIVE=false;};return {group:root,counts};
}
export function updateKeep(w){
  if(!active||!w.p)return;const a=active,p=w.p,low=window.__BF_META?.().quality==='low',range=low?750:1200;let tris=0,calls=0;
  for(const [cell,g] of a.groups){const o=g.userData.obstacle,[cx,cz]=o?[o.x,o.z]:cell.split(',').map(n=>(+n+.5)*CHUNK);g.visible=Math.hypot(cx-p.x,cz-p.z)<range+CHUNK*.72;
    if(g.visible&&o&&w.eye&&p.y<o.h-5&&window.__BF_META?.().camMode!=='fps')for(let t=.08;t<.95;t+=.08){const x=w.eye.x+(p.x-w.eye.x)*t,z=w.eye.z+(p.z-w.eye.z)*t;if(Math.abs(x-o.x)<o.w/2+5&&Math.abs(z-o.z)<o.d/2+5){g.visible=false;break;}}
    if(g.visible)for(const m of g.children){tris+=m.userData.tri;calls++}
  }
  a.counts.visibleTriangles=tris;a.counts.visibleDrawCalls=calls;
  const near=a.lamps.map(v=>({v,d:(v.x-p.x)**2+(v.y-p.y)**2+(v.z-p.z)**2})).sort((x,y)=>x.d-y.d);a.lights.forEach((l,i)=>{l.visible=!low&&near[i]?.d<300**2;if(l.visible)l.position.copy(near[i].v)});
  const x=Math.round(p.x/250)*250,z=Math.round(p.z/250)*250,key=x+','+z+','+low;if(a.shadow!==key){a.sun.position.set(x-600,1250,z+500);a.sun.target.position.set(x,0,z);a.sun.target.updateMatrixWorld();a.shadow=key;window.__KEEP_SHADOW_DIRTY=true;}
}
window.__keepObstacleDrawn=o=>!!active&&active.obstacles.has(o);
window.__keepWallDrawn=o=>!!active&&active.walls.has(o);
