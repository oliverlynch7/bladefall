/* ─────────────────────────────────────────────────────────────────────────────
   harness/mp2/connect.js — the first test in this repo where two game clients talk to each other.

   Run:  node harness/mp2/connect.js
         node harness/mp2/connect.js --shots        # also write a PNG of each client
         node harness/mp2/connect.js --no-world3d   # faster boot, voxel world (see the caveat)

   WHAT IT PROVES, AND WHY EACH STEP IS THERE. Every gate below is polled on a predicate, never on
   a sleep, and every predicate was chosen against the source rather than by what sounded right:

     1. Both clients reach the HUB with world3d BUILT. Not decoration — MP.tick() is called only
        from update() (index.html:13151) and update() returns immediately unless mode==='play'
        (:13121). A host parked on the lobby overlay never broadcasts, so the guest's peer list
        stays empty and the run reads as "MP is broken" when it is "nobody was playing".
     2. A hosts.  Predicate is `MP.active && MP.peer.id === ROOMPFX+MP.code`, NOT `MP.code`:
        `code`, `isHost` and `myId` are all assigned at :12263, BEFORE the PeerJS broker is even
        contacted, so a readiness check keyed on them reports ready a few hundred ms early. That is
        the same class of bug as shot.js's voxel-fallback trap.
     3. A enters the shared scene.  `MP.onEnter(MP.HUB)` is the game's own line — index.html:15381,
        inside enterWaystation, gated on `if(MP.active)`. Which is exactly the trap: enter first and
        host second, and onEnter never fires, MP.zone stays -1, placeMsg() (:12390) returns null,
        and the guest sits on "Connected! Waiting for the host…" forever while BOTH sides report a
        perfectly healthy connection. Host first, then declare the zone.
     4. B joins.
     5. A sees the HANDSHAKE, not the socket.  `conns.length > 0` only means the transport opened;
        `c._pid` and `peers[id]` appear only when the guest's `hello` lands (:12271), and every
        routed message (sendPvp :12569, routeRevive :12539) looks the target up by `_pid`.
     6. B sees the HOST.  This is the half that makes the proof bidirectional: B's peer list is
        populated only by the host's `state` broadcast, which only happens inside MP.tick. If step 6
        passes, packets are provably flowing A→B as well as B→A.
     7. Both report the same MP.zone.  Connected in the same PLACE, not merely connected.

   IT NEEDS REAL INTERNET and says so instead of blaming the game. MP.loadLib() (:12230) injects
   PeerJS from unpkg.com and the broker is 0.peerjs.com; both callbacks answer 'no internet' when
   that fails. A network outage reported as an MP regression is exactly the confident-wrong-answer
   this harness exists to prevent, so 'no internet' exits with its own status.

   WHAT IT DOES NOT PROVE. `/turn` 404s under the local static server (measured — it is the only
   404 in a full load). MP.ensureIce (:12215) swallows that and falls back to STUN-only, so this run
   NEVER EXERCISES THE CLOUDFLARE TURN RELAY. Two loopback clients do not need it; two real devices
   behind symmetric NAT do. Nothing here says anything about TURN.
   ───────────────────────────────────────────────────────────────────────────── */
import path from 'node:path';
import { twoClients } from './two.js';

const argv = process.argv.slice(2);
const has = (f) => argv.includes('--' + f);

/* JSON-SAFE ONLY. `returnByValue:true` cannot serialise MP.peers — the peer objects carry
   reconstructed pet/minion render graphs — so this returns keys and scalars. Learned by reading
   mkPeer (index.html:12253), not by watching a CDP call fail. */
const MP_STATE = `(function(){ var M=window.__BF3&&__BF3.MP; if(!M) return {noMP:true};
  var G=__BF3.G; return {
    active:!!M.active, isHost:!!M.isHost, myId:M.myId||null, code:M.code||'',
    /* peerObj and peerId are SEPARATE on purpose. The Peer is constructed at :12264 but its .id
       stays null until the broker answers 'open', so a single null tells you nothing about which
       half stalled: peerObj false means MP never got past its await on ensureIce(); peerObj true
       with peerId null means the broker socket never opened. The first run that timed out here
       could not distinguish them, which is why both are reported now. */
    peerObj:!!M.peer, iceCfg:(M.iceCfg&&M.iceCfg.iceServers||[]).length,
    peerId:(M.peer&&M.peer.id)||null,
    peerDestroyed:!!(M.peer&&M.peer.destroyed), peerDisconnected:!!(M.peer&&M.peer.disconnected),
    peers:Object.keys(M.peers||{}),
    conns:(M.conns||[]).length,
    connPids:(M.conns||[]).map(function(c){ return c._pid||null; }),
    connOpen:(M.conns||[]).map(function(c){ return !!c.open; }),
    hostConnOpen:!!(M.hostConn&&M.hostConn.open),
    zone:M.zone, seed:M.seed, rseed:M.rseed, ping:M.ping,
    gotEnemies:!!M._gotEn, pvp:!!M.pvp,
    peerLib:!!window.Peer, online:!!navigator.onLine,
    mode:__BF3.mode, hub:!!(G&&G.hub), runSeed:(G&&G.runSeed)||null,
    hp:(G&&G.p)?Math.round(G.p.hp):null }; })()`;

/* MP.host() takes a CALLBACK and — unlike join(), which carries a 22s giveUp at :12296 — it has NO
   TIMEOUT OF ITS OWN. If the broker accepts the socket but never fires 'open', the callback is
   never called, MP.active never flips, and nothing anywhere says so. The deadline has to live here.
   Resolves with a failure object, never rejects: a Promise that never settles hangs the CDP call
   until its 180s timeout, which reads as "the harness broke" rather than "hosting failed". */
const hostJs = (pvp, ms) => `new Promise(function(res){
  var done=false;
  var t=setTimeout(function(){ if(!done){ done=true; res({ok:false,info:'host-timeout'}); } }, ${ms});
  try{
    __BF3.MP.host(function(ok,info){ if(done) return; done=true; clearTimeout(t);
      res({ok:!!ok, info:String(info), code:__BF3.MP.code}); }${pvp ? ', true' : ''});
  }catch(e){ if(!done){ done=true; clearTimeout(t); res({ok:false,info:'threw: '+e.message}); } }
})`;

const joinJs = (code, ms) => `new Promise(function(res){
  var done=false;
  var t=setTimeout(function(){ if(!done){ done=true; res({ok:false,info:'join-timeout'}); } }, ${ms});
  try{
    __BF3.MP.join(${JSON.stringify(code)}, function(ok,info){ if(done) return; done=true; clearTimeout(t);
      res({ok:!!ok, info:String(info), code:__BF3.MP.code}); });
  }catch(e){ if(!done){ done=true; clearTimeout(t); res({ok:false,info:'threw: '+e.message}); } }
})`;

/* Warmed at BOOT, while the page is idle, and not at the moment MP needs it. MP.host() does
   `await this.ensureIce()` (index.html:12264) BEFORE constructing its Peer, and ensureIce fetches
   /turn (:12218). Measured on this harness: that fetch takes 11ms on an idle page, 4857ms while
   world3d is streaming its assets on ONE client, and 75229ms in a two-client run — because this
   harness serves both clients' entire asset set from a single Node process, so /turn queues behind
   it. That is our static server, not the game. Warming it here keeps a harness artifact out of the
   host/join timings, and makes a later host-timeout attributable: iceCfg is already populated, so
   a stall after this point is the broker socket and nothing else. */
export const PREWARM_ICE = '(function(){ var t0=performance.now();'
  + ' return Promise.resolve(__BF3.MP.ensureIce()).then(function(c){'
  + '   return {iceMs:Math.round(performance.now()-t0), servers:((c&&c.iceServers)||[]).length}; },'
  + ' function(e){ return {iceMs:Math.round(performance.now()-t0), err:String(e)}; }); })()';

class Fail extends Error {
  constructor(step, why, detail) { super(step + ': ' + why); this.step = step; this.why = why; this.detail = detail || {}; }
}

export async function hostAndJoin(pair, opts = {}) {
  const log = opts.log || pair.log || console.log;
  const hostMs = opts.hostTimeoutMs || 30000;
  const joinMs = opts.joinTimeoutMs || 40000;   // MP.join's own giveUp is 22s; leave it room to fire
  const gateMs = opts.gateTimeoutMs || 30000;
  const pvp = !!opts.pvp;
  const snap = async () => ({ A: await pair.evalA(MP_STATE), B: await pair.evalB(MP_STATE) });

  /* MP.tick is only reached from update(), which returns unless mode==='play' (index.html:13121). */
  for (const [tag, wait] of [['A', pair.waitA], ['B', pair.waitB]]) {
    const r = await wait('__BF3.mode === "play" && !!__BF3.G && !!__BF3.G.hub', { timeoutMs: 20000 });
    if (!r.ok) throw new Fail('0-in-play', tag + ' is not in play mode in the hub, so it will never tick MP',
      { tag, last: r.last, state: await snap() });
  }
  log('play   ✓ both clients in the hub, mode=play (MP.tick will run)');

  // ── 1. HOST ───────────────────────────────────────────────────────────────
  /* ICE is warmed at BOOT, not here — see PREWARM_ICE and the note on twoClients({preBoot}).
     This read is the cached value, and it is printed so the run states what it is using. */
  const ice = await pair.evalA('(function(){ var c=__BF3.MP.iceCfg;'
    + ' return {cached:!!c, servers:((c&&c.iceServers)||[]).length}; })()');
  log('ice    → ' + JSON.stringify(ice) + '   (STUN-only; /turn 404s under the local server)');

  /* RETRIED, AND THE RETRIES ARE PRINTED, because this step has been WATCHED TO FAIL twice on this
     machine while the broker was healthy:
       - 2026-08-13 run 2: host sat the full 30s, `peerLib:true, peerId:null`, while a direct fetch
         of 0.peerjs.com/peerjs/id from Node answered in 21ms. That run had no peerObj field, so
         WHICH half stalled — the ensureIce fetch or the broker socket — is UNVERIFIED for it.
         Do not assume the broker; the ICE fetch is now known to be able to take 75s under this
         harness's own load, which is the more likely explanation and is why it is warmed at boot.
       - 2026-08-13 run 3: join attempt 1 hit MP.join's own 22s giveUp with `peerObj:true,
         peerId:null`. There the Peer existed, so ensureIce had already returned: that one IS the
         broker socket neither opening nor erroring. Attempt 2 connected immediately.
     A retry, not a longer timeout, because a stalled socket does not un-stall. Every attempt is
     printed, so a session that needed three tries can never be read as one that needed one. */
  let host = null, attempts = [];
  for (let i = 0; i < (opts.hostAttempts || 3); i++) {
    if (i) {
      await pair.evalA('try{ __BF3.MP.peer && __BF3.MP.peer.destroy(); }catch(e){}; __BF3.MP.peer=null; 1');
      await new Promise(r => setTimeout(r, 1500));
    }
    host = await pair.evalA(hostJs(pvp, hostMs));
    attempts.push(host.ok ? 'ok' : host.info);
    log('host   → attempt ' + (i + 1) + ' ' + JSON.stringify(host));
    if (host.ok) break;
    if (host.info === 'no internet') break;               // retrying a missing library is pointless
    log('         state after failed attempt: ' + JSON.stringify(await pair.evalA(MP_STATE)));
  }
  if (attempts.length > 1) log('!! host needed ' + attempts.length + ' attempts: ' + JSON.stringify(attempts)
    + '  — the PeerJS broker is not reliably answering on the first try.');
  if (!host.ok) {
    const why = host.info === 'no internet'
      ? 'PeerJS could not be loaded from unpkg.com. This is a NETWORK result, not a game result — '
        + 'nothing here says the multiplayer code is broken.'
      : host.info === 'host-timeout'
        ? 'MP.host() never called its callback within ' + hostMs + 'ms, on ' + attempts.length
          + ' attempts. MP.host has no timeout of its own (index.html:12260-12267 — only join() has '
          + 'one, at :12296), so this is the only place that can notice. Check peerObj/peerId in the '
          + 'state below: peerObj false = ensureIce hung; peerObj true with peerId null = the PeerJS '
          + 'broker socket never opened and never errored.'
        : 'MP.host() reported failure: ' + host.info;
    throw new Fail('1-host', why, { host, attempts, ice, state: await snap(), network: host.info === 'no internet' });
  }
  /* NOT `MP.code` — set at :12263, before the broker is contacted. peer.id is the broker's answer. */
  const hostUp = await pair.waitA(
    '!!(__BF3.MP.active && __BF3.MP.isHost && __BF3.MP.peer && __BF3.MP.peer.id === __BF3.MP.ROOMPFX + __BF3.MP.code)',
    { timeoutMs: gateMs });
  if (!hostUp.ok) throw new Fail('1-host-open', 'the host callback fired but the peer never took its room id',
    { last: hostUp.last, state: await snap() });
  const code = await pair.evalA('__BF3.MP.code');
  log('room   ✓ ' + code + '  (peer id ' + (await pair.evalA('__BF3.MP.peer.id')) + ')');

  // ── 2. DECLARE THE ZONE ───────────────────────────────────────────────────
  /* index.html:15381, verbatim, and it must come AFTER host(): that line is gated on MP.active, so
     hosting after entering leaves MP.zone at -1 and placeMsg() returns null for every guest.

     THE KNOWN-BAD LIVES HERE. `--no-zone` skips this line, which is precisely what a session does
     when the player enters before hosting. It is not a hypothetical: the whole point is that the
     resulting session looks HEALTHY from every other angle — the socket opens, the hello lands, the
     host broadcasts, both peer lists fill — and the guest is nonetheless nowhere. Without a
     known-bad, step 6 below is an assertion nobody has watched fail, and this repo does not believe
     those. Run it: `node harness/mp2/connect.js --no-zone` must fail at 6-zone and nowhere else. */
  if (opts.skipZone) {
    log('!! --no-zone: SKIPPING MP.onEnter. This is the KNOWN-BAD. Steps 3-5 are expected to PASS '
      + 'and step 6 is expected to FAIL; anything else means the gates are not measuring what they claim.');
  } else {
    await pair.evalA('__BF3.MP.onEnter(__BF3.MP.HUB)');
    const zoned = await pair.waitA('__BF3.MP.hasZone() && __BF3.MP.zone === __BF3.MP.HUB', { timeoutMs: 5000 });
    if (!zoned.ok) throw new Fail('2-zone', 'host has no zone, so placeMsg() will hand a guest nothing',
      { last: zoned.last, state: await snap() });
    log('zone   ✓ host declared MP.zone = HUB (' + (await pair.evalA('__BF3.MP.HUB')) + ')');
  }

  // ── 3. JOIN ───────────────────────────────────────────────────────────────
  /* Retried for the same measured reason as host, though join at least has its own 22s giveUp
     (:12296) so a stall here reports 'timeout' rather than hanging. `fail()` already destroys the
     peer on its way out, so a retry starts clean without this file reaching into MP state. */
  let join = null; const joinAttempts = [];
  for (let i = 0; i < (opts.joinAttempts || 3); i++) {
    if (i) await new Promise(r => setTimeout(r, 1500));
    join = await pair.evalB(joinJs(code, joinMs));
    joinAttempts.push(join.ok ? 'ok' : join.info);
    log('join   → attempt ' + (i + 1) + ' ' + JSON.stringify(join));
    if (join.ok || join.info === 'no internet') break;
    log('         state after failed attempt: ' + JSON.stringify(await pair.evalB(MP_STATE)));
  }
  if (joinAttempts.length > 1) log('!! join needed ' + joinAttempts.length + ' attempts: ' + JSON.stringify(joinAttempts));
  if (!join.ok) {
    const why = join.info === 'no internet'
      ? 'PeerJS could not be loaded on the guest. NETWORK result, not a game result.'
      : join.info === 'timeout'
        ? "MP.join()'s own 22s giveUp fired (index.html:12296) — the guest's peer opened but the "
          + 'data connection to room ' + code + ' never did. Broker reachable, WebRTC path not.'
        : 'MP.join() reported failure: ' + join.info;
    throw new Fail('3-join', why, { code, join, joinAttempts, state: await snap(), network: join.info === 'no internet' });
  }
  const guestUp = await pair.waitB(
    '!!(__BF3.MP.active && !__BF3.MP.isHost && __BF3.MP.hostConn && __BF3.MP.hostConn.open'
    + ' && __BF3.MP.code === ' + JSON.stringify(code) + ')', { timeoutMs: gateMs });
  if (!guestUp.ok) throw new Fail('3-join-open', 'the join callback fired but the guest connection is not open',
    { last: guestUp.last, state: await snap() });

  // ── 4. HANDSHAKE ON THE HOST (not just the socket) ────────────────────────
  const shook = await pair.waitA(
    '(function(){ var M=__BF3.MP; return Object.keys(M.peers).length >= 1'
    + ' && M.conns.length >= 1 && !!M.conns[0]._pid; })()', { timeoutMs: gateMs });
  if (!shook.ok) throw new Fail('4-hello', "the host has a connection but never received the guest's `hello` — "
    + '_pid is unset, so every routed message (pvp, revive) would have no target',
    { last: shook.last, state: await snap() });
  log('hello  ✓ host sees guest ' + JSON.stringify(await pair.evalA('Object.keys(__BF3.MP.peers)')));

  // ── 5. THE HOST'S BROADCAST REACHES THE GUEST ─────────────────────────────
  /* The half that makes this bidirectional. B's peer list is filled only by the host's `state`
     packet, which is sent only from MP.tick → broadcast (:12441) at ~14Hz, only while the host is
     in play mode. Measured while building this driver: with both clients parked on the title
     screen, A's peer list filled from the guest's hello and B's stayed EMPTY forever — a session
     that looks connected from one side and is dead from the other. */
  const heard = await pair.waitB('Object.keys(__BF3.MP.peers).length >= 1', { timeoutMs: gateMs });
  if (!heard.ok) throw new Fail('5-broadcast', 'the guest never received a `state` packet from the host — '
    + 'the socket is up but no world data is flowing A→B',
    { last: heard.last, state: await snap() });
  log('state  ✓ guest sees host ' + JSON.stringify(await pair.evalB('Object.keys(__BF3.MP.peers)')));

  // ── 6. SAME PLACE ─────────────────────────────────────────────────────────
  const sameZone = await pair.waitB('__BF3.MP.zone === __BF3.MP.HUB', { timeoutMs: gateMs });
  if (!sameZone.ok) throw new Fail('6-zone', 'the guest is connected but did not adopt the host\'s zone',
    { last: sameZone.last, state: await snap() });

  // ── 7. LIVE TRAFFIC, BOTH WAYS ────────────────────────────────────────────
  /* Peer counts prove that ONE packet arrived in each direction. They do not prove the session is
     still alive a second later, and a co-op session that handshakes and then goes quiet would pass
     every check above. So: move each hero and watch the other client's copy of it move.
     Host→guest rides `state` (:12441), guest→host rides `pos` (:12446) — two different code paths,
     so this is two findings, not one. Compared against the peer's OWN previous value rather than
     against an absolute coordinate, because hub collision may not leave the hero exactly where it
     was put and "close to where I aimed" is not the question; "it changed" is. */
  const peerXY = (id) => '(function(){ var q=__BF3.MP.peers[' + JSON.stringify(id) + '];'
    + ' return q ? Math.round(q.tx) + "," + Math.round(q.tz) : null; })()';
  const guestId = await pair.evalA('__BF3.MP.conns[0]._pid');

  const hostSeen0 = await pair.evalB(peerXY('h'));
  await pair.evalA('__BF3.G.p.x += 260; __BF3.G.p.z -= 180; 1');
  const moved1 = await pair.waitB(peerXY('h') + ' !== ' + JSON.stringify(hostSeen0), { timeoutMs: 10000 });
  if (!moved1.ok) throw new Fail('7-live-host', 'the host moved and the guest never saw it — the handshake '
    + 'completed but no `state` packet has arrived since', { was: hostSeen0, state: await snap() });

  const guestSeen0 = await pair.evalA(peerXY(guestId));
  await pair.evalB('__BF3.G.p.x -= 240; __BF3.G.p.z += 150; 1');
  const moved2 = await pair.waitA(peerXY(guestId) + ' !== ' + JSON.stringify(guestSeen0), { timeoutMs: 10000 });
  if (!moved2.ok) throw new Fail('7-live-guest', 'the guest moved and the host never saw it — no `pos` packet '
    + 'has arrived since the hello', { was: guestSeen0, state: await snap() });
  log('live   ✓ host moved ' + hostSeen0 + ' → ' + (await pair.evalB(peerXY('h')))
    + ' (seen by guest);  guest moved ' + guestSeen0 + ' → ' + (await pair.evalA(peerXY(guestId))) + ' (seen by host)');

  /* MP.ping starts at 0 (:12199) and is only written on a pong, so reading it straight after
     connecting hands back the initial value — a number that looks like a measurement and is not.
     Waited for per side, and the WAIT'S OWN RESULT is what sets pingMeasured, rather than a flag
     that is true by construction.

     0 with pingMeasured false is honest and expected here, because the ping interval is FRAME-BASED
     AND NOT TIME-BASED: `_pingT += 0.07` (:12443/:12446) is added once per send cycle, and the send
     cycle fires whenever `_sendT >= 0.07` — which on this SwiftShader machine is every single
     frame, since dt is far larger than 0.07. So "ping every 1 second" is really "ping every 14
     send cycles", which is one second only at 14fps or better and stretches below that. Measured
     across five runs: the host reported 0, 301, 1111 and 2243ms and the guest reported 0 every
     time, on the same connection — the spread is the peer's main thread being busy when the pong
     needed sending, not the network. Do not read MP.ping off a headless run as a latency figure. */
  const [pA, pB] = await Promise.all([
    pair.waitA('__BF3.MP.ping > 0', { timeoutMs: 9000 }),
    pair.waitB('__BF3.MP.ping > 0', { timeoutMs: 9000 }),
  ]);
  const state = await snap();
  state.A.pingMeasured = pA.ok; state.B.pingMeasured = pB.ok;
  log('ping   → A ' + state.A.ping + 'ms' + (pA.ok ? '' : ' (no completed cycle in 9s)')
    + '   B ' + state.B.ping + 'ms' + (pB.ok ? '' : ' (no completed cycle in 9s)'));
  return { ok: true, code, guestId, host, join, ice, attempts, joinAttempts, A: state.A, B: state.B };
}

/* ── report ──────────────────────────────────────────────────────────────── */
function verdict(r) {
  const A = r.A, B = r.B;
  const checks = [
    ['A.active',                A.active === true],
    ['A.isHost',                A.isHost === true],
    ['A.peerId === room+code',  A.peerId === 'bladefall-mp-' + r.code],
    ['A.conns >= 1',            A.conns >= 1],
    ['A.conns[0].open',         A.connOpen[0] === true],
    ['A.conns[0]._pid set',     !!A.connPids[0]],
    ['A.peers has the guest',   A.peers.length >= 1 && A.peers[0] === B.myId],
    ['B.active',                B.active === true],
    ['B.isHost === false',      B.isHost === false],
    ['B.hostConn.open',         B.hostConnOpen === true],
    ['B.code === room code',    B.code === r.code],
    ['B.peers has the host',    B.peers.includes('h')],
    ['same MP.zone (HUB)',      A.zone === B.zone && A.zone === -100],
    ['both in play mode',       A.mode === 'play' && B.mode === 'play'],
    ['guest adopted MP.rseed',  B.rseed === A.rseed],
  ];
  return checks;
}

/* Things the run establishes that are NOT failures, but that a reader would otherwise get wrong by
   reading the raw state dump. Each one is a real observation off this run, not a caveat in general. */
function notes(r) {
  const out = [];
  if (r.B.rseed === r.A.rseed && r.B.runSeed !== r.A.runSeed)
    out.push('the guest adopted MP.rseed (' + r.A.rseed + ') but G.runSeed is still its own ('
      + r.B.runSeed + ' vs host ' + r.A.runSeed + '). Expected here and worth naming: the adopt happens in '
      + 'enterZone (index.html:4215), and the HUB path in onGuestData (:12318) calls openHub() without going '
      + 'through it. So a hub session is NOT a seed-aligned session — anything about matching levels or '
      + 'matching enemy ids has to be tested after following the host into a campaign zone.');
  if (r.B.gotEnemies)
    out.push('B.gotEnemies is true, and it does NOT mean enemies synced. MP._gotEn is set by applyEnemies, '
      + 'which runs for any `state` packet carrying an `en` field — and an empty array is truthy. The hub '
      + 'has no enemies. It reads "a state packet with an enemy slot arrived", nothing more.');
  if (!r.A.pingMeasured || !r.B.pingMeasured)
    out.push('MP.ping never completed a cycle on ' + (!r.A.pingMeasured ? 'the host' : '')
      + (!r.A.pingMeasured && !r.B.pingMeasured ? ' and ' : '') + (!r.B.pingMeasured ? 'the guest' : '')
      + ' within 9s, so the 0ms shown is the field\'s initial value and NOT a latency measurement. '
      + 'The ping interval is frame-based, not time-based (_pingT advances 0.07 per SEND CYCLE at '
      + 'index.html:12443, and the send cycle fires every frame at these frame rates), so "every 1s" '
      + 'is really "every 14 cycles". The live-traffic check is what proves packets are moving here.');
  out.push('/turn 404s under the local static server, so MP.ensureIce (:12215) fell back to STUN-only. '
    + 'THE CLOUDFLARE TURN RELAY WAS NOT EXERCISED by this run and nothing here speaks to it.');
  if ((r.attempts || []).length > 1 || (r.joinAttempts || []).length > 1)
    out.push('this run needed more than one try — host ' + JSON.stringify(r.attempts)
      + ', join ' + JSON.stringify(r.joinAttempts) + '. ICE was already cached before either call, so '
      + 'the stall was the PeerJS broker socket: it neither opened nor errored. The connection '
      + 'succeeded here, but the game gives a player one button and no retry, so the same stall in '
      + 'front of a real player is a Host/Join that simply never finishes.');
  return out;
}

async function main() {
  const t0 = Date.now();
  const world3d = !has('no-world3d');
  const gamePath = '/3d/index.html?hero3d=1&world3d=' + (world3d ? '1' : '0') + '&nobloom';
  console.log('=== mp2/connect — two clients, one room ===');
  console.log('path   → ' + gamePath + (world3d ? '' : '   (!! world3d OFF: the 3D world is NOT under test in this run)'));

  let pair = null, code = 1;
  try {
    pair = await twoClients({ path: gamePath, preBoot: PREWARM_ICE });
    const r = await hostAndJoin(pair, { skipZone: has('no-zone') });
    if (has('no-zone')) console.log('\n!! --no-zone was expected to FAIL at 6-zone and it did not. '
      + 'Either the game now recovers without onEnter, or step 6 is not measuring what it says.');

    console.log('\n-- proof --');
    let allOk = true;
    for (const [name, ok] of verdict(r)) { if (!ok) allOk = false; console.log('  ' + (ok ? 'ok   ' : 'FAIL ') + name); }
    console.log('\n  A ' + JSON.stringify(r.A));
    console.log('  B ' + JSON.stringify(r.B));
    console.log('\n-- notes (true of this run; not failures) --');
    notes(r).forEach((n, i) => console.log('  ' + (i + 1) + '. ' + n));
    code = allOk ? 0 : 1;
    console.log('\n' + (allOk ? 'CONNECTED ✓  room ' + r.code : 'CONNECTED but one or more assertions FAILED — see above'));
  } catch (e) {
    console.log('\n-- FAILED --');
    console.log('  step: ' + (e.step || '(driver)'));
    console.log('  why : ' + (e.why || e.message));
    if (e.detail && Object.keys(e.detail).length) console.log('  detail: ' + JSON.stringify(e.detail, null, 2));
    if (e.detail && e.detail.network) console.log('\n  ^ NETWORK, NOT THE GAME. Re-run when unpkg.com and 0.peerjs.com are reachable.');
    if (!e.step) console.log(e.stack);
    code = 2;
  } finally {
    if (pair) {
      for (const c of [pair.A, pair.B]) {
        const errs = c.errors();
        console.log('\n-- page errors [' + c.tag + '] (' + errs.length + ' distinct) --');
        errs.slice(0, 8).forEach(e => console.log('  x' + e.count + '  ' + e.text.slice(0, 200)));
        if (!errs.length) console.log('  none');
      }
      const miss = [...new Set(pair.server.misses)];
      if (miss.length) console.log('\n-- 404s (' + miss.length + ' distinct) -- ' + JSON.stringify(miss.slice(0, 10)));
      const st = pair.server.stats();
      console.log('-- server -- ' + st.files + ' files cached, ' + (st.bytes / 1048576).toFixed(1) + ' MB');
      /* A load failure with the file present and no 404 is this harness's own contention, and it
         has been measured that way (1 client: zero; 2 clients: 220 across three kit textures).
         Say so here rather than letting the next reader file it as an art regression. */
      const texty = [pair.A, pair.B].flatMap(c => c.errors()).filter(e => /Couldn't load texture|GLTFLoader/.test(e.text));
      if (texty.length && !miss.some(m => /\.(png|jpg|ktx2|webp)$/i.test(m)))
        console.log('\n!! ' + texty.reduce((a, e) => a + e.count, 0) + ' GLTF texture load errors with NO matching 404 — '
          + 'the files are on disk and the requests reached the server. That is this harness serving two '
          + 'clients at once, NOT the art. A single-client control on the same server measured zero.');
      if (has('shots')) {
        const out = path.join(import.meta.dirname, 'out');
        for (const c of [pair.A, pair.B]) console.log('shot → ' + await c.shot(path.join(out, 'connect-' + c.tag + '.png')));
      }
      await pair.close();
    }
    console.log('\ntotal ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
    process.exit(code);
  }
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('harness/mp2/connect.js')) main();
