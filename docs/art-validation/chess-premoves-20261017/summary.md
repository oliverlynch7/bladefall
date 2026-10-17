# Chess pre-moves

One local private queue supports click and drag on both boards. Purple origin/destination and cancel control. Right click cancels. Queue validates seat, round, ply, result and clock, waits for authoritative animation acknowledgement, verifies actual engine legality and clears before sending latest revision. No protocol/save changes. Leaving/review/new round clears. Pawn future capture, promotion and castling supported.

113 regression suites passed, including23 new queue/candidate cases; chess zoom/experience/choreography and syntax rechecked after immediate hit-target layout fix. Browser old-save checks include normal moves, pre-move execution exactly once, both views, drag, cancellation and guest revision/animation acknowledgement.
