# Co-op skill-effect ownership pass

## Observed behavior and scope

The existing guest-hit relay makes enemy HP host-owned. Several immediate skills then write `stunT`, `slowT`, `taunt`, `petTauntT`, or forced movement only on the guest's mirror. Host snapshots undo those states, so a guest sees a control skill land while the enemy keeps attacking. Reaper Death's Door and Warlock Final Curse store delayed damage only on the guest; that damage stops when the guest leaves. Execution directly calls `killEnemy` on the guest, whose co-op guard rejects the kill, leaving the host's enemy alive.

Repair these existing abilities without changing their damage, cooldowns, unlocks, visual themes, or solo/PvP rules. Immediate control effects should use a bounded, class-and-range-checked host packet. The host owns delayed DoT and curse bursts, and a guest's timer is presentation-only. Execution uses the existing guest-hit receipt so the host decides whether its current enemy health meets the same execute threshold. Preserve old saves; there are no new persistent fields.

## Validation contract

Use two real browser pages and the normal host/guest packet handlers. Check a common hit-based stun and slow, a non-damaging control skill, Beastmaster pet control, Reaper execution above and below the threshold, Death's Door after guest departure, and Final Curse once only. Check host-class isolation, old-save load, static gate and existing co-op/class tests. A controlled packet relay does not certify internet latency or human combat feel.

## Implemented in v2.156.0

The host now receives bounded enemy-effect packets for hammer quake, Tumble, Nova, Frost Chains, Smoke Bomb, Bulwark, Warcry, Bash, Beastmaster pet commands and mark, Warlock's slowing orb, Void Pull, Iron Wave, Skylancer lifts, and Bladedancer stuns. The host replicates their control timers to guests. Roar checks range from the pet's supplied position, bounded by a 760-unit player leash. Walking melee enemies honor taunts toward the caster or companion; specialized boss AI may still use its authored target rules.

Soul Tether and Conduit use per-caster group IDs on the host so linked enemies share damage. Death's Door and Final Curse now run their damaging timers on the host; guest timers present the effect without applying a second hit. Execution sends intent with a normal hit packet, and the host decides against its current health threshold. These are runtime-only fields and do not change saved data.

Muted two-page browser QA passed 28 focused checks across host/guest control, pet positioning and leash, link damage, Execution both sides of the threshold, delayed damage without guest updates, no guest duplicate burst and host-to-guest snapshots. The existing co-op basic-hit, healing receipt, PvP healing/control and kill-reward regressions passed. A pre-change save kept its name, gold, class and rank after reload in this build. Inline JavaScript parsed and `git diff --check` passed. Human co-op play over a real connection remains to judge timing and feel.
