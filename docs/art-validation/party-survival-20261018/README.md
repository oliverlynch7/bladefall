# Co-op survival and progress labels



## [Codex | 2026-10-18] Co-op survival and progress labels · v2.297.0
Fatal co-op falls now enter the shared downed lifecycle and relocate the body to verified solid ground. Players have30seconds for the existing2.5second proximity rescue, then spectate a living teammate instead of entering a private death screen. Host sends one shared wipe when everyone is unavailable; campaign retry resets the party and retains saved earnings. District changes retain spectator state, whole-level completion restores players. Existing special-mode rules and dungeon one-rescue budget retained. Downed/spectating players cannot attack, collect loot or trigger exits. Teammate labels now read name · LvN and class · RankN, with bounded additive rank replication and compatibility for older packets.
Validation:20 targeted regression suites passed. Muted real Chrome with isolated old level100/1145gold save exercised actual fatal-fall entry, safe landing, timely and late rescues, host and guest spectator states, real district load, campaign wipe/retry and completion hooks. No browser errors. Scripted peers validate actual game/render paths; this is not a two-human Internet co-op soak. Evidence:docs/art-validation/party-survival-20261018/.

The screenshot uses a scripted peer with level12/rank7. The guest role and campaign retry/clear reports are independent fixtures. Actual user saves were not modified.
