/* THE PICTURE for Rage — the frame `rage.probe.js` measures, in its two halves.

   Run BOTH, because a heal that does not happen is only evidence beside one that does:

     node _shot/shot.js --scene arena:flat --wait 12000 --out _shot/out/rage-locked.png \
          --eval @harness/probes/rage-shot.probe.js
     node _shot/shot.js --scene arena:flat --wait 12000 --out _shot/out/rage-healed.png \
          --url "/3d/index.html?hero3d=1&world3d=1&nobloom&ragecontrol" \
          --eval @harness/probes/rage-shot.probe.js

   Same berserker, same 10%-health hero, same healing spring underfoot, one frame after the game's
   own spring step ran. `?ragecontrol` swaps rank 7 to Frenzy — the b-side of the very rank — and
   that is the only difference between the two frames.

   WHAT TO LOOK AT: the green +134 floater over the hero and the health bar, and whether the spring
   is still standing. The control frame heals and spends the spring; the Rage frame does neither, so
   the spring is still drawn and the bar has not moved. The measurements are the other probe's job;
   this only has to be looked at. */
(function(){
  const G = __BF3.G, p = G.p;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play' });

  const control = /[?&]ragecontrol\b/.test(location.search);

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'berserker';
  try { const w = __BF3.classStartWeapon('berserker'); if(w) p.weapon = w; } catch(e){}

  const cs = __BF3.classState('berserker');
  cs.ch = cs.ch || {};
  cs.ch[3] = 'bsk_heavy'; cs.ch[5] = 'bsk_thick'; cs.ch[9] = 'bsk_tough';
  cs.ch[7] = control ? 'bsk_frenzy' : 'bsk_rage';

  G.enemies.length = 0; G.springs.length = 0;
  /* NO p.invuln here, unlike the measuring probe: i-frames blink the hero and the first attempt at
     this picture came back with an empty arena floor and no body in it. And hudUpdate() by hand,
     because the bar is only repainted when something the game did moved it — the locked half
     deliberately does nothing, so without this it photographs a STALE 477/477 and reads as the
     opposite of the finding. */
  p.dead = false; p.downed = false;
  p.vx = 0; p.vy = 0; p.vz = 0; p.onGround = true;
  p.hp = Math.max(1, Math.round(__BF3.effMaxHp(p) * 0.10));
  try { __BF3.hudUpdate(); } catch(e){}

  const before = p.hp;
  G.springs.push({ x:p.x, z:p.z, y:p.y || 0, used:false });
  for(let k = 0; k < 3; k++) __BF3.update(1/60);   // three frames: the spring step has run, the floater is still up

  return JSON.stringify({
    half: control ? 'control (Frenzy)' : 'Rage',
    hpBefore: Math.round(before), hpAfter: Math.round(p.hp),
    gained: Math.round(p.hp - before),
    springSpent: !!(G.springs[0] && G.springs[0].used),
    maxHp: Math.round(__BF3.effMaxHp(p)),
  });
})()
