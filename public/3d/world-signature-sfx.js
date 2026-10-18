/* Audio-only observation of current shared state. Never advances a fight or quest. */
(function(root){'use strict';
const warnings=['brute','marksman','fallen','officer_caster','officer_shield','officer_spear','furnace','marble','king','hydra'];
const worldIds=['boss_king_awaken','boss_hydra_free','boss_furnace_cool','boss_marble_open','world_mill_start','world_bridge_lower','world_lift','world_press_brake','world_rail_cart','world_water_fill','world_water_drain','world_water_freeze','world_library_seal'];
const charges=['hurl','quake','spin','daggerthrow','javelin','scythethrow','flamefan'];
const ids=[...warnings.map(id=>'bosswarn_'+id),...worldIds,...charges.map(id=>'weaponcharge_'+id)];
const definitions=Object.fromEntries(ids.map(id=>[id,{f:'custom/world-signatures-20261018/'+id+'_v01',v:id.startsWith('bosswarn_')?.38:.42,lazy:true}]));
for(const [kind,file]of [['player','premium_player_level'],['class','premium_class_rank']])definitions['reward_'+kind]={f:'custom/premium-progression-20261018/'+file+'_v01',v:.6,lazy:true};
let world=null,actors=new WeakMap(),mechanisms=null,recent=[],lastMode=null;
function apply(registry){for(const [id,def]of Object.entries(definitions))if(!Object.hasOwn(registry,id))registry[id]={...def};}
function bossId(e){return e?.bruteOrchard?'brute':e?.marksmanCrossing?'marksman':e?.fallenDuel?'fallen':e?.frostOfficer?'officer_'+e.frostOfficer:e?.furnaceColossus?'furnace':e?.marbleGuardian?'marble':e?.finalKing?'king':null;}
function state(e){return e.bruteState||e.markState||e.fallState||e.offState||e.fcState||e.mcState||e.akState;}
function warning(e){const s=state(e);return e.bruteOrchard?['wind','slam'].includes(s):e.marksmanCrossing?s==='aim':e.fallenDuel?['thrust','sweep'].includes(s):s==='wind';}
function warningReady(e,ready){const id=bossId(e);return !!id&&!!ready('bosswarn_'+id);}
function distance(p,o){return Math.hypot((p?.x||0)-(o?.x||0),((p?.y||0)-(o?.y||0))*.6,(p?.z||0)-(o?.z||0));}
function emit(id,o,g,api,at){if(!definitions[id]||!o||!g?.p||!Number.isFinite(at))return false;const d=distance(g.p,o);if(d>=2200)return false;recent=recent.filter(t=>at-t<.25);if(recent.length>=3)return false;const gain=Math.max(0,Math.min(1,(2200-d)/1600));if(api.play(id,gain)){recent.push(at);return true;}return false;}
function snapshot(g){const f=g.storyState?.flags||{},i=g.storyState?.items||{};return {mill:g.briarMill?.water>.1,bridge:!!f['briar.bridge'],lift:!!f['kd.lift.open'],brake:!!f['kd.deep.open'],cart:!!f['ih.cart'],water:Number(i['ic.lock.level'])||0,frozen:!!f['ic.lock.frozen'],channel:!!f['ic.channel.open'],library:!!f['sl.display.open'],hydra:!!g.hydraArena?.freed};}
function origin(g,keys){return (g.storyObjects||[]).find(o=>keys.some(k=>o.key?.startsWith(k)))||null;}
function warm(g,api){for(const e of g.enemies||[]){const id=bossId(e);if(id&&e.hp>0&&!e.dead&&distance(g.p,e)<2400){api.queue('bosswarn_'+id);if(id==='king')api.queue('boss_king_awaken');if(id==='furnace')api.queue('boss_furnace_cool');if(id==='marble')api.queue('boss_marble_open');}}
 if(g.hydraArena){api.queue('bosswarn_hydra');api.queue('boss_hydra_free');}
 const keys=[];if(g.briarMill)keys.push('world_mill_start','world_bridge_lower');if(g.prison)keys.push('world_lift','world_press_brake');if(g.iron)keys.push('world_rail_cart');if(g.iceCaves)keys.push('world_water_fill','world_water_drain','world_water_freeze');if(g.library)keys.push('world_library_seal');for(const key of keys)api.queue(key);
 const charge=g.p?.weapon?.chg;if(charges.includes(charge))api.queue('weaponcharge_'+charge);
}
function reset(){world=null;actors=new WeakMap();mechanisms=null;recent=[];lastMode=null;}
function tick(g,mode,api,at=performance.now()/1000,hidden=!!root.document?.hidden){
 if(!g?.p){reset();return;}const changed=world!==g;if(changed){reset();world=g;}warm(g,api);
 const audible=!hidden&&mode==='play'&&!g.p.dead&&!g.p.downed&&!g._tutorialSafe;
 const resuming=lastMode!==null&&lastMode!=='play';lastMode=mode;
 for(const e of g.enemies||[]){const id=bossId(e);if(!id)continue;const s=state(e),active=!!e.active&&!e.dead&&e.hp>0,prev=actors.get(e),record={s,warning:warning(e),active,exposed:(e.fcExposed||e.mcExposed||0)>0,stage:e.akStage};actors.set(e,record);
  if(!prev||!audible||resuming||!active)continue;
  if(record.warning&&(!prev.warning||s!==prev.s))emit('bosswarn_'+id,e,g,api,at);
  if(!prev.exposed&&record.exposed)emit(id==='furnace'?'boss_furnace_cool':id==='marble'?'boss_marble_open':'',e,g,api,at);
  if(e.finalKing&&prev.stage!==record.stage&&record.stage==='fight2')emit('boss_king_awaken',e,g,api,at);
 }
 const h=g.hydraArena;if(h){const previous=actors.get(h),current={state:h.state};actors.set(h,current);if(previous&&audible&&!resuming&&h.state==='wind'&&previous.state!=='wind')emit('bosswarn_hydra',{x:h.x||0,z:h.z||0,y:h.y||0},g,api,at);}
 const next=snapshot(g),prev=mechanisms;mechanisms=next;if(!prev||!audible||resuming)return;
 const events=[['mill','world_mill_start',['briar.water']],['bridge','world_bridge_lower',['briar.']],['lift','world_lift',['kd.lift']],['brake','world_press_brake',['kd.press']],['cart','world_rail_cart',['ih.cart']],['frozen','world_water_freeze',['ic.lock.2']],['channel','world_water_freeze',['ic.channel.plug']],['library','world_library_seal',['sl.display']],['hydra','boss_hydra_free',[]]];
 for(const [key,id,prefix]of events)if(next[key]&&!prev[key])emit(id,key==='hydra'?{x:0,y:0,z:0}:key==='mill'?g.briarMill:key==='bridge'?(g.briarBridge||g.briarMill||origin(g,prefix)):origin(g,prefix),g,api,at);
 if(next.water!==prev.water)emit(next.water>prev.water?'world_water_fill':'world_water_drain',origin(g,['ic.lock.']),g,api,at);
}
function charge(w,play){return charges.includes(w?.chg)&&!!play('weaponcharge_'+w.chg,1);}
const api={ids,charges,definitions,apply,bossId,state,warning,warningReady,snapshot,tick,reset,charge};root.BFWorldSfx=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
