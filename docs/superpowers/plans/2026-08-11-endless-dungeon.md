# Endless Dungeon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Endless Dungeon worth running twice — a mode with its own identity, rather than campaign levels with the interesting parts switched off.

**Architecture:** No new mode. Every task changes what `loadDelveFloor` (index.html:14305) does with the level it already builds.

**Tech Stack:** `public/3d/index.html`. Verified with `harness/test-levels.js` and the walker.

## Why this exists

Oliver: *"endless dungeon mode needs a lot of work."*

Read from the code rather than guessed, three things stand out. One correction to an earlier claim of mine: there **is** persistence — `meta.delveBest` records your deepest floor and the death screen shows it (14353, 14361). It is thin, but "no meta-progression at all" was wrong.

| what | where | why it matters |
|---|---|---|
| **`G.haz = null` on every floor** | 14309 | The signature hazards — gloom, rime, phasing, gusts, lava, collapse — are the single thing that makes zones play differently. Switched off, every floor is the same fight in a different palette. This is the big one. |
| **Floors are campaign levels** | `loadArea()` at 14311 runs the zone's own generator | A campaign area is ~4,500 units built for a ten-minute traversal with quests. A roguelite floor wants one to three minutes. The pacing fights the genre. |
| **Depth is the only reward** | `meta.delveBest` | A number is a reason to run twice. It is not a reason to run twenty times. |

## Global Constraints

- Work on branch `autopilot-merged`. Never `main`.
- Any `public/3d/index.html` change must pass `node tools/gate.js`.
- **Do not break the campaign.** The delve borrows campaign generators, so anything changed inside a generator changes the campaign too. Prefer changing what `loadDelveFloor` does AFTER `loadArea()` returns over editing a generator.
- The delve escrows everything (`bankNow()` at 13509) and returns it on death. Nothing added here may leak out of a run — that is the mode's whole promise: *"Nothing you find here leaves with you — only how deep you went."*
- Verify each task with the walker. A floor that cannot be finished is worse than a boring one.
- **Tasks 2 and 3 change how the mode plays.** One commit each, so Oliver can revert any single one after playing.

---

### Task 1: Turn the hazards back on

**Files:**
- Modify: `public/3d/index.html` (`loadDelveFloor`, ~14305)

- [ ] **Step 1: Confirm hazards are off and that they would otherwise work**

```bash
node _shot/shot.js --scene 1 --wait 12000 --eval "(function(){ __BF3.enterZone(1); return JSON.stringify({campaignHaz: __BF3.G.haz}); })()"
```

Expected: a hazard id for a campaign zone (Hollow Pass is `gusts`). The delve sets `G.haz = null` immediately after `loadArea()`, discarding whatever the borrowed zone set.

- [ ] **Step 2: Let the floor keep its theme's hazard**

Remove the unconditional `G.haz = null` and let the borrowed stage's hazard stand — but **not from floor 1**. The mode starts you at level 1 with no gear, so the first floor should teach the room, not the weather. Turn hazards on from floor 3, which is also where `zoneTier` first rises.

`hazSetup` must run for the hazard to have furniture (braziers, vents, thorns). Confirm it is reached on a delve floor; if `loadArea` skips it for the delve, call it explicitly after the floor builds.

- [ ] **Step 3: Prove a floor is still finishable with the hazard live**

```bash
node harness/test-levels.js
```

Expected: no new failures. Then walk three delve floors specifically — 3, 6 and 9 — and confirm each reaches its stairs. A gloom floor with no braziers is unwinnable, which is exactly the class of bug the level tester exists to catch.

- [ ] **Step 4: Commit**

```bash
git add public/3d/index.html
git commit -m "delve: floors keep their theme's hazard from floor 3, so depth changes how you play and not just the palette"
```

---

### Task 2: Floors sized for a roguelite

A ten-minute floor makes a twenty-floor run impossible to sit through, which caps depth by patience rather than by skill.

**Files:**
- Modify: `public/3d/index.html` (`loadDelveFloor`)

- [ ] **Step 1: Measure what a floor currently costs**

Walk floors 1, 5 and 10 with the level walker and record ticks-to-exit for each. Convert to seconds at 60 ticks/second. That number is the argument for or against this task — if a floor already takes two minutes, skip the task and record why.

- [ ] **Step 2: Shorten the floor**

The generators take a z-span. Rather than editing a generator, set the delve's own span before `loadArea()` so the same generator emits a shorter level. Target roughly a third of campaign length.

If the span is not reachable from `loadDelveFloor`, the fallback is to move the exit portal closer after the level builds — but only to a point the walker can still reach, verified, not assumed.

- [ ] **Step 3: Prove every floor still completes**

```bash
node harness/test-levels.js
```

Plus the walker on floors 1, 5, 10 and 15. Record the new ticks-to-exit beside the old.

- [ ] **Step 4: Commit**

```bash
git add public/3d/index.html
git commit -m "delve: floors are a roguelite floor long, not a campaign area long

Before: <n>s to the stairs on floor 5. After: <n>s."
```

---

### Task 3: A reason to run it twice

`meta.delveBest` is a number on a death screen. The mode needs something that changes the NEXT run.

**Files:**
- Modify: `public/3d/index.html`

- [ ] **Step 1: Read how the delve already grants a class**

`delveMaybeDropClass` (13556) drops a class as loot, restricted to classes already unlocked in the campaign, with guaranteed floors plus a small roll elsewhere. That restriction is deliberate and stated: finding an unearned class would give the delve a progression the campaign owns.

- [ ] **Step 2: Add a depth-gated cosmetic unlock, and nothing else**

Reaching a new deepest floor unlocks a cosmetic — a skin or a title — permanently, in `meta`. Cosmetic on purpose: it survives the mode's promise that nothing you FIND leaves with you, because it is not something you found, it is something you did. Power would break both the promise and the campaign's ownership of progression.

Gate at floors 5, 10, 15, 20. Reuse the existing skin unlock path (`meta.unlockedSkins`) rather than inventing a reward system.

- [ ] **Step 3: Prove it persists and cannot be farmed**

Assertion: reaching floor 5 sets the unlock; dying and re-running does not grant it twice; the escrow still returns gold, hero and stash exactly as before. That last one is the one to watch fail — the delve's whole contract is that a run cannot cost you anything.

- [ ] **Step 4: Commit**

```bash
git add public/3d/index.html
git commit -m "delve: going deeper than you ever have leaves a mark, and nothing else does"
```

---

## What this deliberately does not do

- **No new generator.** The mode's variety problem is hazards being off, not the levels being wrong. Writing a delve-specific generator before turning the hazards back on would be building a second thing to test.
- **No power carried out.** Every temptation here breaks the one sentence the mode opens with.

## Self-Review

**Spec coverage.** The three findings in the table map to Tasks 1, 2 and 3. The fourth observation — class-as-loot limited to unlocked classes — is explicitly left alone in Task 3 Step 1, with the reason quoted from the code.

**Placeholder scan.** Task 2 Step 1 measures before it changes anything and has an explicit "skip this task" branch. Commit messages carry `<n>` placeholders that the measurement fills in — those are outputs, not unresolved decisions.

**Risk carried forward.** Task 1 turns on hazards the delve has never run with. Gloom in particular needs braziers placed, and `hazTopUp` historically furnished only the rooms that existed when it ran. If a delve floor builds rooms after `hazSetup`, gloom will be dark with no safe ground — the walker must be run on a gloom floor specifically, not just on floor 3.
