# Bladefall graphics overhaul — handoff to Codex (technical director)

Written 2026-07-29 by Claude. **Verify everything here against the repo.** Several of my
diagnoses in this area were wrong and are flagged as such; where I state a fact I give the file
and line so you can check it rather than trust me.

Implementation is paused. Nothing but this document was changed to produce it.

> **UPDATE 2026-07-29, after this document was first written.** Codex ran out of usage, so I
> re-checked myself using its method — reading source rather than reasoning from memory — and
> found the root cause of the skinned-mesh failure in §5. **Three r160's skinning vertex shader
> uses `textureSize()` and `texelFetch()` (three.module.js:14020), which are GLSL ES 3.00 and
> therefore WebGL 2 only.** There is no WebGL 1 fallback. The game was WebGL 1, so the skinning
> shader could not compile while every non-skinned material did.
>
> Fixed by preferring WebGL 2 with a full WebGL 1 fallback and shimming the three instancing
> calls (`__BF_GL2` reports which path is live). **The complete character now renders in live
> gameplay** — see `docs/reference_hero_working_webgl2.png`. Game verified unaffected first:
> `/3d/` with no flags shows zero errors and normal voxel rendering.
>
> **Bloom is still unresolved and your diagnosis of it stands unchanged.** `?nobloom` is still
> required, and the render-target ownership question in §8 is still the decision I want from you.
> Sections 5 and 7 below describe the pre-fix state; treat this note as authoritative where they
> conflict.

---

## 1. Exact git state

| | |
|---|---|
| Repo | `C:\Users\Oliver\Documents\PraxisBrain\_automation\bladefall` (git submodule `oliverlynch7/bladefall`) |
| Active branch | `bladefall-autopilot` |
| HEAD | `926ab47` — "3D hero: skinned body still not drawing — three fixes attempted, follow-up brief for Codex" |
| `main` | `926ab47` |
| `origin/main` | `926ab47` |
| `origin/bladefall-autopilot` | `926ab47` |
| Working tree | **clean** — `git status --porcelain` returns nothing |

All four refs are identical. There are **no modified or untracked files**, so there is nothing
to triage for safety. Everything described below is committed and deployed.

**Deployment.** Cloudflare Pages builds `main`. My workflow is: commit on
`bladefall-autopilot` → push → merge into `main` → push `main`. Deploy takes 1–3 minutes; I now
poll for a marker string before claiming anything is live, because I twice reported a fix as
deployed before it had propagated.

- `https://bladefall.pages.dev/3d/` — the real game
- `https://bladefall.pages.dev/3d/?hero3d=1&nobloom` — real game with the 3D hero layer on
- `https://bladefall.pages.dev/slice3d/` — the Three.js testbed
- `public/_headers` sets `Cache-Control: no-store` for `/`, `/2d/`, `/3d/`, `/slice3d/`, `/poc3d/`

Local dev server used by my harnesses: `http://localhost:4319/` (another session owns it).

---

## 2. Locked product decisions

**Approved by Oliver, treat as fixed:**

1. **The voxel world stays; characters become 3D.** The goal is 3D skinned characters inside the
   existing game, not a new game.
2. **No visible armour, ever.** Armour is a stats-only item. Class identity comes from
   **coloured skins per class**. This was an explicit decision (2026-07-29) and it retires
   armour fitting, clipping and per-model armour tuning entirely. Recorded in
   `public/slice3d/index.html` above the now-superseded armour-slot block.
3. **Weapons are restricted by class archetype.** Not cosmetic — it collapses tuning from
   28 weapons × 6 bodies to ~28. See `ARCHETYPE_WEAPONS`, `public/slice3d/index.html:2484`.
4. **The 6 RPG character models are the cast.** Oliver rejected the Quaternius Universal Base
   Characters ("bland", exaggerated "Superhero" proportions) and the loot-icon armour. He liked
   these six and said "go ahead and create the whole game in this way".
5. **Mixamo is parked.** It worked (retargeting proven, 14/14 clips) but the RPG pack won.
6. **Faces are Mii-style added geometry**, tuned by Oliver by eye, and **must not be reset**.
   See §6.
7. **Mobile is the target.** Oliver plays on a phone. Any renderer change must be judged there.
8. **Do not spend money.** He declined Synty and the $40 Quaternius packs. Everything is CC0 or
   free-with-commercial-use.

**Still exploratory / not decided:**

- Whether the 3D layer ships as a replacement or an option.
- The renderer architecture itself — that is what you are being asked to direct.
- Whether reskinned mobs sharing silhouettes is acceptable (see §4).

**Non-negotiable constraint:** the game contains ~112 skills, 14 zones, 8 bosses, loot/rarity,
quests, forge, achievements, summons and PeerJS multiplayer, in 13,817 lines. **None of that may
be put at risk for a graphics upgrade.** Oliver has been explicit that his working game matters
more than the visuals.

---

## 3. Current renderer architecture

**File:** `public/3d/index.html`, 13,817 lines, a single classic `<script>` (not a module).

### Exact frame order — `public/3d/index.html:13704`

```js
function frame(ts){
  ensureSize();                       // 13706
  acc+=dt; while(acc>=DT){ update(DT); acc-=DT; }
  PostFX.begin();   // 13708  binds sFBO (offscreen scene target) if bloom is on
  render(...);      // 13709  draws the world — QUEUES box instances; calls drawHero3 near the end
  flushBatch();     // 13710  drawArraysInstancedANGLE — and our hero3d hook fires here
  PostFX.end();     // 13711  bright-pass, 4 blur passes, composite to the SCREEN
  requestAnimationFrame(frame);
}
```

**This ordering is the whole story for the current bug.** See §5.

### Context and canvas

- `<canvas id="gl">` — `public/3d/index.html:970`
- `canvas.getContext('webgl', {antialias:true, alpha:false, preserveDrawingBuffer:true})`
  — **:2817**. **WebGL 1**, with `ANGLE_instanced_arrays` (`INST.drawArraysInstancedANGLE`, :3059).
- `window.__BF_GL = gl` — **:2818** (added by me, so the 3D layer can share it)
- `window.__BF_CAM = () => ({P:PROJ, V:VIEW})` — **:2819** (added by me). Necessary because
  `PROJ`/`VIEW` are top-level `let` in a classic script (**:5877**) and therefore **not** window
  properties. A closure cannot rot the way mirroring at each of the 5 assignment sites would.
- DPR: `ensureSize()` / `targetRenderDpr()` resize the canvas from `window.innerWidth * dpr`.
  Quality tiers (`meta.quality` = high/medium/low, :1084) gate bloom, render resolution and
  particles.

### Geometry and shader

- **One unit cube, 36 vertices, drawn instanced.** Every object in the world is a box instance.
- Attributes: `aP` (position), `aN` (normal); per-instance `iM` (matrix), `iS` (scale),
  `iCA` (colour+alpha), `iE` (emissive).
- **No UV attribute and no texture sampler in the scene shader.** It cannot draw a textured mesh.
- Uniforms include `uP`/`uV` (projection/view), `uAmb`, `uDif`, `uKey`, `uFog`, `uFogNF`,
  and **point lights** `uPL`/`uPC` — used for torches and spell glow.
- Matrix helpers `mIdent`/`mMul`/`mT`/`mPersp`/`mLookAt` are **column-major**, i.e. already
  compatible with Three's `Matrix4.fromArray`. **I initially assumed they needed transposing.
  They do not.** Verify at :3026–:3040 and the `mPersp`/`mLookAt` definitions.
- `PROJ = mPersp(40°|42°, VW/VH, 5, 900)`; `VIEW = mLookAt([cx,60|66,cz],[0,26|28,0],[0,1,0])`
  — :3488/:3490 and two other sites.

### PostFX — `public/3d/index.html:2942`

- `begin()` (**:3001**): if bloom is on, binds `sFBO` and sets viewport to `W×H`.
- `end()` (**:3002**): calls `flushBatch()`, then bright-pass into `bFBO[0]`, 4 ping-pong blur
  passes between `bFBO[0]`/`bFBO[1]`, then composites to the default framebuffer.
- Render targets allocated: `sTex` + `sFBO` + `sDepth` (a **depth renderbuffer**), and
  `bTex[0..1]` + `bFBO[0..1]` at half resolution.
- `BLOOM_OFF()` (**:2944**) returns true when the URL contains `nobloom`, or when the quality
  tier is not high. **When bloom is off, `begin()`/`end()` are no-ops and nothing is bound.**

### drawHero3 — `public/3d/index.html:11947`

Draws the hero as ~40 box calls with a matrix stack (`pushM`/`mv`/`rotY`/`bx`). Occupies roughly
**45 voxel units** of height. Called from 5 sites; the gameplay one is commented *"the real you,
drawn last — always visible"*. My hook is at **:11952–11956** and only sets
`window.__hero3dPending` when `preview` is false.

There are **25 `drawX` functions** in total and a single `project()` with 16 call sites. Drawing
is genuinely isolated, which is what makes a staged port plausible.

---

## 4. 3D slice inventory — `public/slice3d/index.html` (5,306 lines)

Everything here works and should be **reused, not rebuilt**.

### Cast: 6 bodies → 16 classes

| Model | Rig | Classes |
|---|---|---|
| `Warrior` | 32 bones | Warrior, Berserker, Pirate |
| `Rogue` | 32 | Bladedancer, Reaper, Ninja |
| `Cleric` | 32 | Paladin |
| `Monk` | 32 | Monk |
| `Ranger` | 32 | Ranger, Beastmaster, Skylancer |
| `Wizard` | 32 | Mage, Stormcaller, Warlock, Necromancer, Chronomancer |

**All six share one identical 32-bone skeleton**, so clips bind by bone name with **no
retargeting**. Pooled that gives **26 distinct clips** where each model ships only ~12
(`loadRPGPool`). This is the single most reusable finding in the project.

Bone names are the pack's own: `Root, Body, Hips, Abdomen, Torso, Neck, Head, ShoulderL/R,
UpperArmL/R, LowerArmL/R, FistL/R, Thumb1/2L/R, WeaponR, UpperLegL/R, LowerLegL/R, FootL/R,
PoleTargetL/R`. Note the dedicated **`WeaponR`** attachment bone.

The Quaternius Universal Base Characters are a **different, incompatible 65-bone rig**
(UE5-mannequin naming). Its 86-clip Universal Animation Library does **not** work on the RPG
rig. Mixing them silently produced garbage skinning and 7 errors per load — a bug I shipped and
later fixed.

### Assets — `public/slice3d/assets/` (114 MB total)

| Path | Count | Notes |
|---|---|---|
| `chars/` | 6 glTF | the cast, self-contained (embedded buffers) |
| `weapons/` | 28 GLB | Medieval Weapons + gold variants |
| `monsters/` | 24 GLB | Ultimate Monsters — covers 27 mobs by reskin |
| `village/` | 176 glTF | Medieval Village MegaKit, trimmed 80 MB → 15 MB |
| `terrain/` | 92 GLB | Kenney cliffs/ground, **1-unit grid** |
| `base/`, `hair/`, `outfits/` | | 65-bone rig — not the shipping cast |
| `mixamo/` | 3 FBX | parked experiment |

**Coordinate conventions**
- Slice hero height `HERO_H = 1.75` **metres**.
- Game hero ≈ **45 voxel units** → `HERO3D.scale = 15` (measured: gave 44.6 units).
- Village kit: **2-unit** grid, 3-unit storey. Terrain kit: **1-unit** grid. Compatible.
- Weapon transforms are fractions of the weapon's own measured `reach`.
- Face offsets are fractions of a measured head — **see §6, this is load-bearing.**

### Reusable components

- `loadRPGPool()` / `loadRPGChar()` — pooled 26-clip loading
- `ARCHETYPE_WEAPONS` (:2484), `WEAPON_PRESETS` (:2522), `STOCK_WEAPONS` — weapon rules and
  tuned transforms, keyed `Model|Weapon`
- `equipWeapon` / `applyWeaponTransform` — attach + synchronous transform (no reload per slider)
- `addEyes` / `addMouth` / `headMetrics` — the face system
- `makeBuilding()` / `makePlateau()` — procedural village and terrain generators
- VFX toolkit — motes, beams, ring waves, pillars, slash arcs; `warmupVFX()` precompiles shaders
- `_shot/` harnesses — `slice.js`, `diag.cjs`, `livegame.cjs`, `perf.cjs`

### Known content limitation

Reskinned mobs share silhouettes. 27 mobs come from 24 models, and most of the mob list is
elemental variants (frostling/emberling/marblestatue are all one `Goleling`). Correct for
siblings; it does mean Frostfell and Emberdeep differ by palette more than by creature design.
**Oliver has not ruled on whether that is acceptable.**

---

## 5. The hero3d experiment — exact state

**File:** `public/3d/hero3d.js` (ES module). **Off by default.**

Enable: `HERO3D.on = true`, or URL `?hero3d=1`. Also `&scale=`, `&model=`, `&yoff=`.
Flags: `{ on, scale:15, yOff:0, yawOff:π, model:'Warrior', ready, err }`.

**Game-side changes — three lines plus two tags:**
- `:2818` expose `gl`
- `:2819` expose `__BF_CAM()`
- `:11952` `drawHero3` sets `__hero3dPending` and returns early
- `:3053` and `:3061` — `flushBatch` consumes the pending draw
- `:13814` importmap, plus `<script type="module" src="./hero3d.js">`

Backup of the pre-change game: `_shot/3d_backup.html`.

### What is verified working

- Module loads in the real game; **26 clips** load (`[hero3d] ready — 26 clips`)
- Shared context accepted: `new THREE.WebGLRenderer({ canvas, context: window.__BF_GL })`
- **Interception works** — instrumented in live gameplay: **19–21 calls, 100% returned true**,
  and the voxel hero is absent from the scene
- **Camera sync is correct** — probe reports the character at the player's exact world position,
  ndc `[-0.001, -0.492, 0.832]`, `onScreen: true`, ~100 px tall on a 620 px canvas
- Scale corrected 26 → 15 (measured 44.6 units vs the voxel hero's ~45)
- Animation is driven by real gameplay state (`p.vx/vz`, `onGround`, `dead`, `dodgeTimer`)
- **Game unaffected with the flag off**, zero page errors

### The bug you already diagnosed, confirmed

Your framebuffer diagnosis was right. With bloom on, `PostFX.begin()` binds `sFBO`; Three's
`setRenderTarget(null)` draws to the **default** framebuffer; `PostFX.end()` then composites
`sTex` over the screen, erasing it.

**Answering your explicit question:** yes, the Three render was attempted **while the game's
scene FBO was bound** — but Three overrode the binding to the default target, which is precisely
the routing bug.

**Reproduction of the invisible magenta cube**
1. `http://localhost:4319/3d/?hero3d=1` (bloom ON)
2. Click through: title → New Game → Skip → name → Begin Your Legend → Begin the trial → Got it
3. Console: `__hero3dDebugCube(true)` — a 40-unit unlit magenta cube at the hero, `depthTest:false`,
   `renderOrder 9999`
4. **Invisible.** `__hero3dGLState()` reported `fbo:"default"`, but **that probe runs outside the
   render loop, so the reading was worthless** — my methodological error, and the same class as
   measuring a head in the T-pose instead of the animated pose. State must be sampled at the
   instant of the draw.
5. Add `&nobloom` → **the cube appears immediately.** Diagnosis confirmed.

### `?hero3d=1&nobloom` — tested, result

**The Warrior glTF renders in live gameplay** while the game awards XP, drops gold and runs
combat. Screenshot: `_shot/hero_real.png`.

**But only partially.** `__hero3dMeshes()` in the live game:

```
Warrior_Body   skinned:TRUE   visible:true  frustumCulled:false  bsR:2.15  MeshBasicMaterial  1512 tris   ← DOES NOT DRAW
Face           skinned:false  visible:true  ...  2682 tris  ← draws
ShoulderPadL   skinned:false  visible:true  ...   248 tris  ← draws
ShoulderPadR   skinned:false  visible:true  ...   248 tris  ← draws
Warrior_Sword  skinned:false  visible:true  ...   712 tris  ← draws
```

**Only the skinned mesh fails.** The character appears as floating hair, gauntlets and a sword.
Screenshot: `_shot/hero_body.png`.

`__hero3dSkinCaps()` — capabilities are sufficient, so this is not a hardware limit:

```
isWebGL2:false  floatVertexTextures:true  OES_texture_float:true
maxVertexTextures:32  maxVertexUniformVectors:4096
boneCount:32  hasBoneTexture:true  programs:2
```

### Every failed hypothesis, in order

| # | Hypothesis | Evidence against |
|---|---|---|
| 1 | Matrices need transposing | Game is column-major (`mT` → 12/13/14, `mMul` → `[c*4+r]`). Already compatible. |
| 2 | Draw ordering — painted over by `flushBatch` | Deferred the render to after the batch flush. No change. |
| 3 | Missing `setSize`/`setViewport` | **Real bug, fixed** — removed the stray misplaced geometry. Not sufficient. |
| 4 | *"Shared WebGL 1 context is impossible"* | **WRONG.** Your framebuffer diagnosis disproved it; `?nobloom` renders fine. |
| 5 | Frustum culling on the SkinnedMesh | `frustumCulled=false` on all meshes. No change. Also rules culling out, since the visible meshes had the same flag. |
| 6 | Skeleton not updating | Explicit `skeleton.update()` each frame after `mixer.update()`. No change. |
| 7 | Leftover instancing divisors on `skinIndex`/`skinWeight` | `vertexAttribDivisorANGLE(i,0)` across `MAX_VERTEX_ATTRIBS` before render. No change. |

Fixes 5–7 are harmless and left in as hygiene. **Discount my instincts here — I have been wrong
four times in this specific area.**

`docs/CODEX_FOLLOWUP_skinning.md` asks four narrower questions about #5–7.

---

## 6. Face-system preservation package

### CRITICAL: I cannot export Oliver's browser data, and you should know why

You asked for the exported JSON of `bf_eye`, `bf_mouth` and `bf_weap`. **That data lives in
Oliver's browser localStorage on his devices. I have no access to it** — my harnesses run in a
throwaway headless Chrome with empty storage. I have never read or written his real storage, and
I have not reset or deleted anything.

**The good news: it is already preserved in code, which is stronger than a storage dump.** Every
value Oliver tuned was pasted to me and committed as constants. A fresh browser with empty
storage renders all six faces exactly as he tuned them — verified by clearing storage in the
harness and comparing.

**To obtain the live browser copy anyway**, Oliver should: open `/slice3d/` → **FACE** panel →
**Backup all**. That copies a JSON blob containing `eye`, `mouth`, `frame`, `weapon` and
`weaponFrame` to the clipboard and logs it to the console. **Restore from backup** takes it back.
Worth capturing before any renderer work, purely as belt-and-braces.

### The design flaw you identified, and its fix

You were right that saving slider values without their coordinate frame was the root cause of
faces shifting. **That is fixed, and the in-memory `HEAD_CACHE` is no longer the answer** —
please re-check, as your note described the intermediate state.

What is committed now (`public/slice3d/index.html`):

- **`FACE_FRAMES`** (**:1969**) — six frozen frame constants, in code, not storage
- **`FACE_PRESETS`** (**:2225**) — Oliver's tuned values, in code
- **`FACE_FRAME_VERSION = 2`** (**:1841**) — versioned, so v1 entries cannot be silently
  reinterpreted
- `headMetrics` (**:2049**) returns a **stored frame outright**; `measureHead` (**:1852**) is only
  consulted for a model with no frame
- `bf_frame` is saved alongside `bf_eye`/`bf_mouth`; `persistFrame()` pins the frame on save
- `settleHead` (**:2094**) pins the mixer to t=0 before measuring, so a measurement is
  deterministic across loads
- UI: **Lock face**, **Lock weapon**, **Backup all**, **Restore**, **Revert this model to shipped**
- Nothing clears storage. `revertModel()` deletes one model's key only.

**Proof it holds:** with `window.__BREAK_MEASURE = true` making `measureHead` return garbage
(every dimension `9`), all six faces render **byte-identical**:

```
NORMAL             warrior 0.5714/0.7953/0.7773 ... reaper 0.6697/0.8654/0.834
MEASUREMENT BROKEN warrior 0.5714/0.7953/0.7773 ... reaper 0.6697/0.8654/0.834
IDENTICAL: YES
```

### The baked values — the actual work, verbatim

`FACE_FRAMES` and `FACE_PRESETS` are extracted verbatim to **`docs/FACE_VALUES_verbatim.txt`**
(also includes `WEAPON_PRESETS` and `ARCHETYPE_WEAPONS`). Summary:

| Model | eye spread / height | faceYaw | offX | mouth |
|---|---|---|---|---|
| Warrior | 0.145 / −0.185 | 0 | 0 | line, y −0.465 |
| Ranger | 0.175 / −0.220 | 0 | 0 | line, y −0.465 |
| Wizard | 0.195 / −0.225 | 0 | 0 | flat, y −0.505 |
| Cleric | 0.230 / −0.210 | 0 | 0 | smile, y −0.465 |
| Monk | 0.200 / −0.220 | **+0.150** | −0.015 | flat, y −0.455 |
| Rogue | 0.195 / −0.265 | **−0.130** | **+0.175** | smirk, y −0.625, **z −0.075** |

Two deliberate oddities that must not be "fixed":
- **Rogue mouth z is negative — inside the head, on purpose.** The scarf covers that part of the
  face, so a mouth there only pokes through cloth.
- **Monk `faceYaw` is +0.150 and Rogue −0.130**, with `offX` values, because those two heads sit
  off-centre and turned relative to their own bone. `FACE_FRAMES` shows why: Warrior/Ranger/
  Wizard/Cleric share `fwd0 [0.0005, 0.112, 0.9937]`, while Monk is `[-0.129, 0.071, 0.989]` and
  Rogue `[-0.129, 0.111, 0.985]`.

### Every coordinate-system change, with consequences

| Change | Commit | Consequence |
|---|---|---|
| Head found by picking the mesh with most vertices | early | **Bug** — picked the *body*. All offsets were body-sized; eyes floated beside the skull. |
| Head found from **skin weights** | `c2670c6`-era | Correct. Head measures 78–180 verts at head scale. |
| Switched measurement to **bind pose** | `c2670c6` | **My worst mistake.** I noted in that commit that it would shift Oliver's tuned values, and shipped anyway. It invalidated a full session of his work. |
| Reverted to the live frame + in-memory cache | `cm31` | Restored his reference. Cache died on reload — the flaw you spotted. |
| Deterministic pose (mixer pinned to t=0) | `cm31` | Reproducible across loads. |
| **Persistent versioned frames** | `cm32` | Your design. Values now immune to measurement changes. |
| `lockPlacement` re-measured live | `cm32` | **Bug** — pressing Lock would itself move the face. |
| `lockPlacement` pins the frame **in use** | `cm33` | Lock is now a visual no-op. |

**The rule I would ask you to enforce on me: never change the face measurement basis again
without converting the stored values in the same commit.**

### Visual references

Committed screenshots in `docs/`:

- **`reference_all_faces.png`** — all six faces, 3×2 grid, rendered from a **cleared browser** (code
  constants only). This is the reference for "correct".
- `reference_hero_in_game.png` — the port working (body missing)
- `reference_hero_body_missing.png` — close-up of the missing skinned body
- `reference_port_compare.png` — voxel vs 3D side by side in the real game
- more in `_shot/`: `mouth_shapes.png`, `six_classes.png`

---

## 7. Performance and QA

### I have no valid performance data, and you should not infer any

**My harness has no GPU.** It runs headless Chrome with `--use-angle=swiftshader`, i.e. software
rasterisation. Measured wall-clock in live gameplay:

```
voxel only        10.9 fps
3D hero on        8.4  fps
```

**These numbers are worthless for judging the real thing.** They tell you software rasterisation
is slow. A ~23% drop under software rendering does not predict GPU behaviour.

**No measurement has ever been taken on Oliver's phone.** This is the single largest unknown in
the project and it sits directly under the mobile requirement.

The game has its own instrumentation — **`VOXMET`** (`frame, submitted, drawCalls, assemblies,
culled, lod, peak, lastMs`) and a profiler on the **P** key. Note `VOXMET` is a top-level `const`
so it is **not** on `window`; exposing it needs a closure like `__BF_CAM`.

### Known mobile issues

- Oliver reported "0 fps" on skill effects earlier in the slice. Causes were 250+ draw calls from
  one skill (7 projectiles × a trail sprite every 0.02 s, each with its own material) and 22
  simultaneous lights. Fixed to ~35 drawables and 6 lights. **The lesson generalises: draw calls
  and light count are the sensitive axes.**
- `~72 meshes per building` from `makeBuilding`. Fine for five; needs merging before a full hub.
  Geometry is static so it merges cleanly.
- The slice ships 114 MB of assets; the 3 Mixamo FBX alone are 31 MB and uncompressed.

### Harnesses and debug hooks

`_shot/`: `slice.js` (screenshot the slice), `diag.cjs` (page errors + `__SLICE` presence),
`livegame.cjs` (click into gameplay, instrument, screenshot), `perf.cjs`, `sabotage.cjs`
(proves face immunity), `game.cjs`, `faceqa.py`.

`window.__SLICE` in the slice exposes ~50 hooks. `window.HERO3D`, `__hero3dProbe`,
`__hero3dMeshes`, `__hero3dSkinCaps`, `__hero3dGLState`, `__hero3dDebugCube` in the game.

### Acceptance tests I would require of any renderer change

1. **Game unaffected when off.** Load `/3d/` with no flags: zero page errors, hero renders as
   voxels, `__BF_CAM()` returns 16-element matrices.
2. **Bloom still applies.** With the 3D path on and bloom **on**, an emissive object still glows.
3. **Occlusion is correct.** Walk the hero behind a wall or pillar — it must be hidden.
4. **Fog applies to the character** at distance, matching adjacent voxel geometry.
5. **Skinned body draws** — `__hero3dMeshes()` shows `Warrior_Body` and it is visible.
6. **Faces unchanged.** Run `sabotage.cjs`; all six must stay byte-identical.
7. **Phone.** Measured frame time on Oliver's actual device, before and after. **No renderer
   change should be accepted without this**, given the mobile requirement and the absence of any
   baseline.
8. **State hygiene.** After a frame with the 3D path on, the game's next frame is visually
   identical to the pure-voxel build — no leaked GL state.

---

## 8. Open decisions and proposed next step

### Safe to implement without Oliver

- Diagnosing and fixing the skinned-mesh failure (§5)
- Routing Three into the game's scene target so bloom stays on (your Option D)
- Exposing `VOXMET` via a closure for measurement
- Merging static village/terrain geometry to cut draw calls
- Compressing or removing the parked Mixamo FBX files

### Needs Oliver's choice

1. **Does the 3D version replace the voxel game or ship alongside it?** I asked four times and it
   is still open. It determines how much of the 25 draw functions must eventually move.
2. **Are reskinned mobs sharing silhouettes acceptable?** Affects whether a monster pack is needed.
3. **Coloured class skins** — the agreed replacement for visible armour, not yet started, and it
   is the last piece of character identity.
4. **Mobile performance budget** — what frame time is acceptable, and on which device.

### Proposed smallest next proof-of-concept — NOT STARTED

**One Warrior, one clip, rendered into the game's existing scene framebuffer, with bloom on.**

- reuse `hero3d.js` as-is; change only the render target
- same camera from `__BF_CAM()`
- success = the skinned body is visible, bloom still glows, and the hero is occluded by a wall
- test behind a voxel wall, in fog, and on Oliver's phone

I have deliberately not begun this. Direct the target ownership (Three owning a
`WebGLRenderTarget` that the voxel renderer draws into, versus Three drawing into the game's
`sFBO`) — that is the decision I would most likely get wrong on my own.

---

## Codex starting point

**Read first, in order**
1. `public/3d/index.html:13704–13713` — the frame order. Everything follows from it.
2. `public/3d/index.html:2942–3060` — `PostFX` and `flushBatch`, including my hook at :3053/:3061.
3. `public/3d/hero3d.js` — the whole file, ~240 lines.
4. `public/3d/index.html:11947–11960` — the `drawHero3` interception.
5. `public/slice3d/index.html:1841–2260` — the face system and the frozen frames.
6. `docs/CODEX_FOLLOWUP_skinning.md` — the four narrow skinning questions.

**First browser test to run**
```
http://localhost:4319/3d/?hero3d=1&nobloom
```
Click: title → New Game → Skip → type a name → Begin Your Legend → Begin the trial → Got it.
Then in the console:
```js
__hero3dMeshes()     // Warrior_Body is the only skinned mesh, and the only one not drawing
__hero3dSkinCaps()   // capabilities are all sufficient
__hero3dProbe()      // position, ndc and pixel size are all correct
```
Compare against the same URL **without** `&nobloom` — the character disappears entirely, which
is your framebuffer finding.

**Risks to avoid**
1. **Do not change the face measurement basis** without converting the stored values in the same
   commit. I did that once and destroyed a session of Oliver's tuning.
2. **Do not clear `bf_eye`, `bf_mouth`, `bf_weap` or `bf_frame`.** Use `revertModel()` for a
   single model.
3. **Do not sample GL state from outside the render loop.** My `fbo:"default"` reading was
   correct and meaningless, and it cost hours.
4. **Do not trust deploy without polling for a marker string.** I twice reported a fix live before
   it had propagated.
5. **Gate commits on the syntax check properly.** I once chained commit and deploy after a failing
   check with `;` instead of `&&` and shipped a parse error that blanked the live page.
6. **Do not attempt Option C** (hand-written WebGL 1 skinning). Your bone-budget objection is
   correct and I had underrated it.
7. **Assume the 13,817-line game is the asset and the renderer is the experiment.** Nothing in
   the graphics work justifies risking loot, quests, forge, achievements or multiplayer.
