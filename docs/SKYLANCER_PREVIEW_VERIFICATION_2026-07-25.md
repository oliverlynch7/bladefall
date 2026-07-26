# Skylancer Preview Verification - 2026-07-25

Branch: `bladefall-autopilot`
Version: `1.382.0-autopilot`

## Identity

Skylancer is the approved Ranger-core aerial class. Its combat loop links launchers, air attacks, steering skills, and powerful landing attacks instead of simply recoloring the Ranger kit.

- **Storm Diver:** launches, dashes, and converts height into landing damage.
- **Wind Hunter:** stays airborne, fires down at enemies, gains shields, and controls groups.

## Full CLASS2 progression

- Rank 1 innate: Born to Fly.
- Rank 2: Rising Spear / Gale Shot.
- Rank 3: High Ground / Soft Landing.
- Rank 4: Dive Strike / Wind Lift.
- Rank 5: Tailwind / Cloud Guard.
- Rank 6: Sky Dash / Spear Rain.
- Rank 7: Long Flight / Hunter's Eye.
- Rank 8: Thunder Dive / Cyclone Volley.
- Rank 9: Second Wind / Sky Armor.
- Rank 10 capstone: Sky Master.

## Implementation

- Shop-unlocked class charter: 13,500 gold.
- Family: javelin and bow.
- Eight authored aerial skills with launch, dive, dash, falling spear, cyclone, and landing-impact silhouettes.
- Airborne damage, slower falling, landing speed, aerial shields, air-jump renewal, and aerial defense.
- Aerial projectile pitch correction prevents shots from passing over grounded enemies.
- Arena bot kit and class damage scalar.
- Temporary glyph icon hooks are intentionally isolated; no finished Skylancer raster art was found locally.

## Browser acceptance

- [x] Class definition and all ten ranks resolve.
- [x] Both choices at every decision rank select cleanly.
- [x] All eight active skills execute and deal damage or provide their described utility.
- [x] Rising Spear and Wind Lift create useful height.
- [x] Dive Strike and Thunder Dive trigger their damage on landing.
- [x] Gale Shot pitches downward and hits a grounded target from the air.
- [x] Cyclone Volley hits nearby grounded targets while airborne.
- [x] Cloud Guard and Sky Master trigger during aerial casting.
- [x] A missing legacy Skylancer state initializes additively at rank one.
- [x] Muted Chrome reported zero console errors and zero warnings.
- [x] JavaScript syntax and `git diff --check` pass.

## Recorded QA evidence

- Storm Diver test damage: Rising Spear 45, Dive Strike 100, Sky Dash 82, Thunder Dive 167.
- Wind Hunter test damage: Gale Shot 83, Wind Lift 57, Spear Rain hit two targets for 32 and 64, Cyclone Volley 46.
- Cloud Guard produced a six-HP representative shield.
- Both landing attacks completed with the player grounded after their impact.
