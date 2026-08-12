/* WHICH CLASSES ARE PLAYING THE SAME SKILL UNDER A DIFFERENT NAME?

   docs/VISION.md's priority #2, in his own words: "The goal is not 16 classes that work, it is 16
   classes that feel genuinely different to play... A class that is a stat-reskin of another has
   failed." Nothing in this harness has ever measured that. audit-passives asks whether a passive is
   read; audit-fields asks whether a field is; test-skills asks whether a skill's effect matches its
   own sentence. None of them can see two cards in two different classes running the SAME FUNCTION.

   They do, a lot. `SKILL_FX` is a plain object and the class kits are wired by aliasing
   (`SKILL_FX.mon_whirl = SKILL_FX.w_whirl`), which is a reasonable way to build sixteen classes out
   of three cores - AUTOPILOT.md's own class philosophy says every class IS a variant of one of
   them. So a shared function is NOT a bug by itself. What this reports is the SEAM: where a card in
   one class and a card in another are the same code, so the only thing distinguishing them is the
   name, the icon and the numbers around it. Two things live in that seam and both are real:

     - a card that promises something the shared function does not do (the Pirate's Aimed Shot says
       "rapid piercing pistol shots (~2s, softer each)" and `deadeye` fires exactly one lance), and
     - a pair of classes whose kits are quietly converging.

   THE ALIAS RESOLUTION IS THE LOAD-BEARING PART, AND THE OBVIOUS VERSION IS WRONG. `SKILL_FX.a =
   SKILL_FX.b` copies the value b holds AT THAT POINT. Redefining b afterwards does not follow the
   alias. The game does exactly this: `nin_fury`, `bsk_berserk` and `mon_thousand` are aliased to
   `w_berserk` at lines 10281-10324, and `w_berserk` is then REPLACED by a new function at 19271 -
   so the Warrior's Warcry runs the new one and the other three still run the old `berserk`. A
   resolver that takes the last assignment of each id (or the first) groups all four together and is
   wrong about every one of them. So this walks every assignment in file order and simulates it.

   That same simulation reproduces section A of docs/SKILL_TRIAGE.md for free: an alias whose source
   has not been defined YET stores `undefined`, which is a skill that spends its cooldown and does
   nothing. Nine shipped that way. `deadHandlers()` reports them statically - until now that fault
   was only catchable at runtime, by casting the skill.

   STATIC, and the limits are the sibling audits' limits. It cannot see a function that dispatches
   internally on `meta.classId` (so two cards sharing a root may still behave differently), and it
   cannot read a card's intent. Every row it prints is a place to go and look. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { stripNonCode } from './audit-fields.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAME = path.join(ROOT, 'public', '3d', 'index.html');

/* Span of `<decl>` through the brace that closes it, skipping strings. Same shape as
   audit-passives' blockOf; kept local so neither file has to export its innards. */
function blockOf(src, decl){
  const i = src.indexOf(decl);
  if(i === -1) throw new Error(`cannot find ${JSON.stringify(decl)} in index.html`);
  const open = src.indexOf('{', i);
  let depth = 0;
  for(let k = open; k < src.length; k++){
    const c = src[k];
    if(c === "'" || c === '"' || c === '`'){ const q = c; k++; while(k < src.length && src[k] !== q){ if(src[k] === '\\') k++; k++; } continue; }
    if(c === '{') depth++;
    else if(c === '}'){ depth--; if(depth === 0) return [i, k + 1]; }
  }
  throw new Error(`unterminated block for ${decl}`);
}

export function lineOf(src, index){ return src.slice(0, index).split('\n').length; }

/* Every `kind:'skill'` entry in CLASS2, with the class whose tree it sits in.
   `n:` and `d:` accept either quote style, for the reason audit-passives now does: a name with an
   apostrophe in it cannot be written in single quotes, and four of the game's are. */
export function kitsOf(src){
  const [a, b] = blockOf(src, 'const CLASS2=');
  const body = src.slice(a, b);

  const classAt = [];
  let m;
  const clsRe = /\n {2}(\w+):\s*\{/g;
  while((m = clsRe.exec(body))) classAt.push({ at: m.index, cls: m[1] });

  const Q = String.raw`(?:'([^']*)'|"([^"]*)")`;
  const re = new RegExp(String.raw`id:\s*'([A-Za-z0-9_]+)'[^}]*?n:\s*${Q}[^}]*?fx:\s*'([A-Za-z0-9_]+)'[^}]*?d:\s*${Q}`, 'g');
  const out = [];
  while((m = re.exec(body))){
    let cls = '?';
    for(const c of classAt){ if(c.at < m.index) cls = c.cls; else break; }
    out.push({ cls, id: m[1],
               name: m[2] !== undefined ? m[2] : m[3],
               fx: m[4],
               desc: m[5] !== undefined ? m[5] : m[6] });
  }
  return out;
}

/* Simulate every assignment to SKILL_FX in file order and report, for each id, WHICH definition it
   ends up holding. A definition is identified by the line it was written on, which is also the most
   useful thing to print.

   Returns Map<id, {root, line} | {root:null}> - root null means the id holds undefined, i.e. an
   alias that ran before its source existed. */
export function fxBindings(src){
  const code = stripNonCode(src);            // a comment that writes `SKILL_FX.a=SKILL_FX.b` is not an assignment
  const events = [];

  /* The object literal's own entries all come into being together, at the literal.

     ONLY AT DEPTH 1, and that is not tidiness. These handlers are full of nested object literals -
     `G.projectiles.push({owner:'player', x:…, dmg:…})` - and a flat key scan registers every one of
     those as a SKILL_FX entry. Harmless while nothing points at them, and NOT harmless the moment
     an alias names something that only exists as a nested key: the alias would resolve, and a skill
     with no handler would be reported as wired. That is the accusing direction inverted, which is
     how section A survived for months. Depth is counted off the stripped source, so a brace inside
     a string or a comment cannot move it. */
  const [ls, le] = blockOf(src, 'const SKILL_FX');
  const lit = code.slice(ls, le);
  const KEY = /(?:^|[{,\n])\s*([A-Za-z0-9_]+)\s*(?::|\()/y;
  let depth = 0;
  for(let k = 0; k < lit.length; k++){
    const c = lit[k];
    if(c === '{' || c === '(' || c === '['){ depth++; continue; }
    if(c === '}' || c === ')' || c === ']'){ depth--; continue; }
    if(depth !== 1) continue;
    if(c !== ',' && c !== '\n' && !(k === 0)) continue;
    KEY.lastIndex = k;
    const mm = KEY.exec(lit);
    if(mm) events.push({ at: ls + mm.index, id: mm[1], from: null, defLine: lineOf(src, ls) });
  }

  /* Later `SKILL_FX.<id> = ...`. The right-hand side is an ALIAS when it is a `||` chain of other
     SKILL_FX members, and a DEFINITION otherwise (a function expression).

     THE `||` CHAIN IS NOT AN EDGE CASE, IT IS THE REPAIR SECTION A SHIPPED. The nine skills that
     had no handler were fixed at index.html:10520-10530 with `SKILL_FX.nin_step =
     SKILL_FX.nin_step || SKILL_FX.x_step;` - re-run below the definitions, keeping whatever the
     first pass managed to store. A resolver that reads only the first operand sees a self-alias to
     something still undefined and reports all nine as dead again, which is a false accusation of
     the loudest possible kind: it would name nine fixed skills as broken. Measured, not guessed -
     the first version of this file did exactly that. */
  const CHAIN = /^\s*(SKILL_FX\.[A-Za-z0-9_]+(?:\s*\|\|\s*SKILL_FX\.[A-Za-z0-9_]+)*)\s*;/;
  for(const mm of code.matchAll(/SKILL_FX\.([A-Za-z0-9_]+)\s*=/g)){
    if(mm.index >= ls && mm.index < le) continue;      // inside the literal, already recorded
    const rhs = code.slice(mm.index + mm[0].length, mm.index + mm[0].length + 400);
    const chain = CHAIN.exec(rhs);
    events.push({ at: mm.index, id: mm[1], defLine: lineOf(src, mm.index),
                  from: chain ? chain[1].split('||').map(s => s.trim().slice('SKILL_FX.'.length)) : null });
  }

  events.sort((x, y) => x.at - y.at);
  const bind = new Map();
  for(const e of events){
    if(e.from === null){ bind.set(e.id, { root: e.id, line: e.defLine }); continue; }
    /* Left to right, exactly as `||` evaluates: the first operand that actually holds a function. */
    let got = null;
    for(const srcId of e.from){
      const b = bind.get(srcId);
      if(b && b.root !== null){ got = b; break; }
    }
    bind.set(e.id, got || { root: null, line: e.defLine });
  }
  return bind;
}

export function auditKits(src){
  const cards = kitsOf(src);
  const bind = fxBindings(src);

  const dead = [];
  const byRoot = new Map();
  for(const c of cards){
    const bd = bind.get(c.fx);
    if(!bd || bd.root === null){ dead.push(c); continue; }
    const key = `${bd.root}@${bd.line}`;
    if(!byRoot.has(key)) byRoot.set(key, { root: bd.root, line: bd.line, cards: [] });
    byRoot.get(key).cards.push(c);
  }

  const groups = [...byRoot.values()].sort((x, y) => y.cards.length - x.cards.length);
  const shared = groups.filter(g => new Set(g.cards.map(c => c.cls)).size > 1);
  return {
    cards, groups, shared, dead,
    /* A stable name for a shared group, so it can be listed in a ratchet without depending on a
       line number that moves whenever anything above it is edited. */
    keys: shared.map(g => g.root + ':' + [...new Set(g.cards.map(c => c.cls))].sort().join('+')).sort(),
  };
}

/* An alias that ran before its source was defined. Section A of docs/SKILL_TRIAGE.md: nine skills
   shipped this way, each spending its mana and cooldown and doing nothing. */
export function deadHandlers(src){ return auditKits(src).dead; }

if(import.meta.filename === process.argv[1]){
  const src = readFileSync(GAME, 'utf8');
  const r = auditKits(src);
  for(const d of r.dead)
    console.log(`FAIL kit ${d.cls}/${d.name} (${d.id}): fx '${d.fx}' holds undefined — the cast does nothing`);
  console.log(`\nkits: ${r.cards.length} cards, ${r.groups.length} distinct handlers, ${r.shared.length} shared across classes`);
  for(const g of r.shared){
    console.log(`\n== ${g.root} (line ${g.line}) — ${g.cards.length} cards ==`);
    for(const c of g.cards) console.log(`   ${c.cls}/${c.name} [${c.fx}] — "${c.desc}"`);
  }
  process.exit(r.dead.length ? 1 : 0);
}
