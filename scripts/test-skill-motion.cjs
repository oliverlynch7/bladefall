const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),api=require('../public/3d/skill-motion.js');
let checks=0;function ok(v,n){assert(v,n);checks++;}
const html=fs.readFileSync('public/3d/index.html','utf8'),a=html.indexOf('const CLASS2='),b=html.indexOf('const PASSIVE_ART',a),ctx={classIcon:()=>'',skillIcon:()=>''};vm.createContext(ctx);vm.runInContext(html.slice(a,b)+';this.classes=CLASS2;',ctx);api.configure(ctx.classes);
const catalog=JSON.parse(fs.readFileSync('public/3d/skill-motion-catalog.json','utf8'));
ok(catalog.length===136&&Object.keys(api.profiles).length===136,'every current skill covered');ok(JSON.stringify(catalog)===JSON.stringify(Object.values(api.profiles)),'preview catalog exactly matches live choices');
for(const d of catalog){
 const p={x:7,y:11,z:23,hp:94,mana:81,weapon:{art:'hammer'},vx:17,vz:2};const before=JSON.stringify(p);ok(api.pose(p,d.id),'pose starts '+d.id);ok(p.combatPose.duration>=.3&&p.combatPose.duration<=.75,'bounded action '+d.id);const pose=p.combatPose;delete p.combatPose;ok(JSON.stringify(p)===before,'no gameplay movement/stat mutation '+d.id);ok(api.valid(pose)?.skill===d.id,'co-op roundtrip '+d.id);
 for(let i=0;i<=100;i++){const s=api.sample(d.id,i/100);ok(s&&Object.values(s).filter(Array.isArray).flat().every(Number.isFinite),'finite choreography '+d.id+' '+i);ok(s.weight>=0&&s.weight<=1,'bounded blend '+d.id);ok(Math.hypot(...s.body)<.25,'no large root displacement '+d.id);}
 ok(api.sample(d.id,0).weight===0&&api.sample(d.id,1).weight===0,'neutral boundaries '+d.id);
}
for(const raw of [null,{}, {skill:'__proto__',serial:1,remaining:1},{skill:'w_cleave',serial:NaN,remaining:.2},{skill:'w_cleave',serial:1,remaining:Infinity},{skill:'w_cleave',serial:1,remaining:-.1},{skill:'w_cleave',serial:1.1,remaining:.1}])ok(!api.valid(raw),'reject malformed remote pose');
ok(api.valid({skill:'w_stomp',serial:1,remaining:999,duration:999,action:'danger'}).remaining===.64,'remote cannot choose duration/action');
ok(api.sample('bsk_bash',.34).torso[0]>.6&&api.sample('bsk_bash',.34).body[2]>.1,'headbutt lowers head and leans into contact');
ok(api.sample('w_stomp',.34).torso[0]>.5&&api.sample('w_stomp',.34).right[1]<.8,'slam bends to ground');
ok(api.sample('w_cleave',.16).right[0]<0&&api.sample('w_cleave',.66).right[0]>0,'cleave sweeps across front');
ok(api.sample('mon_whirl',.4).kick>0&&api.sample('mon_whirl',.4).stow,'kick extends a leg with weapons safely stowed');
const artBox={window:{BFSkillMotion:api}};vm.runInNewContext(fs.readFileSync('public/3d/combat-art.js','utf8'),artBox);artBox.window.BF_COMBAT_ART.configure(ctx.classes);const p={};artBox.window.BF_COMBAT_ART.pose(p,'bsk_bash');ok(p.combatPose.skill==='bsk_bash','actual combat-art dispatcher uses semantic animation');artBox.window.BF_COMBAT_ART.tick({p},.6);ok(p.combatPose.remaining===0,'actual game tick ends action');
const mobile={dodgeTimer:.22};api.pose(mobile,'r_tumble');artBox.window.BF_COMBAT_ART.tick({p:mobile},.016);ok(mobile.combatPose.remaining>0&&api.valid(mobile.combatPose).duringDodge,'skill-owned dash does not cancel itself');ok(html.includes('if(p.combatPose?.skill)p.combatPose.remaining=0;'),'explicit accepted dodge cancels even mobility skill');
const motionSource=html.slice(html.indexOf('  motion(raw){'),html.indexOf('  selfState(){'));const box={window:{BFSkillMotion:api},BFEmotes:{valid:()=>null},performance:{now:()=>5000}};vm.runInNewContext('this.mp={'+motionSource+'}',box);for(const d of catalog){const input={pose:{skill:d.id,remaining:.2,serial:12},vx:10};ok(box.mp.motion(input).pose.skill===d.id,'real MP sanitizer preserves '+d.id);}ok(box.mp.motion({pose:{clip:'Spell2',serial:1,remaining:.4}}).pose.clip==='Spell2','legacy travel/spell clips retained');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(m[1].trim()&&!/type=["'](?:module|importmap)/.test(m[0].slice(0,m[0].indexOf('>'))))new vm.Script(m[1]);
ok(html.includes('if(q.motion?.pose)q.motion.pose.remaining=Math.max(0,q.motion.pose.remaining-dt);'),'existing peer tick ages casts exactly once');

ok(html.includes('meta.autoAttack && !(p.combatPose?.skill&&p.combatPose.remaining>0) && autoAtkTarget'),'automatic basic attacks yield to explicit skill action');
console.log(JSON.stringify({passed:true,checks,skills:catalog.length}));
