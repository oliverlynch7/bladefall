/* HOW MANY ACTIVE SKILLS DOES THIS GAME HAVE, AND CAN THE BENCH STILL SEE THEM ALL?

   The passive-shaped twin of this file (audit-passives.js) asks "does anything read this id". This
   one asks a smaller and duller question, and it exists because the dull question went unasked for
   the whole life of the harness and cost more than any single bug in it.

   `test-skills.js` cast the A side of every 1-of-2 choice and nothing else, for months. Not because
   anything was broken — `cheatRank10All` fills a valid build with `def['r'+r].a.id`, which is
   correct behaviour for a cheat — but because nothing anywhere stated how many skills the game HAS,
   so nothing could notice that the bench was reaching 64 of them. `skills: 70 pass, 3 fail` is a
   coverage figure that reads like a completeness one, and that is invisible by construction: a suite
   cannot report a skill it never looked at.

   So: count the population, from CLASS2, statically, in milliseconds. The count is then something a
   test can hold the bench to. `harness/test/skills.test.js` asserts the arithmetic PER CLASS as well
   as in total, for the reason pass 30 records against this file's neighbour — an aggregate floor
   cannot tell a parser that lost four entries from one that never had them.

   THE APOSTROPHE HAZARD IS REAL ON THIS SIDE TOO, and it is why `n:` and `d:` accept either quote
   here from the first line rather than after an incident. `passivesOf` required single quotes and
   silently skipped the four passives whose names carry an apostrophe (`Death's Favor`,
   `Guardian's Will`, `Predator's Rhythm`, `Alpha's Authority`) — under-reporting 128 as 124 and, far
   worse, putting those four outside the ratchet's reach entirely. The skill table has the same shape
   of entry and at least two of them: `Hunter's Mark` and `Sic 'Em`.

   WHAT THIS DELIBERATELY DOES NOT DO is decide whether a handler exists. `typeof SKILL_FX[fx]` is a
   RUNTIME fact — SKILL_FX is assembled by aliasing across three separate regions of the file and the
   last definition of an id wins — so a static reading of it would be a second, weaker copy of the
   `dead handler` assertion the bench already makes against the live game on both sides now. Measured
   rather than assumed: `harness/probes/bside.probe.js` reports `deadCount 0` over all 128. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { blockOf } from './audit-passives.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAME = path.join(ROOT, 'public', '3d', 'index.html');

export function gameSource(){ return readFileSync(GAME, 'utf8'); }

/* Every option of every `kind:'skill'` rank in CLASS2 — BOTH sides, which is the whole point.
   Shaped like passivesOf's return so the two audits read the same way. */
export function skillsOf(src){
  const [c2s, c2e] = blockOf(src, 'const CLASS2=');
  const body = src.slice(c2s, c2e);

  const classAt = [];
  const clsRe = /\n {2}(\w+):\s*\{/g;
  let m;
  while((m = clsRe.exec(body))) classAt.push({ at: m.index, cls: m[1] });

  const out = [];
  const skillRe = /kind:\s*'skill'/g;
  while((m = skillRe.exec(body))){
    const groupStart = body.lastIndexOf('{', m.index);
    let depth = 0, end = -1;
    for(let k = groupStart; k < body.length; k++){
      const c = body[k];
      if(c === "'" || c === '"'){ const q = c; k++; while(k < body.length && body[k] !== q){ if(body[k] === '\\') k++; k++; } continue; }
      if(c === '{') depth++;
      else if(c === '}'){ depth--; if(depth === 0){ end = k + 1; break; } }
    }
    if(end === -1) continue;
    const group = body.slice(groupStart, end);
    let cls = '?';
    for(const c of classAt){ if(c.at < m.index) cls = c.cls; else break; }
    const rank = (body.slice(Math.max(0, groupStart - 8), groupStart).match(/r(\d+):\s*$/) || [])[1] || '?';

    /* Either quote on `n:` and `d:`. The id and the fx are identifiers and can never need the
       other one, so widening those would only add ways to match something that is not an id. */
    const Q = String.raw`(?:'([^']*)'|"([^"]*)")`;
    const entRe = new RegExp(
      String.raw`id:\s*'([A-Za-z0-9_]+)'[^}]*?n:\s*${Q}[^}]*?fx:\s*'([A-Za-z0-9_]+)'[^}]*?d:\s*${Q}`, 'g');
    let e;
    while((e = entRe.exec(group)))
      out.push({ cls, rank: 'r' + rank, id: e[1],
                 name: e[2] !== undefined ? e[2] : e[3],
                 fx: e[4],
                 desc: e[5] !== undefined ? e[5] : e[6] });
  }
  return out;
}

/* The population, and its shape per class — which is what a test can hold the bench to. */
export function auditSkills(src){
  const rows = skillsOf(src);
  const byClass = new Map();
  for(const r of rows){
    if(!byClass.has(r.cls)) byClass.set(r.cls, []);
    byClass.get(r.cls).push(r);
  }
  const perClass = [...byClass.entries()].map(([cls, rs]) => ({
    cls, count: rs.length, ranks: [...new Set(rs.map(r => r.rank))].sort(),
  }));
  return { total: rows.length, classes: perClass.length, perClass, rows };
}

if(import.meta.filename === process.argv[1]){
  const r = auditSkills(gameSource());
  for(const c of r.perClass)
    if(c.count !== 8) console.log(`FAIL ${c.cls}: ${c.count} skill options over ${c.ranks.join(',')} — expected 8`);
  console.log(`skills defined: ${r.total} over ${r.classes} classes`);
  process.exit(r.perClass.some(c => c.count !== 8) ? 1 : 0);
}
