/* IS THIS PASSIVE WIRED TO ANYTHING AT ALL?

   test-skills.js casts a skill and watches what moves. A passive is never cast, so that whole rig
   is blind to it: every `kind:'passive'` entry in CLASS2 is offered to the player, described in a
   tooltip and stored in `cs.ch[rank]`, and NOTHING in the harness has ever checked that the game
   then reads it back.

   This is the passive-shaped twin of the `dead handler` assertion, and it is deliberately the same
   SHAPE of question rather than the same shape of test. That assertion asks "is SKILL_FX[s.fx] a
   function"; this asks "does any code outside the menu ever mention this id". A passive whose id no
   c2Passive('...') call and no other line reads is inert by construction - the player chose it, the
   card said what it does, and the game never consults it again. Nine skills were exactly that until
   5339f48, and nobody noticed for months.

   STATIC, on purpose, and that is a real limit worth stating up front. It runs in milliseconds with
   no browser, so it can never flake and never contends with a render - but it proves WIRED, not
   CORRECT. A passive that is read once and read wrongly passes here. That is the stat-snapshot job
   the plan describes, and it is a much larger piece of work; this is the floor under it, and the
   floor is where the nine dead skills were found.

   TWO REGIONS ARE EXCLUDED FROM THE READER SEARCH, and getting this wrong makes the whole audit
   report a clean bill of health forever:
     - CLASS2 itself, because the definition is not a use.
     - PASSIVE_ART, an icon lookup keyed by every passive id in the game. It mentions all of them,
       so counting it as a reader means every passive looks wired no matter what.
   Both are found by their own declarations rather than by hard-coded line numbers, so they cannot
   drift out of date when the file above them grows.

   WHY A "DEAD" VERDICT CAN BE BELIEVED, which is the only part of this that is not obvious. A
   textual search reports a false death the moment an id is looked up by a computed string -
   c2Passive('st_' + x) would be invisible to it. Checked rather than assumed: every c2Passive call
   site in the game outside the function's own definition passes a quoted literal (grep for
   `c2Passive\([^')]` returns line 9945 and nothing else). So there is no computed path for an id to
   reach the game by, and an id that appears nowhere really is consulted nowhere. If that ever stops
   being true, this audit starts lying in the accusing direction and the grep above is how to tell. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAME = path.join(ROOT, 'public', '3d', 'index.html');

/* Span of `<decl>` through the brace that closes it. Returns [start, end) over the raw source. */
function blockOf(src, decl){
  const i = src.indexOf(decl);
  if(i === -1) throw new Error(`cannot find ${JSON.stringify(decl)} in index.html`);
  const open = src.indexOf('{', i);
  let depth = 0;
  for(let k = open; k < src.length; k++){
    const c = src[k];
    if(c === "'" || c === '"' || c === '`'){        // skip strings; descriptions contain braces
      const q = c;
      k++;
      while(k < src.length && src[k] !== q){ if(src[k] === '\\') k++; k++; }
      continue;
    }
    if(c === '{') depth++;
    else if(c === '}'){ depth--; if(depth === 0) return [i, k + 1]; }
  }
  throw new Error(`unterminated block for ${decl}`);
}

/* Every `kind:'passive'` group inside CLASS2, tagged with the class whose tree it sits in. */
export function passivesOf(src){
  const [c2s, c2e] = blockOf(src, 'const CLASS2=');
  const body = src.slice(c2s, c2e);

  /* Top-level keys of CLASS2 are class ids. Record where each one starts so a passive found at
     offset N can be attributed to the last class that opened before it. */
  const classAt = [];
  const clsRe = /\n {2}(\w+):\s*\{/g;
  let m;
  while((m = clsRe.exec(body))) classAt.push({ at: m.index, cls: m[1] });

  const out = [];
  const passRe = /kind:\s*'passive'/g;
  while((m = passRe.exec(body))){
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
    const entRe = /id:\s*'([A-Za-z0-9_]+)'[^}]*?n:\s*'([^']*)'[^}]*?d:\s*'([^']*)'/g;
    let e;
    while((e = entRe.exec(group))) out.push({ cls, rank: 'r' + rank, id: e[1], name: e[2], desc: e[3] });
  }
  return out;
}

/* The source with the two menu-only regions blanked, so a hit in what remains is a real reader. */
export function readerSource(src){
  const spans = [blockOf(src, 'const CLASS2='), blockOf(src, 'const PASSIVE_ART=')]
                  .sort((a, b) => b[0] - a[0]);
  let s = src;
  for(const [a, b] of spans) s = s.slice(0, a) + ' '.repeat(b - a) + s.slice(b);
  return s;
}

export function auditPassives(src){
  const passives = passivesOf(src);
  const readers = readerSource(src);
  const rows = passives.map(p => {
    const re = new RegExp(`['"\`]${p.id}['"\`]`, 'g');
    const hits = (readers.match(re) || []).length;
    return { ...p, readers: hits, wired: hits > 0 };
  });
  return { total: rows.length, dead: rows.filter(r => !r.wired), rows };
}

if(import.meta.filename === process.argv[1]){
  const src = readFileSync(GAME, 'utf8');
  const r = auditPassives(src);
  for(const d of r.dead)
    console.log(`FAIL passive ${d.cls}/${d.name} (${d.id}, ${d.rank}): nothing outside the choice menu ever reads it — "${d.desc}"`);
  console.log(`passives: ${r.total - r.dead.length} wired, ${r.dead.length} dead`);
  process.exit(r.dead.length ? 1 : 0);
}
