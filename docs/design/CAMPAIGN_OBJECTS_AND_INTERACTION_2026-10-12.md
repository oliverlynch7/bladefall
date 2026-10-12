# Campaign objects and interaction pass

## Request and inspected evidence

Oliver: "Ok once you finish making the chests look awesome, please get back to improving all the campaign levels all the way around". This follows the approved existing-level graphics and independent-new-player readiness work. Chest reference redesign is already live as v2.184.0.

A runtime inventory of all 16 campaign halves shows repeated block-and-slab drawings for notes, documents and quest pickups. Muted normal-camera frames of Winding Cliffs transport orders, Shipwreck Shore rudder, and Sky Library orders confirm the issue. `briarInteract` checks range/height/bounds but not intervening walls; inserting a real 180-unit wall leaves the reading prompt available. `BFStoryAuthority.apply` repeats range checks without occlusion. Several journal tasks still say that a completed side objective requires finishing the half to secure it, contrary to the earned-progress rule.

## Implementation sequence

1. Add cached, bounded-detail 3D campaign object models and an explicit object-key manifest. Readables use appropriate books, notices, brass diagrams or carved markers; tangible pickups use distinguishable silhouettes and materials. Reuse each model geometry, merge material batches, cull distant props and keep the existing primitive fallback. Preserve ranges, puzzles, required state and rewards. Retain authored placements unless the support/clearance audit proves a local correction is needed. Readable furniture remains after reading; collected items disappear using actual saved completion flags. No new colliders for low props or artificial obstacle clutter. Audit overlap and visible support at the affected placements.
2. Add one shared campaign reach check, used for both local prompt selection and host-authoritative story actions. Test at hand/eye height so floors and low furniture do not block ordinary interaction. Respect full-height walls, closed doors and vertical levels. Do not affect existing conversation ownership, remote progress or puzzle logic. Audit all campaign object/NPC approach samples against real support and collision and correct any specific bad placements, not blanket bypasses.
3. Correct stale journal wording about already-secured objectives. Use brief existing-story text; do not introduce story or dialogue branches.
4. Inspect normal-camera before/after frames in every region, exercise real movement and E, reading and pickup disappearance, mistakes/recovery, 3D-disabled fallback, old save and both local co-op roles. Run focused story/reach tests and existing route/checkpoint regressions affected by the reach rule. Verify no page/shader errors, bounded mesh costs and no stale props on scene changes.

## Failure points and boundaries

- A renderer must not hide the primitive until the replacement is actually in the scene. Full renderer fallback must restore originals. Preserve model caches without leaking actors across changing `G`/object arrays.
- Do not infer the object from its generic `kind` alone: many `book` objects are carved stones or notices. Use explicit keys and preserve hints such as animal prints and mechanical diagrams.
- Pickups and furniture have separate visibility contracts; no item reappearing after reload or co-op updates. Existing event flags may use distinct names, so inspect the story effects.
- Interaction ray endpoints must not disable controls mounted near walls or books resting on desks; doors cannot be activated from an adjacent locked room. Keep bounds and height checks in addition to visibility.
- No claim of newly varied puzzles from different prop art. This is presentation and interaction correctness, not a new puzzle framework.
- Automated checks establish behavior, not fun, aesthetic acceptance, physical-network reliability or low-end hardware performance. Human playtesting remains. No new SFX.

## Evidence

Implemented as v2.185.0-campaign-objects. Evidence: [campaign object report](../art-validation/campaign-objects-2026-10-12.json).

- 62 authored objects across all 16 halves now use 20 object models plus two support models. Wood/metal/material variation, seals, page leaves, carvings, tool rolls, coil wire, iron-bound rudder, sailcloth, bandages and herbs replace generic slabs. Templates are cached and merged: 100–3,352 triangles and 1–4 material meshes per template. Items disappear from actual saved pickup flags; readable furniture remains.
- Corrected 17 specific placements after support/overlap checks: `briar.dressings`, `home.orchard.clue`, `hp.rope`, `lc.orders`, `kd.roster`, `kd.lift.note`, `kd.depth.note`, `kd.drain.note`, `ff.trail`, `ic.notes`, `sc.bell`, `tc.tide.note`, `pc.memorial`, `cg.bells`, `cg.store.note`, `cg.balcony.note`, `la.vault.note`. The balcony sign also turns along the walkway. These are local corrections, not replacement maps.
- Both local prompts and host story authority reject reach through solid walls/closed doors. Explicitly tagged control bodies remain usable without bypassing adjacent walls. Coastal walls now use their actual drawn height in movement/reach collision. Shared clues and earned-progress rules remain intact.
- Two misleading journal task descriptions corrected. The wind caption sits above the hotbar without render-quality-dependent drift. Shipwreck Shore's hanging cargo and chain cut away when they obscure the hero, while remaining visible from the release handle and in first person. Supporting decks stay solid.

Automated/real browser verification: all 62 models present; 18 tangible pickups collected, hidden, restored and deduplicated; real E pickup and wall rejection; documents persist; 3D-disabled fallback restores. Physical support/clearance samples for all 62 corrected props pass. Of 238 campaign object/NPC targets, 237 have initial supported approaches; the remaining ice freeze control is reachable on its raised float in the required water state. Existing coastal route automation passed 134 Thunder Cliffs and 50 Shipwreck Shore waypoints with normal movement/jumps, plus their actual gates/boat transactions. An older save, all 24 campaign checkpoints, 12 guidance/guard checks, 11 cooperative route checks and seven new cooperative item/clue checks passed. Eight focused Node suites and 21 script/module syntax checks passed.

Visual verification: inspected a representative normal-camera frame from every campaign half and selected corrected placements. Checked cargo in shoulder/far/first-person, and the wind caption under low graphics. Five representative screenshots are preserved under `docs/art-validation/campaign-objects-2026-10-12/`. No observed page/shader errors in the covered browser sessions.

Boundaries: approach samples and fixtures do not prove that all routes are fun or every asset looks good. The co-op checks use two local clients and real packet handlers, not an external network. Human first-session playtest, aesthetic acceptance and low-end-device performance remain open. The broader campaign goal stays open. No custom SFX changes. Unrelated `companion3d.js` and `articulated-rigs.json` edits excluded.

Reproduction uses the existing headed, muted Playwright CLI workflow on port 4345: `scripts/qa-campaign-objects.cjs`, `scripts/qa-campaign-object-coop.cjs`, `scripts/qa-campaign-reach.cjs` and `scripts/qa-campaign-object-footing.cjs`. Run `node scripts/test-campaign-interaction.cjs` for the focused authority/reach/persistence regression.
