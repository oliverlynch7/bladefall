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

## Telegram digest (daily summary)
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

- [ ] **Paladin (Warrior variant).** Family = `['sword','great','axe','hammer','spellblade']` (all physical melee + spellblades; NOT staff/wand). Innate "Holy Warrior": while wielding a **holy** weapon (Lightbringer / holy spellblade / Ian's Blade), +damage AND heal a little on hit. Two rank paths: **Guardian** (survival — a shield/taunt skill, damage reduction, self-heal, retaliation) vs **Templar** (holy damage — Smite, Holy Ground [damage circle], a holy burst). Capstone "Avatar of Light": strong damage reduction + a holy retaliation aura. Simple skill names only. Unlock via a hidden **Trial of the Paladin** in the Palace (marble). Verify: class selectable, wields its family at full power, holy innate fires with a holy weapon, no console errors.
- [ ] **Necromancer (Mage variant).** Family = `['staff','wand','spellblade']`. MUST have: a **summon** skill (spawn temporary undead minions that fight for you) and a **"Raise the Dead"** skill (turn a recently-killed enemy into a resurrected fighter on your side for a while). Reuse/extend the pet/minion + enemy systems. Paths: **Summoner** (more/stronger minions) vs **Plague** (drain + damage-over-time). Capstone: a bigger raise/army moment. Unlock trial in the Abyss.
- [ ] **Ninja (Ranger variant).** Family = `['dagger','knives','sword']`. Fast melee crit-combo + evasion/stealth. Skills: "Shadow Step" (dash + i-frames), a combo/crit skill, a smoke/vanish. Paths: **Shadow** (evasion, stealth burst) vs **Blade Fury** (crit/combo/speed). Unlock trial in the Hollow.
- [ ] **Holy spellblade variant + affinity icons hook.** Ensure holy magical melee is covered (Lightbringer axe exists; consider a slim holy spellblade too). Make sure `itemStaticAv` has a sane placeholder icon path for the new arches (venomedge/umbrablade/lightbringer) so they don't render blank.
- [ ] **Chronomancer (Mage variant).** Time control: a slow-field skill, a haste/rewind. Simple names ("Slow Time", "Rewind"). Unlock trial TBD.
- [ ] **Pirate (Ranger variant).** Cutlass + pistol feel; a gold/loot-luck mechanic. Simple names. Unlock trial TBD.

## Notes / open decisions (do NOT act on without Oliver)
- Elemental affixes on **physical** weapon drops (making "a Flaming Sword") is a separate system change — Oliver decides before building.
- Real icon art (class icons, skill/passive icons) is a supervised ChatGPT-in-Chrome pass — autopilot uses placeholders.
- No dragons in the game, so **no Dragonslayer class.**
