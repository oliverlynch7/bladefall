# BLADEFALL Autopilot — operating spec + backlog

You are the BLADEFALL autopilot. Each run is fresh (no memory of prior chats). Follow this file exactly.

## Mission
Keep improving BLADEFALL by working through the backlog below — **on the review branch only**. Oliver playtests the branch preview and merges to main (which deploys live) himself. You never touch the live game.

## Environment
- **Read `docs/VISION.md` first.** It defines what Bladefall is (a social action-RPG - multiplayer is the point), the class-identity goal, and the money constraint. It outranks guesswork.
- Game file: `_automation/bladefall/public/3d/index.html` (raw WebGL voxel game). Repo = the `bladefall` git submodule (remote `oliverlynch7/bladefall`).
- **3D layer** (newer, sits over the voxel renderer, enabled with `?hero3d=1&world3d=1&nobloom`):
  - `public/3d/hero3d.js` — the player character (glTF, skinned, class skins, faces, weapons)
  - `public/3d/world3d.js` — the WORLD: reads the game's own `G.deco` and `G.segments` and draws
    them with real models. Converts every zone at once; it is not a per-level rebuild.
  - `public/slice3d/` — the testbed where character/weapon/face tuning lives. Holds Oliver's tuned
    values; treat FACE_PRESETS / WEAPON_PRESETS as precious.
  - Assets in `public/slice3d/assets/` (chars, monsters, nature, village, props, terrain).
- **Levels are generated, not authored.** Each zone emits `{x,z,y0,w,h,d,c,theme}` boxes into
  `G.deco`. Nothing records that a box is a TREE, so the way to get real art in is to tag the
  generator at the source (`kind:'tree'`, `kind:'pillar'`, `stack:true`) and let world3d map it.
- **Harnesses** (local-only, `_shot/` is gitignored):
  - `_shot/shot.js` — screenshot the GAME headless. `_shot/slice.js` — screenshot the slice.
  - `public/stress/` — device capability test. Oliver's phone: 60fps at 64 animated characters.
  - `_balance/`, `_duel/` — class DPS profiles and bot-vs-bot win matrices.
- Work branch: **`bladefall-autopilot`**. Live/deploy branch: `main` (Cloudflare Pages deploys main to `bladefall.pages.dev`; the branch preview is `bladefall-autopilot.bladefall.pages.dev`).
- Debug interface: `window.__BF3` (exposes `G`, `update(dt)`, `input`, `makeWeapon`, `enterZone`, `CLASSES`, `CLASS2`, etc.) — use it via the in-app Browser pane on the local preview server (`.claude/launch.json` name `bladefall`, port 4310) to verify.

## Workflow — every run
1. `cd` to the submodule. `git fetch origin`, `git checkout bladefall-autopilot`, then `git merge origin/main --no-edit` to stay current with supervised/Codex work (if it conflicts, resolve simply or skip the merge and note it).
2. Pick the **top unchecked `- [ ]` item** in the Backlog below.
3. Build it in `index.html`. Keep changes **small and focused**. A whole class is too big for one run — make **one meaningful chunk** of progress (e.g. "Paladin: class def + family + innate", then next run "Paladin: rank 2-4 skills", etc.), leave the item `- [ ]` with a `(progress: …)` note, and only mark it `- [x]` when fully done + verified. A small item (a rename, one weapon) can be finished in a run.
4. **VERIFY (mandatory gate before any commit):**
   - Syntax: `node -e "const fs=require('fs');const s=fs.readFileSync('public/3d/index.html','utf8');const m=s.match(/<script>([\\s\\S]*)<\\/script>/);new Function(m[1]);console.log('OK')"` — must print OK.
   - Smoke test via the preview + `__BF3` (enter a zone, run some `update()` ticks, check no console errors; for a class/weapon, `makeWeapon`/class-state checks).
   - If verification fails and you can't fix it quickly, **revert your change, mark the item blocked with a note, and move on.** Never commit broken code.
5. Bump `const VERSION3D` to `X.Y.Z-autopilot` (keep the `-autopilot` suffix on the branch so previews cache-bust and it's obvious it's branch work).
6. Mark the backlog item `- [x]` (and add a one-line note). Commit **to `bladefall-autopilot`** with a `[autopilot]` message prefix and the Co-Authored-By trailer. `git push`.
7. **Send a Telegram digest** (see below) summarizing what you did this run + the playtest URL.
8. **Never** commit to `main`, never force-push, never delete content, never invent icon art (use placeholder icons — real art is a supervised ChatGPT pass with Oliver).

## Cadence (hourly)
This runs **every hour, 8am–11pm** — not once a day. So each run does **one** backlog chunk and stays lightweight. **Only make noise when you ship something:**
- If you committed a real change this run → send the Telegram digest below.
- If the top backlog item is **blocked** (needs Oliver — e.g. real icon art, a decision in "open decisions"), or the backlog has **nothing actionable**, or you'd only be repeating work → **exit quietly: no commit, no digest, no Telegram.** Silence is correct; do not ping just to say "nothing to do."
- Never send more than one digest per run. Skip past blocked items to the next actionable one rather than idling on them.

## Telegram digest (only when you shipped)
**Format Oliver wants (2026-07): a short changelog in BULLET POINTS, plus the playtest link.** Header line with the version + play URL, then one `•` bullet per change, plain English. Use `\n` for line breaks in the JSON `text`.
```
curl -s -X POST https://thework.pages.dev/state -H "Content-Type: application/json" -d @- <<'JSON'
{"action":"tgPing","password":"oliverNCA2026","text":"🎮 BLADEFALL update (v<ver>) — play: https://bladefall-autopilot.bladefall.pages.dev/3d/\n\n• <change one>\n• <change two>\n• <change three>\n\nMerge to your live game whenever you're happy."}
JSON
```
Always include the playtest URL. Bullets, not prose. Keep each bullet short.

## Naming rule (applies to EVERYTHING new)
Names must be **interesting but understandable by a middle schooler.** No niche/archaic words. Good: "Holy Ground", "Guard Up", "Raise the Dead", "Shadow Step", "Smite". Bad: "Consecrate", "Bulwark", "Bastion", "Excoriate".

## Class design philosophy
Every class is a **variant of one of the 3 cores** (Warrior / Mage / Ranger). Each new class = a CLASS2 tree (rank-1 innate, 1-of-2 choice at ranks 2/4/6/8 = skills and 3/5/7/9 = passives, rank-10 capstone), a `CLASSES` entry (weapon `family`, `attackStyle`), a hidden unlock **trial** (like the Reaper), and combat wiring (`c2Passive(id)` checks + skill FX). Build fully **functional with placeholder icons**; flag the icon list in the digest so Oliver can do the art pass.

---

## Backlog (top = next)

Priorities come from Oliver's vision conversation (2026-07-31): multiplayer is the point, classes
must feel genuinely distinct (League of Legends standard), the hub is a social space (AdventureQuest
Worlds standard), and the graphics need finishing before he shows more people.

- [ ] **Hub buildings.** The Waystation is where players idle and socialise, so it matters most.
      Both kits are MODULAR (walls/doors/roofs, no whole buildings) — `makeBuilding()` in
      public/slice3d/index.html already assembles them; port that into world3d. Tag the hub's
      structural deco at the source the way the rampart dividers were tagged. Floor is already
      Floor_Brick, rampart columns already placed.
      (progress 2026-08-01: assembler PORTED and working. `planBuilding`/`buildBuildings` in
      world3d.js build from the village kit and instance per part-primitive — 4 houses = 116 pieces
      in 31 draw calls. Specs are tagged at the source: `enterWaystation` pushes `kind:'building'`
      deco carrying cells/storeys/style/ry plus a real `G.walls` box, so the houses are SOLID —
      walk-into proven, not assumed. Roofs pick from the kit's full 13-size matrix and close both
      gable ends with Roof_Front_Brick*. `window.__world3dParts()` dumps measured part sizes.
      progress 2026-08-01 (b): the 3D hub was EMPTYING ITSELF and nobody had noticed. flushHero3D
      clears the depth buffer before the Three pass, so the 3D layer paints over every voxel pixel
      it covers — and paving tiles BEHIND a shopkeeper project above them on screen. Result: with
      world3d on, the Waystation had no Quartermaster, no Smith, no anvil, no bag chest, no
      waystone, no torches, no planters — just floating name tags over a bare yard. Proved with an
      A/B shot at the Quartermaster (world3d off = shopkeeper + counter + chest; on = nothing).
      Fixed by holding those draws back: pushInst now has a DEFER buffer, drawCourse raises it
      around the hub's torches / obstacles / deco and render() around drawWaystation, and
      flushDeferred() replays them AFTER Three. Depth values are directly comparable because
      hero3d's camera IS the game's own PROJ/VIEW — so the keepers stand on the 3D paving and are
      still correctly hidden by the 3D houses. Dropped rather than deferred: kind:'building' and
      kind:'pillar' (world3d builds both already) and anything ≤3 units tall (floor paint the
      paving replaced). Torch glow halos are skipped in the deferred pass — additive-only geometry.
      Also: world3d's free-standing monument is GONE, not moved. It sat on the waystone and hid the
      whole portal arc from spawn; every alternative was measured and every one of them is either
      inside the spawn-to-gate sightline fan (which widens toward the rampart until it covers
      everything) or on the walk to a keeper bay — a pair at ±380,140 was tried and the camera ends
      up inside it on the way to the Stylist. Its stated job ("empty lot") only existed because the
      3D layer was erasing the waystone. ART CALL, reversible: four hubPiece() calls in git history.
      The perimeter strip is DONE: four shopfronts at x=±965, z=-78 / z=195, one behind each of the
      Quartermaster / Smith / Drillmaster / Beastkeeper. w:1 d:3 storeys:2, deliberately NOT
      quarter-turned — the kit's ridge runs along DEPTH, so turning the door toward the plaza turns
      the bare gable triangle toward it too (shot and confirmed). Unturned, the plaza gets the long
      tiled slope and a three-bay window frontage. No collision box: probed 8 specs / 4 with
      collision, and the strip is behind the x=±915 wall anyway.
      NEXT for this item: the SE court (Mirror + Sparring Room) and the south annex are still bare
      3D-wise, and the annex has no 3D perimeter at all — buildHub's side walls stop at
      southZ-2*HUB_UNIT, so the activity plazas sit in an unbounded space.)
- [x] **3D on by default.** DONE 2026-08-01. `hero3d`, `world3d` and `mob3d` all default to ON;
      the flags survive as escape hatches (`?hero3d=0`, `?world3d=0`, `?mob3d=0`) so old links and
      A/B checks still work.
      The "BLOCKED until bloom is resolved" note was STALE — bloom stopped being a problem when the
      3D draw moved after `PostFX.end()`. Re-checked properly rather than taken on trust: bloom is
      HIGH-quality only, so a headless run can have the composite quietly switched off and make the
      test look like it passed. `_shot/presets/bloom_check.js` forces `meta.quality='high'` and
      `window.__BF_POSTFX()` reports whether the composite is actually running. With
      `{"bloom":true,"nobloom":false}` confirmed, the hub and Emberdeep both render the full 3D
      layer. `?nobloom` is no longer required anywhere.
      Smoke-tested with NO flags at all: title screen, hub, Outskirts, Frostfell, Emberdeep, the
      Abyss, Castle Duskmoor and the Sparring Room — 0 page errors, mob3d reports every room type
      drawn3d in each.
      NOT self-verifiable, and it is Oliver's call: 60fps on his phone. If it drops,
      `?hero3d=0&world3d=0` is the instant fallback and the default is a one-line revert.
- [ ] **Class distinctiveness pass.** The top design goal. Use `_duel/` to measure, not opinion.
      First finding already on record: ranged beats melee 74%-24%, so melee needs an anti-kite
      answer. Work one class-pair at a time and re-run the matrix after each change.
      NOTE: changing balance numbers needs Oliver's sign-off per docs/VISION.md — prepare the
      change and the measured before/after, then queue it rather than shipping it.
- [x] **Mobs in 3D.** DONE — and it was already done; this run only proved it. `public/3d/mob3d.js`
      carries the 27-entry cast table, pools one animated clone per live enemy off G.enemies, and
      `mobDrawn()` tells the voxel path which ones to skip. Verified in the running game, not by
      reading the module: Outskirts reports 18 live / 18 pooled, 4 models, 0 missing, all 4 room
      types drawn3d=true; Frostfell 13 live / 13 pooled, Yeti + Green_Blob + Glub_Evolved, all 3
      types true. Both screenshotted with real creatures standing in front of the hero.
      (`_shot/presets/mobs_check.js` re-runs this for any zone with `&zone=N`.)
- [ ] **Ground polish.** Real paths where levels have walkways (the Nature Kit has pathStraight/
      Bend/Corner/Cross/Split) and a second grass variant, so a field is not one uniform green.
      (progress 2026-08-01: the GRASS half is done. The field was not "one uniform green", it was
      one uniform AQUA — nature/ground_grass carries no texture at all, only material colour
      #73eddd, and world3d was laying it untinted across 2149 tiles. Grassy floors now take the
      zone's own ground colour pulled 55% toward a lit grass green, in two drifting tones chosen on
      a coarse ~4-tile grid so a meadow breaks into patches instead of dithering. Flag for Oliver:
      the green is an ART CALL I made to fix a clear defect — say if you want it warmer or cooler.
      NEXT: paths. Nothing records that a deco box is a WALKWAY, so this needs the same
      tag-at-the-source treatment the trees and buildings got — mark walkway deco `kind:'path'` in
      the generators, then map straight/bend/corner in world3d.
      progress 2026-08-01 (b): the castle atlas is DONE. `castle/colormap.png` copied to
      `castle/Textures/` where the models actually look, and the hand tints removed from the wall,
      gatehouse, tower, tower-mid, roof and flag so they take their authored colours instead of
      multiplying them. The rampart is textured sandstone with terracotta gatehouses now, not flat
      cream. FLAG FOR OLIVER: that IS a palette shift — warmer and pinker than the old cream. Say
      if you want it pulled back.
      Two traps found by looking rather than assuming:
      - `castle/ground` is a GRASS tile in the kit (its UVs point at the green band), so the moment
        the atlas resolved the courtyard turned green. Paving and the non-grassy zone floors keep
        their tint and explicitly drop the map. Both are colour-driven by design.
      - dropping the map wherever there is a tint is WRONG: the `props/` atlas was never missing,
        so its lightpost has always been textured and its tint tuned against it. Auto-dropping
        turned the plaza lamps from dark green to flat brown. `dropMap` is opt-in for that reason.
      The old note here said "map=NONE on all of them" — that was a symptom of the 404, not a
      property of the assets. Still true for `town/`: no atlas ships for it, do not guess one in.)
- [ ] **Zone floors for the other five zones.** Frost, Ember, Abyss, Palace and Castle have no
      ground surface asset yet. Flag to Oliver if a pack is needed rather than faking it.
      (progress 2026-08-01: they DO have a surface — castle/ground is laid in every non-grassy zone
      — but it was the wrong COLOUR in all of them. `__BF_WORLD()` read the ground colour from
      `G.s`, which nothing in the game ever assigns, so it always fell through to the plains
      fallback #8a8445 and every zone floor was painted khaki. Frostfell reported #8a8445 while its
      stage says #243240. Now sourced from the same stage lookup the voxel renderer uses; probed
      across five zones (plains #8a8445, canyon #352a1e, frost #243240, volcano #3a1c14) and
      Frostfell re-shot — tan floor became cold blue-grey. `theme` is exposed too, unused so far,
      but it is the honest key for per-theme floors instead of matching on zone id.
      STILL OPEN: one shared stone tile for five very different themes. A snow/ice and a volcanic
      surface would need an asset pack — Oliver's call, do not fake it.)

## Class-unlock tier ladder (deeper secret = slightly stronger class)
Oliver will fine-tune power via playtesting, so build classes deliberately CLOSE in power (nudge numbers, not whole kits):
| Secret zone (region · stage) | Class | Core | Tier |
|---|---|---|---|
| Black Woods / Hollow (~1–3) | Ninja | Ranger | 1 |
| Ruined Keep (ruins · 5) | Pirate | Ranger | 2 |
| Frostfell (frost · 7) | Chronomancer | Mage | 3 |
| Abyss Approach (void · 11) | Reaper *(done)* | — | 4 |
| Sunspire Palace (marble · 13) | Paladin *(done)* | Warrior | 5 |
| Castle Duskmoor (apex · 15) | Necromancer *(done)* | Mage | 6 (deepest/strongest) |

## Notes / open decisions (do NOT act on without Oliver)
- Elemental affixes on **physical** weapon drops (making "a Flaming Sword") is a separate system change — Oliver decides before building.
- Real icon art (class icons, skill/passive icons) is a supervised ChatGPT-in-Chrome pass — autopilot uses placeholders. **Necromancer currently has placeholder icons and needs its own 18-icon pass** — this is BLOCKED on Oliver (needs his ChatGPT tab); do not attempt it autonomously, skip to the next actionable item.
- No dragons in the game, so **no Dragonslayer class.**
