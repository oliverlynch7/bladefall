# Campaign checkpoint foundation — September 20, 2026

Requirements SAVE-01–04: normal campaign saves only completed halves; restart the current half after death, reload, title exit or disconnect. Hub transactions stay immediate. Preserve explicit Hardcore/Hitless death rules and separate modes.

Current failures: autosaveRun writes live provisional player state, persist writes live classes/gold/optional quest rewards, bankNow protects only five fields, nextArea never advances escrow, death sends player to hub. Fixing only hero position would duplicate optional rewards and lose class-rank consistency.

Implementation: versioned checkpoint inside meta.run, containing player snapshot, all per-save fields except recursive run/bank, exact region/half/seed and world progress at half entry. Persist serializes this committed state while play keeps provisional state in memory. Entering the next half (or boss room) commits the preceding half. Restart rebuilds world and restores the full checkpoint, discarding unfinished objectives, rewards, gear and XP. Explicit hub exit rolls back unfinished progress and ends the attempt. Legacy saves without checkpoints get one compatibility resume; never invent or delete their unknown historical gains.

Co-op: checkpoint states stay individual. Host area transitions commit each present player's own character; checkpoint restart resets the shared room, never copies host inventory into guests. Disconnect restarts the departing player's checkpoint. Existing revive/party-wipe behavior retained. New campaign dialogue/world event synchronization is a later foundation, not claimed complete here. Future shards must be added to per-save fields and transient world state before their feature ships.

Acceptance: first-half reload discards new XP/gold/equipment/optional quest; second-half reload/death keeps first-half state and resets second-half; boss retry keeps both halves; repeat retry stable; hub spending reloads; legacy save loads; intrinsic weapons rehydrate; trial and permadeath keep separate behavior; guest transition/retry/disconnect tested. No checkpoint should serialize live provisional fields after an unrelated persist call.

## Verification — candidate 1.984.0

Browser checks passed: 11 transaction/death/reload/legacy/trial assertions; 8 two-browser co-op/Hardcore assertions; all 24 existing campaign checkpoints (two halves plus boss for eight regions), including intrinsic Reaper rehydration and safe spawn height; three additional guest completion/idempotency and secondary-mode boundary checks. The co-op test uses two isolated browser contexts with the real message handlers and a controlled packet relay, not live WebRTC transport. Live latency/drop/reconnection playtesting remains open. Syntax and diff checks pass.

The primary normal-campaign death action is now Retry this part, with clear loss explanation. Completed-half transitions show a saved confirmation. Hardcore/Hitless death remains separate. Returning explicitly to the hub ends the attempt after rollback; title/reload resume the checkpoint. The existing secret pickup banks at a half boundary. Five-shard collection, new branching dialogue/world snapshots and full shared quest-state protocol are not implemented by this foundation and must extend it before they ship. Account-wide settings/lifetime achievements retain their existing storage policy.

Reproducible local browser scripts: scripts/qa-campaign-checkpoints.cjs, scripts/qa-campaign-checkpoint-coop.cjs, scripts/qa-campaign-checkpoint-routes.cjs. Run through Playwright CLI run-code --filename against a localhost test save only; they intentionally change fixture save data and reject production origins.
