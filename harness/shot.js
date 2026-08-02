/* ─────────────────────────────────────────────────────────────────────────────
   _shot/shot.js — headless screenshot + probe harness for the real game.

   Why it is written this way: an unattended run cannot `npm install`, and this machine has
   no playwright/puppeteer module resolvable from anywhere. It DOES have Chrome, and Node 26
   ships a global WebSocket. So this drives Chrome directly over the DevTools Protocol with
   ZERO dependencies — a ~40-line CDP client instead of a 300MB toolchain.

   It also serves public/ over real HTTP, because the 3D layer is ES modules + glTF fetches
   and file:// fails both on CORS.

   Usage:
     node _shot/shot.js                                  # default: hub, 3D on
     node _shot/shot.js --url "/3d/index.html?hero3d=1&world3d=1&nobloom"
     node _shot/shot.js --out _shot/out/hub.png --wait 9000
     node _shot/shot.js --eval "Object.keys(__BF3.G.deco[0]||{})"
     node _shot/shot.js --pre  "__BF3.enterZone('woods',1)" --wait 6000
     node _shot/shot.js --size 1280x720
     node _shot/shot.js --scene 0                        # in-game in The Outskirts, world3d built
     node _shot/shot.js --scene hub                      # standing in the Waystation
     node _shot/shot.js --ready "__mob3d().live>0"       # hold the shutter until this is true
     node _shot/shot.js --scene 0 --focus "__BF3.G.waystone"      # POINT THE CAMERA AT A THING
     node _shot/shot.js --focus "0,0,-5600" --dist 260 --side 40  # ...or at a bare x,y,z

   --scene / --ready exist because of a failure mode that WILL fool you otherwise.
   A screenshot of a 3D zone taken too early is not blank and is not an error: the game has
   already fallen back to the voxel renderer, so you get a complete, plausible, WRONG picture —
   flat ground, box trees, no roads — that looks exactly like "the 3D world regressed". On this
   machine (headless SwiftShader) world3d needs ~30-45s to fetch and parse its glTF props, so a
   `--prewait 20000` render is a voxel render every time. --ready polls the page until the world
   reports itself built and says so, and shouts if it gave up instead. Never trust a 3D-world
   screenshot that did not print "ready ✓".

   And "ready ✓" has to mean ready HERE, not ready somewhere. `--scene <n>` passes through the
   hub on the way, so a default of "the world is built" was satisfied by the HUB build seconds
   before the zone was entered — see the long note on sceneReady() below. Since 2026-08-02 the
   default waits for the destination itself, so a `--scene 0` that resolves in under a second is
   the bug, not the fast path.

   Exit 0 = screenshot written. Console errors from the page are always printed.
   ───────────────────────────────────────────────────────────────────────────── */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const WEBROOT = path.join(ROOT, 'public');

/* ── the two copies must not drift ──────────────────────────────────────────
   This file lives twice on purpose: harness/shot.js is committed and is the source of record,
   _shot/shot.js is the gitignored working copy, and only the second path is on the permission
   allowlist. Both resolve ROOT the same way, so either can be run — but a fix made to one and
   not the other is invisible, and "two copies of the same code, edits landing in the one nobody
   runs" is the single failure that has cost this project the most sessions.

   So: whichever copy you invoke, it checks the other and says if they differ. A warning, never
   a refusal — a verification run failing because of housekeeping would be worse than the drift. */
(() => {
  const mine = path.resolve(__filename);
  const other = path.join(ROOT, path.basename(path.dirname(mine)) === '_shot' ? 'harness' : '_shot', 'shot.js');
  try {
    if (!fs.existsSync(other)) return;
    /* Compare with line endings normalised: git checks harness/shot.js out with CRLF on Windows
       while the copy in _shot/ keeps whatever it was copied with, and a warning that fires on
       every single run is a warning nobody reads. */
    const norm = p => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
    if (norm(mine) === norm(other)) return;
    console.log('\n!! shot.js DRIFT: ' + mine + '\n   differs from      ' + other
      + '\n   The committed copy is harness/shot.js. Refresh with:  cp harness/shot.js _shot/shot.js'
      + '\n   (running the older copy is how a "fixed" harness quietly keeps the old bug)\n');
  } catch (e) { /* never let housekeeping stop a render */ }
})();

/* ── args ────────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : dflt;
};
/* ── --assets <dir>: offline mode. Parse every .glb/.gltf under public/slice3d/assets/<dir>
      and report which texture URIs they reference and whether that file is actually on disk.
      Missing kit textures render as flat white, which looks like "the art is bad" rather than
      "a file 404s", so this needs to be checkable without eyeballing a render. */
const ASSETS = arg('assets', null);
if (ASSETS) {
  const base = path.join(WEBROOT, 'slice3d/assets');
  const dirs = ASSETS === 'all' ? fs.readdirSync(base).filter(d => fs.statSync(path.join(base, d)).isDirectory()) : [ASSETS];
  for (const d of dirs) {
    const dir = path.join(base, d);
    const refs = new Map();          // uri -> [files that reference it]
    let embedded = 0, scanned = 0;
    const walk = (p) => {
      for (const f of fs.readdirSync(p)) {
        const fp = path.join(p, f);
        if (fs.statSync(fp).isDirectory()) { walk(fp); continue; }
        let json = null;
        if (f.endsWith('.gltf')) { json = JSON.parse(fs.readFileSync(fp, 'utf8')); }
        else if (f.endsWith('.glb')) {
          const buf = fs.readFileSync(fp);
          // glb: 12-byte header, then chunks of [len u32][type u32][data]. First chunk is JSON.
          const len = buf.readUInt32LE(12);
          json = JSON.parse(buf.slice(20, 20 + len).toString('utf8'));
        } else continue;
        scanned++;
        for (const img of json.images || []) {
          if (!img.uri) { embedded++; continue; }
          const key = img.uri;
          if (!refs.has(key)) refs.set(key, []);
          refs.get(key).push(path.relative(dir, fp));
        }
      }
    };
    walk(dir);
    console.log('\n=== ' + d + '  (' + scanned + ' models, ' + embedded + ' embedded images) ===');
    if (!refs.size && !embedded) console.log('  no images at all');
    for (const [uri, users] of [...refs].sort()) {
      const on = fs.existsSync(path.join(dir, uri));
      console.log('  ' + (on ? 'ok      ' : 'MISSING ') + uri + '   (' + users.length + ' models, e.g. ' + users[0] + ')');
    }
  }
  process.exit(0);
}

/* Git Bash (MSYS) rewrites any argument that LOOKS like a unix path into a Windows one, so
   `--url "/3d/index.html"` arrives as "C:/Program Files/Git/3d/index.html" and Chrome answers
   "Cannot navigate to invalid URL", which names neither the cause nor the fix. It only bites the
   flagless form: a `?` or `&` in the string suppresses the rewrite, which is why every URL with
   query flags has always worked and this was never noticed.

   Recovering it is unambiguous rather than clever - walk the mangled string's suffixes longest
   first and take the first one that is a real file under public/. Says what it did, because a
   harness silently loading a different page than you asked for is its own trap. */
const unmangle = (u) => {
  if (!/^[A-Za-z]:[\\/]/.test(u)) return u;
  const parts = u.replace(/\\/g, '/').split('/');
  for (let i = 1; i < parts.length; i++) {
    const cand = '/' + parts.slice(i).join('/');
    if (fs.existsSync(path.join(WEBROOT, cand))) {
      console.log('note: Git Bash rewrote --url to "' + u + '"; using "' + cand + '" instead.'
        + '  (add a ?query to the url, or MSYS_NO_PATHCONV=1, to avoid this)');
      return cand;
    }
  }
  console.log('!! --url "' + u + '" looks like Git Bash rewrote a unix path and nothing under '
    + 'public/ matches it. Add a ?query to the url, or set MSYS_NO_PATHCONV=1.');
  return u;
};
const URLPATH = unmangle(arg('url', '/3d/index.html?hero3d=1&world3d=1&nobloom'));
const OUT = path.resolve(ROOT, arg('out', '_shot/out/shot.png'));
const WAIT = parseInt(arg('wait', '9000'), 10);
const EVAL = arg('eval', null);
const PREWAIT = parseInt(arg('prewait', '3500'), 10);
const [W, H] = arg('size', '1280x720').split('x').map(Number);

/* ── --scene: get from the attract screen to somewhere worth photographing ──
   The game does not open in a zone. It opens on the title, then a story cutscene, then class
   select, then a class TRIAL, then the hub — five gates, each of which will happily hand you a
   screenshot of itself. Every session so far has re-derived this sequence by taking pictures of
   menus, so it lives here now.

   Chrome runs on a throwaway profile, so localStorage is empty on every run and the sequence is
   the same every time: the story veil is dismissed by clicking its own Skip button on a timer
   (it fades in over several lines and there is no single moment to click), startTrial picks a
   class, skipTrial grants it and drops you in the hub, then enterZone descends.

   The dismiss list is a WHITELIST of specific ids, not "click the first button in the overlay".
   These cards sit next to menus whose first button is Exit or Title Screen, and a generic
   clicker would eventually walk the run back out to the attract screen and photograph that. */
const SCENE = arg('scene', null);
const sceneJs = (dest) => `(function(){
  var ids=['storyskip','hubTutGo'];
  var t=setInterval(function(){
    for(var i=0;i<ids.length;i++){ var b=document.getElementById(ids[i]); if(b&&b.offsetParent) b.click(); }
  },300);
  __BF3.startTrial('warrior');
  setTimeout(function(){
    __BF3.skipTrial();
    setTimeout(function(){ clearInterval(t); ${dest === 'hub' ? '' : '__BF3.enterZone(' + (parseInt(dest, 10) || 0) + ');'} }, 5000);
  }, 2500);
})()`;
const PRE = arg('pre', SCENE == null ? null : sceneJs(SCENE));

/* Poll until this expression is truthy, THEN screenshot. Defaults with --scene to "world3d has
   finished building THIS destination", which is the thing that is silently slow.

   The default used to be just `__world3d().built`, and that was WRONG for `--scene <n>` in a way
   that produced the exact fake it exists to prevent. Read the sequence above: skipTrial() drops
   you in the HUB, and enterZone() only fires FIVE SECONDS later. world3d builds the hub the
   moment you land in it, so `built` is already truthy long before the zone is entered — the
   shutter fires on the Waystation and the run gets a complete, plausible picture of the wrong
   place. Measured 2026-08-02: `--scene 0` printed "ready ✓ after 0.0s", photographed the hub
   plaza, and reported counts {hub:true, pave:273} with mob live 0 and chests 0 while the run
   believed it was auditing the Outskirts. It is a RACE, which is why it had worked before — if
   the hub build happens to take longer than the 7.5s run-up, `built` flips after enterZone and
   the shot is correct by luck.

   So the destination is part of the test now, and each half is checked against something only
   that destination can produce:
     - the GAME is where it should be   — G.hub / G.stageIndex, set synchronously by enterZone
     - the BUILD is of that place       — counts.hub is set only by the hub build, so a zone
                                          waits for counts to stop being the hub's
   `world3d().on` gates the build half, so `--scene 0 --url "...?world3d=0"` still resolves
   instead of burning the full readymax and reporting READY NEVER CAME. */
const sceneReady = (dest) => {
  /* G.zone, NOT G.stageIndex. --scene <n> hands n to enterZone(), which takes a ZONE index and
     then loads that zone's first AREA, whose stage is a different number: zone 1 area 0 is
     stage 3. They only agree for zone 0, which is why --scene 0 is the example everywhere and
     why testing stageIndex looked right. Caught by this fix's own --scene 1 check, which sat
     out the full readymax waiting for a stageIndex that was never coming. */
  const at = dest === 'hub'
    ? '!!__BF3.G.hub'
    : '!__BF3.G.hub && __BF3.G.zone === ' + (parseInt(dest, 10) || 0);
  const wb = dest === 'hub' ? '!!w.counts.hub' : '!w.counts.hub';
  return '(function(){ try{'
       + ' if(!(window.__BF3 && __BF3.G && ' + at + ')) return false;'
       + ' var w = window.__world3d && __world3d(); if(!w) return true;'
       + ' if(!w.on) return true;'
       + ' return !!(w.built && w.counts && ' + wb + ');'
       + ' }catch(e){ return false; } })()';
};
const READY = arg('ready', SCENE == null ? null : sceneReady(SCENE));
const READYMAX = parseInt(arg('readymax', '120000'), 10);

/* ── --focus: point the shot AT something ──────────────────────────────────────
   Every session that photographs one specific object re-invents this, badly, in an --eval, and
   2026-08-01 spent eight renders on it before getting a usable frame. Two things make aiming by
   hand harder than it looks, and both are now handled here once:

   1. G.cam is a SMOOTHED follow-point that lerps 10% per frame toward the hero. Headless
      SwiftShader renders only a handful of frames per second, so after a teleport it is still
      hundreds of units behind - and the shoulder camera is built off G.cam, not off G.p. The
      symptom is not subtle: the subject lands behind the camera, or inside the near plane, and
      the frame looks like the object simply is not being drawn. This snaps G.cam, waits, then
      snaps it AGAIN just before the shutter, because the game keeps lerping in between.
   2. The shoulder camera does not sit at the hero, it sits 180*cos(pitch) BEHIND them, so
      "put the hero D away from the thing" is not the same as "frame it at D". --dist is the
      distance from the CAMERA to the subject, which is the number you actually care about.

   --focus takes either a JS expression evaluated in the page (`__BF3.G.waystone`, anything with
   .x/.z, .y optional) or a bare `x,y,z`. --side shifts the hero sideways so the subject sits off
   to one side of the frame instead of directly behind the HUD, which is where a tall glowing
   object lands every single time.

   WHAT THIS DOES NOT DO, measured rather than assumed, so the next run does not spend renders
   rediscovering it: it will not give you a tight close-up. The eye rides 118+180*sin(pitch) above
   the hero and looks down a fixed angle, so under about 200 units a ground-level subject falls
   out of the bottom of the frame - at --dist 95 the ray is 26 degrees down where it needs 56, and
   the picture comes back as bare ground. Two ways out were tried and both are worse: solving the
   pitch to centre it swings the camera to near top-down (it centres a chest as a grey sliver seen
   from above), and solving the hero's height so the subject lands on the view ray buries the
   camera inside the terrain the subject is standing on. So --dist 200-400 with --side to keep the
   subject clear of the HUD is the working range, and a genuine close-up still means spawning the
   thing near the camera by hand. */
const FOCUS = arg('focus', null);
const FOCUS_DIST = parseFloat(arg('dist', '210'));
const FOCUS_SIDE = parseFloat(arg('side', '0'));
const FOCUS_YAW = parseFloat(arg('yaw', String(Math.PI)));

const FOCUS_PITCH = parseFloat(arg('pitch', '0.16'));
const focusJs = (spec) => `(async function(){
  var G = __BF3.G; if(!G) return 'no G';
  var t = ${/^-?[\d.]+\s*,/.test(spec) ? '(function(){var a=' + JSON.stringify(spec)
    + '.split(",").map(Number); return {x:a[0], y:a.length>2?a[1]:0, z:a.length>2?a[2]:a[1]};})()'
    : '(' + spec + ')'};
  if(!t || t.x == null) return 'focus target has no .x';
  var yaw = ${FOCUS_YAW}, pit = ${FOCUS_PITCH}, D = ${FOCUS_DIST}, side = ${FOCUS_SIDE};
  var fx = Math.sin(yaw), fz = Math.cos(yaw);
  var pc = Math.max(-0.5, Math.min(0.9, pit));            // render() clamps pitch; match it exactly
  /* The camera sits hd behind the hero, so the hero stands (D - hd) in front of the subject and
     the EYE ends up exactly D from it. A subject nearer than the camera's own setback means
     standing the hero past it, which is why this is signed arithmetic and not a clamp. */
  var hd = 180 * Math.cos(pc);
  var back = D - hd;
  var px = -fz, pz = fx;                                  // hero's left/right, in world XZ
  G.p.x = t.x - fx * back + px * side;
  G.p.z = t.z - fz * back + pz * side;
  var heroY = (t.y != null) ? t.y : (G.p.y || 0);         // stand on the subject's own level
  G.p.y = heroY;
  G.camYaw = yaw; G.camPitch = pit;
  /* Re-asserting the HEIGHT, not just the camera, and this is not belt-and-braces. There is
     usually no floor under the spot the hero is teleported to - a subject on a raised mesa (the
     Outskirts waystone sits at y=165) or a lifted hero both hang in mid-air - so gravity drops
     them. Measured: 165 to 55 in under two seconds, and since the camera rides the hero's y the
     whole frame sinks below the subject. Velocity is zeroed too or the fall resumes at speed. */
  var snap = function(){
    G.p.y = heroY; G.p.vy = 0; G.p.onGround = true;
    G.cam.x = G.p.x; G.cam.z = G.p.z; G.cam.y = G.p.y || 0;
    G.camYaw = yaw; G.camPitch = pit;
  };
  snap();
  await new Promise(function(r){ setTimeout(r, 1400); });
  snap();                                      // ...it has been falling and lerping the whole time
  await new Promise(function(r){ setTimeout(r, 250); });
  snap();
  return { at:{x:+t.x.toFixed(0), y:+(t.y||0).toFixed(0), z:+t.z.toFixed(0)},
           hero:{x:+G.p.x.toFixed(0), y:+(G.p.y||0).toFixed(0), z:+G.p.z.toFixed(0)},
           eye:G.eye && {x:+G.eye.x.toFixed(0), y:+G.eye.y.toFixed(0), z:+G.eye.z.toFixed(0)} };
})()`;

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find(p => fs.existsSync(p));
if (!CHROME) { console.error('No Chrome/Edge binary found.'); process.exit(1); }

/* ── static server (public/) ─────────────────────────────────────────────── */
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.gltf': 'model/gltf+json', '.glb': 'model/gltf-binary',
  '.bin': 'application/octet-stream', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.css': 'text/css', '.wasm': 'application/wasm', '.ktx2': 'image/ktx2',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
};
const missed = [];
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(WEBROOT, path.normalize(rel).replace(/^(\.\.[\/\\])+/, ''));
  if (!file.startsWith(WEBROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    missed.push(rel);
    res.writeHead(404); res.end('nope'); return;
  }
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Access-Control-Allow-Origin': '*',
  });
  fs.createReadStream(file).pipe(res);
});

/* ── minimal CDP client over the built-in WebSocket ──────────────────────── */
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
      /* Generous: this drives Chrome on SwiftShader, so a captureScreenshot of a busy WebGL frame
         can genuinely take over a minute on a loaded machine. A timeout here is a false alarm. */
      setTimeout(() => { if (this.pending.delete(id)) no(new Error('CDP timeout: ' + method)); }, 180000);
    });
  }
  on(fn) { this.handlers.push(fn); }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const httpPort = server.address().port;
  const url = 'http://127.0.0.1:' + httpPort + URLPATH;

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'bf-shot-'));
  const dbgPort = 9200 + Math.floor(httpPort % 300);
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--remote-debugging-port=' + dbgPort,
    '--user-data-dir=' + profile,
    '--window-size=' + W + ',' + H,
    '--hide-scrollbars', '--mute-audio',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--allow-file-access-from-files', '--disable-dev-shm-usage',
    'about:blank',
  ], { stdio: 'ignore' });

  // Wait for the debugging endpoint.
  let wsUrl = null;
  for (let i = 0; i < 100 && !wsUrl; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + dbgPort + '/json/version');
      wsUrl = (await r.json()).webSocketDebuggerUrl;
    } catch (e) { await sleep(200); }
  }
  if (!wsUrl) { chrome.kill(); server.close(); console.error('Chrome never opened its debug port.'); process.exit(1); }

  const cdp = await CDP.attach(wsUrl);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });

  const logs = [];
  cdp.on(msg => {
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

  console.log('→ ' + url);
  await cdp.send('Page.navigate', { url }, sessionId);
  await sleep(WAIT);

  const evaluate = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', {
      expression: expr, returnByValue: true, awaitPromise: true, allowUnsafeEvalBlockedByCSP: true,
    }, sessionId);
    if (r.exceptionDetails) return { error: (r.exceptionDetails.exception || {}).description || r.exceptionDetails.text };
    return { value: r.result.value };
  };

  if (PRE) {
    const r = await evaluate(PRE);
    console.log('PRE  → ' + JSON.stringify(r));
    await sleep(PREWAIT);
  }
  /* Hold the shutter until the page says it is ready. A fixed --prewait cannot do this job:
     too short and you photograph the voxel fallback, which looks like a finished picture and
     reads as a regression. Loud either way — a silent timeout here would be the same trap. */
  if (READY) {
    const t0 = Date.now();
    let ok = false, last = null;
    while (Date.now() - t0 < READYMAX) {
      const r = await evaluate(READY);
      last = r;
      if (r.value) { ok = true; break; }
      await sleep(500);
    }
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    if (ok) console.log('ready ✓ after ' + secs + 's  (' + READY + ')');
    else console.log('READY NEVER CAME after ' + secs + 's — the shot below is NOT the state you '
      + 'asked for, do not read it as a regression. last=' + JSON.stringify(last) + '  expr=' + READY);
  }
  /* After READY, not before: the target usually does not exist until the level is built, and the
     camera has nothing to lerp toward until the hero is in the world. Before EVAL, so a probe can
     report on what is actually in shot. */
  if (FOCUS) {
    const r = await evaluate(focusJs(FOCUS));
    console.log('FOCUS → ' + JSON.stringify(r.value !== undefined ? r.value : r));
    if (r.error || typeof r.value === 'string') {
      console.log('  ^ the camera was NOT moved — the frame below is wherever the game left it.');
    }
  }
  if (EVAL) {
    const r = await evaluate(EVAL);
    console.log('EVAL → ' + JSON.stringify(r, null, 2));
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
  console.log('shot → ' + OUT + '  (' + fs.statSync(OUT).size + ' bytes)');

  /* Deduped: a missing kit texture throws once per MODEL that references it, so one absent file
     produces 136 identical lines and buries everything else. Count them instead. */
  const bad = logs.filter(l => l.t === 'error' || l.t === 'exception');
  if (bad.length) {
    const byText = new Map();
    for (const l of bad) { const k = l.t + ': ' + l.text.split('\n')[0]; byText.set(k, (byText.get(k) || 0) + 1); }
    console.log('\n-- page errors (' + bad.length + ' total, ' + byText.size + ' distinct) --');
    [...byText].sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([k, n]) => console.log('  x' + n + '  ' + k));
  } else console.log('no page errors');
  const notes = logs.filter(l => l.t !== 'error' && l.t !== 'exception');
  if (notes.length) { console.log('-- console (' + notes.length + ') --'); notes.slice(0, 20).forEach(l => console.log('  ' + l.t + ': ' + l.text.slice(0, 200))); }
  if (missed.length) { console.log('-- 404s (' + missed.length + ') --'); [...new Set(missed)].slice(0, 25).forEach(m => console.log('  ' + m)); }

  try { await cdp.send('Browser.close'); } catch (e) {}
  chrome.kill();
  server.close();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
