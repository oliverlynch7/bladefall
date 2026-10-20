const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const rewards=require('../public/3d/encounter-rewards.js');
const source=fs.readFileSync('public/3d/index.html','utf8');
const fn=n=>{const a=source.indexOf('function '+n+'('),b=source.indexOf('\nfunction ',a+12);assert(a>=0);return source.slice(a,b<0?undefined:b)};
let checks=0;const ok=(v,m)=>{assert(v,m);checks++};
for(const n of [13,22,140,380,800]){let prev=0;for(let lv=1;lv<=46;lv++){const got=rewards.xp(n,lv);ok(got>=prev&&got>=n&&got<=Math.ceil(n*2.575),'modest monotonic fixed-world reward');prev=got;}ok(rewards.xp(n,1)===n,'Briar start unchanged');}
function fixture(zone,area,campaign=true){
 const c={G:{zone,area,time:1,p:{weapon:{arche:'sword'}},enemies:[],particles:[],kills:0,shake:0},meta:{classId:'warrior',gold:0},MP:{active:false,isHost:true,guest:()=>false,host_:()=>false},Math,BFEncounterRewards:rewards,BFCampaignPatrols:{killed:()=>false},isCampaignAdventure:()=>campaign,adventureStoryState:()=>({}),campaignParty:()=>[],characterXpAward:n=>Math.round(n*1.6875),gainXp:n=>{c.xp=(c.xp||0)+n;c.savedGold=c.meta.gold;},effGoldFind:()=>1,autosaveRun:()=>c.savedGold=c.meta.gold,questKill:()=>c.quest=(c.quest||0)+1,questHuntKill(){},fetchQuest:()=>null,burst(){},mobDie(){},checkAchievements(){},checkStageClear(){},addText(){},hudUpdate(){},rollDrop(){},enemyEncounterLevel:e=>rewards.level(c.G,e),c2def:()=>false,SFX:{}};
 vm.createContext(c);vm.runInContext(fn('enemyKillXp')+fn('awardGold')+fn('killEnemy'),c);
 const a=source.indexOf('  creditKill(type,xp,elite,boss,mid){'),b=source.indexOf('  // ================= P1.3',a);vm.runInContext('this.receiver={'+source.slice(a,b)+'}',c);
 return c;
}
for(let z=0;z<8;z++)for(const area of [0,1,-1]){
 const host=fixture(z,area),guest=fixture(z,area),e={type:'grunt',xp:13,hp:0,maxHp:71,x:0,y:0,z:0,h:38};host.killEnemy(e,false);
 guest.receiver.creditKill('grunt',13,false,false,1);
 ok(host.xp===guest.xp,'missing model receives same scaled XP');ok(host.meta.gold===guest.meta.gold,'missing model receives base gold');
 ok(host.savedGold===host.meta.gold&&guest.savedGold===guest.meta.gold,'save happens after complete payout');
 const old=host.xp;host.killEnemy(e,false);ok(host.xp===old,'already dead cannot pay twice');
 for(const boss of [false,true]){const c=fixture(z,area),expected=rewards.xp(200,rewards.level(c.G,{boss}));c.receiver.creditKill('boss',200,false,boss,2);ok(c.xp===expected&&c.meta.gold===Math.max(1,Math.round(expected*(boss?3.5:.55))),'boss and regular fallback agree with current-world curve');}
}
for(const bad of [Infinity,NaN,1e300])ok(fixture(0,0).enemyKillXp({xp:bad})===0,'invalid entity XP is harmless');
const special=fixture(7,1,false);ok(special.enemyKillXp({xp:13})===13,'non-campaign unchanged');special.G.endless=true;special.G.endReward=2.2;ok(special.enemyKillXp({xp:13})===29,'endless depth multiplier applied once');
for(const bad of [NaN,Infinity,-Infinity,-1,1e300]){const c=fixture(0,0);c.receiver.creditKill('grunt',bad,false,false,1);ok(!c.xp&&c.meta.gold===0&&!c.quest,'invalid packet cannot grant reward or poison XP');}
const classGuard=source.slice(source.indexOf('function gainClassXp('),source.indexOf(' const cs=',source.indexOf('function gainClassXp(')))+'this.reached=true;}';
for(const n of [NaN,Infinity,-Infinity,-1,0]){const c={G:{},reached:false,Number};vm.createContext(c);vm.runInContext(classGuard,c);c.gainClassXp(n);ok(!c.reached,'invalid class award rejected before state access');}
const final=fixture(7,-1);Object.assign(final.G,{kingFinal:{},boss:{xp:800,boss:true}});final.G.p.weapon={sch:'phy',cls:'melee'};Object.assign(final,{curDiff:()=>({id:'normal'}),ZONES:Array(8).fill({}),snapOf:()=>({}),persist(){},checkCosmetics(){},showGameUI(){},winScreen:()=>final.won=true});final.meta.zoneDone={};final.SFX.win=()=>{};vm.runInContext(fn('completeFinalKing'),final);final.completeFinalKing();ok(final.xp===2060&&final.meta.gold===7710&&final.won,'finale uses same fixed-world reward curve');final.completeFinalKing();ok(final.meta.gold===7710,'finale rewards remain one-time');
const scope={G:{area:0},MP:{active:true,isHost:true,pvp:false,zone:0,peers:{}},isCampaignAdventure:()=>true};vm.createContext(scope);vm.runInContext(fn('partySize'),scope);
for(const [peer,expected] of [[{zone:0,area:0,last:0},2],[{zone:0,area:1,last:0},1],[{zone:0,area:0,last:4},1],[{zone:0,area:0,last:0,hall:true},1],[{zone:1,area:0,last:0},1],[{zone:0},2]]){scope.MP.peers.g=peer;ok(scope.partySize()===expected,'party size counts eligible same-scene peers with legacy support');}
scope.G.trialSession='trial';scope.G.trialPartySize=2;ok(scope.partySize()===2,'borrowed trial retains locked party size');
console.log(JSON.stringify({checks,passed:true,scope:'Actual kill/fallback payout functions, bounded curve, invalid inputs and save ordering; staged browser integration also required.'}));
