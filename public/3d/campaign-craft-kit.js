import * as T from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';
import {craftModel,craftBuilder} from './campaign-craft-models.js?v=2342';
import {beveledBoxGeometry} from './campaign-materials.js?v=2187a';

// Upgrade every instance of each regional kit asset at load time. Preserve the
// imported origin and bounds; renderer transforms and collision stay authoritative.
export function upgradeCampaignKit(kit,theme){
 const map={briar:{rubble:'rock',bank:'bank',lantern:'lantern',crate:'supplies',palisade:'barricade'},hollow:{column:'cliff',scree:'rock',beacon:'brazier'},keep:{rubble:'rock',arch:'arch',brazier:'brazier',grille:'cell-front',crate:'supplies'},frost:{rubble:'ice',wall:'cliff',arch:'cave-mouth'},ember:{crag:'cliff',rubble:'rock',furnace:'furnace',arch:'arch'},palace:{crag:'rock',rubble:'rock',arch:'arch'},castle:{crag:'cliff',rubble:'rock',arch:'arch'}}[theme]||{};
 const report=[];
 if(['briar','hollow','frost'].includes(theme)){
  const parts=craftModel('cliff',theme,{w:100,h:100,d:100}).map(r=>r.geo.clone()),geo=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());geo.scale(.01,.01,.01);geo.translate(0,-.5,0);geo.computeBoundingBox();
  const co=geo.attributes.color,mean=new T.Color(0,0,0);for(let i=0;i<co.count;i++){mean.r+=co.getX(i);mean.g+=co.getY(i);mean.b+=co.getZ(i);}mean.multiplyScalar(1/co.count);kit.set('cliffFace',{geo,mean,tri:co.count/3,craft:'layered-cliff'});report.push({name:'cliffFace',model:'layered-cliff',triangles:co.count/3});
 }
 for(const [name,model]of Object.entries(map)){
  const rec=kit.get(name);if(!rec)continue;rec.geo.computeBoundingBox();const target=rec.geo.boundingBox.clone(),size=target.getSize(new T.Vector3());
  const parts=craftModel(model,theme,{w:100,h:100,d:100}).map(r=>r.geo.clone());let geo=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());geo.computeBoundingBox();const old=geo.boundingBox.clone(),span=old.getSize(new T.Vector3());
  geo.translate(-old.min.x,-old.min.y,-old.min.z);geo.scale(size.x/Math.max(.001,span.x),size.y/Math.max(.001,span.y),size.z/Math.max(.001,span.z));geo.translate(target.min.x,target.min.y,target.min.z);geo.computeBoundingBox();
  const colors=geo.attributes.color,mean=new T.Color(0,0,0);for(let i=0;i<colors.count;i++){mean.r+=colors.getX(i);mean.g+=colors.getY(i);mean.b+=colors.getZ(i);}mean.multiplyScalar(1/colors.count);
  report.push({name,model,oldTriangles:rec.tri,triangles:geo.attributes.position.count/3,bounds:{min:target.min.toArray(),max:target.max.toArray()},fitError:Math.max(geo.boundingBox.min.distanceTo(target.min),geo.boundingBox.max.distanceTo(target.max))});
  rec.geo.dispose();Object.assign(rec,{geo,mean,tri:geo.attributes.position.count/3,craft:model});
 }
 // Timber and masonry are used thousands of times. Keep this geometry small.
 // Chamfering their corners gives directional light something to catch.
 for(const name of ['timber','brick']){
  const rec=kit.get(name);if(!rec)continue;rec.geo.computeBoundingBox();const bounds=rec.geo.boundingBox,size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
  const geo=beveledBoxGeometry(name==='timber'?.024:.035);geo.scale(size.x,size.y,size.z);geo.translate(center.x,center.y,center.z);const colors=new Float32Array(geo.attributes.position.count*3);for(let i=0;i<colors.length;i+=3){colors[i]=rec.mean.r;colors[i+1]=rec.mean.g;colors[i+2]=rec.mean.b;}geo.setAttribute('color',new T.BufferAttribute(colors,3));geo.computeBoundingBox();rec.geo.dispose();Object.assign(rec,{geo,tri:geo.attributes.position.count/3,craft:'chamfered-'+name});report.push({name,model:rec.craft,triangles:rec.tri});
 }
 (window.__CAMPAIGN_CRAFT_KITS||= {})[theme]=report;
}
