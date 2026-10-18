const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');let checks=0;
const s=fs.readFileSync('public/3d/index.html','utf8').replace(/\r\n/g,'\n'),cut=(a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a))),ok=(v,m)=>{assert(v,m);checks++;};
let timerId=0,timers=new Map(),fades=false,calls=0,textClears=0;
const c={clearWorldTexts:()=>textClears++,G:{p:{},portal:{},area:1,stageIndex:3},mode:'play',backgroundMenuMode:null,SFX:{magic(){}},document:{getElementById:()=>({classList:{add(){fades=true;},remove(){fades=false;}}})},setTimeout:f=>{timers.set(++timerId,f);return timerId;},clearTimeout:id=>timers.delete(id),nextArea:()=>calls++};
vm.createContext(c);vm.runInContext(cut('function cancelPortalWarp(){','function restorePlayer('),c);const run=t=>vm.runInContext(t,c),flush=()=>{const queue=[...timers.values()];timers.clear();queue.forEach(f=>f());};
run('nextStage();nextStage()');ok(timers.size===1&&fades,'one warp/sound window per portal');flush();ok(calls===1&&!fades&&!run('warpTo._busy'),'valid portal advances and clears fade');
for(const [label,change] of [['world replacement',()=>c.G={p:{},hub:true}],['district replacement',()=>c.G.area++],['portal replacement',()=>c.G.portal={}],['stage replacement',()=>c.G.stageIndex++],['death',()=>c.G.p.dead=true],['downed',()=>c.G.p.downed=true],['pause',()=>c.mode='pause'],['background menu',()=>c.backgroundMenuMode='menu']]){
 c.G={p:{},portal:{},area:1,stageIndex:3};c.mode='play';c.backgroundMenuMode=null;const before=calls;run('nextStage()');change();flush();ok(calls===before&&!fades&&!run('warpTo._busy'),label+' rejects stale callback and clears fade');
}
c.G={p:{},hub:false};c.mode='play';c.backgroundMenuMode=null;run('nextStage();cancelPortalWarp()');ok(!timers.size&&!fades&&!run('warpTo._busy'),'explicit scene cancellation removes timer and veil');
run('nextStage()');const stale=[...timers.values()][0];run('cancelPortalWarp();nextStage()');stale();ok(fades&&timers.size===1&&run('warpTo._busy'),'stale callback cannot clear a newer warp');flush();
c.G={hub:true};run('nextStage()');ok(!timers.size,'hub cannot queue a portal advance');
for(const [a,b]of [['function nextArea(){','function zoneClear(){'],['function loadArea(){','/* ---- Side zones:'],['function loadStage(i){','function applyEditsNow(){']]){vm.runInContext(cut(a,b),c);run(a.match(/function (\w+)/)[1]+'()');ok(c.G.hub,'hub guard prevents level builder/advancer');}
ok(textClears===1,'scene load disposes old floating DOM text before returning to hub');
const mpCode=cut('  worldStateScene(){','  combatScene(){');vm.runInContext('var MP={zone:1,'+mpCode+'};',c);
c.G={area:1,runSeed:123};const stamp=run('MP.worldStateScene()');c.packet={scene:stamp};ok(run('MP.acceptWorldState(packet)'),'same room snapshot accepted');
for(const [label,g,zone]of [['hub',{hub:true,area:0},-1],['other area',{area:-1,runSeed:123},1],['retry',{area:1,runSeed:124},1],['other floor',{area:1,runSeed:123,floor:2},1],['other trial',{area:1,runSeed:123,trialSession:'new'},1],['other zone',{area:1,runSeed:123},2]]){c.G=g;run('MP.zone='+zone);ok(!run('MP.acceptWorldState(packet)'),label+' rejects stale state');}
c.G={hub:true,area:0,runSeed:1};run('MP.zone=-1');c.packet={scene:run('MP.worldStateScene()')};c.G.runSeed=2;ok(run('MP.acceptWorldState(packet)'),'shared hub independent seeds accepted');c.G.riftHall=true;ok(!run('MP.acceptWorldState(packet)'),'rift hall differs from hub');
c.G.riftHall=false;c.G.sparringRoom=true;ok(!run('MP.acceptWorldState(packet)'),'sparring room differs from ordinary hub');
c.G={arena:true,area:0,runSeed:1};run('MP.zone=-2');c.packet={scene:run('MP.worldStateScene()')};c.G.runSeed=2;ok(run('MP.acceptWorldState(packet)'),'arena independent seeds accepted');
c.G={area:1};run('MP.zone=1');c.packet={players:[{zone:1,area:1,hall:false}]};ok(run('MP.acceptWorldState(packet)'),'legacy matching room accepted');c.packet.players[0].zone=-1;ok(!run('MP.acceptWorldState(packet)'),'legacy other room rejected');
ok(s.includes("else if(d.t==='state'){if(!this.acceptWorldState(d))return;"),'network gate precedes state payload mutations');
ok(s.includes("scene:this.worldStateScene(),players:all"),'host stamps authoritative snapshot');
ok(s.includes('!G||(G.hub&&!G.sparringRoom)'),'ordinary hub refuses enemy reconciliation');
for(const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc\s*=|type=["'](?:module|importmap)/.test(m[1])&&m[2].trim())new vm.Script(m[2]);
console.log(`${checks} portal ownership and world snapshot regression checks passed.`);
