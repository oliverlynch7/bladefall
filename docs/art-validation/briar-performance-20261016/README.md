# Briar renderer verification — 2026-10-16

Same local real WebGL browser, 1280×720, default high quality, shoulder camera, 4.5-second samples after warm-up. In-memory isolated storage. These CPU submission timings are not GPU timings or a promise of a given frame rate on the user's computer. The test runtime did not reproduce the user's severe frame drops; the comparison demonstrates avoidable work removed.

| View | Three draw calls | Submitted triangles | Main CPU/render submission mean |
|---|---:|---:|---:|
| start | 346 → 249 | 211,782 → 139,810 | 6.88 → 5.29 ms |
| village | 334 → 235 | 215,368 → 144,540 | 6.54 → 5.57 ms |
| woods | 241 → 198 | 124,448 → 92,288 | 3.78 → 3.40 ms |

All 26 first-half enemies / 12 Woods enemies remain in gameplay. Scene inventory, authored instances and visible scenery counts remain unchanged. Actors use conservative camera spheres, a 250-unit close-combat exception and no distance cutoff; enemies visible far down a path remain eligible. Offscreen animation mixers stop; returning actors resume the current gameplay attack phase. Hidden models suppress voxel fallback. Death cleanup and removed/resurrected actors covered by tests. Shadows and detail settings retained.

The world cleanup import previously addressed a different mob3d module instance. Both now share the owning renderer instance. Real Briar→Woods transition detached all 9 old actor roots and rebuilt a 5-actor pool for the new view without renderer errors. Chunk centers/radii are computed once, and nearest-three lamp selection reuses fixed buffers rather than allocating/sorting every frame.

Browser checks: original level-4 / rank-4 save; near combat in shoulder, overhead and first-person (screenshots); both campaign halves; scene transition. Regression checks: enemy presentation 15, pause 25, first arrival 20, creator camera 14, progression 43, audio preservation 255, chest tables 200,000 samples. No two-device co-op or user-hardware FPS claim. Build local fixture with `python scripts/build-briar-performance-qa.py`, then visit `/3d/.qa-briar-performance.html?mute=1&case=start` (also village, woods, near, transition, save; `camera=far|fps`). Main timing excludes minimap/tail UI work. No production profiling overhead was added.
