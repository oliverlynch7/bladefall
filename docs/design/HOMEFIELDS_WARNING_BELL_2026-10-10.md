# Homefields watchtower warning bell — 10 October 2026

## Grounded finding

The eastern Homefields tower has a roofless, raised arena, a readable climb, three marked bells, and a chest. Its optional activity is still three nearby presses in sun-water-wheat order. The player-facing difference from other short codes is mostly names and decorations. The chest gives 180 gold, and the existing durable completion flag is `home.bells.open`.

## Player experience

One large warning bell and a posted watch note replace the three code inputs. The note says the Legion watch captain took the tower chest key and will answer the alarm. Ringing the bell calls three short patrol groups up the tower approach. The last includes the captain with a visible, dodgeable sweep. The next group enters only after the current one is defeated, so the tower stays readable rather than filling with an unfair crowd. Defeating the captain opens the chest; the player still chooses when to claim its existing 180-gold reward. Bell light, approaching enemies, three progress lamps and the chest lid show the changing state. The optional task line reports the current wave and living foes.

This is a combat defense at a meaningful site, not a renamed symbol sequence or a requirement for the main route. The tower remains optional and its approach stays open. Enemies must spawn at the stair-facing side of the roof, with recoverable pathing if they slip away. No new custom sound effects.

## Authority and compatibility

- Preserve `home.bells.open`, `home.bells.cache`, the chest reward, the main Homefields route and all other optional branches. Old completed towers stay completed. Old partial bell inputs may restart at the warning bell.
- The host spawns and tracks waves, owns the final story flag, and sends a compact wave status to guests. Both players can attack the same enemies and see completion. No extra reward is granted on reconnection or repeat interaction.
- Verify the normal-speed climb and interaction, actual hostile approach and attack, wave transition, chest gate/reward, co-op guest combat, death/checkpoint behavior, and old partial/open saves in a muted real browser. Inspect the normal play camera for readable bell, enemies and chest. Automated correctness does not establish final difficulty or fun.

## Implemented and checked

The notice is on the west edge of the roof, the bell at the north end, and the chest by the eastern pillar. The central approach is left clear. Invisible collision matches those three props without rendering an extra wall. The encounter starts its first wave only when a player is back near the tower, including after a saved alarm is reloaded at the village. Subsequent waves enter after the previous group falls. The captain uses the existing elite raid attacks.

Muted browser QA crossed the tower stairs with normal movement, used the notice, bell and chest through the ordinary interaction prompt, watched two patrols close and attack without falling off the roof, completed three waves and claimed the 180 gold once. A two-page co-op test confirmed guest bell use, host-owned wave spawning, enemy and wave identity on the guest, guest damage on the host's patrol, shared opening and a single guest chest claim. Old partial and completed saves, mid-alarm reload, neighboring granary behavior, journal layout and the static gate passed. The automated wave clear did not establish fight difficulty; Oliver should judge challenge and roof visibility in play.
