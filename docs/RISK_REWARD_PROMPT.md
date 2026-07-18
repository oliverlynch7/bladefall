# BLADEFALL — Risk/Reward additions: Mimic Chests + Shop Gamble (dev work order)

> Ready-to-run prompt for a single BLADEFALL dev session. Two features, both "risk/reward
> loot," bundled because each is small. Two-stage inspect-then-implement. LOCKED decisions
> are final; everything else is derived from the actual code.

---

You are working directly on BLADEFALL, a lightweight single-file WebGL voxel action-roguelite
RPG. The whole game is the single file `public/3d/index.html` (live at `/3d/`). Debug: `window.__BF3`.

Add two risk/reward systems: (1) **Mimic Chests** and (2) a **Shop Gamble**. Do this as two
stages: (1) inspect the actual game and write a grounded self-prompt; (2) implement from it.
Do not begin editing until you've inspected the real code — do not assume the chest system,
enemy spawn/render pipeline, shop UI, loot-rarity rolls, or save schema; read them.

## === BLADEFALL OPERATING CONTEXT ===
- The game is the SINGLE file `public/3d/index.html`. All code lives there.
- **MUTE FIRST** is already shipped (localhost/`?mute=1` auto-mute). Confirm it's active in
  your test tab; if somehow not, set `meta.soundOn`/`meta.musicOn` false while testing.
- **DO NOT BREAK SAVES.** Any new state on `meta.*` behind the existing load/migrate path.
- **VERIFY IN A REAL BROWSER** before claiming done (`python -m http.server` in `public/`,
  open `/3d/`). The node stub can't compile GLSL and stub canvases mask DOM/UI bugs.
- **ON SHIP:** bump `VERSION3D`, `git push` from INSIDE the submodule (Cloudflare
  auto-deploys), confirm the new `VERSION3D` serves live, then log it in
  `_automation/bladefall/UPDATE_ROADMAP.md` as a new phase with a shipped-note.
- **ADD NO NEW ART FILES.** Build visuals from the existing `bx()` voxel pipeline.
- **SCOPE GUARD:** these two features ONLY. Do NOT touch the weapon/element overhaul, pets,
  endless mode, or zone rebuilds here.

============================================================
## FEATURE 1 — MIMIC CHESTS
============================================================

### PRECONDITION (do this first): restyle the "charged" enemies
Oliver's note: **the current "charged" enemies read too much like a chest**, which will
collide with mimics (a mimic IS a chest that turns into a monster — the disguise only works
if nothing else looks chest-like). FIRST inspect what the "charged"/charge-up enemies
currently look like (`drawEnemy`/enemy render + the charge telegraph), and **give them a
clearly non-chest silhouette + telegraph** (e.g. a glowing wind-up aura/pulsing body, not a
boxy chest shape). Ship this as its own small step, verified in-browser, before mimics.

### LOCKED mimic design
- **Chests spawn as normal; a RANDOM subset are secretly mimics.** Placement stays random —
  do not hand-place. Inspect the current chest spawn to pick a sensible mimic rate; default
  **~1 in 6 (≈15–18%)**, tunable via one constant.
- **A mimic is a real threat.** On open/approach it snaps into an enemy with **significantly
  higher HP and higher damage than the zone's normal mobs** — a Dark-Souls mimic that can
  kill an unready player. Scale its HP/damage with the zone tier / NG scaling like other
  enemies (inspect `TIERBAND`/`ngHp`/`ngDmg`).
- **Fair-ish tell.** A mimic should be *visually indistinguishable at a glance* from a real
  chest but have a subtle tell on close inspection (a faint shudder, off-color seam, or a
  breathing motion) — surprise first, but not pure gotcha.
- **Payoff for the risk:** defeating a mimic drops a **better-than-normal-chest reward**
  (higher rarity bias via the existing `rollDrop`/loot-rarity system, + extra gold). The
  risk must pay.
- Mimics obey existing combat, hitstop, and death-drop systems — reuse, don't duplicate.

### Inspect (mimics)
Current chest entity + open flow; chest spawn/placement; enemy spawn (`spawnEnemy`/`saltMob`);
enemy render + the charged-enemy telegraph; `rollDrop`/rarity roll + rarity level-gating;
TIERBAND/ngHp/ngDmg scaling; death/loot drop; save fields for opened chests (so a mimic
already resolved isn't re-rolled on reload).

============================================================
## FEATURE 2 — SHOP GAMBLE
============================================================

### LOCKED gamble design
- Add a **"Gamble" option in the shop** (its own slot/button, fits the existing shop UI).
- **Costs significantly MORE** than an equivalent-tier normal shop purchase — a real gold
  sink, not a shortcut. Inspect current shop pricing to set the cost.
- Yields a **RANDOM item** with odds **heavily weighted toward junk / low rarity**; only a
  **small chance** of good/high-rarity gear. Poor odds by design — the gamble should usually
  disappoint. Pick concrete weights (e.g. mostly common/uncommon, a thin tail into rare+),
  justified against the current rarity distribution.
- The rolled item **respects existing rarity level-gating** (don't hand a locked epic to an
  under-level player — either exclude above-level rarities or drop it into the bag locked,
  matching current loot behavior).
- Reuse the existing forge/loot "reveal" juice if present (the slot-machine `forgeSpin` is a
  natural fit) so the gamble feels like a pull. Deduct gold up front; deliver the item to the
  bag (respecting bag-full handling).

### Inspect (gamble)
Shop UI + buy flow + pricing; loot generation + rarity weights; rarity level-gate
(`canWield`/`heroLevel`); `forgeSpin`/reveal animation; bag add + bag-full prompt; gold
handling.

============================================================
## STAGE 1 — write a grounded self-prompt covering
============================================================
- How chests, chest-open, enemy spawn/render, the charged-enemy telegraph, the shop, loot
  rolls, rarity gating, and saves currently work.
- The charged-enemy restyle (before/after silhouette + telegraph).
- Mimic: spawn hook + rate constant; the disguise render + subtle tell; the snap-to-enemy
  reveal; HP/damage values (justified vs current mobs at each tier); the reward roll; save
  handling so resolved mimics don't respawn/re-roll.
- Gamble: the shop entry + cost (justified vs current prices); the rarity weight table
  (justified vs current distribution); the reveal; bag delivery + level-gate handling.
- Testing plan + rollback-safe order (restyle charged enemies → mimics → gamble).

## STAGE 2 — implement, then VERIFY in-browser
- Charged enemies no longer read as chests (before/after check).
- Open several chests: most are real, ~1-in-6 turns mimic; the mimic is a genuine threat
  (can kill an unready player) and drops a better-than-normal reward on death.
- A mimic already resolved does not re-trigger after reload (save check); old saves load.
- Shop Gamble: costs clearly more than a normal buy, usually returns junk, rarely returns
  something good; gold deducts up front; item lands in the bag; level-gating respected.
- Reload the page: no save breakage.
- Bump `VERSION3D`, push, confirm live; log in the roadmap.

## HANDLING UNCERTAINTY
Do not ask questions the code can answer. If one consequential value truly can't be resolved
from the game (e.g. the exact mimic rate or gamble odds "feel"), implement with your best
grounded default, and report it with the alternatives so Oliver can dial it.

## FINAL REPORT
Report: the grounded self-prompt; how charged enemies were restyled; the mimic spawn rate +
HP/damage values chosen and why; the mimic tell + reveal; the mimic reward; the gamble cost +
rarity weight table chosen and why; save fields added; tests performed + results; any
unresolved tuning knobs left for Oliver.
