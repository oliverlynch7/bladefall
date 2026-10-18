import * as T from './three.module.js';
let active=null;
// Original Arena service props. No new lights, downloaded models or gameplay state.
export function createArenaStations(height=0){
 const root=new T.Group();root.name='Arena service stations';const geometries=new Set(),materials=new Set(),textures=new Set();
 const geo=g=>(geometries.add(g),g),mat=(color,metalness=0,emissive=0)=>{const m=new T.MeshStandardMaterial({color,metalness,roughness:.55,emissive,emissiveIntensity:.5});materials.add(m);return m;};
 const stone=mat('#3b4c62'),edge=mat('#8295a8',.3),dark=mat('#172635'),gold=mat('#bf914c',.65),steel=mat('#c4d5df',.8),wood=mat('#5e3e32'),cloth=mat('#992f3a'),leather=mat('#292331'),red=mat('#ff7857',.3,'#e24a36'),cyan=mat('#b4ece7',.3,'#4dc4b5');
 const box=geo(new T.BoxGeometry(1,1,1)),bolt=geo(new T.SphereGeometry(1,6,4));
 const mesh=(parent,g,m,x,y,z,sx=1,sy=1,sz=1)=>{const n=new T.Mesh(g,m);n.position.set(x,y,z);n.scale.set(sx,sy,sz);n.castShadow=false;n.receiveShadow=true;parent.add(n);return n;};
 const block=(p,m,x,y,z,w,h,d)=>mesh(p,box,m,x,y,z,w,h,d);
 const cylinder=(p,m,x,y,z,r,h,sides=12)=>mesh(p,geo(new T.CylinderGeometry(r,r,h,sides)),m,x,y,z);
 const torus=(p,m,x,y,z,r,t,arc=Math.PI*2)=>mesh(p,geo(new T.TorusGeometry(r,t,6,32,arc)),m,x,y,z);
 const armory=new T.Group();armory.name='Crimson armory station';armory.position.set(-150,height,400);root.add(armory);
 cylinder(armory,dark,0,3,0,73,6,8);cylinder(armory,edge,0,7,0,67,4,8);cylinder(armory,stone,0,10,0,63,4,8);
 for(const x of [-54,54]){block(armory,dark,x,79,29,10,142,12);block(armory,gold,x,148,29,16,7,18);mesh(armory,geo(new T.OctahedronGeometry(7)),red,x,159,29);}
 block(armory,wood,0,91,34,104,110,7);for(const y of [40,80,120])block(armory,gold,0,y,28,104,3,5);
 for(const x of [-48,48])for(const y of [41,80,120,143])mesh(armory,bolt,gold,x,y,24,2.1,2.1,1.5);
 // Cloth banner with a cut hem and actual crossed blades, facing the staging lane (-Z).
 const banner=new T.Shape();banner.moveTo(-26,148);banner.lineTo(26,148);banner.lineTo(26,76);banner.lineTo(0,88);banner.lineTo(-26,76);banner.closePath();
 const bannerMesh=mesh(armory,geo(new T.ExtrudeGeometry(banner,{depth:1.2,bevelEnabled:false})),cloth,0,0,23);bannerMesh.material.side=T.DoubleSide;
 for(const x of [-24,24])block(armory,gold,x,117,20,2,59,2);
 function sword(parent,x,y,z,angle=0,scale=1){const g=new T.Group();g.position.set(x,y,z);g.rotation.z=angle;g.scale.setScalar(scale);parent.add(g);const shape=new T.Shape();shape.moveTo(-3,0);shape.lineTo(-3,39);shape.lineTo(0,48);shape.lineTo(3,39);shape.lineTo(3,0);shape.closePath();mesh(g,geo(new T.ExtrudeGeometry(shape,{depth:2,bevelEnabled:true,bevelThickness:.3,bevelSize:.4,bevelSegments:1})),steel,0,0,0);block(g,gold,0,0,-.5,17,4,5);cylinder(g,leather,0,-8,1,2.6,13,8);mesh(g,bolt,gold,0,-16,1,4,3,3);return g;}
 sword(armory,-8,107,15,-.6,.65);sword(armory,8,107,12,.6,.65);
 // Side rack: long sword and axe are recognisable equipment rather than colored cubes.
 sword(armory,-43,48,11,-.16,1.25);block(armory,wood,43,78,12,4,66,4);const axeShape=new T.Shape();axeShape.moveTo(0,2);axeShape.bezierCurveTo(30,3,27,28,0,29);axeShape.lineTo(3,19);axeShape.closePath();mesh(armory,geo(new T.ExtrudeGeometry(axeShape,{depth:4,bevelEnabled:true,bevelThickness:1,bevelSize:1,bevelSegments:1})),steel,42,91,9);block(armory,gold,43,100,8,8,8,7);
 // Low console: individual wood planks, brass corners, drawers and a glowing loadout seal.
 for(const x of [-43,43])for(const z of [-22,6])block(armory,dark,x,26,z,8,32,8);
 block(armory,wood,0,31,-10,96,27,34);for(const x of [-49,-24,0,24,49])block(armory,wood,x,47,-10,23,6,43);
 for(const x of [-47,47])block(armory,gold,x,47,-10,5,8,47);
 for(const x of [-24,24]){block(armory,leather,x,32,-29,42,17,2);block(armory,gold,x,34,-31,12,3,3);}
 const seal=torus(armory,gold,0,52,-11,14,2);seal.rotation.x=Math.PI/2;mesh(armory,geo(new T.OctahedronGeometry(10)),red,0,62,-11,1,.65,1);
 // Shoulder armor and shield rest on the rack's right-hand shelf.
 const shieldShape=new T.Shape();shieldShape.moveTo(-13,10);shieldShape.lineTo(13,10);shieldShape.lineTo(11,-10);shieldShape.lineTo(0,-21);shieldShape.lineTo(-11,-10);shieldShape.closePath();mesh(armory,geo(new T.ExtrudeGeometry(shieldShape,{depth:3,bevelEnabled:true,bevelSize:1.2,bevelThickness:1,bevelSegments:1})),gold,27,76,5);block(armory,cloth,27,71,3,5,22,2);
 const gate=new T.Group();gate.name='Waystation return gate';gate.position.set(150,height,400);root.add(gate);
 block(gate,dark,0,3,0,140,6,78);block(gate,edge,0,7,-2,128,4,68);block(gate,stone,0,10,-2,118,3,61);
 for(const x of [-52,52]){for(let i=0;i<6;i++){block(gate,i%2?stone:edge,x,21+i*17,0,19,16,26);block(gate,gold,x,22+i*17,-14,3,12,1.2);}block(gate,gold,x,114,0,28,6,32);mesh(gate,geo(new T.OctahedronGeometry(8)),cyan,x,126,-1,1,1.8,1);}
 torus(gate,stone,0,111,0,53,10,Math.PI);torus(gate,gold,0,111,-11,53,2,Math.PI);
 for(let i=0;i<9;i++){const a=(i+.5)/9*Math.PI;const n=block(gate,edge,Math.cos(a)*53,111+Math.sin(a)*53,-11,13,12,3);n.rotation.z=a-Math.PI/2;}
 const key=mesh(gate,geo(new T.OctahedronGeometry(11)),cyan,0,166,0,.7,1.4,.7);
 for(const x of [-41,41])block(gate,cyan,x,67,-14,2,81,2);
 const portalMat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{time:{value:0}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float time;void main(){vec2 p=(v-.5)*2.;float r=length(p);float a=atan(p.y,p.x);float rim=pow(clamp(r,0.,1.),5.);float wave=.5+.5*sin(r*25.-time*1.6+a*2.);float fade=1.-smoothstep(.85,1.,r);vec3 c=mix(vec3(.06,.24,.31),vec3(.35,.93,.78),wave*.4+rim*.6);gl_FragColor=vec4(c,fade*(.7+rim*.25));}'});materials.add(portalMat);mesh(gate,geo(new T.PlaneGeometry(84,139)),portalMat,0,81,-4);
 const rings=[];for(let i=0;i<3;i++){const r=torus(gate,cyan,0,80,-7,23+i*9,.45);r.scale.set(1,1.5,1);rings.push(r);}
 function label(parent,text,sub,color,y,width){if(typeof document==='undefined')return;const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;const c=canvas.getContext('2d');c.fillStyle='#102033ec';c.fillRect(0,0,768,192);c.strokeStyle=color;c.lineWidth=6;c.strokeRect(3,3,762,186);c.fillStyle=color;c.textAlign='center';c.font='bold 49px Georgia';c.fillText(text,384,80);c.font='29px system-ui';c.fillStyle='#e2eaf2';c.fillText(sub,384,139);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;textures.add(tex);const m=new T.SpriteMaterial({map:tex,depthWrite:false});materials.add(m);const sprite=new T.Sprite(m);sprite.position.set(0,y,0);sprite.scale.set(width,width/4,1);parent.add(sprite);}
 label(armory,'ARENA ARMORY','Class • gear • match setup','#ffd18b',195,165);label(gate,'WAYSTATION','Leave the Arena','#a7f1d9',201,160);
 // Batch repeated static planks, stone courses, trim and rivets; keep animated props separate.
 root.updateMatrixWorld(true);const batches=new Map(),staticMeshes=[];
 root.traverse(n=>{if(n.isMesh&&(n.geometry===box||n.geometry===bolt)){const key=n.geometry.uuid+'|'+n.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(n);staticMeshes.push(n);}});
 for(const list of batches.values()){const b=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);list.forEach((n,i)=>b.setMatrixAt(i,n.matrixWorld));b.computeBoundingSphere();b.receiveShadow=true;root.add(b);}staticMeshes.forEach(n=>n.removeFromParent());
 let triangles=0,drawCalls=0;root.traverse(n=>{if(n.isMesh){drawCalls++;triangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3*(n.isInstancedMesh?n.count:1);}else if(n.isSprite)drawCalls++;});
 return {root,stats:{triangles,drawCalls,geometryCount:geometries.size,materials:materials.size},tick(t,reduced=false){portalMat.uniforms.time.value=reduced?0:t;key.rotation.y=reduced?0:t*.25;for(let i=0;i<rings.length;i++){rings[i].rotation.z=reduced?0:t*(i%2?-.08:.06);rings[i].material.opacity=1;}},dispose(){root.traverse(n=>{if(n.isInstancedMesh)n.dispose();});root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
export function syncArenaArt(scene){const g=window.__BF3?.G;if(!g?.arena){active?.dispose();active=null;window.__ARENA_ART_ACTIVE=false;window.__arenaArtStats=null;return;}if(active?.world!==g){active?.dispose();active=createArenaStations(g.arenaSpawn?.y||0);active.world=g;scene.add(active.root);}active.tick(g.time||0,!!window.__BF_META?.().reduceMotion);window.__ARENA_ART_ACTIVE=true;window.__arenaArtStats=active.stats;}
