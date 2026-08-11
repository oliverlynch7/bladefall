/* CAN A PARTY POINT AT SOMETHING?

   docs/superpowers/plans/2026-08-11-multiplayer-experience.md Task 5. There was no chat and no ping;
   communication is the top co-op frustration in the games this was researched against, and a browser
   game with no voice needs an answer that does not involve typing.

   This drives the game's own `dropPing()` and MP's own `recvMark()` — the two ends of the feature —
   and reads `G.marks`, the list the renderer draws from. It does not build a marker itself: the
   first MP test in this repo assigned the value it then asserted on and passed against the very bug
   it existed to catch, so a probe that pushed its own mark and checked the mark was there would be
   the same mistake in a new place.

   Both halves are asked, because they fail separately and the local half is the one that lies: you
   ping, you see your own marker, everything looks right, and your friend sees nothing.

   Known-bad: `?noping=1` drops the receive handler, which is exactly that failure. */
(function(){
  const G = __BF3.G, MP = __BF3.MP;
  if(!MP) return JSON.stringify({ ok:false, why:'MP is not exported on __BF3' });
  if(!__BF3.dropPing) return JSON.stringify({ ok:false, why:'dropPing is not exported on __BF3' });

  /* useSkill's guard applies here too: dropPing returns early unless mode is 'play', so a bench that
     arrives paused reports a feature that does nothing. Knock on the game's own resume door. */
  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    if(__BF3.mode !== 'play'){
      const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
      if(b){ try { b.click(); } catch(e){} }
    }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:__BF3.mode });

  const SAVED = { active:MP.active, isHost:MP.isHost, myId:MP.myId, teams:MP.teams,
                  teamMap:MP.teamMap, pvp:MP.pvp };
  const marks = () => (G.marks || []);
  const clear = () => { G.marks = []; };
  const tick = (n) => { for(let k = 0; k < n; k++){ try { __BF3.update(1/60); } catch(e){} } };
  const brief = (m) => m ? { x:Math.round(m.x), z:Math.round(m.z), y:Math.round(m.y||0),
                             col:m.col, name:m.name, life:m.life, t:+(m.t||0).toFixed(2) } : null;

  let out;
  try {
    MP.active = false; MP.isHost = false; MP.teams = false; MP.pvp = false; MP.myId = 'me';

    /* ── 1. THE LOCAL HALF: pressing it puts a marker in the world, ahead of you ─────────────── */
    clear();
    const p0 = { x: G.p.x, z: G.p.z };
    const made = __BF3.dropPing();
    const local = marks()[0] || null;
    const dist = local ? Math.round(Math.hypot(local.x - p0.x, local.z - p0.z)) : null;

    /* ── 2. IT CANNOT BE SPAMMED, and the cooldown is a real clock ──────────────────────────── */
    tick(6);                                              // 0.1s — inside the 0.6s cooldown
    const blocked = __BF3.dropPing();
    const afterBlocked = marks().length;
    tick(60);                                             // 1.0s — past it
    const allowed = __BF3.dropPing();
    const afterAllowed = marks().length;

    /* ── 3. THE REMOTE HALF: an ally's message draws a marker on MY screen ───────────────────
       Through MP.recvMark, the real receive path, with the message shaped exactly as sendMark
       builds it. This is the half ?noping=1 removes. */
    clear();
    MP.active = true; MP.isHost = false; MP.myId = 'me';
    MP.recvMark({ t:'mark', by:'friend', n:'Friend', x: G.p.x + 250, z: G.p.z - 250, y: 0 });
    const fromPeer = marks()[0] || null;

    /* ── 4. AND IT IS NOT DRAWN TWICE. The host relays a guest's message to the other guests, and
       nothing stops it coming back to the sender; a marker drawn twice is a brighter one that
       expires at a different time. */
    const beforeEcho = marks().length;
    MP.recvMark({ t:'mark', by:'me', n:'Me', x: G.p.x + 10, z: G.p.z - 10, y: 0 });
    const afterEcho = marks().length;

    /* ── 5. TEAM COLOUR. In a team duel, which side called it is the content of the message. ── */
    clear();
    MP.teams = true; MP.teamMap = { me:0, red:1, blue:0 };
    MP.recvMark({ t:'mark', by:'red',  n:'Red',  x:G.p.x + 100, z:G.p.z, y:0 });
    MP.recvMark({ t:'mark', by:'blue', n:'Blue', x:G.p.x - 100, z:G.p.z, y:0 });
    const teamCols = marks().map(m => m.col);
    MP.teams = false; MP.teamMap = {};

    /* ── 6. IT EXPIRES, and through the GAME LOOP rather than by calling the ager directly —
       which is the half that proves updateMarks is actually wired into update(). */
    clear();
    MP.recvMark({ t:'mark', by:'friend', n:'Friend', x: G.p.x + 120, z: G.p.z, y: 0 });
    const beforeExpiry = marks().length;
    tick(180);                                            // 3s — inside the 5s life
    const midExpiry = marks().length;
    tick(180);                                            // 6s total — past it
    const afterExpiry = marks().length;

    /* ── 7. THE BUTTON EXISTS AND IS CO-OP ONLY ─────────────────────────────────────────────── */
    const btn = document.getElementById('bPing');
    MP.active = false; try { __BF3.syncPingBtn(); } catch(e){}
    const hiddenSolo = btn ? btn.classList.contains('hide') : null;
    MP.active = true; try { __BF3.syncPingBtn(); } catch(e){}
    const shownInParty = btn ? !btn.classList.contains('hide') : null;

    out = {
      local: { made: !!made, mark: brief(local), distFromHero: dist, count: marks().length },
      cooldown: { blockedReturnedNull: blocked === null, afterBlocked: afterBlocked,
                  allowedReturned: !!allowed, afterAllowed: afterAllowed },
      fromPeer: brief(fromPeer),
      echo: { before: beforeEcho, after: afterEcho },
      teamCols: teamCols,
      expiry: { before: beforeExpiry, at3s: midExpiry, at6s: afterExpiry },
      button: { exists: !!btn, hiddenSolo: hiddenSolo, shownInParty: shownInParty },
      noping: /[?&]noping=1/.test(location.search),
    };
  } finally {
    MP.active = SAVED.active; MP.isHost = SAVED.isHost; MP.myId = SAVED.myId;
    MP.teams = SAVED.teams; MP.teamMap = SAVED.teamMap; MP.pvp = SAVED.pvp;
    G.marks = [];
  }
  return JSON.stringify(out);
})()
