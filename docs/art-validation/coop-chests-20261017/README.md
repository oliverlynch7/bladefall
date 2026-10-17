# Co-op independent chest claims — 2026-10-17

Candidate v2.256.0-coop-chests. Host rolls dropped chest existence, position and rarity; each player owns their reward roll and persistent claim. Placed/dynamic chests also sync without opened/claimed/item fields. Practice Sprint remains unrewarded.

- 120 existing/new regression suites pass; 44 focused isolated transaction checks.
- 22 browser checks pass using two rendered old-save game instances with separate in-memory storage and a real reliable local WebRTC data channel. Actual MP.broadcast and MP.onGuestData are used. Both claim orders, full bag, saved claim restoration, late arrival, duplicates and wrong scenes pass; no browser errors.
- Host claim descriptors survive restore so a later-arriving friend can still receive their independent reward. Guest kill credit keeps XP/quests but cannot roll independent random chests.
- Guaranteed final-boss weapon/armor templates survive mirroring; both players can claim the Abyss Blade.
- Same chest identity/location/rarity; item rolls intentionally remain personal. Existing saved items/claims are retained, not rerolled.
- Local WebRTC validates transport serialization and game handlers; public PeerJS signaling, TURN/NAT and Internet latency were not separately exercised.
