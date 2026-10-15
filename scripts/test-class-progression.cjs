// Exercise the shipped class data/selectors, including inconsistent legacy choices.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('public/3d/index.html','utf8');
const fn=name=>{const start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',start+10);assert(start>=0&&end>start,name);return source.slice(start,end);};
const ctx={classIcon:id=>id,meta:{classId:'warrior',classes:{}},CLASS2_CHOICE_RANKS:[2,3,4,5,6,7,8,9]};
ctx.classState=id=>ctx.meta.classes[id]||(ctx.meta.classes[id]={rank:1,xp:0,ch:{}});
vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('const CLASS2='),source.indexOf('const PASSIVE_ART='))+'\nthis.definitions=CLASS2;'+['c2def','c2ch','c2Passive','c2SkillOfSlot','c2CurSkills','c2NextChoice'].map(fn).join('\n'),ctx);
let cases=0;
for(const [id,def] of Object.entries(ctx.definitions)){
 ctx.meta.classId=id;const cs=ctx.classState(id);
 for(const side of ['a','b']){
  cs.ch=Object.fromEntries(ctx.CLASS2_CHOICE_RANKS.map(rank=>[rank,def['r'+rank][side].id]));
  for(let rank=1;rank<=10;rank++){
   cs.rank=rank;
   for(let slot=0;slot<4;slot++){const need=[2,4,6,8][slot],got=ctx.c2SkillOfSlot(slot);assert.equal(got?.id||null,rank>=need?def['r'+need][side].id:null,id+' skill rank '+rank);cases++;}
   for(const need of [3,5,7,9]){assert.equal(ctx.c2Passive(def['r'+need][side].id),rank>=need,id+' passive rank '+rank);cases++;}
  }
 }
 cs.rank=10;cs.ch={};for(const rank of ctx.CLASS2_CHOICE_RANKS){assert.equal(ctx.c2NextChoice(),rank,id+' first missing choice');cs.ch[rank]=def['r'+rank].a.id;cases++;}assert.equal(ctx.c2NextChoice(),0);
 cs.ch[2]='retired-or-foreign-id';assert.equal(ctx.c2SkillOfSlot(0),null);assert.equal(ctx.c2NextChoice(),2,'Offer a replacement for an invalid legacy choice');cases++;
}
console.log(`${cases} rank, legacy-choice and ordered-choice checks passed across ${Object.keys(ctx.definitions).length} classes.`);

// The real serializer previously dropped these flags, repeating lessons after reload.
const saved=new Map(),persistence={meta:{tut:{skill:1,dash:1},tutSeen:{bag:true}},GKEY:'settings',saveGenerationCurrent:()=>true,localStorage:{setItem:(k,v)=>saved.set(k,v)}};
vm.createContext(persistence);vm.runInContext(source.slice(source.indexOf('const GLOBAL_FIELDS='),source.indexOf('const MODE_FIELDS='))+fn('persistGlobal'),persistence);
persistence.persistGlobal();const restored=JSON.parse(saved.get('settings'));
assert.deepEqual(restored.tut,{skill:1,dash:1});assert.deepEqual(restored.tutSeen,{bag:true});
persistence.meta={tutSeen:{bag:true}};persistence.persistGlobal();assert.equal(JSON.parse(saved.get('settings')).tut,undefined,'legacy settings need not contain the new field');
persistence.saveGenerationCurrent=()=>false;persistence.meta={tut:{skill:1}};persistence.persistGlobal();assert.equal(JSON.parse(saved.get('settings')).tut,undefined,'deleted or replaced saves cannot write tutorial flags');
console.log('Skill/dash lesson persistence, legacy missing field and stale-save guard passed.');
