

## [Codex | 2026-10-17] Red menu exits - v2.261.0

Added a shared top-right red X to overlay menus (pause, bag, shops, trainer, stats, records, settings, journal, character creation and nested confirmations), plus NPC conversations, chess lobby/board, inspection panels and mirror. Buttons delegate to the existing safe Back/Cancel/Resume handlers; scrolling retains access, keyboard focus stays on the primary dialogue option, and close never buys/deletes/resigns/disconnects. Required rank choices stay mandatory (X disabled until the cancellable review); main title has no parent menu. Observer is scoped to menu DOM with batched refresh, not the game world.

Verified:36 actual-browser old-save checks plus manual scrolled red-X click/resume, screenshots and no console errors. Targeted checks:10 safe-exit,18 keyboard plus focused-E checks,21 onboarding/co-op,42 pause,76 chess-room,33 chess-experience,94 dialogue paths, inline syntax. Evidence: docs/art-validation/menu-close-20261017/.
