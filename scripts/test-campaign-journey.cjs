const assert=require('node:assert/strict');
const journey=require('../public/3d/campaign-journey.js');
const ascent=require('../public/3d/long-ascent.js');
let checks=0;const check=(name,value)=>{assert.ok(value,name);checks++;};
check('Exactly ten remaining campaign halves',Object.keys(journey.areas).length===10);
for(const [key,a]of Object.entries(journey.areas)){
 const [zone,area]=key.split(':').map(Number),g={zone,area,obstacles:a.signs.map(([x,z,y])=>({kind:'plat',x,z,h:y,w:300,d:300})),storyState:{flags:{}},p:{x:0,y:0,z:0}};
 journey.install(g);const count=g.obstacles.length;journey.install(g);
 check(key+' collision installation is idempotent',g.obstacles.length===count&&g.obstacles.filter(o=>o.journeySign!==undefined).length===a.signs.length);
 check(key+' retains supported authored sign heights',g.journeySigns.every(s=>a.signs.some(q=>s.x===q[0]&&s.z===q[1]&&s.y===q[2])));
 check(key+' reveals no shard or secret coordinates',g.journeySigns.every(s=>!/shard|secret|treasure|reward/i.test(s.title+' '+s.detail)));
 check(key+' leaves unrelated targets alone',journey.guide(g,{x:8,z:12,y:3,key:'unrelated'}).key==='unrelated');
}
check('No layer in a trial',!journey.entry({zone:3,area:0,trial:'mage'}));
check('No layer in a boss arena',!journey.entry({zone:7,area:-1}));
for(const [i,key]of [[20,'la.lower'],[140,'la.upper'],[210,'la.summit']]){
 const p=ascent.path[i],g={zone:7,area:1,p:{x:p[0],z:p[1],y:p[2]},storyState:{flags:{}}},target={key,x:0,z:1100,y:2000};const next=journey.guide(g,target),expected=ascent.path[i===140?144:i+3];
 check('Spiral guide stays on current storey '+i,next.journeyVia&&next.x===expected[0]&&next.z===expected[1]&&next.y===expected[2]);
}
const p=ascent.path[210],g={zone:7,area:1,p:{x:p[0],z:p[1],y:p[2]},storyState:{flags:{}}};check('Summit guard guidance follows the stair too',journey.guide(g,{x:0,z:950,y:2000,navLabel:'Clear the guards'}).journeyVia);
const ice={zone:6,area:1,p:{x:-900,z:-1400,y:60},storyState:{flags:{}},storyObjects:[{key:'sl.maintenance',x:-1110,z:-1600,y:60}]};check('Lower library route guides to its actual latch',journey.guide(ice,{key:'hugh',x:-220,z:-1250,y:200}).key==='sl.maintenance');
console.log('Campaign journey: '+checks+' coverage, collision and floor-aware guidance checks passed.');

const feedback=require('../public/3d/puzzle-feedback.js');
const solved=feedback.notice({effects:[{type:'waterworks',id:'ic.lock',action:'drain'}]},{flags:{},items:{}},{flags:{'ic.lock.open':true},items:{}},{key:'ic.lock.3'},'ice');
assert.equal(solved.title,'Ice crossing secured');assert.match(solved.text,/far drain/);console.log('Ice crossing gives its concrete outcome.');

const fs=require('node:fs'),path=require('node:path');
for(const moduleName of ['deep-art','campaign-craft-scene']){const imports=new Set();for(const file of fs.readdirSync(path.join(__dirname,'../public/3d'))){if(!file.endsWith('.js'))continue;const source=fs.readFileSync(path.join(__dirname,'../public/3d',file),'utf8');for(const m of source.matchAll(new RegExp(moduleName+'\\.js\\?v=([^\x27\"]+)','g')))imports.add(m[1]);}assert.equal(imports.size,1,moduleName+' must share one cache instance');}
console.log('Rendering modules share their asset and scene instances.');

const snow={zone:3,area:0,p:{x:0,z:-4720,y:740},peaks:{corniceRidge:[{x:110,z:-4880,y:775},{x:245,z:-4990,y:810}]},storyState:{flags:{'event.ff.reflect.clue':true}}};
assert.equal(journey.guide(snow,{key:'ff.part',x:-150,z:-2110,y:380}).key,'ff.part','reading a later clue must not override an earlier required objective');
const step=journey.guide(snow,{clueId:'ff.reflect',x:-185,z:-5200,y:965});assert.equal(step.y,775);assert.equal(step.navLabel,'Climb the cornice ledges');
console.log('Cornice guidance selects a reachable ledge without overriding unrelated tasks.');

for(const mode of ['voyage','bonusActive','arena','bossRush','sprintFun','delve','endless','devKeep','devBriar'])assert.equal(journey.entry({zone:5,area:0,[mode]:true}),null,'No campaign dressing in '+mode);console.log('Campaign dressing stays out of voyages, challenges and beta maps.');

// Sparse destination signs belong to workers/visitors, never puzzle walkthroughs.
for(const key of ['3:1','5:0','5:1','7:0','7:1'])assert.equal(journey.areas[key].signs.length,0,key+' has no artificial trail boards');
for(const a of Object.values(journey.areas))for(const sign of a.signs)assert.doesNotMatch(sign.slice(3).join(' '),/wheel|key|pedal|seal|brake|cut|release|optional|climb|mirror|lock/i);
for(const [file,pattern] of [['hollow-cliffs.js',/const signs=\[\];/],['lost-canyon.js',/const signs=\[\];/],['prison-dungeons.js',/const SIGNS=\[\];/],['keep-journey-art.js',/const boards=\[\];/]])assert.match(fs.readFileSync(path.join(__dirname,'../public/3d',file),'utf8'),pattern,file+' removes boards at their shared visual/collision source');
console.log('In-world signage policy and removal contracts passed.');
