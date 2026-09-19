# Approved update queue — 2026-09-17

Owner approved completing these sequentially. Keep existing asset-pack player models. Rejected warrior prototype remains preview-only and is excluded from this production branch. This order supersedes older NG+ removal and deferred-art instructions.

- [x] 1. Companion and standard necromancer summon models; Raise the Dead uses the actual slain enemy as an undead ally.
- [x] 2. Audit/fix autosave persistence for player levels and class ranks; preserve existing saves.
- [x] 3. Higher-definition elemental weapon projectiles, rounded staff orbs.
- [x] 4. Natural, world-appropriate paladin recolor of existing avatar.
- [x] 5. Stronger individual skill/class animation identity; Smite is a golden lightning bolt from above.
- [x] 6. Repair mirror.
- [x] 7. Improve NPC models and detail.
- [x] 8. Block off-class bag equipment; class changes equip compatible owned weapon or weaker class starter.
- [x] 9. Fix trial starters falsely labelled off-class.
- [x] 10. Element/type weapon recolors aligned to item icons.
- [x] 11. Remove white backgrounds from weapon icons.
- [x] 12. Hide old graphics during load; reduce startup stutter via loading/prewarm.
- [x] 13. Walking continues visually during moving attacks/skills; add deliberate stationary cast requirements only where justified.
- [x] 14. Dash trails match current character appearance.
- [x] 15. Widen top-left HUD and prevent overlapping text.
- [x] 16. Add NG+ with scaling difficulty and campaign relock only; retain money, level, classes/ranks and inventory.

## 1. Grounded inspection
Corpse records currently store only position/lifetime. Raise the Dead chooses a nearby corpse and summons a generic minion. Companion render paths are separate from mob3d. Capture source appearance on kill, preserve allied identity and faction in rendering, and upgrade companion models without reintroducing hostile AI. Validate source identity, allied targeting, summon expiry and rendering.

## 2. Grounded save findings
The Continue flow called openHub, which restores escrow and discards unbanked class XP even when a saved campaign run exists. Resume that run instead. Snapshot living players while paused/choosing upgrades, bank the live hub hero, and save immediately after character growth. Keep intentional death/trial rollback and Arena isolation. Expose storage failure diagnostics. Verify reload with a pre-change save, distinct character/class XP, equipment and money.

## Remaining implementation and verification — 2026-09-19

All sixteen queue items now have implementations in v1.981.0-approved-updates. Player avatar geometry and hand-fitted weapon transforms remain the existing asset-pack versions. The experimental warrior is excluded.

Grounded implementation: smooth projectiles replace only orb-family draw paths, with a 64-instance cap (24 on low). NPCs use the existing articulated character library with role accessories. Skill identity plugs into the existing bounded combat ribbon renderer; gameplay damage/cooldowns remain owned by index.html. Weapon palette edits preserve dark warm grips. Mirror inspection snapshots the living hero and isolates its render from world scenery. Class compatibility is enforced both at the bag action and during class changes; automatic displacement preserves inventory even at capacity. Loading holds simulation while models and twelve stable rendered frames warm up. Moving attacks sample only the rig's leg tracks; three deliberate defensive/summoning casts plant for 0.3 seconds and allow dodge. NG+ uses separate persisted campaign scalars, resetting campaign gates only.

Browser verification (real WebGL, muted localhost):
- Pre-change v1.980 save: character level 17, XP 123, class rank 6, class XP 73 and gold 765 survived Continue. Paused level 18 persisted.
- All 16 class starters are compatible. Owned staff selected on switch; displaced sword preserved; off-class bag handler refused equip; Berserker fallback is a weaker axe.
- Actual slain goblin raised with source identity, attacked a hostile goblin, and expired normally. All seven pet assets loaded; standard skeleton summons loaded.
- Five detailed hub NPCs loaded without page errors. Mirror uses live level/loadout; face texture preserved after correcting Head_1 filtering; glare removed. Screenshots inspected at 1280px and 390px.
- Four elemental orb types rendered in one draw (1,760 triangles). Skill geometry smoke coverage: all 128 profiles at three animation times. Visual spot checks: Smite, Army of the Dead, mage Nova. This is not a claim of exhaustive visual review of every skill combination.
- Moving attack sampled 24 Run leg tracks. Dash pose changed from Warrior to Cleric after class switch. Defensive cast plant timer is 0.3s.
- Delayed hub asset by 2.2 seconds: loading screen remained visible, simulation time stayed at zero, then released with the world ready.
- NG+ retained normalized hero/gear, class progress, gold, stash and unlocks; reset zoneMax/zoneDone; difficulty rose to 1.65x HP / 1.25x damage; reload retained cycle/scalars; repeated start rejected until campaign completion.
- Twenty weapon icons regenerated with real alpha, resized to 256px for delivery; aggregate 689,172 bytes (smaller than old assets).

Limits: low-end hardware performance still needs user playtesting; loading has a 12-second fallback so failed downloads cannot trap the player. Native companion identity is local; remote-party summon replication still uses the existing simplified appearance protocol. Skill effects retain each class's shared visual vocabulary; future tuning should be based on actual skill-by-skill play feedback.
