/* Unit tests for the save-schema checker.

   THE BAR THIS FILE HAS TO CLEAR is the one harness/test/fields.test.js sets next door: an audit
   whose only assertion is "the audit returns what the audit returns" cannot tell you it ever caught
   anything. So every mechanical test below is asserted to DISAGREE with the version that gets it
   wrong, and the wrong version is not invented for the occasion - each one is a mistake the
   prototype of this module actually made, or a shortcut it actually took.

   And the real acceptance criterion is not a green tick on HEAD. It is the four-revision run:
   `unpersisted()` must be RED at the commit that shipped the Ian's Blade save bug, GREEN at the
   commit that fixed it, and silent about it on both sides. A save checker that has never been
   watched changing its mind on real history is worth nothing, because the failure it exists to
   catch is invisible in exactly the session that introduces it. */
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { unpersisted, unrestored, fieldList, writtenFields, restoredFields,
         braceBody, topLevelKeys } from '../save-fields.js';
import { stripNonCode } from '../audit-fields.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const GAME = path.join(ROOT, 'public', '3d', 'index.html');

/* A miniature of the real file's save shape: two whitelists, a defaults literal, a hand-written
   loadMode. Small enough to reason about, same shapes as index.html:1060-1149. */
const FIXTURE = `
const GLOBAL_FIELDS=['soundOn','achievements','cosEquipped'];
const MODE_FIELDS=['gold','iansShards'];
const meta=Object.assign({
  soundOn:true,achievements:{},gold:0,iansShards:[],cosEquipped:{cape:null,trail:null,glow:null}
},_g);
function persist(){ }
function loadMode(m){ const mv=loadJSON(MKEY(m))||{};
  meta.gold=mv.gold||0;
  meta.iansShards=Array.isArray(mv.iansShards)?mv.iansShards:[];
}
function wipeMode(m){ meta.gold=0; }
`;

test('the fixture is clean — both assertions agree a correct save schema is correct', () => {
  assert.deepStrictEqual(unpersisted(FIXTURE), []);
  assert.deepStrictEqual(unrestored(FIXTURE), []);
});

/* ---- A1: written, never saved ---- */

test('a field written to meta and on neither list is reported', () => {
  const src = FIXTURE.replace('function persist(){ }',
    'function delveDie(){ meta.delveBest=Math.max(0,1); persist(); }');
  assert.deepStrictEqual(unpersisted(src), ['delveBest']);
});

test('THE PROTOTYPE BUG: the lists must come from RAW source, or every field looks unsaved', () => {
  /* stripNonCode blanks the CONTENTS of string literals while keeping their quotes, and the two
     whitelists are nothing but string literals. So reading them from the stripped copy does not
     fail loudly with an empty list - it returns the right NUMBER of names, all of them blank:
     ['    ', '          ']. Every real field name then misses the set, and the checker reports the
     entire save as unpersisted. That is what the first version of this module did, on all 99 of
     them. A checker that flags everything is worth exactly what one that flags nothing is worth. */
  assert.deepStrictEqual(fieldList(FIXTURE, 'MODE_FIELDS'), ['gold', 'iansShards']);
  const fromStripped = fieldList(stripNonCode(FIXTURE), 'MODE_FIELDS');
  assert.strictEqual(fromStripped.length, 2, 'the same number of entries — that is why it is quiet');
  assert.ok(fromStripped.every(n => !n.trim()),
    'every name from the stripped copy must be blank — else this test proves nothing about the bug');
  /* And the consequence, spelled out: reading them from stripped source accuses the whole save. */
  const on = new Set([...fieldList(stripNonCode(FIXTURE), 'GLOBAL_FIELDS'), ...fromStripped]);
  const naive = [...writtenFields(FIXTURE)].filter(f => !on.has(f) && !f.startsWith('_')).sort();
  assert.deepStrictEqual(naive, ['achievements', 'cosEquipped', 'gold', 'iansShards', 'soundOn'],
    'the naive version must accuse every field in the fixture');
  assert.deepStrictEqual(unpersisted(FIXTURE), [], 'while the real one says the fixture is clean');
});

test('A MENTION IN A COMMENT OR A STRING IS NOT A WRITE — and the un-stripped version disagrees', () => {
  const src = FIXTURE + `
    // meta.ghostField = 1 is what this used to do
    function toast(){ addText('meta.otherGhost = 2'); }
  `;
  assert.deepStrictEqual(unpersisted(src), [],
    'prose and toast strings must not invent save fields');
  /* The control: a regex over RAW source sees both, which is what counting without stripping does. */
  const naive = [...src.matchAll(/\bmeta\.([A-Za-z_$][\w$]*)\s*=(?![=>])/g)].map(m => m[1]);
  assert.ok(naive.includes('ghostField') && naive.includes('otherGhost'),
    'the un-stripped version must see the comment and the string — else this proves nothing');
});

test('== and === are comparisons, not writes', () => {
  const src = FIXTURE.replace('function persist(){ }',
    'function f(){ if(meta.ghostA==1){} if(meta.ghostB===2){} }');
  assert.deepStrictEqual(unpersisted(src), []);
});

test('compound assignment and ++ are writes', () => {
  const src = FIXTURE.replace('function persist(){ }',
    'function f(){ meta.ghostA+=1; meta.ghostB++; meta.ghostC||=3; }');
  assert.deepStrictEqual(unpersisted(src), ['ghostA', 'ghostB', 'ghostC']);
});

test('the defaults literal counts as a write, but only its TOP-LEVEL keys', () => {
  /* cosEquipped:{cape,trail,glow} declares ONE save field. A walker that did not track depth would
     report three phantom fields called cape/trail/glow, none of which the save has. */
  const written = writtenFields(FIXTURE);
  assert.ok(written.has('cosEquipped'), 'the defaults block must contribute its keys');
  for(const phantom of ['cape', 'trail', 'glow'])
    assert.ok(!written.has(phantom), `nested key ${phantom} must not become a save field`);
  /* The control, so the assertion above is not vacuous: a depth-blind scan does see them. */
  const flat = [...FIXTURE.matchAll(/([A-Za-z_$][\w$]*)\s*:/g)].map(m => m[1]);
  assert.ok(flat.includes('cape'), 'a depth-blind scan must see `cape` — else this proves nothing');
});

test('a field added to a list stops being reported — the fix direction works', () => {
  const broken = FIXTURE.replace('function persist(){ }', 'function f(){ meta.tut=meta.tut||{}; }');
  assert.deepStrictEqual(unpersisted(broken), ['tut']);
  const fixed = broken.replace("'achievements',", "'achievements','tut',");
  assert.deepStrictEqual(unpersisted(fixed), []);
});

/* ---- A2: saved, never restored ---- */

test('a MODE_FIELDS name loadMode never reads back is reported', () => {
  const src = FIXTURE.replace('  meta.iansShards=Array.isArray(mv.iansShards)?mv.iansShards:[];\n', '');
  assert.deepStrictEqual(unrestored(src), ['iansShards']);
});

test('BRACE MATCHING, NOT "UP TO THE NEXT FUNCTION" — the shortcut credits a stranger\'s code', () => {
  /* The prototype delimited loadMode with /function loadMode\(m\)\{([\s\S]*?)\nfunction wipeMode/.
     `[\s\S]*?` crosses newlines, so that capture does not stop at loadMode's closing brace - it runs
     to whatever precedes `function wipeMode`, swallowing every function in between. Any `meta.x =`
     in one of THOSE is then counted as "restored on load".

     This is the silent-green direction, which is the one a checker must never fail in: the field is
     not restored, and the shortcut says it is. So the delimiter is counted braces instead.

     The fixture below is the real shape - loadMode no longer restores iansShards, and an unrelated
     function that happens to touch meta.iansShards sits between loadMode and wipeMode. */
  const broken = FIXTURE
    .replace('  meta.iansShards=Array.isArray(mv.iansShards)?mv.iansShards:[];\n', '')
    .replace('function wipeMode(m){ meta.gold=0; }',
             'function grantShard(i){ meta.iansShards=(meta.iansShards||[]).concat(i); }\n' +
             'function wipeMode(m){ meta.gold=0; }');
  assert.deepStrictEqual(unrestored(broken), ['iansShards'],
    'brace matching must see that loadMode itself never restores it');
  /* The control: the regex the brace matcher replaced reaches past loadMode, finds grantShard\'s
     assignment, and concludes the field comes home. */
  const loose = /function loadMode\(m\)\{([\s\S]*?)\nfunction wipeMode/.exec(broken);
  assert.ok(loose, 'the old delimiter still matches — it just matches too much');
  assert.ok(/meta\.iansShards\s*=/.test(loose[1]),
    'the loose capture must swallow grantShard — else this test proves nothing');
});

test('braceBody stops at the matching brace, not the first one', () => {
  assert.strictEqual(braceBody('f(){ a; { b; } c; } tail', 3), ' a; { b; } c; ');
  assert.strictEqual(braceBody('f(){ unbalanced', 3), null);   // no guess
});

test('topLevelKeys ignores keys nested in arrays and calls', () => {
  assert.deepStrictEqual(topLevelKeys('a:1,b:[{c:2}],d:f({e:3}),g:4'), ['a', 'b', 'd', 'g']);
});

/* ---- the real game ---- */

test('the checker survives the real file and finds both lists and loadMode', () => {
  const raw = readFileSync(GAME, 'utf8');
  /* FLOORS, not exact counts. An exact count fails the day someone correctly ADDS a save field,
     which is the one behaviour this whole file is trying to encourage. A floor still catches the
     failure that matters - an extractor that has desynced and is finding a truncated list or none
     at all - and it is safe in the other direction because measured over all 669 revisions of
     index.html neither whitelist has ever lost an entry. Raise them when they grow. */
  assert.ok(fieldList(raw, 'GLOBAL_FIELDS').length >= 56, 'GLOBAL_FIELDS has shrunk or is unreadable');
  assert.ok(fieldList(raw, 'MODE_FIELDS').length >= 39, 'MODE_FIELDS has shrunk or is unreadable');
  const written = writtenFields(raw);
  assert.ok(written.size > 90, `only ${written.size} written meta fields — the stripper has eaten the file`);
  /* Fields everyone knows are saved must be seen as both written and listed. If these ever show up
     in the A1 list, the checker has desynced rather than found five hundred bugs. */
  for(const live of ['gold', 'zoneMax', 'stash', 'petOwned', 'achievements', 'unlockedSkins'])
    assert.ok(written.has(live), `meta.${live} not seen as written — the checker has desynced`);
  const back = restoredFields(raw);
  assert.ok(back.size > 30, `loadMode restores only ${back.size} fields — brace matching has desynced`);
});

/* THE RATCHET, both directions, for the reason passives.test.js gives: a one-directional ratchet
   stops describing the game the moment anything is fixed.

   EVERY ENTRY HERE IS A LIVE BUG, not a triaged exception. Each is a field the code assigns and
   then immediately calls persist()/persistGlobal() on, so in every case the author believed it was
   saved. They are listed rather than fixed because fixing them is a gameplay decision (what a
   "best" should mean across New Game+, whether a cheat toggle should outlive a session) and this
   task was to build the test, not to change the save format. Fix one and this test tells you to
   take it off the list. */
const KNOWN_UNSAVED = [
  'delveBest',      // 14631: the Endless Dungeon's only record. delveDie() sets it, prints
                    // "Best: floor N" on the death screen, and it is 0 again next launch.
                    // NOT the same field as endlessBest (the Abyssal Descent), which IS saved.
  'ptRevive',       // 15876: cheat-menu free-revive toggle, reverts on reload.
  'sprintBest',     // 7661: Treasure Sprint best time, same shape as delveBest.
  'taughtOffclass', // 2328: the "one-time" off-class weapon modal, therefore not one-time.
  'tut',            // 4472 + 10107: the .dash and .skill tutorial gates, so both tutorials
                    // re-fire every single session.
];

test('no meta field is written and never saved, except the ones already known', () => {
  const raw = readFileSync(GAME, 'utf8');
  const found = unpersisted(raw);
  const fresh = found.filter(f => !KNOWN_UNSAVED.includes(f));
  const fixed = KNOWN_UNSAVED.filter(f => !found.includes(f));
  assert.deepStrictEqual(fresh, [],
    'NEW save bug — these are written to meta and persist() will never store them:\n  ' + fresh.join('\n  '));
  assert.deepStrictEqual(fixed, [],
    'now saved, so take these out of KNOWN_UNSAVED:\n  ' + fixed.join('\n  '));
});

test('every MODE_FIELDS name is read back by loadMode', () => {
  /* Measured green on all 662 revisions of index.html that have a split save, so this has never
     caught anything and a red from it is news. It is kept because it is the exact mirror of the
     Ian's Blade bug — one line added to the list, one line forgotten in loadMode — and because it
     costs nothing to run. */
  assert.deepStrictEqual(unrestored(readFileSync(GAME, 'utf8')), [],
    'these are written to disk by persist() and never read back on load');
});

/* THE ACCEPTANCE CRITERION. Not "is HEAD green" — HEAD is red, deliberately, and a checker can be
   red for bad reasons. This asks whether the checker changes its mind at exactly the two commits
   where the game did, and stays silent about the field on both sides of them.

   84d11b8  "Ian's Blade: full Blade Shard questline" — adds meta.iansShards/iansComplete, writes
            them with persist(), never adds them to MODE_FIELDS. Message: "Verified live
            end-to-end". Every shard a player found was lost on reload.
   a8446dc  "Drillmaster's Seal" — a DIFFERENT feature, whose diff quietly adds both names to
            MODE_FIELDS. index.html:1143 still carries the comment: "(was not persisted before)".

   If git history is unavailable this test FAILS rather than skips. A save checker that silently
   stops verifying itself is the thing this file exists to prevent. */
test('RED at the commit that shipped the Ian\'s Blade save bug, GREEN at the commit that fixed it', () => {
  const at = rev => {
    const raw = execFileSync('git', ['-C', ROOT, 'show', rev + ':public/3d/index.html'],
                             { encoding: 'utf8', maxBuffer: 1 << 28 });
    return unpersisted(raw);
  };
  const IANS = ['iansComplete', 'iansShards'];
  const has = list => IANS.filter(f => list.includes(f));

  assert.deepStrictEqual(has(at('84d11b8^')), [], 'before the questline: the fields do not exist yet');
  assert.deepStrictEqual(has(at('84d11b8')), IANS, 'the bug commit must be RED on both fields');
  assert.deepStrictEqual(has(at('a8446dc^')), IANS, 'still red on the commit before the fix');
  assert.deepStrictEqual(has(at('a8446dc')), [], 'the fix commit must be GREEN on both fields');

  /* And the checker must not simply be answering "red" to everything: the two fields it was silent
     about at 84d11b8^ are the ones it stays silent about throughout. */
  assert.deepStrictEqual(at('84d11b8^'), ['sprintBest', 'tut']);
  assert.deepStrictEqual(at('a8446dc'), ['sprintBest', 'tut']);
});
