/* ─────────────────────────────────────────────────────────────────────────────
   harness/mp2/coop-identity.js — DOES THE GUEST SEE THE HOST, OR A SECOND COPY OF ITSELF?

   Run:  node harness/mp2/coop-identity.js               # A hosts as MAGE, B joins as WARRIOR
         node harness/mp2/coop-identity.js --swap        # A hosts as WARRIOR, B joins as MAGE
         node harness/mp2/coop-identity.js --bad-rigs    # KNOWN-BAD: ?heroonerig=1 (must FAIL 6/7/8)
         node harness/mp2/coop-identity.js --no-cid      # KNOWN-BAD: host sends no cid (must FAIL 7/8)
         node harness/mp2/coop-identity.js --same        # CONTROL: both WARRIOR — must report VOID
         node harness/mp2/coop-identity.js --shots       # also write a PNG of each client

   WHY THE TWO CLASSES ARE THE WHOLE TEST. Every existing co-op check in this repo is symmetric:
   both clients run `startTrial('warrior')` (two.js RUNUP_HUB), so host and guest are the same class
   carrying the same starter weapon. Against that setup the bug this file hunts — an ally rendered on
   YOUR body with YOUR weapon — is INVISIBLE. Two warriors holding two swords look identical whether
   the identity crossed the wire or not. So the run-up here is parameterised and the two clients are
   deliberately given classes that map to DIFFERENT glTF bodies:
       warrior → 'Warrior'      mage → 'Wizard'        (hero3d.js:278 CLASS_TO_MODEL)
   and the run REFUSES TO REPORT A PASS if the two classes ever come out the same — see VOID below.
   `--same` exists to watch that refusal happen.

   WHY IT MEASURES TWO LAYERS SEPARATELY. "The guest sees the host" is two different claims joined by
   an 'and', and they fail independently:

     DATA   — MP.peers['h'].cid / .cls / .weapon on the guest. cid is the CLASS ID and it is the only
              field the 3D layer can use; `cls` is a display string and `weapon` is MP.wsnap's
              8-field snapshot (index.html:12235). Filled by mkPeer (:12253) from the host's `state`
              broadcast, refreshed by applyPos (:12257).
     RENDER — the rig the renderer actually built for that peer. index.html:12464 hands drawHero3 a
              `pp` object carrying peerId+cid; hero3d.js:1747 keys a rig off peerId; peerModelFor
              (:1601) picks the body from CLASS_TO_MODEL[cid] AND FALLS BACK TO `HERO3D.model` — the
              LOCAL player's body — whenever cid is missing or that model is not loaded. That fallback
              is the bug's exact shape, and it is silent.

   The data layer can be perfect while the render layer is wrong. `--no-cid` and `--bad-rigs` below
   produce precisely that state, on purpose, so the render assertions are ones somebody has watched
   fail rather than ones that have only ever been watched pass.

   WHY IT DOES NOT TRUST `rec.model`. __hero3dRigs() (hero3d.js:1799) reports a rig's model as a
   STRING that the renderer itself chose. Asserting on it proves the code agrees with itself. So each
   rig is also FINGERPRINTED off the live scene graph: the peer rigs are named '__heroPeer:<id>'
   (hero3d.js:1634), so they can be found in __hero3dScene() and walked. Body meshes and weapon meshes
   are separated by the userData._weap tag equipWeapon sets (:1047/:1052), and each side is reduced to
   a mesh count plus a sorted list of vertex counts. Two different character packs give two different
   signatures; a sword and a staff give two different signatures. That is a measurement of the
   geometry standing in the scene, not of a variable naming it.

   WHAT IT CANNOT SEE, STATED PLAINLY. The weapon's FILE NAME is not recorded per rig — equipWeapon
   returns {name} and armPeer (hero3d.js:1661) drops it — so this file cannot say "the ally holds
   Staff_Wizard.glb". It can say the ally's weapon geometry differs from the local hero's and matches
   the peer's reported art. If you want the name, that is a source change, and this file will not
   make one.

   INHERITS EVERY CAVEAT OF connect.js: real internet is required (PeerJS via unpkg + 0.peerjs.com),
   /turn 404s under the local static server so TURN IS NEVER EXERCISED, and MP.ping off a headless
   run is not a latency figure.
   ───────────────────────────────────────────────────────────────────────────── */
import path from 'node:path';
import { twoClients, hubReady, WHERE_JS, RUNUP_HUB } from './two.js';
import { hostAndJoin, PREWARM_ICE } from './connect.js';

const argv = process.argv.slice(2);
const has = (f) => argv.includes('--' + f);

/* ── the run-up, with the class as a parameter ─────────────────────────────
   two.js RUNUP_HUB with 'warrior' replaced by an argument, and NOTHING ELSE changed. Reproduced
   rather than imported because RUNUP_HUB is a const string with the class baked in and this file may
   not edit two.js. A third copy of a five-gate run-up is exactly the drift two.js's own header warns
   about, so the copy is CHECKED: runupFor('warrior') must be byte-identical to RUNUP_HUB, and the run
   says so out loud when it stops being. Only ever called with a fixed id from CLASSES below. */
const runupFor = (cid) => `(function(){
  var ids=['storyskip','hubTutGo'];
  var t=setInterval(function(){
    for(var i=0;i<ids.length;i++){ var b=document.getElementById(ids[i]); if(b&&b.offsetParent) b.click(); }
  },300);
  __BF3.startTrial('${cid}');
  setTimeout(function(){
    __BF3.skipTrial();
    setTimeout(function(){ clearInterval(t); }, 5000);
  }, 2500);
})()`;

/* The only three classes a fresh save can actually take. TRIALS (index.html:2286) marks every other
   class `earned:true`, and skipTrial() refuses those outright ("This one you have to earn.",
   :4506) — so a run-up asking for `reaper` would leave the client sitting in a trial it cannot skip
   and the readiness gate would blame the 3D world. warrior→Warrior and mage→Wizard are also the
   furthest apart in CLASS_TO_MODEL, which is what makes a mixed-up body obvious. */
const CLASSES = { warrior: 'Warrior', mage: 'Wizard', ranger: 'Ranger' };

/* ── what a client is, in its own words ────────────────────────────────────
   selfState() IS the packet the game sends (index.html:12240). Reading the fields off it rather than
   rebuilding them from meta/G.p means this file cannot disagree with the wire about what was sent —
   which is the failure mode where a test passes because it made the same mistake twice. */
const SELF_JS = `(function(){
  var B=window.__BF3, M=B&&B.MP, G=B&&B.G, p=G&&G.p;
  if(!M) return {noMP:true};
  var s=null; try{ s=M.selfState(); }catch(e){ return {err:'selfState threw: '+e.message}; }
  var mdl=(typeof window.__hero3dClassModel==='function')?window.__hero3dClassModel(s.cid):null;
  return {
    id:s.id, name:s.name, cls:s.cls, cid:s.cid, lvl:s.lvl, skin:s.skin, zone:s.zone,
    metaClassId:(B.meta&&B.meta.classId)||'',
    w:s.w?{art:s.w.art, cls:s.w.cls, sch:s.w.sch, rarity:s.w.rarity, color:s.w.color, fist:!!s.w.fist}:null,
    wname:(p&&p.weapon)?p.weapon.name:null,
    classModel:mdl,
    modelLoaded:(typeof window.__hero3dPreviewReady==='function')?!!window.__hero3dPreviewReady(mdl):null,
    heroModel:(window.HERO3D&&window.HERO3D.model)||null,
    on:!!(window.HERO3D&&window.HERO3D.on), ready:!!(window.HERO3D&&window.HERO3D.ready),
    err:(window.HERO3D&&window.HERO3D.err)||null };
})()`;

/* What THIS client believes about the OTHER one. Straight off MP.peers, which is the object every
   render and every routed message reads. */
const PEER_JS = (id) => `(function(){
  var M=window.__BF3&&__BF3.MP; if(!M) return {noMP:true};
  var q=M.peers[${JSON.stringify(id)}];
  if(!q) return {missing:true, have:Object.keys(M.peers||{})};
  return {
    id:q.id, name:q.name, cls:q.cls, cid:q.cid, lvl:q.lvl, skin:q.skin, zone:q.zone,
    hp:q.hp, hpm:q.hpm,
    w:q.weapon?{art:q.weapon.art, cls:q.weapon.cls, sch:q.weapon.sch, rarity:q.weapon.rarity, color:q.weapon.color, fist:!!q.weapon.fist}:null,
    wantModel:(typeof window.__hero3dClassModel==='function')?window.__hero3dClassModel(q.cid):null,
    at:{x:Math.round(q.tx), z:Math.round(q.tz)} };
})()`;

/* ── the scene graph, fingerprinted ────────────────────────────────────────
   __hero3dRigs() for what the renderer SAYS, plus a walk of the actual Three scene for what is
   actually standing in it. Peer rigs are findable by name (hero3d.js:1634); the local hero is
   HERO3D._wrap. `_weap` is inherited down the subtree (equipWeapon tags a wrapper Group and its
   meshes), so weapon-vs-body is decided by walking up to a tagged ancestor, not by the mesh alone. */
const RIGS_JS = `(function(){
  if(typeof window.__hero3dRigs!=='function') return {noHook:true};
  var R;
  try{ R=window.__hero3dRigs(); }catch(e){ return {err:'__hero3dRigs threw: '+e.message}; }
  function isWeap(o){ var q=o; while(q){ if(q.userData && q.userData._weap) return true; q=q.parent; } return false; }
  function fp(root){
    if(!root) return null;
    var bm=0,bv=0,wm=0,wv=0,bl=[],wl=[];
    root.traverse(function(o){
      if(!o.isMesh) return;
      var g=o.geometry, n=(g&&g.attributes&&g.attributes.position)?g.attributes.position.count:0;
      if(isWeap(o)){ wm++; wv+=n; wl.push(n); } else { bm++; bv+=n; bl.push(n); }
    });
    bl.sort(function(a,b){return a-b;}); wl.sort(function(a,b){return a-b;});
    return { bodyMeshes:bm, bodyVerts:bv, bodySig:bl.join('/'),
             weapMeshes:wm, weapVerts:wv, weapSig:wl.join('/') };
  }
  var out={ frame:R.frame, cap:R.cap, local:R.local, peers:R.peers, n:(R.peers||[]).length, fps:{}, nodes:[] };
  try{ out.fps.local=fp(window.HERO3D && window.HERO3D._wrap); }catch(e){ out.fps.local={err:String(e)}; }
  try{
    var sc=(typeof window.__hero3dScene==='function')?window.__hero3dScene():null;
    if(sc) sc.traverse(function(o){
      if(o.name && o.name.indexOf('__heroPeer:')===0){
        var k=o.name.slice(11); out.nodes.push(k);
        try{ out.fps['peer:'+k]=fp(o); }catch(e){ out.fps['peer:'+k]={err:String(e)}; }
      }
    });
  }catch(e){ out.sceneErr=String(e); }
  return out;
})()`;

/* Rigs are built on the frame the ally is first DRAWN, and armPeer's equip is async
   (hero3d.js:1661 → queueEquip → await). So the settled state is "a rig exists and nothing is still
   arming", and how long that took is worth printing rather than sleeping through. */
const RIGS_SETTLED = `(function(){ try{
  var r=window.__hero3dRigs(); if(!r||!r.peers||!r.peers.length) return false;
  for(var i=0;i<r.peers.length;i++) if(r.peers[i].arming) return false;
  return true; }catch(e){ return false; } })()`;

const j = (v) => JSON.stringify(v);

/* ── the checks ────────────────────────────────────────────────────────────
   `viewer` is the client doing the looking, `subject` the one being looked at. Run twice with the
   roles swapped, because host→guest rides `state` (index.html:12441) and guest→host rides `pos`
   (:12443) — two code paths, so a pass on one says nothing about the other. */
function checks(viewerTag, viewer, subject, peer, rigs, subjTag) {
  const want = subject.classModel;                    // the body the subject's class maps to
  const mine = viewer.classModel;                     // the body the VIEWER wears
  const rig = (rigs.peers || []).find(r => r.id === subject.id) || null;
  const fp = rigs.fps ? rigs.fps['peer:' + subject.id] : null;
  const lfp = rigs.fps ? rigs.fps.local : null;
  const out = [];
  const add = (n, ok, got) => out.push({ n: viewerTag + ' ' + n, ok, got });

  // ---- DATA: did the identity cross the wire at all? ----
  add('holds a peer object for ' + subjTag, !!peer && !peer.missing, peer && peer.missing ? 'missing, have=' + j(peer.have) : 'yes');
  if (!peer || peer.missing) return out;
  add('peer.cid === ' + subjTag + ".cid ('" + subject.cid + "')", peer.cid === subject.cid, j(peer.cid));
  add('peer.cid !== own cid (not a self-copy)', peer.cid !== viewer.cid, j(peer.cid) + ' vs own ' + j(viewer.cid));
  add('peer.cls === ' + subjTag + '.cls', peer.cls === subject.cls, j(peer.cls));
  add('peer.weapon.art === ' + subjTag + '.weapon.art',
    !!(peer.w && subject.w && peer.w.art === subject.w.art), j(peer.w && peer.w.art) + ' vs ' + j(subject.w && subject.w.art));
  add('peer.weapon.rarity === ' + subjTag + '.weapon.rarity',
    !!(peer.w && subject.w && peer.w.rarity === subject.w.rarity), j(peer.w && peer.w.rarity));

  // ---- RENDER: did the renderer build that identity a body of its own? ----
  add('renderer built exactly 1 peer rig', rigs.n === 1, 'n=' + rigs.n + ' ids=' + j((rigs.peers || []).map(r => r.id)));
  add('the rig is keyed to ' + subjTag + " ('" + subject.id + "')", !!rig, rig ? 'yes' : 'no rig for that id');
  if (!rig) return out;
  add("rig.model === " + subjTag + "'s class model ('" + want + "')", rig.model === want, j(rig.model));
  add('rig.model !== own body (not a copy of me)', rig.model !== mine, j(rig.model) + ' vs own ' + j(mine));
  add('local rig is still MY body', rigs.local && rigs.local.model === mine, j(rigs.local && rigs.local.model));
  add('rig finished arming', rig.arming === false, 'arming=' + j(rig.arming));
  add("rig.art === " + subjTag + "'s weapon art", !!(subject.w && rig.art === subject.w.art), j(rig.art) + ' vs ' + j(subject.w && subject.w.art));
  add('rig carries a weapon in the scene', rig.armed === true, 'armed=' + j(rig.armed));

  // ---- GEOMETRY: is that what is actually standing there? ----
  add('a scene node named __heroPeer:' + subject.id + ' exists', !!fp && !fp.err, fp ? j(fp) : 'no node (nodes=' + j(rigs.nodes) + ')');
  if (fp && !fp.err && lfp && !lfp.err) {
    add('ally BODY geometry differs from my own body',
      fp.bodySig !== lfp.bodySig, 'ally ' + fp.bodyMeshes + 'm/' + fp.bodyVerts + 'v  vs  local ' + lfp.bodyMeshes + 'm/' + lfp.bodyVerts + 'v');
    add('ally is holding SOME weapon geometry', fp.weapMeshes > 0, fp.weapMeshes + ' meshes / ' + fp.weapVerts + ' verts');
    add('ally WEAPON geometry differs from my own weapon',
      fp.weapSig !== lfp.weapSig && fp.weapMeshes > 0 && lfp.weapMeshes > 0,
      'ally ' + fp.weapMeshes + 'm/' + fp.weapVerts + 'v  vs  local ' + lfp.weapMeshes + 'm/' + lfp.weapVerts + 'v');
  }
  return out;
}

async function main() {
  const t0 = Date.now();
  const badRigs = has('bad-rigs'), noCid = has('no-cid'), same = has('same'), swap = has('swap');
  const clsA = same ? 'warrior' : (swap ? 'warrior' : 'mage');
  const clsB = same ? 'warrior' : (swap ? 'mage' : 'warrior');

  let gamePath = '/3d/index.html?hero3d=1&world3d=1&nobloom';
  if (badRigs) gamePath += '&heroonerig=1';

  console.log('=== mp2/coop-identity — does the guest see the HOST, or itself again? ===');
  console.log('classes→ A(host) ' + clsA + ' → ' + CLASSES[clsA] + '     B(guest) ' + clsB + ' → ' + CLASSES[clsB]);
  console.log('path   → ' + gamePath);
  if (runupFor('warrior') !== RUNUP_HUB)
    console.log('!! the parameterised run-up has DRIFTED from two.js RUNUP_HUB. This file is running its own\n'
      + '   copy of the five-gate run-up, so a readiness failure below may be the copy, not the game.');
  if (badRigs) console.log('!! --bad-rigs: ?heroonerig=1 sends allies back through the ONE SHARED RIG (hero3d.js:1590).\n'
    + '   This is the KNOWN-BAD. The DATA checks are expected to PASS and every RENDER check to FAIL.\n'
    + '   If they all pass, the render assertions are not measuring what they claim.');
  if (noCid) console.log('!! --no-cid: the host\'s selfState will be patched to drop `cid`, which is what an older\n'
    + '   build sends (index.html:12242). KNOWN-BAD: peerModelFor falls back to the VIEWER\'s body,\n'
    + '   so B is expected to render the host as a second warrior. Only B\'s render checks should fail.');
  if (same) console.log('!! --same: both clients are warriors, so a correct render and the bug are indistinguishable.\n'
    + '   This run is expected to end VOID, not PASS.');

  let pair = null, exit = 1;
  try {
    /* runup:false, because twoClients runs ONE run-up on both clients and the whole point here is
       that they differ. The readiness gate it would have run is reproduced below from its own
       exports, so the two clients are held to exactly the same bar. */
    pair = await twoClients({ path: gamePath, preBoot: PREWARM_ICE, runup: false });

    const [rA, rB] = await Promise.all([pair.rawA(runupFor(clsA)), pair.rawB(runupFor(clsB))]);
    if (rA.error || rB.error) throw new Error('run-up threw: A=' + j(rA) + ' B=' + j(rB));
    pair.log('runup  → A ' + clsA + '   B ' + clsB);

    const ready = hubReady(/world3d=1/.test(gamePath));
    const [wA, wB] = await Promise.all([
      pair.waitA(ready, { timeoutMs: 180000, pollMs: 500 }),
      pair.waitB(ready, { timeoutMs: 180000, pollMs: 500 }),
    ]);
    const [whA, whB] = await Promise.all([pair.evalA(WHERE_JS), pair.evalB(WHERE_JS)]);
    pair.log('ready  → A ' + (wA.ok ? '✓ ' + (wA.ms / 1000).toFixed(1) + 's' : '!! TIMEOUT ' + j(wA.last))
      + '   B ' + (wB.ok ? '✓ ' + (wB.ms / 1000).toFixed(1) + 's' : '!! TIMEOUT ' + j(wB.last)));
    pair.log('at     → A ' + whA + '\n         B ' + whB);
    if (!wA.ok || !wB.ok) throw new Error('readiness gate failed — nothing below would be the state under test');

    if (noCid) {
      const patched = await pair.evalA(`(function(){ var M=__BF3.MP, o=M.selfState.bind(M);
        M.selfState=function(){ var s=o(); delete s.cid; return s; };
        return M.selfState().cid===undefined; })()`);
      pair.log('patch  → host selfState now omits cid: ' + patched);
    }

    /* GROUND TRUTH FIRST, and before anyone connects. What each client IS, taken from the packet it
       would send. Every later assertion is against these, not against the class ids typed above —
       if skipTrial handed a client something other than what was asked for, that shows up here as a
       VOID rather than as a mystery failure downstream. */
    const [selfA, selfB] = await Promise.all([pair.evalA(SELF_JS), pair.evalB(SELF_JS)]);
    console.log('\n-- what each client actually is --');
    console.log('  A(host)  ' + j(selfA));
    console.log('  B(guest) ' + j(selfB));

    const void_ = [];
    if (selfA.cid !== clsA) void_.push('A was asked for ' + clsA + ' and came up ' + j(selfA.cid));
    if (selfB.cid !== clsB) void_.push('B was asked for ' + clsB + ' and came up ' + j(selfB.cid));
    if (!same && selfA.classModel === selfB.classModel)
      void_.push('both clients map to the SAME body (' + selfA.classModel + '), so "the ally wears my body" '
        + 'and "the ally wears his own body" are the same observation and nothing here can tell them apart');
    if (same) void_.push('--same: both clients are ' + selfA.cid + ' on the ' + selfA.classModel
      + ' body. A correct render and the bug produce identical measurements. This is the control.');
    if (!selfA.modelLoaded || !selfB.modelLoaded)
      void_.push('a required character model is not loaded (A ' + selfA.classModel + '=' + selfA.modelLoaded
        + ', B ' + selfB.classModel + '=' + selfB.modelLoaded + '), and peerModelFor falls back to the local '
        + 'body when the wanted one is absent — so a wrong body here would be an asset failure, not a sync failure');
    if (!selfA.on || !selfA.ready || !selfB.on || !selfB.ready)
      void_.push('the 3D hero layer is not live on both clients (A on=' + selfA.on + ' ready=' + selfA.ready
        + ' err=' + j(selfA.err) + ', B on=' + selfB.on + ' ready=' + selfB.ready + ' err=' + j(selfB.err)
        + '), so there are no rigs to count and the voxel path drew the allies');

    // ── connect. Every gate in connect.js, unchanged. ──────────────────────
    console.log('');
    const conn = await hostAndJoin(pair, { log: pair.log });
    const guestId = conn.guestId;

    /* The rig is built on the frame the ally is first drawn and armed asynchronously after that.
       Polled, and the time is printed, because "we slept 3s and it was fine" is not a measurement. */
    const [sA, sB] = await Promise.all([
      pair.waitA(RIGS_SETTLED, { timeoutMs: 25000, pollMs: 300 }),
      pair.waitB(RIGS_SETTLED, { timeoutMs: 25000, pollMs: 300 }),
    ]);
    pair.log('rigs   → A ' + (sA.ok ? 'settled in ' + (sA.ms / 1000).toFixed(1) + 's' : 'NEVER settled in ' + (sA.ms / 1000).toFixed(1) + 's')
      + '   B ' + (sB.ok ? 'settled in ' + (sB.ms / 1000).toFixed(1) + 's' : 'NEVER settled in ' + (sB.ms / 1000).toFixed(1) + 's'));

    const [peerOnB, peerOnA] = await Promise.all([pair.evalB(PEER_JS('h')), pair.evalA(PEER_JS(guestId))]);
    const [rigsA, rigsB] = await Promise.all([pair.evalA(RIGS_JS), pair.evalB(RIGS_JS)]);

    console.log('\n-- what each client sees of the other --');
    console.log('  B sees host  ' + j(peerOnB));
    console.log('  A sees guest ' + j(peerOnA));
    console.log('\n-- rigs the renderer actually built --');
    console.log('  A ' + j(rigsA));
    console.log('  B ' + j(rigsB));

    const all = [
      ...checks('B(guest):', selfB, selfA, peerOnB, rigsB, 'host'),
      ...checks('A(host): ', selfA, selfB, peerOnA, rigsA, 'guest'),
    ];
    console.log('\n-- proof --');
    let fails = 0;
    for (const c of all) { if (!c.ok) fails++; console.log('  ' + (c.ok ? 'ok   ' : 'FAIL ') + c.n + '   [' + c.got + ']'); }

    console.log('\n-- verdict --');
    if (void_.length) {
      console.log('  VOID — this run cannot answer the question:');
      void_.forEach((v, i) => console.log('    ' + (i + 1) + '. ' + v));
      console.log('  (' + fails + ' of ' + all.length + ' checks failed, but do not read them as a result.)');
      exit = 3;
    } else if (fails === 0) {
      console.log('  PASS — ' + all.length + '/' + all.length + '. Each client renders the other on the other\'s own class body,');
      console.log('         holding a weapon whose geometry differs from its own.');
      exit = 0;
    } else {
      console.log('  FAIL — ' + fails + ' of ' + all.length + ' checks failed. See the lines above.');
      exit = 1;
    }
    if ((badRigs || noCid) && fails === 0)
      console.log('\n!! A KNOWN-BAD RUN PASSED. That is worse news than a failure: the render assertions above\n'
        + '   cannot distinguish an ally with its own body from an ally wearing yours.');
  } catch (e) {
    console.log('\n-- FAILED (could not set the scenario up) --');
    console.log('  step: ' + (e.step || '(driver)'));
    console.log('  why : ' + (e.why || e.message));
    if (e.detail && Object.keys(e.detail).length) console.log('  detail: ' + JSON.stringify(e.detail, null, 2));
    if (e.detail && e.detail.network) console.log('\n  ^ NETWORK, NOT THE GAME. Re-run when unpkg.com and 0.peerjs.com are reachable.');
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
      if (miss.length) console.log('\n-- 404s (' + miss.length + ' distinct) -- ' + j(miss.slice(0, 10)));
      if (has('shots')) {
        const out = path.join(import.meta.dirname, 'out');
        for (const c of [pair.A, pair.B]) console.log('shot → ' + await c.shot(path.join(out, 'identity-' + c.tag + '.png')));
      }
      await pair.close();
    }
    console.log('\ntotal ' + ((Date.now() - t0) / 1000).toFixed(1) + 's   exit ' + exit
      + '   (0=pass 1=fail 2=setup-failed 3=void)');
    process.exit(exit);
  }
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('harness/mp2/coop-identity.js')) main();
