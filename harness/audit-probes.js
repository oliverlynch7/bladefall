/* WHICH OF THIS HARNESS'S OWN PROBES PROVED AN EFFECT THROUGH A DOOR A PLAYER NEVER OPENS?

   This is the sweep docs/superpowers/plans/2026-08-10-skill-correctness.md asks for by name, under
   pass 43's closing rule:

     "A probe that deliberately takes a simpler door to measure an effect cannot say the effect is
      REACHABLE. overcharge.probe.js states in its own comment that it rejected a real swing because
      a swing 'measures aim and flight time as much as it measures the chain'. That was correct for
      measuring the arc and it is exactly why five passes' worth of verified wirings turned out to be
      unreachable in play. Every probe in harness/probes/ that drives an effect through hitEnemy,
      hurtPlayer or a direct field assignment rather than through the button a player presses is open
      to this, and none of them has been re-read with that question in mind."

   Section U is what that costs when nobody asks. Nine of the sixteen classes attack at range; their
   shots call `hitEnemy` with a SYNTHETIC src (index.html:13522, the shot's own position, because
   knockback is thrown from the bolt and not from the caster), and the CLASS_BASIC dispatch at 10921
   is gated on `src===G.p`. So a probe that drives the effect with `hitEnemy(e,dmg,p,…)` takes the
   MELEE door, gets a true reading, and says nothing whatever about whether a player can reach it.
   Five passes in this sub-project's own log — 11, 14, 24, 26 and 37–40 — were verified that way.

   THE QUESTION THIS MODULE ANSWERS IS THE MECHANICAL HALF, AND ONLY THAT HALF: which probes drive
   the game through a door the player's own input reaches (`__BF3.input`, `playerAttack`, `useSkill`),
   which drive it through a door nothing but a probe can open (`hitEnemy`, `foeHit`, `hurtPlayer`,
   `spawnMinion`), and which do both. It cannot tell a synthetic call that IS the bar from one that
   is a control, a set-up step or a yardstick — `basichook.probe.js` calls the melee door on purpose,
   as the trial the real swing is compared AGAINST, and is the most reachability-aware probe here.
   So: SYNTHETIC-ONLY is a place to go and look, exactly like audit-fields.js's rows. Nothing here is
   a finding until someone reads the probe.

   WHY THE STRIPPER IS LOAD-BEARING, AGAIN. Probe headers are prose and they name these doors
   constantly — the paragraph above this one names all six, and overcharge.probe.js's header says
   "a real swing was rejected" in a file that never calls one. Counting a comment as a door means a
   probe looks reachable precisely when someone has documented why it is not, which is the worst
   possible direction. stripNonCode is IMPORTED from audit-fields.js rather than copied: this plan
   has already paid once for two copies of one probe drifting apart (AUTOPILOT.md's `--eval @path`
   note), and a second stripper would be the same mistake in the harness's own source.

   WHAT IT DELIBERATELY DOES NOT COUNT. Field assignment (`p._loaded=true`) is named in pass 43's
   rule but is NOT a signal here, and that is a measurement rather than an omission: every probe in
   this directory assigns player and enemy fields to build its rig — position, hp, weapon, rank — so
   "assigns a field" separates nothing. The doors above are the ones only a probe can open. */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { stripNonCode } from './audit-fields.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROBE_DIR = path.join(ROOT, 'harness', 'probes');
const GAME = path.join(ROOT, 'public', '3d', 'index.html');

/* A door the player's own input reaches.
   - `input`  — `__BF3.input`, the real button state the game reads each frame.
   - `playerAttack` — what the attack button calls.
   - `useSkill` — what a skill button calls; the cast entry point, cooldown and mana gates included. */
export const PLAYER_DOORS = ['input', 'playerAttack', 'useSkill'];

/* A door nothing but a probe can open. Each is a damage/summon resolver that the game reaches only
   from inside a swing, a shot or an enemy's attack — so calling it directly skips whatever the real
   caller had to satisfy first, which is the whole of section U. */
export const SYNTHETIC_DOORS = ['hitEnemy', 'foeHit', 'hurtPlayer', 'spawnMinion'];

/* `__BF3.input` is a property access; `useSkill(` etc. are calls. Both are matched on the STRIPPED
   source, so a mention in a comment or a string is not a door.

   THE LOOKBEHIND MUST ALLOW A LEADING DOT, and getting that wrong is silent. Measured over this
   directory, the doors are reached under `__BF3` far more often than bare — 39 `__BF3.hitEnemy(`
   against 8 `hitEnemy(`, 24 `__BF3.useSkill(` against 4 — so a `(?<![A-Za-z0-9_$.])` lookbehind,
   which is the one audit-fields.js wants for a RECEIVER, would have missed five sixths of the doors
   in the harness and reported nearly every probe as driving nothing. It rejects an identifier
   character only, so `myHitEnemy(` is still not a door. */
function usesDoor(code, door){
  const re = door === 'input'
    ? /(?<![A-Za-z0-9_$])input(?![A-Za-z0-9_$])/g
    : new RegExp(`(?<![A-Za-z0-9_$])${door}\\s*\\(`, 'g');
  return (code.match(re) || []).length;
}

/* Which classes does the probe put on the bench? The bench idiom is `meta.classId='<id>'`, and a
   probe that names none is not measuring a class kit (the level, mp and delve probes).

   THIS ONE SCANS THE RAW SOURCE, and it is the exception that proves the stripper is working: the
   class NAME lives inside a string literal, so the stripped copy — which blanks string contents by
   design — returned every probe as naming no class at all. The stripped copy is still used, for the
   half it is right about: the `classId` token itself must survive stripping, so a class named in a
   comment or quoted inside a longer string is rejected.

   ONE LIMIT, MEASURED RATHER THAN SUPPOSED: a probe that sets the class from a VARIABLE is invisible
   here. `stormarc.probe.js` does exactly that — `meta.classId = cls` inside a `trial(cls, rank, …)`
   helper, so it reports no class while actually benching a stormcaller and a ninja. It fails in the
   safe direction (a missing class, never a wrong one), and the classes are a REPORT column rather
   than part of any verdict, but a reader must not take an empty column for "no class". */
export function classesNamed(src, code = stripNonCode(src)){
  const out = new Set();
  const re = /classId\s*=\s*['"]([a-z]+)['"]/g;
  let m;
  while((m = re.exec(src))){
    if(code[m.index] === ' ') continue;      // the token was blanked: comment or string
    out.add(m[1]);
  }
  return [...out].sort();
}

export function auditProbe(src, name){
  const code = stripNonCode(src);
  const player = {}, synth = {};
  for(const d of PLAYER_DOORS){ const n = usesDoor(code, d); if(n) player[d] = n; }
  for(const d of SYNTHETIC_DOORS){ const n = usesDoor(code, d); if(n) synth[d] = n; }
  const hasPlayer = Object.keys(player).length > 0;
  const hasSynth = Object.keys(synth).length > 0;
  return {
    name,
    player, synth,
    classes: classesNamed(src, code),
    /* `neither` is not a fault: samefx, bside and the level probes read the game's own tables and
       drive nothing at all. */
    verdict: hasSynth && !hasPlayer ? 'synthetic-only'
           : hasSynth && hasPlayer ? 'mixed'
           : hasPlayer ? 'player-door'
           : 'neither',
  };
}

/* class -> attackStyle, read off the game's own CLASSES table. Section U's "nine of sixteen classes
   attack at range" is a claim with a date on it; this re-derives it every run instead. */
export function classStyles(gameSrc){
  const out = new Map();
  const re = /([a-z]+)\s*:\s*\{\s*disp\s*:\s*'[^']*'[^\n]*?attackStyle\s*:\s*'([a-z]+)'/g;
  let m;
  while((m = re.exec(gameSrc))) out.set(m[1], m[2]);
  return out;
}

/* A projectile basic attack is what misses the CLASS_BASIC dispatch, and `attackStyle` is what
   decides it (index.html: the 'mage' and 'ranger' styles fire, the rest swing). */
export const RANGED_STYLES = new Set(['mage', 'ranger']);

export function rangedClasses(gameSrc){
  return [...classStyles(gameSrc)].filter(([, s]) => RANGED_STYLES.has(s)).map(([c]) => c).sort();
}

export function auditAllProbes(dir = PROBE_DIR){
  return readdirSync(dir).filter(f => f.endsWith('.probe.js')).sort()
    .map(f => auditProbe(readFileSync(path.join(dir, f), 'utf8'), f.replace(/\.probe\.js$/, '')));
}

/* THE RATCHET, checked in BOTH directions by harness/test/probes.test.js.

   These are the probes that drive an effect ONLY through a door a player cannot open, as measured on
   2026-08-13. Each has been read and its verdict is in docs/SKILL_TRIAGE.md section Z — several are
   perfectly sound (a control, a yardstick, or an effect whose real trigger is not the player at all).
   The list exists so that a NEW probe written this way has to be looked at rather than joining them
   silently, and so that one that gains a player door has to be taken off the list rather than
   sitting here describing a probe that no longer matches it. */
export const KNOWN_SYNTHETIC = [
  'bounce', 'bounceby', 'charged', 'chrpotent', 'galvanize', 'juggernaut', 'monkflow',
  'monkmaster-shot', 'nincombo', 'overcharge', 'palburn', 'skyeye', 'stormarc', 'thickhide',
  'xcorrupt', 'xcorrupt-shot',
];

if(import.meta.filename === process.argv[1]){
  const rows = auditAllProbes();
  const ranged = new Set(rangedClasses(readFileSync(GAME, 'utf8')));
  const door = o => Object.entries(o).map(([k, v]) => `${k}×${v}`).join(' ') || '-';
  for(const r of rows){
    const rng = r.classes.filter(c => ranged.has(c));
    console.log(`${r.verdict.padEnd(15)} ${r.name.padEnd(20)} player[${door(r.player)}] synth[${door(r.synth)}]`
      + `${r.classes.length ? '  classes: ' + r.classes.join(',') : ''}${rng.length ? '  RANGED: ' + rng.join(',') : ''}`);
  }
  const n = v => rows.filter(r => r.verdict === v).length;
  console.log(`\n${rows.length} probes — ${n('synthetic-only')} synthetic-only, ${n('mixed')} mixed, `
    + `${n('player-door')} player-door, ${n('neither')} neither`);
}
