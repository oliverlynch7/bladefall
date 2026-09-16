# Enemy and boss animation pass

User authorized continuing after player combat effects. First milestone: align animated models with actual attack phases before adding new attack compositions.

Inspection: mob3d.js infers attack starts from proximity and shootT increasing, ignores meleeW and shotW, and forces wind-up playback to 1.7x. This predates the fairness timers. Replace those inferred triggers with gameplay phase fields. Fit one-shot wind-up and strike clips to their actual windows; retain frozen poses under stun. Preserve all damage, telegraph geometry, timing and AI.

Validation: deterministic phase tests plus real browser melee and projectile wind-up/strike checks; no attack from proximity alone; repeat casts restart clips. Existing save test and versioned deployment. The broader enemy/boss visual composition overhaul follows this synchronization milestone.

## Hostile effects implementation plan

Use the actual enemy preparation timers, committed aim vectors, active shockwave radius/arc, beam angle and collapse tiles as visual inputs. Brute: stone fissures; Fallen: blade fan; Frost Sorcerer: ice teeth; Ember Colossus: rising flame fractures; Marble Colossus: gilded light; Marksman: target reticles and arrow flights; Abyss King: court links/crown; Awakened King: broken crown and collapse seams. Species-specific elemental projectile shells and collision bursts accompany normal enemies.

The existing warnings remain authoritative and visible even when the cosmetic budget is exhausted. Share the existing ribbon buffer, reserving part of the same total geometry budget for hostile effects. Record impact effects only on collision, never infer a hit from lifetime expiry. Keep effects out of saves, expire using simulation time, and clear at area changes. Test attack timing, projectile collisions, all eight boss appearances and total low/high rendering budgets before shipping.

## Implemented and validated — v1.975.0

Added eight boss visual directions plus elemental projectile shells and collision blooms mapped across 39 hostile appearances. Active native shockwaves follow gameplay radius and direction. Preparation warnings and overflow fallbacks remain visible. Effects share the existing single ribbon draw and total limits: 1,800 triangles on low, 5,400 on high.

Validation: all 39 profiles render finite geometry without mutating gameplay; wave replacement excludes delayed/player/overflow fronts; actual character and cover collisions emit impacts, expiry does not; impact queue caps and cleanup pass. Eight boss browser scenarios and existing fairness timing checks pass. A v1.974 save preserves campaign progress and weapon on v1.975. Phone gallery: /3d/art-previews/hostile/. Evidence in docs/art-validation/hostile-*.json.

Limits: this is an effects pass using existing rigs and clips. Existing warning markers, beam cores and persistent ground fields still need visual refinement. Next: persistent traps/ground fields, then stronger body reactions and authored attack poses.
