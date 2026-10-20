# Actual first journey — 2.341.0

## Completed final route

`Clean First Journey`, a newly created Warrior in disposable localhost storage, completed this sequence with ordinary native keyboard/mouse controls:

1. All control/HUD lessons and eight-button pause guide; nine actual tutorial kills; mandatory Cleave choice and real mana use.
2. Actual exit, five lore slides and all eighteen hub-tour stops.
3. Homefields: Thomas, Mara, three roots, store doorway/dressings, turn-in, shard introduction, moving crate/pressure plate, wheel, bridge, three guards and wagon gate.
4. Black Woods: Lewis, ground signal crank, healing pads and physical exit.
5. Brute: four actual stone collisions, ordinary attacks during stagger windows, a real ground-wave hit, mandatory Heavy Hand choice and all four handlers.
6. Physical victory portal, clear reward, hub recovery, Title Screen, actual browser reload and Continue.

No death, page restart, teleport, granted gear/stats, quest mutation, direct damage call or simulation-time pumping occurred between creation and the victory hub. Normal pauses were used between observations. The final reload was intentional and occurred after victory. Camera was changed through Settings to Overhead; auto-attack was toggled through its normal control. Read-only debug snapshots did not drive gameplay. Earlier knowledge of the route means this does not establish an unfamiliar human's ability to discover it unaided.

`clean-*.json` record successive actual states. Final saved result: level3, XP101/450, Warrior rank3, class XP474/971, Cleave/Heavy Hand, 1016gold, BR-01 secured, Briar complete and Hollow Pass unlocked. HP142.56/142.56 and mana75/75 restore in the hub. The starting sword remains equipped; this direct route did not collect optional equipment chests. One earned stat point was spent on Attack; the next remains available. The before-reload snapshots share the same increasing page clock. `clean-victory.png` records the real clear screen.

## Repairs and verification

- The overhead camera could retract to head height beside the mill, filling the view with the hero. It now tries collision-tested steeper rays, with a stable north-facing heading. It still respects walls, doors and ceilings; support platforms remain opaque. `mill-camera-before.png` and `mill-camera-final.png` were reached on foot, without staged positions.
- Menus suspend tutorial cards/arrows immediately. Trial completion and the hub handoff retire the guide. This was checked in an actual new tutorial and the clean completion/tour.
- Full fractional HP now displays consistent totals, e.g.143/143, instead of158/157.
- Cancelled/faded story notices now clear their text at world transitions. The earlier sporeback message was present in accessibility content, not proven visibly persistent. No voice lines were rewritten.
- A stone counter no longer says “Cart impact”; the unvoiced status says “Charge stopped.” Mechanics and network opening keys are unchanged.

`regressions.json`:45 focused suites pass, including564 new camera/handoff/HP/notice checks,257 hub recovery checks and all371 approved recording hashes. The pre-update earned character also loaded into the repaired build. No save format, reward curve, damage, trial tuning, layout or paid audio changed.

## Performance and rejected evidence

`orchard-native-profile-b.json` is a full, chunk-retrieved native-frame trace; `orchard-native-summary.json` documents filtering. Shoulder/high quality,12,000frames across80.11seconds. Of those,2,791frames/23.64seconds fall inside held native input after warm-up: p9511.2ms, max16.8ms, no gaps above100ms. The whole window has one111.2ms gap outside those intervals. This did not reproduce the severe reported Orchard stutter and does not prove it fixed or certify other hardware. No performance optimization is claimed.

Earlier attempts with `First Journey` were interrupted by page restarts around combined-key automation calls. Their state rollback is not an established game save defect. The eventual first run reached level4/rank4/1218gold and an equipped earned ring; it is separate from the final clean run. Some screenshots showed stale compositor frames, so foreground captures and state readings were used together. Empty reset-stack output does not identify a cause.

Two oversized early DOM exports were truncated and are rejected, not shipped as valid JSON. The retained final performance export was retrieved in chunks and parsed. Generated `.qa-*` HTML stays local. `scripts/qa-continuous-journey.js` only observes errors, frames, inputs and entry calls; it does not alter input or gameplay.

Not established: all optional routes/quests/shards, two-human Internet co-op, subjective fun/balance, every camera angle or low-end performance. These remain distinct from this completed first-campaign route.
