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
import { clearProps } from './prop3d.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { loadModelAnyExt } from './loadmodel.js';

export const WORLD3D = {
  /* ON by default, same reasoning as HERO3D. A build fault sets this back to false and logs, so
     the worst case is the zone rendering exactly as it did before the 3D layer existed. */
  on: true,
  ready: false,
  built: null,        // signature of the level currently built, so rebuilds only happen on change
  counts: {},
  err: null,
};

/* `?world3d=0` goes back to the voxel world. Reads both ways so the two renderers can still be
   compared on a phone without a console. */
try {
  const q = new URLSearchParams(location.search);
  if(q.has('world3d')) WORLD3D.on = (q.get('world3d') === '1' || q.get('world3d') === 'true');
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
  /* Every surface THEME_GROUND can ask for, so they are all preloaded (line ~237 flattens this
     whole object into the load list). castle/ground is kept only because other code may still
     reference the old set name; the zone floor no longer uses it - it is a grass tile. */
  /* Floor_RedBrick is here because it is what the stone themes lay their ROADS in, and a surface
     THEME_GROUND names but PROP_SETS does not list is simply never loaded: the road cells then
     find no model, fall through to the ordinary floor, and the zone reports a road it did not
     draw. That is exactly what happened the first time - `roadPaved` came back 0 with 47 tiles
     planned, and nothing anywhere logged a complaint. */
  floorStone: ['village/Floor_Brick', 'village/Floor_UnevenBrick', 'village/Floor_RedBrick',
               'castle/ground'],
  /* Hub architecture. Kept to a handful of pieces on purpose: Oliver's steer is that the
     MECHANICS matter most, so the hub needs to be charming and READABLE - you should see at a
     glance where the portals are and where things happen - not an architectural showpiece. */
  hubWall:   ['castle/wall'],
  hubGate:   ['castle/wall-doorway'],
  hubTower:  ['castle/tower-square-base'],
  hubTowerM: ['castle/tower-square-mid-windows'],
  hubRoof:   ['castle/tower-square-top-roof'],
  hubFlag:   ['castle/flag'],
  /* Real cobblestone, not castle/ground. castle/ground is the Castle Kit's GRASS tile; it only
     ever looked like neutral stone because its colormap 404'd, so the warm tint below was
     multiplying against plain white. With the texture restored it is unmistakably a lawn.
     Floor_UnevenBrick was rejected by an earlier pass as "a featureless white expanse" - same
     cause, same 404 - and is in fact a painted cobble the courtyard was always asking for. */
  hubPave:   ['village/Floor_UnevenBrick'],
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
  /* THE SMITH'S ANVIL — the first of drawWaystation's FURNITURE to get a model, and the least
     invented cast in the file after the mimic: the game's own source comment calls the voxel one
     "BIGGER anvil on a stump" and the Quaternius prop kit ships an anvil on a stump under exactly
     that name. Anvil_Log, not Anvil: the bare one would leave the hub's stump drawn twice. */
  hubAnvil:    ['qprops/Anvil_Log'],
  flower: ['nature/flower_purpleA', 'nature/flower_redA', 'nature/flower_yellowA',
           'nature/flower_purpleB', 'nature/flower_redB', 'nature/flower_yellowB'],
  rock:   ['nature/rock_largeA', 'nature/rock_largeB', 'nature/rock_largeC', 'nature/rock_tallA',
           'nature/rock_tallB', 'nature/rock_smallA', 'nature/rock_smallB', 'nature/rock_smallFlatA'],
  fence:  ['props/iron-fence', 'props/iron-fence-damaged'],
  grave:  ['props/gravestone-cross', 'props/gravestone-round', 'props/gravestone-decorative',
           'props/gravestone-broken'],
  pillar: ['props/pillar-square', 'props/pillar-large', 'props/pillar-obelisk'],
  /* COLONNADE COLUMNS - ONE model, and the two omissions are the whole point of the set existing.
     `pillar` splits its bin across all three variants, which is right for the hub's rampart
     dividers (its only other user) and wrong for a row: a colonnade is a repeated column, and
     variety in it reads as damage. Both rejects were rendered before being dropped.
     pillar-obelisk is a monument with a POINTED top and stood in the processional row like a spire
     somebody left in the aisle (b7-colonnade-3d.png). pillar-large is TERRACOTTA with a ball
     capital - that is the kit's own artwork, not a missing texture - and three of them among five
     grey ones read as a half-repainted arcade in a level whose own script line is "white marble,
     untouched" (b7-colonnade-fix.png). pillar-square is pale stone and repeats cleanly. */
  column: ['props/pillar-square'],
  /* The same lightpost the hub lines its approach with, reused for the roadside lanterns a zone
     generator tags. One model, already in the load list, so a zone that has lanterns costs no
     extra download. */
  lantern: ['props/lightpost-single'],
  /* STANDING STONES. Separate from `rock` because the fit differs, not because the models do: a
     henge stone's deco box is 24 wide and 75-99 tall, a thin CORE, so the ordinary rock fit (the
     narrower of height and width) would stand a 24-unit boulder where the level asked for a
     megalith. Only the tall variants, and only ever fitted by height. */
  standstone: ['nature/rock_tallA', 'nature/rock_tallB', 'nature/rock_tallC'],
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
const VIL_ROOFS = ['Roof_RoundTiles_4x4', 'Roof_RoundTiles_4x6', 'Roof_RoundTiles_4x8'];
const VIL_PARTS = [...new Set([].concat(
  ...Object.values(VIL_STYLE).map(s => Object.values(s)), VIL_ROOFS, ['Prop_Chimney']))];
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
    const g = await loadModelAnyExt(PROPS + name);
    let mesh = null;
    g.scene.updateMatrixWorld(true);
    g.scene.traverse(o => { if(!mesh && o.isMesh) mesh = o; });
    if(!mesh) throw new Error('no mesh in ' + name);
    const geo = mesh.geometry.clone();
    geo.applyMatrix4(mesh.matrixWorld);          // bake the model's own transform
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    geo.translate(0, -bb.min.y, 0);              // base at y=0
    /* EVERY primitive, not just the first one. A Nature Kit tree is TWO meshes - a trunk and a
       canopy, each with its own material - and keeping only the first drew half of it: models
       whose first mesh is the canopy became a floating blob and models whose first mesh is the
       trunk became a bare post. Measured in the Outskirts, where the whole grove is one or the
       other (b6-outskirts-tree.png). The file already knew this trap - the road tiles two
       functions down have their own loader for exactly this reason ("two thirds of the model
       quietly dropped") - and it was never carried back to props.
       The legacy `geo`/`mat`/`height`/`width` above are LEFT ALONE on purpose. The ground pass,
       the road pass and the hub assembler all size themselves off them with values Oliver's
       renders were tuned against; re-measuring those in the same commit is what VISION.md warns
       about. `subs` and fullHeight/fullWidth are a parallel record, and only buildProps reads
       them. For a single-mesh prop - which is most of them - the two are identical. */
    const subs = [];
    const bbAll = new THREE.Box3();
    g.scene.traverse(o => {
      if(!o.isMesh) return;
      const sg = o.geometry.clone();
      sg.applyMatrix4(o.matrixWorld);
      sg.computeBoundingBox();
      bbAll.union(sg.boundingBox);
      subs.push({ geo: sg, mat: Array.isArray(o.material) ? o.material[0] : o.material });
    });
    for(const s of subs) s.geo.translate(0, -bbAll.min.y, 0);   // the WHOLE model's base at y=0
    const fullHeight = Math.max(0.001, bbAll.max.y - bbAll.min.y);
    const fullWidth  = Math.max(0.001, Math.max(bbAll.max.x - bbAll.min.x, bbAll.max.z - bbAll.min.z));
    const height = Math.max(0.001, bb.max.y - bb.min.y);
    /* Width matters as much as height. Scaling purely to match a deco's height blew the wheat up
       into giant yellow pillars: a wheat stalk is w:4 h:24, and the grass model is WIDER than it
       is tall, so matching 24 units of height made it ~36 units across. Fitting to the box
       instead means a prop can never exceed the footprint the level intended. */
    const width = Math.max(0.001, Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z));
    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const rec = { geo, mat, height, width, subs, fullHeight, fullWidth };
    _propCache.set(name, rec);
    return rec;
  } catch(e){
    console.warn('[world3d] prop failed to load:', name, e.message);
    _propCache.set(name, null);                  // remember the failure; do not retry every frame
    return null;
  }
}
/* ── ROAD TILES ────────────────────────────────────────────────────────────────
   The Nature Kit's road pieces are one mesh made of THREE primitives - grass, dirt and dirtDark -
   and loadProp keeps only the first mesh it finds. Loaded through loadProp a road tile therefore
   renders as a single stripe of dirtDark with no grass and no track: not a missing asset, not a
   missing texture, just two thirds of the model quietly dropped. So they get their own loader,
   the same way the village wall parts do.

   Each piece is a 1x1 tile whose grass sits at y=0 and whose worn track is sunk to y=-0.05. The
   geometry is moved so the TRACK is at y=0, because the track is the surface you walk on and it
   has to clear the game's own lit slab (which tops out at 1.3). That leaves the grass verge
   standing 0.05 model-units proud, which at road scale would be a 9-unit kerb - so the vertical
   axis is scaled separately, to PATH_RELIEF. */
const PATH_SET = {
  straight: 'nature/ground_pathStraight',
  bend:     'nature/ground_pathBend',
  cross:    'nature/ground_pathCross',
  split:    'nature/ground_pathSplit',
  end:      'nature/ground_pathEnd',
  patch:    'nature/ground_pathTile',
};
const _tileCache = new Map();     // name -> { subs:[{geo,mat,grass}], width, relief } or null

async function loadTile(name){
  if(_tileCache.has(name)) return _tileCache.get(name);
  let rec = null;
  try {
    const g = await loadModelAnyExt(PROPS + name);
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
      /* The material is kept exactly as the kit ships it, NOT converted. The road's own grass has
         to be the same green as the ground_grass tile lying next to it, and the surest way to get
         that is to use the same material out of the same kit. */
      subs.push({ geo, mat: src, grass: !!(src && /grass/i.test(src.name || '')) });
    });
    if(!subs.length) throw new Error('no mesh in ' + name);
    for(const s of subs) s.geo.translate(0, -bb.min.y, 0);   // worn track at y=0
    const size = bb.getSize(new THREE.Vector3());
    rec = { subs, width: Math.max(0.001, Math.max(size.x, size.z)),
            relief: Math.max(0.001, size.y) };
  } catch(e){
    console.warn('[world3d] road tile failed to load:', name, e.message);
  }
  _tileCache.set(name, rec);
  return rec;
}

async function ensureProps(){
  if(_propsReady) return;
  /* De-duped: two sets can name the same model on purpose (`column` is `pillar` without the
     obelisk), and Promise.all fires them all before any of them reaches the cache, so a shared
     name would be fetched and parsed twice. */
  const names = [...new Set(Object.values(PROP_SETS).flat())];   // includes the ground tile
  await Promise.all([...names.map(loadProp), ...VIL_PARTS.map(loadPart),
                     ...Object.values(PATH_SET).map(loadTile)]);
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

  /* Roof: pick the nearest gable and stretch it to the footprint. Tiling ridge pieces instead
     would need a special case per size for no visible gain at this distance. */
  const roofName = d >= 4 ? VIL_ROOFS[2] : d >= 3 ? VIL_ROOFS[1] : VIL_ROOFS[0];
  add(roofName, w * g / 2, storeys * H, d * g / 2, 0, { x: w * g + 0.6, z: d * g + 0.6 });
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
           its plaster texture with it and the mortar lines stop lining up between neighbours. */
        const fx = pl.fit && rec.size.x > 1e-4 ? pl.fit.x / rec.size.x : 1;
        const fz = pl.fit && rec.size.z > 1e-4 ? pl.fit.z / rec.size.z : 1;
        o.scale.set(VIL_U * fx, VIL_U, VIL_U * fz);
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
    if(d.kind === 'column') return d.lead === false ? 'skip' : 'column';
    if(d.kind === 'lantern') return d.lead === false ? 'skip' : 'lantern';
    if(d.kind === 'flower') return d.lead === false ? 'skip' : 'flower';
    /* A crop plant is a golden stalk plus a green leaf nub. The tag exists to keep the stalk OUT
       of the foliage bin - it is theme 'plains' and under 60 tall, so the ground-tuft rule below
       claimed it and shrank it to nothing. See the corn bin for why it stays a lit box. */
    if(d.kind === 'corn') return 'corn';
    if(d.kind === 'standstone') return 'standstone';
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
/* `fitH` fits by HEIGHT ALONE and ignores the deco's width, which is wrong for most props and
   necessary for a few. The default fit takes whichever of height or width binds first, so a prop
   can never overflow the space the generator allotted it - right for a tree or a rock, whose deco
   box IS the object's footprint. It is wrong wherever the voxel object is a thin CORE rather than
   an outline: a roadside lantern is a 7-wide post carrying a 12-wide head, and fitting a lightpost
   into 7 units of width shrinks it to a bollard a tenth of its stated height. The hub's lanterns
   already sized by height alone (`92 / rec.height`) for exactly this reason; this is that rule
   made reusable rather than a second copy of it. */
function buildProps(items, names, defaultH, heightOf, fitH){
  if(!items.length) return;
  /* Kept as NAME+REC PAIRS. `names.map(...).filter(Boolean)` shortened the list without shortening
     `names`, so once any model in a set failed to load every mesh after it was labelled with the
     wrong model name - and `__world3dPoses`, whose whole job is to answer "which model ended up
     here", reported that wrong name back. A probe that lies is worse than no probe. */
  const recs = names.map(n => ({ n, rec: _propCache.get(n) })).filter(v => v.rec);
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
  recs.forEach(({ n: nm, rec }, i) => {
    const list = buckets[i];
    if(!list.length) return;
    let total = 0;
    for(const d of list) total += stackCount(d);
    /* One InstancedMesh PER PRIMITIVE, all driven by the same matrices, so a two-part model draws
       as both its parts instead of whichever one happened to come first out of the glTF. They are
       separate meshes rather than one merged geometry because each primitive carries its own
       material: a trunk and a canopy are different colours, and merging them without baking vertex
       colours would paint the whole tree one of the two. Costs one extra draw call per multi-part
       model in a set, which is single digits per level. */
    const subs = (rec.subs && rec.subs.length) ? rec.subs : [{ geo: rec.geo, mat: rec.mat }];
    /* The WHOLE model's height and width, not the first primitive's. Fitting a tree by its canopy
       mesh alone put a full tree in the space the canopy was meant to fill. */
    const rh = rec.fullHeight || rec.height, rw = rec.fullWidth || rec.width;
    /* The prop's own texture carries its colour, so instanceColor is NOT set here - tinting a
       textured model by the deco's flat colour would throw away the artwork. */
    const ms = subs.map(s => new THREE.InstancedMesh(s.geo, s.mat, total));
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
      const sc = fitH ? (segH / rh) : Math.min(segH / rh, wantW / rw);
      for(let sIdx = 0; sIdx < n; sIdx++){
        o.position.set(d.x, (d.y0 || 0) + sIdx * rh * sc, d.z);
        o.rotation.set(0, (n > 1 ? sIdx * 1.5708 : r * 6.283), 0);
        o.scale.set(sc, sc, sc);
        o.updateMatrix();
        for(const m of ms) m.setMatrixAt(k, o.matrix);
        k++;
      }
    }
    ms.forEach((m, si) => {
      m.instanceMatrix.needsUpdate = true;
      m.frustumCulled = false;
      /* Named so a render can be CHECKED rather than squinted at - see __world3dPoses below. Only
         the FIRST primitive takes the probe name: the others sit at identical matrices, and
         reporting a two-part tree twice would make every count read double. */
      m.name = (si === 0 ? 'w3d:' : 'w3dsub:') + nm;
      m.userData._w3dFit = { defaultH: defaultH, fitH: !!fitH };
      group.add(m);
    });
  });
}

/* Where did the props actually END UP? A prop is placed at the deco's y0, and whether that y0 is
   the object's BASE or the top of a voxel trunk is the difference between a forest and a forest
   hanging in the air. That question has been argued from source and from screenshots more than
   once; both are guesses. This answers it in numbers.
     __world3dPoses('tree')  -> [{model, x, y, z, h, w}, ...]
   `y` is the model's base in world units (the geometry is translated so its base is y=0), `h` its
   fitted height, so a tree whose y is not the ground under it is floating and says so. */
window.__world3dPoses = (match, limit) => {
  if(!group) return [];
  const out = [], V = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3();
  const M = new THREE.Matrix4();
  const cap = limit || 8;
  for(const c of group.children){
    if(!c.isInstancedMesh || !c.name || c.name.indexOf('w3d:') !== 0) continue;
    if(match && c.name.toLowerCase().indexOf(String(match).toLowerCase()) < 0) continue;
    const rec = _propCache.get(c.name.slice(4));
    for(let i = 0; i < c.count && out.length < cap; i++){
      c.getMatrixAt(i, M);
      M.decompose(V, Q, S);
      out.push({ model: c.name.slice(4), n: c.count,
                 x: Math.round(V.x), y: Math.round(V.y * 10) / 10, z: Math.round(V.z),
                 h: rec ? Math.round((rec.fullHeight || rec.height) * S.y) : null,
                 w: rec ? Math.round((rec.fullWidth || rec.width) * S.x) : null,
                 parts: rec && rec.subs ? rec.subs.length : 1 });
    }
  }
  return out;
};

/* WHAT IS WORLD3D DRAWING HERE? __world3dPoses answers "where did THIS MODEL end up", by name, and
   nothing else - given an empty name it hands back the first few instances of the first few models,
   which reads like a spatial answer and is not (that mistake cost a run: 8 instances came back for
   a zone reporting 2194 deco, and "nothing of world3d's is near the chest" was nearly concluded
   from it). This is the spatial query. Every piece of geometry world3d has put in the scene whose
   world-space box comes within `r` of (x,z), ground tiles and buildings included:
     __world3dNear(-1110, -1570, 130)  -> [{model, n, x, z, y0, y1, w, d}, ...]
   `y0`/`y1` are the box's BOTTOM and TOP in world units, which is the pair that settles a burial -
   an object whose y1 is above a chest's base and whose footprint contains it is drawn over it.
   `minTop` is not a convenience: a zone floors itself with over a thousand ground tiles and they
   are the FIRST children of the group, so without it the cap fills with y1=1.5 tiles and the query
   answers "there is a floor here" to every question you ask it. Pass the subject's base. */
window.__world3dNear = (x, z, r, limit, minTop) => {
  if(!group) return [];
  const rad = r == null ? 100 : r, cap = limit || 40, out = [];
  const floor = minTop == null ? -Infinity : minTop;
  const M = new THREE.Matrix4(), T = new THREE.Box3();
  group.updateMatrixWorld(true);
  const nodes = [];
  group.traverse(o => { if(o.geometry) nodes.push(o); });
  const hit = (b, nm, n) => {
    if(out.length >= cap) return;
    if(b.max.y < floor) return;
    if(b.max.x < x - rad || b.min.x > x + rad || b.max.z < z - rad || b.min.z > z + rad) return;
    out.push({ model: nm, n: n,
               x: Math.round((b.min.x + b.max.x) / 2), z: Math.round((b.min.z + b.max.z) / 2),
               y0: Math.round(b.min.y * 10) / 10, y1: Math.round(b.max.y * 10) / 10,
               w: Math.round(b.max.x - b.min.x), d: Math.round(b.max.z - b.min.z) });
  };
  for(const c of nodes){
    if(!c.geometry.boundingBox) c.geometry.computeBoundingBox();
    const nm = c.name || ('<' + c.type + '>');
    if(c.isInstancedMesh){
      for(let i = 0; i < c.count && out.length < cap; i++){
        c.getMatrixAt(i, M);
        /* Compose, don't apply twice: transforming an AABB by two matrices in turn re-bounds the
           already-axis-aligned intermediate and inflates every rotated instance. */
        M.premultiply(c.matrixWorld);
        T.copy(c.geometry.boundingBox).applyMatrix4(M);
        hit(T, nm, c.count);
      }
    } else {
      T.copy(c.geometry.boundingBox).applyMatrix4(c.matrixWorld);
      hit(T, nm, 1);
    }
  }
  return out;
};

/* What SHAPE is a model, before anything is fitted to it? __world3dPoses answers "where did this
   end up"; this answers the question that comes first - how tall and how wide is the thing in its
   own units - and it is the number every fit rule here is written against. Without it the only
   way to learn a prop's aspect ratio is to place it, render it and squint, which is how a stack
   rule sized for a cube-ish block came to be applied to a tall thin column.
     __world3dRec('props/pillar-square')  -> {height, width, fullHeight, fullWidth, aspect, parts}
   `aspect` is fullHeight/fullWidth: 1 is a cube, 5 is a lamp post. */
window.__world3dRec = (name) => {
  const out = [];
  for(const n of [...new Set(Object.values(PROP_SETS).flat())]){
    if(name && n.toLowerCase().indexOf(String(name).toLowerCase()) < 0) continue;
    const rec = _propCache.get(n);
    if(!rec){ out.push({ model: n, loaded: false }); continue; }
    const h = rec.fullHeight || rec.height, w = rec.fullWidth || rec.width;
    out.push({ model: n, loaded: true,
               height: Math.round(rec.height * 1000) / 1000, width: Math.round(rec.width * 1000) / 1000,
               fullHeight: Math.round(h * 1000) / 1000, fullWidth: Math.round(w * 1000) / 1000,
               aspect: Math.round(h / w * 100) / 100, parts: rec.subs ? rec.subs.length : 1 });
  }
  return out;
};


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

/* GROUND PER THEME. Every zone used to share one tile - castle/ground, which is the Castle Kit's
   GRASS tile. It passed as neutral only because its colormap 404'd and it drew white, so Frostfell,
   Emberdeep, the Abyss, the Palace and Duskmoor were all the same untextured expanse. With the
   texture restored that tile is unmistakably a lawn, so each theme now names its own surface.

   `tint` MULTIPLIES the texture, so these are deliberately light - a stage's own ground colour
   (#243240 for Frostfell, #1c1220 for Duskmoor) would multiply the cobble to near-black. Each is
   the stage colour pulled most of the way to white: enough to keep the zone's identity, not enough
   to bury the stonework. Themes are the game's own STAGES[].theme strings.

   `tiles` may list more than one surface, each with its own `w` (share of the cells, 0-1) and an
   optional `tint` overriding the theme's. A second variant only helps if it reads as the SAME
   ground with different detail: an even split between two tiles of noticeably different colour
   does not look varied, it looks like a chessboard, which is exactly what an even
   ground_grass/castle-ground mix produced. So the variant is a MINORITY and is tinted to sit on
   top of the primary's colour - the variety comes from its texture, not from its hue.

   `road` is the surface laid where the generator tagged a segment `path:true`. Grassy themes do
   not need one: they get the Nature Kit's real road pieces instead (see planPaths). Everywhere
   else a road is the same masonry family a shade darker and in a different bond, so it reads as a
   laid way through the zone rather than as a differently-coloured stripe. */
const THEME_GROUND = {
  /* ONE grass tile, on purpose. castle/ground was tried as a second variant and does not work at
     any weight or tint: nature/ground_grass is flat TEAL with no texture at all, castle/ground is
     a textured mid-green, and mixing them reads as discoloured patches rather than uneven meadow -
     a 50/50 split is a literal chessboard, and even at 24% the odd tiles still read as blotches.
     The variety in a grassy field comes from GROUND_JITTER instead, which varies brightness only.
     A second variant needs an asset that is the same green with different detail; the repo has
     none. Rendered and compared both ways before settling on this. */
  plains:   { tiles: [{ n: 'nature/ground_grass' }], tint: null,      grass: true },
  forest:   { tiles: [{ n: 'nature/ground_grass' }], tint: '#b9cfa8', grass: true },
  badlands: { tiles: [{ n: 'village/Floor_UnevenBrick' }], tint: '#c2a184',
              road: { n: 'village/Floor_Brick', tint: '#ab8f72' } },
  canyon:   { tiles: [{ n: 'village/Floor_UnevenBrick' }], tint: '#cbab86',
              road: { n: 'village/Floor_Brick', tint: '#b39674' } },
  ruins:    { tiles: [{ n: 'village/Floor_Brick', w: 0.72 },
                      { n: 'village/Floor_UnevenBrick', w: 0.28 }], tint: '#a9a4bd',
              road: { n: 'village/Floor_RedBrick', tint: '#8f92b6' } },
  dungeon:  { tiles: [{ n: 'village/Floor_Brick' }], tint: '#a99cb4',
              road: { n: 'village/Floor_RedBrick', tint: '#8e8ab0' } },
  frost:    { tiles: [{ n: 'village/Floor_Brick' }], tint: '#cfe2f2',
              road: { n: 'village/Floor_UnevenBrick', tint: '#b4c9da' } },
  volcano:  { tiles: [{ n: 'village/Floor_UnevenBrick' }], tint: '#a8705c',
              road: { n: 'village/Floor_Brick', tint: '#8c604f' } },
  void:     { tiles: [{ n: 'village/Floor_Brick' }], tint: '#8e7ba8',
              road: { n: 'village/Floor_RedBrick', tint: '#6e6fa2' } },
  marble:   { tiles: [{ n: 'village/Floor_Brick' }], tint: '#e0dcd2',
              road: { n: 'village/Floor_RedBrick', tint: '#c3c0c8' } },
  apex:     { tiles: [{ n: 'village/Floor_Brick', w: 0.78 },
                      { n: 'village/Floor_UnevenBrick', w: 0.22 }], tint: '#8b7f9c',
              road: { n: 'village/Floor_RedBrick', tint: '#6f6d92' } },
};
/* The default carries a road too. Themes drift - `ember` reaches here rather than matching
   `volcano` - and a zone that falls through should still show its roads rather than silently
   losing them because nobody added its name to the table. */
const THEME_GROUND_DEFAULT = { tiles: [{ n: 'village/Floor_UnevenBrick' }], tint: '#c9b998',
                               road: { n: 'village/Floor_Brick', tint: '#b3a488' } };
/* Per-instance brightness spread, so even a single-variant surface is not one flat sheet of
   colour. Applied through InstancedMesh.setColorAt, which MULTIPLIES the material colour, so
   these hover around 1.0 rather than replacing the theme tint. */
const GROUND_JITTER = 0.13;

/* One place decides which surface a zone stands on, so the floor pass and the road pass can never
   disagree about whether a zone is grassy - if they did, a grassy zone would drop the ground under
   its roads and then decline to draw the roads, leaving holes in the field. */
/* A CLASS TRIAL IS AN INTERIOR, and its theme lies about that. The trial runs the shared
   grid-graph maze - stone rooms with doorway gaps, sealed doors, corner torches - but it borrows
   STAGES[].theme from the zone it was started FROM (startTrial builds newG with `zone: fromZone||0`),
   so a trial begun in the Outskirts reports theme 'plains' and this table laid a teal LAWN inside
   the walled chamber the game's own tutorial calls "this sealed chamber".
   Measured 2026-08-02 (worker B) the first time a room dungeon was ever photographed - the maze is
   reached ONLY when every scape dispatch is skipped, and `G.trial` is what skips all four, so until
   `--scene trial` went into the harness the same day there was no way to look at one. The game
   paints that floor s.ground = #8a8445, a khaki stone, and the 3D layer painted it teal grass:
   the two renderers disagreed about what the ground IS, which is a conversion bug, not a look.
   The level's own colour settles it rather than a new art choice - interior brick tinted with the
   ground colour the game already declares, so a trial in any zone lands on that zone's own stone. */
const TRIAL_TILE = 'village/Floor_Brick', TRIAL_ROAD = 'village/Floor_RedBrick';
/* AN ARENA IS THE SAME CLASS OF BUG AS A TRIAL, one step further along: it does not merely borrow
   the wrong theme, it has no stage at all. See the long note at __BF_WORLD in index.html.
   Do NOT "fix" this by adding an `arena` entry to THEME_GROUND. That table's entries are static
   literals and the three arena maps declare three DIFFERENT grounds - Proving Ground #3b4254 slate,
   the parkour map #3a3350, Cinder Pit #c93a12 molten - so one entry gives all three the same floor
   and the Cinder Pit's read is still gone. Each map's colour is already authored; use it. That also
   means this needs no new art choice.
   The half-fix looks like it worked, which is the trap: with no `arena` key in THEME_GROUND,
   theme:'arena' falls through to THEME_GROUND_DEFAULT - tan uneven brick. That is a plausible arena
   floor and an obvious improvement on teal grass, so a run that ships only the index.html half
   renders it, sees stone, and leaves the Cinder Pit a lawn's worth of brick over a lava sea. */
const ARENA_TILE = 'village/Floor_Brick', ARENA_ROAD = 'village/Floor_RedBrick';
function groundSpecFor(world){
  const isHub = !!(world && world.hub);
  if(!isHub && world && world.arena){
    const c = world.ground || '#3b4254';
    return { tiles: [{ n: ARENA_TILE }], tint: c, road: { n: ARENA_ROAD, tint: c } };
  }
  if(!isHub && world && world.trial){
    const c = world.ground || '#a99cb4';
    return { tiles: [{ n: TRIAL_TILE }], tint: c, road: { n: TRIAL_ROAD, tint: c } };
  }
  return (!isHub && THEME_GROUND[(world && world.theme) || '']) || THEME_GROUND_DEFAULT;
}

const NO_GROUND = { tiles: 0, paved: 0, buried: 0 };

function buildGround(world, paths){
  const segs = (world && world.segments) || [];
  if(!segs.length) return NO_GROUND;
  /* Floor material follows the ZONE, not one global choice. Laying grass across the Waystation
     turned a stone plaza into a lawn - the hub is paved, and the meadow is not. Zones without a
     natural grass floor get the path/stone tile instead. */
  const zone = (world && world.zone) || 'hub';
  /* Theme, not zone id. The old test compared world.zone against 'forest'/'plains', which are
     STAGES[].theme values and never appear as zone ids - so only 'outskirts' ever matched by
     accident and every other grassy stage got the stone tile. */
  const theme = (world && world.theme) || '';
  /* world.hub is the game's own G.hub flag. An earlier guess inferred the hub from deco count and
     zone id and got it wrong: the Waystation REPORTS its zone as 'outskirts', so the heuristic
     laid grass across a stone plaza. Ask the game what it is rather than inferring it. */
  const isHub = !!(world && world.hub);
  const spec = groundSpecFor(world);
  const grassy = !isHub && !!spec.grass;
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
  if(isHub) return NO_GROUND;
  /* NO 3D FLOOR IN A BONUS ROOM EITHER, and this one was found by rendering three answers and
     keeping the honest one.

     THE TREASURE SPRINT'S START PAD WAS A LAWN FLOATING IN THE SKY - the arena bug's cousin rather
     than a repeat of it. loadBonus() takes its palette from STAGES[G.stageIndex] on PURPOSE (a
     bonus room borrows the zone it hangs off), so unlike the arena the stage index here is not
     wrong. What is wrong is that a bonus room is not GROUND: its segments are the starting
     PLATFORM of a floating parkour course, and theme 'plains' hands that platform the grass model,
     which carries its own teal texture and ignores world.ground completely. One frame held both
     answers - a teal grass pad with forty sand-gold platforms stepping away from it
     (_shot/out/j1-sprint.png) - while the voxel twin drew pad and platforms the same sand-gold and
     the course read as one object (j2-sprint-voxel.png). The platforms were right in both: they
     are vplat OBSTACLES drawn by the deferred voxel pass from `tint(s.ground, …)`, so only the
     pad ever disagreed.
     BUILT AND REJECTED FIRST, both rendered: a groundSpecFor branch tinted with the level's own
     `world.ground`, the arena's exact fix - correct hue, and a DARK BROWN pad under pale sand
     platforms, because a tint MULTIPLIES the stonework texture (the note in this function's tile
     loop says so). Then the same branch lightened 50% toward white to pay for the multiply - a
     mid grey-brown tiled floor, still visibly a different material from the course it starts
     (j5c.png against j6-seed7-voxel.png, same seed, same camera).
     So there is no tile in the kit that matches the platforms, and the voxel renderer already
     draws this pad AS one of them - `tint(s.ground,'#fff',0.12)` against the platforms' 0.10.
     Standing back is the faithful conversion here, the same call the corn stalks got. It also
     costs nothing: floorTiles 0 turns `_w3dGround` off, so the game restores the pad's own lit top
     edge and painted path dashes, and `_crLift` correctly stops lifting crumbles that no 3D floor
     is covering. Everything else in the room - hero, mobs, chests, props - is still 3D.
     A real platform model would beat this; until then, honest beats ambitious. */
  if(world && world.bonus) return NO_GROUND;
  /* Drop variants that failed to load rather than bailing: one absent tile should cost variety,
     not the whole floor. Only an empty list leaves the ground to the voxel pass. */
  const vars = spec.tiles.map(t => ({ t, rec: _propCache.get(t.n) })).filter(v => v.rec);
  if(!vars.length){ console.warn('[world3d] floor tiles missing, ground left to the voxel pass:', spec.tiles.map(t => t.n), 'theme', theme); return NO_GROUND; }
  /* Cumulative weights over the SURVIVING variants, normalised - so if the minority tile fails to
     load the primary simply takes all the cells instead of the field going half-empty. */
  const wsum = vars.reduce((s, v) => s + (v.t.w != null ? v.t.w : 1), 0);
  let acc = 0;
  for(const v of vars){ acc += (v.t.w != null ? v.t.w : 1) / wsum; v.cut = acc; }
  /* The road surface is a variant the weighted picker can never choose - cells reach it only by
     lying under a tagged path. Its cut is deliberately past 1 so the picker's `while r > cut`
     walk stops on the last real variant, whatever the weights are. */
  const roadRec = (!grassy && spec.road) ? _propCache.get(spec.road.n) : null;
  if(!grassy && spec.road && !roadRec)
    console.warn('[world3d] road surface not loaded, roads left as ordinary floor:', spec.road.n);
  if(roadRec) vars.push({ t: { n: spec.road.n, tint: spec.road.tint }, rec: roadRec, cut: 2 });
  const roadIdx = roadRec ? vars.length - 1 : -1;
  const TILE = grassy ? FLOOR_TILE_GRASS : FLOOR_TILE_STONE;
  const cells = [];
  /* Segments OVERLAP - every road crosses the districts it joins, and each one tiles its own
     rectangle independently, so the shared area was being covered twice. Nothing showed, because
     the two layers land at the same y and the depth test throws the second one away, but the
     Ruined Keep was paying for 4406 floor instances to draw about 2200 tiles' worth of ground.
     A cell is dropped only when it lies ENTIRELY inside a segment already tiled. Testing the
     centre instead would be cheaper and wrong: the lattices differ per segment (a 1380-wide room
     steps at 76.7 units, a 170-wide road at 56.7), so a cell can have its centre covered and its
     edges hanging out, and dropping it would open a hairline of bare slab along every overlap.
     Under-covering is a visible gap; over-covering is only wasted work. */
  const done = [];
  const buried = (x, z, hw, hd) => done.some(p =>
    x - hw >= p.x0 && x + hw <= p.x1 && z - hd >= p.z0 && z + hd <= p.z1);
  let dropped = 0;
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
        const cx = sg.x - w/2 + (ix + 0.5) * tw, cz = sg.z - d/2 + (iz + 0.5) * td;
        if(buried(cx, cz, tw/2, td/2)){ dropped++; continue; }
        cells.push({ x: cx, z: cz, w: tw, d: td });
      }
    }
    done.push({ x0: sg.x - w/2, x1: sg.x + w/2, z0: sg.z - d/2, z1: sg.z + d/2 });
  }
  if(!cells.length) return NO_GROUND;
  /* Tint MULTIPLIES the tile's texture, so it comes from THEME_GROUND, not from the stage's own
     ground colour. Deriving it from the stage colour was correct while the textures 404'd and the
     tile was plain white; against real stonework those colours (#243240, #1c1220) multiply to
     near-black. The earlier note here - "these tiles carry no texture, only a material colour" -
     was reading a missing file, not the asset. */
  /* Split the cells across the variants first, so each InstancedMesh knows its own count.
     Hashed on a SHIFTED position, not the same hash that picks the quarter-turn: reusing one
     hash for both makes every tile of variant B share a rotation, and the field stripes. */
  const buckets = vars.map(() => []);
  for(const c of cells){
    /* A cell under a tagged road never draws the zone's ordinary ground. On grass the real road
       piece covers it completely, so drawing ground underneath would only z-fight with it; on
       stone the cell becomes paving instead. Skipping is what keeps the road from being a
       translucent-looking stripe painted over the field. */
    if(paths && paths.covers(c.x, c.z)){
      if(grassy) continue;
      if(roadIdx >= 0){ buckets[roadIdx].push(c); continue; }
    }
    const r = hash(c.x + 91.7, c.z - 43.1);
    let vi = 0; while(vi < vars.length - 1 && r > vars[vi].cut) vi++;
    buckets[vi].push(c);
  }

  const o = new THREE.Object3D();
  const col = new THREE.Color();
  for(let v = 0; v < vars.length; v++){
    const rec = vars[v].rec, bucket = buckets[v];
    if(!bucket.length) continue;
    /* Tint MULTIPLIES the tile's texture, so it comes from THEME_GROUND, not from the stage's own
       ground colour. Deriving it from the stage colour was correct while the textures 404'd and
       the tile was plain white; against real stonework those colours (#243240, #1c1220) multiply
       to near-black. The earlier note here - "these tiles carry no texture, only a material
       colour" - was reading a missing file, not the asset. */
    const mat = rec.mat.clone();
    const tint = vars[v].t.tint || spec.tint;
    if(tint) mat.color = new THREE.Color(tint);
    const m = new THREE.InstancedMesh(rec.geo, mat, bucket.length);
    for(let i = 0; i < bucket.length; i++){
      const c = bucket[i], r = hash(c.x, c.z);
      const quarter = (r * 4) | 0;
      o.position.set(c.x, 1.45, c.z);        // just above the game's lit top edge (tops out at 1.3)
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
      /* Brightness only, no hue shift - shifting hue per tile reads as patchy discolouration
         rather than uneven ground. A third hash so the shading does not track the variant split. */
      const j = 1 + (hash(c.x - 12.4, c.z + 57.9) - 0.5) * 2 * GROUND_JITTER;
      m.setColorAt(i, col.setRGB(j, j, j));
    }
    m.instanceMatrix.needsUpdate = true;
    if(m.instanceColor) m.instanceColor.needsUpdate = true;
    m.frustumCulled = false;
    m.renderOrder = -1;                      // draw before the props standing on it
    group.add(m);
  }
  /* The cells actually DRAWN, not the cells considered: on grass every cell under a road is
     dropped, so returning cells.length would report a floor that is partly not there. `paved` is
     reported separately because a stone zone's road IS floor cells - without it there is no way to
     tell "the road was paved" from "the road was never found" by probing the counts. */
  return { tiles: buckets.reduce((n, b) => n + b.length, 0),
           paved: roadIdx >= 0 ? buckets[roadIdx].length : 0,
           buried: dropped };
}


/* ── ROADS ─────────────────────────────────────────────────────────────────────
   Where a level has a walkway, put a real road on it.

   This is TAGGED, never inferred. Guessing "this segment is a walkway" from its aspect ratio is
   the same class of guess that once laid grass across the hub plaza: a room and a road are both
   flat rectangles and nothing about their shape separates them. So the generators say so - every
   road()/path()/trail()/floorRoad() helper in index.html now marks its segments `path:true`, the
   same way the rampart dividers were tagged - and this pass only draws what was declared.

   Two shapes of road come out of those generators and they need different treatment:

   - road()/path() emit AXIS-ALIGNED rectangles, in Ls: one leg along x, one along z. Those are cut
     into square-ish tiles along their long axis and then AUTOTILED - each tile looks at whether
     there is more road past each of its four edges and picks the Nature Kit piece that matches
     (straight / bend / cross / T / dead-end). That is what the kit's six road pieces are for, and
     it is why a corner reads as a corner rather than as two stripes crossing.
   - trail() emits a CHAIN of squares along an arbitrary line, so its direction cannot be read back
     off a tile's shape at all. The generator records it (pdx/pdz/pstep) and each step becomes one
     straight piece rotated onto that heading, which is what lets a diagonal trail be a ribbon
     instead of a staircase.

   Only grassy zones get these pieces, because the kit's road tiles are dirt tracks drawn ON GRASS
   - the grass is part of the model. Laying one across a dungeon floor would put a lawn in it. The
   stone themes get a road out of THEME_GROUND[].road instead, painted through the ordinary floor
   pass, which is why planPaths still runs for them: the ground pass needs the footprint. */
const PATH_RELIEF = 3;      // game units the grass verge stands above the worn track
/* A cap, not a budget. Every road tile is instanced, so the cost is in the planning arithmetic,
   not the draw; this only exists so a pathological zone cannot hang the build. */
const PATH_MAX = 2000;
const DIRV = [[1, 0], [0, 1], [-1, 0], [0, -1]];   // 0=+X, 1=+Z, 2=-X, 3=-Z
const PATH_IDX_CELL = 256;

/* Pick the road piece for a set of connected directions, and how far to turn it.

   Every piece's connections in its own unrotated space, measured off the models' vertex data:
   straight joins +Z and -Z, bend joins +X and +Z, cross joins all four, split (a T) joins
   everything but -Z, end joins +Z alone. Turning a model +90 degrees about Y sends a connection
   at direction d to d-1, because three.js maps local +Z onto world +X at +90. Each case below is
   just that relation solved for the quarter-turn count. */
function pathPiece(mask){
  const n = mask.length;
  if(n === 4) return { p: 'cross', q: 0 };
  if(n === 3){ const m = [0, 1, 2, 3].find(d => mask.indexOf(d) < 0); return { p: 'split', q: (3 - m + 4) % 4 }; }
  if(n === 2){
    if(mask[1] - mask[0] === 2) return { p: 'straight', q: mask.indexOf(0) >= 0 ? 1 : 0 };
    const d = [0, 1, 2, 3].find(x => mask.indexOf(x) >= 0 && mask.indexOf((x + 1) % 4) >= 0);
    return { p: 'bend', q: (4 - d) % 4 };
  }
  if(n === 1) return { p: 'end', q: (1 - mask[0] + 4) % 4 };
  return { p: 'patch', q: 0 };               // a lone step with nothing either side: a worn patch
}

/* Is (x,z) on this tile? Axis tiles are a plain rectangle; a trail tile is turned to its heading,
   so the point goes into the tile's own frame first (the inverse of rotation.y). */
function inTile(t, x, z){
  const dx = x - t.x, dz = z - t.z;
  if(!t.free) return Math.abs(dx) <= t.wx / 2 && Math.abs(dz) <= t.wz / 2;
  const c = Math.cos(t.yaw), s = Math.sin(t.yaw);
  return Math.abs(dx * c - dz * s) <= t.lx / 2 && Math.abs(dx * s + dz * c) <= t.lz / 2;
}

function planPaths(world){
  const segs = (world && world.segments) || [];
  const axis = [], free = [];
  for(const sg of segs){
    if(!sg || !sg.path || sg.nofloor) continue;
    const w = sg.w || 0, d = sg.d || 0;
    if(w < 8 || d < 8) continue;
    if(sg.pdx != null || sg.pdz != null){
      /* A trail step. The heading came from the generator because the tile itself cannot carry it:
         a 132x132 square says nothing about which way the road runs. */
      const cross = Math.min(w, d), run = Math.max(20, sg.pstep || cross);
      const yaw = Math.atan2(sg.pdx || 0, sg.pdz || 0);
      const c = Math.abs(Math.cos(yaw)), s = Math.abs(Math.sin(yaw));
      free.push({ x: sg.x, z: sg.z, free: true, yaw, lx: cross, lz: run,
                  wx: cross * c + run * s, wz: cross * s + run * c });
      continue;
    }
    const alongX = w >= d;
    const cross = Math.min(w, d), long = Math.max(w, d);
    const n = Math.max(1, Math.round(long / cross));
    const step = long / n;
    const a0 = (alongX ? sg.x : sg.z) - long / 2;
    for(let i = 0; i < n; i++){
      const c = a0 + (i + 0.5) * step;
      axis.push({ x: alongX ? c : sg.x, z: alongX ? sg.z : c,
                  wx: alongX ? step : cross, wz: alongX ? cross : step });
    }
  }
  if(axis.length + free.length > PATH_MAX){
    console.warn('[world3d] road plan skipped, ' + (axis.length + free.length) + ' tiles');
    return null;
  }
  /* The two legs of an L each lay a tile on the corner square. Keeping both would stack two
     straights at right angles there, which is exactly the crossed-stripes look the bend piece
     exists to avoid - so the duplicate is dropped and the survivor autotiles into a bend. */
  const kept = [];
  for(const t of axis){
    const tol = Math.min(t.wx, t.wz) * 0.4;
    if(kept.some(k => Math.abs(k.x - t.x) < tol && Math.abs(k.z - t.z) < tol)) continue;
    kept.push(t);
  }
  const tiles = kept.concat(free);
  if(!tiles.length) return null;

  const idx = new Map();
  const bucket = (i, j) => { const k = i + ':' + j; let a = idx.get(k); if(!a) idx.set(k, a = []); return a; };
  for(const t of tiles){
    const i0 = Math.floor((t.x - t.wx / 2) / PATH_IDX_CELL), i1 = Math.floor((t.x + t.wx / 2) / PATH_IDX_CELL);
    const j0 = Math.floor((t.z - t.wz / 2) / PATH_IDX_CELL), j1 = Math.floor((t.z + t.wz / 2) / PATH_IDX_CELL);
    for(let i = i0; i <= i1; i++) for(let j = j0; j <= j1; j++) bucket(i, j).push(t);
  }
  const near = (x, z) => idx.get(Math.floor(x / PATH_IDX_CELL) + ':' + Math.floor(z / PATH_IDX_CELL)) || [];

  /* Autotile: probe just past each edge and ask whether any OTHER tile is there. Probing rather
     than comparing grid coordinates is what lets tiles of different widths meet - the trails are
     132 wide and the roads 150, and they never share a lattice. */
  for(const t of kept){
    const mask = [];
    for(let k = 0; k < 4; k++){
      const px = t.x + DIRV[k][0] * t.wx * 0.6, pz = t.z + DIRV[k][1] * t.wz * 0.6;
      if(near(px, pz).some(o => o !== t && inTile(o, px, pz))) mask.push(k);
    }
    const pq = pathPiece(mask);
    t.piece = pq.p;
    t.yaw = pq.q * Math.PI / 2;
    /* Same trap the floor tiles set: a quarter-turn swaps local X and Z, so scaling by the world
       footprint and then turning the tile leaves it the wrong way round and the road narrows. */
    t.lx = (pq.q & 1) ? t.wz : t.wx;
    t.lz = (pq.q & 1) ? t.wx : t.wz;
  }
  for(const t of free) t.piece = 'straight';

  return { tiles, count: tiles.length,
           covers(x, z){ return near(x, z).some(t => inTile(t, x, z)); } };
}

function drawPaths(plan, spec){
  if(!plan || !plan.tiles.length) return 0;
  const byPiece = new Map();
  for(const t of plan.tiles){ let a = byPiece.get(t.piece); if(!a) byPiece.set(t.piece, a = []); a.push(t); }
  const o = new THREE.Object3D();
  const col = new THREE.Color();
  let drawn = 0, missing = 0;
  for(const [piece, list] of byPiece){
    const rec = _tileCache.get(PATH_SET[piece]);
    if(!rec){ missing += list.length; continue; }
    for(const sub of rec.subs){
      const mat = sub.mat.clone();
      /* Only the verge takes the theme tint. The track keeps the kit's own dirt, the same rule the
         ground tiles follow - tinting the dirt as well turns a road green. */
      if(sub.grass && spec.tint) mat.color = new THREE.Color(spec.tint);
      const m = new THREE.InstancedMesh(sub.geo, mat, list.length);
      for(let i = 0; i < list.length; i++){
        const t = list[i];
        /* A hair of vertical scatter. Trails converging on the same clearing overlap, and two
           coplanar tiles of identical dirt z-fight into a shimmering seam; half a unit against a
           three-unit verge is invisible and settles the argument. */
        const j = hash(t.x * 0.7, t.z * 1.3);
        o.position.set(t.x, 1.45 + j * 0.5, t.z);
        o.rotation.set(0, t.yaw || 0, 0);
        o.scale.set(t.lx / rec.width, PATH_RELIEF / rec.relief, t.lz / rec.width);
        o.updateMatrix();
        m.setMatrixAt(i, o.matrix);
        const b = 1 + (hash(t.x - 12.4, t.z + 57.9) - 0.5) * 2 * GROUND_JITTER;
        m.setColorAt(i, col.setRGB(b, b, b));
      }
      m.instanceMatrix.needsUpdate = true;
      if(m.instanceColor) m.instanceColor.needsUpdate = true;
      m.frustumCulled = false;
      m.renderOrder = -1;
      group.add(m);
    }
    drawn += list.length;
  }
  if(missing) console.warn('[world3d] ' + missing + ' road tiles had no model and were skipped');
  return drawn;
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
     of the courtyard are legible from the middle of the plaza.
     THE MID TOWERS ARE ALSO THE GAME'S RAMPART BAY DIVIDERS, which nothing recorded until it was
     measured (2026-08-03). enterWaystation puts a `kind:'pillar'` slab at the midpoint of every
     pair of gates to give each portal its own alcove - the same x this loop uses - and a 150-wide
     tower at (mid, northZ) contains that slab and its collision box outright. So the divider needs
     no model of its own; it needs the voxel copy to stop drawing, which `counts.tower` licenses on
     the index.html side. Move these cells and that stops being true. */
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

  /* PAVED COURTYARD. The tiles DO carry a texture; the reason five earlier attempts concluded
     otherwise is that every kit colormap 404'd, so probing showed map=NONE and the material
     colour was the only thing left driving the look. */
  /* The floor plan is NOT a rectangle and paving it as one got both halves wrong: the Waystation
     is a courtyard with an activity ANNEX hanging off its south edge and a small SE court beside
     it, so one rect stopped ~480 units short of the annex (the tan voxel floor showing past the
     cobbles was the seam) while simultaneously laying stone west of the annex where the hub does
     not go. The shape comes from the game's own G.segments, the same list the voxel renderer
     floors, so the two layers cover exactly the same ground and there is nothing left for a seam
     to appear at. ALL of them, `nofloor` included: nofloor means "my parent segment already
     floored this, do not draw it twice", not "there is no floor here", and the parent is the one
     entry that reaches the annex. Paving the three nofloor rooms alone was built and RENDERED
     first and it is visibly wrong - the annex is 957 wide against the courtyard's 1885, so tan
     voxel floor stayed either side of it (`_shot/out/m1-annex-fix.png`).
     G.rooms is NOT the source: the hub's space pass scales segments and leaves rooms stale.
     Cells stay on ONE lattice keyed off (westX, northZ) and are deduped, so overlapping segments
     meet without a doubled tile or a hairline, and every tile the old rect laid keeps the exact
     position and quarter-turn it had. Clamped to the shell so a segment running past the rampart
     does not pave the outside of it. */
  const paveCells = [];
  const paveSeen = new Set();
  const paveRect = (x0, x1, z0, z1) => {
    x0 = Math.max(x0, westX); x1 = Math.min(x1, eastX); z0 = Math.max(z0, northZ);
    const i0 = Math.floor((x0 - westX) / HUB_UNIT), i1 = Math.ceil((x1 - westX) / HUB_UNIT);
    const j0 = Math.floor((z0 - northZ) / HUB_UNIT), j1 = Math.ceil((z1 - northZ) / HUB_UNIT);
    for(let i = i0; i < i1; i++) for(let j = j0; j < j1; j++){
      const k = i + ',' + j;
      if(paveSeen.has(k)) continue;
      paveSeen.add(k);
      paveCells.push({ x: westX + (i + 0.5) * HUB_UNIT, z: northZ + (j + 0.5) * HUB_UNIT });
    }
  };
  const paveSegs = (world.segments || []).filter(s => s && s.w > 8 && s.d > 8);
  if(paveSegs.length){
    for(const sg of paveSegs)
      paveRect(sg.x - sg.w / 2, sg.x + sg.w / 2, sg.z - sg.d / 2, sg.z + sg.d / 2);
  } else {
    /* No segments at all (a hub variant that never declared any): the old courtyard rect is still
       better than a bare floor, and this line is exactly the block it used to be. */
    paveRect(westX, eastX, northZ, southZ);
  }
  counts.paveSegs = paveSegs.length;
  const paveRec = _propCache.get(PROP_SETS.hubPave[0]);
  if(paveRec && paveCells.length){
    const pm = paveRec.mat.clone();
    /* Gentle warm tint only. The cobble texture carries the detail now, so the old flat
       '#c9b998' would just mud it - this nudges it towards the plaza's warm light and stops. */
    pm.color = new THREE.Color('#e8dfcb');
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

  /* NO CENTREPIECE TOWER ANY MORE — and this is a deletion with a reason, not a trim.
     A 210-unit tower stood on the courtyard's centre line at northZ+620 because "a courtyard with
     nothing in the middle reads as an empty lot". The middle was never empty: the game's own plaza
     WAYSTONE - the bonfire you touch to heal and take stock - sits at (0, 30), which is within 17
     units of that spot. It looked empty because drawWaystation was drawn outside the deferred
     entity window, so the 3D paving painted the bonfire, the fountain, the market wares and every
     keeper straight out. This tower was a substitute for the thing the bug had erased.
     With drawWaystation deferred the bonfire is back, and rendered here the tower simply swallowed
     it: 130 units wide over a 64-unit stone, with only the fireflies escaping
     (_shot/out/b-hubstone-fixed.png). Decoration loses to a landmark the player walks up to and
     uses. The corner towers above are untouched - they mark the rampart, not the plaza. */

  /* BUILDINGS. The one thing in the courtyard with a real footprint you cannot walk through, so
     these are the pieces that turn an open plaza into a place. */
  const bc = buildBuildings(hubBuildingSpecs(world));
  counts.buildings = bc.buildings; counts.buildingPieces = bc.pieces;
  counts.buildingMeshes = bc.meshes; counts.buildingMissing = bc.missing;

  Object.assign(counts, buildHubDecoProps(world));

  return counts;
}

/* THE HUB'S OWN DECO, CAST ONTO REAL PROPS.

   buildHub otherwise ignores G.deco entirely and rebuilds the courtyard from G.gates / G.walls /
   G.segments, and buildWorld returns on the hub branch before the bins/classify block - so until
   this existed, NOTHING the Waystation itself placed ever became a model. Every plaza lamp,
   planter and bloom stayed a voxel box standing on 3D cobbles, which is the half-converted state
   the top of buildWorld warns about: real green lightposts lining the approach and brown boxes
   with a green cube on top doing the same job in the plaza (_shot/out/h1-base.png).

   Deliberately an OPT-IN list rather than the zone path's full classify sweep. The hub is
   hand-authored: most of its deco is flagstone paint, basin lips, activity pads and pillar caps
   that no kit model replaces, and running them all through the prop bins would replace authored
   art with guesses. Only kinds the generator has explicitly tagged AND that have a proven model
   are converted, and each returns a count so the voxel side can drop exactly what was built and
   nothing else - the counts.pave idiom. If a model fails to load the count is still returned
   (buildProps degrades to a lit box rather than to a hole), so the two layers can never both be
   drawing the same object. */
function buildHubDecoProps(world){
  const out = {};
  /* What this pass COSTS, reported rather than guessed. A prop set draws one InstancedMesh per
     variant per primitive, so thirty blooms split six ways is not one draw call, and the hub is
     the place Oliver's 60fps phone budget is spent idling. */
  const before = group.children.length;
  const lamps = [], blooms = [];
  for(const d of (world.deco || [])){
    if(!d || d.w == null) continue;
    if(d.kind === 'lantern' && d.lead !== false) lamps.push(d);
    else if(d.kind === 'flower' && d.lead !== false) blooms.push(d);
  }
  /* hubPiece, not buildProps, and the difference is the whole point of converting these: buildProps
     deliberately keeps a prop's own material, which is right for a wood full of trees and wrong
     here. The Waystation already stands ten of this exact model down its approach and paints them
     '#6b5636'; casting the plaza's four untinted left the courtyard with two different-coloured
     lamps thirty feet apart - a mint one at the fountain, a dark green one behind it - which is a
     more obvious inconsistency than the voxel box they replaced (_shot/out/h2-after.png).
     postH is the tree's trunkH in a third place: the lead deco is the lamp HOUSING, perched on a
     collision column the deco list does not contain, so its y0 is the top of the post and an
     unadjusted model would hang from there. */
  out.hubLamp = hubPiece('hubLantern', lamps, (o, d, rec) => {
    const sc = (d.lampH || d.h || 76) / rec.height;
    o.position.set(d.x, (d.y0 || 0) - (d.postH || 0), d.z);
    o.rotation.set(0, hash(d.x, d.z) * 6.283, 0);
    o.scale.set(sc, sc, sc);
  }, '#6b5636');
  if(blooms.length){
    buildProps(blooms, PROP_SETS.flower, 18);
    out.hubFlower = blooms.length;
  }
  /* THE SMITH'S ANVIL — the first thing drawWaystation FURNISHES the hub with to become a model.
     Everything above came out of G.deco; this does not, and that is the point. drawWaystation
     draws the keepers, their stalls, the forge, the mirror and the beast cages, and none of it has
     ever been in the deco list, so none of it could reach any 3D pipeline at all. G.hubNpcs is
     handed over by __BF_WORLD for the same reason HUB_STONE is: the object exists only inside the
     hub's own draw call, so there is nothing else to convert from.
     buildProps, NOT hubPiece, and that distinction has already cost this file once. hubPiece
     instances `rec.geo`/`rec.mat`, which is the FIRST primitive only — this model is a log and an
     anvil in two materials, so hubPiece would stand half of it in the yard, the same trap the
     loader's own "two thirds of the model quietly dropped" note describes. buildProps also keeps
     the model's own texture, which is right here and was wrong for the plaza lamps (those had to
     match ten hand-painted ones).
     Sized to the voxel smithy it replaces — 52 wide, 42 to the top of the face — so the forge with
     its live fire, the rising embers, the quench trough, the tool rack and the Smith himself, all
     of which stay voxel because all of them move, keep standing exactly where they were placed
     around it. */
  const anvils = (world.hubNpcs || [])
    .filter(n => n && n.prop === 'anvil')
    .map(n => ({ x:n.x, z:n.z, y0:0, w:52, h:42 }));
  if(anvils.length){
    buildProps(anvils, PROP_SETS.hubAnvil, 42);
    out.hubAnvil = anvils.length;
  }
  out.hubDecoDraws = group.children.length - before;
  return out;
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
    /* The hub never reported what it costs to draw. Every zone has published `drawCalls` since the
       first conversion, and the Waystation - the place VISION.md says players will idle in - was
       the one destination where "did that change cost anything" could not be answered at all.
       0 in a hub sub-area that builds nothing, which is itself the honest answer. */
    WORLD3D.counts = Object.assign({ hub: true, drawCalls: group.children.length }, c);
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
                 fence: [], grave: [], pillar: [], column: [], flower: [], lantern: [], corn: [],
                 standstone: [], building: [], skip: [] };
  for(const d of deco){
    if(!d || d.w == null) continue;
    bins[classify(d)].push(d);
  }

  /* Roads are planned BEFORE the floor, because the floor has to know where they are: on grass a
     road replaces the ground under it rather than sitting on top of it. Stone zones get no road
     pieces of their own - the plan is still needed, to tell the floor which cells to pave. */
  const gspec = groundSpecFor(world);
  const roadPlan = planPaths(world);
  const ground = buildGround(world, roadPlan);
  const floorTiles = ground.tiles;
  const roadTiles = gspec.grass ? drawPaths(roadPlan, gspec) : 0;

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
     canopy box height alone would place a pine a third of its proper size.
     ...and it has to be STOOD ON THE GROUND, which is the half that was missing. A prop is placed
     at the deco's y0, and every other kind of deco gives its y0 as the object's base - but a tree
     is emitted as a voxel trunk COLUMN with a canopy box perched on top, and the lead deco is the
     CANOPY. Its y0 is therefore the top of the trunk, so the whole model was hung from there:
     measured in the Outskirts, 118 trees with their bases at y 98-108 over a floor at 0 and a
     fitted height of 163. The trunk world3d skips (`ob.treeCol`) is exactly the gap. Subtracting
     trunkH puts the model where the object it replaces starts. Trees with no trunkH - the
     theme-fallback border scenery - already give y0 as their base and are untouched. */
  buildProps(bins.tree.map(d => (d.trunkH ? Object.assign({}, d, { y0: (d.y0 || 0) - d.trunkH }) : d)),
             PROP_SETS.tree, 90, d => (d.trunkH || 0) + (d.h || 40) + 30);
  buildProps(bins.rock, PROP_SETS.rock, 20);
  buildProps(bins.fence, PROP_SETS.fence, 30);
  buildProps(bins.grave, PROP_SETS.grave, 30);
  buildProps(bins.pillar, PROP_SETS.pillar, 80);
  /* Exactly the trees' problem in a second place: the Sunspire Palace's processional colonnade
     emits a voxel SHAFT with a gold CAPITAL perched on top, and the capital is the lead deco - so
     its y0 is the top of the shaft and an unadjusted model hangs from there. `pillarH` is the
     shaft height, the same role trunkH plays above, and the fitted height is shaft + capital so
     the model stands as tall as the column the level actually built. Columns with no pillarH - the
     Hall of Statues' free-standing marble shafts - give y0 as their base already and are
     untouched. */
  buildProps(bins.column.map(d => (d.pillarH ? Object.assign({}, d, { y0: (d.y0 || 0) - d.pillarH }) : d)),
             PROP_SETS.column, 80, d => (d.pillarH || 0) + (d.h || 80));
  buildProps(bins.flower, PROP_SETS.flower, 18);
  /* Height alone, and lampH not d.h: the lead deco is only the POST, so d.h would stand a
     lightpost 38 tall where the object the generator built is 47 tall to the top of its head. */
  /* `postH` is subtracted here for the same reason it is in buildHubDecoProps, so the field means
     one thing in both places: a lantern whose lead deco is the HOUSING gives y0 as the top of its
     post. Roadside lanterns tag the post itself and carry no postH, so they are untouched. */
  buildProps(bins.lantern.map(d => (d.postH ? Object.assign({}, d, { y0: (d.y0 || 0) - d.postH }) : d)),
             PROP_SETS.lantern, 47, d => (d.lampH || d.h || 47), true);
  /* Standing stones, by HEIGHT alone - see PROP_SETS.standstone for why. */
  buildProps(bins.standstone, PROP_SETS.standstone, 90, d => (d.h || 90), true);
  /* CROPS, as real lit boxes rather than models, and that is a measured choice rather than a
     shortcut. The repo has no wheat or corn asset in any kit. Casting the stalks onto the
     tall-grass set WAS built and rendered (b3-corn-fix1.png): the plants stand at the right
     height, but a prop carries its own texture, so 812 golden stalks become a dense TEAL thicket
     and the West Cornlands reads as jungle. instanceColor cannot recover it either - it
     multiplies, and no multiple of teal is gold.
     A 4x30 golden box already IS a corn stalk, so drawing the level's own geometry lit is the
     faithful conversion here: same field as the voxel renderer, now taking light. The leaf nub
     stays too - it is what gives the rows their texture at eye level.
     A real crop model from Oliver would beat this; until then, honest beats ambitious. */
  buildCategory(scene, bins.corn, boxGeo(), mat(), (o, d) => {
    o.position.set(d.x, d.y0 || 0, d.z);
    o.rotation.set(0, 0, 0);
    o.scale.set(d.w, Math.max(1, d.h || 1), d.d || d.w);
  });
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

  WORLD3D.counts = { floorTiles, floorBuried: ground.buried, roadTiles, roadPaved: ground.paved,
                     roadPlanned: roadPlan ? roadPlan.count : 0,
                     deco: deco.length, box: bins.box.length, foliage: bins.foliage.length,
                     tufts: tufts, tree: bins.tree.length, shard: bins.shard.length,
                     rock: bins.rock.length, fence: bins.fence.length, grave: bins.grave.length,
                     pillar: bins.pillar.length, column: bins.column.length,
                     flowerProps: bins.flower.length,
                     lantern: bins.lantern.length, corn: bins.corn.length,
                     standstone: bins.standstone.length,
                     buildings: zoneBuild.buildings, skipped: bins.skip.length,
                     drawCalls: group.children.length,
                     propsLoaded: [..._propCache.entries()].filter(e => e[1]).map(e => e[0]),
                     /* Which loaded models are made of more than one primitive - i.e. exactly the
                        ones that used to draw as a fraction of themselves. The audit, in numbers. */
                     multiPart: [..._propCache.entries()].filter(e => e[1] && e[1].subs && e[1].subs.length > 1)
                                  .map(e => e[0] + ':' + e[1].subs.length) };
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
    clearProps();         // ...nor its chests
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
