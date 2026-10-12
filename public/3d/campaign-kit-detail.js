import * as T from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';
// Details are baked into the existing instanced model, inside its footprint.
// No new scene objects, colliders or per-instance draw calls are introduced.
export function enrichCampaignKit(kit,zone){
 for(const name of ['pillar','furnace']){
  const rec=kit.get(name);if(!rec||!['palace','castle','ember'].includes(zone))continue;
  const pieces=[],gold=zone==='palace'?'#c8a253':zone==='castle'?'#9993af':'#ba8550',dark=zone==='palace'?'#b1a38a':zone==='castle'?'#514b66':'#444b4d';
  const normalize=g=>{if(g.index){const n=g.toNonIndexed();g.dispose();g=n;}for(const k of Object.keys(g.attributes))if(!['position','normal','color'].includes(k))g.deleteAttribute(k);return g;};
  pieces.push(normalize(rec.geo.clone()));
  const part=(g,color,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{
   g=normalize(g);const c=new T.Color(color),co=new Float32Array(g.attributes.position.count*3);for(let i=0;i<co.length;i+=3){co[i]=c.r;co[i+1]=c.g;co[i+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(co,3));
   const m=new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(1,1,1));g.applyMatrix4(m);pieces.push(g);
  };
  const box=(x,y,z,w,h,d,c)=>part(new T.BoxGeometry(w,h,d),c,x,y,z);
  if(name==='pillar'){
   for(const y of [.18,.79]){part(new T.CylinderGeometry(.337,.337,.035,16),gold,0,y,0);part(new T.CylinderGeometry(.316,.331,.027,16),dark,0,y+.03,0);}
   if(zone==='ember'){
    for(let i=0;i<8;i++){const a=i*Math.PI/4;part(new T.CylinderGeometry(.021,.021,.54,6),gold,Math.cos(a)*.304,.485,Math.sin(a)*.304);}
   }else{
    for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*.309,z=Math.sin(a)*.309;part(new T.CylinderGeometry(.018,.027,.5,6),zone==='palace'?'#eee0b6':'#888194',x,.48,z);part(new T.OctahedronGeometry(.048),gold,x,.84,z);}
    for(const y of [.07,.945])for(const side of [-1,1])for(let i=-2;i<=2;i++){box(i*.13,y,side*.435,.065,.02,.027,gold);box(side*.435,y,i*.13,.027,.02,.065,gold);}
   }
  }else if(zone==='ember'){
   for(const side of [-1,1]){
    for(let i=-3;i<=3;i++)box(i*.09,.52,side*.226,.025,.38,.008,dark);
    for(const x of [-.405,.405])for(const y of [.15,.35,.6,.83])part(new T.SphereGeometry(.021,6,4),gold,x,y,side*.212);
    for(const y of [.29,.75])box(0,y,side*.225,.72,.025,.008,gold);
   }
  }else{
   for(const side of [-1,1]){
    for(const x of [-.17,.17])box(x,.4,side*.214,.025,.55,.008,gold);
    for(let i=0;i<13;i++){const a=i*Math.PI/12;part(new T.SphereGeometry(.022,5,4),gold,Math.cos(a)*.3,.67+Math.sin(a)*.25,side*.215);}
    part(new T.TorusGeometry(.13,.016,4,16),gold,0,.59,side*.213);part(new T.OctahedronGeometry(.06),gold,0,.59,side*.19);
    box(0,.1,side*.213,.69,.025,.009,gold);
   }
  }
  const geo=mergeGeometries(pieces);for(const p of pieces)p.dispose();if(!geo)continue;
  geo.computeBoundingBox();geo.computeBoundingSphere();const co=geo.attributes.color,mean=new T.Color(0,0,0);for(let i=0;i<co.count;i++){mean.r+=co.getX(i);mean.g+=co.getY(i);mean.b+=co.getZ(i);}mean.multiplyScalar(1/co.count);
  rec.geo.dispose();Object.assign(rec,{geo,mean,tri:geo.attributes.position.count/3});
 }
}
