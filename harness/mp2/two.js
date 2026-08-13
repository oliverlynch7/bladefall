/* ─────────────────────────────────────────────────────────────────────────────
   harness/mp2/two.js — TWO real game clients, one static server, one process.

   WHY THIS EXISTS. Every driver in this repo can drive exactly one page. shot.js calls
   `Target.createTarget` once (shot.js:700) and closes the resulting `sessionId` into its
   `evaluate()` (shot.js:724), so every step downstream — the run-up, the readiness wait, the
   probe, the shutter — is hard-bound to one document. drive.js shells out to shot.js and
   inherits the same shape. So the multiplayer code has never been run against a second client:
   `MP.host()` has been called, but nothing has ever joined it. Everything the repo believes
   about co-op is either read off the source or measured on the host half alone.

   WHY IT DOES NOT REUSE shot.js. shot.js has no exports (`grep module.exports` → 0 hits), parses
   process.argv at module scope, and ends in an IIFE that calls `process.exit(0)`. Requiring it
   takes a screenshot and kills your process. The parts worth having are copied below, each one
   marked with the line it came from, so the next person can diff them when shot.js moves.

   WHAT IS COPIED, AND WHAT IS DELIBERATELY NOT:
     copied  — Chrome discovery (shot.js:568), MIME + static server (:576), class CDP (:600),
               the Chrome arg list (:677), console/exception capture (:704), evaluate() (:724),
               the deduped error report (:819), the two-rAF settle (:809), profile sweep (:653).
     NOT copied — sceneJs()/sceneReady() (:185-471, ~290 lines). That is the most drift-sensitive
               code in the repo; its own comments record the same race being fixed four separate
               times, and a third copy is how that becomes five. Only the `hub` destination is
               reproduced here (RUNUP_HUB / hubReady), because that is the one scene a co-op test
               needs, and it is reproduced VERBATIM so a diff against shot.js is one glance.

   TWO THINGS THIS FIXES RATHER THAN COPIES:

   1. THE DEBUG PORT IS NOT GUESSED. shot.js:676 does `9200 + httpPort % 300` — it derives the
      DevTools port from an ephemeral HTTP port, giving 300 possible values. The recon that
      preceded this file measured what a collision does (not re-measured here, so: reported, not
      mine): the second Chrome's port bind fails SILENTLY because stdio is 'ignore', the process
      stays alive doing nothing, and `/json/version` hands back the FIRST browser's
      webSocketDebuggerUrl — so run 2 drives run 1's page and reports a complete, plausible
      screenshot of the wrong game. Whatever the odds are for two independent runs, two clients
      launched from ONE process would derive the same port from the same httpPort every time.
      Here Chrome is launched with `--remote-debugging-port=0` and the port is READ BACK from
      <profile>/DevToolsActivePort, which is Chrome's own answer rather than our arithmetic.
      MEASURED here across seven two-client runs: A and B always landed on different ports, and
      the driver prints both and shouts if they are ever equal.

   2. BOOT IS POLLED, NOT SLEPT. shot.js sleeps a flat `--wait` (default 9000ms) before touching
      the page. Two clients booting on the same SwiftShader CPU are slower than one, so a fixed
      sleep is a coin flip here. This polls for `__BF3` and reports how long it actually took.

   THE TRAP THIS DRIVER EXISTS TO AVOID IS STILL LIVE. A 3D screenshot or probe taken too early is
   not blank and is not an error: the game has already fallen back to the voxel renderer, so you
   get a complete, plausible, WRONG answer. `ready()` below is that wait, and it is LOUD when it
   gives up — a silent timeout would be the same trap wearing a different hat.

   Usage:
     import { twoClients } from './two.js';
     const pair = await twoClients();                       // both booted, both in the hub, 3D built
     const code = await pair.evalA('__BF3.MP.code');
     await pair.close();
   ───────────────────────────────────────────────────────────────────────────── */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const WEBROOT = path.join(ROOT, 'public');

/* shot.js:568 — verbatim. */
const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(p => fs.existsSync(p));

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ── static server (public/) — shot.js:576, with one addition ───────────────
   ONE server feeds BOTH clients. It does not need duplicating: `listen(0)` is ephemeral so
   there is no port to collide, and both clients are then same-origin, which matters not at all
   here (they are separate browser processes with separate profiles) but would matter a great
   deal if anyone ever tries the two-iframes-in-one-page shortcut — localStorage is per ORIGIN,
   and the game persists `meta` on every hub entry, so two same-origin clients in one profile
   overwrite each other's save.

   The addition is `routes`: /turn 404s under a local static server, which is measured and
   harmless (MP.ensureIce at index.html:12215 swallows it and falls back to STUN-only) but means
   a local two-client run NEVER EXERCISES THE CLOUDFLARE TURN RELAY. Anything this harness says
   about TURN would be a claim about code that did not run. The hook is here so a future test can
   serve a real /turn instead of pretending. */
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.gltf': 'model/gltf+json', '.glb': 'model/gltf-binary',
  '.bin': 'application/octet-stream', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.css': 'text/css', '.wasm': 'application/wasm', '.ktx2': 'image/ktx2',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
};

export async function startServer(opts = {}) {
  const webroot = opts.webroot || WEBROOT;
  const routes = opts.routes || {};
  const misses = [];

  /* SERVED FROM RAM, WHICH SHOT.JS DOES NOT NEED TO DO AND THIS DOES.

     shot.js streams every hit off disk (`createReadStream(file).pipe(res)`). Fine for one client.
     Two clients pull the whole asset set through ONE Node event loop at once, and the measured
     result was not slowness — it was FAILED LOADS. Measured 2026-08-13, same flags, same server:
       1 client  → ready in 14.3s, zero page errors, zero 404s.
       2 clients → ready in 29.5s and 79.4s, and one run produced 220 GLTFLoader
                   "Couldn't load texture" errors across three kit textures — with those files
                   present on disk and NOT in the 404 list, i.e. requests that reached the server
                   and died in flight under load.
     Those files are NOT missing — `node _shot/shot.js --assets all` reports T_Trim_Furniture_
     BaseColor.png and Textures/colormap.png as `ok`, i.e. present on disk. So a reader seeing 220
     missing-texture errors would conclude the art regressed, and shot.js's own header is one long
     warning about exactly this class of confident wrong answer.

     Caching turns each asset into one disk read shared by both clients. MEASURED IMPROVEMENT, NOT
     A CURE: the same test went 144.8s → 101.3s and 220 texture errors → 44. It did not reach zero,
     so the remaining failures are NOT disk latency — most likely Chrome aborting requests or
     failing image decode under two SwiftShader instances, which is CLIENT side and beyond this
     server's reach. That mechanism is UNVERIFIED; what is measured is that the files exist, the
     requests were not 404s, and one client on this same server produces none of it.
     Bounded so pointing this at a big webroot cannot eat the machine; over the cap it falls back
     to streaming, which is shot.js's behaviour and is merely slow rather than wrong. */
  const cache = new Map();
  let cached = 0;
  const CACHE_MAX = opts.cacheMaxBytes || 512 * 1024 * 1024;
  const FILE_MAX = 16 * 1024 * 1024;

  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    const custom = routes[rel];
    if (custom) { try { custom(req, res); } catch (e) { res.writeHead(500); res.end('route threw'); } return; }
    const file = path.join(webroot, path.normalize(rel).replace(/^(\.\.[\/\\])+/, ''));
    if (!file.startsWith(webroot)) { misses.push(rel); res.writeHead(404); res.end('nope'); return; }
    const hit = cache.get(file);
    const head = () => ({
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
    });
    if (hit) { res.writeHead(200, head()); res.end(hit); return; }
    let st = null;
    try { st = fs.statSync(file); } catch (e) { /* missing */ }
    if (!st || st.isDirectory()) { misses.push(rel); res.writeHead(404); res.end('nope'); return; }
    if (st.size <= FILE_MAX && cached + st.size <= CACHE_MAX) {
      let buf = null;
      try { buf = fs.readFileSync(file); } catch (e) { /* fall through to streaming */ }
      if (buf) { cache.set(file, buf); cached += buf.length; res.writeHead(200, head()); res.end(buf); return; }
    }
    res.writeHead(200, head());
    const rs = fs.createReadStream(file);
    /* pipe() does not forward source errors, and an unhandled 'error' on a ReadStream takes the
       whole process down — which would read as "the harness crashed", not "one asset failed". */
    rs.on('error', () => { try { res.end(); } catch (e) {} });
    rs.pipe(res);
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  return {
    port, misses,
    stats: () => ({ files: cache.size, bytes: cached }),
    origin: 'http://127.0.0.1:' + port,
    url: (p) => 'http://127.0.0.1:' + port + p,
    /* closeAllConnections, or close() hangs on Chrome's keep-alives and the process never exits. */
    close: () => new Promise(r => { try { srv.closeAllConnections(); } catch (e) {} srv.close(r); }),
  };
}

/* ── minimal CDP client over the built-in WebSocket — shot.js:600, verbatim ─
   `send()` already took an optional sessionId; it is the DRIVER that assumed one page, not this. */
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.handlers = []; }
  static async attach(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = () => no(new Error('ws fail')); });
    const c = new CDP(ws);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && c.pending.has(msg.id)) {
        const { ok, no } = c.pending.get(msg.id); c.pending.delete(msg.id);
        msg.error ? no(new Error(msg.error.message)) : ok(msg.result);
      } else if (msg.method) c.handlers.forEach(h => h(msg));
    };
    return c;
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    return new Promise((ok, no) => {
      this.pending.set(id, { ok, no });
      setTimeout(() => { if (this.pending.delete(id)) no(new Error('CDP timeout: ' + method)); }, 180000);
    });
  }
  on(fn) { this.handlers.push(fn); }
  close() { try { this.ws.close(); } catch (e) {} }
}

/* ── profile housekeeping — shot.js:653, own prefix ─────────────────────────
   Two halves for the same reason shot.js needs two: the exit handler cannot run when a run is
   hard-killed, and %TEMP% currently holds dozens of orphaned `bf-shot-*` profiles proving it.
   Measured while building this: even a clean shutdown loses the rmSync race with a still-dying
   Chrome often enough that the startup sweep is doing most of the work, not the exit handler. */
const PROFILE_PFX = 'bf-mp2-';
function sweepStale() {
  try {
    const dir = os.tmpdir(), cutoff = Date.now() - 3600e3;
    let gone = 0;
    for (const name of fs.readdirSync(dir)) {
      if (!name.startsWith(PROFILE_PFX)) continue;
      const p = path.join(dir, name);
      try {
        if (fs.statSync(p).mtimeMs > cutoff) continue;
        fs.rmSync(p, { recursive: true, force: true });
        gone++;
      } catch (e) { /* in use, or vanished under us */ }
    }
    if (gone) console.log('swept ' + gone + ' stale mp2 Chrome profile(s)');
  } catch (e) { /* never fatal */ }
}

const LIVE = new Set();
process.on('exit', () => {
  for (const c of LIVE) { try { c._chrome.kill(); } catch (e) {} try { fs.rmSync(c.profile, { recursive: true, force: true }); } catch (e) {} }
});

/* ── one client = one Chrome process = one profile = one page ───────────────── */
export async function launchClient(opts = {}) {
  if (!CHROME) throw new Error('No Chrome/Edge binary found.');
  const tag = opts.tag || '?';
  const W = (opts.size && opts.size.w) || 1280, H = (opts.size && opts.size.h) || 720;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), PROFILE_PFX + tag + '-'));

  /* PORT 0, NOT A GUESS. See the header. Chrome writes the port it actually bound into
     <profile>/DevToolsActivePort: line 1 is the port, line 2 the browser ws path. */
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--remote-debugging-port=0',
    '--user-data-dir=' + profile,
    '--window-size=' + W + ',' + H,
    '--hide-scrollbars', '--mute-audio',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--allow-file-access-from-files', '--disable-dev-shm-usage',
    'about:blank',
  ], { stdio: 'ignore' });

  const portFile = path.join(profile, 'DevToolsActivePort');
  let wsUrl = null, dbgPort = null;
  for (let i = 0; i < 150 && !wsUrl; i++) {
    try {
      const raw = fs.readFileSync(portFile, 'utf8').split('\n');
      if (raw.length >= 2 && raw[0].trim()) {
        dbgPort = parseInt(raw[0].trim(), 10);
        wsUrl = 'ws://127.0.0.1:' + dbgPort + raw[1].trim();
      }
    } catch (e) { /* not written yet */ }
    if (!wsUrl) await sleep(200);
  }
  if (!wsUrl) {
    try { chrome.kill(); } catch (e) {}
    throw new Error('[' + tag + '] Chrome never wrote DevToolsActivePort (profile ' + profile + ')');
  }

  const cdp = await CDP.attach(wsUrl);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

  /* shot.js:704 — console + exception capture, per client. Filtered by sessionId because one
     browser could in principle carry more than one; ours carries one, and saying so costs a line. */
  const logs = [];
  cdp.on(msg => {
    if (msg.sessionId && msg.sessionId !== sessionId) return;
    if (msg.method === 'Runtime.consoleAPICalled') {
      const t = msg.params.type;
      const text = msg.params.args.map(a => a.value !== undefined ? a.value : (a.description || a.type)).join(' ');
      logs.push({ t, text });
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      logs.push({ t: 'exception', text: (d.exception && d.exception.description) || d.text });
    }
  });

  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  await cdp.send('Emulation.setDeviceMetricsOverride',
    { width: W, height: H, deviceScaleFactor: 1, mobile: false }, sessionId);

  const client = {
    tag, profile, dbgPort, logs, _chrome: chrome,

    /* shot.js:724 — verbatim. awaitPromise:true is what lets a caller hand back a Promise, which
       is the only sane way to wrap MP's callback-style host()/join().

       Yes, this evaluates a string. That is the entire job of a browser harness: the expression is
       written by this repo's own probe files, it runs in a throwaway headless Chrome profile that
       is deleted on exit, and the only thing it can reach is a local static server serving public/.
       There is no untrusted input path into `expr`, and no route from the page back to the host. */
    async eval(expr) {
      const r = await cdp.send('Runtime.evaluate', {
        expression: expr, returnByValue: true, awaitPromise: true, allowUnsafeEvalBlockedByCSP: true,
      }, sessionId);
      if (r.exceptionDetails) return { error: (r.exceptionDetails.exception || {}).description || r.exceptionDetails.text };
      return { value: r.result.value };
    },
    async evalOk(expr) {
      const r = await client.eval(expr);
      if (r.error) throw new Error('[' + tag + '] page threw: ' + String(r.error).split('\n')[0] + '\n  expr: ' + expr.slice(0, 200));
      return r.value;
    },
    async goto(url) { await cdp.send('Page.navigate', { url }, sessionId); },

    /* Poll an expression until truthy. Returns rather than throws, and carries the LAST observed
       value, because "it never became true" is only useful next to "here is what it was instead". */
    async waitFor(expr, o = {}) {
      const max = o.timeoutMs || 60000, poll = o.pollMs || 400, t0 = Date.now();
      let last = null;
      while (Date.now() - t0 < max) {
        const r = await client.eval(expr);
        last = r.error ? { error: String(r.error).split('\n')[0] } : r.value;
        if (r.value) return { ok: true, ms: Date.now() - t0, last };
        await sleep(poll);
      }
      return { ok: false, ms: Date.now() - t0, last, expr };
    },

    /* shot.js:809 — two rAF ticks, not one: the first only proves the callback ran, the second
       proves the frame it drew was composited. Falls back to a sleep if rAF never fires. */
    frame() {
      return client.eval('new Promise(function(r){var t=setTimeout(r,400);'
        + 'requestAnimationFrame(function(){requestAnimationFrame(function(){clearTimeout(t);r();});});})');
    },

    async shot(outPath) {
      await client.frame();
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      const s = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
      fs.writeFileSync(outPath, Buffer.from(s.data, 'base64'));
      return outPath;
    },

    /* shot.js:819 — deduped. One missing kit texture throws once per model that references it,
       so an undeduped list is 136 identical lines with the real fault buried under them. */
    errors() {
      const bad = logs.filter(l => l.t === 'error' || l.t === 'exception');
      const byText = new Map();
      for (const l of bad) { const k = l.t + ': ' + l.text.split('\n')[0]; byText.set(k, (byText.get(k) || 0) + 1); }
      return [...byText].sort((a, b) => b[1] - a[1]).map(([text, count]) => ({ text, count }));
    },

    /* THE PROFILE HAS TO ACTUALLY GO. Measured 2026-08-13: after four runs of connect.js, twelve
       `bf-mp2-*` profiles were still in %TEMP% holding 1.79 GB — a single rmSync straight after
       kill() loses the race with a still-dying Chrome essentially every time, which is exactly how
       shot.js accumulated the 35 orphans sitting next to them and how `_autopilot.log` came to
       carry `ENOSPC: no space left on device`. So: wait for the process to actually exit, then
       retry the delete with backoff. Best-effort throughout — a cleanup that can throw would turn
       a full disk into a broken test, which is strictly worse than a full disk. */
    async close() {
      LIVE.delete(client);
      try { await cdp.send('Browser.close'); } catch (e) {}
      cdp.close();
      try { chrome.kill(); } catch (e) {}
      const dead = new Promise(r => { if (chrome.exitCode !== null) r(); else chrome.once('exit', r); });
      await Promise.race([dead, sleep(5000)]);
      for (let i = 0; i < 10; i++) {
        try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
        if (!fs.existsSync(profile)) return;
        await sleep(250 * (i + 1));
      }
      console.log('note: could not delete ' + profile + ' — the next run sweeps it');
    },
  };
  LIVE.add(client);
  return client;
}

/* ── the hub run-up — shot.js:349-359, the `hub` destination, verbatim ───────
   The game does not open in a zone. It opens on the title, then a story cutscene, then class
   select, then a class TRIAL, then the hub — five gates, each of which will happily hand you a
   screenshot of itself. The dismiss list is a WHITELIST of ids and not "click the first button in
   the overlay", because these cards sit next to menus whose first button is Exit or Title Screen
   and a generic clicker walks the run back out to the attract screen. */
export const RUNUP_HUB = `(function(){
  var ids=['storyskip','hubTutGo'];
  var t=setInterval(function(){
    for(var i=0;i<ids.length;i++){ var b=document.getElementById(ids[i]); if(b&&b.offsetParent) b.click(); }
  },300);
  __BF3.startTrial('warrior');
  setTimeout(function(){
    __BF3.skipTrial();
    setTimeout(function(){ clearInterval(t); }, 5000);
  }, 2500);
})()`;

/* shot.js:463-470 for dest==='hub' — same two halves, one clause stricter.

   The two halves are "the GAME is in the hub" (G.hub, set synchronously by the hub build) and
   "the BUILD is of the hub" (counts.hub is set only by the hub build). Both are needed: the run-up
   passes through the class TRIAL, and world3d builds THAT too, so `built` alone comes true in the
   arena on the way.

   THE ONE CHANGE, and it is deliberate. shot.js FAILS OPEN when world3d is absent — `if(!w) return
   true; if(!w.on) return true;` — so that `--scene 0 --url "...?world3d=0"` resolves instead of
   burning the full readymax. Correct there. Wrong here: `window.__world3d` is installed by a
   module script (world3d.js:2005) loaded after the game, so during the first seconds of boot `w`
   is undefined and the test passes on a page whose 3D world does not exist yet — the exact voxel
   fallback this wait is for. shot.js is protected from that by its flat 9s `--wait`; this driver
   polls instead, so it needs the gate to be real. `requireWorld3d` turns the fail-open into a
   fail-closed, and twoClients() sets it from the URL — asked for world3d=1, so prove it. */
export function hubReady(requireWorld3d) {
  return '(function(){ try{'
    + ' var w = window.__world3d && __world3d();'
    + (requireWorld3d ? ' if(!w || !w.on) return false;' : '')
    + ' if(!(window.__BF3 && __BF3.G && !!__BF3.G.hub)) return false;'
    + ' if(!w) return true;'
    + ' if(!w.on) return true;'
    + ' return !!(w.built && w.counts && !!w.counts.hub);'
    + ' }catch(e){ return false; } })()';
}

/* Say WHERE it landed, in the level's own words — shot.js:757. Two ready-expression bugs in two
   days both looked identical from the log ("ready ✓" and a plausible picture of somewhere else)
   and both would have been obvious the moment the run printed the name of the place. */
export const WHERE_JS = '(function(){ var G=window.__BF3&&__BF3.G; if(!G) return null;'
  + ' return (G.areaName||(G.sparringRoom?"Sparring Room":"?"))'
  + ' + (G.sparringRoom?" [SPAR]":G.hub?" [hub]":G.trial?" [TRIAL]":G.side?" [side]":"")'
  + ' + "  zone " + G.zone + " stage " + G.stageIndex + " mode " + __BF3.mode; })()';

const DEFAULT_PATH = '/3d/index.html?hero3d=1&world3d=1&nobloom';

/* ── the pair ───────────────────────────────────────────────────────────────
   Boots both clients, runs the hub run-up on both, and does not return until BOTH have passed the
   readiness gate — or says, loudly and per client, that one of them did not. A pair where one side
   is still on the title screen is not a two-client test; it is a one-client test with an audience.

   Both clients boot CONCURRENTLY. That is not just for speed: two SwiftShader instances compete
   for the same CPU, and serialising them would hide how much slower the pair is than a single run
   — which is a number this harness should be able to state.  */
export async function twoClients(opts = {}) {
  sweepStale();
  const log = opts.log === false ? () => {} : (opts.log || console.log);
  const pathA = opts.pathA || opts.path || DEFAULT_PATH;
  const pathB = opts.pathB || opts.path || DEFAULT_PATH;
  const bootMax = opts.bootTimeoutMs || 90000;
  const readyMax = opts.readyTimeoutMs || 180000;   // 120s in shot.js, for ONE client on this CPU
  const runup = opts.runup === undefined ? RUNUP_HUB : opts.runup;
  const wantsWorld3d = (p) => /world3d=1/.test(p);
  const readyA = opts.ready || hubReady(wantsWorld3d(pathA));
  const readyB = opts.ready || hubReady(wantsWorld3d(pathB));

  const server = await startServer(opts);
  log('server → ' + server.origin);

  let A = null, B = null;
  const close = async () => {
    const errs = [];
    for (const c of [B, A]) { if (c) { try { await c.close(); } catch (e) { errs.push(e.message); } } }
    try { await server.close(); } catch (e) { errs.push(e.message); }
    return errs;
  };

  try {
    [A, B] = await Promise.all([
      launchClient({ tag: opts.tagA || 'A', size: opts.size }),
      launchClient({ tag: opts.tagB || 'B', size: opts.size }),
    ]);
    log('chrome → A dbg ' + A.dbgPort + '   B dbg ' + B.dbgPort
      + (A.dbgPort === B.dbgPort ? '   !! SAME PORT — the two clients are the same browser' : ''));

    await Promise.all([A.goto(server.url(pathA)), B.goto(server.url(pathB))]);
    log('nav    → A ' + pathA + '\n         B ' + pathB);

    /* Boot gate. Polled, not slept: two clients on one SwiftShader CPU are slower than one, so a
       fixed wait is a coin flip. `startTrial` specifically, because that is what the run-up calls
       — "__BF3 exists" and "__BF3 is usable" are not the same instant. */
    const bootExpr = '!!(window.__BF3 && __BF3.startTrial && __BF3.MP)';
    const [bA, bB] = await Promise.all([
      A.waitFor(bootExpr, { timeoutMs: bootMax }), B.waitFor(bootExpr, { timeoutMs: bootMax }),
    ]);
    for (const [c, r] of [[A, bA], [B, bB]]) {
      if (!r.ok) throw new Error('[' + c.tag + '] __BF3 never appeared after ' + (r.ms / 1000).toFixed(1)
        + 's. The page did not boot. errors: ' + JSON.stringify(c.errors().slice(0, 3)));
    }
    log('boot   ✓ A ' + (bA.ms / 1000).toFixed(1) + 's   B ' + (bB.ms / 1000).toFixed(1) + 's');

    /* A hook for work that must happen while the page is still IDLE. It exists because of a
       measured harness artifact: this one Node process streams the whole asset set to BOTH
       SwiftShader Chromes at once, and anything the page fetches during that window queues behind
       it. Measured on one client — a request that takes 11ms at boot and 3ms once settled takes
       4857ms mid-build; in a two-client run the same request took 75s. That is our static server,
       not the game, and letting it bleed into an MP timing would be measuring the harness. */
    if (opts.preBoot) {
      const [pA, pB] = await Promise.all([A.eval(opts.preBoot), B.eval(opts.preBoot)]);
      log('prewarm→ A ' + JSON.stringify(pA.value ?? pA) + '   B ' + JSON.stringify(pB.value ?? pB));
    }

    if (runup) {
      const [rA, rB] = await Promise.all([A.eval(runup), B.eval(runup)]);
      if (rA.error || rB.error) throw new Error('run-up threw: A=' + JSON.stringify(rA) + ' B=' + JSON.stringify(rB));
      log('runup  → sent to both');

      const [wA, wB] = await Promise.all([
        A.waitFor(readyA, { timeoutMs: readyMax, pollMs: 500 }),
        B.waitFor(readyB, { timeoutMs: readyMax, pollMs: 500 }),
      ]);
      for (const [c, r, expr] of [[A, wA, readyA], [B, wB, readyB]]) {
        if (r.ok) log('ready  ✓ ' + c.tag + ' after ' + (r.ms / 1000).toFixed(1) + 's');
        else log('!! READY NEVER CAME for ' + c.tag + ' after ' + (r.ms / 1000).toFixed(1) + 's — anything measured '
          + 'from here is NOT the state you asked for and must not be read as a regression.'
          + '\n   last=' + JSON.stringify(r.last) + '\n   expr=' + expr);
      }
      const [whA, whB] = await Promise.all([A.evalOk(WHERE_JS), B.evalOk(WHERE_JS)]);
      log('at     → A ' + whA + '\n         B ' + whB);
      if (!wA.ok || !wB.ok) {
        const err = new Error('readiness gate failed: A=' + (wA.ok ? 'ok' : 'TIMEOUT') + ' B=' + (wB.ok ? 'ok' : 'TIMEOUT'));
        err.detail = { A: { ok: wA.ok, ms: wA.ms, last: wA.last, at: whA, errors: A.errors().slice(0, 5) },
                       B: { ok: wB.ok, ms: wB.ms, last: wB.last, at: whB, errors: B.errors().slice(0, 5) } };
        throw err;
      }
    }

    return {
      server, A, B, log,
      evalA: (e) => A.evalOk(e),
      evalB: (e) => B.evalOk(e),
      rawA: (e) => A.eval(e),
      rawB: (e) => B.eval(e),
      waitA: (e, o) => A.waitFor(e, o),
      waitB: (e, o) => B.waitFor(e, o),
      both: (e) => Promise.all([A.evalOk(e), B.evalOk(e)]),
      close,
    };
  } catch (e) {
    await close();
    throw e;
  }
}
