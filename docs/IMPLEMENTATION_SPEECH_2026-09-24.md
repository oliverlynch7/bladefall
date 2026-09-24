# Grounded speech plan
Current hub-dialogue.js owns playback for hub, campaign, trials and finale conversations. It supports recording priority and a generic opt-in speech fallback. Mouth animation reads BFHubDialogue.speaking. voice-content.js exposes only approved current-wording audio. Update this common presenter rather than separate per-level code. Preserve explicit dialogueTTS=false. Browser voice APIs do not expose gender; use recognized voice names where possible, otherwise an English/default voice with gentle character-specific delivery. Do not claim identical voices across devices. Pending speech must be canceled on leave/line changes; errors must not strand choices or mouth motion.


## [Codex | 2026-09-24] 2.033 — character voices and transparent effects
Default device speech now covers unrecorded hub/campaign/trial/finale dialogue through the shared presenter. Approved audio remains first; audio failure falls back once. Explicit speech-off preference and sound-effects mute/volume remain respected. Stable speaker hashing chooses English system voices, preferring recognized male/female voice names; mild delivery differences reflect character tone. Device APIs have no gender field and available voices vary. Delayed voice discovery, cancellation on exit/line change, errors, and an end watchdog keep subtitles and mouth state usable. No paid voices generated; no stored takes changed. Approved face detail is default; faceDetail=0 remains a comparison option.

Continuation: Hydra translucent jet and Rift Hall label planes no longer write depth, preventing their translucent fragments from hiding later transparent effects. Depth testing remains enabled. No combat or collision changes.

Validation:18 browser speech lifecycle checks (controlled voices),11 co-op story checks, pre-change save preservation including explicit speech-off, pure story/authority/Hydra/Rift Hall tests and syntax checks passed. Native browser exposes speech APIs but no named voices in this test context: acoustic quality and actual male/female availability are not certified.48 sampled near/far views across24 campaign scenes rendered without page/renderer errors; active Hydra blast and all8 Rift labels pass material assertions and screenshots. These are sampled views, not an exhaustive moving traversal or proof that all flicker is gone. SourceU191 recorded verbatim.

Next: broader route-by-route visual/combat playtesting and progression balance; dedicated miniboss mechanics and the unresolved earned-trial/Pyromancer/mount design work remain open. No claim that the whole production queue is complete.


## Production receipt - 2.033
Main15a23ac is live. Read-only Chromium confirms2.033.0-character-voices, speech selector loaded, renderer ready without error, and all five changed speech/face/effect modules HTTP200. Face detail defaults on. Live saves and recordings untouched. Source references validated; private archive191 messages includes U190 environment and U191 exact user instruction, zero unparsed lines.
