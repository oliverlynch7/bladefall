/* A local landmark, not a Hollow Gate: clear blue crystal, open gold orbits. */
export function buildWaystone(T,owned,gild){
 const group=new T.Group();group.name='Waystone · Astral Crystal';group.position.set(0,0,30);
 const mat=(color,emissive=0)=>{const m=new T.MeshPhongMaterial({color,emissive,shininess:95,flatShading:true});owned.push(m);return m};
 const stone=mat(0x313a55),gold=mat(gild?0xffd576:0xa88954),blue=mat(0x70cfe9,0x144d79),light=new T.MeshBasicMaterial({color:gild?0xffe4a0:0xb8f9ff});owned.push(light);
 const mesh=(geo,material,x=0,y=0,z=0,parent=group)=>{owned.push(geo);const m=new T.Mesh(geo,material);m.position.set(x,y,z);parent.add(m);return m};
 // Grounded footprint stays inside the existing 76-unit collider.
 for(const [r,h,y,m] of [[37,7,4,stone],[33,3,9,gold],[29,10,15,stone],[30,2,21,gold]])mesh(new T.CylinderGeometry(r,r+1,h,8),m,0,y);
 const torus=(r,tube,y,material,parent=group)=>{const m=mesh(new T.TorusGeometry(r,tube,6,64),material,0,y,0,parent);m.rotation.x=Math.PI/2;return m};
 torus(34,1,8,light);torus(26,1,23,light);
 // Hexagonal prism with unequal tips and a bevel belt: readable facets at gameplay distance.
 function crystal(r,h){const points=[],rings=[[-h*.5,0],[-h*.23,r*.8],[h*.13,r],[h*.3,r*.7],[h*.5,0]];
 for(let j=0;j<rings.length-1;j++)for(let k=0;k<6;k++){const a=k*Math.PI/3,b=(k+1)*Math.PI/3,[y0,r0]=rings[j],[y1,r1]=rings[j+1];const v=[[Math.cos(a)*r0,y0,Math.sin(a)*r0],[Math.cos(b)*r0,y0,Math.sin(b)*r0],[Math.cos(a)*r1,y1,Math.sin(a)*r1],[Math.cos(b)*r1,y1,Math.sin(b)*r1]];for(const i of [0,2,1,2,3,1])points.push(...v[i]);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.computeVertexNormals();return g;}
 const floating=new T.Group();floating.position.y=119;group.add(floating);
 const core=mesh(crystal(24,132),blue,0,0,0,floating);core.rotation.z=.09;
 // Thin luminous facet seams, rather than an opaque glow shell.
 const edges=new T.EdgesGeometry(core.geometry,20);owned.push(edges);const edgeMat=new T.LineBasicMaterial({color:0xc4fbff,transparent:true,opacity:.5});owned.push(edgeMat);const seams=new T.LineSegments(edges,edgeMat);core.add(seams);
 const heart=mesh(crystal(9,45),light,0,0,0,floating);heart.position.z=15;
 const orbit=new T.Group();orbit.position.y=113;group.add(orbit);
 for(let i=0;i<6;i++){const a=i*Math.PI/3;const shard=mesh(crystal(6,29+(i%2)*12),blue,Math.cos(a)*44,Math.sin(a*2)*14,Math.sin(a)*44,orbit);shard.rotation.z=.2*Math.sin(a);}
 const rings=[];
 for(let i=0;i<2;i++){const g=new T.Group();g.position.y=110+i*14;g.rotation.set(.48+i*.85,0,.3-i*.7);group.add(g);torus(52+i*6,.8,0,gold,g);rings.push(g);for(let k=0;k<8;k++){const a=k*Math.PI/4;const rune=mesh(new T.OctahedronGeometry(1.8),light,Math.cos(a)*(52+i*6),0,Math.sin(a)*(52+i*6),g);}}
 // Engraved radial marks and six restrained crown prongs.
 for(let i=0;i<8;i++){const a=i*Math.PI/4;const rune=mesh(new T.BoxGeometry(2,.5,6),light,Math.sin(a)*30,22.5,Math.cos(a)*30);rune.rotation.y=a;}
 for(let i=0;i<6;i++){const a=i*Math.PI/3;const prong=mesh(new T.ConeGeometry(3.5,29,5),gold,Math.cos(a)*25,34,Math.sin(a)*25);prong.rotation.z=-.22*Math.cos(a);}
 const positions=new Float32Array(32*3);for(let i=0;i<32;i++){const a=i*2.399;positions[i*3]=Math.cos(a)*(29+i%5*5);positions[i*3+1]=35+i*4.8;positions[i*3+2]=Math.sin(a)*(29+i%5*5)}
 const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(positions,3));const pm=new T.PointsMaterial({color:0x9febff,size:2,transparent:true,opacity:.65,depthWrite:false});owned.push(pg,pm);const motes=new T.Points(pg,pm);group.add(motes);
 group.userData.waystone={floating,orbit,rings,motes};return group;
}
export function animateWaystone(group,time,prefs){const a=group?.userData.waystone;if(!a)return;const t=prefs.reduceMotion?0:time;a.floating.position.y=119+Math.sin(t*.8)*3;a.floating.rotation.y=t*.12;a.orbit.rotation.y=-t*.1;a.rings[0].rotation.y=t*.08;a.rings[1].rotation.y=-t*.06;a.motes.rotation.y=t*.07;a.motes.visible=prefs.particles!==false&&prefs.quality!=='low';}
