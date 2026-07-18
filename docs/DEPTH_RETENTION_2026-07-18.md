# BLADEFALL — Depth, Retention & Feel update (2026-07-18)

> ONE session's work in shippable batches, IN ORDER. Bump VERSION3D, verify in a real
> browser, push after each. **RUN THIS AFTER `MASTER_UPDATE_2026-07-18.md`** — Batch 3
> (codex) and Batch 4 (run-card) depend on the new zone bestiary and the harder Descent
> from that update.

## === OPERATING CONTEXT ===
- Single file `public/3d/index.html` (live at `/3d/`). Debug hook `window.__BF3`.
- Auto-mute ships (localhost/`?mute=1`). DO NOT BREAK SAVES (normWeapon/LEGACY_ART/meta).
- Verify in a REAL browser; each ship: bump `VERSION3D`, `git push` from the submodule.

---

## BATCH 1 — Unique legendary system + Ian's Blade (the capstone chase)
Today ALL loot is procedural; the hardest "purple secret" rifts drop generic banded loot.
Add a small set of **hand-authored UNIQUE legendaries that are FOUND, not dropped** — the
best items in the game, each with a one-line legend, excluded from the random pool.
- **New `UNIQUES` table:** each entry = fixed arche + fixed rarity (legendary) + a NAME + a
  one-line legend + a SIGNATURE effect beyond stats (e.g. a proc, an on-kill effect, a
  passive). Uniques never appear in `makeWeapon`/shop/forge random rolls.
- **Placement:** the HARDEST secret in each zone awards one specific unique (per-zone table),
  granted ONCE and tracked in `meta` (re-clearing a cleared secret does not re-award). Turns
  "there's a hidden room" into "I need THAT room." Reuse the existing secret-rift reward hook.
- **IAN'S BLADE — the crown jewel** (currently pure lore on the concept sheet, NOT in the
  game): a unique, **build-agnostic** legendary — it **ignores the off-class multiplier** so
  EVERY class wields it at full power, and it has real presence (a signature effect + a
  distinct look + a boss-tier drop fanfare). **Acquisition = reaching deep in the Abyssal
  Descent** (a specific floor — pick against the NEW harder scaling, e.g. Floor ~20; this
  also becomes the target for the re-gated 'ascended' celestial skin from the master update,
  so keep them consistent). Grant once, tracked in `meta`. (A hidden multi-step quest is the
  alternative if the dev judges it cleaner — but the deep-Descent reward is self-contained
  and ties to content that now exists.)
- Verify: a unique awards once from its secret and never re-awards; uniques never roll from
  random loot/shop/forge; Ian's Blade grants at its Descent floor, hits full power on all 4
  classes, and its signature effect fires; old saves load.

## BATCH 2 — Combat-reactive music (extend beyond bosses)
`musicForScene()` is the single decider and today only the BOSS state changes the track —
regular combat and exploration share one loop. Make it **combat-aware**:
- Add intensity STATES: **explore (calm) ↔ combat (tense) ↔ boss (existing)**. Enter
  "combat" when enemies are actively aggroed OR an elite is present; fall back to "explore"
  after a few seconds clear. Crossfade between tracks (reuse the existing fade path; keep the
  "never restart the same loop" guard).
- Tag existing tracks by intensity (calm vs tense) so the right one plays per zone/state —
  no new audio files required; reuse the 17 tracks. Keep `musicSting` for one-shots.
- Verify: walking a cleared area plays a calm loop; aggroing a pack swells to a tense loop;
  an elite triggers combat music; boss music still takes over; clearing settles back to calm;
  no track restarts on minor state flips (debounce).

## BATCH 3 — Bestiary / Codex  (rides on the master update's new mobs)
No codex exists. Add one (a hub menu, like `openMirror`/`openClasses`):
- Track kills per enemy type in `meta.codex` (`{type: count}`); unlock an entry on first kill.
- Entry shows: a **silhouette** (reuse the in-world enemy voxel render to an offscreen
  canvas), the **name**, its **behavior tell** (one line — e.g. "Blink-Stalker: teleports
  behind you before it strikes"), and its **elemental weakness** (from `WEAK` + the enemy's
  affinity), teaching the weakness chart. Locked entries show "???" with a kill-count hint.
- **Enumerate ALL enemy types, including the 10 new zone mobs** landing in the master update
  (shell-cracker, freezing lobber, magma-trail, eruption totem, blink-stalker, void tether,
  sun-priest, animated statue, siege knight, royal arcanist) — plus bosses.
- Verify: killing a new type unlocks its entry with correct name/tell/weakness; silhouette
  renders; count increments and persists; locked entries hide details.

## BATCH 4 — Abyssal Descent: personal-best tracker + shareable run-card
`meta.endlessBest` tracks deepest floor only. Expand to a real **personal-best block** and a
**shareable death card**:
- **Persistent stats in `meta`:** best floor (exists), **best time survived**, **most
  enemies killed in a run**, **total descents**, **total enemies killed** (lifetime). Show
  the personal-best block on the Descent hub entry stone and/or a small panel.
- **Shareable run-card:** on `endlessDie`, render a styled **canvas** summary card — Floor
  reached, **time spent in the descent**, **enemies killed**, gold earned, and NEW-BEST flags
  — with the BLADEFALL wordmark. Add a **"Save image"** button that downloads the card PNG
  (local canvas → dataURL → download; no backend) so players can post their runs.
- Verify: the card renders with correct floor/time/kills; NEW BEST flags fire when a record
  breaks; Save image downloads a PNG; the personal-best block persists across sessions.

## BATCH 5 — Split Training Dummies from the Sparring Post (they are two different things)
Today the hub "Sparring Post" (`openTrainingArena`) spawns practice foes. Oliver wants these
as TWO distinct stations:
- **Sparring Post (keep, clarify):** spawns REAL, fully-fighting enemies that give **no
  rewards** (no XP/gold/loot) — pure combat practice against live AI, as it does now. Make its
  copy clearly say "real foes, no rewards."
- **NEW — Training Dummies (separate hub object/station):** a few **static damage-sponge
  dummies** with **huge HP** that **do not fight back** and **do not die** (or regen instantly),
  purely so the player can measure damage. **Show floating damage numbers on every hit** and a
  small **DPS / total-damage readout** (per-dummy or a nearby board) so the player can compare
  weapons/builds. Reuse the existing `dummy`/`practice` enemy flags but give these their own
  station, their own non-reactive behavior, and the damage-number display.
- Verify: the two stations are separate and clearly labeled; Sparring foes fight and grant
  nothing; Training Dummies never die/fight, soak hits, and show per-hit damage numbers + a
  DPS/total readout; neither affects real-run state.

## FINAL REPORT
Per batch: what shipped, values chosen (unique roster + Ian's Blade floor + music state
thresholds + dummy HP), in-browser verification, anything deferred. Log as one roadmap phase.
