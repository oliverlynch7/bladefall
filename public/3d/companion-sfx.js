/* Friendly companion action identities. Audio only; never mutates actors or saves. */
(function(root){'use strict';
const attacks={shepherd:'canine_bite',cinder:'ember_bite',emberpup:'ember_bite',spiritwolf:'spirit_swipe',stonewhelp:'stone_ram',wisp:'wisp_bolt',gravewraith:'wraith_bolt',sunwing:'dragon_breath'};
const ids=[...new Set(Object.values(attacks)), 'mender_heal','dragon_takeoff','dragon_land'].map(id=>'pet_'+id);
const definitions=Object.fromEntries(ids.map(id=>[id,{f:'custom/companion-actions-20261019/'+id+'_v01',v:.34,lazy:true}]));
let api=null,world=null,recent=[],actors=new WeakMap();
function apply(registry){for(const [id,def]of Object.entries(definitions))if(!Object.hasOwn(registry,id))registry[id]={...def};}
function configure(value){api=value;reset();}
function reset(){world=null;recent=[];actors=new WeakMap();}
function warm(pet){if(!pet||pet.dead||pet.hp<=0)return;const suffix=attacks[pet.id];if(suffix)api?.queue('pet_'+suffix);if(pet.id==='mender')api?.queue('pet_mender_heal');if(pet.id==='sunwing'){api?.queue('pet_dragon_takeoff');api?.queue('pet_dragon_land');}}
function tick(g,peers=[]){if(world!==g){reset();world=g;}if(!g?.p)return;warm(g.pet);for(const peer of peers)if(peer.zone===g.zone&&peer.area===g.area&&Math.hypot(peer.x-g.p.x,peer.z-g.p.z)<1600)warm(peer.pet);}
function action(kind,pet,at=performance.now()/1000){
 const g=api?.world();if(world!==g){reset();world=g;}
 const suffix=kind==='attack'?attacks[pet?.id]:kind==='heal'&&pet?.id==='mender'?'mender_heal':pet?.id==='sunwing'&&['dragon_takeoff','dragon_land'].includes(kind)?kind:null;
 const id=suffix&&'pet_'+suffix;
 if(!id||!g?.p||!pet||pet!==g.pet||pet.dead||pet.hp<=0||!api.allowed()||!Number.isFinite(at))return false;
 const coords=[pet.x,pet.y||0,pet.z,g.p.x,g.p.y||0,g.p.z];if(!coords.every(Number.isFinite))return false;
 const d=Math.hypot(pet.x-g.p.x,(pet.y-g.p.y||0)*.75,pet.z-g.p.z);if(d>=1600)return false;
 const prior=actors.get(pet);if(prior!=null&&at-prior<.55)return false;
 recent=recent.filter(t=>at-t<.3);if(recent.length>=3)return false;
 actors.set(pet,at);recent.push(at);api.queue(id);
 const gain=Math.min(1,Math.max(0,(1600-d)/1200));
 const played=!!api.play(id,gain);api.relay?.(id,gain);
 return played;
}
const value={ids,definitions,attacks,apply,configure,reset,warm,tick,action};root.BFCompanionSfx=value;if(typeof module!=='undefined')module.exports=value;
})(typeof window!=='undefined'?window:globalThis);
