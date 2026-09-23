# Sky Library implementation

Baseline: 307e230, Palace Courtyard shipped; half two still uses legacy Hanging Gardens terrain and relic collection. Approved references: CAMPAIGN_EXPANSION_PLAN Sunspire section and latest overrides; REQUIREMENTS_REGISTER; preserved user sources.

Build half two as linked reading halls, a lower maintenance passage, raised shelves, broken display wing and archive defense room. Reuse palace kit with solid matching collision and chunk culling. Hugh offers evidence or a records-care task; maintenance bypass prevents dialogue soft locks. Simon offers a spatial shelf puzzle and optional clue. Broken display shapes reveal the deliberate rescue of training rifts. Keep SP-03/04 physical and SP-05 a personal pickup after a shared guardian challenge. No class or flight requirements. Use tested story authority, journal, quest tracker, checkpoint and Voice Studio integration.

Guard challenge: activate three archive stands one at a time, defeat the resulting patrol before it breaks the seal; lost stands can be retried. Visible countdown and enemy pressure, no unavoidable instant damage. Completion opens a physical shard pickup for each player. Main exit independent of optional objectives.

Validate alternate access paths, wrong puzzle inputs, main progression without optionals, physical routes with real player movement, enemy pursuit, death rollback/banking and multiplayer state using browser harnesses. Inspect screenshots and pre-change save compatibility before publishing. Keep stable line IDs, never alter recorded takes.

Separate next batch: Marble Colossus environmental combat arena and post-boss orb vision. Do not expose the final cut or Ian reveal in this library batch. Dragon companion remains pending its own model/control work.

## Verified implementation

2.018.0-sky-library implements Sunspire half two with four access choices (persuasion, records care, apology/recovery, independent service latch), main Legion orders and patrol seal, Simon’s rotating shelf controls and bridge, broken display sequence, deliberate rift-scattering history, and three retryable forty-second archive defenses. SP-03/04/05 are physical personal pickups after shared conditions. Fourteen new stable dialogue lines bring Voice Studio to 268; no existing audio/text approvals changed. Main objective is independent of all optional shards.

Browser verification: 12 progression checks and 41 walking checkpoints; real enemy pursuit/damage and normal weapon damage; seven controlled two-browser co-op checks including guest puzzle action, synchronized dialogue/guards/timer and personal shard ownership; three death/checkpoint checks (current-half rollback, all five banked on boss entry, boss death retains them). Pre-change save loaded with gold, class rank and checkpoint clue preserved and no duplicate notice. Shared render regression passed Emberdeep, Sunspire, Duskmoor and Descent with no browser errors. Story reducer, authority, shard ledger, Rift Hall, music, mob import identity and voice API tests passed. Ten actual WebGL previews include desktop and 390px dialogue; no horizontal overflow. Geometry approximately 128,504 triangles / 2,800 instances with chunk culling after bridge opens; this is not a mobile FPS benchmark.

Traversal QA found and fixed a high floor intersection in the service approach and blocked side entrance. Screenshot review moved shelf solids out of the bridge line and selected a human-faced Ranger body for Simon instead of the masked Rogue/Monk alternatives. Shelf and display controls have visible gold direction tips and distinct sun/wing/sword marks. Co-op sends archive guard identity/elevation with existing enemy snapshots.

Limits: browser harnesses use staged movement/controlled co-op transport, not a complete human balance playtest or real network latency test. Guardian arena, Marble Colossus combat redesign, orb vision and dragon reward remain pending. No final-reveal content added here.
