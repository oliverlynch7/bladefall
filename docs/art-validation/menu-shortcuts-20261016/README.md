# Menu shortcuts — v2.218

Tab (or rebound Bag key) toggles the bag, closing through the original Back handler. A bag opened from Pause returns to Pause; one opened in play resumes play. Repeat cannot open/close several screens. Other menus retain ordinary Tab focus navigation.

An early capture listener maps Q to each existing Escape route, preserving modal cleanup for NPC dialogue, inspection, emotes, story and chess. Text/name/search/number entry and editable text keep Q; modifiers, composition and editor input are preserved. Loot-reveal Q skips the animation first. Q is reserved; old Q ground-sell bindings migrate to free X (or Delete if X is already used), without overwriting other custom mappings. Ground sell defaults to X, and HUD hints derive from bindings. Escape still works.

Menu Escape finds visible, enabled Back/Close/Cancel/Done actions rather than guessing a purchase, deletion, retry or quit. Settings now uses menu mode so Back returns to Pause instead of resuming. Creator Back works one step at a time. Class confirmation cancels to its choices first; another cancel can choose later, retaining the earned rank and unanswered option for locked-skill/Drillmaster access.

Real WebGL / DOM propagation fixture passed 26 checks: bag open/close, checkbox focus, held Tab/Q, pause-origin bag, Settings, controls, Q cancels rebinding, journal, creator step/name safeguards, NPC conversation, painting inspection, emote wheel and deferred class choice. Events were dispatched by an isolated owned test page; this verifies actual event propagation and UI callbacks, not native OS keyboard delivery or two-device multiplayer. In-memory storage cannot change real saves. Build with `python scripts/build-menu-shortcuts-qa.py`; visit `/3d/.qa-menu-shortcuts.html?mute=1`.

18 source/policy/migration checks pass, plus pause 25, creator 14, first arrival 20, progression 43 and campaign threat 60. No launch console errors.
