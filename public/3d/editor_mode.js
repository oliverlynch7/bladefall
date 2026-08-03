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
         recordMove, recordDelete, exportLayers } from './editor.js';

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
        (s.o.y0 != null ? '  y ' + Math.round(s.o.y0) : '') + '</div>'
      : '<div class="row">click something to select it</div>');
    rows.push('<div class="row"><span class="k">drag</span>move along the ground</div>');
    rows.push('<div class="row"><span class="k">&larr;&uarr;&darr;&rarr;</span>nudge ' + EDITOR.grid + 'u <span class="k">shift</span>x5</div>');
    rows.push('<div class="row"><span class="k">PgUp</span><span class="k">PgDn</span>height</div>');
    rows.push('<div class="row"><span class="k">Del</span>delete <span class="k">Esc</span>deselect</div>');
    rows.push('<button data-a="save">Save</button><button data-a="export">Export file</button><button data-a="revert">Revert area</button>');
  }
  _ui.innerHTML = rows.join('');
  _ui.querySelectorAll('button').forEach(b => { b.onclick = () => act(b.dataset.a); });
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
  const r = layer(); mut(r.L); saveLayers(r.all); EDITOR.dirty = true; hud();
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
  const hit = pickAt(e.clientX, e.clientY);
  EDITOR.sel = hit;
  if(hit){
    const B = dragBasis(hit.o);
    _drag = B ? { B, sx: e.clientX, sy: e.clientY, x0: hit.o.x, z0: hit.o.z } : null;
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
  if(_drag && EDITOR.sel){ const s = EDITOR.sel; commit(L => recordMove(L, s.arr, s.idx, s.o)); }
  _drag = null;
}

function onKey(e){
  /* F2 toggles and is handled even when the editor is off. Everything else is swallowed while
     editing, so a nudge cannot also swing the sword or fire a skill. */
  if(e.key === 'F2'){ toggle(); e.preventDefault(); e.stopPropagation(); return; }
  if(!EDITOR.on) return;
  if(e.key === 'Escape'){ EDITOR.sel = null; hud(); e.stopPropagation(); return; }
  const s = EDITOR.sel;
  if(!s || !EDITOR.editable) return;
  const step = EDITOR.grid * (e.shiftKey ? 5 : 1);
  let handled = true;
  if(e.key === 'ArrowLeft')       s.o.x -= step;
  else if(e.key === 'ArrowRight') s.o.x += step;
  else if(e.key === 'ArrowUp')    s.o.z -= step;
  else if(e.key === 'ArrowDown')  s.o.z += step;
  else if(e.key === 'PageUp')     s.o.y0 = (s.o.y0 || 0) + step;
  else if(e.key === 'PageDown')   s.o.y0 = Math.max(0, (s.o.y0 || 0) - step);
  else if(e.key === 'Delete' || e.key === 'Backspace'){
    const arr = G()[s.arr];
    commit(L => recordDelete(L, s.arr, s.idx));
    if(arr) arr.splice(s.idx, 1);
    EDITOR.sel = null;
    toast('deleted - "Revert area" undoes it');
  }
  else handled = false;
  if(handled){
    if(EDITOR.sel) commit(L => recordMove(L, s.arr, s.idx, s.o));
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
    _ui = null; _marker = null; EDITOR.sel = null; _drag = null;
    toast('edit mode off');
  }
  return EDITOR.on;
}

addEventListener('keydown', onKey, true);
/* project/unprojectToPlane are exposed as well as used internally: they are what any later editor
   phase (asset palette, terrain, spawner placement) needs to turn a cursor into a world point, and
   they are the two functions worth probing from the screenshot harness when placement looks off. */
window.__bfEd = { toggle, pickAt, project, unprojectToPlane, EDITOR, get drag(){ return _drag; } };
