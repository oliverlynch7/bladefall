# Enemy art and motion: second pass

## Grounded findings

The 2.141 roster has 48 unique palettes and compatible articulated rigs, but the studio review shows repeated armored torsos and helmet profiles. The seven beasts share a canine head and muzzle underneath their unique decorations. Several creature materials inherit metal values from the armored material recipe. In motion, ordinary humanoids share a sinusoidal leg swing, idle legs keep moving, and the body does not transfer weight through a step. Boss attack clips differ, but their follow-through and locomotion still need clearer mass at normal camera distance.

## Implementation

Keep all 2.141 exports for rollback. Export a versioned 2.142 visual set with a brighter readable midtone, separate organic and metal material response, and structural silhouette changes: purpose-shaped beast heads and torsos, distinct head/shoulder and equipment profiles for soldier roles, and a stronger focal feature for each named boss. Preserve the existing bone names, gameplay hitboxes, attack timing and save IDs.

Revise motion across every rig family: planted idle feet; a step cycle with swing knee and planted stance, body weight shift and subtle vertical travel; head-led four-legged gait; a different hover beat for flying spirits; role-aware weapon-ready movement; and better attack preparation, contact and recovery. Avoid large translations that would detach visuals from collision. Respect current reduced-motion behavior.

## Acceptance

Regenerate every production appearance and bestiary portrait. Audit all 48 exports and the two dedicated Colossi for finite transforms, silhouette readability and browser cost. Compare at least one soldier, beast, caster, object, flier, Prison Break boss and Colossus in the motion viewer, including their attack contact frames. Check live in-game distance, a phone viewport, old-save loading and co-op state. Record objective test results separately from Oliver's judgment of art and feel.

## Implemented and verified

Version 2.142 exports 48 versioned GLBs and retains all 2.141 files. The revised material recipe raises midtones for normal-camera readability, uses organic roughness for creature bodies, and keeps metal factors below the game loader's no-reflection-map fallback threshold. Beast species now differ in skull, muzzle, jaw and body proportions. Spear troops, shield troops, scholars and named bosses have more role-shaped contours. The roster remains stylized and rigid-part skinned; it is a second art pass, not a claim of hand-sculpted or motion-captured realism. The [2.142 contact sheet](../art-validation/enemy-roster-v2142.jpg) records the complete export set.

Every 2.142 rig now has still legs in idle, a swing/stance distinction and small rooted weight travel in movement. Quadrupeds use opposite front/rear contact pairs, while hover and object enemies have their own motion. The attack timeline now reaches contact, follows through and enters recovery without a pose seam. Named Prison Break and Colossus moves have matching `Recover_<move>` clips; live Bell Keeper toll and sweep both selected the corresponding recovery. Attack timing and world position remain governed by combat code.

Verification: 48 exports, 48 distinct palettes, 21.55 MB combined, maximum 6,596 triangles. Browser loaded all 50 skinned appearances with finite bones, planted idle legs and moving root tracks; 136 windup/contact/recovery joins had zero angular seams. Representative studio poses, in-game Briar sets and Prison Break encounter were inspected. A 12-enemy 390px viewport run had no missing assets or overflow and measured median 2.1 ms/p90 4.1 ms for synchronous render calls on the test machine. A previous 2.141 save loaded with unchanged character data, and Prison Break co-op HP, checkpoint, rewards and reload checks passed. These tests do not measure human perception of combat naturalness; Oliver's playtest remains the aesthetic check.
