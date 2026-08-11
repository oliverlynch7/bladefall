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
(function(){
  const B = __BF3, G = B.G;
  const H = window.HERO3D;
  if(!(H && H.on && H.ready && window.drawHero3D))
    return JSON.stringify({ skip: '3D hero layer not live (on:' + !!(H && H.on) +
                                  ' ready:' + !!(H && H.ready) + ')' });
  if(typeof B.drawHero3 !== 'function' || typeof B.flushHero3D !== 'function')
    return JSON.stringify({ skip: 'render path not exported on __BF3' });

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

  window.drawHero3D = real;
  window.__hero3dPending = null;
  return JSON.stringify({ cap: CAP, at: G && G.areaName, slot: SLOT,
                          localFirst: localFirst, localLast: localLast, crowd: crowd });
})()
