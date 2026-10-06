import * as T from './three.module.js';
// Purchased landmarks: owned geometry/materials are disposed by the hub's existing lifecycle.
export function buildHubUpgrades(root,owned,flags,lamps){
 const group=new T.Group();group.name='Purchased Waystation upgrades';root.add(group);const flames=[],banners=[];const materials=new Map();
 const mat=(c,glow=false)=>{const key=c+glow;if(!materials.has(key)){const m=glow?new T.MeshBasicMaterial({color:c}):new T.MeshStandardMaterial({color:c,roughness:.55,metalness:c==='#bc9453'?.65:.12});materials.set(key,m);owned.push(m);}return materials.get(key);};
 const mesh=(geo,c,x,y,z,parent=group,glow=false)=>{owned.push(geo);const m=new T.Mesh(geo,mat(c,glow));m.position.set(x,y,z);m.receiveShadow=true;parent.add(m);return m;};
 const box=(x,y,z,w,h,d,c,parent)=>mesh(new T.BoxGeometry(w,h,d),c,x,y,z,parent);
 const ring=(x,y,z,r,t,c,parent)=>{const m=mesh(new T.TorusGeometry(r,t,6,24),c,x,y,z,parent);m.rotation.x=Math.PI/2;return m;};
 if(flags.braziers)for(const [i,p]of BFHubUpgradeLayout.braziers.entries()){
  const b=new T.Group();b.name='Relit brazier '+i;b.position.set(p.x,0,p.z);group.add(b);
  mesh(new T.CylinderGeometry(29,33,9,8),'#59616a',0,5,0,b);mesh(new T.CylinderGeometry(23,27,5,8),'#bc9453',0,12,0,b);
  mesh(new T.CylinderGeometry(15,20,35,8),'#34434c',0,31,0,b);ring(0,19,0,18,2,'#bc9453',b);ring(0,46,0,18,2,'#bc9453',b);
  const profile=[[0,0],[13,0],[22,5],[29,16],[29,20],[25,20],[20,8],[0,5]].map(([x,y])=>new T.Vector2(x,y));mesh(new T.LatheGeometry(profile,16),'#34434c',0,49,0,b);ring(0,69,0,28,2,'#bc9453',b);
  for(let j=0;j<6;j++){const a=j*Math.PI/3;mesh(new T.ConeGeometry(2.5,17,5),'#bc9453',Math.cos(a)*26,75,Math.sin(a)*26,b);}
  const fire=new T.Group();fire.position.y=65;b.add(fire);for(let j=0;j<5;j++){const a=j*2.4;const m=mesh(new T.ConeGeometry(j?6:12,j?24:39,7),'#ff7e25',j?Math.cos(a)*11:0,15,j?Math.sin(a)*11:0,fire,true);m.rotation.z=Math.sin(a)*.15;}mesh(new T.ConeGeometry(7,26,7),'#ffe6a0',0,11,2,fire,true);flames.push({fire,phase:i*1.9});lamps.push(new T.Vector3(p.x,88,p.z));
 }
 if(flags.banners)for(const [i,p]of BFHubUpgradeLayout.banners.entries()){
  const b=new T.Group();b.name='War banner '+i;b.position.set(p.x,0,p.z);b.rotation.y=p.x<0?Math.PI/2:-Math.PI/2;group.add(b);
  box(0,113,0,12,226,12,'#34434c',b);mesh(new T.CylinderGeometry(20,25,12,8),'#59616a',0,6,0,b);mesh(new T.OctahedronGeometry(10),'#bc9453',0,239,0,b);box(0,223,0,100,6,8,'#bc9453',b);
  const c=document.createElement('canvas');c.width=256;c.height=512;const ctx=c.getContext('2d');ctx.fillStyle=i%2?'#263d63':'#752f36';ctx.fillRect(0,0,256,512);ctx.strokeStyle='#e8bd65';ctx.lineWidth=12;ctx.strokeRect(13,12,230,487);ctx.fillStyle='#f4dba0';ctx.beginPath();ctx.moveTo(128,78);ctx.lineTo(153,137);ctx.lineTo(138,297);ctx.lineTo(177,297);ctx.lineTo(177,315);ctx.lineTo(138,315);ctx.lineTo(138,365);ctx.lineTo(118,365);ctx.lineTo(118,315);ctx.lineTo(79,315);ctx.lineTo(79,297);ctx.lineTo(118,297);ctx.lineTo(103,137);ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(128,214,68,0,Math.PI*2);ctx.lineWidth=5;ctx.stroke();
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const material=new T.MeshStandardMaterial({map:tex,side:T.DoubleSide,roughness:.9});owned.push(tex,material);const geo=new T.PlaneGeometry(86,144,8,12);owned.push(geo);const cloth=new T.Mesh(geo,material);cloth.position.set(0,148,9);b.add(cloth);banners.push({cloth,phase:i});
  for(const dx of [-43,43]){box(dx,75,9,5,8,5,'#bc9453',b);mesh(new T.ConeGeometry(4,12,5),'#bc9453',dx,66,9,b);}
 }
 if(flags.ramparts){
  const wall=new T.Group();wall.name='Restored north ramparts';group.add(wall);
  for(let x=-900;x<=900;x+=50){box(x,229,-641,49,26,32,'#929b9b',wall);box(x,246,-641,50,8,39,'#d4c6a0',wall);if((x+900)%100===0){box(x,267,-641,30,34,32,'#aeb5b2',wall);box(x,286,-641,35,5,37,'#d4c6a0',wall);}}
  for(const x of [-900,-600,-400,-200,0,200,400,600,900]){box(x,86,-641,25,132,36,'#737e87',wall);box(x,144,-621,33,10,8,'#bc9453',wall);}
 }
 group.userData.tick=(t,prefs)=>{const time=prefs.reduceMotion?0:t;for(const {fire,phase}of flames){fire.scale.y=1+Math.sin(time*5+phase)*.08;fire.rotation.y=time*.2+phase;}for(const {cloth,phase}of banners){const a=cloth.geometry.attributes.position;for(let i=0;i<a.count;i++){const y=a.getY(i);a.setZ(i,Math.sin(time*1.4+a.getX(i)*.04+phase)*(72-y)/144*3);}a.needsUpdate=true;cloth.geometry.computeVertexNormals();}};
 group.userData.counts={braziers:flags.braziers?4:0,banners:flags.banners?4:0,ramparts:!!flags.ramparts,gilded:!!flags.gild};return group;
}
