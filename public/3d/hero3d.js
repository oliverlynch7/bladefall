/* ─────────────────────────────────────────────────────────────────────────────
   BLADEFALL — 3D HERO LAYER  (proof that the renderer can be swapped)

   The question this answers: can the new 3D character rendering be dropped into the REAL
   game, with all 112 skills, loot, quests, forge and multiplayer intact, rather than us
   rebuilding 13,790 lines of game logic inside the slice?

   Why it is tractable:
     - the game is ALREADY WebGL (getContext('webgl'), instanced cubes, its own matrix stack)
     - it uploads explicit PROJ and VIEW matrices as uniforms, so its camera is readable data
     - drawing is isolated in 25 drawX functions, and drawHero3 is called LAST ("the real you,
       drawn last — always visible"), which is the easiest possible place to intervene

   So this shares the game's own GL context, builds a Three.js camera from PROJ/VIEW, and
   renders a real animated character where drawHero3 would have drawn voxels.

   SAFETY. This is additive and defaults OFF. With HERO3D.on false the game runs exactly as
   before. Three.js and the game both manage GL state, so renderer.resetState() is called
   around every draw — without it the game's own rendering corrupts.
   ───────────────────────────────────────────────────────────────────────────── */
import * as THREE from './three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

const ASSETS = '../slice3d/assets/';       // shared with the slice; not duplicated

/* Voxel units per metre. The hero is drawn spanning roughly 45 voxel units (legs pivot at
   y=14, head box tops out near y=33 above that) and our glTF characters are 1.75m, so ~26.
   Exposed as a control because it is the one number most likely to need a nudge by eye. */
export const HERO3D = {
  on: false,
  scale: 15,   // measured: scale 26 gave 76.8 units tall vs the voxel hero's ~45
  yOff: 0,
  yawOff: Math.PI,          // the glTF characters face +Z; the game's yaw 0 faces away
  model: 'Warrior',
  ready: false,
  err: null,
};
window.HERO3D = HERO3D;

/* Reachable by URL so it can be tried on a phone without a console:
     /3d/?hero3d=1            enable the 3D hero
     /3d/?hero3d=1&scale=30   ...and override the units-per-metre guess
     /3d/?hero3d=1&model=Rogue
   Anything unset keeps its default, and no parameter can break the game - the flag only
   gates an additive draw. */
try {
  const q = new URLSearchParams(location.search);
  if(q.get('hero3d') === '1' || q.get('hero3d') === 'true') HERO3D.on = true;
  if(q.get('scale')) HERO3D.scale = parseFloat(q.get('scale')) || HERO3D.scale;
  if(q.get('model')) HERO3D.model = q.get('model');
  if(q.get('yoff'))  HERO3D.yOff  = parseFloat(q.get('yoff')) || 0;
} catch(e){}

let renderer = null, scene = null, cam = null, actor = null, mixer = null;
let clips = {}, cur = null, clock = null;
let _lastW = 0, _lastH = 0;

/* Build a Three.js camera whose matrices ARE the game's. Nothing is recomputed, so the 3D
   hero cannot drift out of alignment with the voxel world however the game moves its camera. */
function syncCamera(){
  /* PROJ/VIEW are top-level `let` in the game's classic script, so they are not window
     properties. __BF_CAM is a closure the game exposes over the live values. */
  const c = window.__BF_CAM && window.__BF_CAM();
  const P = c && c.P, V = c && c.V;
  if(!P || !V || P.length !== 16 || V.length !== 16) return false;
  cam.projectionMatrix.fromArray(P);
  cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
  cam.matrixWorldInverse.fromArray(V);
  cam.matrixWorld.copy(cam.matrixWorldInverse).invert();
  cam.matrixAutoUpdate = false;
  cam.matrixWorldAutoUpdate = false;
  return true;
}

async function boot(){
  try {
    const canvas = document.getElementById('gl');
    const gl = canvas && (canvas.__glctx || null);
    // Share the game's context. Three.js accepts an existing one, which keeps a single depth
    // buffer so the 3D hero occludes and is occluded correctly by the voxel world.
    renderer = new THREE.WebGLRenderer({
      canvas,
      context: window.__BF_GL || gl || undefined,
      antialias: true,
    });
    renderer.autoClear = false;                 // the game owns clearing
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    /* Tell Three the drawing buffer size, WITHOUT letting it resize the canvas (false).
       Omitting this was the actual bug behind the misplaced character: Three kept its own
       default viewport, which did not match the game's, so the render landed in the wrong
       part of the screen at the wrong scale. The game's matrices were never the problem -
       its mMul/mT/mPersp are column-major, exactly what Matrix4.fromArray expects. */
    renderer.setPixelRatio(1);
    renderer.setSize(canvas.width, canvas.height, false);

    scene = new THREE.Scene();
    cam = new THREE.PerspectiveCamera(40, 1, 5, 900);
    scene.add(new THREE.AmbientLight(0xffffff, 1.25));
    const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(60, 120, 80);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x93b6ff, 0.7); rim.position.set(-70, 50, -60);
    scene.add(rim);

    const loader = new GLTFLoader();
    const load = url => new Promise((res, rej) => loader.load(url, res, undefined, rej));

    // the six RPG characters share one skeleton, so clips pool across all of them
    const pool = ['Warrior','Rogue','Ranger','Wizard','Cleric','Monk'];
    const gs = await Promise.all(pool.map(n =>
      load(ASSETS + 'chars/' + n + '.gltf').catch(() => null)));
    const own = gs[pool.indexOf(HERO3D.model)] || gs.find(Boolean);
    if(!own) throw new Error('no character models loaded from ' + ASSETS + 'chars/');

    actor = own.scene;
    actor.traverse(o => { if(o.isMesh){ o.castShadow = false; o.receiveShadow = false; } });
    const wrap = new THREE.Group();
    wrap.add(actor);
    scene.add(wrap);
    HERO3D._wrap = wrap;

    mixer = new THREE.AnimationMixer(actor);
    const seen = new Set();
    for(const g of gs){ if(!g) continue;
      for(const c of g.animations){ if(seen.has(c.name)) continue; seen.add(c.name); clips[c.name] = c; } }

    clock = new THREE.Clock();
    HERO3D.ready = true;
    HERO3D.clips = Object.keys(clips);
    console.log('[hero3d] ready — ' + HERO3D.clips.length + ' clips, model ' + HERO3D.model);
  } catch(e){
    HERO3D.err = String(e && e.message || e);
    console.warn('[hero3d] boot failed:', HERO3D.err);
  }
}

function playFor(p){
  // pick a clip from the game's own player state, so the 3D hero animates off real gameplay
  const moving = Math.hypot(p.vx || 0, p.vz || 0) > 20 && p.onGround;
  const want = p.dead ? 'Death'
             : (p.attackTimer > 0 || p.swingT > 0) ? 'Sword_Attack'
             : p.dodgeTimer > 0 ? 'Roll'
             : moving ? (Math.hypot(p.vx||0, p.vz||0) > 120 ? 'Run' : 'Walk')
             : 'Idle';
  const name = clips[want] ? want : (clips.Idle ? 'Idle' : Object.keys(clips)[0]);
  if(!name || cur === name) return;
  const next = mixer.clipAction(clips[name]);
  next.reset().fadeIn(0.15).play();
  if(cur && clips[cur]) mixer.clipAction(clips[cur]).fadeOut(0.15);
  cur = name;
}

/* Called from the game's drawHero3. Returns true when it has drawn, so the caller can skip
   its voxel path; returns false whenever anything is not ready, so a failure here degrades
   to the original renderer rather than to a missing character. */
export function drawHero3D(p, t){
  if(!HERO3D.on || !HERO3D.ready || !renderer || !p) return false;
  if(!syncCamera()) return false;
  try {
    // the game resizes its canvas on rotate/resize, so keep the viewport in step every frame
    const cv = renderer.domElement;
    if(cv.width !== _lastW || cv.height !== _lastH){
      renderer.setSize(cv.width, cv.height, false);
      _lastW = cv.width; _lastH = cv.height;
    }
    renderer.setViewport(0, 0, cv.width, cv.height);
    const S = HERO3D.scale;
    const wrap = HERO3D._wrap;
    wrap.scale.setScalar(S);
    wrap.position.set(p.x, (p.y || 0) + HERO3D.yOff, p.z);
    wrap.rotation.y = (p.yaw || 0) + HERO3D.yawOff;
    wrap.updateMatrixWorld(true);

    playFor(p);
    mixer.update(Math.min(0.05, clock.getDelta()));

    /* Both Three.js and the game write GL state. Without bracketing the draw in resetState()
       the game's next frame renders with Three's leftover state and the world breaks. */
    renderer.resetState();
    renderer.render(scene, cam);
    renderer.resetState();
    return true;
  } catch(e){
    HERO3D.err = String(e && e.message || e);
    HERO3D.on = false;             // never let a 3D fault take the game down
    console.warn('[hero3d] draw failed, falling back to voxels:', HERO3D.err);
    return false;
  }
}
window.drawHero3D = drawHero3D;

/* Diagnostic: where does the character actually land? Reports its world position, its
   projected normalised device coords (|x|,|y| < 1 means on screen, z < -1 or > 1 means
   outside the depth range), and its on-screen pixel size. Measuring beats guessing. */
/* Bisect the "renders but invisible" problem with the bluntest possible marker: a large
   unlit cube at the hero's position, depthTest off, drawn last. If THIS is invisible the
   problem is GL state (scissor, framebuffer, program). If it appears, the problem is depth or
   the character's own materials. */
window.__hero3dDebugCube = (on) => {
  if(!scene) return 'no scene';
  let c = scene.getObjectByName('__dbg');
  if(on){
    if(!c){
      c = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),
        new THREE.MeshBasicMaterial({ color:0xff00ff, depthTest:false, depthWrite:false }));
      c.name = '__dbg'; c.renderOrder = 9999; scene.add(c);
    }
    c.visible = true; c.scale.setScalar(40);
    const w = HERO3D._wrap;
    c.position.copy(w.position); c.position.y += 20;
  } else if(c) c.visible = false;
  return { added: !!c, pos: c ? c.position.toArray().map(n=>+n.toFixed(1)) : null };
};
window.__hero3dGLState = () => {
  const g = window.__BF_GL; if(!g) return 'no gl';
  return {
    scissor: g.getParameter(g.SCISSOR_TEST),
    scissorBox: Array.from(g.getParameter(g.SCISSOR_BOX) || []),
    viewport: Array.from(g.getParameter(g.VIEWPORT) || []),
    depthTest: g.getParameter(g.DEPTH_TEST),
    depthFunc: g.getParameter(g.DEPTH_FUNC),
    depthRange: Array.from(g.getParameter(g.DEPTH_RANGE) || []),
    cullFace: g.getParameter(g.CULL_FACE),
    blend: g.getParameter(g.BLEND),
    fbo: g.getParameter(g.FRAMEBUFFER_BINDING) ? 'BOUND-FBO' : 'default',
    colorMask: Array.from(g.getParameter(g.COLOR_WRITEMASK) || []),
  };
};
window.__hero3dProbe = () => {
  if(!HERO3D.ready) return { err: 'not ready: ' + HERO3D.err };
  const wrap = HERO3D._wrap;
  if(!syncCamera()) return { err: 'no camera' };
  wrap.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(wrap);
  const ctr = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const ndc = ctr.clone().project(cam);
  const cv = renderer.domElement;
  // rough pixel height: project top and bottom of the bounding box
  const top = new THREE.Vector3(ctr.x, box.max.y, ctr.z).project(cam);
  const bot = new THREE.Vector3(ctr.x, box.min.y, ctr.z).project(cam);
  return {
    worldPos: [+wrap.position.x.toFixed(1), +wrap.position.y.toFixed(1), +wrap.position.z.toFixed(1)],
    worldSize: [+size.x.toFixed(1), +size.y.toFixed(1), +size.z.toFixed(1)],
    ndc: [+ndc.x.toFixed(3), +ndc.y.toFixed(3), +ndc.z.toFixed(3)],
    onScreen: Math.abs(ndc.x) < 1 && Math.abs(ndc.y) < 1 && ndc.z > -1 && ndc.z < 1,
    pxHeight: +Math.abs((top.y - bot.y) * cv.height / 2).toFixed(1),
    canvas: [cv.width, cv.height],
    scale: HERO3D.scale,
  };
};

boot();
