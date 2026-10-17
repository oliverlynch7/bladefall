import * as T from './three.module.js';
// A cached, shared prop model; no per-frame geometry or texture creation.
export function makeStrawDummy(){
 const scene=new T.Group();scene.name='Hay Training Dummy';
 const wood=new T.MeshLambertMaterial({color:'#77512e'}),hay=new T.MeshLambertMaterial({color:'#c9a34c'}),light=new T.MeshLambertMaterial({color:'#e6c875'}),cloth=new T.MeshLambertMaterial({color:'#b99864'}),rope=new T.MeshLambertMaterial({color:'#72573a'});
 const add=(geo,mat,x,y,z,rz=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.z=rz;scene.add(m);return m;};
 add(new T.CylinderGeometry(.045,.065,.92,8),wood,0,.46,0);
 for(const s of [-1,1])add(new T.BoxGeometry(.54,.055,.09),wood,0,.04,0,s*.48);
 add(new T.CapsuleGeometry(.16,.28,4,10),hay,0,.58,0);
 add(new T.BoxGeometry(.86,.055,.065),wood,0,.71,0);
 for(const s of [-1,1]){add(new T.CapsuleGeometry(.064,.15,3,7),hay,s*.32,.69,0,Math.PI/2);add(new T.TorusGeometry(.07,.012,4,10),rope,s*.35,.69,0).rotation.y=Math.PI/2;}
 add(new T.SphereGeometry(.115,10,7),cloth,0,.96,0);
 add(new T.ConeGeometry(.19,.11,10),hay,0,1.065,0);
 for(const x of [-.038,.038])add(new T.BoxGeometry(.023,.018,.012),wood,x,.977,.105);
 add(new T.BoxGeometry(.052,.008,.008),wood,0,.93,.109,-.12);
 for(const y of [.45,.74]){const r=add(new T.TorusGeometry(.164,.013,4,14),rope,0,y,0);r.rotation.x=Math.PI/2;}
 // Straw tufts with attached roots, not floating rings around the target.
 const sprig=new T.ConeGeometry(.012,.16,3);
 for(let i=0;i<32;i++){const a=i*2.399963,rr=i%3===0?.15:.12,y=.36+(i%9)*.046;add(sprig,i%2?hay:light,Math.cos(a)*rr,y,Math.sin(a)*rr,(i%5-2)*.12);}
 const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e6d4ac';ctx.fillRect(0,0,128,128);
 for(const [r,col]of [[58,'#473d32'],[49,'#e4d0a1'],[38,'#473d32'],[28,'#e4d0a1'],[15,'#b34d39']]){ctx.fillStyle=col;ctx.beginPath();ctx.arc(64,64,r,0,Math.PI*2);ctx.fill();}
 const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const target=add(new T.CircleGeometry(.125,24),new T.MeshLambertMaterial({map}),0,.6,.17);target.name='Painted archery target';
 scene.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(scene),size=bounds.getSize(new T.Vector3());
 return {scene,animations:[],_nativeH:size.y,_baseY:bounds.min.y,_nativeX:size.x,_nativeZ:size.z,_nativeW:Math.max(size.x,size.z)};
}
