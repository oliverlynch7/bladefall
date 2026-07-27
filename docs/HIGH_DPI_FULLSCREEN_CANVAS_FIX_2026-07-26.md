# High-DPI Fullscreen Canvas Fix — 2026-07-26

## Reported failure

On some computers—especially high-DPI displays or Windows display scaling above 100%—the HUD filled the screen while the actual WebGL game scene rendered only in the bottom-left quarter.

## Root cause

The main canvas correctly allocated its backing buffer in physical pixels (`CSS viewport × devicePixelRatio`). The bloom/post-processing pipeline incorrectly allocated and composited using CSS-pixel dimensions. At a device pixel ratio of 2, its final viewport therefore covered only half the canvas width and half the canvas height: exactly the bottom-left quarter visible in the report.

## Fix

- Bloom scene, depth, blur, and composite targets now use the canvas's physical backing-buffer dimensions.
- The final composite viewport now always covers the complete drawing buffer.
- Canvas size validation now detects device-pixel-ratio changes even when CSS viewport dimensions do not change.
- Fullscreen and Visual Viewport changes explicitly trigger resizing.
- Render dimensions are capped safely against the GPU's maximum texture size.
- Old post-processing targets are released when display size or scaling changes.

## Verification

- JavaScript syntax: PASS.
- DPR 1 browser rendering: PASS — 1280×720 canvas, viewport, and CSS surface all matched.
- DPR 2 browser rendering: PASS — 1024×576 CSS viewport produced a 2048×1152 backing buffer and a full 2048×1152 WebGL viewport.
- Live DPR transition: PASS — changing from DPR 2 to 1.25 without reloading resized the drawing buffer and post-processing viewport to 1280×720.
- Visual gameplay screenshot at DPR 2: PASS — the 3D scene filled the complete viewport behind every HUD edge.
- Browser console: PASS — 0 errors, 0 warnings.
