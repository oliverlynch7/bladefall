/* THE BENCH MUST NOT BE ABLE TO QUIETLY COVER LESS OF THE GAME THAN IT DID YESTERDAY.

   test-skills.js cast 64 of the game's 128 active skills for its whole life and reported
   `skills: 70 pass, 3 fail` while doing it. Nothing was broken; nothing anywhere stated how many
   skills the game HAS, so nothing could notice. A suite cannot report a skill it never looked at,
   which makes a coverage regression the one kind this harness had no way to see.

   These assertions state the population. They cost no launch and run in the fast stage. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { skillsOf, auditSkills, gameSource } from '../audit-skills.js';

const SRC = gameSource();

test('the game holds 128 active skills — 16 classes x 4 skill ranks x 2 options', () => {
  const r = auditSkills(SRC);
  assert.equal(r.classes, 16, 'CLASS2 should define sixteen classes');
  assert.equal(r.total, 128, `expected 16 x 4 x 2; got ${r.total}`);
});

/* PER CLASS AS WELL AS IN TOTAL, and that is pass 30's lesson rather than belt-and-braces: an
   aggregate floor cannot tell a parser that lost four entries from one that never had them, and the
   neighbouring audit lost exactly four for exactly that reason. */
test('every class carries eight skill options, at ranks 2/4/6/8', () => {
  const r = auditSkills(SRC);
  const bad = r.perClass.filter(c => c.count !== 8);
  assert.deepEqual(bad, [], `classes with the wrong number of skill options: ${JSON.stringify(bad)}`);
  for(const c of r.perClass)
    assert.deepEqual(c.ranks, ['r2', 'r4', 'r6', 'r8'], `${c.cls} has skill ranks ${c.ranks}`);
});

/* THE APOSTROPHE HAZARD, asserted rather than hoped for. `passivesOf` required single quotes on
   `n:` and skipped four passives in silence for months; the skill table has the same shape and at
   least two such entries. The old single-quote-only pattern is transcribed and asserted to DISAGREE,
   because a guard nothing can tell apart from its absence is not a guard. */
test("a skill whose name needs double quotes is still parsed — and the single-quote-only version is not", () => {
  const named = skillsOf(SRC).filter(s => /'/.test(s.name));
  assert.ok(named.length >= 2, `expected apostrophe-carrying skill names; got ${named.map(s => s.name)}`);
  assert.ok(named.some(s => s.name === "Sic 'Em"), "the beastmaster's Sic 'Em must be in the table");

  const ONLY_SINGLE = /id:\s*'([A-Za-z0-9_]+)'[^}]*?n:\s*'([^']*)'[^}]*?fx:\s*'([A-Za-z0-9_]+)'/g;
  const sample = `{id:'bst_sic',n:"Sic 'Em",cd:6,role:'Command',fx:'bst_sic',d:'Order it in.'}`;
  assert.equal([...sample.matchAll(ONLY_SINGLE)].length, 0,
               'the old pattern must MISS this entry — that was the bug on the passive side');
  const Q = String.raw`(?:'([^']*)'|"([^"]*)")`;
  const BOTH = new RegExp(String.raw`id:\s*'([A-Za-z0-9_]+)'[^}]*?n:\s*${Q}[^}]*?fx:\s*'([A-Za-z0-9_]+)'`, 'g');
  assert.equal([...sample.matchAll(BOTH)].length, 1, 'the current one must catch it');
});

/* Every option a player can be handed must have the four things the bench reads off it. A row
   missing `fx` casts nothing; a row missing `d` promises nothing and is silently counted as a pass
   by claimsOf, which is the quietest way for a skill to stop being checked. */
test('every skill option carries an id, a name, a handler id and a description', () => {
  const thin = skillsOf(SRC).filter(s => !s.id || !s.name || !s.fx || !s.desc);
  assert.deepEqual(thin, [], `skill options missing a field: ${JSON.stringify(thin)}`);
});
