# Character creator — 2026-09-27

User request: make naming obvious, show the entire character larger and centered, repair eye color after face upgrades, explain each starter class more clearly and show its starting weapon.

Implemented 2.040.0-character-creator: responsive two-column desktop and single-column mobile creator; numbered name/class/eye steps; explicit name input and empty-name guidance; class playstyle/advice with actual CLASS2 innate and actual starter weapon names; full-model and face views; keyboard-labelled color swatches and pointer rotation. Removed premature Warden framing and hard-coded unlock counts. Existing player assets retained.

Preview uses isolated SkeletonUtils clone, selected class palette, fitted face and queued real starter weapon attachment. Precise deformed-vertex bounds replace fixed cropping; preview applies the game's supported weapon ready pose. Iris materials explicitly tagged so the local hero can synchronize the saved eye color. Preview no longer temporarily mutates meta each frame or adds global drag listeners on every selection. Renderer/face/weapon cleanup and stale queued preview guard included.

Browser checks: all three starter choices/weapon labels, name retained across choices, empty-name guidance, green eye selection, selected mage/name/eye entering tutorial and reloading, 390px no horizontal overflow. Inspected desktop full model, mage eye close-up, mage turned weapon and phone preview. Local static server voice-api 404s are expected; no page exceptions in creator QA. Further existing-save result appended after run.

No full art replacement, no new opening cutscene or SFX in this release.

Existing-save regression passed using HEAD's pre-change index: checkpoint/clue, class rank, gold, pets, hub introductions, return quests and disabled speech survived. Initial attempt lacked the temporary fixture; created it from HEAD, reran successfully, then removed only that fixture. Final creator QA rerun passed.
