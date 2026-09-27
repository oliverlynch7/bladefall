# Briar adventure refinement — 2026-09-27

Release: 2.043.0-briar-adventure.

Approved scope: user accepted the proposed Briar combat/exploration pass while away. Existing art retained; no new elemental rules or custom SFX.

## Changes
- Western supply wagon uses authored flanking Farm Raiders, slower-projectile Legion Hex Caster, and a larger Farm Raid Leader using the established warned sweep/recovery elite kit. Visible nearby enemy labels distinguish hunt targets. Existing bodies are reused so the additional enemy placement does not shift spawn IDs.
- Existing combat.0.0 task now targets this group. Three replenishing slots, 25-second delay, proximity/anti-spawn-on-player checks retained. Leader remains one-time. Ten qualifying defeats award existing XP/gold; ordinary wildlife/other encounters do not count. Previous earned progress and completion flags remain valid.
- Respawn snapshots include raider identity, size, color, role, speed and projectile configuration; host authority retained. Packet tests are not a two-person network playtest.
- Store rear crate requires a basic jump; window and roof enlarged together. Existing rebound-control notice explains holding jump. Occluding upper store geometry fades on approach. Tested entering, collecting dressings and exiting with one jump available.
- Orchard picking platforms now have actual gaps, safe ground below, and existing chest/walkway destination. Runtime movement test traverses every landing with the base single jump. This is a focused traversal improvement, not the full campaign parkour redesign.
- Nearby journal lookup includes discovered Briar bell, granary and orchard clues, plus forest tracks. Optional tasks give an action/location rather than saying only to consult the journal. No undiscovered solutions revealed.
- Roots, dressings and Gus's tools get clear collection/use text and existing pickup sound. Existing one-time removal remains intact. Fixed early legacy Shade/bestiary text about dream corruption and player's ancestry. Larger legacy canon audit remains pending.

## Verification
- scripts/test-briar-refinement.cjs: target filtering, one-time completion reward, three-slot respawn cap/identity, discovered-only clue lookup.
- scripts/test-patrol-retirement.cjs: 900 refills with bounded retained corpses.
- scripts/qa-patrol-runtime.cjs: actual kill path, refill, network body packet, reward idempotence and checkpoint count.
- scripts/qa-homefields-farm-combat.cjs: caster cast/projectiles, boar warning/charge.
- scripts/qa-briar-refinement.cjs: store cannot be entered by walking the crate route, single-jump entry/exit and dressings pickup, every orchard landing. Enemies suppressed for traversal isolation.
- scripts/qa-briar-feedback.cjs: leader warning/strike/recovery, early root collection feedback and unavailable-after-pickup, related clue promoted above later unrelated notes, phone journal.
- scripts/qa-guidance-save.cjs against prechange index: checkpoint, clue, rank choices, currency, pets, NPC state, speech preference retained. Auxiliary modules current in fixture.
- Browser screenshots reviewed: briar-store-jump.png, briar-raiders.png, briar-clue-phone.png. Fixed camera occlusion discovered during review. Local voice endpoint 404s expected without backend.

No full fresh-character natural playthrough, human difficulty assessment, or two-device co-op session claimed. Wider enemy visual/animation overhaul, other levels, exotic equipment and elemental design remain outstanding.
