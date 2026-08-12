/* MASTER STRIKER, IN FRONT OF A CAMERA.

   The measurement lives in harness/probes/monkmaster.probe.js; this exists only so the passive can be
   PHOTOGRAPHED, because AUTOPILOT.md's rule is that reading source is not proof and a probe's numbers
   are not a picture. It sets a monk up with the passive, rings four bodies around the player, lands
   three strikes on one of them and then the fourth - so the shutter catches Whirl Kick's ring, the
   MASTER STRIKER banner and a damage number over every neighbour that was never struck directly.

   Deliberately the LAST thing that runs: skillRing and addText both fade, so anything ticked after
   the fourth strike would photograph the aftermath instead of the hit.

   Use it as:
     node _shot/shot.js --scene arena:flat --wait 12000 --out _shot/out/mm-splash.png \
          --eval @harness/probes/monkmaster-shot.probe.js */
(function(){
  const G = __BF3.G, p = G.p;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
    if(b && __BF3.mode !== 'play'){ try { b.click(); } catch(e){} }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:__BF3.mode });

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'monk';
  (function(){
    const tries = ['monk'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; return; }
    }
  })();
  const cs = __BF3.classState('monk'); cs.ch = cs.ch || {}; cs.ch[9] = 'mon_master';

  /* Four bodies inside Whirl Kick's 165 reach, spread so each gets its own damage number rather than
     stacking them all in one place. Only the first is ever struck. */
  G.enemies.length = 0;
  const at = [[0, -90], [-120, -20], [120, -20], [0, 110]];
  const foes = at.map(o => __BF3.spawnEnemy('grunt', p.x + o[0], p.z + o[1])).filter(Boolean);
  for(const e of foes){ e.active = true; e.hp = e.maxHp = 4000; }
  if(foes.length < 2) return JSON.stringify({ ok:false, why:'targets could not be spawned' });

  const before = foes.map(e => e.hp);
  for(let i = 0; i < 4; i++){ G.combo = 0; G.comboT = 0; __BF3.hitEnemy(foes[0], 100, p, 0, 0, null); }
  const lost = foes.map((e, i) => before[i] - e.hp);

  /* struck is the primary's four strikes plus its share of nothing; splashed is every OTHER body,
     which can only have been reached by the passive. */
  return JSON.stringify({ ok: lost.slice(1).every(v => v > 0), struck: lost[0], splashed: lost.slice(1),
                          bodies: foes.length, hp: p.hp + '/' + __BF3.effMaxHp(p) });
})()
