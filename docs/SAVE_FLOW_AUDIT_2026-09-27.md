# Save and multiplayer regression audit — 2.056.0

## Reproduced defects and fixes
1. Active-slot deletion removed character files, but unload saved old global achievements again. The slot list treated achievements as a character, leaving a phantom occupied slot. Reproduced in the previous build: no character file, but empty=false and old achievements restored.
2. Deletion now increments a per-slot save generation before removing all three difficulty saves. Current-version stale tabs cannot write after deletion or overwrite a replacement character. Those tabs receive a reload notice. Active deletion reloads the same empty slot. Other slots remain untouched.
3. A blank global profile prevents automatic legacy import from reviving a deleted profile. Fresh secondary slots no longer import the original legacy profile. Slot occupancy requires character/progression/class-unlock data; achievements alone are insufficient. Older saves with class unlocks but no hero snapshot remain discoverable.
4. Deletion reports storage errors instead of always claiming success.
5. Missing/deleted multiplayer save intents are rejected instead of creating a fallback level-one character.
6. Host/join asynchronous errors now reach the connection error screen. Retry keeps its return context. Back after a failed connection opened from pause returns through the in-game menu, not the title flow.

## Browser regression matrix
All listed checks passed in real Chrome via Playwright CLI, with muted audio and isolated test saves where deletion/network activity is involved.

| Area | Checked |
| --- | --- |
| Delete, all three slots | Cancel retains save; confirm clears Adventure/Hardcore/Hitless; remains empty after reload; other slots unchanged |
| Recreate after deletion | New character saves in every deleted slot; stale open tab cannot overwrite replacement; stale tab receives reload notice |
| Legacy data | Deleted profile does not re-import legacy achievements |
| New character | New Game -> empty slot -> opening/creator; second character saved; original save unchanged; existing-slot Play resumes |
| Tutorial | Complete and skip both survive title/Continue and full reload, retaining name/class; separate slots remain independent |
| Pause multiplayer | Host and Join automatically select current character; title multiplayer retains picker |
| Failure paths | Host/join offline failure, retry, cancel back to pause; thrown asynchronous transport exception; missing save rejected; storage deletion error displayed |
| Actual networking | Native PeerJS host level 13 + guest level 7; independent identities retained; guest follows host into Briar; guest reloads and rejoins from title; host disconnect handled; guest save retains level/name |
| Cross-slot room creation | Title host selection switches from first slot to third slot Hardcore, connects with level 21 and correct name/difficulty; other saves unchanged; intent consumed |
| Retry success | Simulated offline first attempt followed by successful native PeerJS host retry |
| PvP persistence | Native PvP room creation; temporary level 99/currency edits do not write to campaign; original character restored after leaving |
| Existing-save compatibility | Previous-build index fixture preserves checkpoint, clue, class rank, currency, pets and hub history under current auxiliary modules |
| Syntax | Extracted inline JavaScript passes node --check; git diff --check passes |

Evidence: `docs/qa/save-flow-audit-2026-09-27.json`. Reproducible scenarios are in `scripts/qa-save-deletion.cjs`, `qa-save-failures.cjs`, `qa-save-network.cjs`, `qa-party-slot-switch.cjs`, `qa-party-pvp-save.cjs`, `qa-party-retry.cjs`, and the existing tutorial/creation/save-routing scripts. The tutorial completion test calls the real completion handler; it does not replay every combat encounter. Connection-failure cases deliberately inject offline/throwing behavior; the successful co-op, reconnect, cross-slot host, PvP host and retry use native PeerJS networking.

## Limits
Two browser sessions ran on this test machine. This does not reproduce the friend's exact Mac/Brave version or different-home router/firewall conditions. It is a targeted regression suite, not a guarantee that every possible save/network bug is absent. Both players should refresh to the fixed build; older already-loaded builds do not contain the stale-writer guard. Existing campaign checkpoint rollback rules are unchanged.
