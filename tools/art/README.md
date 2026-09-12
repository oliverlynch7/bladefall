# Enemy art sources

Original Bladefall geometry and rigid-weighted animation, authored for the September 2026 environment style. No downloaded enemy-pack meshes or texture dependencies.

Run with Blender 4.5:

```text
blender -b --python tools/art/build_enemy_art.py
blender -b --python tools/art/render_enemy_art.py
```

An optional `-- thornboar sentinel` suffix builds/renders selected appearances. A full build writes `public/3d/enemy-assets/manifest.json`; partial builds write `prototype.json` instead. The roster fixture preserves the gameplay names and dimensions for authoring reference; it is not imported by the game and does not change balance.

Each GLB contains one faceted, vertex-colored mesh, one material, a ten-bone armature, and Idle, Move, Windup, Attack, Hit and Death clips. The game fits the bind-pose height to the existing enemy height and uses the original collision radius. Blender faces -Y; exported glTF faces +Z.

The runtime owns each cloned skeleton and material while sharing source geometry. It holds at most twelve short-lived death presentations and two spare actors per appearance. World changes release all actor instances. Asset loading is coalesced and the original renderer remains available while downloads complete.

The phone preview at `/3d/art-previews/enemies/` loads one selected model at a time and releases it on selection changes. Portraits use neutral studio lighting, distinct from the level lighting.
