/* Every description here is REAL, read out of the running game via __BF3.curSkills(). Inventing
   plausible-looking ones would test the parser against my idea of the game rather than the game. */
import { test } from 'node:test';
import assert from 'node:assert';
import { claimsOf, isIndirectDamage } from '../claims.js';

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

/* ── The eleven below are the false failures the first full gate run produced. Each description is
   real, copied out of harness/report.json, and each one accused a skill that works. ── */

test('a buff with no number in it is still a buff, not a damage skill', () => {
  /* Ninja/Blade Fury and Berserker/Berserk, word for word. The old rule needed a digit. */
  assert.deepStrictEqual(claimsOf('+damage and attack speed for a few seconds'), ['buff']);
  /* Monk/Stillness. */
  assert.deepStrictEqual(claimsOf('Enter a blinding assault: more damage and speed'), ['buff']);
});

test('HEALTH is not HEAL', () => {
  /* Warlock/Shadow Bolt. It SPENDS health; it was failed for not restoring any. */
  assert.deepStrictEqual(claimsOf('A fast void bolt powered by a sliver of your health'), ['damage']);
});

test('a raised shield is a shield however many adjectives it has', () => {
  /* Paladin/Guard Up. "Raise a shield of bone" already passed; one adjective broke it. */
  assert.deepStrictEqual(claimsOf('Raise a holy shield that absorbs damage'), ['shield']);
});

test('commanding a companion is not summoning one', () => {
  /* All four Beastmaster commands. Checked against the game: nothing here creates a pet. */
  assert.deepStrictEqual(claimsOf("Command your companion to lunge, strike, and briefly stun").sort(),
                         ['control', 'damage']);
  assert.deepStrictEqual(claimsOf('You and your companion pincer the target'), []);
  assert.deepStrictEqual(claimsOf('Unleash your companion at peak strength'), []);
  assert.deepStrictEqual(claimsOf('Restore your companion and yourself over time'), ['heal']);
});

test('a healing STAT in a buff is not a heal cast', () => {
  assert.deepStrictEqual(claimsOf('For 8s your companion gains +35% damage/healing, +30% speed'),
                         ['buff']);
});

test('damage owed by someone else, or owed later, is flagged as indirect', () => {
  assert.ok(isIndirectDamage('Mark foes to explode on death'));                        // Pirate/Cannonade
  assert.ok(isIndirectDamage('Mark nearby foes so your spells hit them harder'));      // Warlock/Curse Circle
  /* A skill that hits NOW must not be excused by this. */
  assert.ok(!isIndirectDamage('Sweeping strike: 2.2x damage in a wide arc'));
  assert.ok(!isIndirectDamage('Rush forward, damaging and stunning enemies in your path'));
});
