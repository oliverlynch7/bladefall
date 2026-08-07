/* DUPLICATE DEFINITION FINDER — the fix for the trap that has now burned four sessions.
 *
 * index.html defines the same zone method in four different scape tables: SCAPES,
 * EXPANDED_SCAPES, SIDE_SCAPES and BOSS_ARENAS all have an `ember(ctx)`. The name cannot tell you
 * which one is live - dispatch depends on runtime state - and an edit matched by string lands on
 * the FIRST occurrence, which is almost never the one that runs.
 *
 * The failure is silent: the file parses, the gate passes, the game runs, and the change does
 * nothing. It reads as a logic bug, so you debug the wrong code. AUTOPILOT.md has warned about this
 * in prose since three sessions ago and it kept happening, because a warning you have to remember
 * is not a control.
 *
 *   node tools/dupes.js            list every duplicated definition and where each lives
 *   node tools/dupes.js ember      just that name
 *
 * Run it BEFORE editing anything that looks like a zone method. After editing, ask the game which
 * one actually ran: __BF3.G._scapeTable reports the table the live generator came from.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'public', '3d', 'index.html');
const src = fs.readFileSync(FILE, 'utf8');
const lines = src.split('\n');

/* Which container is a line inside? Top-level `const NAME={` ... `};` blocks. */
const containers = [];
lines.forEach((l, i) => {
  const m = l.match(/^const ([A-Z][A-Z0-9_]*)\s*=\s*\{/);
  if (m) containers.push({ name: m[1], start: i + 1, end: Infinity });
});
for (let i = 0; i < containers.length; i++) {
  const next = containers[i + 1];
  containers[i].end = next ? next.start - 1 : lines.length;
}
const containerAt = (ln) => {
  for (const c of containers) if (ln >= c.start && ln <= c.end) return c.name;
  return '(top level)';
};

/* Method-shorthand definitions two spaces in - which is how every scape is written. */
const defs = {};
lines.forEach((l, i) => {
  const m = l.match(/^  ([a-zA-Z_][\w]*)\s*\(/);
  if (!m) return;
  const name = m[1];
  if (['if', 'for', 'while', 'switch', 'catch', 'return', 'function'].includes(name)) return;
  (defs[name] = defs[name] || []).push({ line: i + 1, where: containerAt(i + 1) });
});

const only = process.argv[2];
const names = Object.keys(defs).filter(n => defs[n].length > 1 && (!only || n === only)).sort();

if (!names.length) { console.log(only ? `"${only}" is defined once (or not at all)` : 'no duplicate definitions'); process.exit(0); }

console.log('DUPLICATED DEFINITIONS — match on the TABLE, never on the name alone\n');
for (const n of names) {
  console.log('  ' + n + '  ×' + defs[n].length);
  for (const d of defs[n]) console.log('      line ' + String(d.line).padStart(6) + '   ' + d.where);
}
console.log('\nAfter an edit, confirm which one ran:  __BF3.G._scapeTable');
