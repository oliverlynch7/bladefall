# Five-class ascension pilot - 2.363.0

Approved classes: Ninja, Necromancer, Warrior, Ranger and Mage. Rank 5 completes the outfit; rank 10 adds a class-specific supernatural feature. Other 12 catalog entries and all their rig audit results remain unchanged.

- Ninja: bare-headed crimson starter with reused fitted hair, earned hood and assassin sash, then spectral shadow-silk and talismans. No added nose; the nose embedded in the reused hair attachment is excluded too. Scalp backing prevents the source Rogue head showing between hair locks.
- Necromancer: earned skull mask and reliquary, then three ancestral soul apparitions with trailing ectoplasm.
- Warrior: completed heraldic armor and tassets, then two spectral royal standards.
- Ranger: finished longcoat and leaf harness, then a living emerald foliage mantle.
- Mage: crystal clasps and stole, then nebula veil and orbiting stars. Existing quiet head halo stays uncluttered.

Presentation uses three effect draws per rank-10 actor (previous aura four), two on low graphics; no new dynamic lights, history buffers or particle emitters. Reduced motion freezes effects. Native Ninja uncovered head uses only two material groups rather than a draw per alternating triangle run. Saved cosmetic IDs, colors, rank thresholds and combat stats are retained.

Verification: all 51 actual rigs, 4080 pose frames and 204 rank gates; 4224 ascension checks including finite transforms, resource ownership/disposal, clone restoration and unchanged other-class data. Existing headwear, aura, all136-skill, weapon-action, Reaper-combo and inline parsing suites pass. Native Chrome compiles all five effects without WebGL errors; front/side/back, moving attacks with a cape, charge, twilight, low graphics and reduced motion sampled. Final Ninja front/back snapshots include nose removal and scalp correction; earlier moving-view snapshots predate that last scalp correction.

Native pre-change save loads level4, Warrior rank4 and1145gold. Real Stylist clicks equip rank5/10 for all five, rank1 remains locked, per-class choices survive loadMode and level/gold remain unchanged. Actual peer renderer builds all five rank10 appearances plus Rogue-based peers while local Ninja is uncovered, without inheriting its face material or changing the local geometry. This is a staged render-path check, not a new live network or human co-op playtest. No human appeal, combat playthrough or hardware performance claim is made.

Preview: /3d/class-skins.html?collection=ascension&class=ninja&v=2363c

The comparison preview now uses equal orthographic framing so the rightmost rank10 is viewed at the same angle as the other ranks. Drag, zoom, animation, weapons and capes remain available. In-game camera behavior is unchanged. Isolated QA tabs use in-memory storage and are closed after checking; player saves are untouched.

The Ninja starter hair also remains visible in the Stylist face close-up; earned head ornaments retain the existing close-up behavior.
