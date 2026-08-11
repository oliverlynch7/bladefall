/* The passive audit, and the proof that it can go red.

   Every assertion in this harness has to have been WATCHED to fail before it is believed - two have
   shipped here that could not (the multiplayer probe that asserted on its own assignment, and the
   geometric audit that passed an unwalkable tower). So the synthetic cases below come first: a
   miniature CLASS2 with one wired passive and one dead one, run through the same auditPassives()
   the real game goes through. If those two ever agree with each other, the audit has stopped
   discriminating and nothing it says about the real file means anything.

   The real-game check is a RATCHET, not a pass/fail. A dead passive found today is recorded in
   KNOWN_DEAD with the reason, and the test fails only on a passive that is dead and NOT on that
   list. That is the same direction run-all.js's baseline moves in and for the same reason: a
   newly-broken passive must be loud, while the backlog of already-known ones belongs in
   docs/SKILL_TRIAGE.md where it can be worked one commit at a time - not wedged in front of the
   gate where it blocks every unrelated fix. */
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditPassives, passivesOf, readerSource } from '../audit-passives.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = readFileSync(path.join(ROOT, 'public', '3d', 'index.html'), 'utf8');

/* A miniature of the real file's shape: CLASS2 with a passive rank, a PASSIVE_ART icon table that
   names BOTH passives, and one line of game code that reads only one of them. */
const FAKE = `
const CLASS2={
  warrior:{disp:'Warrior',
    r3:{kind:'passive',a:{id:'t_live',n:'Live One',role:'X',d:'This one is read.'},b:{id:'t_dead',n:'Dead One',role:'X',d:'This one is not.'}},
    r4:{kind:'skill',slot:1,a:{id:'t_skill',n:'A Skill',cd:8,role:'X',fx:'w_bash',d:'Hits things.'},b:{id:'t_skill2',n:'Another',cd:8,role:'X',fx:'w_bash',d:'Hits things.'}}
  }
};
const PASSIVE_ART={
  t_live:'warrior-live-one', t_dead:'warrior-dead-one'
};
function damage(p){ if(c2Passive('t_live')) return 2; return 1; }
`;

test('the audit finds a passive that nothing outside the choice menu reads', () => {
  const r = auditPassives(FAKE);
  assert.deepStrictEqual(r.dead.map(d => d.id), ['t_dead']);
});

test('and does NOT accuse the one that is read — the two cases must disagree', () => {
  const r = auditPassives(FAKE);
  const live = r.rows.find(x => x.id === 't_live');
  assert.ok(live && live.wired, 't_live is read by damage() and must be reported wired');
  assert.strictEqual(live.readers, 1);
});

test('PASSIVE_ART does not count as a reader, or every passive looks wired forever', () => {
  /* The icon table names both ids. If it were searched, t_dead would come back wired and this
     whole audit would be a green light incapable of going red. */
  const blanked = readerSource(FAKE);
  assert.ok(!blanked.includes('warrior-dead-one'), 'PASSIVE_ART must be blanked out of the search');
  assert.ok(blanked.includes("c2Passive('t_live')"), 'real game code must survive blanking');
});

test('CLASS2 itself does not count as a reader — a definition is not a use', () => {
  const blanked = readerSource(FAKE);
  assert.ok(!blanked.includes('Dead One'), 'CLASS2 must be blanked out of the search');
});

test('only kind:passive entries are audited, never the skills beside them', () => {
  const ids = passivesOf(FAKE).map(p => p.id);
  assert.deepStrictEqual(ids.sort(), ['t_dead', 't_live']);
});

test('every passive is attributed to its class and rank', () => {
  const p = passivesOf(FAKE).find(x => x.id === 't_dead');
  assert.strictEqual(p.cls, 'warrior');
  assert.strictEqual(p.rank, 'r3');
});

/* ---- the real game ---- */

/* THE 46 PASSIVES THAT ARE OFFERED, DESCRIBED, AND THEN NEVER CONSULTED, measured 2026-08-10 on
   the shipped file. Not one of these ids appears anywhere in public/ outside CLASS2 and the
   PASSIVE_ART icon table - checked across every .js and .html under public/, not just index.html,
   in case a passive was read by the 3D layer.

   Eleven of the sixteen classes are affected: the Stormcaller has seven dead of eight, the Monk,
   Pirate and Ranger six each, the Berserker five. Warrior, mage, ninja, warlock and beastmaster
   have none. The per-class counts are printed on every run below rather than written down here,
   because a comment cannot be wrong about a number it does not contain.

   This list shrinking is the deliverable. Each row worked through sub-project B Task 2, one commit
   at a time, comes out of this Set - and a passive going dead that is NOT on it fails the gate
   immediately, which is the point of recording it here rather than only in a document. */
const KNOWN_DEAD = new Set([
  'r_longshot', 'r_closeq', 'r_escape', 'r_ambush', 'r_elem', 'r_bounty',
  'x_strength', 'x_crimson',
  'pal_burn', 'pal_bounce', 'pal_blessed',
  'necro_wither', 'necro_plague', 'necro_pest',
  'bsk_heavy', 'bsk_reckless', 'bsk_thick', 'bsk_blood', 'bsk_tough',
  'pir_deadly', 'pir_tough', 'pir_swagger', 'pir_evasive', 'pir_luck', 'pir_greed',
  'chr_potent', 'chr_slow', 'chr_echo', 'chr_freeze',
  'mon_iron', 'mon_fire', 'mon_flow', 'mon_killer', 'mon_still', 'mon_master',
  /* st_ward came off this list 2026-08-11 — Storm Ward now grants its 4% shield in useSkill,
     proven by harness/probes/ward.probe.js, which was watched to fail against the unfixed game. */
  'st_conductor', 'st_overcharge', 'st_charged', 'st_amped', 'st_master', 'st_galvanize',
  'sky_high', 'sky_eye', 'sky_armor',
  'bd_flow',
]);

test('the known-dead list is exactly what the game currently has, in both directions', () => {
  /* A one-directional ratchet rots: a passive that gets WIRED must leave this list, or the list
     stops describing the game and the next reader believes a fixed passive is still broken. */
  const r = auditPassives(SRC);
  const dead = new Set(r.dead.map(d => d.id));
  const stale = [...KNOWN_DEAD].filter(id => !dead.has(id));
  assert.deepStrictEqual(stale, [],
    'these are wired now — take them out of KNOWN_DEAD and tick their row in docs/SKILL_TRIAGE.md');
});

test('the real game still has passives to audit at all', () => {
  const r = auditPassives(SRC);
  /* Printed on every gate run, pass or fail. A ratchet that only speaks when it breaks lets a
     number drift for weeks; this one says where it stands each time. */
  console.log(`passives: ${r.total} total, ${r.total - r.dead.length} wired, ${r.dead.length} dead`);
  const per = {};
  for(const row of r.rows){ per[row.cls] = per[row.cls] || { n: 0, dead: 0 }; per[row.cls].n++; if(!row.wired) per[row.cls].dead++; }
  console.log('  by class: ' + Object.keys(per).map(c => `${c} ${per[c].dead}/${per[c].n}`).join(', '));
  /* A parser that quietly stops matching would report zero dead and look like success. Sixteen
     classes carry four passive ranks of two options, so the floor is well above any plausible
     partial parse. */
  assert.ok(r.total >= 100, `expected 100+ passives in CLASS2, parsed ${r.total}`);
});

test('no passive is dead that was not already known to be', () => {
  const r = auditPassives(SRC);
  const fresh = r.dead.filter(d => !KNOWN_DEAD.has(d.id));
  assert.deepStrictEqual(
    fresh.map(d => `${d.cls}/${d.name} (${d.id}) — "${d.desc}"`), [],
    'a passive is offered, described and then never read by any game code');
});
