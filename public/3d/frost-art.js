import {claimSurface} from './surface-regions.js?v=1972';
/* Frostfell: faceted opaque ice keeps the cave maze affordable in a browser. */
import * as THREE from './three.module.js';
import {GLTFLoader} from './jsm/loaders/GLTFLoader.js';
const kit=new Map(),dummy=new THREE.Object3D(),zero=new THREE.Matrix4().makeScale(0,0,0),CHUNK=360;
let pending,failed=false,active=null;
const hash=(x,z)=>{const v=Math.sin(x*12.9898+z*78.233)*43758.5453;return v-Math.floor(v)};
export const wantsFrost=w=>!failed&&w.zone==='frost'&&!w.hub&&!w.trial&&!w.arena&&!w.bonus&&new URLSearchParams(location.search).get('frostart')!=='0';
export const frostReady=()=>kit.size>=7;
export function loadFrost(){
  if(pending)return pending;
  pending=new Promise(resolve=>new GLTFLoader().load('./frost-assets/frost-kit.glb',g=>{
    try{g.scene.updateMatrixWorld(true);g.scene.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);const co=geo.attributes.color,mean=new THREE.Color(0,0,0);for(let i=0;i<co.count;i++){mean.r+=co.getX(i);mean.g+=co.getY(i);mean.b+=co.getZ(i)}mean.multiplyScalar(1/co.count);kit.set(o.name,{geo,mean,tri:(geo.index?.count||geo.attributes.position.count)/3});});if(!frostReady())throw Error('Incomplete Frostfell kit');}
    catch(e){failed=true;console.warn('[frost-art]',e)}resolve();
  },undefined,e=>{failed=true;console.warn('[frost-art] Original scenery fallback',e);resolve()}));return pending;
}
const material=new THREE.MeshLambertMaterial({vertexColors:true,emissive:'#07111a'});
const crystalMaterial=new THREE.MeshLambertMaterial({vertexColors:true,emissive:'#10364c'});
function subtract(p,o){const a=Math.max(p.a,o.a),b=Math.min(p.b,o.b),c=Math.max(p.c,o.c),d=Math.min(p.d,o.d);if(a>=b||c>=d)return[p];return[{a:p.a,b:a,c:p.c,d:p.d},{a:b,b:p.b,c:p.c,d:p.d},{a,b,c:p.c,d:c},{a,b,c:d,d:p.d}].filter(q=>q.b-q.a>.05&&q.d-q.c>.05)}
export function buildFrost(scene,w){
  const outdoor=!!w.frostScene;
  if(!kit.has('peakRock')){
    const install=(name,geo)=>{const col=new Float32Array(geo.attributes.position.count*3);col.fill(1);geo.setAttribute('color',new THREE.BufferAttribute(col,3));kit.set(name,{geo,mean:new THREE.Color(1,1,1),tri:(geo.index?.count||geo.attributes.position.count)/3});};
    install('drift',new THREE.IcosahedronGeometry(.5,0));install('barrel',new THREE.CylinderGeometry(.45,.4,1,10));install('peakRock',new THREE.CylinderGeometry(.43,.64,1,7,1));install('pine',new THREE.ConeGeometry(.5,1,7));install('trunk',new THREE.CylinderGeometry(.07,.10,1,6));
  }
  const root=new THREE.Group();root.name=w.frostScene?'Frostfell · Snowbound Peaks':'Frostfell · The Crystal Labyrinth';
  const bins=new Map(),obstacles=new WeakSet(),walls=new WeakSet(),caps=new Map(),roofs=new Map(),fade=[],glows=[],bodies=new Set();let floors=0,target=null,source=null;
  function add(name,x,y,z,sx=1,sy=sx,sz=sx,color=null,rot=0,obstacle=null){const cell=target||Math.floor(x/CHUNK)+','+Math.floor(z/CHUNK),key=cell+'|'+name;if(!bins.has(key))bins.set(key,{cell,name,list:[]});bins.get(key).list.push({x,y,z,sx,sy,sz,color,rot,obstacle:obstacle||source});}
  function cap(o,top,isWall){
    const key=Math.round(top*10),laid=caps.get(key)||[];caps.set(key,laid);let pieces=[{a:o.x-o.w/2,b:o.x+o.w/2,c:o.z-o.d/2,d:o.z+o.d/2}];for(const old of laid)pieces=pieces.flatMap(p=>subtract(p,old));
    for(const p of pieces){const x=(p.a+p.b)/2,z=(p.c+p.d)/2,ww=p.b-p.a,dd=p.d-p.c;
      add('snow',x,top+.55,z,ww,1.2,dd,isWall?'#d7e8ed':outdoor?'#e1e6df':['#91bdd1','#a1cadb','#b3d5e2','#9ac4d7'][Math.floor(hash(x,z)*4)],0,isWall?o:null);floors++;laid.push(p);
      if(!outdoor&&!isWall&&ww>65&&dd>65&&hash(x,z)<.22)add('snow',x,top+1.3,z,Math.min(ww,dd)*.68,.3,1.1,'#6c9bb4',hash(z,x)*1.5);
    }
  }
  const surfaces=new Map();
  function surface(o,base,top){
    if(o.terrain||o.caveWall||o.kind==='col')return rawSurface(o,base,top);
    for(const part of claimSurface(surfaces,{...o,w:o.w||20,d:o.d||o.w||20},base+':'+top))rawSurface(part,base,top);
  }
  function rawSurface(o,base,top){
    const ww=o.w||20,dd=o.d||ww,h=Math.max(1,top-base),key=[o.x,o.z,ww,dd,base,top].join(',');if(bodies.has(key))return;bodies.add(key);
    add(o.caveWall?'wall':'slab',o.x,base+h/2,o.z,ww,h,dd,o.caveWall?null:(w.frostScene&&o.c?'#806c52':'#52849f'),0,o.caveWall?o:null);cap({...o,w:ww,d:dd},top,!!o.caveWall);
    // Crystals grow on inaccessible wall crowns, not on the floor of the maze.
    if(o.caveWall&&hash(o.x,o.z)<.22)add('crystal',o.x,top+1,o.z,ww*.68,25+hash(o.z,o.x)*28,dd*.68);
  }
  for(const s of w.segments||[])if(!s.nofloor)surface(s,-22,0);
  const solids=(w.obstacles||[]).filter(o=>!o.autoCol&&!o.invisible&&!o.treeCol&&!o.pillarCol);
  for(const o of solids){source=outdoor?o:null;const top=o.h||1,base=outdoor&&o.mountainPath?-120:(o.y0??(o.kind==='plat'?Math.min(0,top-16):0));surface(o,base,top);obstacles.add(o);
    if(outdoor&&(o.terrain||(o.mountainPath&&hash(o.x,o.z)<.13))){const h=Math.max(100,top+120);add('peakRock',o.x,top-h*.5-4,o.z,o.w*1.35,h,o.d*1.35,'#6e8490',hash(o.x,o.z)*2);}
  }source=null;
  for(const o of w.walls||[]){if(o.invisible)continue;surface({...o,caveWall:true},o.y0||0,(o.y0||0)+(o.h||1));walls.add(o);}
  for(const d of w.deco||[]){source=outdoor?{...d,h:(d.y0||0)+(d.h||0)}:null;const ww=d.w||20,dd=d.d||ww,hh=d.h||20,y=d.y0||0,r=hash(d.x,d.z);
    if(d.kind==='mountainCamp'){
      for(const dx of [-40,40]){add('barrel',d.x+dx,y+24,d.z,38,48,38,'#7b6145');for(const dy of [9,37])add('barrel',d.x+dx,y+dy,d.z,40,5,40,'#47545b');}
      add('slab',d.x+10,y+9,d.z+70,130,14,30,'#877254');
      for(let j=0;j<7;j++){const a=j*Math.PI*2/7;add('drift',d.x+Math.cos(a)*28,y+5,d.z+135+Math.sin(a)*28,22,15,21,'#596c75',a);}add('drift',d.x,y+5,d.z+135,35,7,30,'#302d2a');continue;
    }
    if(d.kind==='mountainBoulder'){add('drift',d.x,y+hh*.35,d.z,ww,hh,dd,'#728792',r*3);add('drift',d.x-ww*.06,y+hh*.66,d.z,ww*.9,hh*.38,dd*.86,'#e1e6df',r*3);continue;}
    if(d.kind==='snowPine'){
      add('trunk',d.x,y+hh*.4,d.z,ww,hh*.8,dd,'#756348');
      for(let j=0;j<3;j++){add('pine',d.x,y+hh*(.45+j*.2),d.z,ww*(1-j*.2),hh*.55,dd*(1-j*.2),'#48686a');add('pine',d.x,y+hh*(.47+j*.2),d.z,ww*(.86-j*.18),hh*.51,dd*(.86-j*.18),'#d6e4df');}continue;
    }
    if(d.kind==='caveroof'){
      target='roof'+roofs.size;roofs.set(target,d);add('roof',d.x,y+hh/2,d.z,ww,hh,dd);target=null;
      // Ice ribs echo the destination arch at a few narrow, low-floor passages.
      if(ww>160&&ww<420&&r<.18){const floor=solids.filter(o=>!o.caveWall&&Math.abs(o.x-d.x)<o.w/2&&Math.abs(o.z-d.z)<o.d/2).reduce((h,o)=>Math.max(h,o.h),0);if(floor<130)add('arch',d.x,y-45,d.z,ww/2,50,22,'#93c7dd');}
      continue;
    }
    if(solids.some(o=>o.x===d.x&&o.z===d.z&&o.w===ww&&o.d===dd&&Math.abs(o.h-y-hh)<3))continue;
    if(d.theme==='frost'||d.kind==='standstone'||d.kind==='tree'){
      if(d.lead===false)continue;
      if(hh>45){add('crystal',d.x,y,d.z,ww,hh/2.8,dd);if(r<.2)glows.push(new THREE.Vector3(d.x,y+hh*.45,d.z));}
      else add('rubble',d.x,y,d.z,ww,Math.min(hh,26),dd);
    }else if(d.kind==='rock')add('rubble',d.x,y,d.z,ww,hh,dd);
    else if(hh<4&&ww>60)continue;
    else{add('slab',d.x,y+hh/2,d.z,ww,hh,dd,d.kind==='mountainTimber'?(d.c||'#8a7355'):hh>40?'#447f9c':'#9bc9db');if(hh>18)add('snow',d.x,y+hh+.5,d.z,ww,1,dd);}
  }
  source=null;
  const groups=new Map();let triangles=0,instances=0;
  for(const {cell,name,list} of bins.values()){
    if(!groups.has(cell)){const g=new THREE.Group();g.userData.cell=cell;g.userData.roof=roofs.get(cell)||null;groups.set(cell,g);root.add(g)}const rec=kit.get(name),m=new THREE.InstancedMesh(rec.geo,name==='crystal'?crystalMaterial:material,list.length),col=new THREE.Color();m.name='Frost '+name;
    for(let i=0;i<list.length;i++){const d=list[i];dummy.position.set(d.x,d.y,d.z);dummy.scale.set(d.sx,d.sy,d.sz);dummy.rotation.set(0,d.rot,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);col.set(d.color||'#ffffff');if(d.color){col.r/=Math.max(.015,rec.mean.r);col.g/=Math.max(.015,rec.mean.g);col.b/=Math.max(.015,rec.mean.b)}m.setColorAt(i,col);if(d.obstacle)fade.push({mesh:m,index:i,o:d.obstacle,matrix:dummy.matrix.clone(),hidden:false});}
    m.userData.artMatrices=m.instanceMatrix.array.slice();m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;m.computeBoundingSphere();m.castShadow=name!=='snow'&&name!=='roof';m.receiveShadow=true;m.userData.tri=list.length*rec.tri;groups.get(cell).add(m);triangles+=m.userData.tri;instances+=list.length;
  }
  scene.traverse(o=>{if(o.isLight){if(o.userData._w3dOrig==null)o.userData._w3dOrig=o.intensity;o.intensity=o.userData._w3dOrig*(o.isAmbientLight?.72:.18)}});
  const oldFog=scene.fog;scene.fog=new THREE.Fog(w.frostScene?'#8ea8b5':'#1c3547',w.frostScene?800:500,w.frostScene?2400:2000);
  const sun=new THREE.DirectionalLight('#d3edff',1.8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-740,right:740,top:740,bottom:-740,near:1,far:2600});sun.shadow.camera.updateProjectionMatrix();sun.shadow.normalBias=1.4;sun.shadow.bias=-.0002;root.add(sun,sun.target);
  const lights=[0,1,2].map(()=>{const l=new THREE.PointLight('#5bc8ff',800,210,1.6);root.add(l);return l});
  const counts={frostArt:true,artObstacles:true,floorTiles:floors,totalTriangles:triangles,instances,chunks:groups.size,visibleTriangles:0,visibleDrawCalls:0};
  active={root,groups,obstacles,walls,sun,counts,fade,glows,lights};window.__FROST_ART_ACTIVE=true;
  root.userData.dispose=()=>{scene.fog=oldFog;sun.shadow.map?.dispose();if(active?.root===root)active=null;window.__FROST_ART_ACTIVE=false;};return {group:root,counts};
}
export function updateFrost(w){
  if(!active||!w.p)return;const a=active,p=w.p,meta=window.__BF_META?.(),low=meta?.quality==='low',range=low?720:1080,fps=meta?.camMode==='fps';let tris=0,calls=0;
  for(const [cell,g] of a.groups){const roof=g.userData.roof,[cx,cz]=roof?[roof.x,roof.z]:cell.split(',').map(n=>(+n+.5)*CHUNK);g.visible=Math.hypot(cx-p.x,cz-p.z)<range+CHUNK*.72;
    if(g.visible&&roof&&!fps&&w.eye&&w.eye.y>roof.y0-30&&Math.abs(p.x-roof.x)<roof.w/2+180&&Math.abs(p.z-roof.z)<roof.d/2+230)g.visible=false;
    if(g.visible)for(const m of g.children){tris+=m.userData.tri;calls++}
  }
  for(const f of a.fade){const o=f.o;let hidden=false;if(!fps&&w.eye&&p.y<o.h-8&&Math.hypot(o.x-p.x,o.z-p.z)<650){let lo=.01,hi=.98;for(const [start,end,min,max]of [[w.eye.x,p.x,o.x-o.w/2-8,o.x+o.w/2+8],[w.eye.z,p.z,o.z-o.d/2-8,o.z+o.d/2+8],[w.eye.y,p.y+28,(o.y0??-10000)-2,o.h+5]]){const d=end-start;if(Math.abs(d)<.001){if(start<min||start>max){hi=-1;break;}}else{const a=(min-start)/d,b=(max-start)/d;lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));}}hidden=lo<=hi;}if(hidden!==f.hidden){f.mesh.setMatrixAt(f.index,hidden?zero:f.matrix);f.mesh.instanceMatrix.needsUpdate=true;f.hidden=hidden;}}
  a.counts.visibleTriangles=tris;a.counts.visibleDrawCalls=calls;
  const near=a.glows.map(v=>({v,d:(v.x-p.x)**2+(v.y-p.y)**2+(v.z-p.z)**2})).sort((x,y)=>x.d-y.d);a.lights.forEach((l,i)=>{l.visible=!low&&near[i]?.d<300**2;if(l.visible)l.position.copy(near[i].v)});
  const x=Math.round(p.x/250)*250,z=Math.round(p.z/250)*250,y=Math.round(p.y/200)*200,key=x+','+z+','+low+','+y;if(a.shadow!==key){a.sun.position.set(x-450,y+1200,z+500);a.sun.target.position.set(x,y,z);a.sun.target.updateMatrixWorld();a.shadow=key;window.__FROST_SHADOW_DIRTY=true;}
}
window.__frostObstacleDrawn=o=>!!active&&active.obstacles.has(o);
window.__frostWallDrawn=o=>!!active&&active.walls.has(o);
