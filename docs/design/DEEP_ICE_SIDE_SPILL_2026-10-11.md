# Deep Ice Caves side channel — grounded change packet

## Existing player action

The optional FF-04 route starts at the lower waterworks. Three controls stand together on the near bank. Each toggles one bit, and mask 5 opens a full-width bridge. The plate tells the player which pipe to leave shut, but the actual action is still cycling adjacent controls. The main waterworks already has a distinct raised-float crossing and stays intact.

Normal-camera baseline at the lower channel shows the three controls and a dark basin. The camera is obstructed at some coordinates in the room, so the new route must be reviewed from several actual player positions rather than from one staged still. The existing basin has a safe dry return if the player falls in.

## New player action

Retire the three toggle controls. The spring currently spills into the lower basin because an old stone plug hangs above the spill mouth. The plate points out the hanging plug and the maintenance ledges along the west wall. The player climbs an uneven, rising set of ice-and-metal service ledges, reaches the retaining pin above the basin and releases it. The plug visibly drops into the spill mouth; water shifts to the chiller feed, which freezes the existing side bridge to the sealed chamber. The old FF-04 shard remains on the far side. A miss returns the player to dry controls under the existing basin safety rule.

The player must observe the pipes, find and traverse the elevated route, and operate one distant release. No order or mask is required. Each new ledge has solid collision and a clear edge; the route does not hand out a different reward or block the main path.

## Compatibility and authority

Keep `ic.channel.clue`, `ic.channel.open`, FF-04 and all main waterworks/quest identifiers. Old completed saves create the bridge and show the plug seated. Old partial `ic.channel.mask` values are ignored, not removed from the save. The release is a shared authored story event, so the host owns it and late guests see the same open bridge. The side branch remains optional.

## Acceptance

Use muted browser QA to inspect normal-camera before/after views; prove the actual ledges can be jumped with normal player physics; test a miss and dry recovery; confirm the release cannot be reached from the near floor; check visual plug and flow change, shard access, main route independence, old completed/partial saves, and two-player story sharing. Static/story tests and an inline-script parse must pass. Human playtesting is still needed for visual clarity and challenge.

## Implemented and locally verified

Five solid ledges now rise along the lower basin. The retaining pin sits at the edge of the highest landing; the suspended plug is behind it so neither hides the character from the normal far camera. Releasing the pin drops the plug, changes the visible pipe flow and freezes the existing FF-04 bridge. The optional tracker stays active until the shard is actually collected. The main waterworks still requires two pump pulls, the floating platform, freeze and far drain; it remains independent.

Muted Chromium checks passed: all five jumps using player movement physics; miss and dry return; floor-height interaction denied; once-only release, opened crossing and shard collection; old complete/partial state; two-page co-op sharing and personal shard pickup; checkpoint, full cave route, physical main float route and the Sky Library cross-level puzzle regression. The revised QA scripts also correct outdated assumptions about the existing waterworks and local-only conversation camera. Static story, inline-script and JSON checks passed. The local static server returns expected `/voice-api/game` 404s because no voice API is running; no page exceptions occurred. Human playtesting remains for the climb's feel, camera angles and visual polish.
