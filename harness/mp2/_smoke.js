/* harness/mp2/_smoke.js — ONE client, no MP. Proves the probe expressions in party.js actually
   evaluate and that the zones under test spawn a measurable population, before spending two boots
   and a PeerJS handshake finding out they do not. Not a test of anything the game claims. */
import { startServer, launchClient, RUNUP_HUB, hubReady, WHERE_JS } from './two.js';

const ZONES = [0, 3];
const SEED = 20260813;

const SNAP = `(function(){ var G=window.__BF3&&__BF3.G; if(!G||!G.enemies) return null;
  var out=[], skipped=0;
  for(var i=0;i<G.enemies.length;i++){ var e=G.enemies[i];
    if(e.practice||e.dummy||e.crackWall||e.type==='dummy'||e.type==='crackwall'){ skipped++; continue; }
    out.push([e.mid, e.type, Math.round(e.maxHp), e.elite?1:0, e.boss?1:0]); }
  return { zone:G.zone, area:G.area, tier:G.zoneTier, stage:G.stageIndex, name:G.areaName,
           ngHp:G.ngHp, runSeed:G.runSeed, areaSeed:G.areaSeed, skipped:skipped, n:out.length, en:out }; })()`;

const buildJs = (zone, seed) => `(function(){
  var M = __BF3.MP;
  var pre = { mul: __BF3.partyHpMul(), size: __BF3.partySize(), mpZone: M.zone };
  var _r = Math.random, s = (${seed}) >>> 0, err = null;
  Math.random = function(){ s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  try { __BF3.enterZone(${zone}); } catch(e){ err = String((e && e.message) || e); } finally { Math.random = _r; }
  return { pre: pre, err: err, snap: ${SNAP} };
})()`;

const server = await startServer();
const c = await launchClient({ tag: 'S' });
console.log('server ' + server.origin + '  dbg ' + c.dbgPort);
try {
  await c.goto(server.url('/3d/index.html?hero3d=1&world3d=1&nobloom'));
  const b = await c.waitFor('!!(window.__BF3 && __BF3.startTrial && __BF3.MP)', { timeoutMs: 90000 });
  console.log('boot ' + (b.ok ? (b.ms / 1000).toFixed(1) + 's' : 'TIMEOUT ' + JSON.stringify(b.last)));
  await c.eval(RUNUP_HUB);
  const r = await c.waitFor(hubReady(true), { timeoutMs: 180000, pollMs: 500 });
  console.log('hub  ' + (r.ok ? (r.ms / 1000).toFixed(1) + 's' : 'TIMEOUT ' + JSON.stringify(r.last)) + '  at ' + await c.evalOk(WHERE_JS));
  if (!r.ok) throw new Error('never reached the hub');

  for (const zi of ZONES) {
    for (const pass of [1, 2]) {          // twice with the SAME seed: is the population reproducible?
      const o = await c.evalOk(buildJs(zi, SEED + zi));
      const s = o.snap;
      console.log('zone ' + zi + ' pass ' + pass + ': err=' + o.err + '  mul=' + o.pre.mul
        + '  n=' + (s && s.n) + ' skipped=' + (s && s.skipped) + '  "' + (s && s.name) + '" tier ' + (s && s.tier)
        + ' stage ' + (s && s.stage) + ' runSeed ' + (s && s.runSeed)
        + '\n   ' + JSON.stringify((s && s.en || []).slice(0, 8).map(e => e[1] + (e[3] ? '*' : '') + ':' + e[2])));
    }
  }
  console.log('\nerrors: ' + JSON.stringify(c.errors().filter(e => !/texture|GLTFLoader/i.test(e.text)).slice(0, 5)));
} finally {
  await c.close(); await server.close(); process.exit(0);
}
