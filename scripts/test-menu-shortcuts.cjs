const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');let checks=0;
const ok=(v,m)=>{assert(v,m);checks++;};
let dispatched=0,skipped=0;
const root={__BF3:{},addEventListener(){}};
const ctx={window:root,KeyboardEvent:class{constructor(type,data){Object.assign(this,{type},data);}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('public/3d/menu-shortcuts.js','utf8'),ctx);
const api=root.BFMenuKeys;
// Capture the actual registered handler.
root.addEventListener=(t,fn)=>root.handler=fn;vm.runInContext(fs.readFileSync('public/3d/menu-shortcuts.js','utf8'),ctx);
const target={tagName:'BUTTON',dispatchEvent:e=>{ok(e.code==='Escape'&&e.bubbles&&e.cancelable,'Q uses the real Escape route');dispatched++;}};
function key(extra={}){let prevented=0,stopped=0;root.handler({code:'KeyQ',target,preventDefault(){prevented++;},stopImmediatePropagation(){stopped++;},...extra});return {prevented,stopped};}
ok(key().prevented===1&&dispatched===1,'Q consumed and routed once');key({repeat:true});ok(dispatched===1,'held Q cannot close multiple levels');key({ctrlKey:true});ok(dispatched===1,'browser shortcuts preserved');
for(const type of ['text','search','number']){key({target:{tagName:'INPUT',type}});ok(dispatched===1,type+' entry not intercepted');}
key({target:{isContentEditable:true}});ok(dispatched===1,'editable text preserved');root.__bfEd={EDITOR:{on:true}};key();ok(dispatched===1,'editor keeps its keys');root.__bfEd=null;
root.BFChestReveal={active:true,skip(){skipped++;}};key();ok(skipped===1&&dispatched===1,'Q skips loot reveal without pausing');root.BFChestReveal=null;
const button=(text,id='',visible=true,disabled=false)=>({textContent:text,id,disabled,getClientRects:()=>visible?[{}]:[],hasAttribute:()=>false});
let buttons=[button('Delete save'),button('Buy'),button('Back to Pause Menu')];ok(api.backButton({querySelectorAll:()=>buttons})===buttons[2],'safe nested Back located');buttons=[button('Quit to Hub'),button('Retry')];ok(!api.backButton({querySelectorAll:()=>buttons}),'no destructive or retry guess');buttons=[button('Back','',false),button('Done','',true,true)];ok(!api.backButton({querySelectorAll:()=>buttons}),'hidden and disabled controls ignored');buttons=[button('Back · Q / Esc · Tab','backBtn')];ok(api.backButton({querySelectorAll:()=>buttons})===buttons[0],'bag caption keeps explicit back action');
const source=fs.readFileSync('public/3d/index.html','utf8');
const binds={meta:{keybinds:{lootSell:['KeyQ'],bag:['KeyI']}},window:{addEventListener(){}},document:{addEventListener(){}},updateHudKeys(){}};vm.createContext(binds);vm.runInContext(source.slice(source.indexOf('const KEYACTIONS='),source.indexOf('/* Is the level editor open?')),binds);
ok(binds.meta.keybinds.lootSell[0]==='KeyX','old Q sale migrates to X');ok(binds.meta.keybinds.bag[0]==='KeyI','custom bag key preserved');ok(vm.runInContext("keyAction('KeyQ')===null",binds),'Q cannot trigger a gameplay action');
ok(source.includes("keyAction(e.code)==='bag'&&!BFMenuKeys.typing(e.target)"),'bag close uses current binding');
for(const m of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc\s*=|type=["'](?:module|importmap)/.test(m[1])&&m[2].trim())new vm.Script(m[2]);
ok(vm.runInContext("keyAction('KeyC')==='stats'",binds),'new Character Stats action defaults to C');
binds.meta.keybinds.journal=['KeyC'];delete binds.meta.keybinds.stats;binds.ensureKeybinds();
ok(binds.meta.keybinds.journal[0]==='KeyC'&&binds.meta.keybinds.stats.length===0,'new Stats action never steals a saved custom C binding');
const access={window:{},mode:'play',G:{p:{hp:100}},IN_ARENA:false,meta:{},persist(){access.saved=(access.saved||0)+1},beginPause(){access.paused=(access.paused||0)+1},openCharacterStats(back){access.opened=(access.opened||0)+1;access.back=back},resumePlay(){}};vm.createContext(access);vm.runInContext(source.slice(source.indexOf('function openStatUpgrades(){'),source.indexOf('function openCharacterStats(')),access);access.openStatUpgrades();ok(access.opened===1&&access.paused===1&&access.meta.tut.statPoints===1,'Stats shortcut uses protected pause and dismisses first-point tip');
for(const state of [{mode:'pause'},{mode:'play',IN_ARENA:true},{mode:'play',IN_ARENA:false,G:{p:{dead:true}}},{G:{p:{downed:true}}}]){Object.assign(access,state);access.openStatUpgrades();}ok(access.opened===1,'shortcut cannot interrupt menus, Arena, death or downing');
console.log(`${checks} menu shortcut regression checks passed.`);

let selected=0;const selectedButton={tagName:'BUTTON',disabled:false,getClientRects:()=>[{}],closest:()=>null,click(){selected++;}};selectedButton.closest=q=>q==='button,summary'?selectedButton:null;
root.__BF3={mode:'menu',keyAction:c=>c==='KeyE'?'interact':null};
const choose=(extra={})=>root.handler({code:'KeyE',target:selectedButton,preventDefault(){},stopImmediatePropagation(){},...extra});
choose();ok(selected===1,'E selects focused menu control');choose({repeat:true});ok(selected===1,'held E does not select twice');selectedButton.disabled=true;choose();ok(selected===1,'disabled control not selected');selectedButton.disabled=false;root.__BF3.mode='play';choose();ok(selected===1,'gameplay E is not consumed by menu selection');root.__BF3.mode='npc';choose();ok(selected===1,'dialogue retains its own E authority');root.__BF3.mode='pause';choose();ok(selected===2,'E selects pause option');choose({ctrlKey:true});ok(selected===2,'modifier shortcuts ignored');root.__BF3.rebinding=true;choose();ok(selected===2,'rebinding owns E');
console.log('Focused menu E selection and safety checks passed.');

let narratorClicks=0;const narratorButton={disabled:false,getClientRects:()=>[{}],click(){narratorClicks++;}},narratorTarget={closest:q=>q==='.narration-controls button'?narratorButton:null};root.__BF3={mode:'hubtour',keyAction:c=>c==='KeyE'?'interact':null};const narratorE=extra=>root.handler({code:'KeyE',target:narratorTarget,preventDefault(){},stopImmediatePropagation(){},...extra});narratorE();ok(narratorClicks===1,'E activates focused narration control before tour navigation');narratorE({repeat:true});ok(narratorClicks===1,'held E does not replay repeatedly');root.__BF3.rebinding=true;narratorE();ok(narratorClicks===1,'rebinding protects narration E');console.log('Narration button E safety checks passed.');
let tutorialBack=0,hubBack=0;root.__BF3={mode:'play'};root.BFGuidedTutorial={back(){tutorialBack++;return true;}};const before=dispatched;key();ok(tutorialBack===1&&dispatched===before,'Q pages active tutorial before generic Escape');key({repeat:true});ok(tutorialBack===1,'held Q cannot skip backward multiple lessons');root.BFGuidedTutorial.back=()=>false;root.BFHubTour={back(){hubBack++;return true;}};key();ok(hubBack===1&&dispatched===before,'Q pages hub tutorial instead of closing it');root.BFHubTour=null;root.BFGuidedTutorial=null;console.log('Tutorial Q priority regression checks passed.');
