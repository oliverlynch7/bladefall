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

## Phase 2 — Camera, control & input feel (affects the whole game)
- [ ] **Mouse/camera control:** using a menu with the mouse must NOT require re-clicking screen
  center to regain camera control. Camera control only releases/returns on **ESC** — never
  after a normal menu interaction.
- [ ] **Hub over-the-shoulder camera:** the character spawns hidden behind the back wall. Apply
  the existing transparent-wall fix to THIS camera mode too — always see your character.
- [ ] **Wall/floor transparency (Hollow Pass, etc.):** transparency only triggers when geometry
  actually blocks the view of your character. **The floor you're standing ON must ALWAYS stay
  solid** — never see-through underfoot.
- [ ] **Portal transitions:** add a quick, visually pleasing transition animation instead of an
  instant snap-teleport, so movement feels real.

## Phase 3 — Combat feel & targeting
- [ ] **Auto-aim prioritizes the direction you're LOOKING**, not simply whoever is closest — no
  more side-shooting enemies you aren't facing.
- [ ] **Auto-aim (ranged) requires clear LINE OF SIGHT** — target the enemy you can actually see
  down the hall, not a closer one behind a wall.
- [ ] **Weapon attachment fix:** scythes are held weirdly; bows/arrows have the same problem.
  Fix the hand/anchor so weapons are held correctly.
- [ ] **Skill visuals must differ from the main attack, for ALL classes.** (e.g. the Mage's
  slot-1 skill currently reuses the starter fire projectile.) Give every skill its own visual
  so it's obvious it's a different attack.
- [ ] **Level-up upgrade choice:** shorten the delay, add an **audio cue** when the choices
  appear, and remove the "being timed out" visual feel — it should read as an invitation, not
  a countdown.
- [ ] **SFX sourcing:** for these cues, use **free-to-use sound effects sourced online** that fit,
  rather than hand-synthesized tones.

## Phase 4 — Gear, bag & forging systems
- [ ] **Never lose gear:** equipping/buying moves the replaced weapon or armor to the **bag**.
- [ ] **Bag full:** on a pickup/purchase with no room, prompt to **sell your lowest/last
  equippable OR skip** the new item (rewards proactive bag management).
- [ ] **Bag is organized smartly** — grouped by weapon category and by armor type.
- [ ] **Armor carries over level-to-level like weapons do** (currently it seems not to).
- [ ] **Armor can be combined to raise rarity**, just like weapons.
- [ ] **Forging = "slot machine":** combine two items of the **same rarity** within the **same
  category** (melee / ranged / magic weapons; armor by type) → get a **random new item of that
  category at the NEXT rarity**, with a Vampire-Survivors-style **epic slot-machine animation +
  sound**.
- [ ] **Gear comparison arrows:** RED for a downgrade stat, GREEN for an upgrade.

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
- [ ] **Weapon Identity Overhaul** — the full per-weapon spec (already written). Touches combat +
  gear, so land it after Phases 3–4. Related items already folded above: forging (Phase 4),
  armor combine (Phase 4), skill visuals (Phase 3).
- [ ] **Loot-juice + Drop-rate + Mixed-encounters + NPC "press E" dialogue** — already written.
  Pairs naturally with Phases 3 and 5.

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
