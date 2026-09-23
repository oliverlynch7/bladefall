import * as T from './three.module.js';

// A bounded cloth grid per visible rig. No new textures are downloaded and no saves change.
export const CAPE_STYLES={
 wanderer:{name:'Wanderer’s Cape',base:'#4d5765',trim:'#b4a184',mark:'compass',length:1.16},
 sail:{name:'Sailcloth Cape',base:'#cfc5a2',trim:'#32616b',mark:'sail',length:1.12},
 winter:{name:'Winter Cloak',base:'#849fa9',trim:'#e6e3cf',mark:'snow',length:1.24},
 delver:{name:'Delver’s Cape',base:'#513c70',trim:'#b49ecf',mark:'diamond',length:1.14},
 slayer:{name:'Slayer’s Cape',base:'#85372f',trim:'#c6a37a',mark:'blade',length:1.10},
 tyrant:{name:'Tyrant’s Mantle',base:'#b09247',trim:'#ece0b4',mark:'crown',length:1.25},
 undying:{name:'Undying Shroud',base:'#282832',trim:'#958caa',mark:'moon',length:1.28}
};
export const TRAIL_STYLES={dust:{name:'Dust Trail',color:'#c4b69e'},ember:{name:'Ember Trail',color:'#ff9a50'},frost:{name:'Frost Trail',color:'#a3e5ed'},void:{name:'Void Trail',color:'#ae8bdb'},flawless:{name:'Ghost Trail',color:'#e1edf2'}};
const cache=new Map(),rigs=new Set(),V=new T.Vector3(),INV=new T.Matrix4();
const clamp=T.MathUtils.clamp;
function fabric(id,accent){
 const key=id+accent;if(cache.has(key))return cache.get(key);
 const st=CAPE_STYLES[id],canvas=document.createElement('canvas');canvas.width=128;canvas.height=256;const c=canvas.getContext('2d');
 c.fillStyle=st.base;c.fillRect(0,0,128,256);
 // Soft vertical folds, woven grain and stitched borders belong to one surface.
 for(let x=0;x<128;x++){c.fillStyle=`rgba(0,0,0,${.03+.12*(.5+.5*Math.cos(x*.27))})`;c.fillRect(x,0,1,256);}
 c.globalAlpha=.13;c.fillStyle='#fff';for(let y=1;y<256;y+=3)c.fillRect(0,y,128,1);c.globalAlpha=1;
 c.fillStyle=st.trim;c.fillRect(3,0,7,256);c.fillRect(118,0,7,256);c.fillRect(3,239,122,9);
 c.fillStyle=accent;c.fillRect(12,0,3,239);c.fillRect(113,0,3,239);
 c.fillStyle=st.base;for(let y=5;y<248;y+=8){c.fillRect(6,y,2,3);c.fillRect(121,y,2,3);}
 c.strokeStyle=st.trim;c.fillStyle=st.trim;c.lineWidth=3;c.lineJoin='round';
 const line=pts=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
 const diamond=(x,y,w,h)=>line([[x,y-h],[x+w,y],[x,y+h],[x-w,y],[x,y-h]]);
 if(st.mark==='compass'){diamond(64,115,24,32);line([[64,73],[64,157]]);line([[34,115],[94,115]]);diamond(64,115,6,9);}
 if(st.mark==='sail'){line([[64,73],[64,147],[87,147],[76,161],[47,161],[35,147],[62,147]]);line([[58,83],[37,137],[58,137]]);line([[70,88],[88,137],[70,137]]);}
 if(st.mark==='snow'){for(let k=0;k<6;k++){let a=k*Math.PI/3;line([[64,117],[64+Math.sin(a)*29,117+Math.cos(a)*29]]);}diamond(64,117,13,13);}
 if(st.mark==='diamond'){diamond(64,116,25,40);diamond(64,116,13,26);line([[39,116],[89,116]]);}
 if(st.mark==='blade'){line([[59,139],[59,88],[64,77],[69,88],[69,139],[59,139]]);line([[45,140],[83,140]]);line([[64,140],[64,159]]);}
 if(st.mark==='crown'){line([[38,104],[49,120],[64,94],[79,120],[90,104],[84,143],[44,143],[38,104]]);line([[44,152],[84,152]]);diamond(64,130,5,7);}
 if(st.mark==='moon'){c.beginPath();c.arc(64,119,27,.5,5.8);c.stroke();c.beginPath();c.arc(77,115,24,1.7,4.65);c.stroke();diamond(64,119,6,10);}
 const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=2;
 cache.set(key,tex);return tex;
}
function bone(w,name,fallback){const b=w.getObjectByName(name);return b?b.getWorldPosition(new T.Vector3()).applyMatrix4(INV):new T.Vector3(...fallback);}
function body(w,model){w.updateMatrixWorld(true);INV.copy(w.matrixWorld).invert();const l=bone(w,'ShoulderL',[.16,1.65,0]),r=bone(w,'ShoulderR',[-.16,1.65,0]),hip=bone(w,'Hips',[0,1,0]),top=l.clone().add(r).multiplyScalar(.5),right=l.clone().sub(r).normalize(),up=top.clone().sub(hip).normalize(),back=new T.Vector3().crossVectors(right,up).normalize().negate();return {top,hip,right,up,back,radius:model==='Wizard'||model==='Cleric'?.37:.28,legs:['UpperLegL','LowerLegL','UpperLegR','LowerLegR'].map(n=>bone(w,n,[0,.6,0]))};}
function hem(id,u){const edge=Math.abs(u*2-1);return id==='sail'?.16*(1-edge):id==='winter'?.10*edge*edge:id==='slayer'?.09*(.5+.5*Math.sin(u*25)):id==='undying'?.14*Math.abs(Math.sin(u*Math.PI*3)):id==='tyrant'?-.06*(1-edge):0;}
function makeCape(w,id,model,accent){
 const cols=8,rows=12,n=(cols+1)*(rows+1),pos=new Float32Array(n*3),uv=new Float32Array(n*2),idx=[],links=[],points=[],prev=[];
 const st=CAPE_STYLES[id];
 for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){const i=r*(cols+1)+c,u=c/cols,v=r/rows,wide=.68+v*.4;const p=new T.Vector3((u-.5)*wide,1.62-v*st.length+hem(id,u)*Math.pow(v,6),-.32-v*.18+Math.cos(u*Math.PI*6)*.035*v);points.push(p);prev.push(p.clone());uv.set([u,1-v],i*2);if(c<cols&&r<rows){const a=i,b=i+1,d=i+cols+1,e=d+1;idx.push(a,d,b,b,d,e);}}
 const add=(a,b)=>links.push([a,b,points[a].distanceTo(points[b])]);
 for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){const i=r*(cols+1)+c;if(c<cols)add(i,i+1);if(r<rows)add(i,i+cols+1);if(c<cols&&r<rows){add(i,i+cols+2);add(i+1,i+cols+1);}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3).setUsage(T.DynamicDrawUsage));geo.setAttribute('uv',new T.BufferAttribute(uv,2));geo.setIndex(idx);
 const mat=new T.MeshStandardMaterial({map:fabric(id,accent),roughness:.96,metalness:0,side:T.DoubleSide});const mesh=new T.Mesh(geo,mat);mesh.name='Equipped cloth cape';mesh.frustumCulled=false;mesh.userData.cosmetic=true;w.add(mesh);
 const rec={w,id,model,accent,mesh,points,prev,links,rows,cols,st,time:0,position:null,yaw:0,steps:0};rigs.add(rec);return rec;
}
function dropCape(rec){if(!rec)return;rec.mesh.removeFromParent();rec.mesh.geometry.dispose();rec.mesh.material.dispose();rigs.delete(rec);}
export function disposeCosmetics(w){dropCape(w.userData.clothCape);delete w.userData.clothCape;const t=w.userData.motionTrail;if(t){t.mesh.removeFromParent();t.mesh.geometry.dispose();t.mesh.material.dispose();delete w.userData.motionTrail;}}
function pin(rec,b){for(let c=0;c<=rec.cols;c++){const p=rec.points[c];p.copy(b.top).addScaledVector(b.right,(c/rec.cols-.5)*.68).addScaledVector(b.back,b.radius+.04);rec.prev[c].copy(p);}}
function constrain(rec,b,floor){
 const axis=b.top.clone().sub(b.hip),len2=axis.lengthSq(),near=new T.Vector3(),radial=new T.Vector3();
 for(let i=rec.cols+1;i<rec.points.length;i++){
  const p=rec.points[i],before=p.clone(),f=clamp(radial.subVectors(p,b.hip).dot(axis)/(len2||1),0,1);near.copy(b.hip).addScaledVector(axis,f);radial.subVectors(p,near);
  const depth=radial.dot(b.back),side=radial.dot(b.right),along=radial.dot(b.up),clearance=b.radius+.04+.32*clamp(1-f,0,1);
  if(Math.abs(side)<.57&&Math.abs(along)<.9&&depth<clearance)p.addScaledVector(b.back,clearance-depth);
  for(const leg of b.legs){radial.subVectors(p,leg);if(radial.length()<.29)p.copy(leg).addScaledVector(b.back,.30);}
  radial.subVectors(p,b.top);if(radial.length()>1.65)p.copy(b.top).add(radial.setLength(1.65));p.y=Math.max(floor,p.y);rec.prev[i].add(p.clone().sub(before));
 }
}
function stepCape(rec,p,dt,b){
 const delta=Math.min(.05,Math.max(0,dt)),steps=Math.max(1,Math.ceil(delta/(1/60))),h=delta/steps;
 const now=new T.Vector3(p.x||0,p.y||0,p.z||0),scale=Math.max(.001,rec.w.scale.x),travel=rec.position?now.distanceTo(rec.position)/scale:0;
 const mx=p.peerId&&rec.position&&delta>0?(now.x-rec.position.x)/delta:(p.vx||0),mz=p.peerId&&rec.position&&delta>0?(now.z-rec.position.z)/delta:(p.vz||0);
 const speed=clamp(Math.hypot(mx,mz)/240,0,2),yaw=p.yaw||0,turn=rec.position?clamp(Math.atan2(Math.sin(yaw-rec.yaw),Math.cos(yaw-rec.yaw)),-.3,.3):0;
 if(!rec.position||travel>4){for(let i=0;i<rec.points.length;i++){const r=Math.floor(i/(rec.cols+1)),u=(i%(rec.cols+1))/rec.cols,v=r/rec.rows;rec.points[i].copy(b.top).addScaledVector(b.right,(u-.5)*(.68+v*.4)).addScaledVector(b.up,-v*rec.st.length+hem(rec.id,u)*Math.pow(v,6)).addScaledVector(b.back,b.radius+.04+Math.min(1,v*2)*.32);rec.prev[i].copy(rec.points[i]);}}
 const floor=.07-Math.max(0,p.y||0)/scale,sideWind=clamp((mx*Math.cos(yaw)-mz*Math.sin(yaw))/240,-2,2);
 for(let s=0;s<steps;s++){
  rec.time+=h;pin(rec,b);
  for(let i=rec.cols+1;i<rec.points.length;i++){const q=rec.points[i],old=rec.prev[i],x=q.x,y=q.y,z=q.z,v=Math.floor(i/(rec.cols+1))/rec.rows;
   q.x+=(q.x-old.x)*.91+(Math.sin(rec.time*3.2+v*5)*.16-sideWind*3)*h*h-turn*v*.075/steps;
   q.y+=(q.y-old.y)*.91-9*h*h;
   q.z+=(q.z-old.z)*.91-(speed*3+Math.sin(rec.time*4+v*5)*.22)*h*h;
   old.set(x,y,z);
  }
  for(let pass=0;pass<4;pass++){for(const [a,c,len] of rec.links){const pa=rec.points[a],pb=rec.points[c];V.subVectors(pb,pa);const d=V.length();if(d<1e-7)continue;V.multiplyScalar((d-len)/d*.5);if(a>rec.cols)pa.add(V);if(c>rec.cols)pb.sub(V);}pin(rec,b);constrain(rec,b,floor);}
 }
 rec.position=now;rec.yaw=yaw;rec.steps=steps;
 const attr=rec.mesh.geometry.attributes.position;rec.points.forEach((q,i)=>attr.setXYZ(i,q.x,q.y,q.z));attr.needsUpdate=true;rec.mesh.geometry.computeVertexNormals();
}
function makeTrail(w){const max=42,geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(max*54),3).setUsage(T.DynamicDrawUsage));geo.setAttribute('color',new T.BufferAttribute(new Float32Array(max*54),3).setUsage(T.DynamicDrawUsage));geo.setAttribute('fade',new T.BufferAttribute(new Float32Array(max*18),1).setUsage(T.DynamicDrawUsage));const mat=new T.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.7,depthWrite:false,side:T.DoubleSide});mat.onBeforeCompile=shader=>{shader.vertexShader='attribute float fade; varying float vFade;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFade=fade;');shader.fragmentShader='varying float vFade;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=vFade;');};mat.customProgramCacheKey=()=> 'cloth-trails-alpha-1';const mesh=new T.Mesh(geo,mat);mesh.name='Equipped motion trail';mesh.frustumCulled=false;w.add(mesh);return {mesh,samples:[],last:null,id:null,time:0,max};}
function trail(w,p,id,dt,enabled){
 let rec=w.userData.motionTrail;if(!id||!enabled){if(rec){rec.samples=[];rec.last=null;rec.mesh.visible=false;}return;}
 if(!rec)rec=w.userData.motionTrail=makeTrail(w);const now=new T.Vector3(p.x||0,(p.y||0)+1.4,p.z||0),age=Math.min(.05,Math.max(0,dt));rec.time+=age;
 const dist=rec.last?now.distanceTo(rec.last):0;
 if(rec.id!==id||dist>180){rec.samples=[];rec.last=null;}rec.id=id;rec.mesh.visible=true;
 for(const s of rec.samples)s.life-=age;rec.samples=rec.samples.filter(s=>s.life>0);
 if(rec.last&&dist>1.5){const count=Math.min(4,Math.ceil(dist/9));for(let i=1;i<=count;i++)rec.samples.push({pos:rec.last.clone().lerp(now,i/count),life:.55,seed:rec.time*13+i});}
 if(!rec.last||dist>1.5)rec.last=now;rec.samples=rec.samples.slice(-rec.max);w.updateMatrixWorld(true);INV.copy(w.matrixWorld).invert();const positions=rec.mesh.geometry.attributes.position,colors=rec.mesh.geometry.attributes.color,fades=rec.mesh.geometry.attributes.fade,base=new T.Color(TRAIL_STYLES[id].color);let k=0;
 const tri=(a,b,c,col,fade=1)=>{for(const v of [a,b,c]){v.applyMatrix4(INV);positions.setXYZ(k,v.x,v.y,v.z);colors.setXYZ(k,col.r,col.g,col.b);fades.setX(k,fade);k++;}};
 for(let i=0;i<rec.samples.length;i++){const s=rec.samples[i],f=clamp(s.life/.55,0,1),pt=s.pos.clone(),col=base.clone(),r=(id==='dust'?5:id==='frost'?3.7:id==='ember'?1.15:2.8)*f;
  if(id==='ember'){pt.y+=(1-f)*14;pt.x+=Math.sin(s.seed)*3;}
  if(id==='void'||id==='flawless'){const next=rec.samples[i+1];if(!next)continue;const dir=next.pos.clone().sub(s.pos);if(dir.length()>40)continue;const side=new T.Vector3(-dir.z,0,dir.x).normalize().multiplyScalar(id==='void'?2.3:4);pt.y+=(id==='void'?4:8);const end=next.pos.clone();end.y=pt.y;for(const sign of [-1,1]){const shift=side.clone().multiplyScalar(sign*1.9),width=side.clone().multiplyScalar(.4);tri(pt.clone().add(shift).add(width),pt.clone().add(shift).sub(width),end.clone().add(shift).add(width),col,f);tri(end.clone().add(shift).add(width),pt.clone().add(shift).sub(width),end.clone().add(shift).sub(width),col,f);}continue;}
  if(id==='dust'){pt.x+=Math.sin(s.seed)*6;pt.z+=Math.cos(s.seed)*6;pt.y+=(1-f)*3;for(let j=0;j<6;j++){const a=j*Math.PI/3,b=(j+1)*Math.PI/3;tri(pt.clone(),pt.clone().add(new T.Vector3(Math.cos(a)*r,0,Math.sin(a)*r*.65)),pt.clone().add(new T.Vector3(Math.cos(b)*r,0,Math.sin(b)*r*.65)),col,f*.24);}continue;}
  if(id==='frost'){for(let j=0;j<6;j++){const a=j*Math.PI/3+s.seed*.1,tip=pt.clone().add(new T.Vector3(Math.cos(a)*r,0,Math.sin(a)*r));tri(pt.clone().add(new T.Vector3(Math.cos(a-.6)*r*.23,0,Math.sin(a-.6)*r*.23)),tip,pt.clone().add(new T.Vector3(Math.cos(a+.6)*r*.23,0,Math.sin(a+.6)*r*.23)),col,f*.8);}continue;}
  const a=pt.clone().add(new T.Vector3(-r,0,0)),b=pt.clone().add(new T.Vector3(0,id==='ember'?r*2:0,-r)),c=pt.clone().add(new T.Vector3(r,0,0)),d=pt.clone().add(new T.Vector3(0,0,r));tri(a.clone(),b,c.clone(),col,f);tri(a,c,d,col,f);
 }
 rec.mesh.geometry.setDrawRange(0,k);positions.needsUpdate=true;colors.needsUpdate=true;fades.needsUpdate=true;
}
export function syncCosmetics(w,p,dt,{cape=null,trail:tr=null,model='Warrior',accent='#ae9671',particles=true,hidden=false,sceneKey=null}={}){
 cape=CAPE_STYLES[cape]?cape:null;tr=TRAIL_STYLES[tr]?tr:null;let rec=w.userData.clothCape;
 if(rec&&(rec.id!==cape||rec.model!==model||rec.accent!==accent)){dropCape(rec);delete w.userData.clothCape;rec=null;}
 if(cape&&!rec)rec=w.userData.clothCape=makeCape(w,cape,model,accent);
 if(w.userData.cosmeticScene!==sceneKey){w.userData.cosmeticScene=sceneKey;const old=w.userData.motionTrail;if(old){old.samples=[];old.last=null;}if(rec)rec.position=null;}
 if(rec){rec.mesh.visible=!hidden;if(!hidden)stepCape(rec,p,dt,body(w,model));}
 trail(w,p,tr,dt,particles&&!hidden);
}
export function cosmeticStats(w){const c=w?.userData.clothCape,t=w?.userData.motionTrail;return {cape:c?.id||null,vertices:c?.points.length||0,triangles:c?c.mesh.geometry.index.count/3:0,steps:c?.steps||0,finite:c?c.points.every(p=>Number.isFinite(p.x+p.y+p.z)):true,lowest:c?Math.min(...c.points.map(p=>p.y)):null,trail:t?.id||null,samples:t?.samples.length||0,trailVisible:!!t?.mesh.visible,textures:cache.size,rigs:rigs.size};}
