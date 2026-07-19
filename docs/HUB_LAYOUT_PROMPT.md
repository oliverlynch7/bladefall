# BLADEFALL — Hub Layout Restructure + Navigation Overhaul (work order)

> Rebuild the Waystation hub into a compact, readable, easy-to-navigate hub-and-spoke.
> Follow `AGENTS.md`. This is a `drawWaystation` geometry rebuild + `hubNpcs`/`gates`
> repositioning — NO new systems, stays voxel. Data/layout only.

## WHY (measured findings from a live playthrough, v1.81+)
The current hub is a sparse multi-room WARREN, ~1,700 units wide, with stations scattered and
gated behind doorways. Evidence from a straight-line walk from spawn (0,214):
- **Cannot walk straight from spawn to the gates** — wedges on the centerline at z=-15.
  The game's PRIMARY action (spawn -> pick a gate -> dive) is physically obstructed.
- **No station is reachable in a straight line** — the bot wedged or fell short of ALL of
  them: Quartermaster stuck 707u short, Smith 267u short, Descent 288u short, Sparring 204u.
- Related functions are split across the whole map: shop (far-left −860), forge (far-right
  +840), bag (center) — the gear loop criss-crosses the hub. The heal/bank Keeper (used every
  single return) sits far-left off-path. Beastkeeper is orphaned far from the other combat
  stations. The Abyssal Descent (a major feature) is buried 2 doorways deep in a corner.

## PRINCIPLES (from Firelink / Hades / Majula / MonHun)
Compact hub-and-spoke · a central focal landmark you spawn beside · a tight return-loop
(the every-run stations at the center) · functional zoning (stations grouped by purpose) ·
a clear forward vector (you FACE the way to go fight) · full sightlines (see everything on
arrival) · progression legibility (the gate wall telegraphs where you are / what's next).

## TARGET LAYOUT — one open plaza, shallow themed alcoves (footprint ~x[-560,560] z[-360,320])
Coordinates are targets; tune for feel, but keep the STRUCTURE. Orientation: -z = north
(forward, toward the gates); the player spawns south facing north.

**Spawn:** (0, 190), facing north.

**Center — THE WAYSTONE (focal landmark + return loop):**
- Waystone/Keeper (heal + bank): (0, 30) — compact footprint (~40 across), the orientation
  anchor. The player spawns a few steps south of it and passes BESIDE it to the gates —
  leave ≥120-wide clear lanes on BOTH sides so it never blocks the spawn->gate path.
- Postings (quests): (-140, 90) — flanking the waystone. Heal/bank/quests = step one, center.

**North — THE GATE ARC (the forward vector):**
- The 8 zone gates in a shallow ARC across z≈-250 (flanks) to -290 (center draws the eye),
  x from -320 to +320, evenly spaced, each on a small dais. Current/next zone gate lit
  brighter; cleared zones marked. Progression must read at a glance (it's a flat identical
  row today).
- **Abyssal Descent = the centerpiece:** a distinct dark void-portal at (0, -350), elevated
  behind the arc's center as its apex — promoted from hidden corner to landmark. Gates arc
  4-and-4 around it.

**West bay — THE EXCHANGE (gear & gold loop, open alcove):**
- Quartermaster (shop): (-440, -30) · The Smith (forge): (-440, 110) · Your Pack (bag):
  (-270, 50). Opens to the plaza via a WIDE archway (≥180), shallow — not a deep room.

**East bay — THE WAR YARD (combat prep, open alcove):**
- Drillmaster (trainer): (440, -30) · Beastkeeper (pets): (440, 110) · Sparring Post:
  (470, 150) · Training Dummies: (300, 150). Wide archway (≥180), shallow. (Fixes the
  orphaned Beastkeeper — it now sits with its natural neighbors.)

**South alcove — THE MIRROR (+ cosmetics):** (0, 285), small, open, signposted. Low frequency.

## NAVIGATION RULES (all of it must be smooth — this is half the task)
1. **Spawn -> any gate is a clear near-straight path.** No centerline blocker; the Waystone
   sits between with ≥120 lanes each side. Verify the exact spawn->center-gate straight walk
   no longer wedges.
2. **One open plaza, not a warren.** Remove the interior room walls. Every alcove (Exchange,
   War Yard, Mirror) opens directly onto the plaza — **nothing is more than ONE step (one
   open archway) off the plaza.** No station 2+ doorways deep. The Descent is on the plaza,
   not in a sub-room.
3. **Every passage/archway ≥ 120 wide** (player radius is 13; today some sub-room doors are
   ~100 and gate major features behind a squeeze). No chokepoints in front of any station.
4. **Full sightline from spawn:** on arrival the player can SEE all four zones — the gate arc
   ahead, the Exchange left, the War Yard right, the Mirror behind. No hunting.
5. Keep the hub GROWTH features (boss trophies, lit cleared gates, class-trainer figures,
   cosmetic upgrades, vista) — reposition them into the new layout, don't lose them.

## BUILD NOTES
- This is `drawWaystation` (walls/floor/decor geometry) + the `hubNpcs`, `gates`, and
  `waystone`/spawn position tables. Reuse the existing voxel `bx()` decor; do NOT restyle.
- Keep press-E interaction, `npcReact`, `updateHubTags`, the training-arena/mirror/beastkeeper
  handlers — only their POSITIONS change.
- Save-safe: no schema change (positions are code, not save data).

## VERIFY (in a real browser, via __BF3)
- Re-run the straight-line reachability probe: from spawn, walk toward each station's new
  coords; **every one must reach (closest approach < 45u)** and **spawn -> center gate must be
  a clean straight shot** (no wedge). This is the pass/fail bar.
- Confirm all archways ≥120 (no wedging through them), full sightline from spawn, the Descent
  is centre-north and prominent, gate arc reads as progression, and every station's press-E
  still works after the move.
- Then: bump `VERSION3D`, push from the submodule, log in `UPDATE_ROADMAP.md`.

## REPORT
The before/after station coordinates, the new plaza dimensions, the reachability-probe
results (all stations reached + spawn->gate clear), and anything deferred.
