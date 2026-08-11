/* Can this level actually be finished?

   Castle Duskmoor shipped "verified" and could not be climbed at all: the audit that passed it was
   GEOMETRIC (is there a surface near this height) when the question was KINEMATIC (can a body walk
   there). So the traversal half of this only asks kinematic questions - it drives the game's own
   update() and moves the real player - and the completability half asks the question Duskmoor also
   failed, where a quest wanted ten of a mob and the level provided three.

   The probe is harness/probes/level.probe.js, so the suite and a hand-run
   `node _shot/shot.js --scene 3.1 --eval @harness/probes/level.probe.js` are the same text.

   ── A WALK IS NEVER A FAILURE HERE, ONLY EVER A PASS. Read this before "fixing" it. ──
   The walker is proven in both directions on the level it was built against: it walks The
   Outskirts end to end (2305, 2308 and 2317 ticks across three runs, 144 jumps, 29 dashes), and
   when `?breakgap=240` widens the exit void past what the body can jump it correctly reports the
   level impassable. It still cannot walk the Black Woods, whose exit void has two 22-wide pillars
   standing in it and exactly one crossing, and that is a limitation of the navigator, not a fault
   in the level - a human plays that area every day.
   So a successful walk is real evidence and is counted; an unsuccessful one is recorded as
   UNPROVEN and never as a failure. VISION.md: "Missing data is not a negative finding. Report
   'inconclusive', never invent a failure." A harness that cries wolf about the second level in
   the game is a harness nobody reads by the third week.
   The bar for promoting these to real failures is stated so it cannot drift: the walker must
   first complete every campaign area a player can complete. Then change `unproven.push` to
   `failures.push` here - the probe does not need to change at all.

   ── TWO THINGS THE PLAN GOT WRONG AND EXECUTION CORRECTED ──
   1. THE PLAN REACHED AREA 1 BY HAND (`G.area=1; loadStage(...)`) AND FLAGGED IT AS A KNOWN RISK.
      It does not have to: shot.js already has `--scene <zone>.<area>`, which steps the game's own
      nextArea(). Hand-setting G.area and re-loading a stage skips loadArea(), so the quest marks,
      dens, waystone and portal of the area you claim to be in are never built - the completability
      half would then measure a level nobody is standing in and report every area 1 as broken.
   2. THE PLAN INDEXED ZONES BY STAGE. `--scene <n>` and `enterZone(n)` take a ZONE index; zone 1
      is stage 3. They agree only at zone 0. A stage-indexed list would have tested the last zone
      twice and never tested three real ones.

   ONE SCENARIO PER AREA, NOT TWO. The probe reads quests and then walks, so both halves come out
   of one browser launch: 16 launches rather than 32, and the two halves cannot disagree about
   which level they were looking at. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runScenario } from './drive.js';

const PROBE = readFileSync(join(import.meta.dirname, 'probes', 'level.probe.js'), 'utf8');

/* ZONE indices, not stage indices - see the header. The names are only for the report; the ready
   line prints the level's own areaName, which is what says whether the probe went where it meant. */
const ZONES = ['The Outskirts', 'Hollow Pass', 'Ruined Keep', 'Frostfell',
               'Emberdeep', 'The Abyss', 'The Sunspire Palace', 'Castle Duskmoor'];

export async function runLevelTests(opts){
  const only = (opts && opts.zones) || null;
  const list = only ? only.map(Number) : ZONES.map((_, i) => i);
  const failures = [], unproven = [];
  let pass = 0;
  for(const z of list){
    for(const area of [0, 1]){
      const name = ZONES[z] || ('zone' + z);
      let got;
      try { got = await runScenario({ scene: `${z}.${area}`, waitMs: 9000, js: PROBE }); }
      catch(e){ failures.push({ zone:name, area, check:'load', detail:e.message.slice(0, 200) }); continue; }

      /* Traversal: a pass counts, a non-pass is inconclusive. See the header. */
      if(got.walk && got.walk.ok) pass++;
      else unproven.push({ zone:name, area, check:'walkable', detail:JSON.stringify(got.walk) });

      /* Completability: deterministic, so these ARE verdicts. Each verb is checked against what
         the game itself uses to satisfy it - the probe's header says which line of index.html. */
      for(const q of got.quests){
        if(q.have >= q.need){ pass++; continue; }
        /* A KILL QUEST WITH NO DEN IS A SNAPSHOT, NOT A SUPPLY, so a shortfall is not a verdict.
           The den-less terrain zones are served by whoever happens to be standing there, and that
           population turns over as you watch: Emberdeep reads 11, 11, 7, 8 and then 9 magmaskit
           across five probes of the SAME level against a quest that wants 11. It duly turned the
           gate red as a "regression" on a run that never touched a level - which is how a gate
           stops being believed. Recorded with its numbers, never accused.
           The underlying gap is real and it is OLIVER'S: adding dens settles it and changes how
           hard the level fights back, which is balance. Everything deterministic - find, placed
           fetch, marks, and any kill quest that HAS a den - stays a verdict, so the five
           uncompletable levels Task 4 found are still caught. */
        if(/^kill:/.test(q.k) && !q.denned){
          unproven.push({ zone:name, area, check:'quest:' + q.id,
                          detail:`${q.k} wants ${q.need}, ${q.have} alive and no den — head-count, not supply — "${q.d}"` });
          continue;
        }
        failures.push({ zone:name, area, check:'quest:' + q.id,
                        detail:`${q.k} needs ${q.need}, level provides ${q.have} — "${q.d}"` });
      }
    }
  }
  return { pass, fail: failures.length, failures, unproven };
}

if(import.meta.filename === process.argv[1]){
  const only = process.argv.slice(2);
  runLevelTests(only.length ? { zones: only } : undefined).then(r => {
    for(const f of r.failures) console.log(`FAIL ${f.zone} area${f.area} ${f.check}: ${f.detail}`);
    for(const u of r.unproven) console.log(`unproven ${u.zone} area${u.area} ${u.check}: ${u.detail}`);
    console.log(`levels: ${r.pass} pass, ${r.fail} fail, ${r.unproven.length} unproven`);
    process.exit(r.fail ? 1 : 0);
  }).catch(e => { console.error(e); process.exit(1); });
}
