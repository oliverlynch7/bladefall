import * as THREE from './three.module.js';
import * as SkeletonUtils from './jsm/utils/SkeletonUtils.js';
import { loadModelAnyExt } from './loadmodel.js';

// Original Blender roster: one vertex-colored skinned mesh and ten bones per appearance.
// The renderer mirrors gameplay objects and never changes combat state. Props still use
// the shared kit loader below; unknown enemies retain the legacy rendering fallback.
const MOB_CAST = Object.fromEntries(["grunt", "flyer", "emberling", "frostling", "toxling", "shadeling", "sparkling", "goblin", "bones", "slime", "slimelet", "caster", "charger", "mimic", "dustjackal", "cragspitter", "galewisp", "thornboar", "sporeback", "sentinel", "revenant", "dummy", "bosscrystal", "frostshell", "frostlobber", "magmaskit", "embertotem", "blinkstalker", "voidtether", "sunpriest", "marblestatue", "siegeknight", "royalarcanist", "brute", "warden", "archer", "sorcerer", "colossus", "king", "tyrant", "marblecolossus"].map(type => [type, {file:'enemy-assets/'+type}]));
const ASSETS_DIR = '../slice3d/assets/';
const MOBS_DIR = ASSETS_DIR + 'monsters/';
const _mobModels = new Map();
const _mobPool = [];
const _pending = new Map();
const _actors = new Map();
let _drawn = new WeakSet();
let _mobGroup = null;

export const MOB3D = { on:true, live:0, pooled:0, missing:[], err:null };
try {
  const q = new URLSearchParams(location.search);
  /* Rides with world3d: a 3D world full of voxel monsters looks worse than either alone. Both
     flags read as an opt-OUT now that the layer is on by default; `?mob3d=` wins where both are
     given, so the creatures can be turned off on their own to isolate a problem. */
  const yes = v => (v === '1' || v === 'true');
  if(q.has('world3d')) MOB3D.on = yes(q.get('world3d'));
  if(q.has('mob3d'))   MOB3D.on = yes(q.get('mob3d'));
} catch(e){}

/* A glTF material with no `metallicRoughnessTexture` and no metallicFactor takes the SPEC DEFAULT
   of metalness 1. A fully metallic surface is lit only by what it reflects, and this scene has no
   environment map, so such a model renders near-black - a "wooden" chest came out dark navy.

   The Quaternius prop kit ships its roughness/metalness in T_*_ORM.png, and every single ORM in
   that kit is missing from the repo (`node _shot/shot.js --assets qprops` lists ten of them). So
   the whole kit is in exactly that state. AUTOPILOT.md filed missing ORM/Normal maps as "degrade
   shading slightly"; for a base-colour-only kit it is the difference between wood and a black box.

   The condition is deliberately the FAULT, not the folder: metallic with no map to vary it. A
   correctly authored material - metalness from a texture, or an explicit low factor - is left
   exactly as its artist made it. */
function demetalise(root, label){
  let fixed = 0;
  root.traverse(o => {
    if(!o.isMesh) return;
    for(const m of (Array.isArray(o.material) ? o.material : [o.material])){
      if(!m || m.metalness === undefined) continue;
      if(m.metalness > 0.5 && !m.metalnessMap){ m.metalness = 0; m.needsUpdate = true; fixed++; }
    }
  });
  if(fixed) console.log('[3d] ' + label + ': ' + fixed + ' material(s) were metalness=1 with no ORM map — lit as diffuse instead of black');
}

/* Exported because prop3d casts the world's OBJECTS (chests, keys) out of the same kits and needs
   exactly this: resolve the extension, strip the clip-name prefix, measure the native height,
   footprint and base offset once. Copying the body into a second module is how this project has
   lost whole sessions - two identical functions, the fix landing in the one nobody calls. One
   body, two callers. The cache is shared too, so a chest and a mimic are one download. */
export async function loadKitModel(file){
  if(_mobModels.has(file)) return _mobModels.get(file);
  try {
    /* A bare name is a creature in monsters/; a name with a slash carries its own kit folder.
       Extension is resolved rather than assumed - monsters/ ships .glb, the prop kits ship .gltf
       with a sidecar .bin, and hardcoding .glb is exactly how world3d's Floor_Brick silently
       failed and reported a successful build with no floor in it. */
    const base = file.startsWith('enemy-assets/') ? './'+file : file.indexOf('/') >= 0 ? ASSETS_DIR + file : MOBS_DIR + file;
    let g = null;
    g = await loadModelAnyExt(base);
    for(const c of g.animations) c.name = c.name.split('|').pop();
    demetalise(g.scene, file);
    /* Measure the model's NATIVE height once. cast.h is the slice's TARGET height, not the
       model's own size - the slice normalises to it inside its Actor constructor. Treating the
       target as the native size made a sporeback tower over the hero. Scale needs the real
       bounding height, exactly as the prop loader does. */
    g.scene.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(g.scene);
    g._nativeH = Math.max(0.001, bb.max.y - bb.min.y);
    g._baseY = bb.min.y;
    /* Footprint too, for the fit:'width' casts. See the scale note in syncMobsInner.
       The two axes are kept separately as well: a chest is a BOX, and prop3d has to know how deep
       it ends up so the glowing lock can be placed just proud of its real front face rather than
       at a number guessed from the voxel model it replaces. */
    g._nativeX = Math.max(0.001, bb.max.x - bb.min.x);
    g._nativeZ = Math.max(0.001, bb.max.z - bb.min.z);
    g._nativeW = Math.max(g._nativeX, g._nativeZ);
    _mobModels.set(file, g);
    return g;
  } catch(e){
    console.warn('[3d] kit model failed:', file, e.message);
    _mobModels.set(file, null);          // remember the failure; do not retry every frame
    if(MOB3D.missing.indexOf(file) < 0) MOB3D.missing.push(file);
    return null;
  }
}

/* Read-only view of the shared cache. `undefined` = never asked for, `null` = tried and failed,
   otherwise the parsed glTF with its measurements attached. */
export function kitModel(file){ return _mobModels.get(file); }

// Actor identity survives list reordering; skinned clones share immutable geometry/materials.
function appearance(e, w){return e.type==='colossus' && w.theme==='marble' ? 'marblecolossus' : e.type;}
function requestModel(file){
  if(!_mobModels.has(file) && !_pending.has(file)){
    const p=loadKitModel(file);_pending.set(file,p);p.finally(()=>_pending.delete(file));
  }
}
function acquireMob(type,e){
  const cast=MOB_CAST[type],src=cast&&kitModel(cast.file);if(!src)return null;
  let rec=_mobPool.find(r=>!r.enemy && r.type===type);
  if(!rec){
    const root=SkeletonUtils.clone(src.scene);root.name='enemy:'+type;
    const materials=[];
    root.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.castShadow=false;
      o.material=o.material.clone();o.material.transparent=true;o.material.forceSinglePass=true;materials.push(o.material);
    }});
    const mixer=new THREE.AnimationMixer(root),actions={};
    for(const c of src.animations){const a=mixer.clipAction(c);if(['Attack','Hit','Death','Windup'].includes(c.name)){a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;}actions[c.name]=a;}
    rec={root,mixer,actions,type,src,materials};_mobGroup.add(root);_mobPool.push(rec);
  }
  Object.assign(rec,{enemy:e,x:e.x,z:e.z,cur:null,attack:0,death:0,wasDead:false,wind:0,shoot:e.shootT||0,hit:e.hitFlash||0,contact:0});
  rec.mixer.stopAllAction();rec.root.visible=true;_actors.set(e,rec);return rec;
}
function play(rec,name){
  const a=rec.actions[name]||rec.actions.Idle;if(!a)return;
  if(rec.cur===name)return;
  const old=rec.actions[rec.cur];if(old)old.fadeOut(.08);
  a.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(.08).play();rec.cur=name;
}
function release(rec){
  _actors.delete(rec.enemy);rec.enemy=null;rec.root.visible=false;rec.mixer.stopAllAction();
}
function disposeActor(rec){
  rec.mixer.stopAllAction();rec.mixer.uncacheRoot(rec.root);rec.root.removeFromParent();
  // Geometry and materials belong to the source cache; bone textures belong to this clone.
  rec.root.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});
  for(const m of rec.materials)m.dispose();
}
window.__mob3dEnabled=v=>{if(_mobGroup)_mobGroup.visible=!!v;};
export function syncMobs(scene,dt){
  if(!MOB3D.on)return false;
  try{return syncMobsInner(scene,Math.min(.1,Math.max(0,dt||0)));}
  catch(e){MOB3D.err=String(e?.stack||e);MOB3D.on=false;if(_mobGroup)_mobGroup.visible=false;_drawn=new WeakSet();console.warn('[mob3d]',e);return false;}
}
function syncMobsInner(scene,dt){
  const w=window.__BF_WORLD?.();if(!w?.enemies)return false;
  if(!_mobGroup){_mobGroup=new THREE.Group();_mobGroup.name='mob3d';scene.add(_mobGroup);}
  _drawn=new WeakSet();const present=new Set(w.enemies);let live=0,corpses=0;
  // Ordinary corpses are removed by gameplay in the same tick as the kill. Keep only
  // their presentation record long enough to finish the death, without restoring an enemy.
  const foes=w.enemies.concat([..._actors.keys()].filter(e=>e.dead&&!present.has(e)));
  for(const e of foes){
    if(!e||e.bot)continue;
    const type=appearance(e,w),cast=MOB_CAST[type];if(!cast)continue;
    if(!e.dead)requestModel(cast.file);
    let rec=_actors.get(e);
    if(rec&&rec.type!==type){release(rec);rec=null;}
    if(!rec&&!e.dead)rec=acquireMob(type,e);
    if(!rec)continue;
    if(e.dead){
      if(!rec.wasDead){rec.wasDead=true;rec.death=.78;play(rec,'Death');}
      rec.death-=dt;if(rec.death<=0||corpses>=12){release(rec);continue;}
      for(const m of rec.materials){m.opacity=Math.min(1,rec.death/.18);m.depthWrite=m.opacity>.95;m.emissiveIntensity=0;}
      rec.mixer.update(dt);corpses++;continue;
    }
    // Training targets and resurrected skeletons can reuse the same gameplay object.
    if(rec.wasDead){rec.wasDead=false;rec.cur=null;rec.mixer.stopAllAction();}
    const s=(e.h||38)/rec.src._nativeH;
    rec.root.scale.setScalar(s);
    rec.root.position.set(e.x,(e.y||0)-rec.src._baseY*s-(e.dropT||0)*(e.h||38)*.22,e.z);
    rec.root.rotation.y=e.yaw||0;rec.root.visible=true;
    for(const m of rec.materials){
      m.opacity=e.untargetable ? .28 : 1;m.depthWrite=!e.untargetable;
      m.color.set(e.slowT>0?0xb6ddff:0xffffff);
      m.emissive.set(0xffffff);m.emissiveIntensity=e.hitFlash>0 ? .65 : 0;
    }
    const speed=dt>0?Math.hypot(e.x-rec.x,e.z-rec.z)/dt:0;rec.x=e.x;rec.z=e.z;
    const wind=Math.max(0,e.windT||0,e.slamW||0,e.cleaveW||0,e.novaW||0,e.poundW||0,e.eruptW||0,e.knightW||0,e.pinT||0,e.blinkFx||0);
    const shot=(e.shootT||0)>rec.shoot+.15;
    const contact=e.dmg>0&&w.p&&Math.hypot(e.x-w.p.x,e.z-w.p.z)<(e.r+w.p.r+4)&&Math.abs((e.y||0)-(w.p.y||0))<(e.h||38);
    rec.contact=Math.max(0,rec.contact-dt);rec.attack=Math.max(0,rec.attack-dt);
    if((rec.wind>0&&wind<=0)||shot||(contact&&rec.contact<=0)){rec.attack=.42;rec.contact=.65;rec.cur=null;}
    if((e.hitFlash||0)>rec.hit+.025 && !wind){rec.cur=null;play(rec,'Hit');}
    else if(wind>0)play(rec,'Windup');
    else if(rec.attack>0||e.chargeT>0||e.lunge>0||e.diving>0)play(rec,'Attack');
    else if(rec.cur!=='Hit'||!rec.actions.Hit?.isRunning())play(rec,speed>3&&speed<1600?'Move':'Idle');
    // Pose holds through the entire telegraph; rendering never changes its timer or damage.
    if(rec.cur==='Windup')rec.actions.Windup.setEffectiveTimeScale(1.7);
    if(rec.cur==='Move')rec.actions.Move.setEffectiveTimeScale(Math.max(.65,Math.min(1.7,speed/(e.speed||60))));
    rec.mixer.update((e.stunT>0)?0:dt);
    rec.wind=wind;rec.shoot=e.shootT||0;rec.hit=e.hitFlash||0;
    _drawn.add(e);live++;
  }
  const reserve={};
  for(let i=_mobPool.length-1;i>=0;i--){const r=_mobPool[i];
    if(r.enemy&&!r.enemy.dead&&!present.has(r.enemy))release(r);
    if(r.enemy)continue;
    reserve[r.type]=(reserve[r.type]||0)+1;
    if(reserve[r.type]>2){disposeActor(r);_mobPool.splice(i,1);}
  }
  Object.assign(MOB3D,{live,corpses,pooled:_mobPool.length});return true;
}
export function clearMobs(){
  for(const r of _mobPool)disposeActor(r);
  _mobPool.length=0;_actors.clear();_drawn=new WeakSet();MOB3D.pooled=0;MOB3D.live=0;
}
export function mobDrawn(e){return MOB3D.on&&!!e&&typeof e==='object'&&_drawn.has(e);}
window.__mob3dDrawn=mobDrawn;
window.__mob3d=()=>({on:MOB3D.on,live:MOB3D.live,corpses:MOB3D.corpses||0,pooled:MOB3D.pooled,models:[..._mobModels.keys()],pending:[..._pending.keys()],missing:MOB3D.missing,err:MOB3D.err,actors:_mobPool.filter(r=>r.enemy).map(r=>({type:r.type,clip:r.cur,dead:r.wasDead}))});
