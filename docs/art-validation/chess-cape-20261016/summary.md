# Checkmate Cape verification

Version 2.227.0-checkmate-cape. Black-and-white checker cloth, existing lightweight192-triangle cape mesh; cosmetic only.

Unlock: solo Thomas, Hard, player winner by checkmate/time, either color. Draw/loss/easier/co-op/human opponent and history review excluded. Existing match-start difficulty lock retained. Equip from Stylist, never auto-replace current cape.

Persistence: existing slot-profile global cosmetic flag cape:checkmate. Write then read back to confirm; failed write rolls memory back, retry while victorious match remains. Existing ownership/equip/gold unaffected. Mode load retains cosmetic flag/equip; saved profile record inspected directly through owned fixture, not a production save.

Evidence: browser.json has30 passing real-browser assertions; regressions.json contains94 passing offline suites. Focused reward suite rerun after persistence refinement:20 checks, including duplicate unlock/save failure/retry, both colors, time victory, co-op/easier/loss/draw exclusions. Existing33 chess experience checks, engine rules/clock/choreography and inline parser rerun successfully.

Scripted actual legal Fool's Mate moves through BFSocial.receive with real rendering/persistence/Stylist; fixture suppresses engine worker replies so it can deterministically control opponent moves. No claim that automation beat a running Hard bot, native input, or two-device play.

Preview images: cape-preview.png Warrior and cape-mage.png Wizard. Live renderer confirmed finite117 vertices/192 triangles. No new bitmap or external texture download.


## [Codex | 2026-10-16] v2.227 production confirmed

Functional edd64871 deployed successfully as d25dbf1c-74b5-4211-8214-59dbba4d06e0. Fresh public title confirms v2.227.0-checkmate-cape; public stateless preview confirms Checkmate Cape,192 cloth triangles, no launch/preview warnings or errors. Reward integration evidence remains isolated QA with scripted legal bot moves, no production save touched.
