# Multiplayer Experience Implementation Plan (sub-project D)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make co-op and PvP good enough to be the point of the game, not a mode bolted on — and remove the mistakes that comparable games are still being criticised for.

**Architecture:** No new netcode. The transport (PeerJS/WebRTC + Cloudflare TURN) is verified working. Every task here changes what the existing `MP` object sends or how the game reacts to a party, and is verified by `harness/test-mp.js`.

**Tech Stack:** `public/3d/index.html` (the `MP` object, ~line 11400). Harness runners under `harness/`. Node 26, no npm install.

## Why this exists

`docs/VISION.md` priority #1: *"Multiplayer that is actually fun — co-op and PvP both."* It is the stated point of the game.

Oliver, after a real PvP match: *"I turned invisible on my screen, but I could see him, and the same happened for him."* That specific bug is fixed (`0c74ee1`), but it was found by playing, not by the harness — which is what this plan is meant to change.

## What the research says goes wrong, and where BLADEFALL stands

Searched 2026-08-11. Each row is a documented, recurring complaint in shipped co-op ARPGs, checked against this codebase rather than assumed.

| known pitfall | BLADEFALL today | verdict |
|---|---|---|
| Naive host authority gives the host a lag-free advantage | Enemies are host-authoritative for HP/death only; each client runs enemy AI locally, and peers are interpolated between packets | partly handled — audit in Task 2 |
| Difficulty not scaled to party size | `grep` for `peers.length` in any HP/damage path returns **nothing**. Two players fight exactly the enemies one player would | **missing — Task 3** |
| Shared loot causes friction; personal loot is strongly preferred | No per-player loot ownership | **missing — Task 4** |
| No in-game communication | `grep` for chat/ping/mark messages returns **nothing** | **missing — Task 5** |
| Public STUN/TURN, no relay | Cloudflare Realtime TURN with ephemeral credentials, verified relay candidates | already correct |
| Drop-in friction | 4-char room codes, guest auto-provisioned a starter class | already correct |

## Global Constraints

- Work on branch `autopilot-merged`. Never `main`.
- Any change to `public/3d/index.html` must pass `node tools/gate.js`.
- **Tasks 1 and 2 are correctness fixes. Tasks 3, 4 and 5 change how the game PLAYS.** Oliver said to run with them, but each one lands as its own commit so any single one can be reverted after he plays it.
- The `MP` object is closure-local. A probe can only see what is on `window` or `__BF3`. Export what you need on `__BF3` rather than imitating it in the probe — the first MP test asserted on a value it had set itself and passed against the very bug it existed to catch (`d05142a`).
- Every assertion must be proven able to FAIL before it is believed. Both live probes carry a permanent URL-flag known-bad for this reason.
- **Two real machines remain the final check.** Nothing here proves connection behaviour.

---

### Task 1: Allies look like themselves

There is one 3D rig, so every ally renders with the local player's model and weapon. The weapon hot-swap is currently guarded to the local player because two heroes holding different weapons thrashed an async `equipWeapon` reload every frame.

**Files:**
- Modify: `public/3d/hero3d.js`
- Modify: `harness/probes/mp.probe.js`

- [ ] **Step 1: Confirm the current behaviour in a probe**

```bash
node _shot/shot.js --scene 1 --wait 12000 --eval "(function(){ return JSON.stringify({wrap: !!(window.HERO3D && window.HERO3D._wrap), oneRig: true}); })()"
```

Expected: a single `_wrap`. That single rig is the whole bug.

*(scouted 2026-08-10, `autopilot-merged`, read-only — no code written, so this task is still open.
Recorded so the next run does not re-find it. `SkeletonUtils` is **already imported** at
`hero3d.js:22` and already used twice for exactly this purpose — the mirror pose at 1670 and the
character-select pose at 1726 — so Step 2 is reusing an established idiom in this file, not
introducing one. The single rig is `HERO3D._wrap`, assigned once at 1389 and then read at 1125,
1283, 1571, 1593 and 1627. The local-only weapon guard Step 3 removes is `_isLocal` at 1547,
computed as `p === __BF3.G.p`, and its own comment at 1544 states the thrash reason the plan
quotes. One thing to carry into Step 2 that is written down at 1734 and easy to miss:
**`SkeletonUtils.clone` SHARES materials with its source**, so anything that mutates a clone's
material — a team tint, a translucent ghost — changes every ally and the local hero too.)*

- [ ] **Step 2: Clone a rig per peer**

Three.js ships `SkeletonUtils.clone` for exactly this — a skinned mesh cannot be shared by reference between two transforms. Keep a small pool keyed by peer id, cap it at `HERO3D_MAX` (6, already defined in `index.html`), and dispose a clone when its peer leaves.

- [ ] **Step 3: Restore per-peer weapons**

With one rig per peer the thrash reason is gone, so remove the local-only guard on the weapon swap and equip each clone from that peer's own `weapon`.

- [ ] **Step 4: Gate and prove**

```bash
node tools/gate.js
node harness/test-mp.js
```

Expected: gate OK, and the mp suite reports every queued hero drawn. Add an assertion that two queued peers with DIFFERENT weapon art produce two different equipped models, and prove it can fail by temporarily giving both the same.

- [ ] **Step 5: Commit**

```bash
git add public/3d/hero3d.js harness/probes/mp.probe.js
git commit -m "multiplayer: one rig per ally, so your friend stops looking like a copy of you"
```

---

### Task 2: Audit the host's advantage

The documented failure is that the host sees a lag-free world while guests see a delayed one, so the host is simply better at the game. BLADEFALL already interpolates peers and simulates enemies locally, so this is an audit that may end in "no change needed" — which is a valid outcome to record, not a failure.

**Files:**
- Modify: `harness/probes/mp.probe.js`
- Possibly modify: `public/3d/index.html`

- [ ] **Step 1: Measure what a guest actually sees**

Instrument `applyEnemies` to record, per reconciled enemy, the distance between the guest's locally-simulated position and the host's snapshot position at the moment the snapshot arrives. Report the median and the worst case over 30 seconds of a moving fight.

- [ ] **Step 2: Judge it against the thing that matters**

The question is not "is there drift" — there always is — but **"can a guest be hit by an enemy that is visibly somewhere else on their screen?"** Compare the worst-case drift against the enemy's own attack reach. Drift smaller than reach is invisible; drift larger than reach is the unfair death players describe.

- [ ] **Step 3: Record the finding either way**

Write the numbers into `docs/MP_AUDIT.md`. If drift is within reach, say so plainly and change nothing. If it is not, the fix is to sync position for enemies currently in combat with any player, not for all enemies — the existing design deliberately avoids per-frame position sync for bandwidth, and that reasoning stays valid for idle mobs.

- [ ] **Step 4: Commit**

```bash
git add docs/MP_AUDIT.md harness/probes/mp.probe.js
git commit -m "multiplayer: measure the guest's view against enemy reach, and record what it actually is"
```

---

### Task 3: Scale difficulty to the party

Nothing in the game reads the party size. Two players meet the enemies one player would, so co-op is strictly easier than solo and the difficulty Oliver tuned does not survive a friend joining.

**Files:**
- Modify: `public/3d/index.html`

- [ ] **Step 1: Find where enemy HP and damage are finalised**

```bash
grep -n "ngHp\|ngDmg\|computeNgScales" public/3d/index.html | head
```

These already exist as run-scale multipliers, which is the natural place for a party multiplier to join rather than a new system.

- [ ] **Step 2: Add a party multiplier, applied on the HOST only**

Enemy stats are host-authoritative, so the multiplier must be applied where enemies are created on the host and travel to guests through the existing snapshot. Applying it independently on both clients would double it on the guest.

Start at **+60% HP per additional player, no damage increase.** The research is explicit that raising enemy damage in co-op is what makes it "less fun" and that extra health plus stagger "slows progression significantly" — so this scales the *time to kill* only, and only once, and stays reviewable.

- [ ] **Step 3: Prove it**

Add an mp-suite assertion: with one player the same seed produces enemy `maxHp` H; simulating a second peer produces ~1.6H. Prove it can fail by asserting the wrong multiplier first.

```bash
node tools/gate.js
node harness/test-mp.js
```

- [ ] **Step 4: Commit**

```bash
git add public/3d/index.html harness/probes/mp.probe.js
git commit -m "multiplayer: enemies scale with the party, so a second player is help and not an easy mode"
```

---

### Task 4: Personal loot

Shared loot is the single most-complained-about co-op mechanic in the games surveyed; personal loot is what modern ARPGs moved to.

**Files:**
- Modify: `public/3d/index.html`

- [ ] **Step 1: Find how a drop is created and claimed**

```bash
grep -n "G.pickups.push" public/3d/index.html | head
```

- [ ] **Step 2: Give each drop an owner**

On the host, when a drop is rolled, roll one instance per living player and tag each with the peer id it belongs to. A client renders and can collect only its own. This is additive — a solo run has one player and therefore one instance, which is exactly today's behaviour.

- [ ] **Step 3: Prove it**

Assertion: with two peers, a single kill yields two owned drops, and a peer cannot collect the other's. Prove the ownership check can fail by removing it.

```bash
node tools/gate.js
node harness/test-mp.js
```

- [ ] **Step 4: Commit**

```bash
git add public/3d/index.html harness/probes/mp.probe.js
git commit -m "multiplayer: personal loot, so nobody has to race a friend for a drop"
```

---

### Task 5: A way to talk without talking

There is no chat and no ping. The research names communication the top co-op frustration, and a browser game with no voice needs a non-typing answer.

**Files:**
- Modify: `public/3d/index.html`

- [ ] **Step 1: Add a world ping**

One key (and one on-screen button, since this is phone-first) drops a marker at what you are aiming at, broadcast to the party as a compact `{t:'mark',x,z}` and drawn for a few seconds in the sender's team colour. Reuse the existing beacon draw rather than inventing a marker style.

Deliberately not free-text chat: it needs a keyboard, it needs moderation, and a ping answers "here", "this", and "look" — which is most of what a co-op party needs.

- [ ] **Step 2: Prove it**

Assertion: a `mark` message from a peer produces a visible marker with a lifetime, and it expires. Prove it can fail by dropping the handler.

```bash
node tools/gate.js
node harness/test-mp.js
```

- [ ] **Step 3: Commit**

```bash
git add public/3d/index.html harness/probes/mp.probe.js
git commit -m "multiplayer: ping the world, because a co-op game with no way to say 'here' is a solo game with witnesses"
```

---

## When this plan is done

Allies look like themselves, the party changes the fight, loot is nobody's to steal, and players can point at things. `docs/MP_AUDIT.md` records what a guest actually sees.

Then Oliver and his friend play a real match on two machines, which is the only test that closes this out.

## Self-Review

**Spec coverage.** Sub-project D in the programme spec asks for per-peer rigs (Task 1) and a two-peer render test (already built, `d05142a`). Tasks 2–5 come from the 2026-08-11 research and each is checked against the codebase in the table above rather than assumed.

**Placeholder scan.** Every task names exact files and exact commands. Task 2 may legitimately end in "no change needed"; that is stated as a valid outcome rather than left ambiguous.

**Type consistency.** `harness/test-mp.js` exports `runMpTests` and is consumed by `run-all.js`; `harness/probes/mp.probe.js` is the file it reads. `HERO3D_MAX` is defined in `index.html` and reused in Task 1 rather than redefined.

**Risk carried forward.** Tasks 3, 4 and 5 change how the game plays and cannot be validated by a harness alone — the harness can only prove the mechanism fires. Whether +60% HP per player is the right number is Oliver's call after a real match, which is why the multiplier is one constant in one place.
