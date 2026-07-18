# BLADEFALL — Weapon / Damage / Element / Affinity / Status Overhaul (dev work order)

> Ready-to-run prompt for a single BLADEFALL dev session. Hand this file to the updater
> (or paste it). It is a two-stage inspect-then-implement work order. The design decisions
> marked **LOCKED** are final; everything not locked is derived from the actual code.

---

## === BLADEFALL OPERATING CONTEXT (read before Stage 1) ===

- The game is the SINGLE self-contained file `public/3d/index.html` (live at `/3d/`). All
  weapon/element/status/UI/save/loot code lives in that one file. Debug hook: `window.__BF3`.
- **MUTE FIRST**, as its own tiny commit before anything else: auto-mute (sound+music off)
  when `location.hostname` is `localhost`/`127.0.0.1`, and honor a `?mute=1` URL param — so
  test builds are silent while the live game is being played. Until it ships, set
  `meta.soundOn`/`meta.musicOn` false in the test tab.
- **SAVE SAFETY IS CRITICAL.** This update migrates weapon families, affinities (Storm
  removal), and status terminology (Blight→Venom). Real saves exist. Use the existing
  `normWeapon` / `LEGACY_ART` migration pattern; legacy identifiers survive ONLY as
  migration aliases, never as active player-facing families. Never silently delete an owned
  item — migrate its power + upgrade level.
- **VERIFY IN A REAL BROWSER** before claiming done (`python -m http.server` in `public/`,
  open `/3d/`). The node stub cannot compile GLSL and stub canvases mask DOM/UI bugs. Also
  load a PRE-update save and confirm it still loads and its items migrate.
- Ship in **ROLLBACK-SAFE order** (Stage 1 must define it): data/affinity model → status
  layer → weapon-family audit/migration → loot/shop/forge/reward filters → UI/tooltips.
  Batch into as few deploys as possible.
- **ON SHIP:** bump `VERSION3D`, `git push` from INSIDE the submodule (Cloudflare
  auto-deploys), confirm the new `VERSION3D` string serves live. Then log this overhaul in
  `_automation/bladefall/UPDATE_ROADMAP.md` as a new phase with a shipped-note.
- **SCOPE GUARD:** this is the weapon/damage/element/affinity/status overhaul ONLY. Do NOT
  build pets, mimic chests, endless mode, or new art in this session — they are separate
  work orders. Do NOT generate or add any new art assets.

## === END BLADEFALL OPERATING CONTEXT ===

---

You are working directly on BLADEFALL, a lightweight single-file WebGL voxel action-roguelite RPG.

You have substantially more context about BLADEFALL's codebase, existing weapon roster, combat balance, data structures, save system, loot generation, and current mechanics than the person giving you this instruction.

Your task is NOT to blindly implement a speculative outside design document.

Complete this update as a two-stage process:

STAGE 1 — INSPECT THE ACTUAL GAME AND WRITE A GROUNDED IMPLEMENTATION PROMPT TO YOURSELF

STAGE 2 — FOLLOW THAT SELF-PROMPT AND IMPLEMENT THE UPDATE

Do not begin editing code until you have completed the inspection and written the grounded self-prompt.

The design decisions explicitly marked as locked below must be respected.

For implementation details that are not locked, inspect the actual game and choose the smallest, cleanest solution that fits BLADEFALL's existing architecture and balance.

Do not make assumptions when the code can answer the question.

==================================================
CORE GOAL
==================================================

Finalize and clean up BLADEFALL's:

- Class weapon-family structure
- Weapon classifications
- Damage-type structure
- Elemental affinities
- Elemental weaknesses and resistances
- Elemental stack/status identities
- Scythe elemental specialization
- Loot-generation rules
- Shops and rewards
- Tooltips and UI
- Save compatibility and migrations

Do not redesign unrelated systems.

Do not add new art during this update.

Do not add unrelated weapons, classes, enemies, bosses, quests, or progression systems.

==================================================
LOCKED CLASS AND WEAPON-FAMILY STRUCTURE
==================================================

The finalized active weapon families are:

WARRIOR
- Sword
- Greatsword
- Battle Axe
- Warhammer

RANGER
- Throwing Knives
- Longbow
- Crossbow
- Javelins

MAGE
- Staff
- Wand
- Spellblade

REAPER
- Scythe

These categories are locked.

==================================================
LOCKED WEAPON-CLASSIFICATION RULES
==================================================

1. DAGGERS AND THROWING KNIVES

Daggers and Throwing Knives are being merged into one active family.

The surviving player-facing family name is:

- Throwing Knives

Do not retain Daggers as a separate active weapon family.

The merged Throwing Knives family may include both close-range knife attacks and ranged throwing behavior if that fits BLADEFALL's current implementation.

Do not invent an entirely new moveset if the existing Dagger or Throwing Knife behavior can be cleanly merged.

Inspect both implementations and determine:

- Which current attack behavior should survive
- Whether close-range knife attacks already exist
- Whether charged or alternate attacks already throw knives
- Which animation and hitbox systems should be retained
- Which item data should be migrated
- Which category identifier should become canonical

Any legacy "dagger" identifier may remain internally only if temporarily required for save migration.

It must not remain as an actively generated, player-facing parallel family.

2. SABER

Saber is not part of the finalized weapon structure.

Do not create or retain Saber as an active weapon family.

Audit any existing Saber content and determine whether each item should be:

- Removed
- Retired from acquisition
- Reclassified only if genuinely appropriate
- Migrated for old saves
- Fully deleted if safe

Do not automatically rename Saber to Sword merely to preserve it.

3. SCEPTERS

Scepter is not a separate active weapon family.

The active Mage family is Wand.

A weapon may still have "Scepter" in its unique item name if appropriate, but its gameplay family may be Wand only when its actual behavior fits the Wand category.

For example, an item named "Demon Eye Scepter" might be classified as a Wand if it behaves like one.

Do not force every existing Scepter into Wand without inspecting its behavior.

4. SPELLBLADES

Spellblade is a Mage weapon family.

Spellblades are magical melee weapons.

Their broad identity is:

- Close-range magical combat
- Elemental or magical damage
- A melee combo or melee attack pattern
- Some form of magical release, alternate attack, charge behavior, or elemental utility if supported by the existing combat system
- Less physical impact and stagger than Warrior heavy weapons
- Greater elemental or magical identity than ordinary Warrior swords

Do not invent unnecessary mechanics before examining the existing Flameblade, Frostbrand, Runeblade, magical swords, charged attacks, or related systems.

Existing or planned weapons such as these may belong to Spellblade:

- Flameblade
- Frostbrand
- Runeblade

Determine their actual classifications from the code and current design.

5. SCYTHES

All Scythes belong exclusively to Reaper.

Do not give Scythes to Warrior, Ranger, or Mage.

Scythe is the Reaper's single weapon family.

Different Scythes may eventually have different elemental identities, but they must remain mechanically and visually recognizable as Reaper weapons.

6. CLASS RESTRICTIONS

When the update is complete, active loot and acquisition systems must respect:

Warrior:
- Sword
- Greatsword
- Battle Axe
- Warhammer

Ranger:
- Throwing Knives
- Longbow
- Crossbow
- Javelins

Mage:
- Staff
- Wand
- Spellblade

Reaper:
- Scythe

==================================================
IMPORTANT RULE FOR EXISTING WEAPONS
==================================================

Do not assume every existing weapon should be preserved.

Some current weapons may not belong in the finalized game.

Audit every weapon and decide whether it should be:

1. Kept unchanged
2. Renamed
3. Reclassified
4. Converted into a variant of an approved family
5. Removed from active loot generation
6. Removed from shops
7. Removed from enemy drops
8. Removed from rewards
9. Retained only for old-save compatibility
10. Fully removed if obsolete and safe to delete

Do not force unrelated weapons into approved categories simply to preserve them.

Examples:

- Do not label an unrelated weapon as a Wand merely because Scepter is no longer a family.
- Do not rename every Saber to Sword without checking its mechanics.
- Do not retain Daggers as a separate family after the Throwing Knives merge.
- Do not automatically convert every Storm item to Arcane without examining its gameplay.
- Do not keep obsolete weapons active merely because they already exist.

Base each decision on the actual game.

==================================================
LOCKED DAMAGE-TYPE STRUCTURE
==================================================

BLADEFALL should distinguish two primary damage types:

- Physical
- Magic

These are damage types, not elemental affinities.

The code should represent damage type separately from affinity.

Conceptually:

damageType:
- physical
- magic

affinity:
- none
- fire
- frost
- poison
- arcane
- holy
- void

Examples:

Standard Sword:
- Physical damage
- No affinity

Fire-enchanted Battle Axe:
- Physical damage
- Fire affinity

Flameblade:
- Magic damage
- Fire affinity

Arcane Wand:
- Magic damage
- Arcane affinity

Physical Scythe:
- Physical damage
- No affinity or a non-elemental physical status if already supported

Void Scythe:
- Physical or Magic damage according to its actual design
- Void affinity

Do not treat Magic and Arcane as the same thing.

Magic is a damage type.

Arcane is one elemental affinity.

Inspect whether BLADEFALL already separates these concepts and modify only what is necessary.

==================================================
LOCKED ELEMENTAL AFFINITIES
==================================================

The finalized active affinity list is:

- Fire
- Frost
- Poison
- Arcane
- Holy
- Void

Storm is not part of the finalized active affinity chart.

The locked opposition pairs are:

- Fire opposite Frost
- Poison opposite Arcane
- Holy opposite Void

An affinity-aligned enemy should generally:

- Resist its own affinity
- Be weak to its opposing affinity

Examples:

Fire enemy:
- Resists Fire
- Weak to Frost

Frost enemy:
- Resists Frost
- Weak to Fire

Poison enemy:
- Resists Poison
- Weak to Arcane

Arcane enemy:
- Resists Arcane
- Weak to Poison

Holy enemy:
- Resists Holy
- Weak to Void

Void enemy:
- Resists Void
- Weak to Holy

Do not create a larger circular weakness wheel.

Do not invent additional affinities.

Do not add complete immunities unless BLADEFALL already uses them for a specific and intentional reason.

Inspect the existing weakness and resistance values and derive appropriate final values from the game's current balance.

Do not blindly use outside percentages.

==================================================
LOCKED AFFINITY COLOR LANGUAGE
==================================================

Preserve or align the system with these established BLADEFALL colors when practical:

FIRE
- Main: #FF7A3A
- Core: #FFD07A
- Dark: #6E241D

FROST
- Main: #7FD6FF
- Core: #E3FAFF
- Dark: #244A67

POISON
- Main: #86E05A
- Core: #D9FF9A
- Dark: #35592C

ARCANE
- Main: #C47BFF
- Core: #E1B9FF
- Dark: #553275

HOLY
- Main: #FFE9A8
- Core: #FFF8D6
- Dark: #8C743D

VOID
- Main: #8F52D6
- Core: #D69BFF
- Dark: #352044

PHYSICAL UI LANGUAGE
- Main: #B8B8B8
- Highlight: #E2E2E2
- Dark: #4F5560

MAGIC UI LANGUAGE
- Main: #C7B7E8
- Highlight: #EEE7FF
- Dark: #554873

Do not communicate affinities by color alone.

Use existing or appropriate icons alongside affinity colors where the current UI supports them.

Suggested icon concepts:

- Fire: flame
- Frost: snowflake or ice shard
- Poison: fang or venom drop
- Arcane: rune
- Holy: sunburst
- Void: broken eclipse

==================================================
LOCKED ELEMENTAL STATUS IDENTITIES
==================================================

Each affinity has a recognizable stack-based status identity.

These identities are locked:

- Fire → Burn stacks
- Frost → Chill stacks
- Poison → Venom stacks
- Arcane → Rune Marks
- Holy → Radiance stacks
- Void → Corruption stacks

The conceptual roles below are locked.

Exact values such as:

- Stack limits
- Buildup values
- Durations
- Damage ticks
- Detonation values
- Cooldowns
- Boss modifiers
- Scythe bonuses

must be derived from BLADEFALL's current combat balance and architecture.

Do not blindly insert arbitrary outside numbers.

If an existing mechanic already fulfills the intended role, preserve and adapt it rather than creating a redundant second mechanic.

==================================================
FIRE — BURN STACKS
==================================================

Fire attacks apply Burn stacks.

Core identity:

- Burn deals damage over time.
- Repeated Fire attacks add or refresh Burn.
- Reaching maximum Burn should create a clear offensive payoff.
- That payoff may be an Ignition, combustion burst, enhanced Burn state, or the closest existing equivalent.
- If BLADEFALL already has a Fire-stack payoff, preserve or adapt it.
- Heavy attacks, charged attacks, skills, or explicitly designated attacks may trigger the payoff if that fits existing mechanics.
- Rapid multi-hit attacks and persistent hitboxes must not repeatedly trigger unlimited maximum-stack payoffs.

Combat role:

- Sustained offensive pressure
- Damage over time
- Strong against regenerating enemies
- Opposes Frost

Inspect:

- Existing Burn behavior
- Existing Fire damage-over-time logic
- Stack limits
- Tick damage
- Durations
- Refresh rules
- Existing Fire detonations
- Boss handling
- Multi-hit safeguards
- Existing Fire VFX and UI

==================================================
FROST — CHILL STACKS
==================================================

Frost attacks apply Chill stacks.

Core identity:

- Each Chill stack progressively slows the target.
- Chill should primarily reduce movement speed.
- It may also modestly affect attack speed if BLADEFALL already supports this cleanly.
- Reaching maximum Chill briefly Freezes normal enemies.
- Bosses and major enemies should not normally become fully frozen.
- Against bosses, maximum Chill should instead cause a stronger temporary slow, stagger opportunity, or the closest compatible existing effect.
- Freeze must not create permanent crowd-control loops.

Combat role:

- Crowd control
- Defensive spacing
- Slowing dangerous enemies
- Opposes Fire

Inspect:

- Existing Frost behavior
- Slow mechanics
- Current stack limits
- Freeze logic
- Crowd-control resistance
- Boss crowd-control handling
- Reapplication immunity
- Diminishing returns
- Existing Frost VFX and UI

==================================================
POISON — VENOM STACKS
==================================================

Poison attacks apply Venom stacks.

The player-facing and active gameplay terminology must be:

- Venom
- Venom stack
- Venom stacks
- Venom damage

Do not use Blight as the standard Poison-status name.

Core identity:

- Each Venom stack deals persistent Poison damage.
- Additional applications add stacks and refresh or extend the status according to the existing status architecture.
- Venom becomes increasingly valuable during longer fights.
- At high or maximum Venom stacks, enemy healing and regeneration should be reduced.
- Venom does not require a universal explosion.
- Individual weapons may have unique Venom interactions, but those do not redefine the base status.

Combat role:

- Attrition
- Long-fight damage
- Anti-healing
- Anti-regeneration
- Opposes Arcane

Inspect:

- Existing Poison behavior
- Existing Blight names or identifiers
- Existing stack and damage-over-time systems
- Stack limits
- Durations
- Refresh rules
- Enemy healing and regeneration
- Poison resistance
- Save data containing old Poison or Blight statuses
- Existing Poison VFX and UI

Preserve existing values where appropriate while migrating active terminology to Venom.

==================================================
ARCANE — RUNE MARKS
==================================================

Arcane attacks apply Rune Marks.

Core identity:

- Rune Marks are setup resources placed on enemies.
- Marks remain until consumed, expired, cleared, or otherwise resolved through the game's current rules.
- Charged attacks, Mage abilities, Spellblade releases, or specifically designated Arcane attacks consume Rune Marks.
- Consuming marks increases damage or strengthens the consuming attack.
- More consumed marks produce a larger payoff.
- Not every Arcane hit should automatically consume marks.
- Arcane should reward setup followed by a deliberate payoff.

Combat role:

- Setup and payoff
- Combo-oriented magical damage
- Planned burst
- Opposes Poison

Inspect:

- Existing Arcane behavior
- Existing mark, combo, charge, or detonation systems
- Enemy debuff storage
- Charged attacks
- Mage abilities
- Spellblade architecture
- Boss handling
- UI support for enemy marks
- Performance cost of per-enemy marks
- Existing Arcane VFX and UI

Reuse existing infrastructure whenever practical.

==================================================
HOLY — RADIANCE STACKS
==================================================

Holy attacks apply Radiance stacks.

Core identity:

- Radiance represents purification building on a target.
- Reaching maximum Radiance should trigger a purification payoff.
- The payoff may include:
  - A Holy burst
  - An Exposed state
  - Increased Holy vulnerability
  - The closest compatible existing Holy interaction
- Defeating a fully affected enemy may create a small restorative reward, such as a healing mote, if that fits BLADEFALL's existing healing and drop systems.
- Any restorative reward must have safeguards against infinite healing loops.
- Ian's Blade may eventually have a stronger or unique Radiance interaction.
- Do not redesign Ian's Blade during this update unless its existing implementation directly conflicts with the finalized system.

Combat role:

- Purification
- Anti-Void
- Controlled sustain
- Opposes Void

Inspect:

- Existing Holy behavior
- Existing Exposed or vulnerability effects
- Existing healing-mote or on-kill systems
- Undead, cursed, demonic, Holy, and Void enemy tags
- Healing balance
- Boss safeguards
- Ian's Blade implementation
- Existing Holy VFX and UI

If restorative motes would require an inappropriate unrelated system, choose the closest grounded implementation and document the decision.

==================================================
VOID — CORRUPTION STACKS
==================================================

Void attacks apply Corruption stacks.

Core identity:

- Corruption prepares enemies for Reaper or Void payoff mechanics.
- Reaching maximum Corruption primes a target for Rupture or the closest existing execution-style effect.
- A qualifying Reaper attack, charged Scythe attack, ability, or designated Void attack triggers the payoff.
- The payoff should create:
  - Additional damage
  - Improved execution value
  - A Reaper-specific advantage
  - Or the closest compatible existing mechanic
- Defeating a fully Corrupted or Ruptured target may restore a small amount of health if compatible with existing Reaper sustain mechanics.
- Void attacks may support controlled pulling or grouping where that behavior already exists or can be added cheaply.
- Bosses and large enemies may resist displacement without resisting Corruption buildup itself.

Combat role:

- Reaper setup
- Execution
- Pulling or grouping
- Predatory sustain
- Opposes Holy

Inspect:

- Existing Void behavior
- Existing Reaper healing
- Existing execution mechanics
- Pull effects
- Large-enemy displacement resistance
- Rupture-like mechanics
- Boss handling
- Existing Void VFX and UI

Do not add a redundant execution, pulling, or healing system if a suitable one already exists.

==================================================
LOCKED SCYTHE ELEMENTAL SPECIALIZATION
==================================================

Scythes should be the strongest weapon family for applying elemental stacks.

This is a locked core identity of Reaper.

It applies across:

- Burn
- Chill
- Venom
- Rune Marks
- Radiance
- Corruption

Required outcome:

- At comparable item power and realistic combat opportunity, Scythes should apply elemental statuses more effectively than other weapon families.
- This does not mean Scythes automatically deal the highest direct damage.
- Reaper's identity is broad, efficient elemental-stack application through sweeping Scythe attacks.

Do not assume one arbitrary global multiplier before inspecting the existing system.

First determine how BLADEFALL currently handles status application:

- Flat buildup values
- Guaranteed stack application
- Proc chances
- Per-hit stack values
- Shared buildup meters
- Attack-specific buildup
- Weapon-specific status bonuses
- Skill-specific application
- Separate logic for Rune Marks
- Separate logic for damage-over-time statuses

Choose the smallest consistent implementation that fits the current architecture.

SCYTHE IDENTITY

Scythes should generally offer:

- Broad sweeping coverage
- Strong multi-target status application
- Better elemental buildup than comparable weapons
- Reaping, pull, execute, spread, rupture, or sustain interactions where supported
- Moderate direct damage relative to their utility
- Reaper-exclusive behavior

OTHER CLASS IDENTITIES

Warrior:
- Stronger direct physical impact
- Better stagger
- Heavy attacks
- Lower normalized elemental buildup than Scythes

Ranger:
- Precision
- Mobility
- Ranged safety
- Rapid status application through attack speed or accuracy
- Throwing Knives may apply rapidly, but Scythes should remain superior in normalized elemental-stack efficiency

Mage:
- Broad elemental access
- Ranged spell delivery
- Charged attacks
- Elemental detonations or specialized interactions
- Scythes should remain better at raw stack application when compared at similar item power

Safeguards:

- Compare buildup over time, not merely buildup per hit.
- Rapid multi-hit Scythes must not become unintentionally broken.
- Persistent hitboxes must not apply full stacks every frame.
- One attack instance should have a sensible per-target buildup limit.
- Wide Scythe attacks may efficiently apply stacks to multiple different enemies.
- Bosses may resist buildup, but Scythes should retain their relative specialization.
- Rune Marks may need distinct handling from ordinary status buildup.
- Direct damage and elemental buildup should remain separately tunable.

The self-prompt must explain:

1. How status application currently works
2. How each of the six statuses currently works
3. Which agreed concepts already exist
4. Which concepts require modification
5. How Scythes will gain their relative stack advantage
6. What values were chosen
7. What existing values justified those choices
8. How attack speed was considered
9. How multi-hit abuse is prevented
10. How bosses handle each status
11. How status stacks appear in the UI
12. What save migrations are required

==================================================
LONG-TERM ELEMENTAL SCYTHE SUPPORT
==================================================

The system should support distinct Scythes for all six affinities and Physical damage.

These are design references, not automatic instructions to add every item during this update.

Do not add them all unless the current task and codebase already include or require them.

Possible roster:

PHYSICAL — GRAVEHOOK
- Physical or Bleed-oriented
- Broad reap
- Execution identity

FIRE — CINDER REAPER
- Burn specialization
- Fire-sweep behavior if supported

FROST — HOARFANG
- Chill specialization
- Control identity

POISON — PESTILENT HARVESTER
- Venom specialization
- Potential Venom spread if supported

ARCANE — RUNIC CRESCENT
- Rune Mark specialization
- Charged mark consumption if supported

HOLY — DAWN REAPER
- Radiance specialization
- Anti-Void or purification identity
- Must never visually outshine Ian's Blade

VOID — VOID SCYTHE
- Corruption specialization
- Pull, rupture, or sustain identity where supported
- Signature shop weapon if that is still consistent with the current game

Future Scythes should differ in actual weapon design, not simply color:

- Blade profile
- Blade thickness
- Curvature
- Segmentation
- Haft construction
- Counterweight
- Material language
- Elemental behavior
- Attack interaction

==================================================
STAGE 1 — REQUIRED CODEBASE INSPECTION
==================================================

Before changing code, inspect all relevant parts of BLADEFALL.

Find and understand:

- Class definitions
- Class selection
- Class restrictions
- Weapon-family identifiers
- Weapon item definitions
- Every existing weapon
- Starting weapons
- Attack implementations
- Charged attacks
- Alternate attacks
- Melee hitboxes
- Projectiles
- Persistent attack zones
- Damage calculations
- Physical damage
- Magic damage
- Elemental damage
- Elemental affinities
- Status effects
- Status stacking
- Enemy resistances
- Enemy weaknesses
- Boss modifiers
- Loot generation
- Procedural item generation
- Enemy drops
- Shops
- Smithing
- Fusion
- Upgrades
- Quest rewards
- Boss rewards
- Unlock systems
- Inventory UI
- Equipment UI
- Shop UI
- Tooltip UI
- Comparison UI
- Status-effect UI
- Enemy status indicators
- Save serialization
- Save loading
- Save migration
- Debug tools
- Achievements or quests tied to weapon types
- Any hidden string comparisons or switch statements

Search all references to:

- dagger
- daggers
- throwing knife
- throwing knives
- saber
- sword
- greatsword
- battle axe
- warhammer
- longbow
- crossbow
- javelin
- staff
- wand
- scepter
- spellblade
- flameblade
- frostbrand
- runeblade
- scythe
- fire
- frost
- poison
- blight
- venom
- arcane
- rune
- holy
- radiance
- void
- corruption
- storm
- lightning
- physical
- magic
- affinity
- resistance
- weakness
- buildup
- stack
- status

Do not rely only on obvious item-definition sections.

Look for hidden dependencies in:

- Shops
- Loot pools
- Quests
- Tutorial text
- Boss drops
- Starting equipment
- Smithing recipes
- Fusion recipes
- Achievements
- Save data
- UI labels
- Enemy AI
- Skill trees
- Subclasses
- Debug commands

==================================================
REQUIRED CURRENT-WEAPON AUDIT
==================================================

Create an audit of every current weapon.

For each weapon, identify:

1. Current item name
2. Current internal identifier
3. Current weapon family
4. Current class
5. Current attack behavior
6. Current charged or alternate behavior
7. Current damage type
8. Current affinity
9. Current status application
10. Current acquisition sources
11. Whether it can exist in saves
12. Whether it fits the finalized structure
13. Proposed action:
   - Keep
   - Rename
   - Reclassify
   - Convert
   - Retire from acquisition
   - Preserve only for migration
   - Remove

Do not assume preservation is preferable to removal.

==================================================
REQUIRED ELEMENTAL-SYSTEM AUDIT
==================================================

Document the current elemental system:

1. Existing damage types
2. Existing affinities
3. Existing affinity identifiers
4. Existing status effects
5. Existing stack caps
6. Existing stack durations
7. Existing buildup logic
8. Existing damage-over-time behavior
9. Existing detonation behavior
10. Existing slows and crowd control
11. Existing marks or debuffs
12. Existing healing or sustain interactions
13. Existing enemy affinities
14. Existing weaknesses
15. Existing resistances
16. Existing boss modifiers
17. Existing UI representation
18. Existing VFX representation
19. Existing save representation
20. Existing Storm content
21. Existing Blight terminology
22. Existing Poison terminology

Do not guess when the code can answer these questions.

==================================================
STAGE 1 — WRITE A GROUNDED SELF-PROMPT
==================================================

After inspection, write a detailed implementation prompt addressed to yourself.

That self-prompt must contain:

1. A summary of BLADEFALL's current implementation
2. The exact code sections or systems requiring changes
3. The current weapon-family list
4. The current weapon roster
5. A weapon-by-weapon decision table
6. The exact plan for merging Daggers into Throwing Knives
7. The exact plan for removing or migrating Saber
8. The exact plan for consolidating Scepters into Wand where appropriate
9. The exact plan for adding or formalizing Spellblade
10. The exact plan for keeping Scythes Reaper-exclusive
11. The plan for Physical and Magic damage types
12. The plan for separating damage type from affinity
13. The plan for the six finalized affinities
14. The plan for removing Storm as an active affinity
15. A deliberate decision for every existing Storm weapon, enemy, skill, VFX, status, and save value
16. The plan for Fire ↔ Frost
17. The plan for Poison ↔ Arcane
18. The plan for Holy ↔ Void
19. The plan for Burn stacks
20. The plan for Chill stacks
21. The plan for Venom stacks
22. The plan for Rune Marks
23. The plan for Radiance stacks
24. The plan for Corruption stacks
25. The grounded implementation of Scythe elemental specialization
26. Multi-hit and persistent-hitbox safeguards
27. Boss handling for every status
28. UI and tooltip changes
29. Loot-generation changes
30. Shop changes
31. Smithing and fusion changes
32. Reward and drop changes
33. Save migration
34. Testing requirements
35. Rollback-safe implementation order
36. Any genuine conflicts or ambiguities found

Do not insert speculative mechanics merely because they sound attractive.

Do not invent arbitrary values.

Where a number is required:

- Compare it to current BLADEFALL values
- Explain the baseline
- Explain why the chosen value is appropriate
- Consider attack speed, area coverage, range, and direct damage
- Consider bosses separately from normal enemies

==================================================
STAGE 2 — EXECUTE THE SELF-PROMPT
==================================================

After writing the grounded self-prompt, immediately use it as your implementation instructions.

Do not replace it with a looser interpretation.

Make the smallest cohesive update that satisfies the locked decisions.

Preserve unrelated working systems.

Do not redesign the entire combat engine.

Do not generate new weapon art.

Do not add unrelated polish.

If the current code already implements part of the desired system well, preserve and integrate it.

==================================================
BACKWARD-COMPATIBILITY REQUIREMENTS
==================================================

Inspect actual legacy identifiers before creating migration mappings.

Likely migrations may include concepts such as:

- Dagger family → Throwing Knives family
- Scepter family → Wand family, where mechanically appropriate
- Saber → removal, retirement, or deliberate reclassification
- Blight terminology → Venom terminology
- Storm affinity → deliberate per-item conversion or retirement
- Existing magical swords → Spellblade family

Do not create blind mappings without checking actual identifiers.

For every changed identifier:

- Preserve old saves when reasonably possible
- Prevent obsolete categories from returning to active loot generation
- Avoid silently deleting valuable owned items
- Preserve item power and upgrade levels where practical
- Document any item that cannot be migrated safely

Legacy identifiers may remain only as migration aliases.

They should not remain active player-facing categories.

==================================================
STORM-CONTENT REQUIREMENTS
==================================================

Storm is not part of the finalized affinity list.

Audit every Storm-related:

- Weapon
- Enemy
- Skill
- Projectile
- Status
- Visual effect
- Tooltip
- Resistance
- Weakness
- Loot rule
- Save value

For each Storm item or mechanic, decide whether it should be:

- Converted to Arcane
- Converted to another affinity
- Made non-elemental Magic
- Retired from acquisition
- Removed
- Preserved as visual flavor without being an affinity
- Migrated only for old saves

Do not automatically convert everything to Arcane.

Base each decision on its actual mechanics and role.

Document every decision.

==================================================
TOOLTIPS AND UI
==================================================

Damage type and affinity should be represented separately where appropriate.

Conceptual example:

FLAMEBLADE

Spellblade · Mage

Damage:
Magic

Affinity:
Fire

Status:
Burn

Buildup:
Use the actual game's stat representation

The exact tooltip layout should follow the existing UI rather than forcing a completely new design.

At minimum, players should be able to understand:

- Weapon family
- Class
- Physical or Magic damage
- Affinity, if any
- Status applied
- Relevant buildup or special interaction
- Class restrictions
- Important alternate or charged behavior

Use text and icons in addition to color.

Status stacks should be readable on phones.

Do not clutter the UI with unnecessary numbers if the current interface is intentionally streamlined.

==================================================
PERFORMANCE REQUIREMENTS
==================================================

BLADEFALL is a lightweight mobile-compatible single-file WebGL game.

Preserve performance.

Prefer:

- Existing status systems
- Existing VFX
- Shared data structures
- Cached lookups
- Compact affinity values
- Pooled status indicators
- Attack-instance tracking
- Simple stack counters
- Existing UI elements

Avoid:

- Per-frame object allocation
- A new entity for every status tick
- Excessive particles
- Full stack application every collision frame
- Duplicate status systems
- Heavy runtime reflection
- Unnecessary data duplication
- Large asset additions
- Unbounded debuff arrays

Persistent hitboxes and damage zones must not apply full stacks every frame unless that behavior is deliberately rate-limited.

==================================================
REQUIRED VALIDATION
==================================================

After implementation, validate at minimum:

WEAPON FAMILIES

- Warrior generates only Sword, Greatsword, Battle Axe, and Warhammer
- Ranger generates only Throwing Knives, Longbow, Crossbow, and Javelins
- Mage generates only Staff, Wand, and Spellblade
- Reaper generates only Scythe
- Daggers no longer appear as an independent active family
- Throwing Knives correctly represent the merged knife family
- Saber no longer appears as an active family
- Scepter no longer appears as an independent active family
- Spellblade exists as a Mage family
- Scythes remain Reaper-exclusive
- Obsolete weapons were deliberately handled
- No obsolete category remains accidentally obtainable

DAMAGE AND AFFINITIES

- Physical and Magic are represented separately
- Affinity is represented separately from damage type
- Fire is active
- Frost is active
- Poison is active
- Arcane is active
- Holy is active
- Void is active
- Storm is not an active affinity
- Fire and Frost oppose each other
- Poison and Arcane oppose each other
- Holy and Void oppose each other
- Neutral affinities behave normally
- Resistances and weaknesses do not unintentionally stack twice

STATUS EFFECTS

- Fire correctly applies Burn stacks
- Maximum Burn resolves through the selected grounded payoff
- Frost correctly applies Chill stacks
- Maximum Chill affects normal enemies appropriately
- Bosses cannot be permanently frozen
- Poison uses Venom terminology everywhere
- Venom stacks correctly apply persistent damage
- High or maximum Venom affects healing or regeneration where applicable
- Arcane applies Rune Marks
- Only designated attacks consume Rune Marks
- More Rune Marks produce an appropriate larger payoff
- Holy applies Radiance
- Maximum Radiance produces a grounded purification payoff
- Void applies Corruption
- Maximum Corruption produces a grounded Reaper or Void payoff
- Every status is visually and mechanically distinguishable
- Old Blight data migrates safely where relevant

SCYTHES

- Scythes apply elemental stacks better than comparable non-Scythe weapons
- The comparison considers attack speed and realistic damage uptime
- Scythes do not automatically outperform every class in direct damage
- Wide Scythe attacks apply statuses effectively to multiple enemies
- One Scythe attack cannot apply unintended stacks repeatedly every frame
- Persistent Scythe effects are rate-limited correctly
- Rune Mark application through Scythes behaves consistently
- Boss buildup remains balanced while preserving Scythe specialization

ACQUISITION AND DATA

- Loot generation respects the finalized families
- Shops respect the finalized families
- Smithing respects the finalized families
- Fusion respects the finalized families
- Starting equipment respects the finalized families
- Enemy drops respect the finalized families
- Quest rewards respect the finalized families
- Boss rewards respect the finalized families
- Tooltips display the correct family
- Tooltips display the correct damage type
- Tooltips display the correct affinity
- Existing valid saves continue to load
- Legacy identifiers migrate correctly
- Removed categories do not reappear after loading old saves

PERFORMANCE

- Combat remains performant on phones
- Status updates do not allocate excessive objects
- Persistent hitboxes do not apply statuses every frame
- Status indicators remain readable without excessive rendering cost
- No unrelated combat behavior was changed

==================================================
DEBUG AND TEST SUPPORT
==================================================

Use BLADEFALL's existing debug infrastructure if available.

Where reasonable, provide a method to test:

- Each finalized weapon family
- Physical damage
- Magic damage
- Every affinity
- Every status
- Maximum stacks
- Normal enemies
- Bosses
- Weaknesses
- Resistances
- Scythe buildup
- Non-Scythe buildup
- Multi-hit attacks
- Persistent hitboxes
- Old save migrations
- Removed weapon families

Do not build a large permanent debug UI if a lightweight console command or existing panel is sufficient.

==================================================
HANDLING GENUINE UNCERTAINTY
==================================================

Do not ask the user questions that the code can answer.

If a consequential design decision truly cannot be resolved through the existing game, stop before implementing that specific decision and report:

1. What you found
2. Why the code does not resolve it
3. The smallest viable options
4. Your recommendation
5. What changes under each option

Continue implementing every non-blocked part.

Do not use uncertainty about one detail as a reason to avoid the entire update.

==================================================
FINAL ACCEPTANCE CRITERIA
==================================================

The update is complete when:

- Active weapon families match the finalized class chart
- Daggers are merged into Throwing Knives
- Throwing Knives is the surviving family name
- Saber is not an active family
- Scepter is not an active family
- Spellblade is an active Mage family
- Scythe is Reaper-exclusive
- Existing inappropriate weapons were deliberately handled
- Physical and Magic are distinct damage types
- Affinity is separate from damage type
- Fire, Frost, Poison, Arcane, Holy, and Void are the only active affinities
- Storm is no longer an active affinity
- Fire opposes Frost
- Poison opposes Arcane
- Holy opposes Void
- Fire applies Burn stacks
- Frost applies Chill stacks
- Poison applies Venom stacks
- Arcane applies Rune Marks
- Holy applies Radiance stacks
- Void applies Corruption stacks
- Scythes are the strongest weapon family for elemental-stack application
- Scythe buildup is balanced against attack speed, range, area, and direct damage
- Loot, shops, rewards, smithing, fusion, and UI follow the finalized structure
- Legacy saves and items are migrated deliberately
- Obsolete categories do not remain accidentally obtainable
- Mobile performance remains acceptable
- No unrelated system was redesigned

==================================================
FINAL REPORT
==================================================

At the end, report:

1. The grounded self-prompt you generated
2. What BLADEFALL previously contained
3. The previous weapon-family structure
4. The final weapon-family structure
5. Every weapon retained
6. Every weapon renamed
7. Every weapon reclassified
8. Every weapon retired
9. Every weapon removed
10. How Daggers were merged into Throwing Knives
11. How Saber content was handled
12. How Scepter content was handled
13. How Spellblades were implemented
14. How Physical and Magic were separated
15. How affinities were represented
16. Every Storm-content decision
17. How Burn was implemented
18. How Chill was implemented
19. How Venom was implemented
20. How Rune Marks were implemented
21. How Radiance was implemented
22. How Corruption was implemented
23. How Scythe elemental specialization was implemented
24. Exact balance values selected
25. What existing values justified those selections
26. How multi-hit and persistent-hitbox abuse was prevented
27. How bosses handle each status
28. Save migrations added
29. Loot, shop, reward, smithing, and fusion changes
30. UI and tooltip changes
31. Tests performed and results
32. Any unresolved concerns
33. Optional future work, clearly separated from completed work

The priority is a grounded implementation based on the actual BLADEFALL code — not assumptions from an outside design document.
