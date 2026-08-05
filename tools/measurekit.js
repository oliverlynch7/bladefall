#!/usr/bin/env node
/* MEASURE THE KIT — Phase 0 of the Waystation rebuild.
 *
 * Every previous hub pass placed pieces at coordinates typed blind, and stretched modular parts to
 * arbitrary w/h/d. Both mistakes have the same root: nobody ever established how big a wall piece
 * actually is. This establishes it, exactly, with no GPU and no browser.
 *
 * A .gltf keeps the POSITION accessor's `min`/`max` in the JSON itself, so the true bounding box of
 * every mesh is readable offline. Node transforms are applied by pushing all 8 corners of each
 * primitive's AABB through the node's world matrix, which is correct for the rotations the kit uses
 * (the kit does rotate parts; taking min/max unrotated would silently swap width and depth).
 *
 * Output: docs/KIT_MEASUREMENTS.md + docs/kit_measurements.json (the machine-readable table the
 * layout code reads, so no coordinate downstream is ever a guess again).
 *
 *   node tools/measurekit.js
 */
const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'public', 'slice3d', 'assets');
const OUT_MD = path.join(__dirname, '..', 'docs', 'KIT_MEASUREMENTS.md');
const OUT_JSON = path.join(__dirname, '..', 'docs', 'kit_measurements.json');

/* world3d.js's own conversion. VIL_U is game units per kit metre; VIL_GRID is the module size the
 * code ASSUMES. This tool exists partly to check that assumption rather than inherit it. */
const VIL_U = 34;
const VIL_GRID_ASSUMED = 2.0;

/* ── minimal mat4, column-major to match glTF ─────────────────────────────── */
const mIdent = () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

function mMul(a, b) {            // a * b
  const o = new Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
    o[c * 4 + r] = s;
  }
  return o;
}

function mFromTRS(t, r, s) {
  const [x, y, z, w] = r;
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, xy = x * y2, xz = x * z2;
  const yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;
  return [
    (1 - (yy + zz)) * s[0], (xy + wz) * s[0],       (xz - wy) * s[0],       0,
    (xy - wz) * s[1],       (1 - (xx + zz)) * s[1], (yz + wx) * s[1],       0,
    (xz + wy) * s[2],       (yz - wx) * s[2],       (1 - (xx + yy)) * s[2], 0,
    t[0],                   t[1],                   t[2],                   1,
  ];
}

function nodeMatrix(n) {
  if (n.matrix) return n.matrix.slice();
  return mFromTRS(n.translation || [0, 0, 0], n.rotation || [0, 0, 0, 1], n.scale || [1, 1, 1]);
}

const xform = (m, p) => [
  m[0] * p[0] + m[4] * p[1] + m[8]  * p[2] + m[12],
  m[1] * p[0] + m[5] * p[1] + m[9]  * p[2] + m[13],
  m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
];

/* ── measure one file ─────────────────────────────────────────────────────── */
function measure(file) {
  const g = JSON.parse(fs.readFileSync(file, 'utf8'));
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  let prims = 0, missing = 0;

  const visit = (idx, parent) => {
    const n = g.nodes[idx];
    if (!n) return;
    const world = mMul(parent, nodeMatrix(n));
    if (n.mesh != null) {
      for (const p of (g.meshes[n.mesh].primitives || [])) {
        const acc = g.accessors[p.attributes && p.attributes.POSITION];
        prims++;
        /* An accessor without min/max is legal glTF but would need the .bin decoded. None of this
         * kit does it; if that ever changes the count is reported rather than silently skipped. */
        if (!acc || !acc.min || !acc.max) { missing++; continue; }
        const [ax, ay, az] = acc.min, [bx, by, bz] = acc.max;
        for (const c of [[ax,ay,az],[bx,ay,az],[ax,by,az],[bx,by,az],
                         [ax,ay,bz],[bx,ay,bz],[ax,by,bz],[bx,by,bz]]) {
          const w = xform(world, c);
          for (let i = 0; i < 3; i++) { if (w[i] < lo[i]) lo[i] = w[i]; if (w[i] > hi[i]) hi[i] = w[i]; }
        }
      }
    }
    for (const ch of (n.children || [])) visit(ch, world);
  };

  const scene = g.scenes[g.scene || 0];
  for (const r of (scene.nodes || [])) visit(r, mIdent());
  if (!isFinite(lo[0])) return null;

  return {
    min: lo.map(v => +v.toFixed(4)),
    max: hi.map(v => +v.toFixed(4)),
    size: [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]].map(v => +v.toFixed(4)),
    prims, missing,
  };
}

/* ── run over both sets ───────────────────────────────────────────────────── */
const sets = ['village', 'qprops'];
const out = {};
let failed = [];

for (const set of sets) {
  const dir = path.join(ASSETS, set);
  if (!fs.existsSync(dir)) { console.error('missing set:', dir); continue; }
  out[set] = {};
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.gltf')).sort()) {
    const name = f.replace(/\.gltf$/, '');
    try {
      const m = measure(path.join(dir, f));
      if (!m) { failed.push(set + '/' + name + ' (no geometry)'); continue; }
      out[set][name] = m;
    } catch (e) {
      failed.push(set + '/' + name + ' (' + e.message + ')');
    }
  }
}

/* ── derive the module size, rather than trusting the constant ─────────────── */
/* The kit's module is whatever number the WALL pieces' width agrees on. Walls are the only family
 * guaranteed to be exactly one cell wide, so they are the honest sample - averaging the whole
 * library would fold in 8x14 roofs and hand props and produce a meaningless number. */
const wallW = Object.entries(out.village || {})
  .filter(([n]) => /^Wall_(Plaster|UnevenBrick)_/.test(n))
  .map(([, m]) => m.size[0]);
const uniqW = [...new Set(wallW.map(v => +v.toFixed(3)))].sort((a, b) => a - b);
const gridMeasured = wallW.length ? +(wallW.reduce((a, b) => a + b, 0) / wallW.length).toFixed(4) : null;

/* Floor tiles are the second independent check: a floor is one cell square by construction. */
const floorW = Object.entries(out.village || {})
  .filter(([n]) => /^Floor_/.test(n) && !/Half|Corner|Overhang/.test(n))
  .map(([, m]) => m.size[0]);
const uniqF = [...new Set(floorW.map(v => +v.toFixed(3)))].sort((a, b) => a - b);

/* Storey height, from the wall pieces' own height - the other number the assembler assumes. */
const wallH = Object.entries(out.village || {})
  .filter(([n]) => /^Wall_(Plaster|UnevenBrick)_/.test(n))
  .map(([, m]) => m.size[1]);
const uniqH = [...new Set(wallH.map(v => +v.toFixed(3)))].sort((a, b) => a - b);

const meta = {
  generatedBy: 'tools/measurekit.js',
  unitsPerKitMetre: VIL_U,
  gridAssumedByCode: VIL_GRID_ASSUMED,
  gridMeasuredFromWalls: gridMeasured,
  wallWidthsSeen: uniqW,
  wallHeightsSeen: uniqH,
  floorWidthsSeen: uniqF,
  counts: Object.fromEntries(sets.map(s => [s, Object.keys(out[s] || {}).length])),
  failed,
};

fs.writeFileSync(OUT_JSON, JSON.stringify({ meta, sets: out }, null, 1));

/* ── the human table ──────────────────────────────────────────────────────── */
const u = v => Math.round(v * VIL_U);
const rows = [];
for (const set of sets) {
  for (const [name, m] of Object.entries(out[set] || {})) {
    rows.push({
      set, name,
      kit: m.size.map(v => v.toFixed(2)).join(' x '),
      game: m.size.map(u).join(' x '),
      cells: (m.size[0] / VIL_GRID_ASSUMED).toFixed(2) + ' x ' + (m.size[2] / VIL_GRID_ASSUMED).toFixed(2),
      baseY: m.min[1].toFixed(3),
    });
  }
}

let md = `# Kit measurements — the real size of every piece

Generated by \`tools/measurekit.js\`. **Do not hand-edit.** Re-run after adding assets.

Read straight out of each \`.gltf\`'s POSITION accessor \`min\`/\`max\`, with node transforms applied
to all eight corners of every primitive's box. No GPU, no browser, no estimate.

This table is the thing whose absence broke the last three hub attempts: pieces were scaled to
invented \`w/h/d\`, which is exactly what a modular kit cannot survive. **Placement code reads
\`docs/kit_measurements.json\`; it does not type numbers.**

## The module

| | |
|---|---|
| Game units per kit metre (\`VIL_U\`) | ${VIL_U} |
| Module assumed by \`world3d.js\` (\`VIL_GRID\`) | ${VIL_GRID_ASSUMED} |
| Module **measured** from ${wallW.length} wall pieces | ${gridMeasured} |
| Distinct wall widths found | ${uniqW.join(', ') || 'none'} |
| Distinct wall heights found | ${uniqH.join(', ') || 'none'} |
| Distinct full-floor widths found | ${uniqF.join(', ') || 'none'} |
| Pieces measured | village ${meta.counts.village || 0}, qprops ${meta.counts.qprops || 0} |
| Failed to measure | ${failed.length} |

**One cell = ${gridMeasured != null ? Math.round(gridMeasured * VIL_U) : '?'} game units.**
A wall stands ${uniqH.length === 1 ? Math.round(uniqH[0] * VIL_U) : '(varies)'} game units tall.

${failed.length ? '### Failed\n' + failed.map(f => '- ' + f).join('\n') + '\n' : ''}
## Every piece

\`kit\` is the raw model size in kit metres; \`game\` is that times ${VIL_U}, i.e. the size a piece
occupies if placed at scale 1. \`cells\` is footprint in modules (X x Z) — **a whole number here
means the piece snaps; a fraction means it does not.** \`baseY\` is where the model's own origin
sits relative to its lowest point (0.000 = it stands on its base already).

| Set | Piece | kit (w x h x d) | game (w x h x d) | cells | baseY |
|---|---|---|---|---|---|
`;
for (const r of rows) md += `| ${r.set} | ${r.name} | ${r.kit} | ${r.game} | ${r.cells} | ${r.baseY} |\n`;

fs.writeFileSync(OUT_MD, md);

console.log('measured village=%d qprops=%d failed=%d',
  meta.counts.village || 0, meta.counts.qprops || 0, failed.length);
console.log('grid: code assumes %s, walls measure %s (widths seen: %s)',
  VIL_GRID_ASSUMED, gridMeasured, uniqW.join(', ') || 'none');
console.log('wall heights seen: %s', uniqH.join(', ') || 'none');
console.log('floor widths seen: %s', uniqF.join(', ') || 'none');
console.log('wrote %s + %s', path.relative(process.cwd(), OUT_MD), path.relative(process.cwd(), OUT_JSON));
if (failed.length) console.log('FAILED:', failed.join(', '));
