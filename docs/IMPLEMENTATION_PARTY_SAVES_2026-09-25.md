# Co-op save selection, hub services and input reliability

## [Codex | 2026-09-25] Grounded plan
User reports level-one reset on joining, requests explicit saved-character selection for both host and join followed by direct entry, hub services accessible independently of quests except pet purchases gated by the two-animal Black Woods rescue, and continued Mac movement repair.

Inspected cause: title lobby calls MP.join without loadMode; ensureGuestReady creates a starter from unloaded per-mode state. Slot storage prefix is fixed at boot, so switching slots needs a reload. Preserve a short-lived session-only connection intent across that reload, load the explicitly chosen mode, then connect without returning to title. Show saved name, class, level, rank and mode; do not merge different saves. Host resumes chosen saved adventure or hub; guest enters host scene using their own character. Keep checkpoint rollback contracts.

Hub cause: story NPC interaction candidates shadow normal hub services. Route shared hub NPCs to the service menu, retain an explicit quest option and the shared quest state. Pet purchases require completed A Kinder Trail, while existing companion management remains available. Make its offer eligible before buying a companion to avoid a circular unlock.

Keyboard: prior fallback did not resolve report. Harden focus/held-key routing and separate keyboard movement from stale analog input, test actual displacement for all four keys. Add a small input test in bindings so the remote browser can reveal whether keys reach the game. Exact Mac diagnosis remains unconfirmed without device/browser evidence.


## [Codex | 2026-09-25] U197-U198 — selected co-op saves, hub services, Brave input
Exact source: docs/requirements/USER_SOURCE_2026-09-25_PARTY_SAVES.md. Host and Join must offer saved characters and enter directly with that character's level, class rank and equipment. Hub quests must not block services; Beastkeeper purchases require the Black Woods two-animal rescue. Friend uses Brave on Mac; A/S/D still fail in open space. No permission to reset saves. Private archive contains 198 user messages with zero unparsed records and valid source references.

Implemented 2.038.0-party-saves: select save slot/mode before opening transport; slot changes reload safely because storage prefixes are boot constants. Host resumes selected checkpoint or hub; guest loads its own character before handshake. Hub story interaction routes to service landing, with separate return-quest choice and direct service access during introductions. Pet purchase gate checks completed rescue; rescue eligibility no longer requires an existing pet. Keyboard handlers run in window capture, leaving editor/menu/text input ownership intact; closing overlays clears lingering form focus; digital movement overrides analog on the same axis; blur clears axes. Key Bindings includes a live received-key/action diagnostic.

Validation: real Chromium save-picker host/join with controlled transport callbacks preserved distinct levels31/17, ranks9/7, gold1234 and other slot. Five hub service routes, rescue availability without pets, locked/unlocked purchases, W/A/S/D under a swallowing document handler, opposing analog input, blur and key diagnostic passed. Pre-change save preserved checkpoint/clue, pets, class rank, gold, hub introduction, return quests and disabled speech. Syntax/diff checks pass. Exact Brave/Mac failure was not reproduced; these are input robustness fixes plus a diagnostic, requiring the friend's device confirmation. No live saves/recordings modified.
