const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s=fs.readFileSync('public/3d/index.html','utf8').replace(/\r\n/g,'\n');
const cut=(a,b)=>s.slice(s.indexOf(a),s.indexOf(b,s.indexOf(a)));
let checks=0;const ok=(v,m)=>{assert(v,m);checks++;};
const armor=(slot,name)=>({slot,name,rarity:'common',defense:4});
const player=()=>({level:10,hp:75,mana:30,maxMana:50,weapon:{name:'Protected Sword',cls:'melee',rarity:'common'},gear:{helmet:null,chest:null,legs:null,ring:null,amulet:null}});
const clone=v=>JSON.parse(JSON.stringify(v));let saves=0,legacy=0,attempts=0;
const c={G:{hub:false,p:player()},mode:'play',meta:{stash:[]},GEARSLOTS:['helmet','chest','legs','ring','amulet'],TRINKETIDS:['ring','amulet'],
 normWeapon:clone,checkpointClone:clone,cloneGear:clone,classFamilyOk:w=>w.cls==='melee',monkBlocksWeapons:()=>false,rarityReq:r=>r==='legendary'?20:1,recomputeArmor:p=>{p.armorMods={};},effMaxHp:()=>100,snapOf:clone,isIntrinsicLoot:w=>!!w.intrinsic,toast(){},persist(){},hudUpdate(){},SFX:{pickup(){}},console,initAudio(){},playFx(){},autosaveRun(){saves++;},
 BFChestReveal:{quickEquip(){attempts++;return true;}},lootEquipCurrent(){legacy++;}};
vm.createContext(c);vm.runInContext(cut('function bagEquipmentActor(){','function openBag(')+cut('function chestEquipState(','function revealChestReward('),c);
for(const slot of [...c.GEARSLOTS,'weapon']){
 c.G={hub:false,p:player()};const entry=slot==='weapon'?{weapon:{name:'New sword',cls:'melee',rarity:'common'}}:{[c.TRINKETIDS.includes(slot)?'trinket':'armor']:armor(slot,'New '+slot)};
 const old=slot==='weapon'?c.G.p.weapon:armor(slot,'Protected '+slot);if(slot!=='weapon')c.G.p.gear[slot]=old;
 c.meta.stash=[entry,...Array.from({length:29},(_,i)=>({armor:armor('helmet','Filler '+i)}))];const world=c.G;
 ok(c.chestEquipState(entry,world).allowed,'current retained '+slot+' can equip');const before=saves;
 ok(c.quickEquipChestItem(entry,world),'actual '+slot+' transaction succeeds');
 ok(c.meta.stash.length===30&&c.meta.stash.some(x=>(x.weapon||x.armor||x.trinket).name===old.name),'previous '+slot+' conserved with full bag');
 ok(!c.meta.stash.includes(entry)&&saves===before+1,'consumed once and active run saved immediately');
 ok(!c.quickEquipChestItem(entry,world)&&saves===before+1,'repeat cannot consume other equipment');
}
for(const state of ['level','class','intrinsic','removed','world','menu','downed','dead','zeroHp']){
 c.G={hub:false,p:player()};c.mode='play';c.monkBlocksWeapons=()=>state==='intrinsic';const entry={weapon:{name:'Blocked sword',cls:state==='class'?'magic':'melee',rarity:state==='level'?'legendary':'common'}};c.meta.stash=[entry];const world=state==='world'?{}:c.G;
 if(state==='removed')c.meta.stash=[];if(state==='menu')c.mode='menu';if(state==='downed')c.G.p.downed=true;if(state==='dead')c.G.p.dead=true;if(state==='zeroHp')c.G.p.hp=0;
 const snapshot=JSON.stringify([c.G.p,c.meta.stash]),before=saves;
 ok(!c.chestEquipState(entry,world).allowed&&!!c.chestEquipState(entry,world).reason,'clear lock reason: '+state);
 ok(!c.quickEquipChestItem(entry,world)&&JSON.stringify([c.G.p,c.meta.stash])===snapshot&&saves===before,'blocked '+state+' cannot change inventory or save');
}
c.G={p:player(),lootCard:{}};c.mode='play';c.monkBlocksWeapons=()=>false;
vm.runInContext('globalThis.dispatchEquip=(act,e)=>{'+cut("  if(act==='lootEquip'){","\n  if(act==='lootBag')")+'}',c);
const event=repeat=>({repeat,preventDefault(){}});
c.dispatchEquip('lootEquip',event(false));ok(attempts===1&&legacy===0,'active chest consumes F instead of equipping unrelated legacy card');
c.dispatchEquip('lootEquip',event(true));ok(attempts===1,'held key cannot equip successive queued rewards');
c.mode='menu';c.dispatchEquip('lootEquip',event(false));ok(attempts===1,'menu does not handle quick equip');c.mode='play';c.BFChestReveal.quickEquip=()=>false;c.dispatchEquip('lootEquip',event(false));ok(legacy===1,'legacy ground-card action still works without a chest result');
console.log(checks+' chest quick-equip transaction, conservation, gates, persistence and input checks passed.');
