const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('public/3d/index.html','utf8');
function fn(name){const start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',start+10);assert(start>=0&&end>start,name);return source.slice(start,end).split('\nSKILL_FX.')[0];}
function method(name){const start=source.indexOf('  '+name+'('),end=source.indexOf('\n  },',start);assert(start>=0&&end>start,name);return source.slice(start,end+4).trim().replace(/,$/,'');}
const c={window:{},classIcon:x=>x,meta:{classId:'warrior',classes:{}},CLASS2_CHOICE_RANKS:[2,3,4,5,6,7,8,9],G:{time:0},hudUpdate(){},skillbarUpdate(){},addText(){},toast(){},effMaxHp:p=>p.maxHp,curSkills:()=>[],performance:{now:()=>100},classHeal(){},consumeRunes(){},ruptureCorrupt(){},applyElement(){},c2OnKill(){}};
c.classState=id=>c.meta.classes[id]||(c.meta.classes[id]={rank:10,xp:0,ch:{}});vm.createContext(c);
vm.runInContext(source.slice(source.indexOf('const CLASS2='),source.indexOf('const PASSIVE_ART='))+';this.defs=CLASS2;'+source.slice(source.indexOf('const CLASS_MANA='),source.indexOf('function effMagPower('))+';this.pools=CLASS_MANA;'+source.slice(source.indexOf('const SKILL_MANA='),source.indexOf('// Low-health and efficiency'))+';this.costs=SKILL_MANA;'+['c2def','c2ch','c2Passive','c2SkillOfSlot','c2CurSkills','gainMana','recoverMana','recoverBasicMana','skillManaCost','spendSkillMana'].map(fn).join('\n')+';this.mp={'+['takeHitResult','takePvpResult'].map(method).join(',')+'};',c);
let cases=0;const check=(v,message)=>{assert(v,message);cases++;};
function player(mana=0,maxMana=100){return{hp:100,maxHp:100,mana,maxMana,weapon:{sch:'phys'},x:0,y:0,z:0,h:50};}
function select(id,side='a'){c.meta.classId=id;const cs=c.classState(id);cs.rank=10;cs.ch=Object.fromEntries([2,4,6,8].map(r=>[r,c.defs[id]['r'+r][side].id]));return cs;}
const audit=[];
for(const[id,def]of Object.entries(c.defs)){
 for(const side of ['a','b']){
  select(id,side);const skills=[2,4,6,8].map(r=>def['r'+r][side]);const max=c.classMaxMana()+(id==='mage'?10:0),p=player(max,max);c.G.p=p;
  skills.forEach((s,i)=>{check(Object.hasOwn(c.costs,s.id),s.id+' explicit cost');const cost=c.skillManaCost(i,s);check(cost>0&&cost<max/2,s.id+' fits pool');const before=p.mana;c.spendSkillMana(p,i,s);check(Math.abs(p.mana-(before-cost))<1e-7||before<cost,s.id+' spend');p.mana=max;});
  check(skills.reduce((n,s,i)=>n+c.skillManaCost(i,s),0)<=max,id+' '+side+' full opening rotation affordable');
  const cd=[0,0,0,0];let firstDenied=null,casts=0,spent=0;p.mana=max;
  for(let tick=0;tick<1800;tick++){const dt=.05,t=tick*dt;for(let i=0;i<4;i++){cd[i]=Math.max(0,cd[i]-dt);if(cd[i]<=0){const paid=c.spendSkillMana(p,i,skills[i]);if(paid){casts++;spent+=paid;cd[i]=skills[i].cd;}else if(firstDenied==null)firstDenied=t;}}c.recoverMana(p,dt);}
  check(firstDenied!==null&&firstDenied<40,id+' '+side+' cannot cast every cooldown indefinitely');
  // A new rank2 character gets several uses, not one cast then a stall.
  const firstCost=c.skillManaCost(0,skills[0]);check(Math.floor(max/firstCost)>=3,id+' '+side+' opening skill usable at least3 times');
  audit.push({class:id,path:side,pool:max,costs:skills.map((s,i)=>c.skillManaCost(i,s)),firstMissedCastSec:firstDenied,casts90sec:casts,spent90sec:spent});
 }
}
select('warrior');let p=c.G.p=player();p._manaRecoveryDelay=4;c.recoverMana(p,4);check(Math.abs(p.mana-5.75)<1e-8,'four seconds slow recovery');c.recoverMana(p,1);check(Math.abs(p.mana-9.775)<1e-8,'then full recovery');
p=c.G.p=player();p._manaRecoveryDelay=2;c.recoverMana(p,4);check(Math.abs(p.mana-10.925)<1e-8,'crossing boundary integrates slow+fast accurately');
p=c.G.p=player();p.dead=true;c.recoverMana(p,4);check(p.mana===0,'no dead regen');p.dead=false;c.recoverMana(p,0);check(p.mana===0,'paused dt does not regenerate');
p=c.G.p=player(5);const old=p.mana;check(c.spendSkillMana(p,0,c.defs.warrior.r2.a)===0&&p.mana===old&&!p._manaRecoveryDelay,'failed cast spends nothing and does not postpone recovery');
p.mana=90;check(c.gainMana(p,100,false)===10&&p.mana===100,'refund capped');check(c.gainMana(p,NaN)===0&&c.gainMana(p,-8)===0&&p.mana===100,'invalid mana awards rejected');
p=c.G.p=player();c.G.time=0;for(let i=0;i<25;i++)c.recoverBasicMana(p);check(p.mana===1,'25 simultaneous targets yield one baseline mana');c.G.time=.64;c.recoverBasicMana(p);check(p.mana===1,'no rapid-hit exploit');c.G.time=.65;c.recoverBasicMana(p);check(p.mana===2,'next recovery after0.65 seconds');
select('mage');p=c.G.p=player(0,140);p.weapon.sch='mag';c.G.time=10;c.recoverBasicMana(p);check(p.mana===3,'Mage extra2 joins shared cadence');c.recoverBasicMana(p);check(p.mana===3,'Mage multi-target refund cannot multiply');
const basic=source.slice(source.indexOf('  mage(p, e, dmg){',source.indexOf('const CLASS_BASIC')),source.indexOf('\n  /* HARVEST',source.indexOf('const CLASS_BASIC'))).trim().replace(/,$/,'');vm.runInContext('this.mageBasic={'+basic+'}.mage;',c);
p.mana=40;check(c.mageBasic(p,{},10)===undefined&&p.mana===40,'Mage protects25% pool+cast cost');p.mana=41;check(c.mageBasic(p,{},10)===13.5&&p.mana===35,'Mage empowered hit reserves25%');
select('mage');c.classState('mage').ch[9]='m_manafont';p=c.G.p=player(0,150);p._manaRecoveryDelay=4;c.recoverMana(p,1);check(Math.abs(p.mana-2.071875)<1e-8,'Manafont regen keeps30% benefit');c.recoverMana(p,100);check(p.mana===150,'Manafont never exceeds real maximum');
select('warrior');p=c.G.p=player();const mp=c.mp;mp.guest=()=>true;mp._pendingEnemyHits=new Map();function receipt(token,overrides={}){mp._pendingEnemyHits.set(token,{at:100,world:c.G,player:p,cls:'warrior',rate:0,flat:0,hpDelta:0,manaDelta:0,bloodDelta:0,basicMana:true,...overrides});}
c.G.time=20;receipt('ok');mp.takeHitResult({token:'ok',dealt:10});check(p.mana===1,'guest confirmed basic grants baseline');mp.takeHitResult({token:'ok',dealt:10});check(p.mana===1,'duplicate receipt gives nothing');c.G.time=21;receipt('blocked');mp.takeHitResult({token:'blocked',dealt:0});check(p.mana===1,'rejected guest hit grants nothing');receipt('skill',{basicMana:false});mp.takeHitResult({token:'skill',dealt:10});check(p.mana===1,'guest skill grants no basic recovery');receipt('stale',{world:{}});mp.takeHitResult({token:'stale',dealt:10});check(p.mana===1,'old-world receipt gives nothing');
mp._pendingHits=new Map();mp.peers={};function pvp(token,overrides={}){mp._pendingHits.set(token,{time:100,target:'opponent',world:c.G,player:p,cls:'warrior',damage:10,ls:0,flatHeal:0,basicMana:true,...overrides});}
c.G.time=22;pvp('pvp');mp.takePvpResult({token:'pvp',by:'opponent',dealt:10});check(p.mana===2,'PvP confirmed basic has same recovery');c.G.time=23;pvp('immune');mp.takePvpResult({token:'immune',by:'opponent',dealt:0});check(p.mana===2,'invulnerable PvP target gives nothing');pvp('pvpSkill',{basicMana:false});mp.takePvpResult({token:'pvpSkill',by:'opponent',dealt:10});check(p.mana===2,'PvP skill gives no basic recovery');
check(!source.includes('if(weaponKill) gainMana(G.p,12'),'removed generic basic kill refill');check(source.includes("(c2Passive('m_manafont')?10:0)"),'Manafont maximum included in actual armor recomputation');
if(process.env.MANA_REPORT){fs.mkdirSync('docs/art-validation/mana-economy-20261017',{recursive:true});fs.writeFileSync('docs/art-validation/mana-economy-20261017/class-pacing.json',JSON.stringify(audit,null,2));}
console.log(`${cases} mana coverage,34 class paths, recovery, reserve, area-hit and co-op/PvP receipt checks passed.`);
