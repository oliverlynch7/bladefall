const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('public/3d/index.html','utf8');let checks=0;const ok=(n,v)=>{assert(v,n);checks++;};
const eff=source.slice(source.indexOf('function effMaxHp('),source.indexOf('/* THE INNATE FOLD'));
const fresh=source.slice(source.indexOf('function freshFromSnapshot('),source.indexOf('function beginRun('));
const hub=source.slice(source.indexOf('function enterWaystation(riftHall=false)'),source.indexOf('function openNpcTalk('));
const spar=source.slice(source.indexOf('function enterSparringRoom(remote=false)'),source.indexOf('const BESTIARY_INFO='));
function run(text,oldScale,hitless,role,cid){
 const snap={hp:1,maxHp:120,mana:0,maxMana:90,level:12,xp:30,stats:{power:1},gear:{},allocation:{health:3,mana:4}};
 const c={meta:{hero:snap,classId:cid},G:{endHpMul:oldScale,p:{}},TRAIN_UI:{},MP:{guest:()=>role==='guest'},document:{getElementById:()=>({classList:{remove(){} }})},cancelPortalWarp(){},cancelDeathTransition(){},clearTimeout(){},storyToast(){},BFHubDialogue:{active:false},restoreArenaCampaign(){},initAudio(){},freshPlayer:()=>({stats:{},maxHp:100,maxMana:100}),newG:(p,extra)=>({p,...extra}),BFCharacterStats:{normalize:a=>({...a}),value:(p,k)=>p.allocation?.[k]||0},isIntrinsicLoot:()=>false,normWeapon:x=>x,classStartWeapon:()=>({name:'class weapon'}),cloneGear:x=>({...x}),CHARACTER_XP:n=>n*100,recomputeArmor:p=>{p.armorMods={hp:20};p.maxMana=(cid==='mage'?120:90)+(p.allocation?.mana||0)*3;},isHitless:()=>hitless,isGod:()=>false,skinP:()=>null,Math,JSON};
 vm.createContext(c);vm.runInContext(eff+fresh,c);
 // Exercise actual arrival preambles through the destination's resource reset, before scenery construction.
 const end=text.indexOf('p.mana=p.maxMana;')+'p.mana=p.maxMana;'.length;assert(end>0);let prefix=text.slice(0,end);
 if(text===spar)prefix=prefix.replace('function enterSparringRoom(remote=false)','function enterSparringRoom(remote=true)');
 vm.runInContext(prefix+'\n}',c);if(text===hub)c.enterWaystation();else c.enterSparringRoom(true);
 const p=c.G.p;ok('destination exists '+role,c.G.hub);ok('HP uses new room cap '+cid+' '+oldScale,p.hp===c.effMaxHp(p));ok('full mana '+cid,p.mana===p.maxMana);ok('empty old mana actually replenished',p.mana>0);ok('no dungeon max-HP multiplier persists',!c.G.endHpMul);ok('hitless cap respected',!hitless||p.hp===1);ok('no original snapshot mutation',snap.hp===1&&snap.mana===0&&snap.level===12);
}
for(const builder of [hub,spar])for(const scale of [.25,2.5])for(const role of ['solo','host','guest'])for(const [cid,hitless]of [['warrior',false],['mage',false],['ranger',true]])run(builder,scale,hitless,role,cid);
ok('hub saves recovered hero before persist',/meta\.hero=snapOf\(p\);meta\.run=null; persist\(\);/.test(hub));ok('hub restores before multiplayer arrival',hub.indexOf('p.mana=p.maxMana;')<hub.indexOf('MP.onEnter(MP.HUB)'));
ok('sparring saves recovered hero before arrival',spar.indexOf('meta.hero=snapOf(p);persist();')<spar.indexOf('MP.onEnter(MP.SPARRING)'));
const guest=source.slice(source.indexOf('onGuestData(d){'),source.indexOf('onEnter(zi,restart=false)'));
ok('guest main hub follows shared arrival path',guest.includes('if(!G?.hub)openHub();'));ok('guest room returns use shared builder',guest.includes('enterWaystation(!!d.hall)'));
console.log(JSON.stringify({checks,passed:true}));
