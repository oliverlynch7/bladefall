const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const api=require('../public/3d/skill-sfx.js');let checks=0;
function ok(v,label){assert(v,label);checks++;}
const html=fs.readFileSync('public/3d/index.html','utf8'),source=html.slice(html.indexOf('function useSkill(i){'),html.indexOf('function useSkillLegacy(i){'));
const keep={f:'original',v:.5},registry={skillcast_py_bolt:keep};api.apply(registry);ok(registry.skillcast_py_bolt===keep,'existing registry entries never overwritten');
for(const id of api.ids){let calls=[];ok(api.cast(id,key=>{calls.push(key);return {};})&&calls.join()==='skillcast_'+id,'dedicated cue once '+id);calls=[];ok(api.cast(id,key=>{calls.push(key);return key==='cast1'?{}:null;})&&calls.join()==='skillcast_'+id+',cast1','unavailable buffer uses original fire fallback '+id);}
ok(!api.cast('m_bolt',()=>{throw Error('should not be reached');}),'other classes unchanged');ok(!api.cast('py_bolt',()=>{throw Error('device failed');}),'audio device failure cannot crash combat');
function fixture(id){const sounds=[],p={weapon:{},skillCd:[0,0,0,0],skillCdMax:[0,0,0,0],mana:100},s={id,fx:id,cd:5};let outcome;
 const box={window:{BFSkillSfx:api},mode:'play',G:{p,projectiles:[]},meta:{classId:'pyromancer'},c2def:()=>true,c2CurSkills:()=>[s],classState:()=>({rank:10}),c2Passive:()=>false,spendSkillMana:()=>p.mana>=10?(p.mana-=10,10):0,skillManaCost:()=>10,initAudio(){},classCastPreparation(){},classFamilyOk:()=>true,SKILL_FX:{[id]:()=>outcome},gainMana:(p,n)=>p.mana+=n,partyChannel:null,classCastCompanionOrder(){},effCdr:()=>0,skillbarUpdate(){},playFx:key=>{sounds.push(key);return {};},useSkillLegacy(){},c2NextChoice:()=>null,toast(){}};
 vm.createContext(box);vm.runInContext(source,box);return {box,p,sounds,refund(){outcome='refund';}};}
for(const id of api.ids){let f=fixture(id);f.box.useSkill(0);ok(f.sounds.join()==='skillcast_'+id&&f.p.mana===90&&f.p.skillCd[0]===5,'successful root cast routes once '+id);f.box.useSkill(0);ok(f.sounds.length===1,'cooldown cannot retrigger '+id);f=fixture(id);f.refund();f.box.useSkill(0);ok(!f.sounds.length&&f.p.mana===100&&!f.p.skillCd[0],'refunded cast silent and unchanged '+id);}
for(const state of ['dead','downed','_pvpDead','dragonRide']){const f=fixture('py_bolt');f.p[state]=true;f.box.useSkill(0);ok(!f.sounds.length,state+' cannot cast');}
let f=fixture('py_bolt');f.p.mana=0;f.box.useSkill(0);ok(!f.sounds.length,'insufficient mana silent');for(const i of [-1,4,null])f.box.useSkill(i);ok(!f.sounds.length,'invalid input silent');
const manifest=JSON.parse(fs.readFileSync('public/sfx/custom/pyromancer-20261017/manifest.json','utf8'));
ok(manifest.cues.length===8,'all eight processed assets');for(const cue of manifest.cues){ok(cue.peak<.95&&cue.rms>.002&&cue.duration<1.5,'finite compact signal '+cue.id);ok(fs.existsSync('public/sfx/'+cue.file+'.mp3'),'runtime asset '+cue.id);}
console.log(checks+' additive skill audio, actual cast gate and asset checks passed.');
