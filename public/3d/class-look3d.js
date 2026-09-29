import * as T from './three.module.js';
// Small bone-attached ornaments, bounded geometry, no lights or combat particles.
const records=new WeakMap();
export function clearClassLook(root){const r=records.get(root);if(!r)return;for(const g of r.groups){g.removeFromParent();g.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});}records.delete(root);}
export function syncClassLook(root,cls,tier,M,time=0,motion=true){
 if(!root)return;let r=records.get(root);const key=cls+':'+tier;
 if(r?.key!==key){clearClassLook(root);const leftovers=[];root.traverse(o=>{if(o.userData.classLookRoot)leftovers.push(o);});leftovers.forEach(o=>o.removeFromParent());
 r={key,groups:[],moving:[],meshes:0};records.set(root,r);if(!tier||!M)return;
 const palette=window.BFClassLooks?.palette(cls,tier);if(!palette)return;
 const group=(head=false)=>{const g=new T.Group();g.name='Class detail '+cls;g.userData.classLookRoot=true;
 const parent=head?M.head:(root.getObjectByName('Body')||root);root.updateMatrixWorld(true);
 const q=new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(M.RIGHT,M.UP,M.FWD));
 const wq=M.head.getWorldQuaternion(new T.Quaternion()).multiply(q);g.position.copy(parent.worldToLocal(M.head.localToWorld(M.centre.clone())));g.quaternion.copy(parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(wq));g.scale.set(M.w,M.h,M.d);parent.add(g);r.groups.push(g);return g;};
 const body=group(),head=group(true),color=palette.metal,glow=cls==='necromancer'?'#6dffb1':cls==='mage'?'#b995ff':cls==='pyromancer'?'#ff7731':cls==='stormcaller'?'#b6e8ff':cls==='paladin'?'#ffe39a':palette.metal;
 const mesh=(g,geo,x,y,z,sx,sy,sz,c=color,em=false)=>{const mat=new T.MeshStandardMaterial({color:c,metalness:em?.1:.55,roughness:.42,emissive:em?c:'#000000',emissiveIntensity:em?.7:0});const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.userData.classLookPart=true;m.frustumCulled=false;g.add(m);r.meshes++;return m;};
 const gem=(g,x,y,z,s,c=glow)=>mesh(g,new T.OctahedronGeometry(1),x,y,z,s,s,s,c,true);
 const plate=(g,x,y,z,sx,sy,sz,c=color)=>mesh(g,new T.BoxGeometry(1,1,1),x,y,z,sx,sy,sz,c);
 const spike=(g,x,y,z,sx,sy,c=color)=>mesh(g,new T.ConeGeometry(1,1,5),x,y,z,sx,sy,sx,c);
 const ring=(g,x,y,z,rad,c=color)=>mesh(g,new T.TorusGeometry(rad,.035,4,24),x,y,z,1,1,1,c);
 const animate=(m,type,speed=1)=>r.moving.push({m,type,speed,y:m.position.y,z:m.rotation.z});
 const shoulders=(style,count=tier+1)=>{for(const s of [-1,1])for(let i=0;i<count;i++){let m;
 if(style==='feather'){m=spike(body,s*(.6+i*.12),-.72-i*.10,-.1,.12,.5+i*.07);m.rotation.z=-s*(.5+i*.13);}
 else if(style==='petal'){m=gem(body,s*(.55+i*.12),-.77,-.04,.15,color);m.scale.y*=1.8;}
 else{m=plate(body,s*(.53+i*.12),-.7-i*.06,0,.28,.15,.65);m.rotation.z=s*.23;}
 }};
 if(cls==='mage'){ring(body,0,-.65,.3,.32);if(tier===2){const sky=group(true);sky.position.addScaledVector(new T.Vector3(0,1,0),0);const orbit=ring(sky,0,.84,0,.62,glow);orbit.rotation.x=1.2;animate(orbit,'spin',.28);for(let i=0;i<5;i++){const star=gem(sky,Math.cos(i*1.256)*.68,.85,Math.sin(i*1.256)*.68,.065);animate(star,'star',i*1.256);} }else{for(const x of [-.35,0,.35])gem(body,x,-.65,.39,.1);}}
 else if(cls==='warrior'){shoulders('plate');for(let i=0;i<(tier===2?6:3);i++)plate(head,0,.6+i*.025,(i-2)*.12,.13,.20,.13,palette.cloth);}
 else if(cls==='ranger'){shoulders('feather',tier===2?5:3);gem(body,0,-.7,.4,.1,'#d4b666');}
 else if(cls==='paladin'){shoulders('plate');const disk=ring(body,0,-.85,.48,.20);for(let i=0;i<8;i++){const a=i*Math.PI/4,m=spike(body,Math.sin(a)*.3,-.85+Math.cos(a)*.3,.48,.05,.16,glow);m.rotation.z=-a;}if(tier===2)for(const s of [-1,1])for(let i=0;i<4;i++){const m=spike(body,s*(.58+i*.12),-.58,-.05,.07,.45-i*.06,glow);m.rotation.z=-s*.4;}}
 else if(cls==='reaper'||cls==='necromancer'){for(const s of [-1,1])for(let i=0;i<3;i++){const m=plate(body,s*(.28+i*.12),-.72-i*.17,.35,.32,.07,.1);m.rotation.z=s*.6;}if(tier===2)for(const s of [-1,1]){const stone=gem(body,s*.67,-1.18,.28,.13,cls==='reaper'?'#d4badc':glow);ring(body,s*.67,-1.1,.28,.18);animate(stone,'float',s);}}
 else if(cls==='ninja'){shoulders('plate');if(tier===2){for(const s of [-1,1]){const ear=spike(head,s*.32,.65,0,.16,.40);ear.rotation.z=-s*.25;const blade=plate(body,0,-1,-.58,.10,1.1,.08);blade.rotation.z=s*.65;}}}
 else if(cls==='berserker'){shoulders('plate');for(const s of [-1,1])for(let i=0;i<tier+1;i++){const m=spike(body,s*(.6+i*.12),-.53-i*.04,0,.12,.4+(tier===2?.22:0));m.rotation.z=-s*.45;}}
 else if(cls==='pirate'){shoulders('plate');const c=ring(body,0,-.91,.48,.16);gem(body,0,-.91,.49,.1,'#9ee1d0');if(tier===2){plate(head,0,.45,0,.98,.17,.6,palette.cloth);spike(head,.27,.65,-.05,.10,.4);for(let i=0;i<5;i++)ring(body,.49,-.92-i*.1,.28,.055);}}
 else if(cls==='chronomancer'){const dial=ring(body,0,-.9,.48,.25);const hand=plate(body,0,-.9,.5,.035,.4,.04);animate(hand,'spin',.25);for(const s of [-1,1]){const gear=ring(body,s*.61,-.7,0,.18);if(tier===2){animate(gear,'spin',s*.4);for(let i=0;i<8;i++){const tooth=plate(gear,Math.sin(i*.785)*.19,Math.cos(i*.785)*.19,0,.075,.075,.07);}}}}
 else if(cls==='monk'){for(let i=0;i<10;i++){const a=i*Math.PI/9;gem(body,Math.cos(a)*.38,-.67-Math.sin(a)*.32,.4,.055,tier===2?'#dc9d3d':'#5cb79d');}if(tier===2)shoulders('petal',3);}
 else if(cls==='stormcaller'){shoulders('feather');if(tier===2){for(let i=0;i<5;i++){const m=spike(head,(i-2)*.14,.6+(.2-Math.abs(i-2)*.05),0,.065,.4,glow);}for(const s of [-1,1]){const a=gem(body,s*.68,-.58,.1,.13);animate(a,'pulse',s);}}}
 else if(cls==='warlock'){gem(body,0,-.85,.5,.18,glow);if(tier===2){for(const s of [-1,1]){const horn=spike(head,s*.43,.58,-.1,.13,.6);horn.rotation.z=-s*.45;const seal=ring(body,s*.63,-.7,.12,.2,glow);animate(seal,'pulse',s);}}else shoulders('petal',2);}
 else if(cls==='skylancer'){shoulders('feather',tier===2?6:3);}
 else if(cls==='bladedancer'){shoulders('feather',tier===2?4:2);gem(body,0,-.84,.45,.1);if(tier===2)for(const s of [-1,1]){const ribbon=plate(body,s*.38,-1.65,.1,.14,.7,.035,palette.cloth);animate(ribbon,'sway',s);}}
 else if(cls==='beastmaster'){for(const s of [-1,1]){const horn=spike(body,s*.66,-.55,0,.12,tier===2?.6:.3);horn.rotation.z=-s*.5;if(tier===2)for(let i=0;i<3;i++){const twig=spike(body,s*(.63+i*.12),-.45+i*.09,0,.055,.25);twig.rotation.z=-s*.9;}}for(let i=0;i<5;i++)spike(body,(i-2)*.13,-.89,.43,.045,.18);}
 else if(cls==='pyromancer'){shoulders('plate');for(const s of [-1,1])for(let i=0;i<3;i++){plate(body,s*(.48+i*.10),-.67,.35,.035,.2,.03,glow);if(tier===2){const f=gem(body,s*(.56+i*.10),-.42+i*.03,0,.09);f.scale.y*=2.8;animate(f,'flame',i+s);}}}
 }
 for(const a of r.moving){const t=motion?time:0;if(a.type==='spin')a.m.rotation.z=a.z+t*a.speed;else if(a.type==='star'){a.m.position.x=Math.cos(t*.4+a.speed)*.68;a.m.position.z=Math.sin(t*.4+a.speed)*.68;}else if(a.type==='float'||a.type==='flame')a.m.position.y=a.y+Math.sin(t*2+a.speed)*.05;else if(a.type==='sway')a.m.rotation.z=a.z+Math.sin(t*1.3+a.speed)*.15;else if(a.type==='pulse')a.m.material.emissiveIntensity=.45+(motion?Math.sin(t*2+a.speed)*.2:0);}
 return {key,meshes:r.meshes,animated:r.moving.length};
}
