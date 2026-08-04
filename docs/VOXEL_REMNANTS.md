# Where the old voxel character is still drawn

Swept after Oliver found first person still using it. The 3D hero layer draws only when
`deferArmed()` is true and the call site does not pass `preview=true` - so every remaining voxel
appearance is one of those two conditions. Four sites, in order of how often you see them.

## 1. The bag / inventory paper-doll — `bagDollRender()` (index.html ~3783)

`drawHero3(p, t, TRUE)`. You open your bag constantly, and the character shown in it is the voxel
one wearing voxel gear, in a game where everything else is a model. Most-seen remnant by a distance.

## 2. The title screen backdrop — `G0BACKDROP()` (~15550)

`drawHero3(fake, t, TRUE)`. The slowly turning hero behind the main menu. It is the first thing
anybody sees of the game, and it is the old character.

## 3. Skin thumbnails — `skinAv(id)` (~15707)

`drawHero3(fake, 1.2, TRUE)`. Small avatars in the skin picker. Lowest value: they are thumbnails,
and a voxel thumbnail reads fine at that size. Worth doing last or not at all.

## 4. The hub mirror — `drawWaystation` (~14384)

Already routes to `__hero3dMirror()` and falls back to voxel only when the clone cannot be supplied.
Whether the clone actually READS in the glass is still unverified - see the E3 notes.

## Not a voxel remnant, but found during the sweep and worth checking

`drawHero3(pp, t)` at ~9192 draws a REMOTE PLAYER in multiplayer with no preview flag, which routes
it to the 3D layer's `__hero3dPending` slot. That slot holds ONE hero. The local player uses it every
frame, so a remote player and the local player are writing to the same single slot in the same frame.

This has never been tested with two devices on the current build. It may be fine - last writer wins,
and the remote hero may simply be dropped - or remote players may flicker or replace your own model.
Flagged rather than fixed: it needs two machines to observe, which is exactly the test Oliver has and
I do not.

## The fix these share

The bag doll and the title backdrop both draw into the GAME canvas using the CURM matrix stack, so
`__hero3dPreview()` (built for character creation, which renders to its OWN canvas) is not a drop-in.
Either give them their own canvas as character creation has, or teach the 3D layer to render a hero
at an arbitrary transform into the current frame. The second is more work and fixes all of them at
once.
