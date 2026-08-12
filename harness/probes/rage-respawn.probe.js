/* A RESTORE IS NOT A HEAL — the half of Rage's lock that would have been a soft-lock.

   Run:
     node _shot/shot.js --scene arena:lava --wait 12000 --out _shot/out/rage-respawn.png \
          --eval @harness/probes/rage-respawn.probe.js

   `rage.probe.js` proves the card's sentence. This proves the thing the card does NOT say, and it is
   the failure mode the fix was one condition away from shipping: every way this game puts health
   back into a body that has run out of it — `arenaRespawn`, `pvpRespawn`, `MP.reviveSelf`, and the
   three death saves — assigns UPWARD from a low number, which by shape alone is a heal. A Berserker
   holding Rage who dies below a quarter would have been restored and clamped straight back to the
   health he died on, which for the Arena's lava is an immediate loop: die, respawn, be put back at 0,
   die again.

   THE ARENA'S LAVA IS THE ONE RESPAWN A PROBE CAN DRIVE END TO END. `arenaHazardTick` (12591) is the
   game's own hazard: stand in one of `G.arenaLava`'s rects below y 15 with no i-frames and it takes
   7% of max HP every 0.3s, and at `hp<=0` it calls `arenaRespawn` itself. Nothing is assigned but the
   position and the starting health — the kill, the respawn and the refill are all the game's.

   THREE HALVES IN ONE LAUNCH, for the same reason as every other probe in this directory: the
   control is `bsk_frenzy` (the b-side of the same rank), the known-bad `mon_iron` (a dead id from
   another class). All three must restore to full. A half that restores to the health it died on is
   the soft-lock, and `okAgainstBroken` is what this probe would say against a fix that tested only
   the quarter and not the zero. */
(function(){
  const G = __BF3.G, p = G.p;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:__BF3.mode });
  if(!G.arenaLava || !G.arenaLava.length) return JSON.stringify({ ok:false, why:'not the lava map' });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'berserker';
  for(const a of (__BF3.ARCHEIDS || [])){
    let w = null; try { w = __BF3.makeWeapon(a, 'common'); } catch(e){}
    if(w && __BF3.classFamilyOk(w)){ p.weapon = w; break; }
  }

  const cs = __BF3.classState('berserker');
  cs.ch = cs.ch || {};
  cs.ch[3] = 'bsk_heavy';
  cs.ch[5] = 'bsk_reckless';   // NOT Thick Hide: the death save would stop the lava ever finishing
  cs.ch[9] = 'bsk_tough';

  let threw = null;
  const L = G.arenaLava[0];
  const tick = (n) => { for(let i = 0; i < n; i++){ try { __BF3.update(1/60); } catch(e){ threw = threw || String(e && e.message || e); return; } } };

  const run = () => {
    G.enemies.length = 0;
    G.arenaPk = []; G._pkT = 999;
    p.dead = false; p.downed = false; p._pvpDead = false;
    p.hp = Math.max(1, Math.round(__BF3.effMaxHp(p) * 0.15));   // below the quarter when it dies
    p.invuln = 0; p._lavaT = 0;
    p.x = L.x; p.z = L.z; p.y = 0; p.vx = 0; p.vy = 0; p.vz = 0;
    tick(4);
    const diedAt = p.hp;

    /* Up to five seconds of the game's own hazard: 7% per 0.3s from 15% is about a second, and the
       margin is for the frames the hero spends being put back. */
    let low = diedAt, restored = -1;
    for(let k = 0; k < 300 && restored < 0; k++){
      p.x = L.x; p.z = L.z; p.y = 0; p.invuln = 0;   // held in the lava; arenaRespawn moves it out
      const before = p.hp;
      tick(1);
      if(p.hp < low) low = p.hp;
      if(p.hp > before && before <= 0) restored = k;   // the respawn frame
    }
    tick(6);                                          // and the clamp has had its say

    return { diedAt: diedAt, low: low, restoredAt: restored, hpAfter: p.hp,
             maxHp: Math.round(__BF3.effMaxHp(p)), full: p.hp >= __BF3.effMaxHp(p) - 1 };
  };

  const half = (pick) => { cs.ch[7] = pick; return { pick: pick, r: run() }; };

  const control = half('bsk_frenzy');
  const inert   = half('mon_iron');
  const rage    = half('bsk_rage');

  const staged = (h) => !!(h && h.r && h.r.restoredAt >= 0 && h.r.low <= 0 && h.r.diedAt > 0);
  const ok = !!(staged(control) && staged(inert) && staged(rage) && !threw
                && control.r.full && inert.r.full && rage.r.full);

  return JSON.stringify({
    ok: ok,
    /* What this probe would say against a lock that tested only the quarter: the locked half comes
       back at the health it died on instead of full. */
    okAgainstBroken: !!(staged(rage) && !rage.r.full && control.r.full),
    control: control, inert: inert, rage: rage, threw: threw,
  });
})()
