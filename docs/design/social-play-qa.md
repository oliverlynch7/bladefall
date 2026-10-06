# Live menus, conversations, inspection and chess — 2.116.0

## Implemented behavior

- Ordinary pause, inventory/settings, journal, conversation and inspection menus leave combat and network simulation running. Inputs are released while a menu owns focus. Controller menu navigation runs before background simulation. A red edge flash warns about damage without dismissing the current menu. Death still ends the interaction. Scripted cutscenes, title/creator, onboarding gates and editors retain their separate behavior.
- Campaign conversation presentation is local to the initiator. Explicit interaction with the same NPC joins its current line read-only. Only the initiating actor can choose or close the authoritative conversation; listeners leave locally. Campaign story conversations remain serialized: another NPC waits until the active conversation finishes. Hub service NPCs have independent owner records. Owners leaving/disconnecting release the conversation. Scripted finale conversations remain shared cinematic events.
- World quest interactions can proceed during another player's conversation. Shared state/reward event IDs remain authoritative and deduplicated; quest changes notify the party. Players transmit activity labels and remain visible while in menus or conversation.
- The minimap is larger, includes obstacle footprints, gold main objectives, blue same-area teammates and cyan existing party pings, including edge markers for distant objectives/friends. Heading uses the camera in shoulder/first-person and player facing in overhead. Shortest-angle exponential smoothing has a maximum turn rate to prevent sudden spins; the hero triangle shows facing separately.
- Quartermaster sells a 1,000-gold Chess Table hub upgrade. Host ownership controls availability. Two seats, host-validated moves and visible world pieces reflect the current session's board. Leaving a chair keeps the game and seat; ending the session/title return resets the position. Purchases persist normally. First visitor takes White, second Black; further visitors watch. Solo has no AI opponent. Draw offer/accept, claim, resignation and next game are available.
- Chess rules use vendored chess.js 1.4.0 with its BSD license. Legal movement, check, castling, en passant, chosen promotions, checkmate, stalemate and insufficient material are library-validated. Repetition/50-move draw claims are exposed; fivefold/75-move automatic draws are added. No clock or online matchmaking.
- Briar beta only: map table near Gus and painting on the house beside the entry lane. Inspecting frees the cursor and focuses the camera; six movable/rotatable map pieces reveal the existing east-bank stone route. The painting has a magnifiable detail pointing toward the granary's high route. Closing preserves map progress in the current disposable scene. Accessible also from beta controls. These are interaction prototypes with simple diagrams, not final illustrated puzzle art or replacements for campaign puzzles.

## Verification performed

Real Chromium via Playwright CLI, muted localhost, real WebGL. Network checks used two independent browser pages and the game's message handlers with an in-memory transport, not a live WAN PeerJS connection.

- `qa-social-coop.cjs`: 26 checks: owner/listener isolation; hub current-line following; rejected listener responses; owner response replicated; independent listener exit; world objective and note progress while owner talks; live menu time; presence status; host ownership; seats; legal/wrong-turn/stale chess moves; board persistence, disconnect/reclaim and draw agreement. No page exceptions.
- `qa-live-enemies.cjs`: actual Homefields enemies dealt 27 damage over simulated time while pause menu remained open.
- `qa-live-menus.cjs`: direct damage warning, retained menu, advancing world clock.
- `qa-inspection.cjs`: incorrect placement, six-piece keyboard reconstruction, reopen persistence, clue outcomes, restored beta HUD and 390px layout. No page exceptions.
- `qa-social-ui.cjs`: bounded minimap rotation, enlarged display, 390px chess UI, real e2/e4 button interaction and standing on exit.
- `test-social-chess.mjs`: illegal move, checkmate, castling, en passant, underpromotion, insufficient material, stalemate, repetition and fifty-move claim fixtures passed.
- `qa-briar-beta-old-save.cjs`: a valid previous-version save preserved name, gold, all 17 class builds and unlocks. The fixture uses the previous committed HTML; removed from public before shipping.
- Syntax gate passed; 69 pre-existing duplicate function names remain. Module syntax checked.

Visual checks caught and corrected an oversized table, a visible collision proxy covering the board, indistinguishable piece colors, and inspection labels obstructing the close-up. Reviewed desktop seating, board positions, minimap and phone panels. Screenshots remain under output/playwright locally.

## Still requires playtesting / limits

- Real internet latency/reconnect behavior and several friends sharing the hub; no live WAN session was available.
- Sitting pose was visually checked on the shared Warrior skeleton, not every armor/class combination. Cosmetic clipping and camera comfort need in-game feedback.
- Leaving the table retains your color. Disconnecting releases the seat while preserving the position for a returning player/new visitor.
- Inspection prototypes support mouse/touch dragging and keyboard movement/rotation; full controller manipulation of scraps is not yet designed. Their simple artwork and actual puzzle enjoyment are unproven. Existing campaign maps remain unchanged.
- Live menus deliberately expose the player to damage. Human testing should check whether rank-up interruptions and enemy pressure feel fair under this policy.
