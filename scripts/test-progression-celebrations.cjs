const assert=require('assert/strict'),fs=require('fs'),vm=require('vm');
const {createClock}=require('../public/3d/progression-celebration.js');
let checks=0;const ok=(v,n)=>{assert(v,n);checks++;};
let now=0,done=0,cancel=0,valid=true;const clock=createClock(()=>now);
ok(clock.begin(()=>valid,()=>done++,()=>cancel++),'first transition starts');ok(!clock.begin(()=>true,()=>done++),'no duplicate transition');
for(let i=0;i<8;i++){now+=100;clock.tick();ok(done===0,'choice remains closed before 900ms');}
now+=100;clock.tick();ok(done===1&&!clock.active,'900ms opens exactly once');now+=100;clock.tick();ok(done===1,'no duplicate completion');
clock.begin(()=>valid,()=>done++,()=>cancel++);for(let i=0;i<20;i++){now+=100;clock.tick(true);}ok(clock.active&&done===1,'hidden tabs retain the heads-up');
valid=false;clock.tick();ok(!clock.active&&cancel===1,'stale world/class/death cancels');
valid=true;clock.begin(()=>valid,()=>done++,()=>cancel++);clock.clear();ok(!clock.active&&cancel===2,'clear cancels safely');
const html=fs.readFileSync('public/3d/index.html','utf8');
const rank=html.slice(html.indexOf('function gainClassXp(n)'),html.indexOf('const LEGACY_ART='));
const xp=html.slice(html.indexOf('function gainXp(n)'),html.indexOf('function checkStageClear()'));
const intro=html.slice(html.indexOf('function beginProgressChoice('),html.indexOf('function openClassChoice('));
function context(){
 const cs={rank:1,xp:0,ch:{}},events=[],sounds=[],calls=[];
 const box={window:{BFProgressCelebration:{notify:(...a)=>events.push(a)}},G:{p:{level:1,xp:0,xpNext:100,hp:100,maxHp:100,stats:{power:10}},trial:false},meta:{classId:'warrior',tut:{}},mode:'play',RANK_XP:()=>100,CHARACTER_XP:()=>100,classState:()=>cs,curSkills:()=>[],curClass:()=>({disp:'Warrior'}),inBeginnerTrial:()=>false,c2def:()=>({r2:{kind:'skill'}}),c2NextChoice:()=>2,queueChoiceRank:0,queueSubclass:false,SFX:{classup:()=>sounds.push('class'),levelup:()=>sounds.push('player-fallback')},playFx:key=>{sounds.push(key);return {};},skillbarUpdate:()=>{},hudUpdate:()=>{},persist:()=>{},isCampaignAdventure:()=>false,autoLevelGrow:p=>{p.maxHp+=11;},recomputeArmor:()=>{},effMaxHp:p=>p.maxHp,rarityUnlockedAt:()=>null,addText:()=>{},burst:()=>{},checkAchievements:()=>{},autosaveRun:()=>{},Math,
 document:{getElementById:()=>({innerHTML:'do not remove menu container'}),exitPointerLock(){}},ovcard:{innerHTML:'old option buttons'},showOverlay:v=>calls.push(['overlay',v]),showGameUI:v=>calls.push(['hud',v]),releaseKeyboard:()=>calls.push(['release']),input:{attack:true,jumpEdge:true,dodgeEdge:true},beginPause:()=>calls.push(['protected']),resumePlay(){box.mode='play';},performance:{now:()=>now}};
 vm.createContext(box);vm.runInContext(html.slice(html.indexOf('function rewardSound('),html.indexOf('function rewardAudioSettings('))+rank+html.slice(html.indexOf('function characterXpAward('),html.indexOf('function gainXp('))+xp+intro,box);return {box,cs,events,sounds,calls};
}
let f=context();f.cs.rank=10;f.box.gainXp(250);ok(f.box.G.p.level===3,'multiple earned player levels');ok(f.box.mode==='play','player level does not pause');ok(!('slowmo' in f.box.G),'player level does not slow combat');ok(f.events.length===1&&f.events[0][0]==='player','multi-level one readable celebration');ok(f.sounds.join()==='levelcheer','one unique character sound');ok(f.events[0][2].detail.includes('+2 stat points'),'correct earned stat count');
f=context();f.box.gainClassXp(220);ok(f.cs.rank===3,'multi-rank earned');ok(f.events.length===1&&f.events[0][2].value===3,'coalesced class celebration');ok(f.sounds.join()==='class','one class sound');ok(f.box.queueChoiceRank===2,'first unmade choice queued');
f=context();f.cs.xp=99;f.box.gainXp(101);ok(f.events.some(e=>e[0]==='class')&&f.events.some(e=>e[0]==='player'),'simultaneous events remain distinct');
let callback,guard,cancelIntro,opened=0;f.box.window.BFProgressCelebration.beforeChoice=(v,d,c)=>{guard=v;callback=d;cancelIntro=c;};f.box.G.p.attackHeld=true;f.box.beginProgressChoice('skill',2,()=>opened++);
ok(f.box.mode==='play'&&opened===0,'rank heads-up keeps simulation playing');ok(f.box.ovcard.innerHTML==='old option buttons','does not blank or detach menu containers');ok(f.box.input.attack&&f.box.input.jumpEdge&&f.box.input.dodgeEdge&&f.box.G.p.attackHeld,'movement/attack inputs remain usable during rank heads-up');ok(!f.calls.some(c=>c[0]==='protected'),'pause protection begins only at actual choice');ok(guard(),'matching owner valid');callback();ok(opened===1,'guarded callback opens choice');
f.box.meta.classId='mage';ok(!guard(),'class swap invalidates old callback');callback();ok(opened===1,'stale callback does not open');cancelIntro();ok(f.box.mode==='play','cancel returns control');
for(const condition of ['dead','downed']){f=context();f.box.window.BFProgressCelebration.beforeChoice=(v)=>guard=v;f.box.beginProgressChoice('passive',2,()=>{});f.box.G.p[condition]=true;ok(!guard(),condition+' cancels choice');}
ok(!intro.includes("getElementById('overlay').innerHTML"),'overlay host never detached');
ok(html.includes('p[0],p[1]'),'world pulse uses CSS viewport coordinates without double scaling');
const css=fs.readFileSync('public/3d/progression-celebration.css','utf8');ok(css.includes('pointer-events:none'),'celebration cannot block combat input');ok(css.includes('prefers-reduced-motion'),'OS motion preference');ok(css.includes('.progress-celebration.reduced'),'game motion preference');
const tutorial=fs.readFileSync('public/3d/guided-tutorial.js','utf8');ok(tutorial.includes('combat waits while you choose'),'first-choice warning');
const sfx=JSON.parse(fs.readFileSync('public/sfx/custom/starter-20261016/manifest.json','utf8'));ok(sfx.cues.find(c=>c.id==='custom_classup').sha256!==sfx.cues.find(c=>c.id==='levelcheer').sha256,'distinct custom SFX assets');
console.log(JSON.stringify({checks,introMs:900,multiAward:true,staleOwnerGuards:true,playerNeverPauses:true,distinctSounds:true}));
// Exercise the actual DOM transition, including its fade and input lock, against a virtual clock.
{
 let ms=0,opened=0,cancelled=0;
 function node(tag){const classes=new Set();return {tag,dataset:{},children:[],style:{},append(...x){this.children.push(...x);},setAttribute(){},remove(){this.removed=true;},classList:{add(...s){s.forEach(x=>classes.add(x));},toggle(s,on){on?classes.add(s):classes.delete(s);}},querySelector(t){let all=this.children.slice();while(all.length){const n=all.shift();if(n.tag===t)return n;all.push(...n.children);}return null;}};}
 const ids=Object.fromEntries(['hud','inventoryDock','controls','pausebtn','questbox'].map(x=>[x,node('div')]));const body=node('body');
 const env={window:{},performance:{now:()=>ms},document:{createElement:node,getElementById:id=>ids[id],body}};vm.createContext(env);vm.runInContext(fs.readFileSync('public/3d/progression-celebration.js','utf8'),env);const ui=env.window.BFProgressCelebration,world={p:{hp:100,x:0,y:0,z:0}};
 ui.notify('class',world,{name:'Mage',value:2,detail:'First skill ready'});ui.beforeChoice(()=>true,()=>opened++,()=>cancelled++,{detail:'Choose your first skill next'});assert(!ids.hud.inert&&!ids.inventoryDock.inert,'rank heads-up keeps HUD and controls available');
 for(let i=0;i<8;i++){ms+=100;ui.tick(world,'play',null,{});}assert.equal(opened,0,'brief announcement precedes choice');ms+=100;ui.tick(world,'play',null,{});assert.equal(opened,1,'900ms opens choice without a second frozen fade');assert(!ui.active);assert(!ids.hud.inert);assert.equal(cancelled,0);
 ui.notify('class',world,{name:'Mage',value:3});ui.beforeChoice(()=>true,()=>opened++,()=>cancelled++,{detail:'Passive'});for(let i=0;i<15;i++){ms+=100;ui.tick(world,'pause',null,{});}assert.equal(opened,1,'manual pause suspends automatic choice');for(let i=0;i<9;i++){ms+=100;ui.tick(world,'play',null,{});}assert.equal(opened,2,'resume completes queued choice once');
 ui.notify('class',world,{name:'Mage',value:3});let valid=true;ui.beforeChoice(()=>valid,()=>opened++,()=>cancelled++,{detail:'Passive choice'});valid=false;ms+=16;ui.tick(world,'play',null,{});assert.equal(cancelled,1);assert(!ids.hud.inert,'stale transition releases input');
 console.log('Actual nonblocking rank-banner / menu suspension / cancellation checks passed.');
}

{let now=0,finished=0,grounded=false;const c=createClock(()=>now);c.begin(()=>true,()=>finished++,null,900,()=>grounded);for(let i=0;i<9;i++){now+=100;c.tick();}ok(finished===0,'airborne player gets a short landing window');grounded=true;now+=100;c.tick();ok(finished===1,'landing opens pending choice promptly');grounded=false;c.begin(()=>true,()=>finished++,null,900,()=>false);for(let i=0;i<17;i++){now+=100;c.tick();}ok(finished===2,'continuous jumping cannot indefinitely defer required choice');}
ok(!html.slice(html.indexOf('function pollGamepad('),html.indexOf('function pollGamepad(')+1800).includes('BFProgressCelebration?.active'),'controller stays enabled during banner');
