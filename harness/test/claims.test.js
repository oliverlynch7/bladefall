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

/* ── The three rows the bench still measures non-deterministically, and why none of them can FAIL. ──
   harness/probes/determinism.probe.js casts all sixteen kits three times in one page and compares the
   MET booleans. After the minion clear in test-skills.js mkDummy, three rows still flip a bit:

     ranger/Hunter's Mark  damage 28, 0, 0
     reaper/Soul Siphon    shield true, false, false
     paladin/Last Stand    damage 10, 0, 10

   In every case the bit that flips is one the parser does not read for that skill, so the verdict is
   stable even though the measurement is not. That is an argument made of these three assertions, and
   an argument like that is worth exactly as much as the test under it - if a later edit to claims.js
   starts reading `shield` out of Soul Siphon's text, this is what says so, instead of a REGRESSION
   arriving one run in three. */
test("the flapping bench rows do not claim the bit that flaps", () => {
  /* Hunter's Mark flaps on DAMAGE and does not claim damage at all: "you deal +18% and +10% crit"
     never says damage, so the buff rule takes it and the damage rule finds no token to match. This
     expectation was written as ['buff','damage'] first, from reading the DEALS gate and forgetting
     that the gate only decides whether an ALREADY-MATCHED damage rule survives. And if a later edit
     does teach the parser to read a promise out of "+18%", the mark keyword still routes it to
     UNPROVEN rather than to FAIL - which is the second assertion. */
  assert.deepStrictEqual(claimsOf('Mark one enemy: you deal +18% and +10% crit to it for 8s.'),
                         ['buff']);
  assert.ok(isIndirectDamage('Mark one enemy: you deal +18% and +10% crit to it for 8s.'));
  /* Soul Siphon flaps on SHIELD. It promises damage and healing, both of which measured identically
     on all three repeats (128 and 24), and it never mentions a shield. */
  assert.deepStrictEqual(claimsOf('Drain nearby enemies for 4s, damaging them and restoring health.').sort(),
                         ['buff', 'damage', 'heal']);
  /* Paladin/Last Stand flaps on DAMAGE. Its text is about damage it does NOT take, and its promise -
     healing - measured 72 on all three repeats. */
  assert.deepStrictEqual(claimsOf('For 4s take almost no damage and heal each second.').sort(),
                         ['buff', 'heal']);
});

test('damage owed by someone else, or owed later, is flagged as indirect', () => {
  assert.ok(isIndirectDamage('Mark foes to explode on death'));                        // Pirate/Cannonade
  assert.ok(isIndirectDamage('Mark nearby foes so your spells hit them harder'));      // Warlock/Curse Circle
  /* A skill that hits NOW must not be excused by this. */
  assert.ok(!isIndirectDamage('Sweeping strike: 2.2x damage in a wide arc'));
  assert.ok(!isIndirectDamage('Rush forward, damaging and stunning enemies in your path'));
});
