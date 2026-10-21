import * as T from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';

// Shared recolored head maps are bounded to this finite roster; geometry, skin
// pixels and player/source maps remain intact. Never recolor a hood as hair.
const hairMaps=new Map();
const garmentMasks=new Map(),garmentMaps=new Map();
export function tintNpcGarments(root,p){
 root.traverse(o=>{if(!o.isSkinnedMesh||!o.geometry.attributes.skinIndex)return;
  const a=o.geometry.attributes,idx=o.geometry.index,source=o.material.userData?._srcMap;
  if(!source?.image?.width||!o.material.map?.image?.width)return;
  const size=512,key=o.geometry.uuid+':'+source.uuid+':'+p.cloth;let tex=garmentMaps.get(key);
  if(!tex){const maskKey=o.geometry.uuid+':'+source.flipY;let mask=garmentMasks.get(maskKey);
   if(!mask){const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d');ctx.fillStyle='#fff';const count=idx?idx.count:a.position.count;
    const fabric=v=>{let weight=0;for(let k=0;k<4;k++){const bone=o.skeleton.bones[a.skinIndex.array[v*4+k]],name=bone?.name||'';if(/^(Torso|Abdomen|Body|Hips|UpperLeg)/.test(name))weight+=a.skinWeight.array[v*4+k];}return weight;};
    for(let i=0;i<count;i+=3){const vs=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);if(vs.reduce((sum,v)=>sum+fabric(v),0)<1.8)continue;ctx.beginPath();vs.forEach((v,k)=>{const x=a.uv.getX(v)*size,y=(source.flipY?1-a.uv.getY(v):a.uv.getY(v))*size;k?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.fill();}mask=ctx.getImageData(0,0,size,size).data;garmentMasks.set(maskKey,mask);
   }
   const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(o.material.map.image,0,0,size,size);const out=ctx.getImageData(0,0,size,size);ctx.clearRect(0,0,size,size);ctx.drawImage(source.image,0,0,size,size);const src=ctx.getImageData(0,0,size,size).data,rgb=[1,3,5].map(i=>parseInt(p.cloth.slice(i,i+2),16));
   for(let i=0;i<src.length;i+=4){if(mask[i+3]<200)continue;const max=Math.max(src[i],src[i+1],src[i+2]),min=Math.min(src[i],src[i+1],src[i+2]);
    // Light warm pixels are exposed skin. Brown fabric on these six rigs is
    // otherwise indistinguishable from leather by hue alone; use its UV/bones.
    const skin=src[i]>src[i+1]&&src[i+1]>src[i+2]&&max>=116&&(max-min)/Math.max(1,max)<.65;
    if(skin)continue;const shade=.26+.74*max/255;for(let j=0;j<3;j++)out.data[i+j]=rgb[j]*shade;
   }
   ctx.putImageData(out,0,0);tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.flipY=source.flipY;tex.wrapS=source.wrapS;tex.wrapT=source.wrapT;garmentMaps.set(key,tex);
  }o.material.map=tex;o.material.needsUpdate=true;
 });
}
export function tintNpcHair(root,p){
 if(!p.hair||!['Monk','Wizard','Cleric'].includes(p.model))return;
 root.traverse(o=>{if(!o.isMesh||!(/^(Head|Face)(?:_\d+)?$/.test(o.name)||o.name==='Monk001'))return;
  for(const m of (Array.isArray(o.material)?o.material:[o.material])){const src=m.map,img=src?.image;if(!img?.width)continue;const key=src.uuid+':'+p.hair;let tex=hairMaps.get(key);
   if(!tex){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,512,512);const data=ctx.getImageData(0,0,512,512),rgb=[1,3,5].map(i=>parseInt(p.hair.slice(i,i+2),16));for(let i=0;i<data.data.length;i+=4){const px=data.data,max=Math.max(px[i],px[i+1],px[i+2]),min=Math.min(px[i],px[i+1],px[i+2]);if(max>30&&max-min<max*.15){const shade=.28+.72*max/255;for(let j=0;j<3;j++)px[i+j]=rgb[j]*shade;}}ctx.putImageData(data,0,0);tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.flipY=src.flipY;tex.wrapS=src.wrapS;tex.wrapT=src.wrapT;hairMaps.set(key,tex);}m.map=tex;m.needsUpdate=true;
  }
 });
}

// Costume pieces are authored in the kit's bind-space metres. A fitting's origin
// is the bone's bind position, NOT its animated position or the world's origin.
export function fitNpcCostume(root,p){
 const groups=[],geometries=new Set(),materials=[],restores=[],hidden=[],parts=[];
 let skeleton;root.traverse(o=>{if(!skeleton&&o.isSkinnedMesh)skeleton=o.skeleton;});
 if(!skeleton)return {stats:{meshes:0,triangles:0},dispose(){}};
 const norm=s=>s.replace(/[^a-z]/gi,'').toLowerCase(),bones=new Map(skeleton.bones.map((b,i)=>[norm(b.name),{b,inv:skeleton.boneInverses[i]}]));
 const anchors=new Map();
 function anchor(name){if(anchors.has(name))return anchors.get(name);const e=bones.get(norm(name));if(!e)return null;const pos=new T.Vector3().setFromMatrixPosition(e.inv.clone().invert()),g=new T.Group();g.name='NPC fitting · '+name;g.userData.npcFitting=true;e.inv.clone().multiply(new T.Matrix4().makeTranslation(pos.x,pos.y,pos.z)).decompose(g.position,g.quaternion,g.scale);e.b.add(g);anchors.set(name,g);groups.push(g);return g;}
 const material=(color,metalness=0,roughness=.86,glow=0)=>{const m=new T.MeshStandardMaterial({color,metalness,roughness,emissive:glow?color:0,emissiveIntensity:glow});materials.push(m);return m;};
 const cloth=material(p.cloth),leather=material(p.leather),metal=material(p.metal,.48,.48),trim=material(p.accent,.12,.65),linen=material('#e6d7b9'),ink=material('#3c4148'),glow=material(p.accent,.12,.4,.35);
 const body=anchor('Torso'),hips=anchor('Hips'),head=anchor('Head');
 const part=(g,geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{if(!g){geo.dispose();return null;}const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.userData.npcFitting=true;g.add(m);parts.push(m);return m;};
 const box=(g,w,h,d,x,y,z,mat=leather,rz=0)=>part(g,new T.BoxGeometry(w,h,d),mat,x,y,z,0,0,rz);
 const sphere=(g,r,x,y,z,mat=trim)=>part(g,new T.SphereGeometry(r,10,7),mat,x,y,z);
 const tube=(g,points,r=.01,mat=trim)=>part(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(a=>new T.Vector3(...a))),Math.max(8,points.length*4),r,6,false),mat);
 const ring=(g,r,x,y,z,mat=metal,rx=0,ry=0)=>part(g,new T.TorusGeometry(r,.012,6,24),mat,x,y,z,rx,ry);
 const panel=(g,w,h,x,y,z,mat=cloth)=>{const s=new T.Shape();s.moveTo(-w/2,h/2);s.lineTo(w/2,h/2);s.lineTo(w*.46,-h*.34);s.quadraticCurveTo(0,-h*.58,-w*.46,-h*.34);s.closePath();return part(g,new T.ExtrudeGeometry(s,{depth:.022,bevelEnabled:true,bevelSize:.009,bevelThickness:.006,bevelSegments:1,steps:1,curveSegments:4}),mat,x,y,z);};
 const clasp=(g,x,y,z,r=.035)=>{sphere(g,r,x,y,z,metal).scale.z=.45;sphere(g,r*.46,x,y,z+.017,trim).scale.z=.4;};
 const buttons=(count=3,x=.11,y=.18,z=.332)=>{for(let i=0;i<count;i++)clasp(body,x,y-i*.10,z,.018);};
 function vest(apron=false){panel(body,apron?.48:.42,apron?.68:.43,0,apron?-.12:.045,.305,apron?leather:cloth);for(const s of [-1,1]){tube(body,[[s*.19,.31,.22],[s*.15,.17,.32],[s*.11,.08,.34]],.017,apron?leather:trim);}if(apron){box(body,.27,.13,.027,0,-.13,.347,cloth);for(const x of [-.11,.11])clasp(body,x,-.10,.365,.012);}else buttons();}
 function sash(){box(body,.075,.52,.035,.02,.02,.327,trim,-.55);clasp(body,.15,.21,.354);}
 function pouch(x=.31,y=-.08,z=.15,mat=leather){panel(body,.19,.22,x,y,z,mat);box(body,.18,.055,.035,x,y+.068,z+.029,mat);clasp(body,x,y+.012,z+.055,.019);}
 function book(x=-.32,y=-.06,z=.12){box(body,.18,.25,.075,x,y,z,leather,-.1);box(body,.145,.222,.079,x,y,z,linen,-.1);box(body,.18,.25,.012,x,y,z+.047,cloth,-.1);box(body,.035,.25,.018,x-.067,y,z+.055,trim,-.1);clasp(body,x+.045,y,z+.064,.018);}
 function beltTools(kind){for(let i=0;i<(kind==='keys'?3:2);i++){let x=.24+i*.058;if(kind==='keys'){ring(body,.033,x,-.04,.28);box(body,.012,.14,.015,x,-.125,.28,metal);box(body,.045,.018,.025,x+.012,-.19,.28,metal);}else if(kind==='vials'){const m=part(body,new T.CylinderGeometry(.027,.029,.12,10),trim,x,-.10,.28);box(body,.042,.025,.043,x,-.025,.28,leather);ring(body,.029,x,-.11,.31,metal,Math.PI/2);}else{box(body,.025,.21,.027,x,-.10,.22,leather);box(body,.09,.05,.06,x,-.01,.22,metal);}}}
 function backRoll(){part(body,new T.CylinderGeometry(.12,.12,.56,14),cloth,0,.12,-.30,0,0,Math.PI/2);for(const x of [-.18,.18])ring(body,.124,x,.12,-.30,leather,0,Math.PI/2);}
 function rope(){for(let i=0;i<3;i++)ring(body,.105,.30,-.015,-.04+i*.028,linen);tube(body,[[.31,-.12,.02],[.34,-.22,.06],[.30,-.29,.10]],.014,linen);}
 function scarf(){const m=part(body,new T.TorusGeometry(.24,.045,7,24),trim,0,.28,.02,Math.PI/2);panel(body,.13,.30,-.17,.02,.325,trim);return m;}
 function fur(){for(let i=0;i<11;i++){const a=i/10*Math.PI;const m=sphere(body,.068,Math.cos(a)*.29,.27-Math.sin(a)*.025,-.04+Math.sin(a)*.20,linen);m.scale.set(1.05,.65,.8);}}
 function badge(kind='shield'){if(kind==='shield'){panel(body,.13,.16,-.13,.13,.345,metal);panel(body,.085,.105,-.13,.133,.373,trim);}else if(kind==='sun'){ring(body,.07,0,.13,.36);for(let i=0;i<8;i++){const a=i*Math.PI/4;box(body,.012,.045,.016,Math.sin(a)*.105,.13+Math.cos(a)*.105,.36,metal,-a);}clasp(body,0,.13,.37,.041);}else {ring(body,.075,0,.13,.36);sphere(body,.025,0,.13,.38,trim);}}
 function cap(){// Small cloth work cap: leave the face and any existing hood clear.
  part(head,new T.SphereGeometry(.33,16,9,0,Math.PI*2,0,Math.PI*.43),cloth,0,.64,-.17);
  part(head,new T.TorusGeometry(.307,.024,6,28),leather,0,.64,-.17,Math.PI/2);
 }
 function tabard(){panel(body,.27,.65,0,-.09,.32,cloth);for(const s of [-1,1])box(body,.015,.51,.026,s*.10,-.07,.35,trim);badge();}
 function needle(){for(const s of [-1,1]){ring(body,.034,.29+s*.029,-.02,.28,metal);box(body,.014,.16,.015,.29+s*.02,-.11,.28,metal,s*.23);}tube(body,[[.22,.12,.35],[.12,.11,.37],[.10,.02,.37],[.19,-.01,.37]],.006,trim);}
 function feather(){const g=panel(head,.10,.34,.24,.65,-.17,linen);if(g)g.rotation.z=-.45;tube(head,[[.20,.5,-.13],[.24,.67,-.13],[.30,.80,-.13]],.008,trim);}
 if(p.model==='Rogue'&&!['ninja','reaper'].includes(p.detail)){
  // Open the source wrap for civilian faces. Keep its sculpted hood; a captain,
  // locksmith or scavenger should not look like another masked Ninja.
  root.updateMatrixWorld(true);let headBone;root.traverse(o=>{if(o.isBone&&o.name==='Head')headBone=o;});
  const invisible=new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false});materials.push(invisible);
  root.traverse(o=>{if(!o.isMesh||o.userData.npcFitting)return;const source=o.geometry,g=source.index?source.toNonIndexed():source.clone(),si=g.attributes.skinIndex,sw=g.attributes.skinWeight,position=g.attributes.position;let choose;
   if(o.isSkinnedMesh){if(!si||!sw){g.dispose();return;}const index=o.skeleton.bones.indexOf(headBone);choose=i=>{let w=0;for(let n=0;n<3;n++)for(let k=0;k<4;k++)if(si.getComponent(i+n,k)===index)w+=sw.getComponent(i+n,k);return w/3>.4;};}
   else if(o.name==='Face'){
    const tr=headBone.matrixWorld.clone().invert().multiply(o.matrixWorld),parents=Array.from({length:position.count/3},(_,i)=>i),weld=new Map(),find=i=>parents[i]===i?i:(parents[i]=find(parents[i]));
    for(let i=0;i<position.count;i++){const key=[position.getX(i),position.getY(i),position.getZ(i)].map(n=>Math.round(n*10000)).join(',');if(weld.has(key))parents[find(Math.floor(i/3))]=find(weld.get(key));else weld.set(key,Math.floor(i/3));}
    const components=new Map();for(let i=0;i<position.count;i++){const id=find(Math.floor(i/3)),b=components.get(id)||new T.Box3();b.expandByPoint(new T.Vector3().fromBufferAttribute(position,i).applyMatrix4(tr));components.set(id,b);}
    // Remove complete disconnected wrap/nose surfaces. Never punch individual
    // triangles out of the sculpted outer hood: that leaves jagged face edges.
    const removed=new Set([...components].filter(([,b])=>b.max.y<.45).map(([id])=>id));choose=i=>['pirate','captain'].includes(p.detail)||removed.has(find(i/3));
   }
   else {g.dispose();return;}
   g.clearGroups();let start=0,last=-1;for(let i=0;i<position.count;i+=3){const mat=choose(i)?1:0;if(mat!==last){if(last>=0)g.addGroup(start,i-start,last);start=i;last=mat;}}g.addGroup(start,position.count-start,last);restores.push({node:o,geometry:source,material:o.material});geometries.add(g);o.geometry=g;o.material=[o.material,invisible];
  });
  const skin=material('#bf926e'),skull=new T.SphereGeometry(1,16,12),a=skull.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i);a.setXYZ(i,x*.25,.29+y*.37,z>0?.20+x*.067-.02*y*y:-.18+z*.30);}skull.computeVertexNormals();part(head,skull,skin);sphere(head,.022,-.025,.20,.227,skin).scale.set(.7,1.15,.8);
 }
 // The Cleric kit's front is a metal plate. A tailor should have a real face,
 // not a helmet painted pink. Same measured front-surface rule as class looks;
 // retain the source hair and keep the rig/face frame unchanged.
 if(p.model==='Cleric'){
  let face;root.traverse(o=>{if(o.isMesh&&/^Head(?:_\d+)?$/.test(o.name))face=o;});
  if(face){const original=face.geometry,geo=original.index?original.toNonIndexed():original.clone(),pos=geo.attributes.position,parents=Array.from({length:pos.count/3},(_,i)=>i),weld=new Map();
   const find=i=>parents[i]===i?i:(parents[i]=find(parents[i]));
   for(let i=0;i<pos.count;i++){const key=[pos.getX(i),pos.getY(i),pos.getZ(i)].map(v=>Math.round(v*10000)).join(',');if(weld.has(key))parents[find(Math.floor(i/3))]=find(weld.get(key));else weld.set(key,Math.floor(i/3));}
   const components=new Map();for(let i=0;i<pos.count;i++){const id=find(Math.floor(i/3)),bb=components.get(id)||new T.Box3();bb.expandByPoint(new T.Vector3(pos.getX(i),pos.getY(i),pos.getZ(i)));components.set(id,bb);}
   const plates=new Set([...components].filter(([,b])=>b.min.z>.30&&b.max.x-b.min.x>.60&&b.max.y-b.min.y>.80).map(([id])=>id));
   if(plates.size){const invisible=new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false});materials.push(invisible);const regroup=(g,which)=>{g.clearGroups();let start=0,last=-1;for(let i=0;i<g.attributes.position.count;i+=3){const mat=which(i)?1:0;if(mat!==last){if(last>=0)g.addGroup(start,i-start,last);start=i;last=mat;}}g.addGroup(start,g.attributes.position.count-start,last);};
    regroup(geo,i=>plates.has(find(i/3)));restores.push({node:face,geometry:original,material:face.material});face.geometry=geo;face.material=[face.material,invisible];geometries.add(geo);
    const skin=material('#bd8e6b'),skull=new T.SphereGeometry(1,16,12),v=skull.attributes.position;for(let i=0;i<v.count;i++){const x=v.getX(i),y=v.getY(i),z=v.getZ(i);v.setXYZ(i,x*.33,.38+y*.44,z>0?.255-.035*x*x-.02*y*y:-.18+z*.41);}skull.computeVertexNormals();part(head,skull,skin);sphere(head,.026,0,.26,.272,skin).scale.set(.72,1.13,.9);
    root.traverse(node=>{if(!node.isSkinnedMesh)return;const headIndex=node.skeleton.bones.findIndex(b=>b.name==='Head');if(headIndex<0)return;const original=node.geometry,g=original.index?original.toNonIndexed():original.clone(),si=g.attributes.skinIndex,sw=g.attributes.skinWeight;if(!si||!sw){g.dispose();return;}const weight=i=>{let w=0;for(let k=0;k<4;k++)if(si.getComponent(i,k)===headIndex)w+=sw.getComponent(i,k);return w;};regroup(g,i=>(weight(i)+weight(i+1)+weight(i+2))/3>.4);restores.push({node,geometry:original,material:node.material});geometries.add(g);node.geometry=g;node.material=[node.material,invisible];});
   }else geo.dispose();
  }
  if(p.detail!=='paladin')root.traverse(o=>{if(o.isMesh&&o.name==='ShoulderPads'){hidden.push(o);o.visible=false;}});
 }
 // Give everyone a finished waist rather than a floating root-level prop.
 box(hips,.49,.065,.34,0,.10,0,leather);clasp(hips,0,.10,.19,.035);
 const d=p.detail;
 if(['father','carpenter','smith','armorer','captiveSmith','mason','boatbuilder','repairer'].includes(d)){
  vest(d!=='father');if(d==='father'){scarf();pouch();}else if(d==='carpenter'){beltTools('tools');box(body,.10,.27,.035,-.29,-.04,.21,linen,-.16);for(let i=0;i<4;i++)box(body,.066,.007,.009,-.29,-.13+i*.06,.235,ink);}
  else if(d==='mason'){beltTools('tools');pouch(-.30,-.07,.18);box(body,.23,.11,.035,0,-.15,.37,linen);}
  else if(d==='boatbuilder'){rope();beltTools('tools');}
  else if(d==='armorer'){badge();beltTools('tools');for(const x of [-.15,0,.15])clasp(body,x,-.25,.34,.018);}
  else if(d==='repairer'){beltTools('tools');rope();}
  else {beltTools('tools');if(d==='smith')cap();else box(body,.16,.075,.035,-.25,.16,.28,linen);}
 }else if(d==='medic'){
  vest();panel(body,.31,.55,0,-.08,.351,linen);box(body,.025,.12,.015,0,.07,.389,cloth);box(body,.10,.026,.015,0,.07,.39,cloth);beltTools('vials');
  for(let i=0;i<3;i++){part(body,new T.CylinderGeometry(.036,.036,.13,10),linen,-.27+i*.055,-.09,.24,Math.PI/2);}
 }else if(['guard','hollowOfficer','yardOfficer','palaceGuard','trainer','overseer','spiritKnight','shade'].includes(d)){
  tabard();sash();if(d==='trainer'){for(let i=0;i<3;i++)box(body,.04,.013,.018,-.14,.13-i*.035,.38,trim);}
  if(d==='overseer'){book();beltTools('keys');}else if(d==='hollowOfficer'||d==='yardOfficer'){beltTools('keys');for(const s of [-1,1])box(body,.14,.04,.09,s*.29,.26,.04,metal);}
  else if(d==='palaceGuard'||d==='spiritKnight')badge('sun');
  if(d==='guard')box(body,.19,.055,.045,.23,.10,.20,linen,-.15);
 }else if(['scout','shepherd','shepherdBoy','handler','climber','explorer','mountaineer','fisher','scavenger'].includes(d)){
  if(!['shepherd','handler','scout'].includes(d))vest();pouch();
  if(d==='scout'){sash();tube(body,[[-.25,.11,.29],[-.20,.18,.30],[-.14,.11,.31]],.014,linen);}
  if(['shepherd','shepherdBoy','handler'].includes(d)){scarf();rope();if(d==='handler'){for(let i=0;i<4;i++)sphere(body,.014,-.14+(i%2)*.037,.13-Math.floor(i/2)*.034,.35,linen);sphere(body,.035,-.12,.06,.35,linen).scale.set(1,.7,.35);}}
  if(['climber','explorer','mountaineer'].includes(d)){backRoll();rope();if(d!=='climber')fur();if(d==='explorer')book();}
  if(d==='fisher'){scarf();cap();tube(body,[[.27,-.02,.20],[.35,-.05,.20],[.35,-.13,.20],[.32,-.15,.20],[.30,-.12,.20]],.009,metal);}
  if(d==='scavenger'){sash();pouch(-.30,-.13,.15,cloth);}
 }else if(['locksmith','thief','escapee','refugee','organizer','servant'].includes(d)){
  vest(d==='organizer');if(['locksmith','thief'].includes(d)){beltTools('keys');pouch(-.31,-.05,.18);if(d==='locksmith')book();}
  else if(d==='servant'){box(body,.31,.30,.025,0,-.19,.352,linen);buttons(4);beltTools('keys');}
  else {scarf();box(body,.08,.055,.018,-.14,.03,.357,linen,.15);if(d==='refugee')backRoll();if(d==='organizer')book();}
 }else if(['merchant','tailor','researcher','archivist','librarian','caretaker'].includes(d)){
  vest();if(d==='merchant'){sash();pouch();for(let i=0;i<3;i++)sphere(body,.025,-.26+i*.045,-.08,.23,metal);book();}
  if(d==='tailor'){needle();panel(body,.15,.42,0,-.06,.35,trim);for(let i=0;i<7;i++)box(body,.04,.008,.006,.035,.10-i*.045,.382,ink);pouch();}
  if(['researcher','archivist','librarian'].includes(d)){book();pouch();if(d==='researcher'){beltTools('vials');for(const s of [-1,1])ring(head,.075,s*.10,.31,.30,metal);tube(head,[[-.03,.31,.30],[.03,.31,.30]],.009,metal);}else if(d==='archivist'){panel(body,.12,.61,-.14,-.07,.35,trim);panel(body,.12,.61,.14,-.07,.35,trim);}else {box(body,.045,.27,.028,.24,.11,.25,linen,-.22);}}
  if(d==='caretaker'){panel(body,.31,.52,0,-.12,.35,linen);badge('sun');beltTools('keys');}
 }else {
  // The mentors teach recognisable disciplines, with a restrained personal
  // silhouette rather than a copy of a player's legendary armour and aura.
  tabard();
  if(d==='berserker'){fur();for(const s of [-1,1]){tube(body,[[s*.20,.22,.15],[s*.29,.20,.22],[s*.32,.12,.22]],.022,linen);}sash();}
  if(d==='ninja'){sash();for(let i=0;i<3;i++)box(body,.016,.13,.016,-.23+i*.037,.08,.30,metal,-.30);}
  if(d==='reaper'){panel(body,.18,.24,0,.15,.36,linen);for(const s of [-1,1])sphere(body,.026,s*.041,.18,.394,ink).scale.z=.3;box(body,.025,.05,.018,0,.11,.394,ink);}
  if(d==='chronomancer'){ring(body,.12,0,.11,.36);for(let i=0;i<12;i++){const a=i*Math.PI/6;box(body,.010,.018,.012,Math.sin(a)*.092,.11+Math.cos(a)*.092,.38,metal,-a);}box(body,.010,.073,.012,0,.143,.39,trim);box(body,.056,.010,.012,.024,.11,.39,trim);book();}
  if(d==='pirate'||d==='captain'){sash();const hat=new T.Shape();hat.moveTo(-.55,0);hat.quadraticCurveTo(-.54,.10,-.24,.13);hat.quadraticCurveTo(0,.39,.24,.13);hat.quadraticCurveTo(.54,.10,.55,0);hat.quadraticCurveTo(0,-.11,-.55,0);part(head,new T.ExtrudeGeometry(hat,{depth:.70,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:2,curveSegments:10}),cloth,0,.56,-.43);tube(head,[[-.52,.57,.30],[-.24,.68,.30],[0,.83,.30],[.24,.68,.30],[.52,.57,.30]],.015,metal);clasp(head,0,.66,.32,.04);if(d==='captain')feather();}
  if(d==='paladin'){badge('sun');ring(head,.32,0,.95,-.17,metal);}
  if(d==='necromancer'){book();for(let i=0;i<7;i++){let a=i*Math.PI/6;sphere(body,.029,Math.cos(a)*.21,.22-Math.sin(a)*.17,.32,linen);}beltTools('vials');}
  if(d==='pyromancer'){for(const s of [-1,1]){tube(body,[[s*.12,-.25,.36],[s*.19,-.05,.36],[s*.11,.11,.36],[s*.21,.23,.29]],.012,trim);sphere(body,.045,s*.28,.22,.13,glow);}beltTools('vials');}
  if(d==='rift'){badge('circle');for(const s of [-1,1]){const q=part(body,new T.OctahedronGeometry(.07),glow,s*.25,.12,.23);q.scale.y=1.5;}book();}
 }
 // Merge fittings by anchor and surface: seams/studs do not each cost a draw.
 let meshes=0,triangles=0;
 for(const g of groups){const buckets=new Map();for(const m of [...g.children]){if(!m.isMesh)continue;m.updateMatrix();let geo=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();geo.applyMatrix4(m.matrix);const bucket=buckets.get(m.material)||[];bucket.push(geo);buckets.set(m.material,bucket);m.geometry.dispose();m.removeFromParent();}
  for(const [mat,list]of buckets){const geo=mergeGeometries(list,false);list.forEach(q=>q.dispose());if(!geo)continue;geometries.add(geo);const m=new T.Mesh(geo,mat);m.name='NPC costume · '+p.detail;m.userData.npcFitting=true;m.frustumCulled=false;g.add(m);meshes++;triangles+=geo.attributes.position.count/3;}
 }
 // These are small per-actor resources; nothing here mutates a source rig/map.
 let disposed=false;return {stats:{meshes,triangles,anchors:[...anchors.keys()]},dispose(){if(disposed)return;disposed=true;for(const a of restores){a.node.geometry=a.geometry;a.node.material=a.material;}hidden.forEach(o=>o.visible=true);groups.forEach(g=>g.removeFromParent());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
