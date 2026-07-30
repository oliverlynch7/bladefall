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
  /* Facing offset. I originally guessed Math.PI on the assumption the glTF characters face
     away from the game's yaw 0 — wrong: Oliver reported the character running backwards, which
     is the signature of being exactly 180 degrees out. Tunable via ?yawoff= if a future model
     differs. */
  yawOff: 0,
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
  if(q.get('yawoff')) HERO3D.yawOff = parseFloat(q.get('yawoff')) || 0;
} catch(e){}


/* ─────────────────────────────────────────────────────────────────────────────
   PORTED FROM THE SLICE — Oliver's tuned faces and weapon rules.

   These constants and functions are copied VERBATIM from public/slice3d/index.html rather than
   retyped, because FACE_PRESETS and FACE_FRAMES are hours of work Oliver tuned by eye and a
   transcription slip would silently move every face.

   Duplication is deliberate. The slice is a single 5,300-line file with these systems inline;
   extracting them into a shared module would mean editing the file that holds his tuned work,
   and the risk of breaking that outweighs the cost of two copies. Worth deduplicating later,
   from the slice side, once the renderer is settled.

   THE RULE THAT MUST HOLD: face offsets are fractions of a stored placement FRAME. Never change
   how the head is measured without converting the stored values in the same commit.
   ───────────────────────────────────────────────────────────────────────────── */

const FACE_FRAMES = {
  Warrior:{w:0.571448,h:0.795308,d:0.777282,cz:-0.187631,minY:-0.020652,maxY:0.774656,eyeY:0.440627,
           centre:[0.000602,0.377002,-0.187631],fwd0:[0.000547,0.112086,0.993698],up:[-0.000062,0.993698,-0.112086]},
  Ranger: {w:0.572455,h:0.742068,d:0.778651,cz:-0.181288,minY:-0.005073,maxY:0.736995,eyeY:0.425326,
           centre:[0.000605,0.365961,-0.181288],fwd0:[0.000547,0.112086,0.993698],up:[-0.000062,0.993698,-0.112086]},
  Wizard: {w:0.678373,h:0.900609,d:0.844725,cz:-0.216029,minY:-0.020441,maxY:0.880168,eyeY:0.501912,
           centre:[0.000595,0.429864,-0.216029],fwd0:[0.000547,0.112086,0.993698],up:[-0.000062,0.993698,-0.112086]},
  Cleric: {w:0.670265,h:0.866078,d:0.834630,cz:-0.205288,minY:-0.031627,maxY:0.834451,eyeY:0.470698,
           centre:[0.000600,0.401412,-0.205288],fwd0:[0.000547,0.112086,0.993698],up:[-0.000062,0.993698,-0.112086]},
  Monk:   {w:0.668034,h:0.862685,d:0.831851,cz:-0.197482,minY:-0.027455,maxY:0.835230,eyeY:0.472902,
           centre:[0.000580,0.403888,-0.197482],fwd0:[-0.128986,0.071314,0.989079],up:[-0.000062,0.993698,-0.112086]},
  Rogue:  {w:0.669730,h:0.865386,d:0.833963,cz:-0.202956,minY:-0.033046,maxY:0.832340,eyeY:0.468878,
           centre:[0.000601,0.399647,-0.202956],fwd0:[-0.129092,0.111141,0.985385],up:[-0.000062,0.993698,-0.112086]},
};

const FACE_PRESETS = {
  Warrior: {
    /* Retuned after the face-direction fix. The first pass had flip:true and depth:-0.075,
       which were compensating for the broken direction detection rather than describing
       where the eyes belong; with that fixed the values are straightforward. */
    eye:   { spread:0.145, height:-0.185, depth:0.095, size:0.092, squash:0.66, tilt:0.17,
             iris:'#9b2c2c', pupil:'#000000', flip:false,
             offX:0, faceYaw:0, facePitch:0, irisSz:0.52 },
    mouth: { shape:'line', y:-0.465, z:0.095, width:0.27, height:0.455, color:'#5a2f28',
             offX:0 },
  },
  Ranger: {
    eye:   { spread:0.175, height:-0.220, depth:0.075, size:0.092, squash:0.66, tilt:-0.130,
             iris:'#9b2c2c', pupil:'#101014', flip:false,
             offX:0, faceYaw:0, facePitch:0, irisSz:0.52 },
    mouth: { shape:'line', y:-0.465, z:0.095, width:0.280, height:0.295, color:'#5a2f28',
             offX:0 },
  },
  Wizard: {
    eye:   { spread:0.195, height:-0.225, depth:0.020, size:0.088, squash:0.62, tilt:0,
             iris:'#3a6ea5', pupil:'#101014', flip:false,
             offX:0, faceYaw:0, facePitch:0, irisSz:0.52 },
    mouth: { shape:'flat', y:-0.505, z:0.075, width:0.310, height:0.260, color:'#483e3c',
             offX:0 },
  },
  Cleric: {
    eye:   { spread:0.230, height:-0.210, depth:0.095, size:0.076, squash:0.62, tilt:0,
             iris:'#3a6ea5', pupil:'#101014', flip:false,
             offX:0, faceYaw:0, facePitch:0, irisSz:0.52 },
    mouth: { shape:'smile', y:-0.465, z:0.135, width:0.340, height:0.200, color:'#5a2f28',
             offX:0 },
  },
  Monk: {
    /* First set tuned with the controls added for this model specifically: faceYaw/facePitch
       correct the angled face, and the mouth needed a lateral nudge. Both were unreachable
       before, which is why the Monk was the hold-out. */
    /* Re-tuned against the frozen placement frame and locked, 2026-07-29. Note faceYaw
       flipped sign (-0.130 -> +0.150): the earlier value was partly compensating for the
       drifting reference, not describing the head. */
    eye:   { spread:0.200, height:-0.220, depth:0.020, size:0.082, squash:0.81, tilt:-0.500,
             iris:'#2f6b45', pupil:'#101014', flip:false,
             offX:-0.015, faceYaw:0.150, facePitch:0.040, irisSz:0.52 },
    mouth: { shape:'flat', y:-0.455, z:0.055, width:0.355, height:0.360, color:'#5a2f28',
             offX:0.015 },
  },
  Rogue: {
    // Hooded, so the measured head box runs high and the face sits turned — same two
    // problems as the Monk, and solved by the same pair of controls.
    /* Re-tuned and locked, 2026-07-29. offX 0.175 is a real lateral shift: this head sits
       noticeably off-centre on its own bone, which is what that control was added for. */
    eye:   { spread:0.195, height:-0.265, depth:0.040, size:0.080, squash:0.62, tilt:-0.010,
             iris:'#3a6ea5', pupil:'#101014', flip:false,
             offX:0.175, faceYaw:-0.130, facePitch:-0.040, irisSz:0.52 },
    /* Mouth sits INSIDE the head on purpose (z negative). Oliver's call: the scarf covers
       that part of the face anyway, so drawing a mouth there only risks it poking through.
       Kept rather than disabled so the class still works if the scarf ever comes off. */
    mouth: { shape:'smirk', y:-0.625, z:-0.075, width:0.340, height:0.200, color:'#5a2f28',
             offX:0 },
  },
};

const EYE = {
  on: true,
  /* Oliver's tuned Warrior values, 2026-07-29. These are the shipping defaults now —
     everything below was dialled in on a real head at real size, which beats any number
     I would have guessed. `flip` is true because the derived face direction comes out
     inverted on this rig; that is what the toggle exists for. */
  spread: 0.13,
  height: -0.185,
  depth:  -0.075,
  size:   0.072,
  squash: 0.66,
  tilt:   0.17,
  white:  '#f2efe6',
  iris:   '#9b2c2c',
  pupil:  '#000000',
  irisSz: 0.52,
  showWhite: true,
  /* Lateral shift of the whole pair. `spread` moves the eyes apart from each other;
     this slides both together. The Monk needs it because his head geometry is not
     centred on its own bone, so centring the pair on the measured head still lands
     them off to one side. Separate control, because they are separate problems. */
  offX: 0,
  /* Face-plane alignment. On the Rogue and Monk the face is not perpendicular to the
     head's forward axis — it is turned slightly. Pushing both eyes along one shared FWD
     vector then drives one INTO the mesh while the other bulges out, which no per-eye
     control can fix because the two eyes are behaving correctly relative to each other;
     it is the PLANE that is wrong. These rotate the whole RIGHT/UP/FWD frame so 'forward'
     means perpendicular to the actual face. Shared by eyes and mouth, since they describe
     the head rather than any one feature. */
  faceYaw: 0,
  facePitch: 0,
  onTop: false,
  flip: true,
};

const MOUTH = {
  on: true,
  shape: 'line',
  y: -0.465,
  z: -0.95,
  width: 0.27,
  height: 0.275,
  color: '#5a2f28',
  offX: 0,
  onTop: false,
  flip: false,
};

const MOUTH_SHAPES = ['line','smile','grin','teeth','frown','o','smirk','open','flat'];

const EYE_DEFAULT   = JSON.parse(JSON.stringify(EYE));
const MOUTH_DEFAULT = JSON.parse(JSON.stringify(MOUTH));
const _mouthTex = {};

/* Which body each of the 16 classes wears. Same mapping as the slice: six models, and the
   classes that share one are separated by tint rather than geometry. */
const CLASS_TO_MODEL = {
  warrior:'Warrior', berserker:'Warrior', pirate:'Warrior',
  bladedancer:'Rogue', reaper:'Rogue', ninja:'Rogue',
  paladin:'Cleric',
  monk:'Monk',
  ranger:'Ranger', beastmaster:'Ranger', skylancer:'Ranger',
  mage:'Wizard', stormcaller:'Wizard', warlock:'Wizard',
  necromancer:'Wizard', chronomancer:'Wizard',
};

const ARCHETYPE_WEAPONS = {
  // NB the sword patterns are anchored. /^Sword/ also matched Sword_Big, which is now
  // reserved as the mage spellblade — a loose prefix would have handed it back to warriors.
  /* No spear or scythe: the spear belongs to the Ranger and the scythe to the Reaper, so
     dropping them here keeps each weapon on one body and one tuning wherever possible. */
  Warrior: [/^Sword$/, /^Sword_2$/, /^Sword_Golden$/, /^Claymore/,
            /^Axe/, /^Hammer/, /^Shield/],
  Cleric:  [/^Hammer/, /^Sword$/, /^Sword_2$/, /^Staff_/, /^Shield/],
  // Scythe added for the Reaper, which uses this skin. Note it now appears on TWO bodies,
  // which is what forced weapon tuning to become per-body below.
  Rogue:   [/^Dagger/, /^Sword$/, /^Sword_2$/, /^Scythe/],
  Ranger:  [/^Bow/, /^Arrow/, /^Spear/, /^Dagger/],
  /* Casters: two staffs plus the SPELLBLADE.

     Staff_Wizard is the staff, Staff_Cleric doubles as the wand at reduced scale, and
     Sword_Knight is the spellblade — exclusive to the mage archetypes, which is the point:
     it gives casters a melee silhouette nobody else has. Removed from Warrior, Cleric and
     Rogue so it stays exclusive. (Sword_Big served this role earlier and is retired.)

     All three are stock weapons lifted from the characters that own them, so they inherit
     the artist's holding pose and need no tuning to look correct. */
  Wizard:  [/^Staff_/, /^Sword_Knight$/],
  Monk:    [],                       // unarmed by design
};

const WEAPON_PRESETS = {
  // Oliver tuned the plain sword to all-zero rotations, which is worth noting: the
  // pitch/yaw/roll trio I derived from the axes is the AXE-family orientation, not a
  // universal one. Swords hang differently.
  Sword:               { len:1.01, pitch:0, yaw:0, roll:0, fwd:0, up:-0.37, side:0, grip:0.72 },
  Sword_2:             { len:1.01, pitch:0, yaw:0, roll:0, fwd:0, up:-0.37, side:0, grip:0.72 },
  Sword_Golden:        { len:1.01, pitch:0, yaw:0, roll:0, fwd:0, up:-0.37, side:0, grip:0.72 },
  Claymore:            { len:1.20, up:-0.39, side:-0.03, fwd:-0.04 },
  // SPELLBLADE - tuned by Oliver on the WIZARD body, not the Warrior. Held point-up and
  // forward, which is why the numbers look nothing like the melee set.
  Sword_Big:           { len:1.00, pitch:1.52, yaw:-0.40, roll:0,
                         fwd:-0.39, up:-0.03, side:0, grip:0.74 },
  Sword_big_Golden:    { len:1.00, pitch:1.52, yaw:-0.40, roll:0,
                         fwd:-0.39, up:-0.03, side:0, grip:0.74 },
  Axe:                 { len:1.00, up:-0.41, side:-0.13, fwd:-0.04 },
  Axe_Small:           { len:1.00, up:-0.46, side:-0.19, fwd:-0.04 },
  Axe_Double:          { len:1.00, up:-0.46, side:-0.05, fwd:-0.04 },
  Axe_Double_Golden:   { len:1.00, up:-0.46, side:-0.05, fwd:-0.04 },
  Hammer_Small:        { len:1.00, up:-0.36, side:-0.10, fwd:-0.03 },
  Hammer_Double:       { len:1.20, up:-0.39, side:-0.03, fwd:-0.01, pitch:0.06 },
  Hammer_Double_Golden:{ len:1.20, up:-0.39, side:-0.03, fwd:-0.01, pitch:0.06 },
  Scythe:              { len:1.20, pitch:3.14, yaw:0.26, roll:-2.84,
                         fwd:-0.04, up:0.01, side:-0.17, grip:0.29 },

  /* BOWS - Oliver, tuned on the Ranger body, and the hardest set so far. Worth recording
     WHY, because it is structural rather than a tuning failure.

     Every other weapon is gripped near one END, so the pivot sits in the fist and the
     blade points away. A bow is gripped at its MIDDLE, and the limbs extend both up and
     down from the hand. With the hand hanging at hip height the lower limb has nowhere to
     go but through the thigh, so 'looks good in hand' and 'does not clip the leg' pull
     against each other. No slider fixes that; only a shorter bow or a raised arm does.

     Mitigated by shrinking them (len 0.82-0.89) and pushing them forward (fwd -0.62),
     which is what Oliver landed on. Good enough for a carry pose. */
  Bow_Evil:    { len:0.89, pitch:1.42, yaw:-0.16, roll:-0.26, fwd:-0.62, up:-0.08, side:-0.01, grip:0.63 },
  Bow_Golden:  { len:0.89, pitch:1.48, yaw:-0.36, roll:-0.26, fwd:-0.62, up:-0.03, side: 0.00, grip:0.63 },
  Bow_Wooden:  { len:0.82, pitch:1.48, yaw:-0.20, roll:-0.26, fwd:-0.62, up:-0.03, side: 0.03, grip:0.62 },
  Dagger:      { len:0.82, pitch:1.48, yaw:3.20, roll:0.30, fwd:-0.62, up:-0.09, side:0.00, grip:1.00 },
  Dagger_2:    { len:0.88, pitch:1.48, yaw:3.20, roll:0.30, fwd:-0.62, up:-0.09, side:0.00, grip:0.93 },
  Dagger_Golden:{len:0.82, pitch:1.48, yaw:3.20, roll:0.30, fwd:-0.62, up:-0.09, side:0.00, grip:1.00 },
  Spear:       { len:0.88, pitch:1.38, yaw:3.20, roll:0.30, fwd:-0.62, up:-0.14, side:-0.14, grip:0.93 },
  Bow_Wooden2: { len:0.82, pitch:1.48, yaw:-0.20, roll:-0.26, fwd:-0.62, up:-0.03, side: 0.01, grip:0.62 },

  /* Stock weapons carry the artist's own placement, so they start neutral — length 1 and
     no rotation means "exactly as the character that owns it holds it". */
  // the WAND: same model as the cleric staff, scaled down
  Staff_Cleric: { len:0.72, pitch:0, yaw:0, roll:0, fwd:0, up:0, side:0, shaft:0 },
  Staff_Wizard: { len:1, pitch:0, yaw:0, roll:0, fwd:0, up:0, side:0, shaft:0 },
  Sword_Knight: { len:1, pitch:0, yaw:0, roll:0, fwd:0, up:0, side:0, shaft:0 },
  Dagger_Rogue: { len:1, pitch:0, yaw:0, roll:0, fwd:0, up:0, side:0, shaft:0 },
  Bow_Ranger:   { len:1, pitch:0, yaw:0, roll:0, fwd:0, up:0, side:0, shaft:0 },
};

const STOCK_WEAPONS = {
  Staff_Cleric:  { from:'Cleric',  node:'Cleric_Staff'  },
  Staff_Wizard:  { from:'Wizard',  node:'Wizard_Staff'  },
  Sword_Knight:  { from:'Warrior', node:'Warrior_Sword' },
  Dagger_Rogue:  { from:'Rogue',   node:'Rogue_Dagger'  },
  Bow_Ranger:    { from:'Ranger',  node:'Ranger_Bow'    },
};

const DEFAULT_WEAPON = {
  Warrior: 'Sword', Cleric: 'Staff_Cleric', Rogue: 'Dagger',
  Ranger:  'Bow_Wooden', Wizard: 'Staff_Wizard', Monk: null,
};

const WEAP = { on:true, name:'Sword', len:1.0, roll:0.10, pitch:0.10, yaw:-3.20,
               fwd:0, up:-0.39, side:-0.03, grip:0.72, shaft:0, hideStock:true };

/* The 28 staged weapon files. The archetype rules above are ported and correct, but the equip
   machinery is a later batch — the RPG models already carry their own weapon geometry, so the
   character is armed without it. */
const WEAPONS_FILE = ['Arrow','Axe','Axe_Double','Axe_Double_Golden','Axe_Small','Bow_Evil',
  'Bow_Golden','Bow_Wooden','Bow_Wooden2','Claymore','Dagger','Dagger_2','Dagger_Golden',
  'Hammer_Double','Hammer_Double_Golden','Hammer_Small','Scythe','Shield_Celtic_Golden',
  'Shield_Heater','Shield_Heater_2','Shield_Round','Shield_Round_2','Spear','Sword','Sword_2',
  'Sword_Big','Sword_Golden','Sword_big_Golden'];

function eyeModel(){ return HERO3D.model || 'Warrior'; }
function storedFrame(model){ return FACE_FRAMES[model] || null; }
function eyeLoadFor(model){
  Object.assign(EYE, EYE_DEFAULT, (FACE_PRESETS[model] || {}).eye || {});
}
function mouthLoadFor(model){
  Object.assign(MOUTH, MOUTH_DEFAULT, (FACE_PRESETS[model] || {}).mouth || {});
}
function findHeadBone(actor){
  let head = null;
  actor.root.traverse(o => { if(!head && o.isBone && /^head$/i.test(o.name.replace(/[^a-z]/gi,''))) head = o; });
  return head;
}
/* Frames are DATA here, always. The slice falls back to measuring for an unknown model; in the
   game every model has a frozen frame, so measurement is never reached and a face cannot drift. */
function headMetrics(actor){
  const f = storedFrame(eyeModel());
  if(!f) return null;
  const head = findHeadBone(actor);
  return head ? frameToMetrics(f, head) : null;
}
function clearEyes(actor){
  if(!actor || !actor._eyes) return;
  for(const m of actor._eyes){ if(m.parent) m.parent.remove(m); }
  actor._eyes = null;
}
function clearMouth(actor){
  if(!actor || !actor._mouth) return;
  if(actor._mouth.parent) actor._mouth.parent.remove(actor._mouth);
  actor._mouth = null;
}

function frameToMetrics(f, head){
  const FWD0 = new THREE.Vector3().fromArray(f.fwd0);
  const UP   = new THREE.Vector3().fromArray(f.up);
  const FWD  = FWD0.clone();
  let RIGHT  = new THREE.Vector3().crossVectors(UP, FWD).normalize();
  if(EYE.faceYaw){
    FWD.applyAxisAngle(UP, EYE.faceYaw).normalize();
    RIGHT = new THREE.Vector3().crossVectors(UP, FWD).normalize();
  }
  if(EYE.facePitch) FWD.applyAxisAngle(RIGHT, EYE.facePitch).normalize();
  return { head, w:f.w, h:f.h, d:f.d, cz:f.cz, minY:f.minY, maxY:f.maxY, eyeY:f.eyeY,
           centre:new THREE.Vector3().fromArray(f.centre), FWD, FWD0, UP, RIGHT, verts:-1, fromFrame:true };
}

function mouthTexture(shape, color){
  const key = shape + '|' + color;
  if(_mouthTex[key]) return _mouthTex[key];
  const S = 256, c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d');
  x.clearRect(0,0,S,S);
  x.strokeStyle = color; x.fillStyle = color;
  x.lineCap = 'round'; x.lineJoin = 'round';
  const LW = S*0.085; x.lineWidth = LW;
  const cx = S/2, cy = S/2, w = S*0.34, h = S*0.22;
  const curve = (dip) => {
    x.beginPath();
    x.moveTo(cx-w, cy - dip*0.5);
    x.quadraticCurveTo(cx, cy + dip, cx+w, cy - dip*0.5);
    x.stroke();
  };
  if(shape === 'line' || shape === 'flat'){
    x.beginPath(); x.moveTo(cx-w, cy); x.lineTo(cx+w, cy); x.stroke();
  } else if(shape === 'smile'){
    curve(h*1.5);
  } else if(shape === 'frown'){
    curve(-h*1.5);
  } else if(shape === 'smirk'){
    x.beginPath(); x.moveTo(cx-w, cy+h*0.35);
    x.quadraticCurveTo(cx, cy+h*0.55, cx+w, cy-h*0.5); x.stroke();
  } else if(shape === 'o'){
    x.beginPath(); x.ellipse(cx, cy, w*0.46, h*1.15, 0, 0, Math.PI*2); x.fill();
  } else if(shape === 'open'){
    x.beginPath(); x.ellipse(cx, cy, w*0.72, h*1.5, 0, 0, Math.PI*2); x.fill();
  } else if(shape === 'grin'){
    // filled crescent — a wide open smile
    x.beginPath();
    x.moveTo(cx-w, cy-h*0.35);
    x.quadraticCurveTo(cx, cy+h*2.0, cx+w, cy-h*0.35);
    x.closePath(); x.fill();
  } else if(shape === 'teeth'){
    x.beginPath();
    x.moveTo(cx-w, cy-h*0.35);
    x.quadraticCurveTo(cx, cy+h*2.0, cx+w, cy-h*0.35);
    x.closePath(); x.fill();
    x.strokeStyle = '#f4efe4'; x.lineWidth = LW*0.85;
    x.beginPath(); x.moveTo(cx-w*0.82, cy-h*0.18); x.lineTo(cx+w*0.82, cy-h*0.18); x.stroke();
  }
  (window.__mouthCanvases = window.__mouthCanvases || {})[shape] = c;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  _mouthTex[key] = t;
  return t;
}

function addEyes(actor, useSaved){
  if(!actor) return null;
  clearEyes(actor);
  if(useSaved !== false) eyeLoadFor(eyeModel());
  if(!EYE.on) return null;
  const M = headMetrics(actor);
  if(!M) return null;
  const SGN = EYE.flip ? -1 : 1;

  const made = [];
  const mk = (geo, col) => {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: col, depthTest: !EYE.onTop, depthWrite: !EYE.onTop }));
    m.userData._eye = true; m.renderOrder = EYE.onTop ? 999 : 3;
    return m;
  };
  const R = M.w * EYE.size;
  for(const side of [-1, 1]){
    const g = new THREE.Group(); g.userData._eye = true;
    /* Iris and pupil are flat DISCS stacked just proud of the sclera, not spheres nested
       inside it. As spheres the pupil sat entirely within the iris sphere's volume; with
       depth testing off, draw order hid the problem, but the moment 'draw through head'
       was unticked the iris correctly occluded the pupil and it vanished. Discs cannot
       intersect each other, so the layering holds in both modes.

       They keep depthTest (so the head still hides the eye when you look from behind) but
       skip depthWrite and use renderOrder to stack, which avoids z-fighting against the
       sclera surface they sit on. */
    const frontZ = R * 0.55;
    if(EYE.showWhite){
      const w = mk(new THREE.SphereGeometry(1, 14, 10), EYE.white);
      w.scale.set(R, R*EYE.squash, frontZ); g.add(w);
    }
    const irR = R * EYE.irisSz * 0.9;
    const ir = mk(new THREE.CircleGeometry(1, 20), EYE.iris);
    ir.scale.setScalar(irR);
    ir.position.z = frontZ * 0.995;
    ir.material.depthWrite = false; ir.renderOrder = (EYE.onTop ? 999 : 3) + 1;
    g.add(ir);
    const pu = mk(new THREE.CircleGeometry(1, 16), EYE.pupil);
    pu.scale.setScalar(irR * 0.5);
    pu.position.z = frontZ * 1.02;
    pu.material.depthWrite = false; pu.renderOrder = (EYE.onTop ? 999 : 3) + 2;
    g.add(pu);

    /* Build the position from the head's own basis vectors: sideways along RIGHT, up
       along UP, outward along FWD. Works whichever way the bone happens to be oriented. */
    g.position.copy(M.centre)
      .addScaledVector(M.RIGHT, (side * EYE.spread + EYE.offX) * M.w)
      .addScaledVector(M.UP,    (M.eyeY - (M.minY + M.h/2)) + M.h * EYE.height)
      .addScaledVector(M.FWD,   SGN * (M.d * (0.5 + EYE.depth)));
    g.lookAt(g.position.clone().addScaledVector(M.FWD, SGN * 10));
    g.rotateZ(-side * EYE.tilt);
    M.head.add(g);
    made.push(g);
  }
  actor._eyes = made;
  return { verts: M.verts };
}

function addMouth(actor, useSaved){
  if(!actor) return null;
  clearMouth(actor);
  if(useSaved !== false) mouthLoadFor(eyeModel());
  if(!MOUTH.on) return null;
  const M = headMetrics(actor);
  if(!M) return null;

  const tex = mouthTexture(MOUTH.shape, MOUTH.color);
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: true, alphaTest: 0.04,
    depthTest: !MOUTH.onTop, depthWrite: false, side: THREE.DoubleSide,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1,1), mat);
  m.userData._eye = true;                       // excluded from head measurement
  m.renderOrder = MOUTH.onTop ? 999 : 3;
  const MSGN = MOUTH.flip ? -1 : 1;
  m.scale.set(M.w * MOUTH.width, M.w * MOUTH.height, 1);
  m.position.copy(M.centre)
    .addScaledVector(M.RIGHT, MOUTH.offX * M.w)
    .addScaledVector(M.UP,  (M.eyeY - (M.minY + M.h/2)) + M.h * MOUTH.y)
    .addScaledVector(M.FWD, MSGN * (M.d * (0.5 + MOUTH.z)));
  m.lookAt(m.position.clone().addScaledVector(M.FWD, MSGN * 10));
  M.head.add(m);
  actor._mouth = m;
  return { shape: MOUTH.shape };
}

/* Weapons. Same archetype rules and tuned transforms as the slice: a class may only carry what
   suits its body, which is what kept tuning to ~28 weapons instead of 168. */
function weaponsFor(model){
  const rules = ARCHETYPE_WEAPONS[model];
  if(!rules) return [];
  const all = WEAPONS_FILE.concat(Object.keys(STOCK_WEAPONS));
  return all.filter(w => rules.some(re => re.test(w)));
}
function weapLoadFor(){
  const n = WEAP.name;
  Object.assign(WEAP, WEAP_DEFAULT, WEAPON_PRESETS[n] || {},
                (WEAPON_PRESETS_BY_MODEL[eyeModel()] || {})[n] || {}, { name:n, on:true });
}
const WEAP_DEFAULT = JSON.parse(JSON.stringify(WEAP));
const WEAPON_PRESETS_BY_MODEL = {
  Rogue: { Scythe: { len:1.20, pitch:3.14, yaw:0.26, roll:-2.84,
                     fwd:-0.04, up:0.01, side:-0.17, grip:0.29, shaft:0 } },
};

let renderer = null, scene = null, cam = null, actor = null, mixer = null;
let clips = {}, cur = null, clock = null;
let _lastW = 0, _lastH = 0;
let _loaded = {}, _classNow = null;

/* The player's class, from the game's own state. */
function modelForClass(){
  try {
    const m = window.__BF_META && window.__BF_META();
    const id = m && m.classId;
    return CLASS_TO_MODEL[id] || 'Warrior';
  } catch(e){ return 'Warrior'; }
}

/* Build the face from the frozen frame + Oliver's preset for whichever model is worn. */
function buildFace(){
  if(!actor) return null;
  const holder = { root: actor };
  eyeLoadFor(eyeModel());
  mouthLoadFor(eyeModel());
  clearEyes(holder); clearMouth(holder);
  const e = addEyes(holder, false);
  const mo = addMouth(holder, false);
  HERO3D.face = { model: eyeModel(), eyes: !!e, mouth: !!mo };
  return HERO3D.face;
}

/* Swap body when the class changes — respec, or a different save. Re-loads rather than clones,
   because cloning a glTF binds the copy's SkinnedMesh to the ORIGINAL skeleton, which collapses
   the body while bone-parented props keep drawing. That bug cost a session in the slice. */
function syncClass(){
  const want = modelForClass();
  if(want === _classNow) return;
  const g = _loaded[want];
  if(!g) return;
  _classNow = want;
  HERO3D.model = want;
  const wrap = HERO3D._wrap;
  if(actor && actor.parent) actor.parent.remove(actor);
  actor = g.scene;
  actor.traverse(o => { if(o.isMesh){ o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false; } });
  wrap.add(actor);
  mixer = new THREE.AnimationMixer(actor);
  cur = null;
  buildFace();
}
let _angle = null, _maxAttribs = 16;

/* Clear leftover instancing divisors before Three draws.

   This is the missing piece. The game renders with ANGLE_instanced_arrays and sets a divisor
   on its per-instance attributes (iM, iS, iCA, iE). renderer.resetState() does NOT reset
   vertexAttribDivisorANGLE, so a stale divisor can remain on an attribute location that Three
   then uses for skinIndex/skinWeight - which makes those advance per INSTANCE instead of per
   vertex. The result is garbage skinning and a collapsed, invisible body, while every
   non-skinned mesh (face, shoulder pads, sword) draws perfectly because it never touches those
   attributes. That is exactly the symptom. */
function clearDivisors(gl){
  if(!_angle){
    _angle = gl.getExtension('ANGLE_instanced_arrays');
    _maxAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS) || 16;
  }
  if(!_angle) return;
  for(let i = 0; i < _maxAttribs; i++) _angle.vertexAttribDivisorANGLE(i, 0);
}

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
    /* Which body does the player's class wear? meta.classId is the game's own field, reached
       through the __BF_META closure because `meta` is a top-level const in a classic script and
       therefore not a window property. Falls back to Warrior if the class is unknown. */
    _loaded = {};
    for(let i = 0; i < pool.length; i++) if(gs[i]) _loaded[pool[i]] = gs[i];
    HERO3D.model = modelForClass();
    const own = _loaded[HERO3D.model] || gs.find(Boolean);
    if(!own) throw new Error('no character models loaded from ' + ASSETS + 'chars/');

    actor = own.scene;
    actor.traverse(o => {
      if(!o.isMesh) return;
      o.castShadow = false; o.receiveShadow = false;
      /* Do not let Three cull these. A SkinnedMesh's bounding sphere is computed in BIND space,
         so scaling the wrap 15x and moving it across the world can make the cull test reject it
         while non-skinned children survive - which is exactly the symptom (body missing, face,
         shoulder pads and sword present). Cheap to disable for five meshes. */
      o.frustumCulled = false;
    });
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
    buildFace();                       // Oliver's tuned eyes and mouth for this model
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
  /* Clip selection from the game's own player state.

     Airborne uses Roll, matching the slice: the 26-clip pool contains NO jump animation, and a
     jump reads mostly from vertical motion, which the game already drives. A tucked pose from an
     existing clip beats inventing one. p.onGround and p.vy are the game's own fields. */
  const airborne = p.onGround === false;
  const want = p.dead ? 'Death'
             : (p.attackTimer > 0 || p.swingT > 0) ? 'Sword_Attack'
             : p.dodgeTimer > 0 ? 'Roll'
             : airborne ? 'Roll'
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

    syncClass();                      // respec or a different save changes the body
    playFor(p);
    mixer.update(Math.min(0.05, clock.getDelta()));
    /* Force the skeleton to recompute. Three normally does this during projectObject, but in a
       shared context its internal state cache is reset every frame, so being explicit removes a
       variable while diagnosing the missing skinned body. */
    HERO3D._wrap.traverse(o => { if(o.isSkinnedMesh && o.skeleton){ o.skeleton.update(); } });

    /* Both Three.js and the game write GL state. Without bracketing the draw in resetState()
       the game's next frame renders with Three's leftover state and the world breaks. */
    renderer.resetState();
    clearDivisors(window.__BF_GL);
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
window.__hero3dFace  = () => HERO3D.face || 'not built';
window.__hero3dClass = () => ({ classId: (window.__BF_META && window.__BF_META().classId),
                                model: HERO3D.model, mapped: modelForClass() });
window.__hero3dWeaponsFor = () => weaponsFor(eyeModel());

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
/* Which meshes are present, and is anything being culled? A skinned body vanishing while
   bone-parented props still draw is the classic signature of frustum culling on a SkinnedMesh:
   its bounding sphere is computed in BIND space, so scaling the wrap 15x and moving it across
   the world makes Three's cull test reject it while non-skinned children survive. */
/* Is GPU skinning even possible here? Three delivers bone matrices as a FLOAT texture, which
   WebGL 1 only supports via OES_texture_float; without it (or without vertex-texture support)
   skinning silently produces degenerate transforms and the mesh collapses - which matches the
   body vanishing while every non-skinned part draws. */
/* Is the character facing the way it is moving? Dot the model's own forward axis against the
   velocity. ~+1 means correct, ~-1 means 180 degrees out, which is the "runs backwards" bug.
   Measured rather than eyeballed, since facing is easy to misjudge from a still frame. */
window.__hero3dFacing = (p) => {
  const w = HERO3D._wrap; if(!w) return 'not ready';
  w.updateMatrixWorld(true);
  const fwd = new THREE.Vector3(0,0,1).applyQuaternion(w.getWorldQuaternion(new THREE.Quaternion()));
  const vx = (p && p.vx) || 0, vz = (p && p.vz) || 0;
  const sp = Math.hypot(vx, vz);
  if(sp < 5) return { moving:false, note:'stand still and it cannot be judged' };
  const vel = new THREE.Vector3(vx/sp, 0, vz/sp);
  const dot = +fwd.clone().setY(0).normalize().dot(vel).toFixed(3);
  return { moving:true, dot, verdict: dot > 0.5 ? 'FORWARD (correct)'
                                 : dot < -0.5 ? 'BACKWARD (180 out)' : 'sideways/unclear',
           yawOff: HERO3D.yawOff, clip: cur };
};
window.__hero3dSkinCaps = () => {
  const g = window.__BF_GL; if(!g || !renderer) return 'no gl';
  const cap = renderer.capabilities;
  let sk = null;
  HERO3D._wrap && HERO3D._wrap.traverse(o => { if(!sk && o.isSkinnedMesh) sk = o; });
  return {
    isWebGL2: cap.isWebGL2 !== undefined ? cap.isWebGL2 : 'n/a',
    floatVertexTextures: cap.floatVertexTextures,
    maxTextures: cap.maxTextures,
    maxVertexTextures: g.getParameter(g.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
    maxVertexUniformVectors: g.getParameter(g.MAX_VERTEX_UNIFORM_VECTORS),
    OES_texture_float: !!g.getExtension('OES_texture_float'),
    boneCount: sk && sk.skeleton ? sk.skeleton.bones.length : null,
    hasBoneTexture: !!(sk && sk.skeleton && sk.skeleton.boneTexture),
    programErr: (renderer.info && renderer.info.programs) ? renderer.info.programs.length : null,
  };
};
window.__hero3dMeshes = () => {
  if(!HERO3D._wrap) return 'not ready';
  const out = [];
  HERO3D._wrap.updateMatrixWorld(true);
  HERO3D._wrap.traverse(o => {
    if(!o.isMesh) return;
    const bs = o.geometry && o.geometry.boundingSphere;
    out.push({ name:(o.name||'?').slice(0,22), skinned:!!o.isSkinnedMesh, visible:o.visible,
               culled:o.frustumCulled,
               bsR: bs ? +bs.radius.toFixed(2) : null,
               mat: o.material && o.material.type,
               tris: o.geometry && o.geometry.index ? o.geometry.index.count/3
                     : (o.geometry ? o.geometry.attributes.position.count/3 : 0) });
  });
  return out;
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
