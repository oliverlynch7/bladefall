/* DOES HEADLONG EVER STOP?

   Berserker Charge (SKILL_FX.bsk_charge, index.html:18782) is the "HEADLONG" redesign: it sets
   p._headlongT = 0.9 and update() (12345) then drives the body forward at 760 units/second for as
   long as that timer is positive, with vx/vz pinned to zero so nothing can steer it.

   Nothing decremented the timer. The name appears in exactly two places in the whole file - set at
   18783, read at 12345 - so after the first cast the condition was true forever and the Berserker
   flew in a straight line for the rest of the run. docs/SKILL_TRIAGE.md section B recorded it from
   the source; this measures it.

   The verdict is deliberately KINEMATIC, not a read of the flag: the question is whether the body
   is still being driven, and asking the body is the only way that cannot be satisfied by a timer
   that expires while something else keeps pushing. The flag is reported too, because it names the
   mechanism when the answer is no.

   Known-bad: this probe has been watched to fail. Against the unfixed game it reports
   driven3s:true with the hero ~2200 units downrange and headlongT still 0.9. */
(function(){
  const G = __BF3.G, p = G.p;

  /* useSkill's first guard is mode!=='play' and it returns WITHOUT spending a cooldown, so a bench
     that arrives paused reports "cast did nothing" for every skill in the class. Knock on the
     game's own resume door - the same idiom test-skills.js uses. */
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
  __BF3.meta.classId = 'berserker';

  /* Read from the list useSkill CASTS from (c2CurSkills), never from curSkills() - the two lists
     disagree at the same index and that mismatch invalidated every verdict this suite ever made
     before faf52c3. Found by fx id rather than by slot so a rank retune cannot silently repoint it. */
  const skills = (__BF3.c2CurSkills ? __BF3.c2CurSkills() : null) || __BF3.curSkills() || [];
  let idx = -1;
  for(let i = 0; i < skills.length; i++){ if(skills[i] && skills[i].fx === 'bsk_charge'){ idx = i; break; } }
  if(idx < 0) return JSON.stringify({ ok:false, why:'bsk_charge is not in the rank-10 build', casts:skills.map(s=>s&&s.fx) });

  G.enemies.length = 0;                       // traversal only; nothing to be knocked about by
  p.mana = p.maxMana || 999;
  if(p.skillCd) p.skillCd[idx] = 0;
  const at = () => ({ x: Math.round(p.x), z: Math.round(p.z) });
  const start = at();

  __BF3.useSkill(idx);
  const cast = { headlongT: p._headlongT || 0, onCd: !!(p.skillCd && p.skillCd[idx] > 0) };

  const tick = (n) => { for(let k = 0; k < n; k++){ try { __BF3.update(1/60); } catch(e){} } };

  tick(54);                                   // 0.9s - the dash's own advertised length
  const atDash = at(), tDash = p._headlongT || 0;

  tick(126);                                  // 3.0s total, well past any reading of "a dash"
  const at3 = at(), t3 = p._headlongT || 0;

  /* THE KINEMATIC BAR. Six more frames: still driven means ~76 units of travel (760 u/s), and
     ordinary walking is impossible here because the block pins vx/vz to zero while it holds. */
  tick(6);
  const at3b = at();
  const moved = Math.hypot(at3b.x - at3.x, at3b.z - at3.z);

  return JSON.stringify({
    ok: !(moved > 20), driven3s: moved > 20, movedIn6Frames: Math.round(moved),
    headlongT: { atCast: cast.headlongT, at0_9s: Math.round(tDash * 1000) / 1000, at3s: Math.round(t3 * 1000) / 1000 },
    dashLen: Math.round(Math.hypot(atDash.x - start.x, atDash.z - start.z)),
    travelled3s: Math.round(Math.hypot(at3.x - start.x, at3.z - start.z)),
    onCd: cast.onCd, start: start, at3s: at3,
  });
})()
