# Campaign readiness review — v2.280.0

Two production fixes:
- Bounded enemy-route sweeps: each swept movement edge filters its own nearby support/collision geometry before its repeated foot probes. No navigation-result cache, detail/quality reduction, map shrink, damage or XP change. Live doors/moving platforms/crumbles remain live.
- Scene text cleanup: floating combat DOM messages are disposed on scene construction/load, the illustrated opening and return to title. Previously global text only aged while gameplay ran, so IT RISES/XP/gold could remain above a frozen story/hub tour. Reproduced before and absent in the fixed fresh-character lifecycle and reloaded hub.

The maintained browser combat harness now uses the current opening-story completion flag and pumps real loading frames in background tabs. Its Marble completion check now turns two different screens and reflects real heavy strikes before defeat, respecting the existing 55% damage budget per opening. The old one-hit debug shortcut was an outdated test expectation, not a broken boss gate.

## Measured performance

Muted Chrome, default high graphics/shoulder camera, short lateral movement/dashes, 210 explicit update/render samples per location. These are CPU work times, **not monitor FPS or GPU timings**. Background test tabs are explicitly pumped. Spawn/visibility and machine load can vary between runs.

| Location | Median / p95 / worst CPU work (ms) |
| --- | --- |
| Briar entrance | 5.2 / 7.0 / 8.7 |
| Briar village | 6.7 / 9.5 / 11.5 |
| Orchard after, first sample | 6.5 / 8.9 / 19.7 |
| Orchard after, repeat | 6.4 / 10.1 / 20.8 |
| Keep courtyard/lamp area | 5.2 / 7.3 / 9.4 |

Water baseline was 3.8 / 5.5 / 7.9ms. See performance-after.json for its follow-up. Orchard baseline was 4.5 / 6.3 / 29.6ms, including 21.1ms in route edges. After route work peaked at 10.6ms, then 8.4ms on repeat. Typical overall timings varied upward in the after samples; this supports reducing the route-search spike, **not** an across-the-board FPS gain. The first matched Orchard view retained 122,424 triangles/189 draw calls before and after. No graphical downgrade was applied.

6,217 collision/support comparisons match the old implementation, including raised walkways, floors, ceiling support, doors and dynamic platforms. Synthetic distant-edge X-coordinate reads fell 1,080→360; this illustrates less scanning, not a hardware-wide speed guarantee.

## Browser and regression coverage

- 141 regression suites pass, including route parity, scene-text lifecycle, saves, mana, party/progression and boss tactics.
- Actual creation UI: Mage, face/eye/mouth/brow choices, stats and name; E/Tab/Q/Esc menu practice, held movement/jump simulation inputs, real left-click attack/right-click dodge lesson progression, protected required first skill choice and tutorial retry. Combat positioning in the private harness was staged; this is not a natural complete playthrough.
- Clean staged lifecycle: six actual enemy-death handlers (including revived enemies), rank2 after three, Elemental Beam confirmation, real delayed exit, class unlock persisted, opening after trial, final story skip removed, all18 tour stops, completed save reloaded via actual title Continue→Normal. Name/face/rank/skill/story/tour retained; no class selection or repeated tutorial. Old level100 save also loads on the final build. All fixtures use isolated synthetic storage.
- 100 controlled browser combat/reward checks: 24 starter-family weapon reach cases, 24 natural boss first hits, 8 death/retry retained-progression cases, 44 exits/quest gates/one-time rewards. Regional level/gear setups and staged encounter states are explicit in scripts/qa-combat-readiness-page.js. They establish functioning attacks/defenses/retries, not subjective difficulty or full fights.
- Actual ordered local WebRTC host/guest pair: campaign area/boss→hub, Rift Hall in/out, guest-requested sparring, Arena host rule/map changes and exit, separate gold/companion selection, independently claimable same chest. Both old100 clients load. No claim of a new two-human Internet session, new cross-PC texture/pet visual test or measured remote latency.

## Remaining review limits

No claim that the entire fresh campaign route has been naturally walked or all enemy placements are fun. The older earned Hollow north escort/Marksman journey remains outstanding. Cross-machine performance and Internet co-op still need the human playtest. Do not mark the whole campaign audit complete from these staged checks.
