import {buildHubUpgrades} from './hub-upgrades.js?v=2121';
/* The Waystation: original, instanced Blender scenery. The layout is owned by
   rebuildWaystationSanctum; service callbacks and portal unlocks stay in the game. */
import * as THREE from './three.module.js';
import {buildWaystone,animateWaystone} from './hub-waystone.js?v=2121';
import {buildRiftHallArt,updateRiftHallArt} from './rift-hall-art.js?v=2076';
import {companionPortrait} from './companion3d.js?v=2073';
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
  if(w.hubArt?.riftHall)return buildRiftHallArt(scene,w);
  const root=new THREE.Group();root.name='The Waystation · Lantern Court';
  const batches=new Map(),owned=[],lamps=[],animated=[],pets=[];let disposed=false;const HU=w.hubArt.upgrades||{};
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
      while(pos<end){const a=Math.max(start,pos),b=Math.min(end,pos+bw);if(b-a>1)block((a+b)/2,(row+.5)*rh,0,b-a-1,rh-1,26,['#9ba48e','#afb298','#c0b99a','#a1ab96'][Math.floor(hash(pos,row+z)*4)]);pos+=bw}
    }
    block(0,height+3,0,width+3,7,32,'#a79b7a');
  })}
  function lamp(x,z){add('lamp',x,1.5,z,22);lamps.push(new THREE.Vector3(x,87,z))}

  // A single level court, with narrow alternating joints and an inlaid procession path.
  for(let iz=0;iz<39;iz++)for(let ix=0;ix<47;ix++){
    const x=-920+(ix+.5)*1840/47,z=-650+(iz+.5)*1540/39;
    const radial=Math.hypot(x,z-30),road=Math.abs(x)<82||Math.abs(z+420)<64||Math.abs(z-540)<42;
    const ring=radial>107&&radial<146,service=Math.abs(x)>515&&Math.abs(x)<730&&z>-235&&z<500;
    const pal=ring?['#a98b53','#b49a60']:road?['#a39576','#b1a17f','#a69778']:service?['#a28c6b','#b39a72']:['#81917c','#8e9a82','#9b9f85'];
    block(x,.25,z,1840/47-.55,1.5,1540/39-.55,pal[Math.floor(hash(x,z)*pal.length)]);
  }
  // Compass arms are flush floor inlays, never raised steps in the arrival route.
  for(let i=0;i<8;i++){const a=i*Math.PI/4;block(Math.sin(a)*114,1.07,30+Math.cos(a)*114,5,.18,40,'#c2a769',a)}
  const waystone=buildWaystone(THREE,owned,!!HU.gild);root.add(waystone);

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
      const mural=g.zi===5?'./icons/ui/destination-storm-coast.png':'./icons/destinations/'+icons[g.zi]+'.png';
      panel(texture(mural),0,75,-28,g.zi===5?84:76,g.zi===5?84:98,g.open?1:.52);
      label(g.name,0,191,-31,172,g.open?'#e5c78e':'#b7b4a5');
      beam(0,183,-35,9,33,7,'#655638');
      block(0,177,-34,24,10,32,g.done?'#91bb84':col);
      for(const s of [-1,1]){block(s*51,52,-14,4,76,2,g.open?col:'#575b54');}
    });
  }
  // Small matching buttresses create a rhythm; there is no imported gatehouse mass.
  for(const x of [-900,-800,-600,-400,-200,0,200,400,600,800,900]){
    add('pillar',x,0,-622,22);
  }

  const stationArt={quartermaster:['Quartermaster','action_buy.png'],chest:['Your Bag','action_bag_stash.png'],anvil:['The Smith','action_forge_fuse.png'],keeper:['The Stylist','action_wardrobe_stylist.png'],drillmaster:['Drillmaster','class-core.png'],beastkeeper:['Beastkeeper','beastkeeper.png'],board:['Postings',null],mirror:['The Mirror',null],sparring:['Sparring Room',null]};
  for(const n of w.hubNpcs||[]){
    if(n.id==='rifthall')continue;
    if(n.id==='thomas'){at(n.x,n.z,0,()=>{for(const x of [-25,25])beam(x,12,-38,7,24,7);beam(0,25,-38,75,7,28);beam(0,40,-53,75,24,6);if(HU.homeBird){beam(58,18,-32,24,36,24);block(58,42,-32,17,12,12,'#c09d63');block(67,48,-32,8,9,8,'#c09d63');block(73,47,-32,5,3,4,'#e3c78c');block(50,44,-32,10,3,8,'#876437',-.3);for(const dz of [-7,7]){block(57,43,-32+dz,10,6,2,'#927143');block(68,50,-32+dz*.6,2,2,1,'#34291c');}for(const dx of [55,62])beam(dx,35,-32,2,5,2,'#72512e');}label('Thomas',0,96,-42,100);});continue;}

    if(n.id==='arcade'){at(n.x,n.z,Math.PI,()=>{beam(0,38,0,45,76,30,'#354439');block(0,48,16,32,31,2,'#75a28c');beam(0,24,22,42,6,16);label(n.name,0,87,13,100);});continue;}
    if(n.id==='bestiary'){at(n.x,n.z,-Math.PI/2,()=>{
      for(const s of [-1,1])beam(s*16,32,0,7,64,7,'#765532');
      beam(0,64,0,49,6,36,'#9b7142');block(0,69,-3,45,3,30,'#52392c');
      block(-11,72,-2,21,3,27,'#eee0b8');block(11,72,-2,21,3,27,'#d8c7a0');
      block(0,75,-2,2,2,28,'#d4a853');for(const s of [-1,1])block(s*10,76,-5,14,1,2,'#a1754c');
      beam(0,80,-19,48,5,5,'#d2aa69');label('Bestiary',0,115,0,112);
    });continue;}
    if(n.district==='undercroft'){
      at(n.x,n.z,Math.PI,()=>{
        add('arch',0,0,-20,25);block(0,1,14,110,2,64,'#66566c');
        const col=n.c2||'#b99975';block(0,72,-21,44,85,3,'#202c43');
        const ringGeo=new THREE.TorusGeometry(18,1.6,4,24),ringMat=new THREE.MeshBasicMaterial({color:col}),ring=new THREE.Mesh(ringGeo,ringMat),rp=point(0,-17);ring.position.set(rp.x,74,rp.z);ring.rotation.y=origin.ry;root.add(ring);owned.push(ringGeo,ringMat);
        block(0,74,-16,5,25,3,col);block(0,74,-15,23,4,3,col);for(const side of [-1,1]){block(side*46,57,-6,3,75,3,col);block(side*46,20,-6,9,5,9,'#d8b670');}
        if(n.id==='arena'||n.id==='gauntlet')for(const side of [-1,1]){beam(side*61,57,-21,4,110,4,'#d0ac64');block(side*61,91,-18,20,36,3,col);block(side*61,92,-15,3,26,2,'#f1d68e');}
        label(n.name,0,142,-18,165);
        for(let j=0;j<3;j++)block((j-1)*12,17,-17,5,5,3,col);
      });continue;
    }
    const side=n.x<0?-1:1,ry=-side*Math.PI/2;
    at(n.x,n.z,ry,()=>{
      if(n.id!=='sparring'){
        // A shallow back wall and roof leave all of the plaza-facing half open.
        for(let row=0;row<4;row++)for(let j=0;j<3;j++)block((j-1)*36,12+row*24,-59,35,23,11,['#8a8069','#968a71','#a09276'][(row+j)%3]);
        for(const s of [-1,1])beam(s*53,62,-40,7,124,7);
        add('canopy',0,125,-35,32,32,32,n.c2||'#547c91');
        for(const side of [-1,1]){beam(side*53,65,-40,3,118,3,'#d9b86c');block(side*45,102,-39,11,31,3,n.c2||'#b24b37');block(side*45,87,-39,12,3,4,'#edc76e');}
        block(0,2,13,116,3,65,'#b7a487');
        const spec=stationArt[n.id];label(spec?.[0]||n.name,0,110,0,119);
        if(spec?.[1])panel(texture('./icons/'+spec[1]),0,74,-51,32,32);
      }
      if(n.id==='quartermaster'||n.id==='drillmaster'){
        if(n.id==='quartermaster'&&HU.returnSupplies)for(let j=0;j<4;j++){block(-58,12+j*19,-15,32,18,27,'#96774d');block(-58,13+j*19,-.8,24,9,1,'#d2c29b');}
        if(n.id==='quartermaster'){
          for(const x of [-34,34])for(const z of [7,26])beam(x,15,z,6,30,6);
          beam(0,32,16,88,6,30,'#ad8050');block(0,22,29,80,15,3,'#2b6982');
          for(let j=0;j<3;j++){block(-24+j*23,39,13,16,7,18,['#c5d1cb','#ad7454','#476d91'][j]);block(-24+j*23,44,13,16,3,18,'#d9b570');}
          for(const x of [-38,38]){beam(x,54,-38,5,108,6);beam(x,87,-38,21,5,6,'#d9b570');block(x,71,-35,13,28,7,'#a4c3c8');}
        }else{
          // A weapon rack and strategy table distinguish training from a shop counter.
          for(const x of [-37,37])beam(x,33,-21,6,66,7);beam(0,48,-21,80,7,7,'#a57a43');
          for(const x of [-24,0,24]){beam(x,46,-16,3,62,3,'#795435');block(x,81,-16,7,24,3,'#d6dfdf');block(x,66,-16,17,3,5,'#e6b75f');}
          beam(0,15,23,10,30,10);beam(0,33,23,65,5,33,'#8e633d');block(0,36,23,49,1,26,'#eee0ae');
          for(let j=0;j<4;j++)block(-16+j*11,39,23+(j%2?5:-5),4,5,4,j%2?'#bd4433':'#397aaf');
        }
      }else if(n.id==='chest')add('chest',0,1,0,27);
      else if(n.id==='anvil'){
        if(HU.returnForge){beam(60,34,-15,40,6,36);for(let j=0;j<3;j++){block(47+j*12,57,-15,4,43,4,'#a78655');block(47+j*12,79,-15,14,10,9,'#c2c9c4');}}
        add('anvil',0,1,6,23);block(-29,20,-28,35,38,28,'#655744');block(-29,29,-12,21,21,2,'#d08742');
        block(35,8,8,24,14,18,'#625e50');block(35,16,8,21,1,15,'#62888b');
      }else if(n.id==='board')add('board',0,1,-8,29,29,29,null,Math.PI);
      else if(n.id==='mirror'){
        add('mirror',0,1,-6,30,30,30,null,Math.PI);panel(null,0,41,-2,35,73,.16);
      }else if(n.id==='keeper'){
        beam(28,12,0,23,24,24,'#70468c');beam(28,31,-10,23,36,5,'#70468c');for(let j=0;j<4;j++){block(-33+j*15,26,-18,12,45,7,['#c84d67','#427db4','#d6b752','#54866a'][j]);block(-33+j*15,52,-18,13,5,8,'#e6c983');}beam(-11,56,-18,64,4,5,'#b79563');
      }else if(n.id==='beastkeeper'){
        if(HU.companionCare){for(const dx of [-95,-55])beam(dx,30,-15,6,60,6);beam(-75,60,-15,52,7,56,'#657b5c');block(-75,8,-15,42,12,44,'#b9a577');block(-75,17,-15,32,6,32,'#dad0ad');block(-110,17,23,18,34,20,'#867552');block(-110,35,23,20,4,22,'#bfae83');}

        for(const side of [-1,1]){const x=side*76;block(x,3,-12,45,6,55,'#9b7443');block(x,7,-12,40,2,50,'#d1bd68');for(const dx of [-21,21]){beam(x+dx,31,-12,3,55,55,'#354e49');for(let j=0;j<5;j++)beam(x+dx,31,-34+j*11,2,55,2,'#b0a06d');}for(const z of [-38,14]){beam(x,56,z,45,4,4,'#b99b64');for(let j=0;j<5;j++)beam(x-20+j*10,31,z,2,49,2,'#60746d');}const pos=point(x,-12),angle=origin.ry;companionPortrait(side<0?'shepherd':'cinder').then(pet=>{if(!pet)return;if(disposed){pet.userData.portraitDispose?.();return;}pet.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(pet),size=b.getSize(new THREE.Vector3()),sc=32/Math.max(1,size.y);pet.scale.multiplyScalar(sc);pet.position.set(pos.x,8-b.min.y*sc,pos.z);pet.rotation.y=angle;root.add(pet);pets.push(pet);});}
      }else if(n.id==='sparring'){
        add('arch',0,0,-17,22);block(0,48,-21,44,90,8,'#344957');for(const x of [-15,15]){block(x,49,-15,4,68,3,'#cdb06e');}label('Sparring',0,120,-5,119);for(const x of [-50,50]){beam(x,58,-17,6,115,6);block(x,89,-14,21,40,3,'#a34434');block(x,90,-11,3,29,2,'#e4bb66');}
      }
    });
  }
  // Side gardens have their own space beyond the service approaches.
  for(const s of [-1,1])for(const z of [-310,590]){
    block(s*800,8,z,126,16,118,'#6d715d');block(s*800,17,z,113,2,104,'#434b39');
    add('tree',s*800,18,z,41);
    const leafGeo=new THREE.IcosahedronGeometry(1,0);owned.push(leafGeo);for(let j=0;j<5;j++){const mat=new THREE.MeshLambertMaterial({color:['#688b3d','#80a74c','#9dbb56'][j%3]}),leaf=new THREE.Mesh(leafGeo,mat);leaf.position.set(s*800+Math.sin(j*2.4)*35,100+(j%2)*26,z+Math.cos(j*2.4)*28);leaf.scale.set(40,28,38);leaf.castShadow=true;root.add(leaf);owned.push(mat);}for(let j=0;j<7;j++){const x=s*800-46+j*15;block(x,26,z+44,2,17,2,'#5d8c43');block(x,35,z+44,8,6,8,j%2?'#e8ac5d':'#b69ee0');}
    for(let i=0;i<14;i++)add('grass',s*800+(hash(i,z)-.5)*105,18,z+(hash(z,i)-.5)*98,28);
  }
  if(HU.sunspireGarden)for(const side of [-1,1])for(let i=0;i<12;i++){const x=side*800+(i%4-1.5)*23,z=590+(Math.floor(i/4)-1)*25;block(x,35,z,5,34,5,'#729267');block(x,53,z,17,8,17,i%3?'#f0ddae':'#b5bfd9');}
  for(const p of w.hubArt.lamps)lamp(p.x,p.z);
  add('chest',-806,1,670,24);
  // Outlying silhouettes sit beyond the courtyard, never between a station and the player.
  for(const [x,z,h] of [[-1080,-850,245],[1080,-850,245],[-1040,760,210],[1040,760,210]]){
    for(let y=0;y<h;y+=28)block(x,y+14,z,106,27,106,'#5f685c');
    block(x,h+4,z,126,12,126,'#8b8a70');add('canopy',x,h+12,z,37,70,37);
  }
  // Owned upgrades and victories remain visible and rebuild only when those values change.
  const upgrades=buildHubUpgrades(root,owned,HU,lamps);
  for(const [i,id] of icons.entries())if(w.hubArt.zoneDone[id]){block(-847,64,-150+i*65,19,40,23,palette[i]);block(-847,39,-150+i*65,25,8,27,'#9b8966');}


  if(w.hubArt.riftDoor){const {x,z}=w.hubArt.riftDoor;at(x,z,Math.PI,()=>{
    block(0,3,0,164,6,76,'#8d8ca9');for(const side of [-1,1]){block(side*65,65,0,22,130,24,'#6c688c');block(side*65,132,0,29,8,31,'#d9bd86');block(side*65,70,14,4,100,3,'#c4a0ff');add('pillar',side*65,136,0,8,8,8,'#bca1f2');}
    block(0,144,0,154,15,28,'#aea2c0');label('Rift Hall',0,166,16,150,'#eed4ff');
    const geo=new THREE.PlaneGeometry(102,119),mat=new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,uniforms:{time:{value:0}},vertexShader:'varying vec2 uvp;void main(){uvp=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 uvp;uniform float time;void main(){vec2 p=(uvp-.5)*2.;float r=length(p);float a=atan(p.y,p.x);float wave=.5+.5*sin(r*18.-a*3.-time);float rim=pow(clamp(r,0.,1.),3.);vec3 c=mix(vec3(.10,.03,.23),vec3(.48,.23,.85),wave*.4+rim*.5);float speck=pow(max(0.,sin(p.x*45.+time)*sin(p.y*39.-time)),18.);gl_FragColor=vec4(c+speck*vec3(.6,.5,.9),.94);}' });const portal=new THREE.Mesh(geo,mat),pos=point(0,-2);portal.position.set(pos.x,67,pos.z);portal.rotation.y=origin.ry;root.add(portal);owned.push(geo,mat);portal.userData.portal=true;animated.push(portal);
    for(let j=0;j<7;j++){const x=(j-3)*12;block(x,11,18,5,3,5,'#d8bfff');}
  });}
  let triangles=0,instances=0;
  for(const [name,list] of batches){
    const rec=meshes.get(name),m=new THREE.InstancedMesh(rec.geo,surface,list.length),col=new THREE.Color();
    for(let i=0;i<list.length;i++){const a=list[i];dummy.position.set(a.x,a.y,a.z);dummy.rotation.set(0,a.ry,0);dummy.scale.set(a.sx,a.sy,a.sz);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);
      if(a.color){col.set(a.color);col.r/=Math.max(.015,rec.mean.r);col.g/=Math.max(.015,rec.mean.g);col.b/=Math.max(.015,rec.mean.b)}else col.setRGB(1,1,1);m.setColorAt(i,col);
    }
    m.instanceMatrix.needsUpdate=true;m.instanceColor.needsUpdate=true;m.computeBoundingSphere();m.castShadow=name!=='grass';m.receiveShadow=true;root.add(m);triangles+=list.length*rec.tri;instances+=list.length;
  }
  scene.traverse(o=>{if(o.isLight){if(o.userData._w3dOrig==null)o.userData._w3dOrig=o.intensity;o.intensity=o.userData._w3dOrig*(o.isAmbientLight?.9:.25)}});
  const oldFog=scene.fog;scene.fog=new THREE.Fog('#b6c8d1',3000,6800);
  const key=new THREE.DirectionalLight('#ffddaa',2.15);key.position.set(-700,1300,500);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-1150,right:1150,top:1150,bottom:-1150,near:1,far:2900});key.shadow.normalBias=1.4;key.shadow.bias=-.0001;root.add(key,key.target);
  key.shadow.camera.updateProjectionMatrix();
  const lights=[0,1,2].map(()=>{const l=new THREE.PointLight('#ffc478',700,190,1.6);root.add(l);return l});
  let waystoneTriangles=0;waystone.traverse(o=>{if(o.isMesh)waystoneTriangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3});triangles+=waystoneTriangles;
  let upgradeTriangles=0;upgrades.traverse(o=>{if(o.isMesh)upgradeTriangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3});triangles+=upgradeTriangles;
  const counts={upgrades:upgrades.userData.counts,upgradeTriangles,waystoneTriangles,hub:true,hubArt:true,floorTiles:1833,gatehouse:8,hubAnvil:1,drawCalls:batches.size+owned.filter(o=>o.isMaterial).length+1,triangles,instances};
  active={root,lamps,lights,animated,waystone,upgrades,counts,quality:null};window.__HUB_ART_ACTIVE=true;window.__HUB_SHADOW_DIRTY=true;
  root.userData.dispose=()=>{disposed=true;pets.forEach(p=>p.userData.portraitDispose?.());scene.fog=oldFog;key.shadow.map?.dispose();for(const o of owned)o.dispose();if(active?.root===root)active=null;window.__HUB_ART_ACTIVE=false;};
  return {group:root,counts};
}
export function updateHubArt(w,t){
  if(w.hubArt?.riftHall){updateRiftHallArt(w,t);return;}
  if(!active)return;const p=w.p;if(!p)return;
  const low=window.__BF_META?.().quality==='low';if(active.quality!==low){active.quality=low;window.__HUB_SHADOW_DIRTY=true;}
  const nearest=active.lamps.map(v=>({v,d:(v.x-p.x)**2+(v.z-p.z)**2})).sort((a,b)=>a.d-b.d);
  active.lights.forEach((l,i)=>{l.visible=!low&&!!nearest[i]&&nearest[i].d<360**2;if(l.visible)l.position.copy(nearest[i].v)});
  active.upgrades.userData.tick(t,window.__BF_META?.()||{});
  animateWaystone(active.waystone,t,window.__BF_META?.()||{});
  for(const m of active.animated){if(m.userData.portal)m.material.uniforms.time.value=t*.6;else{m.rotation.y=t*.25;m.position.y=66+Math.sin(t*1.1)*2;}}
}
