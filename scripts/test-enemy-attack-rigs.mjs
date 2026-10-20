import {registerHooks} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
registerHooks({resolve(s,c,next){return s==='three'?{url:new URL('../public/3d/three.module.js',import.meta.url).href,shortCircuit:true}:next(s,c);}});
const [{GLTFLoader},T,{revisedClips,enemyAsset},{officerClips},{makeMimic},{attackVariants}]=await Promise.all([
 import('../public/3d/jsm/loaders/GLTFLoader.js'),import('../public/3d/three.module.js'),import('../public/3d/enemy-motion.js'),import('../public/3d/officer-motion.js'),import('../public/3d/mimic3d.js'),import('../public/3d/enemy-attack-performance.js')
]);
const types='grunt flyer emberling frostling toxling shadeling sparkling goblin bones slime slimelet caster charger mimic dustjackal cragspitter galewisp thornboar sporeback sentinel revenant bosscrystal frostshell frostlobber magmaskit embertotem blinkstalker voidtether sunpriest marblestatue siegeknight royalarcanist brute warden archer sorcerer colossus king tyrant marblecolossus officer-shield officer-spear prison_pike prison_guard prison_hound prison_vessel prison_bell prison_maw prison_unbound'.split(' ');
const rows=[];let samples=0;
for(const type of types){
 let g;if(type==='mimic')g=makeMimic();else{const d=await readFile(new URL('../public/3d/'+enemyAsset(type).replace('./',''),import.meta.url));g=await new GLTFLoader().parseAsync(d.buffer.slice(d.byteOffset,d.byteOffset+d.byteLength),'');}
 const root=g.scene,bones=[];root.traverse(o=>{if(o.isBone)bones.push(o);});
 const original=g.animations.map(c=>{c.name=c.name.split('|').pop();return c;});
 let clips=g._revisedAnimations||revisedClips(root,type,original);if(type.startsWith('officer-'))clips=officerClips(root,type.slice(8),clips);
 for(const move of attackVariants[type]||[])for(const phase of ['Windup','Attack','Recover'])assert(clips.some(c=>c.name===phase+'_'+move),type+' missing '+phase+'_'+move);
 const chosen=clips.filter(c=>/^(Windup|Attack|Recover)(_|$)/.test(c.name)),mixer=new T.AnimationMixer(root),start=root.position.clone();
 for(const c of chosen){
  assert(c.tracks.length,type+' empty '+c.name);assert(c.validate(),type+' invalid clip '+c.name);
  const action=mixer.clipAction(c);mixer.stopAllAction();action.reset().play();action.setLoop(T.LoopOnce,1);action.clampWhenFinished=true;
  for(let i=0;i<=24;i++){
   action.time=c.duration*i/24;mixer.update(0);root.updateMatrixWorld(true);samples++;
   root.traverse(o=>{assert(o.matrixWorld.elements.every(Number.isFinite),type+' nonfinite '+c.name);if(o.isBone)assert(Math.abs(o.quaternion.length()-1)<1e-5,type+' '+c.name+' '+o.name+' invalid rotation '+o.quaternion.length());});
   assert(root.position.distanceTo(start)<1e-7,type+' animation moved actor collider root');
  }
 }
 mixer.stopAllAction();mixer.uncacheRoot(root);rows.push({type,bones:bones.length,attackClips:chosen.length});
}
const report={status:'PASS',appearances:rows.length,samples,rows};
await mkdir('docs/art-validation/enemy-attacks-20261020',{recursive:true});await writeFile('docs/art-validation/enemy-attacks-20261020/rigs.json',JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,appearances:rows.length,samples,clips:rows.reduce((n,r)=>n+r.attackClips,0)}));
