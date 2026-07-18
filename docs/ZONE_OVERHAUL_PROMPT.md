# BLADEFALL — Zone Identity Overhaul: ALL remaining levels (dev work order)

> Ready-to-run prompt for a single LONG unattended BLADEFALL dev session (~5 hours).
> Two-stage inspect-then-implement, shipped in SMALL BATCHES so every hour of work is
> already live even if the session ends early. LOCKED decisions are final; everything
> else is derived from the actual code.

---

## === BLADEFALL OPERATING CONTEXT ===
- The game is the SINGLE self-contained file `public/3d/index.html` (live at `/3d/`).
  Debug hook: `window.__BF3`. Dev auto-mute already ships (localhost / `?mute=1`).
- **DO NOT BREAK SAVES.** This update touches level geometry only — zone data (quests,
  ids, tiers, bosses) and all meta.* save state stay untouched.
- **VERIFY IN A REAL BROWSER** before each ship (`python -m http.server` in `public/`,
  open `/3d/?mute=1`). Parse-check first (`node -e "new Function(<script>)"`), then
  browser-verify. The node stub can't compile GLSL.
- **SHIP PER BATCH:** after EVERY zone batch — bump `VERSION3D`, commit with a real
  message, `git push` from INSIDE the submodule (Cloudflare auto-deploys), confirm the
  new version serves live. NEVER hold five zones of work uncommitted.
- **ON FULL COMPLETION:** log everything in `UPDATE_ROADMAP.md` as a new phase.
- **SCOPE GUARD:** level/arena geometry + set dressing + encounter placement ONLY. Do
  NOT touch pets, the status system, endless mode, weapons, classes, save schema.
- **THIS RUNS UNATTENDED.** Never stop to ask a question. If something is ambiguous,
  make the smallest grounded call, note it in the final report, and keep going.

## === THE GOAL ===
Bring EVERY remaining zone up to (and past) the Hollow Pass bar. Hollow Pass
(`SCAPES.hollow`) is the proven template: a real JOURNEY several minutes end to end,
with named landmark set-pieces, a route FORK (low road vs high road), verticality,
secrets tucked into dead ends, quest content woven into the terrain, and per-zone
mechanics. The remaining scapes (`frost`, `ember`, `abyss`, `palace`, `castle`) are
~20-line v1 sketches — flat, short, and samey. Outskirts and Keep are mid-tier; improve
them ONLY with remaining budget after the five weak zones are done.

**"Bigger, better, smarter, more unique":** each zone must become
1. **BIGGER** — a multi-minute traversal with distinct regions, not one room-cluster.
2. **BETTER** — landmark set-pieces you'd screenshot; readable silhouettes; the zone's
   hazard integrated into the terrain, not sprinkled on top.
3. **SMARTER** — at least one route choice (fork/loop/shortcut-back), risk-reward side
   pockets, encounters staged to the terrain (ambush points, chokepoints, arenas).
4. **UNIQUE** — a per-zone signature MECHANIC or traversal identity no other zone has
   (see per-zone direction). No palette-swap layouts.

## === LOCKED CONSTRAINTS (respect exactly) ===
1. **Solvable by construction.** Use the existing vertical-scape toolkit (`vseg`,
   `vplat`, `vcol`, `climbRun`, `gapStones`, `gapMovers`, `finishScape`) and respect
   `JMPV`/`JMPH` jump reach on every required step. The harness (`zonescape.js` /
   `complete.js` style checks) must verify: portal reachable, every fetch/find/kill-den/
   secret reachable, kill counts attainable. Run those checks per zone before shipping.
2. **Main levels stay STATIC** (seed off stage+area only — the existing SCAPE pattern).
3. **Quest integration intact.** Every zone's existing quests keep working via
   `scapeKill` / `scapeFetch` / `scapeFind` / `scapeSecret(Triggered)`. Fetch items sit
   ON surfaces. Dens on real ground. Secrets stay discovery-earned (hidden, off the
   main path) — never signposted.
4. **Per-zone hazards stay** (`Z.haz`) and should be woven INTO the geometry (slick ice
   on the actual climb, vents guarding the actual causeway, phase tiles on the actual
   bridges).
5. **Boss arenas become themed SET-PIECES.** They currently fall through to the shared
   maze. Give each boss a purpose-built arena (compact — the fight is the content) that
   matches its zone + fight mechanics: use the `isBoss` branch in `loadStage` to
   dispatch to per-zone arena builders. Keep `goalRoom`/`portalPos`/`b.home` semantics
   so the fights + portals still work.
6. **PHONE PERF.** Deco is cheap boxes; stay within the deco/torch counts the existing
   heavy zones already use (~Hollow Pass budget, not 3x it). No per-frame allocation.
7. **No new art files.** Everything from `bx()`/deco/theme tints.

## === PER-ZONE CREATIVE DIRECTION (adapt to what the code supports) ===
- **FROSTFELL (tier 4, slick):** an ascending glacier JOURNEY: frozen-lake crossing
  (crumbling ice floes over the hazard), icefall terraces, an ice-cave interior passage
  (the unique identity: an enclosed crystalline gallery), frozen dead Wardens as
  landmark statuary, aurora-lit summit approach. Fork: lake shortcut (risky floes) vs
  the long cliff road. Boss arena: a cracked frozen arena ringed by icefall columns.
- **EMBERDEEP (tier 5, lava/vents):** a DESCENT into a caldera: switchback basalt
  causeways over magma, vent-gauntlet corridors (time the eruptions), obsidian spire
  fields, a collapsing bridge set-piece. Unique identity: rising/falling magma sections
  or conveyor-like ember lifts (movers). Fork: vent gauntlet (fast, dangerous) vs spire
  climb (slow, safe). Boss arena: a shrinking basalt island in a lava sea.
- **ABYSS APPROACH (tier 6, void):** gravity is loosening — floating island chains,
  drifting debris (movers), phaseable void-rifts, inverted/tilted ruin fragments of the
  zones above (callback deco). Unique identity: long float-jump chains between islands
  with big airtime. Fork: upper drift-path vs lower shattered-causeway. Boss arena: a
  ring of orbiting platforms around the Abyss King's throne-island.
- **SUNSPIRE PALACE (tier 6-7, marble/holy):** a grand CEREMONIAL AXIS: mirrored
  processional hall, hanging-garden terraces (keep the existing fetch), a light-shaft
  cloister where gold beams mark safe/unsafe ground, throne-approach staircase flanked
  by colossus statues. Unique identity: formal symmetry deliberately BROKEN in one wing
  (the corrupted wing = the secret's home). Boss arena: the Marble Colossus in a domed
  rotunda with collapsing pillars.
- **CASTLE DUSKMOOR (tier 7, apex):** the final SIEGE ASCENT: breached outer wall,
  courtyard battlefield (staged large fight), rampart run with murder-hole hazards,
  broken tower spiral climb, a last bridge to the keep against the skybox. Unique
  identity: the ascent itself — every region visibly higher, with look-backs over
  everything you climbed. Boss arena: the Void Tyrant atop the keep — an open-sky
  summit platform with collapsing edges.
- **Remaining budget, in order:** (1) Outskirts + Keep deepening to the same bar,
  (2) side-zone (secret rift) interiors get a matching identity pass, (3) mini-boss
  arenas (Brute/Marksman/Warden/Sorcerer/Colossus) if not already covered, (4) a final
  whole-game playtest sweep re-verifying every zone's quests end-to-end.

## === STAGE 1 — INSPECT, then write a grounded self-prompt ===
Read before building: `SCAPES.hollow` in full (the bar), the scape toolkit +
`finishScape`, `loadStage`'s SCAPE dispatch + `isBoss` path, each remaining zone's
quests/hazard/theme/mobs (`ZONES`, `STAGES`, `THEMEMOBS`, `HAZARDS`), the harness
verification pattern, and the deco/perf budget of the heaviest existing zone. Then
write the self-prompt: per zone — region list, landmarks, the fork, the unique
mechanic, quest/secret placement, boss arena plan, verification plan.

## === STAGE 2 — BUILD, one zone per batch ===
Order: **Frostfell → Emberdeep → Abyss → Palace → Castle**, then boss arenas if not
done inline, then the remaining-budget list. Per batch: build → parse-check → harness
solvability checks → browser walkthrough (drive `__BF3`: load each area, verify portal
+ quest objects reachable, count deco/enemies, check no console errors) → bump
VERSION3D → commit → push → confirm live → next.

## === VALIDATION (per zone, before its ship) ===
- Both areas + boss arena load without errors; portal + every quest objective + secret
  reachable (harness-verified); kill counts attainable; fetch items on surfaces.
- The zone's hazard functions in the new geometry; movers/crumbles behave.
- FPS-scale sanity: deco/segment/wall counts within ~1.5x of Hollow Pass.
- An old save can enter the zone mid-progression and complete it.

## === FINAL REPORT ===
Per zone: what it was → what it is now (regions, landmarks, fork, unique mechanic,
boss arena), verification results, versions shipped, perf counts, any judgment calls
made, and clearly-separated future work. Log the phase in UPDATE_ROADMAP.md.
