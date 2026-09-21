import * as T from './three.module.js';

// Shared low-poly geometry; no textures, lights or per-frame geometry allocations.
const crystal=new T.OctahedronGeometry(1,0);
const ring=new T.TorusGeometry(24,.55,4,32);
const purple=new T.MeshStandardMaterial({color:0x914bd5,emissive:0x4d137d,emissiveIntensity:.32,roughness:.3,metalness:.18,flatShading:true});
const pale=new T.MeshStandardMaterial({color:0xd9b1fa,emissive:0x7331a8,emissiveIntensity:.22,roughness:.35,metalness:.1,flatShading:true});
const grey=new T.MeshStandardMaterial({color:0x8d8696,roughness:.7,metalness:.05,flatShading:true});
const records=new Map();let group;
function make(){
 const root=new T.Group(),body=new T.Mesh(crystal,purple);body.scale.set(15,28,12);body.rotation.z=.15;root.add(body);
 const halo=new T.Mesh(ring,pale);halo.rotation.x=1.2;root.add(halo);
 const chips=[];for(let i=0;i<3;i++){const chip=new T.Mesh(crystal,pale);chip.scale.set(3.5,8,3);root.add(chip);chips.push(chip);}
 return {root,body,halo,chips};
}
export function syncRiftShards(scene){
 const b=window.__BF3,g=b?.G;if(!g)return;
 if(!group){group=new T.Group();group.name='Rift Shards';}if(group.parent!==scene)scene.add(group);
 const pending=window.BFRiftShards.pending(g.pendingRiftShards),seen=new Set(),t=g.time||0;
 const sites=b.worldRiftShards().filter(o=>!pending.found.includes(o.id)&&!pending.echoes.includes(o.id));
 const reveal=g.riftReveal,age=reveal?t-reveal.start:99;
 if(reveal&&age<1.1)sites.push({...reveal,id:'pickup',y:reveal.y+age*50,shrink:1-age*.72});
 for(const o of sites){seen.add(o.id);let r=records.get(o.id);if(!r){r=make();records.set(o.id,r);group.add(r.root);}
  const spent=b.meta.riftShards.includes(o.id);r.body.material=spent?grey:purple;r.halo.material=spent?grey:pale;
  r.root.position.set(o.x,(o.y||0)+35+Math.sin(t*2)*3,o.z);r.root.rotation.y=t*.6;r.root.scale.setScalar(o.shrink||1);
  r.halo.rotation.z=t*.3;
  r.chips.forEach((chip,i)=>{const a=t*.45+i*Math.PI*2/3;chip.material=spent?grey:pale;chip.position.set(Math.cos(a)*25,Math.sin(a*2)*8,Math.sin(a)*25);chip.rotation.set(.25,a,.4);});
 }
 for(const [id,r]of records)if(!seen.has(id)){r.root.removeFromParent();records.delete(id);}
 window.__riftShard3dDrawn=seen;
}
