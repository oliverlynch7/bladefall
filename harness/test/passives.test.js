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

/* A NAME WITH AN APOSTROPHE IN IT HAS TO BE WRITTEN IN DOUBLE QUOTES, and four of the game's
   passives are: "Death's Favor", "Guardian's Will", "Predator's Rhythm", "Alpha's Authority". The
   entry regex required single quotes on both `n:` and `d:`, so it skipped all four in silence -
   the audit reported 124 where CLASS2 holds 128, and the KNOWN_DEAD ratchet below could not see
   them at all. */
const FAKE_APOS = `
const CLASS2={
  reaper:{disp:'Reaper',
    r9:{kind:'passive',a:{id:'t_plain',n:'Plain Name',role:'X',d:'Single quoted.'},b:{id:'t_apos',n:"Death's Favor",role:'X',d:'Also single quoted.'}}
  }
};
const PASSIVE_ART={ t_plain:'a', t_apos:'b' };
function f(p){ if(c2Passive('t_apos')) return 1; }
`;

test('A PASSIVE WHOSE NAME NEEDS DOUBLE QUOTES IS STILL PARSED — and the single-quote-only version disagrees', () => {
  const ids = passivesOf(FAKE_APOS).map(p => p.id).sort();
  assert.deepStrictEqual(ids, ['t_apos', 't_plain']);
  const apos = passivesOf(FAKE_APOS).find(p => p.id === 't_apos');
  assert.strictEqual(apos.name, "Death's Favor");
  assert.strictEqual(apos.desc, 'Also single quoted.');

  /* The version this replaced, transcribed. If it still found t_apos this test would prove nothing
     — the bug has to be reproducible here or the fix is unfalsifiable. */
  const OLD = /id:\s*'([A-Za-z0-9_]+)'[^}]*?n:\s*'([^']*)'[^}]*?d:\s*'([^']*)'/g;
  const oldIds = [...FAKE_APOS.matchAll(OLD)].map(m => m[1]);
  assert.deepStrictEqual(oldIds, ['t_plain'],
    'the old regex must miss t_apos — else this test cannot show the bug was real');
});

test('a double-quoted passive that nothing reads is still ACCUSED, not silently skipped', () => {
  /* The direction that matters. Skipping an entry does not merely under-count: it removes a passive
     from the audit's reach entirely, so one going dead would leave the gate green. */
  const src = FAKE_APOS.replace("c2Passive('t_apos')", "c2Passive('t_plain')");   // move the reader
  const r = auditPassives(src);
  assert.deepStrictEqual(r.dead.map(d => d.id), ['t_apos']);
  /* And the base fixture accuses the other one, so the two cases discriminate. */
  assert.deepStrictEqual(auditPassives(FAKE_APOS).dead.map(d => d.id), ['t_plain']);
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
  /* r_ambush came OFF this list on 2026-08-11 (sub-project B Task 2, pass 11): "after Tumble/
     Shadowstrike, next click within 3s +20% (once per 6s)" is now armed by those two handlers and
     spent in CLASS_BASIC.ranger, proven by harness/probes/ambush.probe.js — all six strikes 115
     before, 138/115/115 against a 115/115/115 control after. */
  /* r_bounty came OFF this list on 2026-08-11 (sub-project B Task 2, pass 13): "marked enemies deal
     −8% to you; killing one heals 4% HP and gives +10% gold" is now read in three places, one per
     clause — hurtPlayer for the −8%, c2OnKill for the heal, and the kill's own purse in killEnemy
     for the +10%. Proven by harness/probes/bounty.probe.js, which measures all three against an
     UNMARKED foe inside the same half and carries its own known-bad: 623/623 damage, 0/0 heal and
     550/550 gold on the control, against 573/623, 19/0 and 605/550 on the passive. */
  'r_longshot', 'r_closeq', 'r_escape', 'r_elem',
  /* x_strength came OFF this list on 2026-08-11 (sub-project B Task 2, pass 12): "souls you collect
     are spent on your next skill, making it free" is now armed on a kill in c2OnKill - which the
     branch's own comment had already said it would be - and spent in useSkill, where the cast is
     charged to the soul instead of to the pool. Proven by harness/probes/soulfree.probe.js: three
     trials per half, all six identical before, 0 / full price / casts-on-an-empty-bar after. */
  /* x_crimson came OFF this list on 2026-08-11 (sub-project B Task 2, pass 17): "below half health,
     every soul you collect heals you outright" is now a kill rider in c2OnKill beside x_strength and
     x_armor, gated on the card's own `p.hp < effMaxHp(p)*.5`, healing the Void Scythe harvest's own
     Math.max(3, round(effMaxHp*0.05)) - the only other line in the file that answers this card's
     sentence. Proven by harness/probes/crimson.probe.js, TWO kills per half (one below half health,
     one above): control 0/0, passive 24 then 0, known-bad 0/0, on a 477 HP hero. */
  /* pal_bounce came OFF this list on 2026-08-11 (sub-project B Task 2, pass 7): "damage you block is
     returned to whoever dealt it" now returns the 60% the brace eats, through the same hitEnemy(by,…)
     the monk's Stillness uses four lines above it. Proven by harness/probes/bounce.probe.js. */
  /* pal_burn came OFF this list on 2026-08-11 (sub-project B Task 2, pass 15): "killing your Sworn
     target sets every enemy near it alight" is now a kill rider in c2OnKill, conditioned on p._oath
     being the enemy that died, spreading through applyElement at igniteBurn's own 120+r combustion
     radius and at the dying target's own stDmg. Proven by harness/probes/palburn.probe.js, which puts
     an UNSWORN kill and an out-of-radius foe in every half as controls: nothing lit anywhere in the
     control or the known-bad half; 1 stack, heat 1293 and 139 HP burned off the Sworn target's
     neighbour in the passive half, with the unsworn cluster and the far foe untouched.
     THE FIRST WIRING PASSED A STACK-COUNT BAR AND BURNED NOTHING: applyElement's buildup scales with
     the weapon's swing speed and the paladin's own starter yields 0.95 of a stack, which
     statusTick's Math.floor takes to zero DoT. Measured at `lit 0.95 / lost 0` before the stack was
     topped to the whole one the combustion splash hands over. */
  /* pal_blessed came OFF this list on 2026-08-11 (sub-project B Task 2, pass 19), and it was the
     PALADIN'S LAST DEAD PASSIVE - the class joins reaper, warrior, mage, ninja, warlock and
     beastmaster at 0/7. "Your oath can be sworn at any range - mark without closing" is now read in
     playerAttack, right after the aim snap: the oath already existed and was already sworn by
     CLASS_BASIC.paladin, which hitEnemy calls only when a swing CONNECTS, so the card changes
     exactly one thing about it and states that thing itself. The reach is Infinity because the
     card's own word is "any"; the targeting is the game's own aimTarget with the RANGED profile, so
     the foe must still be inside the 90 degree sight cone with an unobstructed line - "without
     closing" is about distance, not about marking through walls or behind your back.
     Proven by harness/probes/blessed.probe.js, THREE trials per half: a foe at 600 units (against a
     198-unit melee aim reach) sworn only in the passive half, the same foe placed BEHIND the player
     sworn in no half, and a melee hit through hitEnemy sworn in every half so the control's zero is
     a real zero rather than a bench that cannot see an oath at all. `hurt:false` throughout - the
     swing never landed. */
  'necro_wither', 'necro_plague', 'necro_pest',
  /* bsk_thick came OFF this list on 2026-08-11 (sub-project B Task 2, pass 5): "damage that would
     drop you below 1 HP leaves you at 1 instead, once per fight" is now a death save in hurtPlayer
     beside necro_undying and Rewind, proven by harness/probes/thickhide.probe.js — four trials in one
     launch, watched to fail against the shipped game. */
  /* bsk_heavy came OFF this list on 2026-08-11 (sub-project B Task 2, pass 20), and it is the first
     row in the section with NO NUMBER on either side. "You cannot dodge - but nothing can knock you
     back or stagger you" is two booleans over mechanisms that already run on every player: the
     knock-away in hurtPlayer (which is also the stagger - the file has no separate stagger state)
     now skips for a Heavy Hands berserker, and the input.dodgeEdge gate refuses. Both halves had to
     go in together or picking the card would be a strict upgrade.
     Proven by harness/probes/heavyhands.probe.js, THREE halves in one launch and THREE trials per
     half: control and known-bad thrown at the game's own vz 210 / vy 160 with the dodge firing;
     the passive half vz 0, vy 0, onGround true, dodge refused - and hpLost 6 in ALL THREE, because
     an early return out of hurtPlayer would have read as knockback immunity and been damage
     immunity. The dodge button is photographed reading unavailable at dodgeCd 0
     (_shot/out/heavy-hud.png). */
  'bsk_reckless', 'bsk_blood', 'bsk_tough',
  /* pir_deadly came OFF this list on 2026-08-11 (sub-project B Task 2, pass 21), the FIRST of the
     Pirate's six. "The pistol pierces every enemy in a line" is now one value in fireProjectile:
     pierce is already a projectile field, already spent one body at a time in the projectile step,
     and the flintlock already ships with pierce:2 (which carries a shot through exactly three). The
     card names its own value - "every" - and 99 is this file's OWN constant for that, used verbatim
     by the thrown scythe, the hurled axe and the longbow's power arrow. Gated on the flintlock
     rather than on the class, because the card says THE PISTOL.
     Proven by harness/probes/deadaim.probe.js, FIVE bodies in a line and three halves in one launch:
     control and known-bad stop at 3 of 5 with pierce spent to 0, the passive half takes all 5 with
     pierce 99 -> 94. The probe's own first two runs returned 4 of 5 and it was NOT the passive - the
     shot was sinking below the last body, and the path trace proved it by showing pierce still at 96
     when it stopped connecting. The line now starts 400 units out so the aim solve flies flat. */
  /* pir_swagger came OFF this list on 2026-08-11 (sub-project B Task 2, pass 23): "while your pistol
     is loaded you move noticeably faster" is now one clause in effSpeed beside the Dread Captain step
     it borrows its 1.10 from, conditioned on the `_loaded` flag the class already keeps and Cutthroat
     already reads. Proven by harness/probes/swagger.probe.js on DISTANCE WALKED rather than on
     effSpeed - the card promises movement - with the pistol emptied and reloaded by the game's own
     paths: six walks of 245.4-245.8 before, 270.21 loaded against 245.85 spent after (ratio 1.099)
     while the control and the known-bad stayed at 0.998 and 0.999. */
  /* pir_evasive came OFF this list on 2026-08-11 (sub-project B Task 2, pass 24): "firing the pistol
     pushes you back out of melee range" is now armed in CLASS_BASIC.pirate, on the shot itself, past
     the Cutthroat guard so a pierced line still shoves you once. The shove is the pirate's own Roll
     verbatim (0.22s at the dash speed of 560 = ~123 units, against the game's own melee reach of 88)
     on its OWN timer rather than on dodgeTimer, which eight damage tests read as "this body is
     dodging" — reusing that field would have been an i-frame the card never promised.
     Proven by harness/probes/slippery.probe.js, THREE halves in one launch with TWO shots per half
     (loaded then spent, because "firing the pistol" is the condition and a passive that shoved on
     every swing would clear a loaded-only bar): all six shots moved 0 before; after, the loaded shot
     moved 139.4 and cleared the reach while the spent one moved 0, the control and the known-bad
     staying at 0 throughout, and dodgeCdT never spent. */
  'pir_tough', 'pir_luck', 'pir_greed',
  /* chr_potent came OFF this list on 2026-08-11 (sub-project B Task 2, pass 9): "rewinding also
     restores the mana you had three seconds ago" is now read in the Rewind death save beside its two
     already-wired siblings chr_ward and chr_haste, and the ring it reads from records mana at last.
     Proven by harness/probes/chrpotent.probe.js — `past: null` on both halves before, the whole pool
     back on the potent half after. */
  /* chr_echo came OFF this list on 2026-08-11 (sub-project B Task 2, pass 18): "your last skill fires
     again, by itself, three seconds later" is now armed in useSkill past the refund check and fired
     from class2Innate. The mechanism is the mage's Echo of the Weave twelve lines up, the delay is the
     card's own 3s, and the power is the skill's own s.am unreduced - the mage's card says "weaker",
     this one does not. Proven by harness/probes/echo.probe.js, which measures TWO windows on one
     dummy: cast 80 in every half, second window 0 / 0 / 80, and the echo's 80 is the cast's own. */
  'chr_slow', 'chr_freeze',
  /* mon_flow came OFF this list on 2026-08-11 (sub-project B Task 2, pass 8): "each hit shortens your
     dodge twice as much" now doubles the monk innate's own 0.35 in CLASS_BASIC.monk, proven by
     harness/probes/monkflow.probe.js — ratio 1 before, exactly 2 after. */
  /* mon_killer came OFF this list on 2026-08-11 (sub-project B Task 2, pass 10): "the first strike
     after a dodge hits for triple" is now armed at the dodge itself beside w_tactical and spent in
     CLASS_BASIC.monk, proven by harness/probes/monkiller.probe.js — ratio 1.009 on both strikes of
     both halves before, exactly 3 then exactly 1 after. */
  /* mon_master came OFF this list on 2026-08-11 (sub-project B Task 2, pass 22): "every fourth
     unbroken strike hits everything around you" is now read in hitEnemy, one line ABOVE the monk's
     Focus refresh — which is where it has to be, because "unbroken" is read off the pre-hit focusT
     that the next line overwrites. Its splash is Whirl Kick's own reach and knockback and Soul
     Tether's own re-entrant loop, so no radius and no damage figure had to be chosen. Proven by
     harness/probes/monkmaster.probe.js: THREE halves in one launch, four strikes then a
     game-driven chain break then two more — neighbour 0/0/0/127 and far 0 in the passive half, all
     zeroes in the control and the known-bad, and nothing after the break. */
  'mon_iron', 'mon_fire', 'mon_still',
  /* st_ward came OFF this list on 2026-08-11 (sub-project B Task 2, pass 4): "casting a skill
     grants a shield equal to 4% max HP" is now read in useSkill next to its three identical twins,
     proven by harness/probes/stward.probe.js failing before and passing after. */
  /* st_overcharge came OFF this list on 2026-08-12 (sub-project B Task 2, pass 37): "your lightning
     arcs to a third enemy as well as a second" is now read in CLASS_BASIC.stormcaller, the basic
     hook that has BEEN the chain since 96cd511 (2026-08-03). docs/SKILL_TRIAGE.md section E filed
     this passive and its five siblings as blocked on a mechanic that does not exist — that was read
     off the SKILL table and missed the hook, so the blocker was stale rather than real. Nothing was
     invented: two arcs is the card's own count, and the 260 radius, the 34% and the shock element
     are the hook's own. Proven by harness/probes/overcharge.probe.js, three halves in one launch
     with four neighbours at four distances: every half arced to exactly ONE body before; after, the
     passive half takes the two NEAREST (26 and 26) while the third at 200 and the far one at 900
     stay untouched, and the control and known-bad still arc once. */
  /* st_charged came OFF this list on 2026-08-12 (sub-project B Task 2, pass 38): "your chain jumps
     twice as far between targets" is now read in the same hook, where the jump distance had been the
     bare literal 260. Both numbers are already the file's. Proven by harness/probes/charged.probe.js,
     three halves in one launch with a body at 400 (past the shipped reach, inside a doubled one) and
     another at 700 (past both): nothing at 400 in any half before; after, the passive half strikes it
     for 26 while 700 stays untouched and the control and known-bad still reach nothing. */
  'st_conductor', 'st_amped', 'st_master', 'st_galvanize',
  /* sky_eye came OFF this list on 2026-08-11 (sub-project B Task 2, pass 14): "attacking while
     falling drives you down onto the target" is now read in CLASS_BASIC.skylancer, where it TRADES
     the innate's hang for Dive Strike's own drive (520 along the heading, vy floored at -360), aimed
     at the target rather than at the yaw. Proven by harness/probes/skyeye.probe.js — two strikes per
     half, one falling and one rising: all three halves vy −100 → −55 with no heading before; −360 at
     aim exactly 1.0 on the passive half after, while the control and the rising strikes stayed put
     and all four damage readings were 168. */
  /* sky_armor came OFF this list on 2026-08-11 (sub-project B Task 2, pass 16): "nothing can hit you
     in the first moment after a jump" is now read in the jump handler itself (12820), where it grants
     the player's own i-frame window — 0.18, the dodge's own, taken verbatim from fourteen lines below
     — through `p.invuln`, the single field hurtPlayer already returns on. Proven by
     harness/probes/skyarmor.probe.js, which measures TWO hits per half from two fresh jumps: the
     control took 62 early and 62 late, the passive half 0 early (invuln 0.18) and 62 late, so the
     window opens AND closes. */
  'sky_high',
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
     partial parse.

     THE FLOOR WAS `>= 100` AND THAT IS HOW FOUR PASSIVES WENT MISSING FOR THE WHOLE LIFE OF THIS
     AUDIT. The comment above already states the arithmetic - 16 x 4 x 2 = 128 - and the assertion
     under it accepted 124. So it is the arithmetic that is asserted now, and PER CLASS as well as
     in total: an aggregate floor cannot tell a parser that lost four entries from one that never
     had them, while `every class has exactly eight` fails the moment any single tree stops
     parsing. If a class is ever given a fifth passive rank, this is meant to fail and be updated
     deliberately. */
  const wrong = Object.keys(per).filter(c => per[c].n !== 8).map(c => `${c}:${per[c].n}`);
  assert.deepStrictEqual(wrong, [], 'every class carries four passive ranks of two options');
  assert.strictEqual(Object.keys(per).length, 16, 'sixteen classes must be parsed');
  assert.strictEqual(r.total, 128, `16 classes x 4 ranks x 2 options = 128, parsed ${r.total}`);
});

test('no passive is dead that was not already known to be', () => {
  const r = auditPassives(SRC);
  const fresh = r.dead.filter(d => !KNOWN_DEAD.has(d.id));
  assert.deepStrictEqual(
    fresh.map(d => `${d.cls}/${d.name} (${d.id}) — "${d.desc}"`), [],
    'a passive is offered, described and then never read by any game code');
});
