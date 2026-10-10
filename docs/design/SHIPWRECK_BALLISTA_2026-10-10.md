# Shipwreck Shore: iron binding challenge

## Source-grounded starting point

The optional storm chest at the Lantern Wreck uses `sc.code.note` and four numbered pads beside the chest. Entering a seeded three-number order sets `sc.code.open` and grants the existing Stormshot reward. The player action is another small code entry, despite a different nautical clue. The adjacent Rose's Wreck and Lantern Wreck are established terrain; the Rose wreck is at about `(-1320,-3400,130)` and the chest is at `(-2140,-3400,200)`. The cache path already links them. This is optional and separate from the boat repair, crew memorial, lower hatch and main voyage.

## Replacement player experience

From the Lantern Wreck, inspect the iron-bound chest and see the bright clasp above it. A fixed ship ballista stands on Rose's Wreck across the gap. At the ballista, the camera moves behind its sights. Drag or use arrow keys to align the center reticle with the clasp; fire with E or the visible button. A bolt travels through the scene. A miss leaves a visible impact and can be retried immediately. A hit breaks the clasp, drops the iron bars and opens the chest. The player then crosses back to claim Stormshot from the chest. There is no number order or guessing.

The ballista is a compact optional interaction, not a new weapon class or inventory item. Its view must retain visible world art, an obvious exit, mobile pointer input, controller-friendly focusable controls, and a generous target. The character remains vulnerable while aiming, consistent with existing inspection/menu behavior. Co-op shares the opened chest through host story state; either player may aim. The per-character reward stays with the existing story reward system.

## State and compatibility

Keep `sc.code.open`, `sc.code.note`, the journal ID `sc.code` and reward ID `sc.stormshot`. Retire numbered world controls and lantern-count art. Old partial sequence progress is harmless and ignored. Old completed chest flags remain completed. Do not alter boat progression or SC-01. Only a valid shot from a player at the ballista may request the host-owned world event.

## Failure modes to verify

- The real 3D target must be visible from the sight camera in near/overhead camera preferences, with no wall-ghosting or excessive fog.
- A player can miss, see the result, adjust, hit and return to collect without save corruption or consuming ammo.
- Leaving, dying, changing area or disconnecting closes the sight view cleanly.
- Prior completed/partial saves, host and guest opening, reward once, journal and main voyage work.
- Visual clarity, challenge and fun still require Oliver's playtest; browser checks prove technical behavior only.

## Verified implementation

The optional chest now has a fixed, physically colliding ballista on Rose's Wreck and a visible clasp on the Lantern Wreck. A hit opens the binding; the reward is granted only when the player returns to the chest. The journal and optional tracker distinguish the shot from the claim. The older four numbered controls and floating number labels are removed. No custom SFX were added.

Static and story checks passed. Real muted-browser checks covered a miss and retry, pointer and controller-stick aim, controller and keyboard fire, the real-time bolt and falling binding in the paused inspection view, chest return by movement, quest state before and after claiming, the full main and optional shore route, a prior partially entered code save, a prior completed chest save, and two-page host/guest opening and reward state. Human playtesting remains for aim feel, difficulty, and presentation.
