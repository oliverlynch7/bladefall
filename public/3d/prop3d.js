import * as THREE from './three.module.js';
import * as SkeletonUtils from './jsm/utils/SkeletonUtils.js';
import { loadKitModel, kitModel } from './mob3d.js';

/* ─────────────────────────────────────────────────────────────────────────────
   PROP3D — the world's INTERACTIVE OBJECTS as 3D models.

   world3d converted the architecture, mob3d converted the creatures. What was left standing as
   voxel boxes is the layer you actually touch: the treasure chest. It is the single most-looked-at
   object in an action-RPG - the thing a run is FOR - and it was a 30x22 orange box in a world of
   real models.

   Why a chest is not just "another mob cast":

   - It has STATE. Open, shut, and - because a random subset of chests are mimics - very slightly
     ajar. The voxel chest carried that in code (`br`, a lid lifted a hair on a slow rhythm) and
     that tell is GAMEPLAY, not decoration: it is the only warning you get before a chest bites.
     So the model is not posed by playing an animation, it is SCRAPED at a time: one paused
     Chest_Open action whose `time` is driven directly by how open the lid should be. 0 = shut,
     duration = flung open, a hair above 0 = breathing. The artist's own hinge axis, at any
     fraction, without having to know which axis it is.
   - It is a BOX, not a creature. Fitted by height a chest comes out far too big (see the mimic
     note in mob3d) - the footprint is what has to match, so it is fitted by width like the mimic.
   - The glowing lock, the keyhole and the sparkle stay VOXEL, drawn by the game over the model.
     They are read-at-a-distance affordances that change colour and brightness every frame, and
     they are the mimic's other tell. To place them the game needs the model's real fitted size,
     which is why `__prop3dChest()` reports the box it ended up occupying rather than the game
     assuming the old voxel numbers still apply.

   Pooling is deliberately simpler than mob3d's. Chests do not spawn and die through a fight -
   a level has a handful and they last the whole level - so actors are keyed by the chest object
   itself and released when it stops being in the list.
   ───────────────────────────────────────────────────────────────────────────── */
const CHEST_FILE = 'qprops/Chest_Wood';
/* 32, and not a number chosen by eye: it is exactly what mob3d fits the MIMIC to (`e.r*2`, r=16).
   A mimic in the chest list and a mimic that has woken up are the same creature, so if the two
   were fitted differently the disguise would have a size tell no designer put there, and the
   reveal would pop. Matching them costs nothing and removes the whole question.
   (Opening range is a flat 44 units from the centre and does not depend on the model, so visual
   size is free to be whatever reads best - it just has to agree with the mimic.) */
const CHEST_W = 32;
/* How far the lid opens for each state, as a fraction of the Chest_Open clip.
   MIMIC_BREATH is small on purpose - the tell has to be findable, not obvious. */
const OPEN_FULL = 1, MIMIC_BREATH = 0.055;

export const PROP3D = { on:true, chests:0, ready:false, err:null };
try {
  const q = new URLSearchParams(location.search);
  /* Rides with world3d exactly as mob3d does: a 3D world with voxel chests in it is worse than
     either alone. `?prop3d=` wins where both are given so this layer can be isolated. */
  const yes = v => (v === '1' || v === 'true');
  if(q.has('world3d')) PROP3D.on = yes(q.get('world3d'));
  if(q.has('prop3d'))  PROP3D.on = yes(q.get('prop3d'));
} catch(e){}

let _group = null, _pending = false;
const _actors = new Map();        // chest object -> actor
const _free = [];                 // released actors, ready to re-home
/* The fitted size of a chest in GAME units, published for the voxel overlay pass. Null until one
   has actually been built - the game falls back to the old voxel numbers until then, so a slow
   model load never leaves a chest with no lock on it. */
let _box = null;

function buildActor(){
  const src = kitModel(CHEST_FILE);
  if(!src) return null;
  const root = SkeletonUtils.clone(src.scene);
  root.traverse(o => { if(o.isMesh){ o.frustumCulled = false; o.castShadow = false; } });
  const mixer = new THREE.AnimationMixer(root);
  /* Chest_Wood ships four clips: Chest_Open and Chest_Close (transitions) and Chest_Opened /
     Chest_Closed (held poses). Only the OPENING transition is wanted, because scrubbing it is
     what gives every intermediate lid angle. Falling back to any clip at all is deliberate: a
     re-exported model with different clip names should still render, just without the hinge. */
  let clip = null;
  for(const c of src.animations) if(c.name === 'Chest_Open'){ clip = c; break; }
  if(!clip) clip = src.animations[0] || null;
  let act = null;
  if(clip){
    act = mixer.clipAction(clip);
    act.play();
    /* Paused, so mixer.update still applies the pose but never advances it. This is the whole
       trick: `time` becomes a position dial instead of a playhead. */
    act.paused = true;
    act.time = 0;
  }
  const s = CHEST_W / (src._nativeW || 1);
  root.scale.setScalar(s);
  if(!_box) _box = { w:(src._nativeX || 1) * s, d:(src._nativeZ || 1) * s,
                     h:(src._nativeH || 1) * s, footY:-(src._baseY || 0) * s };
  const rec = { root, mixer, act, dur:(clip && clip.duration) || 1 };
  _group.add(root);
  return rec;
}

function acquire(){
  const rec = _free.pop();
  if(rec){ rec.root.visible = true; return rec; }
  return buildActor();
}

export function syncProps(scene, dt){
  if(!PROP3D.on) return false;
  /* Contain faults HERE, as mob3d does. Left to propagate, a bad chest reaches drawHero3D's catch
     and takes the hero and the entire 3D world down with it. */
  try { return syncPropsInner(scene, dt); }
  catch(e){
    PROP3D.err = String(e && e.message || e);
    PROP3D.on = false;
    console.warn('[prop3d] disabled after fault, voxel chests resume:', PROP3D.err);
    return false;
  }
}

function syncPropsInner(scene, dt){
  let world = null;
  try { world = window.__BF_WORLD && window.__BF_WORLD(); } catch(e){}
  const chests = (world && world.chests) || null;
  if(!chests) return false;
  if(!_group){ _group = new THREE.Group(); _group.name = 'prop3d'; scene.add(_group); }

  if(!kitModel(CHEST_FILE)){
    /* Not loaded yet (or failed). Fire once and let the voxel chest keep drawing meanwhile -
       __prop3dDrawn() is false until the model is really here, so nothing ever pops out of
       existence while waiting. */
    if(!_pending && kitModel(CHEST_FILE) === undefined){
      _pending = true;
      loadKitModel(CHEST_FILE).finally(() => { _pending = false; });
    }
    return false;
  }
  PROP3D.ready = true;

  const seen = new Set();
  let n = 0;
  for(const ch of chests){
    if(!ch) continue;
    seen.add(ch);
    let rec = _actors.get(ch);
    if(!rec){ rec = acquire(); if(!rec) continue; _actors.set(ch, rec); }
    /* `_br` and `_shove` are the mimic's tell, and the GAME owns them: drawChest computes both on
       game time earlier in the same frame and stashes them here. Recomputing the rhythm in this
       module would run it on wall time instead, so the model would breathe and twitch on a
       different clock from the glowing lock the game paints on its face. */
    rec.root.position.set(ch.x + (ch._shove || 0), (ch.y || 0) + ((_box && _box.footY) || 0), ch.z);
    /* The kit's chest faces -Z; the game's chest has its lock on +Z (the lock quad is drawn at
       z = +11.2 in chest space). Half a turn puts the real lid hinge at the back where the voxel
       chest kept it, so the lock overlay lands on the front face and not through the lid. */
    rec.root.rotation.y = Math.PI;
    /* _br is the voxel lid lift in game units, 0..1.1. Normalised it becomes "how ajar", which is
       the one number this model needs. */
    const open = ch.opened ? OPEN_FULL : Math.min(1, (ch._br || 0) / 1.1) * MIMIC_BREATH;
    if(rec.act) rec.act.time = open * rec.dur;
    rec.mixer.update(dt);
    n++;
  }
  /* Release anything whose chest is gone (opened-and-removed, or a new level). Hidden rather than
     disposed: a level has few chests and they come back, so churning geometry would cost more than
     it saves. clearProps() does the real teardown between levels. */
  for(const [ch, rec] of _actors){
    if(seen.has(ch)) continue;
    rec.root.visible = false;
    _actors.delete(ch);
    _free.push(rec);
  }
  PROP3D.chests = n;
  return true;
}

/* Called when the level changes, from world3d's rebuild - same place clearMobs() is called.
   Without it a new zone inherits every actor the previous one built. */
export function clearProps(){
  for(const [, rec] of _actors){ rec.mixer.stopAllAction(); if(rec.root.parent) rec.root.parent.remove(rec.root); }
  for(const rec of _free){ rec.mixer.stopAllAction(); if(rec.root.parent) rec.root.parent.remove(rec.root); }
  _actors.clear();
  _free.length = 0;
  PROP3D.chests = 0;
}

/* True only when prop3d is really drawing chests, so the voxel path can skip exactly the body and
   keep everything else. False while the model is loading, or if the layer faulted.
   `_box` is part of the test, not just the model: it is only filled once an actor has actually
   been built, and it is what the game places the lock against. Answering "yes" a frame early
   would draw a voxel chest and a 3D one in the same frame. */
export function chestDrawn(){ return !!(PROP3D.on && kitModel(CHEST_FILE) && _box); }

window.__prop3dChestDrawn = chestDrawn;
/* The fitted box, in GAME units, so the game can put the lock on the real front face and the
   sparkle over the real lid instead of over numbers that belonged to the voxel model. */
window.__prop3dChest = () => _box;
window.__prop3d = () => ({ on:PROP3D.on, ready:PROP3D.ready, chests:PROP3D.chests,
                           box:_box, err:PROP3D.err });
/* The lid dial, per live chest, so "the mimic breathes" can be CHECKED rather than squinted at:
   a still frame cannot show a 5% lid lift, but this shows the number that produced it.
   open is 0..1, t is where the Chest_Open clip is actually parked. */
window.__prop3dPoses = () => [..._actors].map(([ch, rec]) => ({
  mimic:!!ch.mimic, opened:!!ch.opened, br:+(ch._br || 0).toFixed(3),
  shove:+(ch._shove || 0).toFixed(2), t:+(rec.act ? rec.act.time : 0).toFixed(4), dur:+rec.dur.toFixed(3) }));
