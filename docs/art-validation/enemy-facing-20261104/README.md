# Enemy facing verification

Code79eb6354, version2.368.0-enemy-facing.

- New55-check enemy-facing regression suite: bounded rates and shortest arc, ordinary melee lock/recovery/rear contact, authored boss geometry, King sweep cycle, prison alignment, charge/projectile locks, guest mirror.
- Existing final-king, campaign-elites, brute-encounter, furnace-colossus, boss-tactics(86), boss-environment-mastery(151), menu-shortcuts, frost-officers, marble-guardian, fallen and marksman suites pass.
- Native muted IAB, actual game update/hitEnemy/enemySnap/applyEnemies: shield front30 and rear100 from equal100damage; windup stayed facing0 with player behind. Serialized host snapshot and guest update preserved body/shield0 and host shield role.
- Native actual final arena: King sweep windup stayed yaw0 after target moved behind; actual geometry hits front and misses rear. Screenshot freezes the verified strike for inspection, with player moved sideways to remain clearly visible behind the King.
- Native error log empty. Test localStorage restored after leaving the game document. Test server/tab closed.

Scope limits: deterministic staged combat and guest reconciliation, not a new two-computer network test or human playtest. Invulnerability used to keep fixtures stable; rear-safety evidence comes from actual attack geometry tests, not merely unchanged player HP. No save schema, boss health, damage, or environmental-counter changes.

Production verified: code79eb6354, Cloudflare a6d66588-84a1-49de-b0ea-922b937fdafa succeeded. All11 changed game resources match committed SHA-256 on bladefall.pages.dev. Native production title shows v2.368.0-enemy-facing; CDP confirms game ready and both facing/King APIs loaded. Test tabs/server closed and local test storage restored.
