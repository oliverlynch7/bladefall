# BLADEFALL — Quest Tracker HUD + Evidence-Grounded Balance Pass

## [Codex | 2026-07-18]

> Ready-to-run work order for a single BLADEFALL development session. The quest tracker
> redesign is the committed feature. Balance findings are hypotheses that must be validated
> in the real game before changing numbers.

---

You are working directly on BLADEFALL, a lightweight single-file WebGL voxel action-roguelite
RPG. The game is `public/3d/index.html`; debug surface: `window.__BF3`. At the time this work
order was written, the inspected source was version **1.83.0**.

Complete this in two stages:

1. Inspect the current code and produce a grounded implementation plan.
2. Implement the quest-tracker redesign, validate the balance hypotheses, make only changes
   supported by repeatable evidence, and verify everything in a real browser.

Do not blindly copy values from this prompt. The game is changing quickly; re-read the live
source and test the current build first.

## Operating context

- The whole game is the single file `public/3d/index.html`.
- Preserve old saves and the existing debug hook.
- Test with `?mute=1` in real Chromium at desktop, phone portrait, and phone landscape sizes.
- Use `_automation/bladefall/harness/` for automated measurements. Fix the harness when its
  assumptions are wrong; never tune the game around an obviously weak or incorrect bot.
- On ship: bump `VERSION3D`, run syntax/browser smoke tests, run the harness before and after,
  push from the Bladefall repository, confirm the live version, and append a shipped note to
  `_automation/bladefall/UPDATE_ROADMAP.md` under the required dated author header.

============================================================
## Part 1 — Make the quest tracker larger and unmistakable
============================================================

### Product intent — locked

The active quest/objective must be one of the most obvious HUD elements. A player should be
able to glance at the screen during combat and immediately answer:

- Where am I?
- What must I do next?
- What is my current progress?
- Did an objective just complete?

The current tracker is too small: `#questbox` is capped around 260px, uses 11px body text and
a 10px heading, and relies on subtle contrast. Enlarge and strengthen it without covering the
player, the health panel, Pause, or mobile action controls.

### Inspect before editing

- `#questbox`, `.qhead`, `.qrow`, `.qdone`, `.qtick`, and all responsive CSS.
- `questUpdate()`, including normal areas, boss areas, trials, side areas, and Descent.
- `questBump()`, `questKill()`, `openWay()`, zone cards, story/briefing overlays, and toasts.
- HUD geometry at 1440×900, 1280×720, 844×390, and 390×844.
- Safe-area handling and the positions of `#hud`, Pause, `#bAuto`, TALK, SLASH, DODGE, skill
  buttons, interaction prompts, boss HP, and temporary story text.

### Desired presentation

- Desktop target: roughly **14–16px objective text**, **12–14px uppercase heading**, stronger
  background opacity, brighter border/accent, more padding, and a useful width around
  **320–380px** when space permits.
- Make progress numbers visually dominant: `8/12`, `3/5`, floor number, and boss objective
  should be bold, bright, and quickly scannable.
- Give the tracker a clear visual hierarchy:
  1. zone/mode heading;
  2. primary objective;
  3. numeric progress;
  4. completed objectives de-emphasized but still readable.
- Add a brief, tasteful pulse/highlight when progress changes and a stronger completion state.
  Reuse existing colors and motion language; do not create distracting permanent animation.
- Do not truncate the critical action or progress number. Wrapping to two lines is preferable
  to ellipsis when necessary.
- Preserve the established dark/amber visual system.

### Responsive requirements — locked

- Desktop: tracker and player HUD must never overlap.
- Phone landscape: keep the tracker prominent in the top-right without colliding with Pause,
  AUTO/SELL/BAG, or skill controls.
- Phone portrait: the current playtest showed the player HUD and quest tracker colliding.
  Create an explicit portrait layout—such as placing the tracker immediately below the player
  HUD, using nearly the available width, or using a compact two-row card. It must remain larger
  and clearer than today while avoiding overlap.
- Briefing overlay: the zone banner currently overlaps “THE WARDEN'S SHADE” on portrait.
  Suppress/reposition the banner while a briefing is visible, or reserve vertical space.
- TALK and SLASH also collided in portrait during the same visual pass. If the responsive HUD
  rules are touched, resolve this adjacent collision without redesigning unrelated controls.
- Respect `env(safe-area-inset-*)`.

### Quest-tracker acceptance tests

- Normal kill, fetch, find, boss, trial, side-zone, and Descent objectives all render correctly.
- Progress updates immediately and the progress-change treatment fires once, not every frame.
- Completion remains legible and the portal-opening state is obvious.
- No text is clipped or ellipsized in a way that hides the required action/count.
- No overlap at 1440×900, 1280×720, 844×390, or 390×844.
- Briefing, story, loot, pause, death, and level/subclass overlays still layer correctly.

============================================================
## Part 2 — Validate and act on balance opportunities
============================================================

### Evidence already observed

Automated v1.82.0 samples found the following directional signals:

- Sustained base maximum weapon DPS (including projectile count) ranged about **1.70×**:
  Knives/Arcane Wand ≈50, Frost Wand ≈45, Crossbow ≈39.6, Greatsword ≈29.4, Longbow ≈30.
- The Ranger sample dealt materially less damage and lost more HP than Warrior, Mage, and
  Reaper. The source deliberately applies `0.92×` to Ranger ranged attacks and `0.85×` to
  Ranger melee via `classStyleMul()`.
- Reaper produced the highest sampled damage with almost no net HP loss. Its kit has multiple
  sustain sources: scythe/reaper weapon behavior, Reap/Soul Harvest, Harvester lifesteal, and
  possible gear/rarity lifesteal.
- A fresh starter-sword Descent bot failed Floor 1 quickly; rare-greatsword trials reached
  Floor 2. This is not decisive because the bot still lacks predictive dodging and robust
  charged-attack timing.
- Boss time-to-kill showed possible step changes around Keep→Frost and Palace→Castle, but the
  final-boss spike may be intentional.

Since then, Descent has changed: current source includes boon/bane modifiers and a Floor-1
target around 13 enemies. Re-run everything against the version you are actually editing.

### Balance principle — locked

Protect weapon and class identity. Do not flatten everything to identical dummy DPS. Compare
the complete value package:

- tap DPS and charged burst;
- melee risk versus ranged safety;
- projectile count, spread, pierce, seeking, range, and practical hit rate;
- cleave/AoE and crowd control;
- status buildup and elemental matchups;
- survivability, healing, dodge access, and skill cooldowns;
- real zone clear time and Descent depth—not only dummy damage.

### Investigation A — Ranger versus Reaper

Run repeatable same-rarity, comparable-rank trials through representative early, middle, and
late zones plus Descent. Record clear time, damage taken, deaths, DPS uptime, hit rate, and
healing. Use competent behavior: Longbow powershots, Crossbow optimal distance, Knives double
projectiles, Javelin throws, Reaper combo finishers, scythe throw, Reap, and Soul Harvest.

If Ranger remains clearly behind:

- First test removing or reducing the Ranger ranged penalty (`0.92 → 1.0` or a smaller
  penalty) rather than buffing every Ranger weapon.
- Alternatively compensate with a class-defining advantage that is measurable in real play:
  faster charge, better projectile velocity, improved dodge/mobility, or stronger mark uptime.
- Do not buff Ranger merely because a face-tanking bot performed poorly with a bow.

If Reaper remains simultaneously top-tier damage and safest:

- Identify which sustain source causes the excess before changing anything.
- Prefer reducing stacked sustain or adding an internal limit over weakening the core scythe
  fantasy.
- Preserve Reaper's identity as aggressive close-range sustain; it should feel powerful when
  continuously landing attacks, not passively unkillable.

### Investigation B — Weapon role clarity

Build separate tables for tap DPS, full-charge burst, realistic charged DPS, multi-target
value, status per second, and practical accuracy. Verify projectile `count`, spread, pierce,
and seeking in the calculations—an earlier harness pass incorrectly treated Crossbow and
Knives as single-projectile weapons.

Then review these hypotheses:

- Rapid weapons may deliver too much safe sustained value relative to slow/charged weapons.
- Greatsword and Longbow may need a stronger payoff for charge commitment, not necessarily a
  higher tap attack.
- The inventory comparison currently shows damage and attack speed separately; add a compact
  role/readout such as tap DPS, charge behavior, projectile count, pierce, or range so players
  understand why a lower-damage weapon can be stronger.

Only alter weapon values if real combat results remain outside the intended role. Keep all
tuning centralized in `ARCHES` or existing class constants.

### Investigation C — Descent Floor 1 and scaling

The design mandate is: a fresh starter-weapon player should **barely clear Floor 1**, then the
mode should scale hard and fast.

- Test with a competent but non-perfect bot/human profile using movement, predictive dodging,
  target prioritization, and the starter weapon's actual attack behavior.
- Run at least 20 seeded trials if RNG control exists; otherwise use a larger unseeded sample
  and report distributions.
- Log time alive, kills, damage taken, enemy concurrency, elite count, and cause of death.
- If most competent fresh runs die before meaningful progress, adjust Floor 1 separately
  (initial spawn cadence, concurrency, target count, or enemy damage) rather than flattening
  the entire exponential curve.
- If Floor 1 is fair, leave it alone and improve the harness.

### Investigation D — Zone and boss curve

Measure representative same-build boss TTK across all eight zones. Review, but do not
automatically remove, the apparent Keep→Frost and Palace→Castle jumps.

- Frost should feel like a meaningful midgame escalation, not an unexplained wall.
- Castle/final boss may be a deliberate endurance test, but extra time must come from new
  decisions and mechanics—not only a larger HP pool.
- Prefer behavioral difficulty, telegraphs, adds, arena pressure, or phase changes over raw
  sponge HP.

### Balance acceptance tests

- No class is simultaneously the safest and fastest across most tested content without a
  meaningful execution/risk requirement.
- Ranger's full kit is competitive when played correctly.
- Slow/charged weapons have a clear payoff for their commitment.
- Fresh Descent performance matches the “barely clears Floor 1” mandate under competent play.
- Zone/boss difficulty rises intentionally, with no accidental wall caused only by HP.
- All quests remain satisfiable and all bosses remain killable.
- Before/after harness JSON and human-readable tables are included in the final report.

## Verification and final report

Before shipping:

1. Run a JavaScript syntax check and load the game in real Chromium.
2. Capture before/after quest-tracker screenshots at all four target viewports.
3. Exercise every quest display mode and overlay interaction.
4. Run the automated quick suite, then the full suite.
5. Confirm no save regression and no console/page errors.
6. Bump `VERSION3D`, push, confirm the live version, and update the roadmap.

Final report must distinguish:

- confirmed bugs fixed;
- balance changes supported by evidence;
- hypotheses rejected after testing;
- exact constants changed, with before/after values;
- quest-tracker screenshots and responsive results;
- remaining tuning knobs or requested debug hooks.

Do not claim balance success from a single random run or from theoretical DPS alone.
