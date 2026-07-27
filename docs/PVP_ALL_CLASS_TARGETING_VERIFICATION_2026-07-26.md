# PvP All-Class Targeting Verification — 2026-07-26

Branch: `bladefall-autopilot`

Build: `1.388.0-autopilot`

## Problem

PvP rivals lived in `MP.peers`, while spell targeting, class-area damage, pets, and
player projectile collision searched only `G.enemies`. Regular melee had its own
PvP path, which made the failure look inconsistent across classes and weapons.
Necromancer summons also used a separate one-off peer target and could create
excessive army pressure.

## Fix

- Added one team-safe `pvpHostiles()` source and `combatTargets()` abstraction.
- Routed sight-constrained aim assist and projectile targeting through that source.
- Routed all class skill damage searches through the shared combat-target source.
- Routed magic/ranged weapon projectile collision, pet attacks, pet projectiles,
  special charged attacks, damage fields, meteors, and class upkeep attacks through it.
- Added a peer branch to `hitEnemy()` so direct class damage uses the established
  authoritative `pdmg` route rather than mutating a remote avatar locally.
- Preserved teammate exclusion in 2v2 and the existing 90-degree sight/LOS rules.
- Reused stable peer objects so local caster-owned marks, curses, and delayed
  Warlock burst state persist between network position packets.
- Rebalanced Necromancer summons in PvP only:
  - summon hit damage is 35% of campaign summon damage before the global PvP scalar;
  - the entire army shares a 0.22-second attack budget;
  - PvP summon attack recoveries are slower (1.25s melee / 1.5s ranged);
  - campaign summon damage and attack cadence are unchanged.

## Verification

- JavaScript extracted from the production HTML: `node --check` passed.
- `git diff --check` passed.
- Real muted Chromium smoke test at 1600×900:
  - no console or page errors;
  - hostile peer acquired by sight targeting;
  - direct `hitEnemy()` generated authoritative PvP damage on both the host-owned
    route and the guest-to-host relay route;
  - Fire Staff projectile acquired and collided with the peer;
  - first active skill for all 16 classes generated PvP damage without an exception;
  - 2v2 teammate was excluded while the opposing player remained targetable;
  - six-summon Necromancer army over a five-second controlled window produced
    five capped hits, 55 raw pre-defense/pre-global-scalar damage, maximum hit 11.

## Scope

Preview branch only. No campaign balance, drops, saves, or class progression data changed.
