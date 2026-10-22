const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const H=require('../public/3d/campaign-hunts.js'),S=require('../public/3d/story-state.js');
const source=fs.readFileSync('public/3d/index.html','utf8');
const slice=name=>{const start=source.indexOf('function '+name+'(');assert(start>=0,name);return source.slice(start,source.indexOf('\n}',start)+2);};
let checks=0;const ok=(value,message)=>{assert(value,message);checks++;};
const c={console,Math,JSON,Number,window:{},mode:'play',MP:{active:true},G:{zone:2,area:0,runSeed:1,_storyEpoch:'farm',storyNpcs:[],storyClaims:{},storyState:S.create(),p:{level:6,xp:0,xpNext:10000,hp:100},patrolWork:{contract:H.definitions.find(d=>d.id==='hunt.2.0')}},meta:{gold:100},BFCampaignHunts:H,briarPending:null,briarBook:null,writes:[],classXp:0};
c.isCampaignAdventure=()=>true;c.briarId=()=> 'guest';c.checkpointClone=x=>JSON.parse(JSON.stringify(x));c.adventureStoryState=()=>c.G.storyState;
for(const name of new Set((slice('briarApply')+slice('briarSync')).match(/\bin[A-Z]\w*(?=\()/g)))c[name]=()=>false;
for(const name of ['journalNoticeSync','presentStoryNotice','toast','syncReturnField','syncReturnHubNpcs','questUpdate','hudUpdate','checkAchievements'])c[name]=()=>{};
c.BFHubDialogue={active:null};c.BFStoryState=S;
c.persist=()=>c.writes.push({gold:c.meta.gold,claims:{...c.G.storyClaims},quests:{...c.G.storyState.quests},items:{...c.G.storyState.items},xp:c.G.p.xp});c.autosaveRun=c.persist;
c.gainClassXp=n=>{c.classXp+=n;c.persist();};c.characterXpAward=n=>Math.round(n*1.6875);
c.awardGold=n=>{c.meta.gold+=n;return n;};
vm.createContext(c);vm.runInContext(slice('gainXp')+'\n'+slice('briarSync')+'\n'+slice('briarApply'),c);
const packet=state=>({zone:2,area:0,run:1,epoch:'farm',state:JSON.parse(JSON.stringify(state))});
let s=S.create();s.revision=1;s.quests['hunt.2.0']='active';s.items['hunt.2.0']=0;
c.briarApply(packet(s));ok(c.writes.length===1,'acceptance immediately persisted on guest');
let before=c.writes.length;c.briarApply(packet(s));ok(c.writes.length===before,'unchanged packet causes no write');
s={...s,revision:2,items:{'hunt.2.0':7}};c.briarApply(packet(s));ok(c.writes.at(-1).items['hunt.2.0']===7,'partial shared hunt immediately persisted');
before=c.writes.length;s.revision++;s.conversation={npc:'other',node:'lore'};c.briarApply(packet(s));ok(c.writes.length===before,'unrelated dialogue revision causes no hunt save');
s={...s,revision:4,quests:{'hunt.2.0':'closed'},items:{'hunt.2.0':0,'hunt.2.0.round':1},rewards:{'hunt.2.0.round.1':{kind:'campaign_hunt',amount:290,gold:260,title:'Hunt',recipients:['guest']}}};
before=c.writes.length;c.briarApply(packet(s));
ok(c.meta.gold===360&&c.G.p.xp===489,'exact hunt gold and character XP');ok(c.classXp===928,'class XP retains existing campaign multiplier');
ok(c.writes.slice(before).every(w=>w.gold===360&&w.claims['hunt.2.0.round.1']),'every XP-triggered save includes both gold and claim');
before=c.writes.length;const earned=c.G.p.xp;c.briarApply(packet(s));ok(c.meta.gold===360&&c.G.p.xp===earned&&c.writes.length===before,'duplicate packet cannot repay or rewrite');
const stale=packet({...s,revision:1,items:{'hunt.2.0':0}});c.briarApply(stale);ok(c.G.storyState.revision===4&&c.writes.length===before,'stale packet rejected');
const wrong=packet({...s,revision:5});wrong.epoch='old';c.briarApply(wrong);ok(c.G.storyState.revision===4&&c.writes.length===before,'wrong world epoch rejected');
// A persisted claim restored before the same packet cannot pay twice.
c.G.storyState=S.restore(JSON.parse(JSON.stringify(s)));c.G.storyClaims={'hunt.2.0.round.1':true};c.briarApply(packet(s));ok(c.meta.gold===360,'restored claim is idempotent');
// Legacy combat-task reward used by older campaign states has the same safe ordering.
s={...s,revision:5,rewards:{...s.rewards,'combat.2.0':{kind:'campaign_combat',amount:200,recipients:['guest']}}};before=c.writes.length;c.briarApply(packet(s));ok(c.meta.gold===440,'legacy combat-task gold preserved');ok(c.writes.slice(before).every(w=>w.gold===440&&w.claims['combat.2.0']),'legacy task receipt and gold also commit together');
// Every real hunt has a bounded stamp independent of conversation/cosmetic revision.
for(const d of H.definitions){const g={zone:d.zone,area:d.area,patrolWork:{contract:d}},a=S.create();const empty=H.progressStamp(g,a);a.quests[d.id]='active';ok(H.progressStamp(g,a)!==empty,'accept stamp '+d.id);const active=H.progressStamp(g,a);a.revision=100;a.conversation={npc:d.npc};ok(H.progressStamp(g,a)===active,'irrelevant stamp '+d.id);a.items[d.id]=1;ok(H.progressStamp(g,a)!==active,'kill stamp '+d.id);a.items[d.id+'.round']=1;const round=H.progressStamp(g,a);a.items[d.id+'.round']=2;ok(H.progressStamp(g,a)!==round,'round stamp '+d.id);g.hub=true;ok(H.progressStamp(g,a)==='','hub excluded '+d.id);}
console.log(checks+' actual guest story/gain-XP handlers, atomic hunt gold, repeat packets, save stamps and legacy-task checks passed.');
