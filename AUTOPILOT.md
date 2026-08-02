# BLADEFALL Autopilot — operating spec + backlog

You are the BLADEFALL autopilot. Each run is fresh (no memory of prior chats). Follow this file exactly.

## Mission
Keep improving BLADEFALL by working through the backlog below — **on the review branch only**. Oliver playtests the branch preview and merges to main (which deploys live) himself. You never touch the live game.

## Environment
- **Read `docs/VISION.md` first.** It defines what Bladefall is (a social action-RPG - multiplayer is the point), the class-identity goal, and the money constraint. It outranks guesswork.
- Game file: `_automation/bladefall/public/3d/index.html` (raw WebGL voxel game). Repo = the `bladefall` git submodule (remote `oliverlynch7/bladefall`).
- **3D layer** (sits over the voxel renderer, **ON by default** since 2026-08-01 — no flags needed).
  The old flags survive as an OPT-OUT so the two renderers can still be A/B'd on a phone:
  `?hero3d=0` voxel hero, `?world3d=0` voxel world (takes the mobs with it), `?mob3d=0` voxel
  creatures only. `?nobloom` is no longer required and no longer changes whether the 3D layer
  appears — it is now just the bloom switch it says it is.
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
    **`_shot/` is gitignored, so a fresh checkout does not have it.** The source of record is
    `harness/shot.js`, which IS committed — copy it to `_shot/shot.js` (that exact path is what
    the permission allowlist permits) rather than writing a new one. It needs no `npm install`:
    it drives the installed Chrome over the DevTools Protocol using Node's built-in WebSocket and
    serves `public/` itself, because this machine has no playwright/puppeteer resolvable anywhere
    and an unattended run cannot install one. Flags: `--url --out --wait --pre --prewait --eval
    --size`, plus `--assets <kit|all>` for the offline texture audit.
    **Use `--scene <n|hub>` to get in-game** — the game opens on the title, then a cutscene, then
    class select, then a class trial, then the hub, and each of those will happily hand you a
    screenshot of itself. `--scene 0` lands in The Outskirts, `--scene hub` in the Waystation.
    **`--scene` also waits for the world**, and that is the part that matters: a 3D-zone shot
    taken too early is not blank and not an error — the game has already fallen back to the voxel
    renderer, so you get a complete, plausible, WRONG picture (flat ground, box trees, no roads)
    that reads exactly like "the 3D world regressed". Headless SwiftShader needs ~30–45s to load
    the glTF props. **Never trust a 3D-world screenshot whose log did not print `ready ✓`**; use
    `--ready "<expr>"` to wait on anything else. If it gives up it says `READY NEVER CAME`.
    Running it from Git Bash: a `--url` with no `?query` gets rewritten by MSYS into a Windows
    path — the harness now detects that and says what it substituted.
    **`--focus` points the shot AT something** (added 2026-08-01 worker B, after a run burned eight
    renders aiming a camera by hand in `--eval`). Takes a page expression or a bare `x,y,z`:
    `--focus "__BF3.G.waystone" --dist 300 --side -70`. It places the hero so the EYE ends up
    `--dist` from the subject, snaps `G.cam` — which is a smoothed follow-point that lerps 10% a
    frame and, on headless SwiftShader's handful of fps, is still hundreds of units behind after a
    teleport, so the subject lands behind the camera and reads as "not being drawn" — and holds the
    hero's height, because a subject on a raised mesa has no floor under the teleport spot and
    gravity drops the camera with the hero (measured: y 165 → 55 in under two seconds). It prints
    the target, hero and eye it ended up with.
    **It will not give you a tight close-up, and that is geometry, not a missing feature.** The eye
    rides 118+180·sin(pitch) above the hero on a fixed look-down angle, so under ~200 units a
    ground-level subject drops out of frame. Solving the pitch to compensate swings to near
    top-down; solving the hero's height to put the subject on the view ray buries the camera in the
    terrain. Both were built, rendered and rejected. Working range is `--dist 200–400` with
    `--side` to clear the HUD; a real close-up still means spawning the object near the camera.
  - `public/stress/` — device capability test. Oliver's phone: 60fps at 64 animated characters.
  - `_balance/`, `_duel/` — class DPS profiles and bot-vs-bot win matrices. **Gitignored like
    `_shot/` (the `/_*` rule), and unlike `_shot/` there is NO committed source of record**, so a
    fresh checkout or a second worker's worktree does not have them. Check they exist before
    planning any work that depends on measuring balance; if they are missing, that work is blocked
    until they are rebuilt or copied in, and saying so beats guessing at numbers.
- Work branches: **`autopilot-a`** and **`autopilot-b`**, one per worker, in separate checkouts so the
  two can run at the same time. **Your own branch is named in your run prompt — use that one and no
  other.** `bladefall-autopilot` is the retired single-worker branch; the permission allowlist now
  actively DENIES checking it out or pushing to it. Live/deploy branch: `main` (Cloudflare Pages
  deploys main to `bladefall.pages.dev`; branch previews are `autopilot-a.bladefall.pages.dev` and
  `autopilot-b.bladefall.pages.dev`).
- **Worker A takes the backlog from the TOP, worker B from the BOTTOM** (last unchecked item, working
  upward), so the two never build the same thing. If everything below A's item is blocked or needs
  Oliver, B takes a well-defined non-overlapping improvement instead — asset integration, a tooling
  or harness fix, or a documented cleanup — rather than racing A for the same item.
- Debug interface: `window.__BF3` (exposes `G`, `update(dt)`, `input`, `makeWeapon`, `enterZone`, `CLASSES`, `CLASS2`, etc.) — use it via the in-app Browser pane on the local preview server (`.claude/launch.json` name `bladefall`, port 4310) to verify.

## Workflow — every run
1. `cd` to your checkout. `git fetch origin`, `git checkout <your branch>`, then `git merge origin/main --no-edit` to stay current with supervised/Codex work (if it conflicts, resolve simply or skip the merge and note it).
2. Pick your end of the Backlog below — **A: top unchecked item. B: last unchecked item, working upward.**
3. Build it in `index.html`. Keep changes **small and focused**. A whole class is too big for one run — make **one meaningful chunk** of progress (e.g. "Paladin: class def + family + innate", then next run "Paladin: rank 2-4 skills", etc.), leave the item `- [ ]` with a `(progress: …)` note, and only mark it `- [x]` when fully done + verified. A small item (a rename, one weapon) can be finished in a run.
4. **VERIFY (mandatory gate before any commit):**
   - Syntax: **`node tools/gate.js`** — must end in `GATE OK`. It parses index.html's classic
     `<script>` blocks AND every ES module under `public/3d/` (discovered, not listed), and prints
     VERSION3D.
     **Do not reach for `node -e "…"`.** The old spec named a one-liner here; `node -e` is not on the
     permission allowlist and never will be, because allowing it means allowing "run any JavaScript
     I like". A denied gate is not the same thing as a blocked workspace — on 2026-08-01 a run drew
     exactly that conclusion and twelve runs shipped nothing. If `node tools/gate.js` and
     `node _shot/shot.js …` work, you are fine; those two paths are what the allowlist grants.
   - Render it and LOOK: `node _shot/shot.js --scene 0` / `--scene hub`. Reading source is not proof.
   - Smoke test via `--eval` over `__BF3` / `__world3d()` / `__mob3d()` / `__prop3d()`.
   - If verification fails and you can't fix it quickly, **revert your change, mark the item blocked with a note, and move on.** Never commit broken code.
5. Bump `const VERSION3D` to `X.Y.Z-autopilot` (keep the `-autopilot` suffix on the branch so previews cache-bust and it's obvious it's branch work).
6. Mark the backlog item `- [x]` (and add a one-line note). Commit **to your own branch** with a `[autopilot]` message prefix and the Co-Authored-By trailer, then `git push origin <your branch>`. Commit after EACH item, so a later failure cannot discard earlier verified work.
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
{"action":"tgPing","password":"oliverNCA2026","text":"🎮 BLADEFALL update (v<ver>) — play: https://<your-branch>.bladefall.pages.dev/3d/\n\n• <change one>\n• <change two>\n• <change three>\n\nMerge to your live game whenever you're happy."}
JSON
```
Always include the playtest URL — **your own branch's preview**, `autopilot-a.bladefall.pages.dev`
or `autopilot-b.bladefall.pages.dev`. Bullets, not prose. Keep each bullet short.

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
- [x] **3D on by default.** Done 2026-08-01. `HERO3D.on`, `WORLD3D.on` and `MOB3D.on` now start
      true and the URL flags read as an opt-out (`?hero3d=0`, `?world3d=0`, `?mob3d=0`), so
      `https://…/3d/` with no query string at all is the 3D game.
      **The bloom blocker was STALE.** It had already been fixed and the note never caught up:
      `flushHero3D()` is called AFTER `PostFX.end()` (index.html, main loop), so the 3D layer is
      drawn onto the finished composited frame instead of into a buffer the composite then paints
      over. Measured, not assumed — rendered with bloom ON and no `nobloom` and the whole 3D world
      is there: `__world3d()` ready, 115 road tiles, 1299 floor tiles, 18 live creatures.
      Verified with NO flags in the URL: title screen, the Waystation (25 building meshes, 0
      missing, cobbles + lanterns + gatehouses) and the Outskirts (full 3D world, roads, 18 mobs,
      21 draw calls). `?world3d=0&hero3d=0` was also rendered and reports all three layers off, so
      the escape hatch still works.
      *Known consequence, NOT a regression, worth Oliver's eye:* the 3D layer draws after the
      PostFX grade, so it gets no bloom, tone-map, vignette or the +13% saturation the voxel
      backdrop gets. In practice the two read consistently (compare `_shot/out/road-ship.png`
      against `bloom-on-world.png`), but a bright voxel sky over an ungraded 3D world is the one
      place it could show. Giving the 3D layer the grade means rendering Three into the game's own
      offscreen FBO, which Three does not support without reaching into renderer internals.
- [ ] **Class distinctiveness pass.** The top design goal. Use `_duel/` to measure, not opinion.
      First finding already on record: ranged beats melee 74%-24%, so melee needs an anti-kite
      answer. Work one class-pair at a time and re-run the matrix after each change.
      NOTE: changing balance numbers needs Oliver's sign-off per docs/VISION.md — prepare the
      change and the measured before/after, then queue it rather than shipping it.
- [ ] **Mobs in 3D.** 27 mob types are cast onto real models in the slice already; port that into
      world3d so levels are populated with real creatures. SkeletonUtils.clone is verified as the
      right technique (32 characters, 32 independent skeletons).
      *(progress 2026-08-01: this is LIVE and working — `mob3d.js` reports `on:true` with 18 real
      creatures in Outskirts. Audited `MOB_CAST` against the game's own `ENEMY` table: 40 types
      exist, 27 were cast, and 3 ordinary mobs had been silently dropped by the port even though
      the slice casts them. Added goblin (Orc_Enemy), slimelet (Green_Blob) and sparkling (Hywirl)
      with the slice's own files/rigs/heights — spawned and eyeballed all three. That is 30/40.
      Re-run the audit any time with `node _shot/shot.js --eval` over `Object.keys(__BF3.ENEMY)`.
      The 10 left are NOT autopilot work: 7 are BOSSES (brute, warden, archer, sorcerer, colossus,
      king, tyrant) and picking a creature model for a boss is an art-direction call — the slice
      only has a generic `bf:'boss'` Dragon_Evolved placeholder. The other 3 are mimic, dummy and
      bosscrystal, which are objects rather than creatures. Needs Oliver.)*
      *(progress 2026-08-01 worker B: mimic and dummy are DONE — 32/40. Neither was actually an
      art call: a mimic IS a chest and a training dummy IS a dummy, and the Quaternius prop kit
      ships `qprops/Chest_Wood` and `qprops/Dummy` under exactly those names. They live outside
      monsters/ and ship as .gltf+.bin, so `loadMobModel` now takes a kit-qualified path and
      resolves the extension instead of hardcoding .glb.
      This had stopped being cosmetic. The 3D layer draws onto the FINISHED frame with its own
      depth buffer (`flushHero3D`, index.html — the source comment already says "cannot be
      occluded by [the voxel world]"), so 3D geometry paints over anything the voxel pass drew.
      The Waystation floor is 3D, therefore the hub's ONE practice dummy was invisible. Measured
      both ways: `?world3d=0` shows the straw dummy in front of the hero; the same frame with the
      3D world on has bare cobbles. After the cast it stands in its real spot by the Sparring Room
      with nothing repositioned (`_shot/out/b-dummy-before.png` vs `b-dummy-inplace.png`).
      One scale rule came out of it: creatures fit by HEIGHT, but a chest is 1.8x wider than tall,
      so height-fitting gave a 54-unit-wide mimic over a 32-unit hitbox — its front edge outside
      the box you can hit. `fit:'width'` matches the footprint to `e.r*2` instead, which is what
      the game's own voxel mimic does (a 30x13x22 box).
      Outskirts re-checked after: still 18 live creatures, 0 missing, no errors.
      **bosscrystal is still genuinely blocked** — the repo has no crystal/gem/shard asset at all
      (searched every kit), so any model for it would be an art-direction substitution. Its
      INVISIBILITY is fixed by the deferred entity pass below, so it is no longer urgent; it is
      just still a voxel object in a 3D world. A crystal asset from Oliver would finish it.)*
- [x] **Chests in 3D.** Done 2026-08-01 (worker B). The treasure chest is the thing a run is FOR
      and it was the last big voxel box left in a 3D world. New layer `public/3d/prop3d.js` casts
      `G.chests` onto the Quaternius `qprops/Chest_Wood`, alongside world3d (architecture) and
      mob3d (creatures). Probe it with `__prop3d()` / `__prop3dPoses()`.
      Three things worth keeping:
      - **The mimic's tell survives, and is now the model's own hinge.** A mimic chest breathes —
        the lid lifts a hair on a slow rhythm — and that is the only warning you get. Rather than
        play an animation, one `Chest_Open` action is held PAUSED and its `time` is used as a dial:
        0 shut, `duration` flung open, ~3% ajar for a mimic. The game still decides the tell
        (drawChest stashes `_br`/`_shove` on the chest) because it runs on game time while prop3d
        runs on wall time — computed twice, the lid would breathe on one clock and the glowing lock
        slide about on another.
      - **The lock, keyhole and sparkle stay voxel** and are placed against the model's real fitted
        box (`__prop3dChest()`), not the old voxel numbers. They pulse every frame and two of them
        are the other half of the mimic tell.
      - **Fitted to 32 wide, which is exactly what mob3d fits the woken mimic to** (`e.r*2`). Pick
        any other number and the disguise gains a size tell nobody designed, and the reveal pops.
        Opening range is a flat 44 from the centre and does not depend on the model.
      Verified: hub close-ups of closed / mimic / opened, real generated chests in the Outskirts
      (7 of them, seated on the road), `?world3d=0` still draws voxel chests, and first-person
      still draws them — see the FPS note below, which that check turned up.
- [x] **First-person was rendering an empty world.** Found and fixed 2026-08-01 (worker B) while
      checking the chest work; it turned out to be much larger than the chest question that found
      it. `drawHero3(p,t)` is not called when `meta.camMode==='fps'`, so `__hero3dPending` is never
      set, `flushHero3D` returns early, and **the entire Three layer sits the frame out** — world3d,
      mob3d and prop3d together, because one call renders all three.
      Meanwhile FOUR separate guards were skipping the voxel copy on the strength of "the 3D layer
      is switched on" rather than "the 3D layer will draw": `_w3dGround` (floor), `_w3dOn` (tree
      trunks), `_w3dDrawing` (**the whole of `G.deco` — every tree, rock and prop in the level**)
      and `__mob3dDrawn` (creatures). With the voxel copy skipped and Three not running, those
      things were drawn by NOBODY, while every layer reported itself on, ready and healthy.
      All four now ask `three3DLive()`, which is `deferArmed()` under a name that says why.
      Measured both ways in the Waystation: before, the practice dummy left a shadow on the cobbles
      with nothing standing in it (`_shot/out/b-fps-dummy-bug.png`); after, the dummy, the market
      stalls, the crates and the trees are all back (`b-fps-dummy-fixed.png`). Same in the Outskirts
      (`b-fps-bug.png` → `b-fps-zone-fixed.png`: bare terraces → a grove). Shoulder camera re-checked
      in hub and Outskirts and is unchanged — no doubled deco.
      *Worth remembering:* this is the third bug of exactly one shape. Anything that skips its voxel
      version because a 3D layer "has it" must ask whether that layer is drawing THIS FRAME.
- [x] **Wall torches, jump pads, heal pads, springs and every floor hazard were invisible too.**
      Found and fixed 2026-08-01 (worker B) while looking for the next prop3d cast. This is the
      SAME bug as the chests and the practice dummy, and it had been missed because the earlier
      sweep listed the objects it could think of rather than reading `drawCourse` top to bottom.
      Measured first, not reasoned about: same hub frame, same camera, `?world3d=0` shows the
      sconce standing beside the hero (`_shot/out/b-torch-voxel.png`); with the 3D world on the
      spot is bare lit cobbles (`b-torch-3d.png`). Fifteen torches in the Waystation alone, plus
      every dungeon hall. The giveaway that nobody spotted it sooner: the LIGHT survived —
      `setSceneLights` feeds the three nearest torches to the shader as point lights, so the hub
      had warm pools of firelight cast by sconces that were not on screen.
      Deferred alongside the plates: torches, jump pads, healing pads, healing springs, geysers,
      boss slam shockwaves, magma trails, spike fields, the Colossus sweep beam, Void Tyrant
      collapse tiles and the golden bonus portal. Every one is a thing you step on or read off the
      floor, world3d draws no replacement for any of them, and all of them sit within a few units
      of ground the 3D layer covers completely.
      THREE windows, not one, and that is the load-bearing detail: moving platforms and crumbling
      stepping stones are interleaved with these in the source and are WORLD, not entity — you
      stand on them — so they keep their inline, depth-tested place. Reordering the source to get
      one window would have changed the draw order of the platforms as well.
      Verified: hub torch before (`b-torch-3d.png`) vs after (`b-torch-fixed.png`) — same camera,
      sconce and flame back on the cobbles; a REAL generated heal pad in the Outskirts renders on
      the road with its cross (`b-healpad-after.png`); first-person still draws the full voxel
      torch (`b-torch-fps.png`); `?world3d=0` unchanged and still correctly occluded
      (`b-torch-w3doff-after.png`). Outskirts regression clean: 1257 floor tiles, 115 road tiles,
      118 trees, 7 chests, 18 live creatures, 21 draw calls.
      *Worth remembering:* the way to find the rest of these is to read `drawCourse` in order and
      ask of each block "is this architecture world3d replaces, or a thing the player uses?", not
      to list objects from memory. `drawSpawner`'s dens were checked and are already deferred.
      *(follow-up, same run: THE MOVING PLATFORMS AND CRUMBLING STEPPING STONES WERE INVISIBLE TOO,
      and the reason the first pass left them out was a wrong test. "A thing you stand on is world,
      not entity" sounds right and is not the question — the question is only ever **does world3d
      draw a 3D replacement for this**. world3d lays floor tiles for `G.segments`; movers and
      crumbles are in neither list, so nothing 3D drew them and the 3D floor covered them.
      Measured in Frostfell: `?world3d=0` shows six pale stepping stones across the ice
      (`b-crumble-voxel.png`), the same frame with the 3D world on is one unbroken sheet of stone
      (`b-crumble-3d.png`). These are the platforming beats — they shake, they drop, you have to
      read which slab is about to go.
      **Deferring them was necessary and NOT sufficient, and that is the part worth keeping.** The
      crumble's visible face spans y 0..1.4; world3d parks its floor tiles at y=1.45. So the stone
      was drawn, depth-tested honestly, and lost by five hundredths of a unit — found by lifting one
      to h=44, where it appeared instantly (`b-crumble-lift.png`). It now lifts 2.2 when the 3D
      ground is being laid, which puts its top face at 2.9: exactly where the pressure plate's top
      sits, and the plates have rendered correctly over the 3D floor since the deferred pass went
      in. The voxel renderer keeps the tuned 0.7 it was built around.
      Verified: all six stones back in the 3D world at their reference positions
      (`b-crumble-lifted-fix.png` vs `b-crumble-voxel.png`), and the voxel path unchanged
      (`b-crumble-voxel-after.png`).
      **One known consequence, on the debug path only, worth Oliver's eye rather than a fix:** with
      `?world3d=0` AND the 3D hero on, `flushHero3D` still clears the depth buffer, so the deferred
      replay tests against a buffer holding only the hero and every deferred object draws over the
      voxel world. Pre-existing — chests, plates and keys have behaved this way since the deferred
      pass — but this commit adds more objects to it, and it shows as a crumble's side face standing
      proud of ice that used to hide it. The default (3D world on) composites correctly; the fix
      would mean changing `deferArmed()`, which the note below explicitly warns must keep matching
      when `flushHero3D` runs.)*
- [x] **The whole Waystation was invisible — every keeper, stall, forge and the plaza bonfire.**
      Found and fixed 2026-08-01 (worker B). Same bug shape as the torches and the stepping stones,
      and the biggest instance of it yet, because it hit the HUB — the place VISION.md ranks as
      priority 4 and calls "where the game happens socially".
      `drawCourse`'s entity pass ended with `deferOff(); if(G.hub) drawWaystation(t); deferOn();`,
      on the theory that a hub is architecture. It is not: `drawWaystation` draws the FURNITURE.
      world3d's hub build is a REBUILT courtyard, not a conversion of those boxes — it lays walls,
      paving, lanterns, market carts, hedges, four buildings and one gatehouse per portal, and
      draws nothing whatever for the keepers, their stalls, the forge, the mirror, the beast cages,
      the arcade, the notice board, the abyss monolith, the Sprint/Arena gates, the boss trophies,
      the string lights or the plaza bonfire. Its 273 paving tiles cover the ground every one of
      them stands on, so all of it was painted out.
      Measured before touching anything, same camera both ways: `?world3d=0` gives a plaza with a
      fountain, a lit bonfire, market wares and keepers (`_shot/out/b-hubwide-voxel.png`); the
      default gives bare cobbles (`b-hubwide-3d.png`). The tell that hid it for so long is that the
      HTML labels survive — walk up and "The Smith · Fuse gear" appears over an empty patch of
      floor, so the hub reads as working.
      `drawWaystation` now manages its own defer window: deferred by default, turned OFF around
      exactly the three blocks world3d really does rebuild — the eight gate frames (`counts
      .gatehouse === 8`, so deferring would stand a second boxier gate in front of the first), the
      horizon vista (a skyline a mile off, it reads over the rampart either way) and the ramparts
      hub-upgrade.
      **Second half of the fix, and it would have been a half-conversion without it: world3d's
      centrepiece tower was deleted.** It stood at northZ+620 = z 47, and the game's own plaza
      waystone — the bonfire you touch to heal and take stock — is at z 30. A 130-wide tower over a
      64-wide stone: deferring the bonfire just moved it inside the tower, with only the fireflies
      escaping (`b-hubstone-fixed.png`). That tower was only ever a substitute for a centrepiece
      this bug had erased ("a courtyard with nothing in the middle reads as an empty lot" — the
      middle was never empty), so with the real one back it goes. The corner towers are untouched.
      Verified: plaza before (`b-hubstone-3d.png`, solid tower) vs after (`b-hubstone-fixed2.png`,
      stone + gold capstone + light column + string lights + fireflies); the Barber and her chair
      standing on the cobbles (`b-barber-fixed.png`) where the same camera showed nothing;
      `?world3d=0` unchanged (`b-barber-w3doff.png`); first-person draws the full voxel hub
      (`b-hub-fps.png`) because `deferArmed()` is false there and every `deferOn()` no-ops.
      Outskirts regression clean and identical to the recorded baseline: 1257 floor tiles, 115 road
      tiles, 118 trees, 2194 deco, 18 creatures, 7 chests, 21 draw calls.
      *One for Oliver's eye, not a bug:* the west-side keepers (Quartermaster, Smith) stand inside
      world3d's hub buildings, so a camera pushed up to them ends up inside a roof. They are drawn;
      they are just indoors now. Whether those buildings should be open-fronted market shells is an
      art call.
      *(follow-up, same run: THE PORTAL ROW COULD NOT BE READ. The gates were left inline above
      because world3d really does put a gatehouse on each of the eight cells — but a gatehouse is
      one stone arch repeated eight times, and it says nothing about which of the eight you can
      walk through. Amber = open, green with a capstone = cleared, a cold slab with a bar = locked,
      and the pips on the lintel say what tier it is: that is the whole read of the row, it is
      gameplay rather than decoration, and world3d draws no equivalent for any of it. Every
      destination in the hub looked identical.
      The gate loop is now SPLIT rather than moved, which is the right shape for this and the first
      time this file has needed it: the posts and lintel stay inline because they ARE replaced,
      and only the state — fill, pips, cleared capstone, cold bar — is deferred. Trial-chamber side
      gates have no gatehouse at all, so those defer whole.
      Verified by forcing four gates through their states in one frame (`--eval` over `G.gates`):
      3D world on, a green cleared portal and an amber open one either side of two dark locked ones
      with their bars (`_shot/out/b-gate-states.png`), the same frame with `?world3d=0`
      (`b-gate-states-w3doff.png`) and in first-person (`b-gate-states-fps.png`), both unchanged.
      The default-state row is `b-gate-state.png` — one open gate, seven barred.)*
- [ ] **The rest of the objects you interact with, through prop3d.** The chest proved the pattern;
      `prop3d.js` is named for props in general and its header already says "chests, keys". Next,
      in rough order of how often a player sees them:
      - [x] **The ancient key** (`G.keys`) → `qprops/Key_Gold`. DONE 2026-08-01 (worker B). The
        measured extents were right (0.0581 x 0.0123 x 0.1223, long axis Z, confirmed live via
        `__prop3dKey()`), so the model is fitted on its LONGEST native axis to 22 units — not by
        height, which is its 0.012 blade edge and would have scaled it ~1800x — and stood up with a
        quarter turn about X. The spin rides on a parent Group rather than an Euler order, so it is
        a pure world yaw whatever the model was authored along, and the model is re-centred on its
        own post-rotation bounding box so it turns on the spot instead of being waved.
        **The turn is +PI/2, not -PI/2**, and that is the one thing the note above got backwards:
        the model is authored bow-to-+Z, so the documented sign stands it up TEETH-UP. Rendered it
        both ways; bow-up is what the voxel key does and what reads as a key at a glance.
        The glow beam stays voxel, and so do `_y`/`_spin` — the game computes the bob and the spin
        on GAME time and hands them over on the key object, exactly as drawChest does for the
        mimic's lid, or the key would drift out of its own beam.
        Model is fetched on DEMAND (keys are rare), unlike the chest which loads in every zone.
        Verified: hub side-by-side at gameplay distance (`_shot/out/b-key-play-voxel.png` vs
        `b-key-play-3d.png`), a close-up (`b-key-zoom3-3d.png`), a real generated zone
        (`b-key-zone3.png`, Frostfell), collecting one hides exactly that one (`b-key-taken.png`),
        and the fallbacks all still draw the voxel key: first-person (`b-key-fps.png`),
        `?world3d=0` (`b-key-w3doff.png`) and `?prop3d=0`. Outskirts re-checked for the prop3d
        refactor: still 7 chests, no errors.
      - **Loot pickups** (`G.pickups`) — commonest object in the game, but "what does a dropped
        sword look like" is an art call per drop type; ask Oliver before picking models. The gold/
        coin case is not a call (`qprops/Coin_Pile`).
      - [x] **The quest waystone** (`G.waystone`) → `props/pillar-obelisk`. DONE 2026-08-01
        (worker B). It went in prop3d after all, not world3d: there is at most ONE per level, it
        has state (`taken`), and it is an ENTITY that has to be drawn in the defer window — every
        reason prop3d exists. It is also the least invented cast in the file, because the game's
        own source comment already calls it "a lit obelisk you can spot across a room" and world3d
        already loads `props/pillar-obelisk` for pillar deco, so the model is proven and usually
        already downloaded.
        Fitted to 64 — the voxel stone's own height, plinth through shaft — so the gold capstone,
        the light column and the orbiting motes, which all stay voxel, land where they were tuned
        to land. They are placed against `__prop3dWaystone().h` rather than the old 64 literal, so
        a re-fit cannot leave the light hovering over nothing.
        Verified: hub side-by-side (`_shot/out/b-way-voxel.png` vs `b-way-3d3.png`) — real obelisk,
        capstone on the apex, base on the ground, no doubled voxel shaft; the real generated
        Outskirts waystone reports `waystone:1` at its generated spot; touching it removes stone,
        capstone, beam and motes together (`b-way-taken.png`); first-person (`b-way-fps.png`) and
        `?world3d=0` (`b-way-w3doff.png`) both still draw the full voxel stone. Outskirts
        regression clean: 7 chests, 18 creatures, 21 draw calls, no errors.
        *One for Oliver's eye, not a bug:* the kit obelisk is a pale blue-grey, where the voxel one
        was a neutral mid-grey. It matches how that model already renders elsewhere in the 3D
        world, so it is consistent — it is just cooler in tone than the box it replaced. A tint is
        one line if you want it warmer.
        *Checked and rejected on the way:* converting the prop's PBR material to Lambert the way
        `loadPart` does. Rendered before and after — pixel-identical, because `loadProp`, which is
        what world3d actually uses for props, keeps the glTF material too. The colour is the kit's,
        not the lighting model's. Reverted rather than committed as a fix that fixed nothing.
      - The exit portal and the spawner dens are the two left. Both are art calls as things stand:
        the repo has no portal/vortex asset at all, and "what does a goblin den look like" is a
        per-mob styling decision (`drawSpawner` already styles each nest to the mob it breeds).
      Whatever gets added: it is an ENTITY, so it must be drawn inside a defer window, and its skip
      guard must ask `three3DLive()` and not "is the layer on". Both traps are documented below and
      both have already cost a session.
- [x] **Ground polish.** Real paths where levels have walkways (the Nature Kit has pathStraight/
      Bend/Corner/Cross/Split) and a second grass variant, so a field is not one uniform green.
      *(PATHS done 2026-08-01 — the item is now complete. Tagged at the SOURCE, never inferred:
      every road()/path()/trail()/floorRoad() helper in the zone generators marks its segments
      `path:true` (12 helpers; the Outskirts pair was already tagged). world3d then lays real
      Nature Kit road pieces on them and AUTOTILES — each tile probes past its four edges and
      picks straight/bend/cross/T/dead-end, so an L-corner renders as a corner rather than two
      crossed stripes. The ground under a road is dropped rather than drawn beneath it.
      trail() needed more than a tag: it emits a CHAIN of squares along an arbitrary line, and a
      132x132 square carries no direction, so the generator now records `pdx/pdz/pstep` and each
      step becomes one straight piece rotated onto that heading — which is what makes the Outskirts'
      diagonal trails continuous ribbons instead of a staircase. Metadata only; no collision change.
      Non-grassy zones get a road too, but NOT these pieces: the kit's road tiles are dirt tracks
      drawn ON GRASS, so one in a dungeon lays a lawn in it. Those themes name a `road` surface in
      THEME_GROUND (Floor_RedBrick / Floor_Brick, a shade off the zone's own floor) and the floor
      pass paves the tagged cells with it.
      Verified by render in three zones: the Outskirts field (diagonal trails, road network at the
      river crossing), Black Woods (axis roads + autotiled corners, checked at eye level as well as
      from above) and the Ruined Keep (stone theme, `roadPaved` 2204 cells). Probe any zone with
      `__world3d().counts` — roadPlanned / roadTiles / roadPaved.
      ONE BUG WORTH REMEMBERING: the first Keep render reported roadPaved 0 with 47 tiles planned
      and logged nothing at all. THEME_GROUND named Floor_RedBrick but PROP_SETS never listed it,
      so it was never loaded and the road silently fell back to ordinary floor. A surface named in
      THEME_GROUND must also be in PROP_SETS; there is now a console.warn when it is not.)*
      *(progress 2026-08-01: the "not one uniform green" half is DONE, but not via a second grass
      tile. `THEME_GROUND[].tiles` now takes weighted variants, and every ground instance gets a
      deterministic brightness jitter (`GROUND_JITTER`) through `InstancedMesh.setColorAt`, so a
      field is mottled rather than one flat sheet — at no extra draw call. A second GRASS tile was
      built, rendered and REJECTED: the only candidate is castle/ground, and nature/ground_grass is
      flat teal with no texture while castle/ground is a textured mid-green, so any mix reads as
      discoloured blotches — 50/50 is a literal chessboard. Screenshots compared before dropping
      it. A real second grass variant needs an asset that is the same green with different detail;
      the repo has none (nature/ and terrain/ ship the identical file). The variant machinery IS
      used where the tiles match: ruins and apex mix Floor_Brick with Floor_UnevenBrick and read
      as worn flagstone.*
- [x] **Zone floors for the other five zones.** Done 2026-08-01 — no new pack needed. The premise
      was slightly off: those zones DID get a floor, but every non-grass zone shared one tile,
      `castle/ground`, which is the Castle Kit's GRASS tile. It passed as neutral only because its
      colormap 404'd and it drew white. Now each `STAGES[].theme` names its own surface + tint via
      `THEME_GROUND` in world3d.js: frost/void/apex/marble/ruins/dungeon on `village/Floor_Brick`,
      volcano/canyon/badlands on `village/Floor_UnevenBrick`, plains/forest still on grass.
      Also fixed the plumbing this depended on: `__BF_WORLD()` read `G.s.ground`, but `G.s` does
      not exist — the live stage is `STAGES[G.stageIndex]` — so the tint fell back to the olive
      default in EVERY zone, and world3d had no theme at all (it was testing theme names like
      'forest'/'plains' against ZONE ids, which never match). All 8 zones rendered and eyeballed.
      *Still approximations:* there is no true SNOW or MARBLE asset in the repo — Frostfell and the
      Sunspire are tinted stone. They read correctly, but a snow/marble pack would beat them.

## How the voxel and 3D layers compose — read this before touching either renderer
Fixed 2026-08-01 (worker B). `flushHero3D()` clears the DEPTH buffer and draws Three onto the
already-composited frame, so **Three wins every pixel it covers** — the comment there has always
said the 3D layer "cannot be occluded by" the voxel world. That was harmless when the only 3D
thing was the hero. Once the WORLD became 3D its ground alone covers most of the screen, and every
voxel ENTITY standing on that ground was painted out. Not dimmed, not z-fighting: gone.

Measured, not reasoned about: a chest, a loot pickup and an exit portal placed in front of the
hero in the Waystation. `?world3d=0` → all three plainly visible. Default (3D on) → bare cobbles.
**Chests, loot and the level exit had been invisible since 3D became the default**, along with the
hub's practice dummy, the Warden's Shade, pressure plates, keys, spawners, the waystone, boss ward
crystals, projectiles and particles.

The fix is a **deferred entity pass** (`deferOn` / `deferOff` / `flushDeferred` in index.html).
Entities are recorded instead of drawn, and replayed AFTER `flushHero3D()`. Three renders into the
same default framebuffer and takes its camera from the game's own PROJ/VIEW (`__BF_CAM`), so by
then the depth buffer holds the 3D world at depths the game's matrices agree with — the replay
therefore composites *correctly*, not merely on top. Verified: five chests in a line straight ahead
through a 3D tower, only the one in front of it renders.

Rules that fall out of this, worth keeping:
- **World stays inline, entities defer.** `drawCourse` and `drawWaystation` are architecture and
  world3d already draws their 3D replacement over them. Plates/keys/chests are objects and were
  moved into the deferred window even though they live inside `drawCourse`.
- The LATE translucent ghost-wall pass stays inline: replayed it would read as a second, see-
  through copy of a wall world3d has already drawn solid.
- Order and blend survive because `gl.blendFunc/depthMask/clear` already flush the batch to
  preserve draw order; while deferring they SEAL A SEGMENT and record the state instead. A single
  flat replay renders every additive glow as an opaque black cube.
- `deferArmed()` must keep matching, exactly, when `flushHero3D` actually runs — including
  `camMode!=='fps'`, because first-person never queues the hero so the 3D layer never draws and the
  depth buffer would be a whole frame stale.
- Anything NEW that is an entity must be drawn inside a defer window or it will be invisible.

Checked after: Outskirts unchanged (18 live creatures, 17 voxel draw calls), pure-voxel mode
(`?world3d=0&hero3d=0`) byte-for-byte the same behaviour, first-person unchanged, bloom on and off
both composite.

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

## Kit textures — fixed 2026-08-01, and the one gap left
Every Kenney-style kit ships a `colormap.png` palette that its models index by UV. Three kits
could not find theirs, so 27 castle models, both hub floors and every brick floor rendered as
flat white. That is the real cause of the "these tiles carry no texture, only a material colour"
note that survived five sessions of hub-floor attempts — `map` was NONE because the file 404'd.

Fixed: `castle/colormap.png` copied to `castle/Textures/colormap.png` (where its 27 models look
for it), and `T_Brick/T_RedBrick/T_UnevenBrick_BaseColor.png` copied from `village/` into
`nature/` (the `Floor_*.gltf` in both kits are byte-identical files).

**Still missing, needs Oliver:** `town/Textures/colormap.png` — the town kit (fountain, cart,
stall, hedge, lantern, fence, banners, pillars = 15 models) has no palette anywhere in the repo.
Each kit's palette has a DIFFERENT column order, so castle's or props' cannot be substituted
without recolouring every model wrongly. Re-download the town kit or drop the palette in; do not
fake it. Until then those props render white and are held together by explicit tints in world3d.

Audit any time with `node _shot/shot.js --assets all` — lists every texture each kit references
and whether it is on disk. Remaining MISSING entries there are Normal/ORM/Roughness detail maps
only; those never cause the white-model failure.

**But "missing ORM only degrades shading slightly" was wrong, and cost a render** (2026-08-01,
worker B). A glTF material with no `metallicRoughnessTexture` and no explicit factor takes the
SPEC DEFAULT of metalness 1. A fully metallic surface is lit only by what it reflects and this
scene has no environment map, so it renders near-BLACK. Every ORM in `qprops/` is missing, so the
whole kit was in that state: the first 3D chest came out dark navy, and the hub's practice dummy
had shipped that way. `demetalise()` in mob3d.js now zeroes metalness on any material that is
metallic with no map to vary it — the FAULT, not the folder, so a correctly authored material is
untouched. It logs when it fires. world3d had already met this and solved it its own way (kit PBR
materials converted to Lambert in `loadPart`).

## Notes / open decisions (do NOT act on without Oliver)
- Elemental affixes on **physical** weapon drops (making "a Flaming Sword") is a separate system change — Oliver decides before building.
- Real icon art (class icons, skill/passive icons) is a supervised ChatGPT-in-Chrome pass — autopilot uses placeholders. **Necromancer currently has placeholder icons and needs its own 18-icon pass** — this is BLOCKED on Oliver (needs his ChatGPT tab); do not attempt it autonomously, skip to the next actionable item.
- No dragons in the game, so **no Dragonslayer class.**
