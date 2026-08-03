/* ─────────────────────────────────────────────────────────────────────────────
   LEVEL EDITOR, part 2 — the mode Oliver actually touches: pick, drag, nudge, delete.

   Kept in its own module so editor.js stays the pure data layer (edit list, IDs, replay) with no
   DOM or input in it. That layer is what the GAME depends on at load; this one is only needed
   when someone is actually editing, and a fault in the UI must never be able to stop a level
   from applying its saved edits.

   Selection and HUD are DOM, deliberately. Drawing a highlight into the scene would mean touching
   whichever renderer owns the frame - and there are two, with a depth clear between them. An
   overlay cannot be occluded, cannot z-fight, and cannot break the game if it throws.
   ───────────────────────────────────────────────────────────────────────────── */
import * as THREE from './three.module.js';
import { EDITOR, EDIT_ARRAYS, areaKey, loadLayers, saveLayers, genFingerprint,
         recordMove, recordDelete, recordAdd, exportLayers } from './editor.js';

const _mvp = new THREE.Matrix4(), _inv = new THREE.Matrix4(), _v = new THREE.Vector3();
let _ui = null, _marker = null, _raf = 0, _drag = null;

function G(){ return (window.__BF3 && window.__BF3.G) || null; }
function cam(){ try { return window.__BF_CAM ? window.__BF_CAM() : null; } catch(e){ return null; } }
function objY(o){ return (o.y0 != null ? o.y0 : 0) + ((o.h || 0) * 0.5); }

/* World -> screen. Returns null behind the camera, so an object at your back cannot win the
   "nearest to cursor" test - that reads as clicking something you cannot see. */
function project(x, y, z){
  const c = cam(); if(!c) return null;
  const cv = document.getElementById('gl'); if(!cv) return null;
  _mvp.fromArray(c.P).multiply(_inv.fromArray(c.V));
  _v.set(x, y, z).applyMatrix4(_mvp);
  if(_v.z < -1 || _v.z > 1) return null;
  const r = cv.getBoundingClientRect();
  return { x: (_v.x * 0.5 + 0.5) * r.width + r.left, y: (-_v.y * 0.5 + 0.5) * r.height + r.top };
}

/* Screen -> a point on the horizontal plane at height `atY`, so dragging moves an object across
   the GROUND under the cursor. A screen-space delta would feel wrong at any camera angle other
   than straight down. */
function unprojectToPlane(sx, sy, atY){
  const c = cam(); if(!c) return null;
  const cv = document.getElementById('gl'); if(!cv) return null;
  const r = cv.getBoundingClientRect();
  const ndcX = ((sx - r.left) / r.width) * 2 - 1, ndcY = -(((sy - r.top) / r.height) * 2 - 1);
  const inv = new THREE.Matrix4().fromArray(c.P).multiply(new THREE.Matrix4().fromArray(c.V)).invert();
  const a = new THREE.Vector3(ndcX, ndcY, -1).applyMatrix4(inv);
  const b = new THREE.Vector3(ndcX, ndcY,  1).applyMatrix4(inv);
  const dir = b.sub(a);
  if(Math.abs(dir.y) < 1e-6) return null;      // ray parallel to the plane
  const t = (atY - a.y) / dir.y;
  if(t < 0) return null;                        // plane is behind the camera
  return { x: a.x + dir.x * t, z: a.z + dir.z * t };
}

/* Nearest editable object to a screen point. Projection rather than ray-vs-box: these are game
   DATA in G.deco / G.obstacles / G.segments, not Three meshes, so there is nothing to raycast
   without first building a parallel collision world. This treats every array identically. */
export function pickAt(sx, sy, maxPx){
  const g = G(); if(!g) return null;
  let best = null, bestD = (maxPx || 90);
  for(const arr of EDIT_ARRAYS){
    const list = g[arr]; if(!list) continue;
    for(let i = 0; i < list.length; i++){
      const o = list[i]; if(!o || o.x == null) continue;
      const p = project(o.x, objY(o), o.z); if(!p) continue;
      const d = Math.hypot(p.x - sx, p.y - sy);
      if(d < bestD){ bestD = d; best = { arr, idx: i, o }; }
    }
  }
  return best;
}

function css(){
  if(document.getElementById('bfedcss')) return;
  const st = document.createElement('style'); st.id = 'bfedcss';
  st.textContent = [
    '#bfed{position:fixed;left:10px;top:10px;z-index:99998;width:264px;padding:11px 13px;border-radius:11px;',
    'background:rgba(10,10,16,.93);border:1px solid #6a5330;color:#e8dfd0;',
    'font:600 12px/1.5 system-ui,sans-serif;-webkit-user-select:none;user-select:none}',
    '#bfed h4{margin:0 0 6px;font:800 12px system-ui;letter-spacing:.09em;color:#e8a33d}',
    '#bfed .sel{color:#9fd6ff;font-weight:800}',
    '#bfed .k{display:inline-block;min-width:20px;padding:1px 5px;margin-right:4px;border-radius:4px;',
    'background:#2a2620;border:1px solid #4a3c26;color:#ffd89a;font:700 10.5px system-ui;text-align:center}',
    '#bfed .row{margin:3px 0;font-size:11.5px;color:#bdb4a4}',
    '#bfed .warn{color:#e8705a}',
    '#bfed button{margin:6px 4px 0 0;padding:5px 9px;border-radius:6px;border:1px solid #8a6f34;',
    'background:linear-gradient(180deg,#332a1c,#191520);color:#ffd89a;font:800 11px system-ui}',
    '#bfed .pal{display:flex;flex-wrap:wrap;gap:4px;margin:7px 0 4px;padding-top:7px;border-top:1px solid #3a3020}',
    '#bfed button.p{margin:0;padding:4px 7px;font:700 10.5px system-ui;border-color:#4a3c26;',
    'background:#221e18;color:#cbbfa8}',
    '#bfed button.p.on{border-color:#ffd24a;background:#3a2f18;color:#ffe6b0}',
    '#bfed button.p.off{opacity:.34;border-style:dashed}',
    '#bfedmark{position:fixed;z-index:99997;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;',
    'border:2px solid #ffd24a;box-shadow:0 0 0 2px rgba(0,0,0,.55),0 0 14px rgba(255,210,74,.7);pointer-events:none}',
    '#bfedhint{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:99998;',
    'padding:6px 13px;border-radius:8px;background:rgba(10,10,16,.9);border:1px solid #6a5330;',
    'color:#ffd89a;font:700 11.5px system-ui;pointer-events:none}'
  ].join('');
  document.head.appendChild(st);
}

function toast(t){
  let h = document.getElementById('bfedhint');
  if(!h){ h = document.createElement('div'); h.id = 'bfedhint'; document.body.appendChild(h); }
  h.textContent = t; clearTimeout(h._t); h._t = setTimeout(() => h.remove(), 2200);
}

function hud(){
  if(!_ui) return;
  const s = EDITOR.sel;
  const rows = ['<h4>LEVEL EDITOR</h4>'];
  if(!EDITOR.editable){
    rows.push('<div class="row warn">' + EDITOR.msg + '</div>');
    rows.push('<div class="row">Edits here would not survive the next run, so this area is read-only.</div>');
  } else {
    rows.push('<div class="row">area <span class="sel">' + EDITOR.key + '</span>' +
              (EDITOR.dirty ? ' &middot; <span style="color:#e8a33d">unsaved</span>' : '') + '</div>');
    rows.push(s
      ? '<div class="row">selected <span class="sel">' + s.arr + ':' + s.idx + '</span><br>x ' +
        Math.round(s.o.x) + '  z ' + Math.round(s.o.z) +
        (s.o.y0 != null ? '  y ' + Math.round(s.o.y0) : '') +
        (s.o.w != null ? '<br>' + Math.round(s.o.w) + ' x ' + Math.round(s.o.d || s.o.w) +
                         ' x ' + Math.round(s.o.h || 0) : '') +
        (s.o.r != null ? '<br>radius ' + Math.round(s.o.r) : '') + '</div>'
      : '<div class="row">click something to select it</div>');
    rows.push('<div class="row"><span class="k">drag</span>move along the ground</div>');
    rows.push('<div class="row"><span class="k">&larr;&uarr;&darr;&rarr;</span>nudge ' + EDITOR.grid + 'u <span class="k">shift</span>x5</div>');
    rows.push('<div class="row"><span class="k">PgUp</span><span class="k">PgDn</span>height</div>');
    rows.push('<div class="row"><span class="k">alt</span>+ those keys resizes instead' +
              (s && s.o.r != null ? ' <span class="k">[</span><span class="k">]</span>radius' : '') + '</div>');
    rows.push('<div class="row"><span class="k">Del</span>delete <span class="k">Esc</span>deselect</div>');
    rows.push('<div class="row"><span class="k">ctrl Z</span>undo (' + _undo.length + ')' +
              ' <span class="k">ctrl Y</span>redo (' + _redo.length + ')</div>');

    rows.push('<div class="pal">' + PALETTE.map((p, i) =>
      '<button class="p' + (EDITOR.place === i ? ' on' : '') + (kindRenders(p) ? '' : ' off') +
      '" data-p="' + i + '"' + (kindRenders(p) ? '' : ' disabled') + '>' + p.label + '</button>'
    ).join('') + '</div>');
    rows.push(EDITOR.place != null
      ? '<div class="row" style="color:#9fd6ff">click the ground to place a ' + PALETTE[EDITOR.place].label +
        ' &middot; <span class="k">Esc</span>stop</div>'
      : (G() && G().hub
          ? '<div class="row">the hub only renders lanterns and flowers as models yet - the rest would place a plain box</div>'
          : '<div class="row">pick an asset above, then click the ground</div>'));

    rows.push('<button data-a="save">Save</button><button data-a="export">Export file</button><button data-a="revert">Revert area</button>');
  }
  _ui.innerHTML = rows.join('');
  _ui.querySelectorAll('button').forEach(b => {
    b.onclick = () => {
      if(b.dataset.p != null){
        const i = +b.dataset.p;
        if(!kindRenders(PALETTE[i])){ toast(PALETTE[i].label + ' has no model in the hub yet'); return; }
        EDITOR.place = (EDITOR.place === i) ? null : i;   // clicking the armed one disarms it
        hud();
      } else act(b.dataset.a);
    };
  });
}

function act(a){
  const all = loadLayers();
  if(a === 'save'){ saveLayers(all); EDITOR.dirty = false; toast('saved in this browser'); }
  if(a === 'export'){ exportLayers(all); toast('exported - send me the file to commit it'); }
  if(a === 'revert'){ delete all[EDITOR.key]; saveLayers(all); EDITOR.dirty = false; toast('area reverted - reload to see it'); }
  hud();
}

/* The current area's edit list, created on demand so merely LOOKING at an area never writes a
   record for it - an empty entry would still be compared against the generator fingerprint. */
function layer(){
  const all = loadLayers();
  if(!all[EDITOR.key]) all[EDITOR.key] = { gen: genFingerprint(G()) };
  return { all, L: all[EDITOR.key] };
}
function commit(mut){
  const r = layer(); mut(r.L); saveLayers(r.all); EDITOR.dirty = true; hud(); redraw();
}

/* Rebuild the 3D world so the change is VISIBLE.

   Editing G.deco changes the data; it does not change what is on screen. world3d bakes the level
   into instanced meshes once at load, so without this a drag moved the object in the save file and
   left the picture exactly as it was - which reads as the editor not working at all. P1 verified
   the data and not the picture, and that is precisely the gap this closes.

   Debounced, because a rebuild walks the whole level: firing one per mousemove during a drag would
   stall the frame. The marker keeps tracking live, so the drag still feels continuous and the
   world catches up a beat later. */
/* ── UNDO / REDO ──────────────────────────────────────────────────────────────
   The single thing every write-up on level editors agrees makes one usable, and the reason is not
   convenience: without it you edit timidly. You do not try the bold version of a layout if getting
   back costs you a reload and everything since your last save.

   The advice is to store the CHANGE, not the whole state - which this already does, because the
   edit list IS a command log. So a step is the area's edit-list entry before the action, plus a
   closure that puts the live level arrays back the way they were. Small, and no level rebuild
   needed to reverse anything.

   Grouped as TRANSACTIONS: a drag is one step, not one per mousemove. The whole point of undo is
   to reverse a decision, and "moved the pillar" is the decision - having to press Ctrl+Z ninety
   times to walk back one drag is the same as not having undo. */
const UNDO_MAX = 100;
let _undo = [], _redo = [];

function snapLayer(){ return JSON.stringify(layer().L); }

/* revert: puts the live G arrays back. The edit list is restored from the snapshot separately, so
   this only has to deal with what the generator's own arrays hold. */
function pushStep(before, revert, reapply){
  _undo.push({ before, after: snapLayer(), revert, reapply });
  if(_undo.length > UNDO_MAX) _undo.shift();
  _redo.length = 0;                       // a new action forks history; the old redo branch is gone
}

function restoreLayer(json){
  const all = loadLayers();
  all[EDITOR.key] = JSON.parse(json);
  saveLayers(all);
}

/* NOT named `step`: onKey declares a local `const step` for the nudge distance, which shadows this
   for the whole function body - so calling it from the Ctrl+Z branch hit the temporal dead zone and
   the handler threw before undo ever ran. */
function history(dir){
  const from = dir === 'undo' ? _undo : _redo, to = dir === 'undo' ? _redo : _undo;
  const st = from.pop();
  if(!st){ toast('nothing to ' + dir); return; }
  try { (dir === 'undo' ? st.revert : st.reapply)(); } catch(err){ toast('could not ' + dir + ' that'); }
  restoreLayer(dir === 'undo' ? st.before : st.after);
  to.push(st);
  EDITOR.dirty = true;
  EDITOR.sel = null;                      // the selection may name an index that just moved
  hud(); redraw();
  toast(dir === 'undo' ? 'undone' : 'redone');
}

/* Snapshot an object's geometry so a move or resize can be put back exactly. Copied by value: the
   live object keeps being mutated, so holding a reference would record the CURRENT position as the
   old one and undo would do nothing. */
const GEOM = ['x', 'z', 'y0', 'w', 'h', 'd', 'r', 'ry', 'x0', 'px'];
function geom(o){ const g = {}; for(const k of GEOM) if(o[k] != null) g[k] = o[k]; return g; }
function setGeom(o, g){ for(const k in g) o[k] = g[k]; }

let _redrawT = 0;
function redraw(){
  clearTimeout(_redrawT);
  _redrawT = setTimeout(() => { try { window.__world3dRebuild && window.__world3dRebuild(); } catch(e){} }, 120);
}

/* ── the asset palette ────────────────────────────────────────────────────────
   Placing a prop means pushing a deco entry that world3d's classify() recognises, so the palette
   is exactly the set of tags it reads, and nothing else - an unrecognised kind falls through to a
   plain lit box, which looks like the editor placed the wrong thing.

   The default sizes are MEASURED, not invented: each one is either a real entry sampled out of the
   hub and the first zones, or the defaultH that world3d's own buildProps call passes for that
   set. Guessing here produces props at the wrong scale, which was already a full day's bug once
   when mob scale was inverted. */
const PALETTE = [
  { kind: 'tree',       label: 'Tree',        w: 72, h: 52, d: 72, c: '#46723b', theme: 'plains' },
  { kind: 'rock',       label: 'Rock',        w: 20, h: 20, d: 20, c: '#6b6b6b' },
  { kind: 'fence',      label: 'Fence',       w: 30, h: 30, d: 12, c: '#6b5334' },
  { kind: 'grave',      label: 'Gravestone',  w: 18, h: 30, d: 12, c: '#7a7a80' },
  { kind: 'pillar',     label: 'Pillar',      w: 26, h: 80, d: 26, c: '#2b3040' },
  { kind: 'column',     label: 'Column',      w: 26, h: 80, d: 26, c: '#c8c2b0' },
  { kind: 'lantern',    label: 'Lantern',     w:  7, h: 47, d:  7, c: '#5a3f25' },
  { kind: 'flower',     label: 'Flower',      w: 11, h: 18, d: 11, c: '#ffd24a' },
  { kind: 'standstone', label: 'Standing st', w: 24, h: 90, d: 18, c: '#626879' },
  { kind: 'corn',       label: 'Crop',        w:  4, h: 24, d:  4, c: '#d9ad42', theme: 'plains' },

  /* TERRAIN (P3) and GAMEPLAY OBJECTS (P4). These do not go in `deco` and are not props - they
     are the things you stand on and interact with, so each names its own array and builds its own
     entry shape, sampled from what the Outskirts generator actually emits.

     A platform is an `obstacles` entry with kind 'plat'. That array IS the game's collision, so a
     placed platform is solid and stand-on-able the moment it exists - which is the whole answer to
     Oliver's "automatic collision true to the visual size" for anything you build out of these.
     Props in `deco` are a separate question and stay on the list. */
  { arr: 'obstacles', label: '+ Platform', terrain: true,
    make: (x, z) => ({ kind: 'plat', x, z, w: 160, d: 160, h: 40 }) },
  { arr: 'obstacles', label: '+ Pillar blk', terrain: true,
    make: (x, z) => ({ kind: 'plat', x, z, w: 60, d: 60, h: 200 }) },
  { arr: 'healpads',  label: '+ Heal pad', terrain: true,
    make: (x, z) => ({ x, z, y: 0, r: 36, charge: 1 }) },
  /* A MOVING PLATFORM. `x0` is the rest position and `x`/`px` the live ones, so all three start
     equal; `amp` is how far it swings, `sp` its speed and `ph` its phase offset. Phase is fixed
     rather than random so two platforms placed side by side move together and can be edited into
     a rhythm deliberately, instead of the editor scattering timings you then cannot reproduce. */
  { arr: 'movers',    label: '+ Mover', terrain: true,
    make: (x, z) => ({ x0: x, x, px: x, z, w: 110, d: 88, h: 0, amp: 40, sp: 1.1, ph: 0 }) },
];

/* MOB SPAWNERS are deliberately NOT here yet. Every den in the game carries a `questId` binding it
   to a quest's kill counter (they are emitted by the quest builder, not the terrain pass), and
   what a den with no quest behind it does - spawn freely, spawn nothing, or corrupt a counter -
   is not something this session established. Placing one would be a guess dressed as a feature.
   Next step is to read the den consumer and either give the palette a plain non-quest spawner or
   let it pick an existing quest. */

/* Everything in the palette that is not a prop places into its own array and is always available:
   the hub-model caveat is about world3d's prop pipeline, and platforms and healing pads do not go
   through it. */
function palArray(spec){ return spec.arr || 'deco'; }

/* WHICH KINDS ACTUALLY BECOME MODELS HERE.

   The zones run every deco entry through world3d's classify() and give each recognised kind a real
   model. The HUB does not: buildWorld returns on the hub branch before that block, and
   buildHubDecoProps converts only lanterns and flowers. Everything else in hub deco stays a lit
   box drawn by the voxel path - verified by placing a Tree in the Waystation and getting a green
   box (_shot/out/place.png).

   So the palette says so instead of pretending. An asset that cannot become a model here is shown
   disabled with the reason, because the alternative is Oliver placing a tree, seeing a box, and
   reasonably concluding the editor is broken.

   Extending the hub to the full set is worth doing and is the next item: it needs the matching
   entry in index.html's hub exclusion list (~12308), which is deliberately gated on whether the
   hub really built that kind, so a kind added on one side and not the other draws BOTH the model
   and the box it replaces. */
const HUB_MODEL_KINDS = ['lantern', 'flower'];
function kindRenders(spec){
  if(spec.terrain) return true;               // not a prop, so the prop pipeline does not apply
  const g = G();
  return (g && g.hub) ? HUB_MODEL_KINDS.indexOf(spec.kind) >= 0 : true;
}

/* Place at the cursor. The GROUND plane is the right primitive here (unlike drag, where no single
   plane works): you are choosing a spot on the floor, and a click above the horizon has no floor
   under it. That case gets a toast rather than a prop dumped at the origin. */
function placeAt(sx, sy){
  const spec = PALETTE[EDITOR.place];
  const gp = unprojectToPlane(sx, sy, 0);
  if(!gp){ toast('no ground under the cursor - aim lower'); return; }
  const gx = Math.round(gp.x / EDITOR.grid) * EDITOR.grid;
  const gz = Math.round(gp.z / EDITOR.grid) * EDITOR.grid;
  const name = palArray(spec);
  const o = spec.make
    ? spec.make(gx, gz)
    : Object.assign({ x: gx, z: gz, y0: 0, w: spec.w, h: spec.h, d: spec.d, c: spec.c,
                      kind: spec.kind, lead: true }, spec.theme ? { theme: spec.theme } : {});
  const arr = G()[name];
  if(!arr){ toast('this area has no ' + name + ' list'); return; }
  const before = snapLayer();
  arr.push(o);
  commit(L => recordAdd(L, name, o));
  pushStep(before, () => { const i = arr.indexOf(o); if(i >= 0) arr.splice(i, 1); },
                   () => { if(arr.indexOf(o) < 0) arr.push(o); });
  /* Select what you just placed, so it can be nudged into position immediately rather than needing
     to be found and clicked again. Its index is the end of the array by construction. */
  EDITOR.sel = { arr: name, idx: arr.length - 1, o };
  toast('placed ' + spec.label);
  hud();
}

/* How far does the object move in the world per pixel the cursor moves?

   The obvious method - cast the cursor ray onto the horizontal plane through the object - is what
   this did first, and it fails on exactly the objects that most need moving. The hub camera sits
   below the ramparts and rooftops (y0=150), so their plane is only reachable by pixels ABOVE the
   horizon: mousedown at the object works, and the drag dies the instant the cursor travels
   down-screen, with the object frozen and no explanation. Ground-plane fallback has the mirror
   problem for anything high on screen. There is no single plane that always works.

   So solve it in screen space instead. Project the object, then project it again nudged one probe
   distance along +x and along +z, and the two pixel offsets form a 2x2 basis: pixels per world
   unit, measured at this object's actual depth and this camera's actual angle. Inverting it turns
   any cursor delta into a world delta. No ray, no plane, nothing to miss - it works looking down,
   looking up, and at grazing angles, and it degrades to a small drift rather than a dead drag.

   Returns null only if the basis is singular (the two probes land on the same pixel), which means
   the object is edge-on and there is genuinely no meaningful horizontal drag to do. */
const PROBE = 50;
function dragBasis(o){
  const y = objY(o);
  const p0 = project(o.x, y, o.z);
  const px = project(o.x + PROBE, y, o.z);
  const pz = project(o.x, y, o.z + PROBE);
  if(!p0 || !px || !pz) return null;
  const a = (px.x - p0.x) / PROBE, b = (pz.x - p0.x) / PROBE;   // d(screenX)/d(worldX), /d(worldZ)
  const c = (px.y - p0.y) / PROBE, d = (pz.y - p0.y) / PROBE;   // d(screenY)/...
  const det = a * d - b * c;
  if(Math.abs(det) < 1e-9) return null;
  return { ia: d / det, ib: -b / det, ic: -c / det, id: a / det };   // inverse, screen px -> world
}

function onDown(e){
  if(!EDITOR.on || !EDITOR.editable || e.button !== 0) return;
  /* Place mode wins over selection: while a palette item is armed, a click on the world means
     "put one here", not "select whatever is nearest". Checked before picking so a click next to an
     existing prop cannot quietly select it instead of placing. */
  if(EDITOR.place != null){ placeAt(e.clientX, e.clientY); e.preventDefault(); e.stopPropagation(); return; }
  const hit = pickAt(e.clientX, e.clientY);
  EDITOR.sel = hit;
  if(hit){
    const B = dragBasis(hit.o);
    _drag = B ? { B, sx: e.clientX, sy: e.clientY, x0: hit.o.x, z0: hit.o.z,
                  undoFrom: snapLayer(), undoGeom: geom(hit.o) } : null;
    e.preventDefault(); e.stopPropagation();
  }
  hud();
}
function onMove(e){
  if(!EDITOR.on || !_drag || !EDITOR.sel) return;
  const s = EDITOR.sel, B = _drag.B;
  const dx = e.clientX - _drag.sx, dy = e.clientY - _drag.sy;
  /* Always measured from the drag's START, never accumulated per event: accumulating would let
     grid rounding compound, so a slow drag would land somewhere different from a fast one. */
  s.o.x = Math.round((_drag.x0 + B.ia * dx + B.ib * dy) / EDITOR.grid) * EDITOR.grid;
  s.o.z = Math.round((_drag.z0 + B.ic * dx + B.id * dy) / EDITOR.grid) * EDITOR.grid;
  e.preventDefault();
}
function onUp(){
  if(_drag && EDITOR.sel){
    const s = EDITOR.sel, o = s.o, was = _drag.undoGeom, from = _drag.undoFrom;
    /* A click that did not actually move anything is not an edit, and pushing it would fill the
       undo stack with no-ops - press Ctrl+Z and nothing appears to happen. */
    if(o.x !== was.x || o.z !== was.z){
      const now = geom(o);
      commit(L => recordMove(L, s.arr, s.idx, o));
      pushStep(from, () => setGeom(o, was), () => setGeom(o, now));
    }
  }
  _drag = null;
}

function onKey(e){
  /* F2 toggles and is handled even when the editor is off. Everything else is swallowed while
     editing, so a nudge cannot also swing the sword or fire a skill. */
  if(e.key === 'F2'){ toggle(); e.preventDefault(); e.stopPropagation(); return; }
  if(!EDITOR.on) return;
  /* Escape disarms the palette FIRST, then clears the selection. Placing is the more modal state -
     leaving it armed while the selection cleared would mean the next click drops another prop when
     you meant to stop. */
  if((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')){
    history(e.shiftKey ? 'redo' : 'undo');   // Ctrl+Shift+Z redoes, matching every tool Oliver uses
    e.preventDefault(); e.stopPropagation(); return;
  }
  if((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')){
    history('redo'); e.preventDefault(); e.stopPropagation(); return;
  }
  if(e.key === 'Escape'){
    if(EDITOR.place != null) EDITOR.place = null; else EDITOR.sel = null;
    hud(); e.stopPropagation(); return;
  }
  const s = EDITOR.sel;
  if(!s || !EDITOR.editable) return;
  const step = EDITOR.grid * (e.shiftKey ? 5 : 1);
  let handled = true;
  const before = snapLayer(), was = geom(s.o);

  /* ALT turns the same keys into RESIZE. Shaping a platform is the other half of terrain editing -
     placing a fixed 160x160 slab and being unable to make it a long ledge or a tall block is not
     "take full control of every level". Same keys on purpose: one set to learn, and the modifier
     says whether you are moving the thing or changing its size.
     Sizes floor at one grid step rather than 0 - a zero-width platform is invisible, still
     collides, and looks exactly like the object having been deleted. */
  if(e.altKey){
    const min = EDITOR.grid;
    const grow = (k, by) => { s.o[k] = Math.max(min, (s.o[k] || min) + by); };
    if(e.key === 'ArrowLeft')       grow('w', -step);
    else if(e.key === 'ArrowRight') grow('w',  step);
    else if(e.key === 'ArrowUp')    grow('d', -step);
    else if(e.key === 'ArrowDown')  grow('d',  step);
    else if(e.key === 'PageUp')     grow('h',  step);
    else if(e.key === 'PageDown')   grow('h', -step);
    else if(s.o.r != null && (e.key === '[' || e.key === ']')){
      s.o.r = Math.max(8, s.o.r + (e.key === ']' ? 8 : -8));   // healing pads are a radius, not a box
    }
    else handled = false;
    if(handled){
      const now = geom(s.o);
      commit(L => recordMove(L, s.arr, s.idx, s.o));
      pushStep(before, () => setGeom(s.o, was), () => setGeom(s.o, now));
      e.preventDefault(); e.stopPropagation();
    }
    return;
  }

  if(e.key === 'ArrowLeft')       s.o.x -= step;
  else if(e.key === 'ArrowRight') s.o.x += step;
  else if(e.key === 'ArrowUp')    s.o.z -= step;
  else if(e.key === 'ArrowDown')  s.o.z += step;
  else if(e.key === 'PageUp')     s.o.y0 = (s.o.y0 || 0) + step;
  else if(e.key === 'PageDown')   s.o.y0 = Math.max(0, (s.o.y0 || 0) - step);
  else if(e.key === 'Delete' || e.key === 'Backspace'){
    const arr = G()[s.arr], idx = s.idx, obj = s.o;
    commit(L => recordDelete(L, s.arr, idx));
    if(arr) arr.splice(idx, 1);
    /* Put back AT ITS INDEX, not appended: every id in the edit list is `<array>:<index>`, so
       restoring it at the end would renumber everything after it and point saved edits at the
       wrong objects. */
    pushStep(before, () => { if(arr) arr.splice(idx, 0, obj); },
                     () => { if(arr) arr.splice(idx, 1); });
    EDITOR.sel = null;
    toast('deleted - Ctrl+Z puts it back');
  }
  else handled = false;
  if(handled){
    if(EDITOR.sel){
      const now = geom(s.o);
      commit(L => recordMove(L, s.arr, s.idx, s.o));
      pushStep(before, () => setGeom(s.o, was), () => setGeom(s.o, now));
    }
    e.preventDefault(); e.stopPropagation();
  }
}

function tick(){
  if(!EDITOR.on) return;
  const s = EDITOR.sel;
  if(s && _marker){
    const p = project(s.o.x, objY(s.o), s.o.z);
    _marker.style.display = p ? 'block' : 'none';
    if(p){ _marker.style.left = p.x + 'px'; _marker.style.top = p.y + 'px'; }
  } else if(_marker){ _marker.style.display = 'none'; }
  _raf = requestAnimationFrame(tick);
}

export function toggle(force){
  const on = (force == null) ? !EDITOR.on : !!force;
  EDITOR.on = on;
  if(on){
    css();
    const k = areaKey(G(), (window.__BF3 && window.__BF3.curZone) || null);
    if(typeof k === 'string'){ EDITOR.key = k; EDITOR.editable = true; EDITOR.msg = ''; }
    else { EDITOR.key = '-'; EDITOR.editable = false; EDITOR.msg = (k && k.blocked) || 'no level loaded'; }
    _undo = []; _redo = [];   // history is per session in one area; see step()
    _ui = document.createElement('div'); _ui.id = 'bfed'; document.body.appendChild(_ui);
    _marker = document.createElement('div'); _marker.id = 'bfedmark'; document.body.appendChild(_marker);
    /* Capture phase, so a click selects an object instead of swinging the sword. */
    addEventListener('mousedown', onDown, true);
    addEventListener('mousemove', onMove, true);
    addEventListener('mouseup',   onUp,   true);
    hud(); tick();
    toast(EDITOR.editable ? 'edit mode - F2 to exit' : 'edit mode (read-only here)');
  } else {
    removeEventListener('mousedown', onDown, true);
    removeEventListener('mousemove', onMove, true);
    removeEventListener('mouseup',   onUp,   true);
    cancelAnimationFrame(_raf);
    if(_ui) _ui.remove();
    if(_marker) _marker.remove();
    _ui = null; _marker = null; EDITOR.sel = null; _drag = null; EDITOR.place = null;
    toast('edit mode off');
  }
  return EDITOR.on;
}

addEventListener('keydown', onKey, true);
/* project/unprojectToPlane are exposed as well as used internally: they are what any later editor
   phase (asset palette, terrain, spawner placement) needs to turn a cursor into a world point, and
   they are the two functions worth probing from the screenshot harness when placement looks off. */
window.__bfEd = { toggle, pickAt, project, unprojectToPlane, EDITOR, get drag(){ return _drag; } };
