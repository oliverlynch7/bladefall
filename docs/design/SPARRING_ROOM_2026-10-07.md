# Sparring Room improvement packet

Purpose: a clear, safe place to learn a discovered foe's attack, test a class build, and try a boss again. The fighting should use real movement, damage, tells and defenses; rewards and campaign progress stay outside.

## Existing problems verified in source and browser

- The decorative exit door at (0,470) sits in the default shoulder camera's sightline from spawn (0,300). The doorway face fills the screen.
- The interaction system offers a Waystone at (0,30) though no Waystone exists here.
- The selection menu is one tall scroll of enemies with fixed pair spawns and little control.
- Hub damage immunity applies inside the room, so incoming attacks are not meaningful practice. Knockback is also suppressed for practice foes.
- The square mat and plain walls leave the room visually empty; there is no durable outcome feedback.

## Build

1. Establish a clean arrival apron and camera view, clear routes to exit/console/ring, and an intentionally furnished hall: stone-and-wood perimeter, lamps, tiered viewing rail, gear racks, dummies/targets, hanging banners, ring corner details and visible markings. Keep décor outside the active fight lane and match colliders to visible solids.
2. Use a compact selection screen with categories and search, a selected opponent card with its real attack tell, separate bout size, a clear primary Start button, Heal and Clear. Maintain unlocked-foe gating and boss solo restriction.
3. Use normal enemy AI, hits, knockback and telegraphs. No XP/gold/loot. On defeat, reset the player and bout inside the room, with an explicit message. Allow healing and ending a bout at the console.
4. Show a concise live practice panel: current foe, elapsed time, hits/damage dealt and taken, and defeats. Reset per bout, no score persistence.
5. Real-browser QA: pre-change save, all camera modes at spawn, desktop and narrow UI, select/search/start/clear/heal, damage and no-penalty defeat, exit back to Waystation, no fake interactions or console errors. A human feel/visual review remains desirable after release.

## [Codex | 2026-10-07] Release verification

Implemented as `2.130.0-sparring-hall`. A prior-version save loaded with its gold, level and unlocked zone intact. Chrome checks covered the arrival view in far, shoulder and first-person cameras; narrow menu and combat HUD; filtering, searching and selecting unlocked opponents; 1-3 foe bouts and solo bosses; real AI movement; healing, ending, victory and defeat; and returning to the Waystation. Tested seven boss types without page exceptions. Hits on the dummy now start a visible damage test, and the bout timer freezes at the result. Damage outside the ring is blocked; damage in the ring works; defeat returns the player healed to the entrance without losing campaign progress or rewards. JavaScript syntax and diff checks passed. Local static-server requests for optional voice endpoints and unrelated missing prop-library files returned 404; no sparring page exception was observed. Human assessment of fight pacing and room aesthetics remains open.
