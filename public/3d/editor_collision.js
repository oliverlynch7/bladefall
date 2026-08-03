/* ─────────────────────────────────────────────────────────────────────────────
   COLLISION OVERLAY — see what is solid, instead of finding out by walking into it.

   Oliver's E1: four green lamps by the Waystation have collision and the taller ones next to them
   do not; buildings do, spires do not; benches and carts do not. Every one of those was found by
   bumping into it, which is the slowest possible way to audit a level and the reason the list is
   incomplete. This draws the answer.

   WHAT COUNTS AS COLLISION, read out of the game's own tests rather than assumed (index.html
   ~6181 for blocking, ~6193 for floors):
     blocking   G.obstacles, G.walls, CLOSED G.doors, and an implicit 16x16x60 post under every
                G.torches entry - torches are solid but have no box of their own anywhere.
     standable  G.segments, G.walls flagged .stand, G.movers, G.crumbles, and obstacle tops.
   G.deco is NOT in either list. That is the whole point: a prop in deco is scenery you walk
   through unless the generator ALSO pushed a collision column for it, and nothing on screen has
   ever distinguished the two.

   So the third colour is the useful one. MAGENTA marks a piece of deco with no collider under it -
   a thing you can see and walk through. That is E1's actual question, answered per-object.
   Magenta rather than the amber this had first: the hub is sand, stone and warm lamplight, and
   amber wireframes disappeared into it in the very first render (_shot/out/col_hub.png). The one
   colour that matters most has to be the one you cannot miss, and nothing in this game's palette
   is magenta.

   Drawn as merged line segments in ONE geometry rather than a mesh per box. A zone carries a
   couple of thousand deco entries; two thousand Object3Ds would cost more than the game does.
   ───────────────────────────────────────────────────────────────────────────── */
import * as THREE from './three.module.js';

export const OVERLAY = { on: false, counts: null, radius: 1400 };

const NAME = '__bfedcol';
/* Deco is checked within a radius of the player, not level-wide. The check is per-deco against
   every collider, so level-wide is quadratic and the answer you want is always "what is around
   me". The radius is reported in the HUD so it is never mistaken for a complete audit. */

function scene(){ try { return window.__hero3dScene && window.__hero3dScene(); } catch(e){ return null; } }
function G(){ return (window.__BF3 && window.__BF3.G) || null; }

/* Append one box's 12 edges to a flat position array. */
function pushBox(out, x, z, y0, y1, w, d){
  const hw = (w || 10) / 2, hd = (d || w || 10) / 2;
  const c = [[x - hw, z - hd], [x + hw, z - hd], [x + hw, z + hd], [x - hw, z + hd]];
  for(let i = 0; i < 4; i++){
    const a = c[i], b = c[(i + 1) % 4];
    out.push(a[0], y0, a[1],  b[0], y0, b[1]);   // bottom ring
    out.push(a[0], y1, a[1],  b[0], y1, b[1]);   // top ring
    out.push(a[0], y0, a[1],  a[0], y1, a[1]);   // vertical corner
  }
}

function lines(pos, color, opacity){
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.LineSegments(g, new THREE.LineBasicMaterial({
    color, transparent: true, opacity,
    depthTest: false, depthWrite: false      // an overlay you cannot see behind a wall is useless
  }));
}

/* Does anything solid stand where this deco stands? Footprint overlap rather than centre-in-box:
   a lamp's collision column is usually narrower than the lamp and offset by a few units, so a
   centre test reports half the lit lamps in the hub as walk-through when they are not. */
function covered(d, blockers){
  const dw = (d.w || 10) / 2, dd = (d.d || d.w || 10) / 2;
  for(const b of blockers){
    if(Math.abs(d.x - b.x) < dw + (b.w || 10) / 2 && Math.abs(d.z - b.z) < dd + (b.d || b.w || 10) / 2) return true;
  }
  return false;
}

export function build(){
  const sc = scene(), g = G();
  if(!sc || !g) return null;
  clear();

  const blockPos = [], standPos = [], ghostPos = [];
  const blockers = [];

  for(const ob of (g.obstacles || [])){ blockers.push(ob); pushBox(blockPos, ob.x, ob.z, 0, ob.h || 10, ob.w, ob.d); }
  for(const wl of (g.walls || [])){ blockers.push(wl); pushBox(blockPos, wl.x, wl.z, 0, wl.h || 10, wl.w, wl.d); }
  for(const dr of (g.doors || [])) if(!dr.open){ blockers.push(dr); pushBox(blockPos, dr.x, dr.z, 0, dr.h || 10, dr.w, dr.d); }
  /* Torches have no box in the data at all - the collision pass invents one. Drawing the invented
     box is the only way this reads as honest: you bump into a torch and nothing on screen explains
     why. */
  for(const tc of (g.torches || [])){
    const post = { x: tc.x, z: tc.z, w: 16, d: 16, h: 60 };
    blockers.push(post); pushBox(blockPos, tc.x, tc.z, 0, 60, 16, 16);
  }

  for(const mv of (g.movers || [])) pushBox(standPos, mv.x, mv.z, (mv.h || 0) - 4, mv.h || 0, mv.w, mv.d);
  for(const cr of (g.crumbles || [])) pushBox(standPos, cr.x, cr.z, (cr.h || 0) - 4, cr.h || 0, cr.w, cr.d);
  for(const hp of (g.healpads || [])) pushBox(standPos, hp.x, hp.z, 0, 6, (hp.r || 36) * 2, (hp.r || 36) * 2);

  /* THE ANSWER TO E1: scenery you can walk through. */
  const p = g.p || { x: 0, z: 0 };
  let ghosts = 0, checked = 0;
  for(const d of (g.deco || [])){
    if(!d || d.w == null) continue;
    if(Math.abs(d.x - p.x) > OVERLAY.radius || Math.abs(d.z - p.z) > OVERLAY.radius) continue;
    /* Ground banding and floor plates are deco you are MEANT to walk over - flagging every strata
       band as "no collision" would bury the real answer in thousands of false positives. */
    const top = (d.y0 || 0) + (d.h || 0);
    if(top <= 6) continue;
    checked++;
    if(covered(d, blockers)) continue;
    ghosts++;
    pushBox(ghostPos, d.x, d.z, d.y0 || 0, top, d.w, d.d);
  }

  const grp = new THREE.Group();
  grp.name = NAME;
  grp.renderOrder = 9998;
  if(blockPos.length) grp.add(lines(blockPos, 0xff4a4a, 0.85));   // solid: stops you
  if(standPos.length) grp.add(lines(standPos, 0x54d17a, 0.9));    // standable surface
  if(ghostPos.length) grp.add(lines(ghostPos, 0xff3df0, 0.95));   // visible but walk-through
  sc.add(grp);

  /* `standable` counts ONLY the special surfaces drawn in green - movers, crumbling platforms and
     healing pads. Ordinary obstacle tops are standable too, but they are drawn red as part of the
     solid box they belong to, and counting them here made the legend read "standable 0" in a hub
     full of things you can stand on. */
  OVERLAY.counts = { blocking: blockers.length,
                     special: (g.movers || []).length + (g.crumbles || []).length + (g.healpads || []).length,
                     walkThrough: ghosts, decoChecked: checked, radius: OVERLAY.radius };
  return OVERLAY.counts;
}

export function clear(){
  const sc = scene(); if(!sc) return;
  const old = sc.getObjectByName(NAME);
  if(old){
    old.traverse(o => { if(o.geometry) o.geometry.dispose(); if(o.material) o.material.dispose(); });
    sc.remove(old);
  }
}

export function toggleOverlay(force){
  const on = (force == null) ? !OVERLAY.on : !!force;
  OVERLAY.on = on;
  if(on) return build();
  clear(); OVERLAY.counts = null;
  return null;
}

/* Rebuild after an edit, so a platform you just placed shows its box immediately. */
export function refresh(){ if(OVERLAY.on) build(); }

window.__bfCol = { toggleOverlay, build, clear, refresh, OVERLAY };
