# Bladefall World Rebuild Program

Status: ACTIVE
Owner direction: Oliver approved the full world-quality rebuild on 2026-07-20.

## Locked outcome

Rebuild all eight Main Levels and seven exploration Trial Chambers into large, beautiful, memorable worlds. District count is intentionally generous. Added scale must never become long empty walks: every travel segment must earn its space through landscape composition, navigation choice, combat, traversal, quest activity, discovery, story, reward, spectacle, or purposeful quiet.

Main Levels receive optional quests alongside mandatory progression. Optional quests must divert players into authored exploration, combat, traversal, puzzles, or revisits and award unique named equipment, cosmetics, permanent discoveries, or curated chest loot. They never gate the golden path.

Preserve destination IDs, progression, saves, boss routing, bestiary credit, Waystation routing, and compact class/tutorial trial difficulty.

## Quality bar for every Main Level

- Generous authored district count; target 7-10 where the setting supports it.
- 25-40 minute exploratory first clear and a much shorter mastered route.
- One readable golden path, two or more meaningful branches, and at least one opened return shortcut.
- Three signature set pieces, two purposeful quiet/scenic beats, and strong boss foreshadowing.
- Tactical encounter composition tied to terrain; traversal-only hazards remain readable and fair.
- 8-12 meaningful secrets, including visible-but-unreachable movement-upgrade revisits.
- At least two optional quests with unique or curated rewards.
- Interiors wherever architecture implies usable interior space.
- Distinct skyline, landmarks, construction language, soundscape, lighting arc, and environmental story.
- No copied districts and no empty expansion padding.

## Quality bar for exploration Trial Chambers

- 4-7 authored districts where appropriate.
- 15-25 minute exploratory first clear.
- One central mechanical identity, a major route decision, signature traversal, optional challenge route, named elite, and memorable final chamber.
- 4-7 secrets and at least one optional objective or reward route.
- Remain distinct from compact class/tutorial trials.

## Shared systems before mass production

1. District graph and metrics: named districts, route edges, shortcuts, checkpoints, encounters, secrets, objectives, and landmarks.
2. Highest-valid-surface placement for enemies, drops, chests, portals, quest objects, and NPCs.
3. Authored encounter definitions with tactical role, reinforcement entry, arena safety, reward, and completion state.
4. Multi-quest expedition objectives supporting optional discovery, progress persistence, named rewards, HUD display, and reset rules.
5. Movement-upgrade secret requirements and visible revisit clues.
6. District-aware rendering, LOD, enemy sleeping, and effect budgets.
7. Automated measurements for bounds, route time, district activity coverage, and placement validity.

## Release sequence

1. The Outskirts + The Thornwood — world-quality vertical slice.
2. Hollow Pass + The Sunken Wash.
3. Ruined Keep + The Oubliette.
4. Frostfell + The Glacier Vault.
5. Emberdeep + The Magma Core.
6. The Abyss + The Reaper's Gate.
7. Sunspire Palace + The Sealed Reliquary.
8. Castle Duskmoor — standalone finale pass and complete progression regression.

Every pair is independently browser-tested, versioned, committed, pushed, deployed, and measured before the next pair begins. Never keep a half-finished destination live.

## Five gates for every destination

### 1. World brief

Lock emotional journey, districts, landmark map, route graph, mechanics, enemy ecology, optional quests, secrets, set pieces, boss buildup, and rewards.

### 2. Structural build

Build terrain, elevation, routes, branches, shortcuts, checkpoints, parkour, sightlines, and objective locations. Prove navigation before decoration.

### 3. Gameplay build

Add authored encounters, missions, elites, chests/mimics, upgrade-gated secrets, environmental mechanics, quiet beats, and boss foreshadowing.

### 4. World-art build

Apply Plan A voxel detail, zone construction kit, interiors, vegetation, props, weather, lighting, particles, sound, and environmental storytelling.

### 5. Verification

Test first-clear and mastered routes, branches, secrets, upgrade requirements, encounter footing, placement, checkpoints, death, old saves, boss trigger, zone clear, camera, and performance at 1920x1080, 1600x900, and 1366x768.

## Active vertical slice: Outskirts + Thornwood

Outskirts districts: Old South Road, Sunward Prairie, West Cornlands, Eastwood Orchard, Foxglove Copse, Miller River Crossing, North Bank Commons, Riverside Hamlet, Windmill Rise, Dreaming Expanse, Old Waystone Crown.

Initial optional quests:

- Answer the scattered caravan signals — discovery-based rescue route through the caravan, orchard canopy, and hamlet; unique reward: Caravaner's Compass.
- Recover the watermill gearworks — river machinery and Windmill Rise traversal; unique reward: Millwright's Signet.

Next Outskirts work:

- Replace remaining primitive settlement composition with authored farm/village architecture and usable interiors.
- Add a Thornboar stampede set piece, watermill state change, and final Waystone reveal sequence.
- Add district-specific encounter definitions rather than loose packs.
- Add opened shortcuts and clearer movement-upgrade revisit secrets.
- Add quiet vistas and environmental story beats between activity clusters.
- Measure route density so no connector becomes an uneventful walk.

Then rebuild Thornwood to the same bar before shipping the pair-completion milestone.

## Definition of done

A destination is not done because it is large. It is done when players remember its places, make route choices, discover optional content, experience setting-specific combat and traversal, understand where they are going, receive worthwhile rewards, and want to revisit after gaining movement upgrades.
