# Lost Canyon journey finishing pass — 14 October 2026

## Latest authorization

> Go ahead

Repeated confirmation of the announced Lost Canyon campaign finishing pass after v2.193 Winding Cliffs. Continue U-GEO-20261012 and the sequential campaign plan. No new story beat, reward, SFX production or map-scale reduction.

## Grounded baseline

Inspected 10ba0309: lost-canyon.js, story/lost-canyon.json, campaign-geography.js, hollow-art.js, campaign-craft-scene.js, party-navigation.js and the existing signal/escort/freight checks. Existing three entry paths, optional freight climb, alarm scaffold, cave return and damageable north crossing are retained. Bounds are [-2880,3010,-5500,660]. A real baseline browser/save fixture confirms the initial arrow points at a gate that cannot yet be operated; forced-entry guards spawn behind that closed gate. Cage back/side bars have no physical blockers. Large ground yards have little visible route differentiation. The escort tracker uses elapsed seconds even while waiting for pursuit enemies or distant players.

## Build sequence

1. Update this level's blueprint intent before geometry edits. Preserve all current route elevations, optional gaps, width and extent. Use the existing sandstone kit, detailed cart, shelters, material textures and fitted bars.
2. Add joined worn service roads only on ground routes; no painted shortcut across high ledges or through the central rock spine. Place destination signs at actual junctions. Keep optional rewards undisclosed. Clear the direct access to controls.
3. Make cage back/sides solid where bars are drawn; use fitted detailed barred sides/frame with a clear front opening. Prisoners must pass through that opening and around corners, never through newly solid bars. Align richer signal lanterns and gate construction with existing colliders, not another pile of unrelated props.
4. Put forced-entry guards on the player side of the locked gate, grounded on its ramp. Preserve three enemies and the other entry options. Before a decision guide toward Ward; after combat begins guide toward live gate guards, then its handle. At cages direct to guards only when they actually block release. Guide to the base of the high alarm scaffold from ground level. During the north crossing show pursuit clearance versus follow/proximity, with accurate host/guest state.
5. Verify normal-camera use, physical movement, closed/open cage collision, all entry routes, quiet/loud rescues, real pursuer attacks and failure/retry, optional climbs/rewards, old saves and two-client synchronization. Update the blueprint from actual geometry, preserve save identifiers and publish only after checks pass.

## Failure cases to check

New signs must not obstruct roads or obscure controls. Ground texture must not make a false elevated connection. Cage collars cannot trap the player or a returning save; open front remains wide enough for two prisoners. Forced guards must approach on the ramp and be reachable with melee. Escort HUD must not imply the timer advances while combat holds the group. Guest navigation must handle untagged enemy replication using host counts. Completed saves stay complete and no duplicate reward is issued. A continuous rendered interaction must include a mistake and recovery. Automated checks do not establish fun or human comprehension; public-network and low-end performance remain separate limits.

## Implemented and verified

The pass is implemented in v2.194.0. Physical checks exposed two existing roads through cage footprints and a cave return into the escape gate. Those connections now go around the cages and join before the gate, with map bounds retained. The north companion cut a doorway corner after the sides became solid; both the spacing and first turn now clear the bars. Normal-camera inspection also exposed bulky signal geometry hiding the player and sign posts touching the text planes. A reused detailed winch, front standing point, cut cable and thinner sign posts resolve those presentation issues.

Verification evidence and precise limits: `../art-validation/canyon-journey-20261014/summary.json`. Three entry routes, 10 route sweeps, signal/freight climbs, a continuous rendered fall/recovery/retry, live pursuer damage and failure/retry, older save loading, shared-art regression and 16 two-client co-op assertions passed. Story/reward identifiers remain unchanged. No full combat playthrough, public-network, low-end performance or human enjoyment claim.
