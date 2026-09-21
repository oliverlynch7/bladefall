import {claimSurface} from './surface-regions.js?v=1972';
/* Hollow Pass: warm sandstone canyon scenery over the authored collision surfaces. */
import * as THREE from './three.module.js';
import {GLTFLoader} from './jsm/loaders/GLTFLoader.js';
const kit=new Map(),dummy=new THREE.Object3D(),CHUNK=400;
let pending,failed=false,active=null;
const hash=(x,z)=>{const v=Math.sin(x*12.9898+z*78.233)*43758.5453;return v-Math.floor(v)};
const palette=['#c4955e','#cea66f','#bb8c55','#ddbb85','#c49b67'];
export const wantsHollow=w=>!failed&&w.zone==='hollow'&&!w.hub&&!w.trial&&!w.arena&&!w.bonus&&new URLSearchParams(location.search).get('hollowart')!=='0';
export const hollowReady=()=>kit.size===8;
export function loadHollow(){
  if(pending)return pending;
  pending=new Promise(resolve=>new GLTFLoader().load('./hollow-assets/hollow-kit.glb',g=>{
    try{g.scene.updateMatrixWorld(true);g.scene.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);const co=geo.attributes.color,mean=new THREE.Color(0,0,0);for(let i=0;i<co.count;i++){mean.r+=co.getX(i);mean.g+=co.getY(i);mean.b+=co.getZ(i)}mean.multiplyScalar(1/co.count);kit.set(o.name,{geo,mean,tri:(geo.index?.count||geo.attributes.position.count)/3});});if(kit.size!==7)throw Error('Incomplete canyon kit');
      const geo=new THREE.TorusGeometry(.5,.055,4,12,Math.PI).toNonIndexed(),colors=[];for(let i=0;i<geo.attributes.position.count;i++)colors.push(1,1,1);geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));kit.set('fossil',{geo,mean:new THREE.Color(1,1,1),tri:geo.attributes.position.count/3});}
    catch(e){failed=true;console.warn('[hollow-art]',e)}resolve();
  },undefined,e=>{failed=true;console.warn('[hollow-art] Original scenery fallback',e);resolve()}));return pending;
}
const material=new THREE.MeshLambertMaterial({vertexColors:true});
export function buildHollow(scene,w){
  const root=new THREE.Group();root.name='Hollow Pass · The Wind-carved Canyon';
  const bins=new Map(),obstacles=new WeakSet(),ribbons=[],owned=[],windbreaks=[],occluders=new Map();let floors=0,source=null;
  function add(name,x,y,z,sx=1,sy=sx,sz=sx,color=null,rot=0){const cell=Math.floor(x/CHUNK)+','+Math.floor(z/CHUNK),key=cell+'|'+name;if(!bins.has(key))bins.set(key,{cell,name,list:[]});bins.get(key).list.push({x,y,z,sx,sy,sz,color,rot,source});}
  const block=(x,y,z,ww,h,d,c)=>add(Math.min(ww,h,d)<=2?'timber':'stone',x,y,z,ww,h,d,c);
  const tops=(w.obstacles||[]).filter(o=>!o.autoCol&&!o.invisible&&!o.treeCol&&!o.pillarCol);
  // Each heightfield slab retains its exact extent. Broad caps split into worn flagstones.
  const surfaces=new Map();
  function surface(o,base,top,wood=false){
    if(o.terrain||o.caveWall||o.kind==='col')return rawSurface(o,base,top,wood);
    for(const part of claimSurface(surfaces,{...o,w:o.w||20,d:o.d||o.w||20},w.cliffScene!=null?'cliff-union':base+':'+top))rawSurface(part,base,top,wood);
  }
  function rawSurface(o,base,top,wood=false){
    const ww=o.w||20,dd=o.d||ww,height=Math.max(1,top-base),r=hash(o.x,o.z),c=palette[Math.floor(r*5)];
    if(o.canyonCliff){add('column',o.x,base,o.z,ww,height,dd,'#b78954',r*.22);return;}
    // The expanded pass is carved out of rock, not a staircase of floating paving slabs.
    // Collision tops remain exact; the rock beneath extends into the canyon mist.
    if(w.cliffScene!=null&&!wood){
      const bottom=-360,depth=top-bottom;
      add('stone',o.x,bottom+depth/2,o.z,ww,depth,dd,'#977047');
      add('timber',o.x,top+.55,o.z,ww,1.1,dd,c);
      for(let y=bottom+65;y<top-10;y+=72){
        for(const side of [-1,1]){
          block(o.x,y,o.z+side*(dd/2-.7),ww,4,1.6,'#b28a57');
          block(o.x+side*(ww/2-.7),y,o.z,1.6,4,dd,'#b28a57');
        }
      }
      if(ww>160&&dd>160&&r<.3)add('scree',o.x+ww*.31,top+1,o.z-dd*.27,17,9,20);
      floors++;return;
    }
    if(top===0&&!wood){
      add('stone',o.x,base+height/2,o.z,ww,height,dd,'#b78b56');
      add('timber',o.x,.4,o.z,ww+0.02,1.2,dd+0.02,'#cba36b');floors++;
      // Sparse sand ripples replace the room-sized checkerboard paving.
      if(ww>100&&dd>100)for(let k=0;k<3;k++){
        const x=o.x+(hash(o.x+k,o.z)-.5)*ww*.45,z=o.z+(k-1)*dd*.22;
        add('timber',x,1.15,z,Math.min(ww*.45,120),.35,1.6,'#bc965f',.2);
      }
      return;
    }
    add(wood?'timber':'stone',o.x,base+height/2,o.z,ww,height,dd,wood?'#69583e':top>70?'#805936':'#a67547');
    const nx=Math.ceil(ww/48),nz=Math.ceil(dd/48),dx=ww/nx,dz=dd/nz;
    for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){
      const x=o.x-ww/2+(ix+.5)*dx,z=o.z-dd/2+(iz+.5)*dz;
      add('timber',x,top+.5,z,dx-.9,1.4,dz-.9,wood?'#9a8058':palette[Math.floor(hash(x,z)*5)]);floors++;
    }
    // Shallow seams sit inside the solid, never extending into a walking route.
    if(height>45){const rows=Math.min(8,Math.ceil(height/44));for(let j=1;j<rows;j++){
      const y=base+height*j/rows;
      for(const side of [-1,1]){block(o.x,y,o.z+side*(dd/2-.6),ww,1.8,1.6,'#654934');block(o.x+side*(ww/2-.6),y,o.z,1.6,1.8,dd,'#654934');}
    }}
    if(o.terrain&&height>100){const side=o.x<0?1:-1,rows=Math.min(6,Math.ceil(height/65)),rh=height/rows;
      for(let row=0;row<rows;row++)for(let k=0;k<2;k++)block(o.x+side*(ww/2-.7),base+(row+.5)*rh,o.z+(k-.5)*dd/2,1.8,rh-2,dd/2-2,['#a77948','#bb9058','#d1a56a'][Math.floor(hash(o.x+row,o.z+k)*3)]);
    }
    if(top>130&&ww>=80&&dd>=70&&r<.36){add('scree',o.x,top+1.2,o.z,30,25,30);if(r<.12)add('thorn',o.x+ww*.21,top+1,o.z,24,30,24);else add('tuft',o.x-ww*.22,top+1,o.z,28);}
  }
  // Subtract overlapping road rectangles before tiling; crossing roads must not z-fight.
  if(w.cliffScene!=null){
    // Highest surface owns each footprint. Subtract lower overlaps before adding cliff faces,
    // preventing coplanar sidewalls and caps along the switchbacks.
    const entries=[...tops.map(o=>({o,base:o.y0??Math.min(0,o.h-18),top:o.h,solid:true})),
      ...(w.segments||[]).filter(o=>!o.nofloor).map(o=>({o,base:-25,top:0}))].sort((a,b)=>b.top-a.top);
    for(const e of entries){source=e.solid?e.o:null;surface(e.o,e.base,e.top,!!e.o.bridge);if(e.solid)obstacles.add(e.o);}
  }else{
  const laid=[];
  for(const s of w.segments||[]){if(s.nofloor)continue;let pieces=[{a:s.x-s.w/2,b:s.x+s.w/2,c:s.z-s.d/2,d:s.z+s.d/2}];
    for(const old of laid)pieces=pieces.flatMap(p=>{const a=Math.max(p.a,old.a),b=Math.min(p.b,old.b),c=Math.max(p.c,old.c),d=Math.min(p.d,old.d);if(a>=b||c>=d)return[p];return[{a:p.a,b:a,c:p.c,d:p.d},{a:b,b:p.b,c:p.c,d:p.d},{a,b,c:p.c,d:c},{a,b,c:d,d:p.d}].filter(q=>q.b-q.a>.01&&q.d-q.c>.01)});
    for(const p of pieces){surface({x:(p.a+p.b)/2,z:(p.c+p.d)/2,w:p.b-p.a,d:p.d-p.c},-25,0,!!s.bridge);laid.push(p);}
  }
  for(const o of tops){source=o;const top=o.h||1,base=o.y0??(o.kind==='plat'?Math.min(0,top-18):0);surface(o,base,top,!!(o.bridge||o.root));obstacles.add(o);
    if(o.bridge){const alongX=o.w>o.d,length=alongX?o.w:o.d,width=alongX?o.d:o.w;
      for(const side of [-1,1])for(let i=0;i<=Math.floor(length/65);i++){const u=-length/2+i*length/Math.max(1,Math.floor(length/65));add('timber',o.x+(alongX?u:side*(width/2-3)),top+17,o.z+(alongX?side*(width/2-3):u),3,34,3,'#6e5436');}
      for(const side of [-1,1])add('timber',o.x+(alongX?0:side*(width/2-3)),top+28,o.z+(alongX?side*(width/2-3):0),alongX?length:2.2,2.2,alongX?2.2:length,'#ad9060');
    }
  }
  }
  source=null;
  // Replace the old decorative canyon scatter, preserving every supplied anchor and height.
  for(const d of w.deco||[]){const ww=d.w||20,dd=d.d||ww,hh=d.h||20,y=d.y0||0,r=hash(d.x,d.z);
    if(d.kind==='fossil'){add('fossil',d.x,y,d.z,ww,hh*2,dd,'#e3d5b0',Math.PI/2);continue;}
    if(d.kind==='windbreak'){
      add('beacon',d.x,y,d.z,20,20,20,'#c79a54');
      const geo=new THREE.BoxGeometry(64,9,7),mat=new THREE.MeshLambertMaterial({color:'#64c7bb'}),arrow=new THREE.Mesh(geo,mat);
      arrow.position.set(d.x,y+90,d.z);root.add(arrow);owned.push(geo,mat);windbreaks.push({arrow,id:windbreaks.length});continue;
    }
    if(d.theme==='canyon'||d.theme==='plains'||d.kind==='rock'||d.kind==='standstone'){
      if(hh>45&&ww<160)add('column',d.x,y,d.z,ww,hh,dd,'#bf955e',r*.35);
      else if(hh<26&&ww<70)add(r<.5?'tuft':'scree',d.x,y,d.z,ww,Math.min(24,hh),dd);
      else block(d.x,y+hh/2,d.z,ww,hh,dd,'#aa804e');
    }else if(d.kind==='tree'||d.theme==='forest'){if(d.lead===false)continue;add('thorn',d.x,y,d.z,Math.min(ww,45),Math.min(hh/2.2,70),Math.min(dd,45));}
    else if(d.kind==='lantern')add('beacon',d.x,y,d.z,18);
    else if(hh<4&&ww>60)continue;
    else add('stone',d.x,y+hh/2,d.z,ww,hh,dd,hh>55?'#9b754d':'#c59d69');
  }
  // Icon-like column silhouettes beyond the traversable terrain perimeter.
  if((w.obstacles||[]).some(o=>o.terrain)){
    const zs=tops.filter(o=>o.terrain).map(o=>o.z),lo=Math.min(...zs),hi=Math.max(...zs),left=Math.min(...tops.map(o=>o.x-(o.w||0)/2))-200,right=Math.max(...tops.map(o=>o.x+(o.w||0)/2))+200;
    for(let z=lo;z<=hi;z+=185)for(const side of [-1,1]){const r=hash(side,z),x=(side<0?left:right)+side*r*230;add('column',x,-20,z,110+r*95,500+r*480,110+r*70,'#bb8c55');}
  }
  // Thin, low-opacity wind trails echo the teal swirls in the icon. No full-screen particles.
  for(const [i,r] of (w.canyonWind?.zones||w.rooms||[]).entries()){
    const points=[];for(let j=0;j<=28;j++){const t=j/28;points.push(new THREE.Vector3(r.x+Math.sin(t*5.4+i)*Math.min(180,(r.w||600)*.28),(r.y||0)+80+t*170,r.z+220-t*440));}
    const curve=new THREE.CatmullRomCurve3(points),geo=new THREE.TubeGeometry(curve,28,1.6,3,false),mat=new THREE.MeshBasicMaterial({color:'#70aaa1',transparent:true,opacity:.24,depthWrite:false});const m=new THREE.Mesh(geo,mat);root.add(m);ribbons.push({m,x:r.x,z:r.z,phase:i,vane:r.vane});owned.push(geo,mat);
  }
  const groups=new Map();let triangles=0,instances=0;
  for(const {cell,name,list} of bins.values()){
    if(!groups.has(cell)){const g=new THREE.Group();g.userData.cell=cell;groups.set(cell,g);root.add(g)}const rec=kit.get(name),m=new THREE.InstancedMesh(rec.geo,material,list.length),col=new THREE.Color();
    for(let i=0;i<list.length;i++){const d=list[i];dummy.position.set(d.x,d.y,d.z);dummy.scale.set(d.sx,d.sy,d.sz);dummy.rotation.set(0,d.rot,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);col.set(d.color||'#ffffff');if(d.color){col.r/=Math.max(.015,rec.mean.r);col.g/=Math.max(.015,rec.mean.g);col.b/=Math.max(.015,rec.mean.b)}m.setColorAt(i,col);if(d.source){if(!occluders.has(d.source))occluders.set(d.source,{o:d.source,parts:[],hidden:false});occluders.get(d.source).parts.push({mesh:m,index:i,matrix:dummy.matrix.clone()});}}
    m.userData.artMatrices=m.instanceMatrix.array.slice();m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;m.computeBoundingSphere();m.castShadow=name!=='tuft';m.receiveShadow=true;m.userData.tri=list.length*rec.tri;groups.get(cell).add(m);triangles+=m.userData.tri;instances+=list.length;
  }
  scene.traverse(o=>{if(o.isLight){if(o.userData._w3dOrig==null)o.userData._w3dOrig=o.intensity;o.intensity=o.userData._w3dOrig*(o.isAmbientLight?.58:.14)}});
  const oldFog=scene.fog;scene.fog=new THREE.Fog('#9c805b',750,2500);
  const sun=new THREE.DirectionalLight('#ffe0b0',2.1);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-780,right:780,top:780,bottom:-780,near:1,far:2800});sun.shadow.camera.updateProjectionMatrix();sun.shadow.normalBias=1.4;root.add(sun,sun.target);
  const counts={hollowArt:true,artObstacles:true,floorTiles:floors,totalTriangles:triangles,instances,chunks:groups.size,visibleTriangles:0,visibleDrawCalls:0};
  active={root,groups,obstacles,ribbons,windbreaks,sun,counts,occluders,zero:new THREE.Matrix4().makeScale(0,0,0)};window.__HOLLOW_ART_ACTIVE=true;
  root.userData.dispose=()=>{scene.fog=oldFog;sun.shadow.map?.dispose();for(const o of owned)o.dispose();if(active?.root===root)active=null;window.__HOLLOW_ART_ACTIVE=false;};return {group:root,counts};
}
export function updateHollow(w){
  if(!active||!w.p)return;const a=active,p=w.p,low=window.__BF_META?.().quality==='low',range=low?750:1200;let tris=0,calls=0;
  for(const [cell,g] of a.groups){const [x,z]=cell.split(',').map(Number);g.visible=Math.hypot((x+.5)*CHUNK-p.x,(z+.5)*CHUNK-p.z)<range+CHUNK*.72;if(g.visible)for(const m of g.children){tris+=m.userData.tri;calls++}}
  // Cut away only the cliff pieces between the camera and hero. The collider never changes.
  for(const f of a.occluders.values()){
    const o=f.o,top=o.h||0,base=o.y0??Math.min(0,top-18);let hidden=false;
    if(w.eye&&window.__BF_META?.().camMode!=='fps'&&p.y<top-8&&Math.hypot(o.x-p.x,o.z-p.z)<600){
      for(let t=.04;t<.96;t+=.06){const x=w.eye.x+(p.x-w.eye.x)*t,z=w.eye.z+(p.z-w.eye.z)*t,y=w.eye.y+(p.y+30-w.eye.y)*t;
        if(y>base-2&&y<top+4&&Math.abs(x-o.x)<o.w/2+6&&Math.abs(z-o.z)<o.d/2+6){hidden=true;break;}}
    }
    if(hidden!==f.hidden){for(const q of f.parts){q.mesh.setMatrixAt(q.index,hidden?a.zero:q.matrix);q.mesh.instanceMatrix.needsUpdate=true;}f.hidden=hidden;window.__HOLLOW_SHADOW_DIRTY=true;}
  }
  a.counts.visibleTriangles=tris;a.counts.visibleDrawCalls=calls;
  for(const v of a.windbreaks){const data=w.canyonWind?.vanes[v.id],time=w.canyonWind?.time||0,calm=data&&data.until>time;v.arrow.rotation.y=calm?0:Math.sin(time*.6)*.8;v.arrow.material.color.set(calm?'#91e6cd':'#d7a450');}
  for(const r of a.ribbons){const calm=r.vane!=null&&w.canyonWind?.vanes[r.vane]?.until>(w.canyonWind?.time||0);r.m.visible=!calm&&!low&&Math.hypot(r.x-p.x,r.z-p.z)<range;r.m.material.opacity=.18+.07*Math.sin(performance.now()*.0006+r.phase);}
  const x=Math.round(p.x/250)*250,z=Math.round(p.z/250)*250,key=x+','+z+','+low;if(a.shadow!==key){a.sun.position.set(x-500,1250,z+400);a.sun.target.position.set(x,0,z);a.sun.target.updateMatrixWorld();a.shadow=key;window.__HOLLOW_SHADOW_DIRTY=true;}
}
window.__hollowObstacleDrawn=o=>!!active&&active.obstacles.has(o);
