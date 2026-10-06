import * as T from './three.module.js';
const templates=new Map(),colors=['#999fa8','#55bd74','#4b9aef','#b46bed','#f3bd48'];
function template(tier){
 const root=new T.Group(),lid=new T.Group();lid.name='hinged-lid';root.add(lid);lid.position.set(0,17,-11);
 const mats={wood:new T.MeshStandardMaterial({color:['#694b36','#244d38','#243e68','#42275a','#704719'][tier],roughness:.7}),metal:new T.MeshStandardMaterial({color:colors[tier],roughness:.3,metalness:.6}),dark:new T.MeshStandardMaterial({color:'#171c25',roughness:.8}),gold:new T.MeshStandardMaterial({color:tier===4?'#fff0ab':'#d6b878',metalness:.7,roughness:.3}),gem:new T.MeshStandardMaterial({color:colors[tier],emissive:colors[tier],emissiveIntensity:.65,roughness:.15,metalness:.3})};
 const mesh=(g,m,x,y,z,parent=root)=>{const o=new T.Mesh(g,mats[m]);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const box=(x,y,z,w,h,d,m,parent)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent);
 // A hollow wooden coffer: the open model has a real interior, not a solid block.
 box(0,2,0,32,4,24,'dark');for(const x of [-15,15])box(x,10,0,2,16,24,'wood');for(const z of [-11,11])box(0,10,z,28,16,2,'wood');
 for(const y of [4,17]){box(0,y,12.1,33,1.5,1.4,'metal');box(0,y,-12.1,33,1.5,1.4,'metal');for(const x of [-16,16])box(x,y,0,1.4,1.5,24,'metal');}
 for(const x of [-12,12]){box(x,10,12.2,2.4,15,1.2,'metal');box(x,10,-12.2,2.4,15,1.2,'metal');for(const y of [5,10,15])mesh(new T.SphereGeometry(.7,6,4),'gold',x,y,13);}
 // Curved lid planks around a hinge at the back edge; all fittings travel with it.
 for(let j=0;j<10;j++){const a=(j+.5)*Math.PI/10;const p=box(0,Math.sin(a)*7,11+Math.cos(a)*11,32,1.5,3.5,'wood',lid);p.rotation.x=a-Math.PI/2;
  for(const x of [-12,12]){const b=box(x,Math.sin(a)*7+.7,11+Math.cos(a)*11,2.5,1.1,3.6,'metal',lid);b.rotation.x=a-Math.PI/2;}}
 for(const x of [-16,16]){const g=new T.Shape();g.moveTo(-11,0);for(let j=0;j<=12;j++){const a=Math.PI-j*Math.PI/12;g.lineTo(Math.cos(a)*11,Math.sin(a)*7);}g.closePath();const cap=mesh(new T.ShapeGeometry(g),'metal',x,0,11,lid);cap.rotation.y=Math.PI/2;cap.material=mats.metal.clone();cap.material.side=T.DoubleSide;}
 box(0,14,13,5,7,2,'metal');box(0,14,14.2,1.2,2.5,.6,'dark');
 for(const x of [-13,13])for(const z of [-9,9])box(x,0,z,5,3,5,'metal');
 if(tier>=1)for(const x of [-17,17]){const h=mesh(new T.TorusGeometry(3,.7,5,12),'metal',x,11,0);h.rotation.y=Math.PI/2;}
 if(tier>=2){mesh(new T.OctahedronGeometry(3),'gem',0,6,11,lid);for(const x of [-8,8]){const d=box(x,6,11,6,.8,6,'gold',lid);d.rotation.y=Math.PI/4;}for(const x of [-13,13])for(const z of [-9,9])mesh(new T.SphereGeometry(2,8,6),'gold',x,1,z);}
 if(tier>=3){for(const x of [-16,16])for(const z of [1,21])mesh(new T.ConeGeometry(2,5,5),'gold',x,3,z,lid);for(const x of [-6,6]){const r=mesh(new T.TorusGeometry(3,.6,5,16),'gold',x,10,12.8);r.rotation.z=.4;}}
 if(tier===4){mesh(new T.OctahedronGeometry(4),'gem',0,10,11,lid);for(let i=0;i<5;i++){const x=(i-2)*3;mesh(new T.ConeGeometry(1.3,4+3*(2-Math.abs(i-2)),5),'gold',x,10,11,lid);}for(const z of [-6,6])for(const x of [-17,17]){const d=box(x,10,z,1.2,6,6,'gold');d.rotation.x=Math.PI/4;}}
 root.scale.setScalar(1+tier*.13);return root;
}
export function createChestActor(rarity){const tier=Math.max(0,['common','uncommon','rare','epic','legendary'].indexOf(rarity));if(!templates.has(tier))templates.set(tier,template(tier));const root=templates.get(tier).clone(true);root.name=rarity+' treasure chest';return {root,lid:root.getObjectByName('hinged-lid'),tier,opening:0};}
export function animateChest(rec,ch,dt){rec.opening=ch.opened?Math.min(1,rec.opening+Math.min(.1,Math.max(0,dt))/.65):0;const a=rec.opening;rec.lid.rotation.x=-1.85*(1-Math.pow(1-a,3))-(ch.opened?0:(ch._br||0)*.045);rec.root.position.set(ch.x+(ch._shove||0),ch.y||0,ch.z);}
