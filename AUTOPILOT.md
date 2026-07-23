# BLADEFALL Autopilot — operating spec + backlog

You are the BLADEFALL autopilot. Each run is fresh (no memory of prior chats). Follow this file exactly.

## Mission
Keep improving BLADEFALL by working through the backlog below — **on the review branch only**. Oliver playtests the branch preview and merges to main (which deploys live) himself. You never touch the live game.

## Environment
- Game file: `_automation/bladefall/public/3d/index.html` (single-file raw WebGL voxel game). Repo = the `bladefall` git submodule (remote `oliverlynch7/bladefall`).
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
```
curl -s -X POST https://thework.pages.dev/state -H "Content-Type: application/json" \
  -d '{"action":"tgPing","password":"oliverNCA2026","text":"🤖 BLADEFALL autopilot — <what you built>. Playtest: bladefall-autopilot.bladefall.pages.dev — merge to main when happy."}'
```
Keep it to 1–3 sentences, plain English, and always include the playtest URL.

## Naming rule (applies to EVERYTHING new)
Names must be **interesting but understandable by a middle schooler.** No niche/archaic words. Good: "Holy Ground", "Guard Up", "Raise the Dead", "Shadow Step", "Smite". Bad: "Consecrate", "Bulwark", "Bastion", "Excoriate".

## Class design philosophy
Every class is a **variant of one of the 3 cores** (Warrior / Mage / Ranger). Each new class = a CLASS2 tree (rank-1 innate, 1-of-2 choice at ranks 2/4/6/8 = skills and 3/5/7/9 = passives, rank-10 capstone), a `CLASSES` entry (weapon `family`, `attackStyle`), a hidden unlock **trial** (like the Reaper), and combat wiring (`c2Passive(id)` checks + skill FX). Build fully **functional with placeholder icons**; flag the icon list in the digest so Oliver can do the art pass.

---

## Backlog (top = next)

- [x] **Paladin (Warrior variant).** DONE (v1.328) with REAL GPT icon art (18 icons, bg-stripped). Family sword/great/axe/hammer/spellblade; innate Holy Warrior (+12% dmg & 2% heal-on-hit w/ holy weapon); Guardian vs Templar paths; capstone Avatar of Light; Trial of the Paladin at Palace (stage 13). Verified: selectable, family correct, holy innate applies, all 8 skills fire, no errors. (progress: trial-discovery flow untested live; skill FX reuse existing effects.)
- [x] **Necromancer (Mage variant).** DONE (v1.329) — PLACEHOLDER icons (reused mage/reaper art; needs its own 18-icon ChatGPT pass). Built an isolated `G.minions` ally system (spawnMinion/minionUpdate, renders via the Grave Wraith pet model, homes+attacks via hitEnemy, lifespan-expiry). Summon Skeletons + Raise the Dead (consumes a fresh corpse from `G.corpses`, tracked in killEnemy) + Army of the Dead. Summoner (Bone Legion/Master of Death) vs Plague paths; capstone Lich = permanent minions + higher cap. Trial of the Necromancer at Castle Duskmoor (stage 15). Verified: selectable, mage family, summon/raise/army spawn working minions that hit (combo counter ticked), 180 ticks no errors. (progress: needs real icon art + trial-flow playtest.)
- [ ] **Ninja (Ranger variant).** Family = `['dagger','knives','sword']`. Fast melee crit-combo + evasion/stealth. Skills: "Shadow Step" (dash + i-frames), a combo/crit skill, a smoke/vanish. Paths: **Shadow** (evasion, stealth burst) vs **Blade Fury** (crit/combo/speed). Unlock trial in the Hollow.
- [ ] **Holy spellblade variant + affinity icons hook.** Ensure holy magical melee is covered (Lightbringer axe exists; consider a slim holy spellblade too). Make sure `itemStaticAv` has a sane placeholder icon path for the new arches (venomedge/umbrablade/lightbringer) so they don't render blank.
- [ ] **Chronomancer (Mage variant).** Time control: a slow-field skill, a haste/rewind. Simple names ("Slow Time", "Rewind"). Unlock trial in Frostfell (frost, stage 7).
- [ ] **Pirate (Ranger variant).** Cutlass + pistol feel; a gold/loot-luck mechanic. Simple names. Unlock trial in Ruined Keep (ruins, stage 5).
- [ ] **Secret-zone → class-unlock wiring.** Make each purple secret rift, on first clear, trigger that region's class **trial** (win it → class unlocked permanently, like the Reaper) instead of only dropping loot. Use the tier ladder in Notes. This is the real gate that turns exploration into class unlocks. (Trials already exist per class; this wires discovery→trial→unlock.)

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
