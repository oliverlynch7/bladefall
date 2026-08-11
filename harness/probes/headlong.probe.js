/* DOES THE BERSERKER'S HEADLONG EVER STOP?

   docs/SKILL_TRIAGE.md section B: SKILL_FX.bsk_charge sets p._headlongT = 0.9 and update() reads it
   to drive the body forward at 760 units/second, refusing steering - "a charge that cannot be
   stopped OR STEERED", which is the design. Nothing decrements it. So the condition is true forever
   after the first cast and the Berserker leaves the fight permanently.

   The skill suite cannot see this. It reports berserker/Charge failing a DAMAGE claim, which is a
   separate and genuinely open question (the handler's own comment says Headlong deliberately
   replaced the Warrior's contact-damage charge, so whether the description or the damage is the
   stale half is Oliver's call). The timer is not a design call in either direction: a 0.9s dash that
   lasts the rest of the run is nobody's intent.

   So this probe asks the one question in numbers: after the dash's own stated window, is the timer
   still running and is the body still moving? Run it with

     node _shot/shot.js --scene arena:flat --wait 12000 --eval @harness/probes/headlong.probe.js

   The bar, stated before the measurement so it cannot be fitted to the result:
     - timerAfter5s must be 0            (the timer expires)
     - movedLastSecond must be ~0        (the body has stopped)
     - dashDistance must be > 0          (it still dashes at all - a fix that kills the skill fails)  */
(function(){
  __BF3.cheatUnlockClasses(); __BF3.cheatRank10All();
  __BF3.meta.classId = 'berserker';
  const G = __BF3.G, p = G.p;

  /* Same door the skill bench knocks on: roughly one launch in six arrives paused, and useSkill's
     first guard returns without spending a cooldown, so a paused probe reports "no dash" for a
     skill that was never cast. */
  if(__BF3.mode !== 'play'){
    for(const t of [window, document]){
      try { t.dispatchEvent(new KeyboardEvent('keydown', { code:'Escape', key:'Escape', bubbles:true })); } catch(e){}
    }
    if(__BF3.mode !== 'play'){
      const b = document.querySelector('#resBtn, #restop, .pausecard #resBtn');
      if(b){ try { b.click(); } catch(e){} }
    }
  }
  const mode0 = __BF3.mode;

  /* On-class, through the game's own starter, exactly as test-skills.js does. The berserker has no
     in-family starter in the game at all (SKILL_TRIAGE section D), so anyClass is forced - the same
     compromise the bench records in weapon.note. bsk_charge ignores the `ok` argument, so this only
     matters for comparability with the suite. */
  let weaponNote = 'none';
  try {
    const w = __BF3.classStartWeapon('berserker');
    if(w){ if(!__BF3.classFamilyOk(w)) w.anyClass = true; p.weapon = w; weaponNote = w.name || 'starter'; }
  } catch(e){}

  const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
  let idx = -1;
  for(let i = 0; i < skills.length; i++) if(skills[i] && skills[i].fx === 'bsk_charge') idx = i;
  if(idx < 0) return JSON.stringify({ ok:false, why:'berserker kit has no bsk_charge skill',
                                      kit: skills.map(s => s && s.fx) });

  G.enemies.length = 0;
  p.hp = p.maxHp || 100; p.mana = p.maxMana || 999;
  if(p.skillCd) p.skillCd[idx] = 0;
  p.yaw = Math.PI; G.camYaw = Math.PI;

  const at = () => ({ x: p.x, z: p.z });
  const start = at();
  const timerBefore = p._headlongT || 0;
  __BF3.useSkill(idx);
  const timerOnCast = p._headlongT || 0;

  /* Sampled every second for five, which is five times the dash's own 0.9s window. A dash that has
     ended shows the same position at 2s, 3s, 4s and 5s. */
  const track = [];
  let prev = at();
  for(let s = 1; s <= 5; s++){
    for(let k = 0; k < 60; k++){ try { __BF3.update(1/60); } catch(e){} }
    const now = at();
    track.push({ s: s, timer: +((p._headlongT || 0).toFixed(3)),
                 moved: Math.round(Math.hypot(now.x - prev.x, now.z - prev.z)) });
    prev = now;
  }
  const end = at();

  return JSON.stringify({
    ok: true, mode: mode0, weapon: weaponNote, skill: skills[idx].n, idx: idx,
    timerBefore: timerBefore, timerOnCast: timerOnCast,
    timerAfter5s: +((p._headlongT || 0).toFixed(3)),
    dashDistance: Math.round(Math.hypot(end.x - start.x, end.z - start.z)),
    movedLastSecond: track[track.length - 1].moved,
    perSecond: track,
    verdict: ((p._headlongT || 0) === 0 && track[track.length - 1].moved === 0
              && Math.hypot(end.x - start.x, end.z - start.z) > 0) ? 'STOPS' : 'RUNAWAY',
  });
})()
