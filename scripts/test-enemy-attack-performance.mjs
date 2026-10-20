import assert from 'node:assert/strict';
import {choreographyPose,choreographyProfile} from '../public/3d/enemy-choreography.js';
import {attackVariants} from '../public/3d/enemy-attack-performance.js';
import {enemyActionState,instantEnemyRelease} from '../public/3d/enemy-action-state.js';
import {hydraAttackPose} from '../public/3d/hydra-attack-motion.js';
let checks=0;const ok=(v,m)=>{assert(v,m);checks++;};
for(const [type,moves]of Object.entries(attackVariants))for(const move of moves){
 const p=choreographyProfile(type,move);ok(p&&p.label,'Move profile '+type+move);
 assert.deepEqual(choreographyPose(type,'Windup',1,move),choreographyPose(type,'Attack',0,move));
 const a=choreographyPose(type,'Attack',1,move),b=choreographyPose(type,'Recover',0,move);
 for(const k in a)ok(a[k].every((v,i)=>Math.abs(v-b[k][i])<1e-8),'Continuous follow-through '+type+move);
 for(const phase of ['Windup','Attack','Recover'])for(let i=0;i<=24;i++)ok(Object.values(choreographyPose(type,phase,i/24,move)).flat().every(v=>Number.isFinite(v)&&Math.abs(v)<2.8),'Bounded anatomy');
 ok(Object.values(choreographyPose(type,'Recover',1,move)).flat().every(v=>Math.abs(v)<1e-8),'Returns to rest');
}
for(const [e,move]of [[{ceKind:'briar_guard',ceState:'wind',ceClock:.5},'sweep'],[{ceKind:'keep_lance',ceState:'strike',ceClock:.1},'thrust'],[{ceKind:'frost_ring',ceState:'recover',ceClock:1},'stomp'],[{ceKind:'coast_volley',ceState:'wind'},'volley'],[{finalKing:true,akState:'wind',akKind:'line'},'beam'],[{finalKing:true,akState:'strike',akKind:'wave'},'stomp'],[{fallenDuel:true,fallState:'strike',fallAttack:.3,fallKind:'sweep'},'sweep'],[{frostOfficer:'shield',offState:'strike'},'shieldWave'],[{frostOfficer:'spear',offState:'strike'},'thrust']]){
 const before=JSON.stringify(e),s=enemyActionState(e);ok(s.move===move,'Correct authored movement '+move);ok(JSON.stringify(e)===before,'Animation selection does not mutate gameplay');
}
ok(!instantEnemyRelease({phase:'Windup',phaseKey:'briar_guard'},enemyActionState({ceKind:'briar_guard',ceState:'recover',stunT:1}),{ceKind:'briar_guard',stunT:1}),'Cancelled strike cannot fake a release');
const signatures=new Set();for(const move of ['beam','stomp','burst','sweep'])signatures.add(JSON.stringify(choreographyPose('tyrant','Attack',.12,move)));ok(signatures.size===4,'All royal attacks physically distinct');
for(const kind of ['bite','sweep','blast'])for(const state of ['wind','strike','recover'])for(let i=0;i<=30;i++){
 const h={head:1,kind,state,clock:(state==='wind'?(kind==='blast'?2:1.6):state==='strike'?.45:3.4)*(1-i/30),elapsed:i/60,x:250,y:120,z:200,broken:[],freed:false};
 const before=JSON.stringify(h),p=hydraAttackPose(h,1,{x:0,y:120,z:-520});ok(Object.values(p).every(Number.isFinite),'Finite Hydra pose');ok(JSON.stringify(h)===before,'Hydra animation cannot change attack geometry');
}
const end=hydraAttackPose({head:0,kind:'sweep',state:'wind',clock:0,broken:[],x:0,y:120,z:200},0,{x:-550,z:-250});ok(end.x===-800&&end.z===100,'Sweep winds back to the correct side before release');
console.log(checks+' semantic pose, continuity, cancellation, bounds and Hydra checks passed.');
