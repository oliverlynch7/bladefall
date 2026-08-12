/* Unit tests for the kit audit — which classes run the same skill under a different name.

   Every case below either asserts the audit DISAGREES with the naive version of itself, or is a
   ratchet over the real game. That is the rule the rest of this directory follows and the reason
   for it is written out in passives.test.js: an audit whose only assertion is "the audit returns
   what the audit returns" cannot tell you it ever caught anything.

   The two alias cases are not hypothetical. Both are in the shipped file, and the first version of
   audit-kits.js got the second one wrong and reported nine fixed skills as broken. */
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditKits, kitsOf, fxBindings } from '../audit-kits.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = readFileSync(path.join(ROOT, 'public', '3d', 'index.html'), 'utf8');

const wrap = (fx, cards) => `
const CLASS2={
  ${cards}
};
const SKILL_FX={
  base(p){ return 1; },
  other(p){ return 2; },
};
${fx}
`;
/* One rank, one option, so nothing shares a handler by accident of the fixture. */
const CARD = (cls, id, name, fx, d) =>
  `${cls}:{disp:'${cls}', r2:{kind:'skill',slot:0,a:{id:'${id}',n:'${name}',cd:5,role:'X',fx:'${fx}',d:'${d}'}}}`;

test('two classes aliased to one function are reported as sharing it', () => {
  const src = wrap(`SKILL_FX.a_hit=SKILL_FX.base; SKILL_FX.b_hit=SKILL_FX.base;`,
    [CARD('warrior', 'a_hit', 'Smash', 'a_hit', 'Smash it.'),
     CARD('monk', 'b_hit', 'Palm', 'b_hit', 'Palm it.')].join(',\n  '));
  const r = auditKits(src);
  assert.deepStrictEqual(r.keys, ['base:monk+warrior']);
  assert.strictEqual(r.dead.length, 0);
});

test('two cards in the SAME class sharing a function are not reported — the question is cross-class', () => {
  const src = wrap(`SKILL_FX.a_hit=SKILL_FX.base; SKILL_FX.a_hit2=SKILL_FX.base;`,
    `warrior:{disp:'W',
       r2:{kind:'skill',slot:0,a:{id:'a_hit',n:'Smash',cd:5,role:'X',fx:'a_hit',d:'Smash it.'}},
       r4:{kind:'skill',slot:1,a:{id:'a_hit2',n:'Bash',cd:5,role:'X',fx:'a_hit2',d:'Bash it.'}}}`);
  const r = auditKits(src);
  assert.strictEqual(r.cards.length, 2, 'both cards parsed');
  assert.deepStrictEqual(r.keys, [], 'one class reusing its own handler is not the question');
});

/* THE FIRST REAL CASE. `SKILL_FX.nin_fury = SKILL_FX.w_berserk` runs at index.html:10281 and
   `SKILL_FX.w_berserk = function...` REPLACES w_berserk at 19271. Assignment copies the value, so
   the Warrior's Warcry runs the new function and the Ninja's Blade Fury still runs the old one.
   They are NOT the same skill, and a resolver that follows the alias by NAME says they are. */
test('AN ALIAS DOES NOT FOLLOW A LATER REDEFINITION — and the follow-by-name version disagrees', () => {
  const src = wrap(
    `SKILL_FX.old_one=SKILL_FX.base; SKILL_FX.copy=SKILL_FX.old_one; SKILL_FX.old_one=function(p){ return 9; };`,
    [CARD('warrior', 'old_one', 'New', 'old_one', 'The rewritten one.'),
     CARD('ninja', 'copy', 'Copy', 'copy', 'The one that kept the old body.')].join(',\n  '));
  const r = auditKits(src);
  assert.deepStrictEqual(r.keys, [], 'the two cards must NOT be grouped: they hold different functions');

  const bind = fxBindings(src);
  assert.notStrictEqual(bind.get('old_one').root, bind.get('copy').root,
    'old_one was redefined; copy kept the value it had at the time');
  assert.strictEqual(bind.get('copy').root, 'base');
});

/* THE SECOND REAL CASE, and the one that broke the first version of this file. Section A of
   docs/SKILL_TRIAGE.md was repaired at index.html:10520-10530 with `X = X || Y` re-run below the
   definitions. Read only the first operand and all nine repaired skills come back dead. */
test('AN `A = A || B` REPAIR IS FOLLOWED — and the first-operand-only version disagrees', () => {
  /* `late` is aliased before it exists, so it stores undefined; the repair line then fills it. */
  const src = wrap(
    `SKILL_FX.early=SKILL_FX.late; SKILL_FX.late=SKILL_FX.base; SKILL_FX.early=SKILL_FX.early||SKILL_FX.late;`,
    CARD('ninja', 'early', 'Step', 'early', 'Dashes.'));
  const r = auditKits(src);
  assert.deepStrictEqual(r.dead, [], 'the repair line gives `early` a real handler');
  assert.strictEqual(fxBindings(src).get('early').root, 'base');

  /* The version this replaced took the first SKILL_FX member after the `=` and stopped. On the
     repair line that is `early` itself, still holding undefined — so it stayed dead. */
  const naiveFirst = /SKILL_FX\.early\s*=\s*SKILL_FX\.([A-Za-z0-9_]+)/g;
  const firstOperands = [...src.matchAll(naiveFirst)].map(m => m[1]);
  assert.deepStrictEqual(firstOperands, ['late', 'early'],
    'the last repair line self-references — else this test cannot show the bug was real');
});

test('an alias evaluated before its source exists is reported as a DEAD handler', () => {
  const src = wrap(`SKILL_FX.tooEarly=SKILL_FX.definedLater; SKILL_FX.definedLater=function(p){ return 3; };`,
    CARD('ninja', 'tooEarly', 'Ghost', 'tooEarly', 'Does nothing at all.'));
  const r = auditKits(src);
  assert.deepStrictEqual(r.dead.map(d => d.id), ['tooEarly']);
});

test('an assignment written inside a COMMENT is not an assignment', () => {
  const src = wrap(`/* the fix would be SKILL_FX.ghost=SKILL_FX.base; */ SKILL_FX.real=SKILL_FX.base;`,
    [CARD('warrior', 'real', 'Real', 'real', 'Real.'),
     CARD('monk', 'ghost', 'Ghost', 'ghost', 'Ghost.')].join(',\n  '));
  const r = auditKits(src);
  assert.deepStrictEqual(r.dead.map(d => d.id), ['ghost'],
    'the commented-out alias must not wire the ghost card');
});

/* These handlers are full of nested object literals — `G.projectiles.push({owner:'player',dmg:…})`.
   A flat key scan of the SKILL_FX literal registers every one of those as a handler, and an alias
   naming one would then RESOLVE: a skill with no handler reported as wired. That is the accusing
   direction inverted, and it is how section A survived for months. */
test('A NESTED OBJECT KEY IS NOT A HANDLER — and the flat-scan version disagrees', () => {
  const src = `
const CLASS2={
  ninja:{disp:'N', r2:{kind:'skill',slot:0,a:{id:'copy',n:'Copy',cd:5,role:'X',fx:'copy',d:'Nothing.'}}}
};
const SKILL_FX={
  base(p){ G.projectiles.push({owner:'player', ghost:1, dmg:4}); },
};
SKILL_FX.copy=SKILL_FX.ghost;
`;
  assert.deepStrictEqual(auditKits(src).dead.map(d => d.id), ['copy'],
    '`ghost` exists only inside base()\'s body and must not wire anything');

  /* The flat scan this replaced. If it did not see `ghost` as a key, this test proves nothing. */
  const flat = [...src.matchAll(/(?:^|[{,\n])\s*([A-Za-z0-9_]+)\s*(?::|\()/g)].map(m => m[1]);
  assert.ok(flat.includes('ghost'), 'the flat scan must pick up the nested key — else this proves nothing');
});

test('a card whose name needs double quotes is still read', () => {
  const src = wrap(`SKILL_FX.a_hit=SKILL_FX.base; SKILL_FX.b_hit=SKILL_FX.base;`,
    [`warrior:{disp:'W', r2:{kind:'skill',slot:0,a:{id:'a_hit',n:"Hunter's Blow",cd:5,role:'X',fx:'a_hit',d:'Hits.'}}}`,
     CARD('monk', 'b_hit', 'Palm', 'b_hit', 'Palm it.')].join(',\n  '));
  const names = kitsOf(src).map(c => c.name);
  assert.ok(names.includes("Hunter's Blow"), `parsed ${JSON.stringify(names)}`);
});

/* ---- the real game ---- */

/* THE RATCHET. Sixteen classes are built out of three cores, so a shared handler is not a fault by
   itself - AUTOPILOT.md's class philosophy says every class IS a variant of one. What must not
   happen quietly is the number GOING UP: a new class wired by aliasing an existing kit is precisely
   the "stat-reskin of another" docs/VISION.md calls a failed class, and it would otherwise land
   with nothing to say so.
   Checked in BOTH directions, for passives.test.js's reason: a group that stops being shared has to
   come off this list or the list stops describing the game.
   Each key is `<handler>:<the classes sharing it>`. The full table with every card's own
   description, and which of them promise things the shared handler does not do, is in
   docs/SKILL_TRIAGE.md section Q. */
const KNOWN_SHARED = [
  'barrier:chronomancer+mage+necromancer+paladin+stormcaller',
  'berserk:berserker+ninja',
  'blink:chronomancer+mage+stormcaller',
  'bolt:chronomancer+mage+necromancer+stormcaller',
  'bulwark:berserker+paladin+warrior',
  'cleave:monk+warrior',
  'deadeye:pirate+ranger',
  'deathmark:pirate+ranger',
  'execute:berserker+warrior',
  'm_beam:chronomancer+mage+stormcaller',
  'm_gravity:chronomancer+mage+necromancer+stormcaller',
  'm_overload:chronomancer+mage+stormcaller',
  'mark:ninja+ranger',
  'nova:chronomancer+mage+monk+necromancer+paladin+stormcaller',
  'r_spike:pirate+ranger',
  'shadowstep:ninja+reaper',
  'shadowstrike:ninja+pirate+ranger',
  'smokebomb:ninja+pirate+ranger',
  'stomp:berserker+monk+paladin+warrior',
  'tumble:monk+pirate+ranger',
  'volley:pirate+ranger',
  'w_bash:monk+paladin+warrior',
  'w_whirl:monk+paladin+warrior',
];

test('no class kit shares a handler with another that was not already known to', () => {
  const r = auditKits(SRC);
  const fresh = r.keys.filter(k => !KNOWN_SHARED.includes(k));
  const gone = KNOWN_SHARED.filter(k => !r.keys.includes(k));
  assert.deepStrictEqual(fresh, [],
    'a kit now runs another class\'s skill — VISION.md priority #2. Look at it, then list it here.');
  assert.deepStrictEqual(gone, [],
    'these no longer share a handler — take them out of KNOWN_SHARED');
});

test('NO CARD IN THE GAME HAS A HANDLER THAT HOLDS UNDEFINED — section A, statically', () => {
  /* Nine did (necro_grip, nin_step, st_lance, st_orb, st_overload, pir_spike, chr_beam,
     chr_gravity, chr_overload) and each spent its mana and cooldown and did nothing. That fault was
     only catchable by CASTING the skill until now; this asserts it in milliseconds, so the repair
     at index.html:10520-10530 cannot silently come undone. */
  const r = auditKits(SRC);
  assert.deepStrictEqual(
    r.dead.map(d => `${d.cls}/${d.name} (fx '${d.fx}')`), [],
    'this card spends its cooldown and calls undefined');
});

test('the real game still parses at all', () => {
  const r = auditKits(SRC);
  const inShared = r.shared.reduce((n, g) => n + g.cards.length, 0);
  console.log(`kits: ${r.cards.length} cards, ${r.groups.length} distinct handlers, ` +
              `${r.shared.length} groups shared across classes covering ${inShared} cards, ` +
              `${r.dead.length} dead`);
  /* Sixteen classes carry four SKILL ranks of two options. Asserted as the arithmetic rather than
     as a floor, for the reason passives.test.js now states: a `>=` floor is how four passives went
     missing there for the whole life of that audit. */
  const per = {};
  for(const c of r.cards) per[c.cls] = (per[c.cls] || 0) + 1;
  assert.deepStrictEqual(Object.keys(per).filter(c => per[c] !== 8).map(c => `${c}:${per[c]}`), []);
  assert.strictEqual(r.cards.length, 128, `16 classes x 4 skill ranks x 2 options = 128, parsed ${r.cards.length}`);
});
