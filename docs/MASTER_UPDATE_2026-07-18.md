# BLADEFALL — Master update work order (2026-07-18, from the full-game playtest of v1.74.0)

> ONE session's work, in shippable batches. Work IN ORDER; each batch ships on its own —
> bump VERSION3D, verify in a real browser, push, continue. Stopping after any completed
> batch is fine. Log the whole set as one roadmap phase with per-batch version bumps.

## === OPERATING CONTEXT ===
- Single file `public/3d/index.html` (live at `/3d/`). Debug hook `window.__BF3`.
- Auto-mute ships already (localhost/`?mute=1`) — test builds are silent.
- DO NOT BREAK SAVES. Migrations via the existing normWeapon/LEGACY_ART/meta patterns.
- Verify in a REAL browser (`python -m http.server` in `public/`, open `/3d/`).
- Each ship: bump `VERSION3D`, `git push` from INSIDE the submodule, confirm live.
- NOTE: the tutorial trials are deliberately NOT touched in this order — Oliver judges
  their difficulty fine (easy, even). Do not "fix" trial difficulty.

---

## BATCH 0 — Two 60-second sanity checks (verify; fix only if broken)
1. **Mimic takes damage:** reveal a mimic and hit it with a basic sword swing in a real
   browser run. It must take damage like any enemy.
2. **Pet follows into runs:** with a pet active, walk through a hub Gate AND enter the
   Abyssal Descent. The pet must spawn and follow automatically in both (the playtest
   needed a manual `spawnPet()` after `petEquip` — make sure the normal flow spawns it).

## BATCH 1 — Remove New Game+ (it no longer fits the game)
No NG+ loop exists in the modern zone flow (`startRun(ngPlus)` just calls `enterZone(0)`;
nothing increments `meta.ngPlus`) — but mentions and dead plumbing remain. Remove the
feature and its mentions, surgically:
- **KEEP** `G.ngHp`/`G.ngDmg` — they are the generic enemy-scaling scalars and the
  Abyssal Descent sets them per floor. (Optional safe rename to scaleHp/scaleDmg only if
  fully migrated; not required.)
- **REMOVE player-facing NG+ everywhere:** the HUD weapon-line suffix
  `'  ·  NG+'+G.ngPlus` (~line 5569); every "NG+"/"New Game+" string in UI/comments/story;
  `beginRun`'s ngPlus plumbing + the `meta.ngPlus=Math.max(...)` write; the `ngPlus*2.5`
  luck term (~line 838); `computeNgScales` if nothing meaningful still calls it.
- **SAVE SAFETY:** old saves with `meta.ngPlus>0` must load clean with no NG+ UI
  resurrected; stop writing the field (keeping the key in MODE_FIELDS for compat is fine).
- **CELESTIAL SKIN re-gate:** the 'ascended' achievement ("Reach New Game+3",
  `m.ngPlus>=3`) is unobtainable. Re-gate: **"Reach Floor 15 of the Abyssal Descent"**
  (`check: m=>(m.endlessBest||0)>=15`). Keep id 'ascended' (save compat); update
  name/desc to fit ("the deeper you fall, the higher you rise"). Tune the floor number
  against the NEW Batch 3 difficulty so it's a real endgame badge. Existing unlocks persist.
- Verify: no NG+ string player-visible; celestial fires at the new gate (set
  meta.endlessBest in console); old save loads; Descent scaling unchanged by this batch.

## BATCH 2 — Unique bestiary for zones 4-8 (the big one — finishes the world)
Phase 17 gave every zone a great layout, but Frostfell/Emberdeep fight with theme recolors
and Sunspire Palace is literally bones×7 + caster. Apply the proven Phase-14 template
(thornboar/sporeback/dustjackal: distinct silhouette + ONE readable behavior + a role) —
**2 unique mobs per zone, Oliver-approved roster:**
- **Frostfell:** an ICE-ARMORED SHELL-CRACKER (frontal shell blocks hits until cracked —
  chill/shatter synergy) + a FREEZING LOBBER (arcing shots that apply Chill).
- **Emberdeep:** a MAGMA-TRAIL LEAVER (skitterer whose path burns briefly) + an ERUPTION
  TOTEM (stationary vent, periodic fire burst — kill it first).
- **The Abyss:** a BLINK-STALKER (telegraphed teleport behind you) + a VOID TETHER
  (links to allies, buffing them until it dies).
- **Sunspire Palace:** a CORRUPTED SUN-PRIEST (radiance-flavored healer-caster) + an
  ANIMATED STATUE (slow heavy marble shielder with its own silhouette).
- **Castle Duskmoor:** a SIEGE KNIGHT (shield + telegraphed overhead crush) + a ROYAL
  ARCANIST (rune-mark caster, arcane volleys).
Rules: core mobs only as sparing filler; wire each zone's kill-quest to a signature mob
where sensible; silhouettes distinct at distance; respect deco/perf budget; verify every
zone's quests still complete (zonescape/complete harnesses) + clean render frames.
Ship zone-by-zone if budget is tight — **Palace first** (worst offender).

## BATCH 3 — Abyssal Descent: WAY harder (Oliver's direct call) + spice
**Difficulty mandate:** a FRESH player (rusty sword, base stats, good skills) should
BARELY clear Floor 1. Scaling should ramp much harder and much faster than today across
EVERY axis. Current values (all in `loadEndlessArena`/`endlessTick`): hp ×1.11^n,
dmg ×1.06^n, target 6+2n, cap 8+0.8n (max 24), batch 1+n/6 (max 3), interval 1.4-0.05n
(min 0.35s), elites via the base ~22% role roll only.
Rework (suggested starting values — tune by feel, but err HARD):
- **Floor 1 is a real fight:** more simultaneous pressure from the start (e.g. target ~10,
  batch 2, interval ~0.8s, spawns biased near the player) so it hooks — and threatens —
  immediately.
- **Steeper curves:** hp ×~1.16^n, dmg ×~1.10^n; ADD attack-speed scaling (enemy attack
  cadence/windups quicken with depth, capped so telegraphs stay readable) and movement
  speed creep. Spawn interval shrinks faster; batch grows faster; concurrent cap grows
  faster (keep the phone hard-cap at 24).
- **More elites:** elite chance scales with floor (e.g. +3%/floor on top of the base
  role roll, capped ~60%); elites deeper get role stacking (elite + shielder etc.).
- **Elite floors:** every 7th floor is ALL-ELITE (fewer, stronger spawns).
- **Mimic floors:** occasional reward floors spawn chests — with the standard mimic rate
  applying (the bonus-vault exemption stays).
- **Boon/bane SHRINES:** every 5th floor starts with a shrine offering a choice of 2
  run-modifiers, each a boon WITH a bane ("+35% damage, healing halved" / "double gold,
  enemies +25% damage" / "+20% attack speed, -20% max HP"...). Modifiers last the REST of
  the descent, stack across shrines, show as small icons on the endless HUD panel, reset
  on death/exit. Data-driven list so more can be added later.
- **Re-tune the 'ascended' floor gate (Batch 1)** against this new difficulty.
- Verify in-browser: floor-1 pressure is real; curves apply (probe enemy hp/dmg/attack
  cadence at floors 1/5/10); shrine choice applies + persists + resets on death; elite
  floor is all-elite; caps hold; banking + best-depth still work.

## BATCH 4 — Boss signature mechanics (the arenas deserve tenants)
Five custom arenas shipped in Phase 17; the bosses inside behave as before. Give each
boss ONE signature mechanic keyed to its set-piece (build on the existing phase-2 system):
- **Colossus / Crucible:** periodic QUAKE RINGS crossing the arena floor (jump them).
- **Sorcerer / Cracked Ring:** teleports between the ring's pillars between volleys.
- **Abyss King / Throne Ring:** summons 2-3 shades at phase 2 (capped, no flooding).
- **Marble Colossus / Rotunda:** a sweeping LIGHT BEAM traversing the rotunda (use the
  pillars as cover).
- **Void Tyrant / Summit:** the existing void-orb barrage PLUS telegraphed, temporary
  collapsing floor tiles late in phase 2.
Readable, telegraphed, phone-performant (reuse ring/telegraph VFX). Also give the three
early bosses (Brute/Marksman/Warden) a lighter version if budget allows. Verify each
fight completable + mechanic fires, in-browser.

## BATCH 5 — Treasure Sprint overhaul: vertical parkour + true randomization + dash-jumps
The current sprint (`loadBonus`) is 9 FLAT hops seeded off `stageIndex` only — the same
stage always generates the same course. Rebuild:
1. **True randomization:** seed off the run (fold in `G.runSeed`/a per-visit counter) so
   every sprint differs; deterministic within one attempt.
2. **VERTICAL parkour:** ascending tiers + climb chains (respect JMPV=94/step), at least
   one TOWER/SPIRAL segment and one DROP-DOWN; VERTICAL movers (bob on y — current ones
   only slide on x), crumbling stair steps, springs/pads where they fit. Mix ≈ 1/3 flat
   hops, 1/3 climbing, 1/3 dynamic, shuffled by seed.
3. **LONGER JUMPS — dash-gap band (physics-derived):** single-jump reach JMPH=150; the
   dodge-dash adds 560u/s×0.20s ≈ +112u. Standard gaps ≤~140. **SPRINT GAPS ~165-210** —
   require jump + mid-air dash; cap 210 so base stats + single jump + dash ALWAYS clears
   with margin. NEVER require Magic Socks, speed gear, or class skills. INSPECT FIRST:
   confirm the dash works MID-AIR (`p.dodgeTimer>0 → vx/vz=dash*560` — check it isn't
   gated on onGround); if ground-only, enable air-dash during the sprint OR keep gaps
   ≤140 and get difficulty from verticality instead. Space dash-gaps ≥~1s apart so the
   0.75s dodge cooldown is back.
4. **Difficulty + timer:** smaller platforms on later hops, more dynamic tiles per course,
   and a timer COMPUTED from generated course length (the flat 18s won't fit a longer
   vertical course; keep it tight — it's a sprint).
5. **Solvable by construction + verify:** every hop within the JMPV/JMPH(+dash) band;
   in-browser run start-to-chest on base stats + single jump; chest stops the clock;
   return portal works; falling resets to lastSafe without softlocking the timer; 3 seeds
   produce visibly different courses.

## BATCH 6 — Small fixes (sweep, low risk)
- **Abyssal Descent shows "ZONE 12/8" (confirmed live):** the stage banner (~line 6631)
  appends `'ZONE '+((G.zone||0)+1)+'/'+ZONES.length`, and `startEndless()` sets `zone:11`
  → "ZONE 12/8". The banner already suppresses the suffix for `G.hub||G.trial||G.side` —
  add `G.endless`, and show `'  ·  FLOOR '+G.floor` instead. Sweep for other places the
  fake zone id leaks into Endless UI (zone cards, quest tracker, death screen).
- **Corpse culling:** dead enemies linger in `G.enemies` with `dead=true` (one sat at
  positive hp). Confirm corpses are removed/pooled after the death animation and cannot
  accumulate over a long Descent (phones). Fix if they accumulate.
- **Death-screen button label:** always says "Return to Hub" but a class-less death
  (correctly) routes to class select — make the label contextual.

## FINAL REPORT
Per batch: what shipped, exact values chosen (and why), in-browser verification performed,
and anything deliberately deferred. Log as one roadmap phase with per-batch versions.
