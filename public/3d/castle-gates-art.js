import * as T from './three.module.js';
import {buildDeep} from './deep-art.js?v=2017';
export function buildCastleGates(scene,w){
 const result=buildDeep(scene,{...w,portalProfile:{name:'Castle Duskmoor · Castle Gates',palette:['#68636c','#6d6670','#615e69','#706974'],fog:'#353643',sky:[.19,.20,.26],sun:'#d8d3df',body:'#3d3f49',lamp:'#deb179',hazard:['#303745','#4c5661'],sunGlow:[.04,.03,.055]}});
 const materials=[new T.MeshStandardMaterial({color:'#393c45',roughness:.7,metalness:.5}),new T.MeshStandardMaterial({color:'#928072',roughness:.7}),new T.MeshStandardMaterial({color:'#a68a5d',roughness:.5,metalness:.5})],geometries=[];
 const part=(geo,mat,x,y,z)=>{geometries.push(geo);const m=new T.Mesh(geo,materials[mat]);m.position.set(x,y,z);result.group.add(m);return m;};
 for(const x of [680,940])for(const z of [-1920,-1700]){part(new T.CylinderGeometry(39,39,12,12),0,x,159,z).rotation.z=Math.PI/2;part(new T.CylinderGeometry(9,9,17,10),2,x,159,z).rotation.z=Math.PI/2;for(let j=0;j<6;j++){const a=j*Math.PI/3;const m=part(new T.BoxGeometry(15,4,64),1,x,159,z);m.rotation.x=a;}}
 for(const side of [-1,1]){for(let j=0;j<9;j++){const m=part(new T.TorusGeometry(12,3,5,12),0,side*466,800-j*44,-5170);m.scale.y=1.55;m.rotation.y=j%2*Math.PI/2;}part(new T.CylinderGeometry(17,34,46,12,1,true),2,side*350,402,-2710);part(new T.TorusGeometry(33,4,5,12),2,side*350,378,-2710).rotation.x=Math.PI/2;part(new T.SphereGeometry(7,8,6),0,side*350,375,-2710);}
 const previous=result.group.userData.dispose;result.group.userData.dispose=()=>{previous?.();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();};
 result.counts.name='Castle Gates';return result;
}
