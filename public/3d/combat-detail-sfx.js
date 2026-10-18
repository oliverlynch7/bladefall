/* Additive effect/release accents. Original contact, cast and death audio stays intact.
   Transient WeakMaps only: no sound metadata enters saves or gameplay packets. */
(function(root){'use strict';
const ids=["skillimpact_py_bolt","skillimpact_py_fan","skillimpact_py_blast","skillimpact_py_lance","skillimpact_py_nova","skillimpact_py_inferno","skillimpact_py_sun","skillimpact_w_cleave","skillimpact_w_bash","skillimpact_w_charge","skillimpact_w_whirl","skillimpact_w_stomp","skillimpact_w_execute","skillimpact_r_volley","skillimpact_r_pierce","skillimpact_r_tumble","skillimpact_r_shadow","skillimpact_r_spike","skillimpact_r_deathmark","skillimpact_m_bolt","skillimpact_m_beam","skillimpact_m_nova","skillimpact_m_gravity","skillimpact_m_tempest","skillimpact_m_overload","skillimpact_x_reap","skillimpact_x_cleave","skillimpact_x_pull","skillimpact_x_siphon","skillimpact_x_vortex","skillimpact_pal_bash","skillimpact_pal_smite","skillimpact_pal_ground","skillimpact_pal_burst","skillimpact_pal_laststand","skillimpact_pal_sky","skillimpact_necro_summon","skillimpact_necro_bolt","skillimpact_necro_raise","skillimpact_necro_nova","skillimpact_necro_grip","skillimpact_necro_army","skillimpact_necro_storm","skillimpact_nin_strike","skillimpact_nin_barrage","skillimpact_nin_pierce","skillimpact_bsk_cleave","skillimpact_bsk_bash","skillimpact_bsk_charge","skillimpact_bsk_stomp","skillimpact_bsk_whirl","skillimpact_bsk_execute","skillimpact_pir_pierce","skillimpact_pir_volley","skillimpact_pir_shadow","skillimpact_pir_tumble","skillimpact_pir_deathmark","skillimpact_pir_spike","skillimpact_chr_bolt","skillimpact_chr_beam","skillimpact_chr_nova","skillimpact_chr_gravity","skillimpact_chr_overload","skillimpact_mon_flurry","skillimpact_mon_palm","skillimpact_mon_deflect","skillimpact_mon_roll","skillimpact_mon_whirl","skillimpact_mon_stun","skillimpact_mon_thousand","skillimpact_mon_dragon","skillimpact_st_bolt","skillimpact_st_lance","skillimpact_st_nova","skillimpact_st_orb","skillimpact_st_storm","skillimpact_st_overload","skillimpact_war_bolt","skillimpact_war_lance","skillimpact_war_drain","skillimpact_war_step","skillimpact_war_orb","skillimpact_war_storm","skillimpact_war_final","skillimpact_sky_rise","skillimpact_sky_gale","skillimpact_sky_dive","skillimpact_sky_lift","skillimpact_sky_dash","skillimpact_sky_rain","skillimpact_sky_crash","skillimpact_sky_cyclone","skillimpact_bd_twin","skillimpact_bd_riposte","skillimpact_bd_step","skillimpact_bd_mirror","skillimpact_bd_cross","skillimpact_bd_perfect","skillimpact_bst_sic","skillimpact_bst_coordinated","skillimpact_bst_step","skillimpact_bst_roar","skillimpact_bst_stampede","enemyrelease_thornboar","enemyrelease_charger","enemyrelease_dustjackal","enemyrelease_toxling","enemyrelease_slime","enemyrelease_slimelet","enemyrelease_cragspitter","enemyrelease_sporeback","enemyrelease_shadeling","enemyrelease_blinkstalker","enemyrelease_voidtether","enemyrelease_galewisp","enemyrelease_flyer","enemyrelease_revenant","enemyrelease_bones","enemyrelease_grunt","enemyrelease_emberling","enemyrelease_magmaskit","enemyrelease_embertotem","enemyrelease_frostling","enemyrelease_sparkling","enemyrelease_frostlobber","enemyrelease_frostshell","enemyrelease_sentinel","enemyrelease_siegeknight","enemyrelease_marblestatue","enemyrelease_caster","enemyrelease_sunpriest","enemyrelease_royalarcanist","enemyhurt_thornboar","enemyhurt_charger","enemyhurt_dustjackal","enemyhurt_toxling","enemyhurt_slime","enemyhurt_slimelet","enemyhurt_cragspitter","enemyhurt_sporeback","enemyhurt_shadeling","enemyhurt_blinkstalker","enemyhurt_voidtether","enemyhurt_galewisp","enemyhurt_flyer","enemyhurt_revenant","enemyhurt_bones","enemyhurt_grunt","enemyhurt_emberling","enemyhurt_magmaskit","enemyhurt_embertotem","enemyhurt_frostling","enemyhurt_sparkling","enemyhurt_frostlobber","enemyhurt_frostshell","enemyhurt_sentinel","enemyhurt_siegeknight","enemyhurt_marblestatue","enemyhurt_caster","enemyhurt_sunpriest","enemyhurt_royalarcanist","bossrelease_brute_charge","bossrelease_brute_slam","bossrelease_marksman_volley","bossrelease_fallen_thrust","bossrelease_fallen_sweep","bossrelease_officer_caster","bossrelease_officer_shield","bossrelease_officer_spear","bossrelease_furnace_slam","bossrelease_furnace_sweep","bossrelease_furnace_vents","bossrelease_marble_hammer","bossrelease_marble_sweep","bossrelease_marble_fall","bossrelease_king_sweep","bossrelease_king_line","bossrelease_king_burst","bossrelease_king_wave","bossrelease_hydra_bite","bossrelease_hydra_sweep","bossrelease_hydra_blast"];
const definitions=Object.fromEntries(ids.map(id=>[id,{f:'custom/combat-detail-20261018/'+id+'_v01',v:id.startsWith('skillimpact_')?.24:id.startsWith('enemyhurt_')?.19:.28,lazy:true}]));
const timers=['chargeDash','tempestT','stormT','skyLandDmg','reflectT','_stillnessT','bdParryT','pyInfernoT','warBurstT','markExplode'];
let active=null,records=new WeakMap(),timed=new WeakMap(),actors=new WeakMap(),waves=new WeakSet(),world=null,scene=null,lastAudible=false,recent=[],pending=[],api=null;
const now=()=>performance.now()/1000;
function apply(registry){for(const [id,def]of Object.entries(definitions))if(!Object.hasOwn(registry,id))registry[id]={...def};}
function configure(value){api=value;}
function valid(c,g){return !!c&&!c.cancelled&&c.world===g&&c.player===g?.p&&c.scene===g?.enemies;}
function tag(record,c){if(record&&typeof record==='object'&&c)records.set(record,c);return record;}
function of(record){return record&&records.get(record)||null;}
function timer(actor,key){return timed.get(actor)?.get(key)||null;}
function withContext(c,fn){const before=active;active=c;try{return fn();}finally{active=before;}}
function run(g,id,fn){
 if(active||!g?.p||!definitions['skillimpact_'+id])return fn();
 const c={world:g,scene:g.enemies,player:g.p,id,played:false,cancelled:false};
 const arrays=['projectiles','meteors','spikefields','minions'],before=new Map(arrays.map(k=>[k,new Set(g[k]||[])]));
 const targets=[g.p,...g.enemies||[]],values=new Map(targets.map(a=>[a,timers.map(k=>a[k])]));let result;
 try{result=withContext(c,fn);}catch(err){c.cancelled=true;throw err;}finally{
  if(result==='refund')c.cancelled=true;
  if(!c.cancelled){for(const key of arrays)for(const record of g[key]||[])if(!before.get(key).has(record))tag(record,c);
   for(const actor of targets)for(let i=0;i<timers.length;i++){const key=timers[i];if(actor[key]>0&&actor[key]!==values.get(actor)[i]){if(!timed.has(actor))timed.set(actor,new Map());timed.get(actor).set(key,c);}}
  }
 }
 return result;
}
function impact(g,e,dealt,c=active){if(!(dealt>0)||!e||!valid(c,g)||c.played)return false;c.played=true;pending.push({c,id:'skillimpact_'+c.id,at:now(),position:{x:e.x,y:e.y||0,z:e.z}});return true;}
function distance(p,o){return Math.hypot(p.x-o.x,((p.y||0)-(o.y||0))*.6,p.z-o.z);}
function emit(id,o,g,at){if(!api||!definitions[id]||!o)return false;const d=distance(g.p,o);if(!Number.isFinite(d)||d>=1800)return false;recent=recent.filter(t=>at-t<.25);if(recent.length>=3)return false;const gain=Math.max(0,Math.min(1,(1800-d)/1350));api.play(id,gain);recent.push(at);return true;}
function boss(e){
 if(e.bruteOrchard)return e.bruteState==='charge'?'brute_charge':null;
 if(e.marksmanCrossing)return e.markAttack>0?'marksman_volley':null;
 if(e.fallenDuel)return e.fallAttack>0?'fallen_'+(e.fallKind==='sweep'?'sweep':'thrust'):null;
 if(e.frostOfficer)return e.offState==='strike'?'officer_'+e.frostOfficer:null;
 if(e.furnaceColossus)return e.fcState==='strike'?'furnace_'+e.fcKind:null;
 if(e.marbleGuardian)return e.mcState==='strike'?'marble_'+e.mcKind:null;
 if(e.finalKing)return e.akState==='strike'?'king_'+e.akKind:null;
 return null;
}
function snapshot(e,previous){const state=e.bruteState||e.markState||e.fallState||e.offState||e.fcState||e.mcState||e.akState;const key=boss(e);return {hp:e.hp,state,key,seq:e.offSeq??e.fcSeq??e.mcSeq??e.akSeq??e.fallSeq??0,melee:e.meleeActive||0,shot:e.shotReleaseT||0,charge:e.chargeT||0,active:!!e.active&&!e.dead&&e.hp>0,hurt:previous?.hurt??-Infinity};}
function reset(){world=null;scene=null;actors=new WeakMap();waves=new WeakSet();recent=[];pending=[];lastAudible=false;}
function tick(g,mode,hidden=false,at=now(),enabled=true){
 if(!g?.p){reset();return;}if(world!==g||scene!==g.enemies){reset();world=g;scene=g.enemies;}
 const audible=enabled&&!hidden&&mode==='play'&&!g.p.dead&&!g.p.downed&&!g._tutorialSafe;
 const continuing=audible&&lastAudible;lastAudible=audible;
 const queue=(id)=>{if(enabled&&definitions[id])api?.queue(id);};
 if(enabled)for(const id of api?.skills?.()||[])queue('skillimpact_'+id);
 const events=pending;pending=[];
 for(const event of events)if(audible&&valid(event.c,g)&&at-event.at<.8&&!event.c.cancelled&&emit(event.id,event.position,g,at))api?.relay?.(event.id);
 for(const e of g.enemies||[]){const prev=actors.get(e);let curr=snapshot(e,prev);
  // The brute slam releases as its attack state ends. No mutation on the enemy itself.
  if(e.bruteOrchard&&curr.state==='recover'&&prev?.state==='slam')curr.key='brute_slam';
  actors.set(e,curr);
  if(distance(g.p,e)<2000){queue('enemyrelease_'+e.type);queue('enemyhurt_'+e.type);const keys=e.bruteOrchard?['brute_charge','brute_slam']:e.marksmanCrossing?['marksman_volley']:e.fallenDuel?['fallen_thrust','fallen_sweep']:e.frostOfficer?['officer_'+e.frostOfficer]:e.furnaceColossus?['furnace_slam','furnace_sweep','furnace_vents']:e.marbleGuardian?['marble_hammer','marble_sweep','marble_fall']:e.finalKing?['king_sweep','king_line','king_burst','king_wave']:[];for(const key of keys)queue('bossrelease_'+key);}
  if(!continuing||!prev||!prev.active||!curr.active)continue;
  if(curr.key&&(curr.key!==prev.key||curr.seq!==prev.seq))emit('bossrelease_'+curr.key,e,g,at);
  if(!e.boss&&!curr.key&&((curr.melee>0&&prev.melee<=0)||(curr.shot>prev.shot+.01)||(curr.charge>0&&prev.charge<=0)))emit('enemyrelease_'+e.type,e,g,at);
  if(curr.hp<prev.hp&&at-prev.hurt>=2){if(emit('enemyhurt_'+e.type,e,g,at))curr.hurt=at;}
 }
 const waveTypes=new Set();for(const wave of g.shockwaves||[]){if(waves.has(wave)||wave.delay>0)continue;waves.add(wave);if(continuing&&wave.fxType&&!waveTypes.has(wave.fxType)){waveTypes.add(wave.fxType);emit('enemyrelease_'+wave.fxType,wave,g,at);}}
 const h=g.hydraArena;if(h){const prev=actors.get(h),curr={state:h.state,seq:h.seq};actors.set(h,curr);for(const kind of ['bite','sweep','blast'])queue('bossrelease_hydra_'+kind);if(continuing&&prev&&h.state==='strike'&&(prev.state!=='strike'||prev.seq!==h.seq))emit('bossrelease_hydra_'+h.kind,h,g,at);}
}
const value={ids,definitions,apply,configure,run,tag,of,timer,withContext,impact,tick,reset,valid,get current(){return active;}};root.BFCombatDetailSfx=value;if(typeof module!=='undefined')module.exports=value;
})(typeof window!=='undefined'?window:globalThis);
