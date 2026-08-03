/* ─────────────────────────────────────────────────────────────────────────────
   LEVEL EDITOR — Oliver edits the real levels, in the real game, by hand.

   Why this exists: every world-building complaint on the playtest list is the same loop failing.
   Oliver describes a layout in words, I guess at it, and we iterate through wrong versions. An
   editor turns "the spires are covering the portals" into him dragging them 40 units left.

   THE ENABLING FACT, verified: the hub and all eight core zones are DETERMINISTIC. Their terrain
   grammar is seeded with `mulberry(i*7919+31+so)`, which does not include the per-run `runSeed`.
   So a given zone/area builds the same layout every time, which means an object's position in the
   generated arrays is a STABLE IDENTITY across sessions. Class trials, side zones and boss arenas
   DO re-roll (they fall through to the shared maze, which mixes in runSeed) - editing those is
   meaningless until G1 pins them, and the editor says so rather than letting you waste work.

   HOW EDITS ARE STORED — an edit LIST, not a copy of the level.
   The generator runs exactly as it does now, then this replays your changes on top:
       { "0.1": { "move": { "deco:17": {x,y0,z,ry} }, "del": ["obstacles:4"], "add": [ {...} ] } }
   Editing the real level, not layering over it: `move` mutates the object the generator made.
   Small diffs, readable in a PR, and any area you have not touched behaves exactly as today.

   IDs are `<array>:<index>` because generation order is deterministic. That holds only while the
   generator is unchanged - if a generator is edited, indices shift and saved edits land on the
   wrong object. Each area's edits therefore record a `gen` fingerprint, and loading warns rather
   than silently moving the wrong pillar.
   ───────────────────────────────────────────────────────────────────────────── */

export const EDITOR = {
  on: false,
  sel: null,            // { arr, idx, o }
  layer: null,          // the edit list for the current area
  key: null,            // 'hub' | '<zone>.<area>'
  dirty: false,
  msg: '',
  grid: 10,             // nudge step, game units
  editable: true,       // false in a re-rolled area, with a reason in .msg
};

/* Arrays the editor can touch. Everything Oliver listed is one of these - props, floors,
   platforms and pillars, movers, healing pads, spawner dens - so one tool covers all of it
   rather than a special case per feature. */
export const EDIT_ARRAYS = ['deco', 'obstacles', 'segments', 'movers', 'healpads', 'dens', 'torches', 'chests'];

const LS_KEY = 'bf_editlayers';

/* Which area is this, and can it be edited at all? A re-rolled area has no stable identity to
   attach an edit to, so the editor refuses rather than letting work evaporate on the next run. */
export function areaKey(G, curZone){
  if(!G) return null;
  if(G.hub) return 'hub';
  if(G.trial) return { blocked: 'class trial — re-rolls every run, so edits cannot stick' };
  if(G.side)  return { blocked: 'side zone — re-rolls every run, so edits cannot stick' };
  if(G.arena) return { blocked: 'arena' };
  const z = (curZone && curZone().id) || 'zone';
  return z + '.' + (G.area != null ? G.area : 0);
}

export function loadLayers(){
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch(e){ return {}; }
}
export function saveLayers(all){
  try { localStorage.setItem(LS_KEY, JSON.stringify(all)); return true; } catch(e){ return false; }
}

/* A cheap fingerprint of what the generator produced. If a generator changes, index-based IDs
   shift and a saved edit would move the wrong object - so this is stored with the edits and
   compared on load. Counts plus a couple of sampled positions is enough to catch a reshuffle
   without storing the whole level. */
export function genFingerprint(G){
  const parts = [];
  for(const a of EDIT_ARRAYS){
    const arr = G[a] || [];
    parts.push(a + arr.length);
    if(arr.length){
      const s = arr[0], e = arr[arr.length - 1];
      parts.push(((s && s.x) | 0) + ',' + ((s && s.z) | 0) + ',' + ((e && e.x) | 0) + ',' + ((e && e.z) | 0));
    }
  }
  return parts.join('|');
}

/* Replay the edit list onto the freshly generated level. Called right after generation, before
   the first frame, so the player never sees the unedited version. */
export function applyLayer(G, key, all){
  const L = all && all[key];
  if(!L) return { applied: 0 };
  let moved = 0, deleted = 0, added = 0, stale = false;

  if(L.gen && L.gen !== genFingerprint(G)) stale = true;   // reported, not silently ignored

  for(const id in (L.move || {})){
    const [arrName, idxs] = id.split(':');
    const arr = G[arrName]; const o = arr && arr[+idxs];
    if(!o) continue;
    Object.assign(o, L.move[id]);
    moved++;
  }
  /* Deletes are applied HIGHEST INDEX FIRST. Splicing low-to-high shifts every later index, so
     the second delete would remove a different object than the one recorded. */
  const dels = (L.del || []).slice().sort((a, b) => (+b.split(':')[1]) - (+a.split(':')[1]));
  for(const id of dels){
    const [arrName, idxs] = id.split(':');
    const arr = G[arrName];
    if(arr && arr[+idxs]) { arr.splice(+idxs, 1); deleted++; }
  }
  for(const spec of (L.add || [])){
    const arr = G[spec.arr];
    if(arr){ arr.push(JSON.parse(JSON.stringify(spec.o))); added++; }
  }
  return { applied: moved + deleted + added, moved, deleted, added, stale };
}

/* ── editing operations ───────────────────────────────────────────────────── */

function ensure(L, k){ if(!L[k]) L[k] = (k === 'del' || k === 'add') ? [] : {}; return L[k]; }

export function recordMove(L, arr, idx, o){
  const m = ensure(L, 'move');
  const rec = { x: o.x, z: o.z };
  if(o.y0 != null) rec.y0 = o.y0;
  if(o.ry != null) rec.ry = o.ry;
  if(o.h != null)  rec.h  = o.h;
  if(o.w != null)  rec.w  = o.w;
  if(o.d != null)  rec.d  = o.d;
  m[arr + ':' + idx] = rec;
}
export function recordDelete(L, arr, idx){
  const d = ensure(L, 'del');
  const id = arr + ':' + idx;
  if(d.indexOf(id) < 0) d.push(id);
  /* A deleted object cannot also be moved - leaving a stale move entry would resurrect a
     phantom edit if the delete is later undone. */
  if(L.move) delete L.move[id];
}
export function recordAdd(L, arrName, o){
  ensure(L, 'add').push({ arr: arrName, o: JSON.parse(JSON.stringify(o)) });
}

/* Export the whole edit set as a file Oliver can hand back to be committed. localStorage is the
   working copy - fast, survives reload - but it lives on one device and dies with a cache clear,
   so shipping an edit to players means exporting it and committing the file. */
export function exportLayers(all){
  const blob = new Blob([JSON.stringify(all, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'bladefall.edits.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

