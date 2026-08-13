/* ─────────────────────────────────────────────────────────────────────────────
   harness/mp2/coop.js — do the two clients agree about WHERE THE MONSTERS ARE?

   Run:  node harness/mp2/coop.js
         node harness/mp2/coop.js --nopossync    # KNOWN-BAD control: guest gets ?nopossync=1
         node harness/mp2/coop.js --secs 30 --shots

   THE QUESTION. Co-op is host-authoritative for enemy EXISTENCE, HP and DEATH. Position is a
   separate, newer thing: enemySnap slot 6 (index.html:12494) carries e.active, applyEnemies stores
   the host's x,z into e.mx/e.mz only when that bit is set (:12516), and the enemy update lerps the
   guest's body toward it at k=min(1,dt*12) (:13560). Everything else about a monster — which way it
   walks, what it charges at — is simulated INDEPENDENTLY on both clients, and each client's AI
   chases its OWN G.p. So the two pictures are two different simulations pulled together by one
   correction term, and the only honest way to know how far apart they end up is to run both and
   subtract.

   WHY THE MEASUREMENT IS NOT "poll both clients and diff". Two CDP evaluates are two round trips on
   two websockets; the gap between them is unmeasured, and a monster moving 200 units/s turns a 60ms
   RPC skew into 12 units of fake drift. So neither client is polled during the run. Each one
   RECORDS ITSELF into an in-page ring on a 200ms interval, stamping every row with Date.now() —
   one OS clock, two processes — and the rows are pulled out once at the end and paired by nearest
   timestamp. Every pair carries its own skew, pairs worse than PAIR_MAX_SKEW_MS are dropped, and
   the surviving skew is reported next to the answer so a reader can price it themselves.

   WHY IT KEEPS THE PLAYERS ALIVE, AND HOW. Both heroes are level-1 warriors dropped into a campaign
   zone; a 30-second run that ends in a death at t=9s measures nine seconds. The fix is `p.invuln`,
   topped up by the same in-page interval that records — hurtPlayer returns early on invuln>0
   (index.html, the `p.invuln>0||p.dodgeTimer>0` line) BEFORE anything reads it, so no damage number,
   no knockback and no death path runs. It changes nothing an enemy's AI reads: enemies steer at
   G.p.x/z and know nothing about the player's HP. HP is recorded anyway, so the run can say whether
   the top-up was ever actually load-bearing.

   WHAT IT DOES NOT MEASURE. Nothing here exercises the Cloudflare TURN relay (/turn 404s under the
   local static server — see two.js). Nothing here is a latency figure: both clients are SwiftShader
   on one CPU, and a headless frame rate is not a player's frame rate. The correction is per-FRAME
   (dt*12), so a slower client corrects more slowly in wall-clock terms and this harness's frame
   rate is therefore part of the answer — which is why fps is recorded and printed rather than left
   for the reader to guess at.
   ───────────────────────────────────────────────────────────────────────────── */
import path from 'node:path';
import { twoClients, WHERE_JS } from './two.js';
import { hostAndJoin, PREWARM_ICE } from './connect.js';

const argv = process.argv.slice(2);
const has = (f) => argv.includes('--' + f);
const num = (f, d) => { const i = argv.indexOf('--' + f); return i >= 0 && argv[i + 1] ? +argv[i + 1] : d; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const REC_MS = 200;                 // in-page sample period
const PAIR_MAX_SKEW_MS = 70;        // a pair worse than this is not a simultaneous observation
const RUN_SECS = num('secs', 30);
const LEG_MS = 2600;                // how long each movement leg is held

/* ── the in-page recorder ────────────────────────────────────────────────────
   Deliberately dumb and self-contained: no reads of anything the harness has written, no calls into
   game functions that could themselves advance state. It reports e.x/e.z — the SAME fields the
   renderer draws from and the same fields the melee-contact test reads — so "where the client thinks
   this monster is" and "where the client is drawing this monster" are one number, not two.
   `mx` is recorded too: on the guest it is the host's last reported position for that body, so a
   guest row can say whether a correction target even existed, which is the difference between "the
   correction is weak" and "the correction never fired". */
const RECORDER = `(function(){
  if(window.__mp2rec && window.__mp2rec.stop) window.__mp2rec.stop();
  var rec = window.__mp2rec = { rows:[], frames:0, t0:Date.now(), invulnTopUps:0, stop:null };
  var rafSeen = function(){ rec.frames++; requestAnimationFrame(rafSeen); }; requestAnimationFrame(rafSeen);
  var iv = setInterval(function(){
    try{
      var G = __BF3.G; if(!G || !G.enemies || !G.p) return;
      var en = [];
      for(var i=0;i<G.enemies.length;i++){
        var e = G.enemies[i];
        if(e.mid == null || e.practice || e.dummy || e.bot) continue;
        en.push([ e.mid, Math.round(e.x), Math.round(e.z), e.dead?1:0, e.active?1:0,
                  (e.mx == null ? null : Math.round(e.mx)) ]);
      }
      if(G.p.invuln == null || G.p.invuln < 1){ G.p.invuln = 3; rec.invulnTopUps++; }
      rec.rows.push({ t:Date.now(), gt:+((G.time||0).toFixed(2)),
        px:Math.round(G.p.x), pz:Math.round(G.p.z), py:Math.round(G.p.y||0),
        hp:Math.round(G.p.hp), dn:G.p.downed?1:0, mode:__BF3.mode,
        zone:G.zone, area:G.area, hub:!!G.hub, rs:G.runSeed, en:en });
    }catch(err){ rec.err = String(err && err.message || err); }
  }, ${REC_MS});
  rec.stop = function(){ clearInterval(iv); };
  return true;
})()`;

const DUMP = `(function(){ var r = window.__mp2rec; if(!r) return null; r.stop();
  return { rows:r.rows, frames:r.frames, ms:Date.now()-r.t0, invulnTopUps:r.invulnTopUps, err:r.err||null }; })()`;

/* Where a client thinks it is, in fields a level test can compare rather than a sentence. */
const PLACE = `(function(){ var G=__BF3.G; if(!G) return null; return {
  mode:__BF3.mode, hub:!!G.hub, zone:G.zone, area:G.area, areaName:G.areaName||null,
  stage:G.stageIndex, areaSeed:G.areaSeed, runSeed:G.runSeed,
  mpZone:__BF3.MP.zone, mpRseed:__BF3.MP.rseed, gotEn:!!__BF3.MP._gotEn,
  noPosSync:!!__BF3.NO_POS_SYNC,
  enemies:G.enemies.filter(function(e){return !e.dead && e.mid!=null;}).length,
  mids:G.enemies.filter(function(e){return !e.dead && e.mid!=null;}).map(function(e){return e.mid;}).sort(function(a,b){return a-b;}),
  types:[...new Set(G.enemies.filter(function(e){return !e.dead;}).map(function(e){return e.type;}))].sort(),
  p:[Math.round(G.p.x),Math.round(G.p.z)] }; })()`;

const key = (type, code) =>
  `window.dispatchEvent(new KeyboardEvent(${JSON.stringify(type)},{code:${JSON.stringify(code)},bubbles:true})); 1`;

/* ── stats, spelled out rather than imported ─────────────────────────────── */
const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = (a, q) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const r1 = (v) => v == null ? null : Math.round(v * 10) / 10;

/* Pair host rows with guest rows by nearest wall clock. Both processes read the same OS clock, so
   Date.now() is comparable; what is NOT free is that the two recorders tick independently, so the
   nearest partner can still be up to half a period away. Every pair therefore carries its skew and
   the caller decides what to keep. */
function pairRows(hr, gr) {
  const out = [];
  let j = 0;
  for (const h of hr) {
    while (j + 1 < gr.length && Math.abs(gr[j + 1].t - h.t) <= Math.abs(gr[j].t - h.t)) j++;
    if (!gr[j]) break;
    out.push({ h, g: gr[j], skew: Math.abs(gr[j].t - h.t) });
  }
  return out;
}

function analyse(pairs) {
  const kept = pairs.filter(p => p.skew <= PAIR_MAX_SKEW_MS);
  const awake = [];       // every (sample, enemy) distance where the HOST has the body awake
  const asleep = [];      // ... and where it does not
  const perEnemy = new Map();   // mid -> distances (host-awake only)
  const guestAwakeWhenHostAwake = { yes: 0, no: 0 };
  const guestHasTarget = { yes: 0, no: 0 };
  let missingOnGuest = 0, hostAwakeSamples = 0, deadMismatch = 0;
  let maxRow = null;

  for (const { h, g, skew } of kept) {
    const gm = new Map();
    for (const e of g.en) gm.set(e[0], e);
    for (const e of h.en) {
      const [mid, hx, hz, hdead, hact] = e;
      if (hdead) continue;
      const q = gm.get(mid);
      if (!q) { missingOnGuest++; continue; }
      const [, gx, gz, gdead, gact, gmx] = q;
      if (gdead) { deadMismatch++; continue; }
      const d = Math.hypot(hx - gx, hz - gz);
      if (hact) {
        hostAwakeSamples++;
        awake.push(d);
        if (!perEnemy.has(mid)) perEnemy.set(mid, []);
        perEnemy.get(mid).push(d);
        gact ? guestAwakeWhenHostAwake.yes++ : guestAwakeWhenHostAwake.no++;
        (gmx != null) ? guestHasTarget.yes++ : guestHasTarget.no++;
        if (!maxRow || d > maxRow.d) maxRow = { d, mid, t: h.t, skew, host: [hx, hz], guest: [gx, gz], gact, gmx,
          hostPlayer: [h.px, h.pz], guestPlayer: [g.px, g.pz] };
      } else asleep.push(d);
    }
  }

  const perMedians = [...perEnemy].map(([mid, ds]) => ({ mid, n: ds.length, med: median(ds), max: Math.max(...ds) }))
    .sort((a, b) => b.med - a.med);

  return {
    pairs: pairs.length, kept: kept.length,
    skewMedian: median(kept.map(p => p.skew)), skewMax: kept.length ? Math.max(...kept.map(p => p.skew)) : null,
    hostAwakeSamples, missingOnGuest, deadMismatch,
    guestAwakeWhenHostAwake, guestHasTarget,
    awake: { n: awake.length, median: median(awake), p90: pct(awake, 0.9), max: awake.length ? Math.max(...awake) : null },
    asleep: { n: asleep.length, median: median(asleep), max: asleep.length ? Math.max(...asleep) : null },
    perEnemy: perMedians, worst: maxRow,
  };
}

/* How far the enemies actually travelled on the HOST during the window. Without it, a small drift
   number is unreadable: two clients that agree perfectly about a monster that never moved have
   proved nothing at all. */
function hostMotion(rows) {
  const first = new Map(), last = new Map(), pathLen = new Map(), everAwake = new Set();
  let prev = null;
  for (const r of rows) {
    for (const [mid, x, z, dead, act] of r.en) {
      if (dead) continue;
      if (act) everAwake.add(mid);
      if (!first.has(mid)) first.set(mid, [x, z]);
      const p = prev && prev.get(mid);
      if (p) pathLen.set(mid, (pathLen.get(mid) || 0) + Math.hypot(x - p[0], z - p[1]));
      last.set(mid, [x, z]);
    }
    prev = new Map(r.en.filter(e => !e[3]).map(e => [e[0], [e[1], e[2]]]));
  }
  const moved = [...everAwake].map(mid => pathLen.get(mid) || 0);
  const disp = [...everAwake].map(mid => {
    const a = first.get(mid), b = last.get(mid);
    return a && b ? Math.hypot(b[0] - a[0], b[1] - a[1]) : 0;
  });
  return { awakeCount: everAwake.size, pathMedian: median(moved), pathMax: moved.length ? Math.max(...moved) : null,
    dispMedian: median(disp), dispMax: disp.length ? Math.max(...disp) : null };
}

async function main() {
  const t0 = Date.now();
  const noSync = has('nopossync');
  const base = '/3d/index.html?hero3d=1&world3d=1&nobloom';
  const pathA = base, pathB = base + (noSync ? '&nopossync=1' : '');

  console.log('=== mp2/coop — do the two clients agree where the monsters are? ===');
  console.log('mode   → ' + (noSync ? 'KNOWN-BAD CONTROL: guest has ?nopossync=1 (position adoption disabled)'
    : 'shipping default (guest adopts host enemy positions)'));
  console.log('run    → ' + RUN_SECS + 's of play, in-page sampling every ' + REC_MS + 'ms');

  let pair = null, exit = 1;
  try {
    pair = await twoClients({ pathA, pathB, preBoot: PREWARM_ICE });
    await hostAndJoin(pair);

    /* Read the binding rather than assume WASD: KEYACTIONS is user-rebindable and a run that
       silently pressed nothing would report a beautifully synced set of monsters nobody disturbed. */
    const binds = await pair.evalA('({up:__BF3.keyAction("KeyW"),down:__BF3.keyAction("KeyS"),'
      + 'left:__BF3.keyAction("KeyA"),right:__BF3.keyAction("KeyD")})');
    console.log('keys   → ' + JSON.stringify(binds));
    const legs = [['KeyW', 'up'], ['KeyD', 'right'], ['KeyS', 'down'], ['KeyA', 'left']]
      .filter(([code, act]) => binds[act] === act);
    if (legs.length < 4) throw new Error('WASD does not map to the four move actions: ' + JSON.stringify(binds)
      + ' — the host would not move and the run would measure nothing.');

    // ── get both clients into a campaign zone ────────────────────────────────
    /* Zone 0 FIRST, because that is the co-op path a real party takes: hub → first gate. */
    const followed = async (zi) => (await pair.waitB(
      '(function(){var G=__BF3.G; return !!(G && !G.hub && G.zone===' + zi + ' && __BF3.mode==="play");})()',
      { timeoutMs: 25000, pollMs: 500 })).ok;

    console.log('\n-- entering a zone --');
    await pair.evalA('__BF3.enterZone(0)');
    const okA = await pair.waitA('(function(){var G=__BF3.G; return !!(G && !G.hub && G.zone===0 && __BF3.mode==="play");})()',
      { timeoutMs: 25000, pollMs: 500 });
    console.log('host   → enterZone(0) ' + (okA.ok ? 'ok in ' + (okA.ms / 1000).toFixed(1) + 's' : 'FAILED, last=' + JSON.stringify(okA.last)));
    let zone = 0, follow0 = await followed(0);
    console.log('guest  → followed into zone 0: ' + (follow0 ? 'YES' : 'NO'));
    if (!follow0) {
      console.log('         guest is at ' + (await pair.evalB(WHERE_JS)));
      console.log('         trying zone 1 instead, to get a two-client zone at all');
      await pair.evalA('__BF3.enterZone(1)');
      await pair.waitA('(function(){var G=__BF3.G; return !!(G && !G.hub && G.zone===1 && __BF3.mode==="play");})()',
        { timeoutMs: 25000, pollMs: 500 });
      const follow1 = await followed(1);
      console.log('guest  → followed into zone 1: ' + (follow1 ? 'YES' : 'NO'));
      if (!follow1) {
        console.log('\nUNVERIFIABLE — the guest never entered a campaign zone with the host, so there is no '
          + 'shared scene to measure enemy positions in.');
        console.log('  host  ' + (await pair.evalA(WHERE_JS)));
        console.log('  guest ' + (await pair.evalB(WHERE_JS)));
        console.log('  host  place ' + JSON.stringify(await pair.evalA(PLACE)));
        console.log('  guest place ' + JSON.stringify(await pair.evalB(PLACE)));
        exit = 3;
        return;
      }
      zone = 1;
    }

    /* Let the level settle and the first snapshots land before anything is judged. */
    await sleep(2500);
    const placeA = await pair.evalA(PLACE), placeB = await pair.evalB(PLACE);
    console.log('\n-- same level? --');
    console.log('  host  zone ' + placeA.zone + ' area ' + placeA.area + ' "' + placeA.areaName + '" stage ' + placeA.stage
      + ' areaSeed ' + placeA.areaSeed + ' runSeed ' + placeA.runSeed + '  enemies ' + placeA.enemies);
    console.log('  guest zone ' + placeB.zone + ' area ' + placeB.area + ' "' + placeB.areaName + '" stage ' + placeB.stage
      + ' areaSeed ' + placeB.areaSeed + ' runSeed ' + placeB.runSeed + '  enemies ' + placeB.enemies
      + '   NO_POS_SYNC=' + placeB.noPosSync);
    const midsA = new Set(placeA.mids), midsB = new Set(placeB.mids);
    const shared = [...midsA].filter(m => midsB.has(m));
    console.log('  mids  host ' + midsA.size + ', guest ' + midsB.size + ', shared ' + shared.length
      + (shared.length === midsA.size && midsA.size === midsB.size ? '  (identical sets)' : '  (SETS DIFFER)'));
    console.log('  types host ' + JSON.stringify(placeA.types) + '\n        guest ' + JSON.stringify(placeB.types));

    // ── 30 seconds of play ───────────────────────────────────────────────────
    console.log('\n-- ' + RUN_SECS + 's of play (host patrols; enemies wake and chase) --');
    await Promise.all([pair.evalA(RECORDER), pair.evalB(RECORDER)]);
    const runT0 = Date.now();
    let held = null, leg = 0;
    while (Date.now() - runT0 < RUN_SECS * 1000) {
      const want = legs[leg % legs.length][0];
      if (held !== want) {
        if (held) await pair.evalA(key('keyup', held));
        await pair.evalA(key('keydown', want));
        held = want;
      }
      leg++;
      const left = RUN_SECS * 1000 - (Date.now() - runT0);
      await sleep(Math.min(LEG_MS, Math.max(0, left)));
    }
    if (held) await pair.evalA(key('keyup', held));

    const [dA, dB] = await Promise.all([pair.evalA(DUMP), pair.evalB(DUMP)]);
    const fps = (d) => d && d.ms ? (d.frames / (d.ms / 1000)).toFixed(1) : '?';
    console.log('  recorded → host ' + dA.rows.length + ' rows @ ' + fps(dA) + ' fps'
      + ',  guest ' + dB.rows.length + ' rows @ ' + fps(dB) + ' fps');
    if (dA.err || dB.err) console.log('  !! recorder error: host=' + dA.err + ' guest=' + dB.err);

    const hostRows = dA.rows.filter(r => !r.hub && r.zone === zone);
    const guestRows = dB.rows.filter(r => !r.hub && r.zone === zone);
    console.log('  usable   → host ' + hostRows.length + ', guest ' + guestRows.length
      + ' (rows where the client is actually in zone ' + zone + ')');
    if (hostRows.length < 10 || guestRows.length < 10) {
      console.log('\nUNVERIFIABLE — one client left the zone during the run; there is no window to compare.');
      exit = 3; return;
    }

    const hp = hostRows.map(r => r.hp), gp = guestRows.map(r => r.hp);
    const travel = (rows) => rows.reduce((a, r, i) => i ? a + Math.hypot(r.px - rows[i - 1].px, r.pz - rows[i - 1].pz) : 0, 0);
    console.log('  host player walked ' + Math.round(travel(hostRows)) + ' units;  guest player walked '
      + Math.round(travel(guestRows)) + ' (guest was left standing on purpose)');
    console.log('  hp host ' + hp[0] + '→' + hp[hp.length - 1] + ', guest ' + gp[0] + '→' + gp[gp.length - 1]
      + '  (invuln top-ups: host ' + dA.invulnTopUps + ', guest ' + dB.invulnTopUps + ')');

    const motion = hostMotion(hostRows);
    console.log('\n-- did the monsters actually move? (host sim) --');
    console.log('  ' + motion.awakeCount + ' bodies were awake at some point');
    console.log('  path walked  median ' + r1(motion.pathMedian) + ',  max ' + r1(motion.pathMax) + ' units');
    console.log('  net displacement median ' + r1(motion.dispMedian) + ',  max ' + r1(motion.dispMax) + ' units');
    if ((motion.pathMedian || 0) < 60)
      console.log('  !! the bodies barely moved. A drift figure measured on stationary monsters says nothing.');

    // ── the answer ───────────────────────────────────────────────────────────
    const a = analyse(pairRows(hostRows, guestRows));
    console.log('\n-- host↔guest position disagreement --');
    console.log('  ' + a.kept + '/' + a.pairs + ' sample pairs kept (skew <= ' + PAIR_MAX_SKEW_MS + 'ms);'
      + ' pairing skew median ' + r1(a.skewMedian) + 'ms, max ' + r1(a.skewMax) + 'ms');
    console.log('  awake on the host: ' + a.awake.n + ' (sample,enemy) observations across '
      + a.perEnemy.length + ' bodies');
    console.log('    MEDIAN ' + r1(a.awake.median) + ' units    p90 ' + r1(a.awake.p90)
      + '    WORST ' + r1(a.awake.max));
    console.log('  asleep on the host (both sides parked at spawn; NOT corrected by design): '
      + a.asleep.n + ' obs, median ' + r1(a.asleep.median) + ', max ' + r1(a.asleep.max));
    console.log('  bodies the host had and the guest did not: ' + a.missingOnGuest
      + ';  alive on host / dead on guest: ' + a.deadMismatch);
    console.log('  when the host had a body awake, the guest also had it awake: '
      + a.guestAwakeWhenHostAwake.yes + ' vs asleep ' + a.guestAwakeWhenHostAwake.no
      + '   (the correction at index.html:13560 is inside the update loop, which `continue`s on !e.active)');
    console.log('  ... and the guest held a correction target (e.mx set): '
      + a.guestHasTarget.yes + ' vs none ' + a.guestHasTarget.no);

    console.log('\n  per-body median gap, worst 12:');
    for (const e of a.perEnemy.slice(0, 12))
      console.log('    mid ' + String(e.mid).padStart(4) + '  median ' + String(r1(e.med)).padStart(7)
        + '  max ' + String(r1(e.max)).padStart(7) + '  (' + e.n + ' obs)');
    if (a.perEnemy.length > 12) console.log('    … ' + (a.perEnemy.length - 12) + ' more');
    const medOfMed = median(a.perEnemy.map(e => e.med));
    console.log('  median of the per-body medians: ' + r1(medOfMed)
      + ';  worst per-body median: ' + r1(a.perEnemy.length ? a.perEnemy[0].med : null));

    if (a.worst) {
      console.log('\n  worst single observation: ' + r1(a.worst.d) + ' units, mid ' + a.worst.mid
        + ' (pair skew ' + a.worst.skew + 'ms)');
      console.log('    host draws it at ' + JSON.stringify(a.worst.host) + ', guest at ' + JSON.stringify(a.worst.guest)
        + ';  guest awake=' + a.worst.gact + ' mx=' + a.worst.gmx);
      console.log('    host player ' + JSON.stringify(a.worst.hostPlayer) + ', guest player ' + JSON.stringify(a.worst.guestPlayer));
    }

    /* REACH. 90-125 is the melee contact band this repo already uses (docs/MP_AUDIT.md, and the
       ping-target probe quoted at index.html:12170). Stated as a band, not a single number, because
       it is a band. */
    const REACH_LO = 90, REACH_HI = 125;
    console.log('\n-- against a ~' + REACH_LO + '-' + REACH_HI + ' unit attack reach --');
    const verdictLine = a.awake.median == null ? 'no awake observations'
      : (a.awake.median > REACH_HI ? 'the two screens disagree by MORE than a whole melee reach, typically'
        : a.awake.median > REACH_LO ? 'the typical disagreement is inside the melee band — a body can be in reach on one screen and not the other'
          : 'the typical disagreement is smaller than a melee reach');
    console.log('  ' + verdictLine + '  (median ' + r1(a.awake.median) + ')');
    console.log('  worst moment ' + r1(a.awake.max) + ' units = ' + r1((a.awake.max || 0) / REACH_HI) + '× the long end of the reach');

    exit = 0;
    console.log('\nDONE. Numbers above are this run only; see the notes printed by the connect gates for what was not exercised.');
  } catch (e) {
    console.log('\n-- FAILED --');
    console.log('  step: ' + (e.step || '(driver)'));
    console.log('  why : ' + (e.why || e.message));
    if (e.detail && Object.keys(e.detail).length) console.log('  detail: ' + JSON.stringify(e.detail, null, 2));
    if (!e.step) console.log(e.stack);
    exit = 2;
  } finally {
    if (pair) {
      for (const c of [pair.A, pair.B]) {
        const errs = c.errors();
        console.log('\n-- page errors [' + c.tag + '] (' + errs.length + ' distinct) --');
        errs.slice(0, 6).forEach(e => console.log('  x' + e.count + '  ' + e.text.slice(0, 160)));
        if (!errs.length) console.log('  none');
      }
      if (has('shots')) {
        const out = path.join(import.meta.dirname, 'out');
        for (const c of [pair.A, pair.B]) console.log('shot → ' + await c.shot(path.join(out, 'coop-' + c.tag + '.png')));
      }
      await pair.close();
    }
    console.log('\ntotal ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
    process.exit(exit);
  }
}

main();
