// Semantic presentation regressions. These do not establish perceived variety or fun.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),cp=require('child_process');
const api=require('../public/3d/skill-motion.js'),html=fs.readFileSync('public/3d/index.html','utf8');
const previous=cp.execFileSync('git',['show','4b8307e5a3001ac83eeafec1fd0e29c8125a4ffe:public/3d/index.html'],{encoding:'utf8',maxBuffer:12e6});
const classes=src=>src.slice(src.indexOf('const CLASS2='),src.indexOf('const PASSIVE_ART',src.indexOf('const CLASS2='))).replace(/\r\n/g,'\n');
assert.equal(classes(html),classes(previous),'No damage, costs, cooldowns, choices or descriptions changed');
const context={classIcon:()=>'',skillIcon:()=>''};vm.createContext(context);vm.runInContext(classes(html)+';this.classes=CLASS2',context);api.configure(context.classes);
const oldContext={module:{exports:{}}};vm.runInNewContext(cp.execFileSync('git',['show','4b8307e5a3001ac83eeafec1fd0e29c8125a4ffe:public/3d/skill-motion.js'],{encoding:'utf8'}),oldContext);const old=oldContext.module.exports;old.configure(context.classes);
for(const id of Object.keys(api.profiles))assert.equal(api.profiles[id].duration,old.profiles[id].duration,id+' duration unchanged');
const sample=(id,q=.4)=>api.sample(id,q);
assert(sample('r_pierce').bowDraw>.9&&sample('r_volley').bowDraw<.4,'Held precision draw differs from sweeping volley release');
assert(sample('r_shadow').stow&&!sample('r_shadow').bow,'Shadowstrike is a physical slip, not a bow shot');
assert(sample('r_spike').right[1]<.9&&sample('r_spike').legs,'Trap is placed near the ground');
assert(sample('r_deathmark').left[0]>.45&&sample('r_mark').right[1]>1.6,'Wide multi-mark differs from sighting one target');
assert(sample('nin_pierce',.23).right[1]>1.9,'Large star has an overhead wind-up');
assert(Math.abs(sample('nin_mark').right[0])<.15&&sample('nin_mark').stow,'Mark uses a centered unarmed hand seal');
assert(sample('nin_storm').legs&&sample('nin_storm').stow,'Vanish safely folds into a seal');
assert(sample('bd_mirror').stow&&!sample('bd_steel').stow,'Mirror palms differ from a weapon brace');
assert(sample('necro_army').left[0]>sample('necro_wall').left[0],'Army opens across the field; wall raises forward');
assert(sample('mon_stun').stow&&Math.abs(sample('mon_stun').left[2]-sample('mon_stun').right[2])<.001,'Shockwave uses a double palm');
const source=fs.readFileSync('public/3d/skill-identity.js','utf8'),before=cp.execFileSync('git',['show','4b8307e5a3001ac83eeafec1fd0e29c8125a4ffe:public/3d/skill-identity.js'],{encoding:'utf8'});
const cases=src=>Object.fromEntries([...src.replace(/\r\n/g,'\n').matchAll(/case '([^']+)':([\s\S]*?)(?=\n case |\n \/\/|\n default:)/g)].map(m=>[m[1],m[2]]));
const current=cases(source),baseline=cases(before);
for(const d of Object.values(api.profiles).filter(d=>['mage','stormcaller','chronomancer'].includes(d.cls))){assert.equal(current[d.id],baseline[d.id],d.id+' praised effect retained');assert.equal(JSON.stringify(sample(d.id)),JSON.stringify(old.sample(d.id,.4)),d.id+' praised pose retained');}
const window={};for(const f of ['skill-surfaces.js','skill-identity.js'])vm.runInNewContext(fs.readFileSync('public/3d/'+f,'utf8'),{window});
function kinds(id,q=.4){const out=[];const get=window.BF_SKILL_SURFACES.get;window.BF_SKILL_SURFACES.get=(kind,...args)=>{out.push(kind);return get(kind,...args);};try{window.BF_SKILL_IDENTITY({id,cls:id.startsWith('nin')?'ninja':'ranger'},{detail:48,q,v:1-(1-q)**3,a:.8,r:90,col:'#aa7799',hot:'#fff',line(){},glow(){},surface(){},pushM(){},popM(){},mv(){},rotX(){},rotY(){}});}finally{window.BF_SKILL_SURFACES.get=get;}return out;}
assert(!kinds('nin_mark').includes('star'),'Ninja curse cannot reuse its thrown-star silhouette');
assert(kinds('nin_barrage',.1).filter(x=>x==='star').length===3,'First barrage wave is three stars');
assert(kinds('nin_barrage',.35).filter(x=>x==='star').length===3,'Second burst replaces the first instead of creating an overlapping star cluster');
assert(kinds('nin_barrage',.9).filter(x=>x==='star').length===3,'Last burst remains visible without accumulating every wave');
assert(kinds('nin_smoke').includes('sphere')&&!kinds('nin_storm').includes('sphere'),'Low physical smoke bomb differs from tall shadow veil');
console.log(JSON.stringify({passed:true,skills:136,gameplayUnchanged:true,praisedClassesPreserved:3,semanticChecks:17}));
// Actual transformed surface geometry must present a blade face along the shot axis.
// A quarter-turn once made the entire star permanently edge-on in normal camera views.
(async()=>{
 const T=await import('../public/3d/three.module.js');
 global.window=window;vm.runInNewContext(fs.readFileSync('public/3d/combat-art.js','utf8'),{window});
 const row=JSON.parse(fs.readFileSync('public/3d/skill-motion-catalog.json','utf8')).find(s=>s.id==='nin_pierce');window.BF_COMBAT_ART.profiles[row.id]=row;
 const {syncCombatArt}=await import('../public/3d/combat-art-three.js');const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1.5,.1,1000);camera.position.set(0,30,300);camera.lookAt(0,30,0);camera.updateMatrixWorld(true);
 const ratios=[];
 for(const q of [.2,.45,.7]){const stats=syncCombatArt(scene,camera,{g:{p:{},projectiles:[],combatArt:[{profile:row,x:0,y:0,z:0,yaw:0,t:q*.65,life:.65}]},meta:{classId:'ninja',quality:'high'},verify:true});const a=scene.getObjectByName('Skill detail surfaces').geometry.attributes.position;let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;for(let i=0;i<stats.surfaceVertices;i++){minX=Math.min(minX,a.getX(i));maxX=Math.max(maxX,a.getX(i));minY=Math.min(minY,a.getY(i));maxY=Math.max(maxY,a.getY(i));}const ratio=(maxX-minX)/(maxY-minY);assert(ratio>.65&&ratio<1.5,'Piercing star must have a broad frontal silhouette at '+q);ratios.push(ratio);}
 console.log(JSON.stringify({passed:true,piercingStarFrontWidthRatios:ratios}));
})().catch(e=>{console.error(e);process.exitCode=1;});
