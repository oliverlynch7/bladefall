/* Final campaign worlds: opaque, instanced architecture; animated hazards retain their renderer. */
import * as THREE from './three.module.js';
import {GLTFLoader} from './jsm/loaders/GLTFLoader.js';
const kits=new Map(),pending=new Map(),failed=new Set(),dummy=new THREE.Object3D(),zero=new THREE.Matrix4().makeScale(0,0,0),CHUNK=420;
let active=null;
const profiles={
  ember:{name:'Emberdeep · The Basalt Furnace',emissive:'#100805',palette:['#65564a','#756150','#504942','#826952'],body:'#39332f',fog:'#291c19',sun:'#ffd2a0',lamp:'#ff751d',hazard:['#9c290b','#ff711c'],sky:[.161,.110,.098],sunGlow:[.12,.035,.005]},
  abyss:{name:'The Abyss · The Shattered Orbit',emissive:'#080613',palette:['#5b536e','#696077','#484255','#7c6c89'],body:'#393246',fog:'#171226',sun:'#c7b6f0',lamp:'#b568ff',hazard:['#100c1c','#472466'],sky:[.09,.071,.149],sunGlow:[.035,.012,.065]},
  palace:{name:'Sunspire Palace · The Gilded Colonnade',emissive:'#100e07',palette:['#d9d2bc','#ece3cb','#c8c3b4','#e2d7bb'],body:'#aaa28e',fog:'#c4bda6',sun:'#fff2d2',lamp:'#ffd56d',hazard:['#797d78','#b9c4bf'],sky:[.62,.65,.63],sunGlow:[.16,.125,.07]},
  castle:{name:'Castle Duskmoor · The Violet Crown',emissive:'#090810',palette:['#565460','#66616d','#454653','#766c77'],body:'#30323e',fog:'#211f32',sun:'#c5c5e5',lamp:'#c184ff',hazard:['#12141f','#34304c'],sky:[.13,.12,.19],sunGlow:[.025,.018,.055]}
};
const hash=(x,z)=>{const v=Math.sin(x*12.9898+z*78.233)*43758.5453;return v-Math.floor(v)};
export const wantsDeep=w=>!!profiles[w.zone]&&!failed.has(w.zone)&&!w.hub&&!w.trial&&!w.arena&&!w.bonus&&!w.delve&&new URLSearchParams(location.search).get('deepart')!=='0';
export const deepReady=w=>kits.get(w.zone)?.size===10;
export function loadDeep(w){
  const zone=w.zone;if(pending.has(zone))return pending.get(zone);
  const promise=new Promise(resolve=>new GLTFLoader().load(`./${zone}-assets/${zone}-kit.glb`,g=>{
    try{const kit=new Map();g.scene.updateMatrixWorld(true);g.scene.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);const c=geo.attributes.color,mean=new THREE.Color(0,0,0);for(let i=0;i<c.count;i++){mean.r+=c.getX(i);mean.g+=c.getY(i);mean.b+=c.getZ(i)}mean.multiplyScalar(1/c.count);kit.set(o.name.replace(/\.\d+$/,''),{geo,mean,tri:(geo.index?.count||geo.attributes.position.count)/3});});if(kit.size!==10)throw Error('Incomplete deep scenery kit');kits.set(zone,kit);}
    catch(e){failed.add(zone);console.warn('[deep-art]',e)}resolve();
  },undefined,e=>{failed.add(zone);console.warn('[deep-art] Original scenery fallback',e);resolve()}));pending.set(zone,promise);return promise;
}
function subtract(p,o){const a=Math.max(p.a,o.a),b=Math.min(p.b,o.b),c=Math.max(p.c,o.c),d=Math.min(p.d,o.d);if(a>=b||c>=d)return[p];return[{a:p.a,b:a,c:p.c,d:p.d},{a:b,b:p.b,c:p.c,d:p.d},{a,b,c:p.c,d:c},{a,b,c:d,d:p.d}].filter(q=>q.b-q.a>.05&&q.d-q.c>.05)}
export function buildDeep(scene,w){
  const abyss=w.zone==='abyss',regal=['palace','castle'].includes(w.zone),cfg=profiles[w.zone],kit=kits.get(w.zone),root=new THREE.Group();root.name=cfg.name;
  const bins=new Map(),obstacles=new WeakSet(),walls=new WeakSet(),caps=new Map(),fade=[],glows=[],bodies=new Set();let floors=0;
  const material=new THREE.MeshLambertMaterial({vertexColors:true,emissive:cfg.emissive}),glowMaterial=new THREE.MeshBasicMaterial({vertexColors:true});
  const palette=cfg.palette;
  function add(name,x,y,z,sx=1,sy=sx,sz=sx,color=null,rot=0,obstacle=null){const cell=Math.floor(x/CHUNK)+','+Math.floor(z/CHUNK),key=cell+'|'+name;if(!bins.has(key))bins.set(key,{cell,name,list:[]});bins.get(key).list.push({x,y,z,sx,sy,sz,color,rot,obstacle});}
  function cap(o,top,source=null){
    const key=Math.round(top*10),laid=caps.get(key)||[];caps.set(key,laid);let pieces=[{a:o.x-o.w/2,b:o.x+o.w/2,c:o.z-o.d/2,d:o.z+o.d/2}];for(const old of laid)pieces=pieces.flatMap(p=>subtract(p,old));
    for(const p of pieces){const nx=Math.max(1,Math.ceil((p.b-p.a)/115)),nz=Math.max(1,Math.ceil((p.d-p.c)/115)),tw=(p.b-p.a)/nx,td=(p.d-p.c)/nz;
      for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){const x=p.a+(ix+.5)*tw,z=p.c+(iz+.5)*td;add('cap',x,top+.55,z,Math.max(.1,tw-.7),1.1,Math.max(.1,td-.7),palette[Math.floor(hash(x,z)*4)],0,source);floors++;}laid.push(p);
    }
  }
  function surface(o,base,top,source=null){
    const ww=o.w||20,dd=o.d||ww,h=Math.max(1,top-base),key=[o.x,o.z,ww,dd,base,top].join(',');if(bodies.has(key))return;bodies.add(key);
    add('stone',o.x,base+h/2,o.z,ww,h,dd,cfg.body,0,source&&h>65?source:null);cap({...o,w:ww,d:dd},top,source&&h>65?source:null);
    // Below-floor fissures cannot be mistaken for safe stepping stones.
    if(!regal&&h>16&&ww>60&&hash(o.x,o.z)<.28)add('glow',o.x,base+h*.28,o.z+dd/2+.15,Math.min(ww*.55,65),2.5,.3);
    if(regal&&h>170&&ww>50&&dd>50){for(let y=base+100;y<top-55;y+=180){add('furnace',o.x,y,o.z+dd/2+.3,Math.min(ww*.45,38),55,2,null,0,source);}}
  }
  // Phaseable segments are removed/reinserted by gameplay without a scene rebuild.
  // Their original renderer must remain the sole owner of their visible surface.
  for(const s of w.segments||[])if(!s.nofloor&&!s.phaseable)surface(s,abyss?-45:-24,0);
  const solids=(w.obstacles||[]).filter(o=>!o.autoCol&&!o.invisible&&!o.treeCol&&!o.pillarCol);
    for(const o of solids){const top=o.h??1,base=o.y0??(o.kind==='plat'?Math.min(0,top-16):0);surface(o,base,top,o);obstacles.add(o);}
  for(const o of w.walls||[]){if(o.invisible)continue;surface(o,o.y0||0,(o.y0||0)+(o.h||1),o);walls.add(o);}
  // Exposed island edges get masonry courses; shared interior edges are left untouched.
  const terrain=solids.filter(o=>o.kind==='plat'&&o.terrain);
  for(const o of terrain){const top=o.h??0,base=o.y0??Math.min(0,top-16),height=top-base;if(height<35)continue;
    for(const axis of ['x','z'])for(const sign of [-1,1]){const size=axis==='x'?'w':'d',other=axis==='x'?'z':'x',span=axis==='x'?'d':'w',edge=o[axis]+sign*o[size]/2;let strips=[[o[other]-o[span]/2,o[other]+o[span]/2]];
      for(const n of terrain){if(n===o||(n.h??0)<top-.5||Math.abs(n[axis]-sign*n[size]/2-edge)>1)continue;const lo=n[other]-n[span]/2,hi=n[other]+n[span]/2;strips=strips.flatMap(([a,b])=>lo>=b||hi<=a?[[a,b]]:[[a,Math.max(a,lo)],[Math.min(b,hi),b]].filter(([a,b])=>b-a>1));}
      for(const [a,b] of strips){const rows=Math.min(5,Math.ceil(height/46)),bh=height/rows,cols=Math.max(1,Math.ceil((b-a)/82)),bw=(b-a)/cols;
        for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const t=a+(i+.5)*bw,x=axis==='x'?edge:t,z=axis==='z'?edge:t;
          add('stone',x,base+(j+.5)*bh,z,axis==='x'?1:bw-1.2,bh-1.2,axis==='z'?1:bw-1.2,palette[(i+j)%4],0,height>65?o:null);}
      }
    }
  }
  for(const d of w.deco||[]){const ww=d.w||20,dd=d.d||ww,hh=d.h||20,y=d.y0||0,r=hash(d.x,d.z);
    if(solids.some(o=>o.x===d.x&&o.z===d.z&&o.w===ww&&o.d===dd&&Math.abs(o.h-y-hh)<3))continue;
    if(regal&&d.kind==='column'){if(d.lead===false)continue;add('pillar',d.x,y-(d.pillarH||0),d.z,ww,hh+(d.pillarH||0),dd);continue;}
    if(regal&&['marble','castle','apex'].includes(d.theme)){add('crag',d.x,y,d.z,ww,hh,dd);continue;}
    if(regal&&d.kind==='lantern'){add('pillar',d.x,y,d.z,ww,hh,dd);add('glow',d.x,y+hh*.85,d.z,ww*.5,hh*.15,dd*.5);continue;}
    if(regal&&d.kind==='flower'){add('rubble',d.x,y,d.z,ww,hh,dd,'#5d7652');add('cap',d.x,y+hh*.25,d.z,ww*.35,hh*.16,dd*.35,'#d9b454');continue;}
    if(regal&&hh<4&&ww>60){add('cap',d.x,y+hh/2,d.z,ww,hh,dd,d.c||cfg.body);continue;}
    if(hh<4&&ww>60)continue;
    if(d.theme==='ember'||d.theme==='volcano'||d.theme==='void'||d.kind==='standstone'||d.kind==='rock'){
      if(d.lead===false)continue;
      add(!abyss&&hh>120&&r<.55?'furnace':hh>45?'crag':'rubble',d.x,y,d.z,ww,hh/(abyss&&hh>45?1.16:1),dd);
      if(hh>70&&r<.45){add('glow',d.x,y+hh*.45,d.z+dd*.21,ww*.075,hh*.55,dd*.06);glows.push(new THREE.Vector3(d.x,y+hh*.45,d.z));}
    }else if(['pillar','column','grave'].includes(d.kind)){add('pillar',d.x,y,d.z,ww,hh,dd);if(abyss&&hh>70)add('crag',d.x,y+hh+18,d.z,ww*.4,20,dd*.4);}
    else add('stone',d.x,y+hh/2,d.z,ww,hh,dd,hh>40?null:palette[Math.floor(r*4)]);
  }
  // A crown hangs high above existing scenery, with no new posts or solid geometry at player height.
  const anchors=(w.deco||[]).filter(d=>(d.h||0)>80&&Math.abs(d.x)>450).sort((a,b)=>a.z-b.z);
  if(regal)anchors.sort((a,b)=>Math.abs(a.z-(w.rooms?.[0]?.z||0))-Math.abs(b.z-(w.rooms?.[0]?.z||0)));
  for(let i=0;i<anchors.length;i+=Math.max(1,Math.ceil(anchors.length/5))){const d=anchors[i],y=Math.max(330,(d.y0||0)+(d.h||0)+140),s=abyss?125:110;
    if(abyss||regal){add('ring',d.x,y,d.z,s,s,s);add('rune',d.x,y,d.z,s,s,s);glows.push(new THREE.Vector3(d.x,y-40,d.z));}
    if(regal)break;
  }
  const groups=new Map();let triangles=0,instances=0;
  for(const {cell,name,list} of bins.values()){
    if(!groups.has(cell)){const g=new THREE.Group();groups.set(cell,g);root.add(g)}const rec=kit.get(name),m=new THREE.InstancedMesh(rec.geo,['glow','rune'].includes(name)?glowMaterial:material,list.length),col=new THREE.Color();m.name=w.zone+' '+name;
    for(let i=0;i<list.length;i++){const d=list[i];dummy.position.set(d.x,d.y,d.z);dummy.scale.set(d.sx,d.sy,d.sz);dummy.rotation.set(0,d.rot,0);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);col.set(d.color||'#ffffff');if(d.color){col.r/=Math.max(.015,rec.mean.r);col.g/=Math.max(.015,rec.mean.g);col.b/=Math.max(.015,rec.mean.b)}m.setColorAt(i,col);if(d.obstacle)fade.push({mesh:m,index:i,o:d.obstacle,matrix:dummy.matrix.clone(),hidden:false});}
    m.userData.artMatrices=m.instanceMatrix.array.slice();m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;m.computeBoundingSphere();m.castShadow=!['cap','glow','rune'].includes(name);m.receiveShadow=true;m.userData.tri=list.length*rec.tri;groups.get(cell).add(m);triangles+=m.userData.tri;instances+=list.length;
  }
  scene.traverse(o=>{if(o.isLight){if(o.userData._w3dOrig==null)o.userData._w3dOrig=o.intensity;o.intensity=o.userData._w3dOrig*(o.isAmbientLight?.8:.15)}});
  const oldFog=scene.fog;scene.fog=new THREE.Fog(cfg.fog,600,2400);
  const sun=new THREE.DirectionalLight(cfg.sun,2);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-740,right:740,top:740,bottom:-740,near:1,far:4000});sun.shadow.camera.updateProjectionMatrix();sun.shadow.normalBias=1.4;sun.shadow.bias=-.0002;root.add(sun,sun.target);
  const lights=[0,1,2].map(()=>{const l=new THREE.PointLight(cfg.lamp,900,230,1.6);root.add(l);return l});
  const counts={deepArt:w.zone,artObstacles:true,floorTiles:floors,totalTriangles:triangles,instances,chunks:groups.size,visibleTriangles:0,visibleDrawCalls:0};
  active={root,groups,obstacles,walls,sun,counts,fade,glows,lights};window.__DEEP_ART_LOOK=cfg;window.__DEEP_ART_ACTIVE=w.zone;
  root.userData.dispose=()=>{scene.fog=oldFog;sun.shadow.map?.dispose();material.dispose();glowMaterial.dispose();if(active?.root===root)active=null;window.__DEEP_ART_ACTIVE=false;window.__DEEP_ART_LOOK=null;};return {group:root,counts};
}
export function updateDeep(w){
  if(!active||!w.p)return;const a=active,p=w.p,meta=window.__BF_META?.(),low=meta?.quality==='low',range=low?780:1200,fps=meta?.camMode==='fps';let tris=0,calls=0;
  for(const [cell,g] of a.groups){const [cx,cz]=cell.split(',').map(n=>(+n+.5)*CHUNK);g.visible=Math.hypot(cx-p.x,cz-p.z)<range+CHUNK*.72;if(g.visible)for(const m of g.children){tris+=m.userData.tri;calls++}}
  for(const f of a.fade){const o=f.o;let hidden=false;if(!fps&&w.eye&&p.y<o.h-12&&Math.hypot(o.x-p.x,o.z-p.z)<500){for(let t=.05;t<.94;t+=.1){const x=w.eye.x+(p.x-w.eye.x)*t,z=w.eye.z+(p.z-w.eye.z)*t,y=w.eye.y+(p.y+28-w.eye.y)*t;if(y<o.h+5&&Math.abs(x-o.x)<o.w/2+8&&Math.abs(z-o.z)<o.d/2+8){hidden=true;break;}}}if(hidden!==f.hidden){f.mesh.setMatrixAt(f.index,hidden?zero:f.matrix);f.mesh.instanceMatrix.needsUpdate=true;f.hidden=hidden;}}
  a.counts.visibleTriangles=tris;a.counts.visibleDrawCalls=calls;
  const near=a.glows.map(v=>({v,d:(v.x-p.x)**2+(v.y-p.y)**2+(v.z-p.z)**2})).sort((x,y)=>x.d-y.d);a.lights.forEach((l,i)=>{l.visible=!low&&near[i]?.d<330**2;if(l.visible)l.position.copy(near[i].v)});
  const x=Math.round(p.x/250)*250,z=Math.round(p.z/250)*250,y=Math.round((p.y||0)/200)*200,key=x+','+y+','+z+','+low;if(a.shadow!==key){a.sun.position.set(x-450,y+1200,z+500);a.sun.target.position.set(x,y,z);a.sun.target.updateMatrixWorld();a.shadow=key;window.__DEEP_SHADOW_DIRTY=true;}
}
window.__deepObstacleDrawn=o=>!!active&&active.obstacles.has(o);
window.__deepWallDrawn=o=>!!active&&active.walls.has(o);
