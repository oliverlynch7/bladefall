/* WHERE DOES THE LUNGE PUT YOU? A picture, because a passing damage assertion is not one.

   Companion to harness/probes/riposte.probe.js, which proves the numbers. This stages the one frame
   that shows the mechanism: a Bladedancer with a stored Riposte, a foe planted 60 units in front,
   and the cast. Shoot it twice at the same camera —

     node _shot/shot.js --scene arena:flat --wait 12000 --out _shot/out/riposte-shot-fixed.png \
          --eval @harness/probes/riposte-shot.probe.js
     node _shot/shot.js --scene arena:flat --wait 12000 --out _shot/out/riposte-shot-bad.png \
          --url "/3d/index.html?hero3d=1&world3d=1&nobloom&ripostenoclamp=1" \
          --eval @harness/probes/riposte-shot.probe.js

   — and the difference is the whole bug: unclamped the hero ends up BEHIND the foe with its back to
   it, clamped he ends up in front of it at contact range.

   It resolves on a timer rather than returning at once, because shot.js opens the shutter as soon as
   the eval settles and a probe that returns immediately photographs the instant of the cast, before
   the hero's animation, the skill ring or the damage number exist. party.probe.js learned the same
   thing and came back with an empty arena that read exactly like a broken renderer. */
(function(){
  const G = __BF3.G, p = G.p;

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

  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'bladedancer';
  (function(){
    const tries = ['bladedancer'].concat(Object.keys(__BF3.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = __BF3.classStartWeapon(tries[i]); } catch(e){}
      if(w && __BF3.classFamilyOk(w)){ p.weapon = w; return; }
    }
  })();

  const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
  let rip = -1;
  for(let i = 0; i < skills.length; i++) if(skills[i] && skills[i].fx === 'bd_riposte') rip = i;
  if(rip < 0) return JSON.stringify({ ok:false, why:'bd_riposte is not in the rank-10 build' });

  G.enemies.length = 0;
  const foe = __BF3.spawnEnemy('grunt', p.x, p.z - 60);
  if(foe){ foe.active = true; foe.dropT = 0; foe.maxHp = 100000; foe.hp = 100000;
           foe.immobile = true; }      // bolted down, so the frame shows the lunge and not a knockback
  p.hp = p.maxHp || 100; p.mana = p.maxMana || 999;
  p.yaw = Math.PI; G.camYaw = Math.PI;
  if(p.skillCd) p.skillCd[rip] = 0;
  p.bdRiposte = 1;                     // the charged state - the one that whiffed

  const foeAt = foe ? { x: Math.round(foe.x), z: Math.round(foe.z) } : null;
  const hp0 = foe ? foe.hp : null;
  const before = { x: Math.round(p.x), z: Math.round(p.z) };
  __BF3.useSkill(rip);
  const after = { x: Math.round(p.x), z: Math.round(p.z) };
  const dealt = (hp0 != null && foe) ? hp0 - foe.hp : null;
  /* Signed distance along the lunge from the hero to the foe: positive = the foe is still in front
     of you, negative = you are past it. It is the one number that names what the picture shows. */
  const ahead = foe ? Math.round((foe.z - p.z) * Math.cos(p.yaw) + (foe.x - p.x) * Math.sin(p.yaw)) : null;

  return new Promise((resolve) => {
    const t0 = (window.performance && performance.now()) ? performance.now() : 0;
    const step = () => {
      const now = (window.performance && performance.now()) ? performance.now() : t0 + 1e9;
      if(now - t0 >= 700) return resolve(JSON.stringify({
        ok: true, noClamp: /[?&]ripostenoclamp=1/.test(location.search),
        foeAt: foeAt, heroBefore: before, heroAfter: after,
        lungeLen: Math.round(Math.hypot(after.x - before.x, after.z - before.z)),
        foeAheadOfHero: ahead, dealtAtCast: dealt,
      }));
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
})()
