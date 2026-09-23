# Weapon release motion audit — September 23

Scope: existing EQ-10 and VISUAL-REVIEW-03/04/05 approvals. Preserve preferred player models, damage, class access, saves and existing fitted weapon anchors.

Code findings: chargeRelease does not guarantee a new swing serial; several charge handlers set only atkTimer. Same-clip releases can consequently fail to restart the mixer action. throwDagger creates an arrow and never starts the existing thrown-weapon hide lifecycle. Javelin/axe/scythe already use that lifecycle. Existing static grip audit is retained.

Plan: guarantee a new serial on charge dispatch without double-incrementing handlers that already do it. Reuse thrown-weapon lifecycle for daggers, render a short blade with grip/guard instead of arrow fletching, and select an existing release clip. Verify repeated releases, peer packet roundtrip, actual mesh disappearance/reappearance, unsupported off-class rejection and prior two-hand javelin behavior in Chromium. Run existing grip checks and save compatibility checks where relevant. Publish only verified changes.

Separate finding: peer presence omits skill combatPose and grounded state. Keep tracked for a subsequent bounded multiplayer animation batch; do not fold unverified networking changes into this fix.


Inspection correction and second bounded step: combat-art.weapon already assigns a fresh local combatPose serial to charged attacks. The missing swing serial chiefly affects the peer/fallback path, not all local releases. The dagger charge also defaults to a heavy Attack2 pose in that layer; choose the same existing throw clip there. Extend this batch to transmit sanitized render-only combatPose, grounded state and actual velocity through selfState/mkPeer/applyPos/snap and drawPeer. Age cast time between packets, retain backward compatibility with packets lacking motion. Test real rendered peer clip selection, invalid packets, expiry, relay and existing party trial flows. No network movement or damage authority changes.

## [Codex | 2026-09-23] Weapon release and teammate motion — 2.028
Charged dagger now uses a short blade projectile, the existing thrown-weapon hide/recovery lifecycle, and the existing forward release clip in both the main picker and combat effects pose layer. Every accepted charge release advances its swing serial exactly once, including fallback/peer paths; rejected off-class releases do not. Damage/range/access and anatomical grip offsets are unchanged.

Peer presence now carries sanitized render-only velocity, grounded state and casting pose through host relay. Teammates show casts, running and jumps rather than always-grounded placeholder walking. Cast timers age between packets; old packets without motion retain previous fallback behavior. No movement/damage authority change.

Verified: 64 asset/body fits and448 poses without grip failures;30 repeated charge releases across10 weapons; dagger mesh hide/restore and packet roundtrip for Ranger/Ninja/Pirate; off-class rejection; seven Pirate hand/muzzle poses; three javelin two-hand release cases;11 two-browser motion checks including actual rig clips, relay, expiry, invalid fields and legacy packets;34 two-browser party-trial regressions with zero page errors. Pre-change save retained class rank, gold, companions, dialogue intro state, return-visit state, checkpoint and journal clue. Syntax checks passed. Local Python server lacks voice-api/game (expected404); this is not a production voice failure. Screenshots inspected locally.

Limits: controlled browser relay, not internet latency/packet-loss soak testing. Existing imported clips reused, no new animation asset authored. Crossbow still uses a bow asset and needs a deliberate model/pose correction; wider skill/weapon contact poses remain an audit, not a blanket zero-clipping claim. Exact trial scripts/Pyromancer, mounts/flight and wider level surface audit remain open. U183 private archive has183 messages,zero parse errors,valid references.
