/* HASTE, PHOTOGRAPHED — the measuring probe's twin, staged to be LOOKED at.

   `harness/probes/chrhaste.probe.js` returns numbers and runs two halves back to back, so the frame
   it hands the camera is whatever the second half happened to leave up. This one runs ONE half,
   stops on the frame after the Rewind, and points the camera at the thing the card is about: the
   SKILL BAR. Four buttons cooling with a countdown on each, or four buttons ready — that is the
   whole of "Rewinding resets every skill cooldown" in one frame, and unlike a retarget or a movement
   multiplier it genuinely does exist in a still picture.

   A separate file rather than a flag on the other one, for the reason slippery-shot.probe.js gives:
   a probe that sometimes returns and sometimes poses is a probe whose numbers depend on which mode
   it was in.

   WHICH HALF IS PHOTOGRAPHED COMES OFF THE URL (`?hpick=potent`), because the picture is an A/B and
   the two frames must differ in exactly one thing — which passive is chosen at rank 3. Nothing in
   the game reads that parameter; the probe does. The control is `chr_potent`, the a-side of the SAME
   rank: wired, delivered by the same three lines of the same death save, and nothing to do with
   cooldowns.

   THE BUTTON STATE IS RETURNED AS WELL AS RENDERED. A photograph of a HUD proves the pixels; the
   `cooling` class and the `.sk-cd` countdown text are what those pixels are drawn from, so reading
   them back means "off-frame" and "not drawn" cannot be the same picture — the lesson
   nincombo-shot.probe.js paid for with its hero and foe coordinates.

   The six ticks at the end are for `skillCoolPaint` (13023), which is in the update loop and is the
   only thing that takes the wheel off a button whose cooldown has reached zero. Without them the
   reset is in `p.skillCd` and not yet on the screen. */
(function(){
  const G = __BF3.G, p = G.p, IN = __BF3.input;

  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
    if(b && __BF3.mode !== 'play'){ try { b.click(); } catch(e){} }
  }
  if(__BF3.mode !== 'play') return JSON.stringify({ ok:false, why:'bench never reached play', mode:__BF3.mode });

  const pick = /hpick=potent/.test(location.search) ? 'chr_potent' : 'chr_haste';

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'chronomancer';
  __BF3.meta.camMode = 'far';

  (function(){
    const tries = ['chronomancer'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; return; }
    }
  })();

  const cs = __BF3.classState('chronomancer');
  cs.ch = cs.ch || {};
  cs.ch[3] = pick;

  let threw = null;
  const tick = (n) => {
    for(let i = 0; i < n; i++){
      G.enemies.length = 0;
      IN.jx = 0; IN.jz = 0;
      try { __BF3.update(1/60); } catch(e){ threw = threw || String(e && e.message || e); return; }
    }
  };

  G.enemies.length = 0;
  G._rewUsed = 0;
  p._rew = []; p._rewT = 0;
  p.dead = false; p.downed = false; p.invuln = 0; p.dodgeTimer = 0;
  p.maxMana = p.maxMana || 100;
  p.hp = __BF3.effMaxHp(p);
  for(let i = 0; i < 4; i++){ p.skillCd[i] = 0; p.skillCdMax[i] = 0; }

  tick(260);                                       // the game records its own 3.5s of Rewind history

  for(let i = 0; i < 4; i++){ p.mana = p.maxMana; try { __BF3.useSkill(i); } catch(e){} }
  const cdBefore = [0,1,2,3].map(i => Math.round((p.skillCd[i] || 0) * 100) / 100);

  p.hp = 1; p.invuln = 0; p.dodgeTimer = 0;
  const usedBefore = G._rewUsed || 0;
  try { __BF3.hurtPlayer(99999, p.x, p.z - 40, null); } catch(e){ threw = threw || String(e && e.message || e); }
  const rewound = (G._rewUsed || 0) > usedBefore;

  tick(6);                                         // let skillCoolPaint take the wheels off
  try { G.cam.x = p.x; G.cam.z = p.z; G.cam.y = p.y || 0; } catch(e){}
  try { __BF3.hudUpdate(); __BF3.skillbarUpdate(); } catch(e){}

  const bar = [0,1,2,3].map(i => {
    const b = document.getElementById('bSk' + i);
    if(!b) return null;
    const n = b.querySelector('.sk-cd');
    return { cooling: b.classList.contains('cooling'), locked: b.classList.contains('lock'),
             cd: n ? n.textContent : null };
  });

  return JSON.stringify({
    ok: rewound && !threw && bar.every(b => b && (pick === 'chr_haste' ? !b.cooling : b.cooling)),
    pick, rewound, threw,
    cdBefore,
    cdAfter: [0,1,2,3].map(i => Math.round((p.skillCd[i] || 0) * 100) / 100),
    bar,
    hero: { x: Math.round(p.x), z: Math.round(p.z), hp: Math.round(p.hp) },
  });
})()
