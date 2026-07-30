/* ─────────────────────────────────────────────────────────────────────────────
   WORLD3D — draws the game's REAL levels with 3D art.

   The thing that makes this possible: Bladefall's zones are not authored geometry. Every zone
   is a generator that emits a flat list into G.deco, and each entry is
   {x, z, y0, w, h, d, c, theme}. The game's own renderer already reads `theme` and expands one
   entry into a composite prop — a single theme:'forest' deco becomes a whole tree.

   So this is NOT a replica of a level. It consumes the same list the game draws from, which
   means it converts the hub and all eight zones at once, needs no porting, and cannot drift out
   of sync when a generator changes. Rebuilding a level by hand would have bought one zone out of
   eight and been stale the moment the generator was touched.

   Measured on the real data:
     hub      157 deco   — 149 untyped, 8 void
     meadow  2194 deco   — 1888 'plains', 306 untyped; 1277 of them y0-anchored
   'plains' is not a theme the game's renderer handles, so those 1888 grass and wheat entries
   currently draw as plain blocks. They are the single biggest visual win here.

   Trees and rocks use the REAL models from the props pack (pine, pine-crooked, pine-fall, rocks,
   rocks-tall). An earlier pass here claimed the packs had no nature models and drew cones instead
   — that was wrong, the listing was simply truncated before `pine`. Always list a whole directory
   before concluding an asset does not exist.

   Grass genuinely has no model, so ground foliage stays procedural. That is affordable because
   the device test came back at 60 fps with 64 animated skinned characters, a far heavier load
   than instanced static foliage.

   Every prop is single-mesh and single-material (one shared `colormap` atlas), so each becomes
   exactly one InstancedMesh regardless of how many are placed.

   EVERYTHING IS INSTANCED, one InstancedMesh per category. A meadow is ~2200 entries and one
   draw call per entry would spend the whole frame budget on overhead.
   ───────────────────────────────────────────────────────────────────────────── */
/* Same specifier hero3d uses. Importing 'three' via the importmap could resolve to a
   SECOND module instance, and two THREE copies break every instanceof check silently. */
import * as THREE from './three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

export const WORLD3D = {
  on: false,
  ready: false,
  built: null,        // signature of the level currently built, so rebuilds only happen on change
  counts: {},
  err: null,
};

try {
  const q = new URLSearchParams(location.search);
  if(q.get('world3d') === '1' || q.get('world3d') === 'true') WORLD3D.on = true;
} catch(e){}

/* ── palette ──────────────────────────────────────────────────────────────────
   Colours come from the deco entry itself (d.c), which is what the game already uses for that
   box, so the world keeps the art direction each zone was tuned with instead of being recoloured
   to taste. These are only the accents procedural geometry needs on top. */
const TRUNK = 0x3a2c1c, TRUNK_D = 0x2a2014;

let group = null;                 // everything this module adds, so teardown is one removal
const _geoCache = {};

/* Real props, from the pack. Several variants per kind so a forest is not one tree stamped
   repeatedly; the variant is chosen by position hash, so it is stable across rebuilds. */
const PROPS = '../slice3d/assets/props/';
const PROP_SETS = {
  tree:   ['pine', 'pine-crooked', 'pine-fall'],
  rock:   ['rocks', 'rocks-tall'],
  fence:  ['iron-fence', 'iron-fence-damaged'],
  grave:  ['gravestone-cross', 'gravestone-round', 'gravestone-decorative', 'gravestone-broken'],
  pillar: ['pillar-square', 'pillar-large', 'pillar-obelisk'],
};
const _propCache = new Map();     // name -> { geo, mat, height } or null when a load failed
let _propsReady = false, _propsPending = false;

const _loader = new GLTFLoader();
const _loadGLB = url => new Promise((res, rej) => _loader.load(url, res, undefined, rej));

/* Pull the single mesh out of a prop and keep its geometry and material for instancing.
   Geometry is baked into world orientation and moved so its base sits at y=0, because deco
   entries give a BASE height, not a centre. */
async function loadProp(name){
  if(_propCache.has(name)) return _propCache.get(name);
  try {
    const g = await _loadGLB(PROPS + name + '.glb');
    let mesh = null;
    g.scene.updateMatrixWorld(true);
    g.scene.traverse(o => { if(!mesh && o.isMesh) mesh = o; });
    if(!mesh) throw new Error('no mesh in ' + name);
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld);          // bake the model's own transform
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    geo.translate(0, -bb.min.y, 0);              // base at y=0
    const height = Math.max(0.001, bb.max.y - bb.min.y);
    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const rec = { geo, mat, height };
    _propCache.set(name, rec);
    return rec;
  } catch(e){
    console.warn('[world3d] prop failed to load:', name, e.message);
    _propCache.set(name, null);                  // remember the failure; do not retry every frame
    return null;
  }
}
async function ensureProps(){
  if(_propsReady) return;
  const names = Object.values(PROP_SETS).flat();
  await Promise.all(names.map(loadProp));
  _propsReady = true;
}

/* A tapered blade, cheap and readable at distance. Three crossed quads would need alpha
   testing and sorting; solid geometry avoids both and the perf budget allows it. */
function bladeGeo(){
  if(_geoCache.blade) return _geoCache.blade;
  const g = new THREE.ConeGeometry(0.5, 1, 4, 1, false);
  g.translate(0, 0.5, 0);         // sit on its base, so instance scale maps to real height
  return (_geoCache.blade = g);
}
function boxGeo(){
  if(_geoCache.box) return _geoCache.box;
  const g = new THREE.BoxGeometry(1, 1, 1);
  g.translate(0, 0.5, 0);         // origin at the base: deco gives a base height (y0) not a centre
  return (_geoCache.box = g);
}
function trunkGeo(){
  if(_geoCache.trunk) return _geoCache.trunk;
  const g = new THREE.CylinderGeometry(0.34, 0.46, 1, 6);
  g.translate(0, 0.5, 0);
  return (_geoCache.trunk = g);
}
function canopyGeo(){
  if(_geoCache.canopy) return _geoCache.canopy;
  const g = new THREE.ConeGeometry(1, 1, 7);
  g.translate(0, 0.5, 0);
  return (_geoCache.canopy = g);
}
function shardGeo(){
  if(_geoCache.shard) return _geoCache.shard;
  const g = new THREE.ConeGeometry(0.5, 1, 5);
  g.translate(0, 0.5, 0);
  return (_geoCache.shard = g);
}

/* NOT vertexColors. InstancedMesh.instanceColor drives per-instance colour on its own; setting
   vertexColors makes the shader look for a geometry `color` attribute, which these primitives do
   not have, and every box renders BLACK. That was the first render's symptom. */
function mat(opts){
  return new THREE.MeshLambertMaterial(Object.assign({}, opts || {}));
}

/* ── classification ───────────────────────────────────────────────────────────
   Mirrors how the game's own renderer reads a deco entry, so a box becomes the same KIND of
   thing here that it is there. Getting this wrong would not just look different, it would
   misrepresent the level. */
function classify(d){
  /* An explicit `kind` from the generator always wins. Guessing a tree from a green box is
     impossible after the fact - the two canopy boxes a tree emits are indistinguishable from
     terrain banding - so the generators tag what they build and this just reads the tag.
     Non-lead pieces of a multi-box prop are dropped: one tree should become one model, not two
     stacked pines. */
  if(d.kind){
    if(d.kind === 'tree')  return d.lead === true ? 'tree' : 'skip';
    if(d.kind === 'rock')  return d.lead === false ? 'skip' : 'rock';
    if(d.kind === 'fence') return 'fence';
    if(d.kind === 'grave') return 'grave';
    if(d.kind === 'pillar')return 'pillar';
  }
  const t = d.theme;
  if(t === 'forest') return 'tree';
  if(t === 'frost' || t === 'void' || t === 'apex') return 'shard';
  if(t === 'volcano') return 'rock';
  if(t === 'plains'){
    /* Plains covers both ground-level foliage and terrain banding. An entry pinned to an
       explicit base height is structure (a strata band or platform); a short one sitting on the
       ground is a tuft of grass or wheat. Height is the discriminator the generator itself
       uses. */
    if(d.y0 != null && d.y0 !== 0) return 'box';
    return (d.h || 0) <= 60 ? 'foliage' : 'box';
  }
  return 'box';
}

const COL = new THREE.Color();
function pushInstance(list, d, kind){ list.push(d); }

function buildCategory(scene, items, geo, material, place){
  if(!items.length) return null;
  const m = new THREE.InstancedMesh(geo, material, items.length);
  m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(items.length * 3), 3);
  const o = new THREE.Object3D();
  for(let i = 0; i < items.length; i++){
    const d = items[i];
    place(o, d, i);
    o.updateMatrix();
    m.setMatrixAt(i, o.matrix);
    COL.set(d.c || '#888888');
    m.instanceColor.setXYZ(i, COL.r, COL.g, COL.b);
  }
  m.instanceMatrix.needsUpdate = true;
  m.instanceColor.needsUpdate = true;
  m.frustumCulled = false;         // the camera matrices are the game's; let it draw
  group.add(m);
  return m;
}

/* Deterministic jitter. Math.random would reshuffle the whole level on every rebuild, so the
   same meadow would look different each time you walked into it. */
function hash(x, z){
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/* Place a bin of deco onto real prop models, splitting it across the available variants.
   Falls back to a lit box if a model failed to load, so a missing asset degrades to something
   visible rather than to an invisible hole in the level. */
function buildProps(items, names, defaultH, heightOf){
  if(!items.length) return;
  const recs = names.map(n => _propCache.get(n)).filter(Boolean);
  if(!recs.length){
    buildCategory(null, items, boxGeo(), mat(), (o, d) => {
      o.position.set(d.x, d.y0 || 0, d.z);
      o.rotation.set(0, hash(d.x, d.z) * 6.283, 0);
      o.scale.set(d.w || 20, d.h || defaultH, d.d || d.w || 20);
    });
    return;
  }
  const buckets = recs.map(() => []);
  for(const d of items){
    const r = hash(d.x * 1.7, d.z * 2.3);
    buckets[Math.min(recs.length - 1, (r * recs.length) | 0)].push(d);
  }
  recs.forEach((rec, i) => {
    const list = buckets[i];
    if(!list.length) return;
    /* The prop's own texture carries its colour, so instanceColor is NOT set here - tinting a
       textured pine by the deco's flat green would throw away the artwork. */
    const m = new THREE.InstancedMesh(rec.geo, rec.mat, list.length);
    const o = new THREE.Object3D();
    for(let k = 0; k < list.length; k++){
      const d = list[k], r = hash(d.x, d.z);
      const sc = (heightOf ? heightOf(d) : (d.h || defaultH)) / rec.height;
      o.position.set(d.x, d.y0 || 0, d.z);
      o.rotation.set(0, r * 6.283, 0);
      o.scale.set(sc, sc, sc);
      o.updateMatrix();
      m.setMatrixAt(k, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.frustumCulled = false;
    group.add(m);
  });
}

export function buildWorld(scene, world){
  const deco = (world && world.deco) || [];
  clearWorld(scene);
  group = new THREE.Group();
  group.name = 'world3d';
  scene.add(group);

  const bins = { box: [], foliage: [], tree: [], shard: [], rock: [],
                 fence: [], grave: [], pillar: [], skip: [] };
  for(const d of deco){
    if(!d || d.w == null) continue;
    bins[classify(d)].push(d);
  }

  /* Structure: strata bands, floors, platforms, walls. Rendered as real lit boxes rather than
     the flat unlit colour the voxel path uses — same silhouette, but it now takes light, which
     is most of what makes a scene read as 3D. */
  buildCategory(scene, bins.box, boxGeo(), mat(), (o, d) => {
    o.position.set(d.x, d.y0 || 0, d.z);
    o.rotation.set(0, 0, 0);
    o.scale.set(d.w, Math.max(1, d.h || 1), d.d || d.w);
  });

  /* Foliage. One deco entry becomes one clump; the entry's own colour carries grass vs wheat,
     which is why a field reads as two-tone without any of it being hard-coded here. */
  const tufts = [];
  for(const d of bins.foliage){
    const n = 3;                                   // a clump reads as grass; a single cone does not
    for(let k = 0; k < n; k++){
      const r = hash(d.x + k * 7.7, d.z - k * 3.1);
      const a = r * Math.PI * 2;
      const spread = (d.w || 20) * 0.42;
      tufts.push({ x: d.x + Math.cos(a) * spread * r,
                   z: d.z + Math.sin(a) * spread * r,
                   y0: d.y0 || 0,
                   w: (d.w || 20) * (0.18 + r * 0.16),
                   h: Math.max(6, (d.h || 20) * (0.7 + r * 0.7)),
                   c: d.c, r });
    }
  }
  buildCategory(scene, tufts, bladeGeo(), mat(), (o, d) => {
    o.position.set(d.x, d.y0, d.z);
    o.rotation.set(0, d.r * 6.283, (d.r - 0.5) * 0.34);   // lean, so a field is not a pin cushion
    o.scale.set(d.w, d.h, d.w);
  });

  /* Trees and rocks: the real models. Scale is deco height divided by the model's own height,
     so a tree ends up exactly as tall as the level says it should be rather than a guessed size. */
  /* A tree's real height is its trunk plus canopy. The lead deco carries trunkH; using the
     canopy box height alone would place a pine a third of its proper size. */
  buildProps(bins.tree, PROP_SETS.tree, 90, d => (d.trunkH || 0) + (d.h || 40) + 30);
  buildProps(bins.rock, PROP_SETS.rock, 20);
  buildProps(bins.fence, PROP_SETS.fence, 30);
  buildProps(bins.grave, PROP_SETS.grave, 30);
  buildProps(bins.pillar, PROP_SETS.pillar, 80);

  buildCategory(scene, bins.shard, shardGeo(), mat(), (o, d) => {
    const r = hash(d.x, d.z);
    o.position.set(d.x, d.y0 || 0, d.z);
    o.rotation.set((r - 0.5) * 0.3, r * 6.283, (r - 0.5) * 0.3);
    o.scale.set((d.w || 20) * 0.8, Math.max(8, d.h || 30), (d.w || 20) * 0.8);
  });

  /* Re-balance the lights for a WORLD. hero3d's values (ambient 1.25 + key 1.7 + rim 0.7) were
     tuned to make one character read clearly against the game's own background; applied to a
     whole meadow they blow the entire scene out to near-white. Only touched while world3d is
     active, and the originals are stashed so turning it off restores the hero's lighting. */
  scene.traverse(o => {
    if(!o.isLight) return;
    if(o.userData._w3dOrig == null) o.userData._w3dOrig = o.intensity;
    const k = o.isAmbientLight ? 0.42 : o.isDirectionalLight ? 0.62 : 0.6;
    o.intensity = o.userData._w3dOrig * k;
  });

  WORLD3D.counts = { deco: deco.length, box: bins.box.length, foliage: bins.foliage.length,
                     tufts: tufts.length, tree: bins.tree.length, shard: bins.shard.length,
                     rock: bins.rock.length, fence: bins.fence.length, grave: bins.grave.length,
                     pillar: bins.pillar.length, skipped: bins.skip.length,
                     drawCalls: group.children.length,
                     propsLoaded: [..._propCache.entries()].filter(e => e[1]).map(e => e[0]) };
  WORLD3D.ready = true;
  return WORLD3D.counts;
}

export function clearWorld(scene){
  /* Put the hero's lighting back, so disabling world3d cannot leave the character lit for a
     scene that is no longer there. */
  if(scene) scene.traverse(o => {
    if(o.isLight && o.userData._w3dOrig != null){ o.intensity = o.userData._w3dOrig; }
  });
  if(group && group.parent) group.parent.remove(group);
  if(group){
    group.traverse(o => { if(o.isInstancedMesh){ o.dispose && o.dispose(); } });
  }
  group = null;
  WORLD3D.ready = false;
}

/* A level is identified by its deco count plus a couple of sampled positions. Comparing the
   array by reference is not enough — the generators mutate G.deco in place (there is a filter
   that strips deco near the player), so the same array object can hold a different level. */
function signature(world){
  const d = world.deco || [];
  if(!d.length) return 'empty';
  const a = d[0], b = d[(d.length / 2) | 0], c = d[d.length - 1];
  return d.length + '|' + (world.zone || '?') + '|' +
         [a, b, c].map(o => o ? (o.x | 0) + ',' + (o.z | 0) : '-').join(';');
}

/* Called once per frame from hero3d's draw. Cheap when nothing changed: it compares a signature
   and returns. */
export function syncWorld(scene){
  if(!WORLD3D.on) return false;
  let world = null;
  try { world = window.__BF_WORLD && window.__BF_WORLD(); } catch(e){}
  if(!world || !world.deco) return false;
  const sig = signature(world);
  if(sig === WORLD3D.built) return true;
  /* Prop models load once, asynchronously. Until they arrive the build is deferred rather than
     run with an empty cache, which would fall back to boxes and then never rebuild because the
     signature would already be marked as built. */
  if(!_propsReady){
    if(!_propsPending){ _propsPending = true; ensureProps().finally(() => { _propsPending = false; }); }
    return false;
  }
  try {
    buildWorld(scene, world);
    WORLD3D.built = sig;
    WORLD3D.err = null;
  } catch(e){
    WORLD3D.err = String(e && e.message || e);
    WORLD3D.on = false;            // never let a world fault take the game down
    console.warn('[world3d] build failed, falling back to voxels:', WORLD3D.err);
    return false;
  }
  return true;
}

window.__world3d = () => ({ on: WORLD3D.on, ready: WORLD3D.ready, built: WORLD3D.built,
                            counts: WORLD3D.counts, err: WORLD3D.err });
window.__world3dRebuild = () => { WORLD3D.built = null; return 'will rebuild next frame'; };
