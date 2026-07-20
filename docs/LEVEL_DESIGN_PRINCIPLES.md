# BLADEFALL — 3D Level Design Principles (research → what to apply)

> Principles distilled from established level-design sources, each translated into concrete
> guidance for BLADEFALL's hand-built static zones (a voxel, dodge-roll melee/ranged
> action-roguelite). Use as the bar when building or rebuilding a zone. Follow `AGENTS.md`.

## THE 9 PRINCIPLES (and how BLADEFALL should use each)

### 1. The Golden Path (breadcrumbing)
**Principle:** one clearly-readable main route — *visible, intuitive, rewarding, flexible*.
The path of least resistance leads to the objective; optional content requires *deliberate
deviation*.
**BLADEFALL:** every zone has ONE obvious main route to the portal, readable at a glance.
Forks should REJOIN as loops, never dead-end (Hollow Pass does this well). Purple secrets sit
OFF the golden path — a deliberate detour, never blocking progress.
**Do:** make the main route visibly wider / brighter / more "travelled" than side paths; the
exit portal is the unmistakable end-goal.

### 2. Wayfinding — Landmarks & Light
**Principle:** big distinctive features (towers, glowing doors, statues) orient the player;
**light pulls the eye instinctively**; be LESS subtle than feels natural (over-signposting
beats under-signposting).
**BLADEFALL:** each zone shows a distant **destination landmark** from the start — the Apex
throne on the horizon, a shrine, a tower — so "forward" is never in doubt. Use LIGHT (a
glowing portal, torches, the zone's elemental glow) to trace the path and mark objectives.
Quest items already got beacons — extend that: light IS the guide.
**Do:** silhouette the destination on the horizon; light the golden path; make the portal glow.

### 3. Sightlines & Framing
**Principle:** frame the goal inside the player's natural field of view using geometry (arches,
walls, gorges); sightlines *show what's ahead*.
**BLADEFALL:** use the zone's arches, gorges, and colonnades to FRAME the next landmark as the
player crests a rise or rounds a corner — a reveal beat. At each checkpoint the player should
SEE the next beat. Avoid blind corners that hide the path.
**Do:** at forks and crests, frame the destination through an arch or between pillars.

### 4. Flow & Choke Points
**Principle:** main routes are wide and prominent (primary circulation); choke points funnel
and *pace* the experience.
**BLADEFALL:** the main path should FEEL like the main path. Use a choke (a narrow bridge, a
gate) to pace — a fight before it, a breather after — so the player commits to each beat
deliberately.
**Do:** gate major beats (a mini-boss, a big den) behind a choke so entry feels intentional.

### 5. Pacing — Tension & Release (the beat structure)  ← THE BIG ONE
**Principle:** alternate combat/challenge with quiet/safe/loot moments in a *wave rhythm*;
warm up before big fights; **strategic emptiness** (don't fill every inch — quiet stretches
build tension and let the player assimilate).
**BLADEFALL:** structure each zone as a PACING CURVE, not wall-to-wall combat OR a long empty
walk:
1. **Warm-up** — quiet entry, learn the biome, one easy foe.
2. **Rising encounters** — 2-3 combat beats of increasing pressure, separated by quiet
   traversal / a fork choice / an optional secret.
3. **Breather** — a safe checkpoint before the climax (loot, a vista, a lull).
4. **Climax** — the boss arena.
**Do:** give every zone this shape; put a *quiet stretch* between each fight so combat lands harder.

### 6. Verticality — but keep the COMBAT floor open
**Principle:** height changes embody progression and orient toward goals; verticality adds
tactical options — BUT melee/dodge action needs open space to reposition, *not* cramped or
cluttered footing.
**BLADEFALL (critical for a dodge-roll game):** use the ASCENT/DESCENT to express progression
(climbing toward the Apex, falling into the Abyss) and for OPTIONAL routes (the high road,
parkour secrets). But **required combat happens on open, flat-ish, readable footing** — never
force a fight on a cramped ledge or amid obstacles that trap the dodge-roll.
**Do:** reserve tight verticality for traversal/secrets BETWEEN fights; keep arena floors open.

### 7. Combat Arenas — non-linear, with retreat
**Principle:** arenas are non-linear spaces with multiple options, **retreat routes**, cover,
and elevation; give the player leeway to fall back when overextended.
**BLADEFALL:** the zone's fights should happen in proper ARENAS — open enough to circle, kite,
and retreat, with 1-2 terrain features (a pillar to break a ranged mob's line-of-sight, a
ledge to funnel melee). Not corridors where you get cornered. The boss arena especially (ties
to the boss-mechanics work).
**Do:** where dens spawn, widen into an arena with a retreat route + a cover/terrain feature.

### 8. Readability & Strategic Emptiness
**Principle:** uncluttered; the player reads the space at a glance; don't fill every inch;
quiet stretches serve pacing and readability.
**BLADEFALL:** keep the golden path and combat floor READABLE — deco density belongs at the
EDGES and in the VISTAS, not on the fighting/dodging surface where it fights the camera. Quiet
traversal stretches are a feature, not empty filler.
**Do:** clean combat floors; rich edges/horizons; let the player breathe between beats.

### 9. Guide Without Hand-Holding
**Principle:** the environment leads (light, landmarks, path width), not UI; and be one step
MORE obvious than feels natural — designers routinely under-signpost.
**BLADEFALL:** because levels are STATIC (learned for mastery), the FIRST run must be legible
with NO minimap — geometry + light + landmark make "forward" unmistakable. Secrets are the
only thing that should be non-obvious.
**Do:** never rely on a UI arrow for the main path; make it readable from the world alone.

## PER-ZONE READINESS CHECKLIST (does this zone pass?)
- [ ] A distant destination landmark is visible from the entrance (wayfinding).
- [ ] The golden path is visibly the widest/brightest route; forks rejoin as loops.
- [ ] Each checkpoint frames/reveals the next beat (sightlines).
- [ ] It follows the pacing curve: warm-up → rising fights (with quiet gaps) → breather → boss.
- [ ] Required fights are in OPEN arenas with retreat routes + a terrain feature — never on
      cramped ledges.
- [ ] Verticality/parkour is for traversal + secrets, not the core combat floor.
- [ ] The combat floor is uncluttered; deco is at edges/vistas.
- [ ] One coherent biome the whole way (theme consistency).
- [ ] Purple secret sits OFF the golden path, hidden a zone-appropriate way, beaconed once found.
- [ ] Legible first-run with no minimap (light + landmark + path width lead).

## WHERE THIS BITES FOR US (from playtesting)
- **Pacing** is the highest-leverage gap: some zones read as either a traversal walk or a
  spawn-soup. The warm-up → rising → breather → boss curve, with quiet gaps between fights, is
  the single biggest upgrade.
- **Arena openness for a dodge game:** ensure required fights aren't on the same cramped
  climb geometry used for secrets — melee needs room to roll.
- **Wayfinding landmarks:** confirm every zone has a horizon destination and a lit golden path
  so the first run needs no map.
These map directly onto the roadmap's still-open Phase-14 items (bigger/more-intricate levels,
theme consistency) — this doc is the *bar* for that work.

## SOURCES
- The Level Design Book — Flow, Wayfinding, Pacing, Verticality (book.leveldesignbook.com)
- Pete Ellis — Level Design Pacing & Gameplay Beats (worldofleveldesign.com)
- "Guiding Players Without Hand-Holding" (ludonodestudios, Medium)
- Game Level Design Principles & Best Practices (gamineai.com)
