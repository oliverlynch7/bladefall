import * as T from './three.module.js';
import {campaignMaterial} from './campaign-materials.js?v=2187a';
// Navigation inlay follows the authored primary route and the real floor below.
// It stops at gaps; it never implies a bridge or changes collision.
let active=null;
export function attachGeographyArt(parent,w){
 window.__CAMPAIGN_GEOGRAPHY_ART=null;const geo=w.geography;if(!geo||geo.zone!=='palace'||w.hub||w.trial||w.side||w.endless||w.delve||w.bonus||w.arena||w.briarBeta||w.devKeep||w.shipScene==='voyage'||['void','restored'].includes(w.finalStage))return;
 const root=new T.Group();root.name='Campaign route inlay';parent.add(root);
 const palette={outskirts:'#9f9267',hollow:'#ba916b',keep:'#948064',frost:'#b4d6de',ember:'#9d825b',abyss:'#bbac87',palace:'#93b8be',castle:'#978893'};
 const regal=['keep','palace','castle','ember'].includes(geo.zone),material=campaignMaterial(regal?'marble':'soil',{color:palette[geo.zone],roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const geometry=new T.BoxGeometry(1,1,1),bins=new Map(),dummy=new T.Object3D();let samples=0;
 const height=(x,z,yRef=Infinity)=>{
  let h=-Infinity;
  for(const s of w.segments||[])if(!s.nofloor&&Math.abs(x-s.x)<s.w/2-4&&Math.abs(z-s.z)<s.d/2-4)h=0;
  for(const o of w.obstacles||[])if(o.kind==='plat'&&!o.shelfCatch&&o.h<=yRef+20&&Math.abs(x-o.x)<o.w/2-4&&Math.abs(z-o.z)<o.d/2-4)h=Math.max(h,o.h);
  return h;
 };
 // Keep tower flights and optional puzzle paths visually distinct from the main inlay.
 if(!(geo.zone==='castle'&&geo.area===1))for(const r of geo.routes)for(let i=1;i<r.points.length;i++){
  const a=r.points[i-1],b=r.points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(length/34),yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);
  for(let k=0;k<n;k++){
   const t=(k+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,yRef=Number.isFinite(a[2])&&Number.isFinite(b[2])?a[2]+(b[2]-a[2])*t:Infinity,y=height(x,z,yRef);
   if(!Number.isFinite(y))continue;
   // Do not paint a long stripe over a room's furniture or up a staircase face.
   if((w.obstacles||[]).some(o=>o.kind!=='plat'&&o.h>y+5&&(o.y0||0)<y+50&&Math.abs(x-o.x)<o.w/2+48&&Math.abs(z-o.z)<o.d/2+20))continue;
   const key=Math.floor(x/500)+','+Math.floor(z/500);if(!bins.has(key))bins.set(key,[]);
   // Twin inset bands keep the floor material visible, including its stair edges.
   for(const side of [-1,1]){dummy.position.set(x+Math.cos(yaw)*side*50,y+3.4,z-Math.sin(yaw)*side*50);dummy.rotation.set(0,yaw,0);dummy.scale.set(regal?12:23,.8,length/n*.86);dummy.updateMatrix();bins.get(key).push(dummy.matrix.clone());}samples++;
  }
 }
 const groups=[];
 for(const [cell,matrices]of bins){const mesh=new T.InstancedMesh(geometry,material,matrices.length);matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();mesh.receiveShadow=true;mesh.name='Inlaid route';root.add(mesh);groups.push({cell,mesh});}
 const prior=parent.userData.dispose;parent.userData.dispose=()=>{prior?.();geometry.dispose();material.dispose();for(const q of groups)q.mesh.dispose();if(active?.root===root)active=null;};active={root,groups};window.__CAMPAIGN_GEOGRAPHY_ART={samples,drawCalls:groups.length};updateGeographyArt(w);
}
export function updateGeographyArt(w){if(!active||!w.p)return;for(const q of active.groups){const [x,z]=q.cell.split(',').map(v=>(+v+.5)*500);q.mesh.visible=Math.hypot(x-w.p.x,z-w.p.z)<1250;}}
