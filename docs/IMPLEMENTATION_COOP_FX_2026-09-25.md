

## [Codex | 2026-09-25] U195 — co-op combat visibility
User explicitly requests visible teammate skills, all weapon attacks and projectiles. Inspection: presence already carries body/cast poses, but cfx only relays basic projectile arrays and shockwaves. New combatArt identity effects are never relayed; persistent defense presentation only reads the local player. Implement bounded visual-only effect transfer, persistent teammate defenses, retained projectile styles, shockwave height/timing, scene isolation and duplicate suppression. Never execute remote SKILL_FX or duplicate combat damage. Verify all configured skill profiles, basic/charge weapon families, body poses, relay/echo and scene changes in real browsers; preserve saves.


## [Codex | 2026-09-25] Co-op combat presentation — 2.036
Added visual-only relay for all 128 configured class skill identities and basic/charged weapon effects; persistent peer shields/guards; projectile spin and elevated/delayed shockwaves. Capture shots before collision removal. Scene checks and bounded duplicate suppression avoid replay across scenes. Browser two-context serialized host/guest relay: 8 checks passed (128 skills, 28 weapon effects, 15 projectile styles, poses/defenses, no damage replay, other-guest relay, dedupe, stale scene rejection). Existing co-op kill/reward regression: 7 passed. Pre-change save fixture preserved checkpoint/clue, pets, rank, gold, hub intro, return visits and disabled speech. This is controlled browser relay testing, not a two-device internet latency soak.
