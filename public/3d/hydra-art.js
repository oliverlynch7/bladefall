import * as T from './three.module.js';
// Segmented sea-serpent necks, plated jaws and visible iron restraints. No enemy corpse.
export function createHydra(parent){
 const root=new T.Group();parent.add(root);const geos=[],mats=[],parts=[],necks=[];
 const mat=c=>{const m=new T.MeshStandardMaterial({color:c,roughness:.75,metalness:c==='#829997'?.6:0,flatShading:true});mats.push(m);return m;};
 const skin=mat('#346a6c'),belly=mat('#91b1a2'),ridge=mat('#193e4a'),iron=mat('#829997'),eye=mat('#e3ca76'),tooth=mat('#d9d2aa');
 const make=(g,m,p=root)=>{geos.push(g);const o=new T.Mesh(g,m);p.add(o);return o;};
 const ell=(x,y,z,a,b,c,m,p=root)=>{const o=make(new T.IcosahedronGeometry(1,1),m,p);o.position.set(x,y,z);o.scale.set(a,b,c);return o;};
 ell(0,-50,-940,360,220,540,skin);for(let i=0;i<8;i++){const fin=make(new T.ConeGeometry(45,140,4),ridge);fin.position.set(0,110-i*9,-650-i*95);fin.rotation.x=-.35;}
 for(let i=0;i<3;i++){const g=new T.Group();root.add(g);const segs=[];for(let j=0;j<10;j++)segs.push(make(new T.CylinderGeometry(43-j*1.1,48-j*1.1,1,9),skin,g));
 const head=new T.Group();g.add(head);ell(0,10,0,73,57,100,skin,head);ell(0,-20,60,59,25,85,belly,head);ell(0,5,72,63,26,85,skin,head);
 for(const s of [-1,1]){ell(s*59,27,36,9,6,16,eye,head);ell(s*66,38,-8,21,16,45,ridge,head);const horn=make(new T.ConeGeometry(16,85,5),tooth,head);horn.position.set(s*44,66,-35);horn.rotation.z=-s*.35;for(let j=0;j<4;j++){const t=make(new T.ConeGeometry(6,25,4),tooth,head);t.rotation.x=Math.PI;t.position.set(s*43,-14,48+j*23);}}
 const cuff=make(new T.TorusGeometry(59,10,6,12),iron,g);cuff.material=iron.clone();mats.push(cuff.material);cuff.rotation.x=Math.PI/2;const links=[];for(let j=0;j<10;j++){const l=make(new T.TorusGeometry(15,4,5,8),iron,g);links.push(l);}
 necks.push({g,segs,head,cuff,links});}
 const jet=make(new T.CylinderGeometry(1,1,1,8),new T.MeshBasicMaterial({color:0x9adee9,transparent:true,opacity:.78,depthWrite:false}));mats.push(jet.material);jet.name='Hydra water jet';jet.visible=false;
 function update(G){const h=G.hydraArena;if(!h)return;const t=h.elapsed;jet.visible=h.state==='strike'&&h.kind==='blast'&&!h.freed;if(jet.visible){const a=window.BFHydra.heads[h.head],dir=new T.Vector3(h.x-a.x,0,h.z-a.z).normalize();let len=2200;for(let d=20;d<2200;d+=20)if(window.BFHydra.blocked({x:a.x+dir.x*d,z:a.z+dir.z*d},a)){len=d;break;}const start=new T.Vector3(a.x,180,a.z),end=start.clone().addScaledVector(dir,len);jet.position.copy(start.add(end).multiplyScalar(.5));jet.scale.set(50,len,50);jet.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir);}
 root.position.z=-h.retreat*2100;root.position.y=-h.retreat*370;
 necks.forEach((n,i)=>{const anchor=window.BFHydra.heads[i],broken=(h.broken||[]).includes(i);
 let x=anchor.x,y=broken?320:215,z=anchor.z-35;const active=h.head===i&&!h.freed;
 if(active&&h.state==='wind'){y+=Math.sin(Math.min(1,(2-h.clock)/2)*Math.PI/2)*120;}
 if(active&&h.state==='strike'&&h.kind==='sweep'){x=Math.sin((.45-h.clock)/.45*Math.PI-Math.PI/2)*800;y=190;z=100;}
 if(active&&h.state==='strike'&&h.kind==='bite'){x=h.x;y=h.y+58;z=h.z;}
 y+=Math.sin(t*1.6+i*2)*9;n.head.position.set(x,y,z);n.head.rotation.y=Math.atan2(h.x-x,h.z-z)*.25;
 const point=u=>new T.Vector3(x*u,20+(y-20)*u+Math.sin(u*Math.PI)*200,-850+(z+850)*u);for(let j=0;j<10;j++){const a=point(j/10),b=point((j+1)/10),d=b.clone().sub(a),m=n.segs[j];m.position.copy(a.add(b).multiplyScalar(.5));m.scale.y=d.length()+5;m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());}
 n.cuff.position.set(x,y-65,z-12);n.cuff.visible=!broken;n.cuff.material.color.set(active&&h.state==='recover'?'#f0efc8':'#829997');for(let j=0;j<10;j++){const u=j/9,l=n.links[j];l.visible=!broken;l.position.set(x+(anchor.x+(i-1)*55-x)*u,y-65+(125-y+65)*u,z-12+(anchor.z+65-z+12)*u+35*Math.sin(u*Math.PI));l.rotation.y=j%2*Math.PI/2;}
 });
 }
 function dispose(){for(const g of geos)g.dispose();for(const m of mats)m.dispose();root.removeFromParent();}
 return {root,update,dispose};
}
