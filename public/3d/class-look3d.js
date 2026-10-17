import * as T from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';
import {createClassAura,syncClassAura} from './class-aura3d.js?v=2209';

// Fittings use inverse bind matrices, not the head's current animated world position.
// Art is cosmetic only. Static pieces are merged by bone/material; no dynamic lights.
const records=new WeakMap(),textures=new Map(),V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const norm=n=>n.replace(/[^a-z]/gi,'').toLowerCase();
const SHIELD=[[-.46,.42],[0,.54],[.46,.42],[.4,-.22],[0,-.54],[-.4,-.22]];
const LEAF=[[0,.58],[.26,.25],[.37,-.12],[.16,-.48],[0,-.56],[-.16,-.48],[-.37,-.12],[-.26,.25]];
const BLADE=[[0,.65],[.27,.1],[.22,-.4],[0,-.52],[-.22,-.4],[-.27,.1]];
function weave(cls,tier){
 const key=cls+':'+tier;if(textures.has(key))return textures.get(key);
 const p=window.BFClassLooks.palette(cls,tier),c=document.createElement('canvas');c.width=256;c.height=512;const x=c.getContext('2d');x.fillStyle=p.cloth;x.fillRect(0,0,256,512);
 for(let i=0;i<256;i++){x.fillStyle=`rgba(0,0,0,${.07+.1*(.5+.5*Math.cos(i*.13))})`;x.fillRect(i,0,1,512);}
 x.fillStyle='#fff';x.globalAlpha=.06;for(let y=1;y<512;y+=4)x.fillRect(0,y,256,1);x.globalAlpha=1;
 x.strokeStyle=p.metal;x.lineWidth=5;x.strokeRect(13,8,230,496);x.lineWidth=1.5;x.strokeRect(22,16,212,480);
 for(let y=30;y<490;y+=18){x.fillStyle=p.metal;x.fillRect(10,y,6,5);x.fillRect(240,y,6,5);}
 const line=pts=>{x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.stroke();};x.lineWidth=3;
 if(cls==='mage'&&tier>=1){for(let i=0;i<45;i++){const a=27+(i*97%200),b=25+(i*131%454),r=i%7===0?3:1.2;x.fillStyle=i%2?'#d8cfff':'#7ccdf2';x.beginPath();x.arc(a,b,r,0,7);x.fill();}line([[61,151],[110,111],[184,176],[127,235],[79,305],[166,359]]);}
 else if(['ranger','beastmaster','skylancer'].includes(cls)){for(let y=110;y<410;y+=76){line([[128,y-32],[128,y+32]]);line([[128,y+14],[91,y-13],[104,y+17],[128,y+29],[154,y+5],[165,y-21],[128,y+14]]);}}
 else if(cls==='pyromancer'){for(let y=100;y<440;y+=105)line([[128,y-42],[104,y+7],[117,y-5],[112,y+32],[139,y+19],[153,y-18],[133,y],[128,y-42]]);}
 else if(cls==='paladin'){for(let y=116;y<420;y+=145){x.beginPath();x.arc(128,y,26,0,7);x.stroke();for(let i=0;i<8;i++){let a=i*Math.PI/4;line([[128+Math.cos(a)*36,y+Math.sin(a)*36],[128+Math.cos(a)*52,y+Math.sin(a)*52]]);}}}
 else if(cls==='chronomancer'){for(let y=115;y<460;y+=147){x.beginPath();x.arc(128,y,42,0,7);x.stroke();line([[105,y-23],[150,y+23],[105,y+23],[150,y-23],[105,y-23]]);}}
 else {
  const glyphs={warrior:[[-34,-23],[-20,25],[0,42],[20,25],[34,-23],[18,-9],[0,-34],[-18,-9],[-34,-23]],reaper:[[-30,-28],[-30,12],[0,35],[30,12],[30,-28],[0,-42],[-30,-28]],necromancer:[[0,-44],[0,43],[-20,24],[20,24],[-24,-14],[24,-14]],ninja:[[0,-44],[9,-10],[36,-31],[17,0],[39,27],[9,12],[0,44],[-9,12],[-39,27],[-17,0],[-36,-31],[-9,-10],[0,-44]],berserker:[[-29,37],[-10,-34],[-19,13],[11,-40],[1,17],[31,-31],[20,37]],pirate:[[-32,12],[-23,31],[0,43],[23,31],[32,12],[18,23],[0,34],[0,-38],[-9,-29],[9,-29]],monk:[[-37,14],[-17,29],[0,36],[17,29],[37,14],[24,-9],[15,12],[0,-36],[-15,12],[-24,-9],[-37,14]],stormcaller:[[7,-44],[-26,6],[-2,2],[-13,43],[29,-15],[7,-10],[7,-44]],warlock:[[-2,-40],[-28,-24],[-37,0],[-27,27],[0,40],[-14,15],[-17,-7],[-2,-40]],bladedancer:[[-38,-27],[-25,27],[0,39],[25,27],[38,-27],[0,28],[-38,-27]]};
  const glyph=glyphs[cls]||[[-28,-32],[28,0],[-28,32],[-28,-32]];
  for(let y=115;y<460;y+=130){line(glyph.map(([a,b])=>[128+a,y+b]));if(cls==='reaper')for(const d of [-1,1])line([[128+d*10,y-19],[128+d*20,y-7],[128+d*9,y+4]]);}
 }
 if(tier===2){x.strokeStyle=p.inlay||p.accent||p.metal;x.lineWidth=1.2;for(let y=32;y<482;y+=23)for(const s of [-1,1])line([[128+s*101,y-9],[128+s*94,y],[128+s*101,y+9],[128+s*107,y],[128+s*101,y-9]]);}
 const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=2;textures.set(key,tex);return tex;
}
export function clearClassLook(root){const r=records.get(root);if(!r)return;r.aura?.dispose();for(const a of r.faceOverrides||[]){a.node.geometry=a.geometry;a.node.material=a.material;}r.groups.forEach(g=>g.removeFromParent());for(const o of r.hidden){o.visible=o.userData.classLookBaseVisibility;delete o.userData.classLookBaseVisibility;}r.geometries.forEach(g=>g.dispose());r.materials.forEach(m=>m.dispose());records.delete(root);}
export function classLookStats(root){const r=records.get(root);return r?{key:r.key,meshes:r.meshes,triangles:r.triangles,animated:r.moving.length,aura:r.aura?.stats||null,anchors:r.groups.map(g=>g.userData.classLookBone)}:{meshes:0,triangles:0,animated:0,aura:null,anchors:[]};}
function build(root,cls,tier){
 const p=window.BFClassLooks?.palette(cls,tier),r={key:cls+':'+tier,groups:[],moving:[],hidden:[],geometries:new Set(),materials:new Set(),meshes:0,triangles:0};records.set(root,r);
 const stale=[];root.traverse(o=>{if(o.userData.classLookBaseVisibility!==undefined){o.visible=o.userData.classLookBaseVisibility;delete o.userData.classLookBaseVisibility;}if(o.userData.classLookRoot)stale.push(o);});stale.forEach(o=>o.removeFromParent());if(!p)return r;root.traverse(o=>{if(o.isMesh&&/^(shoulderpad|armguard)/i.test(o.name)){o.userData.classLookBaseVisibility=o.visible;o.visible=false;r.hidden.push(o);}});
 let skeleton;root.traverse(o=>{if(!skeleton&&o.isSkinnedMesh)skeleton=o.skeleton;});if(!skeleton)return r;
 const bones=new Map(skeleton.bones.map((b,i)=>[norm(b.name),{b,inv:skeleton.boneInverses[i]}])),anchors=new Map();
 function anchor(name){if(anchors.has(name))return anchors.get(name);const e=bones.get(norm(name));if(!e)return null;const pos=V().setFromMatrixPosition(e.inv.clone().invert()),g=new T.Group();g.name='Class fitting · '+name;g.userData.classLookRoot=true;g.userData.classLookBone=name;e.inv.clone().multiply(new T.Matrix4().makeTranslation(pos.x,pos.y,pos.z)).decompose(g.position,g.quaternion,g.scale);e.b.add(g);r.groups.push(g);anchors.set(name,g);return g;}
 const material=(color,metalness=.65,roughness=.36,glow=0,map=null)=>{const m=new T.MeshStandardMaterial({color,metalness,roughness,emissive:glow?color:'#000000',emissiveIntensity:glow,map});r.materials.add(m);return m;};
 const metal=material(p.metal),dark=material(p.leather,.30,.64),enamel=material(p.cloth,.38,.40),ivory=material('#ede0bd',.1,.65),light=material(p.accent||p.metal,.32,.28,tier===2?1.1:.46),cloth=material('#ffffff',0,.94,0,weave(cls,tier));
 // Reference progression: compact starters, ornate Rank 5 and a distinct legendary silhouette.
 const rich=tier===2,body=anchor('Torso'),hips=anchor('Hips'),head=anchor('Head');
 const mesh=(g,geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{if(!g)return null;const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.userData.classLookPart=true;m.frustumCulled=false;g.add(m);return m;};
 const shape=(pts,w,h,d=.025)=>{const s=new T.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x*w,y*h):s.moveTo(x*w,y*h));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:Math.min(.012,w*.055),bevelThickness:.008,curveSegments:2});g.translate(0,0,-d*.5);return g;};
 const plaque=(g,pts,w,h,x,y,z,mat=metal,rz=0)=>mesh(g,shape(pts,w,h),mat,x,y,z,0,0,rz);
 const inset=(g,pts,w,h,x,y,z,mat=enamel,rz=0)=>{plaque(g,pts,w,h,x,y,z,metal,rz);plaque(g,pts,w*.78,h*.77,x,y,z+.025,mat,rz);};
 const gem=(g,x,y,z,s=.08,mat=light)=>{const m=mesh(g,new T.OctahedronGeometry(s,0),mat,x,y,z);m.scale.set(.85,1.3,.55);return m;};
 const bead=(g,x,y,z,s=.027,mat=metal)=>mesh(g,new T.SphereGeometry(s,7,5),mat,x,y,z);
 const ring=(g,x,y,z,rad=.1,mat=metal,rx=0,ry=0)=>mesh(g,new T.TorusGeometry(rad,.014,5,24),mat,x,y,z,rx,ry);
 const tube=(g,pts,rad=.014,mat=metal)=>mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(a=>V(...a))),Math.max(6,pts.length*3),rad,5,false),mat);
 const horn=(g,pts,rad,mat=ivory)=>{const curve=new T.CatmullRomCurve3(pts.map(a=>V(...a))),segments=9,fr=curve.computeFrenetFrames(segments,false),positions=[],uv=[],idx=[];for(let i=0;i<=segments;i++){const pos=curve.getPointAt(i/segments),radius=rad*Math.pow(1-i/segments,.75)+.002;for(let j=0;j<7;j++){const a=j*Math.PI/3,q=pos.clone().addScaledVector(fr.normals[i],Math.cos(a)*radius).addScaledVector(fr.binormals[i],Math.sin(a)*radius);positions.push(q.x,q.y,q.z);uv.push(j/6,i/segments);if(i<segments&&j<6){const k=i*7+j;idx.push(k,k+7,k+1,k+1,k+7,k+8);}}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return mesh(g,geo,mat);};
 const animate=(m,type,speed=1)=>{m.userData.lookAnimated=true;r.moving.push({m,type,speed,base:m.position.clone(),rotation:m.rotation.clone(),scale:m.scale.clone()});return m;};
 const group=(g,x=0,y=0,z=0)=>{const q=new T.Group();q.position.set(x,y,z);g.add(q);return q;};
 function shell(g,s,style=0){const geo=new T.SphereGeometry(1,12,8,0,Math.PI*2,0,Math.PI*.70);geo.scale(.28,.21,.28);geo.rotateZ(-s*.40);mesh(g,geo,enamel,s*.14,.02,0);for(let i=0;i<(rich?3:2);i++){const a=group(g,s*(.08+i*.075),.10-i*.032,0);a.rotation.z=-s*.26;const sh=new T.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI*.48);sh.scale(.14,.13,.25-i*.013);mesh(a,sh,i%2?metal:enamel);for(const z of [-.20,.20])bead(a,0,.06,z,.023);}if(style)inset(g,SHIELD,.19,.23,s*.16,-.01,.25,enamel,s*.22);}
 function feather(g,s,x,y,z,length=.35,width=.13,mat=metal,angle=.5){const q=group(g,x,y,z);q.rotation.z=-s*angle;plaque(q,LEAF,width,length,0,0,0,mat);tube(q,[[0,-length*.42,.026],[.008,0,.034],[0,length*.47,.024]],.006,mat===metal?light:metal);}
 function chestSigil(kind='gem'){if(kind==='sun'){ring(body,0,.065,.385,.115);gem(body,0,.065,.409,.073);for(let i=0;i<8;i++){let a=i*Math.PI/4;plaque(body,BLADE,.053,.17,Math.sin(a)*.18,.065+Math.cos(a)*.18,.385,metal,-a);}}else{inset(body,SHIELD,.25,.31,0,.10,.35,dark);gem(body,0,.10,.393,.061);}}
 function clothPanels(short=false){for(const s of [-1,1]){const g=group(body,s*.15,-.045,.31);g.rotation.y=s*.15;const panel=new T.PlaneGeometry(.17,short?.34:.56,2,6),positions=panel.attributes.position;for(let i=0;i<positions.count;i++){const y=positions.getY(i);positions.setZ(i,-.09*Math.pow(y/(short?.17:.28),2));}panel.computeVertexNormals();const m=mesh(g,panel,cloth);m.material.side=T.DoubleSide;}}
 function limbDetails(lightweight=false){for(const s of [-1,1]){const side=s===1?'L':'R',arm=anchor('LowerArm'+side),leg=anchor('LowerLeg'+side),a=group(arm,s*.19,0,.10);a.rotation.z=s*Math.PI/2;inset(a,SHIELD,lightweight?.14:.19,rich?.30:.25,0,0,.07,dark);if(rich)for(const y of [-.066,.006,.079])plaque(a,SHIELD,.145,.09,0,y,.105,enamel);if(!lightweight||rich){inset(leg,SHIELD,.20,.25,0,-.13,.15,enamel);if(rich){gem(leg,0,-.1,.194,.036);tube(leg,[[-.058,-.2,.18],[0,-.3,.19],[.058,-.2,.18]],.009,metal);}}}}
 const eachShoulder=fn=>{for(const s of [-1,1])fn(anchor('UpperArm'+(s===1?'L':'R')),s);};
 const motif=(kind)=>{
  if(rich&&['warrior','paladin','berserker'].includes(cls)){
   const chest=[[-.48,.36],[-.27,.51],[0,.39],[.27,.51],[.48,.36],[.36,-.27],[0,-.50],[-.36,-.27]];
   inset(body,chest,.58,.48,0,.10,.31,enamel);
   for(const s of [-1,1]){tube(body,[[s*.25,.24,.35],[s*.21,-.015,.35],[s*.09,-.095,.35]],.010,metal);for(let i=0;i<3;i++)bead(body,s*.24,.19-i*.058,.367,.014,metal);}
  }
  chestSigil(kind);limbDetails(['ranger','ninja','bladedancer','monk'].includes(cls));
 };
if(tier===0){
  // Starter fittings use the same bones, not a scaled-down legendary mesh.
  // They remain compact enough to leave each source body and equipped weapon readable.
  if(['warrior','paladin'].includes(cls)){eachShoulder((g,s)=>{shell(g,s);});chestSigil(cls==='paladin'?'sun':'gem');clothPanels(true);}
  else if(['mage','pyromancer','stormcaller','warlock','chronomancer'].includes(cls)){
   clothPanels();chestSigil();
   eachShoulder((g,s)=>{inset(g,SHIELD,.16,.18,s*.08,.05,.17,enamel,-s*.25);if(cls==='stormcaller')tube(g,[[s*.05,.08,0],[s*.12,.22,0],[s*.09,.15,0],[s*.19,.25,0]],.012,metal);});
   if(cls==='warlock')for(const d of [-1,1])inset(body,BLADE,.14,.28,d*.19,.29,.22,enamel,-d*.38);
   if(cls==='chronomancer'){ring(body,0,.10,.40,.085);for(let i=0;i<8;i++){const a=i*Math.PI/4;bead(body,Math.sin(a)*.065,.10+Math.cos(a)*.065,.42,.009,light);}}
  }else if(cls==='monk'){
   clothPanels(true);for(let i=0;i<11;i++){const a=i*Math.PI/10;bead(body,Math.cos(a)*.25,.18-Math.sin(a)*.24,.32,.030,dark);}
  }else if(cls==='pirate'){
   clothPanels(true);ring(body,0,-.13,.36,.065);eachShoulder((g,s)=>inset(g,SHIELD,.13,.16,s*.06,.03,.14,dark));
  }else if(cls==='berserker'){
   eachShoulder((g,s)=>{shell(g,s);horn(g,[[s*.10,.11,0],[s*.20,.24,0],[s*.26,.27,-.05]],.035,ivory);});chestSigil();
  }else if(cls==='necromancer'){
   clothPanels();for(const d of [-1,1])for(let i=0;i<3;i++)tube(body,[[d*.03,.18-i*.12,.36],[d*.16,.16-i*.12,.35],[d*.23,.26-i*.12,.23]],.018,ivory);
   eachShoulder((g,d)=>horn(g,[[d*.05,.08,0],[d*.14,.19,0],[d*.22,.12,-.08]],.026,ivory));
  }else{
   clothPanels(true);chestSigil();
   eachShoulder((g,d)=>{
    if(cls==='reaper')horn(g,[[d*.04,.09,0],[d*.15,.22,0],[d*.25,.09,-.07]],.028,metal);
    else if(cls==='ninja')inset(g,SHIELD,.14,.18,d*.08,.05,.14,enamel,-d*.28);
    else for(let i=0;i<2;i++)feather(g,d,d*(.05+i*.06),.08,0,.20,.10,i?metal:enamel,.4+i*.2);
   });
  }
 }
 else if(cls==='warrior'){
  eachShoulder((g,s)=>{shell(g,s,1);if(rich)for(let i=0;i<3;i++)feather(g,s,s*(.14+i*.058),.19+i*.013,-.03,.28-i*.04,.10,metal,.42);});motif();clothPanels(true);

 }else if(cls==='ranger'){
  eachShoulder((g,s)=>{for(let i=0;i<(rich?4:3);i++)feather(g,s,s*(.05+i*.072),.11-i*.014,.015-i*.028,rich?.40:.31,.16,i%2?metal:enamel,.5+i*.08);});motif();clothPanels(true);
 }else if(cls==='mage'){
  clothPanels();eachShoulder((g,s)=>{shell(g,s);for(let i=0;i<3;i++)gem(g,s*(.08+i*.066),.20,.10-i*.06,.041);});chestSigil();limbDetails(true);
  if(rich){const sky=group(head,0,1.23,-.04);sky.name='Archmage quiet celestial halo';sky.userData.legendaryFeature='Quiet celestial halo';ring(sky,0,0,0,.48,light,Math.PI/2);for(let i=0;i<2;i++){const star=group(sky);gem(star,0,0,0,.042,light);animate(star,'orbit',i*Math.PI);}}
 }else if(cls==='reaper'){
  eachShoulder((g,s)=>{shell(g,s);for(let i=0;i<(rich?3:2);i++)horn(g,[[s*.04,.12,-.14+i*.14],[s*.20,.23,-.16+i*.14],[s*.36,.04,-.13+i*.14]],.041,metal);});for(const s of [-1,1])for(let i=0;i<3;i++)tube(body,[[s*.055,.15-i*.13,.34],[s*.17,.14-i*.13,.34],[s*.23,.24-i*.13,.20]],rich?.029:.021,metal);gem(body,0,.01,.36,rich?.085:.056);limbDetails(true);if(tier>0)plaque(head,BLADE,.17,rich?.40:.25,0,.68,.37,metal);
 }else if(cls==='paladin'){
  eachShoulder((g,s)=>{shell(g,s,1);if(rich)for(let i=0;i<4;i++)feather(g,s,s*(.09+i*.065),.23-i*.02,-.03-i*.02,.34-i*.035,.12,i%2?light:metal,.25+i*.16);});clothPanels();motif('sun');
 }else if(cls==='necromancer'){
  clothPanels();eachShoulder((g,s)=>{shell(g,s);horn(g,[[s*.04,.09,-.09],[s*.17,.21,-.12],[s*.3,.04,-.16]],.034,ivory);if(rich){tube(body,[[s*.26,.35,-.20],[s*.46,.48,-.16],[s*.58,.49,-.12]],.018,metal);const q=group(body,s*.58,.49,-.12);ring(q,0,0,0,.092,metal,Math.PI/2);ring(q,0,.20,0,.066,metal,Math.PI/2);for(let i=0;i<4;i++){let a=i*Math.PI/2;tube(q,[[Math.cos(a)*.088,0,Math.sin(a)*.088],[Math.cos(a)*.08,.12,Math.sin(a)*.08],[Math.cos(a)*.06,.2,Math.sin(a)*.06]],.010,ivory);}animate(gem(q,0,.09,0,.047),'breathe',s);}});for(let i=0;i<3;i++)for(const s of [-1,1])tube(body,[[s*.025,.12-i*.12,.355],[s*.18,.13-i*.12,.335],[s*.22,.23-i*.12,.20]],.018,ivory);limbDetails(true);
 }else if(cls==='ninja'){
  eachShoulder((g,s)=>{for(let i=0;i<3;i++)inset(g,SHIELD,.18,.18,s*(.055+i*.07),.07-i*.032,.15-i*.02,dark,-s*.4);});motif();
 }else if(cls==='berserker'){
  eachShoulder((g,s)=>{shell(g,s,1);for(let i=0;i<(rich?3:2);i++){let k=rich&&s===1?1.15:1;horn(g,[[s*.1,.07,-.17+i*.14],[s*.24,.27*k,-.16+i*.14],[s*.45,.22*k,-.10+i*.14]],rich?.062:.044,rich?ivory:metal);}});motif();for(const s of [-1,1])for(let i=0;i<4;i++)bead(body,s*(.09+i*.045),.16-i*.09,.31,.027,metal);
 }else if(cls==='pirate'){
  eachShoulder((g,s)=>{shell(g,s);for(let i=0;i<5;i++){const z=-.16+i*.075;tube(g,[[s*.1,.15,z],[s*.23,.13,z],[s*.26,-.05,z]],.014,metal);}});clothPanels();limbDetails();ring(body,0,-.14,.37,.095);plaque(body,BLADE,.061,.18,0,-.14,.39,light);for(const s of [-1,1])for(let i=0;i<4;i++)bead(body,s*.20,.15-i*.11,.33,.022);
  if(rich){const crown=new T.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2);crown.scale(.39,.34,.44);mesh(head,crown,enamel,0,.63,-.17);const brim=new T.Shape();for(let i=0;i<36;i++){let a=i*Math.PI/18,rad=.45+.045*Math.cos(3*a),x=Math.cos(a)*rad,y=Math.sin(a)*rad;i?brim.lineTo(x,y):brim.moveTo(x,y);}brim.closePath();const geo=new T.ShapeGeometry(brim);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){let a=Math.atan2(pos.getZ(i),pos.getX(i));pos.setY(i,.065+.13*Math.pow(Math.max(0,Math.cos(3*a)),2));}geo.computeVertexNormals();enamel.side=T.DoubleSide;mesh(head,geo,enamel,0,.71,-.09);const pts=[];for(let i=0;i<=36;i++){let a=i*Math.PI/18,rad=.45+.045*Math.cos(3*a);pts.push([Math.cos(a)*rad,.78+.13*Math.pow(Math.max(0,Math.cos(3*a)),2),Math.sin(a)*rad-.09]);}tube(head,pts,.017,metal);gem(head,0,.87,.32,.048);}
 }else if(cls==='chronomancer'){
  clothPanels();limbDetails(true);const q=group(body,0,.03,.35);ring(q,0,0,0,rich?.18:.14);mesh(q,new T.CylinderGeometry(rich?.15:.12,rich?.15:.12,.018,24),dark,0,0,0,Math.PI/2);for(let i=0;i<12;i++){const a=i*Math.PI/6;plaque(q,BLADE,.012,.036,Math.sin(a)*.122,Math.cos(a)*.122,.027,metal,-a);}const hand=group(q);plaque(hand,BLADE,.018,.18,0,.053,.036,light);animate(hand,'spinZ',-.21);gem(q,0,0,.044,.021);
  eachShoulder((g,s)=>{shell(g,s);if(rich){const gear=group(g,s*.17,.12,.18);ring(gear,0,0,0,.10);for(let i=0;i<10;i++){let a=i*Math.PI/5;plaque(gear,SHIELD,.04,.066,Math.sin(a)*.115,Math.cos(a)*.115,0,metal,-a);}animate(gear,'spinZ',s*.17);}});
 }else if(cls==='monk'){
  clothPanels(true);for(let i=0;i<15;i++){const a=i*Math.PI/14;bead(body,Math.cos(a)*.25,.18-Math.sin(a)*.25,.32,.034,i%4?dark:metal);}for(const d of [-1,1]){const wrist=anchor('LowerArm'+(d===1?'L':'R'));for(let i=0;i<8;i++){const a=i*Math.PI/4;bead(wrist,d*.22,Math.cos(a)*.085,Math.sin(a)*.085,.022,dark);}inset(hips,LEAF,.15,.24,d*.18,-.04,.25,enamel,d*.25);}
 }else if(cls==='stormcaller'){
  clothPanels();limbDetails(true);chestSigil();eachShoulder((g,s)=>{shell(g,s);for(let i=0;i<(rich?3:2);i++){const pts=[[s*(.03+i*.07),.11,-.06],[s*(.13+i*.07),.30+i*.015,-.08],[s*(.12+i*.07),.17,-.04],[s*(.26+i*.05),.34-i*.025,-.10]];tube(g,pts,.018,metal);if(rich){const q=group(g);tube(q,pts.map(([x,y,z])=>[x,y,z+.012]),.005,light);animate(q,'pulse',i+s);}}});
  if(rich){const pts=[[-.32,.70,-.02],[-.27,.92,.05],[-.17,.79,.19],[0,1.04,.22],[.16,.80,.17],[.28,.93,.04],[.34,.71,-.02]];tube(head,pts,.027,metal);tube(head,pts.map(([x,y,z])=>[x,y-.035,z+.027]),.008,light);gem(head,0,.89,.26,.043);}
 }else if(cls==='warlock'){
  clothPanels();limbDetails(true);chestSigil();eachShoulder((g,s)=>{shell(g,s);if(rich){const seal=group(g,s*.15,.13,.16);ring(seal,0,0,0,.105,metal);for(let i=0;i<3;i++)plaque(seal,BLADE,.033,.14,Math.sin(i*2.094)*.05,Math.cos(i*2.094)*.05,.012,light,-i*2.094);animate(seal,'spinZ',s*.13);}});if(rich)for(const s of [-1,1])horn(head,[[s*.29,.60,-.17],[s*.44,.94,-.22],[s*.28,1.16,-.24]],.067,metal);
 }else if(cls==='skylancer'){
  eachShoulder((g,s)=>{for(let i=0;i<(rich?5:3);i++)feather(g,s,s*(.06+i*.065),.11-i*.025,-.09+i*.038,(rich?.49:.32)+i*.022,rich?.15:.11,i%2?enamel:metal,.8+i*.065);});motif();
 }else if(cls==='bladedancer'){
  eachShoulder((g,s)=>{for(let i=0;i<(rich?(s===1?5:3):2);i++)feather(g,s,s*(.06+i*.05),.13-i*.022,.04-i*.025,rich?.40:.25,rich?.19:.14,i%2?enamel:metal,.3+i*.24);});motif();for(const s of [-1,1])for(let i=0;i<(rich?3:1);i++)feather(hips,s,s*(.23+i*.025),.095,.20,.21,.09,metal,s*.1+i*.22);
 }else if(cls==='beastmaster'){
  eachShoulder((g,s)=>{shell(g,s);horn(g,[[s*.08,.12,-.1],[s*.24,.33,-.1],[s*.37,.37,-.16]],rich?.05:.036,ivory);if(rich){horn(body,[[s*.37,.32,-.17],[s*.52,.56,-.14],[s*.61,.87,-.15],[s*.74,.96,-.20]],.054,ivory);for(let i=0;i<3;i++)horn(body,[[s*(.48+i*.047),.49+i*.106,-.14],[s*(.64+i*.058),.58+i*.11,-.12],[s*(.73+i*.055),.72+i*.10,-.15]],.026,ivory);}});for(let i=0;i<7;i++){const x=(i-3)*.066;horn(body,[[x,.22-Math.sin(i/6*Math.PI)*.1,.32],[x,.15-Math.sin(i/6*Math.PI)*.1,.36],[x+.008,.08-Math.sin(i/6*Math.PI)*.1,.32]],.026,ivory);}limbDetails(true);clothPanels(true);
 }else if(cls==='pyromancer'){
  clothPanels();limbDetails(true);chestSigil();eachShoulder((g,s)=>{shell(g,s,1);for(let i=0;i<4;i++)tube(g,[[s*(.07+i*.052),.105,.19],[s*(.07+i*.052),-.02,.23]],.010,light);if(rich)for(let i=0;i<3;i++){const f=group(body,s*(.43+i*.066),.42,-.09+i*.016);horn(f,[[0,0,0],[s*.036,.15,.005],[-s*.006,.31-i*.043,0]],.037,metal);horn(f,[[0,.02,.026],[s*.02,.13,.03],[0,.24-i*.035,.024]],.018,light);animate(f,'flame',i+s);}});
 }


 // Headpieces follow the measured six source heads (the Wizard is taller).
 // Open hoods retain the editable face; helmets intentionally cover the lower face.
 // Preserve the source Ranger/Rogue hoods: a second shell covered their sculpted folds.
 if(cls==='warrior'&&tier>0){const band=[];for(let i=0;i<=32;i++){const a=i*Math.PI/16;band.push([Math.sin(a)*.32,.66,Math.cos(a)*.39-.14]);}tube(head,band,.018,metal);}
 if(cls==='paladin'&&tier>0){
  // No floating cheek plates: the solar halo is the complete earned head fitting.
  const halo=group(head,0,1.15,-.12);halo.name='Paladin solar halo';
  ring(halo,0,0,0,rich?.49:.42,light,Math.PI/2);
  if(rich){ring(halo,0,0,0,.53,metal,Math.PI/2);for(const d of [-1,1])gem(halo,d*.49,0,0,.026,light);}
 }
 if(['reaper','ninja'].includes(cls)){
  // Face wrap hides the jaw only: eyes, eyebrows and personal settings remain intact.
  plaque(head,[[-.28,.14],[.28,.14],[.25,-.10],[0,-.19],[-.25,-.10]],1,1,0,.24,.30,cls==='warlock'?dark:enamel);
 }
 if(['mage','pyromancer','stormcaller','warlock','necromancer','chronomancer','bladedancer','reaper','pirate'].includes(cls)){
  // Split coat tails, placed behind the stride rather than through the knees.
  for(const d of [-1,1]){const tail=group(hips,d*.24,-.30,-.24);tail.rotation.y=d*.16;plaque(tail,[[-.12,.42],[.12,.42],[.17,-.36],[.08,-.48],[-.13,-.34]],1,1,0,0,0,enamel);tube(tail,[[-.11,.37,.025],[-.12,-.30,.025],[.08,-.43,.025],[.14,-.32,.025]],.009,metal);}
 }
 if(cls==='necromancer'&&tier>0){
  // Sculpted ivory death mask, unlike Warlock's angular ruby pact mask.
  inset(head,SHIELD,.47,.48,0,.38,.31,ivory);for(const d of [-1,1])plaque(head,LEAF,.115,.12,d*.095,.44,.36,dark,d*.25);
  for(let i=0;i<5;i++)plaque(head,BLADE,.022,.11,(i-2)*.043,.23,.36,dark);
 }
 if(cls==='beastmaster'&&tier>0){
  const crest=group(body,0,.35,.36);plaque(crest,SHIELD,.28,.30,0,0,0,ivory);for(const d of [-1,1]){gem(crest,d*.063,.025,.027,.021,dark);horn(crest,[[d*.09,.11,0],[d*.15,.23,-.025],[d*.13,.34,-.05]],.026,ivory);}plaque(crest,BLADE,.075,.15,0,-.10,.025,dark);
 }

 // Warlock keeps its natural face; ruby pact motifs belong to its armor.

 // Cleric's source head has a painted metal face plate, not bare skin.
 // Isolate that connected front surface; retain all original white hair geometry/UVs.
 if(cls==='paladin'){
  let face;root.traverse(o=>{if(o.isMesh&&o.name==='Head_1')face=o;});
  if(face){const original=face.geometry,geo=original.index?original.toNonIndexed():original.clone(),pos=geo.attributes.position,parents=Array.from({length:pos.count/3},(_,i)=>i),weld=new Map();
   const find=i=>parents[i]===i?i:(parents[i]=find(parents[i]));
   for(let i=0;i<pos.count;i++){const key=[pos.getX(i),pos.getY(i),pos.getZ(i)].map(v=>Math.round(v*10000)).join(',');if(weld.has(key))parents[find(Math.floor(i/3))]=find(weld.get(key));else weld.set(key,Math.floor(i/3));}
   const parts=new Map();for(let i=0;i<pos.count;i++){const id=find(Math.floor(i/3)),box=parts.get(id)||new T.Box3();box.expandByPoint(V(pos.getX(i),pos.getY(i),pos.getZ(i)));parts.set(id,box);}
   const exposed=new Set([...parts].filter(([,b])=>b.min.z>.30&&b.max.x-b.min.x>.60&&b.max.y-b.min.y>.80).map(([id])=>id));
   if(exposed.size){geo.clearGroups();let start=0,last=-1;for(let i=0;i<pos.count;i+=3){const mat=exposed.has(find(i/3))?1:0;if(last!==mat){if(last>=0)geo.addGroup(start,i-start,last);start=i;last=mat;}}geo.addGroup(start,pos.count-start,last);
    const hiddenPlate=new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false});r.materials.add(hiddenPlate);
    const skin=new T.MeshStandardMaterial({color:'#bd8e6b',roughness:.92,metalness:0}),skull=new T.SphereGeometry(1,16,12);
    const v=skull.attributes.position;for(let i=0;i<v.count;i++){const x=v.getX(i),y=v.getY(i),z=v.getZ(i);v.setXYZ(i,x*.33,.38+y*.44,z>0?.255-.035*x*x-.02*y*y:-.18+z*.41);}skull.computeVertexNormals();mesh(head,skull,skin);const nose=mesh(head,new T.SphereGeometry(.028,6,4),skin,0,.26,.272);nose.scale.set(.72,1.13,.9);r.materials.add(skin);r.geometries.add(geo);r.faceOverrides=[{node:face,geometry:original,material:face.material}];face.geometry=geo;face.material=[face.material,hiddenPlate];
    root.traverse(node=>{if(!node.isSkinnedMesh)return;const headIndex=node.skeleton.bones.findIndex(b=>b.name==='Head');if(headIndex<0)return;const original=node.geometry,g=original.index?original.toNonIndexed():original.clone(),si=g.attributes.skinIndex,sw=g.attributes.skinWeight;if(!si||!sw){g.dispose();return;}
     const weight=i=>{let w=0;for(let k=0;k<4;k++)if(si.getComponent(i,k)===headIndex)w+=sw.getComponent(i,k);return w;};g.clearGroups();let start=0,last=-1;for(let i=0;i<si.count;i+=3){const mat=(weight(i)+weight(i+1)+weight(i+2))/3>.4?1:0;if(mat!==last){if(last>=0)g.addGroup(start,i-start,last);start=i;last=mat;}}g.addGroup(start,si.count-start,last);r.faceOverrides.push({node,geometry:original,material:node.material});r.geometries.add(g);node.geometry=g;node.material=[node.material,hiddenPlate];
    });
   }else geo.dispose();
  }
 }
 // High ranks grow authored solid silhouettes; effects never substitute for armor.
 if(tier>0){
  if(['warrior','paladin','berserker'].includes(cls))eachShoulder((g,d)=>{
   inset(g,SHIELD,rich?.34:.26,rich?.33:.25,d*.21,.12,.18,enamel,-d*.32);
   for(let i=0;i<(rich?3:2);i++)feather(g,d,d*(.20+i*.07),.20+i*.02,-.04,rich?.34:.23,.11,cls==='berserker'?ivory:metal,.45+i*.2);
  });
  if(['mage','pyromancer','stormcaller','warlock','chronomancer'].includes(cls)){
   for(const d of [-1,1]){inset(body,BLADE,.20,.38,d*.21,.16,.27,enamel,-d*.38);inset(hips,BLADE,.22,rich?.50:.38,d*.20,-.13,.23,enamel,-d*.15);}
   eachShoulder((g,d)=>{plaque(g,SHIELD,rich?.31:.24,.24,d*.15,.08,.09,enamel,-d*.25);tube(g,[[d*.03,.16,.14],[d*.20,.24,.12],[d*.34,.10,.08]],.012,metal);});
  }
  if(cls==='mage'){eachShoulder((g,d)=>{for(let i=0;i<(rich?3:2);i++)gem(g,d*(.14+i*.09),.23+i*.04,-.03,rich?.09:.065,light);});}
  if(cls==='stormcaller'){for(const d of [-1,1])tube(head,[[d*.24,.73,-.15],[d*.36,1.10,-.17],[d*.27,.99,-.12],[d*.32,rich?1.36:1.20,-.10]],.019,light);}
  if(['ninja','bladedancer','reaper','ranger'].includes(cls)){
   for(const d of [-1,1])inset(hips,cls==='ranger'?LEAF:BLADE,.20,rich?.45:.32,d*.25,-.13,.18,enamel,-d*.28);
  }
  if(cls==='bladedancer')eachShoulder((g,d)=>{for(let i=0;i<(rich?4:3);i++)feather(g,d,d*(.12+i*.065),.17-i*.025,-.03,rich?.45:.33,.15,i%2?ivory:metal,.5+i*.24);});
  if(cls==='ranger')eachShoulder((g,d)=>{for(let i=0;i<(rich?4:2);i++)feather(g,d,d*(.12+i*.07),.14-i*.03,-.06,rich?.39:.29,.18,i%2?enamel:metal,.55+i*.18);});
  if(cls==='beastmaster'){for(const d of [-1,1]){horn(head,[[d*.24,.68,-.20],[d*.38,.92,-.24],[d*.30,rich?1.19:1.06,-.26]],.045,ivory);for(let i=0;i<4;i++)feather(body,d,d*(.26+i*.05),.30-i*.03,-.09,.24,.14,ivory,.4+i*.25);}}
  if(cls==='monk'){
   // Folded sash and layered cloth, no knight pauldrons or metal breastplate.
   for(const d of [-1,1]){plaque(hips,LEAF,.23,rich?.63:.45,d*.17,-.20,.27,enamel,d*.20);tube(body,[[d*.24,.24,.23],[d*.13,.10,.34],[0,-.16,.34]],.022,enamel);}
  }
 }
 // Authored tier identities from the approved reference sheet.
 if(cls==='pirate'&&!rich){
  const hat=group(head,0,.61,-.19);hat.name='Pirate fitted tricorn';
  const felt=material(tier===0?p.leather:p.cloth,0,.94),crown=new T.SphereGeometry(1,18,10,0,Math.PI*2,0,Math.PI/2);
  crown.scale(.40,.30,.62);mesh(hat,crown,felt);
  const brim=new T.Shape(),edge=[];
  for(let i=0;i<=60;i++){const a=i*Math.PI/30,rad=.57+.065*Math.cos(3*a),x=Math.cos(a)*rad,z=Math.sin(a)*rad*1.17;i?brim.lineTo(x,z):brim.moveTo(x,z);edge.push([x,.025+.17*Math.pow(Math.max(0,Math.cos(3*a)),2),z]);}
  const hole=new T.Path();hole.absellipse(0,0,.30,.39,0,Math.PI*2,true);brim.holes.push(hole);
  const geo=new T.ShapeGeometry(brim,18);geo.rotateX(Math.PI/2);const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const a=Math.atan2(pos.getZ(i)/1.17,pos.getX(i));pos.setY(i,.025+.17*Math.pow(Math.max(0,Math.cos(3*a)),2));}geo.computeVertexNormals();
  const hatMat=felt.clone();hatMat.side=T.DoubleSide;r.materials.add(hatMat);mesh(hat,geo,hatMat);tube(hat,edge,.012,metal);
  ring(hat,0,.065,0,.375,metal,Math.PI/2);if(tier===1)gem(hat,0,.14,.59,.04,light);
 }

 if(tier>0&&['warrior','chronomancer','necromancer'].includes(cls)){
  const count=rich?7:5;
  for(let i=0;i<count;i++){const a=(i/(count-1)-.5)*2.6,x=Math.sin(a)*.29,z=Math.cos(a)*.39-.14,y=cls==='warrior'?.70:.88;
   if(['berserker','necromancer'].includes(cls)){if(i%2===0)horn(head,[[x,y,z],[x*1.35,y+.17,z-.025],[x*1.30,y+(rich?.35:.23),z-.09]],rich?.036:.026,cls==='necromancer'?ivory:metal);}
   else{plaque(head,BLADE,rich?.083:.06,(rich?.28:.17)+(i===Math.floor(count/2)?.09:0),x,y+.06,z,metal,-a*.18);if(['mage','skylancer','chronomancer'].includes(cls))gem(head,x,y+(rich?.24:.16),z+.02,rich?.047:.032,light);}
  }
 }
 if(cls==='berserker'&&tier>0){
  for(const d of [-1,1]){const mount=group(head,d*.29,.66,-.05);mount.name='Berserker rooted temple horn';
   mesh(mount,new T.CylinderGeometry(.064,.064,.035,6),dark,0,0,0,Math.PI/2);mesh(mount,new T.TorusGeometry(.055,.010,3,12),metal,0,0,.022);
   horn(mount,[[0,0,0],[d*.14,.11,-.015],[d*.22,rich?.36:.26,-.08],[d*.10,rich?.53:.39,-.16]],rich?.070:.057,ivory);
  }
 }
 if(cls==='skylancer'&&tier>0){
  for(const d of [-1,1]){const clip=group(head,d*.28,.68,-.18);clip.name='Skylancer feather crest';bead(clip,0,0,0,.037,metal);
   for(let i=0;i<(rich?3:2);i++){const f=group(clip,d*i*.035,i*.018,-i*.035);f.rotation.z=-d*(.50+i*.19);
    const len=(rich?.33:.26)-i*.045;plaque(f,LEAF,.105,len,0,len*.40,0,i%2?enamel:ivory);
    tube(f,[[0,-.015,.02],[.012,len*.4,.025],[0,len*.86,.02]],.006,metal);
    for(let k=1;k<4;k++){const y=k*len*.20,w=.042*Math.sin(k/4*Math.PI);for(const side of [-1,1])tube(f,[[0,y,.022],[side*w,y+len*.09,.022]],.003,metal);}
   }
  }
 }
 if(cls==='ninja'&&tier>0){eachShoulder((g,d)=>{for(let i=0;i<(rich?3:2);i++)inset(g,BLADE,.10,.29,d*(.12+i*.06),.17+i*.025,.04-i*.04,enamel,-d*(.45+i*.17));});}
 if(cls==='warlock'){
  // Ruby-black angular pact armor; never necromantic bone/skull imagery.
  for(const d of [-1,1])inset(body,BLADE,.12,.27,d*.23,.23,.26,enamel,-d*.5);

 }
 if(cls==='bladedancer'&&tier>0)clothPanels();
 if(cls==='skylancer'&&tier>0){for(const d of [-1,1])for(let i=0;i<(rich?6:3);i++)feather(body,d,d*(.32+i*.09),.37-i*.07,-.28,(rich?.76:.43)-i*.015,.15,i%2?ivory:metal,.9+i*.05);}
 if(cls==='berserker'&&tier>0){for(const d of [-1,1])for(let i=0;i<5;i++)feather(body,d,d*(.24+i*.035),.29-i*.025,-.07,.18,.10,ivory,.6+i*.12);}
 if(cls==='monk'&&rich){
  const mind=group(head,0,.49,-.34);ring(mind,0,0,0,.48,metal);ring(mind,0,0,.01,.43,light);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;plaque(mind,LEAF,.07,.18,Math.sin(a)*.48,Math.cos(a)*.48,.015,light,-a);}
  for(const d of [-1,1]){const jewel=gem(body,d*.41,.26,.02,.055,light);animate(jewel,'breathe',d);}
 }
 if(cls==='chronomancer'&&rich){const dial=group(head,0,.54,-.30);ring(dial,0,0,0,.51,metal);for(let i=0;i<12;i++){const a=i*Math.PI/6;plaque(dial,BLADE,.025,.07,Math.sin(a)*.45,Math.cos(a)*.45,.02,light,-a);}for(const d of [-1,1]){const jewel=gem(body,d*.48,.14,-.12,.066,light);animate(jewel,'breathe',d);}}
 if(cls==='pyromancer'&&tier>0){
  const crown=group(head,0,.86,0);crown.name='Pyromancer living flame crown';animate(crown,'flame',.9);
  const orange=material('#ff6c16',0,.65,1.35),gold=material('#ffe28a',0,.65,1.7);orange.side=gold.side=T.DoubleSide;
  const flameGeo=(w,h)=>{const f=new T.Shape();f.moveTo(-w*.48,0);f.bezierCurveTo(-w*.82,h*.23,w*.09,h*.47,-w*.12,h);f.bezierCurveTo(w*.67,h*.65,w*.18,h*.44,w*.49,h*.19);f.bezierCurveTo(w*.59,-h*.035,-w*.24,-h*.08,-w*.48,0);return new T.ShapeGeometry(f,14);};
  for(let i=0;i<(rich?5:3);i++){const x=(i-(rich?2:1))*.105,q=group(crown,x,0,.08-Math.abs(x)*.5),h=(rich?.39:.27)-Math.abs(x)*.40;
   mesh(q,flameGeo(.12,h),orange);mesh(q,flameGeo(.067,h*.69),gold,0,.012,.012);mesh(q,flameGeo(.10,h*.88),orange,0,.005,0,0,Math.PI/2);mesh(q,flameGeo(.055,h*.61),gold,.012,.017,0,0,Math.PI/2);
  }
 }


 // Legendary fittings add class-specific craft inside the existing fitted silhouette.
 // They do not scale the body, cover the face or add scene lights/particle emitters.
 if(tier===2){
  const trim=material(p.inlay||p.metal,.72,.30),signature=(name,parent=body,x=0,y=0,z=0)=>{const q=group(parent,x,y,z);q.name='Legendary · '+name;q.userData.legendaryFeature=name;return q;};
  const braid=(g,pts)=>tube(g,pts,.007,trim);
  if(cls==='warrior'){
   const q=signature('Royal heraldic breastwork');
   for(const s of [-1,1]){braid(q,[[s*.07,-.12,.39],[s*.22,-.04,.40],[s*.26,.16,.39],[s*.20,.31,.37]]);for(let i=0;i<4;i++)plaque(q,LEAF,.042,.095,s*(.14+i*.028),-.05+i*.085,.414,trim,-s*.55);}
   const shoulder=signature('Fluted royal shoulder shield',anchor('UpperArmL'),.18,.13,.21);inset(shoulder,SHIELD,.22,.26,0,0,0,enamel);for(const x of [-.046,0,.046])braid(shoulder,[[x,-.08,.035],[x,.08,.035]]);gem(shoulder,0,.02,.054,.035,light);
  }else if(cls==='ranger'){
   const q=signature('Whitewood carved leaf collar');for(const s of [-1,1]){braid(q,[[s*.09,.28,.32],[s*.22,.34,.26],[s*.32,.32,.13]]);for(let i=0;i<3;i++)feather(q,s,s*(.14+i*.061),.30-i*.018,.30-i*.05,.15,.065,i%2?trim:enamel,.8);}
   const compass=group(q,0,-.16,.415);ring(compass,0,0,0,.057,trim);plaque(compass,BLADE,.024,.10,0,0,.016,light,.35);
  }else if(cls==='mage'){
   // The single halo above is the head's complete celestial ornament.
  }else if(cls==='reaper'){
   const q=signature('Vaulted soul reliquary',body,0,.03,.39);
   for(const s of [-1,1])horn(q,[[s*.12,-.13,0],[s*.18,.05,0],[s*.12,.23,0],[0,.29,0]],.016,ivory);
   for(const x of [-.08,0,.08])braid(q,[[x,-.11,.025],[x*.6,.16,.035],[0,.25,.02]]);gem(q,0,.03,.045,.076,light);plaque(q,BLADE,.038,.23,0,-.055,.075,trim);
  }else if(cls==='paladin'){
   const q=signature('Sculpted solar relief',body,0,.065,.435);ring(q,0,0,0,.125,trim);for(let i=0;i<12;i++){const a=i*Math.PI/6;plaque(q,BLADE,.034,.12,Math.sin(a)*.15,Math.cos(a)*.15,0,i%2?metal:trim,-a);}gem(q,0,0,.024,.066,light);
   eachShoulder((g,s)=>{for(let i=0;i<3;i++)braid(g,[[s*(.1+i*.035),.17,.17],[s*(.23+i*.035),.21,.13],[s*(.31+i*.027),.12,.10]]);});
  }else if(cls==='necromancer'){
   const q=signature('Bone reliquary keywork');for(const s of [-1,1]){const key=group(q,s*.12,.07,.395);ring(key,0,.07,0,.04,ivory);braid(key,[[0,.035,0],[0,-.13,0],[s*.045,-.13,0],[s*.045,-.10,0]]);for(let i=0;i<3;i++)bead(q,s*.58,.50+i*.065,-.12,.014,trim);}
   gem(q,0,.14,.405,.042,light);for(const s of [-1,1])braid(q,[[s*.28,.36,-.18],[s*.43,.45,-.16],[s*.58,.49,-.12]]);
  }else if(cls==='ninja'){
   const q=signature('Ruby assassin seal',anchor('UpperArmL'),.15,.13,.20);
   for(const s of [-1,1]){plaque(q,BLADE,.085,.15,s*.045,.07,0,metal,-s*.40);plaque(q,SHIELD,.09,.12,s*.04,-.01,.018,enamel,s*.35);bead(q,s*.029,.018,.041,.008,trim);}plaque(q,BLADE,.055,.12,0,-.06,.035,metal);
   for(const s of [-1,1])for(let i=0;i<3;i++)braid(anchor('LowerArm'+(s===1?'L':'R')),[[s*.17,-.055+i*.034,.18],[s*.22,.015+i*.034,.17]]);
  }else if(cls==='berserker'){
   const q=signature('Beast-jaw trophy pauldron',anchor('UpperArmL'),.19,.14,.15);inset(q,SHIELD,.25,.26,0,0,0,dark);for(const s of [-1,1])for(let i=0;i<3;i++)horn(q,[[s*(.055+i*.027),.04-i*.015,.035],[s*(.08+i*.03),-.025-i*.025,.10],[s*(.052+i*.025),-.09-i*.022,.115]],.019,ivory);
   for(let i=0;i<7;i++){const x=(i-3)*.065;ring(body,x,.24-Math.sin(i/6*Math.PI)*.08,.39,.027,trim,0,i%2?.5:-.5);}
  }else if(cls==='pirate'){
   const q=signature('Admiral plume',head,-.25,.91,-.23);for(let i=0;i<3;i++){const f=group(q,-i*.035,i*.017,0);f.rotation.z=-.45+i*.17;plaque(f,LEAF,.085,.34-i*.035,0,.10,0,i%2?trim:enamel);braid(f,[[0,-.025,.025],[0,.25,.025]]);}
   const medals=signature('Navigators regalia');for(let i=0;i<3;i++){const g=group(medals,-.13+i*.12,-.02+(i%2)*.04,.415);ring(g,0,0,0,.038,trim);gem(g,0,0,.015,.022,i===1?light:metal);}for(const s of [-1,1])for(let i=0;i<4;i++)bead(medals,s*(.12+i*.043),.22-i*.018,.35,.014,ivory);
  }else if(cls==='chronomancer'){
   const q=signature('Hourglass movement',body,0,-.14,.43);for(const s of [-1,1])braid(q,[[s*.075,-.11,0],[s*.075,.11,0]]);for(const y of [-.11,.11])plaque(q,SHIELD,.20,.035,0,y,0,trim);tube(q,[[-.052,.085,0],[0,0,.025],[-.052,-.085,0]],.008,metal);tube(q,[[.052,.085,0],[0,0,.025],[.052,-.085,0]],.008,metal);gem(q,0,-.061,.019,.035,light);
   const movement=group(q);ring(movement,0,0,-.018,.12,trim);animate(movement,'spinZ',.11);
  }else if(cls==='monk'){
   const q=signature('Gilt prayer-bead ferrules');for(let i=0;i<7;i++){const a=i*Math.PI/6;ring(q,Math.cos(a)*.25,.18-Math.sin(a)*.25,.33,.043,trim);}
   for(const d of [-1,1])for(let i=0;i<4;i++){bead(hips,d*.20,-.03-i*.055,.26,.022,i===3?light:dark);}
  }else if(cls==='stormcaller'){
   const q=signature('Caged storm cores');for(const s of [-1,1]){const cage=group(q,s*.35,.30,.22);ring(cage,0,0,0,.072,trim);for(const x of [-.05,.05])braid(cage,[[x,-.06,0],[x,.06,0]]);const core=gem(cage,0,0,.02,.044,light);animate(core,'pulse',s);tube(cage,[[-.04,-.04,.033],[.014,-.004,.04],[-.005,.014,.04],[.038,.05,.033]],.005,trim);}
  }else if(cls==='warlock'){
   const q=signature('Split eclipse pact',body,0,.10,.445);for(const s of [-1,1]){const c=group(q);mesh(c,new T.TorusGeometry(.105,.020,5,18,Math.PI*.78),s===1?trim:metal,0,0,0,0,0,s===1?.18:Math.PI+.18);animate(c,'spinZ',s*.08);}gem(q,0,0,.015,.049,light);for(const s of [-1,1])plaque(q,BLADE,.055,.16,s*.14,0,-.012,dark,s*.35);
  }else if(cls==='skylancer'){
   const q=signature('Wind instrument',body,0,.10,.42);ring(q,0,0,0,.08,trim);const needle=group(q);plaque(needle,BLADE,.03,.13,0,0,.02,light);animate(needle,'spinZ',.12);
   eachShoulder((g,s)=>{for(let i=0;i<3;i++)feather(g,s,s*(.09+i*.06),.07-i*.026,.13-i*.035,.25+i*.02,.07,trim,.95+i*.1);});
  }else if(cls==='bladedancer'){
   const q=signature('Ceremonial filigree fan',anchor('UpperArmL'),.14,.17,.18);for(let i=0;i<7;i++){const a=(i-3)*.20,leaf=group(q);leaf.rotation.z=a;plaque(leaf,LEAF,.045,.26,0,.08,0,i%2?trim:enamel);gem(leaf,0,.20,.016,.013,light);}ring(q,0,-.025,.02,.04,trim);
   for(const s of [-1,1])braid(hips,[[s*.12,.02,.30],[s*.22,-.015,.30],[s*.32,.02,.25]]);
  }else if(cls==='beastmaster'){
   const q=signature('Carved great-beast crest',body,0,.04,.40);inset(q,SHIELD,.22,.24,0,0,0,dark);for(const s of [-1,1]){horn(q,[[s*.05,.07,.035],[s*.12,.15,.028],[s*.13,.23,0]],.019,ivory);plaque(q,BLADE,.055,.10,s*.056,-.035,.04,trim,s*.35);bead(q,s*.032,.018,.045,.013,light);for(let i=0;i<3;i++)ring(body,s*(.49+i*.04),.56+i*.105,-.14,.033,trim,Math.PI/2);}
  }else if(cls==='pyromancer'){
   const q=signature('Obsidian furnace heart',body,0,.10,.445);ring(q,0,0,0,.115,dark);const core=gem(q,0,0,.025,.078,light);animate(core,'flame',.7);for(let i=0;i<8;i++){const a=i*Math.PI/4;plaque(q,BLADE,.040,.14,Math.sin(a)*.13,Math.cos(a)*.13,.025,i%2?metal:dark,-a);}for(const s of [-1,1])for(let i=0;i<3;i++)braid(q,[[s*.12,-.12-i*.03,.02],[s*.07,-.18-i*.03,.025]]);
  }
 }
 // Animated pivots are independent batches. Static transforms bake into their bone fitting.
 function batch(g){const buckets=new Map(),remove=[];function collect(o,matrix){for(const c of [...o.children]){c.updateMatrix();const tr=matrix.clone().multiply(c.matrix);if(c.userData.lookAnimated){batch(c);continue;}if(c.isMesh){let geo=c.geometry.index?c.geometry.toNonIndexed():c.geometry.clone();geo.applyMatrix4(tr);if(!geo.attributes.uv)geo.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));for(const name of Object.keys(geo.attributes))if(!['position','normal','uv'].includes(name))geo.deleteAttribute(name);const list=buckets.get(c.material)||[];list.push(geo);buckets.set(c.material,list);remove.push(c);c.geometry.dispose();}else collect(c,tr);}}collect(g,new T.Matrix4());remove.forEach(m=>m.removeFromParent());for(const [mat,geos] of buckets){const geo=mergeGeometries(geos,false);geos.forEach(g=>g.dispose());const m=new T.Mesh(geo,mat);m.userData.classLookPart=true;m.frustumCulled=false;g.add(m);r.geometries.add(geo);r.meshes++;r.triangles+=geo.attributes.position.count/3;}}
 // Animated meshes must retain and own their geometry; batching only their children is not enough.
 for(const a of r.moving)if(a.m.isMesh){r.geometries.add(a.m.geometry);r.meshes++;r.triangles+=(a.m.geometry.index?.count||a.m.geometry.attributes.position.count)/3;}
 r.groups.forEach(batch);
 // Keep transparent energy outside the opaque fitting batches and its resources
 // owned by this actor. Rank 5 remains the approved fitted outfit without aura.
 if(tier===2){r.aura=createClassAura(hips,cls);if(r.aura){r.meshes+=r.aura.stats.drawCalls;r.triangles+=r.aura.stats.triangles;}}
 return r;
}
export function syncClassLook(root,cls,tier,M,time=0,motion=true){
 if(!root)return;const n=window.BFClassLooks?.valid(tier)||0,key=cls+':'+n;let r=records.get(root);if(r?.key!==key){clearClassLook(root);r=build(root,cls,n);}const t=motion?time:0;
 for(const a of r.moving){const {m,base,rotation,scale,speed}=a;m.position.copy(base);m.rotation.copy(rotation);m.scale.copy(scale);if(a.type==='spinZ')m.rotation.z+=t*speed;if(a.type==='spinY')m.rotation.y+=t*speed;if(a.type==='orbit'){m.position.set(Math.cos(t*.28+speed)*.51,Math.sin(t*.28+speed)*.065,Math.sin(t*.28+speed)*.51);m.rotation.y=-t*.28;}if(a.type==='breathe')m.position.y+=Math.sin(t*1.7+speed)*.012;if(a.type==='flame')m.scale.y*=1+(motion?Math.sin(t*2.5+speed)*.09:0);if(a.type==='pulse')m.scale.multiplyScalar(1+(motion?Math.sin(t*2+speed)*.035:0));if(a.type==='petal')m.rotation.z+=motion?Math.sin(t*.8+speed)*.035:0;}
 syncClassAura(r.aura,time,motion,window.__BF_META?.()?.quality==='low');
 return {key,meshes:r.meshes,animated:r.moving.length,triangles:r.triangles,aura:r.aura?.stats||null};
}
