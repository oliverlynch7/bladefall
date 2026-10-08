# Prison Break normal-speed pacing pass

## Evidence and decision

Oliver approved a normal-speed Endless Dungeon playthrough and focused fixes. In the browser, holding forward for 4.4 seconds reached the first guard room; another 2.2 seconds moved the character past its center while the guards had only just appeared. The objective then pointed behind the player. The room starts within 240 units of its center, even though its half-width is 375 units, and no exit prevents bypassing an uncleared required encounter.

## Grounded change

Fresh revision-11 attempts get visible barred exit gates after the six mandatory combat rooms. Gates stand at the midpoint of each existing corridor and open as soon as that room is cleared. Combat starts on approach, at 420 units from room center, giving enemies time to engage before the player can cross. The gates use the existing door collision and line-of-sight rules, with custom bars for a clear visual change. Optional branches remain open. Revisions 1-10 keep their layouts and behavior.

## Acceptance checks

- A forward-running player meets the first guards before reaching the exit and cannot run through the closed gate or jump over it.
- Clearing the room visibly opens its gate, allowing forward travel. All six gate pairs align with real links.
- Resumed revision-11 saves restore gate states; revision-10 checkpoints remain unchanged. Co-op guests receive gate state from the host.
- Check desktop and phone in a real browser. Automated checks establish function and compatibility, not human fun or final balance.
