# Great Furnace: Cinder rescue action pass — 10 October 2026

## Grounded finding

The live optional Cinder rescue is three adjacent controls with a hard-coded 1–2–3 sequence. Its note describes that order, but there is no meaningful physical consequence until the final press. This repeats the input family Oliver has called out as unsatisfying. The cage is an optional branch off the east gallery; it must remain independent of the cooling crossing, confiscated writings and Colossus exit.

## Player action and feedback

The player first inspects the cage, then shuts the visibly hot feed at the cage-bay entrance. The feed changes color and the cage settles. The disruption draws a small group of cage guards into the bay; the player must defeat them before opening the now-safe cage lock. The lock gives a clear blocked prompt while the feed is hot or guards remain. Cinder's body and cage bars visibly respond on release. This is shutdown → combat → rescue, rather than a disguised three-button order puzzle.

## Compatibility and verification

- Preserve `gf.cage`, `gf.pet.open` and `gf.cinder` identifiers, the existing reward banking at Colossus entry, and every main-route gate. Retired sequence progress in old saves is ignored; an old completed rescue remains complete.
- Spawn guards only on the authoritative host and show the same feed, guards and lock state to guests. A guest may operate the feed or final lock through the existing story-authority path.
- Verify blocked release, guard activation and clearing, single reward, visible state, return/checkpoint behavior, co-op and a pre-change save in a muted real browser. Compare with the old test's assumptions and update its intended route.
- This scope is a focused gameplay repair, not a claim that every Furnace puzzle or all-level pacing is complete. Oliver's playtest decides the final fight pressure and visual taste. Custom SFX work remains on hold.

## Implementation review

The old three-control sequence was removed. The hot feed and cage are now separate visible objects, with a cooled color/state after shutdown. Three skitter guards emerge once on the host; the lock reports the remaining threat until the bay is clear. The final release opens the bars and preserves the Cinder reward. The cage note is saved in the journal, and its reading panel closes when the fight starts so it does not cover combat.

Version `2.150.0-cinder-rescue` passed the static gate, story and notice tests, the full Furnace route, checkpoint/death and boss-entry banking, host/guest activation and reward sharing, and old partial/completed-save browser checks. A natural-motion check confirmed that guards pursue and damage the player. Shoulder-camera views were inspected before and after cooling. Final fight pressure and visual quality still need Oliver's hands-on playtest.
