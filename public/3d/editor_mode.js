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
         recordMove, recordDelete, recordAdd, exportLayers, loadLocal } from './editor.js';
import { toggleOverlay, refresh as refreshOverlay, OVERLAY } from './editor_collision.js';

const _mvp = new THREE.Matrix4(), _inv = new THREE.Matrix4(), _v = new THREE.Vector3();
let _ui = null, _marker = null, _raf = 0, _drag = null, _look = null;

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
  /* 46px, down from 90. A generous grab radius was right when every click meant "select"; now that
     dragging empty space turns the camera, a wide radius means you try to look and instead drag a
     prop you did not know was near the cursor. Selection stays forgiving, looking stays possible. */
  let best = null, bestD = (maxPx || 46);
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

/* ── THE DETACHED CAMERA ──────────────────────────────────────────────────────
   F2 releases you from the hero into an overhead orbit you pan, turn and zoom. F2 again drops you
   straight back into the character, standing where you were, so you can playtest what you just
   built without a reload - the fast edit-test loop that every write-up on level editors says is
   the difference between a tool people iterate with and one they endure.

   It orbits a FOCUS POINT on the ground rather than flying free. A 6-axis fly camera is easy to
   get lost in and hard to aim, while a focus point is precisely what "add it in front of where I'm
   looking" needs - the new object goes at the focus, which is the middle of your screen.

   Starts on the hero, so opening the editor never teleports you somewhere unrecognisable. */
export const EDCAM = { on: false, x: 0, y: 0, z: 0, yaw: 0, pitch: -0.5, speed: 26 };
const SPD_MIN = 4, SPD_MAX = 400;
/* How far in front of the camera a new object lands. Far enough to be in frame at a normal flying
   height, near enough that it is not a dot on the horizon. */
const PLACE_AHEAD = 260;
window.__bfEdCam = () => EDCAM;

/* Start behind and above the hero looking down at him, which is the view he was just playing in -
   opening the editor should never drop you somewhere you have to re-orient from. */
function camStart(){
  const g = G(), p = g && g.p;
  const yaw = (g && g.camYaw != null) ? g.camYaw : 0;
  EDCAM.yaw = yaw; EDCAM.pitch = -0.45;
  EDCAM.x = (p ? p.x : 0) - Math.sin(yaw) * 300;
  EDCAM.y = (p ? (p.y || 0) : 0) + 210;
  EDCAM.z = (p ? p.z : 0) - Math.cos(yaw) * 300;
  EDCAM.on = true;
}

/* Fly along the direction you are FACING, including up and down - flying "forward" while looking
   at the ground has to take you toward the ground, or you cannot get close to what you are
   editing. Strafe stays horizontal so you can sidestep along a wall without drifting into it. */
function camFly(fwd, right, up){
  const sp = EDCAM.speed;
  const cp = Math.cos(EDCAM.pitch);
  const fx = Math.sin(EDCAM.yaw) * cp, fy = Math.sin(EDCAM.pitch), fz = Math.cos(EDCAM.yaw) * cp;
  const rx = Math.cos(EDCAM.yaw), rz = -Math.sin(EDCAM.yaw);
  EDCAM.x += fx * fwd * sp + rx * right * sp;
  EDCAM.y += fy * fwd * sp + up * sp;
  EDCAM.z += fz * fwd * sp + rz * right * sp;
}

/* Drag to look. Pitch is clamped just short of straight up and down: past vertical the view rolls
   over and every control inverts, which is disorienting and has no use. */
function camLook(dx, dy){
  EDCAM.yaw   -= dx * 0.0042;
  EDCAM.pitch -= dy * 0.0042;
  const lim = Math.PI / 2 - 0.03;
  EDCAM.pitch = Math.max(-lim, Math.min(lim, EDCAM.pitch));
}

/* Pan RELATIVE TO WHERE YOU ARE FACING, not along world x/z. Turn the camera 90 degrees and a
   world-axis pan sends you sideways, which reads as broken. */
/* The wheel changes FLY SPEED, not zoom. There is no zoom on a free camera - you move instead -
   and speed is the thing you actually need to change, between nudging around one prop and crossing
   a level. */
function camSpeed(mul){ EDCAM.speed = Math.max(SPD_MIN, Math.min(SPD_MAX, EDCAM.speed * mul)); }

function onWheel(e){
  if(!EDITOR.on) return;
  camSpeed(e.deltaY > 0 ? 0.85 : 1.18);
  e.preventDefault(); e.stopPropagation();
}

/* Where a new object goes: the focus point, which is the centre of the screen. */
/* Where a new object goes: a point on the ground in front of the camera. Projected from the look
   direction so it is genuinely "where I'm looking"; if you are looking at or above the horizon
   there is no ground ahead, so it falls back to a fixed distance out. */
export function camFocus(){
  const cp = Math.cos(EDCAM.pitch);
  const fx = Math.sin(EDCAM.yaw) * cp, fy = Math.sin(EDCAM.pitch), fz = Math.cos(EDCAM.yaw) * cp;
  let t = PLACE_AHEAD;
  if(fy < -0.05){ const g = -EDCAM.y / fy; if(g > 0 && g < 4000) t = g; }
  return { x: EDCAM.x + fx * t, z: EDCAM.z + fz * t };
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
    '#bfed button.grp{display:flex;align-items:center;width:100%;margin:4px 0 0;padding:5px 8px;',
    'border-radius:6px;border:1px solid #4a3c26;background:#221e18;color:#d8cbb0;',
    'font:800 11px system-ui;letter-spacing:.05em;text-align:left}',
    '#bfed button.grp.open{background:#2e2718;border-color:#6a5330;color:#ffd89a}',
    '#bfed button.grp.armed{border-color:#ffd24a}',
    '#bfed button.grp .n{margin-left:auto;opacity:.55;font-weight:700}',
    '#bfed .pal{margin:4px 0 2px;padding:0 0 2px 6px;border-top:0}',
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
    rows.push('<div class="row"><span class="k">drag</span>look around &middot; ' +
              '<span class="k">WASD</span>fly <span class="k">Q</span><span class="k">E</span>down/up</div>');
    rows.push('<div class="row"><span class="k">wheel</span>fly speed (' + Math.round(EDCAM.speed) +
              ') <span class="k">G</span>find hero</div>');
    rows.push('<div class="row"><span class="k">F2</span>back into the character to playtest</div>');
    rows.push('<div class="row"><span class="k">drag</span>move along the ground</div>');
    rows.push('<div class="row"><span class="k">&larr;&uarr;&darr;&rarr;</span>nudge ' + EDITOR.grid + 'u <span class="k">shift</span>x5</div>');
    rows.push('<div class="row"><span class="k">PgUp</span><span class="k">PgDn</span>height</div>');
    rows.push('<div class="row"><span class="k">alt</span>+ those keys resizes instead' +
              (s && s.o.r != null ? ' <span class="k">[</span><span class="k">]</span>radius' : '') + '</div>');
    rows.push('<div class="row"><span class="k">Del</span>delete <span class="k">Esc</span>deselect</div>');
    rows.push('<div class="row"><span class="k">R</span>rotate <span class="k">D</span>duplicate' +
              ' <span class="k">K</span>collision' +
              (s ? (findCollider(s.o.edId) >= 0 ? ' <span style="color:#54d17a">on</span>'
                                                : ' <span style="color:#ff3df0">off</span>') : '') + '</div>');
    rows.push('<div class="row"><span class="k">C</span>collision overlay' +
              (OVERLAY.on ? ' <span style="color:#54d17a">on</span>' : '') + '</div>');
    if(OVERLAY.on && OVERLAY.counts){
      const c = OVERLAY.counts;
      rows.push('<div class="row" style="line-height:1.7">' +
        '<span style="color:#ff4a4a">&#9646;</span> solid, stand on top (' + c.blocking + ')<br>' +
        '<span style="color:#54d17a">&#9646;</span> movers &amp; pads (' + c.special + ')<br>' +
        '<span style="color:#ff3df0">&#9646;</span> <b>walk-through scenery (' + c.walkThrough + ')</b>' +
        '</div>');
      rows.push('<div class="row">props checked within ' + c.radius + 'u of you (' + c.decoChecked + ')</div>');
    }
    rows.push('<div class="row"><span class="k">ctrl Z</span>undo (' + _undo.length + ')' +
              ' <span class="k">ctrl Y</span>redo (' + _redo.length + ')</div>');

    /* GROUPED, one open at a time. Thirty-four buttons in a flat wrap is a wall you have to read
       every time to find one thing; the panel also sits over the game, so keeping it short matters
       more here than in a windowed editor. Single-open accordion rather than many-open for the
       same reason - two open groups already push the Save buttons off a phone screen.
       The open group is remembered across rebuilds because hud() re-renders on every selection
       change, and a palette that snapped shut every time you clicked something would be unusable. */
    /* Ordered by what you reach for, not by where the entries happen to sit in the array:
       Terrain first because you shape the ground before you dress it, then the structures and town
       pieces that are the point of editing the hub, then scenery, then the gameplay objects you
       place last. Anything not in this list still appears, at the end. */
    const ORDER = ['Terrain', 'Structures', 'Town', 'Floors', 'Nature', 'Props', 'Gameplay'];
    const groups = [];
    for(const p of PALETTE){ const g = p.group || 'Other'; if(groups.indexOf(g) < 0) groups.push(g); }
    groups.sort((a, b) => {
      const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    /* The default open group is chosen ONCE when the mode opens, not here. Defaulting inside the
       render meant null was indistinguishable from "closed", so collapsing a group re-opened it on
       the very next repaint and nothing could ever be shut. */
    for(const g of groups){
      const open = EDITOR.openGroup === g;
      const items = PALETTE.map((p, i) => ({ p, i })).filter(v => (v.p.group || 'Other') === g);
      rows.push('<button class="grp' + (open ? ' open' : '') +
                '" data-g="' + g + '">' + (open ? '&#9662; ' : '&#9656; ') + g +
                '<span class="n">' + items.length + '</span></button>');
      if(open){
        rows.push('<div class="pal">' + items.map(v =>
          '<button class="p' + (kindRenders(v.p) ? '' : ' off') +
          '" data-p="' + v.i + '"' + (kindRenders(v.p) ? '' : ' disabled') + '>' + v.p.label + '</button>'
        ).join('') + '</div>');
      }
    }
    rows.push(G() && G().hub
      ? '<div class="row">click an asset to add it where the camera is looking. Greyed props have no hub model yet - everything from Wall onward does.</div>'
      : '<div class="row">click an asset to add it where the camera is looking</div>');

    rows.push('<button data-a="save">Save</button><button data-a="export">Export file</button><button data-a="revert">Revert area</button>');
  }
  _ui.innerHTML = rows.join('');
  _ui.querySelectorAll('button').forEach(b => {
    b.onclick = () => {
      if(b.dataset.g != null){
        EDITOR.openGroup = (EDITOR.openGroup === b.dataset.g) ? null : b.dataset.g;
        hud(); return;
      }
      if(b.dataset.p != null){ placeFromPalette(+b.dataset.p); }
      else act(b.dataset.a);
    };
  });
}

function act(a){
  const all = loadLocal();   // acting on YOUR working copy, not the merged view
  if(a === 'save'){ saveLayers(all); EDITOR.dirty = false; toast('saved in this browser'); }
  if(a === 'export'){ exportLayers(all); toast('exported - send me the file to commit it'); }
  if(a === 'revert'){ delete all[EDITOR.key]; saveLayers(all); EDITOR.dirty = false; toast('area reverted - reload to see it'); }
  hud();
}

/* The current area's edit list, created on demand so merely LOOKING at an area never writes a
   record for it - an empty entry would still be compared against the generator fingerprint. */
function layer(){
  const all = loadLocal();
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
  const all = loadLocal();
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
const GEOM = ['x', 'z', 'y0', 'w', 'h', 'd', 'r', 'ry', 'x0', 'px', 'sx', 'sz', 'y'];
function geom(o){ const g = {}; for(const k of GEOM) if(o[k] != null) g[k] = o[k]; return g; }
function setGeom(o, g){ for(const k in g) o[k] = g[k]; }

let _redrawT = 0;
function redraw(){
  clearTimeout(_redrawT);
  _redrawT = setTimeout(() => {
    try { window.__world3dRebuild && window.__world3dRebuild(); } catch(e){}
    /* The overlay is built from the same arrays, so it has to follow the edit - otherwise a
       platform you just placed shows no collision box and reads as non-solid. */
    try { refreshOverlay(); } catch(e){}
  }, 120);
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
  { kind: 'tree',       label: 'Tree', group: 'Nature',        w: 72, h: 52, d: 72, c: '#46723b', theme: 'plains' },
  { kind: 'rock',       label: 'Rock', group: 'Nature',        w: 20, h: 20, d: 20, c: '#6b6b6b' },
  { kind: 'fence',      label: 'Fence', group: 'Props',       w: 30, h: 30, d: 12, c: '#6b5334' },
  { kind: 'grave',      label: 'Gravestone', group: 'Props',  w: 18, h: 30, d: 12, c: '#7a7a80' },
  { kind: 'pillar',     label: 'Pillar', group: 'Props',      w: 26, h: 80, d: 26, c: '#2b3040' },
  { kind: 'column',     label: 'Column', group: 'Props',      w: 26, h: 80, d: 26, c: '#c8c2b0' },
  { kind: 'lantern',    label: 'Lantern', group: 'Props',     w:  7, h: 47, d:  7, c: '#5a3f25' },
  { kind: 'flower',     label: 'Flower', group: 'Nature',      w: 11, h: 18, d: 11, c: '#ffd24a' },
  { kind: 'standstone', label: 'Standing st', group: 'Nature', w: 24, h: 90, d: 18, c: '#626879' },
  { kind: 'corn',       label: 'Crop', group: 'Nature',        w:  4, h: 24, d:  4, c: '#d9ad42', theme: 'plains' },

  /* TERRAIN (P3) and GAMEPLAY OBJECTS (P4). These do not go in `deco` and are not props - they
     are the things you stand on and interact with, so each names its own array and builds its own
     entry shape, sampled from what the Outskirts generator actually emits.

     A platform is an `obstacles` entry with kind 'plat'. That array IS the game's collision, so a
     placed platform is solid and stand-on-able the moment it exists - which is the whole answer to
     Oliver's "automatic collision true to the visual size" for anything you build out of these.
     Props in `deco` are a separate question and stay on the list. */
  { arr: 'obstacles', label: '+ Platform', group: 'Terrain', terrain: true,
    make: (x, z) => ({ kind: 'plat', x, z, w: 160, d: 160, h: 40 }) },
  { arr: 'obstacles', label: '+ Parkour col', group: 'Terrain', terrain: true,
    make: (x, z) => ({ kind: 'plat', x, z, w: 60, d: 60, h: 200 }) },
  /* A FLOOR is a broad, shallow obstacle - the game has no separate floor type, and an obstacle
     one unit proud of the ground is exactly what you stand on. */
  { arr: 'obstacles', label: '+ Floor', group: 'Terrain', terrain: true,
    make: (x, z) => ({ kind: 'plat', x, z, w: 480, d: 480, h: 4 }) },
  /* A PLATEAU is the same thing tall and wide - the raised terraces the zones build with vplat. */
  { arr: 'obstacles', label: '+ Plateau', group: 'Terrain', terrain: true,
    make: (x, z) => ({ kind: 'plat', x, z, w: 420, d: 360, h: 150, terrace: true }) },
  /* A STEP, for building ramps and stairs by duplicating and raising - D then PgUp, repeatedly. */
  { arr: 'obstacles', label: '+ Step', group: 'Terrain', terrain: true,
    make: (x, z) => ({ kind: 'plat', x, z, w: 130, d: 130, h: 40 }) },
  { arr: 'healpads',  label: '+ Heal pad', group: 'Gameplay', terrain: true,
    make: (x, z) => ({ x, z, y: 0, r: 36, charge: 1 }) },
  /* A MOVING PLATFORM. `x0` is the rest position and `x`/`px` the live ones, so all three start
     equal; `amp` is how far it swings, `sp` its speed and `ph` its phase offset. Phase is fixed
     rather than random so two platforms placed side by side move together and can be edited into
     a rhythm deliberately, instead of the editor scattering timings you then cannot reproduce. */
  { arr: 'movers',    label: '+ Mover', group: 'Gameplay', terrain: true,
    make: (x, z) => ({ x0: x, x, px: x, z, w: 110, d: 88, h: 0, amp: 40, sp: 1.1, ph: 0 }) },
  { arr: 'enemies',   label: '+ Mob', group: 'Gameplay', terrain: true, mob: true },

  /* ── ANY ASSET IN THE KITS ────────────────────────────────────────────────
     Oliver: "I want to be able to place any structure, and asset." These are PROP_SETS names
     rendered through the generic `kind:'asset'` tag, so the whole model library is placeable -
     castle walls and gateways, towers, roofs, the fountain, carts, market stalls, hedges, banners,
     the anvil - not only the dozen kinds the level generators happen to tag.
     Sizes are each set's own working size in the hub it was built for. They are a starting point,
     not a constraint: alt+arrows resizes anything, and the collider follows. */
    { asset: 'hubWall',    label: 'Wall', group: 'Structures',        w: 120, h: 130, d: 28, c: '#b6ab95' },
  { asset: 'hubGate',    label: 'Gateway', group: 'Structures',     w: 120, h: 130, d: 28, c: '#b6ab95' },
  { asset: 'hubTower',   label: 'Tower base', group: 'Structures',  w: 120, h: 130, d: 120, c: '#b6ab95' },
  { asset: 'hubTowerM',  label: 'Tower mid', group: 'Structures',   w: 120, h: 130, d: 120, c: '#b6ab95' },
  { asset: 'hubRoof',    label: 'Tower roof', group: 'Structures',  w: 120, h: 90,  d: 120, c: '#8a3f3f' },
  { asset: 'hubFlag',    label: 'Flag', group: 'Structures',        w: 26,  h: 110, d: 26,  c: '#a03a3a' },
  { asset: 'hubFountain',label: 'Fountain', group: 'Town',    w: 150, h: 70,  d: 150, c: '#9aa3ad' },
  { asset: 'hubCart',    label: 'Cart', group: 'Town',        w: 90,  h: 60,  d: 60,  c: '#7a5a34' },
  { asset: 'hubStall',   label: 'Stall', group: 'Town',       w: 110, h: 80,  d: 70,  c: '#7a5a34' },
  { asset: 'hubHedge',   label: 'Hedge', group: 'Town',       w: 110, h: 55,  d: 55,  c: '#3f6b38' },
  { asset: 'hubBanner',  label: 'Banner', group: 'Town',      w: 40,  h: 110, d: 12,  c: '#a03a3a' },
  { asset: 'hubAnvil',   label: 'Anvil', group: 'Town',       w: 52,  h: 42,  d: 40,  c: '#4a4a52' },
  { asset: 'bush',       label: 'Bush', group: 'Nature',        w: 34,  h: 26,  d: 34,  c: '#3f6b38' },
  { asset: 'grass',      label: 'Grass tuft', group: 'Nature',  w: 22,  h: 22,  d: 22,  c: '#5f8a3f' },
  { asset: 'floorStone', label: 'Stone tile', group: 'Floors',  w: 120, h: 8,   d: 120, c: '#8f8a80', collide: false },
  { asset: 'floor',      label: 'Grass tile', group: 'Floors',  w: 120, h: 8,   d: 120, c: '#5f8a3f', collide: false },
];

/* MOBS. Not a fixed palette entry: which creatures belong here is a per-zone question, so the
   button offers whatever THIS level already spawns. Placing a jackal in the frost zone would be a
   content decision the editor has no business making on its own, and a hardcoded list would rot
   the moment a zone's bestiary changes.
   spawnEnemy() is the game's own constructor, so a placed mob is a real one - correct stats,
   element, elite rules and all - rather than an editor-shaped object that behaves differently. */
function zoneMobTypes(){
  const g = G(); if(!g) return [];
  const seen = [];
  for(const e of (g.enemies || [])) if(e && e.type && !e.boss && seen.indexOf(e.type) < 0) seen.push(e.type);
  return seen;
}

/* MOB SPAWNERS (dens) are deliberately NOT here yet. Every den in the game carries a `questId` binding it
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
  if(spec.asset) return true;                 // kind:'asset' is built in the hub AND the zones
  const g = G();
  return (g && g.hub) ? HUB_MODEL_KINDS.indexOf(spec.kind) >= 0 : true;
}

/* ── AUTOMATIC COLLISION ──────────────────────────────────────────────────────
   Oliver's requirement, in his words: "I would have you do the automatic collision for each
   object", true to its visual size. A prop pushed into G.deco is scenery you walk through - the
   generators pair theirs with a hand-written vcol() column, and an editor that did not would let
   you build a forest you can stroll through, which is E1 all over again in new content.

   So placing a prop places a matching `obstacles` entry too. The two are linked by a shared id, so
   moving, resizing or deleting the prop does the same to its collider - a collider left behind at
   the old position is an invisible wall, which is worse than no collision because nothing on
   screen explains it.

   Height is capped at the prop's own height and the box is the prop's footprint: true to the
   visual size, as asked. Press K to toggle the collider on the selected object, because "true to
   the visual size" is right for a tree and wrong for a flower you should be able to walk over. */
let _edSeq = Date.now() % 1e7;
function colliderFor(o, id){
  return { x: o.x, z: o.z, w: o.w || 20, d: o.d || o.w || 20, h: (o.y0 || 0) + (o.h || 20),
           kind: 'plat', edCol: id };
}
function findCollider(id){
  const arr = G() && G().obstacles;
  if(!arr || id == null) return -1;
  for(let i = 0; i < arr.length; i++) if(arr[i] && arr[i].edCol === id) return i;
  return -1;
}
/* Keep a linked collider in step with its prop, after any move or resize. */
/* An enemy's sx/sz is the spot it returns to when it loses you. Move one without moving its home
   and it walks straight back, which reads as the edit not having taken. */
function syncHome(o){ if(o.sx != null){ o.sx = o.x; o.sz = o.z; } }

function syncCollider(o){
  if(o.edId == null) return;
  const arr = G().obstacles, i = findCollider(o.edId);
  if(i < 0) return;
  Object.assign(arr[i], colliderFor(o, o.edId));
  commit(L => recordMove(L, 'obstacles', i, arr[i]));
}

/* Place at the cursor. The GROUND plane is the right primitive here (unlike drag, where no single
   plane works): you are choosing a spot on the floor, and a click above the horizon has no floor
   under it. That case gets a toast rather than a prop dumped at the origin. */
/* Add straight from the palette, at the CAMERA'S FOCUS - Oliver's "it'll add it right in front of
   where I'm looking at, and then I can adjust it from there". No arming, no second click hunting
   for a ground pixel: press the button, the thing is there and selected, nudge it into place.
   That also removes the click-on-sky failure the cursor-based version had. */
function placeFromPalette(i){
  const spec = PALETTE[i];
  if(!spec){ toast('no such palette item'); return; }
  if(!kindRenders(spec)){ toast(spec.label + ' has no model here yet'); return; }
  const f = camFocus();
  placeWorld(spec, Math.round(f.x / EDITOR.grid) * EDITOR.grid,
                   Math.round(f.z / EDITOR.grid) * EDITOR.grid);
}

function placeWorld(spec, gx, gz){
  const name = palArray(spec);
  if(spec.mob){
    const types = zoneMobTypes();
    if(!types.length){ toast('this area has no mobs to copy a type from'); return; }
    /* Cycles through the zone's roster on repeat presses rather than asking: placing five of the
       same thing then five of the next is how you actually populate a room. */
    EDITOR.mobI = ((EDITOR.mobI || 0) + 1) % types.length;
    const type = types[EDITOR.mobI];
    const before = snapLayer();
    const arr = G().enemies;
    const m = window.__BF3.spawnEnemy(type, gx, gz);
    commit(L => recordAdd(L, 'enemies', m));
    pushStep(before, () => { const i = arr.indexOf(m); if(i >= 0) arr.splice(i, 1); },
                     () => { if(arr.indexOf(m) < 0) arr.push(m); });
    EDITOR.sel = { arr: 'enemies', idx: arr.indexOf(m), o: m };
    toast('placed ' + type);
    hud();
    return;
  }
  const o = spec.make
    ? spec.make(gx, gz)
    : Object.assign({ x: gx, z: gz, y0: 0, w: spec.w, h: spec.h, d: spec.d, c: spec.c,
                      kind: spec.asset ? 'asset' : spec.kind, lead: true },
                    spec.asset ? { set: spec.asset } : {},
                    spec.theme ? { theme: spec.theme } : {});
  const arr = G()[name];
  if(!arr){ toast('this area has no ' + name + ' list'); return; }
  const before = snapLayer();
  /* Props get a collider; terrain and gameplay objects do not - a platform IS collision already,
     and a healing pad you cannot walk onto is a healing pad that does nothing. */
  const wantsCol = !spec.terrain && spec.collide !== false;
  let col = null;
  if(wantsCol){ o.edId = ++_edSeq; col = colliderFor(o, o.edId); }
  arr.push(o);
  const obs = G().obstacles;
  if(col && obs) obs.push(col);
  commit(L => { recordAdd(L, name, o); if(col && obs) recordAdd(L, 'obstacles', col); });
  pushStep(before,
    () => { const i = arr.indexOf(o); if(i >= 0) arr.splice(i, 1);
            if(col && obs){ const j = obs.indexOf(col); if(j >= 0) obs.splice(j, 1); } },
    () => { if(arr.indexOf(o) < 0) arr.push(o);
            if(col && obs && obs.indexOf(col) < 0) obs.push(col); });
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
  if(!EDITOR.on || e.button !== 0) return;
  /* Right/middle drag always looks. Left drag looks too UNLESS it grabbed an object - so dragging
     empty space turns the camera, which is what every 3D tool does and what Oliver asked for, and
     dragging a thing still moves the thing. One button, no modifier to remember. */
  const hit = EDITOR.editable ? pickAt(e.clientX, e.clientY) : null;
  if(!hit){
    _look = { sx: e.clientX, sy: e.clientY };
    EDITOR.sel = null; hud();
    e.preventDefault(); e.stopPropagation();
    return;
  }
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
  if(!EDITOR.on) return;
  if(_look){
    camLook(e.clientX - _look.sx, e.clientY - _look.sy);
    _look.sx = e.clientX; _look.sy = e.clientY;
    e.preventDefault(); return;
  }
  if(!_drag || !EDITOR.sel) return;
  const s = EDITOR.sel, B = _drag.B;
  const dx = e.clientX - _drag.sx, dy = e.clientY - _drag.sy;
  /* Always measured from the drag's START, never accumulated per event: accumulating would let
     grid rounding compound, so a slow drag would land somewhere different from a fast one. */
  s.o.x = Math.round((_drag.x0 + B.ia * dx + B.ib * dy) / EDITOR.grid) * EDITOR.grid;
  s.o.z = Math.round((_drag.z0 + B.ic * dx + B.id * dy) / EDITOR.grid) * EDITOR.grid;
  e.preventDefault();
}
function onUp(){
  if(_look){ _look = null; return; }
  if(_drag && EDITOR.sel){
    const s = EDITOR.sel, o = s.o, was = _drag.undoGeom, from = _drag.undoFrom;
    /* A click that did not actually move anything is not an edit, and pushing it would fill the
       undo stack with no-ops - press Ctrl+Z and nothing appears to happen. */
    if(o.x !== was.x || o.z !== was.z){
      const now = geom(o);
      commit(L => recordMove(L, s.arr, s.idx, o));
      syncHome(o); syncCollider(o);
      pushStep(from, () => { setGeom(o, was); syncCollider(o); },
                     () => { setGeom(o, now); syncCollider(o); });
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
  /* Camera keys first, and they never touch the selection - you are moving the VIEW, not the
     thing. WASD pans, QE turns, RF (and the wheel) zooms, G re-centres on the hero when you have
     flown somewhere and lost him. */
  if(EDCAM.on){
    const k = e.key.toLowerCase();
    let did = true;
    const step = e.shiftKey ? 3 : 1;
    if(k === 'w') camFly(step, 0, 0);
    else if(k === 's') camFly(-step, 0, 0);
    else if(k === 'a') camFly(0, -step, 0);
    else if(k === 'd' && !EDITOR.sel) camFly(0, step, 0);     // D duplicates when something is selected
    else if(k === 'q') camFly(0, 0, -step);                   // down
    else if(k === 'e') camFly(0, 0, step);                    // up
    else if(k === ' ') camFly(0, 0, step);
    else if(k === 'g'){ const p = G() && G().p; if(p){ EDCAM.x = p.x; EDCAM.y = (p.y || 0) + 210; EDCAM.z = p.z; } }
    else did = false;
    if(did){ hud(); e.preventDefault(); e.stopPropagation(); return; }
  }

  if((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.metaKey){
    const c = toggleOverlay();
    toast(c ? (c.walkThrough + ' of ' + c.decoChecked + ' props nearby have NO collision')
            : 'collision overlay off');
    hud(); e.preventDefault(); e.stopPropagation(); return;
  }
  /* K toggles the selected object's collider. "True to the visual size" is right for a tree and
     wrong for a flower you should be able to walk over, so the default is on and this is the
     escape hatch - and it is also how an EXISTING walk-through prop found by the C overlay gets
     collision, which is the whole of E1 done by hand. */
  if((e.key === 'k' || e.key === 'K') && EDITOR.sel && EDITOR.editable){
    const o = EDITOR.sel.o, obs = G().obstacles, before = snapLayer();
    const i = findCollider(o.edId);
    if(i >= 0){
      const gone = obs[i];
      commit(L => recordDelete(L, 'obstacles', i));
      obs.splice(i, 1);
      pushStep(before, () => obs.splice(i, 0, gone), () => obs.splice(i, 1));
      toast('collision removed');
    } else {
      if(o.edId == null) o.edId = ++_edSeq;
      const col = colliderFor(o, o.edId);
      obs.push(col);
      commit(L => recordAdd(L, 'obstacles', col));
      pushStep(before, () => { const j = obs.indexOf(col); if(j >= 0) obs.splice(j, 1); },
                       () => { if(obs.indexOf(col) < 0) obs.push(col); });
      toast('collision added, sized to the object');
    }
    hud(); e.preventDefault(); e.stopPropagation(); return;
  }

  /* R rotates. Props are placed on a grid and a wood of identically-facing trees reads as a
     tileset; the models already honour `ry`, nothing was setting it. */
  if((e.key === 'r' || e.key === 'R') && EDITOR.sel && EDITOR.editable && !e.ctrlKey){
    const o = EDITOR.sel.o, before = snapLayer(), was = geom(o);
    o.ry = (((o.ry || 0) + (e.shiftKey ? -Math.PI / 8 : Math.PI / 8)) + Math.PI * 2) % (Math.PI * 2);
    const now = geom(o);
    commit(L => recordMove(L, EDITOR.sel.arr, EDITOR.sel.idx, o));
    pushStep(before, () => setGeom(o, was), () => setGeom(o, now));
    hud(); e.preventDefault(); e.stopPropagation(); return;
  }

  /* D duplicates, offset by one grid step so the copy is visible rather than hidden inside the
     original. Building a row of anything without this is place-nudge-place-nudge; with it, it is
     D-D-D. The copy carries its own collider, not a reference to the original's. */
  if((e.key === 'd' || e.key === 'D') && EDITOR.sel && EDITOR.editable && !e.ctrlKey){
    const src = EDITOR.sel, arr = G()[src.arr], obs = G().obstacles, before = snapLayer();
    const o = JSON.parse(JSON.stringify(src.o));
    o.x += EDITOR.grid * 2; o.z += EDITOR.grid * 2;
    let col = null;
    if(src.o.edId != null){ o.edId = ++_edSeq; col = colliderFor(o, o.edId); }
    arr.push(o);
    if(col) obs.push(col);
    commit(L => { recordAdd(L, src.arr, o); if(col) recordAdd(L, 'obstacles', col); });
    pushStep(before,
      () => { const i = arr.indexOf(o); if(i >= 0) arr.splice(i, 1);
              if(col){ const j = obs.indexOf(col); if(j >= 0) obs.splice(j, 1); } },
      () => { if(arr.indexOf(o) < 0) arr.push(o); if(col && obs.indexOf(col) < 0) obs.push(col); });
    EDITOR.sel = { arr: src.arr, idx: arr.length - 1, o };   // select the COPY, so D D D builds a row
    toast('duplicated');
    hud(); e.preventDefault(); e.stopPropagation(); return;
  }

  if(e.key === 'Escape'){
    EDITOR.sel = null;   // nothing is "armed" any more: palette buttons place immediately
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
      syncHome(s.o); syncCollider(s.o);
      pushStep(before, () => { setGeom(s.o, was); syncCollider(s.o); },
                       () => { setGeom(s.o, now); syncCollider(s.o); });
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
    /* Take the linked collider too. Leaving it behind is an invisible wall where a prop used to
       be - worse than no collision, because nothing on screen explains it. */
    const obs = G().obstacles, ci = findCollider(obj.edId), cobj = ci >= 0 ? obs[ci] : null;
    commit(L => { recordDelete(L, s.arr, idx); if(ci >= 0) recordDelete(L, 'obstacles', ci); });
    if(arr) arr.splice(idx, 1);
    if(ci >= 0) obs.splice(ci, 1);
    /* Put back AT ITS INDEX, not appended: every id in the edit list is `<array>:<index>`, so
       restoring it at the end would renumber everything after it and point saved edits at the
       wrong objects. */
    pushStep(before,
      () => { if(arr) arr.splice(idx, 0, obj); if(cobj) obs.splice(ci, 0, cobj); },
      () => { if(arr) arr.splice(idx, 1); if(ci >= 0) obs.splice(ci, 1); });
    EDITOR.sel = null;
    toast('deleted - Ctrl+Z puts it back');
  }
  else handled = false;
  if(handled){
    if(EDITOR.sel){
      const now = geom(s.o);
      commit(L => recordMove(L, s.arr, s.idx, s.o));
      syncHome(s.o); syncCollider(s.o);
      pushStep(before, () => { setGeom(s.o, was); syncCollider(s.o); },
                       () => { setGeom(s.o, now); syncCollider(s.o); });
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
    _undo = []; _redo = [];   // history is per session in one area; see history()
    if(EDITOR.openGroup === undefined) EDITOR.openGroup = 'Terrain';
    _ui = document.createElement('div'); _ui.id = 'bfed'; document.body.appendChild(_ui);
    _marker = document.createElement('div'); _marker.id = 'bfedmark'; document.body.appendChild(_marker);
    /* Capture phase, so a click selects an object instead of swinging the sword. */
    addEventListener('mousedown', onDown, true);
    addEventListener('mousemove', onMove, true);
    addEventListener('mouseup',   onUp,   true);
    addEventListener('wheel',     onWheel, { capture: true, passive: false });
    camStart();
    hud(); tick();
    toast(EDITOR.editable ? 'edit mode - WASD pan, QE turn, wheel zoom, F2 to play'
                          : 'edit mode (read-only here)');
  } else {
    removeEventListener('mousedown', onDown, true);
    removeEventListener('mousemove', onMove, true);
    removeEventListener('mouseup',   onUp,   true);
    removeEventListener('wheel',     onWheel, true);
    cancelAnimationFrame(_raf);
    if(_ui) _ui.remove();
    if(_marker) _marker.remove();
    EDCAM.on = false;   // back into the hero, standing exactly where he was, ready to playtest
    _ui = null; _marker = null; EDITOR.sel = null; _drag = null; _look = null; EDITOR.place = null;
    if(OVERLAY.on) toggleOverlay(false);   // leaving edit mode must not strand wireframes in the game
    toast('edit mode off');
  }
  return EDITOR.on;
}

addEventListener('keydown', onKey, true);
/* project/unprojectToPlane are exposed as well as used internally: they are what any later editor
   phase (asset palette, terrain, spawner placement) needs to turn a cursor into a world point, and
   they are the two functions worth probing from the screenshot harness when placement looks off. */
window.__bfEd = { toggle, pickAt, project, unprojectToPlane, EDITOR, PALETTE, get drag(){ return _drag; } };
