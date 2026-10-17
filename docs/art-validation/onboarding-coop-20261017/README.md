# Onboarding and co-op appearance verification — 2026-10-17

Version 2.254.0-onboarding-coop. Tests use an isolated pre-change level100 save and in-memory storage, never production saves.

- Real browser: large separate E/Choose and Q/Back tutorial cards, E continues, Skill 1 value, Open journal (N), rebound journal (U), pre-change save loads.
- Real Caleb dialogue: repeated background world/quest updates; zero tracker reappearances; computed display remains none.
- Actual renderer: each of the six base peer rigs receives fitted eyes/mouth plus transmitted eye color, mouth/brow selection and offsets; live appearance replacement checked. Peers are simulated serialized network states; no second physical computer/Internet PeerJS session claimed.
- Real GLTFParser: intentionally fail ImageBitmap loading twice; fallback HTMLImageElement decodes 1024px texture. Concurrent texture requests share the result; flipY false and existing sampler configuration retained.
- 117 automated regression suites pass; focused tests cover self/update/host-relay packets, old/malformed appearances, bounds, visibility modes, retry success/fallback/permanent failure. Full regression JSON included.

Texture report limitation: referenced base-color files exist locally; the loader's one-failure-to-cached-null path is fixed with bounded recovery and shared-loader cache invalidation. This is a verified failure-path fix, not confirmation of which particular textures were missing on the friend's computer. A fresh two-computer co-op check is still needed for that exact report.
