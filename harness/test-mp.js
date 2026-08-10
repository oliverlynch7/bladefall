/* Multiplayer render correctness.

   Oliver, joining a PvP match: "I turned invisible on my screen, but I could see him, and the same
   happened for him." The 3D layer kept a single pending SLOT, so the local hero was queued first
   and every ally overwrote it. This suite asserts the game's own frame draws everybody, and that
   whoever gets dropped when the party is too big, it is never you.

   The probe is harness/probes/mp.probe.js, so the suite and a hand-run
   `node _shot/shot.js --scene 0 --eval @harness/probes/mp.probe.js` are the same text.

   SCOPE, stated so nobody mistakes it for more than it is. This proves the RENDER path - queue,
   cap, order, and that a peer body survives the trip to the renderer. It proves nothing about
   CONNECTION behaviour: no WebRTC is opened, the peers are stand-ins written straight into
   MP.peers. Two real machines remain the final check for anything about the wire.

   ONE BROWSER LAUNCH FOR ALL THREE PARTY SIZES. They are three states of one loop, not three
   different levels, and doing them in one page also means the three results cannot disagree about
   which build they were measuring. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runScenario } from './drive.js';

const PROBE = readFileSync(join(import.meta.dirname, 'probes', 'mp.probe.js'), 'utf8');

/* HERO3D_MAX is 6 (index.html:3425) and the assertions deliberately do NOT pin it. What is being
   tested is the INVARIANT the cap exists to protect - "whatever else gets dropped it must never
   again be you" - so a future run that raises the cap to eight tunes a number rather than turning
   this suite red. The observed figure is reported either way, so a change is never silent. */
const OVER = 8;   // party size used for the cap case; must be > HERO3D_MAX

export async function runMpTests(){
  const failures = [];
  let pass = 0;

  const r = await runScenario({ scene: 0, waitMs: 9000, js: PROBE });
  if(r.skip) return { pass: 0, fail: 0, failures: [], skipped: r.skip };

  const at = (n) => (r.cases || []).find(c => c.peers === n);
  const check = (id, ok, detail) => { if(ok) pass++; else failures.push({ check: id, detail }); };

  const solo = at(0), party = at(3), crowd = at(OVER);

  check('a frame reached the renderer at all',
        !!(solo && solo.frames), solo ? `frames ${solo.frames}` : 'no case recorded');

  /* Single player. If this fails the suite is measuring something other than the 3D hero. */
  check('single player draws exactly the local hero',
        !!solo && solo.drawn === 1 && solo.localFirst, JSON.stringify(solo));

  /* THE BUG. On the single-slot build this comes back drawn 1, and the one drawn is an ally. */
  check('a party of three draws you and all three allies',
        !!party && party.drawn === 4, JSON.stringify(party));
  check('you are drawn first in a party',
        !!party && party.localFirst, JSON.stringify(party));

  /* Over the cap: allies may be dropped, you may not. */
  check('an oversized party is capped',
        !!crowd && crowd.drawn > 1 && crowd.drawn < OVER + 1,
        crowd ? `drawn ${crowd.drawn} of ${OVER + 1} queued` : 'no case recorded');
  check('the cap never drops you',
        !!crowd && crowd.localFirst, JSON.stringify(crowd));

  /* A peer is not a player object - it is the pseudo-player drawPeer() assembles - so it is a real
     thing to get wrong, and drawPeer's own try/catch would hide it behind the voxel fallback. */
  check('no hero body threw on the way to the renderer', !r.threw, String(r.threw));

  return { pass, fail: failures.length, failures,
           cap: crowd ? crowd.drawn : null };
}

if(import.meta.filename === process.argv[1]){
  runMpTests().then(r => {
    for(const f of r.failures) console.log(`FAIL mp ${f.check}: ${f.detail}`);
    console.log(`mp: ${r.pass} pass, ${r.fail} fail` +
                (r.skipped ? ' (skipped: ' + r.skipped + ')' : '') +
                (r.cap ? ` — cap draws ${r.cap}` : ''));
    process.exit(r.fail ? 1 : 0);
  }).catch(e => { console.error(e); process.exit(1); });
}
