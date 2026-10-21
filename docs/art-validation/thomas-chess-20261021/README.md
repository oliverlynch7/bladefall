# Thomas bench / chess interaction verification

v2.349.0, 2026-10-21. Isolated real-browser fixture created by scripts/build-compact-loot-qa.py from the pre-change First Journey QA level4 save. In-memory storage only; no user saves edited. Muted throughout.

- Purchased board, actual Thomas return quest, 7 positions x4 facing directions:28 correct prompts. Bench/front-of-bench and both sides near Thomas offer conversation; far side offers chess.
- E opened the actual quest dialogue and actual chess UI. Final code also tested through the visible world prompt buttons.
- Leave table releases physical reservation; Thomas visibly walks home and npcPose returns null. Bench conversation reopened successfully afterward; private thomas:solo session remains. No captured browser errors, WebGL active.
- Unpurchased board produces no chess interaction.
- Automated:28 approach/prompt checks,393 authoritative room/clock/history/ownership checks,33 layout/review/visibility checks. Includes co-op watch, friend-join, own-resume labels, spectator leave safety and retained-position resume. No live two-person network session was run for this targeted fix.
- Screenshot: public/design/chess/thomas-bench-2349.png. browser.json contains28 actual resolver outputs. bench-conversation.png records initial quest conversation with the purchased board.

Exit-path follow-up v2.349.1: Leave table also releases the owner's Thomas reservation after visiting Table & opponents (that lobby removes the view but deliberately retains table ownership). Release checks reserved game owner rather than the deleted view.397 room checks now include this case and spectator non-eviction. Other gameplay is unchanged.
