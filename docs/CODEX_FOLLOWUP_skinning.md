# Follow-up: skinned meshes don't draw in the shared WebGL 1 context

Your framebuffer diagnosis was right and unblocked this — with `?nobloom` the character now
renders inside the real game. Thank you. One narrow problem remains and I'd rather hand it to
you than keep guessing, since I've now had four wrong hypotheses in this area.

## Symptom

With shared context + `?nobloom`, in gameplay:

- **`Warrior_Body` (the only `SkinnedMesh`) does not draw.**
- `Face`, `ShoulderPadL`, `ShoulderPadR`, `Warrior_Sword` — all non-skinned — draw perfectly.

So the character appears as floating hair, gauntlets and a sword. Non-skinned rendering through
the shared context is fine; GPU skinning specifically is not.

## Measured facts

`__hero3dMeshes()` in the live game:

```
Warrior_Body   skinned:true   visible:true  frustumCulled:false  bsR:2.15  MeshBasicMaterial  1512 tris
Face           skinned:false  visible:true  ...  2682 tris   ← draws
ShoulderPadL/R skinned:false  visible:true  ...   248 tris   ← draw
Warrior_Sword  skinned:false  visible:true  ...   712 tris   ← draws
```

`__hero3dSkinCaps()`:

```
isWebGL2: false          floatVertexTextures: true    OES_texture_float: true
maxVertexTextures: 32    maxVertexUniformVectors: 4096
boneCount: 32            hasBoneTexture: true         programs compiled: 2
```

So capabilities look sufficient and the bone texture exists.

## What I tried, all of which failed

1. `frustumCulled = false` on every mesh — no change. (Also confirms it isn't culling: the
   visible meshes had the same flag before.)
2. Explicit `skeleton.update()` each frame after `mixer.update()` — no change.
3. Clearing leftover instancing divisors before Three's draw —
   `vertexAttribDivisorANGLE(i, 0)` for all `MAX_VERTEX_ATTRIBS` — no change. My reasoning was
   that the game's instanced attributes (`iM`, `iS`, `iCA`, `iE`) leave divisors set, and
   `resetState()` doesn't reset them, so `skinIndex`/`skinWeight` would advance per instance
   rather than per vertex. Plausible, but it didn't fix it.

All three are harmless and left in as hygiene.

## Where to look

- `public/3d/hero3d.js` — the layer. `drawHero3D()` does
  `resetState() → clearDivisors() → render() → resetState()`.
- `public/3d/index.html` — the game. Its renderer sets attributes `aP`, `aN` and per-instance
  `iM`, `iS`, `iCA`, `iE`, draws with `INST.drawArraysInstancedANGLE`, and binds its own
  textures for the PostFX pass.

## Questions

1. What else does the game's GL state leave behind that would break **only** skinning?
   My remaining suspicions are the bone texture's texture-unit binding versus the game's
   `activeTexture` state, or `resetState()` not covering something specific to WebGL 1.
2. Is `renderer.resetState()` actually sufficient for a context another renderer drives, or is
   there a documented additional step?
3. Would forcing Three onto uniform-based skinning instead of the bone texture be a valid
   workaround? With 4096 vertex uniform vectors and a 32-bone rig this should fit easily. Is
   there a supported way to select that path in r160?
4. Does this change your Option D recommendation? Rendering into the game's scene target won't
   help if skinning is broken regardless of the target.
