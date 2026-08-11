/* A PICTURE OF THE RIPOSTE FIX, because a passing assertion about a melee arc is not a picture.

   riposte.probe.js proves the numbers - 9 of 24 trials missed before, 0 after, facing dot -1.0
   against +1.0. This stages the single frame those numbers describe: a Bladedancer with a stored
   parry (`p.bdRiposte`, the CHARGED path, the only one that was broken) casting Riposte at a foe
   standing 60 units away, which is melee range and the range the skill exists for.

   Run it twice at the same camera, and the pair is the bug and the fix:

     node _shot/shot.js --scene arena:flat --wait 12000 --out _shot/out/riposte-hit.png \
          --eval @harness/probes/riposte-shot.probe.js
     node _shot/shot.js --scene arena:flat --wait 12000 --out _shot/out/riposte-whiff.png \
          --url "/3d/index.html?hero3d=1&world3d=1&nobloom&ripostepast=1" \
          --eval @harness/probes/riposte-shot.probe.js

   The foe's speed is zeroed so it stands exactly where it was put in both frames. Without that the
   two pictures are taken against two different geometries and neither says anything about the other.

   IT RESOLVES LATE AND NEVER CANCELS ITS rAF, for the reason written on party.probe.js: shot.js
   opens the shutter as soon as the eval settles, so a probe that returns immediately photographs the
   instant the level loaded - the arena's welcome toast and no 3D hero at all, which reads exactly
   like the renderer being broken. */
(function(){
  const B = __BF3, G = B.G, p = G.p;

  if(B.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    if(B.mode !== 'play'){
      const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
      if(b){ try { b.click(); } catch(e){} }
    }
  }
  if(B.mode !== 'play') return JSON.stringify({ ok:false, why:'never reached play', mode:B.mode });

  B.cheatUnlockClasses(); B.cheatRank10All();
  B.meta.classId = 'bladedancer';
  (function(){
    const tries = ['bladedancer'].concat(Object.keys(B.CLASSES || {}));
    for(let i = 0; i < tries.length; i++){
      let w = null; try { w = B.classStartWeapon(tries[i]); } catch(e){}
      if(w && B.classFamilyOk(w)){ p.weapon = w; return; }
    }
  })();

  const skills = (B.c2CurSkills ? B.c2CurSkills() : null) || B.curSkills() || [];
  let idx = -1;
  for(let i = 0; i < skills.length; i++){ if(skills[i] && skills[i].fx === 'bd_riposte'){ idx = i; break; } }
  if(idx < 0) return JSON.stringify({ ok:false, why:'bd_riposte is not in the rank-10 build' });

  G.enemies.length = 0;
  p.yaw = Math.PI; G.camYaw = Math.PI;
  const foe = B.spawnEnemy('grunt', p.x, p.z - 60);
  if(!foe) return JSON.stringify({ ok:false, why:'spawnEnemy returned nothing' });
  foe.active = true; foe.dropT = 0; foe.speed = 0;      // stands still, so both frames share a geometry
  foe.maxHp = 100000; foe.hp = 100000;
  const at = { px: p.x, pz: p.z, fx: foe.x, fz: foe.z };
  const hp0 = foe.hp;

  let n = 0, cast = null;
  return new Promise(function(resolve){
    (function pump(){
      n++;
      requestAnimationFrame(pump);
      if(n === 120){
        p.hp = Math.round((p.maxHp || 100) * 0.6);
        p.mana = p.maxMana || 999;
        p.yaw = Math.PI; G.camYaw = Math.PI;
        if(p.skillCd) p.skillCd[idx] = 0;
        p.bdRiposte = 1;                                 // the CHARGED path - the one that overshot
        try { B.useSkill(idx); } catch(e){}
        cast = { px: Math.round(p.x), pz: Math.round(p.z),
                 lunge: Math.round(Math.hypot(p.x - at.px, p.z - at.pz)),
                 sep: Math.round(Math.hypot(foe.x - p.x, foe.z - p.z)),
                 hitAtCast: foe.hp < hp0 };
      }
      /* Twelve frames after the cast: the damage number, the RIPOSTE! banner and the gold ring are
         all still on screen, and the body has not walked out of its own swing. */
      if(n === 132) resolve(JSON.stringify({
        ok: !!(cast && cast.hitAtCast), frames: n, cast: cast,
        dealt: Math.round(hp0 - foe.hp),
        foeAt: { x: Math.round(foe.x), z: Math.round(foe.z) },
      }));
    })();
  });
})()
