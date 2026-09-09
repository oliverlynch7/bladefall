/* The Waystation: original, instanced Blender scenery. The layout is owned by
   rebuildWaystationSanctum; service callbacks and portal unlocks stay in the game. */
import * as THREE from './three.module.js';
import {GLTFLoader} from './jsm/loaders/GLTFLoader.js';

const meshes=new Map(),loader=new GLTFLoader(),dummy=new THREE.Object3D();
let pending=null,failed=false,active=null;
const hash=(x,z)=>{const v=Math.sin(x*12.9898+z*78.233)*43758.5453;return v-Math.floor(v)};
const textures=new Map();
export const wantsHubArt=w=>!!(w?.hub&&w.hubArt&&!w.arena&&!w.trial&&!failed);
export const hubArtReady=()=>meshes.size===13;
export function loadHubArt(){
  if(pending)return pending;
  pending=new Promise(resolve=>loader.load('./hub-assets/waystation-kit.glb',g=>{
    try{
      g.scene.updateMatrixWorld(true);
      g.scene.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);
        const co=geo.attributes.color,mean=new THREE.Color(0,0,0);
        for(let i=0;i<co.count;i++){mean.r+=co.getX(i);mean.g+=co.getY(i);mean.b+=co.getZ(i)}mean.multiplyScalar(1/co.count);
        geo.computeBoundingSphere();meshes.set(o.name,{geo,mean,tri:(geo.index?.count||geo.attributes.position.count)/3});
      });
      if(!hubArtReady())throw new Error('Incomplete Waystation kit');
    }catch(e){failed=true;console.warn('[hub-art] Using the original hub renderer:',e)}
    resolve();
  },undefined,e=>{failed=true;console.warn('[hub-art] Kit unavailable:',e);resolve()}));
  return pending;
}
const surface=new THREE.MeshLambertMaterial({vertexColors:true});
function texture(url){if(!textures.has(url)){const t=new THREE.TextureLoader().load(url);t.colorSpace=THREE.SRGBColorSpace;textures.set(url,t)}return textures.get(url)}

export function buildHubArt(scene,w){
  const root=new THREE.Group();root.name='The Waystation · Lantern Court';
  const batches=new Map(),owned=[],lamps=[],animated=[],HU=w.hubArt.upgrades||{};
  let origin={x:0,z:0,ry:0};
  const point=(x,z)=>({x:origin.x+Math.cos(origin.ry)*x+Math.sin(origin.ry)*z,z:origin.z-Math.sin(origin.ry)*x+Math.cos(origin.ry)*z});
  function add(name,x,y,z,sx=1,sy=sx,sz=sx,color=null,ry=0){
    const p=point(x,z);if(!batches.has(name))batches.set(name,[]);
    batches.get(name).push({x:p.x,y,z:p.z,sx,sy,sz,color,ry:ry+origin.ry});
  }
  function at(x,z,ry,fn){const prev=origin;origin={x,z,ry};fn();origin=prev}
  const block=(x,y,z,w,h,d,c,ry=0)=>add('block',x,y,z,w,h,d,c,ry);
  const beam=(x,y,z,w,h,d,c='#493b2b')=>add('beam',x,y,z,w,h,d,c);
  function panel(map,x,y,z,width,height,opacity=1){
    const p=point(x,z),geo=new THREE.PlaneGeometry(width,height);
    const mat=new THREE.MeshBasicMaterial({map,transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false});
    const m=new THREE.Mesh(geo,mat);m.position.set(p.x,y,p.z);m.rotation.y=origin.ry;root.add(m);owned.push(geo,mat);return m;
  }
  function label(text,x,y,z,width,color='#dbc18a'){
    const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');
    ctx.fillStyle='#201f19';ctx.fillRect(0,0,512,96);ctx.strokeStyle='#826943';ctx.lineWidth=3;ctx.strokeRect(3,3,506,90);
    ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 31px Georgia';
    ctx.fillText(text.toUpperCase(),256,49,486);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;owned.push(t);panel(t,x,y,z,width,width*96/512);
  }
  function wall(x,z,width,height,ry=0){at(x,z,ry,()=>{
    const rows=Math.ceil(height/24),rh=height/rows;
    for(let row=0;row<rows;row++){
      const bw=48,start=-width/2,end=width/2;let pos=start-(row%2?24:0);
      while(pos<end){const a=Math.max(start,pos),b=Math.min(end,pos+bw);if(b-a>1)block((a+b)/2,(row+.5)*rh,0,b-a-1,rh-1,26,['#6f7162','#7b7b68','#89846d','#777867'][Math.floor(hash(pos,row+z)*4)]);pos+=bw}
    }
    block(0,height+3,0,width+3,7,32,'#a79b7a');
  })}
  function lamp(x,z){add('lamp',x,1.5,z,22);lamps.push(new THREE.Vector3(x,87,z))}

  // A single level court, with narrow alternating joints and an inlaid procession path.
  for(let iz=0;iz<39;iz++)for(let ix=0;ix<47;ix++){
    const x=-920+(ix+.5)*1840/47,z=-650+(iz+.5)*1540/39;
    const radial=Math.hypot(x,z-30),road=Math.abs(x)<82||Math.abs(z+420)<64||Math.abs(z-540)<42;
    const ring=radial>107&&radial<146,service=Math.abs(x)>515&&Math.abs(x)<730&&z>-235&&z<500;
    const pal=ring?['#a98b53','#b49a60']:road?['#a39576','#b1a17f','#a69778']:service?['#777865','#7f7e69']:['#6c705f','#737362','#7b7965'];
    block(x,.25,z,1840/47-.55,1.5,1540/39-.55,pal[Math.floor(hash(x,z)*pal.length)]);
  }
  // Compass arms are flush floor inlays, never raised steps in the arrival route.
  for(let i=0;i<8;i++){const a=i*Math.PI/4;block(Math.sin(a)*114,1.07,30+Math.cos(a)*114,5,.18,40,'#c2a769',a)}
  add('waystone',0,1,30,23);
  const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(13,0),new THREE.MeshBasicMaterial({color:HU.gild?0xffe5a3:0xeec687}));
  crystal.position.set(0,66,30);root.add(crystal);animated.push(crystal);owned.push(crystal.geometry,crystal.material);
  // The central crystal is its own sign; keep the sightline to the gates open above it.

  // Low side walls and a northern cloister. Every arch opens toward its existing interaction point.
  wall(0,-635,1840,112);wall(-910,110,1460,68,Math.PI/2);wall(910,110,1460,68,Math.PI/2);
  wall(-560,880,700,72);wall(560,880,700,72);
  const palette=['#b99d60','#7997a2','#87927a','#9eb8bf','#be8357','#9f83b0','#c6ad75','#907daa'];
  const icons=['outskirts','hollow','keep','frost','ember','abyss','palace','castle'];
  for(const g of w.gates||[]){
    if(g.side){at(g.x,g.z,0,()=>{add('arch',0,1,-12,10);panel(texture('./icons/destinations/'+(w.hubArt.sideIcons[g.zi]||'thornwood')+'.png'),0,31,0,28,34,.9)});continue;}
    const col=palette[g.zi%8];
    at(g.x,g.z,0,()=>{
      add('arch',0,1,-34,34);block(0,2,14,106,3,55,'#80775e');
      // The open portal reads as a luminous destination painting within the arch.
      panel(texture('./icons/destinations/'+icons[g.zi]+'.png'),0,75,-28,76,98,g.open?1:.52);
      label(g.name,0,191,-31,172,g.open?'#e5c78e':'#b7b4a5');
      beam(0,183,-35,9,33,7,'#655638');
      block(0,177,-34,24,10,32,g.done?'#91bb84':col);
      for(const s of [-1,1]){block(s*51,52,-14,4,76,2,g.open?col:'#575b54');}
    });
  }
  // Small matching buttresses create a rhythm; there is no imported gatehouse mass.
  for(const x of [-900,-800,-600,-400,-200,0,200,400,600,800,900]){
    add('pillar',x,0,-622,22);if(HU.ramparts)block(x,136,-622,37,20,38,'#9b9477');
  }

  const stationArt={quartermaster:['Quartermaster','action_buy.png'],chest:['Your Bag','action_bag_stash.png'],anvil:['The Smith','action_forge_fuse.png'],keeper:['The Stylist','action_wardrobe_stylist.png'],drillmaster:['Drillmaster','class-core.png'],beastkeeper:['Beastkeeper','beastkeeper.png'],board:['Postings',null],mirror:['The Mirror',null],sparring:['Sparring Room',null]};
  for(const n of w.hubNpcs||[]){
    if(n.id==='arcade'){at(n.x,n.z,Math.PI,()=>{beam(0,38,0,45,76,30,'#354439');block(0,48,16,32,31,2,'#75a28c');beam(0,24,22,42,6,16);label(n.name,0,87,13,100);});continue;}
    if(n.district==='undercroft'){
      at(n.x,n.z,Math.PI,()=>{
        add('arch',0,0,-20,25);block(0,1,14,110,2,64,'#66566c');
        const col=n.c2||'#b99975';block(0,72,-21,44,85,3,'#242532');block(0,70,-18,4,63,2,col);
        label(n.name,0,142,-18,165);
        for(let j=0;j<3;j++)block((j-1)*12,17,-17,5,5,3,col);
      });continue;
    }
    const side=n.x<0?-1:1,ry=n.id==='sparring'?0:-side*Math.PI/2;
    at(n.x,n.z,ry,()=>{
      if(n.id!=='sparring'){
        // A shallow back wall and roof leave all of the plaza-facing half open.
        for(let row=0;row<4;row++)for(let j=0;j<3;j++)block((j-1)*36,12+row*24,-59,35,23,11,['#8a8069','#968a71','#a09276'][(row+j)%3]);
        for(const s of [-1,1])beam(s*53,62,-40,7,124,7);
        add('canopy',0,125,-35,32);
        const spec=stationArt[n.id];label(spec?.[0]||n.name,0,110,0,119);
        if(spec?.[1])panel(texture('./icons/'+spec[1]),0,74,-51,32,32);
      }
      if(n.id==='quartermaster'||n.id==='drillmaster'){
        beam(0,15,16,79,30,19);beam(0,32,16,84,5,24,'#8b7050');
        for(let j=0;j<4;j++)block((j-1.5)*17,39,16,8,9,8,['#99895f','#a5ad99','#8377a1','#b78050'][j]);
      }else if(n.id==='chest')add('chest',0,1,0,27);
      else if(n.id==='anvil'){
        add('anvil',0,1,6,23);block(-29,20,-28,35,38,28,'#655744');block(-29,29,-12,21,21,2,'#d08742');
        block(35,8,8,24,14,18,'#625e50');block(35,16,8,21,1,15,'#62888b');
      }else if(n.id==='board')add('board',0,1,-8,29,29,29,null,Math.PI);
      else if(n.id==='mirror'){
        add('mirror',0,1,-6,30,30,30,null,Math.PI);panel(null,0,41,-2,35,73,.16);
      }else if(n.id==='keeper'){
        beam(28,12,0,23,24,24,'#5d4a64');beam(28,31,-10,23,36,5,'#5d4a64');
      }else if(n.id==='beastkeeper'){
        for(const s of [-1,1]){beam(s*36,12,0,27,24,30);block(s*36,24,0,25,3,28,'#b09b60');}
      }else if(n.id==='sparring'){
        add('arch',0,0,-17,22);beam(0,46,-15,44,90,8);label('Sparring',0,120,-5,119);
      }
    });
  }
  // Side gardens have their own space beyond the service approaches.
  for(const s of [-1,1])for(const z of [-310,590]){
    block(s*800,8,z,126,16,118,'#6d715d');block(s*800,17,z,113,2,104,'#434b39');
    add('tree',s*800,18,z,41);for(let i=0;i<14;i++)add('grass',s*800+(hash(i,z)-.5)*105,18,z+(hash(z,i)-.5)*98,28);
  }
  for(const p of w.hubArt.lamps)lamp(p.x,p.z);
  add('chest',-806,1,670,24);
  // Outlying silhouettes sit beyond the courtyard, never between a station and the player.
  for(const [x,z,h] of [[-1080,-850,245],[1080,-850,245],[-1040,760,210],[1040,760,210]]){
    for(let y=0;y<h;y+=28)block(x,y+14,z,106,27,106,'#5f685c');
    block(x,h+4,z,126,12,126,'#8b8a70');add('canopy',x,h+12,z,37,70,37);
  }
  // Owned upgrades and victories remain visible and rebuild only when those values change.
  if(HU.banners)for(const side of [-1,1])for(const z of [-245,510])at(side*870,z,-side*Math.PI/2,()=>{
    beam(0,146,0,74,6,7);block(0,108,0,62,73,2,'#78483f');block(0,113,2,4,47,1,'#bfa773');
  });
  for(const [i,id] of icons.entries())if(w.hubArt.zoneDone[id]){block(-847,64,-150+i*65,19,40,23,palette[i]);block(-847,39,-150+i*65,25,8,27,'#9b8966');}
  if(HU.braziers)for(const x of [-270,270])for(const z of [-245,395]){add('lamp',x,0,z,27);lamps.push(new THREE.Vector3(x,105,z));}

  let triangles=0,instances=0;
  for(const [name,list] of batches){
    const rec=meshes.get(name),m=new THREE.InstancedMesh(rec.geo,surface,list.length),col=new THREE.Color();
    for(let i=0;i<list.length;i++){const a=list[i];dummy.position.set(a.x,a.y,a.z);dummy.rotation.set(0,a.ry,0);dummy.scale.set(a.sx,a.sy,a.sz);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);
      if(a.color){col.set(a.color);col.r/=Math.max(.015,rec.mean.r);col.g/=Math.max(.015,rec.mean.g);col.b/=Math.max(.015,rec.mean.b)}else col.setRGB(1,1,1);m.setColorAt(i,col);
    }
    m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;m.computeBoundingSphere();m.castShadow=name!=='grass';m.receiveShadow=true;root.add(m);triangles+=list.length*rec.tri;instances+=list.length;
  }
  scene.traverse(o=>{if(o.isLight){if(o.userData._w3dOrig==null)o.userData._w3dOrig=o.intensity;o.intensity=o.userData._w3dOrig*(o.isAmbientLight?.56:.20)}});
  const oldFog=scene.fog;scene.fog=new THREE.Fog('#394037',1150,3200);
  const key=new THREE.DirectionalLight('#ffddaa',2.15);key.position.set(-700,1300,500);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-1150,right:1150,top:1150,bottom:-1150,near:1,far:2900});key.shadow.normalBias=1.4;key.shadow.bias=-.0001;root.add(key,key.target);
  key.shadow.camera.updateProjectionMatrix();
  const lights=[0,1,2].map(()=>{const l=new THREE.PointLight('#ffc478',700,190,1.6);root.add(l);return l});
  const counts={hub:true,hubArt:true,floorTiles:1833,gatehouse:8,hubAnvil:1,drawCalls:batches.size+owned.filter(o=>o.isMaterial).length+1,triangles,instances};
  active={root,lamps,lights,animated,counts,quality:null};window.__HUB_ART_ACTIVE=true;window.__HUB_SHADOW_DIRTY=true;
  root.userData.dispose=()=>{scene.fog=oldFog;key.shadow.map?.dispose();for(const o of owned)o.dispose();if(active?.root===root)active=null;window.__HUB_ART_ACTIVE=false;};
  return {group:root,counts};
}
export function updateHubArt(w,t){
  if(!active)return;const p=w.p;if(!p)return;
  const low=window.__BF_META?.().quality==='low';if(active.quality!==low){active.quality=low;window.__HUB_SHADOW_DIRTY=true;}
  const nearest=active.lamps.map(v=>({v,d:(v.x-p.x)**2+(v.z-p.z)**2})).sort((a,b)=>a.d-b.d);
  active.lights.forEach((l,i)=>{l.visible=!low&&!!nearest[i]&&nearest[i].d<360**2;if(l.visible)l.position.copy(nearest[i].v)});
  for(const m of active.animated){m.rotation.y=t*.25;m.position.y=66+Math.sin(t*1.1)*2;}
}
