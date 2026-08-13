/* THE FIX IN ONE FRAME: two markers dropped on the same body, one naming it and one not.

   Companion to harness/probes/pingtgt.probe.js, which measures this in numbers. The numbers are the
   proof; this is the picture, and it exists because "the marker follows the monster" is the kind of
   claim this repo has twice shipped from a plausible reading and once from a photograph of the wrong
   level. After the walk below the tracking marker should be standing ON the body and the untracked
   one — the behaviour that shipped before, obtained without adding a flag to the game — should be
   sitting on the empty ground the body left.

   Both marks go through MP's own recvMark, differing in exactly one field.

   `life` is stretched AFTER the marks are made. It changes how long a marker stays up and nothing
   about whether it follows, and without it the 5s marker has expired by the time the shutter fires. */
(function(){
  const B = __BF3, G = B.G, MP = B.MP;
  if(!MP || !G || !G.p) return JSON.stringify({ ok:false, why:'no game' });

  if(B.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
    if(b && B.mode !== 'play'){ try { b.click(); } catch(e){} }
  }
  if(B.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:B.mode });

  const live = () => (G.enemies || []).filter(e => e && !e.dead && e.mid != null && !e.practice && !e.dummy);
  const d2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

  for(const e of live()){ e.active = true; e.dropT = 0; }

  /* THE SUBJECT HAS TO BE WALKING, and picking the nearest body does not get one: the first render
     drew both markers on a `caster` that had walked 0 units, so they sat exactly on top of each
     other and the frame showed nothing. A warm-up lap is run first and the biggest mover in it is
     taken — measured, not guessed. Candidates are restricted to bodies within aggro reach of the
     hero, because a monster on the far side of the level never takes a step whatever it is sent. */
  const warm = live().filter(e => d2(e, G.p) < 1200).map(e => ({ e:e, x:e.x, z:e.z }));
  for(let k = 0; k < 240; k++){
    try { B.update(1 / 60); } catch(e){}
    G.p.hp = G.p.maxHp || 100; G.p.dead = false; G.p.invuln = 999;
  }
  const ranked = warm.filter(b => !b.e.dead)
                     .sort((a, b) => Math.hypot(b.e.x - b.x, b.e.z - b.z) - Math.hypot(a.e.x - a.x, a.e.z - a.z));
  const subj = ranked.length ? ranked[0].e : null;
  if(!subj) return JSON.stringify({ ok:false, why:'no body near the hero to mark', near:warm.length });
  const warmWalk = Math.round(Math.hypot(subj.x - ranked[0].x, subj.z - ranked[0].z));

  const from = { x:subj.x, z:subj.z };
  G.marks = [];
  const aWas = MP.active, iWas = MP.isHost, mWas = MP.myId;
  MP.active = true; MP.isHost = false; MP.myId = 'me';
  MP.recvMark({ t:'mark', by:'friend', n:'Friend', x:subj.x, z:subj.z, y:subj.y || 0, mid:subj.mid });
  MP.recvMark({ t:'mark', by:'other',  n:'Other',  x:subj.x, z:subj.z, y:subj.y || 0 });
  MP.active = aWas; MP.isHost = iWas; MP.myId = mWas;

  const tracked = (G.marks || [])[0] || null, plain = (G.marks || [])[1] || null;

  /* Two seconds of the game's own update, with the subject and the observer both held alive so the
     frame is about the markers rather than about a death. */
  let ticks = 0, playTicks = 0;
  for(let k = 0; k < 120; k++){
    ticks++; if(B.mode === 'play') playTicks++;
    try { B.update(1 / 60); } catch(e){}
    G.p.hp = G.p.maxHp || 100; G.p.dead = false; G.p.invuln = 999;
    subj.hp = subj.maxHp || 100; subj.dead = false;
  }
  for(const m of (G.marks || [])) m.life = 900;      // hold both up for the shutter — see the header

  /* POINT THE CAMERA AT THE PAIR. `--focus` cannot do this job: it runs BEFORE the eval (shot.js:779)
     and the subject of this frame is whichever body the warm-up lap picked, which does not exist as
     a coordinate until this probe has run. So the same arithmetic focusJs uses (shot.js:511–546) is
     applied here to the midpoint of the two markers — including its hard-won parts: stand the hero at
     the SUBJECT's own y, and re-snap G.cam every frame, because cam is a follow-point that lerps 10%
     a frame and on headless SwiftShader is still hundreds of units behind after a teleport. */
  let framed = null;
  if(tracked && plain){
    const mid = { x:(tracked.x + plain.x) / 2, y:subj.y || 0, z:(tracked.z + plain.z) / 2 };
    const yaw = Math.PI, pit = 0.16, D = 330, side = 70;
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    const back = D - 180 * Math.cos(Math.max(-0.5, Math.min(0.9, pit)));
    const wantX = mid.x - fx * back + (-fz) * side, wantZ = mid.z - fz * back + fx * side;
    const heroY = mid.y;
    const snap = () => { G.p.x = wantX; G.p.z = wantZ; G.p.y = heroY; G.p.vy = 0; G.p.onGround = true;
                         if(G.cam){ G.cam.x = G.p.x; G.cam.z = G.p.z; G.cam.y = G.p.y || 0; }
                         G.camYaw = yaw; G.camPitch = pit; };
    for(let k = 0; k < 40; k++){ snap(); try { B.update(1 / 60); } catch(e){} snap(); }
    framed = { wantX:Math.round(wantX), wantZ:Math.round(wantZ), heroY:Math.round(heroY),
               heroEndedAt:{ x:Math.round(G.p.x), z:Math.round(G.p.z), y:Math.round(G.p.y || 0) },
               /* Same honesty --focus prints: say when the teleport did not stick rather than hand
                  back a photograph of the level entrance captioned as the subject. */
               drift: Math.round(Math.hypot(G.p.x - wantX, G.p.z - wantZ)) };
  }

  return JSON.stringify({
    framed: framed,
    gapBetweenTheTwoMarkers: (tracked && plain) ? Math.round(d2(tracked, plain)) : null,
    ok: true, subject: subj.type, warmUpWalk: warmWalk, bodyWalked: Math.round(d2(subj, from)),
    trackedGap: tracked ? Math.round(d2(tracked, subj)) : null,
    plainGap:   plain   ? Math.round(d2(plain,   subj)) : null,
    subjectAt: { x:Math.round(subj.x), z:Math.round(subj.z), y:Math.round(subj.y || 0) },
    marksUp: (G.marks || []).length, playTicks: playTicks, ticksAsked: ticks, mode: B.mode,
  });
})()
