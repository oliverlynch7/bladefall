/* THE MULTIPLAYER PROBE. One expression, evaluated in the page by shot.js --eval.

   It lives in its own file rather than as a template literal inside test-mp.js so that the suite
   and a hand-run are provably the SAME probe:

       node _shot/shot.js --scene 0 --eval @harness/probes/mp.probe.js

   ── WHAT IT IS FOR ──
   Oliver, on joining a PvP match: "I turned invisible on my screen, but I could see him, and the
   same happened for him." `window.__hero3dPending` was a SLOT, not a queue - one assignment per
   frame - and index.html draws the local hero (18329) and THEN MP.drawPeers (18330), so every ally
   overwrote you and the only body the 3D layer had left to draw was theirs. Single-player never
   noticed, because single-player only ever queues one.

   ── WHY IT DOES NOT BUILD THE QUEUE ITSELF ──
   The obvious probe - assign `window.__hero3dPending = [[G.p,0],[peerA,0],[peerB,0]]` and then
   assert it is an array of three with the local hero at the front - is a tautology: it asserts the
   shape of a value the probe just wrote. It passes identically on the broken build, because the
   broken build's fault is in the code that FILLS the queue, which such a probe never runs.

   So this drives the game's own path end to end and counts what actually reached the renderer.
   MP.peers is populated with stand-ins, MP.active is turned on, and then the game's OWN frame loop
   does everything: update() -> MP.tick(), render() -> drawHero3(local) -> MP.drawPeers() ->
   drawPeer() -> drawHero3(peer), and finally flushHero3D() draining the queue into drawHero3D.
   Nothing here calls render or the flush; they are observed, not invoked.

   ── HOW A FRAME'S WORTH OF DRAWS IS SEPARATED FROM THE NEXT FRAME'S ──
   flushHero3D draws the whole queue in one synchronous loop, so a "burst" is one frame. The spy
   opens a burst on the first call and closes it in a queueMicrotask, which cannot run until the
   synchronous loop - indeed the whole rAF callback - has finished. No timing heuristic is
   involved, so a slow SwiftShader frame cannot split one frame's draws across two records.

   ── THE SELF-TEST HOOK ──
   `?mpslot=1` puts the OLD single-slot behaviour back, so the probe can be seen to FAIL:

       node _shot/shot.js --scene 0 --url "/3d/index.html?nobloom&mpslot=1" \
            --eval @harness/probes/mp.probe.js

   It does not patch the game; it installs an accessor for `window.__hero3dPending` whose setter
   makes the array the game creates overwrite instead of accumulate - which is precisely what a
   single slot did. Expect `drawn: 1` in every case and `localFirst: false` as soon as there is one
   ally, i.e. Oliver's bug, reproducible in one command. Nothing reads it in a normal run.

   Returns {cases:[{peers,drawn,localFirst,xs}], threw, slot}. Restores everything it touched. */
(async function(){
  const B = window.__BF3;
  if(!B || !B.G) return JSON.stringify({ skip: 'no game' });
  const G = B.G, MP = B.MP, meta = B.meta;
  if(!MP) return JSON.stringify({ skip: 'MP is not exported on __BF3' });
  if(!(window.HERO3D && window.HERO3D.on && window.HERO3D.ready && window.drawHero3D))
    return JSON.stringify({ skip: '3D hero layer is not live' });

  const SLOT = /[?&]mpslot=1/.test(location.search);
  const save = { active: MP.active, isHost: MP.isHost, myId: MP.myId, zone: MP.zone,
                 peers: MP.peers, cam: meta.camMode, draw: window.drawHero3D };

  /* ---- the spy ---------------------------------------------------------------------------
     It calls THROUGH to the real renderer rather than only counting. A count alone would pass a
     build whose queue is perfect and whose peer bodies throw on the way to the GPU - and a peer
     is not a player object, it is the pseudo-player drawPeer() assembles, so that is a real thing
     to get wrong. A throw is reported; it is not allowed to escape into the game's frame. */
  const real = window.drawHero3D;
  let bursts = [], open = null, threw = null;
  window.drawHero3D = function(p, t){
    if(!open){
      open = []; bursts.push(open);
      const mine = open;
      queueMicrotask(() => { if(open === mine) open = null; });
    }
    open.push(Math.round(p.x));
    try { return real.apply(this, arguments); }
    catch(e){ threw = threw || String((e && e.message) || e); }
  };

  /* ---- the known-bad hook: see the header ---------------------------------------------- */
  if(SLOT){
    let held = null;
    Object.defineProperty(window, '__hero3dPending', {
      configurable: true,
      get(){ return held; },
      set(v){
        if(Array.isArray(v) && !v.__slot){
          v.__slot = true;
          v.push = function(e){ this.length = 0; Array.prototype.push.call(this, e); return 1; };
          v.unshift = v.push;
        }
        held = v;
      },
    });
  }

  const raf = () => new Promise(r => requestAnimationFrame(() => r()));

  /* Wait for real frames. Every burst already in the array is closed by the time any await
     resolves, so the last one is always a complete frame. */
  async function watch(n, ms){
    const t0 = performance.now();
    bursts = []; open = null;
    while(bursts.length < n && performance.now() - t0 < ms) await raf();
    return bursts;
  }

  const PX = Math.round(G.p.x);
  function setPeers(n){
    const ps = {};
    for(let i = 0; i < n; i++){
      const q = MP.mkPeer({ id: 'probe' + i, name: 'Ally' + i, cls: 'warrior', lvl: 1,
                            skin: 'knight', zone: MP.zone, hp: 100, hpm: 100,
                            x: G.p.x + 40 * (i + 1), y: G.p.y, z: G.p.z, yaw: 0 });
      /* MP.tick deletes a peer after 3s without a packet, and nothing here sends packets. */
      q.last = -1e9;
      ps[q.id] = q;
    }
    MP.peers = ps;
  }

  const cases = [];
  try {
    meta.camMode = 'far';           // 'fps' draws first-person arms instead of the hero body
    MP.active = true; MP.isHost = false; MP.myId = 'probe-me';
    MP.zone = (G.zone == null ? 0 : G.zone);

    /* 0 allies is the single-player control, 3 is a co-op party, 8 is past HERO3D_MAX so the cap
       has to drop somebody - and the one thing it may never drop is you. */
    for(const n of [0, 3, 8]){
      setPeers(n);
      const got = await watch(2, 60000);
      const b = got.length ? got[got.length - 1] : null;
      cases.push({ peers: n, frames: got.length,
                   drawn: b ? b.length : 0,
                   localFirst: !!b && b[0] === PX,
                   xs: b ? b.slice() : [] });
    }
  } finally {
    window.drawHero3D = save.draw;
    MP.peers = save.peers; MP.active = save.active; MP.isHost = save.isHost;
    MP.myId = save.myId; MP.zone = save.zone; meta.camMode = save.cam;
    if(SLOT){ delete window.__hero3dPending; window.__hero3dPending = null; }
  }

  return JSON.stringify({ cases: cases, threw: threw, slot: SLOT, localX: PX });
})()
