import * as T from './three.module.js';
import {craftBuilder} from './campaign-craft-models.js?v=2187a';
import {campaignMaterial} from './campaign-materials.js?v=2187a';

// One fitted, disposable detail layer; never creates traversable geometry.
export function buildCampaignJourneyArt(w){
 const g=window.__BF3?.G,a=window.BFCampaignJourney?.entry(g);if(!a||!g.journeySigns)return null;
 const root=new T.Group();root.name='Campaign journey '+g.zone+':'+g.area;
 const geos=[],mats=[],textures=[],signs=[],ink=[],palettes={frost:['#43617a','#e3cf94'],ember:['#544633','#e6bf73'],coast:['#375d62','#e5d1a0'],palace:['#668397','#e8d298'],castle:['#605c75','#dbc29c']};
 const colors=palettes[a.theme],finish=(b,parent)=>{for(const p of b.finish()){geos.push(p.geo);const m=new T.Mesh(p.geo,p.material);m.castShadow=true;m.receiveShadow=true;parent.add(m);}};
 const signTexture=(title,detail)=>{const c=document.createElement('canvas');c.width=768;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=colors[0];ctx.fillRect(0,0,768,256);ctx.strokeStyle=colors[1];ctx.lineWidth=3;ctx.strokeRect(12,12,744,232);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff3cf';ctx.font='bold 41px sans-serif';ctx.fillText(title,384,85,720);ctx.font='32px sans-serif';ctx.fillStyle='#fff';ctx.fillText(detail,384,170,720);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;textures.push(t);return t;};
 for(const s of g.journeySigns){
  const node=new T.Group();node.position.set(s.x,s.y,s.z);root.add(node);const b=craftBuilder(a.theme);
  b.box(0,51,0,14,102,14,a.theme==='palace'?'stone':'wood');b.box(0,7,0,28,14,27,'stone');b.box(0,110,0,178,66,12,'dark');
  for(const x of [-89,89]){b.box(x,110,0,6,72,16,'metal');b.ball(x,148,0,4,'gold');}
  for(const y of [76,144])b.box(0,y,0,185,5,16,'gold');b.bolts([-78,78],[85,135],9);
  if(a.theme==='frost'){b.box(0,149,0,190,6,20,'light');b.box(-51,155,0,47,7,18,'light');}
  if(a.theme==='coast'){b.curve([[-11,48,0],[-11,56,11],[11,62,11],[11,70,0]],2,'light');}
  if(a.theme==='palace'||a.theme==='castle'){b.diamond?.(0,156,0,10,19,7,'gold');}
  finish(b,node);
  const tex=signTexture(s.title,s.detail),mat=new T.MeshBasicMaterial({map:tex,toneMapped:false});mats.push(mat);
  const geo=new T.PlaneGeometry(170,58);geos.push(geo);
  for(const side of [-1,1]){const m=new T.Mesh(geo,mat);m.position.set(0,110,side*7);if(side<0)m.rotation.y=Math.PI;node.add(m);}
  signs.push(node);
 }
 // Union of narrow inlays on flat, supported route sections. Clipping against
 // every corner stops markings bridging holes or drawing across another floor.
 const paths=window[a.api]?.paths||{},levels=new Map(),step=24,half=a.theme==='ember'?39:47;
 for(const id of a.roads){const path=paths[id]||[];for(let i=1;i<path.length;i++){const u=path[i-1],v=path[i];if(Math.abs(u[2]-v[2])>.1)continue;const l=(u[0]-v[0])**2+(u[1]-v[1])**2;if(!l)continue;if(!levels.has(u[2]))levels.set(u[2],[]);levels.get(u[2]).push({u,v,l});}}
 const pos=[],uv=[],col=[],base=new T.Color(a.theme==='coast'?(g.area===0?'#b6a379':'#84918c'):colors[0]),edge=new T.Color(a.theme==='coast'?'#c2baa0':colors[1]);
 for(const [y,lines]of levels){const cells=new Set(),floors=(w.obstacles||[]).filter(o=>o.kind==='plat'&&!o.nocol&&Math.abs(o.h-y)<.2),solid=p=>floors.some(o=>Math.abs(p[0]-o.x)<o.w/2-1&&Math.abs(p[1]-o.z)<o.d/2-1);
  for(const {u,v}of lines)for(let x=Math.floor((Math.min(u[0],v[0])-half)/step);x<=Math.ceil((Math.max(u[0],v[0])+half)/step);x++)for(let z=Math.floor((Math.min(u[1],v[1])-half)/step);z<=Math.ceil((Math.max(u[1],v[1])+half)/step);z++)cells.add(x+','+z);
  const distance=(x,z)=>Math.min(...lines.map(({u,v,l})=>{const dx=v[0]-u[0],dz=v[1]-u[1],t=Math.max(0,Math.min(1,((x-u[0])*dx+(z-u[1])*dz)/l));return Math.hypot(x-u[0]-dx*t,z-u[1]-dz*t);}));
  const vertex=(x,z)=>({x,z,d:distance(x,z)/half});
  const triangle=points=>{const polygon=[];for(let i=0;i<3;i++){const u=points[i],v=points[(i+1)%3],inside=u.d<=1;if(inside)polygon.push(u);if(inside!==(v.d<=1)){const t=(1-u.d)/(v.d-u.d);polygon.push({x:u.x+(v.x-u.x)*t,z:u.z+(v.z-u.z)*t,d:1});}}
   if(!polygon.every(p=>solid([p.x,p.z])))return;
   for(let i=1;i<polygon.length-1;i++)for(const p of [polygon[0],polygon[i],polygon[i+1]]){const c=base.clone().lerp(edge,Math.max(0,Math.min(.65,(p.d-.73)*3)));pos.push(p.x,y+2.3,p.z);uv.push(p.x/90,p.z/90);col.push(c.r,c.g,c.b);}
  };
  for(const key of cells){const [x,z]=key.split(',').map(n=>Number(n)*step),u=vertex(x,z),v=vertex(x,z+step),r=vertex(x+step,z),q=vertex(x+step,z+step);triangle([u,v,r]);triangle([r,v,q]);}
 }
 if(pos.length){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setAttribute('color',new T.Float32BufferAttribute(col,3));geo.computeVertexNormals();geo.computeBoundingSphere();geos.push(geo);const mat=campaignMaterial(a.theme==='coast'?'sand':a.theme==='frost'&&g.area===0?'snow':a.theme==='ember'?'metal':a.theme==='palace'?'marble':'flagstone',{vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});mats.push(mat);const m=new T.Mesh(geo,mat);m.receiveShadow=true;root.add(m);ink.push(m);}
 const update=()=>{const p=window.__BF3?.G?.p;if(!p)return;for(const n of signs)n.visible=Math.hypot(n.position.x-p.x,n.position.z-p.z)<1400&&Math.abs(n.position.y-p.y)<420;};
 root.userData.update=update;root.userData.dispose=()=>{geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());if(window.__CAMPAIGN_JOURNEY_ART?.root===root)delete window.__CAMPAIGN_JOURNEY_ART;};
 window.__CAMPAIGN_JOURNEY_ART={root,snapshot:()=>({zone:g.zone,area:g.area,signs:g.journeySigns,visibleSigns:signs.filter(n=>n.visible).length,inlayTriangles:pos.length/9,triangles:geos.reduce((n,g)=>n+(g.index?.count||g.attributes.position.count)/3,0)})};update();return root;
}
