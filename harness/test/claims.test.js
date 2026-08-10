/* Every description here is REAL, read out of the running game via __BF3.curSkills(). Inventing
   plausible-looking ones would test the parser against my idea of the game rather than the game. */
import { test } from 'node:test';
import assert from 'node:assert';
import { claimsOf } from '../claims.js';

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
