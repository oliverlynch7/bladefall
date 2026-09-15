# Player combat art — implementation plan

User direction: epic, differentiated effects for all 128 skill choices and all 28 weapon archetypes. Preserve weapon fits, models, damage, cooldowns, targeting and collision. Browser budget matters.

Inspection: skill effects alias each other in SKILL_FX, with late overrides before __BF3. Install cosmetic dispatch after these overrides. Keep events on game state, age with simulation time, and clear on area changes. Refunded skills must not produce successful-cast art. Nested skill calls must not duplicate root effects. Existing damaging fields and enemy warnings remain authoritative.

First fix hero playback: restart attacks by swing ID, play once, fit clip to actual remaining attack window; add crossbow/javelin mappings. Add semantic class motifs and skill-specific forms with bounded transient geometry. Defensive art must show actual shield/guard state. Never change a damage radius to match decoration.

Validation: syntax, complete skill/weapon coverage, event expiry and cap, refunds/nested calls, real browser rendering and repeated clip restart, existing save load. Inspect representative effects in motion before publishing. Coverage is not a substitute for visual review of all skills.

## Implemented pass

128 skill dispatch profiles across all 16 classes; semantic forms combined with class silhouettes. Basic attack events for all 28 weapon archetypes and charged-release events where supported. Existing rig clips now restart by action serial and play once within their window. Crossbow and javelin no longer select sword clips. Movement skills retain movement animation priority. The ward uses real shield/guard state and has priority in the geometry budget.

Native ribbon renderer: one shared dynamic buffer, one draw call; at most 900 strokes / 5,400 triangles, reduced to 300 / 1,800 on low. Maximum 18 transient events, 32 projectile trails; expiry follows simulation time. Partial buffer uploads and reusable transform matrices. Actual skill-ring anchors and affected enemies place targeted effects. No damage, cooldown, hitbox, fitted model or unlock changes.

Validation: browser casting smoke test for all 128 choices; 28 weapon repeat-attack checks and supported charged releases; empty-target refund, cap, expiry, and pre-change campaign save restoration. Screenshots captured for all 32 skill-4 choices; representative images from every class visually inspected. These are smoke/visual coverage checks, not an exhaustive subjective motion review of every skill in every encounter.

Scope: new effect compositions and playback of the existing clip library. No new hand-keyed skeletal clips, enemy/boss animation replacements, or gameplay balancing in this pass. Existing secondary particle effects and persistent field geometry still coexist with this layer; they are not all replaced by newly modeled assets.
