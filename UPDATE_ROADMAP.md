# BLADEFALL — Master Update Roadmap

Everything below is organized in a sensible **build order** (phases). Each phase is a
self-contained work session. Work top to bottom.

## How to use this
- Game is the single file `public/3d/index.html` (live at `/3d/`).
- After each phase: bump `VERSION3D`, `git push` (CD auto-deploys), and **verify in a
  browser** (`python -m http.server` in `public/`, open `/3d/`) before claiming done.
- **Do not break saves** — fold removed content via the `normWeapon`/`LEGACY_ART` pattern.
- Two detailed feature specs already exist and slot into Phase 8: the **Weapon Identity
  Overhaul** and the **Loot-juice + Drop-rate + Mixed-encounters + NPC "press E"** work-orders.

## Phase 0 — Global decisions (apply everywhere)
- [x] **Main levels are STATIC/hand-authored, not procedurally generated**, so they can be
  iterated to mastery. The **only** procedural content is the purple-secret trial rooms.
  *(v1.42.0: SCAPE main levels now seed off stage+area only — layout identical every run;
  boss maze + purple-secret trials keep the per-run seed.)*
- [x] **Never destroy gear.** Equipping or buying anything moves the replaced item to the bag;
  items are only lost when explicitly sold. *(bagReplaced on equip + shop buy, since v1.34.)*
- [x] Spawners **never stop** spawning until a kill-quest's count is actually met.
  *(den loop runs while `!questDone`; the Frostfell early-stop is a placement bug fixed in Phase 1.)*

## Phase 1 — Critical bugs & completability (do first; these block play)  ✅ v1.43.0
- [x] **Hitless death** no longer forces a brand-new class trial from the beginning.
  *(wipeMode now KEEPS classUnlocked/trialsDone — permadeath wipes the run, not your earned classes.)*
- [x] **Title Screen is always available in the ESC pause menu**, in every mode. *(added a Title Screen button.)*
- [x] **Stage count bug** ("1/14"). *(banner now shows the area name + ZONE x/7, reflecting the real 7-zone world.)*
- [x] **Ruined Keep — Sealed Vault reachable.** *(the maze-era level was replaced by the hand-tuned Keep
  SCAPE; zonescape.js BFS-verifies the find-objective + portal are reachable with conservative jump reach.)*
- [x] **Frostfell — frostlings spawn until 16.** *(root cause: a den on the high mesa spawned mobs into the
  void — moved to ground; spawner rewritten to be quest-driven so it refills until the count is met. Verified
  all 6 zones reliably reach their kill counts.)*
- [x] **Frostfell — plateau climbable.** *(SCAPE glacier climb is a climbRun chain within jump reach; harness-verified.)*
- [x] **Collectibles sit ON TOP of their surface.** *(SCAPE fetch items use the surface top as y0; harness checks 0 buried.)*
- [x] **Audit ALL objectives for completability.** *(zonescape.js verifies portal + every fetch/find/kill-den/secret
  reachable, both areas × seeds, all 6 zones; complete.js verifies kill counts are reachable.)*

## Phase 2 — Camera, control & input feel (affects the whole game)  ✅ v1.44.0
- [x] **Mouse/camera control:** a menu no longer costs camera control. *(new `regrabCam()` re-captures the
  mouse the instant a menu closes — inside the closing click's gesture — wired into resumePlay, pause resume,
  Esc-unpause, and hub wsResume. Only Esc releases it.)*
- [x] **Hub over-the-shoulder camera:** *(back wall pushed z:300→420 with the floor extended to match, so the
  shoulder camera now stands on solid floor INSIDE the hub in front of the wall — verified geometrically. The
  translucent LATE pass still fades any wall between camera and hero.)*
- [x] **Wall/floor transparency — floor underfoot stays solid.** *(new `standingOn()` guard: a wall/obstacle the
  player is standing on is never added to the translucent pass, so the surface under you never goes see-through.)*
- [x] **Portal transitions:** *(new `#fadeveil` + `warpTo()`: portal touch fades to black, loads the next area at
  the dark midpoint, fades back in — verified the veil turns on and the area advances.)*

## Phase 3 — Combat feel & targeting  ✅ v1.45.0
- [x] **Auto-aim prioritizes the direction you're LOOKING.** *(new `aimTarget()` scores by angle-from-aim
  (camera in shoulder/fps, facing in overhead) first, distance second, and hard-deprioritizes enemies behind
  you — verified it faces a far front enemy over a closer side one.)*
- [x] **Auto-aim (ranged) requires clear LINE OF SIGHT.** *(aimTarget skips any ranged target with losBlocked.)*
- [x] **Weapon attachment fix:** *(bows/crossbows + magic staffs/wands/scepters + the scythe now rest UPRIGHT in
  the third-person hand — a `_upright` orientation instead of the uniform blade-down flip; swung blades keep the
  combat pose.)*
- [x] **Skill visuals differ from the main attack (all classes).** *(Mage Bolt = fat rune-orb w/ orbiting ring +
  cast ring + comet trail; Ranger Deadeye = bright golden lance + muzzle flash + trail; Warrior Cleave = a golden
  arc fan across the front; Reaper Reap already has its purple soul-arc. New `runeorb`/`lance` shapes + `trail` flag.)*
- [x] **Level-up choice feels like an invitation, not a countdown.** *(ARM_MS 800→340ms; removed the sweeping
  timer bar; cards now ease in (fade+rise, `arminvite`); an audio cue (`SFX.achieve`) fires the instant choices appear.)*
- [x] **SFX sourcing** — *ADAPTED (noted): kept the game's procedural WebAudio cues rather than embedding external
  audio files. Rationale: single-file game + phone performance + no binary-asset fetch/embed available in this env;
  the procedural engine already has tiered drop fanfares (v1.40) and level chimes. Revisit if Oliver wants real files.*

## Phase 4 — Gear, bag & forging systems  ✅ v1.46.0
- [x] **Never lose gear:** equip/buy moves the replaced piece to the bag (bagReplaced, since v1.34).
- [x] **Bag full prompt:** *(new `bagFullPrompt` — on a stash with a full bag, offers to sell your lowest-value
  item to make room, or leave the new one behind; wired into the weapon + armor loot popups.)*
- [x] **Bag organized by category** — *(openBag now groups by melee/ranged/magic weapon then armor slot, with
  headers, rarity-descending within each group.)*
- [x] **Armor carries over level-to-level** — *(already: snapOf includes gear, freshFromSnapshot restores it,
  identical to weapons — verified.)*
- [x] **Armor can be combined to raise rarity** — *(the forge is now category-based; two same-rarity armor pieces
  of the same slot fuse.)*
- [x] **Forging = slot machine** — *(forge reworked to CATEGORY matching: two same-rarity pieces of the same
  category (melee/ranged/magic weapon, or armor slot) → a RANDOM new piece of that category at the next rarity.
  New `forgeSpin()` shows a Vampire-Survivors-style reel that ratchets down and lands on the payout, with tick +
  payout sounds. Verified: 2 Rare melee weapons → a random Epic melee weapon in the bag.)*
- [x] **Gear comparison arrows:** *(▲ green / ▼ red on each changed stat in the weapon + armor loot popups.)*

## Phase 5 — UI / HUD overhaul (desktop-first)
- [ ] **Shop compare:** when viewing a shop weapon, show your CURRENT weapon's **full stats
  (all of them) side-by-side** for easy comparison.
- [ ] **Use the desktop screen real estate:** redesign the shop and all similar menus to be
  spacious and readable — no cramped little scrolling sections. Prettier, easier to use, plus
  any general improvements that help.
- [ ] **Scroll position is preserved on click** — menus must NOT jump back to the top when you
  click (e.g. leveling stats should stay where you scrolled).
- [ ] **Main HUD:** fix the overlap between the HUD and the health/XP bars, and redesign the
  whole HUD to be more **beautiful and elegant** (creative freedom granted).

## Phase 6 — Onboarding / tutorial
- [ ] **First-time tutorial** (new save, first class trial): explain the controls, the
  objectives, and how the game works. Always show a **"Skip Tutorial"** option so veterans can
  bypass it.
- [ ] **Tutorial continues into the hub** (if not skipped): after the trial is beaten, explain
  how the hub works and what the player is meant to do there.

## Phase 7 — Levels & world (STATIC, hand-built)
- [ ] **Convert main levels to static/hand-authored** designs (procedural stays only for the
  purple-secret trial rooms).
- [ ] **Outskirts:** keep a consistent **"plains / field"** vibe the whole way — no abrupt jump
  into the old legacy dungeon layout. Style it like walking through a field. Make the **arena
  bigger**, **remove the lava** (it's a field now), and give it **richer, more interesting
  graphics**.
- [ ] **Hollow Pass:** route the **main path through the pillar-parkour section to where the
  portal is** (it currently dead-ends into nothing). Keep the **side-wall parkour purple-secret
  as the TEMPLATE** for how purple secrets are hidden — Oliver loved that one; make more like it.
- [ ] **Palace level:** a **white-marble palace/compound** level — the feel of entering an epic
  grand compound.
- [ ] **Final level — dark-fantasy CASTLE:** significantly harder than everything before. Enter
  the castle gates, ascend through the castle, and reach the **throne room** for the final boss.

## Phase 8 — Big feature work-orders (already spec'd; implement here)
- [x] **Weapon Identity Overhaul** — SHIPPED **v1.41.0** (Appendix A): per-weapon charge/hybrid/seek/pull,
  off-class disables specials, spear removed+folded, Void Scythe shop-only after Reaper, harder Reaper trial.
  *(Note: forging slot-machine + armor-combine (Phase 4) and per-skill visuals (Phase 3) remain TODO.)*
- [x] **Loot-juice + Drop-rate + Mixed-encounters + NPC "press E" dialogue** — SHIPPED **v1.40.0** (Appendix B):
  rarity-tiered drop fanfare + colored beam/burst/toast, drop-rate lowered, mixed-composition dens, press-E hub dialogue.
  *(Note: Appendix B item 1 asks for FREE-TO-USE sourced SFX; current drop/level SFX are procedural — see Phase 3 SFX item, still TODO.)*

---
### Conventions recap (every phase)
Single file `public/3d/index.html` · bump `VERSION3D` · `git push` · verify in browser ·
never break saves · main levels static (purple-secret trials procedural).

---

## Appendix A — Weapon Identity Overhaul (the Phase 8 detail)

Stay data-driven: extend the existing `ARCHES` / `MELEE` / `proj` tables and reuse the
`isChargeWeapon` (tap = base, hold = charge) pattern as the shared charge mechanic.

**Global rule — off-class disables specials:** every charge/hybrid/seek/pull below works ONLY
for the weapon's own class family. Off-class users get the plain base attack only (no charge,
no throw, no seek, no pull), on top of the existing `OFFCLASS_MUL` penalty. Class families:
warrior = sword/axe/hammer/greatsword; ranger = bow/crossbow/knives/javelin; mage =
staffs/wands/scepters; reaper = void scythe.

**WARRIOR**
- Sword: UNCHANGED (clean baseline).
- Axe: hybrid — tap = melee arc swing; hold = charge and HURL the axe (heavy phys projectile,
  pierces, RETURNS to the player). Warrior's melee+ranged option.
- Hammer: convert slam to HOLD-TO-CHARGE — release = radial AoE shockwave (slam shape) with
  knockback + brief stun; longer hold = bigger radius/damage (capped).
- Greatsword: hold to charge a spinning cleave (wide arc, big damage, big windup).
- Spear: REMOVE from ARCHES/MELEE + shop/drop pools; fold saved spears into javelin/sword.

**RANGER**
- Longbow: UNCHANGED (baseline).
- Crossbow: keep the 3-arrow spread; ADD close-range damage bonus (more per-pellet the nearer
  the target, falloff with distance) — the up-close shotgun.
- Throwing Knives: hybrid — target in melee reach → fast STAB (thrust, bonus dmg); else the
  rapid double-throw. Light & fast.
- Javelin: hybrid — tap = melee STAB (thrust, short reach); hold = charge a heavy ranged throw
  (slow fire rate, heavy single-target, pierces, arcs). The heavy lancer.

**MAGE — three archetypes by art**
- STAFF (firestaff, plaguestaff): tap = small elemental shot; hold = charge a LARGER projectile
  (bigger size, damage scaled to charge). Slow, heavy, high burst.
- WAND (frostwand, stormrod): RAPID-FIRE — fast, small thin projectiles, low per-hit, NO charge.
  Sustained-DPS / kiting caster.
- SCEPTER (arcaneorb/Demon Eye, holyscepter): projectiles SEEK (home toward nearest enemy) and
  pierce; keep/boost status. NO charge. Tactical smart-missiles.
- Style every caster projectile to its element (fire=fireball, frost=shard, storm=bolt/spark,
  poison=glob, arcane=orb, holy=light, void=dark).

**REAPER**
- Void Scythe (voidscythe): swing PULLS nearby enemies inward (gravity yank) to cluster them,
  then reaps; kills RESTORE HP (harvest, on top of lifesteal).
- Availability: SHOP-PURCHASE ONLY, and only appears in the shop AFTER the Reaper is unlocked
  (remove from drop pools). On Reaper unlock (trial completed), show a pop-up/toast: "The Void
  Scythe is now available in the Shop."
- Reaper trial: make it SIGNIFICANTLY HARDER than the warrior/ranger/mage trials (currently
  trivial) — more/tougher enemies, a real fight.

## Appendix B — Loot juice + drop-rate + mixed encounters + NPC dialogue (Phase 8 detail)

**1) Rarity-scaled loot drop juice.** Today `rollDrop(e)` pushes items to `G.pickups` with a
`bob` and a uniform `SFX.pickup()` bell — a legendary drops like a common. Make rarity an
escalating EVENT across RARITY/RORDER tiers:
- Audio: rarity-tiered drop/pickup sounds (reuse tone()/noise()) — common = soft bell, each
  tier richer, legendary = a full triumphant fanfare. Obvious BY EAR which rarity dropped.
- Visual: on drop, a rarity-COLORED light beam/pillar (taller/brighter per tier) + a `burst()`;
  rare+ adds `G.shake`; legendary adds a bigger beam, a ring shockwave, sparkles, and a brief
  slow-mo if feasible. The grounded pickup stays rarity-glow-coded so you SEE it across the room.
- Announce rare+ with a rarity-colored `toast()` ("✦ LEGENDARY — Abyss Blade"); keep
  common/uncommon silent so the good ones stand out.

**2) Fewer, more meaningful drops.** Non-boss armor drop is `Math.random()<0.45` — carpets the
floor. Lower base drop frequency (try ~0.20, tune by feel) so each drop is earned. Do NOT change
hunt length or spawn counts. Bosses/elites keep boosted drops.

**3) Mixed-composition encounters.** When spawning groups (incl. spawner-nest dens), salt in 1–2
complementary enemy types (a ranged/kiter beside the melee mob, etc.) so no two fights feel
identical. Keep the kill-quest mob as the majority.

**4) Press E to talk to NPCs.** In-range NPC (hub especially) → show a floating "Press E" prompt
(on mobile, an on-screen INTERACT button that only appears in range). Pressing E / the button
opens the NPC's dialogue (reuse storycard/storyToast); each hub NPC explains who they are and
what they do, in BLADEFALL's grim/terse voice. Wire E into the existing key handling
(WASD/Space/J/K/L/Esc) with no conflicts.
