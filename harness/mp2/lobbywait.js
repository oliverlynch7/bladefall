/* ─────────────────────────────────────────────────────────────────────────────
   harness/mp2/lobbywait.js — what does the JOIN LOBBY tell a guest whose host is nowhere?

   Run:  node harness/mp2/lobbywait.js
         node harness/mp2/lobbywait.js --secs 30      # longer sample window

   THE STATE UNDER TEST IS THE NORMAL ONE, which is the whole reason it matters. openMPLobby() is
   reachable from exactly one place — the title screen's Multiplayer button (index.html:15014, the
   only call site) — so a host that has just pressed "Host Co-op" is standing in no scene at all:
   MP.hasZone() is false, placeMsg() (:12441) returns null, and no 'zone' packet is ever sent. The
   guest can join that room completely successfully. Measured on two real clients: socket open,
   `hello` landed, peer lists populated in BOTH directions, host broadcasting — and MP.zone -1,
   rseed 0, the guest standing nowhere.

   WHAT IT MEASURES. Not the connection — connect.js does that. This reads ONE DOM node, #mpStatus,
   the line the waiting guest is actually looking at, and asks whether it is a live signal or a
   frozen string. Sampled every 500ms for the whole window, kept verbatim, and reported as the set
   of DISTINCT strings. A one-shot line collapses to one distinct sample; that is the known-bad, and
   it is what this file was written against.

   WHY IT DRIVES THE UI INSTEAD OF CALLING MP.join(). The status line lives inside openMPLobby's
   closure, which is inside index.html's one big IIFE, so it is not reachable from __BF3 — and more
   to the point, the API path connect.js uses (MP.join direct from CDP) never executes a single line
   of the lobby. So the guest here walks the real path a player walks: pause → Title Screen →
   Multiplayer → type the code → Join. Every step is polled for the element the next step needs, so
   a UI change breaks this loudly instead of silently testing nothing.

   ONE DEVIATION FROM A REAL SESSION, stated because it is measurable: the HOST here presses Host
   while in the hub in play mode (the harness calls MP.host() directly), where a real host is on the
   title screen. Both produce hasZone()===false, which is the only property under test — and the
   in-hub host is the STRICTER of the two, because it is also broadcasting `state` at 14Hz, so the
   guest's "healthy" signals are all genuinely lit while it waits.

   WHAT IT DOES NOT PROVE. /turn 404s under the local static server, so this is STUN-only and says
   nothing about the Cloudflare TURN relay. It also does not test the PvP or special-scene paths —
   arena and endless carry their own placeMsg branch and never reach this state.
   ───────────────────────────────────────────────────────────────────────────── */
import { twoClients, WHERE_JS } from './two.js';
import { PREWARM_ICE } from './connect.js';

const argv = process.argv.slice(2);
const arg = (f, d) => { const i = argv.indexOf('--' + f); return i >= 0 ? argv[i + 1] : d; };
const SECS = parseInt(arg('secs', '22'), 10);
const SAMPLE_MS = 500;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* connect.js:84, same shape and the same reason: MP.host takes a callback and used to have no
   deadline of its own, so a Promise that never settles hangs the CDP call for 180s and reads as
   "the harness broke". Resolves with a failure object, never rejects. */
const hostJs = (ms) => `new Promise(function(res){ var done=false;
  var t=setTimeout(function(){ if(!done){ done=true; res({ok:false,info:'host-timeout'}); } }, ${ms});
  try{ __BF3.MP.host(function(ok,info){ if(done) return; done=true; clearTimeout(t);
    res({ok:!!ok, info:String(info), code:__BF3.MP.code}); }); }
  catch(e){ if(!done){ done=true; clearTimeout(t); res({ok:false,info:'threw: '+e.message}); } } })`;

/* The line the guest is reading, verbatim, plus the colour it is painted in. st() (index.html:12677)
   writes `var(--good,#3ad07f)` for success and `var(--muted,#8b8f9a)` otherwise, so the raw inline
   value carries which of the two it chose — read as authored rather than as a resolved rgb triple,
   because "is this still claiming success" is the question and the resolved colour would need a
   table of theme values to answer it. */
const STATUS = `(function(){ var e=document.getElementById('mpStatus');
  if(!e) return {gone:true}; return {tx:e.textContent, col:e.style.color||''}; })()`;

const HEALTH = `(function(){ var M=__BF3.MP, G=__BF3.G; return {
  active:!!M.active, isHost:!!M.isHost, code:M.code||'', zone:M.zone, hasZone:!!M.hasZone(),
  rseed:M.rseed, seed:M.seed, peers:Object.keys(M.peers||{}), conns:(M.conns||[]).length,
  connPids:(M.conns||[]).map(function(c){ return c._pid||null; }),
  hostConnOpen:!!(M.hostConn&&M.hostConn.open), mode:__BF3.mode, hub:!!(G&&G.hub) }; })()`;

/* pausebtn listens on POINTERDOWN, not click (index.html:16975) — .click() on it does nothing at
   all, which is exactly the kind of step that "passes" while driving no game. */
const PAUSE = `(function(){ var b=document.getElementById('pausebtn'); if(!b) return 'no pausebtn';
  b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true})); return 'ok'; })()`;
/* The title screen opens in ATTRACT stage: the art alone, menu revealed by the first key/pointer
   (index.html:14994). #mmMP exists in the DOM either way, but revealing first is what a player does
   and it keeps this honest if the reveal ever becomes a real mount. */
const REVEAL = `(window.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})),'ok')`;

async function step(pair, tag, name, expr, gateExpr, timeoutMs = 15000) {
  const wait = tag === 'A' ? pair.waitA : pair.waitB;
  const ev = tag === 'A' ? pair.evalA : pair.evalB;
  const r = await ev(expr);
  const g = await wait(gateExpr, { timeoutMs, pollMs: 300 });
  console.log('  ' + (g.ok ? 'ok   ' : 'FAIL ') + name + '  (' + JSON.stringify(r) + ', gate '
    + (g.ok ? (g.ms / 1000).toFixed(1) + 's' : 'TIMEOUT last=' + JSON.stringify(g.last)) + ')');
  if (!g.ok) throw new Error('lobby path broke at: ' + name);
  return r;
}

async function main() {
  const t0 = Date.now();
  const base = '/3d/index.html?hero3d=1&world3d=1&nobloom';
  console.log('=== mp2/lobbywait — the guest joined; the host is nowhere. What does the lobby say? ===');
  console.log('sample → #mpStatus every ' + SAMPLE_MS + 'ms for ' + SECS + 's');

  let pair = null, exit = 1;
  try {
    pair = await twoClients({ path: base, preBoot: PREWARM_ICE });

    // ── 1. host, and DO NOT declare a zone (this is what pressing Host actually does) ──
    console.log('\n-- host (no zone: the shipping lobby has nothing to declare) --');
    let host = null;
    for (let i = 0; i < 3; i++) {
      if (i) { await pair.evalA('try{ __BF3.MP.peer && __BF3.MP.peer.destroy(); }catch(e){}; __BF3.MP.peer=null; 1'); await sleep(1500); }
      host = await pair.evalA(hostJs(30000));
      console.log('  host → attempt ' + (i + 1) + ' ' + JSON.stringify(host));
      if (host.ok || host.info === 'no internet') break;
    }
    if (!host.ok) {
      console.log('\nUNVERIFIABLE — could not host' + (host.info === 'no internet'
        ? '. PeerJS did not load: NETWORK, not the game.' : ' (' + host.info + ').'));
      exit = 3; return;
    }
    const up = await pair.waitA('!!(__BF3.MP.active && __BF3.MP.peer && __BF3.MP.peer.id === __BF3.MP.ROOMPFX + __BF3.MP.code)',
      { timeoutMs: 30000 });
    if (!up.ok) { console.log('\nUNVERIFIABLE — host callback fired but the peer never took its room id.'); exit = 3; return; }
    const code = await pair.evalA('__BF3.MP.code');
    const hz = await pair.evalA('__BF3.MP.hasZone()');
    console.log('  room ' + code + ',  host hasZone=' + hz + '   <- the premise: ' + (hz ? '!! HOST HAS A ZONE, this run tests nothing' : 'host is nowhere'));
    if (hz) { console.log('\nUNVERIFIABLE — the host declared a zone, so the wait under test never happens.'); exit = 3; return; }

    // ── 2. the guest walks the real path to the lobby ─────────────────────────
    console.log('\n-- guest: pause -> Title Screen -> Multiplayer -> Join --');
    await step(pair, 'B', 'pause menu opens', PAUSE, '!!document.getElementById("titleBtnP")');
    await step(pair, 'B', 'title screen', 'document.getElementById("titleBtnP").click(),"ok"', '!!document.getElementById("mmMP")');
    await pair.evalB(REVEAL);
    await step(pair, 'B', 'multiplayer lobby', 'document.getElementById("mmMP").click(),"ok"', '!!document.getElementById("mpJoin")');
    await step(pair, 'B', 'join pressed', '(function(){ var i=document.getElementById("mpJoinCode"); i.value=' + JSON.stringify(code)
      + '; document.getElementById("mpJoin").click(); return "clicked"; })()',
      '!!(__BF3.MP.active && !__BF3.MP.isHost && __BF3.MP.hostConn && __BF3.MP.hostConn.open)', 45000);

    const shook = await pair.waitA('(function(){var M=__BF3.MP; return Object.keys(M.peers).length>=1 && !!(M.conns[0]&&M.conns[0]._pid);})()',
      { timeoutMs: 30000 });
    const heard = await pair.waitB('Object.keys(__BF3.MP.peers).length >= 1', { timeoutMs: 30000 });
    console.log('  handshake: host sees guest ' + (shook.ok ? 'YES' : 'no') + ',  guest sees host ' + (heard.ok ? 'YES' : 'no')
      + '   <- both green is the point: this session looks perfect from every angle except where the guest is');

    // ── 3. sample the one line the guest is actually reading ──────────────────
    console.log('\n-- ' + SECS + 's on the lobby card --');
    const samples = [];
    const sT0 = Date.now();
    while (Date.now() - sT0 < SECS * 1000) {
      const s = await pair.evalB(STATUS);
      samples.push({ t: Math.round((Date.now() - sT0) / 100) / 10, ...s });
      await sleep(SAMPLE_MS);
    }
    const A = await pair.evalA(HEALTH), B = await pair.evalB(HEALTH);
    const texts = samples.map(s => s.gone ? '(card gone)' : s.tx);
    const distinct = [...new Set(texts)];
    const good = samples.filter(s => /--good/.test(s.col || '')).length;

    console.log('  samples ' + samples.length + ', distinct strings ' + distinct.length);
    distinct.forEach((d, i) => {
      const at = texts.indexOf(d), last = texts.lastIndexOf(d);
      console.log('   [' + (i + 1) + '] ' + samples[at].t + 's..' + samples[last].t + 's  '
        + (/--good/.test(samples[last].col || '') ? 'SUCCESS-COLOUR' : 'muted') + '  "' + d + '"');
    });
    console.log('  success-coloured samples: ' + good + '/' + samples.length);
    console.log('  host  ' + JSON.stringify(A));
    console.log('  guest ' + JSON.stringify(B));

    // ── 4. the other half: the host finally enters, the guest must be pulled in ─
    /* Zone 1 and not zone 0 on purpose. coop.js measured that a co-op guest never follows a host
       into zone 0 — onGuestData (:12328) treats "in the hub" and "in zone 0" as the same place —
       and that is a DIFFERENT bug with its own fix. Using zone 1 keeps this run about the lobby. */
    console.log('\n-- host enters zone 1; the guest should stop waiting and land --');
    await pair.evalA('__BF3.enterZone(1)');
    const inA = await pair.waitA('(function(){var G=__BF3.G; return !!(G && !G.hub && G.zone===1 && __BF3.mode==="play");})()',
      { timeoutMs: 30000, pollMs: 500 });
    const inB = await pair.waitB('(function(){var G=__BF3.G; return !!(G && !G.hub && G.zone===1 && __BF3.mode==="play");})()',
      { timeoutMs: 30000, pollMs: 500 });
    console.log('  host  landed: ' + (inA.ok ? 'YES' : 'NO, last=' + JSON.stringify(inA.last)) + '   ' + (inA.ok ? await pair.evalA(WHERE_JS) : ''));
    console.log('  guest landed: ' + (inB.ok ? 'YES' : 'NO, last=' + JSON.stringify(inB.last)) + '   ' + (inB.ok ? await pair.evalB(WHERE_JS) : ''));
    /* A ticking status line that outlives its card is a leak with teeth: openMPLobby() rebuilds the
       closure per visit, so a survivor would be writing into the NEXT card's status line.
       MEASURED HERE, and it changes what can be checked: showOverlay(false) HIDES the overlay, it
       does not clear it, so #mpStatus is still in the DOM — with its last text — long after the
       guest has landed in Hollow Pass. "The card is gone" is therefore NOT an available signal for
       anyone, this harness or the game. So the leak is checked the only way it is observable from
       outside a closure: sample twice, 3s apart, and require the text to be IDENTICAL. A live
       interval paints a second counter and cannot hold still. */
    const after1 = await pair.evalB(STATUS);
    await sleep(3000);
    const after2 = await pair.evalB(STATUS);
    console.log('  status after landing: ' + JSON.stringify(after1) + '\n                  +3s: ' + JSON.stringify(after2));

    // ── verdict ───────────────────────────────────────────────────────────────
    const zonelessThroughout = !A.hasZone && samples.every(s => !s.gone);
    const checks = [
      ['guest actually connected (hostConn open, host saw `hello`)', B.active && B.hostConnOpen && shook.ok],
      ['host had no zone for the whole window (the premise)', zonelessThroughout],
      ['guest had no zone for the whole window (MP.zone -1)', !B.hasZone && B.zone === -1],
      ['LIVE: the status line changed while waiting', distinct.length >= 2],
      ['PLAIN: it stopped claiming success', good < samples.length && !/--good/.test(samples[samples.length - 1].col || '')],
      ['PLAIN: the final line is not the old one-shot string', texts[texts.length - 1] !== 'Connected! Waiting for the host to enter a zone…'],
      ['the guest still landed once the host entered', inB.ok],
      ['the ticking stopped once the guest landed (no orphaned interval)', after1.tx === after2.tx],
    ];
    console.log('\n-- proof --');
    let allOk = true;
    for (const [n, ok] of checks) { if (!ok) allOk = false; console.log('  ' + (ok ? 'ok   ' : 'FAIL ') + n); }
    if (!(B.active && B.hostConnOpen && shook.ok)) {
      console.log('\nUNVERIFIABLE — the guest never really connected, so the wait it was shown is not the wait under test.');
      exit = 3; return;
    }
    exit = allOk ? 0 : 1;
    console.log('\n' + (allOk
      ? 'PASS — a guest connected to a zoneless host is told, live and plainly, and still lands when the host enters.'
      : 'FAIL — see above. If "LIVE" and "PLAIN" are the failures, the lobby is still printing one frozen string.'));
  } catch (e) {
    console.log('\n-- FAILED --\n  ' + e.message);
    if (!/lobby path broke/.test(e.message)) console.log(e.stack);
    exit = 2;
  } finally {
    if (pair) {
      for (const c of [pair.A, pair.B]) {
        const errs = c.errors();
        console.log('\n-- page errors [' + c.tag + '] (' + errs.length + ' distinct) --');
        errs.slice(0, 6).forEach(e => console.log('  x' + e.count + '  ' + e.text.slice(0, 160)));
        if (!errs.length) console.log('  none');
      }
      await pair.close();
    }
    console.log('\ntotal ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
    process.exit(exit);
  }
}

main();
