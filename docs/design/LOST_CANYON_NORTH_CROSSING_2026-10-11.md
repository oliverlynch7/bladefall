# Lost Canyon north-prisoner crossing — 2026-10-11

## Grounded problem and approved direction

Both required cage groups currently resolve through the same action: clear two guards, press the lock, and watch invulnerable prisoners walk on their own. The north cage sits in an exposed alarm yard, while the south group has a sheltered route. Oliver has approved damageable escorts, visible health, attackers that actually target them, ambushes, retry after failure, and combat objectives that differ in play rather than just words.

## Scoped change

Keep the south release as the quick secured rescue. Opening the north cage begins a distinct crossing through the east yard to Ruth's shelter. Two prisoners move when a living player is close; two authored ambush points bring Legion pursuers. The alarm patrol can also threaten them while the high signal cable remains active. If either prisoner falls, both retreat to the open cage, recover, and retry when a player returns. Cutting the cable first removes the repeating alarm patrol and reduces each scripted ambush by one fighter. The existing `lc.north` flag becomes the durable **safe at shelter** completion; `lc.north.open` records a new, open-but-not-yet-safe state. Old saves with `lc.north` remain complete and open the north cage.

The crossing uses the north yard and shelter, with a short evacuation lane connecting their separated floor. Add two visible health bars, movement/ambush guidance, and a world-state cue at each ambush. No new story beat or reward. No custom SFX.

## Acceptance

- North flag does not complete on first lock interaction. The cage opens and the group begins moving with player proximity.
- Enemy bodies approach and attack prisoners; health bars and damage cue respond. A fallen prisoner resets the crossing without trapping progress.
- Alive players in solo/co-op keep the group moving; host owns health, waves and completion; guest sees the same state.
- Quiet alarm-first route has less pressure, loud route has repeating patrols; both remain completable.
- Existing completed and partial saves, south/extra cages, freight shard, Ruth reward and escape gate still work.
- Browser checks include actual movement, deliberate failure/retry, both alarm orders, old saves and two-client synchronization. Human feel and visual quality remain unverified until Oliver plays.

## [Codex | 2026-10-11] Local verification

Implemented in v2.174.0. Muted browser checks passed opening versus completion, full crossing, a deliberate prisoner fall and retry, both ambush waves reaching and hitting prisoners through live AI, loud/quiet wave counts, two-client position/health/target sharing, older completed and partial save reloads, full Lost Canyon traversal, signal patrol behavior, two-client existing canyon story, and the five-shard Ninja route. A terrain sweep checked both prisoner positions at 0.25-second intervals and caught an unsupported gap; the added evacuation lane closes it. Normal-camera review caught the two north prisoners reading like dark red enemies; they now use different civilian models. This is a scoped quest improvement. Oliver still needs to judge pacing, threat, and visual quality in a human playtest. No custom SFX work.
