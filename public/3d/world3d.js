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
import { clearMobs } from './mob3d.js';
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
const PROPS = '../slice3d/assets/';
/* Real models from the Kenney Nature Kit, installed 2026-07-30. Variety matters more than any
   single model here: a treeline built from ONE mesh reads as wallpaper no matter how good that
   mesh is, so each set carries several and the variant is picked by position hash - stable
   across rebuilds, so a wood does not reshuffle itself every time you walk into it.
   Broadleaf and pine are mixed deliberately; the Outskirts is meadow-and-woodland, not forest. */
const PROP_SETS = {
  tree:   ['nature/tree_default', 'nature/tree_oak', 'nature/tree_tall', 'nature/tree_detailed',
           'nature/tree_fat', 'nature/tree_thin', 'nature/tree_default_dark', 'nature/tree_oak_dark',
           'nature/tree_pineTallA', 'nature/tree_pineTallB', 'nature/tree_pineRoundA',
           'nature/tree_pineDefaultA'],
  bush:   ['nature/plant_bush', 'nature/plant_bushDetailed', 'nature/plant_bushLarge',
           'nature/plant_bushSmall'],
  grass:  ['nature/grass', 'nature/grass_large', 'nature/grass_leafs', 'nature/grass_leafsLarge'],
  floor:  ['nature/ground_grass'],
  floorStone: ['castle/ground'],
  /* Hub architecture. Kept to a handful of pieces on purpose: Oliver's steer is that the
     MECHANICS matter most, so the hub needs to be charming and READABLE - you should see at a
     glance where the portals are and where things happen - not an architectural showpiece. */
  hubWall:   ['castle/wall'],
  hubGate:   ['castle/wall-doorway'],
  hubTower:  ['castle/tower-square-base'],
  hubTowerM: ['castle/tower-square-mid-windows'],
  hubRoof:   ['castle/tower-square-top-roof'],
  hubFlag:   ['castle/flag'],
  hubPave:   ['castle/ground'],
  /* Plaza dressing. The rebuilt courtyard read as an empty lot - the perimeter was right but the
     middle was bare paving. These give it the things that make a town square somewhere people
     stand around: a fountain to gather at, market carts and stalls, lanterns lining the approach,
     hedges softening the edges. */
  hubFountain: ['town/fountain-round'],
  hubCart:     ['town/cart'],
  hubStall:    ['town/stall-bench'],
  hubLantern:  ['props/lightpost-single'],
  hubHedge:    ['town/hedge-large'],
  hubBanner:   ['town/banner-red'],
  flower: ['nature/flower_purpleA', 'nature/flower_redA', 'nature/flower_yellowA',
           'nature/flower_purpleB', 'nature/flower_redB', 'nature/flower_yellowB'],
  rock:   ['nature/rock_largeA', 'nature/rock_largeB', 'nature/rock_largeC', 'nature/rock_tallA',
           'nature/rock_tallB', 'nature/rock_smallA', 'nature/rock_smallB', 'nature/rock_smallFlatA'],
  fence:  ['props/iron-fence', 'props/iron-fence-damaged'],
  grave:  ['props/gravestone-cross', 'props/gravestone-round', 'props/gravestone-decorative',
           'props/gravestone-broken'],
  pillar: ['props/pillar-square', 'props/pillar-large', 'props/pillar-obelisk'],
};
const _propCache = new Map();     // name -> { geo, mat, height } or null when a load failed
let _propsReady = false, _propsPending = false;

/* ── VILLAGE KIT ───────────────────────────────────────────────────────────────
   The Medieval Village MegaKit has no finished buildings in it — 176 modular PARTS and exactly
   one landmark. So a hub cannot be furnished by dropping house models in; the houses have to be
   assembled from walls, windows, doors, corner posts and a roof. slice3d proved the arithmetic
   works (makeBuilding there); this is the same grid, emitting INSTANCE MATRICES instead of a
   Group of meshes, because a courtyard of houses built as loose meshes is several hundred draw
   calls and this is one per part per material.

   Two things make these parts different from every other asset here:
   - They carry REAL TEXTURES (T_Plaster_BaseColor and friends), unlike the castle kit, whose
     pieces are untextured white and have to be tinted by hand. So nothing here is colour-tinted;
     doing that would throw the artwork away.
   - One part is one glTF mesh with SEVERAL primitives (a wall is plaster + wood trim). loadProp
     keeps only the first mesh it finds, which would render half of every wall, so parts get their
     own loader that keeps all of them. */
const VIL_GRID = 2.0;      // wall width / floor tile size, measured off the kit
const VIL_STOREY = 3.0;    // wall height, measured (3.12 with the trim overlap)
/* Game units per kit unit. The hero is 1.75m and stands ~59 units tall (hero3d scale 20, where 26
   measured 76.8), so a metre is ~34 units. Anything else and a house is the wrong size next to the
   character, which is the only scale reference a player actually has.
   VIL_CELL must equal BUILD_CELL in index.html's hub generator — that is the number the collision
   box is sized with, and if the two drift the model no longer fills the box you cannot walk into. */
const VIL_U = 34;
const VIL_CELL = VIL_GRID * VIL_U;    // 68 game units per cell
const VIL_STYLE = {
  plaster: { wall:'Wall_Plaster_Straight', door:'Wall_Plaster_Door_Round',
             win:'Wall_Plaster_Window_Wide_Round', corner:'Corner_Exterior_Wood',
             floor:'Floor_WoodDark' },
  brick:   { wall:'Wall_UnevenBrick_Straight', door:'Wall_UnevenBrick_Door_Round',
             win:'Wall_UnevenBrick_Window_Wide_Round', corner:'Corner_Exterior_Brick',
             floor:'Floor_UnevenBrick' },
};
/* The kit ships a whole MATRIX of gable roofs, not the three sizes slice3d used. That matters: a
   3x2-cell house is 6x4 kit units, and forcing it onto a 4x4 roof meant a 65% stretch across the
   ridge - the tiles smeared and the gable pitch flattened. With the real matrix almost every
   building lands on an exact size and the roof is drawn as it was modelled. */
const VIL_ROOF_SIZES = [[4,4],[4,6],[4,8],[6,4],[6,6],[6,8],[6,10],[6,12],[6,14],
                        [8,8],[8,10],[8,12],[8,14]];
const VIL_ROOFS = VIL_ROOF_SIZES.map(s => 'Roof_RoundTiles_' + s[0] + 'x' + s[1]);
/* Nearest roof by footprint, scored on both axes so a long thin house cannot be handed a square
   roof just because one side happens to match. */
function roofFor(w, d){
  const tw = w * VIL_GRID, td = d * VIL_GRID;
  let best = VIL_ROOF_SIZES[0], bestErr = Infinity;
  for(const s of VIL_ROOF_SIZES){
    const err = Math.abs(s[0] - tw) / tw + Math.abs(s[1] - td) / td;
    if(err < bestErr){ bestErr = err; best = s; }
  }
  return 'Roof_RoundTiles_' + best[0] + 'x' + best[1];
}
/* GABLE ENDS. The RoundTiles roofs are open at both ends - the kit expects a Front piece to close
   them - so without these you look straight through the gable into the roof void and out the other
   side. One per roof width, matched by the roof's own name. */
const VIL_ROOF_FRONTS = { 4:'Roof_Front_Brick4', 6:'Roof_Front_Brick6', 8:'Roof_Front_Brick8' };
const VIL_PARTS = [...new Set([].concat(
  ...Object.values(VIL_STYLE).map(s => Object.values(s)), VIL_ROOFS,
  Object.values(VIL_ROOF_FRONTS), ['Prop_Chimney']))];
const _partCache = new Map();     // name -> { subs:[{geo,mat}], size:Vector3 } or null

/* Load one modular part, keeping EVERY primitive with its own material and baking each into the
   part's own space. Unlike loadProp the origin is left alone: the kit's convention (a wall spans
   x -1..1, base at y=0) is exactly what the assembler's grid arithmetic assumes. */
async function loadPart(name){
  if(_partCache.has(name)) return _partCache.get(name);
  let rec = null;
  try {
    const g = await _loadGLB(PROPS + 'village/' + name + '.gltf');
    g.scene.updateMatrixWorld(true);
    const subs = [];
    const bb = new THREE.Box3();
    g.scene.traverse(o => {
      if(!o.isMesh) return;
      const geo = o.geometry.clone();
      geo.applyMatrix4(o.matrixWorld);
      geo.computeBoundingBox();
      bb.union(geo.boundingBox);
      const src = Array.isArray(o.material) ? o.material[0] : o.material;
      /* Converted to Lambert to match everything else world3d draws. The kit ships PBR standard
         materials, which without an environment map render dark and dead next to the Lambert props
         standing beside them - one lighting model per scene, or the scene reads as two scenes. */
      const m = new THREE.MeshLambertMaterial({
        map: src && src.map ? src.map : null,
        color: src && src.color ? src.color.clone() : new THREE.Color(0xffffff),
        side: src ? src.side : THREE.FrontSide,
        transparent: !!(src && src.transparent), opacity: src ? src.opacity : 1,
      });
      if(m.map) m.map.colorSpace = THREE.SRGBColorSpace;
      subs.push({ geo, mat: m });
    });
    if(!subs.length) throw new Error('no mesh in ' + name);
    rec = { subs, size: bb.getSize(new THREE.Vector3()) };
  } catch(e){
    console.warn('[world3d] village part failed to load:', name, e.message);
  }
  _partCache.set(name, rec);
  return rec;
}

const _loader = new GLTFLoader();
const _loadGLB = url => new Promise((res, rej) => _loader.load(url, res, undefined, rej));

/* Pull the single mesh out of a prop and keep its geometry and material for instancing.
   Geometry is baked into world orientation and moved so its base sits at y=0, because deco
   entries give a BASE height, not a centre. */
async function loadProp(name){
  if(_propCache.has(name)) return _propCache.get(name);
  try {
    /* Try .glb then .gltf. The loader used to hardcode .glb, so Floor_Brick.gltf silently failed,
       buildGround returned 0 tiles, and the hub showed the GAME's own floor instead - which looked
       plausible enough that I reported it as working. A failed asset load must not be able to
       masquerade as a successful render. */
    let g = null;
    try { g = await _loadGLB(PROPS + name + '.glb'); }
    catch(e){ g = await _loadGLB(PROPS + name + '.gltf'); }
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
    /* Width matters as much as height. Scaling purely to match a deco's height blew the wheat up
       into giant yellow pillars: a wheat stalk is w:4 h:24, and the grass model is WIDER than it
       is tall, so matching 24 units of height made it ~36 units across. Fitting to the box
       instead means a prop can never exceed the footprint the level intended. */
    const width = Math.max(0.001, Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z));
    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const rec = { geo, mat, height, width };
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
  const names = Object.values(PROP_SETS).flat();   // includes the ground tile
  await Promise.all([...names.map(loadProp), ...VIL_PARTS.map(loadPart)]);
  _propsReady = true;
}

/* ── BUILDING ASSEMBLER ────────────────────────────────────────────────────────
   Ported from slice3d's makeBuilding: same grid, same door/window rhythm, same roof choice. The
   spec comes from the GAME (a deco entry tagged kind:'building' carries the cell counts), so a
   building can never sit somewhere the collision box does not.

   Emits into `out`, a map of partName -> placements, so several buildings sharing a part all land
   in one InstancedMesh. Positions are LOCAL to the building and centred on its footprint, which is
   what lets the caller rotate about the centre the game gave it. */
function planBuilding(spec, out){
  const w = Math.max(1, spec.w | 0), d = Math.max(1, spec.d | 0);
  const storeys = Math.max(1, spec.storeys | 0);
  const st = VIL_STYLE[spec.style] || VIL_STYLE.plaster;
  const g = VIL_GRID, H = VIL_STOREY;
  const halfW = w * g / 2, halfD = d * g / 2;
  const add = (part, x, y, z, ry, fit) =>
    (out[part] || (out[part] = [])).push({ b: spec, x: x - halfW, y, z: z - halfD, ry, fit });

  /* Perimeter walls, one piece per cell. The door replaces one ground-floor slot on the front and
     windows take alternate slots, so a wall run reads as a frontage rather than a fence. */
  const doorCell = Math.floor(w / 2);
  for(let s = 0; s < storeys; s++){
    const y = s * H;
    for(let i = 0; i < w; i++){
      const cx = i * g + g / 2;
      add((s === 0 && i === doorCell) ? st.door : (i % 2 === 1 ? st.win : st.wall), cx, y, 0, 0);
      add(i % 2 === 0 ? st.win : st.wall, cx, y, d * g, Math.PI);
    }
    for(let j = 0; j < d; j++){
      const cz = j * g + g / 2;
      add(j % 2 === 1 ? st.win : st.wall, 0,     y, cz, -Math.PI / 2);
      add(j % 2 === 0 ? st.win : st.wall, w * g, y, cz,  Math.PI / 2);
    }
    // corner posts hide the seams where two wall runs meet
    add(st.corner, 0,     y, 0,     0);
    add(st.corner, w * g, y, 0,     -Math.PI / 2);
    add(st.corner, 0,     y, d * g, Math.PI / 2);
    add(st.corner, w * g, y, d * g, Math.PI);
  }
  /* GROUND FLOOR ONLY. Upper storeys are never seen - there is no way in - and every extra tile is
     instances spent on geometry inside a sealed box. The ground one stays because the doorway is a
     real opening and you would otherwise look through the house at the plaza behind it. */
  for(let i = 0; i < w; i++) for(let j = 0; j < d; j++)
    add(st.floor, i * g + g / 2, 0, j * g + g / 2, 0);

  /* Roof: the closest gable in the kit, then a small stretch onto the exact footprint plus an
     eaves overhang. Because roofFor almost always finds an exact match that stretch is a few per
     cent, not the 65% the three-size table forced. */
  const roofName = roofFor(w, d);
  const roofFit = { x: w * g + 0.6, z: d * g + 0.6 };
  add(roofName, w * g / 2, storeys * H, d * g / 2, 0, roofFit);
  /* Close BOTH gable ends. The ridge runs along the building's depth, so the triangles face the
     front and back walls - which for a house turned toward the plaza means the open one is the
     first thing you see. The front piece is authored to the same width as the roof it belongs to,
     so it takes the roof's own x fit and nothing else. */
  const front = VIL_ROOF_FRONTS[+(roofName.match(/_(\d+)x/) || [0, 4])[1]];
  if(front){
    const fit = { x: roofFit.x, z: null, useRoof: roofName };
    add(front, w * g / 2, storeys * H, 0,     0,       fit);
    add(front, w * g / 2, storeys * H, d * g, Math.PI, fit);
  }
  add('Prop_Chimney', w * g * 0.25, storeys * H + 0.4, d * g * 0.5, 0);
}

/* Turn the planned placements into instanced geometry. One InstancedMesh per part PER PRIMITIVE:
   a plaster wall is two primitives (plaster + wood trim) with different materials, and merging
   them would paint the trim in plaster. */
function buildBuildings(specs){
  if(!specs.length) return { buildings: 0, pieces: 0, meshes: 0, missing: 0 };
  const out = {};
  for(const sp of specs) planBuilding(sp, out);
  const o = new THREE.Object3D();
  let pieces = 0, meshes = 0, missing = 0;
  for(const name of Object.keys(out)){
    const list = out[name], rec = _partCache.get(name);
    if(!rec){ missing += list.length; continue; }
    pieces += list.length;
    for(const sub of rec.subs){
      const m = new THREE.InstancedMesh(sub.geo, sub.mat, list.length);
      for(let i = 0; i < list.length; i++){
        const pl = list[i], b = pl.b;
        const c = Math.cos(b.ry || 0), s = Math.sin(b.ry || 0);
        /* Rotate the local offset by the BUILDING's yaw, then scale into game units. The part's own
           yaw is added on top: the offset and the piece turn together, so a rotated house keeps its
           door on the face that was pointing at the plaza. */
        o.position.set(b.x + (pl.x * c + pl.z * s) * VIL_U,
                       (b.y || 0) + pl.y * VIL_U,
                       b.z + (-pl.x * s + pl.z * c) * VIL_U);
        o.rotation.set(0, (b.ry || 0) + (pl.ry || 0), 0);
        /* Only the roof is fitted; everything else is uniform, because a stretched wall stretches
           its plaster texture with it and the mortar lines stop lining up between neighbours.
           `useRoof` means "take the ROOF's stretch, not your own": a gable end is authored narrower
           than the roof bounding box it caps (6.69 against 8.25, the difference being the eaves
           overhang), so fitting it to the footprint itself would leave it too wide by that gap. */
        const fitRec = pl.fit && pl.fit.useRoof ? _partCache.get(pl.fit.useRoof) : rec;
        const src = fitRec || rec;
        const fx = pl.fit && pl.fit.x != null && src.size.x > 1e-4 ? pl.fit.x / src.size.x : 1;
        const fz = pl.fit && pl.fit.z != null && src.size.z > 1e-4 ? pl.fit.z / src.size.z : 1;
        /* A fitted part takes its x fit on the Y axis too. Squeezing a roof across the ridge while
           leaving its height alone does not just look off, it changes the PITCH - the 6x4 gable
           narrowed to 80% stood 25% steeper than the kit modelled it, and a 1-storey cottage ended
           up with a roof half again as tall as its walls. Scaling both together keeps the angle. */
        o.scale.set(VIL_U * fx, VIL_U * (pl.fit ? fx : 1), VIL_U * fz);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
      m.frustumCulled = false;
      group.add(m); meshes++;
    }
  }
  return { buildings: specs.length, pieces, meshes, missing };
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
    if(d.kind === 'flower') return d.lead === false ? 'skip' : 'flower';
    if(d.kind === 'skipflower') return 'skip';   // stem/leaf boxes the real flower model replaces
    /* A building's lead box carries the modular spec; the second box is only the voxel path's roof
       cap, and letting it through would stack a whole second house on the first one's roof. */
    if(d.kind === 'building') return d.lead === false ? 'skip' : 'building';
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
  /* Stacked props first: a tall thin structure (a rampart divider is 150 tall but 20 wide)
     cannot be one scaled model without becoming stubby. Stacking segments keeps the model at its
     correct thickness and repeats it up to the required height. */
  const stackCount = d => {
    if(!d.stack) return 1;
    return Math.max(1, Math.round((d.h || defaultH) / Math.max(1, (d.w || defaultH))));
  };
  recs.forEach((rec, i) => {
    const list = buckets[i];
    if(!list.length) return;
    let total = 0;
    for(const d of list) total += stackCount(d);
    /* The prop's own texture carries its colour, so instanceColor is NOT set here - tinting a
       textured model by the deco's flat colour would throw away the artwork. */
    const m = new THREE.InstancedMesh(rec.geo, rec.mat, total);
    const o = new THREE.Object3D();
    let k = 0;
    for(const d of list){
      const r = hash(d.x, d.z);
      const n = stackCount(d);
      const wantH = heightOf ? heightOf(d) : (d.h || defaultH);
      const wantW = d.w || wantH;
      /* Fit inside the deco's box: whichever of height or width binds first wins, so a prop is
         never wider or taller than the space the generator allotted it. For a stack, each segment
         gets its share of the height. */
      const segH = wantH / n;
      const sc = Math.min(segH / rec.height, wantW / rec.width);
      for(let sIdx = 0; sIdx < n; sIdx++){
        o.position.set(d.x, (d.y0 || 0) + sIdx * rec.height * sc, d.z);
        o.rotation.set(0, (n > 1 ? sIdx * 1.5708 : r * 6.283), 0);
        o.scale.set(sc, sc, sc);
        o.updateMatrix();
        m.setMatrixAt(k++, o.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    m.frustumCulled = false;
    group.add(m);
  });
}


/* ── GROUND ────────────────────────────────────────────────────────────────────
   The floor is drawn from G.segments, a separate pass from G.deco: each segment is a flat slab
   filled with the zone's ground colour. That is why the meadow stayed a flat plane while
   everything standing on it became 3D.

   ground_grass is a 1x1 single-mesh tile, so a segment becomes a grid of instances. The game's
   own slab is deliberately LEFT drawing underneath: it provides the island's thickness, dark
   underside and hazard-lit rim, which together give the floating-course silhouette. Replacing it
   outright would have meant rebuilding all of that. These tiles only cover its top face, sitting
   just above it so nothing z-fights.

   Each tile takes a random quarter-turn so a large field does not read as one stamped pattern. */
/* Tile size is per SURFACE, not global. A 1-unit grass tile stretched across ~3m still reads as
   grass, because grass is organic and repeating. Brick does not: stretched 3x its mortar lines
   wash out and a plaza renders as flat white, which is exactly what the first two attempts at a
   stone hub floor produced. Architectural tiles are laid near their true size (~1m = 26 game
   units, from the mob-scale calibration) so the pattern stays legible. */
const FLOOR_TILE_GRASS = 78;
const FLOOR_TILE_STONE = 28;

function buildGround(world){
  const segs = (world && world.segments) || [];
  if(!segs.length) return 0;
  /* Floor material follows the ZONE, not one global choice. Laying grass across the Waystation
     turned a stone plaza into a lawn - the hub is paved, and the meadow is not. Zones without a
     natural grass floor get the path/stone tile instead. */
  const zone = (world && world.zone) || 'hub';
  /* world.hub is the game's own G.hub flag. An earlier guess inferred the hub from deco count and
     zone id and got it wrong: the Waystation REPORTS its zone as 'outskirts', so the heuristic
     laid grass across a stone plaza. Ask the game what it is rather than inferring it. */
  const isHub = !!(world && world.hub);
  const grassy = !isHub && (zone === 'outskirts' || zone === 'forest' || zone === 'plains');
  /* Paving from the village kit, not ground_pathTile: the path tile is a dirt patch drawn ON
     grass, so using it for a plaza produced sandy blobs floating on a green field.
     Read from PROP_SETS rather than naming the file twice - having the loaded set and the
     requested name drift apart silently produced a hub with zero floor tiles. */
  /* The hub floor took five attempts. ground_pathTile is a dirt patch drawn ON grass (sandy blobs
     floating on green); Floor_Brick and Floor_UnevenBrick are pale INTERIOR floors that render as
     a featureless white expanse outdoors at any tile scale. castle/ground from the Castle Kit is
     an actual OUTDOOR ground tile - same 1x0x1 flat shape as the grass tile, built to be seen
     from above in daylight. That distinction, indoor-floor versus outdoor-ground, is what the
     earlier attempts kept missing. */
  /* NO 3D floor in the hub. Because the 3D layer draws over the voxel world with depth cleared,
     a floor-sized 3D surface hides every voxel prop standing on it - the Waystation's centrepiece
     monument disappeared entirely. The voxel plaza floor is also warmer and more characterful than
     anything achieved with these flat-coloured tiles across five attempts. Grassy zones keep their
     tiles because those zones have no voxel centrepiece to lose. */
  if(isHub) return 0;
  const want = grassy ? 'nature/ground_grass' : PROP_SETS.floorStone[0];
  const rec = _propCache.get(want);
  if(!rec){ console.warn('[world3d] floor tile missing, ground left to the voxel pass:', want); return 0; }
  const TILE = grassy ? FLOOR_TILE_GRASS : FLOOR_TILE_STONE;
  const cells = [];
  for(const sg of segs){
    if(sg.nofloor) continue;    // the game skips these too: coplanar sub-segments kept for collision
    const w = sg.w || 0, d = sg.d || 0;
    if(w < 8 || d < 8) continue;
    /* Ceil, not round: rounding down on a segment slightly narrower than a whole tile leaves an
       uncovered strip at its edge. Over-covering is invisible, under-covering is a visible gap. */
    const nx = Math.max(1, Math.ceil(w / TILE));
    const nz = Math.max(1, Math.ceil(d / TILE));
    const tw = w / nx, td = d / nz;
    for(let ix = 0; ix < nx; ix++){
      for(let iz = 0; iz < nz; iz++){
        cells.push({ x: sg.x - w/2 + (ix + 0.5) * tw,
                     z: sg.z - d/2 + (iz + 0.5) * td,
                     w: tw, d: td });
      }
    }
  }
  if(!cells.length) return 0;
  /* These Kenney tiles carry their colour in the MATERIAL COLOUR, not a texture - probing them
     showed map=NONE on all of them. ground_grass only looks like grass because its material colour
     is #73eddd; castle/ground and the village floors are #ffffff, i.e. plain white geometry, which
     is why five different "stone" tiles all rendered as a featureless white expanse. Nothing was
     wrong with the tiling, the scale, or the asset choice.
     So the floor is coloured here, from the zone's own ground colour, and only lightened enough to
     read as a lit surface. Using the game's colour keeps the hub the warm stone it always was. */
  const mat = rec.mat.clone();
  const base = new THREE.Color((world && world.ground) || '#8a8445');
  /* GRASS was the one floor still wearing the MODEL's own colour, and that colour is #73eddd - an
     aqua. Every grassy zone was therefore a cyan field, which read as "stylised" in a screenshot
     and is simply wrong: the game's own slab underneath is olive (#8a8445 in the Outskirts). The
     stone path has been taking the zone's colour for some time; grass never was, because the note
     that discovered map=NONE recorded it as the reason the tile "looks like grass" rather than as
     the reason it does not.

     Two tones, not one. A single flat colour over 2149 tiles is a bedsheet, and the ask was for a
     field that is not one uniform green. The patch tone is chosen on a COARSE grid (~4 tiles) so
     the meadow breaks into drifts rather than salt-and-pepper noise, which at this tile size would
     just read as dither. Deterministic, so the same field never reshuffles between visits. */
  const grassTint = grassy;
  if(grassTint){
    mat.color = new THREE.Color('#ffffff');    // the per-tile instanceColor carries it instead
  } else {
    mat.color = base.clone().lerp(new THREE.Color('#ffffff'), 0.18);
  }
  const m = new THREE.InstancedMesh(rec.geo, mat, cells.length);
  let tint = null, lit = null, dark = null;
  if(grassTint){
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cells.length * 3), 3);
    tint = new THREE.Color();
    /* The zone's own ground colour sets the KEY, not the whole answer. Used neat it produced a
       drab olive-grey field, because those values are the slab's base tone and world3d then runs
       outdoor zones at 0.42 ambient - a mid-luminance colour under a dim key is mud. Pulling it
       toward a lit grass green keeps each zone distinguishable (the Outskirts stay khaki-leaning,
       the forest stays darker) while giving the surface enough light to read as ground you are
       standing on. */
    const GRASS = new THREE.Color('#79a84e');
    const key = base.clone().lerp(GRASS, 0.55);
    lit  = key.clone().lerp(new THREE.Color('#ffffff'), 0.20);    // sun-bleached drift
    dark = key.clone().lerp(new THREE.Color('#000000'), 0.10);    // shaded drift
  }
  const o = new THREE.Object3D();
  const PATCH = TILE * 4;                       // drift size: a few tiles across, not one
  for(let i = 0; i < cells.length; i++){
    const c = cells[i], r = hash(c.x, c.z);
    if(grassTint){
      const p = hash(Math.floor(c.x / PATCH) * 7.3, Math.floor(c.z / PATCH) * 3.1);
      tint.copy(p < 0.5 ? dark : lit).lerp(p < 0.5 ? lit : dark, Math.abs(p - 0.5));
      m.instanceColor.setXYZ(i, tint.r, tint.g, tint.b);
    }
    const quarter = (r * 4) | 0;
    o.position.set(c.x, 1.45, c.z);          // just above the game's lit top edge (tops out at 1.3)
    o.rotation.set(0, quarter * Math.PI / 2, 0);
    /* Scale must account for the rotation. A quarter-turn maps local X onto world Z, so on an odd
       quarter the axes swap - scaling by (w, d) then rotating 90 degrees leaves the tile d wide
       where w was needed, and the gaps show up as regular bright stripes of the slab underneath.
       That was the first attempt's failure, and it looked like z-fighting rather than a sizing
       error, which is what made it hard to place. */
    const sx = (quarter & 1) ? c.d : c.w;
    const sz = (quarter & 1) ? c.w : c.d;
    o.scale.set(sx / rec.width, 1, sz / rec.width);
    o.updateMatrix();
    m.setMatrixAt(i, o.matrix);
  }
  m.instanceMatrix.needsUpdate = true;
  if(m.instanceColor) m.instanceColor.needsUpdate = true;
  m.frustumCulled = false;
  m.renderOrder = -1;                        // draw before the props standing on it
  group.add(m);
  return cells.length;
}


/* ── HUB ───────────────────────────────────────────────────────────────────────
   A purpose-built Waystation rather than a translation of the old one's boxes.

   Oliver is explicitly not attached to the old layout ("they've mostly just been functional"),
   and cares most about the game MECHANICS reading clearly. So this is built for legibility: a
   walled courtyard, a real gatehouse at every portal so the eight destinations are unmistakable,
   towers marking the corners, and an open plaza to gather in.

   Built AROUND the game's own anchors - gate positions come from G.gates, never from constants
   here - so the architecture can never drift out of sync with where the portals actually are.
   Move a gate in the game and its gatehouse follows. */
const HUB_UNIT = 96;          // game units per wall segment (~3.4m); a whole number of these tiles a wall

/* The Castle Kit pieces carry NO texture - material colour only, and that colour is #ffffff, so
   an unpainted hub renders as a white cardboard model. Same trap the floor tiles set five times.
   Every piece therefore gets an explicit colour here. */
function hubPiece(setName, cells, place, colour){
  const rec = _propCache.get(PROP_SETS[setName][0]);
  if(!rec || !cells.length) return 0;
  const mat = rec.mat.clone();
  if(colour) mat.color = new THREE.Color(colour);
  const m = new THREE.InstancedMesh(rec.geo, mat, cells.length);
  const o = new THREE.Object3D();
  for(let i = 0; i < cells.length; i++){
    place(o, cells[i], rec, i);
    o.updateMatrix();
    m.setMatrixAt(i, o.matrix);
  }
  m.instanceMatrix.needsUpdate = true;
  m.frustumCulled = false;
  group.add(m);
  return cells.length;
}

/* Read the hub's building specs off the game's own deco. buildHub otherwise ignores deco entirely
   and derives everything from G.gates, but a building has to agree with a collision box, and the
   only place that pairing can be authored honestly is next to the box itself. */
function hubBuildingSpecs(world){
  const out = [];
  for(const d of (world.deco || [])){
    if(!d || d.kind !== 'building' || d.lead === false) continue;
    out.push({ x: d.x, y: (d.y0 || 0) + 1.5, z: d.z, w: d.bw | 0, d: d.bd | 0,
               storeys: d.storeys | 0, style: d.style, ry: d.ry || 0 });
  }
  return out;
}

function buildHub(scene, world){
  const gates = (world.gates || []).filter(g => !g.side);
  if(!gates.length) return null;

  const gx = gates.map(g => g.x);
  const westX = Math.min(...gx) - 190, eastX = Math.max(...gx) + 190;
  const northZ = Math.min(...gates.map(g => g.z)) - 40;   // the rampart line, just behind the gates
  const southZ = northZ + 1180;                            // courtyard depth

  const wallH = 150;                                       // matches the old rampart height
  const counts = {};

  /* NORTH RAMPART, with a gatehouse at every portal. Gate openings are skipped from the plain
     wall run so a doorway piece can sit exactly on the portal - that is what makes each
     destination read as a real entrance instead of a hole in a fence. */
  const gateHalf = 92;
  const wallCells = [], gateCells = [];
  for(let x = westX; x < eastX; x += HUB_UNIT){
    const cx = x + HUB_UNIT / 2;
    const onGate = gates.find(g => Math.abs(g.x - cx) < gateHalf);
    if(onGate) continue;
    wallCells.push({ x: cx, z: northZ, rot: 0 });
  }
  for(const g of gates) gateCells.push({ x: g.x, z: northZ, rot: 0 });

  /* SIDE WALLS running south, closing the courtyard so it feels like a place rather than a
     clearing. Left open at the south end - that is where the player spawns and walks in. */
  for(let z = northZ + HUB_UNIT; z < southZ - HUB_UNIT * 2; z += HUB_UNIT){
    wallCells.push({ x: westX, z, rot: Math.PI / 2 });
    wallCells.push({ x: eastX, z, rot: Math.PI / 2 });
  }

  counts.wall = hubPiece('hubWall', wallCells, (o, c, rec) => {
    const s = HUB_UNIT / rec.width;
    o.position.set(c.x, 0, c.z);
    o.rotation.set(0, c.rot, 0);
    o.scale.set(s, wallH / rec.height, s);
  }, '#c2b08c');
  counts.gatehouse = hubPiece('hubGate', gateCells, (o, c, rec) => {
    const s = (gateHalf * 2) / rec.width;
    o.position.set(c.x, 0, c.z);
    o.rotation.set(0, 0, 0);
    o.scale.set(s, wallH / rec.height, s);
  }, '#a89478');

  /* CORNER TOWERS plus one between each pair of gates, so the rampart has rhythm and the corners
     of the courtyard are legible from the middle of the plaza. */
  const towerCells = [{ x: westX, z: northZ }, { x: eastX, z: northZ }];
  for(let i = 0; i < gates.length - 1; i++)
    towerCells.push({ x: (gates[i].x + gates[i + 1].x) / 2, z: northZ });

  const tw = 150;
  counts.tower = hubPiece('hubTower', towerCells, (o, c, rec) => {
    const s = tw / rec.width;
    o.position.set(c.x, 0, c.z);
    o.rotation.set(0, 0, 0);
    o.scale.set(s, s, s);
  }, '#c2b08c');
  counts.towerMid = hubPiece('hubTowerM', towerCells, (o, c, rec) => {
    const s = tw / rec.width;
    o.position.set(c.x, tw * 0.95, c.z);
    o.rotation.set(0, 0, 0);
    o.scale.set(s, s, s);
  }, '#b8a582');
  counts.roof = hubPiece('hubRoof', towerCells, (o, c, rec) => {
    const s = tw / rec.width;
    o.position.set(c.x, tw * 1.9, c.z);
    o.rotation.set(0, 0, 0);
    o.scale.set(s, s, s);
  }, '#8e3b32');
  counts.flag = hubPiece('hubFlag', towerCells, (o, c, rec) => {
    const s = tw * 0.7 / rec.width;
    o.position.set(c.x, tw * 2.5, c.z);
    o.rotation.set(0, 0, 0);
    o.scale.set(s, s, s);
  }, '#d9a441');

  /* PAVED COURTYARD. Coloured warm from the zone's own ground colour - the tiles carry no
     texture, only a material colour, which is what five earlier attempts kept missing. */
  const paveCells = [];
  for(let x = westX; x <= eastX; x += HUB_UNIT)
    for(let z = northZ; z <= southZ; z += HUB_UNIT)
      paveCells.push({ x: x + HUB_UNIT / 2, z: z + HUB_UNIT / 2 });
  const paveRec = _propCache.get(PROP_SETS.hubPave[0]);
  if(paveRec && paveCells.length){
    const pm = paveRec.mat.clone();
    /* Explicit warm stone. Deriving this from the zone ground colour gave an olive courtyard -
       that colour is meant for open terrain, not a paved plaza. */
    pm.color = new THREE.Color('#c9b998');
    const m = new THREE.InstancedMesh(paveRec.geo, pm, paveCells.length);
    const o = new THREE.Object3D();
    for(let i = 0; i < paveCells.length; i++){
      const c = paveCells[i], s = HUB_UNIT / paveRec.width;
      o.position.set(c.x, 1.2, c.z);
      o.rotation.set(0, ((hash(c.x, c.z) * 4) | 0) * Math.PI / 2, 0);
      o.scale.set(s, 1, s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    m.frustumCulled = false;
    m.renderOrder = -1;
    group.add(m);
    counts.pave = paveCells.length;
  }

  /* PLAZA DRESSING. Placed relative to the courtyard's own bounds rather than fixed coordinates,
     so it follows if the gates ever move.
     Deliberately kept OFF the centre line: spawn is to the south and the portals to the north, so
     the walking route between them stays clear. Clutter in a doorway is worse than empty space. */
  const midX = (westX + eastX) / 2, midZ = northZ + 560;
  const laneHalf = 190;                       // keep this corridor clear, spawn -> gates

  /* Lanterns down both sides of the approach - they line the route to the portals, which is the
     one piece of wayfinding a new player needs. */
  const lanterns = [];
  for(let z = northZ + 210; z < southZ - 120; z += 210){
    lanterns.push({ x: midX - laneHalf, z });
    lanterns.push({ x: midX + laneHalf, z });
  }
  counts.lantern = hubPiece('hubLantern', lanterns, (o, c, rec) => {
    /* Sized by HEIGHT and left upright. The town kit's 'lantern' is a WALL fitting, authored
       projecting sideways, so it rendered as a row of fallen posts across the plaza. */
    const sc = 92 / rec.height;
    o.position.set(c.x, 1.4, c.z); o.rotation.set(0, c.x < midX ? 0 : Math.PI, 0);
    o.scale.set(sc, sc, sc);
  }, '#6b5636');

  /* A market row along each side wall: carts, stalls and hedges, well clear of the lane. */
  const carts = [], stalls = [], hedges = [];
  for(let i = 0; i < 5; i++){
    const z = northZ + 300 + i * 190;
    carts.push({ x: westX + 150, z, rot: 1.5708 });
    stalls.push({ x: eastX - 150, z, rot: -1.5708 });
    if(i % 2 === 0){ hedges.push({ x: westX + 300, z: z + 90, rot: 0 });
                     hedges.push({ x: eastX - 300, z: z + 90, rot: 0 }); }
  }
  counts.cart = hubPiece('hubCart', carts, (o, c, rec) => {
    const sc = 105 / rec.width;
    o.position.set(c.x, 1.4, c.z); o.rotation.set(0, c.rot, 0); o.scale.set(sc, sc, sc);
  }, '#8a6438');
  counts.stall = hubPiece('hubStall', stalls, (o, c, rec) => {
    const sc = 105 / rec.width;
    o.position.set(c.x, 1.4, c.z); o.rotation.set(0, c.rot, 0); o.scale.set(sc, sc, sc);
  }, '#9a7a4a');
  counts.hedge = hubPiece('hubHedge', hedges, (o, c, rec) => {
    const sc = 96 / rec.width;
    o.position.set(c.x, 1.4, c.z); o.rotation.set(0, c.rot, 0); o.scale.set(sc, sc, sc);
  }, '#4d7f3c');

  /* No fountain. town/fountain-round is a RIM piece meant to cap a stack of other fountain parts,
     so on its own it rendered as a grey bowl floating in mid-air. Assembling a real fountain from
     centre/edge/corner pieces is worth doing, but a floating bowl is worse than nothing, so it is
     left out until it can be built properly. */

  /* CENTREPIECE. A courtyard with nothing in the middle reads as an empty lot; a monument gives
     the plaza a focus to gather around and orient by, which is the point of a social hub. Placed
     on the courtyard's centre line, forward of the gates so it never blocks a portal. */
  /* Well clear of the gate approach. At +430 it sat right on the walking line between spawn and
     the portals - the camera ended up inside it. Note it is VISUAL ONLY: world3d adds no
     collision, so the player walks through it. Collision still comes from the game's own G.walls,
     which is why this rebuild deliberately keeps the original gate positions and puts the rampart
     just behind them rather than moving anything the physics depends on. */
  const cx = (westX + eastX) / 2, cz = northZ + 620;
  const mono = [{ x: cx, z: cz }];
  const mh = 210;
  counts.monument = hubPiece('hubTower', mono, (o, c, rec) => {
    const sc = mh * 0.62 / rec.width;
    o.position.set(c.x, 0, c.z); o.rotation.set(0, 0.785, 0); o.scale.set(sc, sc, sc);
  }, '#b9a887');
  hubPiece('hubTowerM', mono, (o, c, rec) => {
    const sc = mh * 0.62 / rec.width;
    o.position.set(c.x, mh * 0.59, c.z); o.rotation.set(0, 0.785, 0); o.scale.set(sc, sc, sc);
  }, '#c2b08c');
  hubPiece('hubRoof', mono, (o, c, rec) => {
    const sc = mh * 0.62 / rec.width;
    o.position.set(c.x, mh * 1.18, c.z); o.rotation.set(0, 0.785, 0); o.scale.set(sc, sc, sc);
  }, '#8e3b32');
  hubPiece('hubFlag', mono, (o, c, rec) => {
    const sc = mh * 0.5 / rec.width;
    o.position.set(c.x, mh * 1.55, c.z); o.rotation.set(0, 0, 0); o.scale.set(sc, sc, sc);
  }, '#d9a441');

  /* BUILDINGS. The one thing in the courtyard with a real footprint you cannot walk through, so
     these are the pieces that turn an open plaza into a place. */
  const bc = buildBuildings(hubBuildingSpecs(world));
  counts.buildings = bc.buildings; counts.buildingPieces = bc.pieces;
  counts.buildingMeshes = bc.meshes; counts.buildingMissing = bc.missing;

  return counts;
}

export function buildWorld(scene, world){
  /* THE HUB KEEPS ITS VOXEL ART, for now, and this is a deliberate call rather than a gap.

     The Waystation is hand-authored: a 228-line drawWaystation() plus 157 deco boxes, and its
     centrepiece monument is bespoke voxel art that is not in the deco list at all. Because the 3D
     layer draws over the voxel world with depth cleared, ANY ground-level 3D surface hides the
     voxel props standing on it - first the floor tiles, then the 86 flat paving boxes, each time
     erasing the monument. Converting only the boxes also loses the warmth and colour the
     hand-drawn version has.

     Half-converted is the one genuinely bad state, so the hub stays fully voxel until it can be
     rebuilt properly from the village and castle kits. The hero and mobs still render in 3D over
     it, which is the part that reads well. */
  if(world && world.hub){
    clearWorld(scene);
    group = new THREE.Group(); group.name = 'world3d-hub'; scene.add(group);
    /* The hub is enclosed and torch-lit, not an open meadow; the dim outdoor setting left it
       muddy. */
    scene.traverse(o => {
      if(!o.isLight) return;
      if(o.userData._w3dOrig == null) o.userData._w3dOrig = o.intensity;
      o.intensity = o.userData._w3dOrig * (o.isDirectionalLight ? 1.05 : 0.92);
    });
    const c = buildHub(scene, world) || {};
    WORLD3D.counts = Object.assign({ hub: true }, c);
    WORLD3D.ready = true;
    return WORLD3D.counts;
  }
  const deco = (world && world.deco) || [];
  clearWorld(scene);
  group = new THREE.Group();
  group.name = 'world3d';
  scene.add(group);

  /* Every value classify() can return needs a bin here. Adding a 'flower' classification without
     adding its bin threw "Cannot read properties of undefined" and world3d disabled itself - the
     fallback did its job, but the crash was avoidable. */
  const bins = { box: [], foliage: [], tree: [], shard: [], rock: [],
                 fence: [], grave: [], pillar: [], flower: [], building: [], skip: [] };
  for(const d of deco){
    if(!d || d.w == null) continue;
    bins[classify(d)].push(d);
  }

  const floorTiles = buildGround(world);

  /* Structure: strata bands, floors, platforms, walls. Rendered as real lit boxes rather than
     the flat unlit colour the voxel path uses — same silhouette, but it now takes light, which
     is most of what makes a scene read as 3D. */
  buildCategory(scene, bins.box, boxGeo(), mat(), (o, d) => {
    o.position.set(d.x, d.y0 || 0, d.z);
    o.rotation.set(0, 0, 0);
    o.scale.set(d.w, Math.max(1, d.h || 1), d.d || d.w);
  });

  /* Ground foliage, now real grass and flower models rather than the procedural cones this used
     to draw. Split by the entry's OWN colour: the meadow generator emits wheat stalks and grass
     with different tints, so the yellow ones become tall grass and the green ones a mix of grass,
     bushes and the occasional flower. Reading the colour keeps this honest to what the level
     actually placed instead of scattering decoration at random. */
  const grassBin = [], bushBin = [], flowerBin = [];
  for(const d of bins.foliage){
    const r = hash(d.x * 3.1, d.z * 1.7);
    const c = new THREE.Color(d.c || '#7a9a4a');
    const yellowish = c.r > c.b * 1.5 && c.g > c.b;      // wheat/straw rather than leaf green
    if(yellowish){ grassBin.push(d); continue; }
    if(r < 0.10) flowerBin.push(d);
    else if(r < 0.22) bushBin.push(d);
    else grassBin.push(d);
  }
  buildProps(grassBin,  PROP_SETS.grass,  22);
  buildProps(bushBin,   PROP_SETS.bush,   26);
  buildProps(flowerBin, PROP_SETS.flower, 18);
  const tufts = grassBin.length + bushBin.length + flowerBin.length;

  /* Trees and rocks: the real models. Scale is deco height divided by the model's own height,
     so a tree ends up exactly as tall as the level says it should be rather than a guessed size. */
  /* A tree's real height is its trunk plus canopy. The lead deco carries trunkH; using the
     canopy box height alone would place a pine a third of its proper size. */
  buildProps(bins.tree, PROP_SETS.tree, 90, d => (d.trunkH || 0) + (d.h || 40) + 30);
  buildProps(bins.rock, PROP_SETS.rock, 20);
  buildProps(bins.fence, PROP_SETS.fence, 30);
  buildProps(bins.grave, PROP_SETS.grave, 30);
  buildProps(bins.pillar, PROP_SETS.pillar, 80);
  buildProps(bins.flower, PROP_SETS.flower, 18);
  /* Buildings work in any zone, not just the hub - a zone generator only has to tag a deco box the
     way the Waystation does. Nothing outside the hub emits them yet. */
  const zoneBuild = buildBuildings(bins.building.map(d => ({
    x: d.x, y: (d.y0 || 0) + 1.5, z: d.z, w: d.bw | 0, d: d.bd | 0,
    storeys: d.storeys | 0, style: d.style, ry: d.ry || 0 })));

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
  /* Light level follows the zone. The single dim setting was tuned for an open meadow and left
     the Waystation's props dark, muddy blobs against its warm voxel floor - the flowers read as
     black lumps. The hub is an enclosed, torch-lit space and needs close to full intensity. */
  const dim = (world && world.hub) ? 0.92 : 0.42;
  const dimDir = (world && world.hub) ? 1.05 : 0.62;
  scene.traverse(o => {
    if(!o.isLight) return;
    if(o.userData._w3dOrig == null) o.userData._w3dOrig = o.intensity;
    const k = o.isAmbientLight ? dim : o.isDirectionalLight ? dimDir : dim;
    o.intensity = o.userData._w3dOrig * k;
  });

  WORLD3D.counts = { floorTiles, deco: deco.length, box: bins.box.length, foliage: bins.foliage.length,
                     tufts: tufts, tree: bins.tree.length, shard: bins.shard.length,
                     rock: bins.rock.length, fence: bins.fence.length, grave: bins.grave.length,
                     pillar: bins.pillar.length, flowerProps: bins.flower.length,
                     buildings: zoneBuild.buildings, skipped: bins.skip.length,
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
    clearMobs();          // a new level must not inherit the previous zone's pooled creatures
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
/* Measured size of every loaded village part, so a build can be checked against the kit's REAL
   dimensions instead of against what a filename implies. The roof matrix was picked off the names
   alone once and produced a 65%-stretched gable that looked deliberate in a screenshot. */
window.__world3dParts = () => Object.fromEntries([..._partCache].map(([k, v]) =>
  [k, v ? { size: [+v.size.x.toFixed(2), +v.size.y.toFixed(2), +v.size.z.toFixed(2)], subs: v.subs.length } : null]));
