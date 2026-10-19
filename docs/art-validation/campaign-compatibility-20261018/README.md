# Campaign interaction compatibility pass — v2.302.0

Fixed:
- Scene, connection, freshness and life validation for story/boat/finale actors. Downed teammates remain eligible for shared quest rewards; another-area/stale connections do not. Rejected requests receive a reply so retry queues can clear.
- Mill crate, prison winch, library reflector and patrol activation use current participants rather than stale player positions. Removed hardcoded E from mill labels; prompt supplies actual binding.
- Guest mechanical snapshots apply before story UI/gates. Prison lift-ready state verified across real connected clients.
- Guest Repair/Ready and finale contributions work while host is in a live co-op menu.
- Finale start/retry and fifth-failure skip support mapped keyboard/controller actions; jump binding supplies strikes. Repeat, menu and ownership guards remain. Living participants can own ending dialogue; final-combat victory restores downed teammates; disconnect releases ending ownership and permits reopening with a fresh transaction ID.

Verification:
- Actual WebGL scene loads for all16 campaign districts. Available authored objects had reachable candidate positions and valid event handlers, except sc.ballista, which intentionally opens its separate aim interface.15 initially available NPCs were opened/closed as a guest with host staying in play; Deep Ice Caves NPCs are intentionally gated until rescue.
- Two actual game clients connected through the existing PeerJS/WebRTC path in a private test room, using isolated storage and muted audio: wrong-scene request rejected, guest Thomas dialogue advances while host stays in play, owner closes normally, both transfer to Prison Dungeons, guest receives rescueT8/lift-ready state, both travel to Storm Coast, guest E repairs hull40to85 and1 readies while host remains paused. Disconnect returned both to play without losing old level100/gold1145. No browser errors. This is a same-computer two-client network test, not a two-human Internet soak.
- Actual finale E start, Space strike, timed failure and E retry verified in browser. Controls use action bindings and gamepad dispatch; no physical controller hardware test.
- Full regression baseline130/143; after changes133/144. No new failures; two old VM extraction fixtures repaired. Eleven pre-existing scripts still encode removed dialogue choices/superseded puzzle input sequences. Their names/errors remain in regressions.json; no game behavior was regressed to satisfy them. Latest19 focused suites all pass, including33 new compatibility checks.
- User save data untouched; fixtures use Map-backed storage. No changes to class balance, music/SFX or campaign layouts.
