/* Unit tests for the field sweep.

   The point of every test below is the same one audit-passives' tests make: an audit whose only
   assertion is "the audit returns what the audit returns" cannot tell you it ever caught anything.
   So the comment/string/regex cases are asserted to DISAGREE with the naive version that does not
   strip them - if the stripper regressed, a dead field documented in a comment would silently look
   alive, which is the one direction this sweep must never fail in. */
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { auditFields, stripNonCode, literalKeys, lineOf, numericDot } from '../audit-fields.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const GAME = path.join(ROOT, 'public', '3d', 'index.html');

const names = rows => rows.map(r => r.field).sort();

test('a field written and never read is reported; one that is read is not', () => {
  const src = `
    function cast(p){ p.taunt = 6; p.guardT = 3.2; }
    function hurt(p){ if(p.guardT > 0) return 0; return 10; }
  `;
  const r = auditFields(src, 'p');
  assert.deepStrictEqual(names(r.writtenNeverRead), ['taunt']);
});

test('a field read and never written is reported', () => {
  const src = `
    function dmg(p){ var v = 1; if(p.soulStrengthT > 0) v *= 1.1; return v; }
    function tick(p){ p.hp -= 1; return p.hp; }
  `;
  const r = auditFields(src, 'p');
  assert.deepStrictEqual(names(r.readNeverWritten), ['soulStrengthT']);
});

test('compound assignment, ++ and delete all count as writes, not reads', () => {
  const src = `function f(p){ p.a += 1; p.b++; --p.c; delete p.d; p.e ||= 2; }`;
  const r = auditFields(src, 'p');
  assert.deepStrictEqual(names(r.writtenNeverRead), ['a', 'b', 'c', 'd', 'e']);
  assert.deepStrictEqual(r.readNeverWritten, []);
});

test('== and => are not assignments', () => {
  const src = `function f(p){ if(p.a == 1){} if(p.b === 2){} const g = () => p.c; }`;
  const r = auditFields(src, 'p');
  assert.deepStrictEqual(r.writtenNeverRead, []);
  assert.deepStrictEqual(names(r.readNeverWritten), ['a', 'b', 'c']);
});

test('A MENTION IN A COMMENT IS NOT A READER — and the naive version disagrees', () => {
  const src = `
    function cast(p){ p.warcryT = 6; }
    // p.warcryT is read by the enemy AI, or so this comment claims
    /* nothing else reads p.warcryT either */
  `;
  assert.deepStrictEqual(names(auditFields(src, 'p').writtenNeverRead), ['warcryT']);
  /* The naive form: count usages without stripping. It sees three "reads" and calls it wired. */
  const naive = (src.match(/(?<![A-Za-z0-9_$.])p\.warcryT(?!\s*=[^=])/g) || []).length;
  assert.ok(naive > 0, 'the un-stripped version must see the comment mentions — else this proves nothing');
});

test('a mention in a string is not a reader either', () => {
  const src = `function cast(p){ p.marked = 1; addText('p.marked'); }`;
  assert.deepStrictEqual(names(auditFields(src, 'p').writtenNeverRead), ['marked']);
});

test('a regex literal containing quotes does not desync the stripper', () => {
  const src = `
    const re = /['"]|\\/\\//g;
    function cast(p){ p.dead = 1; }
    function read(p){ return p.alive; }
  `;
  const r = auditFields(src, 'p');
  assert.deepStrictEqual(names(r.writtenNeverRead), ['dead']);
  assert.deepStrictEqual(names(r.readNeverWritten), ['alive']);
});

test('division is not mistaken for a regex', () => {
  const src = `function f(p){ const q = p.a / p.b / 2; p.c = q; }`;
  const r = auditFields(src, 'p');
  assert.deepStrictEqual(names(r.writtenNeverRead), ['c']);
  assert.deepStrictEqual(names(r.readNeverWritten), ['a', 'b']);
});

test('template literals keep their ${} code and blank their text', () => {
  const src = 'function f(p){ const s = `hp ${p.hp} of p.max`; p.shown = s; }';
  const r = auditFields(src, 'p');
  assert.deepStrictEqual(names(r.readNeverWritten), ['hp']);
  assert.deepStrictEqual(names(r.writtenNeverRead), ['shown']);
});

/* The second real-game correction, and the one that decides whether the output is usable. The game
   reaches the player by more than one name. */
test('A READER UNDER A DIFFERENT RECEIVER STILL COUNTS — and the receiver-restricted version disagrees', () => {
  const src = `
    function cast(p){ p._headlongT = 0.9; p._deadT = 0.9; }
    function move(G){ if((G.p._headlongT||0) > 0) G.p.x += 1; }
  `;
  const r = auditFields(src, 'p');
  assert.deepStrictEqual(names(r.writtenNeverRead), ['_deadT'],
    '_headlongT is read via G.p and must not be accused');
  /* The version this replaced looked only at `p.<field>`, and there is exactly one such use of
     _headlongT in the source above — the write. So it saw zero readers and called it dead. */
  const restricted = (src.match(/(?<![A-Za-z0-9_$.])p\._headlongT/g) || []).length;
  assert.strictEqual(restricted, 1, 'the restricted form must see only the write — else this proves nothing');
});

/* The third real-game correction, and the third one to fail in the ACCUSING direction. The game
   reaches a SECOND body of the same kind by adding a digit — `e2` beside `e` — and the lookbehind
   that stopped `1.5` reading as a property called `5` made every one of those accesses invisible. */
test('A RECEIVER ENDING IN A DIGIT IS STILL A RECEIVER — and the old lookbehind disagrees', () => {
  const src = `
    function splash(e){ if(!e._iansSplash) for(const e2 of all()){ e2._iansSplash = 1; hit(e2); e2._iansSplash = 0; } }
  `;
  const r = auditFields(src, 'e');
  assert.deepStrictEqual(names(r.readNeverWritten), [],
    '_iansSplash is written twice as e2._iansSplash and must not be accused');
  /* The version this replaced: `(?<![0-9.])` in front of the dot. There are three uses of the field
     in the source above and it can only see the one whose receiver has no digit in it — the read. */
  const old = src.match(/(?<![0-9.])\.\s*_iansSplash/g) || [];
  assert.strictEqual(old.length, 1, 'the old form must see only the read — else this proves nothing');
});

test('a number is still not an object — 1.5 and 1.5.toFixed are rejected', () => {
  assert.strictEqual(numericDot('a = 1.5.toFixed(2)', 'a = 1.5'.length), true);
  assert.strictEqual(numericDot('for(const e2 of x) e2.hp = 1', 'for(const e2 of x) e2'.length), false);
  assert.strictEqual(numericDot('foo().bar', 'foo()'.length), false);   // no token at all
  /* And the widened `*` mode must still not invent a field out of a decimal: `2.5` contributes
     nothing, while the method call on a named value is seen. */
  const rows = names(auditFields(`const q = 2.5; const s = hp.toFixed(1);`, '*').rows);
  assert.deepStrictEqual(rows, ['toFixed']);
});

test('a field built in an object literal is separated out, not accused', () => {
  const src = `const g = { zone: 0 }; function f(G){ return G.zone + G.ghost; }`;
  const r = auditFields(src, 'G');
  assert.deepStrictEqual(names(r.readNeverWritten), ['ghost']);
  assert.deepStrictEqual(names(r.readOnlyButLiteral), ['zone']);
});

test('literalKeys finds keys and not labels of other shapes', () => {
  const k = literalKeys(`{ a: 1, b : 2 }  x ? y : z`);
  assert.ok(k.has('a') && k.has('b'));
});

test('stripNonCode preserves length and line numbers', () => {
  const src = "let a = 1; // c\nlet b = 'xy';\n";
  const out = stripNonCode(src);
  assert.strictEqual(out.length, src.length);
  assert.strictEqual(out.split('\n').length, src.split('\n').length);
});

/* The regression that made the first real-game run untrustworthy. An emoji is two UTF-16 units and
   one code point; splitting by code points shifts every index after it, and the stripper then
   blanks the middle of live code — turning real readers into "written, never read" accusations.
   Asserted on an ASTRAL char specifically, because a BMP-only sample cannot show it. */
test('an emoji does not shift every index after it', () => {
  const src = "const icon = '\u{1F3AE}';\nfunction f(p){ p.dead = 1; }\nfunction g(p){ return p.alive; }\n";
  const out = stripNonCode(src);
  assert.strictEqual(out.length, src.length);
  assert.strictEqual(out.slice(src.indexOf('p.alive'), src.indexOf('p.alive') + 7), 'p.alive');
  const r = auditFields(src, 'p');
  assert.deepStrictEqual(names(r.writtenNeverRead), ['dead']);
  assert.deepStrictEqual(names(r.readNeverWritten), ['alive']);
});

/* The real game. Not an assertion about any particular field - the sweep is a lead generator and
   the plan says so - but it must keep RUNNING against the real file, because a stripper that
   desyncs on a 19,000-line file is the failure mode that matters and a miniature source cannot
   show it. The bar is that the sweep still sees the game's own well-known live fields as both
   written and read. */
/* THE RATCHET, over the four receivers that carry game state. Checked in BOTH directions, for the
   reason passives.test.js gives: a one-directional ratchet stops describing the game the moment
   anything is fixed. A newly dead field fails here; a field that comes back to life must be removed
   from the list or this says so.

   Every entry below was read at its site before being listed, and each carries what it is. Three
   groups, and only one of them is a bug list:
     - already triaged and belonging to Oliver (docs/SKILL_TRIAGE.md sections J and K),
     - inert leftovers sitting beside the field that does the work,
     - level-generator scratch that nothing was ever meant to read back.

   `*` is deliberately NOT ratcheted: the DOM is full of legitimately write-only properties
   (`el.textContent`, `canvas.width`) that the browser reads and this file never does, so the list
   would be noise pretending to be a finding. Run `node harness/audit-fields.js '*'` by hand for the
   widened sweep - that is how the Beastmaster's dead order fields were found. */
const KNOWN_DEAD = {
  p: [
    '_perfectGuard',  // set beside p.bdParryT, which does the parry. Inert leftover, triage "Not listed here".
    '_vanish',        // set beside p.invuln, which does the vanish. Same.
    'siphonT',        // Soul Siphon's "for 4s" half, never implemented. Triage "Not listed here".
    'spinT',          // spellSweep/spinCleave set a spin the renderer never asks for. No card promises it.
    'warcryT',        // Warcry's 6s duration. Section K: there is no aggro model to hold.
  ],
  e: [
    '_mirrorCast',    // Frost Sorcerer phase 2, "A SECOND OF HIM". Announced, never built.
    '_rimFall',       // Awakened King phase 2, "THE EDGE FALLS AWAY". Announced, never built.
    '_taunt',         // Warcry. Section K.
    'petTauntT',      // Alpha Roar, "turns their attention toward your companion". Section K.
    'taunt',          // Paladin's Taunt, "// pull aggro" in its own comment. Section K.
  ],
  G: [
    '_autoCol', '_reachCells', '_reachMoved', '_scapeTable', 'climbs', 'spire', 'terraces', 'vertical',
    // ^ level-generator scratch: written while a scape is built, never read back.
    'sideTaskDone',   // set true when the Thornheart falls; openWay() on the same line does the work.
  ],
  /* EMPTY, AND IT IS THE PROOF. orderX/orderZ/orderT were listed here for exactly one commit: this
     sweep was built to find them, they were the row it found, and petUpdate now reads all three.
     The ratchet's second direction is what closes it — leave them listed and this test fails with
     "no longer dead, so take these out of KNOWN_DEAD". See harness/probes/petorder.probe.js. */
  'G.pet': [],
};

test('no field is written and never read except the ones already triaged', () => {
  const src = readFileSync(GAME, 'utf8');
  for(const recv of Object.keys(KNOWN_DEAD)){
    const found = names(auditFields(src, recv).writtenNeverRead);
    const expected = KNOWN_DEAD[recv].slice().sort();
    const fresh = found.filter(f => !expected.includes(f));
    const revived = expected.filter(f => !found.includes(f));
    assert.deepStrictEqual(fresh, [],
      `${recv}.*: newly dead — written and read by nothing:\n  ` + fresh.join('\n  '));
    assert.deepStrictEqual(revived, [],
      `${recv}.*: no longer dead, so take these out of KNOWN_DEAD:\n  ` + revived.join('\n  '));
  }
});

test('the sweep survives the real game file and still sees its live fields', () => {
  const src = readFileSync(GAME, 'utf8');
  const p = auditFields(src, 'p');
  const byName = new Map(p.rows.map(r => [r.field, r]));
  for(const live of ['hp', 'mana', 'x', 'z', 'invuln']){
    const r = byName.get(live);
    assert.ok(r, `p.${live} not seen at all — the stripper has desynced`);
    assert.ok(r.writes > 0 && r.reads > 0, `p.${live} should be both written and read, got ${JSON.stringify(r)}`);
  }
  /* 171 as of the emoji fix. The pre-fix run reported 208, and 37 of those were fragments of real
     identifiers the desync had cut in half (`weapo`, `shie`, `_caGrac`) — so a HIGHER count here is
     not reassurance, it is the signature of the bug. The floor guards the other direction: a
     stripper that swallows the file reports almost nothing. */
  assert.ok(p.rows.length > 150, `only ${p.rows.length} p.* fields — the stripper has eaten the file`);
});
