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

   Exit 0 = screenshot written. Console errors from the page are always printed.
   ───────────────────────────────────────────────────────────────────────────── */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const WEBROOT = path.join(ROOT, 'public');

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

const URLPATH = arg('url', '/3d/index.html?hero3d=1&world3d=1&nobloom');
const OUT = path.resolve(ROOT, arg('out', '_shot/out/shot.png'));
const WAIT = parseInt(arg('wait', '9000'), 10);
const EVAL = arg('eval', null);
const PRE = arg('pre', null);
const PREWAIT = parseInt(arg('prewait', '3500'), 10);
const [W, H] = arg('size', '1280x720').split('x').map(Number);

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
