/* The probe-reachability audit, and the proof that it can go red.

   The synthetic cases come first and they are the whole reason to believe anything below them: a
   miniature probe that names every door in a COMMENT and calls none, against one that calls them.
   If those two ever agree, the audit has stopped discriminating and its verdict on the real
   directory means nothing. That failure has a direction — a probe looks reachable precisely when
   someone has documented why it is not — so it is asserted rather than assumed.

   The real-directory check is a RATCHET in BOTH directions, the shape passives.test.js and
   fields.test.js already use: a NEW synthetic-only probe fails until it has been read and added,
   and a probe that gains a player door fails until it is taken OFF the list. A one-directional
   ratchet stops describing the harness the moment anything is fixed. */
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditProbe, auditAllProbes, classesNamed, classStyles, rangedClasses,
         KNOWN_SYNTHETIC, PLAYER_DOORS, SYNTHETIC_DOORS } from '../audit-probes.js';
import { stripNonCode } from '../audit-fields.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const GAME = readFileSync(path.join(ROOT, 'public', '3d', 'index.html'), 'utf8');

/* A probe that TALKS about every door and opens none. This is the real shape: overcharge.probe.js's
   header explains at length that it rejected a real swing, in a file that never calls one. */
const ALL_TALK = `
/* This probe deliberately does NOT use playerAttack or useSkill, and presses no input:
   a real swing measures aim and flight time as much as it measures the effect. It takes the
   melee door instead. See hurtPlayer, foeHit and spawnMinion for the other shapes. */
(function(){
  const s = "hitEnemy(e,60,p) is what a sword calls";
  return {note: s};
})()`;

/* The same probe, opening one synthetic door and no player door. */
const SYNTH = `(function(){ __BF3.hitEnemy(e, 60, __BF3.G.p, 0, 0, null); })()`;

/* And one that presses the button. */
const BUTTON = `(function(){ const IN = __BF3.input; IN.attack = true; __BF3.update(1/60); })()`;

test('a door named only in a comment or a string is not a door', () => {
  const r = auditProbe(ALL_TALK, 'all-talk');
  assert.deepEqual(r.synth, {}, 'comments and strings must not count as synthetic doors');
  assert.deepEqual(r.player, {}, 'comments must not count as player doors');
  assert.equal(r.verdict, 'neither');
});

test('THE CONTROL: the same doors in real code DO count', () => {
  /* If this and the test above ever agree, the stripper has eaten the code as well as the prose and
     every 'neither' in the real directory is meaningless. */
  const talk = auditProbe(ALL_TALK, 'a');
  const real = auditProbe(SYNTH, 'b');
  assert.equal(real.synth.hitEnemy, 1);
  assert.equal(real.verdict, 'synthetic-only');
  assert.notDeepEqual(talk.synth, real.synth, 'prose and code must not read the same');
});

test('a pressed button is a player door, and it is reached through __BF3.input', () => {
  const r = auditProbe(BUTTON, 'button');
  assert.equal(r.player.input, 1);
  assert.equal(r.verdict, 'player-door');
});

test('the lookbehind allows a leading dot — __BF3.hitEnemy is the common form', () => {
  /* Measured over harness/probes: 39 `__BF3.hitEnemy(` against 8 bare. A receiver-style lookbehind
     that rejected the dot would have missed five sixths of the doors in this harness and reported
     almost every probe as driving nothing at all. */
  assert.equal(auditProbe(`__BF3.hitEnemy(e,1,p)`, 'x').synth.hitEnemy, 1);
  assert.equal(auditProbe(`hitEnemy(e,1,p)`, 'x').synth.hitEnemy, 1);
  assert.equal(auditProbe(`myHitEnemy(e,1,p)`, 'x').synth.hitEnemy, undefined,
    'an identifier that merely ENDS in a door name is not that door');
});

test('a probe that uses both is mixed, not cleared', () => {
  const r = auditProbe(`__BF3.useSkill(0); __BF3.hitEnemy(e,60,__BF3.G.p);`, 'both');
  assert.equal(r.verdict, 'mixed');
  assert.equal(r.player.useSkill, 1);
  assert.equal(r.synth.hitEnemy, 1);
});

test('the bench class is read off meta.classId', () => {
  assert.deepEqual(classesNamed(`__BF3.meta.classId='warlock'; x.classId = "monk";`),
    ['monk', 'warlock']);
});

test('the class scan reads the RAW source, because the stripper blanks the name', () => {
  /* Watched to fail: with this scan run over the stripped copy — which is where it was first
     written — every probe in the directory came back naming no class at all, because the class name
     is a string literal and stripNonCode blanks string CONTENTS. Transcribed here as the version it
     replaces, and asserted to disagree. */
  const src = `__BF3.meta.classId = 'stormcaller';`;
  const strippedOnly = (stripped => {
    const out = new Set(); const re = /classId\s*=\s*['"]([a-z]+)['"]/g; let m;
    while((m = re.exec(stripped))) out.add(m[1]);
    return [...out];
  })(stripNonCode(src));
  assert.deepEqual(strippedOnly, [], 'the old version could not see a class name at all');
  assert.deepEqual(classesNamed(src), ['stormcaller']);
});

test('a class named only in a comment is still not a class', () => {
  assert.deepEqual(classesNamed(`/* set meta.classId = 'monk' here */ const x = 1;`), []);
});

/* ---- the real game, and the real directory ---- */

test('the ranged set is re-derived from the game, and it is section U nine', () => {
  /* Section U's "nine of the sixteen classes attack at range" is a claim with a date on it. This
     re-measures it off CLASSES every run, so the day a class changes weapon style the sweep's
     blast radius changes with it instead of quoting a day-old sentence. */
  const styles = classStyles(GAME);
  assert.equal(styles.size, 16, `expected 16 classes, parsed ${styles.size}`);
  const ranged = rangedClasses(GAME);
  assert.equal(ranged.length, 9, `expected 9 ranged classes, got ${ranged.length}: ${ranged}`);
  assert.equal(styles.get('warrior'), 'warrior');
  assert.equal(styles.get('stormcaller'), 'mage');
});

test('every probe is classified, and the counts are printed', () => {
  const rows = auditAllProbes();
  assert.ok(rows.length >= 70, `expected the probe directory, got ${rows.length} files`);
  for(const r of rows)
    assert.ok(['synthetic-only', 'mixed', 'player-door', 'neither'].includes(r.verdict));
  const n = v => rows.filter(r => r.verdict === v).length;
  console.log(`  probes: ${rows.length} — ${n('synthetic-only')} synthetic-only, ${n('mixed')} mixed, `
    + `${n('player-door')} player-door, ${n('neither')} neither`);
  const ranged = new Set(rangedClasses(GAME));
  for(const r of rows.filter(r => r.verdict === 'synthetic-only')){
    const rng = r.classes.filter(c => ranged.has(c));
    console.log(`    synthetic-only  ${r.name.padEnd(18)} ${Object.keys(r.synth).join(',')}`
      + `${r.classes.length ? '  [' + r.classes.join(',') + ']' : ''}${rng.length ? '  RANGED:' + rng.join(',') : ''}`);
  }
});

test('RATCHET: no NEW probe drives an effect through a synthetic door alone', () => {
  const now = auditAllProbes().filter(r => r.verdict === 'synthetic-only').map(r => r.name);
  const fresh = now.filter(n => !KNOWN_SYNTHETIC.includes(n));
  assert.deepEqual(fresh, [], `read these against the door the player uses, then add them to `
    + `KNOWN_SYNTHETIC with a row in docs/SKILL_TRIAGE.md section Z: ${fresh.join(', ')}`);
});

test('RATCHET, the other way: a probe that gains a player door leaves the list', () => {
  /* Without this the list quietly stops describing the harness — which is how the passive audit's
     own ratchet was nearly allowed to go stale. */
  const now = auditAllProbes().filter(r => r.verdict === 'synthetic-only').map(r => r.name);
  const stale = KNOWN_SYNTHETIC.filter(n => !now.includes(n));
  assert.deepEqual(stale, [], `these are no longer synthetic-only; remove them from KNOWN_SYNTHETIC: `
    + `${stale.join(', ')}`);
});

test('the door lists are disjoint and non-empty', () => {
  assert.ok(PLAYER_DOORS.length && SYNTHETIC_DOORS.length);
  assert.deepEqual(PLAYER_DOORS.filter(d => SYNTHETIC_DOORS.includes(d)), []);
});
