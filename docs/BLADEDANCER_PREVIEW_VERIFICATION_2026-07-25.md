# Bladedancer Preview Verification - 2026-07-25

Branch: `bladefall-autopilot`
Version: `1.383.0-autopilot`

## Identity

Bladedancer is the approved Warrior-core parry and riposte class. Its defense is based on visible, player-triggered timing windows rather than random block chances.

- **Counter Dancer:** catches attacks, stores Riposte charges, heals through good timing, and answers with heavy counters.
- **Blade Waltz:** chains fast cuts, safe movement, stuns, and flowing multi-target attacks.

## Full CLASS2 progression

- Rank 1 innate: Perfect Timing.
- Rank 2: Counter Stance / Twin Cut.
- Rank 3: Sharp Counter / Light Feet.
- Rank 4: Riposte / Dance Step.
- Rank 5: Patient Guard / Fast Hands.
- Rank 6: Mirror Guard / Cross Slash.
- Rank 7: Healing Counter / Keep Moving.
- Rank 8: Dance of Steel / Perfect Counter.
- Rank 9: Last Step / Duelist Guard.
- Rank 10 capstone: Endless Dance.

## Implementation

- Shop-unlocked class charter: 14,500 gold.
- Family: sword, dagger, and spellblade.
- Explicit parry windows consume an incoming hit, store a Riposte, and display a clear response.
- Eight authored skills with twin arcs, lunging counters, guarded shockwaves, crossing cuts, safe dashes, and multi-target blade flashes.
- Parry healing, extended timing, stored-counter scaling, movement damage, attack speed, dodge cooldown, and close-range defense.
- Arena bot kit and class damage scalar.
- Temporary glyph icon hooks are intentionally isolated; no finished Bladedancer raster art was found locally.

## Browser acceptance

- [x] Class definition and all ten ranks resolve.
- [x] Both choices at every decision rank select cleanly.
- [x] All eight active skills execute and deal damage or provide their described utility.
- [x] Counter Stance prevents damage, stores Riposte, heals with Healing Counter, and triggers Endless Dance.
- [x] Riposte consumes its stored charge and deals its empowered damage.
- [x] Mirror Guard releases its counter shockwave after catching a hit.
- [x] Perfect Counter prevents its triggering hit and delivers its heavy retaliation.
- [x] Dance Step activates Keep Moving; Cross Slash applies its stun.
- [x] A missing legacy Bladedancer state initializes additively at rank one.
- [x] Muted Chrome reported zero console errors and zero warnings.
- [x] JavaScript syntax and `git diff --check` pass.

## Recorded QA evidence

- Counter Stance opened an 0.85-second upgraded window, prevented 40 damage, healed five HP, stored Riposte, and activated the capstone.
- Empowered Riposte dealt 136 representative damage and consumed its stored charge.
- Mirror Guard's successful parry dealt 61 counter damage and healed five HP.
- Dance of Steel struck three representative targets for 35, 64, and 64 damage.
- Twin Cut dealt 45, Dance Step dealt 37, and Cross Slash dealt 63 with a 0.65-second stun.
- Perfect Counter opened a 1.45-second window, prevented 80 damage, dealt 144 counter damage, and stored Riposte.
