# BLADEFALL — 5× World Expansion

**Owner direction:** Every exploration destination should feel like a world rather than a short combat lane. Expand meaningful walkable space and traversal time by approximately five times. Do not achieve this by uniformly scaling coordinates, stretching empty corridors, or copying existing rooms and decorations.

## Scope

Expand all 15 exploration destinations:

- Main path: The Outskirts, Hollow Pass, Ruined Keep, Frostfell, Emberdeep, The Abyss, Sunspire Palace, Castle Duskmoor.
- Trial Chambers: The Thornwood, The Sunken Wash, The Oubliette, The Glacier Vault, The Magma Core, The Reaper's Gate, The Sealed Reliquary.

“Trial Chambers” in this order means the seven former secret/side exploration destinations listed above. They are distinct from the compact tutorial/class trials. Do not expand or rebalance tutorial/class trials in this order. The Waystation itself is expanded separately under Oliver's later explicit direction; preserve its destination IDs and progression routing. Preserve all existing destination IDs, progression flags, quests, secrets, bosses, bestiary credit, saves, and Waystation routes.

## Non-negotiable interpretation of “5× bigger”

- Target roughly 4–6× the current first-clear traversal time and meaningful route length for each destination, measured with combat disabled and again during a representative first-clear combat run.
- At least 70% of added walkable space must contain a decision, encounter, traversal challenge, discoverable landmark, story beat, objective, reward, shortcut, or secret clue. Empty distance is not content.
- Every main destination needs 4–6 visually and mechanically distinct districts connected as one coherent place. Every side destination needs 3–5.
- Each destination needs at least one branching route, one unlockable return shortcut, one checkpoint/rest point, two optional secrets, one authored surprise encounter, one traversal set piece, and one local mission beyond “kill N enemies.”
- Never duplicate a district wholesale. Shared primitives are allowed; composition, route shape, encounter logic, landmarks, and objectives must be authored for that destination.
- Parkour must be readable and fair with the normal jump. Magic Socks may reveal optional premium routes/rewards but must never be required for completion.
- Ambushes must be surprising but fair: environmental foreshadowing or a brief readable tell before damage; never spawn unavoidable damage directly on the player.
- Use occlusion, district activation, and encounter sleeping so the 5× spaces do not render or simulate everything simultaneously.

## Destination identities

### The Outskirts — The Last Road

Expand through a broken caravan road, abandoned farmstead, windmill ridge, occupied hamlet, and the dreaming field. Add a caravan-survivor rescue mission, tall-grass flanking ambushes, rooftop/barn traversal, a mill mechanism that opens a cellar shortcut, and a secret shrine reached by following displaced scarecrows.

### Hollow Pass — The Canyon That Breathes

Build lower wash, switchback ascent, watcher rim, suspended bridge basin, and wind-carved gate. Add beacon relighting across both canyon elevations, gust-timed cliff traversal, telegraphed rockfall chases, rim snipers supporting floor packs, and a cave shortcut opened from above.

### Ruined Keep — The Broken Siege

Create outer siege camp, breached curtain wall, prison yard, battlements, great hall approach, and undercroft. Add prisoner liberation, a working portcullis/ballista objective, battlement-to-courtyard crossfire, collapsing siege-tower traversal, and a concealed drainage infiltration route.

### Frostfell — Whiteout Expanse

Create frozen lake, buried village, ice gorge, aurora caverns, and summit approach. Add a lost-expedition recovery mission, temporary shelter/brazier navigation during whiteout pulses, cracking-ice route choices, an avalanche escape set piece, ice-slide parkour, and a thawed cavern shortcut.

### Emberdeep — The Living Foundry

Create ash mine, chain lifts, slagworks, ancient forge city, caldera rim, and heart-forge approach. Add pressure-valve stabilization, mine-cart/chain-lift traversal, eruption-timed cover, magma-skitter trail ambushes, a forge-routing puzzle, and a cooling-channel shortcut.

### The Abyss — The Fractured Descent

Create broken causeway, hanging ruins, echo chasm, inverted shrine, and king's ascent. Add anchor-rune restoration, appearing/disappearing void bridges with strong tells, vertical shadow-step-style environmental lifts usable by every class, enemy echoes that reenact prior fights, and a hidden route exposed by watching constellation patterns.

### Sunspire Palace — The Weaponized Sun

Create pilgrim terrace, garden courts, mirrored galleries, servant passages, throne promenade, and solar apex. Add sun-mirror redirection, rotating light/shadow safe lanes, ceremonial-guard formations, a servant-route stealth/avoidance alternative, mosaic clue secrets, and a palace-defense mission that changes later encounters.

### Castle Duskmoor — The Castle That Remembers

Create drowned approach, village ward, banquet wing, portrait gallery, moonlit ramparts, crypt, and throne tower. Add haunt-state room transformations, portrait-order investigation, bell-tower traversal, vampire-style pincer ambushes with warning shadows, a crypt shortcut, and one optional wing whose resolution changes the boss approach.

### The Thornwood — The Moving Hunt

Create strangled trail, canopy route, hunter camp, root cathedral, and heart grove. Add moving root walls, prey-tracking clues, canopy parkour, vine-snare counterplay, a hunted-survivor escort that uses safe clearings, and a burrow shortcut.

### The Sunken Wash — Beneath the Floodline

Create collapsed wash, fossil shelf, drowned settlement, sluice tunnels, and bone basin. Add sluice-gate water-level routing, timed dry passages, bone-slide traversal, scavenger ambush holes with visible traces, relic recovery, and a high-water/low-water secret pair.

### The Oubliette — The Forgotten Prison

Create intake cells, chain galleries, punishment pit, records vault, warden walk, and escape shaft. Add key-ring routing with multiple orders, prisoner testimony clues, cell-wall crawlspaces, swinging-chain traversal, lights-out hunts, and an optional records objective that reveals a future shortcut.

### The Glacier Vault — The Ice Remembers

Create shattered vestibule, specimen galleries, thermal conduits, crystal archive, and sealed treasury. Add heat-routing to open/close ice paths, frozen-creature wake ambushes with visible cracks, mirror-ice traversal, archive reconstruction, and a timed refreeze escape after the vault opens.

### The Magma Core — Pressure Below

Create crust shelf, vent maze, suspended refinery, mantle bridge, and core chamber. Add vent-pressure manipulation, rising-lava route changes, basalt pillar parkour, eruption knockback tells, emergency core stabilization, and high-risk cooling tunnels containing optional loot.

### The Reaper's Gate — Toll of Souls

Create grave road, ossuary market, execution square, soul aqueduct, gatehouse, and scythe sanctum approach. Add soul-lantern collection choices, executioner patrol hunts, rotating scythe bridge hazards, a judgment mission with no invented lore outcome beyond existing Reaper canon, and a one-way spectral shortcut back to the entrance. Preserve the actual Reaper trial unchanged.

### The Sealed Reliquary — The Treasure That Tests You

Create seal antechamber, false treasury, prism hall, reliquary stacks, guardian circuit, and true vault. Add seal-symbol deduction, light-prism routing, curse/reward choices that are disclosed before commitment, mimic-heavy false caches with fair tells, rotating archive shelves, and a secret-vault route assembled from clues across the destination.

## World mission framework

Add a small data-driven local-objective framework rather than fifteen unrelated one-off conditionals. It must support activate/collect/rescue/escort/defend/route/puzzle/escape objective steps, optional steps, checkpoint persistence during the current expedition, HUD tracking, completion rewards, and clean reset on the appropriate run/save boundary. Author at least one local mission per destination using this framework. Preserve existing quest-board quest behavior.

## Pacing and rewards

- Establish encounter budgets per district. Mix patrols, placed packs, environmental threats, elites, ambushes, and quiet discovery; do not fill every meter with enemies.
- Add miniboss or elite set pieces selectively, not one identical miniboss per district.
- Scale XP, gold, healing access, and drops against the longer run so expansion does not multiply progression by five uncontrollably or turn attrition into a slog.
- Put meaningful rewards on optional difficulty and exploration. Avoid dead-end paths containing only scenery.
- Main-route checkpoints should restore the current respawn position without becoming free full heals unless an existing system explicitly provides that.

## Implementation order

1. Inspect current builders, bounds, collision, camera assumptions, hazard systems, quest completion, spawn budgets, boss triggers, save snapshots, and debug API.
2. Add reusable district streaming/activation, checkpoint, shortcut, surprise-encounter, and local-objective primitives.
3. Expand one main destination and its paired side destination at a time. Browser-test and commit each pair before beginning the next pair.
4. Run complete progression/save regression after all eight main and seven side destinations are integrated.

Do not keep all partial expansions live if a pair is unfinished. Each destination pair must reach a coherent playable state before shipping that batch.

## Required verification

- Record before/after walkable bounds, shortest traversal time, representative first-clear time, district count, encounters, secrets, shortcuts, checkpoint, and local mission for every destination.
- Test every destination in a real muted browser at normal and hitless difficulty, with and without Magic Socks.
- Test falling/recovery, checkpoint respawn, boss trigger, zone clear, side discovery, local objective reset/persistence, return to hub, reload from an old save, and revisiting a cleared zone.
- Stress-test frame time and enemy/projectile counts at district boundaries. Inactive districts must not continue expensive AI/effects.
- Inspect representative approaches visually; no empty horizon, floating architecture, impossible jumps, blocked exits, accidental out-of-bounds shortcuts, or copied landmark silhouettes.
- Bump VERSION3D, append UPDATE_ROADMAP.md, commit/push from the game submodule, and verify the deployed browser build for every completed destination pair.
