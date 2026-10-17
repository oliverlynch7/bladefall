# Chess experience verification — 2026-10-16

Version: 2.226.0-chess-experience.

- Chairs and both human/Thomas seats moved to +/-34, clear of the tabletop and collider. Seated hip height14, no bone length scaling.
- Wider camera frames both players; torso/head ray volumes fade only actual board blockers. Chair backs fade only when obstructing the board. Camera-matrix regression fixed and tested.
- Companion parked diagonally beside/behind chair, restored on exit; rest poses for standard quadrupeds and Sunspire Dragon, Sit clip or quiet idle for other assets. Peer pose includes sitting flag without changing previous mount fields.
- Flat-board drag/drop and click movement; legal turn/promotion/revision checks; wrong turn, illegal and outside drops rejected.
- Opponent last-move origin/destination highlights. Start/previous/next/live plus move-list navigation. Review affects own view only; live clock and opponent moves continue, own moves require returning Live.
- Compact host SAN packet reconstructs exact guest history, including castling/en passant/underpromotion. New match resets cursor; leaving/returning preserves session match.

Evidence:
- browser-interactions.json: 28 passing actual browser/UI assertions with genuine pre-change save, Map-backed isolated storage.
- regressions.json: 93 offline suites pass. Focused chess suite expanded to33 checks after camera/chair/rest refinements; rerun recorded in final-focused.txt.
- final-seating-companion.png and seating-clear.png: clear angled seats/companion. thomas-clear.png: solo seating. low-view-final.png / reverse-view-final.png and respective JSON: conditional visibility switches correctly between local and Thomas.

Limits: synthetic PointerEvents sent through real DOM input handlers, not hardware dragging. Host/guest packet delivery tested with local stub transport, not two devices. No production player save touched. No chess-engine strength or campaign changes.

Additional solo browser check: ordinary UI clicks e2-e4 received a legal Thomas d7-d5 reply; last-move highlight and move-list visible, no warning/error logs. See flat-history-final.png.
