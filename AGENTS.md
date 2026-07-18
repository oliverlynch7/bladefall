# BLADEFALL — Agent Guide (READ THIS FIRST, every session)

Any AI agent (Codex, Claude, or otherwise) working on BLADEFALL reads this before touching
anything. It exists so different agents produce ONE coherent game. Oliver is the sole owner
and the only source of new direction.

## 0) PRIME DIRECTIVE — the single-file lock
The entire game is ONE file: `public/3d/index.html`. Two agents editing it at once WILL
clobber each other (it's a git submodule with a live remote).
- **Only ONE agent edits the game file at a time. Never simultaneously.**
- `git pull` (inside the submodule) BEFORE you start; keep your editing window short;
  `git push` from INSIDE the submodule IMMEDIATELY after; then you're done.
- If another agent might be active, leave a one-line lock note in the vault's `_shared/`
  ("Codex editing BLADEFALL — <task> — <time>") and clear it when done.

## 1) HOW TO TAKE WORK (this is what keeps the vision intact)
- **Execute the written work orders in `docs/`. Do NOT improvise new features.** The work
  orders encode Oliver's locked decisions; freelancing is how the game drifts off-vision.
- Each order is two-stage: **inspect the real code first, write a grounded plan, THEN
  implement.** Respect every "LOCKED" decision; derive everything else from the actual code.
- If a consequential decision truly isn't answered by the code or the order, **STOP that
  piece and leave a note for Oliver** with options + a recommendation — do not guess and
  ship a direction. Continue the parts that aren't blocked.

## 2) PRODUCTION CHECKLIST — every ship, no exceptions
1. **Mute during testing** — auto-mute is live (localhost / `?mute=1`); Oliver may be playing
   the live game while you test.
2. **Never break saves.** Migrate via the existing `normWeapon` / `LEGACY_ART` / `meta.*`
   patterns. Legacy identifiers survive as aliases only, never as active player-facing content.
3. **Verify in a REAL browser** before claiming done (`python -m http.server` in `public/`,
   open `/3d/`). The node stub can't compile GLSL; WebGL can't be screenshotted headlessly, so
   drive via `window.__BF3` + read state. Load a PRE-change save and confirm it still loads.
4. **Bump `VERSION3D`** on every ship (drives the in-app updater).
5. **Push** from inside the submodule (Cloudflare auto-deploys `bladefall.pages.dev` in ~10s).
6. **Log it** in `UPDATE_ROADMAP.md` (a short shipped-note under the relevant phase).

## 3) CURRENT DIRECTION (as of 2026-07-18 — Oliver's standing calls)
- **Voxel aesthetic stays. Do NOT swap the weapon/art style.** New GPT icon art exists but the
  in-game 3D geometry is NOT being rebuilt yet — visuals get polished later.
- **Bones before polish.** Build systems/mechanics/content first (skills, bestiary, bosses,
  Descent, risk/reward). Menu-icon art and the 3D weapon rebuild are deferred.
- **Do NOT touch trial difficulty** — Oliver finds the tutorial trials fine/easy on purpose.
- **New Game+ is being removed** (see MASTER_UPDATE) — keep the `ngHp/ngDmg` scalars (the
  Descent uses them), remove only the player-facing NG+ feature.
- **Ian's Blade**: a teaser only — list it in the shop as an UNOBTAINABLE relic
  ("requirements unknown"); Oliver will supply the real unlock later. Do not invent one.

## 4) READY BACKLOG (run one at a time, roughly this order)
Systems/content first (the bones):
- `docs/MASTER_UPDATE_2026-07-18.md` — NG+ removal, zone bestiaries, boss mechanics, harder
  Descent + shrines, treasure-sprint overhaul, banner-bug + small fixes.
- `docs/RISK_REWARD_PROMPT.md` — mimic chests + shop gamble (if not already shipped; check
  the roadmap first).
- `docs/DEPTH_RETENTION_2026-07-18.md` — unique legendaries + Ian's Blade teaser,
  combat-reactive music, bestiary/codex, Descent run-card + personal-best tracker, training-
  dummy split.
- (pending) the SKILL-CHOICE system — 2 options per skill 2/3/4 + a rank-2 identity pick.
Tooling / non-game (safe to run in parallel, never touches the game file):
- `docs/CODEX_PLAYTEST_HARNESS_PROMPT.md` — automated playtest/balance harness (READ-ONLY on
  the game file; writes its own `harness/` files).
Deferred (needs Oliver): weapon 3D rebuild, `docs/ICON_ART_GPT_PROMPT.md` menu icons.

## 5) FACTS YOU'LL NEED
- Live: `bladefall.pages.dev` (root→/3d/). Debug hook: `window.__BF3`. Version const: `VERSION3D`.
- The game does NOT auto-run in a headless tab (no rAF) — pump `__BF3.update(0.016)` to
  advance sim. Reliable damage test: set player position adjacent to a target, `p.atkCd=0`,
  call `playerAttack()`, pump ~20 steps, read hp delta. Overlays (loot/level-up/subclass) pause
  combat — dismiss them or the bot stalls. Filter enemies `!dead && hp>0 && !dummy && !practice`.
- `docs/` holds all work orders + design docs. `UPDATE_ROADMAP.md` is the shipped-history.
