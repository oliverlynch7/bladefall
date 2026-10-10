# Great Furnace: cooling-box counterweight route — 10 October 2026

## Grounded finding

The live ED-04 cooling-box reward is still a three-button sequence pressed beside the main water controls. Its reverse-order clue changes the story words, but the player's action remains the repeated combination pattern Oliver dislikes. The shard is optional and should ask for a different skill. The existing cooling room has a solid landing by the old box at (520, -5480, 120) and empty space east of it; the command office and mandatory crossing sit on separate paths.

## Player action and visible consequence

Once the main crossing is cooled, water drives an exposed counterweight gantry east of the cooling room. A short clue at the plate points to the now-moving platforms without locking out a player who discovers the route first. The player jumps across unequal, laterally moving industrial decks, including a turn back toward the upper box landing. The lid is shut until the player reaches it and opens it; it visibly parts and reveals ED-04 on that landing. A missed jump drops to a lower catch and returns the player to the entry, with no level reset. The reward demands observation and movement rather than entering a code.

The moving positions use the Furnace's host clock so co-op players see the same timing. The world event and `gf.cache.open` are shared, while each player collects ED-04 personally. The old three-button progress item is ignored. A previously opened box stays open and a player who has not yet collected ED-04 can still reach it.

## Acceptance and limits

- Keep `gf.cache.open`, ED-04, the main waterworks and Colossus route, and personal shard banking intact.
- Verify a normal-speed physical route with a deliberate missed jump and recovery; inspect normal-camera platform/lid views before and after. A scripted flag alone does not prove traversability.
- Verify old partial/open saves, two-player opening and personal collection, death/checkpoint banking, and the static gate. Human playtesting still determines challenge, art and fun. Do not add custom SFX.

## Implementation and verification

The cooled main waterworks starts four moving decks on the east gantry. Their different heights, lateral timing, and turn to the upper landing make the shard a traversal reward. A missed jump lands on a low grate with two steps back to the entry. The chest is solid and placed to one side of the landing; the player stands in a clear lane to open it. The lid slides aside and ED-04 appears. The old box event is gone, while its open flag and personal shard ID stay intact. Reading the plate is optional. Prior partial button values no longer block the route; an older opened box remains open.

Muted browser QA physically missed, recovered, jumped all four decks, opened the high chest, and collected the shard. It also tried to open the chest from the lower grate and walked into the solid chest to check collision. The full Furnace route and death/checkpoint banking passed. Two browser players checked shared opening, host-clock platform motion and separate ED-04 collection. A pre-change partial save and completed-box save both reloaded with the expected state. Static gate and normal-camera before/after images passed. Human playtesting remains needed for timing, difficulty and art judgment.
