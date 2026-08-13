/* ─────────────────────────────────────────────────────────────────────────────
   harness/mp2/pingfx.js — does a PING and a COMBAT VISUAL actually cross the wire,
   and does the combat visual deal damage on the far side?

   Run:  node harness/mp2/pingfx.js
         node harness/mp2/pingfx.js --noping   # KNOWN-BAD: B loads ?noping=1 (recvMark returns early)
         node harness/mp2/pingfx.js --shots

   Builds on harness/mp2/two.js + connect.js: two real Chrome processes, one static server, both
   clients in the hub in mode==='play' (which is what makes MP.tick run at all), host + join + the
   full 7-gate handshake from connect.js. Everything below happens on a session connect.js has
   already proved is live in both directions.

   WHAT IS MEASURED, AND WHY THE PREDICATE IS THE ONE IT IS.

   1. PING.  Sent with the game's own `__BF3.dropPing()` (index.html:12153) — not MP.sendMark
      directly — because dropPing is what the HUD button calls, and it is the half that picks the
      target, applies the 0.6s cooldown and draws the local copy. Received-side truth is
      `G.marks` on the OTHER client, filtered by `m.by === the sender's MP id`, because that is
      what `addMark` (:12139) writes and what `drawMarks` reads. NOT "recvMark was called" — a
      packet arriving is not a marker existing, and `?noping=1` is the shipped flag that makes
      exactly those two disagree.
      So both are recorded: a pass-through wrapper on MP.recvMark counts ARRIVALS, and G.marks
      measures the EFFECT. --noping must show arrivals > 0 and effect == 0. An assertion nobody
      has watched fail is an assertion nobody should believe, and this one has a flag built for it.

   2. COMBAT VISUALS.  The sender is given a real ranged weapon (`__BF3.giveWeapon`) and told to
      attack by setting `__BF3.input.attack` — the exported input object the game's own update()
      reads at index.html:13370 (`if(input.attack) playerAttack(1)`). No synthetic projectile is
      ever pushed into G.projectiles by this file: MP.sendCombat (:12392) only picks up
      `owner==='player' && !pr._mp && !pr.visual`, so a hand-made projectile would be testing the
      harness's ability to fill in a shape.
      Received-side truth is `G.projectiles.filter(p => p.owner === 'peerfx')` — the tag
      recvCombat (:12417) writes and nothing else in the file writes.

   3. DAMAGE, MEASURED ON A BODY THAT CAN BLEED.  The obvious check — "the receiving player's HP
      did not drop" — IS WORTHLESS IN THE HUB and would have been reported as a pass:
      hurtPlayer returns at index.html:11648 (`if(G.hub) return;`) before touching hp, so in the
      Waystation nothing can hurt you and a no-damage result there means nothing.
      So the target is a DUMMY ENEMY spawned on the RECEIVER with the game's own spawnEnemy, at
      the SENDER's coordinates, so every relayed projectile spawns inside it. Two reasons that is
      safe rather than clever: `e.dummy=true` is skipped by enemySnap (:12494) so the host never
      broadcasts it, and skipped by applyEnemies' cull (:12522) so a guest's copy is never
      reconciled away — the receiver's dummy is invisible to the session, which is the point.
      hitEnemy's guest-relay branch (:10869) also excludes `e.dummy`, so a guest's dummy takes
      local damage normally instead of being deferred to the host.
      THREE readings, not one, because one would prove nothing:
        a) peer volley → dummy HP delta          (the claim)
        b) local volley → dummy HP delta          (the INSTRUMENT: proves this dummy can bleed
                                                   through the exact same projectile-collision code)
        c) peer volley with `visual` cleared      (the GUARD: same projectile, same geometry, same
                                                   dummy, flag flipped by hand → does it bleed now?)
      (b) and (c) are the watched failures. Without them "0 damage" is indistinguishable from
      "the projectiles were never near the dummy" and from "dummies cannot be damaged in a hub".

   4. SWINGS.  A melee swing is NOT a cfx packet. It rides on presence: selfState carries
      `at` (p.atkTimer) and `sc` (p.swingCombo) at :12246, and applyPos re-raises the peer's `at`
      at :12251, which drawPeer feeds to drawHero3 as atkTimer. atkTimer is 0.18-0.26s and a CDP
      poll is slower than that, so polling `MP.peers[id].at` would miss most swings and undercount
      by an unknown amount. Measured instead with a pass-through counter on MP.applyPos, which
      sees every packet — the count is of swings that CROSSED THE WIRE, and the max `at` observed
      is reported next to it so the number is not just a tally.

   WHAT THIS FILE DOES NOT DO. It creates no files in public/, edits nothing, and commits nothing.
   Everything it changes lives in a throwaway headless Chrome profile that is deleted on exit.
   ───────────────────────────────────────────────────────────────────────────── */
import path from 'node:path';
import { twoClients } from './two.js';
import { hostAndJoin, PREWARM_ICE } from './connect.js';

const argv = process.argv.slice(2);
const has = (f) => argv.includes('--' + f);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const J = (v) => JSON.stringify(v);

/* ── page-side instrumentation ───────────────────────────────────────────────
   PASS-THROUGH ONLY. Each wrapper records and then calls the original with the original `this`,
   so `?noping=1` still short-circuits inside recvMark exactly as it ships. If these wrappers
   changed behaviour the known-bad run would be measuring the harness. */
const INSTRUMENT = `(function(){
  if(window.__MPQ) return 'already';
  var M = __BF3.MP;
  var Q = window.__MPQ = { marks:[], cfx:[], pos:{n:0,swings:0,maxAt:0,maxSc:0}, t0:performance.now(),
                           trk:null, peak:{peerfx:0,vsw:0} };
  var _rm = M.recvMark, _rc = M.recvCombat, _ap = M.applyPos;
  M.recvMark = function(d,c){
    Q.marks.push({ by:(d&&d.by)||null, n:(d&&d.n)||null, x:d&&d.x, z:d&&d.z, y:d&&d.y,
                   mid:(d&&d.mid==null)?null:d.mid, ms:Math.round(performance.now()-Q.t0) });
    return _rm.call(this,d,c); };
  M.recvCombat = function(d,c){
    Q.cfx.push({ proj:(d&&d.proj)?d.proj.length:0, sw:(d&&d.sw)?d.sw.length:0,
                 ms:Math.round(performance.now()-Q.t0) });
    return _rc.call(this,d,c); };
  M.applyPos = function(q,s){
    Q.pos.n++;
    if(s && s.at > 0){ Q.pos.swings++; if(s.at > Q.pos.maxAt) Q.pos.maxAt = s.at; }
    if(s && (s.sc||0) > Q.pos.maxSc) Q.pos.maxSc = s.sc||0;
    return _ap.call(this,q,s); };
  /* Sampled from the driver's poll loop. Latches ONE arrived projectile object and follows it, so
     "it moved" is one body over time and not two different bodies at two different places. */
  Q.track = function(){
    var G = __BF3.G, out = [];
    var pe = (G.projectiles||[]).filter(function(p){ return p.owner === 'peerfx'; });
    var vs = (G.shockwaves||[]).filter(function(s){ return !!s.visual; });
    if(pe.length > Q.peak.peerfx) Q.peak.peerfx = pe.length;
    if(vs.length > Q.peak.vsw)    Q.peak.vsw    = vs.length;
    if(!Q.trk && pe.length){ Q.trk = { path:[], o:pe[0] }; }
    if(Q.trk && Q.trk.o){ Q.trk.path.push([Math.round(Q.trk.o.x), Math.round(Q.trk.o.z),
                                           +(Q.trk.o.life||0).toFixed(2)]); }
    return { peerfx:pe.length, vsw:vs.length, proj:(G.projectiles||[]).length,
             sample: pe.length ? { x:Math.round(pe[0].x), z:Math.round(pe[0].z), y:Math.round(pe[0].y),
                                   vx:Math.round(pe[0].vx), vz:Math.round(pe[0].vz),
                                   visual:!!pe[0].visual, owner:pe[0].owner,
                                   dmg:(pe[0].dmg===undefined?'undefined':pe[0].dmg),
                                   size:pe[0].size, color:pe[0].color } : null };
  };
  return 'installed';
})()`;

const QSNAP = `(function(){ var Q=window.__MPQ; return { marks:Q.marks.length, cfx:Q.cfx.length,
  cfxProj:Q.cfx.reduce(function(a,c){return a+c.proj;},0),
  cfxSw:Q.cfx.reduce(function(a,c){return a+c.sw;},0),
  pos:Q.pos.n, swings:Q.pos.swings, maxAt:Q.pos.maxAt, maxSc:Q.pos.maxSc,
  peak:Q.peak }; })()`;

/* Marks on the receiver, attributed to one sender id. `by` is set by addMark from the packet, so
   a marker with the wrong `by` is a marker this test did not cause. */
const marksFrom = (id) => `(function(sender){
  var G=__BF3.G, ms=(G&&G.marks)||[];
  var mine=ms.filter(function(m){ return m.by===sender; });
  var arr=window.__MPQ.marks.filter(function(m){ return m.by===sender; });
  var L=mine.length?mine[mine.length-1]:null;
  return { arrivals:arr.length, arrLast:arr.length?arr[arr.length-1]:null,
           gMarksTotal:ms.length, gMarksFromSender:mine.length,
           last: L ? { x:Math.round(L.x), z:Math.round(L.z), y:Math.round(L.y),
                       name:L.name, col:L.col, by:L.by, mid:L.mid, age:+L.t.toFixed(2), life:L.life } : null };
})(${J(id)})`;

const DROP_PING = `(function(){ var m=__BF3.dropPing();
  return m ? { x:Math.round(m.x), z:Math.round(m.z), y:Math.round(m.y), name:m.name, by:m.by,
               mid:m.mid, col:m.col, marksHere:__BF3.G.marks.length } : {none:true, mode:__BF3.mode}; })()`;

const WHOAMI = `(function(){ var M=__BF3.MP, p=__BF3.G.p;
  return { myId:M.myId, isHost:!!M.isHost, zone:M.zone, x:Math.round(p.x), z:Math.round(p.z),
           y:Math.round(p.y), yaw:+(p.yaw||0).toFixed(3), hp:Math.round(p.hp),
           hub:!!__BF3.G.hub, enemies:__BF3.G.enemies.length, noping:/[?&]noping=1/.test(location.search) }; })()`;

const setPos = (x, z) => `(function(){ var p=__BF3.G.p; p.x=${x}; p.z=${z}; p.vx=0; p.vz=0;
  return { x:Math.round(p.x), z:Math.round(p.z), y:Math.round(p.y) }; })()`;

const giveRanged = `(function(){ var n=__BF3.giveWeapon('frostwand','rare','Harness Wand');
  var w=__BF3.G.p.weapon;
  return { name:n, arche:w.arche, cls:w.cls, cd:w.cd, charge:!!__BF3.isChargeWeapon(w),
           speed:w.proj&&w.proj.speed, size:w.proj&&w.proj.size, range:w.proj&&w.proj.range }; })()`;

const giveMelee = `(function(){ var n=__BF3.giveWeapon('sword','rare','Harness Sword');
  var w=__BF3.G.p.weapon;
  return { name:n, arche:w.arche, cls:w.cls, cd:w.cd, charge:!!__BF3.isChargeWeapon(w), range:w.range }; })()`;

/* The receiver's target. Spawned with the game's own spawnEnemy so it is a real body in
   G.enemies with a real mid, then flagged `dummy` (invisible to enemySnap and to applyEnemies'
   cull) and widened so a 620 u/s projectile stepping ~44 units per frame at these frame rates
   cannot tunnel through it — a tunnelled miss and a blocked hit look identical in the HP column.
   HP is raised so the dummy survives a whole volley and the delta is the reading. */
const spawnTarget = (x, z, r, tag) => `(function(){
  var e=__BF3.spawnEnemy('dummy',${x},${z}); if(!e) return null;
  e.dummy=true; e.practice=false; e.active=true; e.dropT=0; e.speed=0; e.dmg=0;
  e.r=${r}; e.h=${r * 2}; e.hp=e.maxHp=100000; e._tag=${J(tag)};
  return { tag:${J(tag)}, x:Math.round(e.x), z:Math.round(e.z), y:Math.round(e.y||0),
           r:e.r, h:e.h, hp:e.hp, mid:e.mid, active:!!e.active, dummy:!!e.dummy }; })()`;

const readTarget = (tag) => `(function(){ var es=__BF3.G.enemies||[];
  for(var i=0;i<es.length;i++){ var e=es[i]; if(e._tag===${J(tag)})
    return { hp:Math.round(e.hp), maxHp:e.maxHp, dead:!!e.dead, hitFlash:+(e.hitFlash||0).toFixed(3),
             x:Math.round(e.x), z:Math.round(e.z), y:Math.round(e.y||0) }; }
  return null; })()`;

const ATTACK_ON = `(function(){ __BF3.input.attack=true; return __BF3.input.attack; })()`;
const ATTACK_OFF = `(function(){ __BF3.input.attack=false;
  return { attack:__BF3.input.attack, mine:(__BF3.G.projectiles||[]).filter(function(p){return p.owner==='player';}).length }; })()`;

const MY_PROJ = `(function(){ var G=__BF3.G;
  var mine=(G.projectiles||[]).filter(function(p){ return p.owner==='player'; });
  return { mine:mine.length, marked:mine.filter(function(p){return !!p._mp;}).length,
           sw:(G.shockwaves||[]).length, atkCd:+(G.p.atkCd||0).toFixed(2), atkTimer:+(G.p.atkTimer||0).toFixed(2),
           swingId:G.p.swingId||0 }; })()`;

/* THE GUARD CONTROL. Same projectile object the game just received, same dummy, same frame budget
   — only `visual` (and the owner tag that routes it to the enemy branch at :13591) changed by
   hand. If the HP column stays flat here too, the flat reading above was geometry, not the guard. */
const FLIP_GUARD = (ms) => `new Promise(function(res){
  var es=__BF3.G.enemies||[], e=null;
  for(var i=0;i<es.length;i++) if(es[i]._tag==='REMOTE') e=es[i];
  if(!e) return res({err:'no REMOTE dummy'});
  var before=e.hp, flipped=0, seen=0, t0=performance.now();
  var iv=setInterval(function(){
    var pr=__BF3.G.projectiles||[];
    for(var i=0;i<pr.length;i++){ var p=pr[i];
      if(p.owner==='peerfx'){ seen++;
        if(p.visual){ p.visual=false; p.owner='player'; p.dmg=25; p.kb=0; p.hitSet=[]; flipped++; } } }
    if(performance.now()-t0>${ms}){ clearInterval(iv);
      res({ flipped:flipped, seenPeerfx:seen, hpBefore:Math.round(before), hpAfter:Math.round(e.hp),
            delta:Math.round(before-e.hp) }); }
  },25);
})`;

/* ── driver-side helpers ────────────────────────────────────────────────────── */
async function pollWhile(client, expr, ms, everyMs) {
  const t0 = Date.now(), out = [];
  while (Date.now() - t0 < ms) {
    const r = await client.eval(expr);
    out.push(r.error ? { error: String(r.error).split('\n')[0] } : r.value);
    await sleep(everyMs);
  }
  return out;
}

/* One volley, driven from the SENDER, sampled on the RECEIVER while it is in flight.
   The sampling has to happen DURING the volley: a relayed projectile lives
   range/speed ≈ 0.84s, so a poll taken after the fact reads an empty list and would report a
   working relay as a dead one. */
async function volley(sender, receiver, ms, sampleMs) {
  await sender.evalOk(ATTACK_ON);
  const samples = await pollWhile(receiver, '__MPQ.track()', ms, sampleMs);
  const mine = await sender.evalOk(MY_PROJ);
  await sender.evalOk(ATTACK_OFF);
  // one more sweep after the trigger is released, to catch the tail of the last shots
  const tail = await pollWhile(receiver, '__MPQ.track()', 600, sampleMs);
  return { samples: samples.concat(tail), senderProj: mine };
}

function peak(samples, key) {
  return samples.reduce((a, s) => (s && typeof s[key] === 'number' && s[key] > a) ? s[key] : a, 0);
}

/* ── the run ─────────────────────────────────────────────────────────────────*/
async function main() {
  const t0 = Date.now();
  const noping = has('noping');
  const base = '/3d/index.html?hero3d=1&world3d=1&nobloom';
  const pathA = base;
  const pathB = base + (noping ? '&noping=1' : '');

  console.log('=== mp2/pingfx — pings and combat visuals across two real clients ===');
  console.log('path A → ' + pathA);
  console.log('path B → ' + pathB + (noping ? '   (!! KNOWN-BAD: B drops the mark RECEIVE handler)' : ''));

  const R = { noping, ping: {}, cfx: {}, dmg: {}, swings: {}, notes: [] };
  let pair = null, exit = 1;

  try {
    pair = await twoClients({ pathA, pathB, preBoot: PREWARM_ICE });
    const conn = await hostAndJoin(pair);
    const A = pair.A, B = pair.B;
    const guestId = conn.guestId;
    console.log('\n-- session -- host id "h", guest id ' + J(guestId) + ', room ' + conn.code);

    const inst = await Promise.all([A.evalOk(INSTRUMENT), B.evalOk(INSTRUMENT)]);
    console.log('probe  → A ' + inst[0] + '   B ' + inst[1]);

    let who = await Promise.all([A.evalOk(WHOAMI), B.evalOk(WHOAMI)]);
    console.log('at     → A ' + J(who[0]) + '\n         B ' + J(who[1]));

    /* Push the two heroes apart so "A's projectiles" and "B's projectiles" occupy different
       ground. connect.js already nudged them; this makes the separation a stated number rather
       than whatever the nudge left. Read back rather than assumed — hub collision gets a vote. */
    const cx = Math.round((who[0].x + who[1].x) / 2), cz = Math.round((who[0].z + who[1].z) / 2);
    await A.evalOk(setPos(cx - 380, cz - 260));
    await B.evalOk(setPos(cx + 380, cz + 260));
    await sleep(700);
    who = await Promise.all([A.evalOk(WHOAMI), B.evalOk(WHOAMI)]);
    const sep = Math.round(Math.hypot(who[0].x - who[1].x, who[0].z - who[1].z));
    console.log('split  → A (' + who[0].x + ',' + who[0].z + ')  B (' + who[1].x + ',' + who[1].z + ')  '
      + sep + ' units apart');
    R.separation = sep;

    // ══ 1. PING A → B ════════════════════════════════════════════════════════
    console.log('\n══ 1. ping  A → B ══');
    const bBefore = await B.evalOk(marksFrom('h'));
    const tPing = Date.now();
    const pingA = await A.evalOk(DROP_PING);
    console.log('  A dropPing() → ' + J(pingA));
    const gotB = await B.waitFor('(__BF3.G.marks||[]).some(function(m){return m.by==="h";})',
      { timeoutMs: 4000, pollMs: 80 });
    const bAfter = await B.evalOk(marksFrom('h'));
    const arrivedB = await B.waitFor('__MPQ.marks.some(function(m){return m.by==="h";})',
      { timeoutMs: 2000, pollMs: 80 });
    R.ping.aToB = {
      sent: pingA, arrivedAtRecvMark: arrivedB.ok, packetsFromA: bAfter.arrivals,
      markCreated: gotB.ok, latencyMs: gotB.ok ? Date.now() - tPing : null,
      before: bBefore.gMarksFromSender, after: bAfter.gMarksFromSender, last: bAfter.last,
    };
    console.log('  B recvMark arrivals from "h": ' + bAfter.arrivals
      + (bAfter.arrLast ? '  last=' + J(bAfter.arrLast) : ''));
    console.log('  B G.marks from "h": ' + bBefore.gMarksFromSender + ' → ' + bAfter.gMarksFromSender
      + (gotB.ok ? '  in ' + (Date.now() - tPing) + 'ms (incl. CDP round trips)' : '  — NEVER APPEARED (4s)'));
    if (bAfter.last) console.log('  B marker: ' + J(bAfter.last));
    if (pingA && bAfter.last) {
      const dx = Math.abs(pingA.x - bAfter.last.x), dz = Math.abs(pingA.z - bAfter.last.z);
      R.ping.aToB.coordDelta = { dx, dz };
      console.log('  coord delta sender→receiver: dx=' + dx + ' dz=' + dz + '  (sendMark rounds to integers)');
    }

    // ══ 2. PING B → A ════════════════════════════════════════════════════════
    console.log('\n══ 2. ping  B → A ══');
    const aBefore = await A.evalOk(marksFrom(guestId));
    const tPing2 = Date.now();
    const pingB = await B.evalOk(DROP_PING);
    console.log('  B dropPing() → ' + J(pingB));
    const gotA = await A.waitFor('(__BF3.G.marks||[]).some(function(m){return m.by===' + J(guestId) + ';})',
      { timeoutMs: 4000, pollMs: 80 });
    const aAfter = await A.evalOk(marksFrom(guestId));
    R.ping.bToA = {
      sent: pingB, packetsFromB: aAfter.arrivals, markCreated: gotA.ok,
      latencyMs: gotA.ok ? Date.now() - tPing2 : null,
      before: aBefore.gMarksFromSender, after: aAfter.gMarksFromSender, last: aAfter.last,
    };
    console.log('  A recvMark arrivals from guest: ' + aAfter.arrivals);
    console.log('  A G.marks from guest: ' + aBefore.gMarksFromSender + ' → ' + aAfter.gMarksFromSender
      + (gotA.ok ? '  in ' + (Date.now() - tPing2) + 'ms' : '  — NEVER APPEARED (4s)'));
    if (aAfter.last) console.log('  A marker: ' + J(aAfter.last));
    if (pingB && aAfter.last) {
      const dx = Math.abs(pingB.x - aAfter.last.x), dz = Math.abs(pingB.z - aAfter.last.z);
      R.ping.bToA.coordDelta = { dx, dz };
      console.log('  coord delta sender→receiver: dx=' + dx + ' dz=' + dz);
    }

    /* addMark calls skillRing (index.html:12146), which pushes an ordinary NON-visual shockwave —
       and sendCombat's sw filter (:12395) skips only `_mp`, `visual` and duel bot rings. So a ping
       is expected to ALSO travel as a cfx `sw`. Counted rather than asserted; it is either a real
       double-draw or it is not, and the number says which. */
    const qA1 = await A.evalOk(QSNAP), qB1 = await B.evalOk(QSNAP);
    R.ping.cfxSideEffect = { A: { cfxPackets: qA1.cfx, sw: qA1.cfxSw, proj: qA1.cfxProj },
                             B: { cfxPackets: qB1.cfx, sw: qB1.cfxSw, proj: qB1.cfxProj } };
    console.log('\n  cfx traffic after two pings and NO attacks yet:');
    console.log('    A received ' + qA1.cfx + ' cfx packets carrying ' + qA1.cfxSw + ' rings, ' + qA1.cfxProj + ' projectiles');
    console.log('    B received ' + qB1.cfx + ' cfx packets carrying ' + qB1.cfxSw + ' rings, ' + qB1.cfxProj + ' projectiles');

    // ══ 3. COMBAT VISUALS + DAMAGE, A → B ════════════════════════════════════
    console.log('\n══ 3. projectiles  A → B  (receiver = B, the guest) ══');
    const wpn = await Promise.all([A.evalOk(giveRanged), B.evalOk(giveRanged)]);
    console.log('  weapons → A ' + J(wpn[0]) + '\n            B ' + J(wpn[1]));
    R.cfx.weapon = wpn[0];

    const tgtRemoteB = await B.evalOk(spawnTarget(who[0].x, who[0].z, 300, 'REMOTE'));
    const tgtLocalB = await B.evalOk(spawnTarget(who[1].x, who[1].z, 300, 'LOCAL'));
    console.log('  B target REMOTE (at A\'s feet) → ' + J(tgtRemoteB));
    console.log('  B target LOCAL  (at B\'s feet) → ' + J(tgtLocalB));

    const remote0 = await B.evalOk(readTarget('REMOTE'));
    const local0 = await B.evalOk(readTarget('LOCAL'));
    const bHp0 = (await B.evalOk(WHOAMI)).hp;
    const qB2 = await B.evalOk(QSNAP);

    console.log('  A attacks for 2.5s, B sampled every 120ms …');
    const vA = await volley(A, B, 2500, 120);
    const qB3 = await B.evalOk(QSNAP);
    const remote1 = await B.evalOk(readTarget('REMOTE'));
    const bHp1 = (await B.evalOk(WHOAMI)).hp;
    const trkB = await B.evalOk('(function(){ var t=__MPQ.trk; return t?{steps:t.path.length,path:t.path.slice(0,10)}:null; })()');

    const peakPeerfx = peak(vA.samples, 'peerfx'), peakVsw = peak(vA.samples, 'vsw');
    const sample = (vA.samples.find(s => s && s.sample) || {}).sample || null;
    R.cfx.aToB = {
      senderSpawned: vA.senderProj, cfxPackets: qB3.cfx - qB2.cfx,
      cfxProj: qB3.cfxProj - qB2.cfxProj, cfxSw: qB3.cfxSw - qB2.cfxSw,
      peakPeerfxAlive: peakPeerfx, peakVisualRings: peakVsw, sample, track: trkB,
    };
    R.dmg.aToB = { target: 'REMOTE dummy on B at A\'s coords',
      hpBefore: remote0.hp, hpAfter: remote1.hp, delta: remote0.hp - remote1.hp,
      recvPlayerHpBefore: bHp0, recvPlayerHpAfter: bHp1 };
    console.log('  A spawned (its own, marked _mp for relay): ' + J(vA.senderProj));
    console.log('  B cfx packets +' + (qB3.cfx - qB2.cfx) + ' carrying +' + (qB3.cfxProj - qB2.cfxProj)
      + ' projectiles and +' + (qB3.cfxSw - qB2.cfxSw) + ' rings');
    console.log('  B peak peerfx projectiles alive at once: ' + peakPeerfx
      + '   peak visual rings: ' + peakVsw);
    if (sample) console.log('  B peerfx sample: ' + J(sample));
    if (trkB) console.log('  B tracked ONE relayed projectile for ' + trkB.steps + ' samples: ' + J(trkB.path));
    console.log('  B REMOTE dummy HP ' + remote0.hp + ' → ' + remote1.hp
      + '   (delta ' + (remote0.hp - remote1.hp) + ')');
    console.log('  B player HP ' + bHp0 + ' → ' + bHp1);

    // ── 3b. THE INSTRUMENT: can that dummy bleed at all? ─────────────────────
    console.log('\n══ 3b. instrument control — B shoots its OWN dummy ══');
    const vB = await volley(B, A, 1800, 200);
    const local1 = await B.evalOk(readTarget('LOCAL'));
    R.dmg.control = { target: 'LOCAL dummy on B at B\'s own coords, hit by B\'s OWN projectiles',
      hpBefore: local0.hp, hpAfter: local1.hp, delta: local0.hp - local1.hp,
      senderSpawned: vB.senderProj };
    console.log('  B LOCAL dummy HP ' + local0.hp + ' → ' + local1.hp
      + '   (delta ' + (local0.hp - local1.hp) + ')  ← if this is 0 the whole damage column is meaningless');

    // ── 3c. THE GUARD: clear `visual` on the arrived copies ─────────────────
    console.log('\n══ 3c. guard control — clear `visual` on B\'s copies of A\'s shots ══');
    const remote2 = await B.evalOk(readTarget('REMOTE'));
    await A.evalOk(ATTACK_ON);
    const flip = await B.evalOk(FLIP_GUARD(2600));
    await A.evalOk(ATTACK_OFF);
    const remote3 = await B.evalOk(readTarget('REMOTE'));
    R.dmg.guard = Object.assign({}, flip, { hpBeforeOuter: remote2.hp, hpAfterOuter: remote3.hp });
    console.log('  ' + J(flip));
    console.log('  B REMOTE dummy HP ' + remote2.hp + ' → ' + remote3.hp
      + '   (delta ' + (remote2.hp - remote3.hp) + ')');

    // ══ 4. PROJECTILES B → A (the other transport: guest→host, then host renders) ═══
    console.log('\n══ 4. projectiles  B → A  (receiver = A, the host) ══');
    const tgtRemoteA = await A.evalOk(spawnTarget(who[1].x, who[1].z, 300, 'REMOTE'));
    console.log('  A target REMOTE (at B\'s feet) → ' + J(tgtRemoteA));
    const aRem0 = await A.evalOk(readTarget('REMOTE'));
    const aHp0 = (await A.evalOk(WHOAMI)).hp;
    const qA2 = await A.evalOk(QSNAP);
    const vB2 = await volley(B, A, 2500, 120);
    const qA3 = await A.evalOk(QSNAP);
    const aRem1 = await A.evalOk(readTarget('REMOTE'));
    const aHp1 = (await A.evalOk(WHOAMI)).hp;
    const trkA = await A.evalOk('(function(){ var t=__MPQ.trk; return t?{steps:t.path.length,path:t.path.slice(0,10)}:null; })()');
    R.cfx.bToA = {
      senderSpawned: vB2.senderProj, cfxPackets: qA3.cfx - qA2.cfx,
      cfxProj: qA3.cfxProj - qA2.cfxProj, cfxSw: qA3.cfxSw - qA2.cfxSw,
      peakPeerfxAlive: peak(vB2.samples, 'peerfx'), peakVisualRings: peak(vB2.samples, 'vsw'),
      sample: (vB2.samples.find(s => s && s.sample) || {}).sample || null, track: trkA,
    };
    R.dmg.bToA = { hpBefore: aRem0.hp, hpAfter: aRem1.hp, delta: aRem0.hp - aRem1.hp,
      recvPlayerHpBefore: aHp0, recvPlayerHpAfter: aHp1 };
    console.log('  A cfx packets +' + (qA3.cfx - qA2.cfx) + ' carrying +' + (qA3.cfxProj - qA2.cfxProj)
      + ' projectiles and +' + (qA3.cfxSw - qA2.cfxSw) + ' rings');
    console.log('  A peak peerfx alive: ' + R.cfx.bToA.peakPeerfxAlive
      + '   peak visual rings: ' + R.cfx.bToA.peakVisualRings);
    if (R.cfx.bToA.sample) console.log('  A peerfx sample: ' + J(R.cfx.bToA.sample));
    console.log('  A REMOTE dummy HP ' + aRem0.hp + ' → ' + aRem1.hp + '   (delta ' + (aRem0.hp - aRem1.hp) + ')');
    console.log('  A player HP ' + aHp0 + ' → ' + aHp1);

    // ══ 5. MELEE SWINGS — presence, not cfx ══════════════════════════════════
    console.log('\n══ 5. melee swings  A → B  (rides on `at`/`sc` in the presence packet) ══');
    await A.evalOk(giveMelee);
    const qB4 = await B.evalOk(QSNAP);
    const bRem2 = await B.evalOk(readTarget('REMOTE'));
    await A.evalOk(ATTACK_ON);
    await sleep(2500);
    const aSwing = await A.evalOk(MY_PROJ);
    await A.evalOk(ATTACK_OFF);
    await sleep(400);
    const qB5 = await B.evalOk(QSNAP);
    const bRem3 = await B.evalOk(readTarget('REMOTE'));
    const peerAt = await B.evalOk('(function(){ var q=__BF3.MP.peers["h"]; return q?{at:+(q.at||0).toFixed(3),sc:q.sc||0,x:Math.round(q.x),z:Math.round(q.z)}:null; })()');
    R.swings = {
      senderSwingIds: aSwing.swingId, packetsWithSwing: qB5.swings - qB4.swings,
      posPackets: qB5.pos - qB4.pos, maxAtOnWire: qB5.maxAt, maxScOnWire: qB5.maxSc,
      peerNow: peerAt, cfxProjDelta: qB5.cfxProj - qB4.cfxProj, cfxSwDelta: qB5.cfxSw - qB4.cfxSw,
      remoteDummyHp: { before: bRem2.hp, after: bRem3.hp, delta: bRem2.hp - bRem3.hp },
    };
    console.log('  A swingId reached ' + aSwing.swingId);
    console.log('  B saw ' + (qB5.pos - qB4.pos) + ' presence packets, of which '
      + (qB5.swings - qB4.swings) + ' carried at>0;  max at on the wire ' + qB5.maxAt
      + ', max swingCombo ' + qB5.maxSc);
    console.log('  B peer "h" right now: ' + J(peerAt));
    console.log('  B cfx during melee: +' + (qB5.cfxProj - qB4.cfxProj) + ' projectiles, +'
      + (qB5.cfxSw - qB4.cfxSw) + ' rings');
    console.log('  B REMOTE dummy HP ' + bRem2.hp + ' → ' + bRem3.hp
      + '   (delta ' + (bRem2.hp - bRem3.hp) + ')  ← a melee swing has no damage packet at all');

    // ══ verdict ══════════════════════════════════════════════════════════════
    const checks = [
      ['mark A→B arrived at recvMark', R.ping.aToB.packetsFromA >= 1],
      ['mark A→B created a marker on B', R.ping.aToB.markCreated === true],
      ['mark B→A arrived at recvMark', R.ping.bToA.packetsFromB >= 1],
      ['mark B→A created a marker on A', R.ping.bToA.markCreated === true],
      ['mark coords survive the trip A→B', !!R.ping.aToB.coordDelta && R.ping.aToB.coordDelta.dx <= 1 && R.ping.aToB.coordDelta.dz <= 1],
      ['projectiles A→B relayed as peerfx', R.cfx.aToB.peakPeerfxAlive >= 1],
      ['projectiles B→A relayed as peerfx', R.cfx.bToA.peakPeerfxAlive >= 1],
      ['relayed projectile is tagged visual', !!(R.cfx.aToB.sample && R.cfx.aToB.sample.visual === true)],
      ['relayed projectile MOVES', !!(trkB && trkB.path && trkB.path.length > 1 && (trkB.path[0][0] !== trkB.path[trkB.path.length - 1][0] || trkB.path[0][1] !== trkB.path[trkB.path.length - 1][1]))],
      ['peer projectiles dealt NO damage A→B', R.dmg.aToB.delta === 0],
      ['peer projectiles dealt NO damage B→A', R.dmg.bToA.delta === 0],
      ['…and the dummy CAN be damaged (instrument)', R.dmg.control.delta > 0],
      ['…and the `visual` flag is what stops it (guard)', R.dmg.guard.delta > 0],
      ['melee swings cross the wire', R.swings.packetsWithSwing >= 1],
      ['melee swings deal no remote damage', R.swings.remoteDummyHp.delta === 0],
    ];
    if (noping) {
      checks.push(['KNOWN-BAD: packet still arrives on B', R.ping.aToB.packetsFromA >= 1]);
      checks.push(['KNOWN-BAD: no marker created on B', R.ping.aToB.markCreated === false]);
    }

    console.log('\n-- proof --');
    let allOk = true;
    for (const [n, ok] of checks) { if (!ok) allOk = false; console.log('  ' + (ok ? 'ok   ' : 'FAIL ') + n); }
    exit = allOk ? 0 : 1;
    console.log('\n' + (allOk ? 'PASS' : 'ONE OR MORE ASSERTIONS FAILED') + (noping ? '  (known-bad run)' : ''));
    console.log('\n-- raw --\n' + JSON.stringify(R, null, 1));
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
        errs.slice(0, 6).forEach(e => console.log('  x' + e.count + '  ' + e.text.slice(0, 180)));
        if (!errs.length) console.log('  none');
      }
      const miss = [...new Set(pair.server.misses)];
      if (miss.length) console.log('\n-- 404s -- ' + J(miss.slice(0, 10)));
      if (has('shots')) {
        const out = path.join(import.meta.dirname, 'out');
        for (const c of [pair.A, pair.B]) console.log('shot → ' + await c.shot(path.join(out, 'pingfx-' + c.tag + '.png')));
      }
      await pair.close();
    }
    console.log('\ntotal ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
    process.exit(exit);
  }
}

main();
