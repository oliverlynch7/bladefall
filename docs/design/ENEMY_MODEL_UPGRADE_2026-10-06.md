# Enemy and boss model upgrade — visual benchmark and production sequence

Oliver prefers the detailed Forge Brute prototype to the current toy-soldier enemies. This is an art-direction and implementation brief for upgrading the whole roster, not a claim that the roster is already upgraded. Existing creature and boss mechanics, hitboxes, story roles, and named variants remain authoritative unless separately redesigned.

## What the code actually has

- `tools/art/enemy-roster.json` names 40 base enemy types. `public/3d/enemy-assets/` contains 41 base GLBs, and `articulated/` has 22 existing animation rigs plus named variants. The current production humanoids generally use shared squat proportions and hundreds, rather than thousands, of triangles. A single detail-overlay pass on three representatives still looked squat and was rejected after rendering.
- `mob3d.js` loads an appearance on demand, clones a skeleton and materials for each active actor, scales the art to the existing gameplay height, and leaves collision and AI to the game. Its former unconditional material-white tint erased authored glTF color; this was corrected as part of the Forge Colossus integration.
- The Forge model has 23,076 triangles and eight materials. A new rigidly weighted 14-bone export preserves its plated silhouette and works with the game's six core clips and a tailored hammer slam. It is appropriate for a named boss, not a target budget for every swarm unit.

## Art rule

Each enemy must read by **body shape, head, movement and weapon** at ordinary play-camera distance, in flat light, before small markings are added. Detail should explain its origin and attack: furnace doors, chain and hammer on the Forge Colossus; exposed joints and stone fracture on the Marble Colossus; distinct ranged silhouette on the Marksman. Do not recolor the Forge Colossus into unrelated soldiers. Preserve variety in height and mass. Spend geometry on the face, hands, weapon, shoulders and moving parts that a player sees, rather than on invisible back-panel rivets.

## Production order

1. **Boss signatures:** Ember Colossus (first integration), Marble Colossus, Hollow Marksman, fallen commander, Hydra, final King. Each gets a dedicated front/side/back render, in-game scale check, attack poses, readable tell and mobile frame check. The Hydra needs a separate creature rig rather than a humanoid conversion.
2. **Elite silhouettes:** siege knight, royal arcanist, sentinel, revenant, brute, warden, archer, sorcerer. These are repeated enough to matter, but should not look like small copies of the bosses.
3. **Common families:** Legion soldiers, casters and archers; ice, ember, poison and void creatures; beasts and flying units. Build one high-quality *family vocabulary* at a time, while giving each member a different form and face. Prioritize enemies seen early in Briar Town for the new-player impression.
4. **Small objects and summons:** slimes, totems, crystals, mimics, dummies and similar forms. Their needed detail and budget differ from humanoids.

For each candidate: make an isolated Blender source and render, review at game-camera size, rig to the appropriate skeleton or author a creature skeleton, test idle/move/windup/attack/hit/death in a browser, then replace only that appearance in production. Keep the old GLB as a fallback during QA. Measure total asset size and triangle count and check a several-enemy encounter before widening the rollout. Passing an automatic geometry check does not establish that it looks good; review screenshots and player-visible motion.

## Current result and limits

The Ember Colossus is the first upgraded production appearance. The prototype source and rig are in `prototypes/sol-forge-brute/`; the deployed art lives in `public/3d/enemy-assets/articulated/forge-colossus-v2125.glb`. Browser checks show the GLB loads with 14 bones and the six runtime clips, and the enemy renderer retains the authored iron, cloth and ember colors.

## [Codex | 2026-10-07] Marble Colossus first production pass

The second boss now has its own Sunspire guardian model: fractured blue-grey and ivory stone, an exposed sky-light heart, engraved gold sun, open stone hands, and a broken five-pronged crown. Source, three Blender renders, metrics, and the editable rig are in `prototypes/marble-colossus/`. The production file is `public/3d/enemy-assets/articulated/marblecolossus-v2126.glb`; the prior file remains untouched. It is 10,984 triangles, eight skinned meshes/materials, 14 bones, and 968 KB. Existing boss mechanics, collider, rewards, and saves are unchanged.

The browser animation preview loaded all six clips with finite transforms at 18 sampled phases. A Palace Courtyard rendering smoke check selected the new file and showed the model at boss scale. This is code and visual smoke verification, not a human playtest of the authored boss arena or a mobile frame-rate measurement. The rest of the roster remains to be modeled; the Hollow Marksman is next in the written production order.
