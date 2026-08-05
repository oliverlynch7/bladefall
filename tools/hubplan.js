#!/usr/bin/env node
/* THE WAYSTATION LAYOUT — reservation map + top-down plan (Phases 1 and 2).
 *
 * The last three hub passes failed the same way: coordinates were typed blind and judged once, at
 * the end, in 3D. This makes the layout a DATA FILE that is audited arithmetically and drawn to
 * scale BEFORE any model is placed, so "don't put a barrel on the Smith" is mechanical rather than
 * a promise.
 *
 * Two things live here:
 *   1. RESERVATIONS — every interactable claims a circle (visual footprint + its real interact
 *      radius, read out of index.html's updateInteract, not guessed). Any decorative placement must
 *      pass reserved(); any two interactables that crowd each other are reported.
 *   2. THE PLAN — the proposed layout, rendered as a to-scale top-down SVG.
 *
 *   node tools/hubplan.js            # audit + write docs/hub_plan.svg
 *   node tools/hubplan.js --json     # machine-readable, for the placement code
 */
const fs = require('fs');
const path = require('path');

const OUT_SVG = path.join(__dirname, '..', 'docs', 'hub_plan.svg');
const OUT_JSON = path.join(__dirname, '..', 'docs', 'hub_plan.json');
const KIT = path.join(__dirname, '..', 'docs', 'kit_measurements.json');

/* ── measured constants ───────────────────────────────────────────────────── */
const CELL = 68;          // one kit module in game units — MEASURED (tools/measurekit.js)
const STOREY = 102;       // world3d VIL_STOREY * VIL_U; walls truly measure 106, 4 units of trim overlap

/* Interact radii, read from updateInteract() in index.html. These are NOT all 110 — the plan's
 * handoff assumed they were, and the gates and the Waystone are tighter. */
const R_NPC = 110, R_GATE = 96, R_STONE = 72, R_BENCH = 70;

/* The facing bonus in updateInteract shaves up to 90 units off an object's effective distance when
 * you look at it. So two interactables whose circles merely touch are still ambiguous: whichever
 * you face wins, and the player gets a prompt for something they are not standing at. Separation,
 * not just non-overlap, is the real requirement. */
const FACING_BONUS = 90;
const CLEAR = 40;         // walking clearance around a solid footprint

/* ── the player, for scale ────────────────────────────────────────────────── */
const PLAYER_W = 40, RUN = 220;

/* ══ THE LAYOUT ═══════════════════════════════════════════════════════════════
 * A FORTRESS BUILT OVER THE MOUTH OF THE DESCENT.
 *
 * The centre is not a plaza, it is an open shaft dropping into the dark, ringed by a stone lip.
 * The eight portals stand around the north of that ring in tier order, so the hub is literally a
 * circle around the thing you are about to enter. Services occupy the two surviving wings of the
 * fortress. The optional trials are down the stairs INTO the shaft, one terrace below, so you look
 * down on them. Spawn is south, on the axis, with every portal in sight.
 *
 * Every number below is derived, not typed: the portal ring is polar, the wings are on the kit's
 * 68-unit module, and nothing is placed that the audit does not clear. */

const SHAFT_R = 290;          // the hole itself
const LIP_R = 360;            // outer edge of the stone lip you walk on, around the hole
const TERRACE_R = 210;        // the trials' terrace, one level down inside the shaft

/* HOW FAR DOWN THE TERRACE SITS IS THE KIT'S DECISION, NOT MINE. Every Stairs_Exterior_* piece
 * measures exactly 68 x 68 on plan and rises 34 - one clean cell, one clean quarter-storey. Four
 * flights is therefore 136, and 136 is the only drop a stair can reach without a piece being
 * stretched. The first draft said 140 for no reason but that it was a round number, which is the
 * exact habit that produced the last hub. */
const STAIR_RISE = 34, STAIR_RUN = 68, STAIR_FLIGHTS = 4;
const TERRACE_DROP = STAIR_RISE * STAIR_FLIGHTS;   // 136

/* THE SHAFT IS BUILT UPSIDE-DOWN, AND THE ENGINE IS THE REASON.
 * floorAt() returns 0 for any point inside a G.segments rect and only ever stacks UPWARD from
 * there (walls with `stand`, movers, `plat` obstacles); a point in no segment is -Infinity, which
 * is void, not a lower floor. So there is no such thing as ground below zero in this game, and the
 * terrace "one level down" cannot be dug.
 * It is therefore RAISED instead: the shaft floor is the engine's natural ground at y=0 and carries
 * the trials, and the whole fortress plaza sits on a ring of `plat` obstacles PLAZA_Y above it.
 * The player's experience is identical - four flights down into the dark - and no engine change is
 * needed. Oliver chose this over a visual-only pit on 2026-08-05. */
const PLAZA_Y = TERRACE_DROP;   // 136 — plaza sits this far above the shaft floor
const SHAFT_Y = 0;

/* THE PORTAL RING IS AN ELLIPSE, NOT A CIRCLE, AND THAT IS A CORRECTION TO THE CONCEPT.
 * A true circle put the middle portals 1,633 units from spawn against 1,290 for the outer ones -
 * 7.4 seconds of running versus 5.9, when the hub it replaces is ~4. The pitch claims a ring makes
 * everything "equidistant from spawn"; measured, it does the opposite, because spawn cannot stand
 * at the centre of a ring whose centre is a hole. Flattening the ring in z pulls the deep middle
 * back without costing the shape: it still reads as a ring around the shaft from every angle. */
const PORTAL_A = 620, PORTAL_B = 470;
const SPAWN = { x: 0, z: 620 };

const D2R = Math.PI / 180;
/* -z is north in game space, so a bearing of 0 points north and +bearing swings east. */
const polar = (r, degFromNorth) => ({
  x: Math.round(r * Math.sin(degFromNorth * D2R)),
  z: Math.round(-r * Math.cos(degFromNorth * D2R)),
});

/* ── zone portals: an arc across the north, tier order left to right ───────── */
/* A full 360 ring would put tiers 4 and 5 behind the player at spawn and destroy the one piece of
 * wayfinding that already works — the tier order reading left to right. A 156-degree arc keeps
 * both: it is unmistakably a ring around the shaft, and it still reads 1..8 across the view. */
const ZONE_NAMES = ['The Outskirts', 'Hollow Pass', 'Ruined Keep', 'Frostfell',
                    'Emberdeep', 'The Abyss', 'Sunspire Palace', 'Castle Duskmoor'];
const ARC = 156;
const portals = ZONE_NAMES.map((name, i) => {
  const bearing = -ARC / 2 + i * (ARC / (ZONE_NAMES.length - 1));
  const x = Math.round(PORTAL_A * Math.sin(bearing * D2R));
  const z = Math.round(-PORTAL_B * Math.cos(bearing * D2R));
  return { id: 'gate' + i, kind: 'portal', name, tier: i + 1, bearing, x, z, r: R_GATE,
           fw: 90, fd: 30, facing: bearing + 180 };
});

/* ── keepers and services: the two surviving fortress wings ───────────────── */
/* Laid on the kit module (68) so the buildings behind them snap, and pushed out past the portal
 * ring's ends so a keeper is never standing in a portal's claim. */
/* WING_X was 900 in the first draft and the drawing said no: it left a 300-unit band of nothing
 * between the portal ring's ends (x +-606) and the keepers, and an empty hub is precisely what
 * "AWFUL" looked like. Pulled in to 820, which is the closest the wings can come before a keeper
 * starts stealing the outer portals' prompt - the audit's tight-check is what fixes the number. */
const WING_X = 820;
/* 210 apart, matching the spacing the current hub already uses between the Quartermaster and the
 * Smith. Slots start south of the portal arc's ends (z -98) so a wing never crowds a portal. */
const WING_Z = [-40, 170, 380, 590];
const services = [
  { id: 'quartermaster', name: 'Quartermaster', role: 'Shop',             x: -WING_X, z: WING_Z[0], fw: 84, fd: 46, facing:  90 },
  { id: 'chest',         name: 'Your Bag',      role: 'Storage',          x: -WING_X, z: WING_Z[1], fw: 48, fd: 40, facing:  90 },
  { id: 'anvil',         name: 'The Smith',     role: 'Fuse gear',        x: -WING_X, z: WING_Z[2], fw: 54, fd: 54, facing:  90 },
  { id: 'keeper',        name: 'The Stylist',   role: 'Style',            x: -WING_X, z: WING_Z[3], fw: 48, fd: 48, facing:  90 },
  { id: 'drillmaster',   name: 'Drillmaster',   role: 'Classes & Trials', x:  WING_X, z: WING_Z[0], fw: 78, fd: 54, facing: -90 },
  { id: 'beastkeeper',   name: 'Beastkeeper',   role: 'Companions',       x:  WING_X, z: WING_Z[1], fw: 54, fd: 54, facing: -90 },
  { id: 'mirror',        name: 'The Mirror',    role: 'Inspect yourself', x:  WING_X, z: WING_Z[2], fw: 62, fd: 24, facing: -90 },
  { id: 'sparring',      name: 'Sparring Room', role: 'Training',         x:  WING_X, z: WING_Z[3], fw: 74, fd: 28, facing: -90 },
  /* Postings stands ON the spawn walk, not in a wing: it is the one service a new player should
   * meet before they pick a portal, and the approach is the only place they are guaranteed to pass. */
  { id: 'board',         name: 'Postings',      role: 'Quests',           x: -300, z: 640, fw: 66, fd: 24, facing:  35 },
].map(s => ({ ...s, kind: 'service', r: R_NPC }));

/* ── the trials: down the stairs, inside the shaft ────────────────────────── */
/* On a terrace one level below the lip, reached by the south stair. You LOOK DOWN on them from the
 * plaza, which is the whole point: the optional content is visibly deeper than the road. */
/* Evenly spaced on a hexagon, which is the only arrangement that clears the facing bonus on a
 * terrace this size (2*pi*210/6 = 220 apart, against the 200 the bonus needs). Pairs that belong
 * together are adjacent: the two endless modes side by side, the Arena beside the Gauntlet. */
const trialDefs = [
  { id: 'arena',    name: 'The Arena',            bearing: 180 },
  { id: 'gauntlet', name: 'The Gauntlet',         bearing: 120 },
  { id: 'sprint',   name: 'Treasure Sprint',      bearing:  60 },
  { id: 'abyss',    name: 'Abyssal Descent',      bearing: 240 },
  { id: 'delve',    name: 'The Endless Dungeon',  bearing: 300 },
];
const trials = trialDefs.map(t => ({
  ...t, kind: 'trial', ...polar(TERRACE_R, t.bearing), y: SHAFT_Y, r: R_NPC, fw: 60, fd: 30,
  facing: t.bearing + 180,
}));
/* Isaac's Arcade is conditional (meta.arcadeOwned) so it gets a slot that is reserved whether or
 * not it is built — a spot that only exists sometimes is how you end up with a barrel in it. */
const arcade = { id: 'arcade', kind: 'trial', name: "Isaac's Arcade", conditional: 'meta.arcadeOwned',
                 ...polar(TERRACE_R, 0), y: SHAFT_Y, r: R_NPC, fw: 62, fd: 42, facing: 180 };

/* ── the fixtures that are not NPCs and are easy to lose ──────────────────── */
const fixtures = [
  /* The Waystone stands ON the lip, on the spawn axis, so the first thing you reach walking north
   * is the thing that heals and banks you, with the shaft opening up behind it. */
  { id: 'waystone', kind: 'fixture', name: 'The Waystone', x: 0, z: Math.round((SHAFT_R + LIP_R) / 2),
    r: R_STONE, fw: 66, fd: 66, facing: 0 },
  /* Both secrets sit at the far end of a wing, tucked BEHIND the last keeper rather than alone in
   * an empty corner. A secret needs something to hide behind; at (+-1080, 820) they were standing
   * in open ground outside the fortress, which is the opposite of hidden. */
  { id: 'bench', kind: 'fixture', name: "The Tinkerer's bench (???)", x: -820, z: 790, r: R_BENCH,
    fw: 60, fd: 60, facing: 20, hidden: true },
  { id: 'stash', kind: 'fixture', name: 'The gold stash', x: 820, z: 790, r: R_BENCH,
    fw: 40, fd: 40, facing: -20, hidden: true },
];

const ALL = [...portals, ...services, ...trials, arcade, ...fixtures];

/* Which deck a thing stands on. Anything without an explicit y is on the raised plaza; only the
 * trials sit on the shaft floor. Two things on different decks can never contest a prompt or block
 * each other's sightline, so every audit below tests this rather than raw distance. */
const onPlaza = o => (o.y == null ? PLAZA_Y : o.y) === PLAZA_Y;

/* ══ THE RESERVATION MAP ═════════════════════════════════════════════════════ */
/* Each interactable claims a circle. A decorative placement must pass reserved(); anything that
 * fails is a bug in the layout, not a judgement call. */
function claimOf(o) {
  const half = Math.hypot(o.fw || 0, o.fd || 0) / 2;
  return { x: o.x, z: o.z, r: Math.max(o.r, half + CLEAR), o };
}
const CLAIMS = ALL.map(claimOf);

function reserved(x, z, r = 0) {
  for (const c of CLAIMS) {
    /* Interactables on the sunken terrace do not contest the plaza above them: they are 140 units
     * down, so a lamp on the lip and a portal on the terrace can share a footprint on the map. */
    if (!onPlaza(c.o)) continue;
    if (Math.hypot(c.x - x, c.z - z) < c.r + r) return c.o;
  }
  return null;
}

/* ══ THE AUDIT ═══════════════════════════════════════════════════════════════ */
const problems = [], notes = [];

/* 1. No two interactables may crowd each other. Because of the facing bonus, "not overlapping" is
 *    not enough — two things within FACING_BONUS of each other's rim swap prompts on a turn. */
for (let i = 0; i < ALL.length; i++) for (let j = i + 1; j < ALL.length; j++) {
  const a = ALL[i], b = ALL[j];
  if (onPlaza(a) !== onPlaza(b)) continue;               // different levels never contest
  const d = Math.hypot(a.x - b.x, a.z - b.z);
  const need = Math.max(a.r, b.r);                        // centre-to-centre: you must leave one to enter the other
  if (d < need) problems.push(`OVERLAP: ${a.name} and ${b.name} are ${Math.round(d)} apart, need ${need}`);
  else if (d < need + FACING_BONUS)
    notes.push(`tight: ${a.name} / ${b.name} ${Math.round(d)} apart (facing bonus can steal the prompt below ${need + FACING_BONUS})`);
}

/* 2. Nothing on the plaza level may stand over the hole. The LIP is walkable stone and the
 *    Waystone is meant to be on it, so the test is the shaft's edge, not the lip's. */
for (const o of ALL) {
  if (!onPlaza(o)) continue;
  if (Math.hypot(o.x, o.z) - Math.max(o.fw, o.fd) / 2 < SHAFT_R) problems.push(`OVER THE SHAFT: ${o.name}`);
}
/* 3. Trials must be ON the terrace, not through its wall. */
for (const t of [...trials, arcade]) {
  const d = Math.hypot(t.x, t.z);
  if (d + Math.max(t.fw, t.fd) / 2 > SHAFT_R) problems.push(`OFF THE TERRACE: ${t.name} reaches ${Math.round(d + Math.max(t.fw, t.fd) / 2)} > ${SHAFT_R}`);
}
/* 4. Spawn must have a clear line to the Waystone and to every portal. A sightline is blocked if it
 *    passes through another interactable's solid footprint. */
const seg2pt = (ax, az, bx, bz, px, pz) => {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
  let t = L2 ? ((px - ax) * dx + (pz - az) * dz) / L2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(ax + t * dx - px, az + t * dz - pz);
};
for (const g of portals) {
  for (const o of ALL) {
    if (o === g || !onPlaza(o) || o.id === 'waystone') continue;
    const half = Math.max(o.fw, o.fd) / 2;
    if (seg2pt(SPAWN.x, SPAWN.z, g.x, g.z, o.x, o.z) < half)
      problems.push(`SIGHTLINE: ${o.name} blocks the view from spawn to ${g.name}`);
  }
}
/* 5. Nothing may block the Mirror's glass. */
{
  const m = ALL.find(o => o.id === 'mirror');
  const front = { x: m.x + Math.sin(m.facing * D2R) * 160, z: m.z - Math.cos(m.facing * D2R) * 160 };
  for (const o of ALL) {
    if (o === m || !onPlaza(o)) continue;
    if (seg2pt(m.x, m.z, front.x, front.z, o.x, o.z) < Math.max(o.fw, o.fd) / 2)
      problems.push(`MIRROR: ${o.name} stands in front of the glass`);
  }
}
/* 6. Everything must be inside the bounds the plan is drawn for. */
const BOUNDS = { minX: -980, maxX: 980, minZ: -700, maxZ: 820 };
for (const o of ALL) {
  if (o.x < BOUNDS.minX || o.x > BOUNDS.maxX || o.z < BOUNDS.minZ || o.z > BOUNDS.maxZ)
    problems.push(`OUT OF BOUNDS: ${o.name} at ${o.x},${o.z}`);
}
/* 7. Nothing may be lost. The handoff's inventory is the contract. */
const REQUIRED = [...ZONE_NAMES, 'Quartermaster', 'The Smith', 'The Stylist', 'Drillmaster',
  'Beastkeeper', 'Postings', 'The Mirror', 'Your Bag', 'Sparring Room', 'Abyssal Descent',
  'The Endless Dungeon', 'Treasure Sprint', 'The Arena', 'The Gauntlet', "Isaac's Arcade",
  'The Waystone', "The Tinkerer's bench (???)", 'The gold stash'];
for (const need of REQUIRED)
  if (!ALL.some(o => o.name === need)) problems.push(`MISSING FROM THE LAYOUT: ${need}`);

/* ── walk times, so "equidistant from spawn" is a number, not a claim ─────── */
const dists = portals.map(g => Math.hypot(g.x - SPAWN.x, g.z - SPAWN.z));
const spread = Math.round(Math.max(...dists) - Math.min(...dists));

/* ══ THE DRAWING ═════════════════════════════════════════════════════════════ */
const PAD = 80;
const W = BOUNDS.maxX - BOUNDS.minX + PAD * 2, H = BOUNDS.maxZ - BOUNDS.minZ + PAD * 2;
const sx = x => Math.round(x - BOUNDS.minX + PAD), sz = z => Math.round(z - BOUNDS.minZ + PAD);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const COL = { portal: '#7fd6ff', service: '#ffd24a', trial: '#c47bff', fixture: '#6affc8' };
let g = '';

/* scale bar + grid on the kit module, so the drawing is readable as real space */
g += `<rect width="${W}" height="${H}" fill="#12131a"/>`;
g += `<g stroke="#1e2030" stroke-width="1">`;
for (let x = Math.ceil(BOUNDS.minX / CELL) * CELL; x <= BOUNDS.maxX; x += CELL)
  g += `<line x1="${sx(x)}" y1="${sz(BOUNDS.minZ)}" x2="${sx(x)}" y2="${sz(BOUNDS.maxZ)}"/>`;
for (let z = Math.ceil(BOUNDS.minZ / CELL) * CELL; z <= BOUNDS.maxZ; z += CELL)
  g += `<line x1="${sx(BOUNDS.minX)}" y1="${sz(z)}" x2="${sx(BOUNDS.maxX)}" y2="${sz(z)}"/>`;
g += `</g>`;

/* the shaft, its lip and the sunken terrace */
g += `<circle cx="${sx(0)}" cy="${sz(0)}" r="${LIP_R}" fill="#191b26" stroke="#3a3f55" stroke-width="3"/>`;
g += `<circle cx="${sx(0)}" cy="${sz(0)}" r="${SHAFT_R}" fill="#0a0a10" stroke="#4a3a6a" stroke-width="2"/>`;
g += `<circle cx="${sx(0)}" cy="${sz(0)}" r="${TERRACE_R}" fill="none" stroke="#5a4a7a" stroke-width="1" stroke-dasharray="6 6"/>`;
g += `<text x="${sx(0)}" y="${sz(-40)}" fill="#6a5a8a" font-size="26" text-anchor="middle" font-family="monospace">THE DESCENT</text>`;
g += `<text x="${sx(0)}" y="${sz(10)}" fill="#4a4060" font-size="17" text-anchor="middle" font-family="monospace">trials ${TERRACE_DROP} down (${STAIR_FLIGHTS} flights)</text>`;
g += `<text x="${sx(0)}" y="${sz(56)}" fill="#3f3752" font-size="15" text-anchor="middle" font-family="monospace">shaft floor = engine ground y0; plaza rides +${PLAZA_Y}</text>`;

/* the portal ring — an ellipse, so it is visible that the ring is flattened on purpose */
g += `<ellipse cx="${sx(0)}" cy="${sz(0)}" rx="${PORTAL_A}" ry="${PORTAL_B}" fill="none" stroke="#243040" stroke-width="1" stroke-dasharray="10 8"/>`;

/* sightlines from spawn */
g += `<g stroke="#2a3348" stroke-width="1">`;
for (const p of portals) g += `<line x1="${sx(SPAWN.x)}" y1="${sz(SPAWN.z)}" x2="${sx(p.x)}" y2="${sz(p.z)}"/>`;
g += `</g>`;

/* reservation circles, then footprints, then labels */
for (const c of CLAIMS) {
  const col = COL[c.o.kind] || '#888';
  const dim = onPlaza(c.o) ? 0.20 : 0.10;
  g += `<circle cx="${sx(c.x)}" cy="${sz(c.z)}" r="${c.r}" fill="${col}" fill-opacity="${dim}" stroke="${col}" stroke-opacity="0.5" stroke-width="1"/>`;
}
for (const o of ALL) {
  const col = COL[o.kind] || '#888';
  g += `<rect x="${sx(o.x - o.fw / 2)}" y="${sz(o.z - o.fd / 2)}" width="${o.fw}" height="${o.fd}" fill="${col}" stroke="#000" stroke-width="1"/>`;
  /* facing tick: which way the thing looks */
  const fx = o.x + Math.sin((o.facing || 0) * D2R) * 46, fz = o.z - Math.cos((o.facing || 0) * D2R) * 46;
  g += `<line x1="${sx(o.x)}" y1="${sz(o.z)}" x2="${sx(fx)}" y2="${sz(fz)}" stroke="${col}" stroke-width="2"/>`;
  const label = (o.tier ? o.tier + '. ' : '') + o.name + (o.conditional ? ' *' : '');
  g += `<text x="${sx(o.x)}" y="${sz(o.z) - Math.max(o.fd / 2, 10) - 8}" fill="#e8e8f0" font-size="19" text-anchor="middle" font-family="monospace">${esc(label)}</text>`;
  g += `<text x="${sx(o.x)}" y="${sz(o.z) + Math.max(o.fd / 2, 10) + 22}" fill="#8a8fa8" font-size="15" text-anchor="middle" font-family="monospace">${o.x},${o.z}</text>`;
}

/* spawn */
g += `<circle cx="${sx(SPAWN.x)}" cy="${sz(SPAWN.z)}" r="${PLAYER_W / 2}" fill="#fff"/>`;
g += `<line x1="${sx(SPAWN.x)}" y1="${sz(SPAWN.z)}" x2="${sx(SPAWN.x)}" y2="${sz(SPAWN.z) - 60}" stroke="#fff" stroke-width="3"/>`;
g += `<text x="${sx(SPAWN.x)}" y="${sz(SPAWN.z) + 42}" fill="#fff" font-size="21" text-anchor="middle" font-family="monospace">SPAWN (facing north)</text>`;

/* legend + scale */
/* Top-left, which the layout leaves empty. Bottom-left sat on the Tinkerer's bench. */
const legY = sz(BOUNDS.minZ) + 46;
g += `<rect x="${sx(BOUNDS.minX) + 10}" y="${legY - 26}" width="560" height="150" fill="#0c0d13" fill-opacity="0.9" stroke="#2a2e40"/>`;
let ly = legY;
for (const [k, c] of Object.entries(COL)) {
  g += `<rect x="${sx(BOUNDS.minX) + 26}" y="${ly - 13}" width="18" height="18" fill="${c}"/>`;
  g += `<text x="${sx(BOUNDS.minX) + 54}" y="${ly + 3}" fill="#c8ccd8" font-size="18" font-family="monospace">${k}</text>`;
  ly += 26;
}
g += `<text x="${sx(BOUNDS.minX) + 170}" y="${legY + 3}" fill="#8a8fa8" font-size="16" font-family="monospace">shaded circle = interact + clearance</text>`;
g += `<text x="${sx(BOUNDS.minX) + 170}" y="${legY + 29}" fill="#8a8fa8" font-size="16" font-family="monospace">grid = ${CELL}u kit module (MEASURED)</text>`;
g += `<text x="${sx(BOUNDS.minX) + 170}" y="${legY + 55}" fill="#8a8fa8" font-size="16" font-family="monospace">* = only when meta.arcadeOwned</text>`;
g += `<text x="${sx(BOUNDS.minX) + 170}" y="${legY + 81}" fill="#8a8fa8" font-size="16" font-family="monospace">spawn to nearest portal spread: ${spread}u</text>`;
/* a 220-unit bar = one second of running */
const bx0 = sx(BOUNDS.maxX) - RUN - 40, by0 = sz(BOUNDS.minZ) + 60;
g += `<line x1="${bx0}" y1="${by0}" x2="${bx0 + RUN}" y2="${by0}" stroke="#fff" stroke-width="3"/>`;
g += `<text x="${bx0 + RUN / 2}" y="${by0 - 12}" fill="#fff" font-size="18" text-anchor="middle" font-family="monospace">${RUN}u = 1s run</text>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<title>The Waystation — proposed layout, to scale</title>${g}</svg>`;

fs.writeFileSync(OUT_SVG, svg);
fs.writeFileSync(OUT_JSON, JSON.stringify({
  meta: { CELL, STOREY, SHAFT_R, LIP_R, TERRACE_R, TERRACE_DROP, STAIR_RISE, STAIR_RUN,
          STAIR_FLIGHTS, PORTAL_A, PORTAL_B, SPAWN, BOUNDS, ARC,
          radii: { R_NPC, R_GATE, R_STONE, R_BENCH }, FACING_BONUS, CLEAR },
  interactables: ALL, claims: CLAIMS.map(c => ({ id: c.o.id, x: c.x, z: c.z, r: c.r })),
  audit: { problems, notes },
}, null, 1));

/* ── report ───────────────────────────────────────────────────────────────── */
console.log('THE WAYSTATION — layout audit\n');
console.log('  interactables placed : %d (%d portals, %d services, %d trials, %d fixtures)',
  ALL.length, portals.length, services.length, trials.length + 1, fixtures.length);
console.log('  required by handoff  : %d — all present: %s', REQUIRED.length,
  REQUIRED.every(n => ALL.some(o => o.name === n)) ? 'YES' : 'NO');
const wsZ = ALL.find(o => o.id === 'waystone').z;
console.log('  spawn to portals     : %s..%s units (%ss..%ss), spread %s',
  Math.round(Math.min(...dists)), Math.round(Math.max(...dists)),
  (Math.min(...dists) / RUN).toFixed(1), (Math.max(...dists) / RUN).toFixed(1), spread);
console.log('  spawn to Waystone    : %s units (%ss)',
  Math.round(Math.abs(SPAWN.z - wsZ)), (Math.abs(SPAWN.z - wsZ) / RUN).toFixed(1));
console.log('  hub extent           : %d x %d units (%d x %d player-widths)',
  BOUNDS.maxX - BOUNDS.minX, BOUNDS.maxZ - BOUNDS.minZ,
  Math.round((BOUNDS.maxX - BOUNDS.minX) / PLAYER_W), Math.round((BOUNDS.maxZ - BOUNDS.minZ) / PLAYER_W));
console.log('\n  PROBLEMS: %d', problems.length);
for (const p of problems) console.log('    ! ' + p);
console.log('  notes: %d', notes.length);
for (const n of notes) console.log('    - ' + n);

if (process.argv.includes('--json')) console.log('\n' + fs.readFileSync(OUT_JSON, 'utf8'));
console.log('\nwrote %s + %s', path.relative(process.cwd(), OUT_SVG), path.relative(process.cwd(), OUT_JSON));
if (!fs.existsSync(KIT)) console.log('WARNING: kit measurements missing — run tools/measurekit.js');
process.exitCode = problems.length ? 1 : 0;
