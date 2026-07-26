# Warlock Preview Verification — 2026-07-25

Branch: `bladefall-autopilot`
Version: `1.381.0-autopilot`

## Identity

Warlock is the approved Mage-core glass cannon. Its `Dark Bargain` innate makes magical weapons hit harder while every successful skill sacrifices health without being able to defeat the player. It supports two interlocking build directions:

- **Blood Pact:** direct burst, low-health damage, piercing Blood Lance, and Final Curse.
- **Curse Weaver:** marks, control, healing, movement, and kill sustain.

## Full CLASS2 progression

- Rank 1 innate: Dark Bargain.
- Rank 2: Shadow Bolt / Blood Lance.
- Rank 3: Frail Power / Soul Shield.
- Rank 4: Curse Circle / Life Drain.
- Rank 5: Deep Curse / Dark Step.
- Rank 6: Rift Step / Doom Orb.
- Rank 7: Blood Pact / Careful Casting.
- Rank 8: Dark Storm / Final Curse.
- Rank 9: Soul Feast / Last Breath.
- Rank 10 capstone: Dark Ascension.

## Implementation

- Shop-unlocked class charter: 12,500 gold.
- Family: staff, wand, spellblade, dagger.
- Eight authored skill effects with distinct void/crimson silhouettes and movement.
- Per-skill mana costs plus class-specific health sacrifice.
- Curse damage amplification, delayed Final Curse detonation, kill sustain/cooldown payoff, low-health offense/defense, cast shield, and cast movement.
- Arena bot kit and class damage scalar.
- Temporary glyph icon hooks are intentionally isolated; no finished Warlock raster art was found locally.

## Browser acceptance

- [x] Class definition and all 10 ranks resolve.
- [x] Both choices at each rank select cleanly.
- [x] All eight active skills execute and produce damage/utility.
- [x] Successful skills spend health; refunded no-target skills do not.
- [x] Health sacrifice cannot defeat the player.
- [x] Curse amplification and Final Curse delayed detonation work.
- [x] Legacy/default saves load without migration.
- [x] Muted browser console and JavaScript syntax pass.

## Recorded QA evidence

- Branch A exercised Shadow Bolt, Curse Circle, Rift Step, and Dark Storm.
- Branch B exercised Blood Lance, Life Drain, Doom Orb, and Final Curse.
- Controlled reticle tests confirmed Blood Lance dealt 128 damage and Doom Orb dealt 98 primary plus 99 splash damage.
- A no-target Life Drain refunded both its mana and cooldown, with no health sacrifice.
- Final Curse detonated after its delay for 326 damage in the representative test.
- At one health, a successful cast left the player alive at one health.
- The muted Chrome session reported zero console errors and zero warnings.
