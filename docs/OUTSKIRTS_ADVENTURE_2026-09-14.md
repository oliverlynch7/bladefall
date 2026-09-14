# Outskirts adventure redesign

Oliver grants full control of the Outskirts landscape, objectives and player experience. Preserve the recent art direction, existing avatars/weapons, browser budgets, other levels and trial difficulty.

Inspection: current revision is eight rectangular rooms with straight connections, a twelve-boar quota, a reach marker and a find marker. The renderer dresses these as tiled islands. Existing purge objectives, per-room encounters, optional caravan/mill rewards, healing pads, class-trial entrances and saved campaign progress can support a richer level without replacing those systems.

Design: a south-road arrival and small first encounter lead to an early watchpost. Below it, a broad farming valley offers a mill commons, western cornlands and an eastern orchard route. Break two thorn nests in either order, explore the flooded hamlet and mill machinery for existing optional rewards, regroup at the river, then ascend to the Old Waystone. Surveying the valley and breaking the nests are required to awaken the Waystone. The Thornwood entrance remains an optional discovery, in a secluded grove. Curved paths, continuous meadow skirts, stepped earth slopes, a stream and clustered farm structures replace the isolated-room appearance. Sheltered spaces between encounters provide recovery and orientation.

Implementation is scoped to campaign Outskirts area zero. Use explicit route and encounter data, existing instanced scenery with earth/meadow rendering tags, authored objective placements, and a campaign revision migration so old completed objectives stay complete while old partial boar counts do not become completed nests. Existing optional mission rewards and progress remain intact.

Check bidirectional walking on every authored route, objective and side-entrance reachability, actual interactions and exit progression, early Waystone gating, save/reload at partial and completed progress, old-save migration, other-area fixtures unchanged, and real browser high/low rendering. Publish a new phone-accessible Blender overview and playable build after validation. First-visit duration is a design target, not a measured claim.

## Implemented and verified

Version 1.970.0-outskirts-adventure: thirteen named districts, eighteen curved connections, continuous meadow ground, farm buildings/crop plots, a millrace, a roofed lookout and low-poly instanced banks. Three objectives replace the old quota-driven sequence. The primary navigation cue points toward the watchpost, then the nearest remaining nest, then the Waystone. Optional reward IDs remain unchanged. Individual nest completion persists across reloads. Legacy completed boar quotas stay complete; partial quotas restart the new nest objective without losing inventory or completed survey/find objectives.

Real movement checks passed every connection in both directions (36 in the Outskirts, 302 across the exploration campaign). All 15 Outskirts placed targets were reachable. Chrome tested early Waystone gating, orchard-first completion, save/reload after one nest, final portal opening, and old partial/completed objective fixtures. The other 23 campaign areas have identical geometry and quest definitions against the pre-change build. Static scenery at the mill measured about 61k visible triangles on High; Low uses the existing reduced draw distance. This is not a mobile frame-rate benchmark or a human pacing/balance review.

The updated Blender overview and route map are available in /3d/art-previews/layouts/#campaign-0-0. The Blender source is retained in the Codex workspace under outputs/outskirts-adventure-final/secondary-overview.blend. The offline render shows static landscape; gameplay objectives and enemies appear in the browser.
