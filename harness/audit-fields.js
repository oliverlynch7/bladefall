/* WHICH FIELDS DOES THE GAME WRITE AND NEVER READ, OR READ AND NEVER WRITE?

   The passive audit next door asks "does anything mention this id". That question has now been
   answered to its floor - every remaining dead passive is blocked on a number or a mechanic that
   does not exist - and the shape it CANNOT see is the one the last three real bugs had:

     - section H, the ninja's Unseen: the id was mentioned, so the passive audit called it wired.
       The clock it was gated on (`p._stillT`) only ever ran for the mage.
     - section I, the necromancer's Harvest: a corpse pushed with `t:0` that `minionUpdate` filtered
       out on the next frame. Nothing in the file is unwired; one field carries the wrong value.
     - section K, three classes that promise to control who the enemies attack: `e.taunt`, `e._taunt`,
       `p.warcryT` and `e.target` are each SET by a skill and read by nothing at all.

   Section K is the cheap half of that, and it is a purely static question: a field a skill assigns
   and no other line ever looks at is a promise the game cannot keep, whatever the card says. Run
   over `p.` it turned up three findings in one pass with no browser and no GPU. This widens it to
   the two receivers that have never been swept - enemy state (`e.`) and run state (`G.`) - which is
   what docs/superpowers/plans/2026-08-10-skill-correctness.md asks for by name.

   THIS IS A LEAD GENERATOR, NOT A VERDICT, and the difference matters enough to say twice. A static
   sweep cannot see a field reached by a computed key (`obj[k]`), cannot tell an enemy `e` from a DOM
   event `e`, and cannot know that a written-never-read field is an inert leftover sitting beside the
   one that does the work (`p._vanish` next to `p.invuln` - already recorded, and exactly this
   sweep's false positive). Every row it prints is a place to go and look. Nothing here is a bug
   until someone reads the code around it.

   WHY THE COMMENT STRIPPER IS THE LOAD-BEARING PART. This file's comments are prose and they name
   fields constantly - the paragraph above mentions `e.taunt`, `p.warcryT` and `e.target`, none of
   which the game reads. Counting a comment as a reader means a dead field looks alive precisely
   when someone has documented it, which is the worst possible direction for this to fail in. So
   strings, line comments, block comments and regex literals are all removed before anything is
   counted, and the unit tests assert that a mention in each of them does NOT count as a reader. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAME = path.join(ROOT, 'public', '3d', 'index.html');

/* Blank out strings, comments and regex literals, preserving length so every index still lines up
   with the original source (the CLI prints line numbers off these offsets).

   The regex-literal rule is the usual one: a `/` starts a regex only when the previous meaningful
   character cannot end an expression. Getting it wrong the other way is what makes naive strippers
   swallow half a file - `a / b` would open a regex that runs to the next slash. */
const BEFORE_REGEX = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';',
                              '+', '-', '*', '%', '<', '>', '~', '^', '\n']);

export function stripNonCode(src){
  /* `split('')`, NOT `Array.from` — and this cost a diagnostic pass to find. Array.from splits a
     string by code POINTS, so one emoji makes the output array shorter than the input and every
     index after it is off by one. The game file is full of them (the HUD is emoji), so the stripper
     desynced a few thousand lines in and began blanking the middle of live code: `e.shieldYaw` was
     reported as `e.shie`, and real readers of real fields were being erased. That fails in the
     ACCUSING direction — a read that gets blanked turns a live field into "written, never read" —
     which is exactly the false bug this sweep exists not to produce. */
  const out = src.split('');
  const blank = (a, b) => { for(let k = a; k < b && k < out.length; k++) if(out[k] !== '\n') out[k] = ' '; };
  let i = 0, prev = '\n';
  while(i < src.length){
    const c = src[i];
    if(c === '/' && src[i + 1] === '/'){
      let k = i; while(k < src.length && src[k] !== '\n') k++;
      blank(i, k); i = k; continue;
    }
    if(c === '/' && src[i + 1] === '*'){
      const k = src.indexOf('*/', i + 2);
      const end = k === -1 ? src.length : k + 2;
      blank(i, end); i = end; continue;
    }
    if(c === "'" || c === '"'){
      let k = i + 1;
      while(k < src.length && src[k] !== c && src[k] !== '\n'){ if(src[k] === '\\') k++; k++; }
      blank(i + 1, k); i = k + 1; prev = c; continue;
    }
    if(c === '`'){
      /* Template literals hold code inside ${...}; blank only the literal chunks between them so a
         field assigned in an interpolation is still counted. */
      let k = i + 1, chunk = i + 1;
      while(k < src.length){
        if(src[k] === '\\'){ k += 2; continue; }
        if(src[k] === '`'){ blank(chunk, k); break; }
        if(src[k] === '$' && src[k + 1] === '{'){
          blank(chunk, k);
          let depth = 1; k += 2;
          while(k < src.length && depth > 0){ if(src[k] === '{') depth++; else if(src[k] === '}') depth--; k++; }
          chunk = k; continue;
        }
        k++;
      }
      i = k + 1; prev = '`'; continue;
    }
    if(c === '/' && BEFORE_REGEX.has(prev)){
      let k = i + 1, cls = false, ok = false;
      while(k < src.length && src[k] !== '\n'){
        if(src[k] === '\\'){ k += 2; continue; }
        if(src[k] === '[') cls = true;
        else if(src[k] === ']') cls = false;
        else if(src[k] === '/' && !cls){ ok = true; break; }
        k++;
      }
      if(ok){ blank(i + 1, k); i = k + 1; prev = '/'; continue; }
    }
    if(!/\s/.test(c)) prev = c;
    else if(c === '\n') prev = '\n';
    i++;
  }
  return out.join('');
}

const ASSIGN_OPS = ['+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '**=', '||=', '&&=', '??=',
                    '>>=', '<<=', '>>>='];

/* Is the usage at [start,end) on `code` a write to that property? */
function isWrite(code, start, end){
  let k = end;
  while(k < code.length && /[ \t]/.test(code[k])) k++;
  if(code[k] === '+' && code[k + 1] === '+') return true;
  if(code[k] === '-' && code[k + 1] === '-') return true;
  for(const op of ASSIGN_OPS) if(code.startsWith(op, k)) return true;
  /* Plain `=`, but not `==`, `===` or `=>`. */
  if(code[k] === '=' && code[k + 1] !== '=' && code[k + 1] !== '>') return true;
  /* `++x.f`, `--x.f`, `delete x.f`. `start` is the DOT, so step back over the receiver expression
     first — `G.p._headlongT` puts `G.p` between the operator and the dot under test. */
  let j = start - 1;
  while(j >= 0 && /[A-Za-z0-9_$.]/.test(code[j])) j--;
  while(j >= 0 && /[ \t]/.test(code[j])) j--;
  if(j >= 1 && ((code[j] === '+' && code[j - 1] === '+') || (code[j] === '-' && code[j - 1] === '-'))) return true;
  if(/\bdelete\s*$/.test(code.slice(Math.max(0, j - 10), j + 1))) return true;
  return false;
}

/* Property names that appear as object-literal keys anywhere. A field created by `{taunt:1}` has no
   `x.taunt =` to find, so without this every literal-built field reads as never-written - which for
   `G.` is most of them, since newG builds the whole run state as one literal. */
export function literalKeys(code){
  const out = new Set();
  const re = /(?:^|[{,\s])([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g;
  let m;
  while((m = re.exec(code))) out.add(m[1]);
  return out;
}

/* IS THE DOT AT `i` A PROPERTY ACCESS, OR THE POINT IN A NUMBER?

   This replaces a `(?<![0-9.])` lookbehind that could not tell the two apart, and the difference is
   not academic — the lookbehind rejected EVERY receiver whose name ends in a digit. `e2`, `p2`,
   `m2`, `sp2`, `gy2`, `d2`, `s1`, `ter1`: ~120 property accesses in the game file (raw grep, so a
   handful may sit in prose) were invisible to this sweep, and they are not obscure ones.
   `e2.dead`, `m2.dropT` and `sp2.used` are live gameplay state, and `p2.shieldHp` / `p2.guardT` at
   19096 are the PEER player's shield and guard in the multiplayer render — so co-op state was in the
   blind spot too. The AoE and peer loops are precisely where a field gets its second reader.

   It failed in BOTH directions and the accusing one is why this is a bug rather than a limitation:
     - a field whose only WRITER is `e2.field = …` came back "read, never written";
     - a field whose only READER is `e2.field` comes back "WRITTEN, NEVER READ" — a fabricated dead
       field, the exact failure this module's header says it must never produce.
   Found by chasing `e._iansSplash`, which the sweep called read-never-written. It is written twice,
   on one line, through `e2` (index.html:10895) — Ian's Blade re-entrancy guard, entirely alive.

   The rule: walk back over any digits. If an identifier character sits before them the dot belongs
   to an identifier (`e2.x`); if not, the digits are a numeric literal (`1.5`) and it does not. A dot
   immediately before is `a..b` or a `...spread`, and is not an access either. */
export function isPropertyDot(code, i){
  if(i > 0 && code[i - 1] === '.') return false;
  let j = i - 1;
  while(j >= 0 && code[j] >= '0' && code[j] <= '9') j--;
  if(j === i - 1) return true;                       // no digits before the dot at all
  return j >= 0 && /[A-Za-z_$]/.test(code[j]);       // digits, but part of a name
}

/* One receiver's fields: where each is written, where each is read.

   THE RECEIVER SCOPES WHICH FIELDS ARE LOOKED AT, AND NOTHING ELSE. Reads and writes are then
   counted over EVERY receiver in the file, and that correction is the difference between a usable
   sweep and a list of false accusations. The player is reached by at least two names: `bsk_charge`
   sets `p._headlongT` at 19345 and the movement branch reads `G.p._headlongT` at 12853; the same
   split hides `_noRetreatT`'s only reader at 10830. A receiver-restricted count called both of them
   dead, and both are live.

   The cost of the correction is stated rather than hidden: a field name shared with an unrelated
   object (`sprite.name`, `e.width`) now has that object's uses counted as readers, so this can
   report a dead field as alive. That is the safe direction for a lead generator - it loses leads,
   it does not invent them. */
export function auditFields(src, receiver){
  const code = stripNonCode(src);
  const lits = literalKeys(code);
  /* `'*'` scopes to every receiver in the file — the maximal sweep. It is noisier by design: the
     DOM is full of legitimately write-only properties (`el.textContent`, `canvas.width`,
     `style.opacity`), which the browser reads and this file never does. */
  const mine = receiver === '*'
    ? /\.\s*([A-Za-z_$][A-Za-z0-9_$]*)/g
    /* A dotted receiver is allowed and is not a nicety: `G.pet.orderX` is reached under NEITHER `G`
       nor `pet` — the first stops at `pet`, and the second is rejected by the lookbehind because a
       dot precedes it. The Beastmaster's dead order fields live exactly there. */
    : new RegExp(`(?<![A-Za-z0-9_$.])${receiver.replace(/\./g, '\\.')}\\.([A-Za-z_$][A-Za-z0-9_$]*)`, 'g');
  const fields = new Map();
  let m;
  while((m = mine.exec(code))){
    /* `*` ONLY, and the reason is that `m.index` means two different things here: for `*` the match
       starts at the dot, for a named receiver it starts at the RECEIVER, so the same call would test
       a position several characters early and answer a question nobody asked. A named receiver needs
       no test anyway — its own lookbehind already refuses to start inside a number. */
    if(receiver === '*' && !isPropertyDot(code, m.index)) continue;
    if(!fields.has(m[1])) fields.set(m[1], { field: m[1], writes: [], reads: [] });
  }
  /* Second pass over the whole file, receiver-agnostic, for exactly the fields found above. */
  const any = /\.\s*([A-Za-z_$][A-Za-z0-9_$]*)/g;   // any receiver, including one ending in a digit
  while((m = any.exec(code))){
    const rec = fields.get(m[1]);
    if(!rec) continue;
    if(!isPropertyDot(code, m.index)) continue;     // `1.5`, `a..b`, `...spread`
    (isWrite(code, m.index, m.index + m[0].length) ? rec.writes : rec.reads).push(m.index);
  }
  const rows = [...fields.values()].map(r => ({
    field: r.field,
    writes: r.writes.length,
    reads: r.reads.length,
    at: (r.writes[0] ?? r.reads[0]),
    literalKey: lits.has(r.field),
  }));
  return {
    receiver,
    rows,
    writtenNeverRead: rows.filter(r => r.writes > 0 && r.reads === 0),
    /* Split deliberately: a read-only field that never appears as a literal key anywhere is the
       high-signal case (nothing can be putting a value there); one that does may simply be built
       in an object literal, which this sweep cannot attribute to a receiver. */
    readNeverWritten: rows.filter(r => r.reads > 0 && r.writes === 0 && !r.literalKey),
    readOnlyButLiteral: rows.filter(r => r.reads > 0 && r.writes === 0 && r.literalKey),
  };
}

export function lineOf(src, index){
  return src.slice(0, index).split('\n').length;
}

if(import.meta.filename === process.argv[1]){
  const src = readFileSync(GAME, 'utf8');
  for(const recv of (process.argv[2] ? [process.argv[2]] : ['p', 'e', 'G', 'G.pet', '*'])){
    const r = auditFields(src, recv);
    console.log(`\n=== ${recv}.* — ${r.rows.length} fields ===`);
    for(const f of r.writtenNeverRead)
      console.log(`  WRITTEN NEVER READ  ${recv}.${f.field}  (${f.writes} writes, first at line ${lineOf(src, f.at)})`);
    for(const f of r.readNeverWritten)
      console.log(`  READ NEVER WRITTEN  ${recv}.${f.field}  (${f.reads} reads, first at line ${lineOf(src, f.at)})`);
  }
}
