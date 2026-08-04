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
import * as SkeletonUtils from './jsm/utils/SkeletonUtils.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { WORLD3D, syncWorld } from './world3d.js';
import { MOB3D, syncMobs, mobDrawn } from './mob3d.js';
import { PROP3D, syncProps } from './prop3d.js';

const ASSETS = '../slice3d/assets/';       // shared with the slice; not duplicated

/* Voxel units per metre. The hero is drawn spanning roughly 45 voxel units (legs pivot at
   y=14, head box tops out near y=33 above that) and our glTF characters are 1.75m, so ~26.
   Exposed as a control because it is the one number most likely to need a nudge by eye. */
export const HERO3D = {
  /* ON by default. What Oliver shows people has to be what they get - a renderer that only
     appears when you know the URL is not shipped, it is a demo. Every failure path here already
     degrades to the voxel hero rather than to a missing character (see drawHero3D's catch), so
     defaulting to on cannot cost more than the character looking like it used to. */
  on: true,
  /* Which skin the hero wears. 'base' is the texture the RPG pack shipped with and is the
     default; any CLASS_SKINS id is an unlockable recolour. Set via ?skin= or __hero3dSetSkin. */
  skinId: 'base',
  /* 15 matched the VOXEL hero's ~45 units exactly, which is why it looked right in isolation and
     too short to Oliver in the actual world - the voxel hero was always a bit stumpy next to the
     scenery. 20 reads correctly against buildings and mobs. Override live with ?scale=. */
  scale: 20,   // measured: scale 26 gave 76.8 units tall; 15 gave ~44, matching the voxel hero
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
     /3d/?hero3d=0            fall BACK to the voxel hero (the flag is now an opt-out)
     /3d/?scale=30            override the units-per-metre guess
     /3d/?model=Rogue
   Anything unset keeps its default, and no parameter can break the game - the flag only
   gates an additive draw. The flag reads both ways on purpose: it is the only way to A/B the
   two renderers on a phone, and that comparison is still worth having. */
try {
  const q = new URLSearchParams(location.search);
  if(q.has('hero3d')) HERO3D.on = (q.get('hero3d') === '1' || q.get('hero3d') === 'true');
  if(q.get('scale')) HERO3D.scale = parseFloat(q.get('scale')) || HERO3D.scale;
  if(q.get('model')) HERO3D.model = q.get('model');
  if(q.get('yoff'))  HERO3D.yOff  = parseFloat(q.get('yoff')) || 0;
  if(q.get('yawoff')) HERO3D.yawOff = parseFloat(q.get('yawoff')) || 0;
  if(q.get('skin'))  HERO3D.skinId = q.get('skin');   // 'base' (default) or an unlockable id
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

/* ─────────────  CLASS SKINS  ─────────────
   Coloured skins are what carries class identity, now that armour is stats-only and invisible.
   Without them a Mage, Stormcaller, Warlock, Necromancer and Chronomancer are literally the same
   character, because all five share the Wizard body.

   Found while building this: applySkin() was being called with the CLASS id ('warrior',
   'berserker') while SKINS is keyed by MODEL name ('Warrior', 'Rogue'), so SKINS[classId] was
   always undefined and no skin was ever applied. The per-class `tint` in the class table was
   unused too. That is why classes sharing a body looked identical.

   Each palette derives from the tint already chosen for that class in CLASSES, so the colours
   match the skill-bar and UI accents rather than being a second, competing scheme.
   repaintTexture classifies by HSV — low-saturation pixels become `metal`, dark warm pixels
   become `leather`, and skin/hair/eyes are only brightened — so one palette repaints a whole
   character coherently without touching its face. */
/* Palettes taken from GPT's concept sheet (2026-07-30). COLOUR ONLY.

   The concept art added geometry we cannot use - a tricorn hat, a wolf-head hood, winged helms,
   spiked pauldrons, horned crowns, face masks. Our characters are fixed meshes, so a skin can
   repaint a surface but cannot grow a new one. What carries over is the colour identity, which
   is most of what makes a class readable at a glance anyway.

   Ninja is deliberately unchanged: the sheet came back with 12 designs, not 13, and no Ninja
   among them. Left on its original palette rather than inventing one and implying it was
   approved art.

   `metal` is the bright structural colour and `leather` the dark cloth/hide, matching how
   repaintTexture classifies pixels by saturation and hue. */
const CLASS_SKINS = {
  // Warrior body
  warrior:      { id:'c_warrior',      metal:'#c9a05a', leather:'#3a2a16', lift:1.30 },
  berserker:    { id:'c_berserker',    metal:'#8e2a24', leather:'#241c1e', lift:1.24 },
  pirate:       { id:'c_pirate',       metal:'#c9a24a', leather:'#2c5f63', lift:1.30 },
  // Rogue body
  bladedancer:  { id:'c_bladedancer',  metal:'#9fc4c8', leather:'#2f5f66', lift:1.32 },
  reaper:       { id:'c_reaper',       metal:'#7a2028', leather:'#1a1418', lift:1.22 },
  ninja:        { id:'c_ninja',        metal:'#454e60', leather:'#16181f', lift:1.24 },
  // Cleric body
  paladin:      { id:'c_paladin',      metal:'#e8c86a', leather:'#4a4032', lift:1.36 },
  // Monk body
  monk:         { id:'c_monk',         metal:'#d8792a', leather:'#6a4a2c', lift:1.32 },
  // Ranger body
  ranger:       { id:'c_ranger',       metal:'#5a8f45', leather:'#26301c', lift:1.30 },
  beastmaster:  { id:'c_beastmaster',  metal:'#cfc2a4', leather:'#5e452c', lift:1.28 },
  skylancer:    { id:'c_skylancer',    metal:'#c8d4e4', leather:'#2f5f9e', lift:1.34 },
  // Wizard body
  mage:         { id:'c_mage',         metal:'#5a7fc8', leather:'#1e2436', lift:1.30 },
  stormcaller:  { id:'c_stormcaller',  metal:'#b9a8e8', leather:'#4a3a9e', lift:1.32 },
  warlock:      { id:'c_warlock',      metal:'#8a4fb0', leather:'#241338', lift:1.24 },
  necromancer:  { id:'c_necromancer',  metal:'#d8d6c0', leather:'#44503e', lift:1.30 },
  chronomancer: { id:'c_chronomancer', metal:'#d0a94a', leather:'#1f5a5e', lift:1.32 },
};

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

/* E2: THE EQUIPPED WEAPON DECIDES THE MODEL.
   Oliver: "the new weapon models are still not in the game. Only the default class weapons show."
   The models were never missing - all 28 are loaded, tuned and reachable. The link was: WEAP.name
   was only ever set to the archetype's DEFAULT_WEAPON (or the first model the archetype allowed),
   so a warrior carried the plain Sword whatever was actually in his hands, and every tuned model
   sat unused.
   Where a family has several models the choice is by RARITY, so a legendary looks like one - the
   golden variants exist for exactly that and were otherwise dead files. Anything unmapped falls
   through to the archetype default, which is the old behaviour and a safe floor. */
const ART_MODELS = {
  sword:      ['Sword', 'Sword_2', 'Sword_Golden'],
  great:      ['Claymore'],
  axe:        ['Axe_Small', 'Axe', 'Axe_Double', 'Axe_Double_Golden'],
  hammer:     ['Hammer_Small', 'Hammer_Double', 'Hammer_Double_Golden'],
  dagger:     ['Dagger', 'Dagger_2', 'Dagger_Golden'],
  bow:        ['Bow_Wooden', 'Bow_Wooden2', 'Bow_Evil', 'Bow_Golden'],
  cross:      ['Bow_Wooden2', 'Bow_Evil', 'Bow_Golden'],
  javelin:    ['Spear'],
  spear:      ['Spear'],
  scythe:     ['Scythe'],
  staff:      ['Staff_Wizard'],
  wand:       ['Staff_Cleric'],
  tome:       ['Staff_Cleric'],
  orb:        ['Staff_Cleric'],
  spellblade: ['Sword_Knight'],
  /* No `flintlock` and no `fist`, ON PURPOSE. There is no pistol model in any kit and the Monk is
     unarmed by design; a stand-in would put a sword-shaped pistol in a pirate's hand, which is
     worse than the archetype default. */
};
const RARITY_RANK = { common:0, uncommon:1, rare:1, epic:2, legendary:3, mythic:3 };
function modelForWeapon(w){
  if(!w || !w.art) return null;
  const list = ART_MODELS[w.art];
  if(!list || !list.length) return null;
  const r = RARITY_RANK[String(w.rarity || 'common').toLowerCase()] || 0;
  return list[Math.min(list.length - 1, r)];
}

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
    /* THE PLAYER'S CHOSEN EYE COLOUR. Character creation has always offered eight of them and the
       3D hero never read any: the iris came from FACE_PRESETS per MODEL, so the choice changed a
       voxel character nobody sees any more and did nothing to the one you play. Same dead option
       as hairstyle, but worth wiring up rather than removing - it is the only cosmetic choice left
       once hair goes, and now it is visible on your actual face. */
    const _pick = (function(){ try { const m = window.__BF_META && window.__BF_META(); return m && m.eyeColor; } catch(e){ return null; } })();
    const ir = mk(new THREE.CircleGeometry(1, 20), _pick || EYE.iris);
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

/* ─────────────────────────────────────────────────────────────────────────────
   WEAPONS — ported verbatim from the slice.

   The archetype rules and Oliver's tuned transforms were already ported; this is the machinery
   that actually attaches a weapon. Copied out of public/slice3d/index.html rather than retyped,
   same reasoning as the faces: WEAPON_PRESETS holds tuned values and a transcription slip would
   silently move every weapon.

   Two paths, and any future change must be tested on BOTH — that split has already caused two
   bugs (the slide controls, then Length, each silently dead on one path):
     - FILE weapons load a .glb and are sized by matching the character's stock weapon length
     - STOCK weapons are lifted out of the character that owns them and inherit the artist's
       placement, so they need no tuning at all

   Weapon frames are read from WEAP_FRAME_ALL when present, exactly as in the slice, so a tuned
   transform cannot be reinterpreted by a change to how reach is measured.
   ───────────────────────────────────────────────────────────────────────────── */

/* Serialises overlapping equips. The slice declares this immediately before equipWeapon, so my
   function-boundary extraction missed it — a newer request must invalidate one still loading, or
   rapid changes stack copies of the weapon. */
/* Module-scope glTF loader. The ported slice code calls load() freely; in hero3d.js it was
   previously scoped inside boot(). Paths are rewritten onto ASSETS because the slice's relative
   'assets/...' does not resolve from /3d/. */
const _loader = new GLTFLoader();
const load = url => new Promise((res, rej) =>
  _loader.load(url.startsWith('assets/') ? ASSETS + url.slice(7) : url, res, undefined, rej));

/* Per-weapon length multipliers, relative to the character's stock weapon. Also from the slice
   - a claymore should read longer than a sword and a dagger shorter. */
const WEAPON_LEN = {
  Claymore:1.45, Sword_Big:1.4, Sword_big_Golden:1.4, Scythe:1.6, Spear:1.7,
  Hammer_Double:1.25, Hammer_Double_Golden:1.25, Axe_Double:1.2, Axe_Double_Golden:1.2,
  Dagger:0.62, Dagger_2:0.62, Dagger_Golden:0.62, Arrow:0.7,
  Bow_Wooden:1.15, Bow_Wooden2:1.15, Bow_Golden:1.15, Bow_Evil:1.15,
};

let _weapSeq = 0;
const WEAP_FRAME_VERSION = 1;
let WEAP_FRAME_ALL = {};
function weapKey(){ return eyeModel() + '|' + WEAP.name; }
function storedWeapFrame(){ return WEAP_FRAME_ALL[weapKey()] || null; }
const weapFrameSave = () => {};        // no persistence in the game build; presets are the source
const weapSave = () => {};

const VIL = '';                        // unused here; kept so ported code needs no edits
const _terCache = {};

function relight(m){
  if(!m || !m.isMeshBasicMaterial) return m;
  const lit = new THREE.MeshLambertMaterial({
    map: m.map || null,
    color: m.color ? m.color.clone() : new THREE.Color('#ffffff'),
    transparent: m.transparent, opacity: m.opacity,
    alphaTest: m.alphaTest, side: m.side, vertexColors: m.vertexColors
  });
  lit.name = m.name;
  return lit;
}

const _lenOf = obj => {
  const b = new THREE.Box3().setFromObject(obj), sz = b.getSize(new THREE.Vector3());
  return Math.max(sz.x, sz.y, sz.z) || 1;
};

function weaponRig(actor){
  let bone = null;
  actor.root.traverse(o => { if(!bone && o.isBone && /^weaponr$/i.test(o.name.replace(/[^a-z]/gi,''))) bone = o; });
  if(!bone) return null;
  let stock = null;
  for(const c of bone.children){ if(!c.isBone && !c.userData._weap){ stock = c; break; } }
  return { bone, stock };
}


function clearWeapon(actor){
  if(!actor) return;
  /* Sweep the WHOLE actor, not just the weapon bone. Belt and braces: if any future path
     ever parents a weapon somewhere unexpected, this still finds it, so a stray copy can
     never accumulate again. Cheap — it is a handful of nodes. */
  const strays = [];
  actor.root.traverse(o => { if(o.userData && o.userData._weap) strays.push(o); });
  for(const o of strays){ if(o.parent) o.parent.remove(o); }
  const rig = weaponRig(actor);
  if(rig && rig.stock) rig.stock.visible = true;    // restore the character's own weapon
  actor._weap = null;
  actor._weapGrip = null;
}




function applyWeaponTransform(actor){
  const g = actor && actor._weapGrip;
  if(!g || !g.holder) return false;
  const holder = g.holder, reach = g.reach || 1, axis = g.axis || 'y';

  holder.rotation.set(WEAP.pitch, WEAP.yaw, WEAP.roll);
  holder.scale.setScalar(g.baseScale * (g.usesLen ? WEAP.len : 1));
  // file weapons carry Length on the outer wrap; rescale from the recorded len==1 baseline
  if(g.wrap && g.lenBase) g.wrap.scale.copy(g.lenBase).multiplyScalar(WEAP.len);
  holder.position.set(WEAP.side * reach, WEAP.up * reach, WEAP.fwd * reach);
  if(WEAP.shaft){
    const along = new THREE.Vector3(axis==='x'?1:0, axis==='y'?1:0, axis==='z'?1:0)
      .applyEuler(holder.rotation);
    holder.position.addScaledVector(along, WEAP.shaft * reach);
  }
  // grip point moves the mesh along its own axis inside the holder
  if(g.children && g.half != null){
    for(const c of g.children){
      c.position.copy(c.userData._basePos);
      c.position[axis] += g.half * (WEAP.grip * 2);
    }
  }
  const rig = weaponRig(actor);
  if(rig && rig.stock) rig.stock.visible = !WEAP.hideStock;
  return true;
}


async function loadStockWeapon(key){
  const def = STOCK_WEAPONS[key]; if(!def) return null;
  const g = await load(`assets/chars/${def.from}.gltf`).catch(()=>null);
  if(!g) return null;
  let src = null;
  g.scene.traverse(o => { if(!src && o.name === def.node) src = o; });
  if(!src) return null;
  const holder = new THREE.Group();
  src.updateWorldMatrix(true, false);
  src.traverse(o => {
    if(!o.isMesh) return;
    const m = new THREE.Mesh(o.geometry, relight(o.material.clone()));
    m.castShadow = true; m.userData._weap = true;
    o.updateWorldMatrix(true, false);
    m.applyMatrix4(new THREE.Matrix4().copy(src.matrixWorld).invert().multiply(o.matrixWorld));
    holder.add(m);
  });
  if(!holder.children.length) return null;
  return { holder, pos: src.position.clone(), quat: src.quaternion.clone(), scale: src.scale.clone() };
}


async function equipWeapon(actor, useSaved){
  if(!actor) return null;
  const seq = ++_weapSeq;              // anything older than this is stale
  clearWeapon(actor);
  if(useSaved !== false) weapLoadFor(eyeModel());
  if(!WEAP.on) return null;
  /* What the player is ACTUALLY carrying, ahead of the archetype default. Still filtered by the
     archetype rule below, so a wizard cannot end up swinging a claymore - that rule is what kept
     tuning to ~28 weapons rather than 168. */
  try {
    const pw = window.__BF3 && window.__BF3.G && window.__BF3.G.p && window.__BF3.G.p.weapon;
    const want = modelForWeapon(pw);
    if(want) WEAP.name = want;
  } catch(err){}
  // archetype rule — the Monk is unarmed, and a wizard does not swing a claymore
  const allowed = weaponsFor(eyeModel());
  if(allowed.length && !allowed.includes(WEAP.name)){
    const pref = DEFAULT_WEAPON[eyeModel()];
    WEAP.name = (pref && allowed.includes(pref)) ? pref : allowed[0];
  }
  if(!allowed.length) return null;
  const rig = weaponRig(actor);
  if(!rig) return null;

  /* Stock weapons take a different path: they arrive with the transform the artist gave
     them, which is by definition correct for this rig, so they skip the measure-and-scale
     step entirely and need no tuning. */
  if(STOCK_WEAPONS[WEAP.name]){
    const st = await loadStockWeapon(WEAP.name);
    if(seq !== _weapSeq || !st) return null;
    const wrapS = new THREE.Group();
    wrapS.userData._weap = true;
    wrapS.add(st.holder);
    wrapS.position.copy(st.pos); wrapS.quaternion.copy(st.quat); wrapS.scale.copy(st.scale);
    st.holder.rotation.set(WEAP.pitch, WEAP.yaw, WEAP.roll);
    st.holder.scale.setScalar(WEAP.len);
    /* Stock weapons were skipping the slide controls entirely. Inheriting the artist's
       transform is right for the STARTING position, but it should not mean the staffs and
       wands cannot then be nudged like everything else. Same maths as the file path, with
       reach taken from the piece's own size. */
    const sb = new THREE.Box3().setFromObject(st.holder);
    const ss = sb.getSize(new THREE.Vector3());
    const sreach = Math.max(ss.x, ss.y, ss.z) || 1;
    {
      const wf = storedWeapFrame();
      const ax = (ss.y >= ss.x && ss.y >= ss.z) ? 'y' : (ss.x >= ss.z ? 'x' : 'z');
      actor._stockGrip = { holder: st.holder, reach: wf ? wf.reach : sreach,
                           axis: wf && wf.axis ? wf.axis : ax,
                           half: null, children: null, baseScale: 1, usesLen: true };
    }
    st.holder.position.set(WEAP.side * sreach, WEAP.up * sreach, WEAP.fwd * sreach);
    if(WEAP.shaft){
      const ax = (ss.y >= ss.x && ss.y >= ss.z) ? 'y' : (ss.x >= ss.z ? 'x' : 'z');
      const along = new THREE.Vector3(ax==='x'?1:0, ax==='y'?1:0, ax==='z'?1:0)
        .applyEuler(st.holder.rotation);
      st.holder.position.addScaledVector(along, WEAP.shaft * sreach);
    }
    clearWeapon(actor);              // NB this nulls _weapGrip, so assign it after
    rig.bone.add(wrapS);
    if(rig.stock && WEAP.hideStock) rig.stock.visible = false;
    actor._weap = wrapS;
    actor._weapGrip = actor._stockGrip;
    actor._stockGrip = null;
    return { name: WEAP.name, stockModel: true };
  }

  const g = await load(`assets/weapons/${WEAP.name}.glb`).catch(()=>null);
  // a newer request started while this one was loading — drop this result on the floor
  if(seq !== _weapSeq) return null;
  if(!g) return null;

  const holder = new THREE.Group();
  holder.userData._weap = true;
  const wmats = [];
  g.scene.traverse(o => {
    if(!o.isMesh) return;
    const m = new THREE.Mesh(o.geometry, relight(o.material.clone()));
    m.castShadow = true; m.userData._weap = true;
    o.updateWorldMatrix(true, false); m.applyMatrix4(o.matrixWorld);
    (Array.isArray(m.material) ? m.material : [m.material]).forEach(mm => mm && wmats.push(mm));
    holder.add(m);
  });
  if(!holder.children.length) return null;

  /* This pack shipped OBJ-only and was batch-converted, which carried very dim diffuse
     values across (a steel blade came through at 0.21 grey, some parts at 0.02). Against
     this scene's lighting they render as black silhouettes. Lift the whole weapon by ONE
     factor derived from its brightest material, so gold still reads brighter than steel
     and steel brighter than wood — normalising each material separately would flatten
     exactly the contrast that makes them readable. */
  let peak = 0;
  for(const mm of wmats){ if(mm.color) peak = Math.max(peak, mm.color.r, mm.color.g, mm.color.b); }
  if(peak > 1e-3 && peak < 0.72){
    const k = 0.72 / peak;
    for(const mm of wmats){ if(mm.color) mm.color.multiplyScalar(k); }
  }

  // centre on its own origin so rotation behaves predictably
  const bb = new THREE.Box3().setFromObject(holder);
  const mid = bb.getCenter(new THREE.Vector3());
  const sz  = bb.getSize(new THREE.Vector3());
  const axis = (sz.y >= sz.x && sz.y >= sz.z) ? 'y' : (sz.x >= sz.z ? 'x' : 'z');
  for(const c of holder.children){ c.position.sub(mid); }
  // pivot at the grip end rather than the middle, so it sits in the fist not through it
  const half = (axis === 'y' ? sz.y : axis === 'x' ? sz.x : sz.z) / 2;
  for(const c of holder.children){ c.position[axis] += half * (WEAP.grip * 2); }

  const wrap = new THREE.Group();
  wrap.userData._weap = true;
  wrap.add(holder);

  // COPY THE ARTIST'S PLACEMENT rather than inventing one
  if(rig.stock){
    wrap.position.copy(rig.stock.position);
    wrap.quaternion.copy(rig.stock.quaternion);
    wrap.scale.copy(rig.stock.scale);
  }
  if(seq !== _weapSeq) return null;
  clearWeapon(actor);                  // belt and braces: nothing else may be attached
  rig.bone.add(wrap);
  actor.root.updateMatrixWorld(true);

  // match the stock weapon's on-screen length, then apply the per-weapon multiplier
  const want = (rig.stock ? _lenOf(rig.stock) : 0.8) * (WEAPON_LEN[WEAP.name] || 1) * WEAP.len;
  const got  = _lenOf(wrap);
  if(got > 1e-5) wrap.scale.multiplyScalar(want / got);
  /* Length is applied to the OUTER wrap here, not the holder. The fast slider path needs the
     scale that corresponds to len == 1 so it can rescale without re-measuring — otherwise
     dragging Length does nothing until the model is reloaded, which is exactly what broke. */
  const lenBase = wrap.scale.clone().divideScalar(WEAP.len || 1);

  let reach = Math.max(sz.x, sz.y, sz.z);
  let axisUse = axis, halfUse = half;
  {   // a locked frame wins, so a future change to how reach is measured cannot move it
    const wf = storedWeapFrame();
    if(wf){ reach = wf.reach; axisUse = wf.axis || axis; if(wf.half != null) halfUse = wf.half; }
  }
  // remember the pieces the transform helper needs so slider drags never reload anything
  for(const c of holder.children) c.userData._basePos = c.position.clone().sub(
    new THREE.Vector3(axis==='x' ? half * (WEAP.grip*2) : 0,
                      axis==='y' ? half * (WEAP.grip*2) : 0,
                      axis==='z' ? half * (WEAP.grip*2) : 0));
  actor._weapGrip = { holder, reach, axis: axisUse, half: halfUse,
                      children: holder.children.slice(), baseScale: 1, usesLen: false,
                      wrap, lenBase };
  holder.rotation.set(WEAP.pitch, WEAP.yaw, WEAP.roll);
  /* Two different kinds of slide, and the missing one was the second.

     fwd/up/side move the weapon along the HAND's axes. Rotation is applied to the same
     object, so once a weapon is turned those sliders no longer line up with anything you
     can see — pushing a rotated spear along its own shaft means combining all three by
     trial and error. That is the dimension that felt absent.

     `shaft` moves it along the WEAPON's own long axis, after rotation. It is the
     "push it through the fist" control, and it stays intuitive at any orientation. */
  holder.position.set(WEAP.side * reach, WEAP.up * reach, WEAP.fwd * reach);
  if(WEAP.shaft){
    const along = new THREE.Vector3(
      axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0
    ).applyEuler(holder.rotation);
    holder.position.addScaledVector(along, WEAP.shaft * reach);
  }
  if(rig.stock && WEAP.hideStock) rig.stock.visible = false;
  actor._weap = wrap;
  return { name: WEAP.name, stock: !!rig.stock, want:+want.toFixed(3), got:+got.toFixed(3) };
}



/* Choose the weapon for the current class. Uses the archetype default where one exists, so a
   ranger draws a bow rather than whatever sorts first alphabetically. */
function weaponForClass(){
  const model = eyeModel();
  const allowed = weaponsFor(model);
  if(!allowed.length) return null;                  // Monk is unarmed by design
  const pref = DEFAULT_WEAPON[model];
  return (pref && allowed.includes(pref)) ? pref : allowed[0];
}
async function equipForClass(){
  if(!actor) return null;
  const name = weaponForClass();
  const holder = { root: actor, model: HERO3D._wrap };
  if(!name){ clearWeapon(holder); HERO3D.weapon = null; return null; }
  WEAP.name = name;
  weapLoadFor();
  const r = await equipWeapon(holder, false);
  HERO3D.weapon = r ? { name, stock: !!r.stockModel } : { name, failed: true };
  return HERO3D.weapon;
}

let _lastW = 0, _lastH = 0;
let _loaded = {}, _classNow = null;

/* Repaint the character in its class's colours.

   Same HSV classification as the slice: low-saturation pixels become the class metal, dark warm
   pixels become its leather, and skin/hair/eyes are only brightened so the tuned face is never
   recoloured. Cached per texture+class, so switching class twice costs nothing. */
const _skinCache = new Map();
function hexRGB(h){ const n = parseInt(String(h).replace('#',''), 16);
  return [ (n>>16)&255, (n>>8)&255, n&255 ]; }
function rgb2hsv(r,g,b){
  r/=255; g/=255; b/=255;
  const mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn;
  let hh=0;
  if(d>1e-6){
    if(mx===r) hh=60*(((g-b)/d)%6);
    else if(mx===g) hh=60*(((b-r)/d)+2);
    else hh=60*(((r-g)/d)+4);
  }
  if(hh<0) hh+=360;
  return [hh, mx<=0?0:d/mx, mx];
}
function tintPixel(px,i,rgb,lum){
  px[i]   = Math.min(255, rgb[0]*lum);
  px[i+1] = Math.min(255, rgb[1]*lum);
  px[i+2] = Math.min(255, rgb[2]*lum);
}

/* HSV -> RGB, needed for the hue remap below. */
function hsv2rgb(h,s,v){
  const c=v*s, x=c*(1-Math.abs(((h/60)%2)-1)), m=v-c;
  let r=0,g=0,b=0;
  if(h<60){r=c;g=x;} else if(h<120){r=x;g=c;} else if(h<180){g=c;b=x;}
  else if(h<240){g=x;b=c;} else if(h<300){r=x;b=c;} else {r=c;b=x;}
  return [(r+m)*255,(g+m)*255,(b+m)*255];
}
function repaintTexture(srcTex, skin){
  const img = srcTex.image;
  if(!img || !img.width) return srcTex;
  const key = (srcTex.uuid||'') + '|' + skin.id;
  if(_skinCache.has(key)) return _skinCache.get(key);
  const cvs = document.createElement('canvas');
  cvs.width = img.width; cvs.height = img.height;
  const ctx = cvs.getContext('2d', { willReadFrequently:true });
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0,0,cvs.width,cvs.height), px = data.data;
  const metal = hexRGB(skin.metal), leather = hexRGB(skin.leather), lift = skin.lift || 1.0;
  for(let i=0;i<px.length;i+=4){
    if(px[i+3] < 8) continue;
    const hsv = rgb2hsv(px[i],px[i+1],px[i+2]);
    const lum = Math.min(1.9, (0.35 + hsv[2]*1.25) * lift);
    /* SKIN GUARD - see the matching note in the slice. Skin is a warm mid-value hue that collides
       with both the low-saturation "metal" test and the warm-dark "leather" test, so faces and
       hands were being repainted with the outfit. Excluded explicitly; only brightness passes. */
    if(hsv[0]>=8 && hsv[0]<=54 && hsv[1]>=0.12 && hsv[1]<=0.62 && hsv[2]>=0.45){
      px[i]*=lift; px[i+1]*=lift; px[i+2]*=lift;
    }
    else if(hsv[1] < 0.20) tintPixel(px,i,metal,lum);
    else if(hsv[0] >= 12 && hsv[0] <= 52 && hsv[2] < 0.52) tintPixel(px,i,leather,lum);
    /* SATURATED GARMENT REMAP. Without this, three Rogue classes all stayed the same red and the
       Wizard classes all stayed the same blue: the old rules only replaced LOW-saturation pixels
       (-> metal) and dark warm ones (-> leather), so a strongly coloured robe fell through to a
       plain brightness lift and kept its original hue no matter what palette was applied. That
       defeats the whole point, because classes sharing a body are told apart by colour alone.
       Saturated non-skin pixels now take the palette's HUE while keeping their own shading, so
       folds, trim and painted detail survive the recolour instead of flattening to one flat fill. */
    else {
      const tgt = rgb2hsv(...(hsv[2] < 0.42 ? leather : metal));
      const nv = Math.min(1, hsv[2] * lift);
      const ns = Math.min(1, hsv[1] * 0.45 + tgt[1] * 0.6);
      const out = hsv2rgb(tgt[0], ns, nv);
      px[i]=out[0]; px[i+1]=out[1]; px[i+2]=out[2];
    }
  }
  ctx.putImageData(data,0,0);
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = srcTex.flipY; tex.wrapS = srcTex.wrapS; tex.wrapT = srcTex.wrapT;
  tex.needsUpdate = true;
  _skinCache.set(key, tex);
  return tex;
}
/* Applied to the BODY material only. The added eye/mouth meshes are excluded by their _eye flag
   so a repaint can never disturb the face, and the weapon is excluded by _weap.

   HERO3D.skinId selects which skin is worn, and it defaults to 'base' — the texture the RPG pack
   shipped with (Oliver, 2026-07-29). This used to apply CLASS_SKINS unconditionally, so a class
   could never show the artwork its model was designed around. The recolours are still here as
   unlockables; they are just no longer the default. Restoring the base means putting back the
   ORIGINAL map, which is why _srcMap is captured before the first repaint and never overwritten. */
function applyClassSkin(){
  if(!actor) return null;
  let cls = 'warrior';
  try { const m = window.__BF_META && window.__BF_META(); if(m && m.classId) cls = m.classId; } catch(e){}
  const wantBase = (HERO3D.skinId || 'base') === 'base';
  const skin = CLASS_SKINS[cls];
  if(!wantBase && !skin) return null;
  let painted = 0;
  actor.traverse(o => {
    if(!o.isMesh || o.userData._eye || o.userData._weap) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for(const mm of mats){
      if(!mm) continue;
      if(!mm.userData._srcMap) mm.userData._srcMap = mm.map || null;
      const src = mm.userData._srcMap;
      if(!src) continue;
      mm.map = wantBase ? src : repaintTexture(src, skin);
      mm.needsUpdate = true;
      painted++;
    }
  });
  HERO3D.skin = { classId: cls, skinId: wantBase ? 'base' : skin.id,
                  metal: wantBase ? 'pack original' : skin.metal, painted };
  return HERO3D.skin;
}

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
  applyClassSkin();
  equipForClass();
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
    applyClassSkin();                  // and its class colours
    equipForClass();                   // and the weapon its archetype carries
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
let _lastArt = null, _lastRar = null, _reArming = false;
export function drawHero3D(p, t){
  /* Swap the model when the weapon changes. equipWeapon runs only on load and on class change, so
     without this the right model appeared only if you happened to spawn holding it - picking up a
     legendary axe mid-run changed the stats and not the hand.
     The HOLDER SHAPE MATTERS: equipWeapon expects { root, model }, not the bare scene. Passing the
     scene is what threw "Cannot read properties of undefined (reading 'traverse')" on the first
     attempt at this - clearWeapon walks actor.root, and the scene has no .root. Every other caller
     wraps it the same way; this now matches them.
     _reArming guards against re-entry: equipWeapon is async and this runs every frame. */
  try {
    const w = p && p.weapon, a = w ? w.art : null, r = w ? w.rarity : null;
    if(actor && HERO3D.ready && !_reArming && (a !== _lastArt || r !== _lastRar)){
      _lastArt = a; _lastRar = r;
      if(modelForWeapon(w)){
        _reArming = true;
        Promise.resolve(equipWeapon({ root: actor, model: HERO3D._wrap }, false))
          .catch(() => {})
          .then(() => { _reArming = false; });
      }
    }
  } catch(err){}
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

    /* Build or refresh the 3D world before drawing. Cheap when nothing changed - it compares a
       level signature and returns. Deliberately in the SAME scene and render call as the hero,
       so there is one Three.js context over the game canvas rather than two fighting for it. */
    /* ONE getDelta per frame. Calling it again for the mobs returns ~0 because the clock resets on
       read, which would freeze the hero's animation while the mobs animated fine. */
    const dt = Math.min(0.05, clock.getDelta());
    syncWorld(scene);
    syncMobs(scene, dt);
    syncProps(scene, dt);             // chests and the other objects you interact with

    syncClass();                      // respec or a different save changes the body
    playFor(p);
    mixer.update(dt);
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
window.__hero3dWeapon = () => HERO3D.weapon || 'none';
window.__hero3dSwapState = () => ({ lastArt:_lastArt, lastRar:_lastRar, reArming:_reArming, hasActor:!!actor, ready:!!HERO3D.ready, weapName:WEAP.name, want:(function(){try{return modelForWeapon(window.__BF3.G.p.weapon);}catch(e){return 'ERR '+e.message;}})() });
window.__hero3dSkin = () => HERO3D.skin || 'none';
/* Switch skin at runtime. 'base' restores the pack original; anything else is treated as an
   unlockable recolour for the current class. Returns what is now worn. */
window.__hero3dSetSkin = id => { HERO3D.skinId = id || 'base'; return applyClassSkin(); };
window.__hero3dSkins = () => {
  let cls = 'warrior';
  try { const m = window.__BF_META && window.__BF_META(); if(m && m.classId) cls = m.classId; } catch(e){}
  return { classId: cls, worn: HERO3D.skinId || 'base',
           available: ['base'].concat(CLASS_SKINS[cls] ? [CLASS_SKINS[cls].id] : []) };
};
window.__hero3dSetWeapon = async n => { WEAP.name = n; weapLoadFor();
  const r = await equipWeapon({ root: actor, model: HERO3D._wrap }, false);
  HERO3D.weapon = r ? { name:n, stock:!!r.stockModel } : { name:n, failed:true };
  return HERO3D.weapon; };

/* Diagnostic: where does the character actually land? Reports its world position, its
   projected normalised device coords (|x|,|y| < 1 means on screen, z < -1 or > 1 means
   outside the depth range), and its on-screen pixel size. Measuring beats guessing. */
/* The Three scene, for the level editor's collision overlay.
   Exposed rather than imported for the same reason __BF_CAM is: the editor mode has to draw into
   the SAME scene and the same render call as the hero and the world, or its boxes land in a
   different framebuffer and are composited away. Read-only by convention - the editor adds and
   removes one named group and touches nothing else. */
window.__hero3dScene = () => scene;

/* ── CHARACTER-CREATION PREVIEW ────────────────────────────────────────────
   A real, spinnable 3D model on its own canvas, so you can SEE the class you are choosing and the
   eye colour you picked before committing to a character you cannot change.
   Its own renderer and scene rather than the game's: the creation screen is an overlay with no
   level behind it, and borrowing the game's canvas would mean fighting whatever it is drawing.
   The model is a SkeletonUtils clone for the same reason the mirror's is - one actor cannot be in
   two places, and the game may already be using it. */
let _pv = null;
window.__hero3dPreview = (canvas, opts) => {
  opts = opts || {};
  if(!canvas) return false;
  try {
    if(!_pv || _pv.canvas !== canvas){
      if(_pv && _pv.renderer) _pv.renderer.dispose();
      const r = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
      r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      const sc = new THREE.Scene();
      sc.add(new THREE.AmbientLight(0xffffff, 1.35));
      const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(2, 4, 3); sc.add(key);
      const rim = new THREE.DirectionalLight(0x9fd6ff, 0.7); rim.position.set(-3, 2, -2); sc.add(rim);
      const cam2 = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      _pv = { canvas, renderer:r, scene:sc, cam:cam2, wrap:new THREE.Group(), model:null, yaw:0 };
      sc.add(_pv.wrap);
    }
    const want = opts.model || 'Warrior';
    if(_pv.model !== want){
      const g = _loaded[want];
      if(!g) return false;                       // not loaded yet; the caller retries
      while(_pv.wrap.children.length) _pv.wrap.remove(_pv.wrap.children[0]);
      const clone = SkeletonUtils.clone(g.scene);
      clone.traverse(o => { if(o.isMesh){ o.frustumCulled = false; o.castShadow = false; } });
      _pv.wrap.add(clone);
      _pv.model = want;
      /* FIXED FRAMING, not Box3. Measuring a SKINNED clone is the trap this file already documents
         twice: a SkinnedMesh's bounds are computed in BIND space, so setFromObject returns a box
         that has nothing to do with where the character actually is - and the camera derived from
         it flew far enough away to render an empty frame. The kit characters are all built to
         roughly the same height, so framing them the same way is both correct and simpler. */
      /* FULL FIGURE. This framing is the one verified to render (_shot/out/cc2.png). Two attempts
         to frame the FACE instead both failed - Box3 on a skinned clone returns bind-space bounds,
         and findHeadBone threw inside this function's try/catch, which fails silently to a blank
         canvas. Showing the whole character is worth having now; tightening onto the face so eye
         colour reads clearly is a known follow-up, and must be verified by LOOKING because a
         silent catch here renders nothing rather than something wrong. */
      _pv.wrap.position.set(0, -0.95, 0);
      _pv.cam.position.set(0, 0.15, 3.1);
      _pv.cam.lookAt(0, 0.05, 0);
    }
    if(opts.yaw != null) _pv.yaw = opts.yaw;
    _pv.wrap.rotation.y = _pv.yaw;
    const w = canvas.clientWidth || 220, hh = canvas.clientHeight || 260;
    if(canvas.width !== w || canvas.height !== hh){
      _pv.renderer.setSize(w, hh, false);
      _pv.cam.aspect = w / hh; _pv.cam.updateProjectionMatrix();
    }
    _pv.renderer.render(_pv.scene, _pv.cam);
    return true;
  } catch(e){ return false; }
};
window.__hero3dPreviewReady = (model) => !!_loaded[model || 'Warrior'];
window.__hero3dClassModel = (cid) => CLASS_TO_MODEL[cid] || 'Warrior';

/* ── HEROES AT ARBITRARY TRANSFORMS ────────────────────────────────────────
   One mechanism for every place that needs to show the character somewhere other than where he is
   standing: the hub mirror, the bag paper-doll, the title backdrop, the skin thumbnails.

   Each was drawing the OLD VOXEL hero, and for the same two reasons every time - either the call
   site passed `preview=true`, or the 3D layer was gated off in that mode. Fixing them one at a time
   would have meant three more single-purpose renderers on top of the character-creation one; this
   is the general answer, so the next place that needs a hero costs one line instead of a system.

   KEYED, because several can be on screen at once (six skin thumbnails) and each needs its own
   skeleton - a shared one would make every avatar strike the same pose as the last caller. Clones
   are built once per key and then reposed, never rebuilt.

   Deliberately NOT animated: these are portraits. A doll idling out of sync with itself reads as a
   second person standing in your inventory. */
const _poses = new Map();

window.__hero3dAt = (key, o) => {
  if(!scene || !actor || !HERO3D.ready) return false;
  try {
    let rec = _poses.get(key);
    if(!o){ if(rec) rec.node.visible = false; return false; }
    if(!rec){
      const node = SkeletonUtils.clone(actor);
      node.name = '__heroPose:' + key;
      node.traverse(n => { if(n.isMesh){ n.frustumCulled = false; n.castShadow = false; } });
      scene.add(node);
      rec = { node };
      _poses.set(key, rec);
    }
    rec.node.visible = true;
    const sc = HERO3D.scale * (o.scale != null ? o.scale : 1);
    rec.node.scale.setScalar(sc);
    rec.node.position.set(o.x || 0, o.y || 0, o.z || 0);
    rec.node.rotation.y = (o.yaw || 0) + HERO3D.yawOff;
    rec.node.updateMatrixWorld(true);
    return true;
  } catch(e){ return false; }
};

/* Anything posed this frame that nobody asked for again is hidden, so a doll does not linger in the
   world after you close the bag. Cheap: it walks a map with a handful of entries. */
window.__hero3dPoseSweep = (keep) => {
  const k = keep || [];
  for(const [key, rec] of _poses) if(k.indexOf(key) < 0) rec.node.visible = false;
};

/* The mirror is now just a pose like any other - kept as its own name so the call site in
   drawWaystation does not need to know that. */
window.__hero3dMirror = (o) => window.__hero3dAt('mirror', o);

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
/* WHAT THREE ACTUALLY DREW last frame. Every other probe in this file reports what was ASKED for —
   a position, a scale, a visible flag — and all of those can be perfect while nothing reaches the
   screen. renderer.info.render is reset per render() call, so this is the frame the shutter caught
   rather than a running total, and a draw-call count that moves when a layer is switched on is the
   difference between "the renderer skipped it" and "the renderer drew it and you cannot see it". */
window.__hero3dInfo = () => {
  if(!renderer) return 'no renderer';
  const r = renderer.info.render;
  return { calls:r.calls, triangles:r.triangles, points:r.points, lines:r.lines,
           geometries:renderer.info.memory.geometries, textures:renderer.info.memory.textures,
           programs:renderer.info.programs ? renderer.info.programs.length : null };
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
