import * as T from './three.module.js';
import {mergeGeometries} from './jsm/utils/BufferGeometryUtils.js';

// Floor-level fittings keep existing walk-through healing areas unobstructed.
// One baked mesh, one emblem and one instanced charge arc per visible rest site.
const styles=[
 {name:'Field supplies',base:'#6c8b68',edge:'#b59a66',pale:'#eadcc1',dark:'#536450'},
 {name:'Cliff rest',base:'#b78f60',edge:'#dec18d',pale:'#ecdbb4',dark:'#76654c'},
 {name:'Keep refuge',base:'#79818a',edge:'#b5bfc4',pale:'#e0dbc6',dark:'#404d59'},
 {name:'Mountain spring',base:'#699eaf',edge:'#b2dce2',pale:'#f2f7e9',dark:'#365569'},
 {name:'Cooling station',base:'#595e68',edge:'#c99560',pale:'#efd8a8',dark:'#343c44'},
 {name:'Sailor’s rest',base:'#927447',edge:'#bd9a60',pale:'#efe5be',dark:'#3c6d76'},
 {name:'Palace sanctuary',base:'#d9d5bc',edge:'#cfad56',pale:'#fff0c6',dark:'#879b94'},
 {name:'Tower refuge',base:'#687386',edge:'#b9c3d4',pale:'#dbe3ee',dark:'#35414e'}
];
const cache=new Map(),baseMat=new T.MeshStandardMaterial({vertexColors:true,roughness:.82,metalness:.12});
const green=new T.MeshStandardMaterial({color:'#b7f6ca',emissive:'#387a57',emissiveIntensity:.45,roughness:.5});
const dim=new T.MeshStandardMaterial({color:'#626f6c',roughness:1});
const tickGeo=new T.BoxGeometry(.15,.045,.045),pose=new T.Object3D(),zero=new T.Matrix4().makeScale(0,0,0);
let group,world,pads,records=[],hint,drawn=new WeakSet();
function geometry(zone,infinite){
 const key=zone+':'+!!infinite;if(cache.has(key))return cache.get(key);
 const s=styles[zone]||styles[0],parts=[];
 const put=(geo,color,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{
  if(geo.index){const q=geo.toNonIndexed();geo.dispose();geo=q;}
  geo.deleteAttribute('uv');const c=new T.Color(color),a=new Float32Array(geo.attributes.position.count*3);for(let i=0;i<a.length;i+=3){a[i]=c.r;a[i+1]=c.g;a[i+2]=c.b;}
  geo.setAttribute('color',new T.BufferAttribute(a,3));geo.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(1,1,1)));parts.push(geo);
 };
 const box=(x,y,z,w,h,d,c,rot=0)=>put(new T.BoxGeometry(w,h,d),c,x,y,z,0,rot);
 const band=(radius,width,color,y=.095)=>put(new T.TorusGeometry(radius,width,4,32),color,0,y,0,Math.PI/2);
 put(new T.CylinderGeometry(1.01,1.07,.075,zone===3?6:zone===0?8:16),s.base,0,.035,0);
 band(.88,.035,s.edge);band(.99,.018,s.pale,.06);
 // Surrounding fittings lie below a normal step; the hero stands in the center.
 if(zone===0){
  for(const side of [-1,1]){box(side*.69,.105,0,.27,.10,.60,s.dark);for(const z of [-.17,.03,.23])put(new T.CylinderGeometry(.055,.055,.25,8),s.pale,side*.68,.18,z,0,0,Math.PI/2);box(side*.69,.17,-.32,.28,.015,.08,s.edge);}
 }else if(zone===1){
  for(let i=0;i<8;i++){const a=i*Math.PI/4;box(Math.cos(a)*.74,.09,Math.sin(a)*.74,.13,.045,.35,i%2?s.edge:s.dark,-a);}
  band(.57,.023,'#76bbb0');
 }else if(zone===2||zone===7){
  for(let i=0;i<8;i++){const a=i*Math.PI/4;box(Math.cos(a)*.78,.10,Math.sin(a)*.78,.22,.09,.11,s.dark,-a);put(new T.SphereGeometry(.035,6,4),s.edge,Math.cos(a)*.78,.17,Math.sin(a)*.78);}
  for(const x of [-.27,.27])box(x,.10,0,.025,.025,1.02,s.edge);
 }else if(zone===3){
  for(let i=0;i<6;i++){const a=i*Math.PI/3;put(new T.ConeGeometry(.105,.22,4),i%2?s.pale:s.edge,Math.cos(a)*.72,.15,Math.sin(a)*.72,0,a);}
  band(.57,.025,'#82c7c8');
 }else if(zone===4){
  for(let i=-3;i<=3;i++)box(i*.18,.08,0,.06,.055,1.13,s.dark);
  band(.73,.045,s.edge);for(const x of [-.77,.77]){box(x,.13,0,.19,.09,.23,s.pale);box(x,.19,0,.24,.035,.05,s.edge);}
 }else if(zone===5){
  for(let i=-3;i<=3;i++)box(0,.075,i*.20,1.2-Math.abs(i)*.09,.035,.16,i%2?s.edge:s.base);
  band(.70,.075,s.pale,.14);for(let i=0;i<4;i++){const a=i*Math.PI/2;box(Math.cos(a)*.70,.16,Math.sin(a)*.70,.19,.07,.17,s.dark,-a);}
 }else{
  for(let i=0;i<8;i++){const a=i*Math.PI/4;put(new T.OctahedronGeometry(.11),s.edge,Math.cos(a)*.73,.095,Math.sin(a)*.73,0,a,Math.PI/4);}
  band(.59,.03,s.pale);
 }
 if(infinite){band(1.12,.045,s.edge,.085);for(let i=0;i<8;i++){const a=i*Math.PI/4;box(Math.cos(a)*1.10,.06,Math.sin(a)*1.10,.19,.045,.06,s.pale,-a);}}
 const body=mergeGeometries(parts);parts.forEach(g=>g.dispose());body.computeBoundingSphere();
 const bars=[new T.BoxGeometry(.14,.035,.48),new T.BoxGeometry(.48,.035,.14)],cross=mergeGeometries(bars);bars.forEach(g=>g.dispose());
 const rec={body,cross,triangles:((body.index?.count||body.attributes.position.count)+(cross.index?.count||cross.attributes.position.count))/3};cache.set(key,rec);return rec;
}
function clear(){
 group?.removeFromParent();for(const r of records)r.arc.dispose();records=[];drawn=new WeakSet();window.__campaignRest3dDrawn=drawn;
}
function ensureHint(){
 if(hint?.isConnected)return;
 const css=document.createElement('style');css.textContent='#campaignRestHint{position:fixed;left:50%;bottom:130px;transform:translateX(-50%);z-index:7;max-width:calc(100vw - 40px);padding:7px 13px;border:1px solid #98d5b4;border-radius:9px;background:#152b28e8;color:#edf9ef;text-align:center;font:600 13px/1.35 Georgia,serif;pointer-events:none;box-shadow:0 2px 8px #0006}#campaignRestHint[hidden]{display:none}@media(max-height:600px){#campaignRestHint{bottom:108px;font-size:12px}}';document.head.append(css);
 hint=document.createElement('div');hint.id='campaignRestHint';hint.hidden=true;hint.setAttribute('role','status');document.body.append(hint);
}
export function syncCampaignRest(scene){
 const b=window.__BF3,g=b?.G,eligible=g&&!g.hub&&!g.trial&&!g.side&&!g.delve&&!g.devBriar&&Number.isInteger(g.zone)&&g.zone>=0&&g.zone<8;
 ensureHint();if(!eligible){if(group)group.visible=false;hint.hidden=true;return;}
 if(world!==g||pads!==g.healpads){
  clear();world=g;pads=g.healpads;group=new T.Group();group.name='Campaign rest sites';scene.add(group);
  for(const pad of pads||[]){
   const model=geometry(g.zone,pad.infinite),node=new T.Group(),body=new T.Mesh(model.body,baseMat),emblem=new T.Mesh(model.cross,green),arc=new T.InstancedMesh(tickGeo,green,12),matrices=[];
   emblem.position.y=.13;body.receiveShadow=true;node.add(body,emblem,arc);node.scale.setScalar(pad.r||32);group.add(node);
   for(let i=0;i<12;i++){const a=i*Math.PI/6;pose.position.set(Math.sin(a)*.43,.11,Math.cos(a)*.43);pose.rotation.set(0,a,0);pose.scale.set(1,1,1);pose.updateMatrix();matrices.push(pose.matrix.clone());arc.setMatrixAt(i,pose.matrix);}
   arc.computeBoundingSphere();records.push({pad,node,emblem,arc,matrices,shown:-1,triangles:model.triangles+144});
  }
 }
 if(group.parent!==scene)scene.add(group);group.visible=true;let nearest=null,nearDistance=Infinity,visible=0;
 for(const r of records){
  const p=r.pad,d=Math.hypot(p.x-g.p.x,p.z-g.p.z),level=Math.abs((p.y||0)-g.p.y);r.node.position.set(p.x,(p.y||0)+2,p.z);r.node.visible=d<850;
  if(!r.node.visible){drawn.delete(p);continue;}drawn.add(p);visible++;
  const usable=!p.locked&&(p.infinite||p.charge>0),lit=usable?(p.infinite?12:Math.ceil(Math.max(0,Math.min(1,p.charge))*12)):0;
  r.emblem.material=usable?green:dim;
  if(lit!==r.shown){r.shown=lit;for(let i=0;i<12;i++)r.arc.setMatrixAt(i,i<lit?r.matrices[i]:zero);r.arc.instanceMatrix.needsUpdate=true;}
  const active=usable&&d<(p.r||32)+g.p.r*.6&&level<30&&g.p.hp<b.effMaxHp(g.p)-.05;
  r.emblem.scale.setScalar(active?1+Math.sin((g.time||0)*6)*.12:1);
  if(d<Math.max(90,(p.r||32)+45)&&level<30&&d<nearDistance&&b.enemyMeleeClear(g.p,{...p,h:40})){nearest=p;nearDistance=d;}
 }
 window.__campaignRest3dDrawn=drawn;window.__CAMPAIGN_REST_STATS={sites:records.length,visible,triangles:records.filter(r=>r.node.visible).reduce((n,r)=>n+r.triangles,0)};
 hint.hidden=!nearest||b.mode!=='play';if(hint.hidden)return;
 const p=nearest,locked=p.storyPad?'Healing spring · help Mara restore it':p.courtPad?'Restore the courtyard water to heal here':g.zone===3?'Light the camp heater to use these supplies':'Restore this rest site to heal here';const text=p.locked?locked:!p.infinite&&p.charge<=.001?'Rest supplies used up':g.p.hp>=b.effMaxHp(g.p)-.05?'Health full · '+(p.infinite?'unlimited healing here':Math.ceil(p.charge*40)+'% HP still available'):'Stand on the emblem to heal · '+(p.infinite?'unlimited':Math.ceil(p.charge*40)+'% HP available');
 if(hint.textContent!==text)hint.textContent=text;
}
