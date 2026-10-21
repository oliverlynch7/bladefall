# Unrestricted chess premoves

v2.350.0. User allows any on-board destination while waiting, including currently illegal moves. Source must still be the player's piece. Final legality uses the actual updated position through chess.js and host validation. Same-square/off-board input, spectators, changed rounds/seats, ended games and skipped positions remain rejected/cancelled.

Automated checks:835 premove cases (including all63 destinations for each piece kind/color),72 actual input-window/layout cases,397 room/authority/clock/history cases and28 Thomas approach cases. Specific final-position cases cover empty future pawn captures, friendly-square recaptures, blocked rays clearing/remain blocked, invalid knight moves, pins, en passant, castling and underpromotion. No execute twice; latest host revision used.

Real Chrome, muted, isolated in-memory storage: existing build-chess-experience-qa.py fixture loads First Journey QA level4/gold1145 and two simulated local seats through the actual authoritative room. No live remote peer or user save was used.

3D click: e2-e4; queue impossible b1-b4. Opponent d7-d5 arrives through authoritative receive with game/round/rev; illegal queue cancels and history remains e4,d5. Normal e4xd5 accepted. 3D pointer drag d5-e6 queues future empty-square capture; opponent e7-e6 leads automatically to d5xe6 exactly once. Flat click a1-a8 accepts blocked rook capture intention; Cancel works. Flat pointer drag e6-f7 queues occupied capture; opponent Ng8-f6 leads automatically to exf7+ exactly once. Both pointer drag checks dispatch PointerEvents at measured rendered cells through the actual UI handlers. Click checks use real browser controls. Screenshot shows purple source/destination and the conditional execution note. No all-square green highlight flood.

Final history: e4,d5,exd5,e6,dxe6,Nf6,exf7+. No captured browser errors. Human chess feel and real two-person latency remain untested.
