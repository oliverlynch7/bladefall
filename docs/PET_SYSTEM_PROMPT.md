# BLADEFALL — Pet / Companion System (dev work order)

> Ready-to-run prompt for a single BLADEFALL dev session. Hand this file to the updater
> (or tell the session: "Read this file and execute it"). Two-stage inspect-then-implement.
> LOCKED decisions are final; everything else is derived from the actual code.

---

You are working directly on BLADEFALL, a lightweight single-file WebGL voxel action-roguelite
RPG. The whole game is the single file `public/3d/index.html` (live at `/3d/`). Debug hook:
`window.__BF3`.

Add a PET / COMPANION system. Do this as two stages: (1) inspect the actual game and write a
grounded self-prompt; (2) implement from that self-prompt. Do not begin editing until you have
inspected the real code — do not assume data shapes, the hub-NPC pattern, the save schema, or
the voxel-draw pipeline; read them.

## === BLADEFALL OPERATING CONTEXT ===
- The game is the SINGLE self-contained file `public/3d/index.html`. All code lives there.
- **MUTE FIRST** (own tiny commit if not already shipped): auto-mute (sound+music off) when
  `location.hostname` is `localhost`/`127.0.0.1`, and honor a `?mute=1` URL param — so test
  builds are silent while the live game is being played. Until it ships, set
  `meta.soundOn`/`meta.musicOn` false in the test tab.
- **DO NOT BREAK SAVES.** All new state on `meta.*` behind the existing load/migrate path.
  Never wipe or corrupt an existing save. Old saves (no pets) must load cleanly.
- **VERIFY IN A REAL BROWSER** before claiming done (`python -m http.server` in `public/`,
  open `/3d/`). The node stub can't compile GLSL and stub canvases mask DOM/UI bugs.
- **ON SHIP:** bump `VERSION3D`, `git push` from INSIDE the submodule (Cloudflare
  auto-deploys), confirm the new `VERSION3D` string serves live, then log it in
  `_automation/bladefall/UPDATE_ROADMAP.md` as a new phase with a shipped-note.
- **ADD NO NEW ART FILES.** Build every pet from the existing `bx()` / `drawHero3` voxel
  pipeline.
- **SCOPE GUARD:** this is the pet system ONLY. Do NOT build the weapon/element overhaul,
  mimic chests, or endless mode here — those are separate work orders.
## === END OPERATING CONTEXT ===

## === LOCKED DESIGN DECISIONS (respect exactly) ===
1. **ONE active pet at a time.** Owned pets are stored (like the bag); you swap which is
   active. No running two at once.
2. **Pets are equipped/swapped ONLY in the HUB** (not mid-run). Follow the existing
   gear/hub-menu gating so a pet can't be changed inside a level.
3. A **NEW hub NPC — a "Beastkeeper"** (or a grim/terse name that fits BLADEFALL's voice) —
   is the interface: **buy** pets, **sell** pets, and **TRAIN** the active pet for MARGINAL
   gains (spend gold for small, diminishing-return stat bumps; a real gold sink, never a
   power spike).
4. You can **NAME your pet**, and **TOGGLE a floating name label/icon above it** on/off.
5. Pets **carry across levels like gear**; persist on `meta.*`.

## === PET BEHAVIOR ARCHETYPES (variety is the point) ===
- **ATTACKER:** follows the hero; periodically darts at the nearest enemy for CHIP damage.
  Variety by style / element / range / cadence (e.g. a fire imp lobbing sparks, a stone pup
  body-slam, a wisp firing bolts). Pricier / rarer pets hit a bit harder.
- **HEALER (passive):** never attacks; trickles a small amount of HP back, or a tiny heal
  pulse every several seconds. Pure support. (This is Oliver's explicitly requested pet type
  — not every pet must be combat.)
- **(Optional, only if cheap) UTILITY:** a gold / loot-vacuum that pulls nearby drops to the
  hero. **NO** secret-tagging / map-reveal pets — discovery stays the player's.

Different pets differ in strength, rarity (rarity-glow-colored), a unique voxel silhouette, a
name, and one flavor line. Price scales with strength. A couple of rare pets MAY be
secret / boss rewards rather than buyable — only if that fits cheaply; do NOT add new content
just to force this.

## === BALANCE GUARDS ===
- **Pets HELP, never CARRY.** Attacker damage is chip; healer is slow. The player's own skill
  stays the point. Cap training gains so a maxed pet is still marginal.
- If BLADEFALL now has the elemental status system, a pet MAY apply a small amount of its
  element's status — but it MUST obey the same multi-hit / per-target buildup rate-limits as
  weapons. A pet must NEVER become a stack-spam exploit. If the status system isn't present
  yet, pets deal plain damage.
- **Hitless / Hardcore:** a passive healer must not trivialize Hitless. Decide, from the
  actual mode rules, whether pets are allowed in Hitless — if a slow-heal breaks the mode's
  intent, disable pet healing (not the pet) in Hitless and note the decision.

## === STAGE 1 — INSPECT, then write a grounded self-prompt covering ===
- How existing hub NPCs work (E-to-talk, dialogue, the shop / menagerie menu pattern) so the
  Beastkeeper reuses that infrastructure.
- The save schema + how to add owned-pets, active-pet, per-pet names, and the label-toggle
  without breaking existing loads.
- The follower / entity update loop + how to make a pet follow, target, attack, and heal
  cheaply (no per-frame allocation; pool particles and the name label).
- The voxel draw pipeline for building 3–6 distinct pet silhouettes + a rarity glow + an
  optional floating name label.
- The exact pet roster you'll SHIP (name, archetype, element if any, rarity, price, stats),
  values justified against current combat / gold balance — start SMALL (a handful), not all.
- Training math (cost curve + diminishing marginal gains).
- UI: the Beastkeeper buy / sell / train screen; the hub-only equip / swap; the name-entry +
  label toggle; how (or whether) the active pet reads on the run HUD.

## === STAGE 2 — implement from the self-prompt, then VERIFY in-browser ===
- Buy a pet at the Beastkeeper; it appears and follows in the hub and into a run.
- Only ONE pet active; swapping works and ONLY in the hub (cannot change mid-level).
- Attacker deals chip damage to enemies; healer trickles HP; neither trivializes a fight.
- Name a pet; toggle its label on/off; both persist.
- Train the active pet → small stat gain, gold spent, diminishing returns hold.
- Sell a pet → refund + removed from owned.
- Reload the page: owned pets, active pet, names, label toggle all persist; OLD saves (no
  pets) still load cleanly.
- Performance: no per-frame allocation from the pet loop; pooled label / particles.
- Then bump `VERSION3D`, push, confirm the new version serves live; log it in the roadmap.

## === HANDLING UNCERTAINTY ===
Do not ask questions the code can answer. If one consequential decision truly can't be
resolved from the game (e.g. the Hitless pet policy), implement everything else and report
that single item with the smallest options + your recommendation.

## === FINAL REPORT ===
Report: the grounded self-prompt; the pet roster shipped (with stats + justification); how
follow / attack / heal were implemented cheaply; the Beastkeeper UI; save fields added +
migration; the naming + label-toggle; balance values chosen and why they stay marginal; the
Hitless decision; tests performed + results; and any unresolved concerns or clearly-separated
future work.
