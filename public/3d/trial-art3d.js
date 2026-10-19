import * as T from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';
// Exact rectangle union: coplanar rooms and corridors must not fight at their overlaps.
export function surfaceRects(input){
 const rs=input.filter(r=>!r.nofloor&&r.w>0&&r.d>0).map(r=>({a:r.x-r.w/2,b:r.x+r.w/2,c:r.z-r.d/2,d:r.z+r.d/2,h:r.h||0}));
 const xs=[...new Set(rs.flatMap(r=>[r.a,r.b]))].sort((a,b)=>a-b),out=[];
 for(let i=1;i<xs.length;i++){const a=xs[i-1],b=xs[i],mid=(a+b)/2,active=rs.filter(r=>r.a<mid&&r.b>mid),zs=[...new Set(active.flatMap(r=>[r.c,r.d]))].sort((a,b)=>a-b);let last=null;
  for(let j=1;j<zs.length;j++){const c=zs[j-1],d=zs[j],z=(c+d)/2,cover=active.filter(r=>r.c<z&&r.d>z);if(!cover.length){last=null;continue;}const h=Math.max(...cover.map(r=>r.h));if(last&&last.h===h&&last.d===c)last.d=d;else{last={a,b,c,d,h};out.push(last);}}
 }return out;
}
export function makeTrialTexture(style,color){
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');c.fillStyle=color;c.fillRect(0,0,256,256);
 let seed=751;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let k=0;k<1400;k++){c.fillStyle=k%2?'#ffffff0a':'#0000000b';c.fillRect(rand()*256,rand()*256,1+rand()*4,1+rand()*3);}
 const line=(x,y,a,b,col='#191e2680',width=2)=>{c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.stroke();};
 const circle=(x,y,r,col='#e8d89c80',width=2)=>{c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();};
 if(['planks','deck','timber','shoji'].includes(style)){
  for(let y=0;y<256;y+=32){line(0,y,256,y);line((y/32%2)*64,y,(y/32%2)*64,y+32);for(let k=0;k<14;k++){const x=rand()*256;line(x,y+5+rand()*22,x+20+rand()*55,y+5+rand()*22,'#4a321a25',.7);}if(style==='deck')for(const x of [12,138]){c.fillStyle='#473a2f';c.fillRect(x,y+6,3,3);}}
  if(style==='shoji'){c.fillStyle='#e7d5accc';for(let x=6;x<256;x+=48)for(let y=6;y<256;y+=48)c.fillRect(x,y,38,38);}
 }else{
  const step=style==='basalt'?64:48;
  for(let y=0;y<256;y+=step){line(0,y,256,y);for(let x=-(y/step%2)*step/2;x<256;x+=step)line(x,y,x,y+step);line(0,y+3,256,y+3,'#ffffff27',1);}
  if(style==='marble')for(let i=0;i<12;i++){const x=rand()*256;line(x,0,x-30+rand()*60,256,'#f4f0dc35',1);}
  if(['iron','furnace'].includes(style))for(let x=12;x<256;x+=64)for(let y=12;y<256;y+=64){c.fillStyle='#f0c69380';c.beginPath();c.arc(x,y,2.5,0,7);c.fill();}
  if(['rune','arcane','clock','clockwork'].includes(style)){circle(128,128,69);circle(128,128,60);for(let k=0;k<12;k++){const a=k*Math.PI/6;line(128+Math.sin(a)*54,128+Math.cos(a)*54,128+Math.sin(a)*60,128+Math.cos(a)*60,'#f2e6b994');}if(style.startsWith('clock')){line(128,128,128,91,'#386763',3);line(128,128,153,142,'#386763',3);}else for(let k=0;k<6;k++){const a=k*Math.PI/3,b=a+Math.PI*2/3;line(128+Math.sin(a)*48,128+Math.cos(a)*48,128+Math.sin(b)*48,128+Math.cos(b)*48,'#c2d9ff80');}}
  if(style==='ossuary'||style==='crypt')for(let x=28;x<256;x+=64){c.strokeStyle='#e4e3cf66';c.lineWidth=3;c.beginPath();c.arc(x,64,17,Math.PI,Math.PI*2);c.lineTo(x+17,103);c.moveTo(x-17,64);c.lineTo(x-17,103);c.stroke();}
 }
 const map=new T.CanvasTexture(canvas);map.wrapS=map.wrapT=T.RepeatWrapping;map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;map.name='Trial '+style;return map;
}
export function buildTrialArt(w){
 const t=w.trialLook,root=new T.Group();root.name=t.name;const bins=new Map(),mats=new Map(),textures=[],base=new Map(),scratch=new T.Object3D();
 const material=(key,col,map=null,glow=false)=>{if(!mats.has(key))mats.set(key,new T.MeshStandardMaterial({color:map?'#ffffff':col,map,roughness:.82,metalness:key==='trim'?.45:.12,emissive:glow?col:'#000000',emissiveIntensity:glow?.32:0}));return mats.get(key);};
 for(const [key,pattern,col]of [['floor',t.pattern,t.ground],['wall',t.wallPattern,t.wall]]){const map=makeTrialTexture(pattern,col);if(map)textures.push(map);material(key,col,map);}
 for(const [key,col,glow]of [['trim',t.trim],['cloth',t.cloth],['accent',t.accent,true],['bone','#e0d2b0'],['dark','#313641']])material(key,col,null,glow);
 const geo=key=>{if(!base.has(key))base.set(key,key==='box'?new T.BoxGeometry(1,1,1):key==='sphere'?new T.SphereGeometry(1,10,8):key==='cone'?new T.ConeGeometry(1,1,8):key==='ring'?new T.TorusGeometry(1,.09,5,28):new T.CylinderGeometry(1,1,1,8));return base.get(key);};
 const add=(kind,x,y,z,sx,sy,sz,key='trim',rx=0,ry=0,rz=0,quaternion=null)=>{scratch.position.set(x,y,z);scratch.rotation.set(rx,ry,rz);if(quaternion)scratch.quaternion.copy(quaternion);scratch.scale.set(sx,sy,sz);scratch.updateMatrix();const g=geo(kind).clone().applyMatrix4(scratch.matrix);if(!bins.has(key))bins.set(key,[]);bins.get(key).push(g);};
 const surfaces=(rects,y,key,vertical=false)=>{const pos=[],uv=[],normal=[],unit=key==='floor'&&['rune','clock'].includes(t.pattern)?256:64;const quad=(a,b,c,d,n)=>{for(const p of [a,b,c,a,c,d]){pos.push(...p);normal.push(...n);uv.push((Math.abs(n[0])>.5?p[2]:p[0])/unit,(Math.abs(n[1])>.5?p[2]:p[1])/unit);}};
  for(const r of rects){const {a,b,c,d,h}=r,Y=vertical?h:y;quad([a,Y,c],[a,Y,d],[b,Y,d],[b,Y,c],[0,1,0]);if(vertical){quad([a,0,c],[a,h,c],[b,h,c],[b,0,c],[0,0,-1]);quad([b,0,d],[b,h,d],[a,h,d],[a,0,d],[0,0,1]);quad([a,0,d],[a,h,d],[a,h,c],[a,0,c],[-1,0,0]);quad([b,0,c],[b,h,c],[b,h,d],[b,0,d],[1,0,0]);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(normal,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));const mesh=new T.Mesh(g,mats.get(key));mesh.receiveShadow=true;root.add(mesh);
 };
 surfaces(surfaceRects(w.segments||[]),1.35,'floor');surfaces(surfaceRects((w.walls||[]).filter(o=>!o.invisible)),0,'wall',true);
 // Trim is inside the existing wall footprint, never in a doorway or playable lane.
 for(const q of surfaceRects((w.walls||[]).filter(o=>!o.invisible)))add('box',(q.a+q.b)/2,q.h-4,(q.c+q.d)/2,q.b-q.a,8,q.d-q.c,'trim');
 let emblems=0;const used=new Set();
 for(const r of w.rooms||[]){
  const walls=(w.walls||[]).filter(q=>!q.invisible&&q.h>=80&&Math.max(q.w,q.d)>=100&&!used.has(q)&&Math.abs(q.x-r.x)<r.w/2+40&&Math.abs(q.z-r.z)<r.d/2+40).sort((a,b)=>Math.hypot(a.x-r.x,a.z-r.z+r.d/2)-Math.hypot(b.x-r.x,b.z-r.z+r.d/2));
  const q=walls[0];if(!q)continue;used.add(q);const along=q.w>=q.d,nx=along?0:Math.sign(r.x-q.x)||1,nz=along?Math.sign(r.z-q.z)||1:0,yaw=Math.atan2(nx,nz),x=q.x+nx*((along?q.d:q.w)/2+1),z=q.z+nz*((along?q.d:q.w)/2+1);
  const anchorRotation=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),yaw);
  const put=(kind,X,Y,Z,sx,sy,sz,key='trim',rx=0,ry=0,rz=0)=>{const rotation=new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)).premultiply(anchorRotation);add(kind,x+X*Math.cos(yaw)+Z*Math.sin(yaw),Y,z-X*Math.sin(yaw)+Z*Math.cos(yaw),sx,sy,sz,key,0,0,0,rotation);};
  put('box',0,55,1,60,65,1,'cloth');put('cylinder',0,89,2,2,70,2,'trim',0,0,Math.PI/2);put('box',0,22,1,42,6,1,'trim');
  const ring=(X,Y,R,key='accent')=>put('ring',X,Y,4,R,R,R,key);
  const blade=(X,tilt,key='bone')=>{put('box',X,61,5,4,42,3,key,0,0,tilt);put('box',X,42,6,16,3,4,'trim',0,0,tilt);};
  switch(t.id){
   case 'warrior':blade(-6,-.48);blade(6,.48);put('box',0,55,8,17,22,6,'trim');put('cone',0,42,8,8.5,9,3,'trim',0,0,Math.PI);break;
   case 'berserker':for(const sign of [-1,1]){put('box',sign*5,58,6,4,48,4,'trim',0,0,sign*.5);put('box',sign*12,72,8,20,14,5,'bone',0,0,sign*.4);put('cone',sign*23,72,8,8,13,3,'bone',0,0,-sign*Math.PI/2);}break;
   case 'ranger':for(const [rr,key]of [[23,'trim'],[17,'bone'],[10,'cloth'],[4,'accent']])put('cylinder',0,58,4,rr,2,rr,key,Math.PI/2);for(const sign of [-1,1])for(let k=0;k<4;k++)put('cone',sign*(24-k*2),36+k*11,5,5,12,2,'accent',0,0,sign*.5);break;
   case 'mage':ring(0,58,23);ring(0,58,18,'bone');for(let k=0;k<6;k++){const a=k*Math.PI/3;put('box',Math.sin(a)*12,58+Math.cos(a)*12,5,2,24,2,'accent',0,0,-a);}put('cone',0,58,8,7,20,5,'accent');break;
   case 'ninja':for(const sign of [-1,1]){put('box',sign*6,57,5,4,43,3,'dark',0,0,sign*.48);put('cone',sign*15,75,7,7,19,3,'bone',0,0,-sign*.48);put('box',sign*3,38,6,13,3,4,'accent');}break;
   case 'reaper':put('cylinder',-7,55,5,2,54,2,'bone',0,0,-.2);put('cone',8,76,6,9,35,3,'accent',0,0,Math.PI/2);ring(0,57,25,'trim');break;
   case 'pyromancer':for(const [X,Y,S,A]of [[0,57,1,0],[-13,57,.65,.3],[12,56,.7,-.3]]){put('sphere',X,Y,6,8*S,15*S,3,'accent');put('cone',X+4*S,Y+15*S,6,8*S,21*S,3,'accent',0,0,A);}for(let k=-2;k<=2;k++)put('box',k*9,39,10,2,16,3,'trim');break;
   case 'paladin':ring(0,64,17);for(let k=0;k<8;k++){const a=k*Math.PI/4;put('box',Math.sin(a)*25,64+Math.cos(a)*25,5,2,9,3,'accent',0,0,-a);}put('box',0,48,6,5,36,4,'bone');put('box',0,53,6,22,5,4,'bone');break;
   case 'pirate':ring(0,77,6,'bone');put('box',0,57,5,5,39,4,'accent');put('box',0,66,5,29,4,4,'accent');for(const sign of [-1,1]){put('box',sign*9,42,5,23,5,4,'accent',0,0,sign*.5);put('cone',sign*19,47,5,6,13,3,'accent',0,0,sign*.45);}break;
   case 'chronomancer':ring(0,59,23);ring(0,59,18,'bone');for(let k=0;k<12;k++){const a=k*Math.PI/6;put('box',Math.sin(a)*25,59+Math.cos(a)*25,5,5,7,3,'trim',0,0,-a);}put('box',0,66,6,2,16,3,'accent');put('box',6,56,6,14,2,3,'accent',0,0,-.4);break;
   case 'necromancer':put('sphere',0,65,7,12,14,4,'bone');for(const X of [-5,5])put('sphere',X,68,11,3,4,1,'dark');put('box',0,52,8,16,8,4,'bone');for(const sign of [-1,1])put('cylinder',sign*7,43,6,2,39,2,'bone',0,0,sign*.65);break;
  }emblems++;
 }
 for(const [key,gs]of bins){const merged=mergeGeometries(gs,false);for(const g of gs)g.dispose();if(!merged)throw Error('Trial geometry '+key);const mesh=new T.Mesh(merged,mats.get(key));mesh.receiveShadow=true;root.add(mesh);}
 for(const g of base.values())g.dispose();
 const counts={trial:t.id,trialRoomTheme:t.name,trialWalls:(w.walls||[]).length,trialEmblems:emblems,floorTiles:(w.segments||[]).length,drawCalls:root.children.length,triangles:0};root.traverse(n=>{if(n.isMesh)counts.triangles+=(n.geometry.index?.count||n.geometry.attributes.position.count)/3;});
 root.userData.dispose=()=>{root.traverse(n=>{if(n.isMesh)n.geometry.dispose();});for(const m of mats.values())m.dispose();for(const m of textures)m.dispose();};
 return {group:root,counts};
}
