# Long Ascent service vault — grounded change packet

The optional CD-03 vault still asks players to turn two adjacent four-mark wheels to a stated setting. That is the same nearby combination input Oliver has repeatedly called unsatisfying. The existing linen room, service vault, worker-cell rescue, lift, barred door and shard give this branch a more physical cause and effect: a damaged high service rack carries the door's brake cable.

After freeing the workers, the player can climb six offset, supported rack ledges above the linen room. The route has real horizontal and height gaps, a lower recovery shelf and a visible cable leading from its high release to the vault's two bars. Pulling the brake retracts the bars and opens the same CD-03 access. The repair tally and Miles point to that location without spelling out every jump. This changes the player's inputs from repeated E presses at two wheels to observation, jumping, recovery and one final release. It adds no new reward, story branch or mandatory step.

Keep `la.vault.open`, CD-03, worker rescue, service lift, summit route, old completed saves and co-op shared state. Old partial wheel positions are inert; completed saves display the open door. Test a physical climb, a deliberate miss and return, release reach, old partial/completed states, full tower route, checkpoint, two-client shared release and normal-camera visibility. Browser tests establish function and reachability; Oliver's playtest decides challenge and appearance. No custom SFX work.

## [Codex | 2026-10-11] Implemented and checked

Six supported ledges now cross a broken masonry bay in the linen room. Their spacing requires jumps at different angles, and a lower shelf gives a safe retry after a miss. The high brake moves the vault bars; the original CD-03 remains beyond them. The first ledges and destination are visible from the cleared entrance, and the former decorative wall is genuinely open rather than transparent. The old wheel objects are absent and old partial values cannot open the vault. The old completion flag still loads it open.

Automated Node checks covered story logic and the voice manifest cache. Muted-browser checks covered physical jumps with normal movement, missed-jump recovery, brake interaction, shard access, old partial/completed save shapes, co-op shared state, checkpoint retry and the main ascent path. Normal-camera screenshots were reviewed after moving the wall and beds. These are local checks; Oliver has not yet judged the climb's feel in a human playtest. Version: `2.180.0-vault-brake`.
