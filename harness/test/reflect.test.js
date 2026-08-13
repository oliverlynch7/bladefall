/* A WIRING PROVEN THROUGH A CALL THE GAME NEVER MAKES.

   This is the second time this sub-project has found one (section U was the first, section W the
   second) and it is the shape neither of the two audits can see. `harness/audit-passives.js` asks
   whether anything READS a passive's id and says wired. `harness/audit-skills.js` asks whether the
   card has a handler and says built. Both were right about Bounce Back and the Monk's Stillness
   capstone: the code existed, ran, and returned damage to a `{name, attack}` descriptor, because
   `hurtPlayer`'s `by` is a descriptor at every damage site in the game and `by && !by.dead` is a
   test a descriptor passes completely.

   What a launch proves is that it works TODAY. These assertions are what stops it being undone,
   and they are static so they run in run-all.js's fast stage before any GPU time is spent.

   Deliberately NOT a transcription of the game's logic. Section W's own write-up records a probe
   going stale the same day it was written by copying a game structure; a test that re-implements
   `attackerOf` would be the same mistake with a longer half-life. These assert the SHAPE — that the
   body is carried, and that neither reader reaches past the resolver — and nothing about arithmetic. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameSource } from '../audit-skills.js';

const SRC = gameSource();

/* The line every named damage source in the game goes through. Its `src` is the entire fix: without
   it the two readers below have nobody to return damage to, and both go silent rather than wrong —
   which is why this is the assertion that matters most and the one a merge is most likely to lose. */
test('foeHit carries the body it names', () => {
  const m = SRC.match(/function foeHit\(e,\s*atk\)\s*\{[^}]*\}/);
  assert.ok(m, 'foeHit should still be one line and findable');
  assert.match(m[0], /\bsrc\s*:\s*e\b/,
    'foeHit must return the enemy beside the words — docs/SKILL_TRIAGE.md section W');
});

/* `hp != null` is the whole check: a `{name, attack}` pair has no hp and can never satisfy it. The
   danger is not that this line disappears, it is that it grows an unconditional `|| by`, which is
   the exact fall-back the section W patch forbids and the exact behaviour of the shipped bug. */
test('the attacker resolver exists and tests for a body, not for truthiness', () => {
  const m = SRC.match(/function canBeHitBack\([^)]*\)\s*\{[^}]*\}/);
  assert.ok(m, 'canBeHitBack should exist');
  assert.match(m[0], /\.hp\s*!=\s*null/, 'a descriptor is refused by having no hp, nothing else');
  assert.match(m[0], /!\w+\.dead/, 'a corpse must still be refused');
  assert.ok(/function attackerOf\([^)]*\)\s*\{[^}]*canBeHitBack\([^)]*\.src\)/.test(SRC),
    'attackerOf must look in .src first');
});

/* THE REGRESSION THIS FILE EXISTS FOR. Both readers used to hand `by` straight to hitEnemy. Either
   one written that way again is the shipped bug back, and it would pass every other suite here:
   the passive is wired, the capstone is built, the floater appears, and nothing is hit. */
/* Anchored by index rather than by a block-shaped regex. The first version of this test matched on
   indentation and closing braces, which is a fact about the formatter and not about the game — it
   failed against the correct code, which is the direction that wastes a run rather than the one
   that ships a bug, but a test nothing can distinguish from a broken one is not worth keeping. */
const around = (needle, n) => {
  const i = SRC.indexOf(needle);
  assert.ok(i > 0, `${needle} should still be findable in the game source`);
  return SRC.slice(i, i + n);
};

test('neither reflect reader hands hitEnemy the descriptor it was given', () => {
  const readers = [
    ["the Monk's Stillness capstone", '_stillnessT||0)>0'],
    ["the Paladin's Bounce Back",     "c2Passive('pal_bounce')"],
  ];
  for(const [what, anchor] of readers){
    const block = around(anchor, 500);
    assert.doesNotMatch(block, /hitEnemy\(\s*by\b/,
      `${what} must not reflect onto hurtPlayer's descriptor — that IS section W`);
    assert.match(block, /attackerOf\(\s*by\s*\)/,
      `${what} must resolve the attacker first`);
  }
});

/* The half that made this worse than a dead passive: the player was told BOUNCED on every blocked
   hit while nothing was returned to anybody. A floater outside the guard is a lie the player can
   see, so it is asserted separately from the damage. */
test('neither reflect floater fires outside the resolved-attacker guard', () => {
  for(const [what, word] of [['Bounce Back', 'BOUNCED'], ['Stillness', 'RETURNED']]){
    const i = SRC.indexOf(`'${word}'`);
    assert.ok(i > 0, `the ${what} floater should still exist`);
    /* The announcement must be DOWNSTREAM of the resolution, and close to it. 300 characters back
       covers the `if(_atk){ try{ hitEnemy(...); addText(...) }` block and stops well short of the
       neighbouring passive either way, so this cannot pass on somebody else's guard. */
    const before = SRC.slice(Math.max(0, i - 300), i);
    assert.match(before, /if\(\s*_atk\s*\)/,
      `the ${what} floater must sit inside the resolved-attacker guard — telling the player it ` +
      `worked while returning nothing to nobody is the half that made this worse than a dead passive`);
  }
});

/* A GUARD NOTHING CAN TELL APART FROM ITS ABSENCE IS NOT A GUARD, so the shipped bug is transcribed
   and every assertion above is asserted to REJECT it. This is the one place transcription is safe
   and the harness's own idiom for it (`claims.test.js`, `skills-population.test.js`): the text below
   is a HISTORICAL shape — the code as it stood at `1217d25` — and a historical shape cannot go
   stale the way a copy of live code does.

   Without this the four tests above are five green ticks that would have stayed green through the
   entire life of the bug they exist to catch. */
const SHIPPED_BUG = String.raw`
function foeHit(e,atk){ return {name:foeName(e), attack:atk||'a strike'}; }
  if((G.p._stillnessT||0)>0 && Math.abs(G.p.vx||0)+Math.abs(G.p.vz||0) < 6 && by && !by.dead){
    try{ hitEnemy(by, Math.round(dmg*2), G.p, 120, 0, null);
         addText(G.p.x,G.p.y+40,G.p.z,'RETURNED','#ffe6ad'); }catch(e){}
  }
    if(meta.classId==='paladin'&&c2Passive('pal_bounce')&&by&&typeof by==='object'&&!by.dead&&_blocked>=1){
      try{ hitEnemy(by,Math.round(_blocked),p,0,0,null);
           addText(p.x,p.y+46,p.z,'BOUNCED','#ffe6ad'); }catch(e){}
    }
    (G.projectiles=G.projectiles||[]).push({owner:'enemy',srcName:botName(e),foeBot:null,x:e.x});
`;

test('the shipped bug, transcribed, fails every assertion above', () => {
  const foe = SHIPPED_BUG.match(/function foeHit\(e,\s*atk\)\s*\{[^}]*\}/);
  assert.ok(foe, 'the transcription should still hold a foeHit');
  assert.doesNotMatch(foe[0], /\bsrc\s*:\s*e\b/, 'the old foeHit carried no body — that was the bug');

  for(const anchor of ['_stillnessT||0)>0', "c2Passive('pal_bounce')"]){
    const block = SHIPPED_BUG.slice(SHIPPED_BUG.indexOf(anchor), SHIPPED_BUG.indexOf(anchor) + 500);
    assert.match(block, /hitEnemy\(\s*by\b/, 'the old readers hit the descriptor directly');
    assert.doesNotMatch(block, /attackerOf\(\s*by\s*\)/, 'and resolved nothing first');
  }

  for(const word of ['BOUNCED', 'RETURNED']){
    const i = SHIPPED_BUG.indexOf(`'${word}'`);
    assert.doesNotMatch(SHIPPED_BUG.slice(Math.max(0, i - 300), i), /if\(\s*_atk\s*\)/,
      `the old ${word} floater fired whether or not anything was hit`);
  }

  const shots = [...SHIPPED_BUG.matchAll(/\{owner:'enemy',srcName:[^\n]*/g)].map(m => m[0]);
  assert.equal(shots.length, 1, 'the transcription should hold one projectile spawn');
  assert.ok(!/\bsrc\s*:\s*e\b/.test(shots[0]), 'which named its shooter and did not carry it');
});

/* Enemy projectiles are the other door — an archer's arrow reaches hurtPlayer through a literal
   built at the impact site, not through foeHit, so the body has to be carried on the shot itself.
   Asserted by count rather than by line number: those drift, and three of the four are bot kits
   that a multiplayer change is quite likely to touch. */
test('every enemy projectile that carries a name also carries its shooter', () => {
  const shots = [...SRC.matchAll(/\{owner:'enemy',srcName:[^\n]*/g)].map(m => m[0]);
  assert.ok(shots.length >= 4, `expected the game's enemy projectile spawns; found ${shots.length}`);
  const nameless = shots.filter(s => !/\bsrc\s*:\s*e\b/.test(s));
  assert.deepEqual(nameless, [],
    'an enemy shot that names its shooter must carry it too, or nothing can be returned to it');
});
