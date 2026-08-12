/* Does the 3D layer draw EVERY hero in the frame, or only the last one queued?

   Oliver, on joining a PvP match: "I turned invisible on my screen, but I could see him, and the
   same happened for him." Cause: window.__hero3dPending was a single SLOT, so index.html drawing
   the local hero (18328) and then MP.drawPeers (18330) meant every ally overwrote you and the only
   body left to draw was theirs. Symmetrical, so it happened to both players at once.

   THIS DRIVES THE GAME'S OWN FUNCTIONS. __BF3.drawHero3 does the queueing and __BF3.flushHero3D
   does the draw; the probe only counts. That distinction is the whole value of this file: the
   obvious probe assigns window.__hero3dPending itself and then asserts on what it just assigned,
   which passes exactly as happily against the single-slot version whose bug is the reason the
   queue exists. Per index.html's own note, "every probe that reimplements one of these tests
   eventually measures something the game does not believe."

   Counting is separated from RENDERING on purpose. The wrapper records the dispatch and only then
   calls the real drawHero3D, inside its own try - so a renderer that throws is reported as a
   render error and cannot masquerade as a hero the queue failed to hold. Without that, one throw
   aborts flushHero3D's loop and under-counts every hero after it. */
(async function(){
  const B = __BF3, G = B.G;
  const H = window.HERO3D;

  /* ---- WHY THIS FUNCTION IS ASYNC, AND WHAT THE OLD ONE-LINE GUARD COST -------------------------
     It used to be one test — `H.on && H.ready` — and one message, "3D hero layer not live
     (on:false ready:false)". That is THREE different states wearing one name, and the aggregate gate
     printed it for a whole run:

       - `on:false` with no error   the layer is OFF BY FLAG (?hero3d=0). Supported, not a fault, and
                                    nothing to wait for. Skipping is right.
       - `on:false` with an error   the renderer THREW and hero3d.js caught it, set HERO3D.err and
                                    fell back to voxels for everyone (hero3d.js:1781). That is the
                                    single most interesting thing this suite could ever learn, and
                                    the old message threw the text away.
       - `on:true, ready:false`     the glTF is still LOADING. Nothing is wrong; the shutter is
                                    early. `--scene 0` waits on world3d's build, which is a different
                                    async, so under headless SwiftShader contention the world can be
                                    up while the hero rig is not.

     The third is why the suite went dark on the 2026-08-11 gate run, and the sub-project A plan
     records the consequence exactly: "the suite skips exactly when the machine is busy, which is
     most autopilot runs". A dark mp suite is the one that cannot tell Oliver whether he is invisible
     to himself in PvP.

     SO IT WAITS, and only for the state worth waiting for. Not a fixed sleep: it polls, so a warm
     machine pays nothing (measured at 0 ms) and a cold one pays what it needs. It gives up at 30s
     and says how long it waited, because a wait that silently became infinite would trade a dark
     suite for a hung gate.

     A CRASH IS STILL REPORTED AS A SKIP, deliberately, and this is a judgement rather than an
     oversight. `autopilot.ps1` answers a red gate with `git checkout -- .`, so an assertion that can
     fail for environmental reasons can DELETE a run's verified work — the hazard the plan's pass 3
     records. Headless SwiftShader falling over is environmental. It is now loud and it carries the
     error text; making it fail the gate is a separate decision with a real cost behind it. */
  const SLOW = (/[?&]heroslow=(\d+)/.exec(location.search) || [])[1];
  /* THE SELF-TEST HOOK FOR THE WAIT, carried permanently beside ?heroslot and ?breakgap for the
     same reason: an assertion nobody has watched engage is an assertion nobody should believe. It
     puts the layer back into the exact state that made the suite dark — on, not ready — and the bar
     is that the suite still comes back with its measurements instead of a skip. `wouldHaveSkipped`
     below is what this probe would have returned without the wait, from the same launch. */
  if(SLOW && H){ H.ready = false; setTimeout(function(){ H.ready = true; }, +SLOW); }

  const entry = { on: !!(H && H.on), ready: !!(H && H.ready), err: (H && H.err) || null };
  let waitedMs = 0;
  if(H && H.on && !H.ready && !H.err){
    const t0 = Date.now();
    while(!H.ready && !H.err && H.on && (Date.now() - t0) < 30000)
      await new Promise(function(r){ setTimeout(r, 200); });
    waitedMs = Date.now() - t0;
  }

  const why = !H                          ? 'hero3d.js never loaded at all'
            : H.err                       ? '3D hero layer CRASHED and fell back to voxels: ' + H.err
            : !H.on                       ? '3D hero layer off by flag (?hero3d=0)'
            : !H.ready                    ? '3D hero layer still loading after ' + waitedMs + 'ms'
            : !window.drawHero3D          ? 'drawHero3D is not on window'
            : null;
  if(why) return JSON.stringify({ skip: why, entry: entry, waitedMs: waitedMs });
  if(typeof B.drawHero3 !== 'function' || typeof B.flushHero3D !== 'function')
    return JSON.stringify({ skip: 'render path not exported on __BF3', entry: entry, waitedMs: waitedMs });

  const CAP = B.HERO3D_MAX;
  const real = window.drawHero3D;
  const drawn = [], renderErrs = [];
  window.drawHero3D = function(p, t){
    drawn.push(p);                                   // the dispatch, recorded before anything can throw
    try { return real.apply(this, arguments); }
    catch(e){ renderErrs.push(String(e && e.message || e)); }
  };

  /* An ally as MP.drawPeers builds one: a plain object that is NOT G.p, so identity is what tells
     the local hero apart - which is exactly the test drawHero3 itself applies (`p === G.p`). */
  const peer = (x) => Object.assign({}, G.p, { x: x });

  /* ---- THE SELF-TEST HOOK ---------------------------------------------------------------------
     `?heroslot=1` queues through the historical single SLOT instead of the game's queue, exactly as
     the pre-fix line did (`window.__hero3dPending = [p,t]`, one assignment, each hero overwriting
     the last). It is here, permanently, for the same reason level.probe.js carries `?breakgap`: an
     assertion nobody has seen FAIL is an assertion nobody should believe, and these three would
     have passed against the plan's version of this probe - which assigned the queue itself and then
     asserted on what it had just assigned.
        node _shot/shot.js --scene 0 --url "/3d/index.html?hero3d=1&world3d=1&nobloom&heroslot=1" \
             --eval @harness/probes/mp.probe.js
     Reproduces Oliver's report directly: one hero drawn instead of three, and `localAt:-1` in the
     game's own draw order - you, invisible to yourself. Nothing reads it in a normal run. */
  const SLOT = /[?&]heroslot=1/.test(location.search);
  const send = SLOT ? function(p, t){ window.__hero3dPending = [[p, t]]; }
                    : function(p, t){ B.drawHero3(p, t, false); };

  function trial(queue){
    window.__hero3dPending = null;
    drawn.length = 0; renderErrs.length = 0;
    let threw = null, flushThrew = null;
    try { queue(); } catch(e){ threw = String(e && e.message || e); }
    const queued = Array.isArray(window.__hero3dPending) ? window.__hero3dPending.length
                 : (window.__hero3dPending == null ? 0 : -1);
    try { B.flushHero3D(); } catch(e){ flushThrew = String(e && e.message || e); }
    return { queued: queued, drawn: drawn.length, localAt: drawn.indexOf(G.p),
             cleared: window.__hero3dPending == null,
             threw: threw, flushThrew: flushThrew, renderErrs: renderErrs.slice(0, 3) };
  }

  /* 1. The game's real order: index.html draws you, then MP.drawPeers draws the allies. */
  const localFirst = trial(function(){
    send(G.p, 0);
    send(peer(G.p.x + 150), 0);
    send(peer(G.p.x - 150), 0);
  });

  /* 2. Local hero queued LAST. Under the single-slot bug this was the only survivor; under a naive
        push-only queue it draws in the wrong order. drawHero3 unshifts you to the FRONT. */
  const localLast = trial(function(){
    send(peer(G.p.x + 150), 0);
    send(peer(G.p.x - 150), 0);
    send(G.p, 0);
  });

  /* 3. A crowd past the cap. Allies are dropped to protect the frame rate; you never are, because
        "whatever else gets dropped it must never again be you". */
  const crowd = trial(function(){
    for(let i = 0; i < CAP + 6; i++) send(peer(G.p.x + 60 * (i + 1)), 0);
    send(G.p, 0);
  });

  /* 4. DO ALLIES LOOK LIKE THEMSELVES? Three trials above prove every body in the party is DRAWN.
        They say nothing about whose body it is, and for most of this file's life the answer was
        "yours" - one rig, so an ally wore your class's model, your weapon and, because the clip
        state was module-level too, your pose.

        Driven the same way as the rest: real objects through the game's own drawHero3, then the
        game's own flush, then the rig pool is ASKED what it built. Two allies of deliberately
        different classes holding deliberately different weapons; a pool that is not working answers
        the same for both, and answers with the local hero's model.

        Two flushes, because arming is asynchronous - equipWeapon loads a glTF - so the first pass
        creates the rigs and the second is what a steady-state frame looks like. `armed` is read as
        "does this rig have a weapon mesh parented to it", never as "did the load resolve in time":
        a slow load must not read as a broken pool. */
  const rigsOf = () => (typeof window.__hero3dRigs === 'function') ? window.__hero3dRigs() : null;
  const ally = (id, cid, art, x) => Object.assign({}, G.p,
    { peerId: id, cid: cid, x: x, weapon: Object.assign({}, G.p.weapon || {}, { art: art, rarity: 'common' }) });
  const allyA = ally('probe-a', 'mage',   'staff', G.p.x + 150);
  const allyB = ally('probe-b', 'ranger', 'bow',   G.p.x - 150);
  const rigTrial = trial(function(){ send(G.p, 0); send(allyA, 0); send(allyB, 0); });
  const rigTrial2 = trial(function(){ send(G.p, 0); send(allyA, 0); send(allyB, 0); });
  const rigs = rigsOf();

  window.drawHero3D = real;
  window.__hero3dPending = null;
  return JSON.stringify({ cap: CAP, at: G && G.areaName, slot: SLOT,
                          /* What this probe would have said WITHOUT the wait, measured in the same
                             launch rather than argued: the layer's state the first time it looked. */
                          waitedMs: waitedMs, wouldHaveSkipped: !entry.ready,
                          oneRig: /[?&]heroonerig=1/.test(location.search),
                          localFirst: localFirst, localLast: localLast, crowd: crowd,
                          rigTrial: rigTrial, rigTrial2: rigTrial2, rigs: rigs });
})()
