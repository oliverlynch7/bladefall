import * as T from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';

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
export function clearClassLook(root){const r=records.get(root);if(!r)return;r.groups.forEach(g=>g.removeFromParent());for(const o of r.hidden){o.visible=o.userData.classLookBaseVisibility;delete o.userData.classLookBaseVisibility;}r.geometries.forEach(g=>g.dispose());r.materials.forEach(m=>m.dispose());records.delete(root);}
export function classLookStats(root){const r=records.get(root);return r?{key:r.key,meshes:r.meshes,triangles:r.triangles,animated:r.moving.length,anchors:r.groups.map(g=>g.userData.classLookBone)}:{meshes:0,triangles:0,animated:0,anchors:[]};}
function build(root,cls,tier){
 const p=window.BFClassLooks?.palette(cls,tier),r={key:cls+':'+tier,groups:[],moving:[],hidden:[],geometries:new Set(),materials:new Set(),meshes:0,triangles:0};records.set(root,r);
 const stale=[];root.traverse(o=>{if(o.userData.classLookBaseVisibility!==undefined){o.visible=o.userData.classLookBaseVisibility;delete o.userData.classLookBaseVisibility;}if(o.userData.classLookRoot)stale.push(o);});stale.forEach(o=>o.removeFromParent());if(!tier||!p)return r;root.traverse(o=>{if(o.isMesh&&/^(shoulderpad|armguard)/i.test(o.name)){o.userData.classLookBaseVisibility=o.visible;o.visible=false;r.hidden.push(o);}});
 let skeleton;root.traverse(o=>{if(!skeleton&&o.isSkinnedMesh)skeleton=o.skeleton;});if(!skeleton)return r;
 const bones=new Map(skeleton.bones.map((b,i)=>[norm(b.name),{b,inv:skeleton.boneInverses[i]}])),anchors=new Map();
 function anchor(name){if(anchors.has(name))return anchors.get(name);const e=bones.get(norm(name));if(!e)return null;const pos=V().setFromMatrixPosition(e.inv.clone().invert()),g=new T.Group();g.name='Class fitting · '+name;g.userData.classLookRoot=true;g.userData.classLookBone=name;e.inv.clone().multiply(new T.Matrix4().makeTranslation(pos.x,pos.y,pos.z)).decompose(g.position,g.quaternion,g.scale);e.b.add(g);r.groups.push(g);anchors.set(name,g);return g;}
 const material=(color,metalness=.65,roughness=.36,glow=0,map=null)=>{const m=new T.MeshStandardMaterial({color,metalness,roughness,emissive:glow?color:'#000000',emissiveIntensity:glow,map});r.materials.add(m);return m;};
 const metal=material(p.metal),dark=material(p.leather,.30,.64),enamel=material(p.cloth,.38,.40),ivory=material('#ede0bd',.1,.65),light=material(p.accent||p.metal,.32,.28,.46),cloth=material('#ffffff',0,.94,0,weave(cls,tier));
 // Both earned tiers inherit the former Rank 10 fittings; Rank 10 adds its own finish below.
 const rich=tier>0,body=anchor('Torso'),hips=anchor('Hips'),head=anchor('Head');
 const mesh=(g,geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{if(!g)return null;const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.userData.classLookPart=true;m.frustumCulled=false;g.add(m);return m;};
 const shape=(pts,w,h,d=.025)=>{const s=new T.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x*w,y*h):s.moveTo(x*w,y*h));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:Math.min(.012,w*.055),bevelThickness:.008,curveSegments:2});g.translate(0,0,-d*.5);return g;};
 const plaque=(g,pts,w,h,x,y,z,mat=metal,rz=0)=>mesh(g,shape(pts,w,h),mat,x,y,z,0,0,rz);
 const inset=(g,pts,w,h,x,y,z,mat=enamel,rz=0)=>{plaque(g,pts,w,h,x,y,z,metal,rz);plaque(g,pts,w*.78,h*.77,x,y,z+.025,mat,rz);};
 const gem=(g,x,y,z,s=.08,mat=light)=>{const m=mesh(g,new T.OctahedronGeometry(s,0),mat,x,y,z);m.scale.set(.85,1.3,.55);return m;};
 const bead=(g,x,y,z,s=.027,mat=metal)=>mesh(g,new T.SphereGeometry(s,7,5),mat,x,y,z);
 const ring=(g,x,y,z,rad=.1,mat=metal,rx=0,ry=0)=>mesh(g,new T.TorusGeometry(rad,.014,5,24),mat,x,y,z,rx,ry);
 const tube=(g,pts,rad=.014,mat=metal)=>mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(a=>V(...a))),Math.max(6,pts.length*3),rad,5,false),mat);
 const horn=(g,pts,rad,mat=ivory)=>{const curve=new T.CatmullRomCurve3(pts.map(a=>V(...a))),segments=12,fr=curve.computeFrenetFrames(segments,false),positions=[],uv=[],idx=[];for(let i=0;i<=segments;i++){const pos=curve.getPointAt(i/segments),radius=rad*Math.pow(1-i/segments,.75)+.002;for(let j=0;j<7;j++){const a=j*Math.PI/3,q=pos.clone().addScaledVector(fr.normals[i],Math.cos(a)*radius).addScaledVector(fr.binormals[i],Math.sin(a)*radius);positions.push(q.x,q.y,q.z);uv.push(j/6,i/segments);if(i<segments&&j<6){const k=i*7+j;idx.push(k,k+7,k+1,k+1,k+7,k+8);}}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();return mesh(g,geo,mat);};
 const animate=(m,type,speed=1)=>{m.userData.lookAnimated=true;r.moving.push({m,type,speed,base:m.position.clone(),rotation:m.rotation.clone(),scale:m.scale.clone()});return m;};
 const group=(g,x=0,y=0,z=0)=>{const q=new T.Group();q.position.set(x,y,z);g.add(q);return q;};
 function shell(g,s,style=0){const geo=new T.SphereGeometry(1,12,8,0,Math.PI*2,0,Math.PI*.70);geo.scale(.25,.19,.25);geo.rotateZ(-s*.40);mesh(g,geo,dark,s*.14,.02,0);for(let i=0;i<(rich?3:2);i++){const a=group(g,s*(.08+i*.075),.10-i*.032,0);a.rotation.z=-s*.26;const sh=new T.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI*.48);sh.scale(.14,.13,.25-i*.013);mesh(a,sh,i%2?metal:enamel);for(const z of [-.20,.20])bead(a,0,.06,z,.023);}if(style)inset(g,SHIELD,.19,.23,s*.16,-.01,.25,enamel,s*.22);}
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
 if(cls==='warrior'){
  eachShoulder((g,s)=>{shell(g,s,1);if(rich)for(let i=0;i<3;i++)feather(g,s,s*(.14+i*.058),.19+i*.013,-.03,.28-i*.04,.10,metal,.42);});motif();clothPanels(true);
  if(rich){const helm=new T.SphereGeometry(1,14,8,0,Math.PI*2,0,Math.PI/2);helm.scale(.36,.27,.46);mesh(head,helm,enamel,0,.61,-.20);tube(head,[[-.32,.60,.02],[-.25,.59,.26],[0,.64,.30],[.25,.59,.26],[.32,.60,.02]],.022,metal);for(let i=0;i<7;i++)plaque(head,LEAF,.055,.22,0,.84+Math.sin(i/6*Math.PI)*.1,-.22+i*.068,enamel);tube(head,[[0,.77,-.3],[0,.87,0],[0,.77,.22]],.023,metal);}
 }else if(cls==='ranger'){
  eachShoulder((g,s)=>{for(let i=0;i<(rich?4:3);i++)feather(g,s,s*(.05+i*.072),.11-i*.014,.015-i*.028,rich?.40:.31,.16,i%2?metal:enamel,.5+i*.08);});motif();clothPanels(true);if(rich){for(const s of [-1,1]){feather(head,s,s*.23,.63,.28,.28,.12,metal,.60);tube(head,[[s*.32,.53,.25],[s*.20,.62,.38],[0,.64,.41]],.014,metal);}gem(head,0,.65,.435,.046);}
 }else if(cls==='mage'){
  clothPanels();eachShoulder((g,s)=>{shell(g,s);for(let i=0;i<3;i++)gem(g,s*(.08+i*.066),.20,.10-i*.06,.041);});chestSigil();limbDetails(true);
  if(rich){const sky=group(head,0,1.10,-.02),halo=ring(sky,0,0,0,.49,metal,Math.PI/2-.18,.2);animate(halo,'spinZ',.12);ring(sky,0,0,0,.43,light,Math.PI/2+.18,-.2);for(let i=0;i<5;i++){const star=group(sky);gem(star,0,0,0,.045,light);plaque(star,BLADE,.022,.17,0,0,0,metal);animate(star,'orbit',i*Math.PI*2/5);}}
 }else if(cls==='reaper'){
  eachShoulder((g,s)=>{shell(g,s);for(let i=0;i<(rich?3:2);i++)horn(g,[[s*.04,.12,-.14+i*.14],[s*.20,.23,-.16+i*.14],[s*.36,.04,-.13+i*.14]],.041,metal);});for(const s of [-1,1])for(let i=0;i<3;i++)tube(body,[[s*.055,.15-i*.13,.34],[s*.17,.14-i*.13,.34],[s*.23,.24-i*.13,.20]],rich?.029:.021,metal);gem(body,0,.01,.36,rich?.085:.056);limbDetails(true);if(rich)plaque(head,BLADE,.17,.40,0,.68,.37,metal);
 }else if(cls==='paladin'){
  eachShoulder((g,s)=>{shell(g,s,1);if(rich)for(let i=0;i<4;i++)feather(g,s,s*(.09+i*.065),.23-i*.02,-.03-i*.02,.34-i*.035,.12,i%2?light:metal,.25+i*.16);});clothPanels();motif('sun');if(rich)for(const s of [-1,1])feather(head,s,s*.25,.57,-.17,.29,.11,metal,.70);
 }else if(cls==='necromancer'){
  clothPanels();eachShoulder((g,s)=>{shell(g,s);horn(g,[[s*.04,.09,-.09],[s*.17,.21,-.12],[s*.3,.04,-.16]],.034,ivory);if(rich){tube(body,[[s*.26,.35,-.20],[s*.46,.48,-.16],[s*.58,.49,-.12]],.018,metal);const q=group(body,s*.58,.49,-.12);ring(q,0,0,0,.092,metal,Math.PI/2);ring(q,0,.20,0,.066,metal,Math.PI/2);for(let i=0;i<4;i++){let a=i*Math.PI/2;tube(q,[[Math.cos(a)*.088,0,Math.sin(a)*.088],[Math.cos(a)*.08,.12,Math.sin(a)*.08],[Math.cos(a)*.06,.2,Math.sin(a)*.06]],.010,ivory);}animate(gem(q,0,.09,0,.047),'breathe',s);}});for(let i=0;i<3;i++)for(const s of [-1,1])tube(body,[[s*.025,.12-i*.12,.355],[s*.18,.13-i*.12,.335],[s*.22,.23-i*.12,.20]],.018,ivory);limbDetails(true);
 }else if(cls==='ninja'){
  eachShoulder((g,s)=>{for(let i=0;i<3;i++)inset(g,SHIELD,.18,.18,s*(.055+i*.07),.07-i*.032,.15-i*.02,dark,-s*.4);});motif();if(rich){for(const s of [-1,1]){plaque(head,BLADE,.18,.35,s*.29,.74,-.05,metal,-s*.28);plaque(head,BLADE,.095,.24,s*.29,.74,-.023,enamel,-s*.28);}gem(head,0,.59,.31,.036);}
 }else if(cls==='berserker'){
  eachShoulder((g,s)=>{shell(g,s,1);for(let i=0;i<(rich?3:2);i++){let k=rich&&s===1?1.15:1;horn(g,[[s*.1,.07,-.17+i*.14],[s*.24,.27*k,-.16+i*.14],[s*.45,.22*k,-.10+i*.14]],rich?.062:.044,rich?ivory:metal);}});motif();for(const s of [-1,1])for(let i=0;i<4;i++)bead(body,s*(.09+i*.045),.16-i*.09,.31,.027,metal);
 }else if(cls==='pirate'){
  eachShoulder((g,s)=>{shell(g,s);for(let i=0;i<5;i++){const z=-.16+i*.075;tube(g,[[s*.1,.15,z],[s*.23,.13,z],[s*.26,-.05,z]],.014,metal);}});clothPanels();limbDetails();ring(body,0,-.14,.37,.095);plaque(body,BLADE,.061,.18,0,-.14,.39,light);for(const s of [-1,1])for(let i=0;i<4;i++)bead(body,s*.20,.15-i*.11,.33,.022);
  if(rich){const crown=new T.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2);crown.scale(.39,.34,.44);mesh(head,crown,enamel,0,.63,-.17);const brim=new T.Shape();for(let i=0;i<36;i++){let a=i*Math.PI/18,rad=.45+.045*Math.cos(3*a),x=Math.cos(a)*rad,y=Math.sin(a)*rad;i?brim.lineTo(x,y):brim.moveTo(x,y);}brim.closePath();const geo=new T.ShapeGeometry(brim);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){let a=Math.atan2(pos.getZ(i),pos.getX(i));pos.setY(i,.065+.13*Math.pow(Math.max(0,Math.cos(3*a)),2));}geo.computeVertexNormals();enamel.side=T.DoubleSide;mesh(head,geo,enamel,0,.71,-.09);const pts=[];for(let i=0;i<=36;i++){let a=i*Math.PI/18,rad=.45+.045*Math.cos(3*a);pts.push([Math.cos(a)*rad,.78+.13*Math.pow(Math.max(0,Math.cos(3*a)),2),Math.sin(a)*rad-.09]);}tube(head,pts,.017,metal);gem(head,0,.87,.32,.048);}
 }else if(cls==='chronomancer'){
  clothPanels();limbDetails(true);const q=group(body,0,.03,.35);ring(q,0,0,0,rich?.18:.14);mesh(q,new T.CylinderGeometry(rich?.15:.12,rich?.15:.12,.018,24),dark,0,0,0,Math.PI/2);for(let i=0;i<12;i++){const a=i*Math.PI/6;plaque(q,BLADE,.012,.036,Math.sin(a)*.122,Math.cos(a)*.122,.027,metal,-a);}const hand=group(q);plaque(hand,BLADE,.018,.18,0,.053,.036,light);animate(hand,'spinZ',-.21);gem(q,0,0,.044,.021);
  eachShoulder((g,s)=>{shell(g,s);if(rich){const gear=group(g,s*.17,.12,.18);ring(gear,0,0,0,.10);for(let i=0;i<10;i++){let a=i*Math.PI/5;plaque(gear,SHIELD,.04,.066,Math.sin(a)*.115,Math.cos(a)*.115,0,metal,-a);}animate(gear,'spinZ',s*.17);}});
 }else if(cls==='monk'){
  clothPanels(true);limbDetails(true);for(let i=0;i<13;i++){let a=i*Math.PI/12;bead(body,Math.cos(a)*.25,.18-Math.sin(a)*.25,.31,.038,i%3?metal:light);}eachShoulder((g,s)=>{for(let i=0;i<(rich?4:2);i++)feather(g,s,s*(.05+i*.067),.095-i*.015,-.05+i*.035,rich?.37:.22,rich?.23:.16,i%2?metal:enamel,.25+i*.3);});
 }else if(cls==='stormcaller'){
  clothPanels();limbDetails(true);chestSigil();eachShoulder((g,s)=>{shell(g,s);for(let i=0;i<(rich?3:2);i++){const pts=[[s*(.03+i*.07),.11,-.06],[s*(.13+i*.07),.30+i*.015,-.08],[s*(.12+i*.07),.17,-.04],[s*(.26+i*.05),.34-i*.025,-.10]];tube(g,pts,.018,metal);if(rich){const q=group(g);tube(q,pts.map(([x,y,z])=>[x,y,z+.012]),.005,light);animate(q,'pulse',i+s);}}});
  if(rich){const pts=[[-.32,.70,-.02],[-.27,.92,.05],[-.17,.79,.19],[0,1.04,.22],[.16,.80,.17],[.28,.93,.04],[.34,.71,-.02]];tube(head,pts,.027,metal);tube(head,pts.map(([x,y,z])=>[x,y-.035,z+.027]),.008,light);gem(head,0,.89,.26,.043);}
 }else if(cls==='warlock'){
  clothPanels();limbDetails(true);chestSigil();eachShoulder((g,s)=>{shell(g,s);if(rich){const seal=group(g,s*.15,.13,.16);ring(seal,0,0,0,.105,metal);for(let i=0;i<3;i++)plaque(seal,BLADE,.033,.14,Math.sin(i*2.094)*.05,Math.cos(i*2.094)*.05,.012,light,-i*2.094);animate(seal,'spinZ',s*.13);}});if(rich)for(const s of [-1,1])horn(head,[[s*.29,.60,-.17],[s*.44,.94,-.22],[s*.28,1.16,-.24]],.067,metal);
 }else if(cls==='skylancer'){
  eachShoulder((g,s)=>{for(let i=0;i<(rich?5:3);i++)feather(g,s,s*(.06+i*.065),.11-i*.025,-.09+i*.038,(rich?.49:.32)+i*.022,rich?.15:.11,i%2?enamel:metal,.8+i*.065);});motif();if(rich)for(const s of [-1,1])feather(head,s,s*.27,.57,-.14,.30,.10,metal,.8);
 }else if(cls==='bladedancer'){
  eachShoulder((g,s)=>{for(let i=0;i<(rich?(s===1?5:3):2);i++)feather(g,s,s*(.06+i*.05),.13-i*.022,.04-i*.025,rich?.40:.25,rich?.19:.14,i%2?enamel:metal,.3+i*.24);});motif();for(const s of [-1,1])for(let i=0;i<(rich?3:1);i++)feather(hips,s,s*(.23+i*.025),.095,.20,.21,.09,metal,s*.1+i*.22);
 }else if(cls==='beastmaster'){
  eachShoulder((g,s)=>{shell(g,s);horn(g,[[s*.08,.12,-.1],[s*.24,.33,-.1],[s*.37,.37,-.16]],rich?.05:.036,ivory);if(rich){horn(body,[[s*.37,.32,-.17],[s*.52,.56,-.14],[s*.61,.87,-.15],[s*.74,.96,-.20]],.054,ivory);for(let i=0;i<3;i++)horn(body,[[s*(.48+i*.047),.49+i*.106,-.14],[s*(.64+i*.058),.58+i*.11,-.12],[s*(.73+i*.055),.72+i*.10,-.15]],.026,ivory);}});for(let i=0;i<7;i++){const x=(i-3)*.066;horn(body,[[x,.22-Math.sin(i/6*Math.PI)*.1,.32],[x,.15-Math.sin(i/6*Math.PI)*.1,.36],[x+.008,.08-Math.sin(i/6*Math.PI)*.1,.32]],.026,ivory);}limbDetails(true);clothPanels(true);
 }else if(cls==='pyromancer'){
  clothPanels();limbDetails(true);chestSigil();eachShoulder((g,s)=>{shell(g,s,1);for(let i=0;i<4;i++)tube(g,[[s*(.07+i*.052),.105,.19],[s*(.07+i*.052),-.02,.23]],.010,light);if(rich)for(let i=0;i<3;i++){const f=group(body,s*(.43+i*.066),.42,-.09+i*.016);horn(f,[[0,0,0],[s*.036,.15,.005],[-s*.006,.31-i*.043,0]],.037,metal);horn(f,[[0,.02,.026],[s*.02,.13,.03],[0,.24-i*.035,.024]],.018,light);animate(f,'flame',i+s);}});
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
   const q=signature('Celestial armillary',head,0,1.10,-.02);
   for(const [i,rx,ry]of [[0,.28,.45],[1,-.34,-.55]]){const g=group(q);g.rotation.set(rx,ry,0);ring(g,0,0,0,.56-i*.035,trim,Math.PI/2);animate(g,'spinY',i?-.11:.08);}
   const moon=mesh(q,new T.TorusGeometry(.11,.025,5,18,Math.PI*1.45),light,0,.04,0,0,0,.3);animate(moon,'spinZ',.07);for(const s of [-1,1])gem(q,s*.15,.04,0,.025,trim);
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
   const q=signature('Folded silver fox seal',anchor('UpperArmL'),.15,.13,.20);
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
   eachShoulder((g,s)=>{for(let i=0;i<3;i++){const petal=group(g,s*(.10+i*.06),.16,-.09+i*.025);petal.rotation.z=-s*(.65+i*.18);plaque(petal,LEAF,.095,.24,0,.035,0,i%2?trim:enamel);animate(petal,'petal',s*(i+1));}});
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
 r.groups.forEach(batch);return r;
}
export function syncClassLook(root,cls,tier,M,time=0,motion=true){
 if(!root)return;const n=window.BFClassLooks?.valid(tier)||0,key=cls+':'+n;let r=records.get(root);if(r?.key!==key){clearClassLook(root);r=build(root,cls,n);}const t=motion?time:0;
 for(const a of r.moving){const {m,base,rotation,scale,speed}=a;m.position.copy(base);m.rotation.copy(rotation);m.scale.copy(scale);if(a.type==='spinZ')m.rotation.z+=t*speed;if(a.type==='spinY')m.rotation.y+=t*speed;if(a.type==='orbit'){m.position.set(Math.cos(t*.28+speed)*.51,Math.sin(t*.28+speed)*.065,Math.sin(t*.28+speed)*.51);m.rotation.y=-t*.28;}if(a.type==='breathe')m.position.y+=Math.sin(t*1.7+speed)*.012;if(a.type==='flame')m.scale.y*=1+(motion?Math.sin(t*2.5+speed)*.09:0);if(a.type==='pulse')m.scale.multiplyScalar(1+(motion?Math.sin(t*2+speed)*.035:0));if(a.type==='petal')m.rotation.z+=motion?Math.sin(t*.8+speed)*.035:0;}
 return {key,meshes:r.meshes,animated:r.moving.length,triangles:r.triangles};
}
