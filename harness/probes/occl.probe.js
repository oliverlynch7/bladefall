/* OCCLUSION PROBE — "does a 3D character draw through a SOLID voxel wall?"
   Mutates only the live G / the live GL context. Nothing is written to source.

   node _shot/shot.js --scene spar --wait 12000 --eval @harness/probes/occl.probe.js --out <png>

   Modes, selected by query flags on --url:
     (default)  camera pinned + one solid voxel wall between eye and hero
     &nowall    camera pinned, NO wall            → the CONTROL: proves the hero is in frame at all
     &noclear   as default, but flushHero3D's depth clear is neutralised at runtime by wrapping
                gl.clear (the game already wraps it, so this wraps the wrapper).
                gl.clear(DEPTH_BUFFER_BIT) alone is issued from exactly two places — flushHero3D
                and the FIRST-PERSON weapon — and this probe forces shoulder cam, so the only call
                suppressed is flushHero3D's.

   THE HARD PART IS NOT THE WALL, IT IS GETTING A SOLID ONE.
   The game deliberately ghosts any wall between camera and hero (LATE pass, index.html ~17270):
       far  cam :  wl.z > p.z+26 && wl.z-p.z < 320 && |wl.x-p.x| < 340
       shldr cam:  (wl.h||96) > 50 && rayHits(wl,12)
   In FAR cam the eye sits at p.z+330, so the un-ghosted window is 26 units wide — no solid wall is
   reachable. In SHOULDER cam the height test is a hard threshold, so a wall of h EXACTLY 50 is
   never ghosted, whatever it blocks. That is the wall used here.
   Camera pitch is pinned to -0.5, the game's own clamp floor: eye drops to y≈32, so a 50-tall wall
   actually crosses the sightline instead of being stepped over from above.

   READ `wallPass` AND `hubWallCount`, NOT `G.hub`. Whether this wall can occlude anything is
   decided by _wallDefer, which asks world3d whether it stood replacement ramparts here
   (`counts.wall`) — not by the hub flag. `counts.wall` is 36 in the Waystation and undefined in the
   Sparring Room, which is the whole reason the room was drawing characters through its walls.
*/
(async function(){
  var B = window.__BF3, G = B && B.G, meta = B && B.meta;
  if(!G || !G.p) return 'no G';
  var q = location.search;
  var NOWALL = /[?&]nowall/.test(q), NOCLEAR = /[?&]noclear/.test(q);
  var p = G.p;

  meta.camMode = 'shoulder';
  var pinCam = function(){ G.camYaw = 0; G.camPitch = -0.5; };   // eye at -z of hero, looking +z, as low as the game allows
  pinCam();

  var diag = null;
  if(NOCLEAR){
    var cv = document.getElementById('gl');
    var gl = cv.getContext('webgl2') || cv.getContext('webgl') || cv.getContext('experimental-webgl');
    var DEPTH_BIT = gl.DEPTH_BUFFER_BIT, prev = gl.clear;
    window.__occlHits = 0;
    gl.clear = function(m){ if(m === DEPTH_BIT){ window.__occlHits++; return; } return prev.call(gl, m); };
    diag = { canvasId: cv.id, canvases: document.querySelectorAll('canvas').length,
             gl2: !!(window.WebGL2RenderingContext && gl instanceof WebGL2RenderingContext),
             ownClear: Object.prototype.hasOwnProperty.call(gl, 'clear'), depthBit: DEPTH_BIT };
  }

  var wall = null;
  if(!NOWALL){
    wall = { x: p.x, z: p.z - 100, y0: 0, w: 110, h: 50, d: 16 };
    if(!G.walls) G.walls = [];
    G.walls.push(wall);
  }

  var repin = function(){ pinCam(); if(wall){ wall.x = p.x; wall.z = p.z - 100; } };
  await new Promise(function(r){ setTimeout(r, 900); });  repin();
  await new Promise(function(r){ setTimeout(r, 300); });  repin();

  var pit = -0.5, hd = 180*Math.cos(pit), eh = 118 + 180*Math.sin(pit) + (G.cam.y||0);
  var w3 = window.__world3d && window.__world3d();
  var wallCount = (w3 && w3.counts && w3.counts.wall) || 0;
  /* The live copy of index.html's `_wallDefer`. Deferred walls replay AFTER the Three layer and
     depth-test against it; inline walls are composited BEFORE it and cannot occlude it. */
  var defer = !G.hub || !(wallCount > 0);
  return {
    mode: NOWALL ? 'CONTROL (no wall)' : NOCLEAR ? 'WALL + depth clear SUPPRESSED' : 'WALL (stock build)',
    place: (G.areaName || (G.sparringRoom ? 'Sparring Room' : G.hub ? 'Waystation' : '?'))
           + (G.sparringRoom ? ' [hub sub-area]' : G.hub ? ' [hub]' : ' [zone]'),
    hub: !!G.hub,
    hubWallCount: wallCount,                       // world3d's own count of replacement ramparts
    wallPass: defer ? 'DEFERRED (after the 3D layer)' : 'INLINE (before the 3D layer)',
    thisWallIsDrawn: NOWALL ? null : (defer ? 'DEFERRED (after the 3D layer)' : 'INLINE (before the 3D layer)'),
    ghosted: wall ? (wall.h > 50) : null,          // must be false or the picture shows the LATE pass
    hero: { x: Math.round(p.x), y: Math.round(p.y||0), z: Math.round(p.z) },
    wall: wall && { x: Math.round(wall.x), z: Math.round(wall.z), w: wall.w, h: wall.h, d: wall.d },
    eyeApprox: { x: Math.round(p.x), y: Math.round(eh), z: Math.round(p.z - hd) },
    depthClearsSuppressed: window.__occlHits || 0,
    clearPatchDiag: diag,
    cam: { mode: meta.camMode, yaw: G.camYaw, pitch: G.camPitch, camY: G.cam && G.cam.y,
           vw: window.innerWidth, vh: window.innerHeight },
    hero3d: window.HERO3D ? { on: !!window.HERO3D.on, ready: !!window.HERO3D.ready } : null,
    world3d: w3 ? { on: !!w3.on, ready: !!w3.ready, counts: w3.counts } : null,
    bloomSuppressedByUrl: /[?&]nobloom/.test(q)
  };
})()
