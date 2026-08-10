/* Every description here is REAL, read out of the running game via __BF3.curSkills(). Inventing
   plausible-looking ones would test the parser against my idea of the game rather than the game. */
import { test } from 'node:test';
import assert from 'node:assert';
import { claimsOf, conditionOf } from '../claims.js';

test('a plain damage skill', () => {
  assert.deepStrictEqual(claimsOf('Sweeping strike: 2.2x damage in a wide arc'), ['damage']);
});

test('damage plus control', () => {
  assert.deepStrictEqual(claimsOf('Slam the ground: damage + heavy knockback all around').sort(),
                         ['control', 'damage']);
  assert.deepStrictEqual(claimsOf('Rush forward, damaging and stunning enemies in your path').sort(),
                         ['control', 'damage']);
});

test('a buff that mentions damage is NOT a damage claim', () => {
  assert.deepStrictEqual(claimsOf('+35% damage and attack speed for 6s'), ['buff']);
});

test('heal and shield are distinguished, and soaked damage is not dealt damage', () => {
  assert.deepStrictEqual(claimsOf('Restore 40 health to yourself'), ['heal']);
  /* This expectation was originally ['damage','shield'], which was me writing the bug into the
     test: a shield that absorbs 80 damage deals none. */
  assert.deepStrictEqual(claimsOf('Absorb the next 80 damage with a shield'), ['shield']);
});

test('a summon', () => {
  assert.deepStrictEqual(claimsOf('Turn a fresh corpse into a stronger risen fighter'), ['summon']);
});

test('an unparseable description claims nothing rather than guessing', () => {
  assert.deepStrictEqual(claimsOf('A mysterious technique'), []);
  assert.deepStrictEqual(claimsOf(''), []);
  assert.deepStrictEqual(claimsOf(undefined), []);
});

/* Real text from the Necromancer's Bone Wall. The first parser failed this skill twice - once for
   'Raise' (it is a shield, not a summon) and once for 'absorbs damage' (damage soaked, not dealt)
   - while the skill worked perfectly, shield 0 -> 187. Two false failures from one description. */
test('a shield that absorbs damage claims neither summon nor damage', () => {
  assert.deepStrictEqual(claimsOf('Raise a shield of bone that absorbs damage'), ['shield']);
});

test('a real summon still reads as one', () => {
  assert.deepStrictEqual(claimsOf('Raise a skeleton to fight for you').sort(), ['summon']);
});

/* ── THE FIRST FULL RUN'S REPORT, READ BACK ──────────────────────────────────────────────────
   run-all recorded fifteen failing skills. Eleven of them are THIS FILE being wrong, not the game:
   the descriptions below are the exact strings from harness/report.json, and each one names a
   working skill the parser accused. A harness whose first report is 73% noise is a harness whose
   second report nobody opens, so every one of them is pinned here. */

test('an adjective does not turn a raised shield into a summon', () => {
  /* Paladin, Guard Up. The shield worked - 0 -> 239 in the same run that failed it. The old
     pattern allowed `raise a shield` and `raise the shield` but not one word of description in
     between, which is how a skill was reported as summoning nothing while shielding correctly. */
  assert.deepStrictEqual(claimsOf('Raise a holy shield that absorbs damage'), ['shield']);
});

test('"health" is not "heal"', () => {
  /* Warlock, Shadow Bolt. `\bheal` matches the first four letters of "health", so a skill that
     SPENDS your health was recorded as promising to restore it - and it lands its damage
     correctly (100000 -> 99965), so the only thing wrong was the reading. */
  assert.deepStrictEqual(claimsOf('A fast void bolt powered by a sliver of your health'), ['damage']);
});

test('a buff written in words claims no damage, exactly as one written in numbers does not', () => {
  /* Ninja Blade Fury and Berserker Berserk share this text; Monk Stillness is the same promise in
     different words. The rule already existed and only recognised "+35% ... for 6s" - the numeric
     form. The game mostly does not write numbers. */
  assert.deepStrictEqual(claimsOf('+damage and attack speed for a few seconds'), ['buff']);
  assert.deepStrictEqual(claimsOf('Enter a blinding assault: more damage and speed'), ['buff']);
});

test('making something else hit harder is not hitting', () => {
  /* Warlock, Curse Circle: a mark that amplifies your later spells. It was failed for `hit`. */
  assert.deepStrictEqual(claimsOf('Mark nearby foes so your spells hit them harder'), ['buff']);
});

test('commanding the companion you already have is not summoning one', () => {
  /* All four Beastmaster failures were this one word. `companion` is a NOUN naming a pet the class
     starts with; none of these four conjures anything, and three of them measurably do their job -
     Sic 'Em dealt 212, Mend the Pack healed 24, Apex Unleashed did both. The summon rule now wants
     a summoning VERB. */
  assert.deepStrictEqual(claimsOf("Command your companion to lunge, strike, and briefly stun").sort(),
                         ['control', 'damage']);
  assert.deepStrictEqual(claimsOf('Restore your companion and yourself over time'), ['heal']);
  assert.deepStrictEqual(claimsOf('You and your companion pincer the target'), []);
  assert.deepStrictEqual(claimsOf('Unleash your companion at peak strength'), []);
});

/* ── EFFECTS THE BENCH CANNOT PRODUCE ────────────────────────────────────────────────────────
   Separate from what a skill claims: whether this rig could ever SEE it. The dummy is given 100000
   HP on purpose, so nothing dies mid-measurement - which means a skill whose payload fires on the
   target's death can never be observed by it. That is a limit of the bench, and VISION.md is
   explicit that missing data is not a negative finding. */
test('an effect that fires on death is flagged as unobservable, not asserted', () => {
  assert.ok(conditionOf('Mark foes to explode on death'));
  assert.strictEqual(conditionOf('Sweeping strike: 2.2x damage in a wide arc'), null);
  assert.strictEqual(conditionOf('Rush forward, damaging and stunning enemies in your path'), null);
});
