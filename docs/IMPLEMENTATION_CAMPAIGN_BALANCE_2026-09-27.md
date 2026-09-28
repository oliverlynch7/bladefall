# Campaign difficulty and co-op health — 2.051.0

## Approved scope
User authorized a logical progression rebalance and co-op enemy HP below double for two players. Inspection found normal enemy damage flat across the campaign and an existing +60% HP per ally applied only at spawn.

## Implementation
- Briar damage unchanged. Regular enemies in subsequent regions gain +10 percentage points per region, plus 3 points in part two. Multipliers: 1.10/1.13, 1.20/1.23, 1.30/1.33, 1.40/1.43, 1.50/1.53, 1.60/1.63, 1.70/1.73. Existing difficulty, enemy-role, and player-defense calculations still apply.
- Boss arenas, trials, hub, PvP and other side modes excluded from the new damage curve. No blanket HP inflation or boss damage increase.
- Campaign HP remains 1.0/1.6/2.2/2.8 for one/two/three/four players in the host's zone. Existing enemies now reconcile on party changes; remaining health percentage is preserved. Cached unscaled maxima prevent repeated integer-rounding drift. Encounter changes to maximum HP recapture the baseline.
- Host authoritative; guests consume replicated HP. Offline return removes the extra party HP. Dead enemies, practice targets and destructible crack walls excluded.
- Abyss King base HP and shell shield durability track changes. Hydra total health accounts for already-broken chains without reviving them.

## Verification
Real Chrome via Playwright CLI, muted local server:
- All 16 region/half multipliers; boss-arena, hub and trial exclusions.
- Late joins/departures for two, three and four players; 20 repeated join/leave cycles; spawn avoids double scaling; exact remaining fraction; dummy/guest exclusions; offline return.
- Abyss King phase-two health and base HP preserved on party change.
- Hydra with one broken chain and another at half health scales and returns correctly.
- Two browser contexts using controlled packet relay: 16 enemies have identical host/guest HP and max HP at 1.6x; no page errors.
- Existing 15-section combat probe: enemies activate, move and deal damage. This probe isolates one enemy and gives the player high HP; it is not a natural full-campaign difficulty test.
- Pre-change index save fixture preserves class, currency, pets, hub history, checkpoint and journal clue; current auxiliary modules are used by that fixture.
- Inline JavaScript syntax passes.

Evidence: `docs/qa/campaign-balance-2026-09-27.json`; scripts `qa-campaign-balance*.cjs`.

## Limits
This is a measured first tuning pass. No claim that full campaign balance is final: natural playtesting across classes, equipment, skill levels and real remote co-op remains necessary. No changes to XP/rewards or custom SFX.
