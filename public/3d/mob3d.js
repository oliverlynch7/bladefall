import * as THREE from './three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from './jsm/utils/SkeletonUtils.js';

const _mobLoader = new GLTFLoader();
const _loadGLB = url => new Promise((res, rej) => _mobLoader.load(url, res, undefined, rej));

/* ─────────────────────────────────────────────────────────────────────────────
   MOB3D — the game's live enemies as 3D creatures.

   The world and the hero are 3D while the things fighting you are still voxel, which is the
   loudest remaining inconsistency. This pools one animated model per live enemy, keyed off the
   game's own G.enemies, so it follows the real fight rather than re-simulating anything.

   Affordable because the device test came back at 60fps with 64 animated skinned characters and
   a room holds roughly ten. Clones use SkeletonUtils.clone, verified to give each copy its OWN
   skeleton (32 sampled, 32 distinct poses) - a plain .clone() rebinds every copy to the original
   and the whole room then animates as one creature.

   Cast table generated FROM the slice's MONSTERS table rather than retyped, so a transcription
   slip cannot silently miscast a mob.
   ───────────────────────────────────────────────────────────────────────────── */
const MOB_CAST = {
  blinkstalker:  { file:'Ninja', rig:'blob', h:1.2 },
  bones:         { file:'Ghost_Skull', rig:'fly', h:1.05 },
  caster:        { file:'Wizard', rig:'blob', h:1.2 },
  charger:       { file:'Dino', rig:'ground', h:1.25 },
  cragspitter:   { file:'Goleling', rig:'fly', h:1.05 },
  dustjackal:    { file:'Dino', rig:'ground', h:0.93, skin:'dust' },
  emberling:     { file:'Goleling', rig:'fly', h:1.2, skin:'magma' },
  embertotem:    { file:'Cactoro', rig:'blob', h:1.7, skin:'totem' },
  flyer:         { file:'Dragon', rig:'fly', h:0.95 },
  frostling:     { file:'Green_Blob', rig:'blob', h:1.36, skin:'frost' },
  frostlobber:   { file:'Glub_Evolved', rig:'fly', h:1.43, skin:'frost' },
  frostshell:    { file:'Yeti', rig:'blob', h:1.34 },
  galewisp:      { file:'Armabee_Evolved', rig:'fly', h:0.75 },
  /* goblin / slimelet / sparkling were dropped by the original port even though the slice casts
     all three. Same files, rigs and heights as the slice's MONSTERS rows, so they match what
     Oliver tuned there. Without them these mobs fell back to the voxel renderer and stood out as
     the only flat-shaded creatures in an otherwise 3D fight. */
  goblin:        { file:'Orc_Enemy', rig:'blob', h:0.95 },
  grunt:         { file:'Orc', rig:'ground', h:1.35 },
  magmaskit:     { file:'Green_Spiky_Blob', rig:'blob', h:0.79, skin:'magma' },
  marblestatue:  { file:'Goleling_Evolved', rig:'fly', h:1.5 },
  revenant:      { file:'Tribal', rig:'fly', h:1.25 },
  royalarcanist: { file:'Wizard', rig:'blob', h:1.64, skin:'arcane' },
  sentinel:      { file:'Goleling', rig:'fly', h:1.22, skin:'rust' },
  shadeling:     { file:'Demon', rig:'ground', h:1.45 },
  siegeknight:   { file:'Orc', rig:'ground', h:1.64, skin:'steel' },
  slime:         { file:'Pink_Slime', rig:'blob', h:0.7 },
  slimelet:      { file:'Green_Blob', rig:'blob', h:0.55 },
  sparkling:     { file:'Hywirl', rig:'fly', h:0.72 },
  sporeback:     { file:'Mushnub_Evolved', rig:'blob', h:1.05 },
  sunpriest:     { file:'Wizard', rig:'blob', h:1.57, skin:'holy' },
  thornboar:     { file:'Cactoro', rig:'blob', h:1.0 },
  toxling:       { file:'Green_Spiky_Blob', rig:'blob', h:0.85 },
  voidtether:    { file:'Blue_Demon', rig:'ground', h:1.55 },
};

/* Clip names differ per rig. Quaternius exports them as "CharacterArmature|Idle", so the pipe
   prefix is stripped on load exactly as the slice does. */
const MOB_CLIPS = {
  ground: { idle:['Idle'], move:['Run','Walk'] },
  blob:   { idle:['Idle'], move:['Jump','Run','Walk'] },
  fly:    { idle:['Flying_Idle','Idle'], move:['Fly','Flying','Run'] },
};
const MOBS_DIR = '../slice3d/assets/monsters/';
const _mobModels = new Map();
const _mobPool = [];
let _mobGroup = null;

export const MOB3D = { on:false, live:0, pooled:0, missing:[], err:null };
try {
  const q = new URLSearchParams(location.search);
  /* Rides with world3d: a 3D world full of voxel monsters looks worse than either alone. */
  if(q.get('world3d') === '1' || q.get('mob3d') === '1') MOB3D.on = true;
} catch(e){}

async function loadMobModel(file){
  if(_mobModels.has(file)) return _mobModels.get(file);
  try {
    const g = await _loadGLB(MOBS_DIR + file + '.glb');
    for(const c of g.animations) c.name = c.name.split('|').pop();
    /* Measure the model's NATIVE height once. cast.h is the slice's TARGET height, not the
       model's own size - the slice normalises to it inside its Actor constructor. Treating the
       target as the native size made a sporeback tower over the hero. Scale needs the real
       bounding height, exactly as the prop loader does. */
    g.scene.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(g.scene);
    g._nativeH = Math.max(0.001, bb.max.y - bb.min.y);
    g._baseY = bb.min.y;
    _mobModels.set(file, g);
    return g;
  } catch(e){
    console.warn('[mob3d] model failed:', file, e.message);
    _mobModels.set(file, null);          // remember the failure; do not retry every frame
    if(MOB3D.missing.indexOf(file) < 0) MOB3D.missing.push(file);
    return null;
  }
}

/* Take a pooled actor of this type, or build one. Pooling matters because enemies die and spawn
   constantly - cloning a skinned mesh per spawn would allocate through the whole fight. */
function acquireMob(type){
  for(const m of _mobPool){ if(!m.inUse && m.type === type){ m.inUse = true; m.root.visible = true; return m; } }
  const cast = MOB_CAST[type];
  if(!cast) return null;
  const src = _mobModels.get(cast.file);
  if(!src) return null;                  // not loaded yet; the voxel mob keeps drawing this frame
  const root = SkeletonUtils.clone(src.scene);
  root.traverse(o => { if(o.isMesh){ o.frustumCulled = false; o.castShadow = false; } });
  const mixer = new THREE.AnimationMixer(root);
  const clips = {};
  for(const c of src.animations) clips[c.name] = c;
  const pick = names => { for(const n of (names||[])) if(clips[n]) return clips[n]; return src.animations[0] || null; };
  const rig = MOB_CLIPS[cast.rig] || MOB_CLIPS.ground;
  const actions = {
    idle: pick(rig.idle) && mixer.clipAction(pick(rig.idle)),
    move: pick(rig.move) && mixer.clipAction(pick(rig.move)),
  };
  const rec = { root, mixer, actions, type, inUse:true, cur:null, cast };
  _mobGroup.add(root);
  _mobPool.push(rec);
  return rec;
}

function playMob(rec, moving){
  const want = moving ? (rec.actions.move || rec.actions.idle) : (rec.actions.idle || rec.actions.move);
  if(!want || rec.cur === want) return;
  if(rec.cur) rec.cur.fadeOut(0.18);
  want.reset().fadeIn(0.18).play();
  rec.cur = want;
}

/* Called every frame from the hero draw. Reads the game's live enemy list and mirrors it. */
export function syncMobs(scene, dt){
  if(!MOB3D.on) return false;
  /* Contain mob faults HERE. Without this the throw propagates to drawHero3D's catch, which sets
     HERO3D.on = false - so one bad creature would take down the hero and the whole world with it.
     Each layer should be able to fail alone; world3d already does this. */
  try { return syncMobsInner(scene, dt); }
  catch(e){
    MOB3D.err = String(e && e.message || e);
    MOB3D.on = false;
    console.warn('[mob3d] disabled after fault, voxel mobs resume:', MOB3D.err);
    return false;
  }
}
function syncMobsInner(scene, dt){
  let world = null;
  try { world = window.__BF_WORLD && window.__BF_WORLD(); } catch(e){}
  const foes = (world && world.enemies) || null;
  if(!foes) return false;
  if(!_mobGroup){ _mobGroup = new THREE.Group(); _mobGroup.name = 'mob3d'; scene.add(_mobGroup); }

  for(const m of _mobPool) m.inUse = false;

  let live = 0, want = new Set();
  for(const e of foes){
    if(!e || e.dead) continue;
    const cast = MOB_CAST[e.type];
    if(!cast) continue;                                  // unknown type: voxel keeps drawing it
    want.add(cast.file);
    const rec = acquireMob(e.type);
    if(!rec) continue;
    /* Scale so the model stands exactly as tall as the game says the enemy is.
       e.h is in GAME UNITS, cast.h is the model's own height in METRES, so the factor is simply
       e.h / cast.h. The first version divided by (cast.h / 0.0355) instead, which came out at
       ~1.0 and rendered every mob about 30x too small - they were damaging the player from
       off-screen while being far too tiny to see. */
    const src = _mobModels.get(cast.file);
    const s = (e.h || 38) / ((src && src._nativeH) || cast.h);
    rec.root.scale.setScalar(s);
    /* flyY is a hover height in metres; convert to game units. It is NOT multiplied by s - s
       already carries the model-to-world conversion, and applying both would square it. */
    const hover = cast.flyY ? cast.flyY / 0.0355 : 0;
    /* Lift by the model's own base offset so it stands ON the ground rather than half-sunk when
       its origin is not at its feet. */
    const foot = -((src && src._baseY) || 0) * s;
    rec.root.position.set(e.x, (e.y || 0) + hover + foot, e.z);
    rec.root.rotation.y = (e.yaw || 0);
    playMob(rec, Math.abs(e.vx || 0) + Math.abs(e.vz || 0) > 2);
    rec.mixer.update(dt);
    live++;
  }
  /* Release, don't just hide. The pool used to only ever GROW - unused actors were hidden and
     kept forever, so every creature spawned across every zone stayed resident in GPU memory and
     in the per-frame loop. Keep a small reserve per type for instant reuse mid-fight, and drop
     the rest. */
  const keep = {};
  for(let i = _mobPool.length - 1; i >= 0; i--){
    const m = _mobPool[i];
    if(m.inUse) continue;
    keep[m.type] = (keep[m.type] || 0) + 1;
    if(keep[m.type] <= 2){ m.root.visible = false; continue; }   // reserve two per type
    m.mixer.stopAllAction();
    if(m.root.parent) m.root.parent.remove(m.root);
    m.root.traverse(o => { if(o.isMesh && o.geometry && o.geometry.dispose) o.geometry.dispose(); });
    _mobPool.splice(i, 1);
  }

  /* Load any model this room needs but has not got yet. Fire and forget - the voxel mob draws
     until it arrives, so nothing pops out of existence while waiting. */
  for(const f of want) if(!_mobModels.has(f)) loadMobModel(f);

  MOB3D.live = live;
  MOB3D.pooled = _mobPool.length;
  return true;
}

/* Called when the level changes. Without this a new zone inherits every actor the previous zone
   built, hidden but resident. */
export function clearMobs(){
  for(const m of _mobPool){
    m.mixer.stopAllAction();
    if(m.root.parent) m.root.parent.remove(m.root);
  }
  _mobPool.length = 0;
  MOB3D.pooled = 0;
}

/* True only for enemies mob3d is actually drawing, so the voxel path can skip exactly those and
   keep drawing anything unmapped, still loading, or out of pool. */
export function mobDrawn(type){
  if(!MOB3D.on || !MOB_CAST[type]) return false;
  const f = MOB_CAST[type].file;
  return !!_mobModels.get(f);
}

window.__mob3dDrawn = mobDrawn;
window.__mob3d = () => ({ on:MOB3D.on, live:MOB3D.live, pooled:MOB3D.pooled,
                          models:[..._mobModels.keys()], missing:MOB3D.missing, err:MOB3D.err });
