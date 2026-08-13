/* ─────────────────────────────────────────────────────────────────────────────
   harness/mp2/party.js — does PARTY SCALING actually fire with a REAL second peer?

   Run:  node harness/mp2/party.js
         node harness/mp2/party.js --noparty     // host boots with ?noparty=1 — the known-bad

   THE CLAIM UNDER TEST (index.html:7642-7674). `spawnEnemy` multiplies enemy HP by
   `partyHpMul() = 1 + 0.60*(partySize()-1)`, host-only, where partySize counts peers whose
   `q.zone === MP.zone`. Nothing in this repo has ever watched that with a second client attached,
   because no driver could open two. So the number is currently a reading of the source.

   METHOD, and why each choice is there:

   1. SOLO CONTROL FIRST, ON BOTH CLIENTS, BEFORE ANY MP EXISTS. A hosts nothing, B joins nothing;
      each enters the zone alone and its enemy population is recorded. Two controls rather than one
      because the party number is measured on A only, and "A solo == B solo" is what rules out the
      two Chromes differing (difficulty MODE, meta.hero, anything else that feeds hpScale).

   2. THE POPULATION IS MADE DETERMINISTIC, not merely comparable. `enterZone` draws
      `G.runSeed=Math.random()*1e9` (index.html:4200) and the elite/role rolls at :7695 are raw
      Math.random, so two runs of the same zone are two different monster lists. For the duration of
      the enterZone call ONLY, Math.random is swapped for a seeded LCG and then restored. Same seed
      in both conditions ⇒ same length, same type order, same elite flags ⇒ enemy #k solo and enemy
      #k in co-op are THE SAME MONSTER and maxHp is the only thing allowed to differ. The run checks
      that determinism held (identical type+elite sequence) and says so; if it did not hold it falls
      back to comparing per-(type,elite) and reports the downgrade rather than pretending.

   3. THE MULTIPLIER IS READ AT SPAWN TIME, IN THE SAME SYNCHRONOUS EXPRESSION AS enterZone.
      This matters and is the subtlest thing here. `loadArea()` spawns the enemies and `MP.onEnter(zi)`
      runs AFTER it (index.html:4217-4218 — and identically in nextArea at :4526-4527). So the
      partySize() that scales a zone's mobs is evaluated against the PREVIOUS zone: MP.zone is still
      the hub when the hub's occupants walk into zone 0. Reading partyHpMul() a moment later would
      report a different number than the one the monsters were built with, so it is read in the same
      eval, immediately before, and reported as `mulAtSpawn`.

   4. HOST-AUTHORITATIVE IS CHECKED ON THE GUEST'S OWN LIST. The guest spawns its own copy
      (applyEnemies, :12508) — which runs its own spawnEnemy, where partyHpMul is 1 because
      partySize returns 1 for a non-host (:7667) — and then overwrites hp/maxHp from the host's
      snapshot slot 5. So the guest's maxHp per mid must equal the host's. Equal ⇒ authoritative;
      guest lower ⇒ the snapshot is not carrying maxHp; guest higher ⇒ it is being squared.

   5. NEGATIVE CONTROL, IN-RUN AND FREE. The guest calls MP.leave(), the host waits for its peer
      list to empty, and the same zone is built again from the same seed. If the party numbers do
      not fall back to the solo numbers, the multiplier is not tracking the party — it is stuck.
      `--noparty` is the second, independent negative: it boots the HOST with ?noparty=1, which the
      game ships (:7665) precisely so this assertion can be watched to fail.

   WHAT THIS RUN DOES NOT COVER: /turn 404s under the local static server, so ICE is STUN-only and
   the Cloudflare TURN relay is not exercised (see connect.js). Nothing here speaks to it.
   ───────────────────────────────────────────────────────────────────────────── */
import { twoClients } from './two.js';
import { hostAndJoin, PREWARM_ICE } from './connect.js';

const argv = process.argv.slice(2);
const has = (f) => argv.includes('--' + f);

const ZONES = [0, 3];        // one low-tier and one mid-tier: stageScale() differs, so the ratio is
const LCG_SEED = 20260813;   // tested at two different absolute HP levels rather than one.
const PARTY_HP_PER_ALLY = 0.60;   // index.html:7664 — the value under test, restated so a drift shows

/* Snapshot the live population. Excludes the bodies whose maxHp is written by something OTHER than
   hpScale — crack walls (`e.hp=e.maxHp=shots*22`, :7639) and the training dummy
   (`trainingDummyHp(level)`, :7679) — because those are deliberately not scaled and averaging them
   in would mute a real change. Both are named so a reader can see what was dropped. */
const SNAP = `(function(){ var G=window.__BF3&&__BF3.G; if(!G||!G.enemies) return null;
  var out=[], skipped=0;
  for(var i=0;i<G.enemies.length;i++){ var e=G.enemies[i];
    if(e.practice||e.dummy||e.crackWall||e.type==='dummy'||e.type==='crackwall'){ skipped++; continue; }
    out.push([e.mid, e.type, Math.round(e.maxHp), e.elite?1:0, e.boss?1:0]); }
  return { zone:G.zone, area:G.area, tier:G.zoneTier, stage:G.stageIndex, name:G.areaName,
           ngHp:G.ngHp, runSeed:G.runSeed, areaSeed:G.areaSeed, skipped:skipped, n:out.length, en:out }; })()`;

/* enterZone + snapshot in ONE synchronous expression — see note 3 in the header. The LCG is the
   textbook Numerical-Recipes constants; it is not being asked to be a good PRNG, only the same one
   twice. Restored in a finally, because leaving a stubbed Math.random behind would silently
   determinise every later measurement in the run. */
function buildJs(zone, seed) {
  return `(function(){
    var M = __BF3.MP, G0 = __BF3.G;
    var pre = { mul: __BF3.partyHpMul(), size: __BF3.partySize(),
                mpZone: M.zone, mpActive: !!M.active, mpHost: !!M.isHost, mpPvp: !!M.pvp,
                peerZones: (function(){ var o={}; for(var id in (M.peers||{})) o[id]=M.peers[id].zone; return o; })() };
    var _r = Math.random, s = (${seed}) >>> 0, err = null;
    Math.random = function(){ s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    try { __BF3.enterZone(${zone}); }
    catch(e){ err = String((e && e.message) || e); }
    finally { Math.random = _r; }
    var snap = ${SNAP};
    return { pre: pre, err: err, snap: snap,
             postMul: __BF3.partyHpMul(), postSize: __BF3.partySize(), postMpZone: M.zone };
  })()`;
}

const MP_ZONES = `(function(){ var M=__BF3.MP; var o={}; for(var id in (M.peers||{})) o[id]=M.peers[id].zone;
  return { mpZone:M.zone, size:__BF3.partySize(), mul:__BF3.partyHpMul(), peers:o,
           conns:(M.conns||[]).length, gameZone:(__BF3.G&&__BF3.G.zone) }; })()`;

/* ── comparison ─────────────────────────────────────────────────────────────
   Returns the per-monster ratio when the two populations are the same monsters, and says loudly
   when they are not. `same` is the whole basis of the strong reading; without it the ratios below
   are comparing different monster lists and only the per-type medians mean anything. */
function compare(solo, party) {
  const key = (e) => e[1] + (e[3] ? '+elite' : '');
  const sSeq = solo.en.map(key).join('|'), pSeq = party.en.map(key).join('|');
  const same = sSeq === pSeq && solo.en.length === party.en.length;

  const rows = [];
  if (same) {
    for (let i = 0; i < solo.en.length; i++) {
      rows.push({ type: key(solo.en[i]), solo: solo.en[i][2], party: party.en[i][2],
                  ratio: solo.en[i][2] ? party.en[i][2] / solo.en[i][2] : null });
    }
  } else {
    /* Fallback: median maxHp per (type,elite). Weaker — it cannot see a single monster that failed
       to scale — so the caller is told which reading it got. */
    const med = (pop) => { const m = new Map();
      for (const e of pop.en) { const k = key(e); (m.get(k) || m.set(k, []).get(k)).push(e[2]); }
      const o = {}; for (const [k, v] of m) { v.sort((a, b) => a - b); o[k] = v[Math.floor(v.length / 2)]; }
      return o; };
    const a = med(solo), b = med(party);
    for (const k of Object.keys(a)) if (b[k] != null)
      rows.push({ type: k, solo: a[k], party: b[k], ratio: a[k] ? b[k] / a[k] : null });
  }
  const ratios = rows.map(r => r.ratio).filter(r => r != null).sort((a, b) => a - b);
  return { same, rows, n: rows.length,
           min: ratios[0], max: ratios[ratios.length - 1],
           median: ratios.length ? ratios[Math.floor(ratios.length / 2)] : null,
           soloSeq: sSeq.slice(0, 200), partySeq: pSeq.slice(0, 200) };
}

/* Per-type table, deduped — a 40-mob zone is 40 rows of six distinct numbers otherwise. */
function table(cmp) {
  const byType = new Map();
  for (const r of cmp.rows) { if (!byType.has(r.type)) byType.set(r.type, { ...r, count: 0 }); byType.get(r.type).count++; }
  return [...byType.values()].map(r =>
    '    ' + r.type.padEnd(18) + ' x' + String(r.count).padEnd(4)
    + ' solo ' + String(r.solo).padStart(6) + '   party ' + String(r.party).padStart(6)
    + '   x' + (r.ratio == null ? '?' : r.ratio.toFixed(3))).join('\n');
}

async function main() {
  const t0 = Date.now();
  const noparty = has('noparty');
  const base = '/3d/index.html?hero3d=1&world3d=1&nobloom';
  const pathA = base + (noparty ? '&noparty=1' : '');
  const expectMul = noparty ? 1 : (1 + PARTY_HP_PER_ALLY);

  console.log('=== mp2/party — does a real second peer harden the fight? ===');
  console.log('zones  → ' + JSON.stringify(ZONES) + '   lcg seed ' + LCG_SEED);
  console.log('host   → ' + pathA + (noparty ? '   (!! KNOWN-BAD: scaling disabled on the host)' : ''));
  console.log('expect → partyHpMul ' + expectMul.toFixed(2) + ' with one ally in the same zone\n');

  let pair = null, code = 1;
  const results = { zones: {}, noparty };
  try {
    pair = await twoClients({ pathA, pathB: base, preBoot: PREWARM_ICE });

    // ── 1. SOLO CONTROLS, both clients, no MP anywhere ────────────────────────
    const solo = { A: {}, B: {} };
    for (const zi of ZONES) {
      for (const tag of ['A', 'B']) {
        const r = await (tag === 'A' ? pair.evalA : pair.evalB)(buildJs(zi, LCG_SEED + zi));
        if (r.err) throw new Error('solo enterZone(' + zi + ') threw on ' + tag + ': ' + r.err);
        if (!r.snap || !r.snap.n) throw new Error('solo zone ' + zi + ' on ' + tag + ' produced '
          + (r.snap ? r.snap.n : 'no') + ' enemies — nothing to measure. snap=' + JSON.stringify(r.snap));
        if (r.pre.mul !== 1) throw new Error('solo control on ' + tag + ' had partyHpMul ' + r.pre.mul
          + ', not 1 — MP state leaked into the control');
        solo[tag][zi] = r.snap;
        console.log('solo   ' + tag + ' zone ' + zi + ' "' + r.snap.name + '" tier ' + r.snap.tier
          + ' stage ' + r.snap.stage + ' → ' + r.snap.n + ' enemies, mul ' + r.pre.mul
          + ', hp ' + JSON.stringify(r.snap.en.slice(0, 4).map(e => e[1] + ':' + e[2])));
      }
      const cross = compare(solo.A[zi], solo.B[zi]);
      console.log('       A-vs-B solo control: ' + (cross.same ? 'identical populations' : 'DIFFERENT populations')
        + ', ratio ' + (cross.median == null ? '?' : cross.median.toFixed(3))
        + (cross.median === 1 ? ' ✓ the two clients agree' : '  !! the two Chromes do not agree solo'));
      results.zones[zi] = { crossClient: cross.median, crossSame: cross.same };
    }

    // Back to the hub so the connect flow starts where it was built to start.
    await Promise.all([pair.evalA('__BF3.openHub(); 1'), pair.evalB('__BF3.openHub(); 1')]);
    for (const [tag, wait] of [['A', pair.waitA], ['B', pair.waitB]]) {
      const r = await wait('__BF3.mode === "play" && !!__BF3.G && !!__BF3.G.hub', { timeoutMs: 30000 });
      if (!r.ok) throw new Error(tag + ' never returned to the hub after the solo control: ' + JSON.stringify(r.last));
    }
    console.log('hub    ✓ both clients back in the Waystation\n');

    // ── 2. CONNECT (connect.js does the whole verified handshake) ─────────────
    const conn = await hostAndJoin(pair, { log: (s) => console.log('  ' + s) });
    console.log('conn   ✓ room ' + conn.code + ', guest ' + conn.guestId + '\n');

    // ── 3. PARTY MEASUREMENT ──────────────────────────────────────────────────
    const party = {};
    for (const zi of ZONES) {
      /* The gate that makes this a party measurement rather than a hopeful one: the ally must be
         counted BEFORE the zone is built, because the build is what reads it. */
      const counted = await pair.waitA('__BF3.partySize() >= 2', { timeoutMs: 30000 });
      if (!counted.ok) throw new Error('host still counts a party of ' + JSON.stringify(counted.last)
        + ' before zone ' + zi + ' — the ally is connected but not in the host\'s zone, so nothing '
        + 'would scale and the run would report a false negative. ' + JSON.stringify(await pair.evalA(MP_ZONES)));

      const r = await pair.evalA(buildJs(zi, LCG_SEED + zi));
      if (r.err) throw new Error('party enterZone(' + zi + ') threw: ' + r.err);
      party[zi] = r.snap;
      console.log('party  A zone ' + zi + ' → ' + r.snap.n + ' enemies'
        + '   partySize@spawn ' + r.pre.size + '   partyHpMul@spawn ' + r.pre.mul
        + '   (MP.zone was ' + r.pre.mpZone + ', peers ' + JSON.stringify(r.pre.peerZones) + ')');
      results.zones[zi].mulAtSpawn = r.pre.mul;
      results.zones[zi].sizeAtSpawn = r.pre.size;

      /* The stale-zone window, measured rather than described. Right after the build, MP.zone has
         moved on and the ally has not — so the count drops to 1 until the guest's next `pos` lands.
         Enemies already spawned keep their HP; anything spawned during this window does not. */
      const t1 = Date.now();
      const back = await pair.waitA('__BF3.partySize() >= 2', { timeoutMs: 30000, pollMs: 150 });
      results.zones[zi].regainMs = back.ok ? Date.now() - t1 : null;
      console.log('       partySize after the host moved zone: ' + r.postSize
        + ' → back to 2 after ' + (back.ok ? (Date.now() - t1) + 'ms' : 'NEVER (30s)'));

      // Guest follows; compare its copy of the same mids.
      const followed = await pair.waitB('__BF3.G && __BF3.G.zone === ' + zi + ' && !__BF3.G.hub', { timeoutMs: 40000 });
      if (followed.ok) {
        await pair.waitB('(__BF3.MP.peers && __BF3.G.enemies.filter(function(e){return e.mid!=null&&!e.dead;}).length > 0)',
          { timeoutMs: 20000 });
        const g = await pair.evalB(SNAP);
        const hostByMid = new Map(r.snap.en.map(e => [e[0], e[2]]));
        let matched = 0, equal = 0, lower = 0, higher = 0, sample = [];
        for (const e of (g && g.en) || []) { const h = hostByMid.get(e[0]); if (h == null) continue;
          matched++; if (e[2] === h) equal++; else if (e[2] < h) lower++; else higher++;
          if (sample.length < 4) sample.push(e[1] + ' mid' + e[0] + ' host ' + h + ' guest ' + e[2]); }
        results.zones[zi].auth = { matched, equal, lower, higher, guestN: g ? g.n : 0 };
        console.log('       guest in zone ' + zi + ': ' + (g ? g.n : 0) + ' enemies, ' + matched
          + ' mids shared with the host — ' + equal + ' equal, ' + lower + ' lower, ' + higher + ' higher'
          + (sample.length ? '\n         ' + sample.join('\n         ') : ''));
      } else {
        results.zones[zi].auth = { followed: false, last: followed.last };
        console.log('       !! guest never followed into zone ' + zi + ' (' + JSON.stringify(followed.last) + ')');
      }

      const cmp = compare(solo.A[zi], party[zi]);
      results.zones[zi].cmp = { same: cmp.same, n: cmp.n, min: cmp.min, max: cmp.max, median: cmp.median };
      console.log('  -- zone ' + zi + ': solo vs party (' + (cmp.same ? 'same monsters, per-body' : '!! DIFFERENT populations, per-type medians only') + ') --');
      console.log(table(cmp));
      console.log('    ratio  min ' + (cmp.min || 0).toFixed(3) + '  median ' + (cmp.median || 0).toFixed(3)
        + '  max ' + (cmp.max || 0).toFixed(3) + '   expected ' + expectMul.toFixed(3) + '\n');
    }

    // ── 4. NEGATIVE CONTROL — the ally leaves, the fight should soften back ────
    console.log('leave  → guest calls MP.leave()');
    await pair.evalB('__BF3.MP.leave(); 1');
    const emptied = await pair.waitA('Object.keys(__BF3.MP.peers).length === 0', { timeoutMs: 25000 });
    console.log('       host peer list empty after ' + (emptied.ok ? emptied.ms + 'ms' : 'NEVER (25s) — last ' + JSON.stringify(emptied.last)));
    if (emptied.ok) {
      const zi = ZONES[0];
      const r = await pair.evalA(buildJs(zi, LCG_SEED + zi));
      const cmp = compare(solo.A[zi], r.snap);
      results.after = { mul: r.pre.mul, size: r.pre.size, median: cmp.median, same: cmp.same };
      console.log('after  A zone ' + zi + ' alone again → partyHpMul@spawn ' + r.pre.mul
        + ', ratio vs solo control ' + (cmp.median == null ? '?' : cmp.median.toFixed(3))
        + (cmp.median === 1 ? '  ✓ back to solo numbers' : '  !! did NOT return to solo numbers'));
    }

    // ── verdict ───────────────────────────────────────────────────────────────
    console.log('\n-- verdict --');
    let allOk = true;
    const checks = [];
    for (const zi of ZONES) {
      const z = results.zones[zi];
      checks.push(['zone ' + zi + ': clients agree solo', z.crossClient === 1]);
      checks.push(['zone ' + zi + ': partySize@spawn === 2', z.sizeAtSpawn === 2]);
      checks.push(['zone ' + zi + ': partyHpMul@spawn === ' + expectMul.toFixed(2), Math.abs(z.mulAtSpawn - expectMul) < 1e-9]);
      checks.push(['zone ' + zi + ': same monsters both runs', z.cmp.same === true]);
      checks.push(['zone ' + zi + ': every body scaled ' + expectMul.toFixed(2) + ' (±0.01)',
        z.cmp.min != null && Math.abs(z.cmp.min - expectMul) < 0.01 && Math.abs(z.cmp.max - expectMul) < 0.01]);
      if (z.auth && z.auth.matched != null)
        checks.push(['zone ' + zi + ': guest maxHp === host maxHp (' + z.auth.matched + ' bodies)',
          z.auth.matched > 0 && z.auth.equal === z.auth.matched]);
      else checks.push(['zone ' + zi + ': guest followed the host', false]);
    }
    if (results.after) checks.push(['ally leaves → back to solo HP', results.after.median === 1 && results.after.mul === 1]);
    for (const [name, ok] of checks) { if (!ok) allOk = false; console.log('  ' + (ok ? 'ok   ' : 'FAIL ') + name); }
    code = allOk ? 0 : 1;
    console.log('\n' + (allOk ? 'PARTY SCALING FIRES ✓' : 'ONE OR MORE ASSERTIONS FAILED — see above'));
    if (noparty) console.log('(--noparty: the FAILs above are the known-bad doing its job. '
      + 'The one that matters is that the ratio is 1.000 and not ' + (1 + PARTY_HP_PER_ALLY).toFixed(2) + '.)');
    console.log('\nraw ' + JSON.stringify(results));
  } catch (e) {
    console.log('\n-- FAILED --\n  ' + (e.message || e));
    if (e.detail) console.log('  detail: ' + JSON.stringify(e.detail, null, 2).slice(0, 4000));
    if (!e.step) console.log(e.stack);
    code = 2;
  } finally {
    if (pair) {
      for (const c of [pair.A, pair.B]) {
        const errs = c.errors().filter(e => !/Couldn't load texture|GLTFLoader/.test(e.text));
        console.log('\n-- page errors [' + c.tag + '] (' + errs.length + ' distinct, GLTF texture noise filtered) --');
        errs.slice(0, 6).forEach(e => console.log('  x' + e.count + '  ' + e.text.slice(0, 200)));
        if (!errs.length) console.log('  none');
      }
      await pair.close();
    }
    console.log('\ntotal ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
    process.exit(code);
  }
}

main();
