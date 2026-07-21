# Bladefall Arcade Gameception Easter Egg

Status: DEFERRED — fun future update
Owner decision: Oliver wants to revisit this after Isaac's browser-playable 2D Bladefall build is ready to share.

## Vision

Hide a classic standing arcade cabinet inside Bladefall 3D. When the player discovers and interacts with it, their 3D character appears to use the cabinet while Isaac's complete 2D Bladefall game becomes playable inside Bladefall. This should feel like an authored Gameception Easter egg, not an external-link redirect.

## First input needed

- Public URL to Isaac's browser-playable game.

## Investigation before implementation

- Confirm the URL permits iframe embedding (`X-Frame-Options` / CSP `frame-ancestors`).
- Audit keyboard, mouse, controller, fullscreen, aspect ratio, audio, and browser-save behavior.
- Determine whether a hosted iframe is robust enough or whether Isaac's exported web build should be bundled locally.

## Locked experience

1. A detailed voxel arcade cabinet is hidden in an authored, discoverable location.
2. Its idle screen visibly runs or teases Isaac's title screen.
3. The player approaches and receives a clear `E — Play` interaction prompt.
4. Interacting completely freezes Bladefall 3D simulation, enemies, projectiles, pets, timers, and audio.
5. Camera staging shows the 3D character standing at the cabinet.
6. Isaac's full game opens inside a beautiful arcade-screen overlay/frame and receives input.
7. Escape and an explicit Leave Arcade control return the player to the exact prior Bladefall state.
8. Pointer lock, HUD, camera input, audio, and focus restore reliably.
9. Isaac's saves use an isolated storage namespace and cannot overwrite Bladefall saves.

## Recommended implementation

Prefer bundling Isaac's exported browser build under a dedicated path such as:

`public/arcade/isaac-bladefall/`

A hosted iframe can be used for the first prototype if the server permits embedding. A bundled build is preferable for deployment stability, input/audio control, offline reliability, and save isolation.

## Optional rewards and polish

- Physical high-score display on the cabinet.
- Bladefall achievement or cosmetic for reaching a milestone in Isaac's game.
- Pet idles beside the player while they play.
- Cabinet appearance changes after completing Isaac's game.
- Cross-game lore or reciprocal Easter egg inside Isaac's version.
- Additional rare cabinet locations only after the authored first cabinet is proven stable.

## Guardrails

- Do not merely navigate away from Bladefall or open an unexplained browser tab.
- Do not allow both games' audio or input to run simultaneously.
- Do not implement until the supplied URL/build has been inspected.
- Preserve Bladefall saves and pause semantics.
- Begin with one reliable handcrafted cabinet location before randomization.
