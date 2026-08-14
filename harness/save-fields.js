/* DOES THE GAME ACTUALLY SAVE WHAT IT THINKS IT SAVES?

   A save in this game is two localStorage keys and two whitelists. `persistGlobal()` (index.html
   :1102) writes only the names in GLOBAL_FIELDS; `persist()` (1104) calls it and then writes only
   the names in MODE_FIELDS. Nothing else ever calls setItem on a save key. So:

     A FIELD NOT ON A LIST IS NOT SAVED, NO MATTER HOW MANY TIMES THE CODE CALLS persist() NEXT TO IT.

   That sentence is the whole bug class, and it has shipped. Commit 84d11b8 (2026-07-21, "Ian's
   Blade: full Blade Shard questline") added `meta.iansShards` and `meta.iansComplete`, wrote them
   with `meta.iansShards.push(idx); persist();`, and never added either name to MODE_FIELDS. Its
   message says "Verified live end-to-end (grant/dup-guard/gates/reveal/equip)" - and it was, within
   one session. Every Blade Shard a player found was gone on reload, so the endgame questline could
   not be finished across sessions. The fix arrived the same day inside a DIFFERENT feature's commit
   (a8446dc, the Drillmaster's Seal), whose diff carries the giveaway comment still on line 1143:
   `// Ian's Blade progress (was not persisted before)`.

   Nothing about that is visible in a playtest of the session that introduces it. It is, however,
   fully visible in the text of the file, which is what this module reads.

   TWO ASSERTIONS, and they are the two halves of one round trip.

     A1  A field the game WRITES to `meta` must be on GLOBAL_FIELDS or MODE_FIELDS.
         Otherwise it is never written to disk.  -> `unpersisted()`

     A2  A name on MODE_FIELDS must be read back by `loadMode()`.
         Otherwise it is written to disk and never restored.  -> `unrestored()`

   The two are not the same test and neither implies the other. The global half needs no A2: it is
   restored wholesale by `Object.assign(defaults, _g)` at 1065, so every name on GLOBAL_FIELDS comes
   back by construction. The mode half is restored field by field, by hand, in 35 lines of
   `meta.x = mv.x || default` - which is where a name can be on the list and still never come home.

   WHAT EACH ONE IS WORTH, MEASURED RATHER THAN ASSUMED. Both were run against all 662 revisions of
   index.html that have a split save (harness/test/save-fields.test.js pins the interesting ones):

     - A1 has been RED on the majority of them, in five separate incidents, each entering on a
       dated commit and one of them fixed the same day. It is a finding, not a guard.
     - A2 has been GREEN on all 662. It has never caught anything. It is shipped anyway because it
       costs ten lines and guards the exact mirror of a mistake the repo has made five times, but
       it is honest to say it has no scalp and to treat a red from it as news rather than noise.

   WHY THE LISTS ARE READ FROM THE RAW SOURCE AND THE WRITES FROM THE STRIPPED COPY.
   This is the one place this module can go quietly, catastrophically wrong, and the prototype DID:

     GLOBAL_FIELDS and MODE_FIELDS are *nothing but* string literals, and `stripNonCode` blanks
     string literals. Read the lists from the stripped copy and both come back EMPTY, so every
     field the game writes looks unpersisted - the first run of the prototype reported all 99 of
     them. A checker that flags everything is worth exactly what one that flags nothing is worth.

   So the lists come from `raw`. The writes come from `stripNonCode(raw)`, for the opposite reason:
   this file's comments and toast strings name meta fields constantly (the paragraph above names
   six), and counting a mention in prose as a write would invent fields the game does not store.
   Both directions are asserted in the tests, each against the version that gets it wrong.

   KNOWN BLIND SPOT, stated rather than discovered later. A field only ever mutated through a deeper
   path - `meta.tut.dash = 1`, `meta.classes[id].rank = 2` - is not counted as a write to `meta.tut`
   or `meta.classes`. This loses leads; it does not invent them, which is the safe direction for a
   checker whose output is a bug list. In practice the parent is nearly always initialised with a
   plain `meta.tut = meta.tut || {}` somewhere, which IS counted.

   WHY THERE IS NO ROUND-TRIP PROBE NEXT TO THIS, measured rather than assumed. The obvious sequel
   is an in-page test that seeds a save, calls loadMode(), calls persist() and diffs the key. It was
   built as a diagnostic and run against the live game (`--scene hub`, driving the game's own loader
   and its own writer). A full realistic save - all 39 mode fields, a hero, a three-item stash, the
   collections, and deliberately retired content: `arche:'spear'`, `art:'orb'`, `el:'storm'`,
   `el:'lightning'`, `set:'heavy'` with no type - came back with NOTHING lost, nothing shrunk,
   nothing decreased and nothing changed. Two things follow, and the second is the useful one:

     - A round-trip probe has no finding today. It would cost a full Chrome boot to assert a green.
     - The retired ids came back BYTE-IDENTICAL - `spear` did not become `sword`. normWeapon/normEl/
       normArmor are not applied by loadMode at all; they fold lazily, on first touch. So the
       intuitive assertion "a retired arche comes back as its replacement" is FALSE against this
       game, and a probe written to the design's expectation would have failed on correct code.

   The three adversarial rows that DO show a loss each need a save the game cannot write:
     - a hero with no `.gear` is dropped whole (1126), but snapOf (3825) always emits `gear`;
     - an unknown pet id is filtered out of petOwned (1135) - no id has ever been removed from PETS;
     - an unknown classId falls back to a live unlocked class (1124) - nor from CLASSES.
   Measured over all 669 revisions of index.html: PETS, CLASSES, SKINS, COSMETICS and ARMOR_TYPES
   have never lost an id, and neither whitelist has ever lost a field. The one id ever removed from
   ARCHES is `spear` (2026-07-17), which round-trips fine. The latent risk is worth writing down
   even though it is not a bug: the day a pet id IS retired, every owner of that pet loses it
   silently, because petOwned has no alias table the way weapons and armour do.

   `_`-PREFIXED NAMES ARE EXCLUDED, because that is this file's own convention for a marker meant to
   die with the session: `_perkRefund` (a number the perk-refund migration hands to the next screen),
   `_scytheNotify` and `_iansBladeNotify` (both set in one place and consumed in another a moment
   later). The exclusion costs one real lead and it is worth naming: `meta._iansBladeAnnounced`
   (14858, 15506) reads like a one-time gate - "Ian's Blade now waits in the Shop" - and being
   `_`-prefixed it is not persisted, so that announcement re-fires every session. It is left out of
   the assertion because the convention says transient, and a checker does not get to overrule the
   file's own convention. It is a lead for a human, which is what this comment is. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { stripNonCode } from './audit-fields.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAME = path.join(ROOT, 'public', '3d', 'index.html');

/* One of the two persist whitelists, as written in the source. RAW, never stripped - see header. */
export function fieldList(raw, name){
  const m = new RegExp('const ' + name + '=\\[([\\s\\S]*?)\\];').exec(raw);
  return m ? [...m[1].matchAll(/'([^']+)'/g)].map(a => a[1]) : null;
}

/* The body of the first `{...}` at or after `from`, brace-matched.

   Brace matching, NOT "everything up to the next function". The prototype delimited loadMode with
   `/function loadMode\(m\)\{([\s\S]*?)\nfunction wipeMode/`, which silently stops measuring the day
   someone puts a different function after loadMode, or renames wipeMode - and stops measuring by
   returning NOTHING, i.e. by going green. Counting braces depends on nothing but the braces.

   MUST be given stripped source: a `{` inside a string or a comment would desync the count, and
   this file has plenty of both. */
export function braceBody(stripped, from){
  const open = stripped.indexOf('{', from);
  if(open < 0) return null;
  let depth = 0;
  for(let i = open; i < stripped.length; i++){
    const c = stripped[i];
    if(c === '{') depth++;
    else if(c === '}' && --depth === 0) return stripped.slice(open + 1, i);
  }
  return null;   // unbalanced - report nothing rather than a truncated guess
}

/* Top-level keys of an object literal body. TOP LEVEL ONLY: the defaults block contains
   `cosEquipped:{cape:null,trail:null,glow:null}`, which declares ONE save field called
   `cosEquipped`, not three called cape/trail/glow. */
export function topLevelKeys(body){
  const out = [];
  let depth = 0;
  for(let i = 0; i < body.length; i++){
    const c = body[i];
    if(c === '{' || c === '[' || c === '(') depth++;
    else if(c === '}' || c === ']' || c === ')') depth--;
    else if(depth === 0 && /[A-Za-z_$]/.test(c)){
      const k = /^([A-Za-z_$][\w$]*)\s*:/.exec(body.slice(i));
      if(k){ out.push(k[1]); i += k[0].length - 1; }
      else {
        /* A bare token (a VALUE like `true`, or a callee like `f` in `d:f({...})`). Skip it - but
           stop ON the delimiter, not past it, because the loop's own `i++` moves one more. Getting
           this wrong swallows the `(` of `d:f({e:3})`, so depth never opens, the matching `)` drives
           it to -1, and every key after that point is invisible. Caught by this module's own test. */
        while(i + 1 < body.length && /[\w$]/.test(body[i + 1])) i++;
      }
    }
  }
  return out;
}

/* `=` but not `==`, `===` or `=>`; plus the compound assignments and ++/--. Deliberately the same
   question audit-fields' `isWrite` asks, kept separate because that one works from an index into a
   whole file and this one is a plain match on `meta.<name>`. */
const WRITE_OP = String.raw`\s*(?:=(?![=>])|\+\+|--|\+=|-=|\*=|/=|%=|\|\|=|&&=|\?\?=|\|=|&=|\^=)`;

/* Every field the game assigns to `meta`, plus every key of the defaults literal.

   The defaults block counts as a write because it IS one: `const meta=Object.assign({...},_g)` is
   the statement that declares the save's shape, and a key that appears there and on no list is a
   field the game carries in memory and never stores. */
export function writtenFields(raw){
  const src = stripNonCode(raw);
  const out = new Set();
  for(const m of src.matchAll(new RegExp(String.raw`\bmeta\.([A-Za-z_$][\w$]*)` + WRITE_OP, 'g')))
    out.add(m[1]);
  const at = src.indexOf('const meta=Object.assign(');
  if(at >= 0){
    const body = braceBody(src, at);
    if(body) for(const k of topLevelKeys(body)) out.add(k);
  }
  return out;
}

/* Every `meta.x = ...` inside loadMode - i.e. the mode fields that are restored on load. */
export function restoredFields(raw){
  const src = stripNonCode(raw);
  const at = src.indexOf('function loadMode(');
  if(at < 0) return null;
  const body = braceBody(src, at + 'function loadMode('.length);   // skip the ARGUMENT list's parens
  if(body == null) return null;
  return new Set([...body.matchAll(new RegExp(String.raw`\bmeta\.([A-Za-z_$][\w$]*)\s*=(?![=>])`, 'g'))].map(m => m[1]));
}

/* A1: written to `meta`, on neither whitelist, so never written to disk. */
export function unpersisted(raw){
  const g = fieldList(raw, 'GLOBAL_FIELDS'), m = fieldList(raw, 'MODE_FIELDS');
  if(!g || !m) return null;                       // revision pre-dates the split save
  const on = new Set([...g, ...m]);
  return [...writtenFields(raw)].filter(f => !on.has(f) && !f.startsWith('_')).sort();
}

/* A2: on MODE_FIELDS, so written to disk, but loadMode never reads it back. */
export function unrestored(raw){
  const m = fieldList(raw, 'MODE_FIELDS');
  const back = restoredFields(raw);
  if(!m || !back) return null;
  return m.filter(f => !back.has(f)).sort();
}

if(import.meta.filename === process.argv[1]){
  const file = process.argv[2] || GAME;
  const raw = readFileSync(file, 'utf8');
  const a1 = unpersisted(raw), a2 = unrestored(raw);
  if(a1 === null){ console.log('no field lists — this revision pre-dates the split save'); process.exit(0); }
  const g = fieldList(raw, 'GLOBAL_FIELDS'), m = fieldList(raw, 'MODE_FIELDS');
  console.log(`GLOBAL_FIELDS ${g.length} + MODE_FIELDS ${m.length} over ${writtenFields(raw).size} written meta fields`);
  console.log(a1.length ? '\nWRITTEN, NEVER SAVED (persist() drops these on the way to disk):\n  ' + a1.join('\n  ')
                        : '\nA1 clean — every written meta field is on a persist list');
  console.log(a2 === null ? '\nA2 not measurable — loadMode not found'
            : a2.length   ? '\nSAVED, NEVER RESTORED (loadMode never reads these back):\n  ' + a2.join('\n  ')
                          : '\nA2 clean — every MODE_FIELDS name is read back by loadMode');
  process.exit(a1.length || (a2 && a2.length) ? 1 : 0);
}
