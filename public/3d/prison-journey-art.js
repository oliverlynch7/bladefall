import * as T from './three.module.js';
import {craftBuilder,createCraftModel} from './campaign-craft-models.js?v=2187a';
import {campaignMaterial} from './campaign-materials.js?v=2187a';
import {createChestActor,animateChest} from './chest-art.js?v=2184';

// Fitted detail only. Walkable floors, gates and collision stay in the level builder.
export function buildPrisonJourneyArt(w){
 const G=window.__BF3?.G;if(w.keepScene!=='dungeons'||!G?.prison)return null;
 const root=new T.Group();root.name='Dungeons doors and wayfinding';
 const geos=[],mats=[],textures=[],objects=new Set(['kd.hidden','kd.free','kd.return','kd.cache']),gates=[];
 let triangles=0,last=G.prison.pressClock;
 const finish=(b,parent)=>{for(const p of b.finish()){geos.push(p.geo);triangles+=p.tri;const m=new T.Mesh(p.geo,p.material);m.castShadow=true;m.receiveShadow=true;parent.add(m);}};
 const mesh=(parent,geo,mat,x=0,y=0,z=0)=>{geos.push(geo);const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);triangles+=(geo.index?.count||geo.attributes.position.count)/3;return m;};
 const material=(color,extra={})=>{const m=new T.MeshStandardMaterial({color,roughness:.65,...extra});mats.push(m);return m;};
 const label=(parent,lines,x,y,z,width=160,height=52)=>{
  const c=document.createElement('canvas');c.width=640;c.height=208;const ctx=c.getContext('2d');ctx.fillStyle='#253c45';ctx.fillRect(0,0,c.width,c.height);ctx.textAlign='center';ctx.textBaseline='middle';
  lines.forEach((text,i)=>{ctx.font='bold '+(i?32:38)+'px sans-serif';ctx.fillStyle=i?'#fff4d7':'#f5cf83';ctx.fillText(text,320,lines.length===1?104:62+i*82,610);});
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;textures.push(tex);const m=new T.MeshBasicMaterial({map:tex,toneMapped:false});mats.push(m);return mesh(parent,new T.PlaneGeometry(width,height),m,x,y,z);
 };
 // A small set of signs has a real purpose and matching narrow post collision.
 const signs=window.BFPrison.SIGNS;
 for(const s of signs){const n=new T.Group(),b=craftBuilder('keep');n.position.set(s.x,s.y,s.z);root.add(n);b.box(0,49,0,12,98,10,'wood');b.box(0,7,0,25,14,23,'stone');b.box(0,105,0,170,62,10,'dark');for(const y of [75,135])b.box(0,y,0,175,5,12,'gold');for(const x of [-84,84])b.box(x,105,0,5,62,12,'metal');finish(b,n);label(n,s.lines,0,105,6,159,52);const reverse=label(n,s.lines,0,105,-6,159,52);reverse.rotation.y=Math.PI;}

 // A single clipped inlay per height. Never bridge a shaft, step or jump with artwork.
 const routes=[[[0,-650,180],[0,-900,180],[-1000,-1200,180],[-1300,-1200,180],[-1300,-1750,180]],
  [[-1050,-1880,180],[-760,-1850,180],[-420,-1910,180],[0,-1950,180],[0,-2320,180]],
  [[0,-2830,360],[0,-3500,360],[0,-4010,360]],[[0,-4060,360],[0,-4650,360]]];
 const levels=new Map();for(const path of routes)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];if(a[2]!==b[2])continue;const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz;if(!l)continue;if(!levels.has(a[2]))levels.set(a[2],[]);levels.get(a[2]).push({a,b,dx,dz,l});}
 const stone=new T.Color('#54767d'),edge=new T.Color('#ba9e68'),road=campaignMaterial('flagstone',{vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});mats.push(road);
 for(const [height,lines]of levels){const cells=new Set(),step=28,half=49,pos=[],uv=[],colors=[];
  for(const l of lines)for(let x=Math.floor((Math.min(l.a[0],l.b[0])-half)/step);x<=Math.ceil((Math.max(l.a[0],l.b[0])+half)/step);x++)for(let z=Math.floor((Math.min(l.a[1],l.b[1])-half)/step);z<=Math.ceil((Math.max(l.a[1],l.b[1])+half)/step);z++)cells.add(x+','+z);
  const floors=(w.obstacles||[]).filter(o=>o.kind==='plat'&&Math.abs(o.h-height)<.1),onFloor=p=>floors.some(o=>Math.abs(p.x-o.x)<=o.w/2-1&&Math.abs(p.z-o.z)<=o.d/2-1);
  const vertex=(x,z)=>({x,z,d:Math.min(...lines.map(l=>{const t=Math.max(0,Math.min(1,((x-l.a[0])*l.dx+(z-l.a[1])*l.dz)/l.l));return Math.hypot(x-l.a[0]-t*l.dx,z-l.a[1]-t*l.dz)/half;}))});
  const tri=points=>{const clipped=[];for(let i=0;i<3;i++){const a=points[i],b=points[(i+1)%3],inside=a.d<=1;if(inside)clipped.push(a);if(inside!==(b.d<=1)){const t=(1-a.d)/(b.d-a.d);clipped.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,d:1});}}if(!clipped.every(onFloor))return;for(let i=1;i<clipped.length-1;i++)for(const p of [clipped[0],clipped[i],clipped[i+1]]){pos.push(p.x,height+2.2,p.z);uv.push(p.x/90,p.z/90);const c=stone.clone().lerp(edge,Math.max(0,Math.min(1,(p.d-.68)*4)));colors.push(c.r,c.g,c.b);}};
  for(const cell of cells){const [x,z]=cell.split(',').map(v=>Number(v)*step),a=vertex(x,z),b=vertex(x,z+step),c=vertex(x+step,z),d=vertex(x+step,z+step);tri([a,b,c]);tri([c,b,d]);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();mesh(root,geo,road).receiveShadow=true;
 }

 const open=(id,f)=>id==='release'?window.BFPrison.ready({flags:f}):!!f[id==='hidden'?'kd.hidden':id==='holdingExit'?'kd.free':'kd.deep.open'];
 for(const [id,x,z,y,width,height,rot=0]of [['hidden',-1300,-1440,180,330,160],['release',0,-4030,360,330,170],['depth',0,-2730,0,340,120],['holdingExit',-580,-1850,180,350,190,Math.PI/2]]){
  const n=new T.Group();n.position.set(x,y,z);n.rotation.y=rot;root.add(n);const b=craftBuilder('keep');
  for(const side of [-1,1]){b.box(side*(width/2+10),height/2,0,20,height,33,'stone');b.box(side*(width/2+10),12,0,29,24,40,'light');b.box(side*(width/2+10),height-8,0,27,16,38,'light');for(let j=1;j<4;j++)b.box(side*(width/2+10),height*j/4,17,20,3,2,'dark');}b.box(0,height+7,0,width+62,20,39,'light');b.box(0,height+23,0,width+38,12,31,'stone');finish(b,n);
  const leaves=[];
  if(id==='hidden'){
   for(const side of [-1,1]){const leaf=new T.Group();leaf.position.x=side*width/2;n.add(leaf);const d=craftBuilder('keep'),cx=-side*width/4;
    d.box(cx,height/2,0,width/2-4,height-4,13,'wood');for(let row=0;row<5;row++)for(let col=0;col<3;col++)d.box(cx+(col-1)*(width/2-8)/3,17+row*30,9,(width/2-8)/3-2,28,8,(row+col)%3?'stone':'light');
    for(const yy of [29,height-29]){d.box(cx,yy,16,width/2-15,7,4,'metal');d.cyl(0,yy,0,5,24,'metal');d.bolts([cx-width/6,cx+width/6],[yy],19);}d.ring(-side*(width/2-17),83,19,7,1.8,'gold');finish(d,leaf);leaves.push(leaf);
   }
   // Two pale service strokes match the clue; a thin seam reveals the covered door.
   const d=craftBuilder('keep');for(const x of [-31,-21])d.box(x,47,17,3,25,2,'light',-.15);finish(d,n);
  }else{const bars=createCraftModel('portcullis','keep',{w:width-10,h:height,d:13});n.add(bars);leaves.push(bars);}
  label(n,[id==='hidden'?'SERVICE':id==='release'?'RELEASE HALL':id==='holdingExit'?'HOLDING CELLS':'LOWER WORKS'],0,height+44,22,136,32);
  gates.push({id,n,leaves,height,value:open(id,G.storyState.flags)?1:0});
 }
 // The prisoner lock is a lever box, not a generic cube beside the captives.
 const at=key=>G.storyObjects.find(o=>o.key===key),lock=at('kd.free'),lockRoot=new T.Group();lockRoot.position.set(lock.x,lock.y,lock.z);root.add(lockRoot);
 let b=craftBuilder('keep');b.box(0,36,0,46,72,30,'wood');b.box(0,75,0,54,9,36,'metal');for(const x of [-19,19])b.box(x,36,16,5,68,3,'metal');b.cyl(0,66,21,11,8,'gold',11,Math.PI/2);b.bolts([-16,16],[14,57],19);finish(b,lockRoot);
 const lever=new T.Group();lever.position.set(0,66,26);lockRoot.add(lever);b=craftBuilder('keep');b.rod([0,0,0],[0,27,0],3,'metal');b.box(0,28,0,22,6,6,'wood');finish(b,lever);label(lockRoot,['CELL LOCK'],0,36,19,36,17);
 const lamp=mesh(lockRoot,new T.SphereGeometry(5,10,7),material('#f4c16c',{emissive:'#a27935',emissiveIntensity:.3}),0,91,0);
 const bundle=at('kd.return'),bundleRoot=new T.Group();bundleRoot.position.set(bundle.x,bundle.y,bundle.z);root.add(bundleRoot);b=craftBuilder('keep');b.box(0,10,0,45,20,33,'cloth');for(const x of [-14,14])b.box(x,11,0,4,22,35,'wood');b.curve([[-14,20,0],[-9,27,0],[9,27,0],[14,20,0]],2,'light');finish(b,bundleRoot);
 const locket=new T.Group();bundleRoot.add(locket);b=craftBuilder('keep');b.ring(0,23,5,7,1.7,'gold',Math.PI/2);b.ball(0,24,5,5,'light',1,.2,1);b.curve([[0,23,0],[7,23,-6],[11,23,-2],[5,23,10]],.8,'gold');finish(b,locket);
 const chest=createChestActor('rare'),cache=at('kd.cache');chest.root.scale.multiplyScalar(2);root.add(chest.root);
 // The docking edges and upper handoff are visible without painting over the shaft.
 b=craftBuilder('keep');for(const [z,y]of [[-2375,180],[-2635,360]])for(const x of [-110,-55,0,55,110])b.box(x,y+2.8,z,30,1.5,10,'gold');finish(b,root);
 const update=()=>{const G=window.__BF3?.G;if(!G?.prison)return;const f=G.storyState.flags,time=G.prison.pressClock,dt=Math.max(0,Math.min(.1,time-last));last=time;
  for(const g of gates){const goal=open(g.id,f)?1:0;g.value+=Math.sign(goal-g.value)*Math.min(Math.abs(goal-g.value),dt*3.8);if(g.id==='hidden')g.leaves.forEach((leaf,i)=>leaf.rotation.y=(i?1:-1)*g.value*Math.PI*.46);else g.leaves[0].position.y=g.value*(g.height+8);}
  lever.rotation.z=f['kd.free']?-1.2:.55;lamp.material.color.set(f['kd.free']?'#88dfa9':'#efb75c');lamp.material.emissive.copy(lamp.material.color).multiplyScalar(.3);locket.visible=!!f['kd.returned'];animateChest(chest,{...cache,opened:!!f['event.kd.cache']},dt);
 };
 root.userData.update=update;root.userData.dispose=()=>{geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());if(window.__PRISON_JOURNEY_ART?.root===root)delete window.__PRISON_JOURNEY_ART;};
 window.__PRISON_JOURNEY_ART={root,objects,snapshot:()=>({triangles,signs:signs.length,objects:[...objects],gates:gates.map(g=>({id:g.id,open:g.value})),chestOpen:chest.opening})};update();return root;
}
