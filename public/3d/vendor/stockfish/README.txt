Stockfish.js 18.0.0 lite single-threaded, unmodified release binaries.
Copyright (c) 2026 Chess.com, LLC; Stockfish contributors (see source AUTHORS).
License: GNU GPL version 3 or later; see Copying.txt.

Origin: https://github.com/nmrugg/stockfish.js/releases/tag/v18.0.0
Engine source and build scripts: source-v18.0.0.zip (same directory).
The embedded evaluation network is also provided: nn-9067e33176e8.nnue.
Build instructions are in the source archive README.md and build.js;
use the single-threaded lite build (node build.js --single-threaded --lite -f)
with the documented Emscripten toolchain. Put the supplied net in src/.

The engine communicates through UCI messages in a dedicated Web Worker.
It is loaded only for solo chess. No audio, saves or game data leave the browser.
Difficulty labels are approximate design targets, not certified chess ratings.
