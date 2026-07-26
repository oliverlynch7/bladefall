# Necromancer Summon Campaign Targeting Fix - 2026-07-26

Branch: `bladefall-autopilot`
Version: `1.384.0-autopilot`

## Root cause

The earlier multiplayer authority repair correctly relayed summon damage, but campaign target acquisition still rejected every mob whose `active` flag was false. Large authored levels keep enemies asleep until combat begins, so minions could stand within hunting distance of a valid mob and return to the player without moving or attacking.

Summon combat also used `!isHitless()` as a blanket gate. That disabled the Necromancer's defining class skills throughout Hitless campaign mode.

## Fix

- Minions now hunt active enemies within 540 units.
- Minions can deliberately wake and attack a sleeping campaign mob within a limited 360-unit radius.
- Sleeping mobs outside that radius remain asleep, preventing summons from pulling an entire district.
- Summon combat remains active in Hitless campaign mode.
- A pursuing summon now follows its target's elevation instead of remaining visually below it.
- Existing co-op host authority and PvP rival targeting remain unchanged.

## Browser verification

- [x] Before the fix, a summon near a sleeping mob dealt zero damage, moved zero units toward it, and left it inactive.
- [x] After the fix, the same scenario woke the mob, moved the summon 288 units toward it, aligned its height, and dealt 100 damage.
- [x] The real `Summon Skeletons` skill created four minions, woke a sleeping campaign mob, and dealt 633 representative damage.
- [x] Hitless mode kept four summons active; they woke the target and dealt 443 representative damage.
- [x] A sleeping mob outside the 360-unit wake radius remained inactive and took zero damage.
- [x] Muted Chrome reported zero console errors and zero warnings.
- [x] JavaScript syntax and `git diff --check` pass.
