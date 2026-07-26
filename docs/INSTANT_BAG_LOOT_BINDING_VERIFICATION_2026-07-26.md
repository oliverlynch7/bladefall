# Instant Bag Loot Binding Verification — 2026-07-26

## Shipped scope

- Added **Send Dropped Item to Bag** as a remappable action with **R** as its default binding.
- The action retains the same two editable binding slots as every other control.
- The drop HUD now presents all three immediate choices together: **F Equip**, **R Bag**, and **Q Sell**.
- Waiting for the loot timer still safely sends the item to the bag automatically.
- A full bag retains the existing safe fallback that sells the item and explains what happened.

## Verification

- JavaScript syntax compilation: PASS.
- Git whitespace/error check: PASS.
- Browser controls menu: PASS — 17 actions, two slots each, R shown for Send Dropped Item to Bag.
- Browser loot HUD: PASS — F Equip, R Bag, and Q Sell displayed together.
- Browser input smoke test: PASS — pressing R cleared the active loot card and placed the exact test item into an empty bag.
- Browser console: PASS — 0 errors, 0 warnings.
