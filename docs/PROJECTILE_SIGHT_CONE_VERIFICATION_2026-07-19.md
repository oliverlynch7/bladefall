# Projectile Sight Cone Verification — 2026-07-19

## [Codex | 2026-07-19]

Shipped in `VERSION3D 1.186.0`:

- Player projectile lock-on is restricted to a 90-degree forward vision cone: 45 degrees left or right of the camera/facing direction.
- Targets require clear line of sight; walls and closed geometry prevent locking.
- With no valid target, shoulder/FPS shots travel straight through the reticle rather than toward an enemy beside the character.
- Normal ranged attacks, charged bows/bolts, thrown javelins, axes, scythes, projectile skills, Mark, Meteor, Shadowstrike, and Execute share the sight rule.
- Homing weapons retain only their valid initial target and stop steering if it leaves sight; they cannot reacquire an enemy off to the side.
- Pet projectiles retain independent companion targeting.

## Browser QA

- Target at 0 degrees: locked.
- Target at 44 degrees: locked.
- Target at 46, 90, or 180 degrees: rejected; projectile traveled at 0 degrees through the reticle.
- Target at 20 degrees behind a wall: rejected.
- Charged javelin with only a side target: traveled straight forward.
- Holy Scepter target moved from ahead to the side after launch: projectile did not turn sideways.
- Browser console: 0 errors, 0 warnings.
- JavaScript syntax and `git diff --check`: passed.

`UPDATE_ROADMAP.md` remains unsafe to patch because its existing bytes are not valid UTF-8, so this append-only note records the shipment.
