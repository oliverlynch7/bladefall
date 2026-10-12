import * as T from './three.module.js';
import {GLTFLoader} from './jsm/loaders/GLTFLoader.js';
const names=['tree_oak','tree_detailed','tree_pineTallA'],dressingNames=['grass_large','flower_yellowA','flower_redA'],cache=[],dressing=[];let pending,loaded=false;
async function load(name,target){try{const g=await new GLTFLoader().loadAsync('../slice3d/assets/nature/'+name+'.glb');g.scene.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(g.scene),height=bb.max.y-bb.min.y,parts=[];g.scene.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);geo.translate(0,-bb.min.y,0);const material=target===dressing&&o.material?.name==='grass'?o.material.clone():o.material;if(material!==o.material)material.color.set('#63874e');parts.push({geo,mat:material});});target.push({name,height,width:Math.max(bb.max.x-bb.min.x,bb.max.z-bb.min.z),parts});}catch(e){console.warn('Briar asset unavailable',name,e.message);}}
export function loadBriarTrees(){return pending||(pending=Promise.all([...names.map(n=>load(n,cache)),...dressingNames.map(n=>load(n,dressing))]).then(()=>{loaded=true;}));}
export const campaignTreesReady=()=>loaded&&cache.length>0;
export function briarTreesReady(){return loaded;}
export function buildBriarTrees(trees){if(!cache.length)return null;const root=new T.Group(),pose=new T.Object3D();
 const cells=new Map();for(const t of trees){const variant=t.variant||0,key=Math.floor(t.x/500)+','+Math.floor(t.z/500)+','+variant;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(t);}
 for(const [key,list]of cells){const rec=cache.find(c=>c.name===names[list[0].variant||0])||cache[0],cell=new T.Group();cell.userData.center={x:list[0].x,z:list[0].z};for(const p of rec.parts){const m=new T.InstancedMesh(p.geo,p.mat,list.length);list.forEach((t,i)=>{pose.position.set(t.x,t.y||0,t.z);pose.rotation.set(0,t.rotation||0,0);pose.scale.setScalar(t.h/rec.height);pose.updateMatrix();m.setMatrixAt(i,pose.matrix);});m.computeBoundingSphere();m.receiveShadow=true;cell.add(m);}root.add(cell);}
 root.userData.sharedBriarAsset=true;root.userData.tick=p=>{for(const c of root.children)c.visible=Math.hypot(c.userData.center.x-p.x,c.userData.center.z-p.z)<1800;};return root;}
export function buildBriarDressing(items){if(!dressing.length)return null;const root=new T.Group(),pose=new T.Object3D();
 const cells=new Map();for(const t of items){const key=t.name+':'+Math.floor(t.x/500)+','+Math.floor(t.z/500);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(t);}
 for(const list of cells.values()){const rec=dressing.find(c=>c.name===list[0].name);if(!rec||!rec.height)continue;const cell=new T.Group();cell.userData.center={x:list[0].x,z:list[0].z};for(const p of rec.parts){const m=new T.InstancedMesh(p.geo,p.mat,list.length);list.forEach((t,i)=>{pose.position.set(t.x,t.y||0,t.z);pose.rotation.set(0,t.rotation||0,0);pose.scale.setScalar((t.h||30)/rec.height);pose.updateMatrix();m.setMatrixAt(i,pose.matrix);});m.computeBoundingSphere();m.receiveShadow=true;cell.add(m);}root.add(cell);}
 root.userData.sharedBriarAsset=true;root.userData.tick=p=>{for(const c of root.children)c.visible=Math.hypot(c.userData.center.x-p.x,c.userData.center.z-p.z)<1800;};return root;}

// Campaign trees reuse the established nature models, with the same source
// footprint and per-tree camera occlusion as the scenery they replace.
export function buildCampaignTrees(trees){
 if(!cache.length)return null;
 const root=new T.Group(),pose=new T.Object3D(),zero=new T.Matrix4().makeScale(0,0,0),records=[],cells=new Map();
 root.name='Campaign mature trees';root.userData.sharedBriarAsset=true;
 for(const t of trees){const key=Math.floor(t.x/400)+','+Math.floor(t.z/400)+','+t.variant;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(t);}
 for(const list of cells.values()){
  const rec=cache.find(c=>c.name===names[list[0].variant])||cache[0],cell=new T.Group(),poses=[];
  for(const t of list){const sy=t.h/rec.height,sxz=Math.min(sy,t.w/rec.width);pose.position.set(t.x,t.y,t.z);pose.rotation.set(0,t.rotation,0);pose.scale.set(sxz,sy,sxz);pose.updateMatrix();poses.push(pose.matrix.clone());}
  for(const part of rec.parts){const m=new T.InstancedMesh(part.geo,part.mat,list.length);poses.forEach((a,i)=>m.setMatrixAt(i,a));m.computeBoundingSphere();m.castShadow=true;m.receiveShadow=true;cell.add(m);}
  root.add(cell);records.push({cell,list,poses,visible:list.map(()=>true)});
 }
 root.userData.tick=w=>{let triangles=0,calls=0;const p=w.p,range=window.__BF_META?.().quality==='low'?850:1250;
  for(const r of records){r.cell.visible=r.list.some(t=>Math.hypot(t.x-p.x,t.z-p.z)<range+t.w);if(!r.cell.visible)continue;
   for(let i=0;i<r.list.length;i++){const t=r.list[i],visible=!window.BFCameraOcclusion?.blocks(w,{x:t.x,z:t.z,w:t.w,d:t.w},t.y+t.h*.42,t.y+t.h,window.__BF_META?.().camMode,10);
    if(visible!==r.visible[i]){r.visible[i]=visible;for(const m of r.cell.children){m.setMatrixAt(i,visible?r.poses[i]:zero);m.instanceMatrix.needsUpdate=true;}}
   }
   for(const m of r.cell.children){calls++;triangles+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3*m.count;}
  }return {triangles,calls};
 };
 root.userData.dispose=()=>{for(const r of records)for(const m of r.cell.children)m.dispose();};
 return root;
}
