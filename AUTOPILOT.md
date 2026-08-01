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
- [ ] **3D on by default.** Drop the `?hero3d=1&world3d=1` flags so what Oliver shows people is
      what they get. BLOCKED until bloom is resolved — `?nobloom` is still required, because the
      game's PostFX composite paints over the Three.js layer. Fix bloom first, then flip the
      default. Do NOT flip it while nobloom is still needed.
- [ ] **Class distinctiveness pass.** The top design goal. Use `_duel/` to measure, not opinion.
      First finding already on record: ranged beats melee 74%-24%, so melee needs an anti-kite
      answer. Work one class-pair at a time and re-run the matrix after each change.
      NOTE: changing balance numbers needs Oliver's sign-off per docs/VISION.md — prepare the
      change and the measured before/after, then queue it rather than shipping it.
- [ ] **Mobs in 3D.** 27 mob types are cast onto real models in the slice already; port that into
      world3d so levels are populated with real creatures. SkeletonUtils.clone is verified as the
      right technique (32 characters, 32 independent skeletons).
- [ ] **Ground polish.** Real paths where levels have walkways (the Nature Kit has pathStraight/
      Bend/Corner/Cross/Split) and a second grass variant, so a field is not one uniform green.
- [ ] **Zone floors for the other five zones.** Frost, Ember, Abyss, Palace and Castle have no
      ground surface asset yet. Flag to Oliver if a pack is needed rather than faking it.

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
