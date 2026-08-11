/* Multiplayer render correctness.

   Oliver, joining a PvP match: "I turned invisible on my screen, but I could see him, and the same
   happened for him." Cause: the 3D layer kept a single pending SLOT, so the local hero was queued
   first and every ally overwrote it. This asserts the queue draws everyone, draws YOU first, and
   drops allies rather than you when the frame budget runs out.

   SCOPE, stated so nobody mistakes it for more than it is: this proves the RENDER path draws every
   queued hero. It does not prove connection behaviour - no session is held, no peer is real. Two
   real machines remain the final check for anything about the network.

   ── WHAT THE PLAN GOT WRONG AND EXECUTION CORRECTED ──
   The plan's probe assigned `window.__hero3dPending` itself and then asserted that it was an array
   of length 3 whose head was G.p. That is a test of the probe, not of the game: it passes just as
   happily against the single-slot version whose bug is the entire reason the queue exists, because
   nothing in it ever calls the game's queueing code. The plan reached for that shape because it had
   correctly noticed MP is closure-local - and stopped one step short. Measured rather than assumed:
   EVERYTHING from index.html:1019 down is inside one `(function(){ "use strict"; ... })()`, so
   drawHero3, flushHero3D and HERO3D_MAX are closure-local too, and a probe sees only what is
   explicitly hung on window. Three names are now exported on __BF3 next to the other
   exported-for-the-harness entries, and the probe drives the game's own queueing and its own flush.

   The known-bad is `?heroslot=1`, carried permanently by the probe the way level.probe.js carries
   `?breakgap` - see its header for why a bug you must break the repo to reproduce is one nobody
   re-runs. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runScenario } from './drive.js';

const PROBE = readFileSync(join(import.meta.dirname, 'probes', 'mp.probe.js'), 'utf8');

/* Zone 0, The Outskirts - a ZONE index, not a stage index, and the one destination whose readiness
   wait is documented and quick. Nothing here is zone-specific; it needs a live 3D hero layer and
   somewhere to stand. */
const SCENE = 0;

export async function runMpTests(opts){
  const url = (opts && opts.url) || undefined;
  const failures = [];
  let pass = 0;

  let r;
  try { r = await runScenario({ scene: SCENE, waitMs: 9000, js: PROBE, url }); }
  catch(e){
    return { pass: 0, fail: 1, failures: [{ check: 'load', detail: e.message.slice(0, 200) }] };
  }

  /* A layer that is off is not a layer that is broken. ?hero3d=0 is a supported way to run the
     game, and reporting it as three failures would be inventing them. */
  if(r.skip) return { pass: 0, fail: 0, failures: [], skipped: r.skip };

  const cap = r.cap;
  const check = (name, ok, detail) => { if(ok) pass++; else failures.push({ check: name, detail }); };

  /* Each trial queues heroes through the game and then flushes. `drawn` counts dispatches to
     window.drawHero3D; `localAt` is where G.p landed in that draw order. */
  const T = [
    ['local queued first', r.localFirst, 3],
    ['local queued last',  r.localLast,  3],
    ['crowd past the cap', r.crowd,      cap + 1],
  ];
  for(const [name, t, expect] of T){
    if(!t){ check(name, false, 'trial missing from probe output'); continue; }
    check(`${name}: every hero drawn`, t.drawn === expect,
          `drew ${t.drawn} of ${expect} (queued ${t.queued})`);
    check(`${name}: local hero drawn first`, t.localAt === 0,
          t.localAt < 0 ? 'the local hero was never drawn — this is the invisibility bug'
                        : `local hero drawn at index ${t.localAt}, not 0`);
    check(`${name}: queue cleared after flush`, t.cleared === true,
          'flush left ' + JSON.stringify(t.queued) + ' behind — heroes would double-draw next frame');
    check(`${name}: nothing threw`, !t.threw && !t.flushThrew,
          JSON.stringify({ queue: t.threw, flush: t.flushThrew }));
    check(`${name}: renderer drew without error`, !(t.renderErrs || []).length,
          JSON.stringify(t.renderErrs));
  }

  /* The cap is a frame-rate guard, so it has to actually bite: 12 allies plus you must not be 13
     renders. Separate from the count above so a cap raised to 99 is reported as the cap changing
     rather than as heroes going missing. */
  check('the cap bites', r.crowd && r.crowd.drawn === cap + 1,
        `cap ${cap}, drew ${r.crowd && r.crowd.drawn}`);

  return { pass, fail: failures.length, failures, cap, at: r.at, slot: !!r.slot };
}

if(import.meta.filename === process.argv[1]){
  /* `node harness/test-mp.js --bad` runs the known-bad. It must FAIL; a pass means the assertions
     cannot see the bug they exist for. */
  const bad = process.argv.includes('--bad');
  const url = bad ? '/3d/index.html?hero3d=1&world3d=1&nobloom&heroslot=1' : undefined;
  runMpTests({ url }).then(r => {
    for(const f of r.failures) console.log(`FAIL mp ${f.check}: ${f.detail}`);
    console.log(`mp: ${r.pass} pass, ${r.fail} fail` + (r.skipped ? ` (skipped: ${r.skipped})` : '') +
                (r.at ? `  [at ${r.at}, cap ${r.cap}${r.slot ? ', SINGLE-SLOT self-test' : ''}]` : ''));
    if(bad){
      console.log(r.fail ? 'known-bad: correctly detected ✓' : 'known-bad: NOT DETECTED — assertions are blind ✗');
      process.exit(r.fail ? 0 : 1);
    }
    process.exit(r.fail ? 1 : 0);
  }).catch(e => { console.error(e); process.exit(1); });
}
