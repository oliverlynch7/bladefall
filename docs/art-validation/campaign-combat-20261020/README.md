# Campaign combat pass - 20 October 2026

Version: 2.337.0-campaign-combat.

## Player-facing changes

Ordinary campaign soldiers and casters now use readable combat roles beyond Briar. Keep guards take a short supported step into a bounded thrust; mobile strikers rush; Frost and Ember casters send expanding ground rings; coast casters cover three lanes; palace arcanists mark crossing lanes; Keep/Dusk hex casters target a fixed ground circle. Different regional combinations supplement existing native species rather than replacing those enemies. New warnings share the same locked origin, direction, dimensions and phase clocks as hit detection. Continuous ground lanes improve direction/range readability, with restrained colored edges rather than white glow. Recovery has a green ground cue and grants a 12% direct-hit opening bonus for upgraded troops. A hit of at least 25% maximum health interrupts their casts; small hits do not constantly cancel them.

Campaign troops share a local attack-pressure budget: two committed attackers in solo or three in co-op, including nearby specialist warnings when deciding whether a troop can begin. New troop tells are spaced by at least 0.28 seconds. Existing specialist AI is not throttled by this scheduler, so this is not an absolute cap on every hazard or projectile. Finite pursuit does not refill enemy health. Walking uses existing navigation; rushes validate swept collision/support rather than teleporting across walls or gaps. New ground marks snap below a jumping target rather than hanging invisibly in the air.

Boss bars now provide short phase-specific responses for Marksman, Fallen, Officers, Ember Colossus, Hydra, Marble Colossus and Abyss King; the Brute keeps its existing cues. Bound jump/dodge names appear where appropriate. Existing environmental defenses, phase gates, damage budgets, health, XP, loot and boss move sequences remain. No blanket HP increase, extra enemy spawns, terrain changes, new quest text, voice generation, save migration or beginner-trial difficulty change.

## Evidence and limits

- `campaign-sections.json`: actual generated sixteen campaign halves in muted Chrome. 223 enemies initially present, 128 using Briar/new ordinary troop roles. Specialists and scripted furnace/library enemies remain. These are staged load/state checks, not completed player journeys.
- `combat-integration.json`: eleven attack profiles through the actual game update/damage handlers. Standing in danger loses health; moving outside avoids damage; a solid wall blocks initiation; actual guest enemy packets retain the phase; joining at the strike without seeing its warning is harmless. Controlled positions and simulated packets; not an Internet co-op session or natural full fights.
- `starter-and-legacy.json`: all three staged starter completions save/reload into the hub; pre-change level100/gold1145 fixture retained. Isolated map-backed browser storage, never real player saves.
- `regressions.json`: focused tactics, boss, progression, quest, co-op, save and recorded-dialogue suites. Frame-by-frame checks are assertions, not independent human quality ratings.
- `boss-cue.json`: the Fallen enters its real thrust phase through normal activation and its visible boss bar explains the sidestep/pillar response.
- `console.json`: final browser warning/error capture.
- `keep-warning.png`: actual normal-camera Keep warning inspection. Test controls hidden; a staged warning is held for inspection.

Earlier fixture failures were investigated rather than hidden: broad guard exclusion incorrectly omitted the two ordinary cliff quest guards, so only actors with dedicated AI/escort responsibilities are excluded now. Guest application required an explicit campaignRole whitelist entry. A later hub-heal assertion incorrectly retained a reference to the discarded world; it now checks the new live world. Existing helper adapter gained the existing target-selector dependency. Boss HUD sampling also waits through activation and the next phase-display frame rather than inspecting an inactive or pre-update bar. The final results are reruns after these corrections.

Human playtesting is still required for enjoyable difficulty, encounter pacing and real network behavior. This pass does not establish FPS or full campaign completion. Existing high-detail assets and all approved NPC recordings remain.
