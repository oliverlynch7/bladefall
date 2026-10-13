# Briar's player journey — 12 October 2026

## Inspection before construction

Current source: v2.187, live Homefields/Black Woods, not the isolated beta. Bounds remain Homefields [-3030,2850,-4820,1100], Woods [-2600,3150,-4900,650]. Keep story, chest/shard/reward identities and optional farm, orchard, granary, bell defense, root hollow and rescue routes.

Observed weaknesses: ground paths render as overlapping rectangular patches; farm and forest junctions give little destination information. The live mill asks for three nearby E interactions and barely animates the machinery, despite the successful physical beta example. The forest's final ground-route guards spawn at the upper signal deck's height, leaving the lower crank poorly defended. Mara's delivery requires one more topic selection to activate the next main objective.

## Intended changes

1. Preserve the actual route centerlines and large floor area. Paint continuous, narrower earth trails along them, leaving outdoor ground between destinations. Put concise timber direction boards at real junctions, outside movement lanes; signs name places, not secret rewards.
2. The live mill uses the proven beta interaction: step on a broad pressure plate to demonstrate the sluice, then move a grain crate onto it to keep the water off. The crate can be moved with E + walking and released/reset. The wheel's jam and bridge remain the story's machinery; water, crate, wheel, sluice and lowering bridge visibly respond. Keep briar.water/jam/bridge flags, including old partial and complete states. Co-op may share operation; one player owns the crate at a time and disconnect releases it.
3. Delivering Mara's supplies also gives the next destination. Leave her optional explanation accessible. Refresh the journal and objective together so closing dialogue never loses the next step.
4. Put the two signal guards on their authored ground storey. Keep the canopy as an actual movement alternative with distinct elevations and safe missed-jump recovery. Preserve the finite main guards and designated replenishing hunting camp; no blanket enemy spam.
5. Check the entire route from Thomas through the Woods and the Brute, plus representative optional branches. Fix actual blockers or misleading guidance found in this pass. Avoid imposing more mandatory errands.

## Failure cases and acceptance

- No painted route crosses an unbuilt bridge, wall or unrelated upper storey. Mill channel stays visible; ground recovery does not bypass machinery.
- Moving crate cannot enter buildings, block the only exit, lift into the air, or be operated by both players. Provide an accessible reset; premature wheel/bridge interaction explains the physical obstruction.
- The bridge's collision opens when the animation ends. Old completed saves render it open without replaying or paying rewards again.
- Validate normal camera, a deliberate mistake and recovery, actual player movement, early discovery, journal/tracker, previous saved state and a two-client relay.
- Test standard starter builds separately from route-only invulnerable fixtures. Record what was simulated, what was visually inspected and what still needs human pacing feedback.
- No SFX production, beta replacement, map shrink, unrelated companion edits or broad difficulty increase.

Status: plan recorded before this pass's layout/mechanism edits. Implementation and evidence follow below.

## Inspection correction before placement

The browser push test found the east orchard ramp intersecting the initial crate lane. Put the crate/plate west of the mill on clear ground (130,-1600 to 130,-1880), retain the mill building and wheel, and align the lowered crossing with the actual main trail at x=180. The side orchard ramp stays intact. Connect painted paths through room centers, and use one joined ground mesh to prevent overlapping ribbons from flickering at forks.

## Final presentation corrections

The uncut normal-camera check exposed an oversized rectangular water patch reaching a roadside lamp, and obsolete mill hints remaining on screen after the next step. Confine the shallow crossing water to the bridge and existing east brook, with low stone banks; no floor, route or collision change. Remove only superseded mill notices from the transient queue while retaining the journal entries and discovered sketch.

## Implementation — v2.188.0-briar-journey

The live Homefields and Black Woods now have joined earth trails through room centers, nine destination boards at actual forks, and the physical mill described above. The detailed mill building, trees, store, optional granary/orchard routes and forest canopy remain. Repositioned the crossing lamp and its collider onto the east bank; removed grass piercing the new deck and clipped the old brook curb at the junction. Main and optional level bounds are unchanged.

The mill permits solo crate use or co-op plate holding. One player controls the crate; a disconnected, dead, airborne or distant owner releases it. The reset lever cannot interrupt another player's control. Sluice, water, jammed timber, wheel and bridge respond visibly. Collision opens after the bridge has finished lowering. The old water, jam and bridge flags restore the corresponding new state without requiring replay. The discovered sketch is accessible through related clues; obsolete transient hints clear without deleting journal history.

Mara activates the escape objective when supplies are delivered. Her extra explanation remains optional. Older delivered-supplies saves receive the missing objective on load. Two signal defenders now occupy the ground route instead of accidentally standing on the canopy deck. Combat tuning and reward identities are unchanged.

## Verification and limits

- Main journey: 20 assertions and 69 actual movement waypoints from Thomas/Mara, through the supplies, mill and Woods, to the Brute checkpoint. This is an accelerated navigation fixture with enemies stunned; it is not a full combat playthrough.
- Optional-route/combat regressions: store and orchard climb, granary, canopy/loft/root routes, Brute arena progression, jump/dodge damage checks, local enemy combat roles and older granary saves.
- Co-op: two browser clients exercised the actual host/guest handlers, ownership, reset rejection, disconnect release, guest movement, bridge synchronization and stale/duplicate packets. Transport was a local relay, not a public-network session.
- Pre-change saves: four stages created by the v2.187 main HTML and loaded in the new build, retaining character/class XP, gold, equipment and name. The checkpoint reload also retains departure, signal and the supply reward receipt.
- Presentation: an uncut real-time mill interaction includes an attempted premature action, stepping on/off the plate, pushing the crate, clearing the jam and lowering the bridge. Normal-camera frames were inspected; the two corrected ground guards also dealt damage from their authored positions against ordinary starter health.
- Blueprint UI: 55 checks across all sixteen maps, including phone layout, marker selection, before/after views, height filters, zoom and pan. Generated plan geometry was refreshed from the final build.

Reproducible browser scripts and the detailed evidence report are in `scripts/qa-briar-journey*.cjs`, `scripts/qa-briar-mill-coop.cjs` and `docs/art-validation/briar-journey-2026-10-12.json`. The save test requires the temporary old-HTML fixture documented in that script. Unit coverage is `scripts/test-briar-journey.cjs` plus the existing story-state, authority and Briar-refinement suites.

These checks establish the listed implementation behavior and inspected presentation. Human pacing, fun, aesthetic acceptance, public-network co-op and lower-end-device performance remain unverified. The wider campaign pass is still in progress; Hollow Cliffs is next. No custom SFX work.
