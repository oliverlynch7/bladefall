# Second opinion needed: how to get 3D characters into Bladefall

I'm about to commit to a renderer architecture and I want it challenged before I build.
Please verify the claims below against the code yourself rather than trusting my summary —
several of my earlier diagnoses in this area were wrong, and I've noted where.

## The goal

Bladefall is a working browser ARPG. I want to replace its voxel characters with textured,
skinned 3D characters (glTF, ~26 shared animations) **without rebuilding the game**.

## Files

- `_automation/bladefall/public/3d/index.html` — the real game, 13,790 lines
- `_automation/bladefall/public/3d/hero3d.js` — my attempted 3D layer (off by default)
- `_automation/bladefall/public/slice3d/index.html` — a separate Three.js testbed where the
  characters, faces, weapons and animations already work
- Live: `bladefall.pages.dev/3d/` and `bladefall.pages.dev/slice3d/`

## What I measured about the game (please spot-check)

- It renders with **WebGL 1** — `canvas.getContext('webgl', ...)`, and it uses the
  `ANGLE_instanced_arrays` extension (`INST.drawArraysInstancedANGLE`).
- Its geometry is **one unit cube, 36 vertices, drawn instanced**. Everything in the world is
  a box instance carrying a matrix, scale, colour+alpha and emissive.
- Its shader has **no UV attribute and no texture sampler**. It does have distance fog
  (`uFogNF`, `uFog`), a key light (`uKey`), ambient/diffuse, and **point lights**
  (`uPL`, `uPC`) used for torches and spell glow.
- Drawing is isolated in **25 `drawX` functions**, plus a single `project()` with 16 call
  sites. `drawHero3` is called last, commented "the real you, drawn last — always visible".
- It uploads explicit **`PROJ` and `VIEW`** matrices as uniforms. Its matrix helpers
  (`mT`, `mMul`, `mPersp`, `mLookAt`) are **column-major**, i.e. already compatible with
  Three.js's `Matrix4.fromArray`.
- The 4 `getContext('2d')` uses are UI only — HP bar, paper doll, minimap.
- Game content for scale: 16 classes, ~112 skills, 14 zones, 8 bosses, plus loot/rarity,
  quests, forge, achievements, summons and PeerJS multiplayer. This is the thing I do not
  want to rewrite.

## What I tried, and the result

I added Three.js **sharing the game's WebGL context**
(`new THREE.WebGLRenderer({ canvas, context: gl })`), built a Three camera from `PROJ`/`VIEW`,
and had `drawHero3` hand off to it.

Verified working:
- module loads inside the game; 26 animation clips load
- the interception works — instrumented 20 calls, 20 returned true, and the voxel hero is
  correctly absent from the scene
- camera sync is correct — the character lands at the player's exact world position,
  ndc `[-0.001, -0.492, 0.832]`, on screen, ~100px tall on a 620px canvas
- scale corrected to 15 units/metre — measured 44.6 units tall vs the voxel hero's ~45
- game is unaffected with the flag off; zero page errors

**Verified NOT working: nothing Three draws reaches the screen.** Decisive test — a 40-unit
unlit magenta cube at the hero's position with `depthTest:false` and `renderOrder 9999` is also
invisible. GL state at draw time is clean: scissor off, viewport `[0,0,1000,620]`, default
framebuffer, `colorMask` all true, depth test on with `GL_LESS`, depth range `[0,1]`.

Things I wrongly blamed first, in order, so you can discount my instincts here: matrix
transposition (conventions already matched), draw ordering (deferred past `flushBatch`, no
change), and a missing `setSize`/`setViewport` (real bug, fixed, but not sufficient).

**My conclusion:** you cannot hand Three.js a live WebGL 1 context that another renderer is
actively driving with its own program and attribute state; `renderer.resetState()` is not
enough. **Please tell me if this conclusion is wrong** — if there's a way to make shared
context work, that changes everything.

## The three options

**A — Layered canvas.** Three.js on its own transparent canvas over the game's, driven by the
same `PROJ`/`VIEW`.
- Pro: ~1 hour; reuses everything already proven
- Con: separate depth buffer, so characters always draw on top of world geometry
- Con: no access to the game's fog or point lights, so characters will look pasted on
- Con: two render passes plus an alpha composite each frame (mobile matters — the target
  device is a phone)
- Con: screenshake / hit-flash / vignette apply to the game canvas, not the overlay
- Con: only ever works for things drawn last, so it cannot carry the 27 mobs or 8 bosses

**B — Replace the game's renderer with Three.js entirely.** Rewrite all 25 `drawX` functions
against Three.
- Pro: correct depth, real lighting, shadows, post-processing
- Con: the largest job by far, and it puts every existing system at risk at once

**C — Extend the game's own renderer to draw skinned meshes.** Add a second shader plus glTF
vertex/weight upload and GPU skinning to the existing WebGL 1 renderer.
- Pro: one renderer, so no context conflict — the thing that just defeated me is designed out
- Pro: characters inherit the game's existing fog, key light and point lights for free
- Pro: correct depth sorting against the voxel world automatically
- Pro: scales to mobs and bosses
- Con: I must write GPU skinning against WebGL 1 (bone matrices as uniforms or a texture,
  4 weights/vertex), plus glTF mesh upload and CPU animation sampling
- Con: WebGL 1 uniform limits may cap bone counts; our rigs are 32 and 65 bones

**My current preference is C.** I may be wrong, and I'd rather be corrected now.

## What I'd like from you

1. **Is my shared-context conclusion correct?** Is there a supported way to run Three.js on a
   WebGL 1 context another renderer is driving? If so, A and C both become unnecessary.
2. **Is C realistic on WebGL 1?** Specifically: bone-matrix delivery for 32–65 bone rigs given
   `MAX_VERTEX_UNIFORM_VECTORS` on mobile, and whether a bone texture is required. Any reason
   it's harder than I think?
3. **Am I underrating A?** Is "characters don't receive fog or point lights" actually as bad as
   I claim in a stylised game, or am I over-thinking the cosmetics?
4. **Is there an option D I haven't seen?** For example: pre-rendering character animations to
   sprite atlases, or extending the game's shader to texture the existing cube instances rather
   than importing meshes at all.
5. **Phone performance.** Which option is safest on a mid-range phone, and is there a measurable
   test worth running before committing rather than after?

Please be blunt. I have burned a lot of the owner's time on this and would rather be told the
plan is wrong now than after a day of building.
