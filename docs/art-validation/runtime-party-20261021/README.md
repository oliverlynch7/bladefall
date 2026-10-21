# Runtime and party safety - v2.343

Approved scope: performance first, then co-op reliability, while the user playtests the recent Briar district. No new geography, quest/dialogue/voice, reward, combat difficulty or save-schema changes.

## Repairs

- Campaign craft batches decode their spatial cell once at construction, rather than splitting/mapping 461 cell strings in every representative frame. Squared-distance culling preserves the previous ordinary-cell and large bank/stair bounds. Keep batches similarly cache their cell centers and avoid iterator-pair allocations.
- Static instanced scenery wrappers in Briar, Keep and campaign craft stop recomposing unchanged local transforms. Instance transforms, automatic world matrices, moving mechanisms, camera cutaways, shadows, materials, meshes and draw distances remain functional. The actual browser records459 fixed craft batches in Homefields and552 Keep/craft batches at the drain.
- Boat failure previously sent an unscoped wipe plus the normal scoped wipe. It now invokes the single normal party wipe path. Host and guest require the matching scene on revive messages; guests require it on wipes. The hub and PvP refuse combat wipes. The actual previous handler reproduces an unscoped message killing a hub player, and the previous voyage function emits two messages; current handlers reject the former and emit one scene-bound message.
- Three import-map aliases refresh the changed shared modules without creating a second scene owner. Existing independent previews retain their current module imports.

## Browser measurements

Native held movement keys, high-quality shoulder camera, staged starts and stunned enemies in isolated in-memory storage. Actual animation/update/rendering remain live. These are controlled profiles, not a natural fight or a hardware certification.

`profile-summary.json` records exact frame windows, ranges and costs. Orchard comparison:1271frames/8.33s before,1534/8.58s after. The longer after window contains4917frames/27.42s moving across x=-1170..-2009 at z=-1440, on ground. Keep drain comparison:934frames/5.18s before,3563/19.79s after along x=1650,z=-3700..-3914 at y=80. Neither long after trace has a frame gap above50ms. Visible triangle counts remain137988 in the Orchard view and72847 in the drain view. These naturally jittered captures are not a controlled percentage-FPS benchmark; the original severe intermittent stutter was not reproduced and is not declared solved.

The timed scene updater parity test eliminates461 repeated cell decodes per frame and compares83000+ visibility/packet assertions. Its synthetic function timing is not whole-game FPS. CPU sampler commands are unavailable through the current browser bridge, so the local-only build uses explicit update/base/hero/subsystem timers and native frame timestamps instead.

## Party and saved-state coverage

`party-browser.json`:16passing checks using two actual game instances and their real host/guest methods over a serialized local relay. Shared enemy chest identity, independent personal rewards, duplicate collection, Homefields-to-Black-Woods rebuild, delayed old snapshot rejection, clean hub/full HP and mana for both, stale/unscoped wipes, real downed/revive relay, duplicate recovery and expired-window spectating. Browser runtime errors:zero. This is not a two-human Internet/WebRTC session or a quest-completion playthrough. Existing focused quest/gate/snapshot suites retain coverage separately.

`legacy-save.json`: original stored JSON boots a level100/1145gold fixture. Its empty global record legitimately shows first-story/tour UI, which was skipped; the real saved-adventure entry reaches the hub. A staged actual enterZone call then reaches current Briar, retaining level/gold, with no renderer/runtime errors. User storage was never opened or modified.

`regressions.json`: focused suite results, including save safety, shared loot, party recovery, existing mill/Keep/prison routes, unchanged recordings, and render warm-up. `syntax.json`: changed JS and executable inline-script checks. The older Rift composition test lacked the mirror helper stub; that fixture was repaired without changing its assertions or game renderer.

## Discarded attempts and limits

An initial occluded/background browser sample ran near1Hz and is excluded. A first Keep staging call was correctly refused by the uncleared-level replay gate; that courtyard run is not presented as a drain measurement. The corrected fixture marks the region cleared before selecting its second half. The first chest assertion incorrectly counted unrelated authored chests; it now checks the actual shared key. The first hub fixture omitted originSeen and entered the story; the corrected party fixture represents an already completed introduction. An initial legacy test called the active-run-only resume function for a hub save; it now uses resumeSavedAdventure and tolerates the expected story handoff before G exists. Generated .qa files and the rejected Keep sample do not ship.

No severe-stutter resolution, all-device FPS gain, real Internet co-op, unassisted human discovery/fun or whole-campaign completion is claimed.

## Publication

Pending deployment verification.
