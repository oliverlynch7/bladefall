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
    **And `ready ✓` had to be taught to mean ready HERE — fixed 2026-08-02 (worker B).** The
    default wait was `__world3d().built`, but `--scene <n>` goes through the HUB on the way:
    `skipTrial()` lands you in the Waystation and `enterZone()` only fires five seconds later, so
    world3d had already built the hub and `built` was truthy before the zone existed. `--scene 0`
    printed `ready ✓ after 0.0s` and handed back a photograph of the plaza — `counts {hub:true,
    pave:273}`, `mob live 0`, `chests 0` — to a run that believed it was auditing the Outskirts.
    A RACE, so it had worked before: if the hub build ran long, `built` flipped after enterZone
    and the shot was right by luck. The wait now tests the DESTINATION — the game is there
    (`G.hub` / `G.zone`) and the build is of that place (`counts.hub` is set only by the hub
    build) — and short-circuits when `world3d` is off so `?world3d=0` still resolves.
    Two things to keep: a `--scene 0` that resolves in under a second is now the BUG, not the
    fast path (it should take ~4.5s); and **`--scene <n>` is a ZONE index, not a stage index** —
    it goes to `enterZone()`, which loads that zone's first AREA, so zone 1 is stage 3. They
    agree only at zone 0, which is why every example uses `--scene 0`.
    **THE SAME LIE HAD A SECOND SOURCE, one gate further back, fixed later on 2026-08-02 (worker
    B).** The hub was not the only place on the way that satisfied the test — the CLASS TRIAL was
    too. `startTrial('warrior')` builds `newG(p,{zone: fromZone||0, …, trial:cid})`, so for the
    ~7.5s between it and `enterZone()` the game stands in the Trial of the Blade with `G.zone`
    already 0, `G.hub` falsy and `G.side` false: every clause of the destination test true, and
    world3d builds the arena so `built && !counts.hub` comes true there as well. Measured by
    running one identical `--scene 0` twice — "The Outskirts", 118 trees, 118 3D trees; then
    "Trial of the Blade", 34 deco, 0 trees. Pure race with how warm the asset cache is. The test
    now also requires `!G.trial`.
    **And every run now prints `at → <place>` under `ready ✓`** — the level's own `areaName` plus
    hub/TRIAL/side and the zone + stage. Both of the day's ready bugs were invisible in the log
    and obvious in one word; a shot of the wrong level should not have to be caught by eye.
    **`--scene <zone>.<area>` reaches a zone's LATER areas** (added 2026-08-02, worker B):
    `--scene 0.1` is Black Woods, the second place anyone plays, and `--scene 0.b` is The Brute's
    arena. Until this went in `--scene <n>` could only ever photograph area 0, because
    `enterZone()` loads the zone's first area and nothing else moved — so **half the levels in the
    game, every second area and every boss room, had never been in front of a camera.** It steps
    the game's own `nextArea()`, which is synchronous through `loadArea()`, and the ready test
    waits on `G.area` as well as the zone. Verified on 0.1 (Black Woods, 110 trees, road through
    the wood) and 0.b (The Brute, `G.area === -1`, stage 2).
    **`--scene side<N>` photographs a zone's hidden SIDE area** (added 2026-08-02, worker B):
    `--scene side0` is The Thornwood, `side2` the Oubliette, and so on for all seven. They are
    their own hand-authored `SIDE_SCAPES`, not a reskin of the zone above them, so nothing a
    `--scene <n>` render shows says anything about them. The unlock step is why this needed a flag
    rather than a `--pre`: `enterSide()` checks `meta.classUnlocked[trial]` FIRST and quietly runs
    `startTrial()` instead when the class is locked — which is always, on a throwaway profile — so
    a bare `enterSide()` photographs the trial arena under the side area's name. It calls
    `cheatUnlockClasses()` first.
    **`--scene trial` photographs a ROOM DUNGEON, which nothing could do before** (added
    2026-08-02, worker B — the missing piece the walls/doors item below explicitly asked for).
    Every other destination lands on a hand-authored scape: `EXPANDED_SCAPES` for the eight zones,
    `SIDE_SCAPES` for the seven side areas, `BOSS_ARENAS` for the boss rooms. The shared grid-graph
    maze underneath them — the ONE generator that emits `G.walls` with doorway gaps, `sealDoor()`
    slabs into `G.doors`, pressure `G.plates` and corner `G.torches` — is reached only when all four
    dispatches are skipped, and `G.trial` is what skips them (every guard reads `!G.trial`). So
    doors existed in the game and had never been in front of a camera. The run-up already calls
    `startTrial('warrior')` on its way to the hub; this destination simply never calls `skipTrial()`.
    `--scene trial:<class>` picks the class, hence the trial.
    Two things it had to learn, both measured: **`tutGo` is on the dismiss whitelist here and
    nowhere else** — the first trial opens behind "The Proving Chamber" card whose two buttons are
    `tutGo` (begin) and `tutSkip` (skip tutorial AND trial), so a clicker that took the first button
    in the overlay would take the trial with it and photograph the hub; and the ready test waits for
    that card to stop being visible, because `G.trial` alone resolved in 0.5s and handed back a
    photograph of the tutorial TEXT (`b5-trial.png`).
    Used immediately to close the door question: a closed door injected in front of the hero with a
    control chest renders correctly composited over the 3D floor — jambs, lintel and lock stripe
    (`b5-door-3d.png`) — and `?world3d=0` is unchanged (`b5-door-voxel.png`). **The door path is now
    photographed rather than inferred.**
    **`--scene spar` photographs the hub's SPARRING ROOM** (added 2026-08-02, worker B) — the last
    hub sub-area nobody had rendered. It needs a destination because `enterSparringRoom` is a plain
    top-level function and is NOT on `window.__BF3`, so a `--pre` cannot call it; this opens the
    game's own door instead (`G.hubNpcs` carries `{id:'sparring', open:()=>…}`). It waits on
    `G.sparringRoom`, not `G.hub`, because the room sets both and `hub` alone resolves in the
    Waystation on the way. See the backlog entry for what it found — and for the near-miss that
    came of reaching it with a hand-rolled `--pre` first.
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
    **It now says when the teleport did not stick (2026-08-02, worker B), and until it did the
    failure was silent.** Teleporting the hero to a spot with no floor under it trips the game's
    own fell-out-of-the-world rescue, which puts it back at `G.lastSafe` — the level START — so the
    harness printed a target, a hero and an eye, and handed back a perfectly good photograph of the
    entrance while the log claimed to be pointing at your subject. Reproduced in the Ruined Keep:
    `--focus "{x:0,y:0,z:-900}" --dist 340 --side 60` reported hero z 290 with the target 1200 away.
    It now compares where the hero ENDED UP against where focus put it and prints
    `^ FOCUS LOST: …` past 60 units (ordinary settle drift measures ~23). It reports and does not
    correct: the fix is to pass the subject's real y, and silently moving the camera would be the
    same lie in a new place.
    **It will not give you a tight close-up, and that is geometry, not a missing feature.** The eye
    rides 118+180·sin(pitch) above the hero on a fixed look-down angle, so under ~200 units a
    ground-level subject drops out of frame. Solving the pitch to compensate swings to near
    top-down; solving the hero's height to put the subject on the view ray buries the camera in the
    terrain. Both were built, rendered and rejected. Working range is `--dist 200–400` with
    `--side` to clear the HUD; a real close-up still means spawning the object near the camera.
  - **`__world3dPoses('<model>')` says where the props actually ENDED UP** (added 2026-08-02,
    worker B). Returns `{model, x, y, z, h, w}` per instance — `y` is the model's BASE in world
    units, `h` its fitted height — so `__world3dPoses('tree')` against `__BF3.floorAt(x,z)`
    answers "is this standing on the ground" in numbers. It exists because that exact question
    was argued twice from source and twice from screenshots and got a different answer each time;
    the InstancedMeshes are now named `w3d:<model>` so they can be read back.
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

## If you cannot run `node`, STOP — the run is dead, and it is not your fault
Check this first, before picking an item. Try `node --version` and then `node -e "console.log(1)"`.
If the bare version works and `-e` comes back "This command requires approval", the workspace is
**not trusted**, so Claude is ignoring every `permissions.allow` entry in `.claude/settings.json`.
That removes BOTH verification gates at once — the syntax check and the `_shot/` harness — and
there is no fallback, because the harness needs real headless Chrome (the in-app browser pane
renders the `#gl` canvas at 0x0). Any code you write in that state is unverifiable by definition.

**Do not write game code. Change nothing under `public/`. Exit.** The fix is Oliver's and takes ten
seconds: open a terminal in `_automation\bladefall`, run `claude`, accept the trust dialog.
`autopilot.ps1` now pre-flights this and pings Telegram once a day, so it announces itself rather
than burning an hourly session — but if you are reading this from inside such a session, the ping
is already handled and the correct move is to stop.

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
      *(progress 2026-08-02, single worker on `autopilot-merged`: THE ANNEX HAS A FLOOR. The 3D
      paving was one rectangle derived from the gate positions, so it stopped ~480 units short of
      the activity annex and the tan voxel floor past the cobbles was a hard seam straight across
      the walk from the plaza to the Arena (`_shot/out/m1-annex-3d.png`). It now tiles the game's
      OWN `G.segments` — the same list the voxel renderer floors — so the two layers cover exactly
      the same ground and there is nothing left for a seam to appear at.
      **ALL the segments, `nofloor` included, and that is the correction worth keeping.** The
      recorded desk research said to use the three `nofloor:true` entries because they are the
      courtyard, the annex and the SE court. That was built and RENDERED and it is visibly wrong:
      the annex is 957 wide against the courtyard's 1885, so tan voxel floor stayed either side of
      it (`m1-annex-fix.png`). `nofloor` means "my parent already floored this, do not draw it
      twice", not "there is no floor here" — and the parent is the one entry that reaches the
      annex. The desk research was right about the arithmetic and wrong about the conclusion.
      Cells sit on ONE lattice keyed off (westX, northZ) and are deduped, so **every tile the old
      rect laid keeps its exact position and quarter-turn** and the plaza is unchanged — checked
      against the baseline shot, not assumed (`m1-hub-base.png` vs `m1-hub-after.png`).
      *A probe worth reusing:* which pixels are 3D floor was argued three ways off one screenshot
      and settled in one render by tinting the pave material `#ff00ff` (`m1-pave-probe.png`). The
      tan quads that survived turned out to be the annex's raised DAISES — voxel `plat` obstacles,
      h 20 — standing correctly on the new cobbles, not unpaved ground. Rendered at gameplay range
      with the Abyssal Descent dais, its monolith, columns and torch all composited right
      (`m1-dais-after.png`), against `?world3d=0` at the identical camera (`m1-dais-voxel.png`).
      Counts move exactly as designed: `pave 273 → 399`, new `paveSegs 4`, nothing else in the hub
      moves. Outskirts identical to the recorded baseline (1257 floor, 115 road, 2194 deco, 277
      box, 118 trees, 24 lanterns, 1624 corn, 9 standstone, 142 skipped, 41 draw calls).
      NEXT for this item: the four activity PADS are drawn by nobody — see the item below, which
      the A/B for this one turned up.)*
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
- [x] **The SPARRING ROOM has now been photographed, and it is CLEAN.** Done 2026-08-02 (worker B).
      It was the last hub sub-area nobody had ever rendered — the practice hall: a sunken boxing
      ring with red/blue rope rails on gold-capped corner posts, a two-tier spectator bowl, corner
      braziers, a canvas mat, wall banners, the control post and the return door. All of it
      composites correctly over the 3D layer (`_shot/out/b6-spar-scene.png`, `b6-spar-scene2.png`),
      and matches `?world3d=0` (`b6-spar-voxel.png`).
      It renders clean for a reason worth knowing: world3d builds *nothing at all* here. Measured,
      not assumed — `__world3dPoses('')` returns `[]` and `__world3d().counts` is exactly
      `{hub:true}`. `G.sparringRoom` sets `G.hub`, so `buildWorld` takes the hub branch, and
      `buildHub` is hard-authored to the Waystation's own geometry and lays nothing in a room that
      is not it. Nothing 3D covers anything, so every voxel object survives. **That also means the
      room gets no 3D conversion at all** — if the hub ever gains one, this room needs its own
      answer rather than the Waystation's.
      **`--scene spar` is how you get there** (added the same run). It needed a destination because
      there is no way in from outside: `enterSparringRoom` is a plain top-level function and is NOT
      on `window.__BF3`, so no `--pre` can call it. The way in is the game's own door — `G.hubNpcs`
      carries `{id:'sparring', open:()=>…}`. The `at →` line learned to say `Sparring Room [SPAR]`,
      because with no `areaName` it printed `? [hub]`, which in a log is indistinguishable from the
      Waystation — the one thing that line exists to prevent.
      **THE NEAR-MISS IS THE LESSON, and it is the one this file keeps re-learning.** The first
      attempt used a hand-rolled `--pre` + `--ready` instead of a destination, and handed back a
      featureless brown plane with the banners floating over it and no ring at all. It was
      completely plausible: it looked exactly like the Waystation paint-out bug, in a room where
      that bug would have made sense, and the `?world3d=0` twin obligingly showed a perfect ring for
      the comparison. It had a written-up backlog entry with a suspect named before `--scene spar`
      rendered the same room twice, correctly, and did not reproduce it once. **A hand-rolled
      run-up is not a destination.** If you find yourself writing `--pre` and `--ready` by hand to
      reach somewhere, add the destination first and find the bug second.
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
      progress 2026-08-01 (c): the SOUTH SHELL is done — the SE court and the activity annex have
      real walls now. buildHub no longer guesses the perimeter from gate positions; it reads the
      game's own `kind:'rampart'` collision boxes (tagged at the source in `enterWaystation`) and
      lays a wall run on each, so a wall cannot exist in collision without existing in 3D. That
      picked up the six the old hard-coded pair missed: both south wings, both annex dividers and
      the annex back wall. 6 north cells + 55 derived = the 61 reported, every box accounted for.
      Voxel perimeter slabs stop drawing once the shell is up (they are 300 tall against a 150-tall
      rampart, so the top half stood above the stonework as a flat band).
      Three things MEASURING caught that reading would not have:
      - castle/wall's footprint is a full unit CUBE — a piece is as deep as it is long. Centred on
        a 26-unit collision sheet the south wing spread stone from z 432 to 536 and swallowed the
        Postings board at 445 whole; it simply stopped existing. Runs are pushed outward until
        their INNER face lands on the collision line. `__world3dProps` / `__world3dBoxes` are new
        and are how this was found — use them before trusting a placement coordinate.
      - the market row ran a flat five deep down both sides of a courtyard 200 units shallower on
        the west, so the last west cart stood inside the south wall and the last west hedge outside
        the hub entirely. It now stops at whatever wall is actually behind that column.
      - the paving stopped at the nominal courtyard depth rather than where the side walls really
        run, so the Mirror had its heels on 3D stone and its toes on voxel floor.
      NEXT for this item: the annex FLOOR is still voxel, and deliberately so — its activity plazas
      are painted as sub-3-unit deco which the 3D pass drops, so paving over them would delete the
      violet Abyss, gold Sprint and crimson Arena pads outright. Doing it properly means tagging
      those pads so they survive the drop, THEN paving. There is also a visible seam where the
      paving ends at z 707.
      DESK RESEARCH ONLY, 2026-08-01 (d) — read off the source in a session that could not run
      `node`, so NONE of it is rendered proof. Probe each claim before building on it; it is here
      so the next run starts from coordinates instead of re-deriving them.
      - The claim above that the pads are dropped by the ≤3-unit rule looks WRONG. The rule is
        `(d.y0||0)+(d.h||0)<=3` (index.html:12043) and the pads are pushed `y0:2, h:1.6` = 3.6
        (index.html:10193), so they should already survive. `h` is not touched by the space pass.
        If that holds, paving the annex needs no tagging at all — check it first, because it turns
        this from a two-part job into a one-part one.
      - The z-707 seam is `paveSouth` (world3d.js:889) = max(southZ, sideEnd[westX], sideEnd[eastX]).
        The east wall runs z 49→64 with d 988→1284 after the pass, so sideEnd[eastX] ≈ 706. Nothing
        south of that is paved, which is the whole annex.
      - Paving is currently ONE rectangle over westX..eastX, so it also over-paves: the west south
        wall is at z≈484 but the west column is paved to 706, i.e. ~220 units of stone outside the
        hub on that side. A rect cannot describe this floor plan.
      - The honest source for the SHAPE is `G.segments`: the three `nofloor:true` entries are the
        courtyard, the SE court and the annex, and the space pass DOES scale segments. Use those,
        not `G.rooms` — rooms are NOT scaled by the pass, so their coordinates are stale.
      WARNING, cost that run ~30 minutes: a second autopilot process was running in THIS checkout
      at the same time. Its killed-run guard cannot tell live work from wreckage, so it reverted
      world3d.js out from under a verified edit and committed the other half alone — leaving HEAD
      with the voxel walls suppressed and no 3D shell to replace them. Commit early and often here.
      APPEARS FIXED as of 2026-08-01: `autopilot-b.ps1` now sets `$repo` to
      `_automation\bladefall-wt-b`, a separate worktree, so the two runners no longer share a
      working tree. Read from the runner, not observed — if you see a tree go dirty under you,
      that assumption is wrong.)
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
        *(follow-up 2026-08-01, same worker: THE HUB'S PLAZA BONFIRE now casts onto the SAME
        obelisk, and it is the same object in everything but where it comes from — "your bonfire,
        at plaza centre, touch it to heal and take stock", drawn as a stepped plinth under a tall
        square shaft with a gold capstone and a column of light, which is the quest waystone's art
        almost box for box. It became worth doing the moment the Waystation defer fix landed: with
        world3d's substitute tower gone, the plaza's focal point was the least 3D thing in an
        otherwise 3D hub.
        The one new piece of plumbing is `HUB_STONE` / `world.hubStone`. Every other object prop3d
        casts arrives as a game object; this one is hand-placed inside drawWaystation, so there was
        nothing to hand over. The two share ONE actor and can never coexist — a zone waystone and a
        hub bonfire are never both live — so the hub centrepiece costs no extra model and no extra
        download.
        Fixed on the way: `clearProps()` cleared `_wayRec` but left `_wayBox` standing, and
        `_wayBox` is what `waystoneDrawn()` tests. So on the first frame of a new level the game
        skipped the voxel stone while prop3d had not rebuilt the actor yet — one frame with the
        landmark drawn by nobody. Same rule as `_box` and `_keyBox`.
        Verified: the plaza obelisk with its capstone on the apex, light column and motes
        (`_shot/out/b-hubstone-obelisk.png`) where the same camera showed a grey voxel box
        (`b-hubstone-fixed2.png`); `?world3d=0` still draws the full voxel stone in its fountain
        (`b-hubstone-w3doff.png`) and so does first-person (`b-hubstone-fps.png`); a zone still
        reports `waystone:1` with the same fitted box, and its frames are pixel-identical with
        `?prop3d=0`.)*
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
- [x] **The Grand Colonnade had no colonnade in it.** Done 2026-08-02 (worker B), after re-checking
      the bottom of this backlog and finding every item there still blocked (see "Notes / open
      decisions"). Found by measuring instead of browsing: an `--eval` that walks all eight zones,
      groups `G.deco` by `kind|size|colour|y0|theme` and prints the commonest signatures. The
      Sunspire Palace came back **deco 83, box 83** — every single deco entry in the zone untagged,
      in the one zone named after its architecture. Its two colonnades were 18 grey boxes:
      - the Grand Processional's 8 columns, built by a `col()` helper as a 34-wide voxel SHAFT with
        a 58x18x58 gold capital perched on top — the tree's exact shape, so the lead deco is the
        CAPITAL and its `y0` is the top of the shaft. Tagged `kind:'column'`/`lead:true`/`pillarH`,
        which world3d subtracts the way it subtracts `trunkH`, and the shaft carries `pillarCol` so
        the collision stays while the redundant voxel box is skipped (the obstacle guard now reads
        `treeCol || pillarCol`).
      - the Hall of Statues' 10 free-standing marble shafts, which are base-anchored already and
        only needed the tag.
      **`kind:'column'` is its own bin and its own PROP_SET rather than reusing `pillar`, and the
      reason is the whole point of the item.** `pillar` splits across three variants, which is right
      for its only other user (the hub's rampart dividers) and wrong for a ROW: a colonnade is a
      repeated column, and variety in one reads as damage. Both rejects were RENDERED before being
      dropped — `props/pillar-obelisk` is a monument with a pointed top and stood in the row like a
      spire left in the aisle (`_shot/out/b7-colonnade-3d.png`); `props/pillar-large` is TERRACOTTA
      with a ball capital, which is the kit's own artwork and not a missing texture, and three of
      them among five grey ones read as a half-repainted arcade in a level whose own script line is
      "white marble, untouched" (`b7-colonnade-fix.png`). The set is `props/pillar-square` alone.
      Verified: the processional row at gameplay range (`b7-colonnade-fix2.png` — eighteen columns
      with moulded bases and capitals, the Hall's gold abaci sitting on their shafts beyond) against
      the same camera before (`b7-palace-before.png`, grey slabs). Poses measured, not eyeballed:
      all 18 report their base at the floor they stand on (8 at y 0, 10 at y 100 on the terrace) and
      191/150 tall against the 198/150 the level builds. `?world3d=0` unchanged — 8 voxel shafts and
      their gold capitals, `pillarCol` obstacles still drawn (`b7-colonnade-voxel.png`). Counts move
      exactly as designed: `column 18`, `box 83 → 65`, `drawCalls 3 → 4`. Outskirts identical to the
      recorded baseline (1257 floor, 115 road, 2194 deco, 277 box, 118 trees, 24 lanterns, 1624
      corn, 9 standstone, 142 skipped, 41 draw calls, `b7-reg-outskirts.png`) and the Waystation is
      unchanged (273 paving, 4 buildings, 8 gatehouses, 26 wall, 9 tower, `b7-reg-hub.png`).
      Also fixed here because the new set made it reachable: `ensureProps` de-dupes its name list.
      Two sets may name the same model on purpose, and `Promise.all` fires them all before any of
      them reaches `_propCache`, so a shared name was fetched and parsed twice.
      *A harness fact worth keeping, measured rather than assumed:* **zone 6 kills an idle hero, so
      a slow shot there photographs the death screen.** Two runs came back "YOU FELL · Slain by the
      Fall" and one printed READY NEVER CAME. Traced the hero at 2Hz for 35s: it stands at
      (0, 0, 300) on full HP for ~19 seconds and then loses 16 HP at a time while drifting +z — that
      is the Sun Court's ranged `sunpriest` chipping a level-1 warrior from across the room, not a
      hole in the floor (`floorAt` is 0 under the spawn and the hero never leaves it). Not a bug.
      Shots there pass a `--pre` that keeps `p.invuln` topped up; the default `--scene 6` is fine
      only because it resolves in ~5s.
      *Left for whoever takes the next zone:* the same probe says Hollow Pass, the Ruined Keep,
      Frostfell, Emberdeep, the Abyss and Castle Duskmoor are ALSO 100% untagged box (62–145 deco
      each — these zones are built mostly out of `G.obstacles`, so there is far less to convert than
      the Outskirts' 2194). The two that look worth a look are the Keep's 4 banners (`18x80x8`
      `#702c45`, and `town/banner-red` is already loaded) and the palace's own area 1, whose Citrus
      Arcade is 18 green `70x55x70` bushes each with an orange fruit ball on top.
- [x] **Every tree, flower and rock in the game was drawing HALF of itself.** Found and fixed
      2026-08-02 (worker B). `loadProp` kept only the FIRST mesh it found in a glTF
      (`traverse(o => { if(!mesh && o.isMesh) mesh = o; })`), and a Nature Kit tree is TWO meshes —
      a trunk and a canopy, each with its own material. So every tree rendered as one or the other:
      models whose first primitive is the canopy became a **teal blob floating over bare ground**,
      models whose first primitive is the trunk became a **bare brown post with no leaves**. The
      Outskirts was a field of both (`_shot/out/b6-outskirts-tree.png`) where it should be a grove.
      **The file already knew this trap and had never carried it back.** The road-tile loader two
      functions below `loadProp` exists for exactly this reason and its own comment says so — "a
      road tile therefore renders as a single stripe of dirtDark with no grass and no track: not a
      missing asset, not a missing texture, just two thirds of the model quietly dropped". Same
      sentence, same function, every prop in the game.
      Measured, not guessed: `__world3d().counts.multiPart` is new and lists every loaded model made
      of more than one primitive — i.e. exactly the ones that were drawing as a fraction of
      themselves. In the Outskirts that is **29 models: all 12 trees, all 6 flowers, all 10 rocks,
      the town fountain and the town cart.**
      Fix: `loadProp` now keeps every primitive in `subs` with the WHOLE model's `fullHeight` /
      `fullWidth`, and `buildProps` makes one InstancedMesh per primitive driven by the same
      matrices — separate meshes rather than a merged geometry because a trunk and a canopy are
      different materials, and merging without baking vertex colours paints the tree one of the two.
      **The legacy `geo`/`mat`/`height`/`width` are deliberately UNTOUCHED.** The ground pass, the
      road pass and the hub assembler all size themselves off those, against values Oliver's renders
      were tuned to; re-measuring them in this commit is the thing VISION.md warns about. Only
      `buildProps` — the deco props — reads the new fields. For a single-mesh prop the two are
      identical, so nothing else moves.
      Also fixed here, because it made the probe lie: `buildProps` labelled its meshes `names[i]`
      while bucketing by a FILTERED `recs`, so once any model in a set failed to load, every mesh
      after it was named after the wrong model — and `__world3dPoses`, whose entire job is to answer
      "which model ended up here", reported that wrong name back. Kept as name+rec pairs now.
      Verified by render, everywhere trees live: the Outskirts (`b6-outskirts-tree.png` floating
      blobs and bare posts → `b6-outskirts-tree-fix.png`, a grove the hero stands inside), Black
      Woods (`b6-blackwoods.png`, 110 trees, real trunks) and the Thornwood (`b6-thorn.png`, 80
      trees). Counts identical to the recorded Outskirts baseline — 1257 floor, 115 road, 118 trees,
      24 lanterns, 1624 corn, 9 standstone — and the Waystation is unchanged (273 paving, 4
      buildings, 8 gatehouses, `b6-hub-reg.png`). `?world3d=0` is untouched (`b6-outskirts-voxel.png`).
      *One number to know:* Outskirts draw calls **22 → 41**, because a two-part model is two
      InstancedMeshes. Forty-one instanced draws is nothing for a phone, but it is the cost and it
      is real; if it ever matters, merging with baked vertex colours is the lever.
      *Left alone on purpose:* the HUB assembler and the ground/road passes still take the first
      primitive only, so `town/fountain-round` and `town/cart` are still half-drawn in the
      Waystation. That is unchanged behaviour, not a new regression, and the hub is the top backlog
      item somebody else is holding — one worker in the hub assembler at a time.
- [x] **The Brute's arena had the only untagged tree left in the game.** Found and fixed 2026-08-02
      (worker B) — it is what led to the loader bug above. The Trampled Field's gore-marked tree is
      hand-built rather than emitted by a `tree()` helper: `vcol(-230,-190,26,26,90)` with a green
      canopy box perched on it, and neither half was tagged. It drew as a grey slab with a flat
      green box floating over it (`b6-brute-tree.png`), in the one arena where it is the ONLY
      landmark and the first boss every player meets. Tagged `treeCol` on the column and
      `kind:'tree'`/`lead:true`/`trunkH:90` on the canopy, exactly like the Outskirts' own `tree()`.
      Verified: `b6-brute-fixed.png` — a real pine standing where the same camera had shown nothing.
      *The gore mark was moved onto the 3D trunk and then moved BACK*, which is the lesson worth
      keeping: the 3D pine's trunk is ~5 units wide and the voxel one is 26, so there is no single z
      that sits on both. Nudging it to the 3D trunk buried it inside the voxel trunk
      (`b6-brute-canopy-vox.png`). It keeps its own tuned spot.
      *Checked and NOT touched:* `SCAPES.outskirts` (index.html:4345) has a third `tree()` whose
      `vcol` also lacks `treeCol` — but `SCAPES` is only reached when `EXPANDED_SCAPES[zone.id]` is
      missing and EXPANDED has all eight ids, so it cannot run and cannot be rendered. Same call the
      last worker made, re-confirmed by probing Black Woods' obstacles live (every column near the
      hero reports `treeCol:true`).
- [x] **All seven unphotographed BOSS ARENAS are now audited.** Done 2026-08-02 (worker B). Only the
      Brute's had ever been in front of a camera; `BOSS_ARENAS` is one hand-authored arena per zone
      and the other seven — Hollow Marksman, The Fallen, Frost Sorcerer, Ember Colossus, Abyss King,
      Marble Colossus, Void Tyrant — had never been rendered in 3D. Shot every one
      (`_shot/out/b6-boss1.png` … `b6-boss7.png`, plus `?world3d=0` twins for frost and ember).
      **All seven composite correctly and none needs a fix** — cover pillars, cell bars, crumbling
      rims, thrones, dome rings, banner pylons and crowned monoliths are all present and correctly
      depth-sorted, because the deferred-entity, obstacle, wall and crumble passes already cover
      them. The one real bug the audit turned up was the Brute's tree, above.
      *Not audited and deliberately so:* each zone's AREA 1. `EXPANDED_SCAPES` is keyed by ZONE, not
      area, so a zone's second area is the same hand-authored scape with a different rng seed — a
      render of it says nothing a render of area 0 has not already said.
      *Two things queued for Oliver, both art calls, neither a bug:* `bossFinish` builds a shared
      outer frame for every arena — 12 crowned monoliths, 16 border slabs, 24 rune-rim tiles — and
      all of it is plain boxes in 3D. Casting the monoliths onto `props/pillar-obelisk` or
      `nature/rock_tall` is the warm-brown-rock substitution rejected twice already: the models are
      pale blue-grey and warm brown, `instanceColor` multiplies, and no multiple of either is the
      volcano arena's tint. And the Warden's Yard names its two cover slabs "the old keepers'
      sarcophagi", for which `props/coffin` and `props/coffin-old` exist and would be a literal
      rather than invented cast — worth one line from Oliver either way.
- [x] **Every 3D tree in the game was hanging in the air.** Found and fixed 2026-08-02 (worker B),
      by measuring rather than looking: `__world3dPoses('tree')` put the Outskirts' 118 trees at
      y 98–108 with `__BF3.floorAt()` reporting 0 under them, fitted height 163.
      A prop is placed at its deco's `y0`, and for every other kind of deco `y0` IS the object's
      base. A tree is the exception, and the generator says so plainly: it emits a voxel trunk
      COLUMN and perches a canopy box on top, and the lead deco — the one carrying `kind:'tree'` —
      is the CANOPY. So `y0` was the top of the trunk, and the whole model hung from there. The
      trunk world3d skips because it "draws the real tree" (`ob.treeCol`) is exactly the gap that
      was left. `bins.tree` now places at `y0 - trunkH`; trees with no trunkH (the theme-fallback
      border scenery, whose `y0` is already its base) are untouched.
      **Why it survived every earlier render:** a floating tree is not a broken-looking tree. It is
      a correct pine at the correct size in the correct place in X and Z, ~100 units too high, and
      at the distance a zone screenshot puts them that reads as "trees on a rise". It was found by
      asking a number for the answer instead of a picture — which is why the probe went in first.
      Verified: same camera before (`_shot/out/b4-float-before.png`, olive scenery boxes and trunks
      cut off in mid-air) and after (`b4-float-after.png`, conifers standing on the terrain with
      their trunks meeting the ground); poses now report `y: 0` for every tree over a floor of 0.
      Outskirts baseline otherwise identical: 1257 floor, 115 road, 2194 deco, 277 box.
- [x] **The class trial was standing on a lawn.** Found and fixed 2026-08-02 (worker B) in the
      first minute a room dungeon had ever been photographed — it is the thing `--scene trial` was
      built to find, and it is the FIRST level every new player sees, before the hub.
      A trial runs the shared maze, but it borrows `STAGES[].theme` from the zone it was started
      FROM (`startTrial` builds `newG` with `zone: fromZone||0`). So the Trial of the Blade reported
      theme `plains`, and `THEME_GROUND.plains` is `nature/ground_grass` — flat teal — laid wall to
      wall inside the walled chamber the game's own tutorial card calls "this sealed chamber".
      Measured before touching anything, same camera both ways: the game paints that floor
      `s.ground = #8a8445`, a khaki stone (`_shot/out/b5-door-voxel.png`), and the 3D layer painted
      it teal (`b5-door-3d.png`). **The two renderers disagreed about what the ground IS**, which is
      a conversion bug rather than a look, and the level's own colour settles it without anyone
      inventing art: interior `village/Floor_Brick` tinted with the ground colour the game already
      declares, so a trial in ANY zone lands on that zone's own stone automatically.
      Done in `groundSpecFor()`, which the file already calls the one place that decides a level's
      surface, so the floor pass and the road pass cannot disagree. `__BF_WORLD()` now reports
      `trial`.
      Verified: `b5-trial-stone.png` (khaki flagstone matching the walls, closed door and control
      chest intact) against `b5-door-3d.png` (teal). Regression clean and this matters, because
      `groundSpecFor` decides the ground for EVERY level: the Outskirts is identical to its recorded
      baseline (1257 floor, 115 road, 118 trees, 24 lanterns, 1624 corn, 9 standstone, 277 box, 2194
      deco, 18 creatures, 7 chests, 22 draw calls, `b5-reg-outskirts.png`), the Waystation is
      unchanged (273 paving, 4 buildings, 8 gatehouses, `b5-reg-hub.png`) and the trial's
      `?world3d=0` path is untouched (`b5-trial-voxel-after.png`).
      *Scoped to `G.trial` on purpose:* the maze also serves boss/mini stages with `G.area >= 0`,
      which the harness still cannot reach — changing what cannot be rendered is what this file
      keeps warning against.
      *(follow-up, same run: FIRST-PERSON IN A ROOM DUNGEON IS CLEAN, and it was worth checking
      rather than assuming, because a room dungeon is where the objects this file keeps losing all
      live at once. `camMode='fps'` means the 3D layer sits the frame out and every `deferOn()`
      no-ops, so walls, doors, torches and chests fall back to the voxel pass — and all of them are
      there: the sconce with its flame, the maze walls, the closed door's jambs and lintel, the
      voxel chest and a keeper (`_shot/out/b5-trial-fps.png`). Nothing is drawn by nobody, which is
      the failure mode that has cost three sessions.)*
- [ ] **The seven hidden SIDE areas had never been looked at in 3D.** They are the class-unlock
      trials' home zones — the Thornwood, the Sunken Wash, the Oubliette, the Glacier Vault, the
      Magma Core, the Reaper's Gate, the Sealed Reliquary — each its own hand-authored
      `SIDE_SCAPES` entry, so nothing a `--scene <n>` render shows says anything about them. They
      were unreachable from the harness until `--scene side<N>` went in the same day.
      *(progress 2026-08-02 worker B: THE THORNWOOD IS DONE, 1 of 7. Its 52 trees are built by a
      `tree()` helper that was never tagged, and all three consequences were visible at once:
      no `trunkH`, so world3d fitted a pine to the 46-unit canopy box alone — a third size; the
      model hung at the top of the trunk like every other tree until the fix above; and no
      `treeCol` on the trunk COLUMN, so since obstacles started drawing (`G.obstacles` deferred,
      two commits earlier) the voxel trunk drew as well. The result was a wood of bare 26-wide dark
      slabs with small pines floating over them, where the voxel renderer draws a forest.
      Tagged `kind:'tree'`/`lead:true`/`trunkH` + `treeCol`, exactly like the Outskirts' tree().
      Verified: `b4-thorn-3d.png` (before, columns) vs `b4-thorn-fixed.png` (after, conifers on
      the ground, root platforms and the violet-capped cathedral pillars unchanged); poses report
      `y` 0–9 over their own floor; `?world3d=0` byte-for-behaviour identical to the pre-change
      reference (`b4-thorn-voxel.png` vs `b4-thorn-voxel-after.png`, 52 treeCols still drawn).)*
      *(progress 2026-08-02 worker B, second run: THE OTHER SIX ARE NOW AUDITED — the item is
      photographed end to end, 7 of 7. `side1` Sunken Wash, `side2` Oubliette, `side3` Glacier
      Vault, `side4` Magma Core, `side5` Reaper's Gate, `side6` Sealed Reliquary
      (`_shot/out/b5-side1.png` … `b5-side6.png`). **All six render correctly and none needs a
      Thornwood-style fix** — the earlier deferred-entity, obstacle, wall and crumble passes already
      cover them, and that is a real finding rather than a shrug: the six were the largest body of
      unlooked-at level in the game. Checked live per area, not by eye alone — obstacle bodies,
      walls, crumbles, movers, deco counts and draw calls. The Glacier Vault's thermal pylons were
      the one thing that read as floating caps from the entrance and are not: photographed at
      gameplay range (`b5-s3-pylon.png`) they stand on their columns.
      Why there is no conversion work here and it is not laziness: unlike the Thornwood these six
      are interiors, and every repeated object in them (cell bars, bone spires, ice blocks, crystal
      spires, display cases, water sheets) is a thin coloured box the repo has no matching asset
      for. Casting bone spires onto `nature/rock_tall` is the warm-brown-rock substitution already
      rejected twice — an art call, so it stays boxes.
      **ONE REAL BUG FOUND, and it needs Oliver because the repair is level design, not code.**
      The Magma Core's six ore lifts — the "rising chain of ore lifts opens into a suspended
      refinery" its own source comment describes — are DEAD DATA. index.html:5280 pushes them with a
      completely different property set from the other twenty-odd `G.movers.push` sites in the file:
      `{x, y0, axis, range, speed, phase, c}` where `updateMovers` reads `{x0, amp, sp, ph}` and
      everything else reads `h`. Measured live, not inferred: every one reports `x: NaN` and no `h`,
      so they draw at NaN (invisible) and `floorAt`'s `mv.h<=yRef+2` is false against undefined, so
      you cannot stand on one. Not a softlock — the `climbRun` beside them is the real route.
      **Fixing the shape alone is worthless, which is why this is queued and not shipped.** All six
      sit inside the footprint of `vplat(500,-1740,150,850,720)`, the refinery deck, at heights
      55–155 under its top of 150 — and a `plat` obstacle draws as a SOLID block from the ground up
      (index.html:12147), so a correctly-built lift there is sealed in stone. Proved by injecting
      six correctly-shaped movers at those exact coordinates with a control chest: the chest
      rendered, the lifts did not (`b5-s4-probe.png`). Making them real means re-siting the chain
      into the approach, which is authoring a platforming beat. The same deck-over-chain overlap
      exists in the Reaper's Gate and the Reliquary, whose movers ARE correctly shaped.)*
      *Dead code found on the way, deliberately NOT touched:* `SCAPES.outskirts` (index.html) has a
      third, untagged `tree()` of the same shape. `SCAPES` is only reached when
      `EXPANDED_SCAPES[zone.id]` is missing and EXPANDED has all eight zone ids, so it cannot run
      and cannot be rendered — tagging it would be an unverifiable change.
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
- [x] **The Outskirts' roadside lanterns are real lightposts.** Done 2026-08-02 (worker B), after
      re-checking the bottom of this backlog and finding every item there genuinely blocked (see
      the note under "Notes / open decisions"). Tagged at the SOURCE like the trees: the Outskirts'
      `trail()` helper drops a lantern every fourth step of the golden path, and those two boxes —
      a `7x38x7` wooden post carrying a `12x9x12` lit head — were the only man-made object standing
      beside the road for the whole zone. `kind:'lantern'` with `lead:true` on the post (carrying
      `lampH:47`, post + head, so the model is as tall as the object the level actually built) and
      `lead:false` on the head, so one lantern becomes one model instead of a lamp with a gold cube
      floating inside it. world3d reuses `props/lightpost-single` — the same model the hub lines
      its approach with, already in the load list, so this costs no download.
      ONE THING WORTH KEEPING, and it is the mimic's width lesson again in a new place:
      **`buildProps` fits by whichever of height or width binds first, and that is wrong whenever
      the voxel box is a thin CORE rather than an outline.** A lightpost fitted into 7 units of
      width is a bollard a tenth of its stated height. The hub had already met this and solved it
      privately (`92 / rec.height`); `buildProps` now takes a `fitH` flag so that rule is reusable
      instead of copied. Default behaviour is unchanged — a tree's deco box IS its footprint.
      Verified: the lightpost standing beside the road at gameplay distance
      (`_shot/out/b2-lantern-3d.png`) where the same camera with `?world3d=0` still draws the
      brown voxel post and its gold head (`b2-lantern-voxel.png`). Counts move exactly as designed
      — `lantern 24`, `box 1146 → 1098` (the 48 boxes leaving), `skipped 118 → 142` (the 24 heads),
      `drawCalls 21 → 22`. Rest of the Outskirts baseline unchanged: 1257 floor, 115 road, 118
      trees, no errors.
      *One for Oliver's eye, not a bug:* the kit lightpost is GREEN where the voxel post was wood
      brown. It is the same green as the hub's lanterns, which is the point — the two lamps in the
      game now match each other — but it no longer matches the box it replaced. A tint is one line.
      *Correction 2026-08-02 (worker B), and the reason the note below exists:* "the 812 corn
      stalks already get a real grass model each" was WRONG, and it was wrong because it was read
      off the classifier instead of off a render. See the next item.
- [x] **The West Cornlands and the Dreaming Expanse had no corn in them.** Done 2026-08-02
      (worker B). Both fields are built by one helper, `field()` in the Outskirts generator, and one
      CORN PLANT is two deco boxes: a `4x24..34x4` golden stalk and a `9x3x3` green leaf nub pinned
      halfway up it. Untagged, world3d's plains rules claimed each half separately and got BOTH
      wrong:
      - the stalk is theme `plains`, y0 0 and under 60 tall, so the ground-tuft rule made it
        foliage — and `buildProps` fits by whichever of height or width binds first, so a grass
        model fitted into 4 units of WIDTH came out a ~3-unit speck. This is the lantern/mimic
        lesson for the third time: **the default fit is wrong whenever the deco box is a thin CORE
        rather than the object's outline.**
      - the leaf is pinned to `y0:12`, and an explicit base height reads as STRUCTURE, so it stayed
        a raw green brick floating at knee height.
      812 plants, so both fields rendered as a grid of green blocks on bare ground. Measured before
      touching anything, same camera both ways: `?world3d=0` is a dense golden field you walk
      through (`_shot/out/b3-corn-voxel.png`); the default was floating bricks
      (`b3-corn-3d.png`). `kind:'corn'` with `lead:true`/`cropH` on the stalk now tags the plant at
      the source, exactly like the roadside lanterns.
      **The cast onto real models was BUILT, RENDERED AND REJECTED, and that is the part worth
      keeping.** Standing the stalks up as tall grass (`PROP_SETS.grass`, height-only fit) works
      geometrically — the plants are the right size and the bricks are gone — but a prop carries
      its own texture, so 812 golden stalks came out a solid TEAL thicket and the West Cornlands
      read as jungle (`b3-corn-fix1.png`). `instanceColor` cannot rescue it: it MULTIPLIES, and no
      multiple of teal is gold. The repo has no wheat or corn asset in any kit.
      So the corn stays the level's own geometry, drawn as real LIT boxes — which is what a 4x30
      golden stalk already is. Same field as the voxel renderer, now taking light, and the leaf nub
      kept because it is what gives the rows texture at eye level. A real crop model from Oliver
      would beat this; until then honest beats ambitious.
      Verified: the West Cornlands at gameplay distance (`b3-corn-fix2.png` vs `b3-corn-voxel.png`),
      the Dreaming Expanse field with the road cutting through it (`b3-dream-after.png`), the corn
      now legible from the zone entrance (`b3-entrance-after.png`), and `?world3d=0` unchanged
      (`b3-corn-voxel-after.png`). Counts move exactly as designed — `corn 1624`, `foliage 812 → 0`,
      `box 1098 → 286`, `skipped 142` (unchanged: nothing is dropped). **Draw calls went DOWN, 22 →
      19**, because four grass InstancedMeshes became one box mesh. Rest of the Outskirts baseline
      identical: 1257 floor, 115 road, 118 trees, 24 lanterns, 2194 deco, 18 creatures, 7 chests.
- [x] **EVERY STATIC PLATFORM AND COVER COLUMN IN THE GAME WAS BEING PAINTED OUT.** Found and fixed
      2026-08-02 (worker B), while checking why the Outskirts' final landmark looked wrong. This is
      the crumbling-stepping-stone finding one list further on, and it is the biggest instance of
      the compositing bug left: `vplat()` and `vcol()` push to **`G.obstacles`**, and world3d reads
      only `G.deco` and `G.segments`. Obstacles are in NEITHER, so nothing 3D draws a platform, they
      were drawn inline, and the 3D ground painted them out.
      Measured at the Old Waystone Crown, which is three stacked platforms (55/110/165) under the
      waystone beacon: `?world3d=0` is a clear three-tier knoll with the chest up on the second
      step (`_shot/out/b3-henge-voxel.png`); the same camera with the 3D world on was a flat field
      with a ring of stones standing on nothing (`b3-henge-fix.png`). The Ruined Keep is the same
      story less obviously — its 41 platforms kept their dark bodies and lost their lit top faces,
      so a terraced hall read as a flat floor with black blocks on it (`b3-z2.png` vs
      `b3-z2-obs.png`, where the steps are legible again).
      The obstacle pass now runs in a defer window. Tree-trunk columns are still skipped outright
      before it (`ob.treeCol && _w3dOn`), because world3d really does stand a tree there — that is
      the one obstacle it replaces.
      Verified: the knoll back in 3D at its reference shape (`b3-knoll-fixed.png` vs
      `b3-henge-voxel.png`); the Ruined Keep terraces (`b3-z2-obs.png`); the Waystation, where the
      four capped plaza columns are back on the cobbles and nothing is doubled (`b3-hub-after.png`,
      against `b3-hub-w3doff.png`); first-person unchanged and still drawing the full voxel hub
      (`b3-hub-fps.png`); pure voxel `?world3d=0&hero3d=0` unchanged with all nine stones correctly
      depth-sorted (`b3-henge-purevoxel.png`). Outskirts baseline identical: 1257 floor, 115 road,
      118 trees, 24 lanterns, 18 creatures, 7 chests, 22 draw calls.
      *Widens one KNOWN consequence, already recorded below and not introduced here:* with
      `?world3d=0` AND the 3D hero on, `flushHero3D` still clears the depth buffer, so the deferred
      replay tests against a buffer holding only the hero. Platforms now join the chests, plates and
      crumbles in drawing over the voxel world on that one path — at the henge, a tier hides two
      stones it should stand behind (`b3-henge-voxel-after.png`). The default and pure-voxel paths
      both composite correctly; the fix would mean changing `deferArmed()`, which must keep matching
      exactly when `flushHero3D` runs.
- [x] **Zone walls and doors were being painted out too.** Done 2026-08-02 (worker B), same run as
      the platforms and found by the same rule: `G.walls` and `G.doors` are two more lists world3d
      does not read, so in a zone nothing 3D draws them and the 3D ground covered them.
      **The HUB is deliberately excluded, and that exclusion is the interesting half.** Measured
      before changing anything: the Waystation has 47 walls, 39 of them `invisible` collision-only,
      and the 8 real ones are the perimeter RAMPART — the exact thing world3d's hub build stands a
      `castle/wall` on. Deferred, each would put a 300-tall flat voxel slab in front of its own 3D
      replacement. That is the plaza-tower mistake, so `_wallDefer = !G.hub` and the hub keeps them
      inline, like the eight gate frames. The LATE translucent ghost pass is untouched: a
      camera-blocking wall never reaches the solid pass at all.
      Verified with the injection probe, which is worth reusing: a wall and a CONTROL chest pushed
      into the same frame in front of the hero. Before, neither appeared and that was the harness
      (see below); after the harness fix the chest rendered and the wall did not
      (`_shot/out/b3-harness-check.png`), while `?world3d=0` drew the wall plainly
      (`b3-harness-check-voxel.png`). With the fix in, the wall stands correctly composited with
      the road and terrain intact behind it (`b3-wallfix-3d.png`). Hub re-rendered at the gate row:
      3D cobbles, gatehouses and castle wall, no doubled rampart (`b3-hub-wallfix2.png`).
      *Still not verified, and honestly so:* no ROOM-dungeon area was reached this run. `--scene <n>`
      loads a zone's first scape, `loadArea(i)` does not advance, and the dungeon generators at
      index.html:5461/5688/9612 are where doors actually live. The wall path is proven; the door
      path is the same three lines in the same window and is inferred, not photographed. A harness
      way into a room dungeon is the missing piece.
      *(closed 2026-08-02, worker B, later run: `--scene trial` is that way in — the maze is what a
      CLASS TRIAL loads, because `G.trial` is the flag that skips all four scape dispatches. Doors
      photographed and correct: a closed door in front of the hero draws its jambs, lintel and lock
      stripe over the 3D floor with a control chest beside it (`_shot/out/b5-door-3d.png`), and
      `?world3d=0` is unchanged (`b5-door-voxel.png`). Nothing to fix — the inference was right.)*
- [x] **`--eval` mutations were never in the picture, and it failed silently.** Fixed 2026-08-02
      (worker B) in `harness/shot.js`. There was no render between the EVAL round-trip and
      `Page.captureScreenshot`, and captureScreenshot returns the last composited frame — so the
      standard "push an object in front of the hero and photograph it" probe photographed the frame
      BEFORE the change and handed back a complete, plausible, wrong picture. Pushing a wall and
      finding it absent reads exactly like "the 3D layer paints walls out", which is the conclusion
      it nearly produced. A known-good CONTROL saved it: a chest, which certainly renders, vanished
      from the same frame, and no compositing bug does that.
      `--focus` never hit this because the EVAL round-trip follows it, so a frame lands in the gap
      by luck. The shutter now waits two rAF ticks (the second is what guarantees the frame the
      first drew has been composited), with a 400ms fallback so a throttled tab still returns.
      **Put a control object in any probe of this shape.** The harness lies quietly; a control does
      not.
      **NOT IN THIS COMMIT, and here is where to find it.** `harness/shot.js` had another worker's
      uncommitted `--scene side<N>` work in it at the time, and committing the file would have
      published their in-flight change under this message. `git apply --cached` is not on the
      permission allowlist, so a partial stage was not available either. The fix is IN the working
      tree of both `harness/shot.js` and `_shot/shot.js` — it is the hunk immediately after the
      `EVAL` block, and a copy of the patch is at `_shot/mine.patch`. Whoever commits the
      `--scene side<N>` work will carry it along; if that lands without it, re-apply from there.
      *Two workers really do share this checkout* — check `git status` before `git add`, and always
      add by pathspec.
- [x] **The Old Waystone Crown's nine standing stones are real megaliths.** Done 2026-08-02
      (worker B). The Outskirts' last district and its payoff view was nine grey boxes in a ring.
      Tagged `kind:'standstone'` at the source; world3d stands a `nature/rock_tall{A,B,C}` in each
      slot. New PROP_SET rather than reusing `rock` because the FIT differs, not the models: a henge
      stone's box is 24 wide and 75-99 tall, a thin CORE, and the ordinary rock fit takes the
      narrower of height and width — a 24-unit boulder where the level asked for a megalith. That
      is now the third object to hit this trap (lanterns, corn, stones), so `fitH` is worth reaching
      for whenever the deco box is a core rather than an outline.
      Verified: `b3-henge-fix.png` / `b3-knoll-fixed.png` against `b3-henge-3d.png`; counts
      `standstone 9`, `box 286 → 277`. *One for Oliver's eye, not a bug:* the kit rock is warm brown
      where the voxel stone was blue-grey — same situation as the green lightposts. A tint is one
      line.
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
- **The only question is: does world3d draw a 3D replacement for THIS?** Not "is it world or
  entity", not "do you stand on it", not "is this function architecture". Every one of those
  sounds right and every one of them has now cost a session — the crumbling stepping stones
  (world, and nothing drew them) and then the whole Waystation (`drawWaystation` was deferOff'd as
  "architecture" when it draws the FURNITURE). Answer it per BLOCK, not per function: the hub's
  eight gate frames really are replaced by world3d gatehouses and stay inline, while the gate
  STATE drawn two lines later is not replaced by anything and defers.
- **Its corollary: a 3D replacement that stands where a functional object stands is worse than no
  replacement.** world3d's plaza tower was placed to fill a courtyard the compositing bug had
  emptied, and it landed 17 units from the bonfire you touch to heal. When the deferred pass gave
  the real object back, the stand-in buried it. Check what is already at those coordinates in the
  game's own draw code before adding scenery to a hand-authored space.
- **World stays inline, entities defer.** `drawCourse` is architecture and world3d already draws
  its 3D replacement over it. Plates/keys/chests are objects and were moved into the deferred
  window even though they live inside `drawCourse`.
- **Know which LISTS world3d actually reads: `G.deco` and `G.segments`, and nothing else.** That is
  the whole rule, and it answers the question above mechanically instead of by judgement. Everything
  in any other list — `G.movers`, `G.crumbles`, `G.obstacles`, `G.chests`, `G.keys`, `G.torches`,
  `G.pads` — has no 3D replacement by construction and must defer. Three separate sessions arrived
  at that answer one list at a time by rendering things and finding them missing.
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
- **The bottom three backlog items were re-checked on 2026-08-02 (worker B) and are all genuinely
  blocked** — worth recording so the next B does not re-derive it:
  - *Loot pickups.* Not "pick a model per drop type" — read `weaponMesh` in index.html first. The
    game already draws fourteen HAND-AUTHORED weapon silhouettes (a "cursed greatblade", an
    "executioner's ax", a "necromancer's scythe" built from vertebrae, all out of one deliberate
    bone/rust/blood/black-iron material kit). The weapon kit's `Sword.glb`/`Axe.glb` are generic
    cartoon props, so casting onto them is not a conversion, it is replacing art with worse art.
    Genuinely Oliver's call. The coin case named in the item does not exist: gold is never a world
    object, `awardGold()` credits it directly on kill.
  - *Mobs in 3D.* Re-audited live rather than trusted: `MOB_CAST` has 32 entries and `G.ENEMY` has
    40, and the 8 uncast are exactly the 7 bosses plus `bosscrystal`. Unchanged, still art calls.
  - *Class distinctiveness.* `_balance/` and `_duel/` do not exist in this checkout (the `/_*`
    gitignore rule, and unlike `_shot/` there is no committed source of record), so nothing here
    can measure a win matrix. Blocked on the harnesses before it is blocked on Oliver's sign-off.
- Elemental affixes on **physical** weapon drops (making "a Flaming Sword") is a separate system change — Oliver decides before building.
- Real icon art (class icons, skill/passive icons) is a supervised ChatGPT-in-Chrome pass — autopilot uses placeholders. **Necromancer currently has placeholder icons and needs its own 18-icon pass** — this is BLOCKED on Oliver (needs his ChatGPT tab); do not attempt it autonomously, skip to the next actionable item.
- No dragons in the game, so **no Dragonslayer class.**
