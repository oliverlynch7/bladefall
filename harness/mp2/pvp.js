/* ─────────────────────────────────────────────────────────────────────────────
   harness/mp2/pvp.js — a real DUEL between two real clients, and the four damage
   routes measured one at a time.

   Run:  node harness/mp2/pvp.js
         node harness/mp2/pvp.js --no-world3d     # faster boot; the 3D world is then NOT under test
         node harness/mp2/pvp.js --shots          # PNG of each client at the end

   WHAT IS UNDER TEST. "PvP damage works" is four different claims wearing one name, and the repo
   has never watched any of them fail because no two clients have ever existed at once:

     H→G transport   host  swings, MP.sendPvp finds conn._pid, guest's onGuestData('pdmg') applies
     G→H transport   guest swings, sends to hostConn, host's wireGuest('pdmg') → routePvp → self
     hit detection   MP.pvpMelee (index.html:12557) is what turns a swing into a sendPvp at all
     the mirror      the victim's new hp has to travel BACK so the attacker's screen shows it

   So each direction is measured TWICE and the two are reported separately:
     phase 1/2  a REAL SWING — __BF3.playerAttack(1), the exact call update() makes at :13372 —
                which exercises pvpMelee's reach/facing test and then the transport.
     phase 3/4  a RAW MP.sendPvp() — transport only, no hit detection.
   If a swing phase fails and its raw phase passes, the fault is hit detection, not the wire. If
   both fail, it is the wire. Running only the swing could not tell those apart, and "PvP is broken"
   is the kind of answer that sends someone to read the wrong 300 lines.

   THREE NUMBERS PER DIRECTION, because "HP drops on both screens" is literally two screens:
     victim.hp      G.p.hp on the client being hit           (their screen)
     attacker.sees  MP.peers[victim].hp on the attacker      (the attacker's screen)
     ledger         hp immediately before/after INSIDE takePvpDamage
   The ledger is a WRAPPER this file installs on MP.takePvpDamage / MP.sendPvp. It records and calls
   through — it does not change behaviour — but it IS an intervention, so nothing is concluded from
   it alone: every ledger row has to agree with an independent poll of G.p.hp taken from outside.
   Disagreement between them is reported, not smoothed over.

   THE CONTROL COMES FIRST. Before any swing, both HP values are polled for several seconds with
   nobody attacking. An HP drop is only evidence of PvP damage if HP was demonstrably stable
   without it, and the arena is not obviously inert: enterArena builds a room, and lava maps damage
   you on a timer (arenaHazardTick, :12757). The map here is `flat` (no lava) and bots are skipped
   entirely while MP.active (:12745), so the control is expected to be flat — expected, then checked.

   TIME IS NOT WALL TIME HERE. The loop clamps dt to 0.05s per rendered frame (:19547), so on two
   SwiftShader Chromes sharing a CPU the SIMULATION runs several times slower than the clock.
   invuln (0.5s), atkCd (~0.38s) and the 2s respawn timer are therefore not the waits you would
   guess: invuln is GAME time and respawn is REAL time, and they are not the same second. Every
   wait below polls the field it cares about, and the run prints the measured game-seconds-per-real-
   second so a reader can tell a slow machine from a stuck one.

   THE FLOW IS THE GAME'S OWN, not a shortcut into the arena:
     host(cb, TRUE)          index.html:12630 doHost(true) — the pvp flag rides the host call
     ensureGuestReady()      :12637, verbatim
     enterArena()            :12637 — sets MP.pvp, MP.zone=ARENA, and broadcastArena
     join(code)              the guest is told where to go by placeMsg() (:12390) on connect,
                             which returns the arenaMsg because the host is IN_ARENA
   The guest is never told to enterArena() by this file. If it does not land in the arena on its
   own, that is the finding.

   NEEDS REAL INTERNET (PeerJS from unpkg + the 0.peerjs.com broker) — and /turn 404s under the
   local static server, so THE CLOUDFLARE TURN RELAY IS NOT EXERCISED. Nothing here speaks to it.
   ───────────────────────────────────────────────────────────────────────────── */
import path from 'node:path';
import { twoClients } from './two.js';
import { PREWARM_ICE } from './connect.js';

const argv = process.argv.slice(2);
const has = (f) => argv.includes('--' + f);
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ── page-side probes ─────────────────────────────────────────────────────── */

/* Everything a duel decision depends on, in one round trip. `peers` is flattened to scalars
   because MP.peers carries reconstructed pet/minion render graphs and returnByValue cannot
   serialise them (learned in connect.js the hard way, not re-learned here). */
const DUEL_STATE = `(function(){
  var M=window.__BF3&&__BF3.MP, G=__BF3.G, p=G&&G.p; if(!M) return {noMP:true};
  var peers={}; for(var id in M.peers){ var q=M.peers[id];
    peers[id]={hp:Math.round(q.hp||0), hpm:Math.round(q.hpm||0), zone:q.zone,
               x:Math.round(q.tx||0), z:Math.round(q.tz||0), downed:!!q.downed}; }
  return {
    active:!!M.active, isHost:!!M.isHost, myId:M.myId, code:M.code,
    zone:M.zone, ARENA:M.ARENA, pvp:!!M.pvp, teams:!!M.teams,
    inArena:!!__BF3.inArena, mode:__BF3.mode, arenaMsg:!!M.arenaMsg,
    conns:(M.conns||[]).length, connPids:(M.conns||[]).map(function(c){return c._pid||null;}),
    hostConnOpen:!!(M.hostConn&&M.hostConn.open),
    peers:peers, scores:M.scores||{},
    self: p ? { hp:Math.round(p.hp), max:Math.round(__BF3.effMaxHp(p)),
                x:Math.round(p.x), z:Math.round(p.z), y:Math.round(p.y),
                yaw:+(p.yaw||0).toFixed(2), invuln:+(p.invuln||0).toFixed(2),
                dodge:+(p.dodgeTimer||0).toFixed(2), atkCd:+(p.atkCd||0).toFixed(2),
                atkTimer:+(p.atkTimer||0).toFixed(2), swingId:p.swingId||0,
                pvpDead:!!p._pvpDead, dead:!!p.dead, downed:!!p.downed,
                wep:(p.weapon&&p.weapon.art)||null, wcls:(p.weapon&&p.weapon.cls)||null,
                wdmg:(p.weapon&&p.weapon.dmg)||null, lvl:p.level||0 } : null,
    gtime:+((G&&G.time)||0).toFixed(2), enemies:(G&&G.enemies||[]).length,
    lava:!!(G&&G.arenaLava) }; })()`;

/* Record-and-call-through. Both wrappers are idempotent and both keep the ORIGINAL on the object
   so a second install cannot double-wrap and report every hit twice. */
const INSTALL_LEDGER = `(function(){
  var M=__BF3.MP;
  if(M.__pvpProbe) return 'already';
  M.__pvpProbe=1; M.__took=[]; M.__sent=[];
  var takeOrig=M.takePvpDamage;
  M.takePvpDamage=function(m){
    var G=__BF3.G, p=G&&G.p;
    var before = p?Math.round(p.hp):null;
    var iv = p?+(p.invuln||0).toFixed(2):null, dg = p?+(p.dodgeTimer||0).toFixed(2):null;
    var pd = p?!!p._pvpDead:null;
    var r = takeOrig.call(this,m);
    var after = p?Math.round(p.hp):null;
    M.__took.push({by:m.by, raw:m.d, before:before, after:after, delta:(before-after),
                   invulnIn:iv, dodgeIn:dg, pvpDeadIn:pd, died:!!(p&&p._pvpDead&&!pd),
                   t:Math.round(performance.now())});
    return r;
  };
  var sendOrig=M.sendPvp;
  M.sendPvp=function(id,dmg,sx,sz){
    M.__sent.push({to:id, dmg:Math.round(dmg), t:Math.round(performance.now())});
    return sendOrig.call(this,id,dmg,sx,sz);
  };
  return 'installed';
})()`;

const LEDGER = `({took:__BF3.MP.__took||[], sent:__BF3.MP.__sent||[]})`;
const LEDGER_CLEAR = `(function(){ __BF3.MP.__took.length=0; __BF3.MP.__sent.length=0; return 1; })()`;

/* Put the hero somewhere flat and still. Not a teleport helper for its own sake: the arena floor is
   one solid 1560-wide segment at y=0 on the `flat` map (index.html:12734), so x/z can be set
   directly, and vx/vz are zeroed because takePvpDamage applies knockback (:12583) and a hero still
   sliding from the last hit is not at the coordinate you think it is. */
const place = (x, z, yaw) => `(function(){ var p=__BF3.G.p;
  p.x=${x}; p.z=${z}; p.y=0; p.vx=0; p.vy=0; p.vz=0; p.onGround=true; p.yaw=${yaw};
  return {x:Math.round(p.x), z:Math.round(p.z), yaw:+p.yaw.toFixed(2)}; })()`;

/* The game's own swing. update() calls exactly this at index.html:13372 when the attack button is
   down and atkCd has expired; calling it here skips the button read and nothing else. One call =
   one swingId = at most one sendPvp per peer (pvpMelee dedupes on q._pvpSwing, :12562). */
const SWING = `(function(){ var p=__BF3.G.p;
  if(p.atkCd>0) return {skipped:'atkCd '+p.atkCd.toFixed(2)};
  var s0=p.swingId||0; __BF3.playerAttack(1);
  return {swingId:p.swingId, bumped:(p.swingId||0)>s0, atkTimer:+(p.atkTimer||0).toFixed(2),
          yaw:+p.yaw.toFixed(2)}; })()`;

const RAW_SEND = (id, dmg) => `(function(){ var p=__BF3.G.p;
  __BF3.MP.sendPvp(${JSON.stringify(id)}, ${dmg}, p.x, p.z); return {sentTo:${JSON.stringify(id)}, dmg:${dmg}}; })()`;

/* What pvpMelee itself would decide, computed with pvpMelee's own arithmetic (:12557-12563) and
   NOT re-derived from what looks right. Printed before a swing so a miss says which clause missed. */
const REACH_CHECK = (peerId) => `(function(){
  var M=__BF3.MP, G=__BF3.G, p=G.p, w=p.weapon, q=M.peers[${JSON.stringify(peerId)}];
  if(!q) return {noPeer:true};
  var MEL=__BF3.melee||{}; var reach=((MEL[w.art]&&MEL[w.art].reach)||90)+22;
  var fx=Math.sin(p.yaw), fz=Math.cos(p.yaw);
  var dx=(q.x||0)-p.x, dz=(q.z||0)-p.z, d=Math.hypot(dx,dz);
  var facing = d<=16 ? 1 : (dx*fx+dz*fz)/d;
  return {reach:reach, dist:Math.round(d), inReach:d<=reach+16, facingDot:+facing.toFixed(2),
          facingOk:(d<=16||facing>=0.35), sameZone:q.zone===M.zone, peerZone:q.zone, myZone:M.zone,
          wouldHit:(q.zone===M.zone)&&(d<=reach+16)&&(d<=16||facing>=0.35)}; })()`;

/* Game-seconds per real second. Every timeout below is wall-clock but every game timer (invuln,
   atkCd) is simulation time, and on this hardware they are wildly different. State the ratio
   rather than letting a reader assume 1. */
const RATE = async (c, ms) => {
  const t0 = await c.evalOk('__BF3.G.time');
  const w0 = Date.now();
  await sleep(ms);
  const t1 = await c.evalOk('__BF3.G.time');
  return { gamePerReal: +(((t1 - t0) / ((Date.now() - w0) / 1000))).toFixed(2), gameT: +t1.toFixed(1) };
};

class Fail extends Error {
  constructor(step, why, detail) { super(step + ': ' + why); this.step = step; this.why = why; this.detail = detail || {}; }
}

/* ── one measured exchange ────────────────────────────────────────────────── */
/* attacker/victim are {c, tag, id}. `fire` is the page expression that starts the attack.
   Returns everything observed, and NEVER throws on "no damage" — a zero is a result. */
async function exchange(name, attacker, victim, fire, opts = {}) {
  const log = opts.log || console.log;
  const waitMs = opts.waitMs || 20000;

  /* The victim must be hittable before we can call a miss meaningful: invuln blocks the whole of
     takePvpDamage (:12580) and would look identical to a lost packet. */
  const iv = await victim.c.waitFor('__BF3.G.p.invuln<=0 && __BF3.G.p.dodgeTimer<=0 && !__BF3.G.p._pvpDead',
    { timeoutMs: 30000, pollMs: 300 });
  if (!iv.ok) log('   !! ' + victim.tag + ' never became hittable (invuln/dodge/pvpDead never cleared): ' + JSON.stringify(iv.last));
  const ac = await attacker.c.waitFor('__BF3.G.p.atkCd<=0', { timeoutMs: 30000, pollMs: 300 });
  if (!ac.ok) log('   !! ' + attacker.tag + " attack cooldown never expired: " + JSON.stringify(ac.last));

  await Promise.all([attacker.c.evalOk(LEDGER_CLEAR), victim.c.evalOk(LEDGER_CLEAR)]);

  const vBefore = await victim.c.evalOk('Math.round(__BF3.G.p.hp)');
  const aSeesBefore = await attacker.c.evalOk('(function(){var q=__BF3.MP.peers[' + JSON.stringify(victim.id) + ']; return q?Math.round(q.hp):null;})()');
  const reach = opts.reach ? await attacker.c.evalOk(REACH_CHECK(victim.id)) : null;

  const fired = await attacker.c.evalOk(fire);

  /* Poll the VICTIM'S OWN hp — the independent channel. The ledger is read afterwards and has to
     agree with it. */
  const dropped = await victim.c.waitFor('Math.round(__BF3.G.p.hp) < ' + vBefore + ' || !!__BF3.G.p._pvpDead',
    { timeoutMs: waitMs, pollMs: 150 });
  const vAfter = await victim.c.evalOk('Math.round(__BF3.G.p.hp)');
  const vDead = await victim.c.evalOk('!!__BF3.G.p._pvpDead');

  /* The mirror: the victim's new hp has to ride selfState → state/pos back to the attacker. Only
     waited for if the victim actually lost hp; waiting for a mirror of nothing is 20 wasted seconds. */
  let aSeesAfter = aSeesBefore, mirrored = null;
  if (vAfter < vBefore) {
    mirrored = await attacker.c.waitFor(
      '(function(){var q=__BF3.MP.peers[' + JSON.stringify(victim.id) + ']; return q && Math.round(q.hp) <= ' + vAfter + ';})()',
      { timeoutMs: 15000, pollMs: 200 });
    aSeesAfter = await attacker.c.evalOk('(function(){var q=__BF3.MP.peers[' + JSON.stringify(victim.id) + ']; return q?Math.round(q.hp):null;})()');
  }

  const [aLed, vLed] = await Promise.all([attacker.c.evalOk(LEDGER), victim.c.evalOk(LEDGER)]);

  const r = {
    name, attacker: attacker.tag, victim: victim.tag,
    fired, reach,
    victimHp: { before: vBefore, after: vAfter, delta: vBefore - vAfter, diedAndRespawnPending: vDead },
    attackerSees: { before: aSeesBefore, after: aSeesAfter, mirrored: mirrored ? mirrored.ok : null },
    sentByAttacker: aLed.sent, takenByVictim: vLed.took,
    /* An HP drop with NO ledger row on the victim means something OTHER than PvP damage moved hp —
       the control run is what makes that statement worth making. */
    attributable: vLed.took.length > 0,
    hit: dropped.ok && (vAfter < vBefore || vDead),
    ms: dropped.ms,
  };
  /* The two channels must agree, or the wrapper is lying and every number here is suspect. */
  const ledgerDelta = vLed.took.reduce((a, t) => a + (t.delta || 0), 0);
  r.ledgerAgrees = (ledgerDelta === (vBefore - vAfter)) || vDead;
  return r;
}

/* ── the run ──────────────────────────────────────────────────────────────── */
export async function duel(pair, opts = {}) {
  const log = opts.log || pair.log || console.log;
  const hostMs = opts.hostTimeoutMs || 30000;
  const joinMs = opts.joinTimeoutMs || 40000;
  const gateMs = opts.gateTimeoutMs || 60000;
  const snap = async () => ({ A: await pair.evalA(DUEL_STATE), B: await pair.evalB(DUEL_STATE) });

  // ── 0. both actually simulating ───────────────────────────────────────────
  for (const [tag, wait] of [['A', pair.waitA], ['B', pair.waitB]]) {
    const r = await wait('__BF3.mode === "play" && !!__BF3.G && !!__BF3.G.hub', { timeoutMs: 30000 });
    if (!r.ok) throw new Fail('0-in-play', tag + ' is not in play mode in the hub — MP.tick never runs (:13121)',
      { tag, last: r.last, state: await snap() });
  }
  const [rA, rB] = await Promise.all([RATE(pair.A, 3000), RATE(pair.B, 3000)]);
  log('sim    → A ' + rA.gamePerReal + ' game-s per real-s   B ' + rB.gamePerReal
    + '   (dt is clamped to 0.05/frame at :19547 — game timers run this much slower than the clock)');

  const ice = await pair.evalA('(function(){var c=__BF3.MP.iceCfg; return {cached:!!c, servers:((c&&c.iceServers)||[]).length};})()');
  log('ice    → ' + JSON.stringify(ice) + '   (STUN-only; /turn 404s under the local server)');

  // ── 1. HOST A PVP ROOM — index.html:12630 doHost(true) ────────────────────
  let host = null; const attempts = [];
  for (let i = 0; i < 3; i++) {
    if (i) { await pair.evalA('try{__BF3.MP.peer&&__BF3.MP.peer.destroy();}catch(e){}; __BF3.MP.peer=null; 1'); await sleep(1500); }
    host = await pair.evalA(`new Promise(function(res){ var done=false;
      var t=setTimeout(function(){ if(!done){done=true;res({ok:false,info:'host-timeout'});} }, ${hostMs});
      try{ __BF3.MP.host(function(ok,info){ if(done)return; done=true; clearTimeout(t);
        res({ok:!!ok, info:String(info), code:__BF3.MP.code, pvp:!!__BF3.MP.pvp}); }, true); }
      catch(e){ if(!done){done=true;clearTimeout(t);res({ok:false,info:'threw: '+e.message});} } })`);
    attempts.push(host.ok ? 'ok' : host.info);
    log('host   → attempt ' + (i + 1) + ' ' + JSON.stringify(host));
    if (host.ok || host.info === 'no internet') break;
  }
  if (!host.ok) throw new Fail('1-host', host.info === 'no internet'
    ? 'PeerJS could not load from unpkg.com. NETWORK result, not a game result.'
    : 'MP.host(cb,true) failed: ' + host.info, { host, attempts, state: await snap(), network: host.info === 'no internet' });
  if (!host.pvp) throw new Fail('1-host-pvp', 'host() succeeded but MP.pvp is FALSE — the pvp flag did not survive the host call (:12262)',
    { host, state: await snap() });

  const up = await pair.waitA('!!(__BF3.MP.active && __BF3.MP.isHost && __BF3.MP.peer && __BF3.MP.peer.id === __BF3.MP.ROOMPFX + __BF3.MP.code)', { timeoutMs: gateMs });
  if (!up.ok) throw new Fail('1-host-open', 'the host callback fired but the peer never took its room id', { last: up.last, state: await snap() });
  const code = await pair.evalA('__BF3.MP.code');
  log('room   ✓ ' + code + '  pvp=true');

  // ── 2. HOST DROPS INTO THE ARENA — index.html:12637, verbatim ─────────────
  await pair.evalA('try{__BF3.MP.ensureGuestReady&&__BF3.MP.ensureGuestReady();}catch(e){}; __BF3.enterArena(); 1');
  const inA = await pair.waitA('!!(__BF3.inArena && __BF3.MP.pvp && __BF3.MP.zone===__BF3.MP.ARENA && __BF3.mode==="play" && __BF3.G && __BF3.G.arena && __BF3.G.p)', { timeoutMs: gateMs, pollMs: 500 });
  if (!inA.ok) throw new Fail('2-arena-host', 'the host called enterArena() but never landed in a live PvP arena',
    { last: inA.last, state: await snap() });
  log('arena  ✓ host in ' + JSON.stringify(await pair.evalA('__BF3.G.stageName||(__BF3.G.arena?"arena":"?")'))
    + '  zone=' + (await pair.evalA('__BF3.MP.zone')) + ' (ARENA=' + (await pair.evalA('__BF3.MP.ARENA')) + ')');

  // ── 3. GUEST JOINS — and is told where to go by placeMsg(), not by this file ──
  let join = null; const joinAttempts = [];
  for (let i = 0; i < 3; i++) {
    if (i) await sleep(1500);
    join = await pair.evalB(`new Promise(function(res){ var done=false;
      var t=setTimeout(function(){ if(!done){done=true;res({ok:false,info:'join-timeout'});} }, ${joinMs});
      try{ __BF3.MP.join(${JSON.stringify(code)}, function(ok,info){ if(done)return; done=true; clearTimeout(t);
        res({ok:!!ok, info:String(info), code:__BF3.MP.code}); }); }
      catch(e){ if(!done){done=true;clearTimeout(t);res({ok:false,info:'threw: '+e.message});} } })`);
    joinAttempts.push(join.ok ? 'ok' : join.info);
    log('join   → attempt ' + (i + 1) + ' ' + JSON.stringify(join));
    if (join.ok || join.info === 'no internet') break;
  }
  if (!join.ok) throw new Fail('3-join', 'MP.join failed: ' + join.info,
    { code, join, joinAttempts, state: await snap(), network: join.info === 'no internet' });

  const shook = await pair.waitA('(function(){var M=__BF3.MP; return Object.keys(M.peers).length>=1 && M.conns.length>=1 && !!M.conns[0]._pid;})()', { timeoutMs: gateMs });
  if (!shook.ok) throw new Fail('4-hello', "the host never got the guest's hello — conn._pid is unset, so sendPvp (:12570) has no target to find",
    { last: shook.last, state: await snap() });
  const guestId = await pair.evalA('__BF3.MP.conns[0]._pid');
  log('hello  ✓ host sees guest "' + guestId + '"');

  // ── 4. THE GUEST FOLLOWS INTO THE ARENA ON ITS OWN ────────────────────────
  const inB = await pair.waitB('!!(__BF3.inArena && __BF3.MP.pvp && __BF3.MP.zone===__BF3.MP.ARENA && __BF3.mode==="play" && __BF3.G && __BF3.G.arena && __BF3.G.p)', { timeoutMs: gateMs, pollMs: 500 });
  if (!inB.ok) throw new Fail('4-arena-guest', 'the guest connected but never entered the PvP arena. placeMsg() (:12390) should have '
    + 'handed it the arenaMsg on connect and onGuestData("arena") (:12333) should have called enterArena()',
    { last: inB.last, state: await snap() });
  log('arena  ✓ guest followed into the arena (zone=' + (await pair.evalB('__BF3.MP.zone')) + ', pvp=' + (await pair.evalB('!!__BF3.MP.pvp')) + ')');

  /* Both peer lists must be populated and both must agree on the zone, or pvpMelee's very first
     clause (`q.zone!==this.zone`) drops every swing silently. */
  const seesHost = await pair.waitB('Object.keys(__BF3.MP.peers).length>=1', { timeoutMs: gateMs });
  if (!seesHost.ok) throw new Fail('5-broadcast', 'the guest never received a state packet — no traffic host→guest', { last: seesHost.last, state: await snap() });
  const zonesAgree = await pair.waitA('(function(){var M=__BF3.MP,q=M.peers[' + JSON.stringify(guestId) + ']; return !!q && q.zone===M.zone;})()', { timeoutMs: gateMs });
  if (!zonesAgree.ok) throw new Fail('5-zone-agree', 'the host and guest are both "in the arena" but the host\'s copy of the guest '
    + 'reports a different MP.zone — pvpMelee (:12559) skips every peer whose zone differs, so no swing could ever land',
    { last: zonesAgree.last, state: await snap() });
  log('duel   ✓ both in ARENA, both peer lists populated, zones agree');

  await Promise.all([pair.evalA(INSTALL_LEDGER), pair.evalB(INSTALL_LEDGER)]);

  // ── 5. CONTROL: nobody swings ─────────────────────────────────────────────
  const c0 = await snap();
  await sleep(6000);
  const c1 = await snap();
  const control = {
    A: { hp0: c0.A.self.hp, hp1: c1.A.self.hp, max: c1.A.self.max },
    B: { hp0: c0.B.self.hp, hp1: c1.B.self.hp, max: c1.B.self.max },
    stable: c0.A.self.hp === c1.A.self.hp && c0.B.self.hp === c1.B.self.hp,
    gameTimeAdvanced: (c1.A.gtime - c0.A.gtime) > 0 && (c1.B.gtime - c0.B.gtime) > 0,
  };
  log('control→ 6s, nobody attacking: A ' + control.A.hp0 + '→' + control.A.hp1 + '/' + control.A.max
    + '   B ' + control.B.hp0 + '→' + control.B.hp1 + '/' + control.B.max
    + (control.stable ? '   (stable — a later drop is attributable)' : '   !! HP MOVED WITH NOBODY ATTACKING'));
  if (!control.gameTimeAdvanced) log('   !! G.time did not advance on one or both clients during the control — the sim is STOPPED, not quiet.');

  const A = { c: pair.A, tag: 'A(host)', id: 'h' };
  const B = { c: pair.B, tag: 'B(guest)', id: guestId };
  const results = [];

  /* Face-to-face. 40 units apart: pvpMelee's reach for a sword is 60+22, and it accepts d<=reach+16,
     so 40 is comfortably inside and still far enough that they are two positions and not one. */
  const stage = async () => {
    /* Placing a hero who is about to respawn is placing him twice: pvpRespawn (:12593) teleports to
       a random point on a 260-radius circle 2 REAL seconds after a kill, which would silently undo
       the staging and turn the next phase into a swing at empty air. Wait the death out first. */
    const [dA, dB] = await Promise.all([
      pair.waitA('!__BF3.G.p._pvpDead', { timeoutMs: 30000, pollMs: 250 }),
      pair.waitB('!__BF3.G.p._pvpDead', { timeoutMs: 30000, pollMs: 250 }),
    ]);
    if (!dA.ok || !dB.ok) log('   !! someone is still _pvpDead going into staging (A ' + dA.ok + ', B ' + dB.ok + ')');
    await pair.evalA(place(0, 0, (Math.PI / 2).toFixed(4)));      // host at origin, facing +x
    await pair.evalB(place(40, 0, (-Math.PI / 2).toFixed(4)));    // guest 40 east, facing -x
    /* Both sides have to SEE the new positions before anyone swings — and "see" means the field
       pvpMelee READS, which is q.x/q.z (:12569), NOT the q.tx/q.tz the packet carries. tick()
       only lerps one toward the other, `q.x += (q.tx-q.x)*k` (:12434), so tx snaps on arrival
       while x is still travelling. Polling tx here was measured to pass 45 units early: run 1
       staged 40 apart dead-on and phase 1 swung at dist 57, facingDot 0.60 — solve it and the
       host's copy of the guest was at (34,46), mid-lerp from the arena spawn (0,340). That swing
       landed on luck (57 < reach+16 = 98, 0.60 > the 0.35 facing cut); a hair further and phase 1
       reports MISS for a STAGING reason and this file blames hit detection, which is the one
       confusion it exists to prevent. Tolerance is 10, not 70, for the same reason: 70 is wider
       than the 40 being staged, so the old gate could not tell the staged spot from the spawn. */
    const seen = (x) => '(function(){var q=__BF3.MP.peers[' + JSON.stringify(x.id) + '];'
      + ' return q && Math.abs(q.x-(' + x.x + '))<10 && Math.abs(q.z)<10;})()';
    const okA = await pair.waitA(seen({ id: guestId, x: 40 }), { timeoutMs: 30000 });
    const okB = await pair.waitB(seen({ id: 'h', x: 0 }), { timeoutMs: 30000 });
    return { hostSeesGuest: okA.ok, guestSeesHost: okB.ok, ms: Math.max(okA.ms, okB.ms) };
  };

  // ── 6. PHASE 1 — REAL SWING, host → guest ─────────────────────────────────
  let st = await stage();
  log('\nstage  → ' + JSON.stringify(st));
  results.push(await exchange('1. real swing  host → guest', A, B, SWING, { log, reach: true }));

  // ── 7. PHASE 2 — REAL SWING, guest → host ─────────────────────────────────
  st = await stage();
  log('stage  → ' + JSON.stringify(st));
  results.push(await exchange('2. real swing  guest → host', B, A, SWING, { log, reach: true }));

  // ── 8/9. PHASES 3+4 — RAW TRANSPORT, both ways ────────────────────────────
  /* 20 damage flat: small enough that it cannot one-shot and lose the after-value to a respawn,
     and it isolates the wire from pvpMelee entirely. */
  st = await stage();
  log('stage  → ' + JSON.stringify(st));
  results.push(await exchange('3. raw sendPvp host → guest', A, B, RAW_SEND(guestId, 20), { log }));
  st = await stage();
  log('stage  → ' + JSON.stringify(st));
  results.push(await exchange('4. raw sendPvp guest → host', B, A, RAW_SEND('h', 20), { log }));

  const after = await snap();
  return { ok: true, code, guestId, control, results, rate: { A: rA, B: rB }, A: after.A, B: after.B, attempts, joinAttempts };
}

/* ── report ──────────────────────────────────────────────────────────────── */
function line(r) {
  const v = r.victimHp, s = r.attackerSees;
  const tookStr = r.takenByVictim.length
    ? r.takenByVictim.map(t => t.before + '→' + t.after + ' (-' + t.delta + ', raw ' + t.raw + (t.died ? ', KILLED' : '') + ')').join('; ')
    : '(no takePvpDamage call)';
  return [
    '  ' + (r.hit ? 'HIT  ' : 'MISS ') + r.name,
    '      victim  ' + r.victim + '  hp ' + v.before + ' → ' + v.after + '   delta -' + v.delta + (v.diedAndRespawnPending ? '   [DEAD, respawn pending]' : ''),
    '      attacker ' + r.attacker + ' sees victim hp ' + s.before + ' → ' + s.after
      + (s.mirrored === null ? '   (no drop to mirror)' : s.mirrored ? '   [mirrored back ok]' : '   !! NEVER MIRRORED BACK'),
    '      sendPvp on attacker: ' + (r.sentByAttacker.length ? JSON.stringify(r.sentByAttacker) : '(none)'),
    '      takePvpDamage on victim: ' + tookStr,
    r.reach ? '      pvpMelee geometry at swing time: ' + JSON.stringify(r.reach) : null,
    '      ledger agrees with independent hp poll: ' + r.ledgerAgrees + '   (waited ' + r.ms + 'ms)',
  ].filter(Boolean).join('\n');
}

async function main() {
  const t0 = Date.now();
  const world3d = !has('no-world3d');
  const gamePath = '/3d/index.html?hero3d=1&world3d=' + (world3d ? '1' : '0') + '&nobloom';
  console.log('=== mp2/pvp — two clients, one duel, four damage routes ===');
  console.log('path   → ' + gamePath + (world3d ? '' : '   (!! world3d OFF: the 3D world is NOT under test in this run)'));

  let pair = null, exitCode = 1;
  try {
    pair = await twoClients({ path: gamePath, preBoot: PREWARM_ICE, readyTimeoutMs: 240000 });
    const r = await duel(pair);

    console.log('\n-- exchanges --');
    for (const x of r.results) console.log(line(x) + '\n');

    const byName = Object.fromEntries(r.results.map(x => [x.name, x]));
    const checks = [
      ['control: HP stable with nobody attacking', r.control.stable],
      ['1. real swing  host → guest  drops guest HP', byName['1. real swing  host → guest'].hit],
      ['2. real swing  guest → host  drops host HP', byName['2. real swing  guest → host'].hit],
      ['3. raw sendPvp host → guest  drops guest HP', byName['3. raw sendPvp host → guest'].hit],
      ['4. raw sendPvp guest → host  drops host HP', byName['4. raw sendPvp guest → host'].hit],
      ['every drop had a matching takePvpDamage', r.results.every(x => !x.hit || x.attributable)],
      ['ledger agreed with independent hp poll', r.results.every(x => x.ledgerAgrees)],
      ['victim HP mirrored back to the attacker', r.results.every(x => x.attackerSees.mirrored !== false)],
    ];
    console.log('-- proof --');
    let allOk = true;
    for (const [n, ok] of checks) { if (!ok) allOk = false; console.log('  ' + (ok ? 'ok   ' : 'FAIL ') + n); }

    /* Localise a failure instead of leaving the reader to. This is the only reason phases 3+4 exist. */
    const swingH = byName['1. real swing  host → guest'].hit, swingG = byName['2. real swing  guest → host'].hit;
    const rawH = byName['3. raw sendPvp host → guest'].hit, rawG = byName['4. raw sendPvp guest → host'].hit;
    console.log('\n-- where a failure lives --');
    for (const [dir, swing, raw, geo] of [['host → guest', swingH, rawH, byName['1. real swing  host → guest'].reach],
                                          ['guest → host', swingG, rawG, byName['2. real swing  guest → host'].reach]]) {
      if (swing && raw) console.log('  ' + dir + ': hit detection AND transport both work.');
      else if (!swing && raw) console.log('  ' + dir + ': TRANSPORT WORKS, HIT DETECTION DOES NOT. MP.pvpMelee (index.html:12557) '
        + 'did not turn the swing into a sendPvp. Geometry at swing time: ' + JSON.stringify(geo));
      else if (swing && !raw) console.log('  ' + dir + ': the swing landed but a raw sendPvp did not — that is contradictory and the '
        + 'probe itself is suspect. Do not report either as a game result.');
      else console.log('  ' + dir + ': TRANSPORT IS BROKEN. Neither a real swing nor a raw sendPvp reached the target.');
    }

    console.log('\n  A ' + JSON.stringify(r.A));
    console.log('  B ' + JSON.stringify(r.B));
    console.log('\n-- notes --');
    console.log('  1. /turn 404s under the local static server, so ensureIce fell back to STUN-only. THE CLOUDFLARE '
      + 'TURN RELAY WAS NOT EXERCISED and nothing here speaks to it.');
    console.log('  2. sim rate: A ' + r.rate.A.gamePerReal + ', B ' + r.rate.B.gamePerReal + ' game-seconds per real second. '
      + 'invuln/atkCd are GAME time; the 2s respawn is REAL time. They are not the same second on this hardware.');
    console.log('  3. MP.takePvpDamage and MP.sendPvp were WRAPPED by this harness to record before/after hp. They call '
      + 'through unmodified, and every row was cross-checked against an independent poll of G.p.hp.');
    exitCode = allOk ? 0 : 1;
    console.log('\n' + (allOk ? 'DUEL ✓  all four damage routes verified in room ' + r.code
      : 'DUEL — one or more routes FAILED, see above'));
  } catch (e) {
    console.log('\n-- FAILED --');
    console.log('  step: ' + (e.step || '(driver)'));
    console.log('  why : ' + (e.why || e.message));
    if (e.detail && Object.keys(e.detail).length) console.log('  detail: ' + JSON.stringify(e.detail, null, 2));
    if (e.detail && e.detail.network) console.log('\n  ^ NETWORK, NOT THE GAME.');
    if (!e.step) console.log(e.stack);
    exitCode = 2;
  } finally {
    if (pair) {
      for (const c of [pair.A, pair.B]) {
        const errs = c.errors();
        console.log('\n-- page errors [' + c.tag + '] (' + errs.length + ' distinct) --');
        errs.slice(0, 6).forEach(e => console.log('  x' + e.count + '  ' + e.text.slice(0, 180)));
        if (!errs.length) console.log('  none');
      }
      const miss = [...new Set(pair.server.misses)];
      if (miss.length) console.log('\n-- 404s -- ' + JSON.stringify(miss.slice(0, 10)));
      if (has('shots')) {
        const out = path.join(import.meta.dirname, 'out');
        for (const c of [pair.A, pair.B]) console.log('shot → ' + await c.shot(path.join(out, 'pvp-' + c.tag + '.png')));
      }
      await pair.close();
    }
    console.log('\ntotal ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
    process.exit(exitCode);
  }
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('harness/mp2/pvp.js')) main();
