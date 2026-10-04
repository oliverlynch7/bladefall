import assert from 'node:assert/strict';
import {choreographyProfile,choreographyPose} from '../public/3d/enemy-choreography.js';
import {enemyActionState,instantEnemyRelease} from '../public/3d/enemy-action-state.js';
const types=['grunt','sentinel','revenant','caster','frostlobber','sunpriest','dustjackal','thornboar','cragspitter'];
const signatures=new Set();
for(const type of types){
 const profile=choreographyProfile(type);assert(profile.recover>0&&profile.recover<.5);
 assert.deepEqual(choreographyPose(type,'Windup',1),choreographyPose(type,'Attack',0),type+' continuous release');
 const end=choreographyPose(type,'Attack',1),start=choreographyPose(type,'Recover',0);
 for(const key in end)end[key].forEach((n,i)=>assert(Math.abs(n-start[key][i])<1e-8,type+' continuous recovery'));
 for(const phase of ['Windup','Attack','Recover'])for(let i=0;i<=100;i++){
  const pose=choreographyPose(type,phase,i/100);
  for(const values of Object.values(pose))for(const angle of values)assert(Number.isFinite(angle)&&Math.abs(angle)<1.8);
  for(const key of ['legL','legR','rearL','rearR'])assert(!pose[key],type+' keeps feet anchored');
 }
 assert(Object.values(choreographyPose(type,'Recover',1)).flat().every(v=>v===0));
 signatures.add(JSON.stringify(choreographyPose(type,'Windup',1)));
}
assert.equal(signatures.size,types.length);
assert.equal(choreographyPose('warden','Attack',.5),null,'authored boss pose preserved');
for(const type of ['caster','sunpriest'])for(const phase of ['Windup','Attack','Recover']){
 assert(choreographyPose(type,phase,.6).armR.every(n=>Math.abs(n)<.3),'staff stays in supporting hand');
}
const wind={phase:'Windup',phaseKey:'shotW'},idle={phase:null};
assert(!instantEnemyRelease(wind,idle,{}),'cancelled shot cannot release');
assert(!instantEnemyRelease({phase:'Windup',phaseKey:'raid'},idle,{ceKind:'raid'}),'cancelled elite cannot swing');
assert(!instantEnemyRelease({phase:'Windup',phaseKey:'slamW'},idle,{stunT:1}));
assert(instantEnemyRelease({phase:'Windup',phaseKey:'slamW'},idle,{}),'instant legacy effect remains animated');
assert.equal(enemyActionState({shotReleaseT:.2}).phase,'Attack');
assert.equal(enemyActionState({ceKind:'raid',ceState:'recover',ceClock:1}).phase,null);
console.log('PASS: nine distinct bounded poses, continuous wind/strike/recovery, staff support, cancellation and explicit shot release');

for(const [flag,prefix] of [['furnaceColossus','fc'],['marbleGuardian','mc']]){
 const e={[flag]:true,[prefix+'State']:'recover',[prefix+'Clock']:1};
 assert.equal(enemyActionState(e).phase,null);assert(!instantEnemyRelease({phase:'Windup',phaseKey:'slamW'},idle,e));
 e[prefix+'State']='strike';assert.equal(enemyActionState(e).phase,'Attack');
}
assert(instantEnemyRelease({phase:'Windup',phaseKey:'slamW'},idle,{bruteOrchard:true,bruteState:'recover'}));
assert(!instantEnemyRelease({phase:'Windup',phaseKey:'windT'},idle,{bruteOrchard:true,bruteState:'stagger'}));
assert(instantEnemyRelease({phase:'Windup',phaseKey:'pinT'},idle,{}));
console.log('PASS: cooled/countered bosses do not swing; valid brute slam and arrow volley still animate');
