import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as T from '../public/3d/three.module.js';
import {AURA_THEMES,createClassAura,syncClassAura} from '../public/3d/class-aura3d.js';
const motifs=new Set(),shapes=new Set(),textures=new Set();let checks=0;
const ok=(name,v)=>{assert(v,name);checks++;},snapshot=a=>JSON.stringify({points:[...a.motePositions.array],brightness:[...a.moteColors.array],glow:a.glowMat.opacity,wash:a.wash.material.opacity,size:a.moteMat.size});
for(const [cls,theme]of Object.entries(AURA_THEMES)){
 const parent=new T.Group(),a=createClassAura(parent,cls),otherParent=new T.Group(),b=createClassAura(otherParent,cls);
 ok(cls+' attaches its own effect',a.group.parent===parent&&b.group.parent===otherParent&&a.group!==b.group);
 const before=snapshot(b);syncClassAura(a,8);ok(cls+' animation is actor-local',snapshot(b)===before);
 const draws=[];a.group.traverse(n=>{if(n.material){draws.push(n);for(const m of Array.isArray(n.material)?n.material:[n.material]){ok(cls+' depth-tested transparent effect',m.depthTest&&!m.depthWrite&&m.transparent&&m.blending===T.AdditiveBlending);textures.add(m.map);}}});
 ok(cls+' at most four draws and twelve motes',draws.length===4&&a.stats.drawCalls===4&&a.motePositions.count===12);
 ok(cls+' transparent ribbons use one pass each',draws.filter(n=>n.isMesh).every(n=>n.material.forceSinglePass));
 const core=draws.find(n=>n.isMesh&&n.material===a.coreMat);shapes.add(createHash('sha256').update(Buffer.from(core.geometry.attributes.position.array.buffer)).digest('hex'));motifs.add(theme.motif);
 for(let i=0;i<120;i++){syncClassAura(a,i/30);ok(cls+' finite bounded particle cloud '+i,[...a.motePositions.array].every(Number.isFinite)&&[...a.moteColors.array].every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&Array.from({length:12},(_,j)=>Math.hypot(a.motePositions.getX(j),a.motePositions.getY(j)-.25,a.motePositions.getZ(j))).every(d=>d<2.3));}
 syncClassAura(a,0);if(['rise','fall'].includes(theme.motion))ok(cls+' cycle endpoints fade instead of popping',a.moteColors.getX(0)===0);
 syncClassAura(a,3,false);const frozen=snapshot(a);syncClassAura(a,97,false);ok(cls+' reduced motion freezes all effect values',snapshot(a)===frozen);
 syncClassAura(a,2,true,true);ok(cls+' low quality removes wash and motes',!a.wash.visible&&!a.motes.visible&&core.visible);
 syncClassAura(a,2,true,false);ok(cls+' quality can restore effects',a.wash.visible&&a.motes.visible);
 parent.scale.setScalar(52);syncClassAura(a,1);ok(cls+' particle size follows actor scale',Math.abs(a.moteMat.size-.075*52)<.0001);
 let geometries=0,materials=0;const uniqueG=new Set(draws.filter(n=>!n.isSprite).map(n=>n.geometry)),uniqueM=new Set(draws.map(n=>n.material));for(const g of uniqueG)g.addEventListener('dispose',()=>geometries++);for(const m of uniqueM)m.addEventListener('dispose',()=>materials++);
 a.dispose();ok(cls+' actor resources disposed once',geometries===uniqueG.size&&materials===uniqueM.size&&a.group.parent===null);
 ok(cls+' disposing actor does not remove ally effect',b.group.parent===otherParent);b.dispose();
}
ok('17 distinct named motifs',motifs.size===17);ok('17 different authored silhouette geometries',shapes.size===17);ok('bounded shared texture cache',textures.size<=10);
for(const tex of textures){const a=tex.image.data;ok('texture has visible energy and transparent corners',a.some((v,i)=>i%4===3&&v>100)&&a[3]===0&&a[a.length-1]===0);}
const current=JSON.parse(fs.readFileSync('docs/art-validation/reference-wardrobe-20261016/rigs.json','utf8'));
for(const r of current.rows){ok(r.cls+' aura only at Rank 10',r.tier===2?r.aura?.drawCalls===4:!r.aura);}
console.log(JSON.stringify({checks,classes:17,uniqueSilhouettes:shapes.size,sharedTextures:textures.size,referenceOutfits:51,depthTest:true,resourcesIndependent:true}));
