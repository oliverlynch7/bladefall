# Enemy and boss animation pass

User authorized continuing after player combat effects. First milestone: align animated models with actual attack phases before adding new attack compositions.

Inspection: mob3d.js infers attack starts from proximity and shootT increasing, ignores meleeW and shotW, and forces wind-up playback to 1.7x. This predates the fairness timers. Replace those inferred triggers with gameplay phase fields. Fit one-shot wind-up and strike clips to their actual windows; retain frozen poses under stun. Preserve all damage, telegraph geometry, timing and AI.

Validation: deterministic phase tests plus real browser melee and projectile wind-up/strike checks; no attack from proximity alone; repeat casts restart clips. Existing save test and versioned deployment. The broader enemy/boss visual composition overhaul follows this synchronization milestone.
