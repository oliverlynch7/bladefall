# Tutorial and HUD callouts — October 12, 2026

## Exact request

> Next now that we’ve updated the hud and have had other updates too, make sure to update the tutorial for new players and make sure everything is accurate. Also the arrows that point to hud features were sloppily created. Please improve that part too.

## Grounded implementation plan

Inspection: `public/3d/guided-tutorial.js`, `hub-tour.js`, the Adventure HUD modules, and onboarding/help/input/combat/save handlers in `index.html`.

- Preserve four action-gated safe controls, six tutorial kills, rank 2 after three kills, optional/returning-player skips, and existing tutorial completion saves. Information tips must not repeatedly pause combat.
- Correct attack instructions (tap for basic attacks; applicable weapons charge on hold/release), current keyboard/controller bindings, skill mana badges, player level/class rank, current objectives/navigation, and menus that leave the world running.
- Explain bottom-left bag capacity, automatic collection with space, explicit Auto-sell OFF/ON, full-bag protection, equipment comparisons and journal clues. Keep tips short; detailed reference belongs in Help.
- Replace the center-targeting, rebuilt-every-frame arrows with persistent, measured callouts: precise visible targets, highlighted edges, restrained curved leaders ending outside target content, viewport-safe cards and responsive/reduced-motion behavior. Hide callouts during menus and recover them afterward.
- Check the first skill prompt does not discard unfinished HUD guidance. Prevent duplicate legacy tips from talking over the guided lesson.
- Refresh hub-tour and Help text against actual current features, including the Stylist's saved class appearances/rank gates, stat allocation, forge requirements, travel and separate dungeon saves. Do not invent new mechanics or change story/campaign geometry.
- Verify actual beginner controls (including mouse), pause/resume, rebound controls, controller labels, full-bag instructions, rank/exit flow, old saves and desktop/narrow layouts in a real browser. Capture callout evidence; automated checks do not prove beginner comprehension.

Status: implemented locally; final verification and deployment below. Previous unrelated companion rendering changes remain excluded.

## Findings during verification

- The previous action gate could freeze a player mid-jump. Finish the jump on solid ground before asking for the next control, including a retry after a short hop.
- Normal character creation exposed the beginner spawn only 40 units from the rear wall, causing camera collision to retract the view into the player’s head. Center the beginner spawn and recovery point in the empty entry room, initialize its follow camera there, and preserve earned-trial placement and difficulty.
- Retain pointer arrows between frames, route to the outside edge of the precise target, hide in menus, and resume the unfinished guide after the first skill lesson.


## Verification

Implementation and real-browser verification completed. See `../art-validation/tutorial-hud-2026-10-12/summary.json` and screenshots. Keyboard/mouse controls, all starter classes, jump recovery, lesson/menu/skill flow, rebound/controller labels, four viewport sizes, normal character creation and a v2.191.0-created save passed. Syntax, journal-notice and story-authority checks passed. Physical controller/phone and novice playtesting remain unverified. Shipping as v2.192.0-tutorial-hud.
