/* Outskirts: original Blender kit, fitted to the game's existing geometry.
   No gameplay mutation. Static scenery is instanced in spatial chunks. */
import * as THREE from './three.module.js';
import {GLTFLoader} from './jsm/loaders/GLTFLoader.js';
const kit=new Map();let pending=null,failed=false;
const CHUNK=400,white=new THREE.Color('white'),dummy=new THREE.Object3D();
const hash=(x,z)=>{const n=Math.sin(x*12.9898+z*78.233)*43758.5453;return n-Math.floor(n)};
let active=null;
export function wantsOutskirts(w){return !failed && new URLSearchParams(location.search).get('outskirtsart')!=='0' && w.zone==='outskirts'&&!w.hub&&!w.trial&&!w.arena&&!w.bonus&&!w.delve;}
export function outskirtsReady(){return kit.size===10;}
export function loadOutskirts(){
  if(pending)return pending;
  pending=new Promise((resolve,reject)=>new GLTFLoader().load('./outskirts-assets/outskirts-kit.glb',g=>{
    g.scene.updateMatrixWorld(true);g.scene.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);geo.computeBoundingBox();let mean=new THREE.Color(0,0,0);const co=geo.attributes.color;for(let i=0;i<co.count;i++){mean.r+=co.getX(i);mean.g+=co.getY(i);mean.b+=co.getZ(i)}mean.multiplyScalar(1/co.count);kit.set(o.name,{geo,mean,tri:(geo.index?.count||geo.attributes.position.count)/3});});
    if(kit.size!==10){failed=true;resolve();return;}resolve();
  },undefined,e=>{failed=true;console.warn('[outskirts-art] asset unavailable; using original scenery',e);resolve();}));return pending;
}
function makeGrain(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),im=ctx.createImageData(128,128);for(let i=0;i<128*128;i++){const v=205+Math.floor(hash(i,55)*50);im.data.set([v,v,v,255],i*4)}ctx.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t;}
const grain=makeGrain();const material=new THREE.MeshLambertMaterial({vertexColors:true,map:grain});
function builder(root){
  const bins=new Map(),structures=[],lamps=[];let destination=null;
  function add(name,x,y,z,sx=1,sy=sx,sz=sx,color=null,rot=0){
    const cell=destination||`${Math.floor(x/CHUNK)},${Math.floor(z/CHUNK)}`;
    const key=cell+'|'+name;if(!bins.has(key))bins.set(key,{cell,name,list:[]});
    bins.get(key).list.push({x,y,z,sx,sy,sz,color,rot});
  }
  function solid(o,c='#726754',wood=false){
    const w=o.w||20,d=o.d||w,b=o.y0||0,h=o.kind==='plat'?Math.max(1,o.h-b):(o.h||1),top=b+h;
    add(wood?'timber':'tile',o.x,b+h/2,o.z,w,h,d,wood&&w>100&&d>80?'#988362':c);
    if(h<18)return;
    const rows=Math.min(7,Math.max(1,Math.round(h/17))),rh=h/rows;
    if(wood){
      for(const side of [-1,1]){
        add('timber',o.x+side*(w/2-3),b+h/2,o.z,6,h,d+1,'#413325');
        add('timber',o.x,b+h*.28,o.z+side*d/2,w,5,3,'#33281e');
        add('timber',o.x,b+h*.76,o.z+side*d/2,w,5,3,'#33281e');
      }
      return;
    }
    for(let row=0;row<rows;row++){
      for(const side of [-1,1])for(const axis of [0,1]){
        const length=axis?d:w,cols=Math.max(1,Math.ceil(length/29)),bw=length/cols;
        for(let i=0;i<cols;i++){
          const u=-length/2+(i+.5)*bw,shade=['#8c8067','#96896f','#827962','#a09175'][Math.floor(hash(o.x+i+row*17,o.z+side)*4)];
          add('brick',o.x+(axis?side*(w/2-.8):u),b+(row+.5)*rh,o.z+(axis?u:side*(d/2-.8)),axis?2:bw-.7,rh-.7,axis?bw-.7:2,shade);
        }
      }
    }
    add('tile',o.x,top-.6,o.z,w,1.2,d,'#9a8a6b');
  }
  return {add,solid,lamps,structures,
    structure(o,fn){destination='s'+structures.length;structures.push({id:destination,o});fn();destination=null},
    finish(){const groups=new Map();let triangles=0,instances=0;
      for(const {cell,name,list} of bins.values()){
        let g=groups.get(cell);if(!g){g=new THREE.Group();g.name='Outskirts '+cell;g.userData.cell=cell;groups.set(cell,g);root.add(g)}
        const rec=kit.get(name),m=new THREE.InstancedMesh(rec.geo,material,list.length);
        const col=new THREE.Color();
        for(let i=0;i<list.length;i++){const d=list[i];dummy.position.set(d.x,d.y,d.z);dummy.scale.set(d.sx,d.sy,d.sz);dummy.rotation.set(0,d.rot,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);
          if(d.color){col.set(d.color);col.r/=Math.max(.015,rec.mean.r);col.g/=Math.max(.015,rec.mean.g);col.b/=Math.max(.015,rec.mean.b);}else col.copy(white);m.setColorAt(i,col)}
        m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;m.computeBoundingSphere();m.frustumCulled=true;m.castShadow=!['tile','grass','crop'].includes(name);m.receiveShadow=true;m.userData.tri=rec.tri*list.length;g.add(m);triangles+=m.userData.tri;instances+=list.length;
      }
      for(const s of structures){s.group=groups.get(s.id);if(s.group)s.group.userData.obstacle=s.o}
      return {groups:[...groups.values()],structures,triangles,instances,lamps};
    }};
}
const covers=(s,x,z,margin=0)=>Math.abs(x-s.x)<=s.w/2+margin&&Math.abs(z-s.z)<=s.d/2+margin;
export function buildOutskirts(scene,w){
  const root=new THREE.Group();root.name='Outskirts authored art';const B=builder(root),add=B.add;
  const woods=w.area===1||w.side,boss=w.area<0,segs=(w.segments||[]).filter(s=>!s.nofloor&&s.w>8&&s.d>8),paths=segs.filter(s=>s.path);
  const soil=woods?'#494637':boss?'#635039':'#695b43';let floors=0,roads=0;
  const done=[];
  for(const s of segs){
    const nx=Math.ceil(s.w/36),nz=Math.ceil(s.d/36),dx=s.w/nx,dz=s.d/nz;
    for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){
      const x=s.x-s.w/2+(ix+.5)*dx,z=s.z-s.d/2+(iz+.5)*dz;
      if(done.some(r=>x-dx/2>=r.x-r.w/2&&x+dx/2<=r.x+r.w/2&&z-dz/2>=r.z-r.d/2&&z+dz/2<=r.z+r.d/2))continue;
      const road=s.path||paths.some(p=>covers(p,x,z)),r=hash(x,z);
      const c=road?['#a79470','#ac9975','#9d8b69','#b29e79'][Math.floor(r*4)]:soil;
      add(road?'brick':'tile',x,.45,z,road?dx-.5:dx+.05,2,road?dz-.5:dz+.05,c,0);floors++;if(road)roads++;
      if(!road&&r<.055){add('grass',x,2,z,25,25+hash(z,x)*12,25,woods?'#777344':null,r*6.28)}
      if(!road&&r>.982)add('rubble',x,1.8,z,18,10,18,null,r*6.28);
    }
    done.push(s);
  }
  // Chunked edging follows actual segment bounds; crossings and bridges stay open.
  for(const s of segs.filter(s=>s.district)){
    for(const side of [-1,1])for(let z=s.z-s.d/2+18;z<s.z+s.d/2;z+=38){
      const x=s.x+side*(s.w/2-7);if(segs.some(o=>o!==s&&covers(o,x+side*16,z,12)))continue;
      add('brick',x,5,z,13,10,35,'#625b4b');
      if(hash(x,z)<.30)add('grass',x-side*18,2,z,28,32,28,woods?'#777546':null);
    }
  }
  const obstacles=new WeakSet(),deco=w.deco||[];
  for(const o of w.obstacles||[]){
    if(o.autoCol||o.treeCol||o.pillarCol||o.invisible||o.h<=0)continue;
    // A structure deco is the visible owner of this matching collider.
    if(o.structure){obstacles.add(o);continue;}
    B.structure(o,()=>B.solid(o,woods?'#67694f':'#756950',!!(o.root||o.canopy||o.interior)));
    obstacles.add(o);
  }
  for(const d of deco){
    const kind=d.kind;if(d.lead===false||(kind==='tree'&&d.lead!==true))continue;
    const y=d.y0||0,ww=d.w||8,hh=d.h||1,dd=d.d||ww,r=hash(d.x,d.z);
    if(kind==='tree'){
      const h=(d.trunkH||0)+hh+30,base=y-(d.trunkH||0),sc=h/3.5;
      add('tree',d.x,base,d.z,sc,sc,sc,null,r*6.28);
      // Dark, sparse crowns in the woods retain its canopy identity.
      if(woods)for(let k=0;k<3;k++)add('brick',d.x+(k-1)*23,base+h*.67+Math.abs(k-1)*9,d.z,44,25,48,['#343d2b','#434932','#515337'][k],r*2);
      continue;
    }
    if(kind==='corn'){if(d.lead!==true)continue;const sc=(d.cropH||hh)/1.13;add('crop',d.x,y,d.z,sc,sc,sc,null,r*6.28);continue;}
    if(kind==='lantern'){
      const sc=(d.lampH||47)/3.8,base=y-(d.postH||0);add('lantern',d.x,base,d.z,sc,sc,sc);B.lamps.push(new THREE.Vector3(d.x,base+sc*3.1,d.z));continue;
    }
    if(kind==='standstone'||kind==='pillar'||kind==='column'){B.solid({...d,y0:y,kind:'col'},'#676656');continue;}
    if(kind==='rock'||kind==='grave'){add('rubble',d.x,y,d.z,ww,Math.max(14,hh)*2,dd);continue;}
    if(kind==='fence'){add('palisade',d.x,y,d.z,ww/1.9,hh/3,dd/.5);continue;}
    if(kind==='skipflower')continue;
    if(kind==='flower'||(d.theme==='plains'&&hh<22&&ww<20)){add('grass',d.x,y,d.z,24,30,24,null,r*6.28);continue;}
    // Keep explicitly colored gameplay marks, water, signs, and authored mill parts.
    const c=new THREE.Color(d.c||soil),timber=c.r>c.g*1.2&&c.g>c.b*1.12;
    if(ww>150&&dd>100&&hh>=20&&hh<=35&&y>60&&timber){
      B.structure({...d},()=>{
        add('timber',d.x,y+hh/2,d.z,ww,hh,dd,'#49372b');
        const nx=Math.ceil(ww/25),nz=Math.ceil(dd/28);
        for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){const x=d.x-ww/2+(ix+.5)*ww/nx,z=d.z-dd/2+(iz+.5)*dd/nz;add('brick',x,y+hh-1,z,ww/nx-.8,3,dd/nz-.8,['#69503a','#745a3e','#806449'][Math.floor(hash(x,z)*3)]);}
        for(const sign of [-1,1])add('timber',d.x,y+hh*.4,d.z+sign*(dd/2-.5),ww+2,7,4,'#9c7d50');
      });
    }else if(ww>55&&dd>45&&hh>32){
      const o={...d};B.structure(o,()=>B.solid(o,d.c,timber));
    }else add(timber?'timber':'tile',d.x,y+hh/2,d.z,ww,Math.max(.8,hh),dd,d.c||soil);
  }
  const state=B.finish();root.userData.art=state;
  // Lights affect only this zone and are restored by the outer world's clear function.
  scene.traverse(o=>{if(o.isLight){if(o.userData._w3dOrig==null)o.userData._w3dOrig=o.intensity;o.intensity=o.userData._w3dOrig*(o.isAmbientLight?.37:.24)}});
  state.oldFog=scene.fog;scene.fog=new THREE.Fog(woods?'#202827':'#302d29',650,2300);
  const key=new THREE.DirectionalLight(0xffd2a0,woods?1.35:1.8);key.position.set(-600,1000,600);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-650,right:650,top:650,bottom:-650,near:1,far:2600});key.shadow.normalBias=1.2;key.shadow.bias=-.0001;root.add(key,key.target);state.key=key;
  state.points=[0,1,2].map(()=>{const l=new THREE.PointLight(0xffb44e,900,150,1.6);root.add(l);return l});
  state.scene=scene;state.obstacles=obstacles;state.stats={outskirtsArt:true,floorTiles:floors,roadTiles:roads,tree:deco.filter(d=>d.kind==='tree'&&d.lead===true).length,totalTriangles:state.triangles,instances:state.instances,chunks:state.groups.length,drawCalls:state.groups.reduce((n,g)=>n+g.children.length,0),visibleTriangles:0,visibleDrawCalls:0,artObstacles:true};
  active=root;root.userData.dispose=()=>{scene.fog=state.oldFog;key.shadow.map?.dispose();if(active===root)active=null};
  return {group:root,counts:state.stats};
}
export function updateOutskirts(w){
  if(!active)return;const st=active.userData.art,p=w.p;if(!p)return;
  const low=window.__BF_META?.().quality==='low',distance=low?700:1050;
  let tris=0,calls=0;
  for(const g of st.groups){let x,z,r=CHUNK*.72;const ob=g.userData.obstacle;
    if(ob){x=ob.x;z=ob.z;r=Math.max(ob.w||10,ob.d||10)*.6}else{const a=g.userData.cell.split(',').map(Number);x=(a[0]+.5)*CHUNK;z=(a[1]+.5)*CHUNK}
    g.visible=Math.hypot(x-p.x,z-p.z)<distance+r;
    if(g.visible&&ob&&w.eye&&window.__BF_META?.().camMode!=='fps'&&(ob.h||0)>40&&p.y<(ob.y0||0)+(ob.h||0)-3){
      for(let t=.08;t<.94;t+=.08){const xx=w.eye.x+(p.x-w.eye.x)*t,zz=w.eye.z+(p.z-w.eye.z)*t;if(Math.abs(xx-ob.x)<(ob.w||10)/2+5&&Math.abs(zz-ob.z)<(ob.d||10)/2+5){g.visible=false;break}}
    }
    if(g.visible)for(const m of g.children){tris+=m.userData.tri||0;calls++}
  }
  st.stats.visibleTriangles=tris;st.stats.visibleDrawCalls=calls;
  const lamps=st.lamps.map(v=>({v,d:(v.x-p.x)**2+(v.y-(p.y||0))**2+(v.z-p.z)**2})).sort((a,b)=>a.d-b.d);
  st.points.forEach((l,i)=>{l.visible=!!lamps[i]&&lamps[i].d<250*250;if(l.visible)l.position.copy(lamps[i].v)});
  const sx=Math.round(p.x/300)*300,sz=Math.round(p.z/300)*300;
  const shadowKey=sx+','+sz+','+low;
  if(st.shadowKey!==shadowKey){st.key.position.set(sx-600,1000,sz+600);st.key.target.position.set(sx,0,sz);st.key.target.updateMatrixWorld();st.shadowKey=shadowKey;window.__OUTSKIRTS_SHADOW_DIRTY=true;}
  window.__OUTSKIRTS_ACTIVE=true;
}
export function outskirtsObstacleDrawn(o){return !!active&&active.visible&&active.userData.art.obstacles.has(o)}
window.__outskirtsObstacleDrawn=outskirtsObstacleDrawn;
