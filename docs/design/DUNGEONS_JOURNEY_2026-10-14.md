# Dungeons finishing pass — 2026-10-14

## Approval and baseline
Latest user: “Go on.” Continue the announced next area, Ruined Keep — The Dungeons, under the existing campaign finishing and U-GEO-20261012 authorization. Baseline 6360c7df, v2.195.0. Keep bounds X -1800..2800, Z -5150..700, all story/reward IDs, the physical winch, press corridor and drain jumps. No new story reveal, custom SFX, trial or unrelated companion work.

## Source-grounded findings
- Navigation chooses the service door through walls, and after the ascent directs the player back to the winch even when already on the upper floor. Use actual floor entrances and stage-aware boarding/shelter destinations; never disclose optional shard solutions.
- The release gate is 330 units wide inside a roughly 1,000-unit corridor, with no connecting cross-wall. Close the side gaps with matching visible masonry and collision, keeping the real doorway.
- Two of the four scripted prisoner arrival lanes cross the central lift drum. Route the group around it and stand beyond the operator's winding circle. Preserve timing and save flags; derive walking direction from motion.
- The hidden service door and release/depth bars use simple fallback boxes. Fit detailed hinged stone/wood service doors and framed gates to their actual collision. Keep the existing detailed winch/press models. Use existing papers/diagram art; add only useful signs and a visible prisoner lock/bundle.
- The hostage/lift simulation stops whenever the host has any NPC conversation. Verify that independent co-op conversations do not freeze the shared mechanism. Keep all completion host-authoritative.
- The winch label embeds E instead of relying on the rebound interaction badge. Remove the duplicate hardcoded key. Repair malformed apostrophes in the existing Ellis/keepsake notes; keep their facts unchanged.

## Blueprint before buildout
Update map 2-1 intent first: entrance roster -> west cells -> service door -> holding-room guards/prisoners/papers -> boarding dock -> winch -> upper shelter -> release gate. Walter remains optional guidance. Lower works begin at the east gallery and descend under the shaft. Drain branches from the east cells and retains all three jump stretches. A full-height release bulkhead closes both sides of the gate. No extra staircase, filler floor across the shaft, or shortcut across the floodwater. All other maps remain unchanged. Refresh this map's final geometry from the initial built state.

## Verification and failure controls
1. Capture genuine previous-version partial save and normal-camera baseline; load it after changes with name, character/class XP, gold and flags intact.
2. Walk main and optional routes through actual physics. Test all barriers before and after opening, including side bypass attempts. Check group positions against solid obstacles and proper floors throughout the rescue.
3. Inspect an uncut normal-camera winch interaction with partial winding, release, lowering, retry and ascent. Check press hit/recovery/brake and all drain jumps/water recovery. Keep moving surfaces visible under the player.
4. Two rendered clients through real host/guest handlers over a local relay: shared doors/guards, exclusive winch ownership, guest winding, local conversations, transfer, late boarding, repeat packets and exit.
5. Relevant unit/story/source checks, no browser errors, version bump, exact-path commit, main push and live verification. Record evidence and limits. Clean only owned fixtures, tabs and server.

Automation cannot establish enjoyment, pacing, novice comprehension, public-network reliability or low-end performance. These remain human playtest concerns.

## Traversal-driven corrections

Live winding exposed approach inertia locking the drum to an unintended direction. Require a small deliberate angular movement before locking direction. Prisoner checks found an unsupported corner before boarding; route via the supported dock. The holding room also has an unguarded eastern exit that bypasses its hidden entrance: fit a barred exit released by the existing cell lock (`kd.free`), with visible bars and matching collision, then route new arrivals through the west service door. Preserve old free/transfer saves. Clear obsolete transient directions as their step completes, retaining every journal note.


## Verification complete

Implemented and verified as described in `../art-validation/prison-journey-20261014/summary.json`. Main route: 55 waypoints; drain: 86; lower works: 40; cooperative: 18 assertions. Original bounds and all story/reward identifiers retained. Final initial-state geometry replaces only map 2-1. Human pacing and enjoyment remain unverified.
